"""
Rutas para gestión de reintentos de mensajes WhatsApp
"""
from flask import Blueprint, request, jsonify
from utilidades.reintentar_mensajes_whatsapp import ServicioReintentosWhatsApp
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

whatsapp_reintentos_bp = Blueprint('whatsapp_reintentos', __name__)
logger = obtener_logger()


@whatsapp_reintentos_bp.route('/procesar', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def procesar_reintentos():
    """Procesa mensajes pendientes de reintento"""
    try:
        data = request.get_json() or {}
        limite = data.get('limite', 50)
        
        servicio = ServicioReintentosWhatsApp()
        resultado = servicio.procesar_reintentos(limite=limite)
        
        return jsonify({
            'message': 'Reintentos procesados',
            'resultado': resultado
        }), 200
    except Exception as e:
        logger.error(f"Error al procesar reintentos: {str(e)}")
        return jsonify({'error': 'Error al procesar reintentos'}), 500


@whatsapp_reintentos_bp.route('/pendientes', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_pendientes():
    """Obtiene mensajes pendientes de reintento"""
    try:
        limite = request.args.get('limite', 50, type=int)
        
        servicio = ServicioReintentosWhatsApp()
        mensajes = servicio.obtener_mensajes_pendientes(limite=limite)
        
        return jsonify({
            'mensajes': mensajes,
            'total': len(mensajes) if mensajes else 0
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener mensajes pendientes: {str(e)}")
        return jsonify({'error': 'Error al obtener mensajes pendientes'}), 500
