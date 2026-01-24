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
        resultados = self.base_datos.obtener_todos(consulta)
        # Convertir fechas a formato ISO
        from datetime import datetime
        for resultado in resultados or []:
            if resultado.get('ultima_fecha'):
                try:
                    fecha = resultado['ultima_fecha']
                    # Si es un objeto datetime, convertirlo a ISO
                    if isinstance(fecha, datetime):
                        resultado['ultima_fecha'] = fecha.isoformat()
                    elif isinstance(fecha, str):
                        # Si ya es string, intentar parsearlo y convertirlo
                        try:
                            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d %H:%M:%S')
                            resultado['ultima_fecha'] = fecha_obj.isoformat()
                        except:
                            # Si ya está en formato ISO, dejarlo así
                            pass
                except Exception:
                    pass
        return resultados

    def obtener_mensajes(self, conversacion_id, limit=200):
        consulta = """
        SELECT * FROM whatsapp_mensajes
        WHERE conversacion_id = %s
        ORDER BY fecha_creacion ASC
        LIMIT %s
        """
        resultados = self.base_datos.obtener_todos(consulta, (conversacion_id, limit))
        # Convertir fechas a formato ISO
        from datetime import datetime
        for resultado in resultados or []:
            if resultado.get('fecha_creacion'):
                try:
                    fecha = resultado['fecha_creacion']
                    # Si es un objeto datetime, convertirlo a ISO
                    if isinstance(fecha, datetime):
                        resultado['fecha_creacion'] = fecha.isoformat()
                    elif isinstance(fecha, str):
                        # Si ya es string, intentar parsearlo y convertirlo
                        try:
                            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d %H:%M:%S')
                            resultado['fecha_creacion'] = fecha_obj.isoformat()
                        except:
                            # Si ya está en formato ISO, dejarlo así
                            pass
                except Exception:
                    pass
        return resultados

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
        self._asegurar_columnas_reintento()
        
        # Determinar si el mensaje debe marcarse como pendiente de reintento
        pendiente_reintento = 0
        if estado == 'fallido' and direccion == 'out':
            # Marcar como pendiente solo si no es un error no reintentable
            if not self._es_error_no_reintentable(raw_json):
                pendiente_reintento = 1
        
        consulta = """
        INSERT INTO whatsapp_mensajes
        (conversacion_id, direccion, mensaje, media_type, media_id, media_url, wa_message_id, origen, estado, raw_json, costo_unitario, costo_total, pendiente_reintento)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                costo_total,
                pendiente_reintento
            )
        )
    
    def _asegurar_columnas_reintento(self):
        """Asegura que las columnas de reintento existan"""
        try:
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'whatsapp_mensajes'
              AND COLUMN_NAME = 'intentos_reintento'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN intentos_reintento INT DEFAULT 0"
                )
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN fecha_ultimo_reintento TIMESTAMP NULL"
                )
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN pendiente_reintento TINYINT(1) DEFAULT 0"
                )
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN max_intentos_reintento INT DEFAULT 3"
                )
        except Exception:
            pass
    
    def _es_error_no_reintentable(self, raw_json):
        """Determina si un error no debe reintentarse"""
        if not raw_json:
            return False
        
        try:
            import json
            if isinstance(raw_json, str):
                error_data = json.loads(raw_json)
            else:
                error_data = raw_json
            
            # Error de ventana 24h (131047) - no reintentar
            if isinstance(error_data, dict):
                errors = error_data.get("errors", [])
                if isinstance(errors, list):
                    for error in errors:
                        if str(error.get("code")) == "131047":
                            return True
                # También verificar en el mensaje directamente
                if "131047" in str(error_data):
                    return True
            
            # Verificar en string
            if "131047" in str(raw_json):
                return True
        except Exception:
            pass
        
        return False

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
    
    def marcar_pendiente_reintento_por_wa_id(self, wa_message_id):
        """Marca un mensaje como pendiente de reintento basado en su wa_message_id"""
        self._asegurar_columnas_reintento()
        # Solo marcar si no es un error no reintentable
        consulta = """
        UPDATE whatsapp_mensajes
        SET pendiente_reintento = 1
        WHERE wa_message_id = %s
          AND estado = 'fallido'
          AND direccion = 'out'
          AND (
            raw_json NOT LIKE '%131047%'
            OR raw_json IS NULL
          )
        """
        return self.base_datos.ejecutar_consulta(consulta, (wa_message_id,))

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
