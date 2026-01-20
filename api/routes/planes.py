"""
Rutas para gestión de planes
"""
from flask import Blueprint, request, jsonify
from modelos.plan_modelo import PlanModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

planes_bp = Blueprint('planes', __name__)
logger = obtener_logger()
plan_modelo = PlanModelo()


@planes_bp.route('', methods=['GET'])
def obtener_planes():
    """Obtiene todos los planes"""
    try:
        solo_activos = request.args.get('solo_activos', 'true').lower() == 'true'
        planes = plan_modelo.obtener_todos_planes(solo_activos=solo_activos)
        return jsonify({'planes': planes}), 200
    except Exception as e:
        logger.error(f"Error al obtener planes: {str(e)}")
        return jsonify({'error': 'Error al obtener planes'}), 500


@planes_bp.route('/<int:plan_id>', methods=['GET'])
@requiere_autenticacion
def obtener_plan(plan_id):
    """Obtiene un plan por ID"""
    try:
        plan = plan_modelo.obtener_plan_por_id(plan_id)
        if plan:
            # Obtener productos del plan
            productos = plan_modelo.obtener_productos_plan(plan_id)
            plan['productos'] = productos
            servicios = plan_modelo.obtener_servicios_plan(plan_id)
            plan['servicios'] = servicios
            return jsonify({'plan': plan}), 200
        else:
            return jsonify({'error': 'Plan no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener plan: {str(e)}")
        return jsonify({'error': 'Error al obtener plan'}), 500


@planes_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_plan():
    """Crea un nuevo plan"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        campos_requeridos = ['nombre', 'precio_base']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        plan_id = plan_modelo.crear_plan(data)
        if plan_id:
            plan = plan_modelo.obtener_plan_por_id(plan_id)
            return jsonify({'message': 'Plan creado exitosamente', 'plan': plan}), 201
        else:
            return jsonify({'error': 'Error al crear plan'}), 500
    except Exception as e:
        logger.error(f"Error al crear plan: {str(e)}")
        return jsonify({'error': f'Error al crear plan: {str(e)}'}), 500


@planes_bp.route('/<int:plan_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_plan(plan_id):
    """Actualiza un plan"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        resultado = plan_modelo.actualizar_plan(plan_id, data)
        if resultado:
            plan = plan_modelo.obtener_plan_por_id(plan_id)
            return jsonify({'message': 'Plan actualizado exitosamente', 'plan': plan}), 200
        else:
            return jsonify({'error': 'Error al actualizar plan'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar plan: {str(e)}")
        return jsonify({'error': 'Error al actualizar plan'}), 500


@planes_bp.route('/<int:plan_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_plan(plan_id):
    """Elimina (desactiva) un plan"""
    try:
        if plan_modelo.plan_tiene_eventos(plan_id):
            return jsonify({'error': 'No se puede desactivar: el plan tiene eventos asociados'}), 400
        resultado = plan_modelo.eliminar_plan(plan_id)
        if resultado:
            return jsonify({'message': 'Plan desactivado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al desactivar plan'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar plan: {str(e)}")
        return jsonify({'error': 'Error al desactivar plan'}), 500


@planes_bp.route('/<int:plan_id>/productos', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def agregar_producto_plan(plan_id):
    """Agrega un producto a un plan"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        campos_requeridos = ['producto_id', 'cantidad']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        resultado = plan_modelo.agregar_producto_plan(plan_id, data['producto_id'], data['cantidad'])
        if resultado:
            productos = plan_modelo.obtener_productos_plan(plan_id)
            return jsonify({'message': 'Producto agregado exitosamente', 'productos': productos}), 200
        else:
            return jsonify({'error': 'Error al agregar producto'}), 500
    except Exception as e:
        logger.error(f"Error al agregar producto: {str(e)}")
        return jsonify({'error': 'Error al agregar producto'}), 500


@planes_bp.route('/<int:plan_id>/productos/<int:producto_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def eliminar_producto_plan(plan_id, producto_id):
    """Elimina un producto de un plan"""
    try:
        resultado = plan_modelo.eliminar_producto_plan(plan_id, producto_id)
        if resultado:
            productos = plan_modelo.obtener_productos_plan(plan_id)
            return jsonify({'message': 'Producto eliminado exitosamente', 'productos': productos}), 200
        else:
            return jsonify({'error': 'Error al eliminar producto'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar producto: {str(e)}")
        return jsonify({'error': 'Error al eliminar producto'}), 500


@planes_bp.route('/<int:plan_id>/productos', methods=['GET'])
@requiere_autenticacion
def obtener_productos_plan(plan_id):
    """Obtiene los productos de un plan"""
    try:
        productos = plan_modelo.obtener_productos_plan(plan_id)
        return jsonify({'productos': productos}), 200
    except Exception as e:
        logger.error(f"Error al obtener productos: {str(e)}")
        return jsonify({'error': 'Error al obtener productos'}), 500


@planes_bp.route('/<int:plan_id>/servicios', methods=['GET'])
@requiere_autenticacion
def obtener_servicios_plan(plan_id):
    """Obtiene los servicios de un plan"""
    try:
        servicios = plan_modelo.obtener_servicios_plan(plan_id)
        return jsonify({'servicios': servicios}), 200
    except Exception as e:
        logger.error(f"Error al obtener servicios: {str(e)}")
        return jsonify({'error': 'Error al obtener servicios'}), 500


@planes_bp.route('/<int:plan_id>/servicios', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def reemplazar_servicios_plan(plan_id):
    """Reemplaza los servicios de un plan"""
    try:
        data = request.get_json()
        if not data or 'servicios' not in data:
            return jsonify({'error': 'servicios es requerido'}), 400
        servicios = data.get('servicios') or []
        plan_modelo.reemplazar_servicios_plan(plan_id, servicios)
        servicios_actualizados = plan_modelo.obtener_servicios_plan(plan_id)
        return jsonify({'message': 'Servicios actualizados exitosamente', 'servicios': servicios_actualizados}), 200
    except Exception as e:
        logger.error(f"Error al actualizar servicios: {str(e)}")
        return jsonify({'error': 'Error al actualizar servicios'}), 500
