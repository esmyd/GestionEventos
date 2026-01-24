@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM Script para ejecutar el procesamiento de notificaciones
REM Configurar en Task Scheduler para ejecucion automatica
REM ============================================================

REM Configurar la ruta del proyecto
set "PROYECTO_DIR=C:\Users\User\Documents\EvolucionLiriosEventos"
set "LOG_FILE=%PROYECTO_DIR%\logs\scheduler.log"

REM Cambiar al directorio del proyecto
cd /d "%PROYECTO_DIR%"

REM Obtener fecha y hora en formato YYYY-MM-DD HH:MM:SS
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "DT=%%I"
set "FECHA=%DT:~0,4%-%DT:~4,2%-%DT:~6,2%"
set "HORA=%DT:~8,2%:%DT:~10,2%:%DT:~12,2%"
set "TIMESTAMP=%FECHA% %HORA%"

REM Registrar inicio
echo [%TIMESTAMP%] INICIO - Procesamiento de notificaciones >> "%LOG_FILE%"

REM Activar entorno virtual si existe
if exist "%PROYECTO_DIR%\venv\Scripts\activate.bat" (
    call "%PROYECTO_DIR%\venv\Scripts\activate.bat"
)

REM Ejecutar el procesamiento de notificaciones
python utilidades\procesar_notificaciones_v2.py --limite 100

REM Capturar codigo de salida
set "EXIT_CODE=%ERRORLEVEL%"

REM Obtener hora de fin
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "DT_FIN=%%I"
set "HORA_FIN=%DT_FIN:~8,2%:%DT_FIN:~10,2%:%DT_FIN:~12,2%"
set "TIMESTAMP_FIN=%FECHA% %HORA_FIN%"

REM Registrar resultado
if "%EXIT_CODE%"=="0" (
    echo [%TIMESTAMP_FIN%] OK - Notificaciones: procesado, Reintentos WA: procesado >> "%LOG_FILE%"
) else (
    echo [%TIMESTAMP_FIN%] ERROR - Codigo de salida: %EXIT_CODE% >> "%LOG_FILE%"
)

endlocal
exit /b %EXIT_CODE%
