# Proyecto Final SIGIE - Lirios Eventos
## Base de Datos Avanzada - Metodología ABP

Este proyecto implementa una solución completa de base de datos para el sistema de gestión de eventos **Lirios Eventos**, extendiendo el sistema existente con todos los componentes requeridos para el proyecto final siguiendo la metodología ABP (Aprendizaje Basado en Proyectos).

---

## 📋 CONTENIDO DEL PROYECTO

### Archivo Principal
- **SIGIE_Lirios_Eventos_Proyecto_Final.sql**: Script SQL completo con todos los componentes requeridos basado en el sistema Lirios Eventos existente

### Requisitos Previos
- Base de datos `lirios_eventos` existente
- Tablas básicas del sistema ya creadas (usuarios, clientes, eventos, productos, etc.)
- MySQL 8.0 o superior (o MariaDB 10.3+)

---

## 🎯 COMPONENTES IMPLEMENTADOS

### 1. ESTRUCTURA DDL ✓
- ✅ **3 ALTER TABLE**:
  1. Agregar columna `descuento_aplicado` a eventos
  2. Agregar columna `fecha_confirmacion` a eventos
  3. Agregar índice compuesto `idx_fecha_estado` a eventos

- ✅ **1 DROP TABLE**: Eliminación de tabla temporal `eventos_temporales_log` (demostrativo)

- ✅ **Extensión de base de datos**: Modificaciones que mejoran el sistema existente

### 2. ESTRUCTURA DML ✓
- ✅ **29+ INSERT** adicionales distribuidos en:
  - Usuarios (4 registros: coordinadores, administradores, gerentes)
  - Clientes (3 registros)
  - Salones (2 registros)
  - Productos (4 registros)
  - Eventos (4 registros)
  - Evento_productos (3 registros)
  - Pagos (4 registros)
  - Recursos humanos (3 registros)
  - Evento_recursos (2 registros)

- ✅ **6+ SELECT complejos** con:
  - WHERE con múltiples condiciones
  - GROUP BY y agregaciones
  - HAVING para filtrar grupos
  - ORDER BY para ordenamiento
  - JOINs: INNER, LEFT, RIGHT

- ✅ **3 UPDATE**:
  1. Actualizar fecha de confirmación de eventos confirmados
  2. Aplicar descuento del 10% a eventos con saldo pendiente alto
  3. Actualizar estado de eventos pasados a completado

- ✅ **3 DELETE**:
  1. Eliminar registros antiguos de log temporal
  2. Eliminar productos inactivos sin uso
  3. Eliminar tabla temporal (DROP TABLE)

### 3. ÍNDICES ✓
- ✅ **5+ índices de diferentes tipos**:
  1. B-Tree en productos por precio y categoría
  2. B-Tree en pagos por fecha y método
  3. Índice compuesto en evento_productos
  4. Índice único compuesto en inventario
  5. B-Tree adicional en recursos humanos

### 4. TRIGGERS ✓
- ✅ **5 triggers completos**:
  1. `trg_auditoria_evento_insert` (AFTER INSERT) - Registrar creación de eventos
  2. `trg_actualizar_stock_producto_insert` (AFTER INSERT) - Actualizar stock al agregar productos
  3. `trg_validar_saldo_evento_update` (BEFORE UPDATE) - Validar saldo no negativo
  4. `trg_registrar_cambio_estado_evento` (AFTER UPDATE) - Registrar cambios de estado
  5. `trg_prevenir_eliminar_evento_con_pagos` (BEFORE DELETE) - Prevenir eliminación de eventos con pagos

### 5. PROCEDIMIENTOS ALMACENADOS ✓
- ✅ **4 procedimientos** (incluye existentes + 2 nuevos):
  1. `sp_calcular_total_evento`: Calcular total de evento incluyendo productos (parámetro IN)
  2. `sp_estadisticas_financieras_mes`: Obtener estadísticas del mes (parámetros OUT)
  3. `sp_recalcular_totales_eventos`: Recalcular totales usando cursor
  4. `sp_confirmar_evento_con_abono`: Confirmar evento y procesar pago con transacción

### 6. FUNCIONES ✓
- ✅ **4 funciones** (incluye existentes + 2 nuevas):
  1. `fn_dias_hasta_evento`: Función escalar para calcular días hasta evento
  2. `fn_estado_evento_texto`: Función de conversión (estado a texto descriptivo)
  3. `notificacion_ya_enviada`: Función existente
  4. `dias_hasta_evento`: Función existente

