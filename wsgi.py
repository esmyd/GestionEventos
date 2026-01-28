"""
Archivo WSGI para despliegue en hosting
Este archivo es el punto de entrada para servidores WSGI como Passenger, Gunicorn, etc.
"""
from api.app import create_app

# Crear la aplicación Flask
# La variable 'application' es el estándar para WSGI
application = create_app('production')

# Algunos hostings buscan 'app' en lugar de 'application'
app = application

if __name__ == '__main__':
    application.run()
