"""
Rutas para gestión de usuarios
"""
from flask import Blueprint, request, jsonify
from modelos.usuario_modelo import UsuarioModelo
from modelos.permiso_modelo import PermisoModelo
from api.middleware import requiere_autenticacion, requiere_rol, obtener_usuario_actual
from utilidades.logger import obtener_logger

usuarios_bp = Blueprint('usuarios', __name__)
logger = obtener_logger()
usuario_modelo = UsuarioModelo()
permiso_modelo = PermisoModelo()


@usuarios_bp.route('', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def obtener_usuarios():
    """Obtiene todos los usuarios"""
    try:
        filtro_rol = request.args.get('rol')
        usuarios = usuario_modelo.obtener_todos_usuarios(filtro_rol=filtro_rol)
        
        # Limpiar contraseñas de la respuesta
        usuarios_limpios = []
        for usuario in usuarios:
            usuarios_limpios.append({
                'id': usuario['id'],
                'nombre_usuario': usuario['nombre_usuario'],
                'nombre_completo': usuario['nombre_completo'],
                'email': usuario.get('email'),
                'telefono': usuario.get('telefono'),
                'rol': usuario['rol'],
                'activo': usuario.get('activo', True),
                'fecha_creacion': str(usuario.get('fecha_creacion', '')),
                'fecha_ultimo_acceso': str(usuario.get('fecha_ultimo_acceso', ''))
            })
        
        return jsonify({'usuarios': usuarios_limpios}), 200
    except Exception as e:
        logger.error(f"Error al obtener usuarios: {str(e)}")
        return jsonify({'error': 'Error al obtener usuarios'}), 500


@usuarios_bp.route('/<int:usuario_id>', methods=['GET'])
@requiere_autenticacion
def obtener_usuario(usuario_id):
    """Obtiene un usuario por ID"""
    try:
        usuario_actual = obtener_usuario_actual()
        # Los usuarios solo pueden ver su propio perfil, excepto admin/gerente
        if usuario_actual['rol'] not in ['administrador', 'gerente_general'] and usuario_actual['id'] != usuario_id:
            return jsonify({'error': 'No autorizado'}), 403
        
        usuario = usuario_modelo.obtener_usuario_por_id(usuario_id)
        if usuario:
            usuario_limpio = {
                'id': usuario['id'],
                'nombre_usuario': usuario['nombre_usuario'],
                'nombre_completo': usuario['nombre_completo'],
                'email': usuario.get('email'),
                'telefono': usuario.get('telefono'),
                'rol': usuario['rol'],
                'activo': usuario.get('activo', True),
                'fecha_creacion': str(usuario.get('fecha_creacion', '')),
                'fecha_ultimo_acceso': str(usuario.get('fecha_ultimo_acceso', ''))
            }
            return jsonify({'usuario': usuario_limpio}), 200
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener usuario: {str(e)}")
        return jsonify({'error': 'Error al obtener usuario'}), 500


@usuarios_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador')
def crear_usuario():
    """Crea un nuevo usuario"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        # Validar campos requeridos
        campos_requeridos = ['nombre_usuario', 'contrasena', 'nombre_completo', 'rol']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        # Hash de contraseña
        from modelos.autenticacion import Autenticacion
        auth = Autenticacion()
        data['contrasena'] = auth.hash_contrasena(data['contrasena'])
        
        usuario_id = usuario_modelo.crear_usuario(data)
        if usuario_id:
            usuario = usuario_modelo.obtener_usuario_por_id(usuario_id)
            usuario_limpio = {
                'id': usuario['id'],
                'nombre_usuario': usuario['nombre_usuario'],
                'nombre_completo': usuario['nombre_completo'],
                'email': usuario.get('email'),
                'telefono': usuario.get('telefono'),
                'rol': usuario['rol']
            }
            return jsonify({'message': 'Usuario creado exitosamente', 'usuario': usuario_limpio}), 201
        else:
            return jsonify({'error': 'Error al crear usuario'}), 500
    except Exception as e:
        logger.error(f"Error al crear usuario: {str(e)}")
        return jsonify({'error': f'Error al crear usuario: {str(e)}'}), 500


@usuarios_bp.route('/<int:usuario_id>', methods=['PUT'])
@requiere_autenticacion
def actualizar_usuario(usuario_id):
    """Actualiza un usuario"""
    try:
        usuario_actual = obtener_usuario_actual()
        # Los usuarios solo pueden actualizar su propio perfil, excepto admin/gerente
        if usuario_actual['rol'] not in ['administrador', 'gerente_general'] and usuario_actual['id'] != usuario_id:
            return jsonify({'error': 'No autorizado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        # No permitir cambiar rol si no es admin
        if usuario_actual['rol'] not in ['administrador', 'gerente_general']:
            data.pop('rol', None)
        
        resultado = usuario_modelo.actualizar_usuario(usuario_id, data)
        if resultado:
            usuario = usuario_modelo.obtener_usuario_por_id(usuario_id)
            usuario_limpio = {
                'id': usuario['id'],
                'nombre_usuario': usuario['nombre_usuario'],
                'nombre_completo': usuario['nombre_completo'],
                'email': usuario.get('email'),
                'telefono': usuario.get('telefono'),
                'rol': usuario['rol'],
                'activo': usuario.get('activo', True)
            }
            return jsonify({'message': 'Usuario actualizado exitosamente', 'usuario': usuario_limpio}), 200
        else:
            return jsonify({'error': 'Error al actualizar usuario'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar usuario: {str(e)}")
        return jsonify({'error': 'Error al actualizar usuario'}), 500


@usuarios_bp.route('/<int:usuario_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador')
def eliminar_usuario(usuario_id):
    """Elimina (desactiva) un usuario"""
    try:
        resultado = usuario_modelo.eliminar_usuario(usuario_id)
        if resultado:
            return jsonify({'message': 'Usuario eliminado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al eliminar usuario'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar usuario: {str(e)}")
        return jsonify({'error': 'Error al eliminar usuario'}), 500


@usuarios_bp.route('/<int:usuario_id>/cambiar-contrasena', methods=['POST'])
@requiere_autenticacion
def cambiar_contrasena(usuario_id):
    """Cambia la contraseña de un usuario"""
    try:
        usuario_actual = obtener_usuario_actual()
        # Los usuarios solo pueden cambiar su propia contraseña, excepto admin
        if usuario_actual['rol'] != 'administrador' and usuario_actual['id'] != usuario_id:
            return jsonify({'error': 'No autorizado'}), 403
        
        data = request.get_json()
        if not data or 'nueva_contrasena' not in data:
            return jsonify({'error': 'Nueva contraseña requerida'}), 400
        
        resultado = usuario_modelo.cambiar_contrasena(usuario_id, data['nueva_contrasena'])
        if resultado:
            return jsonify({'message': 'Contraseña cambiada exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al cambiar contraseña'}), 500
    except Exception as e:
        logger.error(f"Error al cambiar contraseña: {str(e)}")
        return jsonify({'error': 'Error al cambiar contraseña'}), 500


@usuarios_bp.route('/<int:usuario_id>/permisos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador')
def obtener_permisos_usuario(usuario_id):
    """Obtiene permisos por usuario"""
    try:
        permisos = permiso_modelo.obtener_permisos_usuario(usuario_id)
        return jsonify({'permisos': permisos or []}), 200
    except Exception as e:
        logger.error(f"Error al obtener permisos: {str(e)}")
        return jsonify({'error': 'Error al obtener permisos'}), 500


@usuarios_bp.route('/<int:usuario_id>/permisos', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador')
def actualizar_permisos_usuario(usuario_id):
    """Actualiza permisos por usuario"""
    try:
        data = request.get_json()
        permisos = data.get('permisos') if data else None
        if permisos is None or not isinstance(permisos, list):
            return jsonify({'error': 'Se requiere una lista de permisos'}), 400
        
        resultado = permiso_modelo.guardar_permisos_usuario(usuario_id, permisos)
        if resultado:
            return jsonify({'message': 'Permisos actualizados exitosamente'}), 200
        return jsonify({'error': 'Error al actualizar permisos'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar permisos: {str(e)}")
        return jsonify({'error': 'Error al actualizar permisos'}), 500


@usuarios_bp.route('/<int:usuario_id>/permisos', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador')
def eliminar_permisos_usuario(usuario_id):
    """Elimina permisos personalizados para usar los del rol"""
    try:
        resultado = permiso_modelo.eliminar_permisos_usuario(usuario_id)
        if resultado:
            return jsonify({'message': 'Permisos eliminados exitosamente'}), 200
        return jsonify({'error': 'Error al eliminar permisos'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar permisos: {str(e)}")
        return jsonify({'error': 'Error al eliminar permisos'}), 500


@usuarios_bp.route('/roles', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador')
def obtener_roles():
    """Obtiene los roles disponibles"""
    try:
        roles = usuario_modelo.obtener_roles_disponibles()
        return jsonify({'roles': roles}), 200
    except Exception as e:
        logger.error(f"Error al obtener roles: {str(e)}")
        return jsonify({'error': 'Error al obtener roles'}), 500


@usuarios_bp.route('/roles/<string:rol>/permisos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador')
def obtener_permisos_rol(rol):
    """Obtiene permisos por rol"""
    try:
        permisos = permiso_modelo.obtener_permisos_rol(rol)
        return jsonify({'permisos': permisos or []}), 200
    except Exception as e:
        logger.error(f"Error al obtener permisos de rol: {str(e)}")
        return jsonify({'error': 'Error al obtener permisos de rol'}), 500


@usuarios_bp.route('/roles/<string:rol>/permisos', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador')
def actualizar_permisos_rol(rol):
    """Actualiza permisos por rol"""
    try:
        data = request.get_json()
        permisos = data.get('permisos') if data else None
        if permisos is None or not isinstance(permisos, list):
            return jsonify({'error': 'Se requiere una lista de permisos'}), 400

        resultado = permiso_modelo.guardar_permisos_rol(rol, permisos)
        if resultado:
            return jsonify({'message': 'Permisos de rol actualizados exitosamente'}), 200
        return jsonify({'error': 'Error al actualizar permisos de rol'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar permisos de rol: {str(e)}")
        return jsonify({'error': 'Error al actualizar permisos de rol'}), 500


@usuarios_bp.route('/roles/<string:rol>/permisos', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador')
def eliminar_permisos_rol(rol):
    """Elimina permisos personalizados para usar los del rol"""
    try:
        resultado = permiso_modelo.eliminar_permisos_rol(rol)
        if resultado:
            return jsonify({'message': 'Permisos de rol eliminados exitosamente'}), 200
        return jsonify({'error': 'Error al eliminar permisos de rol'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar permisos de rol: {str(e)}")
        return jsonify({'error': 'Error al eliminar permisos de rol'}), 500
