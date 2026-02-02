"""
Modelo para métricas y control de envíos WhatsApp/Email
"""
from modelos.base_datos import BaseDatos


class WhatsAppMetricasModelo:
    def __init__(self):
        self.base_datos = BaseDatos()

    def obtener_config(self):
        self._asegurar_columnas_limites()
        self._asegurar_columnas_precios_tipo()
        consulta = "SELECT * FROM whatsapp_metricas_config ORDER BY id ASC LIMIT 1"
        config = self.base_datos.obtener_uno(consulta) or {}
        return {
            "precio_whatsapp": config.get("precio_whatsapp") or 0,
            "precio_whatsapp_marketing": config.get("precio_whatsapp_marketing") or config.get("precio_whatsapp") or 0,
            "precio_whatsapp_utility": config.get("precio_whatsapp_utility") or config.get("precio_whatsapp") or 0,
            "precio_whatsapp_service": config.get("precio_whatsapp_service") or 0,
            "precio_email": config.get("precio_email") or 0,
            "maximo_whatsapp": config.get("maximo_whatsapp"),
            "maximo_email": config.get("maximo_email"),
            "whatsapp_desactivado": config.get("whatsapp_desactivado") or 0,
            "id": config.get("id"),
        }

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

    def _asegurar_columnas_limites(self):
        try:
            # Verificar y agregar maximo_whatsapp
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'whatsapp_metricas_config'
              AND COLUMN_NAME = 'maximo_whatsapp'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_metricas_config ADD COLUMN maximo_whatsapp INT DEFAULT NULL"
                )
            
            # Verificar y agregar maximo_email
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'whatsapp_metricas_config'
              AND COLUMN_NAME = 'maximo_email'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_metricas_config ADD COLUMN maximo_email INT DEFAULT NULL"
                )
        except Exception:
            pass

    def _asegurar_columnas_precios_tipo(self):
        """Agrega columnas para precios por tipo de mensaje (marketing, utility, service)"""
        try:
            columnas = [
                ("precio_whatsapp_marketing", "DECIMAL(10,4) DEFAULT NULL"),
                ("precio_whatsapp_utility", "DECIMAL(10,4) DEFAULT NULL"),
                ("precio_whatsapp_service", "DECIMAL(10,4) DEFAULT 0"),
            ]
            for columna, tipo in columnas:
                if not self._columna_existe("whatsapp_metricas_config", columna):
                    self.base_datos.ejecutar_consulta(
                        f"ALTER TABLE whatsapp_metricas_config ADD COLUMN {columna} {tipo}"
                    )
        except Exception:
            pass

    def actualizar_config(self, precio_whatsapp, precio_email, whatsapp_desactivado=0, maximo_whatsapp=None, maximo_email=None,
                          precio_whatsapp_marketing=None, precio_whatsapp_utility=None, precio_whatsapp_service=None):
        self._asegurar_columna_whatsapp_desactivado()
        self._asegurar_columnas_limites()
        self._asegurar_columnas_precios_tipo()
        existente = self.obtener_config()
        if existente and existente.get("id"):
            consulta = """
            UPDATE whatsapp_metricas_config
            SET precio_whatsapp = %s, precio_email = %s, whatsapp_desactivado = %s, 
                maximo_whatsapp = %s, maximo_email = %s,
                precio_whatsapp_marketing = %s, precio_whatsapp_utility = %s, precio_whatsapp_service = %s
            WHERE id = %s
            """
            return self.base_datos.ejecutar_consulta(
                consulta, (
                    precio_whatsapp, 
                    precio_email, 
                    int(bool(whatsapp_desactivado)), 
                    maximo_whatsapp if maximo_whatsapp is not None else None,
                    maximo_email if maximo_email is not None else None,
                    precio_whatsapp_marketing,
                    precio_whatsapp_utility,
                    precio_whatsapp_service,
                    existente.get("id")
                )
            )
        consulta = """
        INSERT INTO whatsapp_metricas_config (precio_whatsapp, precio_email, whatsapp_desactivado, maximo_whatsapp, maximo_email,
            precio_whatsapp_marketing, precio_whatsapp_utility, precio_whatsapp_service)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(
            consulta, (
                precio_whatsapp, 
                precio_email, 
                int(bool(whatsapp_desactivado)),
                maximo_whatsapp if maximo_whatsapp is not None else None,
                maximo_email if maximo_email is not None else None,
                precio_whatsapp_marketing,
                precio_whatsapp_utility,
                precio_whatsapp_service,
            )
        )

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

    def obtener_metricas_globales(self, fecha_desde=None, fecha_hasta=None):
        # Contar TODOS los mensajes de WhatsApp desde whatsapp_mensajes (incluyendo sistema)
        # NO contar desde historial_notificaciones para evitar duplicación
        tiene_costo_chat = self._columna_existe("whatsapp_mensajes", "costo_total")
        tiene_costo_email = self._columna_existe("historial_notificaciones", "costo_email")
        
        # Filtro de fechas para WhatsApp
        filtro_wa = ""
        if fecha_desde and fecha_hasta:
            filtro_wa = f"WHERE fecha_creacion BETWEEN '{fecha_desde}' AND '{fecha_hasta} 23:59:59'"
        elif fecha_desde:
            filtro_wa = f"WHERE fecha_creacion >= '{fecha_desde}'"
        elif fecha_hasta:
            filtro_wa = f"WHERE fecha_creacion <= '{fecha_hasta} 23:59:59'"
        
        consulta = """
        SELECT
          SUM(CASE WHEN direccion='out' THEN 1 ELSE 0 END) as whatsapp_out,
          SUM(CASE WHEN direccion='in' THEN 1 ELSE 0 END) as whatsapp_in,
          SUM(CASE WHEN direccion='out' AND origen='bot' THEN 1 ELSE 0 END) as whatsapp_bot,
          SUM(CASE WHEN direccion='out' AND origen='humano' THEN 1 ELSE 0 END) as whatsapp_humano,
          SUM(CASE WHEN direccion='out' AND origen='sistema' THEN 1 ELSE 0 END) as whatsapp_sistema,
          SUM(CASE WHEN direccion='out' AND origen='campana' THEN 1 ELSE 0 END) as whatsapp_campana
          {costo_whatsapp}
        FROM whatsapp_mensajes
        {filtro_wa}
        """.format(
            costo_whatsapp=", SUM(COALESCE(costo_total, 0)) as costo_whatsapp_total" if tiene_costo_chat else "",
            filtro_wa=filtro_wa
        )
        whatsapp = self.base_datos.obtener_uno(consulta) or {}
        
        # Filtro de fechas para Email
        filtro_email = "WHERE enviado = TRUE"
        if fecha_desde and fecha_hasta:
            filtro_email = f"WHERE enviado = TRUE AND fecha_envio BETWEEN '{fecha_desde}' AND '{fecha_hasta} 23:59:59'"
        elif fecha_desde:
            filtro_email = f"WHERE enviado = TRUE AND fecha_envio >= '{fecha_desde}'"
        elif fecha_hasta:
            filtro_email = f"WHERE enviado = TRUE AND fecha_envio <= '{fecha_hasta} 23:59:59'"
        
        consulta_email = """
        SELECT
          SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out
          {costo_email}
        FROM historial_notificaciones
        {filtro_email}
        """.format(
            costo_email=", SUM(COALESCE(costo_email, 0)) as costo_email_total" if tiene_costo_email else "",
            filtro_email=filtro_email
        )
        email = self.base_datos.obtener_uno(consulta_email) or {}
        
        whatsapp_out = int(whatsapp.get("whatsapp_out") or 0)
        whatsapp_sistema = int(whatsapp.get("whatsapp_sistema") or 0)
        whatsapp_campana = int(whatsapp.get("whatsapp_campana") or 0)
        whatsapp_bot = int(whatsapp.get("whatsapp_bot") or 0)
        whatsapp_humano = int(whatsapp.get("whatsapp_humano") or 0)
        whatsapp_notificaciones = whatsapp_sistema  # Solo notificaciones del sistema (utility)
        whatsapp_service = whatsapp_bot + whatsapp_humano  # Chat (service - gratis en ventana 24h)
        
        # Obtener configuración de precios
        config = self.obtener_config()
        precio_marketing = float(config.get("precio_whatsapp_marketing") or config.get("precio_whatsapp") or 0)
        precio_utility = float(config.get("precio_whatsapp_utility") or config.get("precio_whatsapp") or 0)
        precio_service = float(config.get("precio_whatsapp_service") or 0)
        
        # Calcular costos por tipo
        costo_marketing = whatsapp_campana * precio_marketing
        costo_utility = whatsapp_notificaciones * precio_utility
        costo_service = whatsapp_service * precio_service
        
        # Obtener costos reales almacenados (si existen)
        costo_whatsapp_almacenado = float(whatsapp.get("costo_whatsapp_total") or 0) if tiene_costo_chat else 0.0
        costo_email_total = float(email.get("costo_email_total") or 0) if tiene_costo_email else 0.0
        
        # Usar costo calculado si no hay almacenado
        costo_whatsapp_total = costo_whatsapp_almacenado if costo_whatsapp_almacenado > 0 else (costo_marketing + costo_utility + costo_service)
        
        return {
            "whatsapp_out": whatsapp_out,  # Total salientes (todos desde whatsapp_mensajes)
            "whatsapp_in": int(whatsapp.get("whatsapp_in") or 0),  # Mensajes entrantes del cliente
            "whatsapp_chat_out": whatsapp_service,  # Chat (bot + humano) - SERVICE
            "whatsapp_notificaciones": whatsapp_notificaciones,  # Notificaciones sistema - UTILITY
            "whatsapp_campana": whatsapp_campana,  # Campañas - MARKETING
            "whatsapp_bot": whatsapp_bot,
            "whatsapp_humano": whatsapp_humano,
            "whatsapp_sistema": whatsapp_notificaciones,  # Mantener compatibilidad
            "email_out": int(email.get("email_out") or 0),
            # Costos desglosados
            "costo_marketing": round(costo_marketing, 4),
            "costo_utility": round(costo_utility, 4),
            "costo_service": round(costo_service, 4),
            "costo_whatsapp_total": round(costo_whatsapp_total, 4),
            "costo_email_total": round(costo_email_total, 4),
            # Precios configurados
            "precio_marketing": precio_marketing,
            "precio_utility": precio_utility,
            "precio_service": precio_service,
        }

    def obtener_metricas_clientes(self, fecha_desde=None, fecha_hasta=None):
        tiene_costo_chat = self._columna_existe("whatsapp_mensajes", "costo_total")
        
        # Filtro de fechas para la subconsulta
        filtro_fecha = ""
        if fecha_desde and fecha_hasta:
            filtro_fecha = f"WHERE wm.fecha_creacion BETWEEN '{fecha_desde}' AND '{fecha_hasta} 23:59:59'"
        elif fecha_desde:
            filtro_fecha = f"WHERE wm.fecha_creacion >= '{fecha_desde}'"
        elif fecha_hasta:
            filtro_fecha = f"WHERE wm.fecha_creacion <= '{fecha_hasta} 23:59:59'"
        
        consulta = """
        SELECT 
            c.id as cliente_id,
            u.nombre_completo as nombre_cliente,
            u.email,
            u.telefono,
            COALESCE(wc.bloquear_whatsapp, 0) as bloquear_whatsapp,
            COALESCE(wc.bloquear_email, 0) as bloquear_email,
            wc.precio_whatsapp,
            wc.precio_email,
            COALESCE(SUM(m.whatsapp_out), 0) as whatsapp_out,
            COALESCE(SUM(m.whatsapp_in), 0) as whatsapp_in,
            COALESCE(SUM(m.whatsapp_bot), 0) as whatsapp_bot,
            COALESCE(SUM(m.whatsapp_humano), 0) as whatsapp_humano,
            COALESCE(SUM(m.whatsapp_sistema), 0) as whatsapp_sistema
            {costo_chat}
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN whatsapp_control_clientes wc ON wc.cliente_id = c.id
        LEFT JOIN (
            SELECT 
                wconv.cliente_id,
                wconv.telefono as conv_telefono,
                SUM(CASE WHEN wm.direccion='out' THEN 1 ELSE 0 END) as whatsapp_out,
                SUM(CASE WHEN wm.direccion='in' THEN 1 ELSE 0 END) as whatsapp_in,
                SUM(CASE WHEN wm.direccion='out' AND wm.origen='bot' THEN 1 ELSE 0 END) as whatsapp_bot,
                SUM(CASE WHEN wm.direccion='out' AND wm.origen='humano' THEN 1 ELSE 0 END) as whatsapp_humano,
                SUM(CASE WHEN wm.direccion='out' AND (wm.origen='sistema' OR wm.origen='campana') THEN 1 ELSE 0 END) as whatsapp_sistema
                {costo_subconsulta}
            FROM whatsapp_conversaciones wconv
            JOIN whatsapp_mensajes wm ON wm.conversacion_id = wconv.id
            {filtro_fecha}
            GROUP BY wconv.id
        ) m ON m.cliente_id = c.id 
            OR REPLACE(REPLACE(REPLACE(u.telefono, '+', ''), ' ', ''), '-', '') = m.conv_telefono
        GROUP BY c.id, u.nombre_completo, u.email, u.telefono, wc.bloquear_whatsapp, wc.bloquear_email, wc.precio_whatsapp, wc.precio_email
        HAVING SUM(m.whatsapp_out) > 0 OR SUM(m.whatsapp_in) > 0
        ORDER BY u.nombre_completo
        """.format(
            costo_chat=", COALESCE(SUM(m.costo_whatsapp_total), 0) as costo_whatsapp_total" if tiene_costo_chat else "",
            costo_subconsulta=", SUM(COALESCE(wm.costo_total, 0)) as costo_whatsapp_total" if tiene_costo_chat else "",
            filtro_fecha=filtro_fecha
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

    def obtener_mensajes_por_cliente(self, cliente_id, fecha_desde=None, fecha_hasta=None, limit=500):
        """Lista de mensajes WhatsApp enviados/recibidos para un cliente en el rango de fechas."""
        telefono_cliente = None
        row = self.base_datos.obtener_uno(
            "SELECT u.telefono FROM clientes c JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = %s",
            (cliente_id,),
        )
        if row and row.get("telefono"):
            telefono_cliente = str(row["telefono"]).replace("+", "").replace(" ", "").replace("-", "")
        filtro_fecha = ""
        params = [cliente_id]
        if fecha_desde and fecha_hasta:
            filtro_fecha = " AND wm.fecha_creacion BETWEEN %s AND %s"
            params.extend([fecha_desde, f"{fecha_hasta} 23:59:59"])
        elif fecha_desde:
            filtro_fecha = " AND wm.fecha_creacion >= %s"
            params.append(fecha_desde)
        elif fecha_hasta:
            filtro_fecha = " AND wm.fecha_creacion <= %s"
            params.append(f"{fecha_hasta} 23:59:59")
        cond_telefono = ""
        if telefono_cliente:
            cond_telefono = " OR REPLACE(REPLACE(REPLACE(wc.telefono, '+', ''), ' ', ''), '-', '') = %s"
            params.append(telefono_cliente)
        params.append(limit)
        consulta = """
        SELECT wm.id, wm.conversacion_id, wm.fecha_creacion, wm.direccion, wm.origen,
               LEFT(wm.mensaje, 500) as mensaje, wm.estado,
               wm.costo_unitario, wm.costo_total, wm.media_type
        FROM whatsapp_mensajes wm
        JOIN whatsapp_conversaciones wc ON wm.conversacion_id = wc.id
        WHERE (wc.cliente_id = %s """ + cond_telefono + """)
        """ + filtro_fecha + """
        ORDER BY wm.fecha_creacion DESC
        LIMIT %s
        """
        return self.base_datos.obtener_todos(consulta, tuple(params))
