"""
Rutas para panel de métricas y control de envíos
"""
from flask import Blueprint, jsonify, request
from api.middleware import requiere_autenticacion, requiere_rol
from modelos.whatsapp_metricas_modelo import WhatsAppMetricasModelo
from utilidades.logger import obtener_logger


whatsapp_metricas_bp = Blueprint("whatsapp_metricas", __name__)
logger = obtener_logger()
modelo = WhatsAppMetricasModelo()


@whatsapp_metricas_bp.route("/resumen", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def resumen():
    try:
        config = modelo.obtener_config()
        resumen = modelo.obtener_metricas_globales()
        return jsonify({"config": config, "resumen": resumen}), 200
    except Exception as e:
        logger.error(f"Error al obtener resumen métricas: {str(e)}")
        return jsonify({"error": "Error al obtener resumen"}), 500


@whatsapp_metricas_bp.route("/clientes", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def clientes():
    try:
        clientes = modelo.obtener_metricas_clientes()
        email = modelo.obtener_email_por_cliente()
        email_map = {row.get("cliente_id"): row for row in email or []}
        config = modelo.obtener_config()
        for row in clientes or []:
            extra = email_map.get(row.get("cliente_id"), {})
            row["email_out"] = int(extra.get("email_out") or 0)
            row["whatsapp_sistema"] = int(extra.get("whatsapp_sistema") or 0)
            precio_whatsapp = row.get("precio_whatsapp")
            precio_email = row.get("precio_email")
            if precio_whatsapp is None:
                precio_whatsapp = config.get("precio_whatsapp") or 0
            if precio_email is None:
                precio_email = config.get("precio_email") or 0
            costo_whatsapp_total = row.get("costo_whatsapp_total")
            costo_email_total = extra.get("costo_email_total")
            if costo_whatsapp_total is None:
                costo_whatsapp_total = float(precio_whatsapp) * float(row.get("whatsapp_out") or 0)
            if costo_email_total is None:
                costo_email_total = float(precio_email) * float(row.get("email_out") or 0)
            row["costo_whatsapp"] = float(costo_whatsapp_total or 0)
            row["costo_email"] = float(costo_email_total or 0)
            row["precio_whatsapp"] = float(precio_whatsapp)
            row["precio_email"] = float(precio_email)
        return jsonify({"clientes": clientes}), 200
    except Exception as e:
        logger.error(f"Error al obtener métricas clientes: {str(e)}")
        return jsonify({"error": "Error al obtener clientes"}), 500


@whatsapp_metricas_bp.route("/config", methods=["PUT"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_config():
    try:
        data = request.get_json() or {}
        def parse_decimal(value):
            if value is None:
                return 0.0
            if isinstance(value, (int, float)):
                return float(value)
            texto = str(value).strip()
            if not texto:
                return 0.0
            return float(texto.replace(",", "."))

        precio_whatsapp = parse_decimal(data.get("precio_whatsapp"))
        precio_email = parse_decimal(data.get("precio_email"))
        whatsapp_desactivado = bool(data.get("whatsapp_desactivado"))
        actualizado = modelo.actualizar_config(precio_whatsapp, precio_email, whatsapp_desactivado=whatsapp_desactivado)
        if actualizado:
            return jsonify({"message": "Configuracion actualizada"}), 200
        return jsonify({"error": "No se pudo actualizar"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar config métricas: {str(e)}")
        return jsonify({"error": "Error al actualizar config"}), 500


@whatsapp_metricas_bp.route("/clientes/<int:cliente_id>/control", methods=["PATCH"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_control(cliente_id):
    try:
        data = request.get_json() or {}
        actualizado = modelo.upsert_control_cliente(cliente_id, data)
        if actualizado:
            return jsonify({"message": "Control actualizado"}), 200
        return jsonify({"error": "No se pudo actualizar"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar control cliente: {str(e)}")
        return jsonify({"error": "Error al actualizar control"}), 500
