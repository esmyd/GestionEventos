"""
Servidor API REST para Lirios Eventos
"""
from api.app import create_app
from utilidades.logger import obtener_logger

if __name__ == '__main__':
    logger = obtener_logger()
    logger.info("=" * 50)
    logger.info("Iniciando servidor API Lirios Eventos")
    logger.info("=" * 50)
    
    app = create_app()
    
    # Configuración del servidor
    host = '0.0.0.0'  # Escuchar en todas las interfaces
    port = 5000
    debug = True  # En producción, cambiar a False
    
    logger.info(f"Servidor API iniciado en http://{host}:{port}")
    logger.info("Endpoints disponibles:")
    logger.info("  - POST /api/auth/login")
    logger.info("  - GET  /api/health")
    logger.info("  - GET  /api/usuarios")
    logger.info("  - GET  /api/clientes")
    logger.info("  - GET  /api/productos")
    logger.info("  - GET  /api/eventos")
    logger.info("  - GET  /api/pagos")
    logger.info("  - GET  /api/reportes/metricas")
    logger.info("  ... y muchos más")
    
    app.run(host=host, port=port, debug=debug)
