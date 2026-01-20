# 📚 Documentación de Archivos SQL Consolidados

## 📋 Descripción

Se han consolidado todos los archivos de creación de base de datos en tres archivos SQL organizados y documentados:

1. **01_estructura_tablas.sql** - Estructura completa de todas las tablas
2. **02_triggers_funciones_procedimientos.sql** - Triggers, funciones y procedimientos almacenados
3. **03_datos_ejemplo.sql** - Datos de ejemplo para toda la aplicación

## 🚀 Instrucciones de Uso

### Paso 1: Crear la base de datos

```sql
CREATE DATABASE IF NOT EXISTS lirios_eventos;
USE lirios_eventos;
```

### Paso 2: Ejecutar los archivos en orden

Ejecuta los archivos SQL en el siguiente orden:

1. **01_estructura_tablas.sql** - Crea todas las tablas del sistema
2. **02_triggers_funciones_procedimientos.sql** - Crea triggers, funciones y procedimientos
3. **03_datos_ejemplo.sql** - Inserta datos de ejemplo (opcional, solo para desarrollo/testing)

### Ejemplo de ejecución desde MySQL:

```bash
mysql -u root -p lirios_eventos < 01_estructura_tablas.sql
mysql -u root -p lirios_eventos < 02_triggers_funciones_procedimientos.sql
mysql -u root -p lirios_eventos < 03_datos_ejemplo.sql
```

O desde MySQL Workbench:
- Abre cada archivo y ejecútalo en orden

## 📁 Contenido de cada archivo

### 01_estructura_tablas.sql

Contiene la definición de todas las tablas del sistema:
- usuarios
- clientes
- categorias
- productos
- planes
- plan_productos
- promociones
- salones
- eventos
- evento_productos
- inventario
- pagos
- recursos_humanos
- evento_recursos
- tareas_evento
- confirmaciones_cliente
- logs_sistema
- configuracion_integraciones
- configuracion_notificaciones
- historial_notificaciones
- notificaciones_pendientes

### 02_triggers_funciones_procedimientos.sql

Contiene:
- **Funciones:**
  - `notificacion_ya_enviada()` - Verifica si una notificación ya fue enviada
  - `dias_hasta_evento()` - Calcula días hasta el evento

- **Triggers:**
  - `actualizar_saldo_after_insert` - Actualiza saldo y total_pagado al insertar pago
  - `actualizar_saldo_after_update` - Actualiza saldo y total_pagado al actualizar pago
  - `actualizar_saldo_after_delete` - Actualiza saldo y total_pagado al eliminar pago
  - `trigger_notificar_abono` - Crea notificación cuando se registra un abono
  - `trigger_notificar_pago_completo` - Crea notificación cuando se completa el pago

- **Procedimientos:**
  - `crear_notificacion_inmediata()` - Crea notificación inmediata
  - `generar_notificaciones_programadas()` - Genera notificaciones programadas
  - `obtener_notificaciones_pendientes()` - Obtiene notificaciones pendientes
  - `marcar_notificacion_enviada()` - Marca notificación como enviada
  - `limpiar_notificaciones_antiguas()` - Limpia notificaciones antiguas

### 03_datos_ejemplo.sql

Contiene datos de ejemplo para:
- Usuarios (admin, gerente, coordinadores, clientes)
- Clientes asociados
- Categorías de productos
- Productos variados
- Salones disponibles
- Planes/paquetes
- Productos incluidos en planes
- Promociones
- Eventos de ejemplo
- Pagos de ejemplo
- Recursos humanos
- Configuración de notificaciones

## 🔐 Usuarios de Ejemplo

El archivo `03_datos_ejemplo.sql` crea los siguientes usuarios:

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| admin | admin123 | administrador | Administrador del sistema |
| gerente | gerente123 | gerente_general | Gerente general |
| coordinador1 | gerente123 | coordinador | María González |
| coordinador2 | gerente123 | coordinador | Juan Pérez |
| cliente1 | gerente123 | cliente | Carlos Rodríguez |
| cliente2 | gerente123 | cliente | Ana Martínez |
| cliente3 | gerente123 | cliente | Luis Fernández |

**Nota:** Todas las contraseñas están hasheadas con SHA256.

## ⚠️ Notas Importantes

1. **Orden de ejecución:** Es crítico ejecutar los archivos en el orden especificado debido a las dependencias entre tablas.

2. **Foreign Keys:** Las foreign keys están definidas en el archivo de estructura de tablas. Si necesitas recrear la base de datos, asegúrate de eliminar las tablas en orden inverso o deshabilitar temporalmente las foreign keys.

3. **Triggers automáticos:** Los triggers actualizarán automáticamente campos calculados como `saldo` y `total_pagado` en la tabla eventos cuando se inserten, actualicen o eliminen pagos.

4. **Datos de ejemplo:** El archivo `03_datos_ejemplo.sql` es opcional y solo debe usarse en entornos de desarrollo/testing. No ejecutes este archivo en producción.

5. **Estructura de eventos:** La tabla `eventos` usa `id_evento` como PRIMARY KEY (no `id`), lo cual es consistente con el código Python de la aplicación.

## 🔄 Recrear la Base de Datos

Si necesitas recrear completamente la base de datos (por ejemplo, si se eliminó):

### Método Rápido:

```bash
# Opción 1: Usar el script recrear_base_datos.sql
mysql -u root -p < recrear_base_datos.sql
mysql -u root -p lirios_eventos < 01_estructura_tablas.sql
mysql -u root -p lirios_eventos < 02_triggers_funciones_procedimientos.sql
mysql -u root -p lirios_eventos < 03_datos_ejemplo.sql  # Opcional
```

### Método Manual:

```sql
DROP DATABASE IF EXISTS lirios_eventos;
CREATE DATABASE lirios_eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lirios_eventos;

-- Luego ejecuta los archivos en orden
SOURCE 01_estructura_tablas.sql;
SOURCE 02_triggers_funciones_procedimientos.sql;
SOURCE 03_datos_ejemplo.sql;  -- Opcional
```

📖 **Ver `RECREAR_BASE_DATOS.md` para instrucciones detalladas y opciones de backup.**

## 📝 Archivos Originales (Obsoletos)

Los archivos originales dispersos en `utilidades/` y `database_setup.sql` han sido consolidados en estos tres archivos SQL principales.

### Estado de los archivos obsoletos

✅ **Los archivos obsoletos ya han sido eliminados.**

Todos los archivos que creaban tablas, triggers y procedimientos han sido eliminados ya que su funcionalidad está consolidada en estos 3 archivos SQL principales. Ver `ARCHIVOS_OBSOLETOS.md` para la lista completa de archivos que fueron eliminados.

### Archivos que SÍ se mantienen

Los siguientes archivos en `utilidades/` **SÍ deben mantenerse** porque son útiles para mantenimiento:
- `verificar_bd.py` - Verificación de estructura
- `verificar_*.py` - Scripts de verificación
- `crear_usuario.py` - Utilidad para crear usuarios
- `ejecutar_sql.py` - Utilidad para ejecutar SQL
- `configurar_email.py` - Configuración de email
- `widgets_fecha.py` - Widgets de interfaz
- `ventanas.py` - Utilidades de ventanas

Ver `ARCHIVOS_OBSOLETOS.md` para la lista completa de archivos consolidados.

