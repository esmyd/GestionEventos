"""
Rutas para gestión y envío de plantillas WhatsApp
"""
from flask import Blueprint, jsonify, request
from api.middleware import requiere_autenticacion, requiere_rol
from modelos.whatsapp_templates_modelo import WhatsAppTemplatesModelo
from modelos.whatsapp_chat_modelo import WhatsAppChatModelo
from modelos.whatsapp_metricas_modelo import WhatsAppMetricasModelo
from modelos.cliente_modelo import ClienteModelo
from integraciones.whatsapp import IntegracionWhatsApp
from utilidades.logger import obtener_logger


whatsapp_templates_bp = Blueprint("whatsapp_templates", __name__)
logger = obtener_logger()
modelo = WhatsAppTemplatesModelo()
chat_modelo = WhatsAppChatModelo()
metricas = WhatsAppMetricasModelo()
clientes_modelo = ClienteModelo()
whatsapp = IntegracionWhatsApp()


@whatsapp_templates_bp.route("", methods=["GET"], strict_slashes=False)
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def listar_templates():
    try:
        templates = modelo.listar()
        return jsonify({"templates": templates}), 200
    except Exception as e:
        logger.error(f"Error al listar plantillas: {str(e)}")
        return jsonify({"error": "Error al listar plantillas"}), 500


@whatsapp_templates_bp.route("", methods=["POST"], strict_slashes=False)
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def crear_template():
    try:
        data = request.get_json() or {}
        nombre = (data.get("nombre") or "").strip()
        idioma = (data.get("idioma") or "es").strip()
        if not nombre:
            return jsonify({"error": "nombre es requerido"}), 400
        data["nombre"] = nombre
        data["idioma"] = idioma
        creado = modelo.crear(data)
        if creado:
            return jsonify({"message": "Plantilla creada"}), 201
        return jsonify({"error": "No se pudo crear"}), 500
    except Exception as e:
        logger.error(f"Error al crear plantilla: {str(e)}")
        return jsonify({"error": "Error al crear plantilla"}), 500


@whatsapp_templates_bp.route("/<int:template_id>", methods=["PUT"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_template(template_id):
    try:
        data = request.get_json() or {}
        existente = modelo.obtener_por_id(template_id)
        if not existente:
            return jsonify({"error": "Plantilla no encontrada"}), 404
        data["nombre"] = (data.get("nombre") or existente.get("nombre") or "").strip()
        data["idioma"] = (data.get("idioma") or existente.get("idioma") or "es").strip()
        actualizado = modelo.actualizar(template_id, data)
        if actualizado:
            return jsonify({"message": "Plantilla actualizada"}), 200
        return jsonify({"error": "No se pudo actualizar"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar plantilla: {str(e)}")
        return jsonify({"error": "Error al actualizar plantilla"}), 500


@whatsapp_templates_bp.route("/<int:template_id>", methods=["DELETE"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def eliminar_template(template_id):
    try:
        eliminado = modelo.eliminar(template_id)
        if eliminado:
            return jsonify({"message": "Plantilla eliminada"}), 200
        return jsonify({"error": "No se pudo eliminar"}), 500
    except Exception as e:
        logger.error(f"Error al eliminar plantilla: {str(e)}")
        return jsonify({"error": "Error al eliminar plantilla"}), 500


@whatsapp_templates_bp.route("/enviar", methods=["POST"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def enviar_template():
    try:
        data = request.get_json() or {}
        template_id = data.get("template_id")
        cliente_id = data.get("cliente_id")
        telefono = (data.get("telefono") or "").strip()
        parametros = data.get("parametros") or []
        header_parametros = data.get("header_parametros") or []
        body_parametros = data.get("body_parametros") or []

        if not template_id:
            return jsonify({"error": "template_id es requerido"}), 400
        template = modelo.obtener_por_id(template_id)
        if not template or not template.get("activo"):
            return jsonify({"error": "Plantilla no encontrada o inactiva"}), 404

        if cliente_id:
            cliente = clientes_modelo.obtener_cliente_por_id(cliente_id)
            if not cliente:
                return jsonify({"error": "Cliente no encontrado"}), 404
            telefono = cliente.get("telefono") or ""

        if not telefono:
            return jsonify({"error": "Telefono es requerido"}), 400

        if not metricas.permitir_envio_whatsapp(telefono):
            return jsonify({"error": "WhatsApp desactivado o bloqueado para este cliente"}), 400

        parametros = [str(x) for x in parametros] if isinstance(parametros, list) else []
        header_parametros = [str(x) for x in header_parametros] if isinstance(header_parametros, list) else []
        body_parametros = [str(x) for x in body_parametros] if isinstance(body_parametros, list) else []

        header_esperados = int(template.get("header_parametros") or 0)
        body_esperados = int(template.get("body_parametros") or 0)
        total_esperados = int(template.get("parametros") or 0)

        if header_esperados and len(header_parametros) != header_esperados:
            return jsonify({"error": "Cantidad de parametros header no coincide"}), 400
        if body_esperados and len(body_parametros) != body_esperados:
            return jsonify({"error": "Cantidad de parametros body no coincide"}), 400
        if total_esperados and not header_esperados and not body_esperados and len(parametros) != total_esperados:
            return jsonify({"error": "Cantidad de parametros no coincide"}), 400

        ok, wa_id, error = whatsapp.enviar_template(
            telefono,
            template.get("nombre"),
            template.get("idioma") or "es",
            parametros,
            header_parametros=header_parametros,
            body_parametros=body_parametros
        )
        conversacion = chat_modelo.obtener_conversacion_por_telefono(telefono)
        if not conversacion:
            conversacion_id = chat_modelo.crear_conversacion(telefono, cliente_id=cliente_id)
            conversacion = chat_modelo.obtener_conversacion_por_telefono(telefono)
        if conversacion:
            chat_modelo.actualizar_conversacion(conversacion["id"])
            resumen = f"Plantilla: {template.get('nombre')}"
            estado = "sent" if ok else "fallido"
            chat_modelo.registrar_mensaje(
                conversacion["id"],
                "out",
                resumen,
                estado=estado,
                wa_message_id=wa_id,
                origen="campana",
                raw_json=error
            )

        if ok:
            return jsonify({"message": "Plantilla enviada", "wa_message_id": wa_id}), 200
        return jsonify({"error": "No se pudo enviar", "detalle": error}), 400
    except Exception as e:
        logger.error(f"Error al enviar plantilla: {str(e)}")
        return jsonify({"error": "Error al enviar plantilla"}), 500
