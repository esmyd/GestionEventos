-- --------------------------------------------------------
-- Host:                         localhost
-- Versión del servidor:         8.0.30 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para lirios_eventos
CREATE DATABASE IF NOT EXISTS `lirios_eventos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lirios_eventos`;

-- Volcando estructura para tabla lirios_eventos.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.categorias: ~19 rows (aproximadamente)
INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'Proteínas', 'Productos de proteína para eventos', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(2, 'Arreglos', 'Arreglos florales y decorativos', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(3, 'DJ', 'Servicios de DJ y música', 1, '2026-01-03 20:17:49', '2026-01-03 20:58:37'),
	(4, 'Iluminación', 'Equipos de iluminación', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(5, 'Sonido', 'Equipos de sonido y audio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(6, 'Mobiliario', 'Mesas, sillas y mobiliario', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(7, 'Mantelería', 'Manteles, servilletas y textiles', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(8, 'Catering', 'Servicios de comida y bebida', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(9, 'Fotografía', 'Servicios de fotografía y video', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(10, 'Decoración', 'Elementos decorativos generales', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(11, 'Entretenimiento', 'Show, animación y entretenimiento', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(12, 'Animación', 'Servicios de animación y entretenimiento', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(13, 'Efectos Especiales', 'Efectos de luces, humo y ambiente', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(14, 'Shows Temáticos', 'Shows y presentaciones temáticas', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(15, 'Multimedia', 'Servicios de video, fotografía y multimedia', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(16, 'Transporte', 'Servicios de transporte', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(17, 'Seguridad', 'Servicios de seguridad', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(18, 'Otros', 'Otras categorías', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49');

-- Volcando estructura para tabla lirios_eventos.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `documento_identidad` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.clientes: ~4 rows (aproximadamente)
INSERT INTO `clientes` (`id`, `usuario_id`, `documento_identidad`, `direccion`, `fecha_registro`) VALUES
	(1, 5, '0962398350', 'Dirección ejemplo Carlos Rodríguez', '2025-12-28 23:37:12'),
	(2, 6, '0962398350', 'Dirección ejemplo Ana Martínez', '2025-12-28 23:37:12'),
	(3, 7, '0962398350', 'Dirección ejemplo Luis Fernández', '2025-12-28 23:37:12'),
	(4, 8, '09623352556', 'Pruebas de nuevo cliente', '2025-12-31 23:37:58'),
	(5, 10, '096235126512', 'alborad.....', '2026-01-08 00:00:59');

-- Volcando estructura para tabla lirios_eventos.configuracion_integraciones
CREATE TABLE IF NOT EXISTS `configuracion_integraciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_integracion` enum('whatsapp','google_sheets','email') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `configuracion` json DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tipo` (`tipo_integracion`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.configuracion_integraciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla lirios_eventos.configuracion_notificaciones
CREATE TABLE IF NOT EXISTS `configuracion_notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_notificacion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `enviar_email` tinyint(1) DEFAULT '1',
  `enviar_whatsapp` tinyint(1) DEFAULT '1',
  `dias_antes` int DEFAULT '0' COMMENT 'Días antes del evento (0 = inmediato, -1 = después del evento)',
  `plantilla_email` text COLLATE utf8mb4_unicode_ci,
  `plantilla_whatsapp` text COLLATE utf8mb4_unicode_ci,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tipo_notificacion` (`tipo_notificacion`),
  KEY `idx_tipo` (`tipo_notificacion`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.configuracion_notificaciones: ~6 rows (aproximadamente)
INSERT INTO `configuracion_notificaciones` (`id`, `tipo_notificacion`, `nombre`, `descripcion`, `activo`, `enviar_email`, `enviar_whatsapp`, `dias_antes`, `plantilla_email`, `plantilla_whatsapp`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'evento_creado', 'Evento Creado', 'Se envía cuando se crea un nuevo evento', 1, 1, 0, 0, 'Estimado/a Administrador,\r\n\r\nSe ha creado un nuevo evento en el sistema:\r\n\r\n- Evento: {nombre_evento}\r\n- Cliente: {nombre_cliente}\r\n- Tipo: {tipo_evento}\r\n- Fecha: {fecha_evento}\r\n- Hora: {hora_inicio}\r\n- Total: ${total}\r\n\r\nPor favor, revise los detalles del evento en el sistema.\r\n\r\nSaludos,\r\nSistema Lirios Eventos', 'Nuevo evento creado: {nombre_evento} - Cliente: {nombre_cliente} - Fecha: {fecha_evento}', '2025-12-29 00:52:50', '2025-12-29 00:52:50'),
	(2, 'abono_recibido', 'Abono Recibido', 'Se envía cuando el cliente realiza un abono', 1, 1, 1, 0, 'Estimado/a {nombre_cliente},\r\n\r\nLe confirmamos que hemos recibido su abono de ${monto} para el evento "{nombre_evento}".\r\n\r\nDetalles del pago:\r\n- Fecha: {fecha_pago}\r\n- Método: {metodo_pago}\r\n- Saldo pendiente: ${saldo_pendiente}\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de ${monto} para el evento "{nombre_evento}". Saldo pendiente: ${saldo_pendiente}', '2025-12-29 00:52:50', '2025-12-29 00:52:50'),
	(3, 'pago_completo', 'Pago Completo', 'Se envía cuando el cliente completa el pago total', 1, 1, 1, 0, 'Estimado/a {nombre_cliente},\r\n\r\n¡Excelente noticia! Hemos recibido el pago completo para el evento "{nombre_evento}".\r\n\r\nSu evento está completamente confirmado y listo para la fecha programada: {fecha_evento}.\r\n\r\nNos vemos pronto.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ ¡Pago completo recibido! Su evento "{nombre_evento}" está confirmado para {fecha_evento}. ¡Nos vemos pronto!', '2025-12-29 00:52:50', '2025-12-29 00:52:50'),
	(4, 'recordatorio_7_dias', 'Recordatorio 7 Días Antes', 'Se envía 7 días antes del evento', 1, 1, 1, 7, 'Estimado/a {nombre_cliente},\r\n\r\nEste es un recordatorio de que su evento "{nombre_evento}" está programado para el {fecha_evento} a las {hora_inicio}.\r\n\r\nFaltan 7 días para su evento. Si tiene alguna pregunta o necesita hacer algún ajuste, no dude en contactarnos.\r\n\r\nSaludos,\r\nLirios Eventos', '📅 Recordatorio: Su evento "{nombre_evento}" es en 7 días ({fecha_evento} a las {hora_inicio}). ¡Estamos listos para hacerlo especial!', '2025-12-29 00:52:50', '2025-12-29 00:52:50'),
	(5, 'recordatorio_1_dia', 'Recordatorio 1 Día Antes', 'Se envía 1 día antes del evento', 1, 1, 1, 1, 'Estimado/a {nombre_cliente},\r\n\r\n¡Mañana es el gran día!\r\n\r\nSu evento "{nombre_evento}" está programado para mañana, {fecha_evento} a las {hora_inicio}.\r\n\r\nTodo está listo. Si tiene alguna última pregunta, estamos a su disposición.\r\n\r\n¡Nos vemos mañana!\r\n\r\nSaludos,\r\nLirios Eventos', '🎉 ¡Mañana es el gran día! Su evento "{nombre_evento}" es mañana ({fecha_evento} a las {hora_inicio}). ¡Todo está listo!', '2025-12-29 00:52:50', '2025-12-29 00:52:50'),
	(6, 'solicitud_calificacion', 'Solicitud de Calificación', 'Se envía después del evento para solicitar calificación', 1, 1, 1, -1, 'Estimado/a {nombre_cliente},\r\n\r\nEsperamos que su evento "{nombre_evento}" haya sido todo un éxito.\r\n\r\nSu opinión es muy importante para nosotros. Nos encantaría conocer su experiencia y cómo podemos mejorar.\r\n\r\nPor favor, comparta su calificación y comentarios con nosotros.\r\n\r\nGracias por confiar en Lirios Eventos.\r\n\r\nSaludos,\r\nLirios Eventos', '🙏 Esperamos que su evento "{nombre_evento}" haya sido exitoso. Su opinión es importante. ¿Podría compartir su experiencia?', '2025-12-29 00:52:50', '2025-12-29 00:52:50');

-- Volcando estructura para procedimiento lirios_eventos.crear_notificacion_inmediata
DELIMITER //
CREATE PROCEDURE `crear_notificacion_inmediata`(
    IN p_evento_id INT,
    IN p_tipo_notificacion VARCHAR(50),
    IN p_monto DECIMAL(10,2),
    IN p_metodo_pago VARCHAR(50)
)
BEGIN
    DECLARE v_config_id INT;
    DECLARE v_enviar_email BOOLEAN;
    DECLARE v_enviar_whatsapp BOOLEAN;
    DECLARE v_plantilla_email TEXT;
    DECLARE v_plantilla_whatsapp TEXT;
    DECLARE v_nombre_cliente VARCHAR(255);
    DECLARE v_nombre_evento VARCHAR(255);
    DECLARE v_fecha_evento DATE;
    DECLARE v_hora_inicio TIME;
    DECLARE v_saldo_pendiente DECIMAL(10,2);
    DECLARE v_email VARCHAR(255);
    DECLARE v_telefono VARCHAR(20);
    DECLARE v_asunto VARCHAR(255);
    DECLARE v_mensaje_email TEXT;
    DECLARE v_mensaje_whatsapp TEXT;
    DECLARE v_canal ENUM('email', 'whatsapp', 'ambos');
    
    -- Verificar si la notificación ya fue enviada (salir silenciosamente si ya fue enviada)
    -- Este procedimiento se llama desde triggers, no puede retornar result sets
    IF NOT notificacion_ya_enviada(p_evento_id, p_tipo_notificacion) THEN
        -- Obtener configuración de la notificación
        SELECT id, enviar_email, enviar_whatsapp, plantilla_email, plantilla_whatsapp
        INTO v_config_id, v_enviar_email, v_enviar_whatsapp, v_plantilla_email, v_plantilla_whatsapp
        FROM configuracion_notificaciones
        WHERE tipo_notificacion = p_tipo_notificacion
        AND activo = TRUE
        LIMIT 1;
        
        -- Si hay configuración activa, continuar
        IF v_config_id IS NOT NULL THEN
            -- Obtener datos del evento y cliente
            SELECT 
                COALESCE(e.salon, e.nombre_evento, 'Evento'),
                e.fecha_evento,
                e.hora_inicio,
                e.saldo,
                u.nombre_completo,
                u.email,
                u.telefono
            INTO 
                v_nombre_evento,
                v_fecha_evento,
                v_hora_inicio,
                v_saldo_pendiente,
                v_nombre_cliente,
                v_email,
                v_telefono
            FROM eventos e
            LEFT JOIN clientes c ON e.id_cliente = c.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE e.id_evento = p_evento_id
            LIMIT 1;
            
            -- Si hay evento, continuar
            IF v_nombre_evento IS NOT NULL THEN
                -- Reemplazar variables en plantillas
                SET v_mensaje_email = v_plantilla_email;
                SET v_mensaje_whatsapp = v_plantilla_whatsapp;
                
                -- Reemplazar variables comunes
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{nombre_cliente}', IFNULL(v_nombre_cliente, 'Cliente'));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{nombre_evento}', IFNULL(v_nombre_evento, 'Evento'));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{fecha_evento}', IFNULL(DATE_FORMAT(v_fecha_evento, '%d/%m/%Y'), ''));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{hora_inicio}', IFNULL(TIME_FORMAT(v_hora_inicio, '%H:%i'), ''));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{saldo_pendiente}', IFNULL(CONCAT('$', CAST(v_saldo_pendiente AS CHAR)), '$0'));
                
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_cliente}', IFNULL(v_nombre_cliente, 'Cliente'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_evento}', IFNULL(v_nombre_evento, 'Evento'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{fecha_evento}', IFNULL(DATE_FORMAT(v_fecha_evento, '%d/%m/%Y'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{hora_inicio}', IFNULL(TIME_FORMAT(v_hora_inicio, '%H:%i'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{saldo_pendiente}', IFNULL(CONCAT('$', CAST(v_saldo_pendiente AS CHAR)), '$0'));
                
                -- Reemplazar variables específicas de pago (si aplica)
                IF p_monto IS NOT NULL THEN
                    SET v_mensaje_email = REPLACE(v_mensaje_email, '{monto}', CONCAT('$', CAST(p_monto AS CHAR)));
                    SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{monto}', CONCAT('$', CAST(p_monto AS CHAR)));
                END IF;
                
                IF p_metodo_pago IS NOT NULL THEN
                    SET v_mensaje_email = REPLACE(v_mensaje_email, '{metodo_pago}', p_metodo_pago);
                    SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{metodo_pago}', p_metodo_pago);
                END IF;
                
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{fecha_pago}', DATE_FORMAT(CURDATE(), '%d/%m/%Y'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{fecha_pago}', DATE_FORMAT(CURDATE(), '%d/%m/%Y'));
                
                -- Determinar canal
                IF v_enviar_email AND v_enviar_whatsapp THEN
                    SET v_canal = 'ambos';
                ELSEIF v_enviar_email THEN
                    SET v_canal = 'email';
                ELSEIF v_enviar_whatsapp THEN
                    SET v_canal = 'whatsapp';
                ELSE
                    SET v_canal = NULL;
                END IF;
                
                -- Si hay canal configurado, crear notificación
                IF v_canal IS NOT NULL THEN
                    -- Obtener nombre de la notificación para el asunto
                    SELECT nombre INTO v_asunto
                    FROM configuracion_notificaciones 
                    WHERE id = v_config_id;
                    
                    SET v_asunto = CONCAT(IFNULL(v_asunto, 'Notificación'), ' - ', IFNULL(v_nombre_evento, 'Evento'));
                    
                    -- Insertar en tabla de notificaciones pendientes (para envío inmediato)
                    INSERT INTO notificaciones_pendientes (
                        id_evento,
                        tipo_notificacion,
                        canal,
                        destinatario_email,
                        destinatario_telefono,
                        asunto,
                        mensaje_email,
                        mensaje_whatsapp,
                        fecha_programada,
                        enviado
                    ) VALUES (
                        p_evento_id,
                        p_tipo_notificacion,
                        v_canal,
                        v_email,
                        v_telefono,
                        v_asunto,
                        v_mensaje_email,
                        v_mensaje_whatsapp,
                        NOW(),
                        FALSE
                    );
                END IF;
            END IF;
        END IF;
    END IF;
END//
DELIMITER ;

-- Volcando estructura para tabla lirios_eventos.destinatarios_notificaciones
CREATE TABLE IF NOT EXISTS `destinatarios_notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_notificacion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` enum('administrador','coordinador','gerente_general','custom') COLLATE utf8mb4_unicode_ci DEFAULT 'custom',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tipo_email` (`tipo_notificacion`,`email`),
  KEY `idx_tipo_notificacion` (`tipo_notificacion`),
  KEY `idx_email` (`email`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `destinatarios_notificaciones_ibfk_1` FOREIGN KEY (`tipo_notificacion`) REFERENCES `configuracion_notificaciones` (`tipo_notificacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.destinatarios_notificaciones: ~0 rows (aproximadamente)

-- Volcando estructura para función lirios_eventos.dias_hasta_evento
DELIMITER //
CREATE FUNCTION `dias_hasta_evento`(p_fecha_evento DATE) RETURNS int
    READS SQL DATA
    DETERMINISTIC
BEGIN
    RETURN DATEDIFF(p_fecha_evento, CURDATE());
END//
DELIMITER ;

-- Volcando estructura para tabla lirios_eventos.eventos
CREATE TABLE IF NOT EXISTS `eventos` (
  `id_evento` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `id_salon` int DEFAULT NULL,
  `plan_id` int DEFAULT NULL,
  `salon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_evento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_evento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_evento` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `numero_invitados` int DEFAULT NULL,
  `estado` enum('cotizacion','confirmado','en_proceso','completado','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'cotizacion',
  `total` decimal(10,2) DEFAULT '0.00',
  `saldo` decimal(10,2) DEFAULT '0.00',
  `total_pagado` decimal(10,2) DEFAULT '0.00',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `coordinador_id` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_evento`),
  KEY `idx_id_cliente` (`id_cliente`),
  KEY `idx_id_salon` (`id_salon`),
  KEY `idx_fecha_evento` (`fecha_evento`),
  KEY `idx_estado` (`estado`),
  KEY `plan_id` (`plan_id`),
  KEY `coordinador_id` (`coordinador_id`),
  CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`id_salon`) REFERENCES `salones` (`id_salon`) ON DELETE SET NULL,
  CONSTRAINT `eventos_ibfk_3` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `eventos_ibfk_4` FOREIGN KEY (`coordinador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.eventos: ~1 rows (aproximadamente)
INSERT INTO `eventos` (`id_evento`, `id_cliente`, `id_salon`, `plan_id`, `salon`, `nombre_evento`, `tipo_evento`, `fecha_evento`, `hora_inicio`, `hora_fin`, `numero_invitados`, `estado`, `total`, `saldo`, `total_pagado`, `observaciones`, `coordinador_id`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 1, 6, 3, 'Brisas de Lirio (Cap: 50)', 'CNEL ANIVERSARIO', 'Fiesta Corporativa', '2026-01-03', '15:35:00', '23:59:00', NULL, 'cotizacion', 1167.50, 717.50, 450.00, NULL, NULL, '2026-01-03 20:36:51', '2026-01-04 20:43:08'),
	(2, 1, 6, 56, 'Brisas de Lirio (Cap: 50)', 'dfghjkl', 'Aniversario', '2026-01-04', '21:08:00', '21:08:00', 6, 'cotizacion', 3983.33, 3983.33, 0.00, NULL, NULL, '2026-01-05 02:09:00', '2026-01-05 02:09:00'),
	(3, 5, 6, 24, 'Brisas de Lirio (Cap: 50)', 'CNEL FIESTA', 'Aniversario', '2026-01-07', '18:59:00', '23:59:00', 50, 'cotizacion', 2350.00, 1350.00, 1000.00, 'FIESTA', NULL, '2026-01-08 00:03:03', '2026-01-08 00:05:32');

-- Volcando estructura para tabla lirios_eventos.evento_productos
CREATE TABLE IF NOT EXISTS `evento_productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_evento` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_id_evento` (`id_evento`),
  KEY `idx_producto_id` (`producto_id`),
  CONSTRAINT `evento_productos_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE,
  CONSTRAINT `evento_productos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.evento_productos: ~1 rows (aproximadamente)
INSERT INTO `evento_productos` (`id`, `id_evento`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
	(1, 1, 13, 1, 147.50, 147.50),
	(2, 2, 30, 1, 323.33, 323.33),
	(3, 3, 5, 1, 400.00, 400.00);

-- Volcando estructura para procedimiento lirios_eventos.generar_notificaciones_programadas
DELIMITER //
CREATE PROCEDURE `generar_notificaciones_programadas`()
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_tipo_notificacion VARCHAR(50);
    DECLARE v_dias_antes INT;
    DECLARE v_enviar_email BOOLEAN;
    DECLARE v_enviar_whatsapp BOOLEAN;
    DECLARE v_plantilla_email TEXT;
    DECLARE v_plantilla_whatsapp TEXT;
    DECLARE v_fecha_objetivo DATE;
    DECLARE v_evento_id INT;
    DECLARE v_nombre_cliente VARCHAR(255);
    DECLARE v_nombre_evento VARCHAR(255);
    DECLARE v_fecha_evento DATE;
    DECLARE v_hora_inicio TIME;
    DECLARE v_saldo_pendiente DECIMAL(10,2);
    DECLARE v_email VARCHAR(255);
    DECLARE v_telefono VARCHAR(20);
    DECLARE v_asunto VARCHAR(255);
    DECLARE v_mensaje_email TEXT;
    DECLARE v_mensaje_whatsapp TEXT;
    DECLARE v_canal ENUM('email', 'whatsapp', 'ambos');
    DECLARE v_total_creadas INT DEFAULT 0;
    DECLARE v_fecha_programada DATETIME;
    
    -- Cursor para recorrer configuraciones activas de notificaciones programadas
    DECLARE cur_config CURSOR FOR
        SELECT tipo_notificacion, dias_antes, enviar_email, enviar_whatsapp, 
               plantilla_email, plantilla_whatsapp
        FROM configuracion_notificaciones
        WHERE activo = TRUE
        AND dias_antes != 0  -- Excluir notificaciones inmediatas
        ORDER BY dias_antes DESC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    OPEN cur_config;
    
    config_loop: LOOP
        FETCH cur_config INTO v_tipo_notificacion, v_dias_antes, v_enviar_email, 
                              v_enviar_whatsapp, v_plantilla_email, v_plantilla_whatsapp;
        
        IF v_done THEN
            LEAVE config_loop;
        END IF;
        
        -- Calcular fecha objetivo según días_antes
        IF v_dias_antes = -1 THEN
            -- Notificaciones después del evento (solicitud de calificación)
            SET v_fecha_objetivo = DATE_SUB(CURDATE(), INTERVAL 1 DAY);
        ELSE
            -- Notificaciones X días antes del evento
            SET v_fecha_objetivo = DATE_ADD(CURDATE(), INTERVAL v_dias_antes DAY);
        END IF;
        
        -- Cursor para eventos que necesitan esta notificación
        BEGIN
            DECLARE v_done_eventos INT DEFAULT FALSE;
            DECLARE cur_eventos CURSOR FOR
                SELECT e.id_evento, COALESCE(e.salon, e.nombre_evento, 'Evento'), e.fecha_evento, e.hora_inicio, e.saldo,
                       u.nombre_completo, u.email, u.telefono
                FROM eventos e
                LEFT JOIN clientes c ON e.id_cliente = c.id
                LEFT JOIN usuarios u ON c.usuario_id = u.id
                WHERE (
                    -- Para notificaciones después del evento
                    (v_dias_antes = -1 AND DATE(e.fecha_evento) <= v_fecha_objetivo 
                     AND e.estado IN ('completado', 'confirmado', 'en_proceso'))
                    OR
                    -- Para notificaciones antes del evento
                    (v_dias_antes > 0 AND DATE(e.fecha_evento) = v_fecha_objetivo 
                     AND e.estado IN ('confirmado', 'en_proceso'))
                )
                AND NOT notificacion_ya_enviada(e.id_evento, v_tipo_notificacion);
            
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done_eventos = TRUE;
            
            OPEN cur_eventos;
            
            eventos_loop: LOOP
                FETCH cur_eventos INTO v_evento_id, v_nombre_evento, v_fecha_evento, 
                                      v_hora_inicio, v_saldo_pendiente, v_nombre_cliente,
                                      v_email, v_telefono;
                
                IF v_done_eventos THEN
                    LEAVE eventos_loop;
                END IF;
                
                -- Reemplazar variables en plantillas
                SET v_mensaje_email = v_plantilla_email;
                SET v_mensaje_whatsapp = v_plantilla_whatsapp;
                
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{nombre_cliente}', IFNULL(v_nombre_cliente, 'Cliente'));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{nombre_evento}', IFNULL(v_nombre_evento, 'Evento'));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{fecha_evento}', IFNULL(DATE_FORMAT(v_fecha_evento, '%d/%m/%Y'), ''));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{hora_inicio}', IFNULL(TIME_FORMAT(v_hora_inicio, '%H:%i'), ''));
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{saldo_pendiente}', IFNULL(v_saldo_pendiente, 0));
                
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_cliente}', IFNULL(v_nombre_cliente, 'Cliente'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_evento}', IFNULL(v_nombre_evento, 'Evento'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{fecha_evento}', IFNULL(DATE_FORMAT(v_fecha_evento, '%d/%m/%Y'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{hora_inicio}', IFNULL(TIME_FORMAT(v_hora_inicio, '%H:%i'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{saldo_pendiente}', IFNULL(v_saldo_pendiente, 0));
                
                -- Determinar canal
                IF v_enviar_email AND v_enviar_whatsapp THEN
                    SET v_canal = 'ambos';
                ELSEIF v_enviar_email THEN
                    SET v_canal = 'email';
                ELSEIF v_enviar_whatsapp THEN
                    SET v_canal = 'whatsapp';
                ELSE
                    ITERATE eventos_loop; -- Saltar si no hay canal configurado
                END IF;
                
                -- Crear asunto
                SET v_asunto = CONCAT(
                    (SELECT nombre FROM configuracion_notificaciones 
                     WHERE tipo_notificacion = v_tipo_notificacion),
                    ' - ',
                    IFNULL(v_nombre_evento, 'Evento')
                );
                
                -- Calcular fecha programada
                IF v_dias_antes = -1 THEN
                    SET v_fecha_programada = DATE_ADD(v_fecha_evento, INTERVAL 1 DAY);
                ELSE
                    SET v_fecha_programada = DATE_ADD(CURDATE(), INTERVAL v_dias_antes DAY);
                END IF;
                
                -- Insertar notificación pendiente
                INSERT INTO notificaciones_pendientes (
                    id_evento,
                    tipo_notificacion,
                    canal,
                    destinatario_email,
                    destinatario_telefono,
                    asunto,
                    mensaje_email,
                    mensaje_whatsapp,
                    fecha_programada,
                    enviado
                ) VALUES (
                    v_evento_id,
                    v_tipo_notificacion,
                    v_canal,
                    v_email,
                    v_telefono,
                    v_asunto,
                    v_mensaje_email,
                    v_mensaje_whatsapp,
                    v_fecha_programada,
                    FALSE
                );
                
                SET v_total_creadas = v_total_creadas + 1;
                
            END LOOP eventos_loop;
            
            CLOSE cur_eventos;
        END;
        
    END LOOP config_loop;
    
    CLOSE cur_config;
    
    SELECT CONCAT('Notificaciones creadas: ', v_total_creadas) AS resultado;
END//
DELIMITER ;

-- Volcando estructura para tabla lirios_eventos.historial_notificaciones
CREATE TABLE IF NOT EXISTS `historial_notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_evento` int NOT NULL,
  `tipo_notificacion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `canal` enum('email','whatsapp','ambos') COLLATE utf8mb4_unicode_ci NOT NULL,
  `destinatario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asunto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `enviado` tinyint(1) DEFAULT '0',
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `fecha_programada` timestamp NULL DEFAULT NULL,
  `error` text COLLATE utf8mb4_unicode_ci,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_id_evento` (`id_evento`),
  KEY `idx_tipo` (`tipo_notificacion`),
  KEY `idx_fecha_programada` (`fecha_programada`),
  CONSTRAINT `historial_notificaciones_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.historial_notificaciones: ~3 rows (aproximadamente)
INSERT INTO `historial_notificaciones` (`id`, `id_evento`, `tipo_notificacion`, `canal`, `destinatario`, `asunto`, `mensaje`, `enviado`, `fecha_envio`, `fecha_programada`, `error`, `fecha_creacion`) VALUES
	(1, 9, 'evento_creado', 'email', 'gregorioenrique14@gmail.com', 'Evento Creado', 'Estimado/a Administrador,\r\n\r\nSe ha creado un nuevo evento en el sistema:\r\n\r\n- Evento: {nombre_evento}\r\n- Cliente: {nombre_cliente}\r\n- Tipo: {tipo_evento}\r\n- Fecha: {fecha_evento}\r\n- Hora: {hora_inicio}\r\n- Total: ${total}\r\n\r\nPor favor, revise los detalles del evento en el sistema.\r\n\r\nSaludos,\r\nSistema Lirios Eventos', 1, '2025-12-29 00:58:04', NULL, NULL, '2025-12-29 00:58:03'),
	(2, 10, 'evento_creado', 'email', 'gregorioenrique14@gmail.com', 'Evento Creado', 'Estimado/a Administrador,\r\n\r\nSe ha creado un nuevo evento en el sistema:\r\n\r\n- Evento: {nombre_evento}\r\n- Cliente: {nombre_cliente}\r\n- Tipo: {tipo_evento}\r\n- Fecha: {fecha_evento}\r\n- Hora: {hora_inicio}\r\n- Total: ${total}\r\n\r\nPor favor, revise los detalles del evento en el sistema.\r\n\r\nSaludos,\r\nSistema Lirios Eventos', 1, '2025-12-29 01:04:52', NULL, NULL, '2025-12-29 01:04:52'),
	(3, 11, 'evento_creado', 'email', 'gregorioenrique14@gmail.com', 'Evento Creado', 'Estimado/a Administrador,\r\n\r\nSe ha creado un nuevo evento en el sistema:\r\n\r\n- Evento: {nombre_evento}\r\n- Cliente: {nombre_cliente}\r\n- Tipo: {tipo_evento}\r\n- Fecha: {fecha_evento}\r\n- Hora: {hora_inicio}\r\n- Total: ${total}\r\n\r\nPor favor, revise los detalles del evento en el sistema.\r\n\r\nSaludos,\r\nSistema Lirios Eventos', 1, '2025-12-31 23:39:27', NULL, NULL, '2025-12-31 23:39:26'),
	(4, 1, 'evento_creado', 'email', 'gregorioenrique14@gmail.com', 'Evento Creado', 'Estimado/a Administrador,\r\n\r\nSe ha creado un nuevo evento en el sistema:\r\n\r\n- Evento: {nombre_evento}\r\n- Cliente: {nombre_cliente}\r\n- Tipo: {tipo_evento}\r\n- Fecha: {fecha_evento}\r\n- Hora: {hora_inicio}\r\n- Total: ${total}\r\n\r\nPor favor, revise los detalles del evento en el sistema.\r\n\r\nSaludos,\r\nSistema Lirios Eventos', 1, '2026-01-03 20:36:54', NULL, NULL, '2026-01-03 20:36:54'),
	(5, 2, 'evento_creado', 'email', 'gregorioenrique14@gmail.com', 'Evento Creado', 'Estimado/a Administrador,\r\n\r\nSe ha creado un nuevo evento en el sistema:\r\n\r\n- Evento: {nombre_evento}\r\n- Cliente: {nombre_cliente}\r\n- Tipo: {tipo_evento}\r\n- Fecha: {fecha_evento}\r\n- Hora: {hora_inicio}\r\n- Total: ${total}\r\n\r\nPor favor, revise los detalles del evento en el sistema.\r\n\r\nSaludos,\r\nSistema Lirios Eventos', 1, '2026-01-05 02:09:03', NULL, NULL, '2026-01-05 02:09:03'),
	(6, 3, 'evento_creado', 'email', 'gregor@gmail.com', 'Evento Creado', 'Estimado/a Administrador,\r\n\r\nSe ha creado un nuevo evento en el sistema:\r\n\r\n- Evento: {nombre_evento}\r\n- Cliente: {nombre_cliente}\r\n- Tipo: {tipo_evento}\r\n- Fecha: {fecha_evento}\r\n- Hora: {hora_inicio}\r\n- Total: ${total}\r\n\r\nPor favor, revise los detalles del evento en el sistema.\r\n\r\nSaludos,\r\nSistema Lirios Eventos', 1, '2026-01-08 00:03:06', NULL, NULL, '2026-01-08 00:03:05');

-- Volcando estructura para tabla lirios_eventos.inventario
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `id_evento` int DEFAULT NULL,
  `cantidad_solicitada` int NOT NULL,
  `cantidad_disponible` int DEFAULT NULL,
  `cantidad_utilizada` int DEFAULT '0',
  `estado` enum('disponible','reservado','en_uso','devuelto') COLLATE utf8mb4_unicode_ci DEFAULT 'disponible',
  `fecha_reserva` date DEFAULT NULL,
  `fecha_devolucion` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_producto_id` (`producto_id`),
  KEY `idx_id_evento` (`id_evento`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `inventario_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.inventario: ~0 rows (aproximadamente)

-- Volcando estructura para procedimiento lirios_eventos.limpiar_notificaciones_antiguas
DELIMITER //
CREATE PROCEDURE `limpiar_notificaciones_antiguas`(IN p_dias INT)
BEGIN
    IF p_dias IS NULL OR p_dias <= 0 THEN
        SET p_dias = 90; -- Por defecto 90 días
    END IF;
    
    DELETE FROM notificaciones_pendientes
    WHERE enviado = TRUE
    AND fecha_envio < DATE_SUB(NOW(), INTERVAL p_dias DAY);
    
    SELECT CONCAT('Notificaciones eliminadas anteriores a ', p_dias, ' días') AS resultado;
END//
DELIMITER ;

-- Volcando estructura para tabla lirios_eventos.logs_sistema
CREATE TABLE IF NOT EXISTS `logs_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_fecha_registro` (`fecha_registro`),
  KEY `idx_modulo` (`modulo`),
  CONSTRAINT `logs_sistema_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.logs_sistema: ~97 rows (aproximadamente)
INSERT INTO `logs_sistema` (`id`, `usuario_id`, `accion`, `modulo`, `descripcion`, `ip_address`, `fecha_registro`) VALUES
	(1, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-28 23:37:48'),
	(2, 1, 'Crear evento', 'Eventos', 'Evento creado: Aniversario el Rosado', NULL, '2025-12-28 23:39:01'),
	(3, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-28 23:43:39'),
	(4, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-28 23:44:08'),
	(5, 1, 'Crear evento', 'Eventos', 'Evento creado: sdfsf', NULL, '2025-12-28 23:44:27'),
	(6, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-28 23:55:25'),
	(7, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:00:35'),
	(8, 1, 'Crear evento', 'Eventos', 'Evento creado: dfs', NULL, '2025-12-29 00:00:55'),
	(9, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:08:54'),
	(10, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:10:02'),
	(11, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:11:49'),
	(12, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:12:52'),
	(13, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:16:07'),
	(14, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:20:18'),
	(15, 1, 'Crear evento', 'Eventos', 'Evento creado: hfhfgjg', NULL, '2025-12-29 00:21:47'),
	(16, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:22:48'),
	(17, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:26:03'),
	(18, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:26:18'),
	(19, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:32:37'),
	(20, 1, 'Crear evento', 'Eventos', 'Evento creado: Pruebas', NULL, '2025-12-29 00:38:17'),
	(21, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 00:54:01'),
	(22, 1, 'Crear evento', 'Eventos', 'Evento creado: fghjk', NULL, '2025-12-29 00:58:01'),
	(23, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 01:04:12'),
	(24, 1, 'Crear evento', 'Eventos', 'Evento creado: sdsd', NULL, '2025-12-29 01:04:50'),
	(25, 1, 'Cierre de sesión', 'Autenticación', 'Usuario admin cerró sesión', NULL, '2025-12-29 01:05:57'),
	(26, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 01:11:53'),
	(27, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 01:16:57'),
	(28, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-29 01:31:26'),
	(29, 1, 'Registrar pago', 'Pagos', 'Pago registrado: $34.00', NULL, '2025-12-29 01:31:39'),
	(30, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-30 00:46:09'),
	(31, 1, 'Registrar pago', 'Pagos', 'Pago registrado: $3.00', NULL, '2025-12-30 00:46:29'),
	(32, 1, 'Editar salón', 'Salones', 'Salón actualizado: Salón VIP', NULL, '2025-12-30 01:07:43'),
	(33, 1, 'Cierre de sesión', 'Autenticación', 'Usuario admin cerró sesión', NULL, '2025-12-30 02:46:49'),
	(34, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:09:11'),
	(35, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:35:21'),
	(36, 1, 'Crear evento', 'Eventos', 'Evento creado: DEPRATI CLUB', NULL, '2025-12-31 23:39:23'),
	(37, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:47:19'),
	(38, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:53:26'),
	(39, 1, 'Registrar pago', 'Pagos', 'Pago registrado: $1000.00', NULL, '2025-12-31 23:53:44'),
	(40, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:56:05'),
	(41, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:56:56'),
	(42, 1, 'Actualizar estado evento', 'Eventos', 'Estado actualizado a: en_proceso', NULL, '2025-12-31 23:57:09'),
	(43, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:57:38'),
	(44, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2025-12-31 23:59:19'),
	(45, 1, 'Actualizar estado evento', 'Eventos', 'Estado actualizado a: completado', NULL, '2025-12-31 23:59:27'),
	(46, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 17:33:38'),
	(47, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 18:27:06'),
	(48, 1, 'Eliminar plan', 'Planes', 'Plan eliminado: ID 1', NULL, '2026-01-03 18:29:10'),
	(49, 1, 'Eliminar plan', 'Planes', 'Plan eliminado: ID 3', NULL, '2026-01-03 18:29:16'),
	(50, 1, 'Eliminar plan', 'Planes', 'Plan eliminado: ID 4', NULL, '2026-01-03 18:29:20'),
	(51, 1, 'Eliminar plan', 'Planes', 'Plan eliminado: ID 2', NULL, '2026-01-03 18:29:24'),
	(52, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 19:02:25'),
	(53, 1, 'Actualizar producto', 'Productos', 'Producto actualizado: Video 360', NULL, '2026-01-03 19:03:17'),
	(54, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 19:46:39'),
	(55, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 20:35:20'),
	(56, 1, 'Crear evento', 'Eventos', 'Evento creado: CNEL ANIVERSARIO', NULL, '2026-01-03 20:36:51'),
	(57, 1, 'Registrar pago', 'Pagos', 'Pago registrado: $100.00', NULL, '2026-01-03 20:37:32'),
	(58, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 20:46:32'),
	(59, 1, 'Eliminar pago', 'Pagos', 'Pago eliminado: ID 6', NULL, '2026-01-03 20:46:37'),
	(60, 1, 'Registrar pago', 'Pagos', 'Pago registrado: $150.00', NULL, '2026-01-03 20:50:24'),
	(61, 1, 'Crear producto', 'Productos', 'Producto creado: nuevo producto', NULL, '2026-01-03 20:57:24'),
	(62, 1, 'Eliminar producto', 'Productos', 'Producto eliminado: ID 32', NULL, '2026-01-03 20:57:34'),
	(63, 1, 'Eliminar producto', 'Productos', 'Producto eliminado: ID 20', NULL, '2026-01-03 20:58:03'),
	(64, 1, 'Eliminar producto', 'Productos', 'Producto eliminado: ID 22', NULL, '2026-01-03 20:58:09'),
	(65, 1, 'Eliminar producto', 'Productos', 'Producto eliminado: ID 8', NULL, '2026-01-03 20:58:14'),
	(66, 1, 'Actualizar categoría', 'Categorías', 'Categoría actualizada: DJ', NULL, '2026-01-03 20:58:32'),
	(67, 1, 'Actualizar categoría', 'Categorías', 'Categoría actualizada: DJ', NULL, '2026-01-03 20:58:37'),
	(68, 1, 'Crear categoría', 'Categorías', 'Categoría creada: pruebas', NULL, '2026-01-03 20:58:45'),
	(69, 1, 'Eliminar categoría', 'Categorías', 'Categoría eliminada: ID 37', NULL, '2026-01-03 20:59:03'),
	(70, 1, 'Eliminar categoría', 'Categorías', 'Categoría eliminada: ID 37', NULL, '2026-01-03 20:59:17'),
	(71, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 21:03:10'),
	(72, 1, 'Eliminar categoría', 'Categorías', 'Categoría eliminada: ID 37', NULL, '2026-01-03 21:03:18'),
	(73, 1, 'Eliminar salón', 'Salones', 'Salón eliminado: Terraza', NULL, '2026-01-03 21:04:44'),
	(74, 1, 'Eliminar salón', 'Salones', 'Salón eliminado: Terraza', NULL, '2026-01-03 21:06:07'),
	(75, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 21:06:15'),
	(76, 1, 'Eliminar salón', 'Salones', 'Salón eliminado: Terraza', NULL, '2026-01-03 21:06:26'),
	(77, 1, 'Eliminar salón', 'Salones', 'Salón eliminado: Salón VIP', NULL, '2026-01-03 21:06:30'),
	(78, 1, 'Eliminar salón', 'Salones', 'Salón eliminado: Salón Principal', NULL, '2026-01-03 21:06:35'),
	(79, 1, 'Eliminar salón', 'Salones', 'Salón eliminado: Salón Pequeño', NULL, '2026-01-03 21:06:39'),
	(80, 1, 'Eliminar salón', 'Salones', 'Salón eliminado: Pétalo', NULL, '2026-01-03 21:06:43'),
	(81, 1, 'Crear plan', 'Planes', 'Plan creado: fgdfg', NULL, '2026-01-03 21:07:09'),
	(82, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-03 21:08:33'),
	(83, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-04 20:25:02'),
	(84, 1, 'Registrar pago', 'Pagos', 'Pago registrado: $200.00', NULL, '2026-01-04 20:43:11'),
	(85, 1, 'Cierre de sesión', 'Autenticación', 'Usuario admin cerró sesión', NULL, '2026-01-04 20:46:13'),
	(86, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 02:01:45'),
	(87, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 02:06:04'),
	(88, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 02:07:06'),
	(89, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 02:08:38'),
	(90, 1, 'Crear evento', 'Eventos', 'Evento creado: dfghjkl', NULL, '2026-01-05 02:09:00'),
	(91, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 02:13:08'),
	(92, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 02:14:18'),
	(93, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 02:16:05'),
	(94, 1, 'Cierre de sesión', 'Autenticación', 'Usuario admin cerró sesión', NULL, '2026-01-05 02:17:00'),
	(95, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-05 04:49:16'),
	(96, 1, 'Crear producto', 'Productos', 'Producto creado: Show Disney: La Bella y La Bestia', NULL, '2026-01-05 04:51:06'),
	(97, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-07 01:27:04'),
	(98, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-07 23:52:13'),
	(99, 1, 'Inicio de sesión', 'Autenticación', 'Usuario admin inició sesión', NULL, '2026-01-07 23:57:13'),
	(100, 1, 'Crear evento', 'Eventos', 'Evento creado: CNEL FIESTA', NULL, '2026-01-08 00:03:03'),
	(101, 1, 'Registrar pago', 'Pagos', 'Pago registrado: $1000.00', NULL, '2026-01-08 00:05:34'),
	(102, 1, 'Cierre de sesión', 'Autenticación', 'Usuario admin cerró sesión', NULL, '2026-01-08 00:10:04');

-- Volcando estructura para procedimiento lirios_eventos.marcar_notificacion_enviada
DELIMITER //
CREATE PROCEDURE `marcar_notificacion_enviada`(
    IN p_notificacion_id INT,
    IN p_exito BOOLEAN,
    IN p_error TEXT
)
BEGIN
    DECLARE v_evento_id INT;
    DECLARE v_tipo_notificacion VARCHAR(50);
    DECLARE v_canal VARCHAR(20);
    DECLARE v_destinatario VARCHAR(255);
    DECLARE v_asunto VARCHAR(255);
    DECLARE v_mensaje TEXT;
    
    -- Obtener datos de la notificación
    SELECT id_evento, tipo_notificacion, canal, 
           COALESCE(destinatario_email, destinatario_telefono) as destinatario,
           asunto, COALESCE(mensaje_email, mensaje_whatsapp) as mensaje
    INTO v_evento_id, v_tipo_notificacion, v_canal, v_destinatario, v_asunto, v_mensaje
    FROM notificaciones_pendientes
    WHERE id = p_notificacion_id;
    
    IF v_evento_id IS NULL THEN
        SELECT 'Notificación no encontrada' AS mensaje;
    ELSE
        IF p_exito THEN
            -- Actualizar notificación pendiente
            UPDATE notificaciones_pendientes
            SET enviado = TRUE,
                fecha_envio = NOW(),
                error = NULL
            WHERE id = p_notificacion_id;
            
            -- Registrar en historial
            INSERT INTO historial_notificaciones (
                id_evento,
                tipo_notificacion,
                canal,
                destinatario,
                asunto,
                mensaje,
                enviado,
                fecha_envio
            ) VALUES (
                v_evento_id,
                v_tipo_notificacion,
                v_canal,
                v_destinatario,
                v_asunto,
                v_mensaje,
                TRUE,
                NOW()
            );
            
            SELECT 'Notificación marcada como enviada' AS mensaje;
        ELSE
            -- Incrementar intentos y guardar error
            UPDATE notificaciones_pendientes
            SET intentos = intentos + 1,
                error = p_error
            WHERE id = p_notificacion_id;
            
            SELECT CONCAT('Error registrado. Intentos: ', (SELECT intentos FROM notificaciones_pendientes WHERE id = p_notificacion_id)) AS mensaje;
        END IF;
    END IF;
END//
DELIMITER ;

-- Volcando estructura para tabla lirios_eventos.notificaciones_pendientes
CREATE TABLE IF NOT EXISTS `notificaciones_pendientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_evento` int NOT NULL,
  `tipo_notificacion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `canal` enum('email','whatsapp','ambos') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ambos',
  `destinatario_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destinatario_telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asunto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje_email` text COLLATE utf8mb4_unicode_ci,
  `mensaje_whatsapp` text COLLATE utf8mb4_unicode_ci,
  `fecha_programada` datetime NOT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  `enviado` tinyint(1) DEFAULT '0',
  `intentos` int DEFAULT '0',
  `error` text COLLATE utf8mb4_unicode_ci,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fecha_programada` (`fecha_programada`),
  KEY `idx_enviado` (`enviado`),
  KEY `idx_id_evento` (`id_evento`),
  KEY `idx_tipo` (`tipo_notificacion`),
  CONSTRAINT `notificaciones_pendientes_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.notificaciones_pendientes: ~6 rows (aproximadamente)
INSERT INTO `notificaciones_pendientes` (`id`, `id_evento`, `tipo_notificacion`, `canal`, `destinatario_email`, `destinatario_telefono`, `asunto`, `mensaje_email`, `mensaje_whatsapp`, `fecha_programada`, `fecha_envio`, `enviado`, `intentos`, `error`, `fecha_creacion`) VALUES
	(1, 2, 'abono_recibido', 'ambos', 'gregorioenrique14@gmail.com', '593988492339', 'Abono Recibido - Salón VIP', 'Estimado/a Ana Martínez,\r\n\r\nLe confirmamos que hemos recibido su abono de $$34.00 para el evento "Salón VIP".\r\n\r\nDetalles del pago:\r\n- Fecha: 28/12/2025\r\n- Método: transferencia\r\n- Saldo pendiente: $$1166.00\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de $$34.00 para el evento "Salón VIP". Saldo pendiente: $$1166.00', '2025-12-28 20:31:36', NULL, 0, 0, NULL, '2025-12-29 01:31:36'),
	(2, 1, 'abono_recibido', 'ambos', 'gregorioenrique14@gmail.com', '593988492339', 'Abono Recibido - Salón Principal', 'Estimado/a Carlos Rodríguez,\r\n\r\nLe confirmamos que hemos recibido su abono de $$3.00 para el evento "Salón Principal".\r\n\r\nDetalles del pago:\r\n- Fecha: 29/12/2025\r\n- Método: transferencia\r\n- Saldo pendiente: $$3497.00\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de $$3.00 para el evento "Salón Principal". Saldo pendiente: $$3497.00', '2025-12-29 19:46:25', NULL, 0, 0, NULL, '2025-12-30 00:46:25'),
	(3, 11, 'abono_recibido', 'ambos', 'gregorioenrique14@gmail.com', '0988492339', 'Abono Recibido - Salón Pequeño (Cap: 30)', 'Estimado/a GREGORIO ENRIQUE OSORIO ANDRADES,\r\n\r\nLe confirmamos que hemos recibido su abono de $$1000.00 para el evento "Salón Pequeño (Cap: 30)".\r\n\r\nDetalles del pago:\r\n- Fecha: 31/12/2025\r\n- Método: transferencia\r\n- Saldo pendiente: $$5500.00\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de $$1000.00 para el evento "Salón Pequeño (Cap: 30)". Saldo pendiente: $$5500.00', '2025-12-31 18:53:42', NULL, 0, 0, NULL, '2025-12-31 23:53:42'),
	(4, 1, 'abono_recibido', 'ambos', 'gregorioenrique14@gmail.com', '593988492339', 'Abono Recibido - Brisas de Lirio (Cap: 50)', 'Estimado/a Carlos Rodríguez,\r\n\r\nLe confirmamos que hemos recibido su abono de $$100.00 para el evento "Brisas de Lirio (Cap: 50)".\r\n\r\nDetalles del pago:\r\n- Fecha: 03/01/2026\r\n- Método: efectivo\r\n- Saldo pendiente: $$1064.50\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de $$100.00 para el evento "Brisas de Lirio (Cap: 50)". Saldo pendiente: $$1064.50', '2026-01-03 15:37:30', NULL, 0, 0, NULL, '2026-01-03 20:37:30'),
	(5, 1, 'abono_recibido', 'ambos', 'gregorioenrique14@gmail.com', '593988492339', 'Abono Recibido - Brisas de Lirio (Cap: 50)', 'Estimado/a Carlos Rodríguez,\r\n\r\nLe confirmamos que hemos recibido su abono de $$150.00 para el evento "Brisas de Lirio (Cap: 50)".\r\n\r\nDetalles del pago:\r\n- Fecha: 03/01/2026\r\n- Método: efectivo\r\n- Saldo pendiente: $$917.50\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de $$150.00 para el evento "Brisas de Lirio (Cap: 50)". Saldo pendiente: $$917.50', '2026-01-03 15:50:21', NULL, 0, 0, NULL, '2026-01-03 20:50:21'),
	(6, 1, 'abono_recibido', 'ambos', 'gregorioenrique14@gmail.com', '593988492339', 'Abono Recibido - Brisas de Lirio (Cap: 50)', 'Estimado/a Carlos Rodríguez,\r\n\r\nLe confirmamos que hemos recibido su abono de $$200.00 para el evento "Brisas de Lirio (Cap: 50)".\r\n\r\nDetalles del pago:\r\n- Fecha: 04/01/2026\r\n- Método: efectivo\r\n- Saldo pendiente: $$717.50\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de $$200.00 para el evento "Brisas de Lirio (Cap: 50)". Saldo pendiente: $$717.50', '2026-01-04 15:43:08', NULL, 0, 0, NULL, '2026-01-04 20:43:08'),
	(7, 3, 'abono_recibido', 'ambos', 'gregor@gmail.com', '09825512453', 'Abono Recibido - Brisas de Lirio (Cap: 50)', 'Estimado/a GREGORIO ENRIQUE OSORIO ANDRADES,\r\n\r\nLe confirmamos que hemos recibido su abono de $$1000.00 para el evento "Brisas de Lirio (Cap: 50)".\r\n\r\nDetalles del pago:\r\n- Fecha: 07/01/2026\r\n- Método: efectivo\r\n- Saldo pendiente: $$1350.00\r\n\r\nGracias por su confianza.\r\n\r\nSaludos,\r\nLirios Eventos', '✓ Confirmamos recepción de su abono de $$1000.00 para el evento "Brisas de Lirio (Cap: 50)". Saldo pendiente: $$1350.00', '2026-01-07 19:05:32', NULL, 0, 0, NULL, '2026-01-08 00:05:32');

-- Volcando estructura para función lirios_eventos.notificacion_ya_enviada
DELIMITER //
CREATE FUNCTION `notificacion_ya_enviada`(
    p_evento_id INT,
    p_tipo_notificacion VARCHAR(50)
) RETURNS tinyint(1)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_enviada BOOLEAN DEFAULT FALSE;
    
    -- Verificar en historial de notificaciones
    SELECT COUNT(*) > 0 INTO v_enviada
    FROM historial_notificaciones
    WHERE id_evento = p_evento_id
    AND tipo_notificacion = p_tipo_notificacion
    AND enviado = TRUE;
    
    RETURN v_enviada;
END//
DELIMITER ;

-- Volcando estructura para procedimiento lirios_eventos.obtener_notificaciones_pendientes
DELIMITER //
CREATE PROCEDURE `obtener_notificaciones_pendientes`(IN p_limite INT)
BEGIN
    IF p_limite IS NULL OR p_limite <= 0 THEN
        SET p_limite = 100; -- Límite por defecto
    END IF;
    
    SELECT 
        id,
        id_evento,
        tipo_notificacion,
        canal,
        destinatario_email,
        destinatario_telefono,
        asunto,
        mensaje_email,
        mensaje_whatsapp,
        fecha_programada,
        intentos
    FROM notificaciones_pendientes
    WHERE enviado = FALSE
    AND fecha_programada <= NOW()
    ORDER BY fecha_programada ASC
    LIMIT p_limite;
END//
DELIMITER ;

-- Volcando estructura para tabla lirios_eventos.pagos
CREATE TABLE IF NOT EXISTS `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_evento` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo_pago` enum('abono','pago_completo','reembolso') COLLATE utf8mb4_unicode_ci DEFAULT 'abono',
  `metodo_pago` enum('efectivo','transferencia','tarjeta','cheque') COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_referencia` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_pago` date NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `usuario_registro_id` int DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_id_evento` (`id_evento`),
  KEY `idx_fecha_pago` (`fecha_pago`),
  KEY `idx_tipo_pago` (`tipo_pago`),
  KEY `usuario_registro_id` (`usuario_registro_id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE RESTRICT,
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`usuario_registro_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.pagos: ~4 rows (aproximadamente)
INSERT INTO `pagos` (`id`, `id_evento`, `monto`, `tipo_pago`, `metodo_pago`, `numero_referencia`, `fecha_pago`, `observaciones`, `usuario_registro_id`, `fecha_registro`) VALUES
	(5, 2, 34.00, 'abono', 'transferencia', NULL, '2025-12-28', NULL, 1, '2025-12-29 01:31:36'),
	(7, 11, 1000.00, 'abono', 'transferencia', 'sd3223', '2025-12-31', NULL, 1, '2025-12-31 23:53:42'),
	(8, 1, 100.00, 'abono', 'efectivo', NULL, '2026-01-03', 'ABONO INICIAL', 1, '2026-01-03 20:37:30'),
	(9, 1, 150.00, 'abono', 'efectivo', NULL, '2026-01-04', 'ABONO', 1, '2026-01-03 20:50:21'),
	(10, 1, 200.00, 'abono', 'efectivo', 'rtrt', '2026-01-04', NULL, 1, '2026-01-04 20:43:08'),
	(11, 3, 1000.00, 'abono', 'efectivo', NULL, '2026-01-07', 'ABONO CLIENTE EN LOCAL', 1, '2026-01-08 00:05:32');

-- Volcando estructura para tabla lirios_eventos.planes
CREATE TABLE IF NOT EXISTS `planes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_base` decimal(10,2) NOT NULL,
  `capacidad_minima` int DEFAULT NULL,
  `capacidad_maxima` int DEFAULT NULL,
  `duracion_horas` int DEFAULT NULL,
  `incluye` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.planes: ~57 rows (aproximadamente)
INSERT INTO `planes` (`id`, `nombre`, `descripcion`, `precio_base`, `capacidad_minima`, `capacidad_maxima`, `duracion_horas`, `incluye`, `activo`, `fecha_creacion`) VALUES
	(1, 'Cristal - 20 personas - Brisas de Lirio', 'Paquete para eventos de 20 personas en el Salón Brisas de Lirio', 760.00, 20, 20, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Gu ar di an ía Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as 2 0 Pe rs on as : $ 3 5 , 0 0 Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(2, 'Destello - 20 personas - Brisas de Lirio', 'Paquete para eventos de 20 personas en el Salón Brisas de Lirio', 860.00, 20, 20, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . De co ra ci ón 2 ar re gl os fl or al es ar ti fi ci al es 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . 1 0 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Gu ar di an ía Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll o 2 0 Pe rs on as : $ 4 0 , 0 0 Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(3, 'Luz - 20 personas - Brisas de Lirio', 'Paquete para eventos de 20 personas en el Salón Brisas de Lirio', 1020.00, 20, 20, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . De co ra ci ón 2 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 1 2 0 bo ca di to sd ed ul ce y 1 2 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . 2 0 Pe rs on as : $ 4 8 , 0 0 Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(4, 'Resplandor - 20 personas - Brisas de Lirio', 'Paquete para eventos de 20 personas en el Salón Brisas de Lirio', 1360.00, 20, 20, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 2 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 1 0 0 bo ca di to sd ed ul ce y 1 0 0 bo ca di to sd es al Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 1 Ga ló nd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 2 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do r 2 0 Pe rs on as : $ 6 5 , 0 0 Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s li ri os sa lo ne ve nt os ec Li ri os . ev en to sT ot al', 1, '2026-01-03 20:34:40'),
	(5, 'Cristal - 30 personas - Brisas de Lirio', 'Paquete para eventos de 30 personas en el Salón Brisas de Lirio', 960.00, 30, 30, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 3 0 Pe rs on as : $ 3 0 , 0 0', 1, '2026-01-03 20:34:40'),
	(6, 'Destello - 30 personas - Brisas de Lirio', 'Paquete para eventos de 30 personas en el Salón Brisas de Lirio', 1110.00, 30, 30, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 3 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 1 5 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 3 0 Pe rs on as : $ 3 5 , 0 0', 1, '2026-01-03 20:34:40'),
	(7, 'Luz - 30 personas - Brisas de Lirio', 'Paquete para eventos de 30 personas en el Salón Brisas de Lirio', 1260.00, 30, 30, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 3 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 1 8 0 bo ca di to sd ed ul ce y 1 8 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 3 0 Pe rs on as : $ 4 0 , 0 0', 1, '2026-01-03 20:34:40'),
	(8, 'Resplandor - 30 personas - Brisas de Lirio', 'Paquete para eventos de 30 personas en el Salón Brisas de Lirio', 1560.00, 30, 30, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 3 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 1 5 0 bo ca di to sd ed ul ce y 1 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 1 Ga ló nd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 3 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(9, 'Cristal - 40 personas - Brisas de Lirio', 'Paquete para eventos de 40 personas en el Salón Brisas de Lirio', 1180.00, 40, 40, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 4 0 Pe rs on as : $ 2 8 , 0 0', 1, '2026-01-03 20:34:40'),
	(10, 'Destello - 40 personas - Brisas de Lirio', 'Paquete para eventos de 40 personas en el Salón Brisas de Lirio', 1260.00, 40, 40, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 4 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 2 0 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 4 0 Pe rs on as : $ 3 0 , 0 0', 1, '2026-01-03 20:34:40'),
	(11, 'Luz - 40 personas - Brisas de Lirio', 'Paquete para eventos de 40 personas en el Salón Brisas de Lirio', 1460.00, 40, 40, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 4 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 2 4 0 bo ca di to sd ed ul ce y 2 4 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 4 0 Pe rs on as : $ 3 5 , 0 0', 1, '2026-01-03 20:34:40'),
	(12, 'Resplandor - 40 personas - Brisas de Lirio', 'Paquete para eventos de 40 personas en el Salón Brisas de Lirio', 1860.00, 40, 40, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 4 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 2 0 0 bo ca di to sd ed ul ce y 2 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 2 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 4 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(13, 'Cristal - 50 personas - Brisas de Lirio', 'Paquete para eventos de 50 personas en el Salón Brisas de Lirio', 1210.00, 50, 50, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 5 0 Pe rs on as : $ 2 3 , 0 0', 1, '2026-01-03 20:34:40'),
	(14, 'Destello - 50 personas - Brisas de Lirio', 'Paquete para eventos de 50 personas en el Salón Brisas de Lirio', 1310.00, 50, 50, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 5 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 2 5 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 5 0 Pe rs on as : $ 2 5 , 0 0', 1, '2026-01-03 20:34:40'),
	(15, 'Luz - 50 personas - Brisas de Lirio', 'Paquete para eventos de 50 personas en el Salón Brisas de Lirio', 1660.00, 50, 50, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 5 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 3 0 0 bo ca di to sd ed ul ce y 3 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 5 0 Pe rs on as : $ 3 2 , 0 0', 1, '2026-01-03 20:34:40'),
	(16, 'Resplandor - 50 personas - Brisas de Lirio', 'Paquete para eventos de 50 personas en el Salón Brisas de Lirio', 2010.00, 50, 50, 6, 'Sa ló nB ri sa sd eL ir io cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 5 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 2 5 0 bo ca di to sd ed ul ce y 2 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 2 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 5 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(17, 'Cristal - 60 personas - Brisas de Lirio', 'Paquete para eventos de 60 personas en el Salón Brisas de Lirio', 1260.00, 60, 60, 6, 'SalónBrisasdeLirioclimatizadoy aromatizadodurante 6 horasdeeventoMenajedecorativo: Cortinasdetelatul, pallets, accesoriosdebocaditos, mesas, sillastifanny, tortafalsaDecoraciónconlucesledacordealevento. 1 Proteina+ 1 Guarnición+ 1 EnsaladaVajillacompleta. Platos, vasos, tenedores, copas, BebidasSoftilimitadasduranteelevento. Agua, mineral, hielo, colas. Coordinaciónantesy duranteeleventoMontajey DesmontajeServicioDjPersonalAnfitrióndeingresoPersonalparalaasistenciademesadeinvitadosGuardianíaGarantía: Sesolicita $60 degarantíareembolsablealsiguientedíahábilunavezconstatadoqueelSALÓNy susmaterialesesténenbuenascondiciones. PaqueteCristalT otal Ev en toTo tal Ev en to Unavezreservadoeleventoencasodesuspenderporrazonesajenasa nosotros (cuarentena, PANDEMIA, inundaciones, apagones, paralizacionesentreotrasdecarácterurgenteobligatorio, NOSEHACENDEVOLUCIONES, sepuedereprogramareleventosegúnlaagenday disponibilidaddelsalón. Av. FranciscodeOrellana. Samanes 3 liriossaloneventosecLirios.eventos', 1, '2026-01-03 20:34:40'),
	(18, 'Destello - 60 personas - Brisas de Lirio', 'Paquete para eventos de 60 personas en el Salón Brisas de Lirio', 1500.00, 60, 60, 6, 'SalónBrisasdeLirioclimatizadoy aromatizadodurante 6 horasdeeventoMenajedecorativo: Cortinasdetelatul, pallets, accesoriosdebocaditos, floresartificiales, mesas, sillastifanny, tortafalsaDecoraciónconlucesledacordealevento. 6 arreglosfloralesnaturalesBuffet: 1 Proteina+ 1 Guarnición+ 1 EnsaladaVajillacompleta. Platos, vasos, tenedores, copas, servilletas. BebidasSoftilimitadasduranteelevento. Agua, mineral, 300 bocaditosdedulcePersonaldeservicio: Coordinaciónantesy duranteeleventoMontajey DesmontajeServicioDjPersonalAnfitrióndeingresoPersonalparalaasistenciademesadeinvitadosGuardianíaCortesía: CámaradeHumoBrindisGarantía: Sesolicita $60 degarantíareembolsablealsiguientedíahábilunavezconstatadoqueelSALÓNy susmaterialesesténenbuenascondiciones. PaqueteDestelloT otal Ev en toTo tal Ev en to Unavezreservadoeleventoencasodesuspenderporrazonesajenasa nosotros (cuarentena, PANDEMIA, inundaciones, apagones, paralizacionesentreotrasdecarácterurgenteobligatorio, NOSEHACENDEVOLUCIONES, sepuedereprogramareleventosegúnlaagenday disponibilidaddelsalón. Av. FranciscodeOrellana. Samanes 3 liriossaloneventosecLirios.eventos', 1, '2026-01-03 20:34:40'),
	(19, 'Luz - 60 personas - Brisas de Lirio', 'Paquete para eventos de 60 personas en el Salón Brisas de Lirio', 1800.00, 60, 60, 6, 'SalónBrisasdeLirioclimatizadoy aromatizadodurante 6 horasdeeventoMenajedecorativo: Cortinasdetelatul, pallets, accesoriosdebocaditos, floresartificiales, mesas, sillastifanny, tortafalsaDecoraciónconlucesledacordealevento. 6 arreglosfloralesnaturalesBuffet: 2 Proteinas + 1 Guarnición + 1 EnsaladaVajillacompleta. Platos, vasos, tenedores, copas, BebidasSoftilimitadasduranteelevento. Agua, mineral, 360 bocaditosdedulcey 360 bocaditosdesalPersonaldeservicio: Coordinaciónantesy duranteeleventoMontajey DesmontajeServicioDjPersonalAnfitrióndeingresoPersonalparalaasistenciademesadeinvitadosGuardianíaCortesía: CámaradeHumoBrindisGarantía: Sesolicita $60 degarantíareembolsablealsiguientedíahábilunavezconstatadoqueelSALÓNy susmaterialesesténenbuenascondiciones. PaqueteLuzT otal Ev en toTo tal Ev en to Unavezreservadoeleventoencasodesuspenderporrazonesajenasa nosotros (cuarentena, PANDEMIA, inundaciones, apagones, paralizacionesentreotrasdecarácterurgenteobligatorio, NOSEHACENDEVOLUCIONES, sepuedereprogramareleventosegúnlaagenday disponibilidaddelsalón. Av. FranciscodeOrellana. Samanes 3 liriossaloneventosecLirios.eventos', 1, '2026-01-03 20:34:40'),
	(20, 'Resplandor - 60 personas - Brisas de Lirio', 'Paquete para eventos de 60 personas en el Salón Brisas de Lirio', 2220.00, 60, 60, 6, 'SalónBrisasdeLirioclimatizadoy aromatizadodurante 6 horasdeeventoMenajedecorativo: Cortinasdetelatul, pallets, accesoriosdebocaditos, floresartificiales, mesas, sillastifanny, tortafalsaDecoraciónconlucesledacordealevento. 6 arreglosfloralesnaturalesBuffet: 1 Proteina + 1 Guarnición + 1 EnsaladaVajillacompleta. Platos, vasos, tenedores, copas, servilletas. BebidasSoftilimitadasduranteelevento. Agua, mineral, hielo, 300 bocaditosdedulcey 300 bocaditosdesalPersonaldeservicio: Coordinaciónantesy duranteeleventoMontajey DesmontajeServicioDjPersonalAnfitrióndeingresoPersonalparalaasistenciademesadeinvitadosGuardianíaServiciosAdicionales: 3 GalonesdecoctelDegustación: 2 platosAnimadordurantetodoelevento 60 Porcionesdetorta: Masademanzana/ nueces - chocolate - vainillaHoraloca 2 garotosy robotledCortesía: BrindisCámaradehumoGarantía: Sesolicita $60 degarantíareembolsablealsiguientedíahábilunavezconstatadoqueelSALÓNy susmaterialesesténenbuenascondiciones. PaqueteResplandorNota: Unavezreservadoeleventoencasodesuspenderporrazonesajenasa nosotros (cuarentena, PANDEMIA, inundaciones, apagones, paralizacionesentreotrasdecarácterurgenteobligatorio, NOSEHACENDEVOLUCIONES, sepuedereprogramareleventosegúnlaagenday disponibilidaddelsalón. Av. FranciscodeOrellana. Samanes 3 liriossaloneventosecLirios.eventos', 1, '2026-01-03 20:34:40'),
	(21, 'Brillo - 60 personas - Brisas de Lirio', 'Paquete para eventos de 60 personas en el Salón Brisas de Lirio', 185.00, 60, 60, 6, 'Paquete 10 canciones: 7 Cancionescompletas, 3 formabailable, 5 músicosenescenay 1 cantantefemenino. Paquete 12 canciones: 9 cancionescompletas, 6 músicosenescenay 1 cantantefemenino. $170 Paquete 13 canciones: 9 cancionescompletas, 3 formabailable, 6 mpuscisoenescenay 1 cantantefemenino + 1 cantantemasculino. $300 BandadeVallenatoCantanteacordealgéneroseleccionadoViolinistaHoraLoca: Paquete 1: 2 garotos + RobotLED $200 Paquete 2: 2 cabezones + 1 garoto $200 Animacióndurantetodoelevento $130 100 dedulcepor $25.00 Cremosossinalcohol : galónpor $25 MasadeNoviademanzanay nuez: $2,50 launidad. Masadevainilla: $1,80 launidad. Masadechocolate: $1,80 launidad. Pista 4x5 depuntospor $650 Av. FranciscodeOrellana. Samanes 3 liriossaloneventosecLirios.eventosServiciosAdicionales', 1, '2026-01-03 20:34:40'),
	(22, 'Cristal - 70 personas - Brisas de Lirio', 'Paquete para eventos de 70 personas en el Salón Brisas de Lirio', 1249.30, 70, 70, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 7 0 Pe rs on as : $ 1 6 , 9 9', 1, '2026-01-03 20:34:40'),
	(23, 'Destello - 70 personas - Brisas de Lirio', 'Paquete para eventos de 70 personas en el Salón Brisas de Lirio', 1600.00, 70, 70, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 7 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 3 5 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 7 0 Pe rs on as : $ 2 2 , 0 0', 1, '2026-01-03 20:34:40'),
	(24, 'Luz - 70 personas - Brisas de Lirio', 'Paquete para eventos de 70 personas en el Salón Brisas de Lirio', 1950.00, 70, 70, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 7 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 4 2 0 bo ca di to sd ed ul ce y 4 2 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 7 0 Pe rs on as : $ 2 7 , 0 0', 1, '2026-01-03 20:34:40'),
	(25, 'Resplandor - 70 personas - Brisas de Lirio', 'Paquete para eventos de 70 personas en el Salón Brisas de Lirio', 2300.00, 70, 70, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 7 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 3 5 0 bo ca di to sd ed ul ce y 3 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 3 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 7 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(26, 'Cristal - 80 personas - Brisas de Lirio', 'Paquete para eventos de 80 personas en el Salón Brisas de Lirio', 1419.20, 80, 80, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 8 0 Pe rs on as : $ 1 6 , 9 9', 1, '2026-01-03 20:34:40'),
	(27, 'Destello - 80 personas - Brisas de Lirio', 'Paquete para eventos de 80 personas en el Salón Brisas de Lirio', 1579.20, 80, 80, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 8 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 4 0 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 8 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(28, 'Luz - 80 personas - Brisas de Lirio', 'Paquete para eventos de 80 personas en el Salón Brisas de Lirio', 2060.00, 80, 80, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 8 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 4 8 0 bo ca di to sd ed ul ce y 4 8 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 8 0 Pe rs on as : $ 2 5 , 0 0', 1, '2026-01-03 20:34:40'),
	(29, 'Resplandor - 80 personas - Brisas de Lirio', 'Paquete para eventos de 80 personas en el Salón Brisas de Lirio', 2460.00, 80, 80, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 8 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . 4 0 0 bo ca di to sd ed ul ce y 4 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 4 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 8 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - va in il la Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 8 0 Pe rs on as : $ 3 0 , 0 0', 1, '2026-01-03 20:34:40'),
	(30, 'Cristal - 90 personas - Brisas de Lirio', 'Paquete para eventos de 90 personas en el Salón Brisas de Lirio', 1589.10, 90, 90, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 9 0 Pe rs on as : $ 1 6 , 9 9', 1, '2026-01-03 20:34:40'),
	(31, 'Destello - 90 personas - Brisas de Lirio', 'Paquete para eventos de 90 personas en el Salón Brisas de Lirio', 1769.10, 90, 90, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 9 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 4 5 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 9 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(32, 'Luz - 90 personas - Brisas de Lirio', 'Paquete para eventos de 90 personas en el Salón Brisas de Lirio', 2220.00, 90, 90, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 9 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 5 4 0 bo ca di to sd ed ul ce y 5 4 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 9 0 Pe rs on as : $ 2 4 , 0 0', 1, '2026-01-03 20:34:40'),
	(33, 'Resplandor - 90 personas - Brisas de Lirio', 'Paquete para eventos de 90 personas en el Salón Brisas de Lirio', 2580.00, 90, 90, 6, 'Sa ló nE se nc ia cl im at iz ad oy ar om at iz ad od ur an te 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 9 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 4 5 0 bo ca di to sd ed ul ce y 4 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 4 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 9 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(34, 'Cristal - 100 personas - Pétalo', 'Paquete para eventos de 100 personas en el Salón Pétalo', 1659.00, 100, 100, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 0 0 Pe rs on as : $ 1 5 , 9 9', 1, '2026-01-03 20:34:40'),
	(35, 'Destello - 100 personas - Pétalo', 'Paquete para eventos de 100 personas en el Salón Pétalo', 1959.00, 100, 100, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 0 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 5 0 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 0 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(36, 'Luz - 100 personas - Pétalo', 'Paquete para eventos de 100 personas en el Salón Pétalo', 2460.00, 100, 100, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 0 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 5 0 0 bo ca di to sd ed ul ce y 5 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 0 0 Pe rs on as : $ 2 4 , 0 0', 1, '2026-01-03 20:34:40'),
	(37, 'Resplandor - 100 personas - Pétalo', 'Paquete para eventos de 100 personas en el Salón Pétalo', 2760.00, 100, 100, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 0 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 5 0 0 bo ca di to sd ed ul ce y 5 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 5 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 1 0 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(38, 'Cristal - 110 personas - Pétalo', 'Paquete para eventos de 110 personas en el Salón Pétalo', 1818.90, 110, 110, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 1 0 Pe rs on as : $ 1 5 , 9 9', 1, '2026-01-03 20:34:40'),
	(39, 'Destello - 110 personas - Pétalo', 'Paquete para eventos de 110 personas en el Salón Pétalo', 2148.90, 110, 110, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 1 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 5 5 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 1 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(40, 'Luz - 110 personas - Pétalo', 'Paquete para eventos de 110 personas en el Salón Pétalo', 2700.00, 110, 110, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 1 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 6 6 0 bo ca di to sd ed ul ce y 6 6 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 1 0 Pe rs on as : $ 2 4 , 0 0', 1, '2026-01-03 20:34:40'),
	(41, 'Resplandor - 110 personas - Pétalo', 'Paquete para eventos de 110 personas en el Salón Pétalo', 3030.00, 110, 110, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 1 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 5 5 0 bo ca di to sd ed ul ce y 5 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 5 Ga lo ne sd ec oc te le sD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 1 1 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(42, 'Cristal - 120 personas - Pétalo', 'Paquete para eventos de 120 personas en el Salón Pétalo', 1978.80, 120, 120, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 2 0 Pe rs on as : $ 1 5 , 9 9', 1, '2026-01-03 20:34:40'),
	(43, 'Destello - 120 personas - Pétalo', 'Paquete para eventos de 120 personas en el Salón Pétalo', 2338.80, 120, 120, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 2 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 6 0 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 2 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(44, 'Luz - 120 personas - Pétalo', 'Paquete para eventos de 120 personas en el Salón Pétalo', 2940.00, 120, 120, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 2 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 7 2 0 bo ca di to sd ed ul ce y 7 2 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 2 0 Pe rs on as : $ 2 4 , 0 0', 1, '2026-01-03 20:34:40'),
	(45, 'Resplandor - 120 personas - Pétalo', 'Paquete para eventos de 120 personas en el Salón Pétalo', 3300.00, 120, 120, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 2 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 6 0 0 bo ca di to sd ed ul ce y 6 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 6 Ga lo ne sd ec oc te le sD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 1 2 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(46, 'Cristal - 130 personas - Pétalo', 'Paquete para eventos de 130 personas en el Salón Pétalo', 2138.70, 130, 130, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 3 0 Pe rs on as : $ 1 5 , 9 9', 1, '2026-01-03 20:34:40'),
	(47, 'Destello - 130 personas - Pétalo', 'Paquete para eventos de 130 personas en el Salón Pétalo', 2528.70, 130, 130, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 3 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 6 5 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 3 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(48, 'Luz - 130 personas - Pétalo', 'Paquete para eventos de 130 personas en el Salón Pétalo', 3180.00, 130, 130, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 3 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 6 5 0 bo ca di to sd ed ul ce y 6 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 3 0 Pe rs on as : $ 2 4 , 0 0', 1, '2026-01-03 20:34:40'),
	(49, 'Resplandor - 130 personas - Pétalo', 'Paquete para eventos de 130 personas en el Salón Pétalo', 3570.00, 130, 130, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 2 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . 6 5 0 bo ca di to sd ed ul ce y 6 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 6 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 1 3 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 3 0 Pe rs on as : $ 2 7 , 0 0', 1, '2026-01-03 20:34:40'),
	(50, 'Cristal - 140 personas - Pétalo', 'Paquete para eventos de 140 personas en el Salón Pétalo', 2298.60, 140, 140, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 4 0 Pe rs on as : $ 1 5 , 9 9', 1, '2026-01-03 20:34:40'),
	(51, 'Destello - 140 personas - Pétalo', 'Paquete para eventos de 140 personas en el Salón Pétalo', 2718.60, 140, 140, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 4 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 7 0 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 4 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(52, 'Luz - 140 personas - Pétalo', 'Paquete para eventos de 140 personas en el Salón Pétalo', 3420.00, 140, 140, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 4 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 8 4 0 bo ca di to sd ed ul ce y 8 4 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 4 0 Pe rs on as : $ 2 4 , 0 0', 1, '2026-01-03 20:34:40'),
	(53, 'Resplandor - 140 personas - Pétalo', 'Paquete para eventos de 140 personas en el Salón Pétalo', 3840.00, 140, 140, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 4 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 7 0 0 bo ca di to sd ed ul ce y 7 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 6 Ga lo ne sd ec oc te le sD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 1 4 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(54, 'Cristal - 150 personas - Pétalo', 'Paquete para eventos de 150 personas en el Salón Pétalo', 2458.00, 150, 150, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , co la s . Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 5 0 Pe rs on as : $ 1 5 , 9 9', 1, '2026-01-03 20:34:40'),
	(55, 'Destello - 150 personas - Pétalo', 'Paquete para eventos de 150 personas en el Salón Pétalo', 2908.50, 150, 150, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 5 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 7 5 0 bo ca di to sd ed ul ce Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . Pa qu et eD es te ll oT ot al Ev en toTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 5 0 Pe rs on as : $ 1 8 , 9 9', 1, '2026-01-03 20:34:40'),
	(56, 'Luz - 150 personas - Pétalo', 'Paquete para eventos de 150 personas en el Salón Pétalo', 3660.00, 150, 150, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 5 ar re gl os fl or al es na tu ra le sB uf fe t : 2 Pr ot ei na s + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , 9 0 0 bo ca di to sd ed ul ce y 9 0 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Br in di sG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as co nd ic io ne s . To ta lE ve nt oTo ta lE ve nt o Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s 1 5 0 Pe rs on as : $ 2 4 , 0 0', 1, '2026-01-03 20:34:40'),
	(57, 'Resplandor - 150 personas - Pétalo', 'Paquete para eventos de 150 personas en el Salón Pétalo', 4110.00, 150, 150, 6, 'Sa ló nP ét al oc li ma ti za do ya ro ma ti za do du ra nt e 6 ho ra sd ee ve nt oM en aj ed ec or at iv o : Co rt in as de te la tu l , pa ll et s , ac ce so ri os de bo ca di to s , fl or es ar ti fi ci al es , me sa s , si ll as ti fa nn y , to rt af al sa De co ra ci ón co nl uc es le da co rd ea le ve nt o . 1 5 ar re gl os fl or al es na tu ra le sB uf fe t : 1 Pr ot ei na + 1 Gu ar ni ci ón + 1 En sa la da Va ji ll ac om pl et a . Pl at os , va so s , te ne do re s , co pa s , se rv il le ta s . Be bi da sS of ti li mi ta da sd ur an te el ev en to . Ag ua , mi ne ra l , hi el o , 7 5 0 bo ca di to sd ed ul ce y 7 5 0 bo ca di to sd es al Pe rs on al de se rv ic io : Co or di na ci ón an te sy du ra nt ee le ve nt oM on ta je yD es mo nt aj eS er vi ci oD jP er so na lA nf it ri ón de in gr es oP er so na lp ar al aa si st en ci ad em es ad ei nv it ad os Se rv ic io sA di ci on al es : 6 Ga lo ne sd ec oc te lD eg us ta ci ón : 2 pl at os An im ad or du ra nt et od oe le ve nt o 1 5 0 Po rc io ne sd et or ta : Ma sa de ma nz an a / nu ec es - ch oc ol at e - Ho ra lo ca 2 ga ro to sy ro bo tl ed Br in di sC ám ar ad eh um oG ar an tí a : Se so li ci ta $ 6 0 de ga ra nt ía re em bo ls ab le al si gu ie nt ed ía há bi lu na ve zc on st at ad oq ue el SA LÓ Ny su sm at er ia le se st én en bu en as Pa qu et eR es pl an do rN ota : Un av ez re se rv ad oe le ve nt oe nc as od es us pe nd er po rr az on es aj en as an os ot ro s ( cu ar en te na , PA ND EM IA , in un da ci on es , ap ag on es , pa ra li za ci on es en tr eo tr as de ca rá ct er ur ge nt eo bl ig at or io , NO SE HA CE ND EV OL UC IO NE S , se pu ed er ep ro gr am ar el ev en to se gú nl aa ge nd ay di sp on ib il id ad de ls al ón . Av . Fr an ci sc od eO re ll an a . Sa ma ne s 3 li ri os sa lo ne ve nt os ec Li ri os . ev en to s', 1, '2026-01-03 20:34:40'),
	(58, 'fgdfg', 'dfgsdfg', 343.00, 34, 34, 3, 'afaf', 1, '2026-01-03 21:07:09');

-- Volcando estructura para tabla lirios_eventos.plan_productos
CREATE TABLE IF NOT EXISTS `plan_productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_producto_id` (`producto_id`),
  CONSTRAINT `plan_productos_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plan_productos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.plan_productos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla lirios_eventos.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción general del producto/servicio',
  `detalles_adicionales` text COLLATE utf8mb4_unicode_ci COMMENT 'Información adicional del producto (incluye, características especiales, etc.)',
  `variantes` text COLLATE utf8mb4_unicode_ci COMMENT 'Variantes u opciones del producto (ej: "3x3: $350, 4x3: $400, 5x4: $550")',
  `precio` decimal(10,2) NOT NULL COMMENT 'Precio base del producto/servicio (o precio único si no hay variantes)',
  `precio_minimo` decimal(10,2) DEFAULT NULL COMMENT 'Precio mínimo del producto/servicio',
  `precio_maximo` decimal(10,2) DEFAULT NULL COMMENT 'Precio máximo del producto/servicio',
  `duracion_horas` int DEFAULT NULL COMMENT 'Duración del servicio en horas (ej: 2, 3, 4, 6 horas)',
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_categoria` int DEFAULT NULL,
  `stock_disponible` int NOT NULL DEFAULT '0',
  `stock` int NOT NULL DEFAULT '0',
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'unidad' COMMENT 'Unidad de medida (unidad, servicio, hora, evento, etc.)',
  `tipo_servicio` enum('servicio','equipo','producto','paquete','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'servicio' COMMENT 'Tipo de producto/servicio',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_id_categoria` (`id_categoria`),
  KEY `idx_activo` (`activo`),
  KEY `idx_duracion_horas` (`duracion_horas`),
  KEY `idx_tipo_servicio` (`tipo_servicio`),
  KEY `idx_precio_minimo` (`precio_minimo`),
  KEY `idx_precio_maximo` (`precio_maximo`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.productos: ~33 rows (aproximadamente)
INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `detalles_adicionales`, `variantes`, `precio`, `precio_minimo`, `precio_maximo`, `duracion_horas`, `categoria`, `id_categoria`, `stock_disponible`, `stock`, `unidad_medida`, `tipo_servicio`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'Animador / Maestro de Ceremonia', 'Asegura el éxito de tu celebración con nuestro Presentador Profesional, quien llevará el control del evento con estilo, energía y una excelente interacción con los asistentes.', 'Presentador profesional que coordina y anima el evento completo', NULL, 150.00, NULL, NULL, NULL, NULL, 12, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(2, 'Hora Loca', 'Lleva la fiesta al máximo nivel con nuestra Hora Loca acompañada de Robot LED + Tambolero + Coneja o Bola Disco', 'Incluye: Robot LED, Tambolero, Coneja o Bola Disco', NULL, 230.00, NULL, NULL, NULL, NULL, 12, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(3, 'Servicio DJ Todo el Evento', 'Ponle ritmo a tu celebración con nuestro servicio profesional de DJ. Creamos la atmósfera perfecta con música personalizada que hará bailar a todos tus invitados.', 'Servicio de DJ profesional durante todo el evento', NULL, 150.00, NULL, NULL, NULL, NULL, 3, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(4, 'Música - Mariachis / Violinista / Banda Musical / Cantante', 'Servicios musicales variados para tu evento. Consulta por interno los paquetes de cada uno de los segmentos.', 'Opciones disponibles: Mariachis, Violinista, Banda musical, Cantante. Consultar precios y disponibilidad.', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(5, 'Pista LED', 'Pista de baile LED para crear ambiente único en tu evento', NULL, '3x3: $350, 4x3: $400, 5x4: $550', 400.00, 350.00, 550.00, NULL, NULL, 4, 0, 0, 'unidad', 'equipo', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(6, 'Túnel LED', 'Túnel LED para crear un efecto visual impactante en la entrada o área principal', NULL, NULL, 250.00, NULL, NULL, NULL, NULL, 4, 0, 0, 'servicio', 'equipo', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(7, 'Photobooth Mirror', 'Cabina de fotos con espejo para momentos divertidos en tu evento', NULL, '2 Horas: $440, 3 Horas: $530', 485.00, 440.00, 530.00, 2, NULL, 15, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(8, 'Video 360', 'Servicio de video 360 grados para capturar momentos únicos', 'Incluyen gafas y sombreros. Se descarga un código QR con los videos editados (opción $180)', '2 Horas con celular del cliente: $150, 2 Horas con código QR: $180', 165.00, 150.00, 180.00, 2, NULL, 15, 0, 0, 'servicio', 'servicio', 0, '2026-01-03 20:17:49', '2026-01-03 20:58:14'),
	(9, 'Show de Cabezones', 'Show con cabezones temáticos: Ferxxo, Bad Bunny, Daddy Yankee, Wisin y Yandel', NULL, '2 Cabezones: $200, 2 Cabezones + Bailarina + Tambolero: $250', 225.00, 200.00, 250.00, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(10, 'Show Disney: La Bella y La Bestia', 'Show temático de Disney con personajes de La Bella y La Bestia', 'Personajes: Lumiere, Din don, Chip (Taza), Sra Pots (tetera), Rosa, Plumet, Armario. Incluye: Recepción de invitados + Opening + Hora Loca + Animador + ensayo con la quinceañera (opción $800)', 'Show 50 minutos (6 personajes): $450, Cobertura 4 horas (7 personajes): $800', 625.00, 450.00, 800.00, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(11, 'Show Alicia en el País de las Maravillas', 'Show temático con personajes de Alicia en el País de las Maravillas', '7 personajes: Reina roja, Conejo, Rey Tiempo, Gato, 2 gorditos. Incluye: 24 globos, Opening - Hora Loca', NULL, 450.00, NULL, NULL, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(12, 'Show ¿Dónde están las rubias?', 'Show temático con personajes de la película', 'Incluye: 2 rubias, 1 bailarina, Animador, Bufón, 24 globos neón, Integración', NULL, 250.00, NULL, NULL, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(13, 'Show Rosa Viviente', 'Show con personaje de rosa viviente para eventos especiales', 'Incluye: Recepción de invitados, Show, Fotos con el personaje', '1 Hora: $125, 2 Horas: $170', 147.50, 125.00, 170.00, 1, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(14, 'Servicio de Fotografía', 'Cobertura fotográfica profesional para tu evento', '2 Horas: 30 fotos editadas (enlace descargable) + 30 fotos impresas en papel fotográfico + Cajita decorativa de regalo. 4 Horas: 50 fotos editadas (enlace descargable) + Video reel express + 50 fotos impresas + Cajita decorativa. 6 Horas: 80 fotos editadas (enlace descargable) + Video reel 30 segundos + 80 fotos impresas + Cajita decorativa', '2 Horas: $185, 4 Horas: $315, 6 Horas: $470', 323.33, 185.00, 470.00, 2, NULL, 9, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(15, 'Luces Frías', 'Efecto de iluminación con luces frías para ambiente especial', NULL, NULL, 130.00, NULL, NULL, NULL, NULL, 13, 0, 0, 'servicio', 'equipo', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(16, 'Humo Bajo', 'Efecto de humo bajo para crear ambiente y efectos visuales', NULL, NULL, 25.00, NULL, NULL, NULL, NULL, 13, 0, 0, 'servicio', 'equipo', 1, '2026-01-03 20:17:49', '2026-01-03 20:17:49'),
	(17, 'Animador / Maestro de Ceremonia', 'Asegura el éxito de tu celebración con nuestro Presentador Profesional, quien llevará el control del evento con estilo, energía y una excelente interacción con los asistentes.', 'Presentador profesional que coordina y anima el evento completo', NULL, 150.00, NULL, NULL, NULL, NULL, 12, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(18, 'Hora Loca', 'Lleva la fiesta al máximo nivel con nuestra Hora Loca acompañada de Robot LED + Tambolero + Coneja o Bola Disco', 'Incluye: Robot LED, Tambolero, Coneja o Bola Disco', NULL, 230.00, NULL, NULL, NULL, NULL, 12, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(19, 'Servicio DJ Todo el Evento', 'Ponle ritmo a tu celebración con nuestro servicio profesional de DJ. Creamos la atmósfera perfecta con música personalizada que hará bailar a todos tus invitados.', 'Servicio de DJ profesional durante todo el evento', NULL, 150.00, NULL, NULL, NULL, NULL, 3, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(20, 'Música - Mariachis / Violinista / Banda Musical / Cantante', 'Servicios musicales variados para tu evento. Consulta por interno los paquetes de cada uno de los segmentos.', 'Opciones disponibles: Mariachis, Violinista, Banda musical, Cantante. Consultar precios y disponibilidad.', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 0, 0, 'servicio', 'servicio', 0, '2026-01-03 20:34:40', '2026-01-03 20:58:03'),
	(21, 'Pista LED', 'Pista de baile LED para crear ambiente único en tu evento', NULL, '3x3: $350, 4x3: $400, 5x4: $550', 400.00, 350.00, 550.00, NULL, NULL, 4, 0, 0, 'unidad', 'equipo', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(22, 'Túnel LED', 'Túnel LED para crear un efecto visual impactante en la entrada o área principal', NULL, NULL, 250.00, NULL, NULL, NULL, NULL, 4, 0, 0, 'servicio', 'equipo', 0, '2026-01-03 20:34:40', '2026-01-03 20:58:09'),
	(23, 'Photobooth Mirror', 'Cabina de fotos con espejo para momentos divertidos en tu evento', NULL, '2 Horas: $440, 3 Horas: $530', 485.00, 440.00, 530.00, 2, NULL, 15, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(24, 'Video 360', 'Servicio de video 360 grados para capturar momentos únicos', 'Incluyen gafas y sombreros. Se descarga un código QR con los videos editados (opción $180)', '2 Horas con celular del cliente: $150, 2 Horas con código QR: $180', 165.00, 150.00, 180.00, 2, NULL, 15, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(25, 'Show de Cabezones', 'Show con cabezones temáticos: Ferxxo, Bad Bunny, Daddy Yankee, Wisin y Yandel', NULL, '2 Cabezones: $200, 2 Cabezones + Bailarina + Tambolero: $250', 225.00, 200.00, 250.00, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(26, 'Show Disney: La Bella y La Bestia', 'Show temático de Disney con personajes de La Bella y La Bestia', 'Personajes: Lumiere, Din don, Chip (Taza), Sra Pots (tetera), Rosa, Plumet, Armario. Incluye: Recepción de invitados + Opening + Hora Loca + Animador + ensayo con la quinceañera (opción $800)', 'Show 50 minutos (6 personajes): $450, Cobertura 4 horas (7 personajes): $800', 625.00, 450.00, 800.00, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(27, 'Show Alicia en el País de las Maravillas', 'Show temático con personajes de Alicia en el País de las Maravillas', '7 personajes: Reina roja, Conejo, Rey Tiempo, Gato, 2 gorditos. Incluye: 24 globos, Opening - Hora Loca', NULL, 450.00, NULL, NULL, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(28, 'Show ¿Dónde están las rubias?', 'Show temático con personajes de la película', 'Incluye: 2 rubias, 1 bailarina, Animador, Bufón, 24 globos neón, Integración', NULL, 250.00, NULL, NULL, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(29, 'Show Rosa Viviente', 'Show con personaje de rosa viviente para eventos especiales', 'Incluye: Recepción de invitados, Show, Fotos con el personaje', '1 Hora: $125, 2 Horas: $170', 147.50, 125.00, 170.00, 1, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(30, 'Servicio de Fotografía', 'Cobertura fotográfica profesional para tu evento', '2 Horas: 30 fotos editadas (enlace descargable) + 30 fotos impresas en papel fotográfico + Cajita decorativa de regalo. 4 Horas: 50 fotos editadas (enlace descargable) + Video reel express + 50 fotos impresas + Cajita decorativa. 6 Horas: 80 fotos editadas (enlace descargable) + Video reel 30 segundos + 80 fotos impresas + Cajita decorativa', '2 Horas: $185, 4 Horas: $315, 6 Horas: $470', 323.33, 185.00, 470.00, 2, NULL, 9, 0, 0, 'servicio', 'servicio', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(31, 'Luces Frías', 'Efecto de iluminación con luces frías para ambiente especial', NULL, NULL, 130.00, NULL, NULL, NULL, NULL, 13, 0, 0, 'servicio', 'equipo', 1, '2026-01-03 20:34:40', '2026-01-03 20:34:40'),
	(32, 'Humo Bajo', 'Efecto de humo bajo para crear ambiente y efectos visuales', NULL, NULL, 25.00, NULL, NULL, NULL, NULL, 13, 0, 0, 'servicio', 'equipo', 0, '2026-01-03 20:34:40', '2026-01-03 20:57:34'),
	(33, 'nuevo producto', 'nuevo producto', 'nuevo producto\nnuevo producto', '', 100.00, 50.00, 120.00, 2, NULL, 18, 0, 2, 'unidad', 'producto', 1, '2026-01-03 20:57:24', '2026-01-03 20:57:24'),
	(34, 'Show Disney: La Bella y La Bestia', 'Show temático de Disney con personajes de La Bella y La Bestia', 'Personajes: Lumiere, Din don, Chip (Taza), Sra Pots (tetera), Rosa, Plumet, Armario. Incluye: Recepción de invitados + Opening + Hora Loca + Animador + ensayo con la quinceañera (opción $800)', 'Show 50 minutos (6 personajes): $450, Cobertura 4 horas (7 personajes): $800', 625.00, 450.00, 800.00, NULL, NULL, 14, 0, 0, 'servicio', 'servicio', 1, '2026-01-05 04:51:06', '2026-01-05 04:51:06');

-- Volcando estructura para tabla lirios_eventos.salones
CREATE TABLE IF NOT EXISTS `salones` (
  `id_salon` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidad` int NOT NULL,
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_base` decimal(10,2) DEFAULT '0.00',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_salon`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.salones: ~2 rows (aproximadamente)
INSERT INTO `salones` (`id_salon`, `nombre`, `capacidad`, `ubicacion`, `descripcion`, `precio_base`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(4, 'Jardín', 300, 'Exterior', 'Jardín amplio para eventos grandes al aire libre', 600.00, 1, '2025-12-28 23:37:12', '2025-12-28 23:37:12'),
	(6, 'Brisas de Lirio', 50, 'Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1', 'Salón Brisas de Lirio climatizado y aromatizado durante 6 horas de evento', 0.00, 1, '2026-01-03 18:26:59', '2026-01-03 18:26:59'),
	(12, 'Pétalo', 150, 'Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1', 'Salón Pétalo climatizado y aromatizado durante 6 horas de evento', 0.00, 1, '2026-01-05 02:06:57', '2026-01-05 02:06:57');

-- Volcando estructura para tabla lirios_eventos.tipos_evento
CREATE TABLE IF NOT EXISTS `tipos_evento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria` enum('social','corporativo','religioso','familiar','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'otro',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.tipos_evento: ~39 rows (aproximadamente)
INSERT INTO `tipos_evento` (`id`, `nombre`, `descripcion`, `categoria`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
	(1, 'Matrimonio', 'Ceremonia de matrimonio', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(2, 'Quince Años', 'Celebración de quince años', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(3, 'Fiesta Corporativa', 'Evento corporativo o empresarial', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(4, 'Bautizo', 'Ceremonia de bautismo', 'religioso', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(5, 'Primera Comunión', 'Ceremonia de primera comunión', 'religioso', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(6, 'Confirmación', 'Ceremonia de confirmación', 'religioso', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(7, 'Graduación', 'Celebración de graduación', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(8, 'Aniversario', 'Celebración de aniversario', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(9, 'Cumpleaños', 'Celebración de cumpleaños', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(10, 'Despedida de Soltero/a', 'Fiesta de despedida de soltero o soltera', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(11, 'Baby Shower', 'Celebración para esperar un bebé', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(12, 'Boda Civil', 'Boda civil', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(13, 'Boda Religiosa', 'Boda religiosa', 'religioso', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(14, 'Fiesta de Gala', 'Evento formal de gala', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(15, 'Cena de Negocios', 'Cena de negocios', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(16, 'Lanzamiento de Producto', 'Lanzamiento de producto o servicio', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(17, 'Conferencia', 'Conferencia o charla', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(18, 'Seminario', 'Seminario o taller', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(19, 'Taller', 'Taller educativo', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(20, 'Presentación', 'Presentación de proyecto o producto', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(21, 'Fiesta Temática', 'Fiesta con tema específico', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(22, 'Celebración Familiar', 'Celebración familiar general', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(23, 'Reunión Social', 'Reunión social', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(24, 'Evento Deportivo', 'Evento relacionado con deportes', 'otro', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(25, 'Concierto', 'Concierto o presentación musical', 'otro', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(26, 'Festival', 'Festival cultural o artístico', 'otro', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(27, 'Feria', 'Feria comercial o cultural', 'corporativo', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(28, 'Misa de Acción de Gracias', 'Ceremonia religiosa de acción de gracias', 'religioso', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(29, 'Misa de Difuntos', 'Ceremonia religiosa por fallecidos', 'religioso', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(30, 'Velorio', 'Velorio o velatorio', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(31, 'Almuerzo Familiar', 'Almuerzo familiar', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(32, 'Cena Romántica', 'Cena romántica', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(33, 'Fiesta Infantil', 'Fiesta para niños', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(34, 'Bautizo de Adulto', 'Ceremonia de bautismo para adultos', 'religioso', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(35, 'Bodas de Oro', 'Celebración de bodas de oro (50 años)', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(36, 'Bodas de Plata', 'Celebración de bodas de plata (25 años)', 'familiar', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(37, 'Compromiso', 'Celebración de compromiso', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(38, 'Pedida de Mano', 'Celebración de pedida de mano', 'social', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25'),
	(39, 'Otro', 'Otro tipo de evento', 'otro', 1, '2025-12-29 00:19:25', '2025-12-29 00:19:25');

-- Volcando estructura para tabla lirios_eventos.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` enum('administrador','coordinador','gerente_general','cliente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_ultimo_acceso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  KEY `idx_nombre_usuario` (`nombre_usuario`),
  KEY `idx_rol` (`rol`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla lirios_eventos.usuarios: ~8 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nombre_usuario`, `contrasena`, `nombre_completo`, `email`, `telefono`, `rol`, `activo`, `fecha_creacion`, `fecha_ultimo_acceso`) VALUES
	(1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador del Sistema', 'gregorioenrique14@gmail.com', '593988492339', 'administrador', 1, '2025-12-28 23:37:12', '2026-01-07 23:57:13'),
	(2, 'gerente', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Gerente General', 'gregorioenrique14@gmail.com', '593988492339', 'gerente_general', 1, '2025-12-28 23:37:12', NULL),
	(3, 'coordinador1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'María González', 'gregorioenrique14@gmail.com', '593988492339', 'coordinador', 1, '2025-12-28 23:37:12', NULL),
	(4, 'coordinador2', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Juan Pérez', 'gregorioenrique14@gmail.com', '593988492339', 'coordinador', 1, '2025-12-28 23:37:12', NULL),
	(5, 'cliente1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Carlos Rodríguez', 'gregorioenrique14@gmail.com', '593988492339', 'cliente', 1, '2025-12-28 23:37:12', NULL),
	(6, 'cliente2', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Ana Martínez', 'gregorioenrique14@gmail.com', '593988492339', 'cliente', 1, '2025-12-28 23:37:12', NULL),
	(7, 'cliente3', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Luis Fernández', 'gregorioenrique14@gmail.com', '593988492339', 'cliente', 1, '2025-12-28 23:37:12', NULL),
	(8, 'gosorio', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'GREGORIO ENRIQUE OSORIO ANDRADES', 'gregorioenrique14@gmail.com', '0988492339', 'cliente', 1, '2025-12-31 23:37:58', NULL),
	(10, 'GOSORIO2', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'GREGORIO ENRIQUE OSORIO ANDRADES', 'gregor@gmail.com', '09825512453', 'cliente', 1, '2026-01-08 00:00:59', NULL);

-- Volcando estructura para disparador lirios_eventos.actualizar_saldo_after_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `actualizar_saldo_after_delete` AFTER DELETE ON `pagos` FOR EACH ROW BEGIN
    DECLARE v_total_pagado DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_total_reembolsos DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_precio_total DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_nuevo_saldo DECIMAL(10, 2) DEFAULT 0;
    
    -- Obtener precio total del evento
    SELECT COALESCE(total, 0) INTO v_precio_total
    FROM eventos
    WHERE id_evento = OLD.id_evento;
    
    -- Calcular total pagado (excluyendo reembolsos)
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
    FROM pagos
    WHERE id_evento = OLD.id_evento 
    AND tipo_pago != 'reembolso';
    
    -- Calcular total de reembolsos
    SELECT COALESCE(SUM(monto), 0) INTO v_total_reembolsos
    FROM pagos
    WHERE id_evento = OLD.id_evento 
    AND tipo_pago = 'reembolso';
    
    -- Calcular nuevo saldo
    SET v_nuevo_saldo = v_precio_total - v_total_pagado + v_total_reembolsos;
    
    -- Actualizar saldo pendiente y total_pagado en eventos
    UPDATE eventos
    SET saldo = v_nuevo_saldo,
        total_pagado = v_total_pagado
    WHERE id_evento = OLD.id_evento;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador lirios_eventos.actualizar_saldo_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `actualizar_saldo_after_insert` AFTER INSERT ON `pagos` FOR EACH ROW BEGIN
    DECLARE v_total_pagado DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_total_reembolsos DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_precio_total DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_nuevo_saldo DECIMAL(10, 2) DEFAULT 0;
    
    -- Obtener precio total del evento
    SELECT COALESCE(total, 0) INTO v_precio_total
    FROM eventos
    WHERE id_evento = NEW.id_evento;
    
    -- Calcular total pagado (excluyendo reembolsos)
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
    FROM pagos
    WHERE id_evento = NEW.id_evento 
    AND tipo_pago != 'reembolso';
    
    -- Calcular total de reembolsos
    SELECT COALESCE(SUM(monto), 0) INTO v_total_reembolsos
    FROM pagos
    WHERE id_evento = NEW.id_evento 
    AND tipo_pago = 'reembolso';
    
    -- Calcular nuevo saldo
    SET v_nuevo_saldo = v_precio_total - v_total_pagado + v_total_reembolsos;
    
    -- Actualizar saldo pendiente y total_pagado en eventos
    UPDATE eventos
    SET saldo = v_nuevo_saldo,
        total_pagado = v_total_pagado
    WHERE id_evento = NEW.id_evento;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador lirios_eventos.actualizar_saldo_after_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `actualizar_saldo_after_update` AFTER UPDATE ON `pagos` FOR EACH ROW BEGIN
    DECLARE v_total_pagado DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_total_reembolsos DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_precio_total DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_nuevo_saldo DECIMAL(10, 2) DEFAULT 0;
    
    -- Obtener precio total del evento
    SELECT COALESCE(total, 0) INTO v_precio_total
    FROM eventos
    WHERE id_evento = NEW.id_evento;
    
    -- Calcular total pagado (excluyendo reembolsos)
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
    FROM pagos
    WHERE id_evento = NEW.id_evento 
    AND tipo_pago != 'reembolso';
    
    -- Calcular total de reembolsos
    SELECT COALESCE(SUM(monto), 0) INTO v_total_reembolsos
    FROM pagos
    WHERE id_evento = NEW.id_evento 
    AND tipo_pago = 'reembolso';
    
    -- Calcular nuevo saldo
    SET v_nuevo_saldo = v_precio_total - v_total_pagado + v_total_reembolsos;
    
    -- Actualizar saldo pendiente y total_pagado en eventos
    UPDATE eventos
    SET saldo = v_nuevo_saldo,
        total_pagado = v_total_pagado
    WHERE id_evento = NEW.id_evento;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador lirios_eventos.trigger_notificar_abono
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `trigger_notificar_abono` AFTER INSERT ON `pagos` FOR EACH ROW BEGIN
    -- Solo para abonos (no reembolsos)
    IF NEW.tipo_pago = 'abono' THEN
        CALL crear_notificacion_inmediata(
            NEW.id_evento,
            'abono_recibido',
            NEW.monto,
            NEW.metodo_pago
        );
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador lirios_eventos.trigger_notificar_pago_completo
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `trigger_notificar_pago_completo` AFTER INSERT ON `pagos` FOR EACH ROW BEGIN
    DECLARE v_total_pagado DECIMAL(10,2);
    DECLARE v_precio_total DECIMAL(10,2);
    
    -- Solo para pagos (no reembolsos)
    IF NEW.tipo_pago != 'reembolso' THEN
        -- Calcular total pagado
        SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
        FROM pagos
        WHERE id_evento = NEW.id_evento
        AND tipo_pago != 'reembolso';
        
        -- Obtener precio total del evento
        SELECT COALESCE(total, 0) INTO v_precio_total
        FROM eventos
        WHERE id_evento = NEW.id_evento;
        
        -- Si el total pagado es mayor o igual al precio total, notificar pago completo
        IF v_precio_total > 0 AND v_total_pagado >= v_precio_total THEN
            -- Verificar que no se haya enviado ya esta notificación
            IF NOT notificacion_ya_enviada(NEW.id_evento, 'pago_completo') THEN
                CALL crear_notificacion_inmediata(
                    NEW.id_evento,
                    'pago_completo',
                    NULL,
                    NULL
                );
            END IF;
        END IF;
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
