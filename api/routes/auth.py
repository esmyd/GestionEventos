"""
Rutas de autenticación
"""
from flask import Blueprint, request, jsonify
from modelos.autenticacion import Autenticacion
from modelos.usuario_modelo import UsuarioModelo
from modelos.permiso_modelo import PermisoModelo
from api.jwt_utils import generar_token, verificar_token
from utilidades.logger import obtener_logger

auth_bp = Blueprint('auth', __name__)
logger = obtener_logger()
auth = Autenticacion()
usuario_modelo = UsuarioModelo()
permiso_modelo = PermisoModelo()


@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para iniciar sesión"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        nombre_usuario = data.get('nombre_usuario')
        contrasena = data.get('contrasena')
        
        if not nombre_usuario or not contrasena:
            return jsonify({'error': 'Usuario y contraseña requeridos'}), 400
        
        usuario = auth.iniciar_sesion(nombre_usuario, contrasena)
        
        if usuario:
            # No retornar la contraseña
            permisos = permiso_modelo.obtener_permisos_usuario(usuario['id'])
            if not permisos:
                permisos = permiso_modelo.obtener_permisos_rol(usuario['rol'])
            usuario_response = {
                'id': usuario['id'],
                'nombre_usuario': usuario['nombre_usuario'],
                'nombre_completo': usuario['nombre_completo'],
                'email': usuario.get('email'),
                'telefono': usuario.get('telefono'),
                'rol': usuario['rol'],
                'activo': usuario.get('activo', True)
            }
            if permisos is not None:
                usuario_response['permisos'] = permisos
            
            # Generar JWT token
            try:
                token = generar_token(usuario)
            except Exception as e:
                logger.error(f"Error al generar token: {str(e)}")
                return jsonify({'error': 'Error al generar token de autenticación'}), 500
            
            logger.info(f"Login exitoso para usuario: {nombre_usuario}")
            return jsonify({
                'success': True,
                'message': 'Login exitoso',
                'token': token,
                'usuario': usuario_response
            }), 200
        else:
            logger.warning(f"Intento de login fallido para usuario: {nombre_usuario}")
            return jsonify({'error': 'Credenciales inválidas'}), 401
    
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return jsonify({'error': 'Error al procesar la solicitud'}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Endpoint para cerrar sesión"""
    try:
        # Con JWT, el logout es principalmente del lado del cliente
        # (el cliente simplemente descarta el token)
        # Aquí podríamos implementar una blacklist de tokens si se requiere
        return jsonify({'success': True, 'message': 'Sesión cerrada exitosamente'}), 200
    except Exception as e:
        logger.error(f"Error en logout: {str(e)}")
        return jsonify({'error': 'Error al cerrar sesión'}), 500


@auth_bp.route('/verificar', methods=['GET'])
def verificar():
    """Endpoint para verificar el estado de autenticación usando JWT token"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'authenticated': False, 'error': 'Token requerido'}), 401
        
        # Extraer token
        token = None
        try:
            parts = auth_header.split(' ')
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
        except:
            pass
        
        if not token:
            return jsonify({'authenticated': False, 'error': 'Formato de token inválido'}), 401
        
        # Verificar token
        payload = verificar_token(token)
        if not payload:
            return jsonify({'authenticated': False, 'error': 'Token inválido o expirado'}), 401
        
        # Obtener datos del usuario desde la base de datos
        usuario = usuario_modelo.obtener_usuario_por_id(payload['user_id'])
        if not usuario:
            return jsonify({'authenticated': False, 'error': 'Usuario no encontrado'}), 401
        
        permisos = permiso_modelo.obtener_permisos_usuario(usuario['id'])
        if not permisos:
            permisos = permiso_modelo.obtener_permisos_rol(usuario['rol'])
        usuario_response = {
            'id': usuario['id'],
            'nombre_usuario': usuario['nombre_usuario'],
            'nombre_completo': usuario['nombre_completo'],
            'email': usuario.get('email'),
            'telefono': usuario.get('telefono'),
            'rol': usuario['rol']
        }
        if permisos is not None:
            usuario_response['permisos'] = permisos
        
        return jsonify({'authenticated': True, 'usuario': usuario_response}), 200
    
    except Exception as e:
        logger.error(f"Error en verificar: {str(e)}")
        return jsonify({'authenticated': False, 'error': 'Error al verificar token'}), 500
