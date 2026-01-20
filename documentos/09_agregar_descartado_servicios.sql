-- Agregar campo descartado a evento_servicios
ALTER TABLE evento_servicios 
ADD COLUMN IF NOT EXISTS descartado TINYINT(1) DEFAULT 0 AFTER completado;

-- Actualizar servicios existentes para que no estén descartados
UPDATE evento_servicios SET descartado = 0 WHERE descartado IS NULL;
