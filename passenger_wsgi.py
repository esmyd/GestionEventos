"""
Archivo WSGI para Passenger en la raíz del dominio
Este archivo debe estar en: /gestioneventos.siglotecnologico.com/passenger_wsgi.py
"""
import sys
import os

# Agregar el directorio GestionEventos al path de Python
gestion_eventos_dir = os.path.join(os.path.dirname(__file__), 'GestionEventos')
if gestion_eventos_dir not in sys.path:
    sys.path.insert(0, gestion_eventos_dir)

# Cambiar al directorio de la aplicación
os.chdir(gestion_eventos_dir)

try:
    # Importar la aplicación desde GestionEventos
    from api.app import create_app
    
    # Crear la aplicación Flask en modo producción
    application = create_app('production')
    
    # Passenger busca 'application'
    app = application
    
except Exception as e:
    # Si hay un error, crear una aplicación mínima para mostrar el error
    from flask import Flask, jsonify
    error_app = Flask(__name__)
    
    @error_app.route('/api/health')
    @error_app.route('/<path:path>')
    def error_handler(path=''):
        return jsonify({
            'error': 'Error al cargar la aplicación',
            'message': str(e),
            'type': type(e).__name__
        }), 500
    
    application = error_app
    app = application

if __name__ == '__main__':
    application.run()
