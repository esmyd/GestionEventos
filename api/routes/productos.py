"""
Rutas para gestión de productos
"""
from flask import Blueprint, request, jsonify
from modelos.producto_modelo import ProductoModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

productos_bp = Blueprint('productos', __name__)
logger = obtener_logger()
producto_modelo = ProductoModelo()


@productos_bp.route('', methods=['GET'])
def obtener_productos():
    """Obtiene todos los productos"""
    try:
        solo_activos = request.args.get('solo_activos', 'true').lower() == 'true'
        categoria_id = request.args.get('categoria_id')
        
        if categoria_id:
            productos = producto_modelo.obtener_productos_por_categoria(int(categoria_id))
        else:
            productos = producto_modelo.obtener_todos_productos(solo_activos=solo_activos)
        
        return jsonify({'productos': productos}), 200
    except Exception as e:
        logger.error(f"Error al obtener productos: {str(e)}")
        return jsonify({'error': 'Error al obtener productos'}), 500


@productos_bp.route('/<int:producto_id>', methods=['GET'])
@requiere_autenticacion
def obtener_producto(producto_id):
    """Obtiene un producto por ID"""
    try:
        producto = producto_modelo.obtener_producto_por_id(producto_id)
        if producto:
            return jsonify({'producto': producto}), 200
        else:
            return jsonify({'error': 'Producto no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener producto: {str(e)}")
        return jsonify({'error': 'Error al obtener producto'}), 500


@productos_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_producto():
    """Crea un nuevo producto"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if 'nombre' not in data:
            return jsonify({'error': 'nombre es requerido'}), 400
        
        producto_id = producto_modelo.crear_producto(data)
        if producto_id:
            producto = producto_modelo.obtener_producto_por_id(producto_id)
            return jsonify({'message': 'Producto creado exitosamente', 'producto': producto}), 201
        else:
            return jsonify({'error': 'Error al crear producto'}), 500
    except Exception as e:
        logger.error(f"Error al crear producto: {str(e)}")
        return jsonify({'error': f'Error al crear producto: {str(e)}'}), 500


@productos_bp.route('/<int:producto_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_producto(producto_id):
    """Actualiza un producto"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        resultado = producto_modelo.actualizar_producto(producto_id, data)
        if resultado:
            producto = producto_modelo.obtener_producto_por_id(producto_id)
            return jsonify({'message': 'Producto actualizado exitosamente', 'producto': producto}), 200
        else:
            return jsonify({'error': 'Error al actualizar producto'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar producto: {str(e)}")
        return jsonify({'error': 'Error al actualizar producto'}), 500


@productos_bp.route('/<int:producto_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_producto(producto_id):
    """Elimina (desactiva) un producto"""
    try:
        resultado = producto_modelo.eliminar_producto(producto_id)
        if resultado:
            return jsonify({'message': 'Producto eliminado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al eliminar producto'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar producto: {str(e)}")
        return jsonify({'error': 'Error al eliminar producto'}), 500


@productos_bp.route('/<int:producto_id>/stock', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_stock(producto_id):
    """Actualiza el stock de un producto"""
    try:
        data = request.get_json()
        if not data or 'cantidad' not in data:
            return jsonify({'error': 'cantidad es requerida'}), 400
        
        cantidad = data['cantidad']
        resultado = producto_modelo.actualizar_stock(producto_id, cantidad)
        if resultado:
            producto = producto_modelo.obtener_producto_por_id(producto_id)
            return jsonify({'message': 'Stock actualizado exitosamente', 'producto': producto}), 200
        else:
            return jsonify({'error': 'Error al actualizar stock'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar stock: {str(e)}")
        return jsonify({'error': 'Error al actualizar stock'}), 500
