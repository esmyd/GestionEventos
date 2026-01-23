"""
Modelo para chat WhatsApp (conversaciones, mensajes y estado del bot)
"""
import json
from modelos.base_datos import BaseDatos


class WhatsAppChatModelo:
    def __init__(self):
        self.base_datos = BaseDatos()

    def normalizar_telefono(self, telefono):
        if not telefono:
            return None
        return str(telefono).replace("+", "").replace(" ", "").replace("-", "")

    def obtener_conversacion_por_telefono(self, telefono):
        telefono = self.normalizar_telefono(telefono)
        consulta = """
        SELECT * FROM whatsapp_conversaciones
        WHERE telefono = %s
        """
        return self.base_datos.obtener_uno(consulta, (telefono,))

    def crear_conversacion(self, telefono, cliente_id=None, bot_activo=True):
        telefono = self.normalizar_telefono(telefono)
        consulta = """
        INSERT INTO whatsapp_conversaciones (telefono, cliente_id, bot_activo, ultima_interaccion, last_cliente_interaccion, requiere_reengagement)
        VALUES (%s, %s, %s, NOW(), NULL, 0)
        """
        if self.base_datos.ejecutar_consulta(consulta, (telefono, cliente_id, bot_activo)):
            return self.base_datos.obtener_ultimo_id()
        return None

    def actualizar_conversacion(self, conversacion_id, cliente_id=None, bot_activo=None):
        campos = []
        parametros = []
        if cliente_id is not None:
            campos.append("cliente_id = %s")
            parametros.append(cliente_id)
        if bot_activo is not None:
            campos.append("bot_activo = %s")
            parametros.append(bot_activo)
        campos.append("ultima_interaccion = NOW()")
        consulta = f"""
        UPDATE whatsapp_conversaciones
        SET {", ".join(campos)}
        WHERE id = %s
        """
        parametros.append(conversacion_id)
        return self.base_datos.ejecutar_consulta(consulta, tuple(parametros))

    def actualizar_interaccion_cliente(self, conversacion_id):
        consulta = """
        UPDATE whatsapp_conversaciones
        SET last_cliente_interaccion = NOW(), requiere_reengagement = 0
        WHERE id = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (conversacion_id,))

    def marcar_reengagement(self, conversacion_id, detalle=None):
        consulta = """
        UPDATE whatsapp_conversaciones
        SET requiere_reengagement = 1,
            ultimo_error_reengagement = %s,
            fecha_ultimo_error = NOW()
        WHERE id = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (detalle, conversacion_id))

    def listar_conversaciones(self):
        consulta = """
        SELECT c.*,
               u.nombre_completo as nombre_cliente,
               u.email as email_cliente,
               u.telefono as telefono_cliente,
               (SELECT mensaje FROM whatsapp_mensajes m
                WHERE m.conversacion_id = c.id
                ORDER BY m.fecha_creacion DESC
                LIMIT 1) as ultimo_mensaje,
               (SELECT fecha_creacion FROM whatsapp_mensajes m
                WHERE m.conversacion_id = c.id
                ORDER BY m.fecha_creacion DESC
                LIMIT 1) as ultima_fecha,
               (SELECT direccion FROM whatsapp_mensajes m
                WHERE m.conversacion_id = c.id
                ORDER BY m.fecha_creacion DESC
                LIMIT 1) as ultima_direccion
        FROM whatsapp_conversaciones c
        LEFT JOIN clientes cl ON c.cliente_id = cl.id
        LEFT JOIN usuarios u ON cl.usuario_id = u.id
        ORDER BY c.ultima_interaccion DESC
        """
        return self.base_datos.obtener_todos(consulta)

    def obtener_mensajes(self, conversacion_id, limit=200):
        consulta = """
        SELECT * FROM whatsapp_mensajes
        WHERE conversacion_id = %s
        ORDER BY fecha_creacion ASC
        LIMIT %s
        """
        return self.base_datos.obtener_todos(consulta, (conversacion_id, limit))

    def registrar_mensaje(
        self,
        conversacion_id,
        direccion,
        mensaje,
        raw_json=None,
        estado=None,
        media_type=None,
        media_id=None,
        media_url=None,
        wa_message_id=None,
        origen=None,
        costo_unitario=None,
        costo_total=None
    ):
        self._asegurar_columnas_costos()
        consulta = """
        INSERT INTO whatsapp_mensajes
        (conversacion_id, direccion, mensaje, media_type, media_id, media_url, wa_message_id, origen, estado, raw_json, costo_unitario, costo_total)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        raw_text = json.dumps(raw_json, ensure_ascii=False, default=str) if isinstance(raw_json, dict) else raw_json
        return self.base_datos.ejecutar_consulta(
            consulta,
            (
                conversacion_id,
                direccion,
                mensaje,
                media_type,
                media_id,
                media_url,
                wa_message_id,
                origen,
                estado,
                raw_text,
                costo_unitario,
                costo_total
            )
        )

    def _asegurar_columnas_costos(self):
        try:
            consulta = """
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'whatsapp_mensajes'
              AND COLUMN_NAME IN ('costo_unitario', 'costo_total')
            """
            existentes = self.base_datos.obtener_todos(consulta) or []
            columnas = {row.get("COLUMN_NAME") for row in existentes}
            if "costo_unitario" not in columnas:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN costo_unitario DECIMAL(10,4) NULL"
                )
            if "costo_total" not in columnas:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN costo_total DECIMAL(10,4) NULL"
                )
        except Exception:
            pass

    def actualizar_estado_por_wa_id(self, wa_message_id, estado):
        consulta = """
        UPDATE whatsapp_mensajes
        SET estado = %s
        WHERE wa_message_id = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (estado, wa_message_id))

    def actualizar_estado_por_wa_id_con_detalle(self, wa_message_id, estado, raw_json=None):
        consulta = """
        UPDATE whatsapp_mensajes
        SET estado = %s, raw_json = %s
        WHERE wa_message_id = %s
        """
        raw_text = json.dumps(raw_json, ensure_ascii=False, default=str) if isinstance(raw_json, dict) else raw_json
        return self.base_datos.ejecutar_consulta(consulta, (estado, raw_text, wa_message_id))

    def obtener_conversacion_id_por_wa_id(self, wa_message_id):
        consulta = """
        SELECT conversacion_id
        FROM whatsapp_mensajes
        WHERE wa_message_id = %s
        ORDER BY id DESC
        LIMIT 1
        """
        row = self.base_datos.obtener_uno(consulta, (wa_message_id,))
        return row.get("conversacion_id") if row else None

    def puede_enviar_whatsapp(self, telefono, ventana_horas=24):
        telefono = self.normalizar_telefono(telefono)
        consulta = """
        SELECT requiere_reengagement,
               last_cliente_interaccion,
               TIMESTAMPDIFF(MINUTE, last_cliente_interaccion, NOW()) as minutos_desde_cliente
        FROM whatsapp_conversaciones
        WHERE telefono = %s
        """
        estado = self.base_datos.obtener_uno(consulta, (telefono,))
        if not estado:
            return False, "SIN_INTERACCION"
        if estado.get("requiere_reengagement"):
            return False, "REENGAGEMENT"
        minutos = estado.get("minutos_desde_cliente")
        if minutos is None:
            return False, "SIN_INTERACCION"
        if minutos > ventana_horas * 60:
            return False, "FUERA_VENTANA"
        return True, "OK"

    def obtener_estado_bot(self, conversacion_id):
        consulta = """
        SELECT * FROM whatsapp_bot_estado WHERE conversacion_id = %s
        """
        estado = self.base_datos.obtener_uno(consulta, (conversacion_id,))
        if estado and estado.get("datos_json"):
            try:
                estado["datos"] = json.loads(estado.get("datos_json"))
            except Exception:
                estado["datos"] = {}
        return estado

    def guardar_estado_bot(self, conversacion_id, estado, datos=None):
        consulta = """
        INSERT INTO whatsapp_bot_estado (conversacion_id, estado, datos_json)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE estado = VALUES(estado), datos_json = VALUES(datos_json)
        """
        datos_json = json.dumps(datos or {}, ensure_ascii=False, default=str)
        return self.base_datos.ejecutar_consulta(consulta, (conversacion_id, estado, datos_json))

    def limpiar_estado_bot(self, conversacion_id):
        consulta = "DELETE FROM whatsapp_bot_estado WHERE conversacion_id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (conversacion_id,))
