# Configuración de la base de datos MySQL
DB_CONFIG = {
    'host': 'localhost',
    'user': 'gosorio',
    'password': '25019796g*',
    'database': 'lirios_eventos',
    'port': 3306
}

# Configuración de seguridad JWT
# IMPORTANTE: En producción, cambia esta clave por una segura y guárdala en variables de entorno
JWT_SECRET_KEY = 'lirios-eventos-secret-key-change-in-production-2024'
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24  # Tokens expiran después de 24 horas


