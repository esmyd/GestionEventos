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
from utilidades.logger import obtener_logger
import re


class SistemaNotificaciones:
    """Sistema centralizado para gestionar y enviar notificaciones"""
    
    def __init__(self):
        self.modelo = NotificacionModelo()
        self.email = IntegracionEmail()
        self.whatsapp = IntegracionWhatsApp()
        self.evento_modelo = EventoModelo()
        self.pago_modelo = PagoModelo()
        self.logger = obtener_logger()
    
    def enviar_notificacion(self, evento_id, tipo_notificacion, datos_adicionales=None, force=False, canal_preferido=None):
        """Envía una notificación según su configuración"""
        self.logger.info(
            f"Intento enviar notificación '{tipo_notificacion}' para evento {evento_id} "
            f"(force={force}, canal={canal_preferido or 'ambos'})"
        )
        # Obtener configuración
        config = self.modelo.obtener_configuracion(tipo_notificacion)
        if not config or not config.get('activo'):
            self.logger.warning(f"Notificación '{tipo_notificacion}' no está activa")
            return False
        
        # Verificar si ya fue enviada (si no es forzada)
        if not force and self.modelo.verificar_notificacion_enviada(evento_id, tipo_notificacion):
            self.logger.info(
                f"Notificación '{tipo_notificacion}' ya fue enviada para evento {evento_id}"
            )
            return True
        
        # Obtener datos del evento
        evento = self.evento_modelo.obtener_evento_por_id(evento_id)
        if not evento:
            self.logger.error(f"Evento {evento_id} no encontrado para notificación '{tipo_notificacion}'")
            return False
        
        # Preparar datos para plantillas
        datos = self._preparar_datos_plantilla(evento, datos_adicionales)
        
        # Enviar por email si está configurado
        email_enviado = False
        if canal_preferido in (None, 'email') and config.get('enviar_email') and self.email.activo:
            self.logger.info(
                f"Email activo para notificación '{tipo_notificacion}' en evento {evento.get('id_evento')}"
            )
            email_enviado = self._enviar_email(evento, config, datos, tipo_notificacion)
        elif canal_preferido in (None, 'email') and config.get('enviar_email') and not self.email.activo:
            self.logger.warning("Email inactivo, no se envio notificación por email")
        elif canal_preferido in (None, 'email'):
            self.logger.info(
                f"Email desactivado en configuración para '{tipo_notificacion}'"
            )
        
        # Enviar por WhatsApp si está configurado
        whatsapp_enviado = False
        if canal_preferido in (None, 'whatsapp') and config.get('enviar_whatsapp') and self.whatsapp.activo:
            self.logger.info(
                f"WhatsApp activo para notificación '{tipo_notificacion}' en evento {evento.get('id_evento')}"
            )
            whatsapp_enviado = self._enviar_whatsapp(evento, config, datos)
        elif canal_preferido in (None, 'whatsapp') and config.get('enviar_whatsapp') and not self.whatsapp.activo:
            self.logger.warning("WhatsApp inactivo, no se envio notificación por WhatsApp")
        elif canal_preferido in (None, 'whatsapp'):
            self.logger.info(
                f"WhatsApp desactivado en configuración para '{tipo_notificacion}'"
            )
        
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
            self.logger.info(
                f"Notificación '{tipo_notificacion}' enviada para evento {evento_id} por {canal}"
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
            self.logger.warning(
                f"No se pudo enviar notificación '{tipo_notificacion}' para evento {evento_id}"
            )
            return False
    
    def _preparar_datos_plantilla(self, evento, datos_adicionales=None):
        """Prepara los datos para reemplazar en las plantillas"""
        fecha_evento = evento.get('fecha_evento')
        fecha_evento_dt = None
        if isinstance(fecha_evento, str):
            try:
                fecha_evento_dt = datetime.fromisoformat(fecha_evento).date()
            except ValueError:
                fecha_evento_dt = None
        elif fecha_evento:
            try:
                fecha_evento_dt = fecha_evento
            except Exception:
                fecha_evento_dt = None
        dias_restantes = None
        if fecha_evento_dt:
            dias_restantes = (fecha_evento_dt - datetime.now().date()).days

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
            'dias_restantes': dias_restantes,
        }
        
        # Agregar datos adicionales (para pagos)
        if datos_adicionales:
            datos.update(datos_adicionales)
        
        return datos

    def _obtener_placeholders_faltantes(self, plantilla, datos):
        if not plantilla:
            return []
        placeholders = set(re.findall(r"\{([a-zA-Z0-9_]+)\}", plantilla))
        return sorted([key for key in placeholders if key not in datos])

    def _render_template(self, plantilla, datos, tipo_notificacion, canal):
        class SafeDict(dict):
            def __missing__(self, key):
                return f"{{{key}}}"
        try:
            return (plantilla or "").format(**datos)
        except KeyError:
            faltantes = self._obtener_placeholders_faltantes(plantilla, datos)
            if faltantes:
                self.logger.error(
                    f"Plantilla '{tipo_notificacion}' ({canal}) con variables faltantes: {', '.join(faltantes)}"
                )
            return (plantilla or "").format_map(SafeDict(datos))
        except Exception as e:
            self.logger.error(
                f"Error al renderizar plantilla '{tipo_notificacion}' ({canal}): {e}"
            )
            return plantilla or ""

    def _es_html(self, contenido):
        if not contenido:
            return False
        texto = contenido.lower()
        return "<html" in texto or "<body" in texto or "<table" in texto

    def _extraer_layout(self, contenido, default_header="Lirios Eventos", default_footer="Lirios Eventos · Estamos para ayudarte."):
        header = default_header
        footer = default_footer
        if contenido:
            header_match = re.search(r"\[\[HEADER:(.*?)\]\]", contenido, re.DOTALL)
            footer_match = re.search(r"\[\[FOOTER:(.*?)\]\]", contenido, re.DOTALL)
            if header_match and header_match.group(1).strip():
                header = header_match.group(1).strip()
            if footer_match and footer_match.group(1).strip():
                footer = footer_match.group(1).strip()
        return header, footer

    def _limpiar_layout(self, contenido):
        if not contenido:
            return ""
        limpio = re.sub(r"\[\[HEADER:.*?\]\]\s*", "", contenido, flags=re.DOTALL)
        limpio = re.sub(r"\[\[FOOTER:.*?\]\]\s*", "", limpio, flags=re.DOTALL)
        return limpio

    def _envolver_email_html(self, contenido, titulo):
        header, footer = self._extraer_layout(contenido)
        contenido_html = self._limpiar_layout(contenido or "")
        lower = contenido_html.lower()
        if "<html" in lower or "<body" in lower:
            return contenido_html
        if not self._es_html(contenido_html):
            contenido_html = contenido_html.replace("\n", "<br>")
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
                <div style="font-size:18px; font-weight:700;">{header}</div>
                <div style="font-size:13px; opacity:0.85; margin-top:4px;">{titulo}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px; color:#111827; font-size:14px; line-height:1.6;">
                {contenido_html}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280;">
                {footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""
    
    def _enviar_email(self, evento, config, datos, tipo_notificacion):
        """Envía notificación por email (al cliente y destinatarios adicionales)"""
        try:
            # Obtener destinatarios adicionales
            destinatarios_adicionales = self.modelo.obtener_destinatarios_adicionales(tipo_notificacion)
            self.logger.info(
                f"Destinatarios adicionales para '{tipo_notificacion}': {len(destinatarios_adicionales)}"
            )
            
            # Formatear plantilla
            plantilla = config.get('plantilla_email', '')
            cuerpo = self._render_template(plantilla, datos, tipo_notificacion, "email")
            asunto = f"{config.get('nombre', 'Notificación')} - {datos['nombre_evento']}"
            cuerpo_html = self._envolver_email_html(cuerpo, config.get('nombre', 'Notificación'))
            
            # Enviar al cliente (si tiene email)
            email_cliente = evento.get('email')
            exito_cliente = False
            self.logger.info(
                f"Email cliente para evento {evento.get('id_evento')}: {email_cliente or 'NO DEFINIDO'}"
            )
            if email_cliente:
                try:
                    self.logger.info(
                        f"Enviando email a {email_cliente} para evento {evento.get('id_evento')}"
                    )
                    exito_cliente = self.email.enviar_correo(email_cliente, asunto, cuerpo_html, es_html=True)
                    self.logger.info(
                        f"Resultado email cliente {email_cliente}: {'OK' if exito_cliente else 'FALLIDO'}"
                    )
                except Exception as e:
                    self.logger.error(f"Error al enviar email al cliente: {e}")
            else:
                self.logger.warning(f"Evento {evento.get('id_evento')} sin email para notificación")
            
            # Enviar a destinatarios adicionales
            exito_adicionales = False
            for dest in destinatarios_adicionales:
                try:
                    email_dest = dest.get('email')
                    if email_dest:
                        # Enviar al destinatario adicional
                        self.logger.info(
                            f"Enviando email adicional a {email_dest} para evento {evento.get('id_evento')}"
                        )
                        if self.email.enviar_correo(email_dest, asunto, cuerpo_html, es_html=True):
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
                    self.logger.error(
                        f"Error al enviar email a destinatario adicional {dest.get('email')}: {e}"
                    )
            
            return exito_cliente or exito_adicionales
        except Exception as e:
            self.logger.error(f"Error al enviar email: {e}")
            return False
    
    def _enviar_whatsapp(self, evento, config, datos):
        """Envía notificación por WhatsApp"""
        try:
            telefono = evento.get('telefono')
            if not telefono:
                self.logger.warning(f"No hay teléfono para el evento {evento.get('id_evento')}")
                return False
            
            # Formatear plantilla
            plantilla = config.get('plantilla_whatsapp', '')
            mensaje = self._render_template(plantilla, datos, tipo_notificacion, "whatsapp")
            
            return self.whatsapp.enviar_mensaje(telefono, mensaje)
        except Exception as e:
            self.logger.error(f"Error al enviar WhatsApp: {e}")
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

