"""
Aplicación principal del sistema Lirios Eventos
"""
import tkinter as tk
from vistas.login import VentanaLogin
from vistas.ventana_principal import VentanaPrincipal
from utilidades.logger import obtener_logger


class Aplicacion:
    """Clase principal de la aplicación"""
    
    def __init__(self):
        self.logger = obtener_logger()
        self.root = tk.Tk()
        self.ventana_principal = None
        self.logger.info("Aplicación inicializada")
        self.mostrar_login()
    
    def mostrar_login(self):
        """Muestra la ventana de login"""
        # Limpiar ventana si existe
        self.logger.debug("Mostrando ventana de login...")
        for widget in self.root.winfo_children():
            widget.destroy()
        self.logger.debug("Ventana anterior limpiada")
        VentanaLogin(self.root, self.on_login_exitoso)
        self.logger.debug("Ventana de login creada")
    
    def on_login_exitoso(self, usuario, autenticacion):
        """Callback cuando el login es exitoso"""
        nombre_usuario = usuario.get('nombre_usuario', 'desconocido') 
        self.logger.info(f"Login exitoso para usuario: {nombre_usuario}")
        
        # Limpiar ventana
        for widget in self.root.winfo_children(): # limpia la ventana
            widget.destroy()
        
        # Mostrar ventana principal
        self.logger.debug("Cargando ventana principal...")
        self.ventana_principal = VentanaPrincipal(self.root, usuario, autenticacion) # crea una instancia de la ventana principal
        self.logger.info("Ventana principal mostrada")
    
    def ejecutar(self):
        """Ejecuta la aplicación"""
        self.logger.info("Iniciando loop principal de la aplicación")
        self.root.mainloop() # inicia el loop principal de la aplicación


if __name__ == "__main__":# Punto de entrada de la aplicación
    logger = obtener_logger() # crea una instancia del logger
    logger.info("=" * 50)
    logger.info("Iniciando aplicación Lirios Eventos") # inicia la aplicación
    logger.info("=" * 50)
    
    try:
        app = Aplicacion() # crea una instancia de la aplicación
        logger.info("Aplicación creada exitosamente")
        app.ejecutar() # ejecuta la aplicación
    except Exception as e:
        logger.error(f"Error al ejecutar la aplicación: {str(e)}")
        raise # lanza una excepción si hay un error
    finally:
        logger.info("Aplicación finalizada") # finaliza la aplicación

