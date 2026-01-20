# Proyecto Final SIGIE - Lirios Eventos
## Base de Datos Avanzada - Metodología ABP

Este proyecto implementa una solución **COMPLETA** de base de datos para el sistema de gestión de eventos **Lirios Eventos**, cumpliendo con **TODOS** los requerimientos técnicos del proyecto final SIGIE siguiendo la metodología ABP (Aprendizaje Basado en Proyectos).

---

## 📋 ARCHIVO PRINCIPAL

**SIGIE_Proyecto_Final_Completo.sql** - Script SQL completo con DDL y DML completos, incluyendo todos los componentes requeridos.

---

## ✅ REQUERIMIENTOS CUMPLIDOS

### 1. ESTRUCTURA DDL ✓

#### Creación completa de la base de datos
- ✅ Base de datos `lirios_eventos` con charset UTF8MB4
- ✅ **14 tablas** con relaciones bien definidas:
  1. `usuarios` - Usuarios del sistema
  2. `clientes` - Información de clientes
  3. `categorias` - Categorías de productos
  4. `productos` - Productos y servicios
  5. `planes` - Planes/paquetes
  6. `plan_productos` - Relación planes-productos
  7. `salones` - Salones disponibles
  8. `eventos` - Eventos gestionados
  9. `evento_productos` - Productos por evento
  10. `pagos` - Pagos registrados
  11. `recursos_humanos` - Personal disponible
  12. `evento_recursos` - Asignación de recursos
  13. `inventario` - Control de inventario
  14. `logs_sistema` - Auditoría del sistema

#### Restricciones implementadas
- ✅ **Primary Keys (PK)**: En todas las tablas
- ✅ **Foreign Keys (FK)**: Relaciones entre tablas con ON DELETE/ON UPDATE apropiados
- ✅ **UNIQUE**: Campos únicos (nombre_usuario, email, documento_identidad, nombre de salones)
- ✅ **CHECK**: Validación de valores (precios >= 0, cantidades > 0, saldo >= 0)
- ✅ **NULL / NOT NULL**: Aplicado según requerimientos de negocio

#### Tipos de datos correctamente aplicados
- ✅ DECIMAL(10,2) para valores monetarios
- ✅ INT para identificadores y cantidades
- ✅ VARCHAR con tamaños apropiados
- ✅ ENUM para estados y categorías
- ✅ TIMESTAMP para fechas automáticas
- ✅ TEXT para descripciones largas
- ✅ JSON para datos estructurados (en tabla temporal)

#### 3 ALTER TABLE
1. ✅ Agregar columna `descuento_aplicado` a eventos
2. ✅ Agregar columna `fecha_confirmacion` a eventos
3. ✅ Agregar índice compuesto `idx_fecha_estado_total` a eventos

#### 1 DROP TABLE
- ✅ Eliminación de tabla temporal `eventos_temporales_log` (demostrativo)

---

### 2. ESTRUCTURA DML ✓

#### Mínimo 20 INSERT distribuidos
- ✅ **22 INSERT** distribuidos en:
  - Usuarios: 6 registros (admin, coordinadores, gerente, clientes)
  - Clientes: 3 registros
  - Categorías: 3 registros
  - Productos: 4 registros
  - Salones: 3 registros
  - Eventos: 3 registros
  - Pagos: 3 registros

#### SELECT complejos con:
- ✅ **WHERE**: Condiciones múltiples y complejas
- ✅ **GROUP BY**: Agrupaciones por campos y funciones de fecha
- ✅ **HAVING**: Filtrado de grupos agregados
- ✅ **ORDER BY**: Ordenamiento por múltiples campos
- ✅ **JOIN**: 
  - INNER JOIN: Eventos con clientes y salones
  - LEFT JOIN: Productos con su uso en eventos
  - RIGHT JOIN: Recursos humanos con asignaciones

#### 3 UPDATE
1. ✅ Actualizar fecha de confirmación de eventos confirmados
2. ✅ Aplicar descuento del 5% a eventos con saldo alto
3. ✅ Actualizar estado de eventos pasados a completado

#### 3 DELETE
1. ✅ Eliminar logs antiguos (más de 1 año)
2. ✅ Eliminar productos inactivos sin uso
3. ✅ Eliminar asignaciones de recursos no confirmadas y antiguas

---

### 3. ÍNDICES (Mínimo 5) ✓

1. ✅ **B-Tree**: `idx_producto_precio` en productos(precio)
2. ✅ **B-Tree**: `idx_evento_fecha_estado` en eventos(fecha_evento, estado)
3. ✅ **Compuesto**: `idx_evento_producto_completo` en evento_productos (4 columnas)
4. ✅ **Único**: `idx_inventario_producto_evento_unico` en inventario
5. ✅ **B-Tree adicional**: `idx_recurso_tipo_tarifa` en recursos_humanos

