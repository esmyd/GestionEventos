"""
Modelo para gestión de notificaciones
"""
from modelos.base_datos import BaseDatos
from datetime import datetime, timedelta


class NotificacionModelo:
    """Clase para operaciones CRUD de notificaciones"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def obtener_configuracion(self, tipo_notificacion):
        """Obtiene la configuración de una notificación por tipo"""
        if tipo_notificacion == "recordatorio_evento":
            self._asegurar_recordatorio_evento()
        if tipo_notificacion == "evento_creado":
            self._asegurar_evento_creado_whatsapp()
        consulta = """
        SELECT * FROM configuracion_notificaciones 
        WHERE tipo_notificacion = %s AND activo = TRUE
        """
        return self.base_datos.obtener_uno(consulta, (tipo_notificacion,))
    
    def obtener_todas_configuraciones(self):
        """Obtiene todas las configuraciones de notificaciones"""
        self._asegurar_recordatorio_evento()
        self._asegurar_evento_creado_whatsapp()
        consulta = """
        SELECT * FROM configuracion_notificaciones 
        ORDER BY dias_antes DESC, nombre
        """
        return self.base_datos.obtener_todos(consulta)

    def _asegurar_recordatorio_evento(self):
        consulta = """
        SELECT 1
        FROM configuracion_notificaciones
        WHERE tipo_notificacion = 'recordatorio_evento'
        LIMIT 1
        """
        existe = self.base_datos.obtener_uno(consulta)
        if existe:
            return
        plantilla_email = (
            "<p>Hola {nombre_cliente},</p>"
            "<p>Este es un recordatorio de tu evento \"{nombre_evento}\" programado para {fecha_evento} a las {hora_inicio}.</p>"
            "<p>Quedan {dias_restantes} dias. Si necesitas coordinacion adicional, estamos atentos.</p>"
            "<p>Gracias por confiar en Lirios Eventos.</p>"
        )
        plantilla_whatsapp = (
            "Lirios Eventos: recordatorio del evento \"{nombre_evento}\" el {fecha_evento} "
            "a las {hora_inicio}. Quedan {dias_restantes} dias."
        )
        insertar = """
        INSERT INTO configuracion_notificaciones (
            tipo_notificacion, nombre, descripcion, activo, enviar_email, enviar_whatsapp,
            dias_antes, plantilla_email, plantilla_whatsapp
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        self.base_datos.ejecutar_consulta(
            insertar,
            (
                "recordatorio_evento",
                "Recordatorio del evento",
                "Recordatorio manual del evento (sin dias fijos)",
                True,
                True,
                True,
                0,
                plantilla_email,
                plantilla_whatsapp,
            ),
        )

    def _asegurar_evento_creado_whatsapp(self):
        consulta = """
        SELECT enviar_whatsapp, plantilla_whatsapp, descripcion
        FROM configuracion_notificaciones
        WHERE tipo_notificacion = 'evento_creado'
        LIMIT 1
        """
        fila = self.base_datos.obtener_uno(consulta) or {}
        if not fila:
            return
        enviar_whatsapp = fila.get("enviar_whatsapp")
        plantilla_whatsapp = fila.get("plantilla_whatsapp") or ""
        descripcion = (fila.get("descripcion") or "").strip().lower()
        # Solo activar WhatsApp si sigue con la configuración base (sin personalizar)
        if (
            enviar_whatsapp in (0, False)
            and plantilla_whatsapp
            and "se envía cuando se crea un nuevo evento" in descripcion
        ):
            self.base_datos.ejecutar_consulta(
                "UPDATE configuracion_notificaciones SET enviar_whatsapp = TRUE WHERE tipo_notificacion = 'evento_creado'"
            )
    
    def actualizar_configuracion(self, tipo_notificacion, datos):
        """Actualiza la configuración de una notificación"""
        consulta = """
        UPDATE configuracion_notificaciones 
        SET nombre = %s, descripcion = %s, activo = %s, 
            enviar_email = %s, enviar_whatsapp = %s, dias_antes = %s,
            plantilla_email = %s, plantilla_whatsapp = %s
        WHERE tipo_notificacion = %s
        """
        parametros = (
            datos['nombre'],
            datos.get('descripcion'),
            datos.get('activo', True),
            datos.get('enviar_email', True),
            datos.get('enviar_whatsapp', True),
            datos.get('dias_antes', 0),
            datos.get('plantilla_email'),
            datos.get('plantilla_whatsapp'),
            tipo_notificacion
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def registrar_envio(
        self,
        evento_id,
        tipo_notificacion,
        canal,
        destinatario,
        asunto,
        mensaje,
        enviado=True,
        error=None,
        costo_email=None,
        costo_whatsapp=None,
    ):
        """Registra un envío de notificación en el historial"""
        self._asegurar_columnas_costos()
        consulta = """
        INSERT INTO historial_notificaciones 
        (id_evento, tipo_notificacion, canal, destinatario, asunto, mensaje, enviado, fecha_envio, error, costo_email, costo_whatsapp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        fecha_envio = datetime.now() if enviado else None
        parametros = (
            evento_id,
            tipo_notificacion,
            canal,
            destinatario,
            asunto,
            mensaje,
            enviado,
            fecha_envio,
            error,
            costo_email,
            costo_whatsapp,
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None

    def _asegurar_columnas_costos(self):
        try:
            consulta = """
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'historial_notificaciones'
              AND COLUMN_NAME IN ('costo_email', 'costo_whatsapp')
            """
            existentes = self.base_datos.obtener_todos(consulta) or []
            columnas = {row.get("COLUMN_NAME") for row in existentes}
            if "costo_email" not in columnas:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE historial_notificaciones ADD COLUMN costo_email DECIMAL(10,4) NULL"
                )
            if "costo_whatsapp" not in columnas:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE historial_notificaciones ADD COLUMN costo_whatsapp DECIMAL(10,4) NULL"
                )
        except Exception:
            pass
    
    def obtener_historial_evento(self, evento_id):
        """Obtiene el historial de notificaciones de un evento"""
        consulta = """
        SELECT * FROM historial_notificaciones 
        WHERE evento_id = %s 
        ORDER BY fecha_creacion DESC
        """
        return self.base_datos.obtener_todos(consulta, (evento_id,))
    
    def verificar_notificacion_enviada(self, evento_id, tipo_notificacion):
        """Verifica si una notificación ya fue enviada para un evento"""
        consulta = """
        SELECT COUNT(*) as total FROM historial_notificaciones 
        WHERE id_evento = %s AND tipo_notificacion = %s AND enviado = TRUE
        """
        resultado = self.base_datos.obtener_uno(consulta, (evento_id, tipo_notificacion))
        return resultado['total'] > 0 if resultado else False

    def obtener_resumen_envios(self, evento_id, tipo_notificacion):
        """Obtiene cantidad y ultima fecha de envio para un evento y tipo"""
        consulta = """
        SELECT COUNT(*) as total, MAX(fecha_envio) as ultimo_envio
        FROM historial_notificaciones
        WHERE id_evento = %s AND tipo_notificacion = %s AND enviado = TRUE
        """
        return self.base_datos.obtener_uno(consulta, (evento_id, tipo_notificacion)) or {
            'total': 0,
            'ultimo_envio': None
        }

    def obtener_resumen_envios_por_tipo(self):
        """Obtiene el total de envios por canal y tipo"""
        consulta = """
        SELECT tipo_notificacion,
            SUM(CASE WHEN canal = 'email' THEN 1 WHEN canal = 'ambos' THEN 1 ELSE 0 END) as total_email,
            SUM(CASE WHEN canal = 'whatsapp' THEN 1 WHEN canal = 'ambos' THEN 1 ELSE 0 END) as total_whatsapp
        FROM historial_notificaciones
        WHERE enviado = TRUE
        GROUP BY tipo_notificacion
        """
        filas = self.base_datos.obtener_todos(consulta) or []
        return {
            fila.get('tipo_notificacion'): {
                'total_email': int(fila.get('total_email') or 0),
                'total_whatsapp': int(fila.get('total_whatsapp') or 0)
            }
            for fila in filas
        }
    
    def obtener_destinatarios_adicionales(self, tipo_notificacion):
        """Obtiene los destinatarios adicionales para un tipo de notificación"""
        consulta = """
        SELECT email, nombre, rol 
        FROM destinatarios_notificaciones 
        WHERE tipo_notificacion = %s AND activo = TRUE
        """
        return self.base_datos.obtener_todos(consulta, (tipo_notificacion,))
    
    def agregar_destinatario(self, tipo_notificacion, email, nombre=None, rol='custom'):
        """Agrega un destinatario adicional para un tipo de notificación"""
        consulta = """
        INSERT INTO destinatarios_notificaciones (tipo_notificacion, email, nombre, rol, activo)
        VALUES (%s, %s, %s, %s, TRUE)
        ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), rol = VALUES(rol), activo = TRUE
        """
        # Para ON DUPLICATE KEY necesitamos una clave única, agreguemos índice único
        return self.base_datos.ejecutar_consulta(consulta, (tipo_notificacion, email, nombre, rol))
    
    def eliminar_destinatario(self, tipo_notificacion, email):
        """Elimina (desactiva) un destinatario adicional"""
        consulta = """
        UPDATE destinatarios_notificaciones 
        SET activo = FALSE 
        WHERE tipo_notificacion = %s AND email = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (tipo_notificacion, email))
    
    def obtener_destinatarios_por_tipo(self, tipo_notificacion):
        """Obtiene todos los destinatarios (activos e inactivos) de un tipo"""
        consulta = """
        SELECT * FROM destinatarios_notificaciones 
        WHERE tipo_notificacion = %s
        ORDER BY activo DESC, email
        """
        return self.base_datos.obtener_todos(consulta, (tipo_notificacion,))
    
    def obtener_eventos_para_notificar(self, tipo_notificacion):
        """Obtiene eventos que necesitan recibir una notificación específica"""
        config = self.obtener_configuracion(tipo_notificacion)
        if not config or not config.get('activo'):
            return []
        
        dias_antes = config.get('dias_antes', 0)
        
        if dias_antes == 0:
            # Notificaciones inmediatas (abonos, pagos) - se manejan en tiempo real
            return []
        elif dias_antes == -1:
            # Notificaciones después del evento (solicitud de calificación)
            consulta = """
            SELECT e.*, c.usuario_id, u.nombre_completo as nombre_cliente, u.email, u.telefono
            FROM eventos e
            LEFT JOIN clientes c ON e.id_cliente = c.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE DATE(e.fecha_evento) < CURDATE()
            AND e.estado IN ('completado', 'confirmado', 'en_proceso')
            AND NOT EXISTS (
                SELECT 1 FROM historial_notificaciones hn
                WHERE hn.evento_id = e.id_evento 
                AND hn.tipo_notificacion = %s 
                AND hn.enviado = TRUE
            )
            """
            return self.base_datos.obtener_todos(consulta, (tipo_notificacion,))
        else:
            # Notificaciones X días antes del evento
            fecha_objetivo = datetime.now().date() + timedelta(days=dias_antes)
            consulta = """
            SELECT e.*, c.usuario_id, u.nombre_completo as nombre_cliente, u.email, u.telefono
            FROM eventos e
            LEFT JOIN clientes c ON e.id_cliente = c.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE DATE(e.fecha_evento) = %s
            AND e.estado IN ('confirmado', 'en_proceso')
            AND NOT EXISTS (
                SELECT 1 FROM historial_notificaciones hn
                WHERE hn.evento_id = e.id_evento 
                AND hn.tipo_notificacion = %s 
                AND hn.enviado = TRUE
            )
            """
            return self.base_datos.obtener_todos(consulta, (fecha_objetivo, tipo_notificacion))

