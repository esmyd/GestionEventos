-- ============================================================================
-- ACTUALIZAR CONTRASEÑAS DE USUARIOS DE PRUEBA
-- ============================================================================
-- Este script actualiza las contraseñas de los usuarios de prueba
-- para que coincidan con las mostradas en el login
-- ============================================================================

USE lirios_eventos;

-- Actualizar contraseñas usando SHA256
-- admin123 -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- gerente123 -> ecfba551324356e5bd27b548adf36b728783f60d9b573d142caac7baad62be49
-- coordinador123 -> 134144f0ce2c90db7a41fe28710e91fbce0ede1c8bf8b5afddcc2ddbaad8555d

UPDATE usuarios 
SET contrasena = SHA2('admin123', 256)
WHERE nombre_usuario = 'admin';

UPDATE usuarios 
SET contrasena = SHA2('gerente123', 256)
WHERE nombre_usuario = 'gerente';

UPDATE usuarios 
SET contrasena = SHA2('coordinador123', 256)
WHERE nombre_usuario = 'coordinador1';

UPDATE usuarios 
SET contrasena = SHA2('coordinador123', 256)
WHERE nombre_usuario = 'coordinador2';

-- Verificar que los usuarios existen, si no, crearlos
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, email, telefono, rol, activo) VALUES
('admin', SHA2('admin123', 256), 'Administrador del Sistema', 'admin@lirioseventos.com', '1234567890', 'administrador', TRUE),
('gerente', SHA2('gerente123', 256), 'Gerente General', 'gerente@lirioseventos.com', '0987654321', 'gerente_general', TRUE),
('coordinador1', SHA2('coordinador123', 256), 'María González', 'maria.gonzalez@lirioseventos.com', '1111111111', 'coordinador', TRUE)
ON DUPLICATE KEY UPDATE 
    contrasena = VALUES(contrasena),
    nombre_completo = VALUES(nombre_completo),
    email = VALUES(email),
    telefono = VALUES(telefono),
    rol = VALUES(rol),
    activo = VALUES(activo);

-- Mostrar usuarios actualizados
SELECT nombre_usuario, nombre_completo, rol, activo, 
       CASE 
           WHEN contrasena = SHA2('admin123', 256) THEN 'admin123 ✓'
           WHEN contrasena = SHA2('gerente123', 256) THEN 'gerente123 ✓'
           WHEN contrasena = SHA2('coordinador123', 256) THEN 'coordinador123 ✓'
           ELSE 'Contraseña diferente'
       END as contraseña_verificada
FROM usuarios 
WHERE nombre_usuario IN ('admin', 'gerente', 'coordinador1', 'coordinador2');
