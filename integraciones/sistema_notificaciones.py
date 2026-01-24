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
import json
from modelos.whatsapp_metricas_modelo import WhatsAppMetricasModelo
from modelos.configuracion_general_modelo import ConfiguracionGeneralModelo
from modelos.whatsapp_chat_modelo import WhatsAppChatModelo
from modelos.whatsapp_templates_modelo import WhatsAppTemplatesModelo


class SistemaNotificaciones:
    """Sistema centralizado para gestionar y enviar notificaciones"""
    
    def __init__(self):
        self.modelo = NotificacionModelo()
        self.email = IntegracionEmail()
        self.whatsapp = IntegracionWhatsApp()
        self.evento_modelo = EventoModelo()
        self.pago_modelo = PagoModelo()
        self.logger = obtener_logger()
        self.metricas = WhatsAppMetricasModelo()
        self.config_general = ConfiguracionGeneralModelo()
        self.chat_modelo = WhatsAppChatModelo()
        self.templates = WhatsAppTemplatesModelo()
        self.ultimo_error = None
        self.ultimo_error_detalle = None
    
    def enviar_notificacion(self, evento_id, tipo_notificacion, datos_adicionales=None, force=False, canal_preferido=None):
        """Envía una notificación según su configuración"""
        self.ultimo_error = None
        self.ultimo_error_detalle = None
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
            if self.metricas.permitir_envio_email(evento.get("id_cliente")):
                email_enviado = self._enviar_email(evento, config, datos, tipo_notificacion)
            else:
                self.logger.warning("Email bloqueado para este cliente, no se envio")
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
            permitido_metricas = self.metricas.permitir_envio_whatsapp(evento.get("telefono"))
            permitido_cliente = self.metricas.permitir_envio_whatsapp_cliente(evento.get("cliente_id"))
            if permitido_metricas and permitido_cliente:
                # Intentar enviar el mensaje original primero (sin registrar aún)
                whatsapp_enviado, wa_message_id, error = self._enviar_whatsapp(evento, config, datos, tipo_notificacion, registrar_inmediatamente=False)
                
                # Si falla por error de ventana 24h, enviar plantilla de re-engagement y luego reintentar
                if not whatsapp_enviado and self._es_error_ventana(error):
                    self.logger.info(f"Error de ventana 24h detectado para evento {evento.get('id_evento')}, enviando plantilla de re-engagement")
                    if self._enviar_plantilla_reengagement(evento, datos):
                        self.logger.info(f"Plantilla de re-engagement enviada, reintentando mensaje original")
                        # Reintentar el mensaje original después del re-engagement (ahora sí registrar)
                        whatsapp_enviado, wa_message_id, error_reintento = self._enviar_whatsapp(evento, config, datos, tipo_notificacion, registrar_inmediatamente=True)
                        if whatsapp_enviado:
                            self.logger.info(f"Mensaje original enviado exitosamente después del re-engagement")
                        else:
                            self.logger.warning(f"Mensaje original falló después del re-engagement: {error_reintento}")
                    else:
                        self.logger.warning("No se pudo enviar plantilla de re-engagement")
                        # Si no se pudo enviar la plantilla, registrar el mensaje fallido
                        plantilla = config.get('plantilla_whatsapp', '')
                        mensaje = self._render_template(plantilla, datos, tipo_notificacion, "whatsapp")
                        self._registrar_mensaje_whatsapp(evento, mensaje, False, wa_message_id, error, tipo_notificacion)
                else:
                    # Si no hay error de ventana o el mensaje se envió exitosamente, registrar normalmente
                    if whatsapp_enviado or error:
                        # Obtener el mensaje formateado para registrarlo
                        plantilla = config.get('plantilla_whatsapp', '')
                        mensaje = self._render_template(plantilla, datos, tipo_notificacion, "whatsapp")
                        # Registrar el mensaje con los valores del intento
                        self._registrar_mensaje_whatsapp(evento, mensaje, whatsapp_enviado, wa_message_id, error, tipo_notificacion)
            else:
                if not permitido_metricas:
                    self.ultimo_error = "WHATSAPP_DESACTIVADO"
                    self.ultimo_error_detalle = "WhatsApp esta desactivado temporalmente."
                elif not permitido_cliente:
                    self.ultimo_error = "WHATSAPP_BLOQUEADO_CLIENTE"
                    self.ultimo_error_detalle = "WhatsApp bloqueado para este cliente."
                self.logger.warning("WhatsApp bloqueado o desactivado, no se envio")
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
                config_costos = self.metricas.obtener_config() or {}
                precio_email = float(config_costos.get("precio_email") or 0)
                precio_whatsapp = float(config_costos.get("precio_whatsapp") or 0)
                costo_email = precio_email if email_enviado else None
                costo_whatsapp = precio_whatsapp if whatsapp_enviado else None
                self.modelo.registrar_envio(
                    evento_id,
                    tipo_notificacion,
                    canal,
                    destinatario_cliente,
                    config.get('nombre', ''),
                    config.get('plantilla_email', ''),
                    enviado=True,
                    costo_email=costo_email,
                    costo_whatsapp=costo_whatsapp
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
            'nombre_plataforma': self._obtener_nombre_plataforma(),
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
            contenido = (plantilla or "").format(**datos)
            nombre_plataforma = self._obtener_nombre_plataforma()
            if nombre_plataforma and nombre_plataforma != "Lirios Eventos":
                contenido = contenido.replace("Lirios Eventos", nombre_plataforma)
            return contenido
        except KeyError:
            faltantes = self._obtener_placeholders_faltantes(plantilla, datos)
            if faltantes:
                self.logger.error(
                    f"Plantilla '{tipo_notificacion}' ({canal}) con variables faltantes: {', '.join(faltantes)}"
                )
            contenido = (plantilla or "").format_map(SafeDict(datos))
            nombre_plataforma = self._obtener_nombre_plataforma()
            if nombre_plataforma and nombre_plataforma != "Lirios Eventos":
                contenido = contenido.replace("Lirios Eventos", nombre_plataforma)
            return contenido
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
        nombre_plataforma = self._obtener_nombre_plataforma()
        header = default_header or nombre_plataforma
        footer = default_footer or f"{nombre_plataforma} · Estamos para ayudarte."
        if contenido:
            header_match = re.search(r"\[\[HEADER:(.*?)\]\]", contenido, re.DOTALL)
            footer_match = re.search(r"\[\[FOOTER:(.*?)\]\]", contenido, re.DOTALL)
            if header_match and header_match.group(1).strip():
                header = header_match.group(1).strip()
            if footer_match and footer_match.group(1).strip():
                footer = footer_match.group(1).strip()
        return header, footer

    def _render_parametros(self, plantilla_texto, datos):
        if not plantilla_texto:
            return []
        class SafeDict(dict):
            def __missing__(self, key):
                return f"{{{key}}}"
        valores = []
        for item in str(plantilla_texto).split(","):
            texto = item.strip()
            if not texto:
                continue
            try:
                valores.append(texto.format_map(SafeDict(datos)))
            except Exception:
                valores.append(texto)
        return valores

    # Control de rate limit para plantillas de re-engagement por teléfono
    _reengagement_enviados = {}  # {telefono: timestamp}
    _REENGAGEMENT_COOLDOWN = 60  # segundos entre envíos al mismo teléfono

    def _enviar_plantilla_reengagement(self, evento, datos):
        import time
        
        telefono = evento.get("telefono")
        
        # Verificar si ya se envió recientemente a este teléfono (evitar bucles)
        ahora = time.time()
        ultimo_envio = self._reengagement_enviados.get(telefono, 0)
        if ahora - ultimo_envio < self._REENGAGEMENT_COOLDOWN:
            self.logger.warning(f"Rate limit: plantilla re-engagement ya enviada a {telefono} hace {int(ahora - ultimo_envio)}s")
            return False
        
        config = self.config_general.obtener_configuracion() or {}
        template_id = config.get("whatsapp_reengagement_template_id")
        if not template_id:
            return False
        plantilla = self.templates.obtener_por_id(int(template_id))
        if not plantilla or not plantilla.get("activo"):
            return False
        header_params = self._render_parametros(plantilla.get("header_ejemplo"), datos)
        body_params = self._render_parametros(plantilla.get("body_ejemplo"), datos)
        ok, wa_id, error = self.whatsapp.enviar_template(
            telefono,
            plantilla.get("nombre"),
            plantilla.get("idioma") or "es",
            parametros=[],
            header_parametros=header_params,
            body_parametros=body_params
        )
        
        # Registrar el envío para el rate limit (incluso si falla, para evitar spam)
        self._reengagement_enviados[telefono] = ahora
        
        conversacion = self.chat_modelo.obtener_conversacion_por_telefono(telefono)
        if not conversacion:
            conversacion_id = self.chat_modelo.crear_conversacion(telefono, cliente_id=evento.get("id_cliente"))
            conversacion = self.chat_modelo.obtener_conversacion_por_telefono(telefono)
        if conversacion:
            self.chat_modelo.actualizar_conversacion(conversacion["id"])
            self.chat_modelo.registrar_mensaje(
                conversacion["id"],
                "out",
                f"Plantilla: {plantilla.get('nombre')}",
                estado="sent" if ok else "fallido",
                wa_message_id=wa_id,
                origen="campana",
                raw_json=error
            )
        return ok

    def _obtener_nombre_plataforma(self):
        try:
            configuracion = self.config_general.obtener_configuracion() or {}
            return configuracion.get("nombre_plataforma") or "Lirios Eventos"
        except Exception:
            return "Lirios Eventos"

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
                            config_costos = self.metricas.obtener_config() or {}
                            precio_email = float(config_costos.get("precio_email") or 0)
                            # Registrar envío al destinatario adicional
                            self.modelo.registrar_envio(
                                evento.get('id_evento'),
                                tipo_notificacion,
                                'email',
                                email_dest,
                                asunto,
                                cuerpo,
                                enviado=True,
                                costo_email=precio_email
                            )
                except Exception as e:
                    self.logger.error(
                        f"Error al enviar email a destinatario adicional {dest.get('email')}: {e}"
                    )
            
            return exito_cliente or exito_adicionales
        except Exception as e:
            self.logger.error(f"Error al enviar email: {e}")
            return False
    
    def _enviar_whatsapp(self, evento, config, datos, tipo_notificacion, registrar_inmediatamente=True):
        """
        Envía notificación por WhatsApp y retorna (exito, wa_message_id, error)
        registrar_inmediatamente: Si False, no registra el mensaje (útil para re-engagement)
        """
        try:
            telefono = evento.get('telefono')
            if not telefono:
                self.logger.warning(f"No hay teléfono para el evento {evento.get('id_evento')}")
                return False, None, None
            
            # Formatear plantilla
            plantilla = config.get('plantilla_whatsapp', '')
            mensaje = self._render_template(plantilla, datos, tipo_notificacion, "whatsapp")
            
            # Enviar mensaje
            ok, wa_message_id, error = self.whatsapp.enviar_mensaje_con_error(telefono, mensaje)
            
            # Registrar en whatsapp_mensajes para trazabilidad (solo si se solicita)
            if registrar_inmediatamente:
                self._registrar_mensaje_whatsapp(evento, mensaje, ok, wa_message_id, error, tipo_notificacion)
            
            return ok, wa_message_id, error
        except Exception as e:
            self.logger.error(f"Error al enviar WhatsApp: {e}")
            return False, None, str(e)
    
    def _registrar_mensaje_whatsapp(self, evento, mensaje, ok, wa_message_id, error, tipo_notificacion="sistema"):
        """Registra un mensaje de WhatsApp en whatsapp_mensajes sin enviarlo"""
        try:
            telefono = evento.get('telefono')
            if not telefono:
                return
            
            # Obtener o crear conversación
            conversacion = self.chat_modelo.obtener_conversacion_por_telefono(telefono)
            if not conversacion:
                conversacion_id = self.chat_modelo.crear_conversacion(
                    telefono, 
                    cliente_id=evento.get("id_cliente")
                )
                conversacion = self.chat_modelo.obtener_conversacion_por_telefono(telefono)
            
            if conversacion:
                # Actualizar última interacción
                self.chat_modelo.actualizar_conversacion(conversacion["id"])
                
                # Calcular costo
                config_costos = self.metricas.obtener_config() or {}
                precio_whatsapp = float(config_costos.get("precio_whatsapp") or 0)
                costo_total = precio_whatsapp if ok else 0.0
                
                # Registrar mensaje en whatsapp_mensajes
                self.chat_modelo.registrar_mensaje(
                    conversacion["id"],
                    "out",
                    mensaje[:500] if isinstance(mensaje, str) else str(mensaje)[:500],
                    estado="sent" if ok else "fallido",
                    wa_message_id=wa_message_id,
                    origen="sistema",
                    raw_json=error,
                    costo_unitario=precio_whatsapp if ok else None,
                    costo_total=costo_total if ok else None
                )
                self.logger.info(
                    f"Mensaje de notificación '{tipo_notificacion}' registrado en whatsapp_mensajes "
                    f"(conversacion_id={conversacion['id']}, ok={ok})"
                )
        except Exception as e_registro:
            self.logger.warning(f"Error al registrar mensaje en whatsapp_mensajes: {e_registro}")

    def _es_error_ventana(self, error):
        if not error:
            return False
        try:
            data = json.loads(error) if isinstance(error, str) else error
            codigo = (data or {}).get("error", {}).get("code")
            return int(codigo) == 131047
        except Exception:
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

