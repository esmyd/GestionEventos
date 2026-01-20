"""
Aplicación principal de la API
"""
from flask import Flask
from flask_cors import CORS
from api.routes.auth import auth_bp
from api.routes.usuarios import usuarios_bp
from api.routes.clientes import clientes_bp
from api.routes.productos import productos_bp
from api.routes.categorias import categorias_bp
from api.routes.eventos import eventos_bp
from api.routes.planes import planes_bp
from api.routes.pagos import pagos_bp
from api.routes.inventario import inventario_bp
from api.routes.salones import salones_bp
from api.routes.reportes import reportes_bp
from api.routes.tipos_evento import tipos_evento_bp


def create_app(config_name='development'):
    """Factory function para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Configuración CORS para permitir acceso desde frontend web/móvil
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Configuración de la aplicación
    app.config['JSON_SORT_KEYS'] = False
    app.config['JSON_AS_ASCII'] = False
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
    app.register_blueprint(productos_bp, url_prefix='/api/productos')
    app.register_blueprint(categorias_bp, url_prefix='/api/categorias')
    app.register_blueprint(eventos_bp, url_prefix='/api/eventos')
    app.register_blueprint(planes_bp, url_prefix='/api/planes')
    app.register_blueprint(pagos_bp, url_prefix='/api/pagos')
    app.register_blueprint(inventario_bp, url_prefix='/api/inventario')
    app.register_blueprint(salones_bp, url_prefix='/api/salones')
    app.register_blueprint(reportes_bp, url_prefix='/api/reportes')
    app.register_blueprint(tipos_evento_bp, url_prefix='/api/tipos_evento')
    
    # Ruta de salud
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': 'API Lirios Eventos funcionando correctamente'}, 200
    
    # Manejo de errores global
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint no encontrado'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Error interno del servidor'}, 500
    
    return app
