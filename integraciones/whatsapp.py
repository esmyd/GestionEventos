"""
Módulo de integración con WhatsApp (Meta Cloud API)
"""
import json
import urllib.request
import urllib.error
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

