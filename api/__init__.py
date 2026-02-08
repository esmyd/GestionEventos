"""
API REST para el sistema Gestión de Eventos
"""
from flask import Flask
from flask_cors import CORS
from api.app import create_app

__all__ = ['create_app']
