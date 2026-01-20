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
        consulta = """
        SELECT * FROM configuracion_notificaciones 
        WHERE tipo_notificacion = %s AND activo = TRUE
        """
        return self.base_datos.obtener_uno(consulta, (tipo_notificacion,))
    
    def obtener_todas_configuraciones(self):
        """Obtiene todas las configuraciones de notificaciones"""
        consulta = """
        SELECT * FROM configuracion_notificaciones 
        ORDER BY dias_antes DESC, nombre
        """
        return self.base_datos.obtener_todos(consulta)
    
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
    
    def registrar_envio(self, evento_id, tipo_notificacion, canal, destinatario, asunto, mensaje, enviado=True, error=None):
        """Registra un envío de notificación en el historial"""
        consulta = """
        INSERT INTO historial_notificaciones 
        (id_evento, tipo_notificacion, canal, destinatario, asunto, mensaje, enviado, fecha_envio, error)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            error
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
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
        WHERE evento_id = %s AND tipo_notificacion = %s AND enviado = TRUE
        """
        resultado = self.base_datos.obtener_uno(consulta, (evento_id, tipo_notificacion))
        return resultado['total'] > 0 if resultado else False
    
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

