# 📊 Documentación: Total Pagado en Eventos

## ✅ Cambios Implementados

### 1. Nueva Columna en Tabla `eventos`

Se agregó la columna `total_pagado` a la tabla `eventos` para almacenar la suma de todos los abonos realizados.

```sql
ALTER TABLE eventos 
ADD COLUMN total_pagado DECIMAL(10, 2) DEFAULT 0.00 
AFTER saldo
```

### 2. Triggers Actualizados

Los triggers de MySQL ahora actualizan automáticamente tanto `saldo` como `total_pagado` cuando se insertan, actualizan o eliminan pagos:

- **Trigger AFTER INSERT**: Actualiza `total_pagado` y `saldo` al crear un pago
- **Trigger AFTER UPDATE**: Actualiza `total_pagado` y `saldo` al modificar un pago
- **Trigger AFTER DELETE**: Actualiza `total_pagado` y `saldo` al eliminar un pago

### 3. Validación de Pagos

El método `crear_pago()` ahora valida que:

1. **No se exceda el monto total**: Si el total pagado + nuevo monto > monto total del evento, se lanza un error
2. **No se permitan más abonos si ya está pagado**: Si `total_pagado >= precio_total`, no se permiten más abonos

**Excepciones**:
- Los reembolsos (`tipo_pago = 'reembolso'`) NO están sujetos a esta validación

### 4. Mensajes de Error Mejorados

La vista de pagos ahora muestra mensajes claros cuando:
- Se intenta exceder el monto total
- Se intenta agregar un abono cuando el evento ya está completamente pagado

## 🔄 Flujo de Trabajo

### Al Registrar un Pago:

1. **Validación en Python**:
   - Verifica que el evento exista
   - Calcula el total pagado actual
   - Valida que `total_pagado + monto_nuevo <= precio_total`
   - Si ya está pagado completamente, rechaza el pago

2. **Inserción en Base de Datos**:
   - Se inserta el pago en la tabla `pagos`

3. **Trigger Automático**:
   - Calcula el nuevo `total_pagado` (suma de todos los abonos)
   - Calcula el nuevo `saldo` (precio_total - total_pagado + reembolsos)
   - Actualiza ambos campos en la tabla `eventos`

## 📋 Ejemplo de Uso

### Escenario 1: Pago Normal
- Evento con precio total: $1000.00
- Total pagado actual: $600.00
- Nuevo abono: $300.00
- **Resultado**: ✅ Permitido (total sería $900.00, menor a $1000.00)

### Escenario 2: Excede el Monto Total
- Evento con precio total: $1000.00
- Total pagado actual: $800.00
- Nuevo abono: $300.00
- **Resultado**: ❌ Rechazado (total sería $1100.00, mayor a $1000.00)
- **Mensaje**: "No se puede registrar el pago. Total pagado actual: $800.00, Monto a agregar: $300.00, Total sería: $1100.00, pero el monto total del evento es: $1000.00"

### Escenario 3: Ya Está Pagado
- Evento con precio total: $1000.00
- Total pagado actual: $1000.00
- Nuevo abono: $100.00
- **Resultado**: ❌ Rechazado (ya está completamente pagado)
- **Mensaje**: "El evento ya está completamente pagado. Total pagado: $1000.00, Monto total: $1000.00"

### Escenario 4: Reembolso
- Evento con precio total: $1000.00
- Total pagado actual: $1000.00
- Nuevo reembolso: $200.00
- **Resultado**: ✅ Permitido (los reembolsos no están sujetos a validación)

## 🔧 Scripts de Configuración

### 1. Agregar Columna
```bash
python utilidades/agregar_total_pagado_eventos.py
```

### 2. Actualizar Triggers
```bash
python utilidades/actualizar_triggers_con_total_pagado.py
```

## 📊 Consultas Útiles

### Ver total pagado de un evento:
```sql
SELECT id_evento, salon, total, total_pagado, saldo 
FROM eventos 
WHERE id_evento = 1;
```

### Ver todos los eventos con su estado de pago:
```sql
SELECT 
    e.id_evento,
    e.salon,
    e.total,
    e.total_pagado,
    e.saldo,
    CASE 
        WHEN e.total_pagado >= e.total AND e.total > 0 THEN 'Pagado'
        WHEN e.total_pagado > 0 THEN 'Parcial'
        ELSE 'Sin pagos'
    END as estado_pago
FROM eventos e;
```

### Verificar consistencia:
```sql
SELECT 
    e.id_evento,
    e.total_pagado as total_pagado_evento,
    COALESCE(SUM(p.monto), 0) as total_pagado_calculado,
    e.total_pagado - COALESCE(SUM(p.monto), 0) as diferencia
FROM eventos e
LEFT JOIN pagos p ON e.id_evento = p.id_evento AND p.tipo_pago != 'reembolso'
GROUP BY e.id_evento, e.total_pagado
HAVING diferencia != 0;
```

## ⚠️ Notas Importantes

1. **Los triggers se ejecutan automáticamente**: No es necesario llamar manualmente a métodos de actualización
2. **Los reembolsos no cuentan como pagos**: Se restan del saldo pero no se suman al total_pagado
3. **La validación es en Python**: Se realiza antes de insertar en la base de datos
4. **Consistencia garantizada**: Los triggers aseguran que `total_pagado` siempre esté actualizado

