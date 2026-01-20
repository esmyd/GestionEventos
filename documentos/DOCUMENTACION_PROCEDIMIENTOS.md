# Documentación de Procedimientos Almacenados - Sistema de Notificaciones

## 📋 Resumen

Se han creado procedimientos almacenados y funciones en MySQL para optimizar el sistema de notificaciones, reduciendo significativamente el código Python necesario.

## ✅ Procedimientos y Funciones Creados

### Funciones

#### 1. `notificacion_ya_enviada(p_evento_id, p_tipo_notificacion)`
**Descripción:** Verifica si una notificación ya fue enviada para un evento específico.

**Parámetros:**
- `p_evento_id` (INT): ID del evento
- `p_tipo_notificacion` (VARCHAR(50)): Tipo de notificación

**Retorna:** BOOLEAN (TRUE si ya fue enviada, FALSE si no)

**Ejemplo de uso:**
```sql
SELECT notificacion_ya_enviada(1, 'abono_recibido');
```

#### 2. `dias_hasta_evento(p_fecha_evento)`
**Descripción:** Calcula cuántos días faltan hasta el evento (negativo si ya pasó).

**Parámetros:**
- `p_fecha_evento` (DATE): Fecha del evento

**Retorna:** INT (número de días)

**Ejemplo de uso:**
```sql
SELECT dias_hasta_evento('2024-12-25');
```

### Procedimientos Almacenados

#### 1. `obtener_notificaciones_pendientes(p_limite)`
**Descripción:** Obtiene las notificaciones que están listas para enviar.

**Parámetros:**
- `p_limite` (INT, opcional): Número máximo de notificaciones a retornar (por defecto 100)

**Retorna:** Lista de notificaciones pendientes con:
- id, evento_id, tipo_notificacion, canal
- destinatario_email, destinatario_telefono
- asunto, mensaje_email, mensaje_whatsapp
- fecha_programada, intentos

**Ejemplo de uso desde Python:**
```python
from modelos.notificacion_modelo_v2 import NotificacionModeloV2
modelo = NotificacionModeloV2()
notificaciones = modelo.obtener_notificaciones_pendientes(limite=50)
```

#### 2. `marcar_notificacion_enviada(p_notificacion_id, p_exito, p_error)`
**Descripción:** Marca una notificación como enviada o registra un error.

**Parámetros:**
- `p_notificacion_id` (INT): ID de la notificación en `notificaciones_pendientes`
- `p_exito` (BOOLEAN): TRUE si se envió exitosamente, FALSE si hubo error
- `p_error` (TEXT, opcional): Mensaje de error si hubo fallo

**Acciones:**
- Si `p_exito = TRUE`: Marca como enviada y registra en historial
- Si `p_exito = FALSE`: Incrementa intentos y guarda el error

**Ejemplo de uso desde Python:**
```python
modelo.marcar_como_enviada(notificacion_id=123, exito=True)
modelo.marcar_como_enviada(notificacion_id=124, exito=False, error="Email no válido")
```

#### 3. `limpiar_notificaciones_antiguas(p_dias)`
**Descripción:** Elimina notificaciones enviadas con más de X días de antigüedad.

**Parámetros:**
- `p_dias` (INT, opcional): Días de antigüedad para eliminar (por defecto 90)

**Ejemplo de uso desde Python:**
```python
modelo.limpiar_antiguas(dias=90)
```

## 📊 Tabla: `notificaciones_pendientes`

Esta tabla almacena todas las notificaciones que deben enviarse. El sistema Python solo necesita consultar esta tabla y enviar.

### Estructura:
- `id`: ID único
- `evento_id`: ID del evento relacionado
- `tipo_notificacion`: Tipo de notificación
- `canal`: 'email', 'whatsapp' o 'ambos'
- `destinatario_email`: Email del destinatario
- `destinatario_telefono`: Teléfono del destinatario
- `asunto`: Asunto del correo
- `mensaje_email`: Mensaje para email
- `mensaje_whatsapp`: Mensaje para WhatsApp
- `fecha_programada`: Fecha/hora programada para envío
- `fecha_envio`: Fecha/hora de envío real
- `enviado`: BOOLEAN - si ya fue enviada
- `intentos`: Número de intentos de envío
- `error`: Mensaje de error si falló

## 🔄 Flujo de Trabajo

### 1. Notificaciones Inmediatas (Abonos, Pagos)
Los triggers (o código Python) crean notificaciones directamente en `notificaciones_pendientes` con `fecha_programada = NOW()`.

### 2. Notificaciones Programadas (Recordatorios)
Un script Python ejecuta periódicamente:
1. Busca eventos que necesitan notificaciones
2. Crea registros en `notificaciones_pendientes` con la fecha programada

### 3. Procesamiento de Notificaciones
El script `procesar_notificaciones_v2.py`:
1. Llama a `obtener_notificaciones_pendientes()` para obtener notificaciones listas
2. Envía cada notificación por Email/WhatsApp
3. Llama a `marcar_notificacion_enviada()` para registrar el resultado

## 📝 Uso desde Python

### Modelo Simplificado

```python
from modelos.notificacion_modelo_v2 import NotificacionModeloV2
from integraciones.sistema_notificaciones_v2 import SistemaNotificacionesV2

# Obtener notificaciones pendientes
modelo = NotificacionModeloV2()
notificaciones = modelo.obtener_notificaciones_pendientes(limite=50)

# Procesar notificaciones (método completo)
sistema = SistemaNotificacionesV2()
enviadas, errores = sistema.procesar_notificaciones_pendientes(limite=50)
```

### Script de Procesamiento

```bash
# Ejecutar diariamente
python utilidades/procesar_notificaciones_v2.py
```

## 🎯 Ventajas

1. **Menos código Python**: La lógica compleja está en MySQL
2. **Mejor rendimiento**: Los procedimientos se ejecutan en el servidor
3. **Consistencia**: La lógica está centralizada en la base de datos
4. **Mantenibilidad**: Cambios en la lógica solo requieren actualizar procedimientos
5. **Escalabilidad**: MySQL maneja mejor grandes volúmenes de datos

## 🔧 Mantenimiento

### Ver procedimientos creados:
```sql
SHOW PROCEDURE STATUS WHERE Db = 'lirios_eventos';
SHOW FUNCTION STATUS WHERE Db = 'lirios_eventos';
```

### Ver estructura de un procedimiento:
```sql
SHOW CREATE PROCEDURE obtener_notificaciones_pendientes;
```

### Eliminar un procedimiento:
```sql
DROP PROCEDURE IF EXISTS nombre_procedimiento;
DROP FUNCTION IF EXISTS nombre_funcion;
```

## 📌 Notas Importantes

1. Los procedimientos complejos (`crear_notificacion_inmediata` y `generar_notificaciones_programadas`) se manejan desde Python para facilitar el mantenimiento y debugging.

2. Los triggers para notificaciones automáticas se pueden crear cuando sea necesario, pero por ahora se manejan desde Python al registrar pagos.

3. La tabla `notificaciones_pendientes` es la fuente de verdad para el sistema de envío. Python solo consulta y actualiza esta tabla.

4. El historial completo se mantiene en `historial_notificaciones` para auditoría.

