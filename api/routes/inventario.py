"""
Rutas para gestión de inventario
"""
from flask import Blueprint, request, jsonify
from modelos.inventario_modelo import InventarioModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

inventario_bp = Blueprint('inventario', __name__)
logger = obtener_logger()
inventario_modelo = InventarioModelo()


@inventario_bp.route('', methods=['GET'])
@requiere_autenticacion
def obtener_inventario():
    """Obtiene registros de inventario (filtrados por evento o producto)"""
    try:
        evento_id = request.args.get('evento_id')
        producto_id = request.args.get('producto_id')
        
        if evento_id:
            inventario = inventario_modelo.obtener_inventario_por_evento(int(evento_id))
        elif producto_id:
            inventario = inventario_modelo.obtener_inventario_por_producto(int(producto_id))
        else:
            return jsonify({'error': 'evento_id o producto_id es requerido'}), 400
        
        return jsonify({'inventario': inventario}), 200
    except Exception as e:
        logger.error(f"Error al obtener inventario: {str(e)}")
        return jsonify({'error': 'Error al obtener inventario'}), 500


@inventario_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_registro_inventario():
    """Crea un nuevo registro de inventario"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        campos_requeridos = ['producto_id', 'cantidad_solicitada']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        inventario_id = inventario_modelo.crear_registro_inventario(data)
        if inventario_id:
            return jsonify({'message': 'Registro de inventario creado exitosamente', 'id': inventario_id}), 201
        else:
            return jsonify({'error': 'Error al crear registro de inventario'}), 500
    except Exception as e:
        logger.error(f"Error al crear registro de inventario: {str(e)}")
        return jsonify({'error': f'Error al crear registro de inventario: {str(e)}'}), 500


@inventario_bp.route('/<int:inventario_id>/estado', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_estado_inventario(inventario_id):
    """Actualiza el estado de un registro de inventario"""
    try:
        data = request.get_json()
        if not data or 'estado' not in data:
            return jsonify({'error': 'estado es requerido'}), 400
        
        nuevo_estado = data['estado']
        cantidad_utilizada = data.get('cantidad_utilizada')
        
        resultado = inventario_modelo.actualizar_estado_inventario(
            inventario_id,
            nuevo_estado,
            cantidad_utilizada
        )
        if resultado:
            return jsonify({'message': 'Estado actualizado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al actualizar estado'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar estado: {str(e)}")
        return jsonify({'error': 'Error al actualizar estado'}), 500


@inventario_bp.route('/<int:inventario_id>/devolucion', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def registrar_devolucion(inventario_id):
    """Registra la devolución de un producto"""
    try:
        data = request.get_json()
        if not data or 'fecha_devolucion' not in data:
            return jsonify({'error': 'fecha_devolucion es requerida'}), 400
        
        fecha_devolucion = data['fecha_devolucion']
        resultado = inventario_modelo.registrar_devolucion(inventario_id, fecha_devolucion)
        if resultado:
            return jsonify({'message': 'Devolución registrada exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al registrar devolución'}), 500
    except Exception as e:
        logger.error(f"Error al registrar devolución: {str(e)}")
        return jsonify({'error': 'Error al registrar devolución'}), 500


@inventario_bp.route('/verificar-disponibilidad', methods=['POST'])
@requiere_autenticacion
def verificar_disponibilidad():
    """Verifica la disponibilidad de un producto para una fecha"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        campos_requeridos = ['producto_id', 'cantidad', 'fecha_evento']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        disponible = inventario_modelo.verificar_disponibilidad(
            data['producto_id'],
            data['cantidad'],
            data['fecha_evento']
        )
        return jsonify({'disponible': disponible}), 200
    except Exception as e:
        logger.error(f"Error al verificar disponibilidad: {str(e)}")
        return jsonify({'error': 'Error al verificar disponibilidad'}), 500
