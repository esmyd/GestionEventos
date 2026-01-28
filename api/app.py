"""
Aplicación principal de la API
"""
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS
import os
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
from api.routes.notificaciones_nativas import notificaciones_nativas_bp
from api.routes.integraciones import integraciones_bp
from api.routes.whatsapp_chat import whatsapp_chat_bp
from api.routes.whatsapp_metricas import whatsapp_metricas_bp
from api.routes.configuraciones import configuraciones_bp
from api.routes.whatsapp_templates import whatsapp_templates_bp
from api.routes.carga_masiva import carga_masiva_bp
from api.routes.whatsapp_reintentos import whatsapp_reintentos_bp
from api.routes.cuentas import cuentas_bp
from api.routes.producto_opciones import producto_opciones_bp
from modelos.configuracion_general_modelo import ConfiguracionGeneralModelo


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
    app.register_blueprint(notificaciones_nativas_bp, url_prefix='/api/notificaciones_nativas')
    app.register_blueprint(integraciones_bp, url_prefix='/api/integraciones')
    app.register_blueprint(whatsapp_chat_bp, url_prefix='/api/whatsapp_chat')
    app.register_blueprint(whatsapp_metricas_bp, url_prefix='/api/whatsapp_metricas')
    app.register_blueprint(configuraciones_bp, url_prefix='/api/configuraciones')
    app.register_blueprint(whatsapp_templates_bp, url_prefix='/api/whatsapp_templates')
    app.register_blueprint(carga_masiva_bp, url_prefix='/api/carga_masiva')
    app.register_blueprint(whatsapp_reintentos_bp, url_prefix='/api/whatsapp_reintentos')
    app.register_blueprint(cuentas_bp, url_prefix='/api/cuentas')
    app.register_blueprint(producto_opciones_bp, url_prefix='/api/producto-opciones')
    
    # Ruta de salud
    @app.route('/api/health')
    def health_check():
        from flask import jsonify
        nombre_plataforma = "Lirios Eventos"
        try:
            config = ConfiguracionGeneralModelo().obtener_configuracion() or {}
            nombre_plataforma = config.get("nombre_plataforma") or nombre_plataforma
        except Exception:
            pass
        return jsonify({'status': 'ok', 'message': f'API {nombre_plataforma} funcionando correctamente'}), 200
    
    # Obtener la ruta raíz del dominio (desde GestionEventos/api/app.py)
    def get_root_dir():
        """Obtiene la ruta raíz del dominio"""
        current_dir = os.path.dirname(os.path.abspath(__file__))  # api/
        gestion_dir = os.path.dirname(current_dir)  # GestionEventos/
        root_dir = os.path.dirname(gestion_dir)  # raíz del dominio
        return root_dir
    
    # Servir archivos estáticos del frontend (assets, CSS, JS, etc.)
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        """Sirve archivos estáticos del frontend desde la raíz del dominio"""
        root_dir = get_root_dir()
        assets_dir = os.path.join(root_dir, 'assets')
        
        if os.path.exists(assets_dir):
            return send_from_directory(assets_dir, filename)
        # Si no existe assets/, intentar desde la raíz directamente
        return send_from_directory(root_dir, f'assets/{filename}')
    
    # Manejo de errores global (solo para rutas /api/*)
    @app.errorhandler(404)
    def not_found(error):
        from flask import request, jsonify
        # Si es una ruta de API, devolver JSON
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Endpoint no encontrado'}), 404
        
        # Para otras rutas (frontend), servir index.html para React Router
        root_dir = get_root_dir()
        index_path = os.path.join(root_dir, 'index.html')
        
        if os.path.exists(index_path):
            return send_file(index_path)
        
        return jsonify({'error': 'Página no encontrada'}), 404
    
    # Servir el index.html del frontend en la raíz (DESPUÉS de todos los blueprints)
    @app.route('/')
    def serve_frontend_root():
        """Sirve el index.html del frontend en la raíz"""
        root_dir = get_root_dir()
        index_path = os.path.join(root_dir, 'index.html')
        
        if os.path.exists(index_path):
            return send_file(index_path)
        
        from flask import jsonify
        return jsonify({'error': 'Frontend no encontrado. Asegúrate de que index.html esté en la raíz del dominio.'}), 404
    
    # Catch-all para React Router (debe ir al final, después de todas las rutas)
    @app.route('/<path:path>')
    def serve_frontend(path):
        """Catch-all para React Router - sirve index.html para cualquier ruta que no sea /api/*"""
        # Si es una ruta de API, ya debería haber sido manejada por los blueprints
        if path.startswith('api/'):
            from flask import jsonify
            return jsonify({'error': 'Endpoint no encontrado'}), 404
        
        root_dir = get_root_dir()
        file_path = os.path.join(root_dir, path)
        
        # Si el archivo existe físicamente (JS, CSS, imágenes, etc.), servirlo
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_file(file_path)
        
        # Si no existe, servir index.html para React Router
        index_path = os.path.join(root_dir, 'index.html')
        if os.path.exists(index_path):
            return send_file(index_path)
        
        from flask import jsonify
        return jsonify({'error': 'Frontend no encontrado'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Error interno del servidor'}, 500
    
    return app
