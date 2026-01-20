-- ============================================================================
-- PROYECTO FINAL - SIGIE (Sistema Integrado de Gestión Institucional y Estudiantil)
-- LIRIOS EVENTOS - Base de Datos Completa
-- Metodología ABP - Base de Datos Avanzada
-- 2B
-- GREGORIO OSORIO 
-- ============================================================================
-- Este script implementa una solución COMPLETA de base de datos para la
-- gestión de eventos de Lirios Eventos, cumpliendo TODOS los requerimientos
-- técnicos del proyecto final SIGIE.
--
-- ESTRUCTURA DEL SCRIPT:
-- SECCIÓN 1: DDL - Creación completa de base de datos y tablas
-- SECCIÓN 2: DDL - ALTER TABLE (3 modificaciones) y DROP TABLE (1 eliminación)
-- SECCIÓN 3: ÍNDICES - 5 índices de diferentes tipos
-- SECCIÓN 4: DML - INSERT (20+ registros)
-- SECCIÓN 5: DML - SELECT complejos (WHERE, GROUP BY, HAVING, ORDER BY, JOINs)
-- SECCIÓN 6: DML - UPDATE (3 actualizaciones)
-- SECCIÓN 7: DML - DELETE (3 eliminaciones)
-- SECCIÓN 8: TRIGGERS - 5 triggers (2 AFTER INSERT, 1 BEFORE UPDATE, 1 AFTER UPDATE, 1 BEFORE DELETE)
-- SECCIÓN 9: PROCEDIMIENTOS - 2 procedimientos (1 IN, 1 OUT)
-- SECCIÓN 10: FUNCIONES - 2 funciones (escalares, conversión, fecha)
-- SECCIÓN 11: CURSORES - 1 cursor funcional completo
-- SECCIÓN 12: TRANSACCIONES - START TRANSACTION, COMMIT, ROLLBACK
-- SECCIÓN 13: SEGURIDAD - Roles y privilegios
-- SECCIÓN 14: SOSTENIBILIDAD - Comentarios y optimizaciones
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: DDL - CREACIÓN COMPLETA DE BASE DE DATOS Y TABLAS
-- ============================================================================
-- Creación completa de la base de datos
-- Al menos 6 a 10 tablas con relaciones bien definidas
-- Restricciones: PK, FK, UNIQUE, CHECK, NULL / NOT NULL
-- Tipos de datos correctamente aplicados
-- ============================================================================

-- Eliminar base de datos si existe (solo para desarrollo limpio)
-- DROP DATABASE IF EXISTS lirios_eventos2;

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS lirios_eventos2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci ;

USE lirios_eventos2;

-- ----------------------------------------------------------------------------
-- TABLA 1: usuarios
-- ----------------------------------------------------------------------------
-- Almacena información de todos los usuarios del sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del usuario',
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,-- Nombre de usuario único para login',
    contrasena VARCHAR(255) NOT NULL,-- Contraseña encriptada (SHA2)',
    nombre_completo VARCHAR(100) NOT NULL,-- Nombre completo del usuario',
    email VARCHAR(100) UNIQUE,-- Correo electrónico único',
    telefono VARCHAR(20),-- Teléfono de contacto',
    rol ENUM('administrador', 'coordinador', 'gerente_general', 'cliente') NOT NULL,-- Rol del usuario en el sistema',
    activo BOOLEAN DEFAULT TRUE NOT NULL,-- Indica si el usuario está activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de creación del usuario',
    fecha_ultimo_acceso TIMESTAMP NULL,-- Fecha del último acceso al sistema',
    INDEX idx_nombre_usuario (nombre_usuario),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de usuarios del sistema';

-- ----------------------------------------------------------------------------
-- TABLA 2: clientes
-- ----------------------------------------------------------------------------
-- Almacena información adicional de clientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del cliente',
    usuario_id INT UNIQUE,-- Referencia al usuario asociado',
    documento_identidad VARCHAR(20) UNIQUE,-- Documento de identidad único',
    direccion TEXT,-- Dirección de residencia',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de registro como cliente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_documento (documento_identidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de clientes';

-- ----------------------------------------------------------------------------
-- TABLA 3: categorias
-- ----------------------------------------------------------------------------
-- Almacena categorías de productos/servicios
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único de la categoría',
    nombre VARCHAR(100) NOT NULL UNIQUE,-- Nombre único de la categoría',
    descripcion TEXT,-- Descripción de la categoría',
    activo BOOLEAN DEFAULT TRUE NOT NULL,-- Indica si la categoría está activa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de creación',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,-- Fecha de última actualización',
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de categorías de productos';

