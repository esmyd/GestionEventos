"""
Rutas para inbox y control de chat WhatsApp
"""
from flask import Blueprint, jsonify, request, Response
from api.middleware import requiere_autenticacion, requiere_rol
from integraciones.whatsapp_chat import WhatsAppChatService
from utilidades.logger import obtener_logger


whatsapp_chat_bp = Blueprint("whatsapp_chat", __name__)
logger = obtener_logger()
service = WhatsAppChatService()


@whatsapp_chat_bp.route("/conversations", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def listar_conversaciones():
    try:
        conversaciones = service.modelo.listar_conversaciones()
        return jsonify({"conversaciones": conversaciones}), 200
    except Exception as e:
        logger.error(f"Error al listar conversaciones: {str(e)}")
        return jsonify({"error": "Error al listar conversaciones"}), 500


@whatsapp_chat_bp.route("/conversations/<int:conversacion_id>/messages", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def obtener_mensajes(conversacion_id):
    try:
        mensajes = service.modelo.obtener_mensajes(conversacion_id)
        return jsonify({"mensajes": mensajes}), 200
    except Exception as e:
        logger.error(f"Error al obtener mensajes: {str(e)}")
        return jsonify({"error": "Error al obtener mensajes"}), 500


@whatsapp_chat_bp.route("/conversations/<int:conversacion_id>/send", methods=["POST"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def enviar_mensaje(conversacion_id):
    try:
        data = request.get_json() or {}
        mensaje = (data.get("mensaje") or "").strip()
        if not mensaje:
            return jsonify({"error": "mensaje es requerido"}), 400
        enviado = service.enviar_mensaje_manual(conversacion_id, mensaje)
        if enviado:
            return jsonify({"message": "Mensaje enviado"}), 200
        detalle = service.ultimo_error_envio or "No se pudo enviar"
        return jsonify({"error": detalle}), 400
    except Exception as e:
        logger.error(f"Error al enviar mensaje: {str(e)}")
        return jsonify({"error": "Error al enviar mensaje"}), 500


@whatsapp_chat_bp.route("/conversations/<int:conversacion_id>/send-media", methods=["POST"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def enviar_media(conversacion_id):
    try:
        archivo = request.files.get("archivo")
        tipo = (request.form.get("tipo") or "").strip()
        caption = (request.form.get("caption") or "").strip() or None
        if not archivo or tipo not in ("image", "audio", "document"):
            return jsonify({"error": "archivo y tipo validos son requeridos"}), 400
        enviado = service.enviar_media_manual(conversacion_id, archivo, tipo, caption=caption)
        if enviado:
            return jsonify({"message": "Media enviada"}), 200
        detalle = service.ultimo_error_envio or "No se pudo enviar media"
        return jsonify({"error": detalle}), 400
    except Exception as e:
        logger.error(f"Error al enviar media: {str(e)}")
        return jsonify({"error": "Error al enviar media"}), 500


@whatsapp_chat_bp.route("/media/<string:media_id>", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def obtener_media(media_id):
    try:
        contenido, mime_type = service.whatsapp.descargar_media(media_id)
        if not contenido:
            return jsonify({"error": "Media no encontrada"}), 404
        return Response(contenido, mimetype=mime_type or "application/octet-stream")
    except Exception as e:
        logger.error(f"Error al descargar media: {str(e)}")
        return jsonify({"error": "Error al descargar media"}), 500


@whatsapp_chat_bp.route("/conversations/<int:conversacion_id>/modo", methods=["PATCH"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def cambiar_modo(conversacion_id):
    try:
        data = request.get_json() or {}
        modo = data.get("modo")
        if modo not in ("bot", "humano"):
            return jsonify({"error": "modo invalido"}), 400
        actualizado = service.modelo.actualizar_conversacion(conversacion_id, bot_activo=(modo == "bot"))
        if actualizado:
            return jsonify({"message": "Modo actualizado"}), 200
        return jsonify({"error": "No se pudo actualizar"}), 500
    except Exception as e:
        logger.error(f"Error al cambiar modo: {str(e)}")
        return jsonify({"error": "Error al cambiar modo"}), 500


@whatsapp_chat_bp.route("/conversations/<int:conversacion_id>/reset-bot", methods=["POST"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general", "coordinador")
def reset_bot(conversacion_id):
    try:
        service.modelo.limpiar_estado_bot(conversacion_id)
        return jsonify({"message": "Estado del bot reiniciado"}), 200
    except Exception as e:
        logger.error(f"Error al reiniciar bot: {str(e)}")
        return jsonify({"error": "Error al reiniciar bot"}), 500
