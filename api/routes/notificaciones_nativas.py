"""
Rutas para gestión de notificaciones nativas (configuracion_notificaciones)
"""
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from api.middleware import requiere_autenticacion, requiere_rol
from modelos.notificacion_modelo import NotificacionModelo
from modelos.evento_modelo import EventoModelo
from integraciones.sistema_notificaciones import SistemaNotificaciones
from utilidades.logger import obtener_logger


notificaciones_nativas_bp = Blueprint("notificaciones_nativas", __name__)
logger = obtener_logger()
modelo = NotificacionModelo()
evento_modelo = EventoModelo()


@notificaciones_nativas_bp.route("/configuraciones", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def listar_configuraciones():
    try:
        configuraciones = modelo.obtener_todas_configuraciones()
        resumen_por_tipo = modelo.obtener_resumen_envios_por_tipo()
        for config in configuraciones or []:
            resumen = resumen_por_tipo.get(config.get("tipo_notificacion"), {})
            config["total_envios_email"] = resumen.get("total_email", 0)
            config["total_envios_whatsapp"] = resumen.get("total_whatsapp", 0)
        return jsonify({"configuraciones": configuraciones}), 200
    except Exception as e:
        logger.error(f"Error al listar configuraciones nativas: {str(e)}")
        return jsonify({"error": "Error al listar configuraciones"}), 500


@notificaciones_nativas_bp.route("/configuraciones/<string:tipo_notificacion>", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def obtener_configuracion(tipo_notificacion):
    try:
        configuracion = modelo.obtener_configuracion(tipo_notificacion)
        if not configuracion:
            return jsonify({"error": "Configuracion no encontrada"}), 404
        return jsonify({"configuracion": configuracion}), 200
    except Exception as e:
        logger.error(f"Error al obtener configuracion nativa: {str(e)}")
        return jsonify({"error": "Error al obtener configuracion"}), 500


@notificaciones_nativas_bp.route("/configuraciones/<string:tipo_notificacion>", methods=["PUT"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_configuracion(tipo_notificacion):
    try:
        data = request.get_json() or {}
        configuracion = modelo.obtener_configuracion(tipo_notificacion)
        if not configuracion:
            return jsonify({"error": "Configuracion no encontrada"}), 404
        datos_actualizados = {
            "nombre": data.get("nombre", configuracion.get("nombre")),
            "descripcion": data.get("descripcion", configuracion.get("descripcion")),
            "activo": configuracion.get("activo", True),
            "enviar_email": data.get("enviar_email", configuracion.get("enviar_email", True)),
            "enviar_whatsapp": data.get("enviar_whatsapp", configuracion.get("enviar_whatsapp", True)),
            "dias_antes": data.get("dias_antes", configuracion.get("dias_antes", 0)),
            "plantilla_email": data.get("plantilla_email", configuracion.get("plantilla_email")),
            "plantilla_whatsapp": data.get("plantilla_whatsapp", configuracion.get("plantilla_whatsapp")),
        }
        actualizado = modelo.actualizar_configuracion(tipo_notificacion, datos_actualizados)
        if actualizado:
            return jsonify({"message": "Configuracion actualizada"}), 200
        return jsonify({"error": "No se pudo actualizar la configuracion"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar configuracion nativa: {str(e)}")
        return jsonify({"error": "Error al actualizar configuracion"}), 500


@notificaciones_nativas_bp.route("/configuraciones/<string:tipo_notificacion>/status", methods=["PATCH"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_estado(tipo_notificacion):
    try:
        data = request.get_json() or {}
        activo = data.get("activo")
        if activo is None:
            return jsonify({"error": "activo es requerido"}), 400
        configuracion = modelo.obtener_configuracion(tipo_notificacion)
        if not configuracion:
            return jsonify({"error": "Configuracion no encontrada"}), 404

        configuracion["activo"] = bool(activo)
        actualizado = modelo.actualizar_configuracion(tipo_notificacion, configuracion)
        if actualizado:
            return jsonify({"message": "Estado actualizado"}), 200
        return jsonify({"error": "No se pudo actualizar el estado"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar estado nativo: {str(e)}")
        return jsonify({"error": "Error al actualizar estado"}), 500


@notificaciones_nativas_bp.route("/evento/<int:evento_id>/proximas", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def proximas_notificaciones_evento(evento_id):
    try:
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        if not evento:
            return jsonify({"error": "Evento no encontrado"}), 404
        estado_evento = evento.get("estado")
        if estado_evento == "cancelado":
            return jsonify({"notificaciones": [], "proximas_ejecuciones": []}), 200
        fecha_evento = evento.get("fecha_evento")
        configuraciones = modelo.obtener_todas_configuraciones()
        resultado = []
        proximas_ejecuciones = []
        hoy = datetime.now().date()
        
        # Tipos de notificación manuales que siempre se muestran (días_antes=0)
        tipos_manuales = ["recordatorio_evento", "recordatorio_valores_pendientes"]
        
        for config in configuraciones or []:
            if not config.get("activo"):
                continue
            tipo = config.get("tipo_notificacion")
            if tipo == "solicitud_calificacion" and estado_evento != "completado":
                continue
            dias_antes = int(config.get("dias_antes", 0))
            # Filtrar: mostrar si tiene dias_antes > 0 O si es un tipo manual
            if dias_antes == 0 and tipo not in tipos_manuales:
                continue
            resumen = modelo.obtener_resumen_envios(evento_id, tipo)
            resultado.append(
                {
                    "tipo_notificacion": tipo,
                    "nombre": config.get("nombre"),
                    "dias_antes": dias_antes,
                    "enviar_email": bool(config.get("enviar_email")),
                    "enviar_whatsapp": bool(config.get("enviar_whatsapp")),
                    "fecha_evento": str(fecha_evento) if fecha_evento else None,
                    "plantilla_email": config.get("plantilla_email") if tipo in tipos_manuales else None,
                    "plantilla_whatsapp": config.get("plantilla_whatsapp") if tipo in tipos_manuales else None,
                    "total_envios": resumen.get("total", 0) if resumen else 0,
                    "ultimo_envio": resumen.get("ultimo_envio") if resumen else None,
                }
            )
            
            # Calcular próximas ejecuciones automáticas (solo para notificaciones programadas)
            if dias_antes != 0 and fecha_evento and tipo not in tipos_manuales:
                fecha_evento_date = fecha_evento if isinstance(fecha_evento, datetime) else datetime.strptime(str(fecha_evento)[:10], "%Y-%m-%d")
                fecha_evento_date = fecha_evento_date.date() if hasattr(fecha_evento_date, 'date') else fecha_evento_date
                
                if dias_antes > 0:
                    # Notificación X días antes del evento
                    fecha_ejecucion = fecha_evento_date - timedelta(days=dias_antes)
                elif dias_antes == -1:
                    # Notificación 1 día después del evento
                    fecha_ejecucion = fecha_evento_date + timedelta(days=1)
                else:
                    continue
                
                # Determinar estado
                ya_enviado = (resumen.get("total", 0) if resumen else 0) > 0
                if ya_enviado:
                    estado = "enviado"
                elif fecha_ejecucion < hoy:
                    estado = "pasado"  # Ya pasó pero no se envió
                elif fecha_ejecucion == hoy:
                    estado = "hoy"
                else:
                    estado = "pendiente"
                
                dias_restantes = (fecha_ejecucion - hoy).days
                
                proximas_ejecuciones.append({
                    "tipo_notificacion": tipo,
                    "nombre": config.get("nombre"),
                    "dias_antes": dias_antes,
                    "fecha_ejecucion": str(fecha_ejecucion),
                    "dias_restantes": dias_restantes,
                    "estado": estado,
                    "enviar_email": bool(config.get("enviar_email")),
                    "enviar_whatsapp": bool(config.get("enviar_whatsapp")),
                    "total_envios": resumen.get("total", 0) if resumen else 0,
                })
        
        # Ordenar por fecha de ejecución
        proximas_ejecuciones.sort(key=lambda x: x["fecha_ejecucion"])
        
        return jsonify({
            "notificaciones": resultado,
            "proximas_ejecuciones": proximas_ejecuciones
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener notificaciones proximas: {str(e)}")
        return jsonify({"error": "Error al obtener notificaciones"}), 500


@notificaciones_nativas_bp.route("/evento/<int:evento_id>/forzar", methods=["POST"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def forzar_notificacion_evento(evento_id):
    try:
        data = request.get_json() or {}
        tipo = data.get("tipo_notificacion")
        canal = data.get("canal")
        if canal not in (None, "email", "whatsapp"):
            return jsonify({"error": "canal invalido"}), 400
        if not tipo:
            return jsonify({"error": "tipo_notificacion es requerido"}), 400
        logger.info(f"Forzar envio solicitado para evento {evento_id} tipo {tipo}")
        
        # Si es solicitud de calificación, usar método especial con botones interactivos
        if tipo == "solicitud_calificacion":
            from modelos.evento_modelo import EventoModelo
            from modelos.calificacion_modelo import CalificacionModelo
            from integraciones.whatsapp import IntegracionWhatsApp
            
            evento_modelo = EventoModelo()
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            
            if not evento:
                return jsonify({"error": "Evento no encontrado"}), 404
            
            if evento.get('estado') != 'completado':
                return jsonify({"error": "El evento debe estar completado para solicitar calificación"}), 400
            
            telefono = evento.get('telefono')
            nombre_evento = evento.get('nombre_evento', 'su evento')
            cliente_id = evento.get('id_cliente')
            
            if not telefono:
                return jsonify({"error": "El cliente no tiene teléfono registrado"}), 400
            
            # Crear solicitud de calificación pendiente
            calificacion_modelo = CalificacionModelo()
            solicitud_id = calificacion_modelo.crear_solicitud_calificacion(evento_id, cliente_id)
            logger.info(f"Solicitud de calificación creada con ID: {solicitud_id} para evento {evento_id}, cliente {cliente_id}")
            
            # Enviar WhatsApp con botones interactivos
            whatsapp = IntegracionWhatsApp()
            exito, wa_message_id, error = whatsapp.enviar_solicitud_calificacion(
                telefono, nombre_evento, evento_id
            )
            
            # Registrar en historial_notificaciones (como las demás notificaciones)
            mensaje_enviado = f"Solicitud de calificación para {nombre_evento}. Por favor califique del 1 al 5."
            modelo.registrar_envio(
                evento_id=evento_id,
                tipo_notificacion="solicitud_calificacion",
                canal="whatsapp",
                destinatario=telefono,
                asunto="Solicitud de Calificación",
                mensaje=mensaje_enviado,
                enviado=exito,
                error=error if not exito else None
            )
            
            # Registrar también en whatsapp_mensajes para el conteo y chat
            if exito:
                from modelos.whatsapp_chat_modelo import WhatsAppChatModelo
                chat_modelo = WhatsAppChatModelo()
                
                # Obtener o crear conversación
                conversacion = chat_modelo.obtener_conversacion_por_telefono(telefono)
                if not conversacion:
                    conversacion_id = chat_modelo.crear_conversacion(telefono, cliente_id=cliente_id)
                else:
                    conversacion_id = conversacion.get('id')
                
                # Registrar el mensaje enviado
                if conversacion_id:
                    chat_modelo.registrar_mensaje(
                        conversacion_id=conversacion_id,
                        direccion='out',
                        mensaje=mensaje_enviado,
                        estado='sent',
                        wa_message_id=wa_message_id,
                        origen='notificacion'
                    )
                    logger.info(f"Mensaje de calificación registrado en whatsapp_mensajes (conversacion_id={conversacion_id})")
            
            if exito:
                logger.info(f"Solicitud de calificación enviada para evento {evento_id}")
                return jsonify({"message": "Solicitud de calificación enviada", "success": True}), 200
            else:
                logger.warning(f"Error al enviar solicitud de calificación: {error}")
                return jsonify({"error": error or "No se pudo enviar la solicitud", "success": False}), 400
        
        # Para otros tipos de notificación, usar el sistema estándar
        sistema = SistemaNotificaciones()
        enviado = sistema.enviar_notificacion(evento_id, tipo, force=True, canal_preferido=canal)
        logger.info(
            f"Forzar envio resultado para evento {evento_id} tipo {tipo}: {'enviado' if enviado else 'fallido'}"
        )
        if enviado:
            return jsonify({"message": "Notificacion enviada", "success": True}), 200
        detalle = sistema.ultimo_error_detalle or "No se pudo enviar"
        return jsonify({"error": detalle, "success": False}), 400
    except Exception as e:
        logger.error(f"Error al forzar notificacion: {str(e)}")
        return jsonify({"error": "Error al forzar notificacion"}), 500
