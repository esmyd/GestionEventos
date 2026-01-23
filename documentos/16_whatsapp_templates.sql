CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  idioma VARCHAR(20) NOT NULL DEFAULT 'es',
  categoria VARCHAR(50) NULL,
  descripcion VARCHAR(255) NULL,
  parametros INT NOT NULL DEFAULT 0,
  header_parametros INT NOT NULL DEFAULT 0,
  body_parametros INT NOT NULL DEFAULT 0,
  ejemplo TEXT NULL,
  header_ejemplo TEXT NULL,
  body_ejemplo TEXT NULL,
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_whatsapp_templates_nombre_idioma (nombre, idioma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


 ALTER TABLE whatsapp_templates ADD COLUMN  header_parametros INT NOT NULL DEFAULT 0;
  ALTER TABLE whatsapp_templates ADD COLUMN  body_parametros INT NOT NULL DEFAULT 0;
  ALTER TABLE whatsapp_templates ADD COLUMN  header_ejemplo TEXT NULL;
  ALTER TABLE whatsapp_templates ADD COLUMN  body_ejemplo TEXT NULL;

INSERT INTO whatsapp_templates (
  nombre, idioma, categoria, descripcion,
  parametros, header_parametros, body_parametros,
  ejemplo, header_ejemplo, body_ejemplo, activo
)
VALUES
  ('plantilla_de_captacion', 'es_EC', 'Marketing', 'Plantilla de captacion', 0, 0, 0, NULL, NULL, NULL, 1),
  ('pruebas', 'es', 'Marketing', 'Plantilla de pruebas', 0, 0, 0, NULL, NULL, NULL, 1),
  ('demo_chatbot', 'es', 'Marketing', 'Plantilla demo chatbot', 0, 1, 1, NULL, 'Gregorio Osorio', 'www.siglotecnologico.com', 1),
  ('hello_world', 'en_US', 'Utility', 'Plantilla hello world', 0, 0, 0, NULL, NULL, NULL, 1)
ON DUPLICATE KEY UPDATE
  categoria = VALUES(categoria),
  descripcion = VALUES(descripcion),
  parametros = VALUES(parametros),
  header_parametros = VALUES(header_parametros),
  body_parametros = VALUES(body_parametros),
  ejemplo = VALUES(ejemplo),
  header_ejemplo = VALUES(header_ejemplo),
  body_ejemplo = VALUES(body_ejemplo),
  activo = VALUES(activo);

UPDATE whatsapp_templates
SET body_parametros = parametros
WHERE body_parametros = 0 AND parametros > 0;
