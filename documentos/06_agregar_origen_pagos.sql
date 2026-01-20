-- ============================================================================
-- Script para agregar columna 'origen' a la tabla pagos
-- ============================================================================
-- Este script agrega un campo para identificar si el pago fue registrado
-- desde la aplicación web o desde la aplicación de escritorio
-- ============================================================================

-- Agregar columna origen a la tabla pagos
ALTER TABLE pagos 
ADD COLUMN origen ENUM('web', 'desktop') DEFAULT 'desktop' 
AFTER usuario_registro_id;

-- Crear índice para mejorar consultas por origen
CREATE INDEX idx_origen ON pagos(origen);

-- Actualizar pagos existentes (por defecto serán 'desktop' ya que antes solo existía la app de escritorio)
-- Si necesitas cambiar algunos a 'web', puedes ejecutar:
-- UPDATE pagos SET origen = 'web' WHERE id IN (...);

-- ============================================================================
-- Verificación
-- ============================================================================
-- Para verificar que la columna se agregó correctamente:
-- DESCRIBE pagos;
-- SELECT origen, COUNT(*) FROM pagos GROUP BY origen;
