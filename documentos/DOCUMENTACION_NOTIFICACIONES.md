# 📧 Sistema de Notificaciones - Documentación

## 📑 Índice
1. [Flujo del Sistema](#-flujo-del-sistema-de-notificaciones)
2. [Configuraciones](#️-configuraciones)
3. [Ejecución Automática](#️-configuración-de-ejecución-automática)
4. [Estructura de Base de Datos](#-estructura-de-la-tabla-notificaciones_pendientes)
5. [Verificación y Consultas](#-verificación-manual)
6. [Solución de Problemas](#-solución-de-problemas)

---

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

---

## ⚙️ Configuraciones

### 📧 Configuración de Email (SMTP)

La configuración de email se realiza mediante **variables de entorno** en el archivo `.env`:

```env
# Configuración de Email (SMTP)
SMTP_SERVER=mail.tudominio.com
SMTP_PORT=465
SMTP_USE_SSL=True
SMTP_USE_TLS=False
EMAIL_FROM=notificaciones@tudominio.com
EMAIL_PASSWORD=tu_contraseña_segura
EMAIL_FROM_NAME=Lirios Eventos
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SMTP_SERVER` | Servidor SMTP | `mail.siglotecnologico.com` |
| `SMTP_PORT` | Puerto del servidor | `465` (SSL) o `587` (TLS) |
| `SMTP_USE_SSL` | Usar conexión SSL | `True` para puerto 465 |
| `SMTP_USE_TLS` | Usar conexión TLS | `True` para puerto 587 |
| `EMAIL_FROM` | Dirección de envío | `notificaciones@empresa.com` |
| `EMAIL_PASSWORD` | Contraseña del email | `*****` |
| `EMAIL_FROM_NAME` | Nombre del remitente | `Lirios Eventos` |

**Notas:**
- Puerto 465: Usar `SMTP_USE_SSL=True` y `SMTP_USE_TLS=False`
- Puerto 587: Usar `SMTP_USE_SSL=False` y `SMTP_USE_TLS=True`

---

### 📱 Configuración de WhatsApp (Meta Cloud API)

La configuración de WhatsApp se almacena en la **base de datos** en la tabla `configuracion_integraciones`:

```sql
-- Ver configuración actual
SELECT * FROM configuracion_integraciones WHERE tipo_integracion = 'whatsapp';

-- Estructura del JSON en el campo 'configuracion':
{
    "access_token": "EAAxxxxxxx...",
    "phone_number_id": "123456789012345",
    "business_id": "987654321098765",
    "api_version": "v22.0"
}
```

| Campo | Descripción | Dónde obtenerlo |
|-------|-------------|-----------------|
| `access_token` | Token de acceso de Meta | Meta Business Suite → API Setup |
| `phone_number_id` | ID del número de teléfono | Meta Business Suite → WhatsApp → Phone Numbers |
| `business_id` | ID del negocio | Meta Business Suite → Business Settings |
| `api_version` | Versión de la API | Usar `v22.0` o superior |

**Para configurar desde el panel de administración:**
1. Ir a **Configuraciones → Integraciones**
2. Seleccionar **WhatsApp**
3. Ingresar los datos de la API de Meta

---

### 📋 Configuración de Tipos de Notificación

Los tipos de notificación se configuran en la tabla `configuracion_notificaciones`:

```sql
SELECT * FROM configuracion_notificaciones;
```

| Campo | Descripción |
|-------|-------------|
| `tipo_notificacion` | Identificador único (ej: `abono_recibido`) |
| `nombre` | Nombre visible |
| `descripcion` | Descripción del tipo |
| `activo` | Si está habilitado (1/0) |
| `enviar_email` | Enviar por email (1/0) |
| `enviar_whatsapp` | Enviar por WhatsApp (1/0) |
| `dias_antes` | Días antes del evento (0=inmediato, -1=después) |
| `plantilla_email` | Plantilla del email |
| `plantilla_whatsapp` | Plantilla del mensaje WA |

**Variables disponibles en plantillas:**
- `{nombre_cliente}` - Nombre del cliente
- `{nombre_evento}` - Nombre del evento/salón
- `{fecha_evento}` - Fecha del evento
- `{hora_inicio}` - Hora de inicio
- `{saldo_pendiente}` - Saldo pendiente (para pagos)
- `{monto}` - Monto del pago (para abonos)

---

### 🔒 Control de Envíos por Cliente

Se puede bloquear el envío de notificaciones por cliente en la tabla `whatsapp_control_clientes`:

```sql
-- Ver clientes con bloqueos
SELECT * FROM whatsapp_control_clientes WHERE bloquear_whatsapp = 1 OR bloquear_email = 1;

-- Bloquear WhatsApp para un cliente
UPDATE whatsapp_control_clientes SET bloquear_whatsapp = 1 WHERE cliente_id = 123;

-- Bloquear Email para un cliente
UPDATE whatsapp_control_clientes SET bloquear_email = 1 WHERE cliente_id = 123;
```

---

### 📊 Configuración de Límites y Costos (Panel WhatsApp)

En el módulo **Panel WhatsApp** se pueden configurar:

| Configuración | Descripción |
|---------------|-------------|
| `precio_whatsapp` | Costo por mensaje de WhatsApp |
| `precio_email` | Costo por email enviado |
| `maximo_whatsapp` | Límite máximo de mensajes WA (null = ilimitado) |
| `maximo_email` | Límite máximo de emails (null = ilimitado) |
| `whatsapp_desactivado` | Desactivar envío global de WhatsApp |

---

## ⚙️ Configuración de Ejecución Automática

### Scripts Disponibles

| Sistema | Script | Descripción |
|---------|--------|-------------|
| Windows | `utilidades/ejecutar_notificaciones.bat` | Script batch para Task Scheduler |
| Windows | `utilidades/crear_tarea_programada.ps1` | Crea la tarea automáticamente |
| Linux | `utilidades/ejecutar_notificaciones.sh` | Script bash para Cron |
| Linux | `utilidades/instalar_cron.sh` | Instala el cron automáticamente |

---

### 🪟 Windows (Task Scheduler)

#### Opción 1: Instalación Automática (Recomendado)

Abre **PowerShell como Administrador** y ejecuta:
```powershell
cd C:\Users\User\Documents\EvolucionLiriosEventos\utilidades
.\crear_tarea_programada.ps1
```

#### Opción 2: Instalación Manual

1. Abre el **Programador de tareas** (Task Scheduler)
2. Click en **"Create Basic Task"**
3. Configura:
   - **Nombre**: `LiriosEventos_Notificaciones`
   - **Trigger**: Daily, repetir cada **5 minutos**
   - **Action**: Start a program
   - **Program**: `C:\Users\User\Documents\EvolucionLiriosEventos\utilidades\ejecutar_notificaciones.bat`

#### Comandos útiles (PowerShell)
```powershell
# Ver estado de la tarea
Get-ScheduledTask -TaskName "LiriosEventos_Notificaciones"

# Ejecutar manualmente
Start-ScheduledTask -TaskName "LiriosEventos_Notificaciones"

# Eliminar tarea
Unregister-ScheduledTask -TaskName "LiriosEventos_Notificaciones"
```

---

### 🐧 Linux (Cron) - Para Producción

#### Opción 1: Instalación Automática (Recomendado)

```bash
# 1. Ajustar la ruta del proyecto en el script
sudo nano /var/www/lirios-eventos/utilidades/instalar_cron.sh
# Editar PROYECTO_DIR="/var/www/lirios-eventos" según tu instalación

# 2. Ejecutar el instalador
cd /var/www/lirios-eventos/utilidades
sudo bash instalar_cron.sh
```

#### Opción 2: Instalación Manual

```bash
# 1. Dar permisos de ejecución
chmod +x /var/www/lirios-eventos/utilidades/ejecutar_notificaciones.sh

# 2. Editar crontab
sudo crontab -u www-data -e

# 3. Agregar la línea (cada 5 minutos)
*/5 * * * * /var/www/lirios-eventos/utilidades/ejecutar_notificaciones.sh
```

#### Comandos útiles (Linux)
```bash
# Ver cron instalado
sudo crontab -u www-data -l

# Ver logs en tiempo real
tail -f /var/www/lirios-eventos/logs/scheduler.log

# Ejecutar manualmente
sudo -u www-data /var/www/lirios-eventos/utilidades/ejecutar_notificaciones.sh

# Eliminar todos los crons del usuario
sudo crontab -u www-data -r
```

#### Configuración del Script Linux

Editar `utilidades/ejecutar_notificaciones.sh` y ajustar:
```bash
PROYECTO_DIR="/var/www/lirios-eventos"  # Ruta de instalación
CRON_USER="www-data"                     # Usuario del servidor web
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

## 🔄 Sistema de Reintentos de WhatsApp

Cuando un mensaje de WhatsApp falla (ej: servicio no disponible), el sistema lo almacena para reintentarlo automáticamente.

### Estructura de Reintentos

La tabla `whatsapp_mensajes` tiene campos para gestionar reintentos:

| Campo | Descripción |
|-------|-------------|
| `pendiente_reintento` | 1 = pendiente de reintento |
| `intentos_reintento` | Número de intentos realizados |
| `max_intentos_reintento` | Máximo de intentos (default: 3) |
| `fecha_ultimo_reintento` | Última fecha de intento |

### Consultas Útiles para Reintentos

```sql
-- Ver mensajes pendientes de reintento
SELECT id, conversacion_id, mensaje, intentos_reintento, fecha_creacion
FROM whatsapp_mensajes 
WHERE pendiente_reintento = 1 
AND estado = 'fallido';

-- Ver estadísticas de reintentos
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN pendiente_reintento = 1 THEN 1 ELSE 0 END) as pendientes,
    SUM(CASE WHEN estado = 'sent' AND intentos_reintento > 0 THEN 1 ELSE 0 END) as exitosos_reintento
FROM whatsapp_mensajes 
WHERE intentos_reintento > 0;
```

### Errores No Reintentables

El sistema **no reintenta** mensajes con estos errores:
- **Código 131047**: Ventana de 24 horas expirada (requiere plantilla)
- **Código 131056**: Rate limit alcanzado

---

## ⚠️ Notas Importantes

1. **El script debe ejecutarse periódicamente**: Si no se ejecuta, las notificaciones quedarán en la tabla sin enviarse.

2. **Configuración de canales**: Las notificaciones solo se envían si:
   - El canal está configurado en `configuracion_notificaciones`
   - El servicio (Email/WhatsApp) está activo y configurado

3. **Reintentos automáticos**: El proceso incluye reintentos de mensajes WhatsApp fallidos (espera 5 minutos entre intentos, máximo 3 intentos).

4. **Límite de procesamiento**: Por defecto se procesan 100 notificaciones y 50 reintentos por ejecución.

5. **Logs**: Los logs se guardan en:
   - `logs/scheduler.log` - Log del scheduler
   - `logs/YYYY-MM-DD.txt` - Log diario del sistema

---

## 🔧 Solución de Problemas

### Las notificaciones no se envían:
1. Verifica que el script se esté ejecutando periódicamente
2. Verifica la configuración de Email en `.env`
3. Verifica la configuración de WhatsApp en la BD
4. Revisa los errores en la tabla `notificaciones_pendientes`
5. Ejecuta manualmente: `python utilidades/procesar_notificaciones_v2.py --debug`

### WhatsApp no envía mensajes:
1. Verificar token de acceso no expirado
2. Verificar que el número esté registrado en Meta Business
3. Revisar errores en `whatsapp_mensajes.raw_json`
4. Verificar que no esté bloqueado globalmente (`whatsapp_desactivado`)

### Email no envía:
1. Verificar variables en `.env`
2. Probar conexión SMTP manualmente
3. Verificar que el puerto y SSL/TLS coincidan
4. Revisar logs para errores SMTP

### Error "PROCEDURE does not exist":
- Ejecuta: `python utilidades/crear_procedimientos_paso_a_paso.py`
- Esto creará los procedimientos almacenados necesarios

### Mensajes se quedan en "pendiente_reintento":
1. Verificar que el scheduler esté corriendo
2. Ejecutar manualmente: `python utilidades/procesar_notificaciones_v2.py --solo-reintentos`
3. Revisar el error en `whatsapp_mensajes.raw_json`

---

## 📁 Archivos del Sistema

| Archivo | Descripción |
|---------|-------------|
| `integraciones/sistema_notificaciones.py` | Sistema principal de notificaciones |
| `integraciones/sistema_notificaciones_v2.py` | Sistema V2 con procedimientos almacenados |
| `integraciones/email.py` | Integración SMTP |
| `integraciones/whatsapp.py` | Integración Meta Cloud API |
| `utilidades/procesar_notificaciones_v2.py` | Script de procesamiento |
| `utilidades/reintentar_mensajes_whatsapp.py` | Servicio de reintentos WA |
| `utilidades/ejecutar_notificaciones.bat` | Script Windows |
| `utilidades/ejecutar_notificaciones.sh` | Script Linux |
| `modelos/notificacion_modelo.py` | Modelo de notificaciones |
| `modelos/whatsapp_chat_modelo.py` | Modelo de chat WA |

