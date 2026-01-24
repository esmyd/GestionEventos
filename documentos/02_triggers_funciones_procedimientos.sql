-- ============================================================================
-- SISTEMA DE GESTIÓN DE EVENTOS - LIRIOS EVENTOS
-- TRIGGERS, FUNCIONES Y PROCEDIMIENTOS ALMACENADOS
-- ============================================================================
-- Este archivo contiene todos los triggers, funciones y procedimientos
-- almacenados del sistema.
-- Ejecutar después de crear las tablas (01_estructura_tablas.sql)
-- ============================================================================

USE lirios_eventos;

-- ============================================================================
-- FUNCIONES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FUNCIÓN: notificacion_ya_enviada
-- ----------------------------------------------------------------------------
-- Verifica si una notificación ya fue enviada para un evento
-- Parámetros:
--   p_evento_id: ID del evento
--   p_tipo_notificacion: Tipo de notificación a verificar
-- Retorna: 1 si ya fue enviada, 0 si no
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS notificacion_ya_enviada;

DELIMITER //

CREATE FUNCTION notificacion_ya_enviada(
    p_evento_id INT,
    p_tipo_notificacion VARCHAR(50)
) RETURNS BOOLEAN
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
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- FUNCIÓN: dias_hasta_evento
-- ----------------------------------------------------------------------------
-- Calcula los días hasta el evento
-- Parámetros:
--   p_fecha_evento: Fecha del evento
-- Retorna: Número de días hasta el evento (negativo si ya pasó)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS dias_hasta_evento;

DELIMITER //

CREATE FUNCTION dias_hasta_evento(p_fecha_evento DATE) RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN DATEDIFF(p_fecha_evento, CURDATE());
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS PARA ACTUALIZAR SALDO Y TOTAL_PAGADO EN EVENTOS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER: actualizar_saldo_after_insert
-- ----------------------------------------------------------------------------
-- Actualiza saldo y total_pagado cuando se inserta un pago
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS actualizar_saldo_after_insert;

DELIMITER //

CREATE TRIGGER actualizar_saldo_after_insert
AFTER INSERT ON pagos
FOR EACH ROW
BEGIN
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
    AND tipo_pago != 'reembolso'
    AND (estado_pago = 'aprobado' OR estado_pago IS NULL);
    
    -- Calcular total de reembolsos
    SELECT COALESCE(SUM(monto), 0) INTO v_total_reembolsos
    FROM pagos
    WHERE id_evento = NEW.id_evento 
    AND tipo_pago = 'reembolso'
    AND (estado_pago = 'aprobado' OR estado_pago IS NULL);
    
    -- Calcular nuevo saldo
    SET v_nuevo_saldo = v_precio_total - v_total_pagado + v_total_reembolsos;
    
    -- Actualizar saldo pendiente y total_pagado en eventos
    UPDATE eventos
    SET saldo = v_nuevo_saldo,
        total_pagado = v_total_pagado
    WHERE id_evento = NEW.id_evento;
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- TRIGGER: actualizar_saldo_after_update
-- ----------------------------------------------------------------------------
-- Actualiza saldo y total_pagado cuando se actualiza un pago
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS actualizar_saldo_after_update;

DELIMITER //

CREATE TRIGGER actualizar_saldo_after_update
AFTER UPDATE ON pagos
FOR EACH ROW
BEGIN
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
    AND tipo_pago != 'reembolso'
    AND (estado_pago = 'aprobado' OR estado_pago IS NULL);
    
    -- Calcular total de reembolsos
    SELECT COALESCE(SUM(monto), 0) INTO v_total_reembolsos
    FROM pagos
    WHERE id_evento = NEW.id_evento 
    AND tipo_pago = 'reembolso'
    AND (estado_pago = 'aprobado' OR estado_pago IS NULL);
    
    -- Calcular nuevo saldo
    SET v_nuevo_saldo = v_precio_total - v_total_pagado + v_total_reembolsos;
    
    -- Actualizar saldo pendiente y total_pagado en eventos
    UPDATE eventos
    SET saldo = v_nuevo_saldo,
        total_pagado = v_total_pagado
    WHERE id_evento = NEW.id_evento;
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- TRIGGER: actualizar_saldo_after_delete
-- ----------------------------------------------------------------------------
-- Actualiza saldo y total_pagado cuando se elimina un pago
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS actualizar_saldo_after_delete;

DELIMITER //

CREATE TRIGGER actualizar_saldo_after_delete
AFTER DELETE ON pagos
FOR EACH ROW
BEGIN
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
    AND tipo_pago != 'reembolso'
    AND (estado_pago = 'aprobado' OR estado_pago IS NULL);
    
    -- Calcular total de reembolsos
    SELECT COALESCE(SUM(monto), 0) INTO v_total_reembolsos
    FROM pagos
    WHERE id_evento = OLD.id_evento 
    AND tipo_pago = 'reembolso'
    AND (estado_pago = 'aprobado' OR estado_pago IS NULL);
    
    -- Calcular nuevo saldo
    SET v_nuevo_saldo = v_precio_total - v_total_pagado + v_total_reembolsos;
    
    -- Actualizar saldo pendiente y total_pagado en eventos
    UPDATE eventos
    SET saldo = v_nuevo_saldo,
        total_pagado = v_total_pagado
    WHERE id_evento = OLD.id_evento;
END //

DELIMITER ;

