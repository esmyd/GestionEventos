# 📧 Sistema de Notificaciones - Documentación

## 🔄 Flujo del Sistema de Notificaciones

### 1. **Creación de Notificaciones**

Las notificaciones se crean automáticamente en la tabla `notificaciones_pendientes` cuando:

- **Se registra un pago/abono**: 
  - Archivo: `modelos/pago_modelo.py`
  - Método: `crear_pago()` → `_crear_notificacion_pendiente()`
  - Tipos: `abono_recibido`, `pago_completo`

- **Se generan notificaciones programadas** (recordatorios):
  - Recordatorio 7 días antes del evento
  - Recordatorio 1 día antes del evento
  - Solicitud de calificación después del evento

### 2. **Envío de Notificaciones**

**Responsable**: `SistemaNotificacionesV2` (archivo: `integraciones/sistema_notificaciones_v2.py`)

**Método principal**: `procesar_notificaciones_pendientes(limite=50)`

**Proceso**:
1. Obtiene notificaciones pendientes usando el procedimiento almacenado `obtener_notificaciones_pendientes()`
2. Para cada notificación:
   - Envía por **Email** (si está configurado)
   - Envía por **WhatsApp** (si está configurado)
   - Marca como enviada usando `marcar_notificacion_enviada()`

### 3. **Script de Procesamiento**

**Archivo**: `utilidades/procesar_notificaciones_v2.py`

Este script debe ejecutarse **periódicamente** para procesar las notificaciones pendientes.

**Funciones**:
- Genera notificaciones programadas (recordatorios)
- Procesa y envía notificaciones pendientes
- Maneja errores y registra resultados

## ⏰ ¿Cuándo se disparan los recordatorios?

Los recordatorios (7 días, 1 día, solicitud de calificación) se envían **cuando corre el proceso programado**.

- La lógica busca eventos con `DATE(fecha_evento) = HOY + dias_configurados`.
- El envío ocurre en la **hora exacta en la que se ejecuta el job**.
- Si el job corre cada hora, se envían en la primera ejecución después de medianoche.
- Si quieres una hora fija (ej. 09:00), programa el job a esa hora.

## ⚙️ Configuración de Ejecución Automática

### Windows (Task Scheduler)

1. Abre el **Programador de tareas** (Task Scheduler)
2. Crea una **Tarea básica**
3. Configura:
   - **Nombre**: "Procesar Notificaciones Lirios Eventos"
   - **Desencadenador**: Diariamente, cada hora (o según necesites)
   - **Acción**: Iniciar un programa
   - **Programa**: `python.exe` (ruta completa a tu Python)
   - **Argumentos**: `utilidades/procesar_notificaciones_v2.py`
   - **Iniciar en**: `C:\Users\User\Documents\EvolucionLiriosEventos`

**Ejemplo de comando completo**:
```
C:\Users\User\Documents\EvolucionLiriosEventos\.venv\Scripts\python.exe utilidades/procesar_notificaciones_v2.py
```

### Linux/Mac (Cron)

Edita el crontab:
```bash
crontab -e
```

Agrega una línea para ejecutar cada hora:
```cron
0 * * * * cd /ruta/al/proyecto && /ruta/al/python utilidades/procesar_notificaciones_v2.py >> /ruta/al/logs/notificaciones.log 2>&1
```

O cada 15 minutos:
```cron
*/15 * * * * cd /ruta/al/proyecto && /ruta/al/python utilidades/procesar_notificaciones_v2.py >> /ruta/al/logs/notificaciones.log 2>&1
```

## 📋 Estructura de la Tabla `notificaciones_pendientes`

```sql
CREATE TABLE notificaciones_pendientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    tipo_notificacion VARCHAR(50) NOT NULL,
    canal ENUM('email', 'whatsapp', 'ambos') NOT NULL,
    destinatario_email VARCHAR(255),
    destinatario_telefono VARCHAR(20),
    asunto VARCHAR(255),
    mensaje_email TEXT,
    mensaje_whatsapp TEXT,
    fecha_programada DATETIME NOT NULL,
    fecha_envio DATETIME NULL,
    enviado BOOLEAN DEFAULT FALSE,
    intentos INT DEFAULT 0,
    error TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 Verificación Manual

Para verificar y procesar notificaciones manualmente:

```bash
python utilidades/procesar_notificaciones_v2.py
```

Esto mostrará:
- Notificaciones programadas generadas
- Notificaciones enviadas
- Errores (si los hay)

## 📊 Consultas Útiles

### Ver notificaciones pendientes:
```sql
SELECT * FROM notificaciones_pendientes 
WHERE enviado = FALSE 
AND fecha_programada <= NOW()
ORDER BY fecha_programada ASC;
```

### Ver notificaciones enviadas recientemente:
```sql
SELECT * FROM notificaciones_pendientes 
WHERE enviado = TRUE 
ORDER BY fecha_envio DESC 
LIMIT 20;
```

### Ver notificaciones con errores:
```sql
SELECT * FROM notificaciones_pendientes 
WHERE enviado = FALSE 
AND error IS NOT NULL
ORDER BY intentos DESC;
```

## ⚠️ Notas Importantes

1. **El script debe ejecutarse periódicamente**: Si no se ejecuta, las notificaciones quedarán en la tabla sin enviarse.

2. **Configuración de canales**: Las notificaciones solo se envían si:
   - El canal está configurado en `configuracion_notificaciones`
   - El servicio (Email/WhatsApp) está activo y configurado

3. **Reintentos**: El sistema registra intentos y errores. Si una notificación falla, se puede reintentar ejecutando el script nuevamente.

4. **Límite de procesamiento**: Por defecto se procesan 50 notificaciones por ejecución para evitar sobrecarga.

## 🔧 Solución de Problemas

### Las notificaciones no se envían:
1. Verifica que el script se esté ejecutando periódicamente
2. Verifica la configuración de Email/WhatsApp en `.env`
3. Revisa los errores en la tabla `notificaciones_pendientes`
4. Ejecuta manualmente: `python utilidades/procesar_notificaciones_v2.py`

### Error "PROCEDURE does not exist":
- Ejecuta: `python utilidades/crear_procedimientos_paso_a_paso.py`
- Esto creará los procedimientos almacenados necesarios

