"""
Rutas para gestión de clientes
"""
from flask import Blueprint, request, jsonify
from modelos.cliente_modelo import ClienteModelo
from api.middleware import requiere_autenticacion, requiere_rol, obtener_usuario_actual
from utilidades.logger import obtener_logger

clientes_bp = Blueprint('clientes', __name__)
logger = obtener_logger()
cliente_modelo = ClienteModelo()


@clientes_bp.route('', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_clientes():
    """Obtiene todos los clientes"""
    try:
        clientes = cliente_modelo.obtener_todos_clientes()
        return jsonify({'clientes': clientes}), 200
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error al obtener clientes: {error_msg}")
        # Si es un error de conexión, proporcionar un mensaje más específico
        if 'conexión' in error_msg.lower() or 'connection' in error_msg.lower() or 'mysql' in error_msg.lower():
            return jsonify({
                'error': 'Error de conexión a la base de datos',
                'message': 'Por favor, intente nuevamente en unos momentos'
            }), 500
        return jsonify({'error': 'Error al obtener clientes'}), 500


@clientes_bp.route('/<int:cliente_id>', methods=['GET'])
@requiere_autenticacion
def obtener_cliente(cliente_id):
    """Obtiene un cliente por ID"""
    try:
        cliente = cliente_modelo.obtener_cliente_por_id(cliente_id)
        if cliente:
            return jsonify({'cliente': cliente}), 200
        else:
            return jsonify({'error': 'Cliente no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener cliente: {str(e)}")
        return jsonify({'error': 'Error al obtener cliente'}), 500


@clientes_bp.route('', methods=['POST'])
def crear_cliente():
    """Crea un nuevo cliente"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        usuario_id = None
        
        # Si se proporcionan datos de usuario, crear el usuario primero
        if 'nombre_usuario' in data and 'contrasena' in data and 'nombre_completo' in data:
            from modelos.usuario_modelo import UsuarioModelo
            from modelos.autenticacion import Autenticacion
            
            usuario_modelo = UsuarioModelo()
            auth = Autenticacion()
            
            # Validar campos requeridos del usuario
            datos_usuario = {
                'nombre_usuario': data['nombre_usuario'],
                'contrasena': auth.hash_contrasena(data['contrasena']),
                'nombre_completo': data['nombre_completo'],
                'email': data.get('email'),
                'telefono': data.get('telefono'),
                'rol': 'cliente'
            }
            
            usuario_id = usuario_modelo.crear_usuario(datos_usuario)
            if not usuario_id:
                return jsonify({'error': 'Error al crear el usuario. El nombre de usuario puede estar en uso.'}), 400
        elif 'usuario_id' in data:
            usuario_id = data['usuario_id']
        else:
            return jsonify({'error': 'Se requiere usuario_id o datos de usuario (nombre_usuario, contrasena, nombre_completo)'}), 400
        
        # Crear el cliente
        datos_cliente = {
            'usuario_id': usuario_id,
            'documento_identidad': data.get('documento_identidad'),
            'direccion': data.get('direccion')
        }
        
        cliente_id = cliente_modelo.crear_cliente(datos_cliente)
        if cliente_id:
            cliente = cliente_modelo.obtener_cliente_por_id(cliente_id)
            return jsonify({'message': 'Cliente creado exitosamente', 'cliente': cliente}), 201
        else:
            return jsonify({'error': 'Error al crear cliente'}), 500
    except Exception as e:
        logger.error(f"Error al crear cliente: {str(e)}")
        return jsonify({'error': f'Error al crear cliente: {str(e)}'}), 500


@clientes_bp.route('/me', methods=['GET'])
@requiere_autenticacion
def obtener_cliente_actual():
    """Obtiene el cliente asociado al usuario autenticado"""
    try:
        usuario_actual = obtener_usuario_actual()
        if not usuario_actual:
            return jsonify({'error': 'No autenticado'}), 401
        
        cliente = cliente_modelo.obtener_cliente_por_usuario(usuario_actual['id'])
        if cliente:
            return jsonify({'cliente': cliente}), 200
        return jsonify({'cliente': None, 'message': 'Usuario sin cliente asociado'}), 200
    except Exception as e:
        logger.error(f"Error al obtener cliente actual: {str(e)}")
        return jsonify({'error': 'Error al obtener cliente'}), 500


@clientes_bp.route('/<int:cliente_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_cliente(cliente_id):
    """Actualiza un cliente"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        # Obtener el cliente actual para tener el usuario_id
        cliente_actual = cliente_modelo.obtener_cliente_por_id(cliente_id)
        if not cliente_actual:
            return jsonify({'error': 'Cliente no encontrado'}), 404
        
        usuario_id = cliente_actual.get('usuario_id')
        
        # Si se proporcionan datos del usuario, actualizarlos
        if 'nombre_completo' in data or 'email' in data or 'telefono' in data:
            from modelos.usuario_modelo import UsuarioModelo
            usuario_modelo = UsuarioModelo()
            
            # Obtener el usuario actual para preservar rol y activo
            usuario_actual = usuario_modelo.obtener_usuario_por_id(usuario_id)
            if not usuario_actual:
                return jsonify({'error': 'Usuario asociado al cliente no encontrado'}), 404
            
            # Preparar datos del usuario con los valores existentes para campos no proporcionados
            datos_usuario = {
                'nombre_completo': data.get('nombre_completo', usuario_actual.get('nombre_completo')),
                'email': data.get('email', usuario_actual.get('email')),
                'telefono': data.get('telefono', usuario_actual.get('telefono')),
                'rol': usuario_actual.get('rol', 'cliente'),  # Preservar el rol existente
                'activo': usuario_actual.get('activo', True)  # Preservar el estado activo
            }
            
            resultado_usuario = usuario_modelo.actualizar_usuario(usuario_id, datos_usuario)
            if not resultado_usuario:
                return jsonify({'error': 'Error al actualizar los datos del usuario'}), 500
        
        # Actualizar datos del cliente
        datos_cliente = {
            'documento_identidad': data.get('documento_identidad') or None,
            'direccion': data.get('direccion') or None
        }
        
        resultado = cliente_modelo.actualizar_cliente(cliente_id, datos_cliente)
        if resultado:
            cliente = cliente_modelo.obtener_cliente_por_id(cliente_id)
            return jsonify({'message': 'Cliente actualizado exitosamente', 'cliente': cliente}), 200
        else:
            return jsonify({'error': 'Error al actualizar cliente'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar cliente: {str(e)}")
        return jsonify({'error': 'Error al actualizar cliente'}), 500


@clientes_bp.route('/<int:cliente_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_cliente(cliente_id):
    """Elimina un cliente"""
    try:
        # Verificar si el cliente existe
        cliente = cliente_modelo.obtener_cliente_por_id(cliente_id)
        if not cliente:
            return jsonify({'error': 'Cliente no encontrado'}), 404
        
        # Verificar si el cliente tiene eventos asociados
        from modelos.evento_modelo import EventoModelo
        evento_modelo = EventoModelo()
        eventos = evento_modelo.obtener_eventos_por_cliente(cliente_id)
        
        if eventos and len(eventos) > 0:
            return jsonify({
                'error': 'No se puede eliminar el cliente porque tiene eventos asociados',
                'eventos_count': len(eventos)
            }), 400
        
        # Eliminar el cliente (y opcionalmente el usuario asociado)
        resultado = cliente_modelo.eliminar_cliente(cliente_id)
        if resultado:
            return jsonify({'message': 'Cliente eliminado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al eliminar cliente'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar cliente: {str(e)}")
        return jsonify({'error': 'Error al eliminar cliente'}), 500
