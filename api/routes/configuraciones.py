"""
Rutas para utilidades de configuracion (limpieza de datos de prueba)
"""
from flask import Blueprint, jsonify, request
from api.middleware import requiere_autenticacion, requiere_rol
from modelos.base_datos import BaseDatos
from utilidades.logger import obtener_logger
from modelos.configuracion_general_modelo import ConfiguracionGeneralModelo


configuraciones_bp = Blueprint("configuraciones", __name__)
logger = obtener_logger()
config_general = ConfiguracionGeneralModelo()


@configuraciones_bp.route("/limpiar-datos-prueba", methods=["POST"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def limpiar_datos_prueba():
    """
    Elimina datos operativos de prueba:
    eventos, pagos y notificaciones (email/whatsapp).
    No elimina usuarios, roles ni configuraciones.
    """
    base_datos = BaseDatos()
    tablas = [
        "whatsapp_mensajes",
        "whatsapp_bot_estado",
        "whatsapp_conversaciones",
        "historial_notificaciones",
        "notificaciones_pendientes",
        "pagos",
        "evento_productos",
        "inventario",
        "evento_recursos",
        "tareas_evento",
        "confirmaciones_cliente",
        "evento_servicios",
        "eventos",
    ]
    eliminadas = []
    errores = []
    for tabla in tablas:
        try:
            base_datos.ejecutar_consulta(f"DELETE FROM {tabla}")
            eliminadas.append(tabla)
        except Exception as e:
            errores.append({"tabla": tabla, "error": str(e)})
            logger.warning(f"No se pudo limpiar {tabla}: {e}")
    return jsonify({"eliminadas": eliminadas, "errores": errores}), 200


@configuraciones_bp.route("/nombre-plataforma", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def obtener_nombre_plataforma():
    try:
        configuracion = config_general.obtener_configuracion() or {}
        return jsonify({
            "nombre_plataforma": configuracion.get("nombre_plataforma") or "Lirios Eventos"
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener nombre de plataforma: {e}")
        return jsonify({"error": "No se pudo obtener el nombre de la plataforma"}), 500


@configuraciones_bp.route("/nombre-plataforma", methods=["PUT"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_nombre_plataforma():
    try:
        data = request.get_json() or {}
        nombre = (data.get("nombre_plataforma") or "").strip()
        if not nombre:
            return jsonify({"error": "El nombre de la plataforma es requerido"}), 400
        actualizado = config_general.actualizar_nombre_plataforma(nombre)
        if actualizado:
            return jsonify({"message": "Nombre de plataforma actualizado"}), 200
        return jsonify({"error": "No se pudo actualizar el nombre"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar nombre de plataforma: {e}")
        return jsonify({"error": "No se pudo actualizar el nombre de la plataforma"}), 500


@configuraciones_bp.route("/general", methods=["GET"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def obtener_configuracion_general():
    try:
        configuracion = config_general.obtener_configuracion() or {}
        return jsonify({"configuracion": configuracion}), 200
    except Exception as e:
        logger.error(f"Error al obtener configuracion general: {e}")
        return jsonify({"error": "No se pudo obtener la configuracion general"}), 500


@configuraciones_bp.route("/general-public", methods=["GET"])
def obtener_configuracion_general_public():
    try:
        configuracion = config_general.obtener_configuracion() or {}
        return jsonify({"configuracion": configuracion}), 200
    except Exception as e:
        logger.error(f"Error al obtener configuracion general publica: {e}")
        return jsonify({"error": "No se pudo obtener la configuracion general"}), 500


@configuraciones_bp.route("/general", methods=["PUT"])
@requiere_autenticacion
@requiere_rol("administrador", "gerente_general")
def actualizar_configuracion_general():
    try:
        data = request.get_json() or {}
        nombre = (data.get("nombre_plataforma") or "").strip()
        if not nombre:
            return jsonify({"error": "El nombre de la plataforma es requerido"}), 400
        actualizado = config_general.actualizar_configuracion({
            "nombre_plataforma": nombre,
            "login_titulo": (data.get("login_titulo") or "").strip(),
            "login_subtitulo": (data.get("login_subtitulo") or "").strip(),
            "login_boton_texto": (data.get("login_boton_texto") or "").strip(),
            "login_left_titulo": (data.get("login_left_titulo") or "").strip(),
            "login_left_texto": (data.get("login_left_texto") or "").strip(),
            "login_left_items": (data.get("login_left_items") or "").strip(),
            "login_left_imagen": (data.get("login_left_imagen") or "").strip(),
            "login_acento_color": (data.get("login_acento_color") or "").strip(),
            "login_fondo_color": (data.get("login_fondo_color") or "").strip(),
            "whatsapp_reengagement_template_id": data.get("whatsapp_reengagement_template_id"),
            "contacto_nombre": (data.get("contacto_nombre") or "").strip(),
            "contacto_email": (data.get("contacto_email") or "").strip(),
            "contacto_telefono": (data.get("contacto_telefono") or "").strip(),
            "contacto_whatsapp": (data.get("contacto_whatsapp") or "").strip(),
            "establecimiento_direccion": (data.get("establecimiento_direccion") or "").strip(),
            "establecimiento_horario": (data.get("establecimiento_horario") or "").strip(),
        })
        if actualizado:
            return jsonify({"message": "Configuracion general actualizada"}), 200
        return jsonify({"error": "No se pudo actualizar la configuracion general"}), 500
    except Exception as e:
        logger.error(f"Error al actualizar configuracion general: {e}")
        return jsonify({"error": "No se pudo actualizar la configuracion general"}), 500
