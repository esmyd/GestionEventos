"""
Rutas para gestión de tipos de eventos
"""
from flask import Blueprint, request, jsonify
from modelos.tipo_evento_modelo import TipoEventoModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

tipos_evento_bp = Blueprint('tipos_evento', __name__)
logger = obtener_logger()
tipo_evento_modelo = TipoEventoModelo()


@tipos_evento_bp.route('', methods=['GET'])
def obtener_tipos_evento():
    """Obtiene todos los tipos de eventos"""
    try:
        solo_activos = request.args.get('solo_activos', 'true').lower() == 'true'
        tipos = tipo_evento_modelo.obtener_todos_tipos(solo_activos=solo_activos)
        return jsonify({'tipos_evento': tipos}), 200
    except Exception as e:
        logger.error(f"Error al obtener tipos de eventos: {str(e)}")
        return jsonify({'error': 'Error al obtener tipos de eventos'}), 500


@tipos_evento_bp.route('/<int:tipo_id>', methods=['GET'])
@requiere_autenticacion
def obtener_tipo_evento(tipo_id):
    """Obtiene un tipo de evento por ID"""
    try:
        tipo = tipo_evento_modelo.obtener_tipo_por_id(tipo_id)
        if tipo:
            return jsonify({'tipo_evento': tipo}), 200
        else:
            return jsonify({'error': 'Tipo de evento no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener tipo de evento: {str(e)}")
        return jsonify({'error': 'Error al obtener tipo de evento'}), 500
