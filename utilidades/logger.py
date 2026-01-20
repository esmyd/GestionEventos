"""
Sistema de logging para la aplicación
Almacena logs en archivos de texto, uno por cada día
"""
import os
import threading
from datetime import datetime
from pathlib import Path


class Logger:
    """Clase para manejar logs de la aplicación"""
    
    # Niveles de log
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"
    
    _instance = None
    _lock = threading.Lock()
    
    def __init__(self, directorio_logs="logs"):
        """
        Inicializa el logger
        
        Args:
            directorio_logs: Nombre del directorio donde se guardarán los logs
        """
        # Obtener la ruta del directorio del proyecto
        self.directorio_base = Path(__file__).parent.parent
        self.directorio_logs = self.directorio_base / directorio_logs
        
        # Crear directorio de logs si no existe
        self.directorio_logs.mkdir(exist_ok=True)
        
        # Lock para escrituras thread-safe
        self.archivo_lock = threading.Lock()
    
    @classmethod
    def obtener_instancia(cls, directorio_logs="logs"):
        """
        Obtiene la instancia singleton del logger
        
        Args:
            directorio_logs: Nombre del directorio donde se guardarán los logs
            
        Returns:
            Logger: Instancia única del logger
        """
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls(directorio_logs)
        return cls._instance
    
    def _obtener_ruta_archivo(self, fecha=None):
        """
        Obtiene la ruta del archivo de log para una fecha específica
        
        Args:
            fecha: Objeto datetime. Si es None, usa la fecha actual
            
        Returns:
            Path: Ruta del archivo de log
        """
        if fecha is None:
            fecha = datetime.now()
        
        nombre_archivo = fecha.strftime("%Y-%m-%d") + ".txt"
        return self.directorio_logs / nombre_archivo
    
    def _escribir_log(self, tipo, mensaje):
        """
        Escribe un log en el archivo correspondiente
        
        Args:
            tipo: Tipo de log (ERROR, WARNING, INFO, DEBUG)
            mensaje: Mensaje a escribir
        """
        # Obtener fecha y hora actual
        ahora = datetime.now()
        fecha_hora = ahora.strftime("%Y-%m-%d %H:%M:%S")
        
        # Formatear línea de log
        linea_log = f"[{fecha_hora}] [{tipo}] {mensaje}\n"
        
        # Obtener ruta del archivo
        ruta_archivo = self._obtener_ruta_archivo(ahora)
        
        # Escribir en el archivo (thread-safe)
        with self.archivo_lock:
            try:
                with open(ruta_archivo, 'a', encoding='utf-8') as archivo:
                    archivo.write(linea_log)
            except Exception as e:
                # Si hay un error al escribir, intentar imprimir en consola
                print(f"Error al escribir en el log: {e}")
                print(f"Intento de log: {linea_log}")
    
    def error(self, mensaje):
        """
        Registra un log de tipo ERROR
        
        Args:
            mensaje: Mensaje del error
        """
        self._escribir_log(self.ERROR, mensaje)
    
    def warning(self, mensaje):
        """
        Registra un log de tipo WARNING
        
        Args:
            mensaje: Mensaje de advertencia
        """
        self._escribir_log(self.WARNING, mensaje)
    
    def info(self, mensaje):
        """
        Registra un log de tipo INFO
        
        Args:
            mensaje: Mensaje informativo
        """
        self._escribir_log(self.INFO, mensaje)
    
    def debug(self, mensaje):
        """
        Registra un log de tipo DEBUG
        
        Args:
            mensaje: Mensaje de depuración
        """
        self._escribir_log(self.DEBUG, mensaje)
    
    def log(self, tipo, mensaje):
        """
        Registra un log con un tipo personalizado
        
        Args:
            tipo: Tipo de log personalizado
            mensaje: Mensaje del log
        """
        self._escribir_log(tipo.upper(), mensaje)


# Función de conveniencia para obtener el logger
def obtener_logger(directorio_logs="logs"):
    """
    Función de conveniencia para obtener la instancia del logger
    
    Args:
        directorio_logs: Nombre del directorio donde se guardarán los logs
        
    Returns:
        Logger: Instancia del logger
    """
    return Logger.obtener_instancia(directorio_logs)

