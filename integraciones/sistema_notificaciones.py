"""
Sistema centralizado de notificaciones
Integra WhatsApp y Email
"""
from modelos.notificacion_modelo import NotificacionModelo
from modelos.evento_modelo import EventoModelo
from modelos.pago_modelo import PagoModelo
from integraciones.email import IntegracionEmail
from integraciones.whatsapp import IntegracionWhatsApp
from datetime import datetime


class SistemaNotificaciones:
    """Sistema centralizado para gestionar y enviar notificaciones"""
    
    def __init__(self):
        self.modelo = NotificacionModelo()
        self.email = IntegracionEmail()
        self.whatsapp = IntegracionWhatsApp()
        self.evento_modelo = EventoModelo()
        self.pago_modelo = PagoModelo()
    
    def enviar_notificacion(self, evento_id, tipo_notificacion, datos_adicionales=None):
        """Envía una notificación según su configuración"""
        # Obtener configuración
        config = self.modelo.obtener_configuracion(tipo_notificacion)
        if not config or not config.get('activo'):
            print(f"Notificación '{tipo_notificacion}' no está activa")
            return False
        
        # Verificar si ya fue enviada
        if self.modelo.verificar_notificacion_enviada(evento_id, tipo_notificacion):
            print(f"Notificación '{tipo_notificacion}' ya fue enviada para este evento")
            return True
        
        # Obtener datos del evento
        evento = self.evento_modelo.obtener_evento_por_id(evento_id)
        if not evento:
            print(f"Evento {evento_id} no encontrado")
            return False
        
        # Preparar datos para plantillas
        datos = self._preparar_datos_plantilla(evento, datos_adicionales)
        
        # Enviar por email si está configurado
        email_enviado = False
        if config.get('enviar_email') and self.email.activo:
            email_enviado = self._enviar_email(evento, config, datos, tipo_notificacion)
        
        # Enviar por WhatsApp si está configurado
        whatsapp_enviado = False
        if config.get('enviar_whatsapp') and self.whatsapp.activo:
            whatsapp_enviado = self._enviar_whatsapp(evento, config, datos)
        
        # Registrar en historial (solo si se envió al cliente)
        # Los destinatarios adicionales ya se registran individualmente en _enviar_email
        canal = 'ambos' if (email_enviado and whatsapp_enviado) else ('email' if email_enviado else 'whatsapp')
        if email_enviado or whatsapp_enviado:
            # Registrar envío al cliente (solo si tiene email/teléfono)
            destinatario_cliente = evento.get('email') or evento.get('telefono')
            if destinatario_cliente:
                self.modelo.registrar_envio(
                    evento_id,
                    tipo_notificacion,
                    canal,
                    destinatario_cliente,
                    config.get('nombre', ''),
                    config.get('plantilla_email', ''),
                    enviado=True
                )
            return True
        else:
            error_msg = "No se pudo enviar por ningún canal"
            self.modelo.registrar_envio(
                evento_id,
                tipo_notificacion,
                'ambos',
                evento.get('email', evento.get('telefono', 'N/A')),
                config.get('nombre', ''),
                '',
                enviado=False,
                error=error_msg
            )
            return False
    
    def _preparar_datos_plantilla(self, evento, datos_adicionales=None):
        """Prepara los datos para reemplazar en las plantillas"""
        datos = {
            'nombre_cliente': evento.get('nombre_cliente', 'Cliente'),
            'nombre_evento': evento.get('salon', evento.get('nombre_evento', 'Evento')),
            'tipo_evento': evento.get('tipo_evento', ''),
            'fecha_evento': evento.get('fecha_evento', ''),
            'hora_inicio': str(evento.get('hora_inicio', '')),
            'hora_fin': str(evento.get('hora_fin', '')),
            'total': float(evento.get('total', evento.get('precio_total', 0)) or 0),
            'precio_total': float(evento.get('total', evento.get('precio_total', 0)) or 0),
            'saldo_pendiente': float(evento.get('saldo', evento.get('saldo_pendiente', 0)) or 0),
            'saldo': float(evento.get('saldo', evento.get('saldo_pendiente', 0)) or 0),
        }
        
        # Agregar datos adicionales (para pagos)
        if datos_adicionales:
            datos.update(datos_adicionales)
        
        return datos
    
    def _enviar_email(self, evento, config, datos, tipo_notificacion):
        """Envía notificación por email (al cliente y destinatarios adicionales)"""
        try:
            # Obtener destinatarios adicionales
            destinatarios_adicionales = self.modelo.obtener_destinatarios_adicionales(tipo_notificacion)
            
            # Formatear plantilla
            plantilla = config.get('plantilla_email', '')
            cuerpo = plantilla.format(**datos)
            asunto = f"{config.get('nombre', 'Notificación')} - {datos['nombre_evento']}"
            
            # Enviar al cliente (si tiene email)
            email_cliente = evento.get('email')
            exito_cliente = False
            if email_cliente:
                try:
                    exito_cliente = self.email.enviar_correo(email_cliente, asunto, cuerpo, es_html=False)
                except Exception as e:
                    print(f"Error al enviar email al cliente: {e}")
            
            # Enviar a destinatarios adicionales
            exito_adicionales = False
            for dest in destinatarios_adicionales:
                try:
                    email_dest = dest.get('email')
                    if email_dest:
                        # Enviar al destinatario adicional
                        if self.email.enviar_correo(email_dest, asunto, cuerpo, es_html=False):
                            exito_adicionales = True
                            # Registrar envío al destinatario adicional
                            self.modelo.registrar_envio(
                                evento.get('id_evento'),
                                tipo_notificacion,
                                'email',
                                email_dest,
                                asunto,
                                cuerpo,
                                enviado=True
                            )
                except Exception as e:
                    print(f"Error al enviar email a destinatario adicional {dest.get('email')}: {e}")
            
            return exito_cliente or exito_adicionales
        except Exception as e:
            print(f"Error al enviar email: {e}")
            return False
    
    def _enviar_whatsapp(self, evento, config, datos):
        """Envía notificación por WhatsApp"""
        try:
            telefono = evento.get('telefono')
            if not telefono:
                print(f"No hay teléfono para el evento {evento.get('id_evento')}")
                return False
            
            # Formatear plantilla
            plantilla = config.get('plantilla_whatsapp', '')
            mensaje = plantilla.format(**datos)
            
            return self.whatsapp.enviar_mensaje(telefono, mensaje)
        except Exception as e:
            print(f"Error al enviar WhatsApp: {e}")
            return False
    
    def notificar_abono(self, evento_id, pago_id):
        """Envía notificación cuando se recibe un abono"""
        pago = self.pago_modelo.obtener_pago_por_id(pago_id)
        if not pago:
            return False
        
        datos_adicionales = {
            'monto': float(pago.get('monto', 0)),
            'fecha_pago': pago.get('fecha_pago', ''),
            'metodo_pago': pago.get('metodo_pago', '').replace('_', ' ').title()
        }
        
        return self.enviar_notificacion(evento_id, 'abono_recibido', datos_adicionales)
    
    def notificar_pago_completo(self, evento_id):
        """Envía notificación cuando se completa el pago"""
        return self.enviar_notificacion(evento_id, 'pago_completo')
    
    def procesar_notificaciones_programadas(self):
        """Procesa notificaciones programadas (recordatorios, calificaciones)"""
        tipos_programados = [
            'recordatorio_7_dias',
            'recordatorio_1_dia',
            'solicitud_calificacion'
        ]
        
        total_enviadas = 0
        for tipo in tipos_programados:
            eventos = self.modelo.obtener_eventos_para_notificar(tipo)
            for evento in eventos:
                if self.enviar_notificacion(evento.get('id_evento', evento.get('id')), tipo):
                    total_enviadas += 1
        
        print(f"Procesadas {total_enviadas} notificaciones programadas")
        return total_enviadas

