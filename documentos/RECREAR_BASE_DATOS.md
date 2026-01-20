# 🔄 Cómo Recrear la Base de Datos

## ⚠️ Si se Elimina tu Base de Datos

Si tu base de datos `lirios_eventos` se elimina por accidente, puedes recrearla fácilmente usando los archivos SQL consolidados.

## 🚀 Método Rápido (Recomendado)

### Opción 1: Usando el script SQL (más fácil)

```sql
-- 1. Ejecutar script de recreación
SOURCE recrear_base_datos.sql;

-- 2. Ejecutar estructura de tablas
SOURCE 01_estructura_tablas.sql;

-- 3. Ejecutar triggers y procedimientos
SOURCE 02_triggers_funciones_procedimientos.sql;

-- 4. (Opcional) Insertar datos de ejemplo
SOURCE 03_datos_ejemplo.sql;
```

### Opción 2: Desde línea de comandos MySQL

```bash
# 1. Eliminar y recrear base de datos
mysql -u root -p < recrear_base_datos.sql

# 2. Crear estructura de tablas
mysql -u root -p lirios_eventos < 01_estructura_tablas.sql

# 3. Crear triggers y procedimientos
mysql -u root -p lirios_eventos < 02_triggers_funciones_procedimientos.sql

# 4. (Opcional) Insertar datos de ejemplo
mysql -u root -p lirios_eventos < 03_datos_ejemplo.sql
```

### Opción 3: Desde MySQL Workbench

1. Abre MySQL Workbench
2. Conecta a tu servidor MySQL
3. Abre cada archivo SQL en orden y ejecútalo:
   - `recrear_base_datos.sql`
   - `01_estructura_tablas.sql`
   - `02_triggers_funciones_procedimientos.sql`
   - `03_datos_ejemplo.sql` (opcional)

## 📋 Pasos Detallados Manuales

Si prefieres hacerlo paso a paso manualmente:

### Paso 1: Eliminar base de datos existente (si existe)

```sql
DROP DATABASE IF EXISTS lirios_eventos;
```

### Paso 2: Crear nueva base de datos

```sql
CREATE DATABASE lirios_eventos 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE lirios_eventos;
```

### Paso 3: Ejecutar archivos SQL en orden

```sql
-- Importante: Ejecutar en este orden exacto

SOURCE 01_estructura_tablas.sql;
SOURCE 02_triggers_funciones_procedimientos.sql;
SOURCE 03_datos_ejemplo.sql;  -- Opcional, solo para desarrollo
```

## ⚠️ Advertencias Importantes

1. **Perderás todos los datos**: Si recreas la base de datos, todos los datos existentes se perderán.

2. **Orden de ejecución es crítico**: Debes ejecutar los archivos en el orden correcto:
   - Primero las tablas
   - Luego los triggers/procedimientos
   - Finalmente los datos (si quieres)

3. **Datos de ejemplo**: El archivo `03_datos_ejemplo.sql` solo es para desarrollo/testing. No lo ejecutes en producción si ya tienes datos reales.

## 💾 Backup Recomendado

**Antes de recrear la base de datos, haz un backup si tienes datos importantes:**

```bash
# Backup de la base de datos existente
mysqldump -u root -p lirios_eventos > backup_lirios_eventos_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde backup (si necesitas recuperar)
mysql -u root -p lirios_eventos < backup_lirios_eventos_YYYYMMDD_HHMMSS.sql
```

## ✅ Verificación

Después de recrear la base de datos, verifica que todo esté correcto:

```bash
# Ejecutar script de verificación
python utilidades/verificar_bd.py
```

Este script verificará que todas las tablas necesarias estén creadas.

## 📝 Archivos Necesarios

Asegúrate de tener estos archivos en la raíz del proyecto:

- ✅ `recrear_base_datos.sql` - Script para eliminar y crear la BD
- ✅ `01_estructura_tablas.sql` - Estructura de todas las tablas
- ✅ `02_triggers_funciones_procedimientos.sql` - Triggers y procedimientos
- ✅ `03_datos_ejemplo.sql` - Datos de ejemplo (opcional)

## 🔄 Resumen Rápido

```bash
# Todo en una línea (desde la raíz del proyecto):
mysql -u root -p < recrear_base_datos.sql && \
mysql -u root -p lirios_eventos < 01_estructura_tablas.sql && \
mysql -u root -p lirios_eventos < 02_triggers_funciones_procedimientos.sql && \
mysql -u root -p lirios_eventos < 03_datos_ejemplo.sql
```

