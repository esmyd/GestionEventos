CREATE TABLE IF NOT EXISTS configuracion_general (
  id INT NOT NULL AUTO_INCREMENT,
  nombre_plataforma VARCHAR(150) NOT NULL,
  login_titulo VARCHAR(150) NULL,
  login_subtitulo VARCHAR(255) NULL,
  login_boton_texto VARCHAR(80) NULL,
  login_left_titulo VARCHAR(150) NULL,
  login_left_texto TEXT NULL,
  login_left_items TEXT NULL,
  login_left_imagen TEXT NULL,
  login_acento_color VARCHAR(20) NULL,
  login_fondo_color VARCHAR(20) NULL,
  whatsapp_reengagement_template_id INT NULL,
  fecha_actualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
  ALTER TABLE configuracion_general ADD COLUMN  login_titulo VARCHAR(150) NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_subtitulo VARCHAR(255) NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_boton_texto VARCHAR(80) NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_left_titulo VARCHAR(150) NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_left_texto TEXT NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_left_items TEXT NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_left_imagen TEXT NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_acento_color VARCHAR(20) NULL;
  ALTER TABLE configuracion_general ADD COLUMN  login_fondo_color VARCHAR(20) NULL;
  ALTER TABLE configuracion_general ADD COLUMN  whatsapp_reengagement_template_id INT NULL;

INSERT INTO configuracion_general (
  nombre_plataforma,
  login_titulo,
  login_subtitulo,
  login_boton_texto,
  login_left_titulo,
  login_left_texto,
  login_left_items,
  login_left_imagen,
  login_acento_color,
  login_fondo_color,
  whatsapp_reengagement_template_id
)
SELECT
  'Lirios Eventos',
  'Bienvenido de vuelta',
  'Ingresa con tu usuario y contrasena.',
  'Ingresar',
  'Tu evento, organizado sin estres',
  'Reserva tu fecha, gestiona pagos y coordina cada detalle desde un solo lugar.',
  'Fechas y horarios en un clic\nPagos y recordatorios automatizados\nClientes informados en tiempo real\nReportes claros para tu equipo',
  '',
  '#16a34a',
  '#0f766e',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM configuracion_general);

UPDATE configuracion_general
SET
  login_titulo = COALESCE(login_titulo, 'Bienvenido de vuelta'),
  login_subtitulo = COALESCE(login_subtitulo, 'Ingresa con tu usuario y contrasena.'),
  login_boton_texto = COALESCE(login_boton_texto, 'Ingresar'),
  login_left_titulo = COALESCE(login_left_titulo, 'Tu evento, organizado sin estres'),
  login_left_texto = COALESCE(login_left_texto, 'Reserva tu fecha, gestiona pagos y coordina cada detalle desde un solo lugar.'),
  login_left_items = COALESCE(login_left_items, 'Fechas y horarios en un clic\nPagos y recordatorios automatizados\nClientes informados en tiempo real\nReportes claros para tu equipo'),
  login_acento_color = COALESCE(login_acento_color, '#16a34a'),
  login_fondo_color = COALESCE(login_fondo_color, '#0f766e');