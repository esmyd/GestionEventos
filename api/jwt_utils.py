"""
Utilidades para manejo de JWT tokens
"""
import jwt
import datetime
from config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_HOURS
from utilidades.logger import obtener_logger

logger = obtener_logger()


def generar_token(usuario):
    """
    Genera un JWT token para un usuario
    
    Args:
        usuario: Diccionario con datos del usuario
        
    Returns:
        str: JWT token codificado
    """
    try:
        # Payload del token
        payload = {
            'user_id': usuario['id'],
            'nombre_usuario': usuario['nombre_usuario'],
            'rol': usuario['rol'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
            'iat': datetime.datetime.utcnow()
        }
        
        # Generar token
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        # jwt.encode retorna bytes en versiones antiguas, string en nuevas
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        
        logger.debug(f"Token generado para usuario: {usuario['nombre_usuario']}")
        return token
    
    except Exception as e:
        logger.error(f"Error al generar token: {str(e)}")
        raise


def verificar_token(token):
    """
    Verifica y decodifica un JWT token
    
    Args:
        token: JWT token codificado
        
    Returns:
        dict: Payload del token si es válido, None si es inválido
    """
    try:
        # Decodificar token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # logger.debug(f"Token verificado para usuario: {payload.get('nombre_usuario')}")
        return payload
    
    except jwt.ExpiredSignatureError:
        logger.warning("Token expirado")
        return None
    
    except jwt.InvalidTokenError as e:
        logger.warning(f"Token inválido: {str(e)}")
        return None
    
    except Exception as e:
        logger.error(f"Error al verificar token: {str(e)}")
        return None


def extraer_token_del_header(auth_header):
    """
    Extrae el token del header Authorization
    
    Args:
        auth_header: Header Authorization completo
        
    Returns:
        str: Token si existe, None si no
    """
    if not auth_header:
        return None
    
    try:
        # Formato esperado: "Bearer <token>"
        parts = auth_header.split(' ')
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            return parts[1]
        return None
    except Exception as e:
        logger.debug(f"Error al extraer token: {str(e)}")
        return None
