"""
Rutas para gestión de categorías
"""
from flask import Blueprint, request, jsonify
from modelos.categoria_modelo import CategoriaModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

categorias_bp = Blueprint('categorias', __name__)
logger = obtener_logger()
categoria_modelo = CategoriaModelo()


@categorias_bp.route('', methods=['GET'])
@requiere_autenticacion
def obtener_categorias():
    """Obtiene todas las categorías"""
    try:
        solo_activas = request.args.get('solo_activas', 'true').lower() == 'true'
        categorias = categoria_modelo.obtener_todas_categorias(solo_activas=solo_activas)
        return jsonify({'categorias': categorias}), 200
    except Exception as e:
        logger.error(f"Error al obtener categorías: {str(e)}")
        return jsonify({'error': 'Error al obtener categorías'}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['GET'])
@requiere_autenticacion
def obtener_categoria(categoria_id):
    """Obtiene una categoría por ID"""
    try:
        categoria = categoria_modelo.obtener_categoria_por_id(categoria_id)
        if categoria:
            return jsonify({'categoria': categoria}), 200
        else:
            return jsonify({'error': 'Categoría no encontrada'}), 404
    except Exception as e:
        logger.error(f"Error al obtener categoría: {str(e)}")
        return jsonify({'error': 'Error al obtener categoría'}), 500


@categorias_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_categoria():
    """Crea una nueva categoría"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if 'nombre' not in data:
            return jsonify({'error': 'nombre es requerido'}), 400
        
        categoria_id = categoria_modelo.crear_categoria(data)
        if categoria_id:
            categoria = categoria_modelo.obtener_categoria_por_id(categoria_id)
            return jsonify({'message': 'Categoría creada exitosamente', 'categoria': categoria}), 201
        else:
            return jsonify({'error': 'Error al crear categoría'}), 500
    except Exception as e:
        logger.error(f"Error al crear categoría: {str(e)}")
        return jsonify({'error': f'Error al crear categoría: {str(e)}'}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_categoria(categoria_id):
    """Actualiza una categoría"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        resultado = categoria_modelo.actualizar_categoria(categoria_id, data)
        if resultado:
            categoria = categoria_modelo.obtener_categoria_por_id(categoria_id)
            return jsonify({'message': 'Categoría actualizada exitosamente', 'categoria': categoria}), 200
        else:
            return jsonify({'error': 'Error al actualizar categoría'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar categoría: {str(e)}")
        return jsonify({'error': 'Error al actualizar categoría'}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_categoria(categoria_id):
    """Elimina una categoría"""
    try:
        resultado = categoria_modelo.eliminar_categoria(categoria_id)
        if resultado:
            return jsonify({'message': 'Categoría eliminada exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al eliminar categoría'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar categoría: {str(e)}")
        return jsonify({'error': 'Error al eliminar categoría'}), 500
