"""
Rutas para gestión de opciones de productos
"""
from flask import Blueprint, request, jsonify, g
from modelos.producto_opcion_modelo import ProductoOpcionModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

producto_opciones_bp = Blueprint('producto_opciones', __name__)
logger = obtener_logger()
opcion_modelo = ProductoOpcionModelo()


# ==========================================
# RUTAS PARA OPCIONES DE PRODUCTOS
# ==========================================

@producto_opciones_bp.route('/productos/<int:producto_id>/opciones', methods=['GET'])
@requiere_autenticacion
def obtener_opciones_producto(producto_id):
    """Obtiene las opciones de un producto"""
    try:
        opciones = opcion_modelo.obtener_opciones_producto(producto_id)
        return jsonify({
            'opciones': opciones,
            'total': len(opciones)
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener opciones del producto {producto_id}: {str(e)}")
        return jsonify({'error': 'Error al obtener opciones'}), 500


@producto_opciones_bp.route('/productos/<int:producto_id>/opciones', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_opcion_producto(producto_id):
    """Crea una nueva opción para un producto
    
    Body JSON:
        - nombre_grupo: string (requerido) - Ej: "Tipo de Arroz"
        - opciones: string (requerido) - Opciones separadas por | Ej: "Moro|Blanco|Con choclo"
        - permite_multiple: bool (default: false)
        - requerido: bool (default: true)
        - orden: int (default: 0)
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if not data.get('nombre_grupo'):
            return jsonify({'error': 'El nombre del grupo es requerido'}), 400
        
        if not data.get('opciones'):
            return jsonify({'error': 'Las opciones son requeridas'}), 400
        
        data['producto_id'] = producto_id
        
        opcion_id = opcion_modelo.crear_opcion(data)
        if opcion_id:
            # Marcar producto como que requiere confirmación
            opcion_modelo.marcar_producto_requiere_confirmacion(producto_id, True)
            
            opcion = opcion_modelo.obtener_opcion_por_id(opcion_id)
            return jsonify({
                'message': 'Opción creada exitosamente',
                'opcion': opcion
            }), 201
        else:
            return jsonify({'error': 'Error al crear opción'}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error al crear opción para producto {producto_id}: {str(e)}")
        return jsonify({'error': f'Error al crear opción: {str(e)}'}), 500


@producto_opciones_bp.route('/opciones/<int:opcion_id>', methods=['GET'])
@requiere_autenticacion
def obtener_opcion(opcion_id):
    """Obtiene una opción por ID"""
    try:
        opcion = opcion_modelo.obtener_opcion_por_id(opcion_id)
        if opcion:
            return jsonify({'opcion': opcion}), 200
        else:
            return jsonify({'error': 'Opción no encontrada'}), 404
    except Exception as e:
        logger.error(f"Error al obtener opción {opcion_id}: {str(e)}")
        return jsonify({'error': 'Error al obtener opción'}), 500


@producto_opciones_bp.route('/opciones/<int:opcion_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_opcion(opcion_id):
    """Actualiza una opción existente"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if opcion_modelo.actualizar_opcion(opcion_id, data):
            opcion = opcion_modelo.obtener_opcion_por_id(opcion_id)
            return jsonify({
                'message': 'Opción actualizada exitosamente',
                'opcion': opcion
            }), 200
        else:
            return jsonify({'error': 'Error al actualizar opción'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar opción {opcion_id}: {str(e)}")
        return jsonify({'error': f'Error al actualizar opción: {str(e)}'}), 500


@producto_opciones_bp.route('/opciones/<int:opcion_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_opcion(opcion_id):
    """Elimina (desactiva) una opción"""
    try:
        # Obtener producto_id antes de eliminar
        opcion = opcion_modelo.obtener_opcion_por_id(opcion_id)
        if not opcion:
            return jsonify({'error': 'Opción no encontrada'}), 404
        
        permanente = request.args.get('permanente', 'false').lower() == 'true'
        
        if permanente:
            if opcion_modelo.eliminar_opcion_permanente(opcion_id):
                # Verificar si el producto aún tiene opciones
                opciones_restantes = opcion_modelo.obtener_opciones_producto(opcion['producto_id'])
                if not opciones_restantes:
                    opcion_modelo.marcar_producto_requiere_confirmacion(opcion['producto_id'], False)
                
                return jsonify({'message': 'Opción eliminada permanentemente'}), 200
        else:
            if opcion_modelo.eliminar_opcion(opcion_id):
                return jsonify({'message': 'Opción desactivada exitosamente'}), 200
        
        return jsonify({'error': 'Error al eliminar opción'}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error al eliminar opción {opcion_id}: {str(e)}")
        return jsonify({'error': f'Error al eliminar opción: {str(e)}'}), 500


# ==========================================
# RUTAS PARA SELECCIONES DE EVENTOS
# ==========================================

@producto_opciones_bp.route('/eventos/<int:evento_id>/selecciones', methods=['GET'])
@requiere_autenticacion
def obtener_selecciones_evento(evento_id):
    """Obtiene las selecciones de opciones de un evento"""
    try:
        selecciones = opcion_modelo.obtener_selecciones_evento(evento_id)
        return jsonify({
            'selecciones': selecciones,
            'total': len(selecciones)
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener selecciones del evento {evento_id}: {str(e)}")
        return jsonify({'error': 'Error al obtener selecciones'}), 500


@producto_opciones_bp.route('/eventos/<int:evento_id>/opciones-pendientes', methods=['GET'])
@requiere_autenticacion
def obtener_opciones_pendientes(evento_id):
    """Obtiene las opciones pendientes de confirmación de un evento"""
    try:
        pendientes = opcion_modelo.obtener_opciones_pendientes_evento(evento_id)
        return jsonify({
            'pendientes': pendientes,
            'total': len(pendientes)
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener opciones pendientes del evento {evento_id}: {str(e)}")
        return jsonify({'error': 'Error al obtener opciones pendientes'}), 500


@producto_opciones_bp.route('/eventos/<int:evento_id>/resumen-confirmaciones', methods=['GET'])
@requiere_autenticacion
def obtener_resumen_confirmaciones(evento_id):
    """Obtiene resumen de confirmaciones de un evento"""
    try:
        resumen = opcion_modelo.obtener_resumen_confirmaciones_evento(evento_id)
        return jsonify(resumen), 200
    except Exception as e:
        logger.error(f"Error al obtener resumen del evento {evento_id}: {str(e)}")
        return jsonify({'error': 'Error al obtener resumen'}), 500


@producto_opciones_bp.route('/eventos/<int:evento_id>/selecciones', methods=['POST'])
@requiere_autenticacion
def guardar_seleccion(evento_id):
    """Guarda una selección de opción para un evento
    
    Body JSON:
        - opcion_id: int (requerido)
        - seleccion: string (requerido) - Puede ser múltiple separado por |
        - cantidad: int (opcional)
        - observaciones: string (opcional)
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if not data.get('opcion_id'):
            return jsonify({'error': 'El ID de la opción es requerido'}), 400
        
        if not data.get('seleccion'):
            return jsonify({'error': 'La selección es requerida'}), 400
        
        data['evento_id'] = evento_id
        data['confirmado_por'] = g.usuario_actual.get('id') if hasattr(g, 'usuario_actual') else None
        
        seleccion_id = opcion_modelo.guardar_seleccion(data)
        if seleccion_id:
            selecciones = opcion_modelo.obtener_selecciones_evento(evento_id)
            return jsonify({
                'message': 'Selección guardada exitosamente',
                'seleccion_id': seleccion_id,
                'selecciones': selecciones
            }), 201
        else:
            return jsonify({'error': 'Error al guardar selección'}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error al guardar selección para evento {evento_id}: {str(e)}")
        return jsonify({'error': f'Error al guardar selección: {str(e)}'}), 500


@producto_opciones_bp.route('/selecciones/<int:seleccion_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def eliminar_seleccion(seleccion_id):
    """Elimina una selección"""
    try:
        if opcion_modelo.eliminar_seleccion(seleccion_id):
            return jsonify({'message': 'Selección eliminada exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al eliminar selección'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar selección {seleccion_id}: {str(e)}")
        return jsonify({'error': f'Error al eliminar selección: {str(e)}'}), 500


# ==========================================
# RUTAS AUXILIARES
# ==========================================

@producto_opciones_bp.route('/productos-con-opciones', methods=['GET'])
@requiere_autenticacion
def obtener_productos_con_opciones():
    """Obtiene todos los productos que tienen opciones configuradas"""
    try:
        productos = opcion_modelo.obtener_productos_con_opciones()
        return jsonify({
            'productos': productos,
            'total': len(productos)
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener productos con opciones: {str(e)}")
        return jsonify({'error': 'Error al obtener productos'}), 500