-- ----------------------------------------------------------------------------
-- TABLA 4: productos
-- ----------------------------------------------------------------------------
-- Almacena productos y servicios disponibles
-- ============================================================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del producto',
    nombre VARCHAR(100) NOT NULL,-- Nombre del producto/servicio',
    descripcion TEXT,-- Descripción general del producto',
    detalles_adicionales TEXT,-- Detalles adicionales y características',
    variantes TEXT,-- Variantes u opciones disponibles',
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),-- Precio base del producto',
    precio_minimo DECIMAL(10, 2) CHECK (precio_minimo IS NULL OR precio_minimo >= 0),-- Precio mínimo',
    precio_maximo DECIMAL(10, 2) CHECK (precio_maximo IS NULL OR precio_maximo >= 0),-- Precio máximo',
    duracion_horas INT CHECK (duracion_horas IS NULL OR duracion_horas > 0),-- Duración del servicio en horas',
    categoria VARCHAR(50),-- Categoría (legacy)',
    id_categoria INT,-- ID de categoría',
    stock_disponible INT NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),-- Stock disponible',
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),-- Stock total',
    unidad_medida VARCHAR(20) DEFAULT 'unidad',-- Unidad de medida',
    tipo_servicio ENUM('servicio', 'equipo', 'producto', 'paquete', 'otro') DEFAULT 'servicio',-- Tipo de producto',
    activo BOOLEAN DEFAULT TRUE NOT NULL,-- Indica si el producto está activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de creación',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,-- Fecha de actualización',
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_nombre (nombre),
    INDEX idx_id_categoria (id_categoria),
    INDEX idx_activo (activo),
    INDEX idx_precio (precio),
    INDEX idx_tipo_servicio (tipo_servicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de productos y servicios';

-- ----------------------------------------------------------------------------
-- TABLA 5: planes
-- ----------------------------------------------------------------------------
-- Almacena planes/paquetes de servicios
-- ============================================================================
CREATE TABLE IF NOT EXISTS planes (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del plan',
    nombre VARCHAR(100) NOT NULL,-- Nombre del plan',
    descripcion TEXT,-- Descripción del plan',
    precio_base DECIMAL(10, 2) NOT NULL CHECK (precio_base >= 0),-- Precio base del plan',
    capacidad_minima INT CHECK (capacidad_minima IS NULL OR capacidad_minima > 0),-- Capacidad mínima de personas',
    capacidad_maxima INT CHECK (capacidad_maxima IS NULL OR capacidad_maxima > 0),-- Capacidad máxima de personas',
    duracion_horas INT CHECK (duracion_horas IS NULL OR duracion_horas > 0),-- Duración en horas',
    incluye TEXT,-- Descripción de lo que incluye el plan',
    activo BOOLEAN DEFAULT TRUE NOT NULL,-- Indica si el plan está activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de creación',
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo),
    INDEX idx_precio_base (precio_base)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de planes/paquetes';

-- ----------------------------------------------------------------------------
-- TABLA 6: plan_productos
-- ----------------------------------------------------------------------------
-- Relación muchos a muchos entre planes y productos
-- ============================================================================
CREATE TABLE IF NOT EXISTS plan_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único',
    plan_id INT NOT NULL,-- ID del plan',
    producto_id INT NOT NULL,-- ID del producto',
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),-- Cantidad del producto en el plan',
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id),
    INDEX idx_producto_id (producto_id),
    UNIQUE KEY uk_plan_producto (plan_id, producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Relación entre planes y productos';

-- ----------------------------------------------------------------------------
-- TABLA 7: salones
-- ----------------------------------------------------------------------------
-- Almacena información de salones disponibles
-- ============================================================================
CREATE TABLE IF NOT EXISTS salones (
    id_salon INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del salón',
    nombre VARCHAR(100) NOT NULL UNIQUE,-- Nombre único del salón',
    capacidad INT NOT NULL CHECK (capacidad > 0),-- Capacidad máxima de personas',
    ubicacion VARCHAR(255),-- Ubicación del salón',
    descripcion TEXT,-- Descripción del salón',
    precio_base DECIMAL(10, 2) DEFAULT 0.00 CHECK (precio_base >= 0),-- Precio base de alquiler',
    activo BOOLEAN DEFAULT TRUE NOT NULL,-- Indica si el salón está activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de creación',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,-- Fecha de actualización',
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo),
    INDEX idx_capacidad (capacidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de salones disponibles';

-- ----------------------------------------------------------------------------
-- TABLA 8: eventos
-- ----------------------------------------------------------------------------
-- Almacena información de eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS eventos (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del evento',
    id_cliente INT NOT NULL,-- Cliente que contrata el evento',
    id_salon INT,-- Salón asignado al evento',
    plan_id INT,-- Plan contratado',
    salon VARCHAR(100),-- Nombre del salón (legacy)',
    nombre_evento VARCHAR(100),-- Nombre del evento',
    tipo_evento VARCHAR(50),-- Tipo de evento',
    fecha_evento DATE NOT NULL,-- Fecha del evento',
    hora_inicio TIME,-- Hora de inicio',
    hora_fin TIME,-- Hora de finalización',
    numero_invitados INT CHECK (numero_invitados IS NULL OR numero_invitados > 0),-- Número de invitados',
    estado ENUM('cotizacion', 'confirmado', 'en_proceso', 'completado', 'cancelado') DEFAULT 'cotizacion',-- Estado del evento',
    total DECIMAL(10, 2) DEFAULT 0.00 CHECK (total >= 0),-- Total del evento',
    saldo DECIMAL(10, 2) DEFAULT 0.00 CHECK (saldo >= 0),-- Saldo pendiente',
    total_pagado DECIMAL(10, 2) DEFAULT 0.00 CHECK (total_pagado >= 0),-- Total pagado',
    observaciones TEXT,-- Observaciones adicionales',
    coordinador_id INT,-- Coordinador asignado',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de creación',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,-- Fecha de actualización',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_salon) REFERENCES salones(id_salon) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE SET NULL,
    FOREIGN KEY (coordinador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_id_cliente (id_cliente),
    INDEX idx_id_salon (id_salon),
    INDEX idx_fecha_evento (fecha_evento),
    INDEX idx_estado (estado),
    INDEX idx_coordinador (coordinador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de eventos';

-- ----------------------------------------------------------------------------
-- TABLA 9: evento_productos
-- ----------------------------------------------------------------------------
-- Relación entre eventos y productos adicionales
-- ============================================================================
CREATE TABLE IF NOT EXISTS evento_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único',
    id_evento INT NOT NULL,-- ID del evento',
    producto_id INT NOT NULL,-- ID del producto',
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),-- Cantidad del producto',
    precio_unitario DECIMAL(10, 2) CHECK (precio_unitario IS NULL OR precio_unitario >= 0),-- Precio unitario',
    subtotal DECIMAL(10, 2) CHECK (subtotal IS NULL OR subtotal >= 0),-- Subtotal',
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_id_evento (id_evento),
    INDEX idx_producto_id (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Productos adicionales por evento';

-- ----------------------------------------------------------------------------
-- TABLA 10: pagos
-- ----------------------------------------------------------------------------
-- Registro de pagos de eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del pago',
    id_evento INT NOT NULL,-- Evento al que corresponde el pago',
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),-- Monto del pago',
    tipo_pago ENUM('abono', 'pago_completo', 'reembolso') DEFAULT 'abono',-- Tipo de pago',
    metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'cheque') NOT NULL,-- Método de pago',
    numero_referencia VARCHAR(50),-- Número de referencia de la transacción',
    fecha_pago DATE NOT NULL,-- Fecha del pago',
    observaciones TEXT,-- Observaciones del pago',
    usuario_registro_id INT,-- Usuario que registró el pago',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de registro',
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_id_evento (id_evento),
    INDEX idx_fecha_pago (fecha_pago),
    INDEX idx_tipo_pago (tipo_pago),
    INDEX idx_usuario_registro (usuario_registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de pagos';

-- ----------------------------------------------------------------------------
-- TABLA 11: recursos_humanos
-- ----------------------------------------------------------------------------
-- Personal disponible (DJs, mesoneros, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS recursos_humanos (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del recurso',
    nombre VARCHAR(100) NOT NULL,-- Nombre del recurso humano',
    tipo_recurso ENUM('mesonero', 'dj', 'decorador', 'catering', 'seguridad', 'otro') NOT NULL,-- Tipo de recurso',
    telefono VARCHAR(20),-- Teléfono de contacto',
    email VARCHAR(100),-- Correo electrónico',
    tarifa_hora DECIMAL(10, 2) CHECK (tarifa_hora IS NULL OR tarifa_hora >= 0),-- Tarifa por hora',
    disponible BOOLEAN DEFAULT TRUE NOT NULL,-- Indica si está disponible',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha de creación',
    INDEX idx_tipo_recurso (tipo_recurso),
    INDEX idx_disponible (disponible),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla de recursos humanos';

-- ----------------------------------------------------------------------------
-- TABLA 12: evento_recursos
-- ----------------------------------------------------------------------------
-- Asignación de recursos humanos a eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS evento_recursos (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único',
    id_evento INT NOT NULL,-- ID del evento',
    recurso_id INT NOT NULL,-- ID del recurso humano',
    horas_asignadas INT CHECK (horas_asignadas IS NULL OR horas_asignadas > 0),-- Horas asignadas',
    fecha_asignacion DATE,-- Fecha de asignación',
    confirmado BOOLEAN DEFAULT FALSE NOT NULL,-- Indica si está confirmado',
    observaciones TEXT,-- Observaciones',
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (recurso_id) REFERENCES recursos_humanos(id) ON DELETE RESTRICT,
    INDEX idx_id_evento (id_evento),
    INDEX idx_recurso_id (recurso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Asignación de recursos humanos a eventos';

-- ----------------------------------------------------------------------------
-- TABLA 13: inventario
-- ----------------------------------------------------------------------------
-- Control de inventario y reservas
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único',
    producto_id INT NOT NULL,-- ID del producto',
    id_evento INT,-- ID del evento',
    cantidad_solicitada INT NOT NULL CHECK (cantidad_solicitada > 0),-- Cantidad solicitada',
    cantidad_disponible INT CHECK (cantidad_disponible IS NULL OR cantidad_disponible >= 0),-- Cantidad disponible',
    cantidad_utilizada INT DEFAULT 0 CHECK (cantidad_utilizada >= 0),-- Cantidad utilizada',
    estado ENUM('disponible', 'reservado', 'en_uso', 'devuelto') DEFAULT 'disponible',-- Estado del inventario',
    fecha_reserva DATE,-- Fecha de reserva',
    fecha_devolucion DATE,-- Fecha de devolución',
    observaciones TEXT,-- Observaciones',
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE SET NULL,
    INDEX idx_producto_id (producto_id),
    INDEX idx_id_evento (id_evento),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Control de inventario';

-- ----------------------------------------------------------------------------
-- TABLA 14: logs_sistema
-- ----------------------------------------------------------------------------
-- Registro de actividades del sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,-- Identificador único del log',
    usuario_id INT,-- Usuario que realizó la acción',
    accion VARCHAR(100) NOT NULL,-- Acción realizada',
    modulo VARCHAR(50),-- Módulo donde se realizó',
    descripcion TEXT,-- Descripción detallada',
    ip_address VARCHAR(45),-- Dirección IP',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Fecha y hora del registro',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_registro (fecha_registro),
    INDEX idx_modulo (modulo),
    INDEX idx_accion (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Logs de auditoría del sistema';

-- ----------------------------------------------------------------------------
-- TABLA TEMPORAL: eventos_temporales_log
-- ----------------------------------------------------------------------------
-- Tabla temporal para demostrar DROP TABLE (será eliminada después)
-- ============================================================================
CREATE TABLE IF NOT EXISTS eventos_temporales_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    datos_anteriores JSON,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
    INDEX idx_id_evento (id_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;-- 'Tabla temporal para demostración de DROP TABLE';

-- ============================================================================
-- SECCIÓN 2: DDL - ALTER TABLE ( 3) Y DROP TABLE (1)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ALTER TABLE 1: Agregar columna de descuento aplicado a eventos
-- ----------------------------------------------------------------------------
ALTER TABLE eventos 
ADD COLUMN descuento_aplicado DECIMAL(10, 2) DEFAULT 0.00 CHECK (descuento_aplicado >= 0) 
--  'Descuento aplicado al evento' 
AFTER total;

-- ----------------------------------------------------------------------------
-- ALTER TABLE 2: Agregar columna de fecha de confirmación a eventos
-- ----------------------------------------------------------------------------
ALTER TABLE eventos 
ADD COLUMN fecha_confirmacion TIMESTAMP NULL 
-- 'Fecha en que se confirmó el evento' 
AFTER fecha_actualizacion;

-- ----------------------------------------------------------------------------
-- ALTER TABLE 3: Agregar índice compuesto para optimizar consultas por fecha y estado
-- ----------------------------------------------------------------------------
-- NOTA: CHECK constraints con referencias a múltiples columnas pueden no funcionar en MySQL < 8.0.16
-- Se valida mediante triggers en su lugar
ALTER TABLE eventos 
ADD INDEX idx_fecha_estado_total (fecha_evento, estado, total);

-- ----------------------------------------------------------------------------
-- DROP TABLE: Eliminar tabla temporal (demostrativo)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS eventos_temporales_log;

-- ============================================================================
-- SECCIÓN 3: ÍNDICES  
-- ============================================================================
-- 2 B-Tree, 1 Hash (simulado en InnoDB), 1 Compuesto, 1 Único
-- ============================================================================

-- ÍNDICE 1: B-Tree en productos por precio (B-Tree es el tipo por defecto en InnoDB)
CREATE INDEX idx_producto_precio ON productos(precio);

-- ÍNDICE 2: B-Tree en eventos por fecha y estado (B-Tree compuesto)
CREATE INDEX idx_evento_fecha_estado ON eventos(fecha_evento, estado);

-- ÍNDICE 3: COMPUESTO en evento_productos para optimizar cálculos
CREATE INDEX idx_evento_producto_completo ON evento_productos(id_evento, producto_id, cantidad, precio_unitario);

-- ÍNDICE 4: ÚNICO compuesto en inventario para evitar reservas duplicadas del mismo producto para el mismo evento
-- NOTA: MySQL permite múltiples NULLs en índices únicos, por lo que este índice previene duplicados solo cuando hay valores
CREATE UNIQUE INDEX idx_inventario_producto_evento_unico ON inventario(producto_id, id_evento, fecha_reserva);

-- NOTA: MySQL/InnoDB no soporta índices Hash nativos en tablas InnoDB.
-- Todos los índices en InnoDB son B-Tree. Para Hash se requeriría MEMORY engine.
-- Crearemos un índice adicional B-Tree como sustituto:
-- ÍNDICE 5: B-Tree adicional para optimizar búsquedas en recursos humanos
CREATE INDEX idx_recurso_tipo_tarifa ON recursos_humanos(tipo_recurso, tarifa_hora, disponible);

-- ÍNDICE ADICIONAL: B-Tree en usuarios por email y activo
CREATE INDEX idx_usuario_email_activo ON usuarios(email, activo);

-- ============================================================================
-- SECCIÓN 4: DML - INSERT  
-- ============================================================================

-- INSERT 1-3: Usuarios del sistema
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, email, telefono, rol) VALUES
('admin_sigie', SHA2('admin123', 256), 'Administrador SIGIE', 'admin@sigie.edu', '3001111111', 'administrador'),
('coord01_sigie', SHA2('coord123', 256), 'Coordinador María González', 'maria.gonzalez@sigie.edu', '3002222222', 'coordinador'),
('gerente_sigie', SHA2('gerente123', 256), 'Gerente General SIGIE', 'gerente@sigie.edu', '3003333333', 'gerente_general')
ON DUPLICATE KEY UPDATE nombre_usuario = nombre_usuario;

-- INSERT 4-6: Clientes adicionales
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, email, telefono, rol) VALUES
('cliente_sigie01', SHA2('cliente123', 256), 'Cliente Test 01', 'cliente01@test.com', '3101111111', 'cliente'),
('cliente_sigie02', SHA2('cliente456', 256), 'Cliente Test 02', 'cliente02@test.com', '3102222222', 'cliente'),
('cliente_sigie03', SHA2('cliente789', 256), 'Cliente Test 03', 'cliente03@test.com', '3103333333', 'cliente')
ON DUPLICATE KEY UPDATE nombre_usuario = nombre_usuario;

INSERT INTO clientes (usuario_id, documento_identidad, direccion) VALUES
((SELECT id FROM usuarios WHERE nombre_usuario = 'cliente_sigie01' LIMIT 1), '1001111111', 'Dirección Cliente 01'),
((SELECT id FROM usuarios WHERE nombre_usuario = 'cliente_sigie02' LIMIT 1), '1002222222', 'Dirección Cliente 02'),
((SELECT id FROM usuarios WHERE nombre_usuario = 'cliente_sigie03' LIMIT 1), '1003333333', 'Dirección Cliente 03')
ON DUPLICATE KEY UPDATE documento_identidad = documento_identidad;

-- INSERT 7-9: Categorías adicionales
INSERT INTO categorias (nombre, descripcion, activo) VALUES
('Servicios Premium', 'Servicios de alta calidad para eventos exclusivos', TRUE),
('Equipos Audiovisuales', 'Equipos de sonido, video e iluminación profesional', TRUE),
('Mobiliario Premium', 'Mobiliario de alta gama para eventos especiales', TRUE)
ON DUPLICATE KEY UPDATE nombre = nombre;

-- INSERT 10-13: Productos adicionales
INSERT INTO productos (nombre, descripcion, precio, id_categoria, stock_disponible, stock, tipo_servicio, activo) VALUES
('Servicio Premium DJ', 'Servicio de DJ profesional con equipo de alta calidad', 800.00, 
 (SELECT id FROM categorias WHERE nombre = 'DJ' LIMIT 1), 5, 5, 'servicio', TRUE),
('Iluminación Premium', 'Sistema de iluminación profesional de última generación', 600.00,
 (SELECT id FROM categorias WHERE nombre = 'Iluminación' LIMIT 1), 10, 10, 'equipo', TRUE),
('Sonido Premium 1000W', 'Sistema de sonido profesional de 1000W', 1000.00,
 (SELECT id FROM categorias WHERE nombre = 'Sonido' LIMIT 1), 8, 8, 'equipo', TRUE),
('Decoración Temática Premium', 'Decoración temática completa de alta calidad', 1200.00,
 (SELECT id FROM categorias WHERE nombre = 'Decoración' LIMIT 1), 15, 15, 'paquete', TRUE)
ON DUPLICATE KEY UPDATE nombre = nombre;

-- INSERT 14-16: Salones adicionales
INSERT INTO salones (nombre, capacidad, ubicacion, descripcion, precio_base) VALUES
('Salón VIP SIGIE', 200, 'Edificio Principal, Piso 3', 'Salón VIP con vista panorámica', 2000.00),
('Salón Estrella', 100, 'Edificio Principal, Piso 2', 'Salón elegante para eventos medianos', 1500.00),
('Terraza Jardín', 150, 'Exterior, Zona Verde', 'Terraza al aire libre con jardín', 1200.00)
ON DUPLICATE KEY UPDATE nombre = nombre;

-- INSERT 17-19: Eventos de prueba
INSERT INTO eventos (id_cliente, id_salon, nombre_evento, tipo_evento, fecha_evento, hora_inicio, hora_fin, numero_invitados, estado, total, saldo, total_pagado) VALUES
((SELECT id FROM clientes WHERE documento_identidad = '1001111111' LIMIT 1),
 (SELECT id_salon FROM salones WHERE nombre = 'Salón VIP SIGIE' LIMIT 1),
 'Evento Corporativo SIGIE', 'Fiesta Corporativa', '2024-07-15', '18:00:00', '23:00:00', 150, 'confirmado', 5000.00, 3000.00, 2000.00),
 
((SELECT id FROM clientes WHERE documento_identidad = '1002222222' LIMIT 1),
 (SELECT id_salon FROM salones WHERE nombre = 'Salón Estrella' LIMIT 1),
 'Boda María y Juan', 'Matrimonio', '2024-08-20', '16:00:00', '01:00:00', 100, 'cotizacion', 4500.00, 4500.00, 0.00),
 
((SELECT id FROM clientes WHERE documento_identidad = '1003333333' LIMIT 1),
 (SELECT id_salon FROM salones WHERE nombre = 'Terraza Jardín' LIMIT 1),
 'Quinceañero Valentina', 'Quince Años', '2024-09-10', '14:00:00', '22:00:00', 120, 'confirmado', 3800.00, 0.00, 3800.00);

-- INSERT 20-22: Pagos de ejemplo
INSERT INTO pagos (id_evento, monto, tipo_pago, metodo_pago, numero_referencia, fecha_pago, usuario_registro_id) VALUES
((SELECT id_evento FROM eventos WHERE nombre_evento = 'Evento Corporativo SIGIE' LIMIT 1),
 1000.00, 'abono', 'transferencia', 'TRF-SIGIE-001', '2024-06-01',
 (SELECT id FROM usuarios WHERE nombre_usuario = 'coord01_sigie' LIMIT 1)),
 
((SELECT id_evento FROM eventos WHERE nombre_evento = 'Evento Corporativo SIGIE' LIMIT 1),
 1000.00, 'abono', 'tarjeta', 'TC-SIGIE-002', '2024-06-15',
 (SELECT id FROM usuarios WHERE nombre_usuario = 'coord01_sigie' LIMIT 1)),
 
((SELECT id_evento FROM eventos WHERE nombre_evento = 'Quinceañero Valentina' LIMIT 1),
 3800.00, 'pago_completo', 'transferencia', 'TRF-SIGIE-003', '2024-08-01',
 (SELECT id FROM usuarios WHERE nombre_usuario = 'coord01_sigie' LIMIT 1));

-- Total: 22 INSERTs distribuidos en las tablas

-- ============================================================================
-- SECCIÓN 5: DML - SELECT COMPLEJOS
-- ============================================================================
-- WHERE - GROUP BY - HAVING - ORDER BY - JOIN (INNER, LEFT, RIGHT)
-- ============================================================================

-- CONSULTA 1: INNER JOIN - Listar eventos con información completa de clientes
SELECT 
    e.id_evento,
    e.nombre_evento,
    u.nombre_completo AS cliente,
    u.email AS email_cliente,
    s.nombre AS salon,
    e.fecha_evento,
    e.hora_inicio,
    e.estado,
    e.total,
    e.total_pagado,
    e.saldo,
    coor.nombre_completo AS coordinador
FROM eventos e
INNER JOIN clientes c ON e.id_cliente = c.id
INNER JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN salones s ON e.id_salon = s.id_salon
LEFT JOIN usuarios coor ON e.coordinador_id = coor.id
WHERE e.estado IN ('confirmado', 'en_proceso')
ORDER BY e.fecha_evento, e.hora_inicio;

-- CONSULTA 2: LEFT JOIN - Productos con su uso en eventos (incluyendo sin uso)
SELECT 
    p.id,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.precio,
    p.stock_disponible,
    COUNT(ep.id_evento) AS eventos_con_uso,
    SUM(ep.cantidad) AS cantidad_total_vendida,
    SUM(ep.subtotal) AS ingresos_totales,
    AVG(ep.precio_unitario) AS precio_promedio_vendido
FROM productos p
LEFT JOIN categorias c ON p.id_categoria = c.id
LEFT JOIN evento_productos ep ON p.id = ep.producto_id
WHERE p.activo = TRUE
GROUP BY p.id, p.nombre, c.nombre, p.precio, p.stock_disponible
HAVING eventos_con_uso >= 0
ORDER BY ingresos_totales DESC, p.nombre;

-- CONSULTA 3: RIGHT JOIN - Recursos humanos y sus asignaciones
SELECT 
    rh.id,
    rh.nombre AS recurso,
    rh.tipo_recurso,
    rh.tarifa_hora,
    rh.disponible,
    COUNT(er.id_evento) AS eventos_asignados,
    SUM(er.horas_asignadas) AS total_horas,
    SUM(er.horas_asignadas * rh.tarifa_hora) AS costo_total
FROM evento_recursos er
RIGHT JOIN recursos_humanos rh ON er.recurso_id = rh.id
GROUP BY rh.id, rh.nombre, rh.tipo_recurso, rh.tarifa_hora, rh.disponible
ORDER BY eventos_asignados DESC, rh.tipo_recurso;

-- CONSULTA 4: GROUP BY y HAVING - Eventos por mes con totales significativos
SELECT 
    DATE_FORMAT(fecha_evento, '%Y-%m') AS mes,
    COUNT(*) AS numero_eventos,
    SUM(total) AS total_ventas,
    AVG(total) AS promedio_por_evento,
    SUM(total_pagado) AS total_cobrado,
    SUM(saldo) AS saldo_pendiente,
    SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) AS eventos_completados
FROM eventos
WHERE fecha_evento >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(fecha_evento, '%Y-%m')
HAVING total_ventas > 10000 OR numero_eventos > 2
ORDER BY mes DESC;

-- CONSULTA 5: WHERE complejo - Clientes con eventos pendientes de pago
SELECT 
    u.id AS id_cliente,
    u.nombre_completo AS cliente,
    u.email,
    u.telefono,
    COUNT(DISTINCT e.id_evento) AS eventos_con_saldo,
    SUM(e.saldo) AS saldo_total_pendiente,
    MAX(e.fecha_evento) AS proximo_evento,
    MIN(e.fecha_evento) AS evento_mas_antiguo
FROM usuarios u
INNER JOIN clientes c ON u.id = c.usuario_id
INNER JOIN eventos e ON c.id = e.id_cliente
WHERE e.saldo > 0
AND e.estado IN ('confirmado', 'en_proceso')
AND e.fecha_evento >= CURDATE()
GROUP BY u.id, u.nombre_completo, u.email, u.telefono
HAVING saldo_total_pendiente > 500
ORDER BY saldo_total_pendiente DESC;

-- CONSULTA 6: JOIN múltiple - Resumen por coordinador
SELECT 
    coor.id AS id_coordinador,
    coor.nombre_completo AS coordinador,
    COUNT(DISTINCT e.id_evento) AS eventos_coordinados,
    COUNT(DISTINCT e.id_cliente) AS clientes_atendidos,
    SUM(e.total) AS total_eventos_coordinados,
    AVG(e.total) AS promedio_por_evento,
    SUM(e.total_pagado) AS total_cobrado,
    SUM(e.saldo) AS saldo_pendiente_coordinado,
    SUM(CASE WHEN e.estado = 'completado' THEN 1 ELSE 0 END) AS eventos_completados,
    SUM(CASE WHEN e.estado = 'confirmado' THEN 1 ELSE 0 END) AS eventos_confirmados
FROM usuarios coor
LEFT JOIN eventos e ON coor.id = e.coordinador_id
WHERE coor.rol = 'coordinador'
GROUP BY coor.id, coor.nombre_completo
HAVING eventos_coordinados > 0 OR coor.activo = TRUE
ORDER BY total_eventos_coordinados DESC, eventos_completados DESC;

-- ============================================================================
-- SECCIÓN 6: DML - UPDATE  
-- ============================================================================

-- UPDATE 1: Actualizar fecha de confirmación de eventos confirmados
UPDATE eventos
SET fecha_confirmacion = fecha_creacion
WHERE estado = 'confirmado'
AND fecha_confirmacion IS NULL
AND fecha_creacion IS NOT NULL;

-- UPDATE 2: Aplicar descuento del 5% a eventos con saldo pendiente mayor a $2000
UPDATE eventos
SET descuento_aplicado = total * 0.05,
    total = total - (total * 0.05),
    saldo = saldo - (saldo * 0.05)
WHERE saldo > 2000
AND estado = 'confirmado'
AND descuento_aplicado = 0
AND total > 0;

-- UPDATE 3: Actualizar estado de eventos pasados a completado
UPDATE eventos
SET estado = 'completado',
    fecha_actualizacion = NOW(),
    saldo = 0
WHERE fecha_evento < CURDATE()
AND estado IN ('confirmado', 'en_proceso')
AND saldo <= 0.01; -- Tolerancia para errores de redondeo

-- ============================================================================
-- SECCIÓN 7: DML - DELETE  
-- ============================================================================

-- DELETE 1: Eliminar logs antiguos (más de 1 año)
DELETE FROM logs_sistema
WHERE fecha_registro < DATE_SUB(NOW(), INTERVAL 1 YEAR)
AND modulo NOT IN ('GESTION_EVENTOS', 'PAGOS'); -- Conservar logs importantes

-- DELETE 2: Eliminar productos inactivos sin uso en eventos
DELETE FROM productos
WHERE activo = FALSE
AND id NOT IN (SELECT DISTINCT producto_id FROM evento_productos WHERE producto_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT producto_id FROM inventario WHERE producto_id IS NOT NULL)
AND fecha_actualizacion < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- DELETE 3: Eliminar asignaciones de recursos no confirmadas y antiguas
DELETE FROM evento_recursos
WHERE confirmado = FALSE
AND fecha_asignacion < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
AND id_evento IN (SELECT id_evento FROM eventos WHERE estado = 'cancelado' OR estado = 'completado');

-- ============================================================================
-- SECCIÓN 8: TRIGGERS  
-- ============================================================================
-- 2 AFTER INSERT - 1 BEFORE UPDATE - 1 AFTER UPDATE - 1 BEFORE DELETE
-- ============================================================================

-- TRIGGER 1: AFTER INSERT - Registrar creación de evento en logs
DELIMITER //
CREATE TRIGGER trg_auditoria_evento_insert
AFTER INSERT ON eventos
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (
        usuario_id,
        accion,
        modulo,
        descripcion,
        fecha_registro
    ) VALUES (
        NEW.coordinador_id,
        'CREAR_EVENTO',
        'GESTION_EVENTOS',
        CONCAT('Evento creado: ', IFNULL(NEW.nombre_evento, 'Sin nombre'), 
               ' - Cliente ID: ', NEW.id_cliente, 
               ' - Total: $', NEW.total,
               ' - Fecha: ', NEW.fecha_evento),
        NOW()
    );
END//
DELIMITER ;

-- TRIGGER 2: AFTER INSERT - Actualizar stock al agregar producto a evento
DELIMITER //
CREATE TRIGGER trg_actualizar_stock_producto_insert
AFTER INSERT ON evento_productos
FOR EACH ROW
BEGIN
    DECLARE v_stock_actual INT;
    
    -- Obtener stock actual
    SELECT stock_disponible INTO v_stock_actual
    FROM productos
    WHERE id = NEW.producto_id;
    
    -- Validar y actualizar stock
    IF v_stock_actual >= NEW.cantidad THEN
        UPDATE productos
        SET stock_disponible = stock_disponible - NEW.cantidad,
            fecha_actualizacion = NOW()
        WHERE id = NEW.producto_id;
        
        -- Registrar en logs
        INSERT INTO logs_sistema (
            accion,
            modulo,
            descripcion,
            fecha_registro
        ) VALUES (
            'ACTUALIZAR_STOCK',
            'INVENTARIO',
            CONCAT('Stock actualizado: Producto ID ', NEW.producto_id, 
                   ' - Cantidad reducida: ', NEW.cantidad),
            NOW()
        );
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Stock insuficiente. Disponible: ', v_stock_actual, 
                                 ', Solicitado: ', NEW.cantidad);
    END IF;
END//
DELIMITER ;

-- TRIGGER 3: BEFORE UPDATE - Validar integridad financiera de eventos
DELIMITER //
CREATE TRIGGER trg_validar_integridad_financiera_update
BEFORE UPDATE ON eventos
FOR EACH ROW
BEGIN
    DECLARE v_error_msg VARCHAR(255);
    
    -- Validar que el total no sea negativo
    IF NEW.total < 0 THEN
        SET v_error_msg = 'El total del evento no puede ser negativo';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- Validar que total_pagado no exceda total
    IF NEW.total_pagado > NEW.total THEN
        SET v_error_msg = CONCAT('El total pagado (', NEW.total_pagado, 
                                ') no puede exceder el total del evento (', NEW.total, ')');
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- Validar que saldo no sea negativo
    IF NEW.saldo < 0 THEN
        SET v_error_msg = 'El saldo no puede ser negativo';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- Recalcular saldo automáticamente
    SET NEW.saldo = NEW.total - NEW.total_pagado - IFNULL(NEW.descuento_aplicado, 0);
    
    -- Validar que fecha de evento no sea en el pasado para eventos nuevos
    IF NEW.estado = 'cotizacion' AND NEW.fecha_evento < CURDATE() THEN
        SET v_error_msg = 'No se puede crear una cotización para una fecha pasada';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
END//
DELIMITER ;

-- TRIGGER 4: AFTER UPDATE - Registrar cambios de estado importantes
DELIMITER //
CREATE TRIGGER trg_registrar_cambio_estado_evento
AFTER UPDATE ON eventos
FOR EACH ROW
BEGIN
    -- Registrar cambio de estado
    IF OLD.estado != NEW.estado THEN
        INSERT INTO logs_sistema (
            usuario_id,
            accion,
            modulo,
            descripcion,
            fecha_registro
        ) VALUES (
            NEW.coordinador_id,
            'CAMBIAR_ESTADO_EVENTO',
            'GESTION_EVENTOS',
            CONCAT('Evento ID ', NEW.id_evento, ': ', 
                   OLD.estado, ' -> ', NEW.estado,
                   ' - ', IFNULL(NEW.nombre_evento, 'Sin nombre')),
            NOW()
        );
        
        -- Si se confirma, establecer fecha de confirmación
        IF NEW.estado = 'confirmado' AND NEW.fecha_confirmacion IS NULL THEN
            UPDATE eventos
            SET fecha_confirmacion = NOW()
            WHERE id_evento = NEW.id_evento;
        END IF;
    END IF;
    
    -- Registrar cambios importantes en totales
    IF ABS(OLD.total - NEW.total) > 100 OR ABS(OLD.saldo - NEW.saldo) > 100 THEN
        INSERT INTO logs_sistema (
            usuario_id,
            accion,
            modulo,
            descripcion,
            fecha_registro
        ) VALUES (
            NEW.coordinador_id,
            'MODIFICAR_TOTAL_EVENTO',
            'GESTION_EVENTOS',
            CONCAT('Evento ID ', NEW.id_evento, ': Total anterior $', OLD.total,
                   ' -> Nuevo total $', NEW.total,
                   ' - Saldo anterior $', OLD.saldo, ' -> Nuevo saldo $', NEW.saldo),
            NOW()
        );
    END IF;
END//
DELIMITER ;

-- TRIGGER 5: BEFORE DELETE - Prevenir eliminación de eventos con pagos registrados
DELIMITER //
CREATE TRIGGER trg_prevenir_eliminar_evento_con_pagos
BEFORE DELETE ON eventos
FOR EACH ROW
BEGIN
    DECLARE v_numero_pagos INT;
    DECLARE v_total_pagado DECIMAL(10, 2);
    DECLARE v_error_msg VARCHAR(500);
    
    -- Contar pagos asociados
    SELECT COUNT(*), COALESCE(SUM(monto), 0) INTO v_numero_pagos, v_total_pagado
    FROM pagos
    WHERE id_evento = OLD.id_evento;
    
    -- Si hay pagos, prevenir eliminación
    IF v_numero_pagos > 0 THEN
        SET v_error_msg = CONCAT('No se puede eliminar el evento. Tiene ', v_numero_pagos, 
                                ' pago(s) registrado(s) por un total de $', v_total_pagado,
                                '. Si desea eliminarlo, primero debe eliminar los pagos asociados.');
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- Registrar intento de eliminación en logs
    INSERT INTO logs_sistema (
        usuario_id,
        accion,
        modulo,
        descripcion,
        fecha_registro
    ) VALUES (
        OLD.coordinador_id,
        'ELIMINAR_EVENTO',
        'GESTION_EVENTOS',
        CONCAT('Intento de eliminar evento ID ', OLD.id_evento, ': ', 
               IFNULL(OLD.nombre_evento, 'Sin nombre'),
               ' - Estado: ', OLD.estado,
               ' - Total: $', OLD.total),
        NOW()
    );
END//
DELIMITER ;

-- ============================================================================
-- SECCIÓN 9: PROCEDIMIENTOS ALMACENADOS  
-- ============================================================================
-- 1 con parámetro IN, 1 con OUT
-- ============================================================================

-- PROCEDIMIENTO 1: Calcular total de evento incluyendo productos y descuentos (IN)
DELIMITER //
CREATE PROCEDURE sp_calcular_total_evento(
    IN p_id_evento INT
)
BEGIN
    DECLARE v_total_plan DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_total_productos DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_total_salon DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_descuento DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_total_final DECIMAL(10, 2);
    DECLARE v_evento_existe INT;
    DECLARE v_evento_estado VARCHAR(20);
    
    -- Validar que el evento existe
    SELECT COUNT(*), estado INTO v_evento_existe, v_evento_estado
    FROM eventos
    WHERE id_evento = p_id_evento;
    
    IF v_evento_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El evento especificado no existe';
    END IF;
    
    -- Validar estado del evento
    IF v_evento_estado = 'cancelado' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede calcular el total de un evento cancelado';
    END IF;
    
    -- Obtener total del plan (si tiene)
    SELECT COALESCE(pl.precio_base, 0) INTO v_total_plan
    FROM eventos e
    LEFT JOIN planes pl ON e.plan_id = pl.id
    WHERE e.id_evento = p_id_evento;
    
    -- Obtener total de productos adicionales
    SELECT COALESCE(SUM(ep.subtotal), 0) INTO v_total_productos
    FROM evento_productos ep
    WHERE ep.id_evento = p_id_evento;
    
    -- Obtener precio del salón
    SELECT COALESCE(s.precio_base, 0) INTO v_total_salon
    FROM eventos e
    LEFT JOIN salones s ON e.id_salon = s.id_salon
    WHERE e.id_evento = p_id_evento;
    
    -- Calcular total
    SET v_total_final = v_total_plan + v_total_productos + v_total_salon;
    
    -- Obtener descuento si existe
    SELECT COALESCE(descuento_aplicado, 0) INTO v_descuento
    FROM eventos
    WHERE id_evento = p_id_evento;
    
    SET v_total_final = v_total_final - v_descuento;
    
    -- Validar que el total sea positivo
    IF v_total_final < 0 THEN
        SET v_total_final = 0;
    END IF;
    
    -- Actualizar total del evento
    UPDATE eventos
    SET total = v_total_final,
        saldo = v_total_final - total_pagado,
        fecha_actualizacion = NOW()
    WHERE id_evento = p_id_evento;
    
    -- Retornar resultado
    SELECT 
        'Total calculado exitosamente' AS mensaje,
        p_id_evento AS id_evento,
        v_total_plan AS total_plan,
        v_total_productos AS total_productos,
        v_total_salon AS total_salon,
        v_descuento AS descuento,
        v_total_final AS total_final,
        v_total_final - (SELECT total_pagado FROM eventos WHERE id_evento = p_id_evento) AS saldo_restante;
END//
DELIMITER ;

-- PROCEDIMIENTO 2: Obtener estadísticas financieras del período (OUT)
DELIMITER //
CREATE PROCEDURE sp_estadisticas_financieras_periodo(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    OUT p_total_ventas DECIMAL(10, 2),
    OUT p_total_cobrado DECIMAL(10, 2),
    OUT p_saldo_pendiente DECIMAL(10, 2),
    OUT p_numero_eventos INT,
    OUT p_eventos_completados INT,
    OUT p_eventos_confirmados INT
)
BEGIN
    -- Validar parámetros
    IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
        SET p_fecha_inicio = DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
        SET p_fecha_fin = CURDATE();
    END IF;
    
    IF p_fecha_inicio > p_fecha_fin THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de inicio no puede ser mayor que la fecha de fin';
    END IF;
    
    -- Calcular estadísticas
    SELECT 
        COALESCE(SUM(total), 0),
        COALESCE(SUM(total_pagado), 0),
        COALESCE(SUM(saldo), 0),
        COUNT(*),
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END),
        SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END)
    INTO 
        p_total_ventas,
        p_total_cobrado,
        p_saldo_pendiente,
        p_numero_eventos,
        p_eventos_completados,
        p_eventos_confirmados
    FROM eventos
    WHERE fecha_evento BETWEEN p_fecha_inicio AND p_fecha_fin;
    
    -- Si no hay eventos, retornar valores por defecto
    IF p_numero_eventos IS NULL THEN
        SET p_numero_eventos = 0;
        SET p_total_ventas = 0;
        SET p_total_cobrado = 0;
        SET p_saldo_pendiente = 0;
        SET p_eventos_completados = 0;
        SET p_eventos_confirmados = 0;
    END IF;
    
END//
DELIMITER ;

-- ============================================================================
-- SECCIÓN 10: FUNCIONES  
-- ============================================================================
-- Categorías: Escalares, Conversión, Fecha y hora
-- ============================================================================

-- FUNCIÓN 1: Calcular días hasta el evento (Función escalar de fecha)
DELIMITER //
CREATE FUNCTION fn_dias_hasta_evento(fecha_evento DATE)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE dias INT;
    
    IF fecha_evento IS NULL THEN
        RETURN NULL;
    END IF;
    
    SET dias = DATEDIFF(fecha_evento, CURDATE());
    
    RETURN dias;
END//
DELIMITER ;
-- probar
/*
SELECT 
    id_evento,
    nombre_evento,
    fecha_evento,
    fn_dias_hasta_evento(fecha_evento) AS dias_restantes
FROM eventos;
*/


-- FUNCIÓN 2: Convertir estado de evento a texto descriptivo (Función de conversión)
DELIMITER //
CREATE FUNCTION fn_estado_evento_texto(estado VARCHAR(20))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    CASE estado
        WHEN 'cotizacion' THEN RETURN 'En Cotización';
        WHEN 'confirmado' THEN RETURN 'Confirmado';
        WHEN 'en_proceso' THEN RETURN 'En Proceso';
        WHEN 'completado' THEN RETURN 'Completado';
        WHEN 'cancelado' THEN RETURN 'Cancelado';
        ELSE RETURN CONCAT('Estado Desconocido: ', IFNULL(estado, 'NULL'));
    END CASE;
END//
DELIMITER ;

-- ============================================================================
-- SECCIÓN 11: CURSORES  
-- ============================================================================
-- DECLARE - OPEN - FETCH - LOOP - CLOSE
-- ============================================================================

-- PROCEDIMIENTO CON CURSOR: Recalcular totales de todos los eventos activos 
DELIMITER //
CREATE PROCEDURE sp_recalcular_totales_eventos()
BEGIN
    DECLARE v_id_evento INT;
    DECLARE v_fin_cursor BOOLEAN DEFAULT FALSE;
    DECLARE v_total_actualizado DECIMAL(10, 2);
    DECLARE v_contador INT DEFAULT 0;
    DECLARE v_errores INT DEFAULT 0;
    
    -- Declarar cursor para recorrer eventos activos
    DECLARE cursor_eventos CURSOR FOR
        SELECT id_evento
        FROM eventos
        WHERE estado IN ('cotizacion', 'confirmado', 'en_proceso')
        ORDER BY fecha_evento, id_evento;
    
    -- Declarar handler para cuando no haya más filas
    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET v_fin_cursor = TRUE;
    
    -- Handler para errores en el cursor
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET v_errores = v_errores + 1;
        -- Continuar con el siguiente evento
    END;
    
    -- Abrir cursor
    OPEN cursor_eventos;
    
    -- Loop para procesar cada evento
    loop_eventos: LOOP
        -- Obtener siguiente registro
        FETCH cursor_eventos INTO v_id_evento;
        
        -- Salir del loop si no hay más registros
        IF v_fin_cursor THEN
            LEAVE loop_eventos;
        END IF;
        
        -- Calcular y actualizar total del evento
        CALL sp_calcular_total_evento(v_id_evento);
        
        -- Obtener el total actualizado
        SELECT total INTO v_total_actualizado
        FROM eventos
        WHERE id_evento = v_id_evento;
        
        SET v_contador = v_contador + 1;
        
    END LOOP loop_eventos;
    
    -- Cerrar cursor
    CLOSE cursor_eventos;
    
    -- Retornar resultado
    SELECT 
        CONCAT('Totales recalculados para ', v_contador, ' evento(s)') AS resultado,
        v_contador AS eventos_procesados,
        v_errores AS errores_encontrados;
END//
DELIMITER ;

CALL sp_recalcular_totales_eventos();

-- ============================================================================
-- SECCIÓN 12: TRANSACCIONES
-- ============================================================================
-- START TRANSACTION - COMMIT - ROLLBACK
-- ============================================================================

-- PROCEDIMIENTO CON TRANSACCIÓN: Confirmar evento y procesar pago inicial
DELIMITER //

CREATE PROCEDURE sp_confirmar_evento_con_abono(
    IN p_id_evento INT,
    IN p_monto_abono DECIMAL(10,2),
    IN p_metodo_pago VARCHAR(20),
    IN p_numero_referencia VARCHAR(50),
    IN p_usuario_id INT
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    DECLARE v_total_evento DECIMAL(10,2);
    DECLARE v_total_pagado_actual DECIMAL(10,2);
    DECLARE v_nuevo_saldo DECIMAL(10,2);
    DECLARE v_id_pago INT;
    DECLARE v_error_msg VARCHAR(255);

    /* ===============================
       1. Obtener datos del evento
       =============================== */
    SELECT estado, total, total_pagado
    INTO v_estado_actual, v_total_evento, v_total_pagado_actual
    FROM eventos
    WHERE id_evento = p_id_evento;

    /* Validar existencia */
    IF v_estado_actual IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El evento especificado no existe';
    END IF;

    /* ===============================
       2. Validaciones iniciales
       =============================== */
    IF v_estado_actual NOT IN ('cotizacion', 'confirmado') THEN
        SET v_error_msg = CONCAT(
            'El evento no puede ser confirmado. Estado actual: ',
            v_estado_actual
        );
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_error_msg;
    END IF;

    IF p_monto_abono <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El monto del abono debe ser mayor que cero';
    END IF;

    IF p_metodo_pago NOT IN ('efectivo','transferencia','tarjeta','cheque') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Método de pago inválido';
    END IF;

    /* ===============================
       3. Iniciar transacción
       =============================== */
    START TRANSACTION;

    /* Validar saldo */
    SET v_nuevo_saldo = v_total_evento - v_total_pagado_actual - p_monto_abono;

    IF v_nuevo_saldo < 0 THEN
        ROLLBACK;
        SET v_error_msg = CONCAT(
            'El abono ($', p_monto_abono,
            ') excede el saldo pendiente ($',
            (v_total_evento - v_total_pagado_actual), ')'
        );
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_error_msg;
    END IF;

    /* Validar monto mínimo */
    IF p_monto_abono < 500 AND v_estado_actual = 'cotizacion' THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El monto mínimo de abono para confirmar un evento es $500';
    END IF;

    /* Validar fecha futura */
    IF EXISTS (
        SELECT 1
        FROM eventos
        WHERE id_evento = p_id_evento
          AND fecha_evento < CURDATE()
    ) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede confirmar un evento con fecha pasada';
    END IF;

    /* ===============================
       4. Confirmar evento
       =============================== */
    UPDATE eventos
    SET estado = 'confirmado',
        fecha_confirmacion = COALESCE(fecha_confirmacion, NOW()),
        fecha_actualizacion = NOW()
    WHERE id_evento = p_id_evento;

    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error al actualizar el estado del evento';
    END IF;

    /* ===============================
       5. Registrar pago
       =============================== */
    INSERT INTO pagos (
        id_evento,
        monto,
        tipo_pago,
        metodo_pago,
        numero_referencia,
        fecha_pago,
        usuario_registro_id
    ) VALUES (
        p_id_evento,
        p_monto_abono,
        'abono',
        p_metodo_pago,
        p_numero_referencia,
        CURDATE(),
        p_usuario_id
    );

    SET v_id_pago = LAST_INSERT_ID();

    IF v_id_pago IS NULL OR v_id_pago = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error al registrar el pago';
    END IF;

    /* ===============================
       6. Confirmar transacción
       =============================== */
    COMMIT;

    /* ===============================
       7. Resultado
       =============================== */
    SELECT
        'Evento confirmado y abono registrado exitosamente' AS mensaje,
        p_id_evento AS id_evento,
        v_id_pago AS id_pago,
        p_monto_abono AS monto_abono,
        (v_total_pagado_actual + p_monto_abono) AS total_pagado_actualizado,
        v_nuevo_saldo AS saldo_restante,
        'confirmado' AS nuevo_estado;

END//

DELIMITER ;

CALL sp_confirmar_evento_con_abono(
    1,
    1000.00,
    'transferencia',
    'TRF-0001-SIGIE',
    2
);

-- ============================================================================
-- SECCIÓN 13: SEGURIDAD
-- ============================================================================
-- Creación de roles - Asignación de privilegios - Control de acceso
-- ============================================================================

-- CREAR ROLES DEL SISTEMA

-- Rol para administradores (acceso total)
CREATE ROLE IF NOT EXISTS 'rol_admin_lirios';
GRANT ALL PRIVILEGES ON lirios_eventos2.* TO 'rol_admin_lirios';
GRANT SELECT ON mysql.* TO 'rol_admin_lirios';

-- Rol para coordinadores (gestión de eventos)
CREATE ROLE IF NOT EXISTS 'rol_coordinador_lirios';
GRANT SELECT, INSERT, UPDATE ON lirios_eventos2.eventos TO 'rol_coordinador_lirios';
GRANT SELECT, INSERT, UPDATE ON lirios_eventos2.evento_productos TO 'rol_coordinador_lirios';
GRANT SELECT, INSERT, UPDATE ON lirios_eventos2.pagos TO 'rol_coordinador_lirios';
GRANT SELECT, INSERT, UPDATE ON lirios_eventos2.evento_recursos TO 'rol_coordinador_lirios';
GRANT SELECT, INSERT ON lirios_eventos2.inventario TO 'rol_coordinador_lirios';
GRANT SELECT ON lirios_eventos2.clientes TO 'rol_coordinador_lirios';
GRANT SELECT ON lirios_eventos2.usuarios TO 'rol_coordinador_lirios';
GRANT SELECT ON lirios_eventos2.productos TO 'rol_coordinador_lirios';
GRANT SELECT ON lirios_eventos2.salones TO 'rol_coordinador_lirios';
GRANT SELECT ON lirios_eventos2.planes TO 'rol_coordinador_lirios';
GRANT SELECT ON lirios_eventos2.recursos_humanos TO 'rol_coordinador_lirios';
GRANT SELECT, INSERT ON lirios_eventos2.logs_sistema TO 'rol_coordinador_lirios';

-- Rol para clientes (solo lectura de sus propios datos)
CREATE ROLE IF NOT EXISTS 'rol_cliente_lirios';
-- Los clientes solo pueden ver sus propios eventos (filtrado por aplicación)
GRANT SELECT ON lirios_eventos2.eventos TO 'rol_cliente_lirios';
GRANT SELECT ON lirios_eventos2.pagos TO 'rol_cliente_lirios'; 

-- Rol para gerente general (lectura y reportes)
CREATE ROLE IF NOT EXISTS 'rol_gerente_lirios';
GRANT SELECT ON lirios_eventos2.* TO 'rol_gerente_lirios';
GRANT INSERT, UPDATE ON lirios_eventos2.logs_sistema TO 'rol_gerente_lirios';
GRANT EXECUTE ON PROCEDURE lirios_eventos2.sp_estadisticas_financieras_periodo TO 'rol_gerente_lirios';
GRANT EXECUTE ON PROCEDURE lirios_eventos2.sp_recalcular_totales_eventos TO 'rol_gerente_lirios';

-- Rol de solo lectura para reportes
CREATE ROLE IF NOT EXISTS 'rol_reportes_lirios';
GRANT SELECT ON lirios_eventos2.* TO 'rol_reportes_lirios';

SELECT * FROM mysql.roles_mapping;


-- COMENTARIOS SOBRE SEGURIDAD Y BUENAS PRÁCTICAS:

/*
SEGURIDAD Y CIFRADO - LIRIOS EVENTOS:
-------------------------------------
 

-- ============================================================================
-- SECCIÓN 15: CONSULTAS DEMOSTRATIVAS Y PRUEBAS
-- ============================================================================

-- DEMOSTRACIÓN 1: Usar función para días hasta evento
SELECT 
    id_evento,
    nombre_evento,
    fecha_evento,
    fn_dias_hasta_evento(fecha_evento) AS dias_restantes,
    fn_estado_evento_texto(estado) AS estado_descriptivo,
    estado
FROM eventos
WHERE fecha_evento >= CURDATE()
ORDER BY fecha_evento;

-- DEMOSTRACIÓN 2: Usar procedimiento para calcular total
-- CALL sp_calcular_total_evento(1);

-- DEMOSTRACIÓN 3: Usar procedimiento para estadísticas
-- SET @total_ventas = 0;
-- SET @total_cobrado = 0;
-- SET @saldo_pendiente = 0;
-- SET @numero_eventos = 0;
-- SET @eventos_completados = 0;
-- SET @eventos_confirmados = 0;
-- CALL sp_estadisticas_financieras_periodo('2024-01-01', '2024-12-31', 
--     @total_ventas, @total_cobrado, @saldo_pendiente, 
--     @numero_eventos, @eventos_completados, @eventos_confirmados);
-- SELECT @total_ventas, @total_cobrado, @saldo_pendiente, 
--        @numero_eventos, @eventos_completados, @eventos_confirmados;

-- DEMOSTRACIÓN 4: Usar procedimiento con cursor
-- CALL sp_recalcular_totales_eventos();

-- DEMOSTRACIÓN 5: Usar transacción
-- CALL sp_confirmar_evento_con_abono(2, 1000.00, 'transferencia', 'TRF-CONF-001', 1);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- RESUMEN DE COMPONENTES IMPLEMENTADOS:
-- ✓ DDL: Base de datos completa, 14 tablas, restricciones (PK, FK, UNIQUE, CHECK, NULL/NOT NULL), 3 ALTER TABLE, 1 DROP TABLE
-- ✓ DML: 22+ INSERT, 6+ SELECT complejos (WHERE, GROUP BY, HAVING, ORDER BY, JOINs), 3 UPDATE, 3 DELETE
-- ✓ Índices: 6+ índices (B-Tree, compuestos, únicos)
-- ✓ Triggers: 5 triggers (2 AFTER INSERT, 1 BEFORE UPDATE, 1 AFTER UPDATE, 1 BEFORE DELETE)
-- ✓ Procedimientos: 4 procedimientos (1 IN, 1 OUT, 1 con cursor, 1 con transacción)
-- ✓ Funciones: 2 funciones (escalar fecha, conversión estado)
-- ✓ Cursores: 1 cursor funcional completo (DECLARE, OPEN, FETCH, LOOP, CLOSE)
-- ✓ Transacciones: START TRANSACTION, COMMIT, ROLLBACK con validaciones lógicas
-- ✓ Seguridad: 5 roles, privilegios, comentarios sobre cifrado y respaldo
-- ✓ Sostenibilidad: Diseño eficiente, optimizaciones, comentarios explicativos
-- ============================================================================
