#!/bin/bash
# ============================================================
# Script para instalar la tarea cron de notificaciones
# Ejecutar como: sudo bash instalar_cron.sh
# ============================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "============================================================"
echo "  LIRIOS EVENTOS - Instalador de Cron para Notificaciones"
echo "============================================================"
echo ""

# Configuración (ajustar según instalación)
PROYECTO_DIR="/var/www/lirios-eventos"
SCRIPT_PATH="$PROYECTO_DIR/utilidades/ejecutar_notificaciones.sh"
CRON_USER="www-data"  # Usuario que ejecutará el cron
INTERVALO_MINUTOS=5   # Cada cuántos minutos ejecutar

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}ERROR: Este script debe ejecutarse como root (sudo)${NC}"
    exit 1
fi

# Verificar que el script existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo -e "${RED}ERROR: No se encontró el script: $SCRIPT_PATH${NC}"
    echo "Asegúrate de que el proyecto esté en: $PROYECTO_DIR"
    exit 1
fi

# Dar permisos de ejecución al script
chmod +x "$SCRIPT_PATH"
echo -e "${GREEN}✓${NC} Permisos de ejecución otorgados a: $SCRIPT_PATH"

# Crear el archivo de log con permisos correctos
LOG_DIR="$PROYECTO_DIR/logs"
mkdir -p "$LOG_DIR"
touch "$LOG_DIR/scheduler.log"
chown -R $CRON_USER:$CRON_USER "$LOG_DIR"
echo -e "${GREEN}✓${NC} Directorio de logs configurado: $LOG_DIR"

# Crear la línea del cron
CRON_LINE="*/$INTERVALO_MINUTOS * * * * $SCRIPT_PATH >> $LOG_DIR/cron_output.log 2>&1"

# Verificar si ya existe el cron
EXISTING_CRON=$(crontab -u $CRON_USER -l 2>/dev/null | grep -F "ejecutar_notificaciones.sh")

if [ -n "$EXISTING_CRON" ]; then
    echo -e "${YELLOW}!${NC} Ya existe una tarea cron para notificaciones:"
    echo "   $EXISTING_CRON"
    echo ""
    read -p "¿Deseas reemplazarla? (s/n): " RESPUESTA
    if [ "$RESPUESTA" != "s" ] && [ "$RESPUESTA" != "S" ]; then
        echo "Cancelado."
        exit 0
    fi
    # Eliminar la línea existente
    crontab -u $CRON_USER -l 2>/dev/null | grep -v "ejecutar_notificaciones.sh" | crontab -u $CRON_USER -
fi

# Agregar la nueva línea al cron
(crontab -u $CRON_USER -l 2>/dev/null; echo "$CRON_LINE") | crontab -u $CRON_USER -

echo -e "${GREEN}✓${NC} Tarea cron instalada exitosamente"
echo ""
echo "============================================================"
echo "  Configuración:"
echo "============================================================"
echo "  Usuario:     $CRON_USER"
echo "  Intervalo:   Cada $INTERVALO_MINUTOS minutos"
echo "  Script:      $SCRIPT_PATH"
echo "  Log:         $LOG_DIR/scheduler.log"
echo "============================================================"
echo ""
echo "Comandos útiles:"
echo "  Ver cron:      crontab -u $CRON_USER -l"
echo "  Editar cron:   crontab -u $CRON_USER -e"
echo "  Ver logs:      tail -f $LOG_DIR/scheduler.log"
echo "  Eliminar cron: crontab -u $CRON_USER -r"
echo ""
echo -e "${GREEN}¡Instalación completada!${NC}"
echo ""
