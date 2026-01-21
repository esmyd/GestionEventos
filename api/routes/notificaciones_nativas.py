"""
Rutas para gestión de notificaciones nativas (configuracion_notificaciones)
"""
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
            return jsonify({"notificaciones": []}), 200
        fecha_evento = evento.get("fecha_evento")
        configuraciones = modelo.obtener_todas_configuraciones()
        resultado = []
        for config in configuraciones or []:
            if not config.get("activo"):
                continue
            if config.get("tipo_notificacion") == "solicitud_calificacion" and estado_evento != "completado":
                continue
            dias_antes = int(config.get("dias_antes", 0))
            if dias_antes == 0 and config.get("tipo_notificacion") != "recordatorio_evento":
                continue
            resumen = modelo.obtener_resumen_envios(evento_id, config.get("tipo_notificacion"))
            resultado.append(
                {
                    "tipo_notificacion": config.get("tipo_notificacion"),
                    "nombre": config.get("nombre"),
                    "dias_antes": dias_antes,
                    "enviar_email": bool(config.get("enviar_email")),
                    "enviar_whatsapp": bool(config.get("enviar_whatsapp")),
                    "fecha_evento": str(fecha_evento) if fecha_evento else None,
                    "plantilla_email": config.get("plantilla_email") if config.get("tipo_notificacion") == "recordatorio_evento" else None,
                    "plantilla_whatsapp": config.get("plantilla_whatsapp") if config.get("tipo_notificacion") == "recordatorio_evento" else None,
                    "total_envios": resumen.get("total", 0) if resumen else 0,
                    "ultimo_envio": resumen.get("ultimo_envio") if resumen else None,
                }
            )
        return jsonify({"notificaciones": resultado}), 200
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
        sistema = SistemaNotificaciones()
        enviado = sistema.enviar_notificacion(evento_id, tipo, force=True, canal_preferido=canal)
        logger.info(
            f"Forzar envio resultado para evento {evento_id} tipo {tipo}: {'enviado' if enviado else 'fallido'}"
        )
        if enviado:
            return jsonify({"message": "Notificacion enviada", "success": True}), 200
        return jsonify({"error": "No se pudo enviar", "success": False}), 400
    except Exception as e:
        logger.error(f"Error al forzar notificacion: {str(e)}")
        return jsonify({"error": "Error al forzar notificacion"}), 500
