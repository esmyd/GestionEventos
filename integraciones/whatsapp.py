"""
Módulo de integración con WhatsApp
"""
from modelos.base_datos import BaseDatos


class IntegracionWhatsApp:
    """Clase para gestionar integración con WhatsApp"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.activo = False
        self.cargar_configuracion()
    
    def cargar_configuracion(self):
        """Carga la configuración de WhatsApp desde la base de datos"""
        consulta = """
        SELECT * FROM configuracion_integraciones 
        WHERE tipo_integracion = 'whatsapp' AND activo = TRUE
        """
        config = self.base_datos.obtener_uno(consulta)
        if config:
            self.activo = True
            # Aquí se cargarían los parámetros de configuración desde config['configuracion']
    
    def enviar_mensaje(self, telefono, mensaje):
        """Envía un mensaje por WhatsApp"""
        if not self.activo:
            print("Integración WhatsApp no activa")
            return False
        
        # Aquí se implementaría la lógica de envío de WhatsApp
        # Por ejemplo, usando la API de WhatsApp Business o Twilio
        print(f"Enviando WhatsApp a {telefono}: {mensaje}")
        return True
    
    def enviar_notificacion_evento(self, evento_id, tipo_notificacion):
        """Envía notificación sobre un evento"""
        from modelos.evento_modelo import EventoModelo
        evento_modelo = EventoModelo()
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        
        if evento:
            telefono = evento.get('telefono')
            if telefono:
                mensaje = self.generar_mensaje_evento(evento, tipo_notificacion)
                return self.enviar_mensaje(telefono, mensaje)
        return False
    
    def generar_mensaje_evento(self, evento, tipo_notificacion):
        """Genera el mensaje según el tipo de notificación"""
        mensajes = {
            'confirmacion': f"Su evento '{evento['nombre_evento']}' ha sido confirmado para {evento['fecha_evento']}",
            'recordatorio': f"Recordatorio: Su evento '{evento['nombre_evento']}' es el {evento['fecha_evento']}",
            'pago_pendiente': f"Recordatorio: Tiene un saldo pendiente de ${evento.get('saldo_pendiente', 0):.2f} para el evento '{evento['nombre_evento']}'"
        }
        return mensajes.get(tipo_notificacion, "Notificación de evento")