-- ============================================================================
-- PROCEDIMIENTOS PARA NOTIFICACIONES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROCEDIMIENTO: crear_notificacion_inmediata
-- ----------------------------------------------------------------------------
-- Crea una notificación inmediata (abono, pago completo)
-- Parámetros:
--   p_evento_id: ID del evento
--   p_tipo_notificacion: 'abono_recibido' o 'pago_completo'
--   p_monto: Monto del pago (opcional, solo para abonos)
--   p_metodo_pago: Método de pago (opcional)
-- ----------------------------------------------------------------------------
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
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{saldo_pendiente}', IFNULL(CAST(v_saldo_pendiente AS CHAR), '0'));
                
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_cliente}', IFNULL(v_nombre_cliente, 'Cliente'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_evento}', IFNULL(v_nombre_evento, 'Evento'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{fecha_evento}', IFNULL(DATE_FORMAT(v_fecha_evento, '%d/%m/%Y'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{hora_inicio}', IFNULL(TIME_FORMAT(v_hora_inicio, '%H:%i'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{saldo_pendiente}', IFNULL(CAST(v_saldo_pendiente AS CHAR), '0'));
                
                -- Reemplazar variables específicas de pago (si aplica)
                IF p_monto IS NOT NULL THEN
                    SET v_mensaje_email = REPLACE(v_mensaje_email, '{monto}', CAST(p_monto AS CHAR));
                    SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{monto}', CAST(p_monto AS CHAR));
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

-- ----------------------------------------------------------------------------
-- PROCEDIMIENTO: generar_notificaciones_programadas
-- ----------------------------------------------------------------------------
-- Genera notificaciones programadas (recordatorios, solicitud de calificación)
-- Se debe ejecutar periódicamente (diariamente recomendado)
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS generar_notificaciones_programadas;

DELIMITER //

CREATE PROCEDURE generar_notificaciones_programadas()
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
                SET v_mensaje_email = REPLACE(v_mensaje_email, '{saldo_pendiente}', IFNULL(CAST(v_saldo_pendiente AS CHAR), '0'));
                
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_cliente}', IFNULL(v_nombre_cliente, 'Cliente'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{nombre_evento}', IFNULL(v_nombre_evento, 'Evento'));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{fecha_evento}', IFNULL(DATE_FORMAT(v_fecha_evento, '%d/%m/%Y'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{hora_inicio}', IFNULL(TIME_FORMAT(v_hora_inicio, '%H:%i'), ''));
                SET v_mensaje_whatsapp = REPLACE(v_mensaje_whatsapp, '{saldo_pendiente}', IFNULL(CAST(v_saldo_pendiente AS CHAR), '0'));
                
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
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- PROCEDIMIENTO: obtener_notificaciones_pendientes
-- ----------------------------------------------------------------------------
-- Obtiene las notificaciones que están listas para enviar
-- Parámetros:
--   p_limite: Número máximo de notificaciones a retornar (opcional)
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS obtener_notificaciones_pendientes;

DELIMITER //

CREATE PROCEDURE obtener_notificaciones_pendientes(IN p_limite INT)
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
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- PROCEDIMIENTO: marcar_notificacion_enviada
-- ----------------------------------------------------------------------------
-- Marca una notificación como enviada
-- Parámetros:
--   p_notificacion_id: ID de la notificación en notificaciones_pendientes
--   p_exito: TRUE si se envió exitosamente, FALSE si hubo error
--   p_error: Mensaje de error (opcional)
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS marcar_notificacion_enviada;

DELIMITER //

CREATE PROCEDURE marcar_notificacion_enviada(
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
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- PROCEDIMIENTO: limpiar_notificaciones_antiguas
-- ----------------------------------------------------------------------------
-- Elimina notificaciones enviadas con más de X días de antigüedad
-- Parámetros:
--   p_dias: Días de antigüedad para eliminar (por defecto 90 días)
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS limpiar_notificaciones_antiguas;

DELIMITER //

CREATE PROCEDURE limpiar_notificaciones_antiguas(IN p_dias INT)
BEGIN
    IF p_dias IS NULL OR p_dias <= 0 THEN
        SET p_dias = 90; -- Por defecto 90 días
    END IF;
    
    DELETE FROM notificaciones_pendientes
    WHERE enviado = TRUE
    AND fecha_envio < DATE_SUB(NOW(), INTERVAL p_dias DAY);
    
    SELECT CONCAT('Notificaciones eliminadas anteriores a ', p_dias, ' días') AS resultado;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS PARA NOTIFICACIONES AUTOMÁTICAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER: trigger_notificar_abono
-- ----------------------------------------------------------------------------
-- Crea notificación cuando se registra un abono
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_notificar_abono;

DELIMITER //

CREATE TRIGGER trigger_notificar_abono
AFTER INSERT ON pagos
FOR EACH ROW
BEGIN
    -- Solo para abonos (no reembolsos)
    IF NEW.tipo_pago = 'abono' THEN
        CALL crear_notificacion_inmediata(
            NEW.id_evento,
            'abono_recibido',
            NEW.monto,
            NEW.metodo_pago
        );
    END IF;
END //

DELIMITER ;

-- ----------------------------------------------------------------------------
-- TRIGGER: trigger_notificar_pago_completo
-- ----------------------------------------------------------------------------
-- Crea notificación cuando se completa el pago
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_notificar_pago_completo;

DELIMITER //

CREATE TRIGGER trigger_notificar_pago_completo
AFTER INSERT ON pagos
FOR EACH ROW
BEGIN
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
END //

DELIMITER ;

-- ============================================================================
-- FIN DEL ARCHIVO DE TRIGGERS, FUNCIONES Y PROCEDIMIENTOS
-- ============================================================================

