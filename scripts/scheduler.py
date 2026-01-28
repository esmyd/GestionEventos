#!/usr/bin/env python3
"""
Scheduler para procesar notificaciones automáticamente
Ejecutar con crontab cada minuto: */1 * * * *
"""
import os
import sys
from datetime import datetime

# Agregar el directorio raíz al path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Configurar logging
LOG_DIR = os.path.join(ROOT_DIR, "logs")
LOG_FILE = os.path.join(LOG_DIR, "scheduler.log")

# Crear directorio de logs si no existe
os.makedirs(LOG_DIR, exist_ok=True)

def log_mensaje(mensaje):
    """Escribe un mensaje en el log del scheduler"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {mensaje}\n")

def main():
    """Función principal del scheduler"""
    try:
        log_mensaje("INICIO - Procesamiento de notificaciones")
        
        # Cambiar al directorio raíz
        os.chdir(ROOT_DIR)
        
        # Importar y ejecutar el procesador de notificaciones
        # Simular argumentos de línea de comandos
        sys.argv = ['procesar_notificaciones_v2.py', '--limite', '100']
        from utilidades.procesar_notificaciones_v2 import main as procesar_notificaciones
        
        # Ejecutar el procesamiento (limite de 100 notificaciones por ejecución)
        procesar_notificaciones()
        
        log_mensaje("OK - Notificaciones: procesado, Reintentos WA: procesado")
        return 0
        
    except Exception as e:
        error_msg = f"ERROR - {str(e)}"
        log_mensaje(error_msg)
        print(f"Error en scheduler: {e}", file=sys.stderr)
        import traceback
        log_mensaje(f"TRACEBACK: {traceback.format_exc()}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
