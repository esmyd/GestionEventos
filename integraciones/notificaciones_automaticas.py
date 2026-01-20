"""
Sistema simplificado de notificaciones automáticas
Envía notificaciones directamente cuando ocurren acciones sin necesidad de configuración
"""
from integraciones.email import IntegracionEmail
from integraciones.whatsapp import IntegracionWhatsApp
from datetime import datetime
import re


class NotificacionesAutomaticas:
    """Sistema simplificado para enviar notificaciones automáticamente"""
    
    def __init__(self):
        self.email = IntegracionEmail()
        self.whatsapp = IntegracionWhatsApp()

    def _formatear_moneda(self, valor):
        try:
            return f"${float(valor):,.2f}"
        except Exception:
            return f"${valor}"

    def _build_email_template(self, titulo, nombre_cliente, mensaje_principal, detalles=None, nota_footer=None):
        detalles_html = ""
        if detalles:
            filas = "".join(
                f"""
                  <tr>
                    <td style="padding:8px 0; color:#6b7280; width:40%;">{item['label']}</td>
                    <td style="padding:8px 0; color:#111827; font-weight:600;">{item['value']}</td>
                  </tr>
                """
                for item in detalles
            )
            detalles_html = f"""
              <table role="presentation" style="width:100%; border-collapse:collapse; margin-top:16px;">
                <tbody>
                  {filas}
                </tbody>
              </table>
            """

        footer = nota_footer or "Si tiene alguna pregunta, estamos atentos para ayudarle."

        return f"""<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background-color:#111827; color:#ffffff; padding:24px 32px;">
                <div style="font-size:18px; font-weight:700;">Lirios Eventos</div>
                <div style="font-size:14px; opacity:0.85; margin-top:4px;">{titulo}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px; color:#111827;">
                <p style="margin:0 0 16px 0; font-size:15px;">Estimado/a {nombre_cliente},</p>
                <p style="margin:0; font-size:14px; color:#374151; line-height:1.6;">
                  {mensaje_principal}
                </p>
                {detalles_html}
                <p style="margin:24px 0 0 0; font-size:14px; color:#374151;">
                  {footer}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280;">
                Lirios Eventos · Gracias por confiar en nosotros.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""
    
    def enviar_notificacion_pago(self, evento, monto, tipo_pago, metodo_pago, fecha_pago, saldo_pendiente):
        """
        Envía notificación cuando se registra un pago/abono
        
        Parámetros:
            evento: Diccionario con datos del evento
            monto: Monto del pago
            tipo_pago: 'abono', 'pago_completo', 'reembolso'
            metodo_pago: Método de pago usado
            fecha_pago: Fecha del pago
            saldo_pendiente: Saldo pendiente después del pago
        """
        if not evento.get('email') and not evento.get('telefono'):
            return False
        
        nombre_cliente = evento.get('nombre_cliente', 'Cliente')
        nombre_evento = evento.get('salon', evento.get('nombre_evento', 'Evento'))
        
        fecha_evento = evento.get('fecha_evento', '')
        detalles_base = [
            {'label': 'Evento', 'value': nombre_evento},
            {'label': 'Fecha del evento', 'value': fecha_evento},
            {'label': 'Fecha del pago', 'value': fecha_pago},
            {'label': 'Método de pago', 'value': metodo_pago.replace('_', ' ').title()},
            {'label': 'Monto', 'value': self._formatear_moneda(monto)},
        ]

        # Determinar tipo de mensaje
        if tipo_pago == 'pago_completo':
            asunto = f"Pago Completo - {nombre_evento}"
            mensaje_email = self._build_email_template(
                "Pago completo recibido",
                nombre_cliente,
                f"Excelente noticia. Hemos recibido el pago completo de su evento y queda confirmado para la fecha programada.",
                detalles_base,
                "Nos vemos pronto. Gracias por su confianza."
            )
            
            mensaje_whatsapp = f"✓ ¡Pago completo recibido! Su evento \"{nombre_evento}\" está confirmado para {evento.get('fecha_evento', '')}. ¡Nos vemos pronto!"
        
        elif tipo_pago == 'reembolso':
            asunto = f"Reembolso Procesado - {nombre_evento}"
            detalles_reembolso = detalles_base + [
                {'label': 'Saldo pendiente', 'value': self._formatear_moneda(saldo_pendiente)}
            ]
            mensaje_email = self._build_email_template(
                "Reembolso procesado",
                nombre_cliente,
                "Le informamos que su reembolso ha sido procesado correctamente.",
                detalles_reembolso
            )
            
            mensaje_whatsapp = f"✓ Reembolso procesado: ${monto:.2f} para el evento \"{nombre_evento}\". Saldo pendiente: ${saldo_pendiente:.2f}"
        
        else:  # abono
            asunto = f"Abono Recibido - {nombre_evento}"
            detalles_abono = detalles_base + [
                {'label': 'Saldo pendiente', 'value': self._formatear_moneda(saldo_pendiente)}
            ]
            mensaje_email = self._build_email_template(
                "Abono recibido",
                nombre_cliente,
                f"Hemos recibido su abono y lo hemos aplicado a su evento.",
                detalles_abono
            )
            
            mensaje_whatsapp = f"✓ Confirmamos recepción de su abono de ${monto:.2f} para el evento \"{nombre_evento}\". Saldo pendiente: ${saldo_pendiente:.2f}"
        
        # Enviar notificaciones
        exito = False
        if evento.get('email') and self.email.activo:
            try:
                if self.email.enviar_correo(evento['email'], asunto, mensaje_email, es_html=True):
                    exito = True
            except Exception as e:
                print(f"Error al enviar email: {e}")
        
        if evento.get('telefono') and self.whatsapp.activo:
            try:
                if self.whatsapp.enviar_mensaje(evento['telefono'], mensaje_whatsapp):
                    exito = True
            except Exception as e:
                print(f"Error al enviar WhatsApp: {e}")
        
        return exito
    
    def enviar_notificacion_cambio_estado(self, evento, estado_anterior, estado_nuevo):
        """
        Envía notificación cuando cambia el estado de un evento
        
        Parámetros:
            evento: Diccionario con datos del evento
            estado_anterior: Estado anterior del evento
            estado_nuevo: Nuevo estado del evento
        """
        if not evento.get('email') and not evento.get('telefono'):
            return False
        
        nombre_cliente = evento.get('nombre_cliente', 'Cliente')
        nombre_evento = evento.get('salon', evento.get('nombre_evento', 'Evento'))
        
        estados_texto = {
            'cotizacion': 'Cotización',
            'confirmado': 'Confirmado',
            'en_proceso': 'En Proceso',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        }
        
        asunto = f"Actualización de Estado - {nombre_evento}"
        detalles_estado = [
            {'label': 'Evento', 'value': nombre_evento},
            {'label': 'Estado anterior', 'value': estados_texto.get(estado_anterior, estado_anterior)},
            {'label': 'Estado actual', 'value': estados_texto.get(estado_nuevo, estado_nuevo)},
            {'label': 'Fecha del evento', 'value': evento.get('fecha_evento', '')},
        ]
        mensaje_email = self._build_email_template(
            "Actualización del estado del evento",
            nombre_cliente,
            "El estado de su evento ha sido actualizado. Puede revisar el detalle cuando lo desee.",
            detalles_estado
        )
        
        mensaje_whatsapp = f"✓ Estado del evento \"{nombre_evento}\" actualizado: {estados_texto.get(estado_nuevo, estado_nuevo)}"
        
        # Enviar notificaciones
        exito = False
        if evento.get('email') and self.email.activo:
            try:
                if self.email.enviar_correo(evento['email'], asunto, mensaje_email, es_html=True):
                    exito = True
            except Exception as e:
                print(f"Error al enviar email: {e}")
        
        if evento.get('telefono') and self.whatsapp.activo:
            try:
                if self.whatsapp.enviar_mensaje(evento['telefono'], mensaje_whatsapp):
                    exito = True
            except Exception as e:
                print(f"Error al enviar WhatsApp: {e}")
        
        return exito
    
    def enviar_notificacion_recordatorio(self, evento, dias_antes):
        """
        Envía recordatorio antes del evento
        
        Parámetros:
            evento: Diccionario con datos del evento
            dias_antes: Días antes del evento (7, 1, etc.)
        """
        if not evento.get('email') and not evento.get('telefono'):
            return False
        
        nombre_cliente = evento.get('nombre_cliente', 'Cliente')
        nombre_evento = evento.get('salon', evento.get('nombre_evento', 'Evento'))
        fecha_evento = evento.get('fecha_evento', '')
        hora_inicio = evento.get('hora_inicio', '')
        
        if dias_antes == 7:
            asunto = "Recordatorio - Su evento es en 7 días"
            mensaje_email = self._build_email_template(
                "Recordatorio de evento",
                nombre_cliente,
                f"Le recordamos que su evento está programado para dentro de 7 días.",
                [
                    {'label': 'Evento', 'value': nombre_evento},
                    {'label': 'Fecha', 'value': fecha_evento},
                    {'label': 'Hora', 'value': hora_inicio},
                ],
                "Si necesita ajustar algún detalle, puede contactarnos."
            )
            
            mensaje_whatsapp = f"📅 Recordatorio: Su evento \"{nombre_evento}\" es en 7 días ({fecha_evento} a las {hora_inicio})"
        
        elif dias_antes == 1:
            asunto = "Recordatorio - Su evento es mañana"
            mensaje_email = self._build_email_template(
                "Recordatorio de evento",
                nombre_cliente,
                f"Su evento es mañana. Queremos confirmar que todo esté listo.",
                [
                    {'label': 'Evento', 'value': nombre_evento},
                    {'label': 'Fecha', 'value': fecha_evento},
                    {'label': 'Hora', 'value': hora_inicio},
                ],
                "Nos vemos mañana. Gracias por su confianza."
            )
            
            mensaje_whatsapp = f"📅 Recordatorio: Su evento \"{nombre_evento}\" es mañana ({fecha_evento} a las {hora_inicio}). ¡Nos vemos pronto!"
        
        else:
            asunto = f"Recordatorio - Su evento es en {dias_antes} días"
            mensaje_email = self._build_email_template(
                "Recordatorio de evento",
                nombre_cliente,
                f"Su evento está programado para dentro de {dias_antes} días.",
                [
                    {'label': 'Evento', 'value': nombre_evento},
                    {'label': 'Fecha', 'value': fecha_evento},
                    {'label': 'Hora', 'value': hora_inicio},
                ]
            )
            
            mensaje_whatsapp = f"📅 Recordatorio: Su evento \"{nombre_evento}\" es en {dias_antes} días ({fecha_evento})"
        
        # Enviar notificaciones
        exito = False
        if evento.get('email') and self.email.activo:
            try:
                if self.email.enviar_correo(evento['email'], asunto, mensaje_email, es_html=True):
                    exito = True
            except Exception as e:
                print(f"Error al enviar email: {e}")
        
        if evento.get('telefono') and self.whatsapp.activo:
            try:
                if self.whatsapp.enviar_mensaje(evento['telefono'], mensaje_whatsapp):
                    exito = True
            except Exception as e:
                print(f"Error al enviar WhatsApp: {e}")
        
        return exito