---

### 4. TRIGGERS (Mínimo 5) ✓

1. ✅ `trg_auditoria_evento_insert` (AFTER INSERT) - Registrar creación de eventos
2. ✅ `trg_actualizar_stock_producto_insert` (AFTER INSERT) - Actualizar stock al agregar productos
3. ✅ `trg_validar_integridad_financiera_update` (BEFORE UPDATE) - Validar integridad financiera
4. ✅ `trg_registrar_cambio_estado_evento` (AFTER UPDATE) - Registrar cambios de estado
5. ✅ `trg_prevenir_eliminar_evento_con_pagos` (BEFORE DELETE) - Prevenir eliminación con pagos

---

### 5. PROCEDIMIENTOS ALMACENADOS (Mínimo 2) ✓

1. ✅ `sp_calcular_total_evento` (parámetro IN) - Calcular total incluyendo productos y descuentos
2. ✅ `sp_estadisticas_financieras_periodo` (parámetros OUT) - Estadísticas financieras del período

#### Procedimientos adicionales:
- ✅ `sp_recalcular_totales_eventos` (con cursor)
- ✅ `sp_confirmar_evento_con_abono` (con transacción)

---

### 6. FUNCIONES (Mínimo 2) ✓

1. ✅ `fn_dias_hasta_evento` - Función escalar de fecha (calcula días hasta evento)
2. ✅ `fn_estado_evento_texto` - Función de conversión (convierte estado a texto descriptivo)

---

### 7. CURSORES (1 cursor funcional completo) ✓

- ✅ `sp_recalcular_totales_eventos`: 
  - DECLARE cursor
  - OPEN cursor
  - FETCH en loop
  - LOOP con procesamiento
  - CLOSE cursor
  - Manejo de errores con handlers

---

### 8. TRANSACCIONES ✓

- ✅ `sp_confirmar_evento_con_abono`: 
  - START TRANSACTION
  - Validaciones lógicas antes de commit
  - COMMIT al éxito
  - ROLLBACK en caso de error
  - Validaciones: monto mínimo, saldo disponible, fecha futura

---

### 9. SEGURIDAD ✓

#### Roles creados:
1. ✅ `rol_admin_lirios` - Acceso total al sistema
2. ✅ `rol_coordinador_lirios` - Gestión de eventos y pagos
3. ✅ `rol_cliente_lirios` - Solo lectura de sus eventos
4. ✅ `rol_gerente_lirios` - Lectura y reportes
5. ✅ `rol_reportes_lirios` - Solo lectura para reportes

#### Comentarios sobre:
- ✅ Cifrado de datos sensibles (SHA2, recomendaciones para bcrypt/argon2)
- ✅ Estrategias de respaldo (diarios, incrementales, retención)
- ✅ Control de acceso y hardening
- ✅ Buenas prácticas de seguridad

---

### 10. SOSTENIBILIDAD TECNOLÓGICA ✓

- ✅ Diseño normalizado (3NF)
- ✅ Consultas optimizadas con índices
- ✅ Minimización de recursos (triggers eficientes, procedimientos)
- ✅ Eliminación de redundancias (normalización, triggers para consistencia)
- ✅ Uso responsable de datos (auditoría, validaciones)
- ✅ Comentarios explicativos completos en todo el script

---

## 🚀 INSTALACIÓN

### Opción 1: Script completo (nueva instalación)
```bash
mysql -u root -p < SIGIE_Proyecto_Final_Completo.sql
```

### Opción 2: Solo componentes adicionales (sobre base existente)
Si ya tienes la base de datos, ejecuta solo desde la sección 2 en adelante.

---

## 📊 ESTRUCTURA DE TABLAS

### Relaciones Principales

```
usuarios (1) ────< (N) clientes
clientes (1) ────< (N) eventos
eventos (1) ────< (N) pagos
eventos (1) ────< (N) evento_productos
productos (1) ────< (N) evento_productos
categorias (1) ────< (N) productos
planes (1) ────< (N) plan_productos
productos (1) ────< (N) plan_productos
eventos (1) ────< (N) evento_recursos
recursos_humanos (1) ────< (N) evento_recursos
usuarios (1) ────< (N) eventos (coordinador)
```

---

## 🔧 EJEMPLOS DE USO

### Consultar eventos próximos con función
```sql
SELECT 
    id_evento,
    nombre_evento,
    fn_dias_hasta_evento(fecha_evento) AS dias_restantes,
    fn_estado_evento_texto(estado) AS estado
FROM eventos
WHERE fecha_evento >= CURDATE()
ORDER BY fecha_evento;
```

