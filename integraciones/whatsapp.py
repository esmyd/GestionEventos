"""
Módulo de integración con WhatsApp (Meta Cloud API)
"""
import json
import urllib.request
import urllib.error
import mimetypes
import uuid
from modelos.base_datos import BaseDatos
from utilidades.logger import obtener_logger


class IntegracionWhatsApp:
    """Clase para gestionar integración con WhatsApp"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.activo = False
        self.logger = obtener_logger()
        self.access_token = None
        self.phone_number_id = None
        self.business_id = None
        self.api_version = "v22.0"
        self.cargar_configuracion()
    
    def cargar_configuracion(self):
        """Carga la configuración de WhatsApp desde la base de datos"""
        consulta = """
        SELECT * FROM configuracion_integraciones 
        WHERE tipo_integracion = 'whatsapp' AND activo = TRUE
        """
        config = self.base_datos.obtener_uno(consulta)
        if config:
            try:
                raw = config.get("configuracion")
                config_json = raw if isinstance(raw, dict) else json.loads(raw or "{}")
            except Exception:
                config_json = {}
            self.access_token = config_json.get("access_token")
            self.phone_number_id = config_json.get("phone_number_id")
            self.business_id = config_json.get("business_id")
            self.api_version = config_json.get("api_version") or "v22.0"
            if self.access_token and self.phone_number_id:
                self.activo = True
            else:
                self.activo = False
        else:
            self.activo = False
            self.logger.warning("Integracion WhatsApp no configurada o inactiva")
    
    def enviar_mensaje(self, telefono, mensaje):
        """Envía un mensaje por WhatsApp"""
        # Recargar configuración por si se actualizó en el panel
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False
        if not telefono:
            self.logger.warning("No hay telefono para enviar WhatsApp")
            return False
        self.logger.info(
            f"Enviando WhatsApp con phone_number_id={self.phone_number_id} api_version={self.api_version}"
        )
        try:
            url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "to": str(telefono).replace("+", "").replace(" ", ""),
                "type": "text",
                "text": {"body": mensaje},
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Content-Type", "application/json")
            req.add_header("Authorization", f"Bearer {self.access_token}")
            with urllib.request.urlopen(req, timeout=15) as response:
                body = response.read().decode("utf-8")
                if 200 <= response.status < 300:
                    self.logger.info(f"WhatsApp enviado OK a {telefono}")
                    return True
                self.logger.warning(f"WhatsApp respuesta no OK: {response.status} {body}")
                return False
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
            except Exception:
                body = str(e)
            self.logger.error(f"Error HTTP WhatsApp: {e.code} {body}")
            return False
        except Exception as e:
            self.logger.error(f"Error al enviar WhatsApp: {e}")
            return False

    def enviar_mensaje_con_error(self, telefono, mensaje):
        """Envía un mensaje por WhatsApp y retorna (exito, wa_message_id, error)"""
        # Recargar configuración por si se actualizó en el panel
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False, None, "Integración WhatsApp no activa"
        if not telefono:
            self.logger.warning("No hay telefono para enviar WhatsApp")
            return False, None, "Telefono faltante"
        payload = {
            "messaging_product": "whatsapp",
            "to": str(telefono).replace("+", "").replace(" ", ""),
            "type": "text",
            "text": {"body": mensaje},
        }
        return self._enviar_payload_con_error(payload)

    def _enviar_payload(self, payload):
        try:
            url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Content-Type", "application/json")
            req.add_header("Authorization", f"Bearer {self.access_token}")
            with urllib.request.urlopen(req, timeout=20) as response:
                body = response.read().decode("utf-8")
                if 200 <= response.status < 300:
                    try:
                        data = json.loads(body)
                    except Exception:
                        data = {}
                    mensaje_id = None
                    if isinstance(data, dict):
                        mensajes = data.get("messages") or []
                        if mensajes:
                            mensaje_id = mensajes[0].get("id")
                    return True, mensaje_id
                self.logger.warning(f"WhatsApp respuesta no OK: {response.status} {body}")
                return False, None
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
            except Exception:
                body = str(e)
            self.logger.error(f"Error HTTP WhatsApp: {e.code} {body}")
            return False, None
        except Exception as e:
            self.logger.error(f"Error al enviar WhatsApp: {e}")
            return False, None

    def _enviar_payload_con_error(self, payload):
        try:
            url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Content-Type", "application/json")
            req.add_header("Authorization", f"Bearer {self.access_token}")
            with urllib.request.urlopen(req, timeout=20) as response:
                body = response.read().decode("utf-8")
                if 200 <= response.status < 300:
                    try:
                        data = json.loads(body)
                    except Exception:
                        data = {}
                    mensaje_id = None
                    if isinstance(data, dict):
                        mensajes = data.get("messages") or []
                        if mensajes:
                            mensaje_id = mensajes[0].get("id")
                    return True, mensaje_id, None
                self.logger.warning(f"WhatsApp respuesta no OK: {response.status} {body}")
                return False, None, body
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
            except Exception:
                body = str(e)
            self.logger.error(f"Error HTTP WhatsApp: {e.code} {body}")
            return False, None, body
        except Exception as e:
            self.logger.error(f"Error al enviar WhatsApp: {e}")
            return False, None, str(e)

    def enviar_mensaje_chat(self, telefono, mensaje):
        """Envía mensaje y retorna (exito, wa_message_id)"""
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False, None
        if not telefono:
            self.logger.warning("No hay telefono para enviar WhatsApp")
            return False, None
        payload = {
            "messaging_product": "whatsapp",
            "to": str(telefono).replace("+", "").replace(" ", ""),
            "type": "text",
            "text": {"body": mensaje},
        }
        return self._enviar_payload(payload)

    def enviar_botones_chat(self, telefono, mensaje, botones):
        """Envía botones interactivos (máximo 3) y retorna (exito, wa_message_id)"""
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False, None
        if not telefono:
            self.logger.warning("No hay telefono para enviar WhatsApp")
            return False, None
        botones_validos = (botones or [])[:3]
        payload = {
            "messaging_product": "whatsapp",
            "to": str(telefono).replace("+", "").replace(" ", ""),
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": mensaje},
                "action": {
                    "buttons": [
                        {
                            "type": "reply",
                            "reply": {"id": str(btn.get("id")), "title": str(btn.get("title"))},
                        }
                        for btn in botones_validos
                    ]
                },
            },
        }
        return self._enviar_payload(payload)

    def enviar_lista_chat(self, telefono, mensaje, opciones, boton_texto="Seleccionar"):
        """Envía lista interactiva y retorna (exito, wa_message_id)"""
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False, None
        if not telefono:
            self.logger.warning("No hay telefono para enviar WhatsApp")
            return False, None
        filas = []
        for opcion in (opciones or [])[:10]:
            filas.append(
                {
                    "id": str(opcion.get("id")),
                    "title": str(opcion.get("title")),
                    "description": str(opcion.get("description") or ""),
                }
            )
        payload = {
            "messaging_product": "whatsapp",
            "to": str(telefono).replace("+", "").replace(" ", ""),
            "type": "interactive",
            "interactive": {
                "type": "list",
                "body": {"text": mensaje},
                "action": {
                    "button": boton_texto,
                    "sections": [{"title": "Opciones", "rows": filas}],
                },
            },
        }
        return self._enviar_payload(payload)

    def enviar_template(
        self,
        telefono,
        nombre_template,
        idioma="es",
        parametros=None,
        header_parametros=None,
        body_parametros=None
    ):
        """Envía un mensaje template y retorna (exito, wa_message_id, error)"""
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False, None, "Integración WhatsApp no activa"
        if not telefono:
            self.logger.warning("No hay telefono para enviar WhatsApp")
            return False, None, "Telefono faltante"
        if not nombre_template:
            return False, None, "Nombre de plantilla requerido"
        components = []
        if header_parametros:
            components.append(
                {
                    "type": "header",
                    "parameters": [{"type": "text", "text": str(valor)} for valor in header_parametros],
                }
            )
        if body_parametros:
            components.append(
                {
                    "type": "body",
                    "parameters": [{"type": "text", "text": str(valor)} for valor in body_parametros],
                }
            )
        if not components and parametros:
            params = parametros or []
            if params:
                components.append(
                    {
                        "type": "body",
                        "parameters": [{"type": "text", "text": str(valor)} for valor in params],
                    }
                )
        payload = {
            "messaging_product": "whatsapp",
            "to": str(telefono).replace("+", "").replace(" ", ""),
            "type": "template",
            "template": {
                "name": nombre_template,
                "language": {"code": idioma or "es"},
            },
        }
        if components:
            payload["template"]["components"] = components
        return self._enviar_payload_con_error(payload)

    def _build_multipart(self, fields, files):
        boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
        lines = []
        for name, value in fields.items():
            lines.append(f"--{boundary}")
            lines.append(f'Content-Disposition: form-data; name="{name}"')
            lines.append("")
            lines.append(str(value))
        for name, file_info in files.items():
            filename, content_type, content = file_info
            lines.append(f"--{boundary}")
            lines.append(
                f'Content-Disposition: form-data; name="{name}"; filename="{filename}"'
            )
            lines.append(f"Content-Type: {content_type}")
            lines.append("")
            lines.append(content)
        lines.append(f"--{boundary}--")
        body = b""
        for item in lines:
            if isinstance(item, bytes):
                body += item + b"\r\n"
            else:
                body += str(item).encode("utf-8") + b"\r\n"
        content_type = f"multipart/form-data; boundary={boundary}"
        return body, content_type

    def subir_media(self, file_bytes, mime_type, filename):
        """Sube un archivo y retorna media_id"""
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return None
        if not file_bytes:
            self.logger.warning("Archivo vacío para subir media")
            return None
        mime = mime_type or mimetypes.guess_type(filename or "")[0] or "application/octet-stream"
        try:
            url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/media"
            fields = {"messaging_product": "whatsapp"}
            files = {"file": (filename or "archivo", mime, file_bytes)}
            body, content_type = self._build_multipart(fields, files)
            req = urllib.request.Request(url, data=body, method="POST")
            req.add_header("Authorization", f"Bearer {self.access_token}")
            req.add_header("Content-Type", content_type)
            with urllib.request.urlopen(req, timeout=20) as response:
                resp_body = response.read().decode("utf-8")
                if 200 <= response.status < 300:
                    try:
                        data = json.loads(resp_body)
                        return data.get("id")
                    except Exception:
                        return None
                self.logger.warning(f"Subida media no OK: {response.status} {resp_body}")
                return None
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
            except Exception:
                body = str(e)
            self.logger.error(f"Error HTTP al subir media: {e.code} {body}")
            return None
        except Exception as e:
            self.logger.error(f"Error al subir media: {e}")
            return None

    def enviar_media(self, telefono, media_id, media_type, caption=None):
        """Envía un media por WhatsApp (image, audio, document)"""
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False
        if not telefono or not media_id:
            self.logger.warning("Telefono o media_id faltante")
            return False
        if media_type not in ("image", "audio", "document"):
            self.logger.warning(f"Tipo de media no soportado: {media_type}")
            return False
        payload = {
            "messaging_product": "whatsapp",
            "to": str(telefono).replace("+", "").replace(" ", ""),
            "type": media_type,
            media_type: {"id": media_id},
        }
        if caption and media_type in ("image", "document"):
            payload[media_type]["caption"] = caption
        try:
            url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Content-Type", "application/json")
            req.add_header("Authorization", f"Bearer {self.access_token}")
            with urllib.request.urlopen(req, timeout=20) as response:
                body = response.read().decode("utf-8")
                if 200 <= response.status < 300:
                    self.logger.info(f"WhatsApp media enviado OK a {telefono}")
                    return True
                self.logger.warning(f"WhatsApp media respuesta no OK: {response.status} {body}")
                return False
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
            except Exception:
                body = str(e)
            self.logger.error(f"Error HTTP WhatsApp media: {e.code} {body}")
            return False
        except Exception as e:
            self.logger.error(f"Error al enviar media WhatsApp: {e}")
            return False

    def enviar_media_chat(self, telefono, media_id, media_type, caption=None):
        """Envía media y retorna (exito, wa_message_id)"""
        self.cargar_configuracion()
        if not self.activo:
            self.logger.warning("Integración WhatsApp no activa")
            return False, None
        if not telefono or not media_id:
            self.logger.warning("Telefono o media_id faltante")
            return False, None
        if media_type not in ("image", "audio", "document"):
            self.logger.warning(f"Tipo de media no soportado: {media_type}")
            return False, None
        payload = {
            "messaging_product": "whatsapp",
            "to": str(telefono).replace("+", "").replace(" ", ""),
            "type": media_type,
            media_type: {"id": media_id},
        }
        if caption and media_type in ("image", "document"):
            payload[media_type]["caption"] = caption
        return self._enviar_payload(payload)

    def obtener_media_url(self, media_id):
        """Obtiene URL temporal y mime type de un media"""
        self.cargar_configuracion()
        if not self.activo:
            return None, None
        try:
            url = f"https://graph.facebook.com/{self.api_version}/{media_id}"
            req = urllib.request.Request(url, method="GET")
            req.add_header("Authorization", f"Bearer {self.access_token}")
            with urllib.request.urlopen(req, timeout=15) as response:
                body = response.read().decode("utf-8")
                if 200 <= response.status < 300:
                    data = json.loads(body)
                    return data.get("url"), data.get("mime_type")
                return None, None
        except Exception as e:
            self.logger.error(f"Error al obtener media URL: {e}")
            return None, None

    def descargar_media(self, media_id):
        """Descarga media y retorna (bytes, mime_type)"""
        media_url, mime_type = self.obtener_media_url(media_id)
        if not media_url:
            return None, None
        try:
            req = urllib.request.Request(media_url, method="GET")
            req.add_header("Authorization", f"Bearer {self.access_token}")
            with urllib.request.urlopen(req, timeout=20) as response:
                contenido = response.read()
                if 200 <= response.status < 300:
                    return contenido, mime_type or response.headers.get("Content-Type")
                return None, None
        except Exception as e:
            self.logger.error(f"Error al descargar media: {e}")
            return None, None
    
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

