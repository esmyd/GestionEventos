"""
Rutas para gestión de salones
"""
from flask import Blueprint, request, jsonify
from modelos.salon_modelo import SalonModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

salones_bp = Blueprint('salones', __name__)
logger = obtener_logger()
salon_modelo = SalonModelo()


@salones_bp.route('', methods=['GET'])
def obtener_salones():
    """Obtiene todos los salones"""
    try:
        solo_activos = request.args.get('solo_activos', 'false').lower() == 'true'
        salones = salon_modelo.obtener_todos_salones(solo_activos=solo_activos)
        return jsonify({'salones': salones}), 200
    except Exception as e:
        logger.error(f"Error al obtener salones: {str(e)}")
        return jsonify({'error': 'Error al obtener salones'}), 500


@salones_bp.route('/<int:salon_id>', methods=['GET'])
@requiere_autenticacion
def obtener_salon(salon_id):
    """Obtiene un salón por ID"""
    try:
        salon = salon_modelo.obtener_salon_por_id(salon_id)
        if salon:
            return jsonify({'salon': salon}), 200
        else:
            return jsonify({'error': 'Salón no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener salón: {str(e)}")
        return jsonify({'error': 'Error al obtener salón'}), 500


@salones_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_salon():
    """Crea un nuevo salón"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        campos_requeridos = ['nombre', 'capacidad']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        salon_id = salon_modelo.crear_salon(data)
        if salon_id:
            salon = salon_modelo.obtener_salon_por_id(salon_id)
            return jsonify({'message': 'Salón creado exitosamente', 'salon': salon}), 201
        else:
            return jsonify({'error': 'Error al crear salón'}), 500
    except Exception as e:
        logger.error(f"Error al crear salón: {str(e)}")
        return jsonify({'error': f'Error al crear salón: {str(e)}'}), 500


@salones_bp.route('/<int:salon_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_salon(salon_id):
    """Actualiza un salón"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        resultado = salon_modelo.actualizar_salon(salon_id, data)
        if resultado:
            salon = salon_modelo.obtener_salon_por_id(salon_id)
            return jsonify({'message': 'Salón actualizado exitosamente', 'salon': salon}), 200
        else:
            return jsonify({'error': 'Error al actualizar salón'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar salón: {str(e)}")
        return jsonify({'error': 'Error al actualizar salón'}), 500


@salones_bp.route('/<int:salon_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_salon(salon_id):
    """Elimina (desactiva) un salón"""
    try:
        resultado = salon_modelo.eliminar_salon(salon_id)
        if resultado:
            return jsonify({'message': 'Salón desactivado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al desactivar salón'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar salón: {str(e)}")
        return jsonify({'error': 'Error al desactivar salón'}), 500


@salones_bp.route('/<int:salon_id>/verificar-disponibilidad', methods=['POST'])
@requiere_autenticacion
def verificar_disponibilidad_salon(salon_id):
    """Verifica si un salón está disponible en una fecha"""
    try:
        data = request.get_json()
        if not data or 'fecha_evento' not in data:
            return jsonify({'error': 'fecha_evento es requerida'}), 400
        
        disponible = salon_modelo.verificar_disponibilidad(salon_id, data['fecha_evento'])
        return jsonify({'disponible': disponible}), 200
    except Exception as e:
        logger.error(f"Error al verificar disponibilidad: {str(e)}")
        return jsonify({'error': 'Error al verificar disponibilidad'}), 500
