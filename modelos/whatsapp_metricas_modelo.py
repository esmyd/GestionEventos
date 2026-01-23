"""
Modelo para métricas y control de envíos WhatsApp/Email
"""
from modelos.base_datos import BaseDatos


class WhatsAppMetricasModelo:
    def __init__(self):
        self.base_datos = BaseDatos()

    def obtener_config(self):
        consulta = "SELECT * FROM whatsapp_metricas_config ORDER BY id ASC LIMIT 1"
        return self.base_datos.obtener_uno(consulta) or {"precio_whatsapp": 0, "precio_email": 0}

    def _columna_existe(self, tabla, columna):
        consulta = """
        SELECT COUNT(*) as total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = %s
          AND COLUMN_NAME = %s
        """
        row = self.base_datos.obtener_uno(consulta, (tabla, columna)) or {}
        return int(row.get("total") or 0) > 0

    def _asegurar_columna_whatsapp_desactivado(self):
        try:
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'whatsapp_metricas_config'
              AND COLUMN_NAME = 'whatsapp_desactivado'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_metricas_config ADD COLUMN whatsapp_desactivado TINYINT(1) DEFAULT 0"
                )
        except Exception:
            pass

    def actualizar_config(self, precio_whatsapp, precio_email, whatsapp_desactivado=0):
        self._asegurar_columna_whatsapp_desactivado()
        existente = self.obtener_config()
        if existente and existente.get("id"):
            consulta = """
            UPDATE whatsapp_metricas_config
            SET precio_whatsapp = %s, precio_email = %s, whatsapp_desactivado = %s
            WHERE id = %s
            """
            return self.base_datos.ejecutar_consulta(
                consulta, (precio_whatsapp, precio_email, int(bool(whatsapp_desactivado)), existente.get("id"))
            )
        consulta = """
        INSERT INTO whatsapp_metricas_config (precio_whatsapp, precio_email, whatsapp_desactivado)
        VALUES (%s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(consulta, (precio_whatsapp, precio_email, int(bool(whatsapp_desactivado))))

    def obtener_control_cliente(self, cliente_id):
        consulta = """
        SELECT * FROM whatsapp_control_clientes WHERE cliente_id = %s
        """
        return self.base_datos.obtener_uno(consulta, (cliente_id,))

    def upsert_control_cliente(self, cliente_id, data):
        consulta = """
        INSERT INTO whatsapp_control_clientes
        (cliente_id, bloquear_whatsapp, bloquear_email, precio_whatsapp, precio_email)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          bloquear_whatsapp = VALUES(bloquear_whatsapp),
          bloquear_email = VALUES(bloquear_email),
          precio_whatsapp = VALUES(precio_whatsapp),
          precio_email = VALUES(precio_email)
        """
        return self.base_datos.ejecutar_consulta(
            consulta,
            (
                cliente_id,
                int(bool(data.get("bloquear_whatsapp"))),
                int(bool(data.get("bloquear_email"))),
                data.get("precio_whatsapp"),
                data.get("precio_email"),
            ),
        )

    def obtener_control_por_telefono(self, telefono):
        consulta = """
        SELECT wc.*
        FROM whatsapp_control_clientes wc
        JOIN clientes c ON wc.cliente_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE REPLACE(REPLACE(REPLACE(u.telefono, '+', ''), ' ', ''), '-', '') = %s
        LIMIT 1
        """
        return self.base_datos.obtener_uno(consulta, (telefono,))

    def permitir_envio_whatsapp(self, telefono):
        if not telefono:
            return True
        config = self.obtener_config()
        if config and config.get("whatsapp_desactivado"):
            return False
        control = self.obtener_control_por_telefono(str(telefono).replace("+", "").replace(" ", "").replace("-", ""))
        if not control:
            return True
        return not bool(control.get("bloquear_whatsapp"))

    def permitir_envio_whatsapp_cliente(self, cliente_id):
        if not cliente_id:
            return True
        config = self.obtener_config()
        if config and config.get("whatsapp_desactivado"):
            return False
        control = self.obtener_control_cliente(cliente_id)
        if not control:
            return True
        return not bool(control.get("bloquear_whatsapp"))

    def permitir_envio_email(self, cliente_id):
        if not cliente_id:
            return True
        control = self.obtener_control_cliente(cliente_id)
        if not control:
            return True
        return not bool(control.get("bloquear_email"))

    def obtener_metricas_globales(self):
        consulta = """
        SELECT
          SUM(CASE WHEN direccion='out' THEN 1 ELSE 0 END) as whatsapp_out,
          SUM(CASE WHEN direccion='in' THEN 1 ELSE 0 END) as whatsapp_in,
          SUM(CASE WHEN direccion='out' AND origen='bot' THEN 1 ELSE 0 END) as whatsapp_bot,
          SUM(CASE WHEN direccion='out' AND origen='humano' THEN 1 ELSE 0 END) as whatsapp_humano,
          SUM(CASE WHEN direccion='out' AND origen IS NULL THEN 1 ELSE 0 END) as whatsapp_out_sin_origen
        FROM whatsapp_mensajes
        """
        whatsapp = self.base_datos.obtener_uno(consulta) or {}
        consulta_email = """
        SELECT
          SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
          SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_sistema
        FROM historial_notificaciones
        WHERE enviado = TRUE
        """
        email = self.base_datos.obtener_uno(consulta_email) or {}
        return {
            "whatsapp_out": int(whatsapp.get("whatsapp_out") or 0),
            "whatsapp_in": int(whatsapp.get("whatsapp_in") or 0),
            "whatsapp_bot": int(whatsapp.get("whatsapp_bot") or 0),
            "whatsapp_humano": int(whatsapp.get("whatsapp_humano") or 0),
            "whatsapp_sistema": int(email.get("whatsapp_sistema") or 0),
            "email_out": int(email.get("email_out") or 0),
        }

    def obtener_metricas_clientes(self):
        tiene_costo_chat = self._columna_existe("whatsapp_mensajes", "costo_total")
        consulta = """
        SELECT c.id as cliente_id,
               u.nombre_completo as nombre_cliente,
               u.email,
               u.telefono,
               COALESCE(wc.bloquear_whatsapp, 0) as bloquear_whatsapp,
               COALESCE(wc.bloquear_email, 0) as bloquear_email,
               wc.precio_whatsapp,
               wc.precio_email,
               SUM(CASE WHEN wm.direccion='out' THEN 1 ELSE 0 END) as whatsapp_out,
               SUM(CASE WHEN wm.direccion='in' THEN 1 ELSE 0 END) as whatsapp_in,
               SUM(CASE WHEN wm.direccion='out' AND wm.origen='bot' THEN 1 ELSE 0 END) as whatsapp_bot,
               SUM(CASE WHEN wm.direccion='out' AND wm.origen='humano' THEN 1 ELSE 0 END) as whatsapp_humano
               {costo_chat}
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN whatsapp_control_clientes wc ON wc.cliente_id = c.id
        LEFT JOIN whatsapp_mensajes wm
          ON REPLACE(REPLACE(REPLACE(u.telefono, '+', ''), ' ', ''), '-', '') =
             (SELECT telefono FROM whatsapp_conversaciones WHERE id = wm.conversacion_id LIMIT 1)
        GROUP BY c.id
        HAVING whatsapp_out > 0 OR whatsapp_in > 0
        ORDER BY u.nombre_completo
        """.format(
            costo_chat=", SUM(COALESCE(wm.costo_total, 0)) as costo_whatsapp_total" if tiene_costo_chat else ""
        )
        return self.base_datos.obtener_todos(consulta)

    def obtener_email_por_cliente(self):
        tiene_costo_email = self._columna_existe("historial_notificaciones", "costo_email")
        tiene_costo_whatsapp = self._columna_existe("historial_notificaciones", "costo_whatsapp")
        consulta = """
        SELECT c.id as cliente_id,
               SUM(CASE WHEN hn.canal='email' THEN 1 WHEN hn.canal='ambos' THEN 1 ELSE 0 END) as email_out,
               SUM(CASE WHEN hn.canal='whatsapp' THEN 1 WHEN hn.canal='ambos' THEN 1 ELSE 0 END) as whatsapp_sistema
               {costo_email}
               {costo_whatsapp}
        FROM clientes c
        JOIN eventos e ON e.id_cliente = c.id
        LEFT JOIN historial_notificaciones hn ON hn.id_evento = e.id_evento AND hn.enviado = TRUE
        GROUP BY c.id
        HAVING email_out > 0 OR whatsapp_sistema > 0
        """.format(
            costo_email=", SUM(COALESCE(hn.costo_email, 0)) as costo_email_total" if tiene_costo_email else "",
            costo_whatsapp=", SUM(COALESCE(hn.costo_whatsapp, 0)) as costo_whatsapp_total" if tiene_costo_whatsapp else "",
        )
        return self.base_datos.obtener_todos(consulta)
