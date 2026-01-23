"""
Sistema simplificado de notificaciones usando procedimientos almacenados
Este sistema es mucho más eficiente al delegar la lógica a MySQL
"""
from modelos.notificacion_modelo_v2 import NotificacionModeloV2
from integraciones.email import IntegracionEmail
from integraciones.whatsapp import IntegracionWhatsApp
from datetime import datetime, timedelta


class SistemaNotificacionesV2:
    """
    Sistema simplificado de notificaciones que usa procedimientos almacenados
    El código Python solo se encarga de:
    1. Obtener notificaciones pendientes de MySQL
    2. Enviarlas por Email/WhatsApp
    3. Marcar como enviadas en MySQL
    """
    
    def __init__(self):
        self.modelo = NotificacionModeloV2()
        self.email = IntegracionEmail()
        self.whatsapp = IntegracionWhatsApp()
    
    def procesar_notificaciones_pendientes(self, limite=50):
        """
        Procesa notificaciones pendientes de envío
        Este es el método principal que debe llamarse periódicamente
        
        Parámetros:
            limite: Número máximo de notificaciones a procesar por vez
        
        Retorna:
            Tupla (enviadas, errores)
        """
        # Obtener notificaciones pendientes usando procedimiento almacenado
        notificaciones = self.modelo.obtener_notificaciones_pendientes(limite)
        
        enviadas = 0
        errores = 0
        
        for notif in notificaciones:
            notif_id = notif['id']
            canal = notif['canal']
            exito = False
            error_msg = None
            exito_email = False
            exito_whatsapp = False
            
            try:
                # Enviar por email si está configurado
                if canal in ('email', 'ambos') and notif.get('destinatario_email'):
                    if self.email.activo:
                        try:
                            exito_email = self.email.enviar_correo(
                                notif['destinatario_email'],
                                notif['asunto'],
                                notif['mensaje_email'],
                                es_html=False
                            )
                            if exito_email:
                                exito = True
                            else:
                                if not error_msg:
                                    error_msg = "Error al enviar email"
                        except Exception as e:
                            if not error_msg:
                                error_msg = f"Error SMTP: {str(e)}"
                            print(f"   [ERROR] Error al enviar email para notificación {notif_id}: {e}")
                    else:
                        if not error_msg:
                            error_msg = "Email no configurado"
                
                # Enviar por WhatsApp si está configurado
                if canal in ('whatsapp', 'ambos') and notif.get('destinatario_telefono'):
                    if self.whatsapp.activo:
                        try:
                            exito_whatsapp = self.whatsapp.enviar_mensaje(
                                notif['destinatario_telefono'],
                                notif['mensaje_whatsapp']
                            )
                            if exito_whatsapp:
                                exito = True
                            else:
                                if not error_msg:
                                    error_msg = "Error al enviar WhatsApp"
                        except Exception as e:
                            if not error_msg:
                                error_msg = f"Error WhatsApp: {str(e)}"
                            print(f"   [ERROR] Error al enviar WhatsApp para notificación {notif_id}: {e}")
                    else:
                        if not error_msg:
                            error_msg = "WhatsApp no configurado"
                
                # Si ambos canales están configurados, al menos uno debe tener éxito
                if canal == 'ambos' and (exito_email or exito_whatsapp):
                    exito = True
                    if not exito_email and not exito_whatsapp:
                        error_msg = "Ambos canales fallaron"
                    elif not exito_email:
                        error_msg = "Email falló, WhatsApp exitoso"
                    elif not exito_whatsapp:
                        error_msg = "WhatsApp falló, Email exitoso"
                
            except Exception as e:
                error_msg = f"Error inesperado: {str(e)}"
                print(f"   [ERROR] Error procesando notificación {notif_id}: {e}")
            
            # Marcar como enviada usando procedimiento almacenado
            # Usar try-except separado para no perder el error si falla el marcado
            try:
                self.modelo.marcar_como_enviada(notif_id, exito, error_msg)
            except Exception as e:
                print(f"   [ERROR] No se pudo marcar notificación {notif_id} como enviada: {e}")
                # Intentar reconectar
                try:
                    self.modelo.base_datos.conectar()
                    self.modelo.marcar_como_enviada(notif_id, exito, error_msg)
                except:
                    print(f"   [ERROR CRÍTICO] No se pudo reconectar para marcar notificación {notif_id}")
            
            if exito:
                enviadas += 1
                print(f"   [OK] Notificación {notif_id} enviada exitosamente")
            else:
                errores += 1
                print(f"   [ERROR] Notificación {notif_id} falló: {error_msg}")
        
        return (enviadas, errores)
    
    def generar_notificaciones_programadas(self):
        """
        Genera notificaciones programadas
        Si el procedimiento almacenado no existe, se maneja desde Python
        Este método debe llamarse diariamente (cron, tarea programada)
        """
        resultado = self.modelo.generar_notificaciones_programadas()
        if resultado is None:
            # Si el procedimiento no existe, generar desde Python
            print(f"   [INFO] Procedimiento no disponible, generando desde Python...")
            return self._generar_desde_python()
        return resultado
    
    def _generar_desde_python(self):
        """Genera notificaciones programadas desde Python"""
        from modelos.notificacion_modelo import NotificacionModelo
        from modelos.evento_modelo import EventoModelo
        from datetime import datetime, timedelta
        
        notif_modelo = NotificacionModelo()
        evento_modelo = EventoModelo()
        
        # Obtener configuraciones de notificaciones programadas
        configuraciones = notif_modelo.obtener_todas_configuraciones()
        programadas = [c for c in configuraciones if c.get('activo') and c.get('dias_antes', 0) != 0]
        
        total_creadas = 0
        
        for config in programadas:
            tipo = config['tipo_notificacion']
            dias_antes = config.get('dias_antes', 0)
            
            # Calcular fecha objetivo
            if dias_antes == -1:
                # Después del evento
                fecha_objetivo = datetime.now().date() - timedelta(days=1)
                eventos = notif_modelo.obtener_eventos_para_notificar(tipo)
            else:
                # X días antes del evento
                fecha_objetivo = datetime.now().date() + timedelta(days=dias_antes)
                eventos = notif_modelo.obtener_eventos_para_notificar(tipo)
            
            # Crear notificaciones para cada evento
            for evento in eventos:
                if not notif_modelo.verificar_notificacion_enviada(evento.get('id_evento', evento.get('id')), tipo):
                    # Crear notificación pendiente
                    self._crear_notificacion_pendiente_desde_evento(evento, config, tipo)
                    total_creadas += 1
        
        return {'resultado': f'Notificaciones creadas: {total_creadas}'}
    
    def _crear_notificacion_pendiente_desde_evento(self, evento, config, tipo_notif):
        """Crea una notificación pendiente desde un evento"""
        from modelos.base_datos import BaseDatos
        bd = BaseDatos()
        
        # Preparar datos
        datos = {
            'nombre_cliente': evento.get('nombre_cliente', 'Cliente'),
            'nombre_evento': evento.get('salon', evento.get('nombre_evento', 'Evento')),
            'fecha_evento': str(evento.get('fecha_evento', '')),
            'hora_inicio': str(evento.get('hora_inicio', '')),
            'saldo_pendiente': float(evento.get('saldo', evento.get('saldo_pendiente', 0)) or 0)
        }
        
        # Formatear plantillas usando .format() para soportar formatos como {saldo_pendiente:.2f}
        import re
        plantilla_email = config.get('plantilla_email', '')
        plantilla_whatsapp = config.get('plantilla_whatsapp', '')
        
        try:
            # Convertir ${variable} a {variable} usando regex para mantener los formatos
            # Ejemplo: ${saldo_pendiente:.2f} -> {saldo_pendiente:.2f}
            plantilla_email = re.sub(r'\$\{([^}]+)\}', r'{\1}', plantilla_email)
            plantilla_whatsapp = re.sub(r'\$\{([^}]+)\}', r'{\1}', plantilla_whatsapp)
            
            # Formatear con los datos usando .format()
            plantilla_email = plantilla_email.format(**datos)
            plantilla_whatsapp = plantilla_whatsapp.format(**datos)
        except (KeyError, ValueError) as e:
            # Si falla el formato, intentar reemplazo simple como fallback
            print(f"   [ADVERTENCIA] Error al formatear plantilla: {e}")
            print(f"   Usando método de reemplazo simple...")
            for key, value in datos.items():
                # Reemplazar tanto {variable} como ${variable} con formato
                plantilla_email = re.sub(r'\$\{' + key + r'[^}]*\}', str(value), plantilla_email)
                plantilla_email = re.sub(r'\{' + key + r'[^}]*\}', str(value), plantilla_email)
                plantilla_whatsapp = re.sub(r'\$\{' + key + r'[^}]*\}', str(value), plantilla_whatsapp)
                plantilla_whatsapp = re.sub(r'\{' + key + r'[^}]*\}', str(value), plantilla_whatsapp)
        
        # Determinar canal
        if config.get('enviar_email') and config.get('enviar_whatsapp'):
            canal = 'ambos'
        elif config.get('enviar_email'):
            canal = 'email'
        elif config.get('enviar_whatsapp'):
            canal = 'whatsapp'
        else:
            return
        
        # Calcular fecha programada en base a la fecha del evento
        dias_antes = config.get('dias_antes', 0)
        fecha_evento = evento.get('fecha_evento')
        fecha_evento_dt = None
        try:
            if isinstance(fecha_evento, str):
                fecha_evento_dt = datetime.fromisoformat(str(fecha_evento).split("T")[0])
            elif fecha_evento:
                fecha_evento_dt = datetime.combine(fecha_evento, datetime.min.time())
        except Exception:
            fecha_evento_dt = None
        if fecha_evento_dt:
            if dias_antes == -1:
                fecha_programada = fecha_evento_dt + timedelta(days=1)
            else:
                fecha_programada = fecha_evento_dt - timedelta(days=dias_antes)
        else:
            # Fallback si la fecha no es válida
            fecha_programada = datetime.now() + timedelta(days=dias_antes if dias_antes != -1 else 1)
        
        # Insertar
        consulta = """
        INSERT INTO notificaciones_pendientes (
            evento_id, tipo_notificacion, canal,
            destinatario_email, destinatario_telefono,
            asunto, mensaje_email, mensaje_whatsapp,
            fecha_programada, enviado
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE)
        """
        
        asunto = f"{config.get('nombre', 'Notificación')} - {datos['nombre_evento']}"
        
        parametros = (
            evento.get('id_evento', evento.get('id')),
            tipo_notif,
            canal,
            evento.get('email'),
            evento.get('telefono'),
            asunto,
            plantilla_email,
            plantilla_whatsapp,
            fecha_programada
        )
        
        bd.ejecutar_consulta(consulta, parametros)
        bd.desconectar()
    
    def limpiar_notificaciones_antiguas(self, dias=90):
        """
        Limpia notificaciones antiguas usando procedimiento almacenado
        Parámetros:
            dias: Días de antigüedad para eliminar
        """
        return self.modelo.limpiar_antiguas(dias)

