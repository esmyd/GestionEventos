-- ============================================================================
-- PERMISOS POR ROL
-- ============================================================================
-- Crea tabla para almacenar permisos (modulos/acciones) por rol
-- ============================================================================

USE lirios_eventos;

CREATE TABLE IF NOT EXISTS rol_permisos (
    rol VARCHAR(50) PRIMARY KEY,
    permisos_json TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
