-- ============================================================================
-- SISTEMA DE GESTIÓN DE EVENTOS - LIRIOS EVENTOS
-- DATOS DE EJEMPLO
-- ============================================================================
-- Este archivo contiene inserts de datos de ejemplo para toda la aplicación.
-- Ejecutar después de crear las tablas y procedimientos.
-- ============================================================================

USE lirios_eventos;

-- ============================================================================
-- USUARIOS DE EJEMPLO
-- ============================================================================
-- Contraseñas hasheadas con SHA256:
-- admin123 -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- gerente123 -> 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
-- coordinador123 -> (generar si es necesario)
-- cliente123 -> (generar si es necesario)
-- ============================================================================

INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, email, telefono, rol, activo) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador del Sistema', 'admin@lirioseventos.com', '1234567890', 'administrador', TRUE),
('gerente', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Gerente General', 'gerente@lirioseventos.com', '0987654321', 'gerente_general', TRUE),
('coordinador1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'María González', 'maria.gonzalez@lirioseventos.com', '1111111111', 'coordinador', TRUE),
('coordinador2', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Juan Pérez', 'juan.perez@lirioseventos.com', '2222222222', 'coordinador', TRUE)
ON DUPLICATE KEY UPDATE nombre_usuario=nombre_usuario;

-- ============================================================================
-- CLIENTES DE EJEMPLO
-- ============================================================================

-- Obtener IDs de usuarios creados para asociarlos a clientes
SET @admin_id = (SELECT id FROM usuarios WHERE nombre_usuario = 'admin' LIMIT 1);
SET @cliente1_id = (SELECT id FROM usuarios WHERE nombre_usuario = 'admin' LIMIT 1); -- Usar admin como cliente de ejemplo

-- Crear usuarios cliente si no existen
INSERT IGNORE INTO usuarios (nombre_usuario, contrasena, nombre_completo, email, telefono, rol, activo) VALUES
('cliente1', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Carlos Rodríguez', 'carlos.rodriguez@email.com', '3333333333', 'cliente', TRUE),
('cliente2', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Ana Martínez', 'ana.martinez@email.com', '4444444444', 'cliente', TRUE),
('cliente3', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Luis Fernández', 'luis.fernandez@email.com', '5555555555', 'cliente', TRUE);

-- Crear clientes asociados a usuarios
INSERT INTO clientes (usuario_id, documento_identidad, direccion) 
SELECT id, CONCAT('DNI-', id * 1000), CONCAT('Dirección ejemplo ', nombre_completo)
FROM usuarios 
WHERE rol = 'cliente' AND id NOT IN (SELECT usuario_id FROM clientes WHERE usuario_id IS NOT NULL)
ON DUPLICATE KEY UPDATE documento_identidad=documento_identidad;

-- ============================================================================
-- NOTA: CATEGORÍAS, PRODUCTOS, PAQUETES Y SALONES
-- ============================================================================
-- Los datos del catálogo oficial (categorías, productos, paquetes y salones)
-- se encuentran en el archivo: 03_datos_catalogo.sql
-- 
-- Ejecutar 03_datos_catalogo.sql después de este archivo para cargar
-- todos los datos del catálogo oficial de Lirios Eventos.
-- ============================================================================

-- ============================================================================
-- PROMOCIONES DE EJEMPLO
-- ============================================================================

INSERT INTO promociones (nombre, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, aplica_todos, activo) VALUES
('Descuento Temporada Baja', '10% de descuento en todos los planes durante temporada baja', 'porcentaje', 10.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH), TRUE, TRUE),
('Promoción Plan Premium', 'Descuento fijo de $200 en Plan Premium', 'monto_fijo', 200.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), FALSE, TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Asociar promoción a Plan Premium
UPDATE promociones 
SET plan_id = (SELECT id FROM planes WHERE nombre = 'Plan Premium' LIMIT 1)
WHERE nombre = 'Promoción Plan Premium';

-- ============================================================================
-- EVENTOS DE EJEMPLO
-- ============================================================================

-- Obtener IDs necesarios
SET @cliente1_evento_id = (SELECT c.id FROM clientes c JOIN usuarios u ON c.usuario_id = u.id WHERE u.nombre_usuario = 'cliente1' LIMIT 1);
SET @cliente2_evento_id = (SELECT c.id FROM clientes c JOIN usuarios u ON c.usuario_id = u.id WHERE u.nombre_usuario = 'cliente2' LIMIT 1);
SET @salon_principal_id = (SELECT id_salon FROM salones WHERE nombre = 'Salón Principal' LIMIT 1);
SET @plan_premium_id = (SELECT id FROM planes WHERE nombre = 'Plan Premium' LIMIT 1);
SET @coordinador1_id = (SELECT id FROM usuarios WHERE nombre_usuario = 'coordinador1' LIMIT 1);

-- Insertar eventos de ejemplo
INSERT INTO eventos (
    id_cliente, id_salon, plan_id, salon, nombre_evento, tipo_evento, 
    fecha_evento, hora_inicio, hora_fin, numero_invitados, 
    estado, total, saldo, total_pagado, coordinador_id, observaciones
) VALUES
(
    @cliente1_evento_id, 
    @salon_principal_id, 
    @plan_premium_id,
    'Salón Principal',
    'Boda de Carlos y Ana',
    'Boda',
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    '18:00:00',
    '02:00:00',
    120,
    'confirmado',
    3500.00,
    3500.00,
    0.00,
    @coordinador1_id,
    'Evento de boda con ceremonia y recepción'
),
(
    @cliente2_evento_id,
    (SELECT id_salon FROM salones WHERE nombre = 'Salón VIP' LIMIT 1),
    (SELECT id FROM planes WHERE nombre = 'Plan Básico' LIMIT 1),
    'Salón VIP',
    'Cumpleaños 50 años',
    'Cumpleaños',
    DATE_ADD(CURDATE(), INTERVAL 15 DAY),
    '19:00:00',
    '23:00:00',
    40,
    'confirmado',
    1200.00,
    600.00,
    600.00,
    @coordinador1_id,
    'Celebración de cumpleaños con familia y amigos cercanos'
),
(
    @cliente1_evento_id,
    (SELECT id_salon FROM salones WHERE nombre = 'Terraza' LIMIT 1),
    NULL,
    'Terraza',
    'Aniversario de Bodas',
    'Aniversario',
    DATE_ADD(CURDATE(), INTERVAL 60 DAY),
    '17:00:00',
    '21:00:00',
    80,
    'cotizacion',
    2000.00,
    2000.00,
    0.00,
    NULL,
    'Aniversario de bodas con cena al aire libre'
)
ON DUPLICATE KEY UPDATE nombre_evento=nombre_evento;

-- ============================================================================
-- PAGOS DE EJEMPLO
-- ============================================================================

-- Obtener ID del primer evento
SET @evento_boda_id = (SELECT id_evento FROM eventos WHERE nombre_evento = 'Boda de Carlos y Ana' LIMIT 1);
SET @evento_cumpleanos_id = (SELECT id_evento FROM eventos WHERE nombre_evento = 'Cumpleaños 50 años' LIMIT 1);
SET @admin_user_id = (SELECT id FROM usuarios WHERE nombre_usuario = 'admin' LIMIT 1);

-- Insertar pagos de ejemplo
INSERT INTO pagos (id_evento, monto, tipo_pago, metodo_pago, numero_referencia, fecha_pago, usuario_registro_id, observaciones) VALUES
(@evento_cumpleanos_id, 600.00, 'abono', 'transferencia', 'TRF-001', DATE_SUB(CURDATE(), INTERVAL 10 DAY), @admin_user_id, 'Abono inicial del 50%'),
(@evento_cumpleanos_id, 600.00, 'abono', 'efectivo', NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY), @admin_user_id, 'Abono final')
ON DUPLICATE KEY UPDATE id_evento=id_evento;

-- ============================================================================
-- RECURSOS HUMANOS DE EJEMPLO
-- ============================================================================

INSERT INTO recursos_humanos (nombre, tipo_recurso, telefono, email, tarifa_hora, disponible) VALUES
('Roberto Sánchez', 'mesonero', '6666666666', 'roberto.mesonero@email.com', 15.00, TRUE),
('DJ Carlos', 'dj', '7777777777', 'dj.carlos@email.com', 50.00, TRUE),
('Elena Decoradora', 'decorador', '8888888888', 'elena.decoradora@email.com', 40.00, TRUE),
('Servicios de Seguridad ABC', 'seguridad', '9999999999', 'seguridad.abc@email.com', 35.00, TRUE),
('Catering Gourmet', 'catering', '1010101010', 'catering.gourmet@email.com', 200.00, TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- ============================================================================
-- CONFIGURACIÓN DE NOTIFICACIONES
-- ============================================================================

INSERT INTO configuracion_notificaciones (
    tipo_notificacion, nombre, descripcion, activo, enviar_email, enviar_whatsapp,
    dias_antes, plantilla_email, plantilla_whatsapp
) VALUES
(
    'evento_creado',
    'Evento Creado',
    'Se envía cuando se crea un nuevo evento',
    TRUE, TRUE, FALSE, 0,
    'Estimado/a Administrador,

Se ha registrado un nuevo evento en el sistema. Detalles:

- Evento: {nombre_evento}
- Cliente: {nombre_cliente}
- Tipo: {tipo_evento}
- Fecha: {fecha_evento}
- Hora: {hora_inicio}
- Total: ${total}

Puede revisar y completar la informacion en el panel.

Saludos,
Sistema Lirios Eventos',
    'Lirios Eventos: nuevo evento registrado.
Evento: {nombre_evento}
Cliente: {nombre_cliente}
Fecha: {fecha_evento}
Hora: {hora_inicio}'
),
(
    'abono_recibido',
    'Abono Recibido',
    'Se envía cuando el cliente realiza un abono',
    TRUE, TRUE, TRUE, 0,
    'Estimado/a {nombre_cliente},

Hemos registrado su abono de ${monto} para el evento "{nombre_evento}".

Detalles del pago:
- Fecha: {fecha_pago}
- Metodo: {metodo_pago}
- Saldo pendiente: ${saldo_pendiente}

Gracias por su confianza.

Saludos,
Lirios Eventos',
    'Lirios Eventos: hemos registrado su abono de ${monto} para "{nombre_evento}". Saldo pendiente: ${saldo_pendiente}. Si necesita apoyo, estamos atentos.'
),
(
    'pago_completo',
    'Pago Completo',
    'Se envía cuando el cliente completa el pago total',
    TRUE, TRUE, TRUE, 0,
    'Estimado/a {nombre_cliente},

Confirmamos el pago total de su evento "{nombre_evento}".

Su evento queda confirmado para {fecha_evento} a las {hora_inicio}.

Si necesita algun ajuste adicional, estamos a su disposicion.

Saludos,
Lirios Eventos',
    'Lirios Eventos: pago completo recibido. Evento "{nombre_evento}" confirmado para {fecha_evento} {hora_inicio}.'
),
(
    'recordatorio_7_dias',
    'Recordatorio 7 Días Antes',
    'Se envía 7 días antes del evento',
    TRUE, TRUE, TRUE, 7,
    'Estimado/a {nombre_cliente},

Le recordamos que su evento "{nombre_evento}" esta programado para el {fecha_evento} a las {hora_inicio}.

Faltan 7 dias. Si requiere ajustes o coordinacion adicional, responda este mensaje.

Saludos,
Lirios Eventos',
    'Lirios Eventos: recordatorio 7 dias. Evento "{nombre_evento}" el {fecha_evento} a las {hora_inicio}.'
),
(
    'recordatorio_1_dia',
    'Recordatorio 1 Día Antes',
    'Se envía 1 día antes del evento',
    TRUE, TRUE, TRUE, 1,
    'Estimado/a {nombre_cliente},

Manana es su evento "{nombre_evento}".

Fecha y hora: {fecha_evento} a las {hora_inicio}.

Todo esta listo. Si necesita algo de ultimo momento, estamos atentos.

Saludos,
Lirios Eventos',
    'Lirios Eventos: recordatorio 1 dia. Evento "{nombre_evento}" manana {fecha_evento} a las {hora_inicio}.'
),
(
    'solicitud_calificacion',
    'Solicitud de Calificación',
    'Se envía después del evento para solicitar calificación',
    TRUE, TRUE, TRUE, -1,
    'Estimado/a {nombre_cliente},

Esperamos que su evento "{nombre_evento}" haya sido un exito.

Su opinion es muy importante para nosotros. Cuando tenga un momento, comparta su calificacion y comentarios.

Gracias por confiar en Lirios Eventos.

Saludos,
Lirios Eventos',
    'Lirios Eventos: gracias por su evento "{nombre_evento}". Su calificacion nos ayuda a mejorar.'
)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- ============================================================================
-- DESTINATARIOS ADICIONALES DE NOTIFICACIONES
-- ============================================================================
-- Ejemplo: Agregar un administrador para recibir notificaciones de eventos creados
-- Los destinatarios se pueden agregar desde el módulo de Notificaciones en la aplicación

-- ============================================================================
-- TIPOS DE EVENTOS
-- ============================================================================

INSERT INTO tipos_evento (nombre, descripcion, categoria, activo) VALUES
('Matrimonio', 'Ceremonia de matrimonio', 'social', TRUE),
('Quince Años', 'Celebración de quince años', 'social', TRUE),
('Fiesta Corporativa', 'Evento corporativo o empresarial', 'corporativo', TRUE),
('Bautizo', 'Ceremonia de bautismo', 'religioso', TRUE),
('Primera Comunión', 'Ceremonia de primera comunión', 'religioso', TRUE),
('Confirmación', 'Ceremonia de confirmación', 'religioso', TRUE),
('Graduación', 'Celebración de graduación', 'social', TRUE),
('Aniversario', 'Celebración de aniversario', 'familiar', TRUE),
('Cumpleaños', 'Celebración de cumpleaños', 'familiar', TRUE),
('Despedida de Soltero/a', 'Fiesta de despedida de soltero o soltera', 'social', TRUE),
('Baby Shower', 'Celebración para esperar un bebé', 'familiar', TRUE),
('Boda Civil', 'Boda civil', 'social', TRUE),
('Boda Religiosa', 'Boda religiosa', 'religioso', TRUE),
('Fiesta de Gala', 'Evento formal de gala', 'corporativo', TRUE),
('Cena de Negocios', 'Cena de negocios', 'corporativo', TRUE),
('Lanzamiento de Producto', 'Lanzamiento de producto o servicio', 'corporativo', TRUE),
('Conferencia', 'Conferencia o charla', 'corporativo', TRUE),
('Seminario', 'Seminario o taller', 'corporativo', TRUE),
('Taller', 'Taller educativo', 'corporativo', TRUE),
('Presentación', 'Presentación de proyecto o producto', 'corporativo', TRUE),
('Fiesta Temática', 'Fiesta con tema específico', 'social', TRUE),
('Celebración Familiar', 'Celebración familiar general', 'familiar', TRUE),
('Reunión Social', 'Reunión social', 'social', TRUE),
('Evento Deportivo', 'Evento relacionado con deportes', 'otro', TRUE),
('Concierto', 'Concierto o presentación musical', 'otro', TRUE),
('Festival', 'Festival cultural o artístico', 'otro', TRUE),
('Feria', 'Feria comercial o cultural', 'corporativo', TRUE),
('Misa de Acción de Gracias', 'Ceremonia religiosa de acción de gracias', 'religioso', TRUE),
('Misa de Difuntos', 'Ceremonia religiosa por fallecidos', 'religioso', TRUE),
('Velorio', 'Velorio o velatorio', 'familiar', TRUE),
('Almuerzo Familiar', 'Almuerzo familiar', 'familiar', TRUE),
('Cena Romántica', 'Cena romántica', 'social', TRUE),
('Fiesta Infantil', 'Fiesta para niños', 'familiar', TRUE),
('Bautizo de Adulto', 'Ceremonia de bautismo para adultos', 'religioso', TRUE),
('Bodas de Oro', 'Celebración de bodas de oro (50 años)', 'familiar', TRUE),
('Bodas de Plata', 'Celebración de bodas de plata (25 años)', 'familiar', TRUE),
('Compromiso', 'Celebración de compromiso', 'social', TRUE),
('Pedida de Mano', 'Celebración de pedida de mano', 'social', TRUE),
('Otro', 'Otro tipo de evento', 'otro', TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- ============================================================================
-- CONFIGURACIÓN GENERAL (DEMO CONTACTO/ESTABLECIMIENTO)
-- ============================================================================

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
  whatsapp_reengagement_template_id,
  contacto_nombre,
  contacto_email,
  contacto_telefono,
  contacto_whatsapp,
  establecimiento_direccion,
  establecimiento_horario
) VALUES (
  'Lirios Eventos',
  'Bienvenido a Lirios Eventos',
  'Gestiona tus eventos de forma profesional',
  'Iniciar Sesión',
  'Experiencias memorables',
  'Organizamos eventos con excelencia y cuidado en cada detalle.',
  'Atención personalizada\nCoordinación completa\nSoporte 24/7',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce',
  '#6366f1',
  '#111827',
  NULL,
  'Equipo Lirios Eventos',
  'contacto@lirioseventos.com',
  '+593 99 888 2233',
  '+593 99 888 2233',
  'Av. Principal 123, Quito, Ecuador',
  'Lunes a Domingo · 09:00 - 20:00'
)
ON DUPLICATE KEY UPDATE
  nombre_plataforma = VALUES(nombre_plataforma),
  login_titulo = VALUES(login_titulo),
  login_subtitulo = VALUES(login_subtitulo),
  login_boton_texto = VALUES(login_boton_texto),
  login_left_titulo = VALUES(login_left_titulo),
  login_left_texto = VALUES(login_left_texto),
  login_left_items = VALUES(login_left_items),
  login_left_imagen = VALUES(login_left_imagen),
  login_acento_color = VALUES(login_acento_color),
  login_fondo_color = VALUES(login_fondo_color),
  whatsapp_reengagement_template_id = VALUES(whatsapp_reengagement_template_id),
  contacto_nombre = VALUES(contacto_nombre),
  contacto_email = VALUES(contacto_email),
  contacto_telefono = VALUES(contacto_telefono),
  contacto_whatsapp = VALUES(contacto_whatsapp),
  establecimiento_direccion = VALUES(establecimiento_direccion),
  establecimiento_horario = VALUES(establecimiento_horario);

-- ============================================================================
-- FIN DEL ARCHIVO DE DATOS DE EJEMPLO
-- ============================================================================
-- NOTA: Los triggers automáticamente actualizarán los campos calculados
-- (como saldo y total_pagado en eventos) cuando se inserten pagos.
-- ============================================================================

