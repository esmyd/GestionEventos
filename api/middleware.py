"""
Middleware para autenticación y autorización con JWT
Incluye control de acceso a módulos según plan de suscripción
"""
from functools import wraps
from flask import request, jsonify
from modelos.usuario_modelo import UsuarioModelo
from modelos.permiso_modelo import PermisoModelo
from api.jwt_utils import verificar_token, extraer_token_del_header
from utilidades.logger import obtener_logger

logger = obtener_logger()
usuario_modelo = UsuarioModelo()
permiso_modelo = PermisoModelo()

# Cache para módulos (evitar consultas repetidas)
_cache_modulos = {}
_cache_timestamp = 0


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
                # Verificar permisos jerárquicos (administrador_sistema no hereda de nadie)
                roles_permisos = {
                    'administrador_sistema': ['administrador_sistema'],
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


def _cargar_permisos_usuario(usuario_id, rol):
    """Permisos efectivos: del usuario si tiene asignados; si no, del rol (herencia)."""
    return permiso_modelo.obtener_permisos_efectivos(usuario_id, rol)


# Rol que siempre tiene acceso cuando el rol no tiene permisos definidos en BD (red de seguridad).
ROL_FALLBACK_SIN_PERMISOS_BD = 'administrador_sistema'


def requiere_permiso(*codigos_permiso):
    """
    Autorización dinámica desde BD (rol_permisos / usuario_permisos).
    Permite acceso si el usuario tiene al menos uno de los códigos en sus permisos.
    Si el rol no tiene permisos definidos en BD, solo se permite al rol administrador_sistema.
    No se queman roles en código: quién puede acceder se define en Roles y Permisos.
    Uso: @requiere_permiso('clientes')  o  @requiere_permiso('clientes', 'clientes:crear')
    """
    if not codigos_permiso:
        raise ValueError("requiere_permiso: al menos un código de permiso/módulo")

    def decorator(f):
        @wraps(f)
        @requiere_autenticacion
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'usuario_actual'):
                return jsonify({'error': 'No autenticado'}), 401

            usuario = request.usuario_actual
            usuario_id = usuario.get('id')
            rol = usuario.get('rol')
            permisos = _cargar_permisos_usuario(usuario_id, rol)

            if permisos is not None and len(permisos) > 0:
                # Permisos definidos en BD: permitir si tiene al menos uno de los códigos
                if any(cod in permisos for cod in codigos_permiso):
                    return f(*args, **kwargs)
                return jsonify({'error': 'Permisos insuficientes'}), 403

            # Sin permisos en BD: solo permitir administrador_sistema (red de seguridad)
            if rol == ROL_FALLBACK_SIN_PERMISOS_BD:
                return f(*args, **kwargs)
            return jsonify({'error': 'Permisos insuficientes'}), 403

        return decorated_function
    return decorator


def requiere_modulo(codigo_modulo):
    """
    Decorador para requerir que un módulo esté habilitado en el plan del cliente.
    Uso: @requiere_modulo('whatsapp_chat')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                from modelos.suscripcion_modelo import SuscripcionModelo
                suscripcion = SuscripcionModelo()
                
                # Verificar si el módulo está disponible
                if not suscripcion.modulo_disponible(codigo_modulo):
                    # Obtener información del plan actual para el mensaje
                    plan = suscripcion.obtener_plan_actual()
                    plan_nombre = plan.get('plan_nombre', 'actual') if plan else 'actual'
                    
                    return jsonify({
                        'error': 'Módulo no disponible',
                        'message': f'El módulo "{codigo_modulo}" no está incluido en tu plan {plan_nombre}.',
                        'codigo_modulo': codigo_modulo,
                        'upgrade_disponible': True,
                        'accion_sugerida': 'Contacta a soporte para habilitar este módulo o cambiar de plan.'
                    }), 403
                
                return f(*args, **kwargs)
            
            except Exception as e:
                logger.error(f"Error al verificar módulo {codigo_modulo}: {e}")
                # En caso de error, permitir acceso (fail-open para no bloquear)
                return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def requiere_limite_no_excedido(tipo_limite):
    """
    Decorador para verificar que no se exceda un límite del plan.
    Uso: @requiere_limite_no_excedido('usuarios')
    Tipos: 'usuarios', 'eventos_mes', 'clientes'
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                from modelos.suscripcion_modelo import SuscripcionModelo
                suscripcion = SuscripcionModelo()
                
                # Verificar según el tipo
                if tipo_limite == 'usuarios':
                    permitido, mensaje = suscripcion.verificar_limite_usuarios()
                elif tipo_limite == 'eventos_mes':
                    permitido, mensaje = suscripcion.verificar_limite_eventos_mes()
                elif tipo_limite == 'clientes':
                    permitido, mensaje = suscripcion.verificar_limite_clientes()
                else:
                    permitido, mensaje = True, "Límite no definido"
                
                if not permitido:
                    return jsonify({
                        'error': 'Límite excedido',
                        'message': mensaje,
                        'tipo_limite': tipo_limite,
                        'upgrade_disponible': True,
                        'accion_sugerida': 'Contacta a soporte para aumentar tu límite o cambiar de plan.'
                    }), 403
                
                return f(*args, **kwargs)
            
            except Exception as e:
                logger.error(f"Error al verificar límite {tipo_limite}: {e}")
                return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def verificar_suscripcion_activa(f):
    """
    Decorador para verificar que la suscripción esté activa.
    Bloquea acceso si está suspendida, cancelada o vencida.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            from modelos.suscripcion_modelo import SuscripcionModelo
            suscripcion = SuscripcionModelo()
            
            estado = suscripcion.obtener_estado_suscripcion()
            
            if not estado.get('activa', False):
                return jsonify({
                    'error': 'Suscripción inactiva',
                    'message': estado.get('mensaje', 'Tu suscripción no está activa.'),
                    'estado': estado.get('estado'),
                    'accion_sugerida': 'Contacta a soporte para reactivar tu suscripción.'
                }), 403
            
            return f(*args, **kwargs)
        
        except Exception as e:
            logger.error(f"Error al verificar suscripción: {e}")
            return f(*args, **kwargs)
    
    return decorated_function
