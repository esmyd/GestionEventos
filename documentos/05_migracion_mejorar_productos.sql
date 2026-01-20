-- ============================================================================
-- MIGRACIÓN: MEJORAR ESTRUCTURA DE PRODUCTOS
-- ============================================================================
-- Esta migración agrega campos adicionales a la tabla productos para
-- almacenar mejor la información del catálogo de servicios
-- ============================================================================

USE lirios_eventos;

-- ============================================================================
-- AGREGAR NUEVOS CAMPOS A LA TABLA productos
-- ============================================================================

-- Duración en horas (para servicios con tiempo específico)
ALTER TABLE productos 
ADD COLUMN duracion_horas INT NULL 
COMMENT 'Duración del servicio en horas (ej: 2, 3, 4, 6 horas)'
AFTER precio;

-- Precio mínimo (para productos con rangos de precio)
ALTER TABLE productos 
ADD COLUMN precio_minimo DECIMAL(10, 2) NULL 
COMMENT 'Precio mínimo del producto/servicio'
AFTER precio;

-- Precio máximo (para productos con rangos de precio)
ALTER TABLE productos 
ADD COLUMN precio_maximo DECIMAL(10, 2) NULL 
COMMENT 'Precio máximo del producto/servicio'
AFTER precio_minimo;

-- Variantes/Opciones (JSON o texto para almacenar opciones del producto)
ALTER TABLE productos 
ADD COLUMN variantes TEXT NULL 
COMMENT 'Variantes u opciones del producto (ej: "3x3: $350, 4x3: $400, 5x4: $550")'
AFTER descripcion;

-- Tipo de producto/servicio
ALTER TABLE productos 
ADD COLUMN tipo_servicio ENUM('servicio', 'equipo', 'producto', 'paquete', 'otro') DEFAULT 'servicio' 
COMMENT 'Tipo de producto/servicio'
AFTER unidad_medida;

-- Detalles adicionales
ALTER TABLE productos 
ADD COLUMN detalles_adicionales TEXT NULL 
COMMENT 'Información adicional del producto (incluye, características especiales, etc.)'
AFTER descripcion;

-- Índices para mejorar búsquedas
CREATE INDEX idx_duracion_horas ON productos(duracion_horas);
CREATE INDEX idx_tipo_servicio ON productos(tipo_servicio);
CREATE INDEX idx_precio_minimo ON productos(precio_minimo);
CREATE INDEX idx_precio_maximo ON productos(precio_maximo);

-- ============================================================================
-- ACTUALIZAR COMENTARIOS DE CAMPOS EXISTENTES
-- ============================================================================

ALTER TABLE productos 
MODIFY COLUMN descripcion TEXT 
COMMENT 'Descripción general del producto/servicio';

ALTER TABLE productos 
MODIFY COLUMN precio DECIMAL(10, 2) 
COMMENT 'Precio base del producto/servicio (o precio único si no hay variantes)';

ALTER TABLE productos 
MODIFY COLUMN unidad_medida VARCHAR(20) 
COMMENT 'Unidad de medida (unidad, servicio, hora, evento, etc.)';

-- ============================================================================
-- NOTAS
-- ============================================================================
-- Los nuevos campos permiten:
-- 1. Duración: Para servicios como Photobooth (2 o 3 horas), Fotografía (2, 4, 6 horas)
-- 2. Precio mínimo/máximo: Para productos con rangos (ej: Video 360: $150-$180)
-- 3. Variantes: Para productos con opciones (ej: Pista LED con diferentes tamaños)
-- 4. Tipo de servicio: Para categorizar mejor (servicio, equipo, producto, paquete)
-- 5. Detalles adicionales: Para información extra como "Incluye gafas y sombreros"
-- ============================================================================