### Calcular total de un evento
```sql
CALL sp_calcular_total_evento(1);
```

### Obtener estadísticas financieras
```sql
SET @total_ventas = 0;
SET @total_cobrado = 0;
SET @saldo_pendiente = 0;
SET @numero_eventos = 0;
SET @eventos_completados = 0;
SET @eventos_confirmados = 0;

CALL sp_estadisticas_financieras_periodo('2024-01-01', '2024-12-31', 
    @total_ventas, @total_cobrado, @saldo_pendiente, 
    @numero_eventos, @eventos_completados, @eventos_confirmados);

SELECT 
    @total_ventas AS total_ventas,
    @total_cobrado AS total_cobrado,
    @saldo_pendiente AS saldo_pendiente,
    @numero_eventos AS numero_eventos,
    @eventos_completados AS eventos_completados,
    @eventos_confirmados AS eventos_confirmados;
```

### Recalcular totales (usa cursor)
```sql
CALL sp_recalcular_totales_eventos();
```

### Confirmar evento con abono (usando transacción)
```sql
CALL sp_confirmar_evento_con_abono(
    1,                          -- id_evento
    1000.00,                    -- monto_abono
    'transferencia',            -- metodo_pago
    'TRF-CONF-001',             -- numero_referencia
    1                           -- usuario_id
);
```

---

## 📝 RESUMEN TÉCNICO

### Componentes Totales Implementados

| Componente | Cantidad | Estado |
|------------|----------|--------|
| **DDL - Base de datos** | 1 | ✅ |
| **DDL - Tablas** | 14 | ✅ |
| **DDL - ALTER TABLE** | 3 | ✅ |
| **DDL - DROP TABLE** | 1 | ✅ |
| **DML - INSERT** | 22+ | ✅ |
| **DML - SELECT complejos** | 6+ | ✅ |
| **DML - UPDATE** | 3 | ✅ |
| **DML - DELETE** | 3 | ✅ |
| **Índices** | 6 | ✅ |
| **Triggers** | 5 | ✅ |
| **Procedimientos** | 4 | ✅ |
| **Funciones** | 2 | ✅ |
| **Cursores** | 1 | ✅ |
| **Transacciones** | 1 | ✅ |
| **Roles de seguridad** | 5 | ✅ |

---

## 🔒 SEGURIDAD IMPLEMENTADA

### Roles y Privilegios

1. **rol_admin_lirios**: Control total (ALL PRIVILEGES)
2. **rol_coordinador_lirios**: Gestión de eventos, productos y pagos
3. **rol_cliente_lirios**: Solo lectura de sus eventos
4. **rol_gerente_lirios**: Lectura completa y ejecución de procedimientos de reportes
5. **rol_reportes_lirios**: Solo lectura para generación de reportes

### Buenas Prácticas de Seguridad Documentadas

- Cifrado de contraseñas (SHA2 → bcrypt/argon2 recomendado)
- Respaldos diarios e incrementales
- Control de acceso basado en roles
- Auditoría mediante logs_sistema
- Hardening de MySQL

---

## 📚 DOCUMENTACIÓN

El script incluye comentarios extensivos en cada sección explicando:
- Propósito de cada componente
- Funcionalidad de triggers, procedimientos y funciones
- Buenas prácticas de diseño
- Optimizaciones implementadas
- Consideraciones de seguridad

---

## ✅ VALIDACIÓN

Para validar que todos los componentes están instalados:

```sql
-- Verificar triggers
SHOW TRIGGERS;

-- Verificar procedimientos
SHOW PROCEDURE STATUS WHERE Db = 'lirios_eventos';

-- Verificar funciones
SHOW FUNCTION STATUS WHERE Db = 'lirios_eventos';

-- Verificar índices
SHOW INDEX FROM eventos;
SHOW INDEX FROM productos;
SHOW INDEX FROM pagos;

-- Verificar roles
SELECT * FROM mysql.roles_mapping WHERE User LIKE '%lirios%';
```

---

## 🎓 METODOLOGÍA ABP APLICADA

1. **COMPRENSIÓN DEL RETO**: Sistema de gestión de eventos para Lirios Eventos
2. **PLANIFICACIÓN**: Diseño completo de estructura de base de datos con 14 tablas
3. **DESARROLLO ITERATIVO**: Implementación progresiva de todos los componentes
4. **EVALUACIÓN TÉCNICA**: Script validado y probado con datos de ejemplo
5. **PRESENTACIÓN**: Documentación completa y código comentado

---

**Proyecto completado al 100% cumpliendo todos los requerimientos técnicos del proyecto final SIGIE**
