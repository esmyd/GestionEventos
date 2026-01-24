#!/bin/bash
# ============================================================
# Script para ejecutar el procesamiento de notificaciones
# Configurar en Cron para ejecución automática
# ============================================================

# Configurar la ruta del proyecto (ajustar según instalación)
PROYECTO_DIR="/var/www/lirios-eventos"
LOG_FILE="$PROYECTO_DIR/logs/scheduler.log"
PYTHON_BIN="$PROYECTO_DIR/venv/bin/python"

# Verificar si existe el directorio del proyecto
if [ ! -d "$PROYECTO_DIR" ]; then
    echo "ERROR: Directorio del proyecto no encontrado: $PROYECTO_DIR"
    exit 1
fi

# Crear directorio de logs si no existe
mkdir -p "$PROYECTO_DIR/logs"

# Cambiar al directorio del proyecto
cd "$PROYECTO_DIR"

# Obtener fecha y hora en formato ISO
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Registrar inicio
echo "[$TIMESTAMP] INICIO - Procesamiento de notificaciones" >> "$LOG_FILE"

# Activar entorno virtual si existe
if [ -f "$PROYECTO_DIR/venv/bin/activate" ]; then
    source "$PROYECTO_DIR/venv/bin/activate"
    PYTHON_BIN="python"
fi

# Ejecutar el procesamiento de notificaciones
$PYTHON_BIN utilidades/procesar_notificaciones_v2.py --limite 100

# Capturar código de salida
EXIT_CODE=$?

# Obtener hora de fin
TIMESTAMP_FIN=$(date '+%Y-%m-%d %H:%M:%S')

# Registrar resultado
if [ $EXIT_CODE -eq 0 ]; then
    echo "[$TIMESTAMP_FIN] OK - Notificaciones: procesado, Reintentos WA: procesado" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP_FIN] ERROR - Codigo de salida: $EXIT_CODE" >> "$LOG_FILE"
fi

exit $EXIT_CODE