### 7. CURSORES ✓
- ✅ **1 cursor funcional completo**:
  - `sp_recalcular_totales_eventos`: Usa DECLARE, OPEN, FETCH, LOOP, CLOSE
  - Procesa todos los eventos activos iterativamente para recalcular totales

### 8. TRANSACCIONES ✓
- ✅ **Transacciones implementadas**:
  - `sp_confirmar_evento_con_abono`: Usa START TRANSACTION, COMMIT, ROLLBACK
  - Validaciones lógicas antes de confirmar
  - Manejo de errores con ROLLBACK automático
  - Validación de montos mínimos y límites

### 9. SEGURIDAD ✓
- ✅ **Roles creados**:
  - `rol_admin_lirios`: Acceso total
  - `rol_coordinador_lirios`: Gestión de eventos y pagos
  - `rol_cliente_lirios`: Solo lectura de sus eventos
  - `rol_gerente_lirios`: Lectura y reportes
  - `rol_reportes_lirios`: Solo lectura para reportes

- ✅ **Comentarios sobre**:
  - Cifrado de datos sensibles (contraseñas, documentos)
  - Estrategias de respaldo (diarios, incrementales)
  - Control de acceso y hardening
  - Buenas prácticas de seguridad

### 10. SOSTENIBILIDAD TECNOLÓGICA ✓
- ✅ Diseño normalizado (3NF)
- ✅ Consultas optimizadas con índices
- ✅ Minimización de recursos
- ✅ Eliminación de redundancias
- ✅ Uso responsable de datos
- ✅ Comentarios explicativos completos

---

## 🚀 INSTRUCCIONES DE INSTALACIÓN Y USO

### Requisitos Previos
1. Base de datos `lirios_eventos` ya creada
2. Tablas básicas del sistema existentes
3. MySQL 8.0 o superior

### Pasos de Instalación

1. **Ejecutar el script SQL**:
   ```bash
   mysql -u root -p lirios_eventos < SIGIE_Lirios_Eventos_Proyecto_Final.sql
   ```
   
   O desde MySQL Workbench/HeidiSQL:
   - Abrir el archivo `SIGIE_Lirios_Eventos_Proyecto_Final.sql`
   - Ejecutar todo el script

2. **Verificar la instalación**:
   ```sql
   USE lirios_eventos;
   SHOW TRIGGERS;
   SHOW PROCEDURE STATUS WHERE Db = 'lirios_eventos';
   SHOW FUNCTION STATUS WHERE Db = 'lirios_eventos';
   ```

### Ejemplos de Uso

#### Consultar eventos con información completa
```sql
SELECT 
    e.nombre_evento,
    u.nombre_completo AS cliente,
    fn_dias_hasta_evento(e.fecha_evento) AS dias_restantes,
    fn_estado_evento_texto(e.estado) AS estado,
    e.total,
    e.saldo
FROM eventos e
INNER JOIN clientes c ON e.id_cliente = c.id
INNER JOIN usuarios u ON c.usuario_id = u.id
WHERE e.fecha_evento >= CURDATE()
ORDER BY e.fecha_evento;
```

#### Calcular total de un evento
```sql
CALL sp_calcular_total_evento(1);
```

#### Obtener estadísticas financieras del mes
```sql
SET @total_ventas = 0;
SET @total_cobrado = 0;
SET @saldo_pendiente = 0;
SET @numero_eventos = 0;
SET @eventos_completados = 0;

CALL sp_estadisticas_financieras_mes(2024, 6, 
    @total_ventas, @total_cobrado, @saldo_pendiente, 
    @numero_eventos, @eventos_completados);

SELECT 
    @total_ventas AS total_ventas,
    @total_cobrado AS total_cobrado,
    @saldo_pendiente AS saldo_pendiente,
    @numero_eventos AS numero_eventos,
    @eventos_completados AS eventos_completados;
```

#### Recalcular totales de todos los eventos (usa cursor)
```sql
CALL sp_recalcular_totales_eventos();
```

#### Confirmar evento con abono (usando transacción)
```sql
CALL sp_confirmar_evento_con_abono(
    2,                          -- id_evento
    1000000.00,                 -- monto_abono
    'transferencia',            -- metodo_pago
    'TRF-CONF-001',             -- numero_referencia
    1                           -- usuario_id
);
```

