-- ============================================================================
-- PERMISOS POR USUARIO
-- ============================================================================
-- Crea tabla para almacenar permisos (modulos) por usuario
-- ============================================================================

USE lirios_eventos;

CREATE TABLE IF NOT EXISTS usuario_permisos (
    usuario_id INT PRIMARY KEY,
    permisos_json TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
