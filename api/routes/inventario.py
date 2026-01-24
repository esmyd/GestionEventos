"""
Rutas para gestión de inventario
"""
from flask import Blueprint, request, jsonify
from modelos.inventario_modelo import InventarioModelo
from modelos.producto_modelo import ProductoModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

inventario_bp = Blueprint('inventario', __name__)
logger = obtener_logger()
inventario_modelo = InventarioModelo()
producto_modelo = ProductoModelo()


@inventario_bp.route('', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_inventario():
    """Obtiene movimientos de inventario para un evento o productos con stock bajo"""
    try:
        evento_id = request.args.get('evento_id', type=int)
        
        if evento_id:
            # Obtener movimientos de inventario para un evento específico
            movimientos = inventario_modelo.obtener_movimientos_evento(evento_id)
            return jsonify({'inventario': movimientos, 'movimientos': movimientos}), 200
        else:
            # Si no se especifica evento_id, retornar productos con stock bajo
            productos = inventario_modelo.obtener_productos_stock_bajo()
            return jsonify({'productos': productos}), 200
    except Exception as e:
        logger.error(f"Error al obtener inventario: {str(e)}")
        return jsonify({'error': 'Error al obtener inventario'}), 500


@inventario_bp.route('/stock-bajo', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_productos_stock_bajo():
    """Obtiene productos con stock bajo o agotado"""
    try:
        productos = inventario_modelo.obtener_productos_stock_bajo()
        return jsonify({'productos': productos}), 200
    except Exception as e:
        logger.error(f"Error al obtener productos con stock bajo: {str(e)}")
        return jsonify({'error': 'Error al obtener productos con stock bajo'}), 500


@inventario_bp.route('/validar-stock', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def validar_stock():
    """Valida si hay stock suficiente para un producto"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        producto_id = data.get('producto_id')
        cantidad = data.get('cantidad', 1)
        
        if not producto_id:
            return jsonify({'error': 'producto_id es requerido'}), 400
        
        ok, error = inventario_modelo.validar_stock_suficiente(producto_id, cantidad)
        
        if ok:
            return jsonify({'valido': True}), 200
        else:
            return jsonify({'valido': False, 'error': error}), 200
    except Exception as e:
        logger.error(f"Error al validar stock: {str(e)}")
        return jsonify({'error': 'Error al validar stock'}), 500


@inventario_bp.route('/validar-stock-plan', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def validar_stock_plan():
    """Valida si hay stock suficiente para todos los productos de un plan"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        plan_id = data.get('plan_id')
        cantidad_eventos = data.get('cantidad_eventos', 1)
        
        if not plan_id:
            return jsonify({'error': 'plan_id es requerido'}), 400
        
        ok, productos_insuficientes = inventario_modelo.validar_stock_plan(plan_id, cantidad_eventos)
        
        if ok:
            return jsonify({'valido': True}), 200
        else:
            return jsonify({
                'valido': False,
                'productos_insuficientes': productos_insuficientes
            }), 200
    except Exception as e:
        logger.error(f"Error al validar stock del plan: {str(e)}")
        return jsonify({'error': 'Error al validar stock del plan'}), 500


@inventario_bp.route('/evento/<int:evento_id>/movimientos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_movimientos_evento(evento_id):
    """Obtiene todos los movimientos de inventario para un evento"""
    try:
        movimientos = inventario_modelo.obtener_movimientos_evento(evento_id)
        return jsonify({'movimientos': movimientos}), 200
    except Exception as e:
        logger.error(f"Error al obtener movimientos de inventario: {str(e)}")
        return jsonify({'error': 'Error al obtener movimientos de inventario'}), 500


@inventario_bp.route('/producto/<int:producto_id>/stock', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_stock_producto(producto_id):
    """Obtiene el stock disponible de un producto"""
    try:
        stock = inventario_modelo.obtener_stock_disponible(producto_id)
        if not stock:
            return jsonify({'error': 'Producto no encontrado'}), 404
        return jsonify({'stock': stock}), 200
    except Exception as e:
        logger.error(f"Error al obtener stock del producto: {str(e)}")
        return jsonify({'error': 'Error al obtener stock del producto'}), 500