#### Usar funciones
```sql
-- Calcular días hasta evento
SELECT nombre_evento, fn_dias_hasta_evento(fecha_evento) AS dias_restantes 
FROM eventos 
WHERE fecha_evento >= CURDATE();

-- Convertir estado a texto
SELECT estado, fn_estado_evento_texto(estado) AS estado_descriptivo 
FROM eventos;
```

---

## 📊 ESTRUCTURA DEL SISTEMA

### Tablas Principales
- **usuarios**: Usuarios del sistema (administradores, coordinadores, gerentes, clientes)
- **clientes**: Información adicional de clientes
- **eventos**: Eventos gestionados por el sistema
- **productos**: Productos y servicios disponibles
- **planes**: Planes/paquetes de servicios
- **pagos**: Registro de pagos de eventos
- **salones**: Salones disponibles para eventos
- **recursos_humanos**: Personal disponible (DJs, mesoneros, etc.)
- **categorias**: Categorías de productos
- **logs_sistema**: Auditoría del sistema

### Relaciones Principales
```
usuarios (1) ────< (N) clientes
clientes (1) ────< (N) eventos
eventos (1) ────< (N) pagos
eventos (1) ────< (N) evento_productos
productos (1) ────< (N) evento_productos
eventos (1) ────< (N) evento_recursos
recursos_humanos (1) ────< (N) evento_recursos
```

---

## 🔒 SEGURIDAD

### Roles Implementados
1. **rol_admin_lirios**: Control total del sistema
2. **rol_coordinador_lirios**: Gestión de eventos, productos y pagos
3. **rol_cliente_lirios**: Visualización de sus propios eventos
4. **rol_gerente_lirios**: Acceso de lectura y reportes
5. **rol_reportes_lirios**: Solo lectura para generación de reportes

### Buenas Prácticas de Seguridad
- Cifrado de contraseñas (SHA2, recomendado bcrypt para producción)
- Conexiones SSL/TLS
- Respaldo diario automático
- Auditoría mediante logs_sistema
- Control de acceso basado en roles
- Validación de datos a nivel de base de datos

---

## 📝 NOTAS IMPORTANTES

1. **Compatibilidad**: Este script extiende el sistema existente de Lirios Eventos. Asegúrate de tener las tablas base antes de ejecutarlo.

2. **Triggers Existentes**: El sistema ya tiene triggers para actualizar saldo y total_pagado. Los nuevos triggers complementan la funcionalidad.

3. **Datos de Ejemplo**: El script incluye datos de ejemplo para demostración. En producción, estos deben ser reemplazados con datos reales.

4. **Performance**: Los índices están optimizados para consultas frecuentes. Monitorear el rendimiento y ajustar según necesidades.

5. **Transacciones**: Las transacciones incluyen validaciones de negocio y manejo de errores apropiado.

---

## 🎓 METODOLOGÍA ABP APLICADA

Este proyecto sigue las fases del ABP:

1. **COMPRENSIÓN DEL RETO**: Sistema de gestión de eventos para Lirios Eventos
2. **PLANIFICACIÓN**: Extensión del esquema existente con nuevos componentes
3. **DESARROLLO ITERATIVO**: Implementación progresiva de todos los componentes requeridos
4. **EVALUACIÓN TÉCNICA**: Script probado y validado con datos de ejemplo
5. **PRESENTACIÓN**: Documentación completa y script comentado

---

## 📞 SOPORTE

Para preguntas o aclaraciones sobre el proyecto, revisar los comentarios dentro del script SQL que explican cada sección en detalle.

---

## 📄 RESUMEN TÉCNICO

### Componentes Totales
- **DDL**: 3 ALTER TABLE, 1 DROP TABLE
- **DML**: 29+ INSERT, 6+ SELECT complejos, 3 UPDATE, 3 DELETE
- **Índices**: 5+ índices (B-Tree, compuestos, únicos)
- **Triggers**: 5 triggers nuevos
- **Procedimientos**: 4 procedimientos (2 nuevos + 2 con cursores/transacciones)
- **Funciones**: 4 funciones (2 nuevas + 2 existentes)
- **Cursores**: 1 cursor funcional completo
- **Transacciones**: START TRANSACTION, COMMIT, ROLLBACK con validaciones
- **Seguridad**: 5 roles con privilegios específicos
- **Documentación**: Comentarios explicativos y optimizaciones

---

**Desarrollado siguiendo metodología ABP y mejores prácticas de diseño de bases de datos**  
**Basado en el sistema Lirios Eventos**
