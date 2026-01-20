"""
Middleware para autenticación y autorización con JWT
"""
from functools import wraps
from flask import request, jsonify
from modelos.usuario_modelo import UsuarioModelo
from api.jwt_utils import verificar_token, extraer_token_del_header
from utilidades.logger import obtener_logger

logger = obtener_logger()
usuario_modelo = UsuarioModelo()


def requiere_autenticacion(f):
    """Decorador para requerir autenticación usando JWT tokens"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Obtener token del header Authorization
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'error': 'Token requerido',
                'message': 'Use Bearer Token: Authorization: Bearer <token>'
            }), 401
        
        # Extraer token
        token = extraer_token_del_header(auth_header)
        
        if not token:
            return jsonify({
                'error': 'Formato de token inválido',
                'message': 'Use Bearer Token: Authorization: Bearer <token>'
            }), 401
        
        # Verificar token
        payload = verificar_token(token)
        if not payload:
            return jsonify({
                'error': 'Token inválido o expirado',
                'message': 'Por favor, inicie sesión nuevamente'
            }), 401
        
        # Obtener usuario desde la base de datos
        try:
            usuario = usuario_modelo.obtener_usuario_por_id(payload['user_id'])
            if not usuario:
                return jsonify({'error': 'Usuario no encontrado'}), 401
            
            # Verificar que el usuario esté activo
            if not usuario.get('activo', True):
                return jsonify({'error': 'Usuario inactivo'}), 401
            
            # Agregar usuario al request
            request.usuario_actual = usuario
            request.token_payload = payload
            
            return f(*args, **kwargs)
        
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error al obtener usuario: {error_msg}")
            # Si es un error de conexión a la base de datos, retornar 500
            if 'conexión' in error_msg.lower() or 'connection' in error_msg.lower() or 'mysql' in error_msg.lower():
                return jsonify({
                    'error': 'Error de conexión a la base de datos',
                    'message': 'Por favor, intente nuevamente en unos momentos'
                }), 500
            # Para otros errores, también retornar 500
            return jsonify({'error': 'Error al verificar autenticación'}), 500
    
    return decorated_function


def requiere_rol(*roles_permitidos):
    """Decorador para requerir roles específicos"""
    def decorator(f):
        @wraps(f)
        @requiere_autenticacion
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'usuario_actual'):
                return jsonify({'error': 'No autenticado'}), 401
            
            rol_usuario = request.usuario_actual.get('rol')
            if rol_usuario not in roles_permitidos:
                # Verificar permisos jerárquicos
                roles_permisos = {
                    'administrador': ['administrador', 'coordinador', 'gerente_general', 'cliente'],
                    'gerente_general': ['gerente_general', 'administrador'],
                    'coordinador': ['coordinador'],
                    'cliente': ['cliente']
                }
                
                permisos_usuario = roles_permisos.get(rol_usuario, [])
                tiene_permiso = any(rol in permisos_usuario for rol in roles_permitidos)
                
                if not tiene_permiso:
                    return jsonify({'error': 'Permisos insuficientes'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def obtener_usuario_actual():
    """Helper para obtener el usuario actual del request"""
    return getattr(request, 'usuario_actual', None)
