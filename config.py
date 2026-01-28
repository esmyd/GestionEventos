# Configuración de la aplicación
# Usa variables de entorno en producción, valores por defecto para desarrollo local

import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe
load_dotenv()

# Determinar si estamos en producción
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
IS_PRODUCTION = ENVIRONMENT == 'production'

# Configuración de la base de datos MySQL
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'gosorio'),
    'password': os.getenv('DB_PASSWORD', '25019796g*'),
    'database': os.getenv('DB_NAME', 'lirios_eventos'),
    'port': int(os.getenv('DB_PORT', 3306))
}

# Configuración de seguridad JWT
# IMPORTANTE: En producción, usar variable de entorno JWT_SECRET_KEY
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'lirios-eventos-secret-key-change-in-production-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))

# Configuración del servidor
API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', 5000))
DEBUG_MODE = os.getenv('DEBUG_MODE', 'true').lower() == 'true' and not IS_PRODUCTION

# URL del frontend (para CORS)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Configuración de WhatsApp (si no están en BD)
WHATSAPP_TOKEN = os.getenv('WHATSAPP_TOKEN', '')
WHATSAPP_PHONE_NUMBER_ID = os.getenv('WHATSAPP_PHONE_NUMBER_ID', '')
WHATSAPP_WEBHOOK_TOKEN = os.getenv('WHATSAPP_WEBHOOK_TOKEN', '')

# Mostrar configuración activa (solo en desarrollo)
if not IS_PRODUCTION:
    print(f"[CONFIG] Ambiente: {ENVIRONMENT}")
    print(f"[CONFIG] Base de datos: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
