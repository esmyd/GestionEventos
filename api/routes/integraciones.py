"""
Rutas para configuración de integraciones externas
"""
from flask import Blueprint, jsonify, request
from api.middleware import requiere_autenticacion, requiere_rol
from modelos.integracion_modelo import IntegracionModelo
from utilidades.logger import obtener_logger


integraciones_bp = Blueprint("integraciones", __name__)
logger = obtener_logger()
modelo = IntegracionModelo()


@integraciones_bp.route("/whatsapp", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def obtener_whatsapp():
    try:
        integracion = modelo.obtener_integracion("whatsapp")
        return jsonify({"integracion": integracion}), 200
    except Exception as e:
        logger.error(f"Error al obtener integracion whatsapp: {str(e)}")
        return jsonify({"error": "Error al obtener integracion"}), 500


@integraciones_bp.route("/whatsapp", methods=["PUT"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_whatsapp():
    try:
        data = request.get_json() or {}
        configuracion = {
            "access_token": data.get("access_token", "").strip(),
            "phone_number_id": data.get("phone_number_id", "").strip(),
            "business_id": data.get("business_id", "").strip(),
            "api_version": data.get("api_version", "v18.0").strip(),
            "verify_token": data.get("verify_token", "").strip(),
        }
        nombre = data.get("nombre", "WhatsApp Cloud API")
        activo = bool(data.get("activo"))
        actualizado = modelo.guardar_integracion("whatsapp", nombre, configuracion, activo)
        if actualizado:
            return jsonify({"message": "Integracion actualizada"}), 200
        return jsonify({"error": "No se pudo actualizar la integracion"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar integracion whatsapp: {str(e)}")
        return jsonify({"error": "Error al actualizar integracion"}), 500


@integraciones_bp.route("/whatsapp/webhook", methods=["GET", "POST"])
def whatsapp_webhook():
    if request.method == "GET":
        mode = request.args.get("hub.mode")
        token = request.args.get("hub.verify_token")
        challenge = request.args.get("hub.challenge")
        integracion = modelo.obtener_integracion("whatsapp") or {}
        expected = (integracion.get("configuracion") or {}).get("verify_token")
        if mode == "subscribe" and token and expected and token == expected:
            return challenge, 200
        logger.warning(
            f"Webhook WhatsApp verificacion fallida | mode={mode} "
            f"token_presente={bool(token)} expected_presente={bool(expected)}"
        )
        return jsonify(
            {
                "error": "Webhook verification failed",
                "mode": mode,
                "token_presente": bool(token),
                "expected_presente": bool(expected),
            }
        ), 403

    payload = request.get_json(silent=True) or {}
    logger.info(f"WhatsApp webhook recibido: {payload}")
    return "OK", 200


@integraciones_bp.route("/whatsapp/test-webhook", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def probar_webhook_whatsapp():
    try:
        verify_token = request.args.get("verify_token")
        mode = request.args.get("hub.mode", "subscribe")
        challenge = request.args.get("hub.challenge", "test")
        if not verify_token:
            return jsonify({"error": "verify_token es requerido"}), 400
        integracion = modelo.obtener_integracion("whatsapp") or {}
        expected = (integracion.get("configuracion") or {}).get("verify_token")
        if not expected:
            return jsonify({"error": "No hay verify_token guardado en la integracion"}), 400
        if verify_token != expected:
            return jsonify({"error": "verify_token no coincide"}), 403
        if mode != "subscribe":
            return jsonify({"error": "hub.mode invalido"}), 400
        return jsonify({"message": "Webhook verificado", "challenge": challenge}), 200
    except Exception as e:
        logger.error(f"Error al probar webhook whatsapp: {str(e)}")
        return jsonify({"error": "Error al probar webhook"}), 500
