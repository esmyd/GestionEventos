-- Script para actualizar el procedimiento crear_notificacion_inmediata
-- Ejecutar este script en MySQL para corregir el error de result set

USE lirios_eventos;

DROP PROCEDURE IF EXISTS crear_notificacion_inmediata;

DELIMITER //

CREATE PROCEDURE crear_notificacion_inmediata(
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
END //

DELIMITER ;

