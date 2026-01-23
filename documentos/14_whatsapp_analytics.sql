-- Panel de métricas y control de envíos (WhatsApp/Email)

CREATE TABLE IF NOT EXISTS whatsapp_metricas_config (
  id INT NOT NULL AUTO_INCREMENT,
  precio_whatsapp DECIMAL(10,4) DEFAULT 0,
  precio_email DECIMAL(10,4) DEFAULT 0,
  whatsapp_desactivado TINYINT(1) DEFAULT 0,
  fecha_actualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO whatsapp_metricas_config (precio_whatsapp, precio_email, whatsapp_desactivado)
SELECT 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM whatsapp_metricas_config);

CREATE TABLE IF NOT EXISTS whatsapp_control_clientes (
  id INT NOT NULL AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  bloquear_whatsapp TINYINT(1) DEFAULT 0,
  bloquear_email TINYINT(1) DEFAULT 0,
  precio_whatsapp DECIMAL(10,4) NULL,
  precio_email DECIMAL(10,4) NULL,
  fecha_actualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cliente (cliente_id),
  CONSTRAINT fk_whatsapp_control_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campos adicionales para mensajes (si no existen)
ALTER TABLE whatsapp_mensajes
  ADD COLUMN IF NOT EXISTS origen VARCHAR(20) NULL;
