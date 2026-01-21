"""
Módulo de integración con correo electrónico
"""
import smtplib
import os
from utilidades.logger import obtener_logger
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
from modelos.base_datos import BaseDatos

# Cargar variables de entorno desde .env
load_dotenv()


class IntegracionEmail:
    """Clase para gestionar envío de correos electrónicos"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.activo = False
        self.logger = obtener_logger()
        self.smtp_server = None
        self.smtp_port = None
        self.email_from = None
        self.email_password = None
        self.use_tls = True
        self.use_ssl = False
        self.email_from_name = "Lirios Eventos"
        self.cargar_configuracion()
    
    def cargar_configuracion(self):
        """Carga la configuración de email desde variables de entorno"""
        # Cargar desde variables de entorno
        self.smtp_server = os.getenv('SMTP_SERVER', '').strip()
        smtp_port_str = os.getenv('SMTP_PORT', '587').strip()
        self.email_from = os.getenv('EMAIL_FROM', '').strip()
        self.email_password = os.getenv('EMAIL_PASSWORD', '').strip()
        self.email_from_name = os.getenv('EMAIL_FROM_NAME', 'Lirios Eventos').strip()
        
        # Convertir puerto a entero
        try:
            self.smtp_port = int(smtp_port_str) if smtp_port_str else 587
        except ValueError:
            self.smtp_port = 587
        
        # Configuración TLS/SSL
        use_tls_str = os.getenv('SMTP_USE_TLS', 'True').strip().lower()
        self.use_tls = use_tls_str in ('true', '1', 'yes', 'on')
        
        use_ssl_str = os.getenv('SMTP_USE_SSL', 'False').strip().lower()
        self.use_ssl = use_ssl_str in ('true', '1', 'yes', 'on')
        
        # Verificar que todas las configuraciones necesarias estén presentes
        if self.smtp_server and self.email_from and self.email_password:
            self.activo = True
            self.logger.info(
                f"Configuración de email cargada: {self.email_from} via {self.smtp_server}:{self.smtp_port}"
            )
        else:
            self.activo = False
            self.logger.warning("Configuración de email incompleta. Verifica tu archivo .env")
            if not self.smtp_server:
                self.logger.warning("SMTP_SERVER no configurado")
            if not self.email_from:
                self.logger.warning("EMAIL_FROM no configurado")
            if not self.email_password:
                self.logger.warning("EMAIL_PASSWORD no configurado")
    
    def enviar_correo(self, destinatario, asunto, cuerpo, es_html=False):
        """Envía un correo electrónico"""
        if not self.activo:
            self.logger.warning("Integración Email no activa. Verifica tu archivo .env")
            return False
        
        try:
            # Crear mensaje
            msg = MIMEMultipart()
            
            # Configurar remitente con nombre
            if self.email_from_name:
                msg['From'] = formataddr((self.email_from_name, self.email_from))
            else:
                msg['From'] = self.email_from
            
            msg['To'] = destinatario
            msg['Subject'] = asunto
            
            # Agregar cuerpo del mensaje
            if es_html:
                msg.attach(MIMEText(cuerpo, 'html', 'utf-8'))
            else:
                msg.attach(MIMEText(cuerpo, 'plain', 'utf-8'))
            
            # Conectar al servidor SMTP con timeout
            timeout = 30  # 30 segundos de timeout
            self.logger.info(f"Conectando a SMTP {self.smtp_server}:{self.smtp_port}")
            
            if self.use_ssl:
                # Usar SSL (puerto 465)
                server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, timeout=timeout)
            else:
                # Usar conexión normal (puerto 587 o 25)
                server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=timeout)
            
            # Configurar timeout para operaciones
            server.timeout = timeout
            
            # Iniciar TLS si está configurado
            if self.use_tls and not self.use_ssl:
                self.logger.info("Iniciando TLS")
                server.starttls()
            
            # Autenticarse
            self.logger.info(f"Autenticando SMTP como {self.email_from}")
            server.login(self.email_from, self.email_password)
            
            # Enviar correo
            self.logger.info(f"Enviando correo a {destinatario}")
            server.send_message(msg)
            server.quit()
            self.logger.info("Conexion SMTP cerrada correctamente")
            self.logger.info(f"Correo enviado exitosamente a {destinatario}: {asunto}")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            self.logger.error(f"Error de autenticación SMTP: {e}")
            self.logger.error("Verifica EMAIL_FROM y EMAIL_PASSWORD en tu archivo .env")
            return False
        except smtplib.SMTPServerDisconnected as e:
            self.logger.error("Error SMTP: El servidor cerró la conexión inesperadamente")
            self.logger.error(f"Detalles: {e}")
            self.logger.error("Verifica SMTP_USE_SSL y SMTP_USE_TLS en tu archivo .env")
            return False
        except smtplib.SMTPException as e:
            self.logger.error(f"Error SMTP: {e}")
            if "Connection unexpectedly closed" in str(e):
                self.logger.error("El servidor cerró la conexión. Verifica SSL/TLS, puerto y credenciales.")
            return False
        except TimeoutError as e:
            self.logger.error("Error de timeout: La conexión SMTP tardó demasiado")
            self.logger.error(f"Verifica que el servidor {self.smtp_server} esté accesible")
            return False
        except OSError as e:
            if "getaddrinfo failed" in str(e) or "11001" in str(e):
                self.logger.error(f"Error de conexión SMTP: No se puede resolver '{self.smtp_server}'")
                self.logger.error("Verifica SMTP_SERVER en tu archivo .env")
            elif "timed out" in str(e).lower() or "timeout" in str(e).lower():
                self.logger.error(
                    f"Error de timeout: No se pudo conectar a {self.smtp_server}:{self.smtp_port}"
                )
            else:
                self.logger.error(f"Error de red: {e}")
            return False
        except Exception as e:
            self.logger.error(f"Error al enviar correo: {e}")
            error_str = str(e).lower()
            if "connection" in error_str and "closed" in error_str:
                self.logger.error("El servidor cerró la conexión. Verifica SSL/TLS")
            return False
    
    def enviar_notificacion_evento(self, evento_id, tipo_notificacion):
        """Envía notificación por email sobre un evento"""
        from modelos.evento_modelo import EventoModelo
        evento_modelo = EventoModelo()
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        
        if evento:
            email = evento.get('email')
            if email:
                asunto, cuerpo = self.generar_contenido_evento(evento, tipo_notificacion)
                return self.enviar_correo(email, asunto, cuerpo)
        return False
    
    def generar_contenido_evento(self, evento, tipo_notificacion):
        """Genera el asunto y cuerpo del correo según el tipo"""
        asuntos = {
            'confirmacion': f"Confirmación de Evento: {evento['nombre_evento']}",
            'recordatorio': f"Recordatorio: Evento {evento['nombre_evento']}",
            'pago_pendiente': f"Recordatorio de Pago: {evento['nombre_evento']}"
        }
        
        cuerpos = {
            'confirmacion': f"""
Estimado/a cliente,

Su evento '{evento['nombre_evento']}' ha sido confirmado para el día {evento['fecha_evento']} a las {evento.get('hora_inicio', '')}.

Saludos,
Lirios Eventos
            """,
            'recordatorio': f"""
Estimado/a cliente,

Este es un recordatorio de que su evento '{evento['nombre_evento']}' está programado para el {evento['fecha_evento']}.

Saludos,
Lirios Eventos
            """,
            'pago_pendiente': f"""
Estimado/a cliente,

Le recordamos que tiene un saldo pendiente de ${evento.get('saldo_pendiente', 0):.2f} para el evento '{evento['nombre_evento']}'.

Por favor, contacte con nosotros para realizar el pago.

Saludos,
Lirios Eventos
            """
        }
        
        return asuntos.get(tipo_notificacion, "Notificación de Lirios Eventos"), cuerpos.get(tipo_notificacion, "")

