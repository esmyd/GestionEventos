-- Modulo de chat WhatsApp (conversaciones, mensajes y estado del bot)

CREATE TABLE IF NOT EXISTS whatsapp_conversaciones (
  id INT NOT NULL AUTO_INCREMENT,
  telefono VARCHAR(30) NOT NULL,
  cliente_id INT NULL,
  bot_activo TINYINT(1) DEFAULT 1,
  ultima_interaccion TIMESTAMP NULL DEFAULT NULL,
  last_cliente_interaccion TIMESTAMP NULL DEFAULT NULL,
  requiere_reengagement TINYINT(1) DEFAULT 0,
  ultimo_error_reengagement TEXT NULL,
  fecha_ultimo_error TIMESTAMP NULL DEFAULT NULL,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_telefono (telefono),
  KEY idx_cliente (cliente_id),
  CONSTRAINT fk_whatsapp_conversaciones_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_mensajes (
  id INT NOT NULL AUTO_INCREMENT,
  conversacion_id INT NOT NULL,
  direccion ENUM('in', 'out') NOT NULL,
  mensaje TEXT,
  media_type VARCHAR(20) NULL,
  media_id VARCHAR(120) NULL,
  media_url TEXT NULL,
  wa_message_id VARCHAR(120) NULL,
  origen VARCHAR(20) NULL,
  estado VARCHAR(50) NULL,
  raw_json TEXT NULL,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_wa_message (wa_message_id),
  KEY idx_conversacion (conversacion_id),
  CONSTRAINT fk_whatsapp_mensajes_conversacion
    FOREIGN KEY (conversacion_id) REFERENCES whatsapp_conversaciones (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_bot_estado (
  conversacion_id INT NOT NULL,
  estado VARCHAR(50) NOT NULL,
  datos_json TEXT NULL,
  fecha_actualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (conversacion_id),
  CONSTRAINT fk_whatsapp_bot_estado_conversacion
    FOREIGN KEY (conversacion_id) REFERENCES whatsapp_conversaciones (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Si la tabla ya existe, aplicar columnas nuevas (MySQL 8.0+)
ALTER TABLE whatsapp_mensajes
  ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS media_id VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS media_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS wa_message_id VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS origen VARCHAR(20) NULL;

ALTER TABLE whatsapp_mensajes
  ADD INDEX IF NOT EXISTS idx_wa_message (wa_message_id);

ALTER TABLE whatsapp_conversaciones
  ADD COLUMN IF NOT EXISTS last_cliente_interaccion TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS requiere_reengagement TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ultimo_error_reengagement TEXT NULL,
  ADD COLUMN IF NOT EXISTS fecha_ultimo_error TIMESTAMP NULL;
