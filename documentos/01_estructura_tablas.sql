-- ============================================================================
-- SISTEMA DE GESTIÓN DE EVENTOS - LIRIOS EVENTOS
-- ESTRUCTURA DE TABLAS
-- ============================================================================
-- Este archivo contiene todas las definiciones de tablas del sistema.
-- Ejecutar después de crear la base de datos: CREATE DATABASE lirios_eventos;
-- ============================================================================

USE lirios_eventos;

-- ============================================================================
-- TABLA: usuarios
-- ============================================================================
-- Almacena información de todos los usuarios del sistema (administradores,
-- coordinadores, gerentes, clientes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    rol ENUM('administrador', 'coordinador', 'gerente_general', 'cliente') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso TIMESTAMP NULL,
    INDEX idx_nombre_usuario (nombre_usuario),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: clientes
-- ============================================================================
-- Almacena información adicional de clientes (extiende usuarios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    documento_identidad VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario_id (usuario_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: categorias
-- ============================================================================
-- Almacena categorías de productos
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: productos
-- ============================================================================
-- Almacena información de productos/servicios disponibles
-- ============================================================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT COMMENT 'Descripción general del producto/servicio',
    detalles_adicionales TEXT COMMENT 'Información adicional del producto (incluye, características especiales, etc.)',
    variantes TEXT COMMENT 'Variantes u opciones del producto (ej: "3x3: $350, 4x3: $400, 5x4: $550")',
    precio DECIMAL(10, 2) NOT NULL COMMENT 'Precio base del producto/servicio (o precio único si no hay variantes)',
    precio_minimo DECIMAL(10, 2) NULL COMMENT 'Precio mínimo del producto/servicio',
    precio_maximo DECIMAL(10, 2) NULL COMMENT 'Precio máximo del producto/servicio',
    duracion_horas INT NULL COMMENT 'Duración del servicio en horas (ej: 2, 3, 4, 6 horas)',
    categoria VARCHAR(50),
    id_categoria INT,
    stock_disponible INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(20) DEFAULT 'unidad' COMMENT 'Unidad de medida (unidad, servicio, hora, evento, etc.)',
    tipo_servicio ENUM('servicio', 'equipo', 'producto', 'paquete', 'otro') DEFAULT 'servicio' COMMENT 'Tipo de producto/servicio',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria),
    INDEX idx_id_categoria (id_categoria),
    INDEX idx_activo (activo),
    INDEX idx_duracion_horas (duracion_horas),
    INDEX idx_tipo_servicio (tipo_servicio),
    INDEX idx_precio_minimo (precio_minimo),
    INDEX idx_precio_maximo (precio_maximo),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: planes
-- ============================================================================
-- Almacena planes/paquetes de servicios
-- ============================================================================
CREATE TABLE IF NOT EXISTS planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10, 2) NOT NULL,
    capacidad_minima INT,
    capacidad_maxima INT,
    duracion_horas INT,
    incluye TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: plan_productos
-- ============================================================================
-- Relación muchos a muchos entre planes y productos
-- ============================================================================
CREATE TABLE IF NOT EXISTS plan_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    INDEX idx_plan_id (plan_id),
    INDEX idx_producto_id (producto_id),
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: promociones
-- ============================================================================
-- Almacena promociones y descuentos
-- ============================================================================
CREATE TABLE IF NOT EXISTS promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_descuento ENUM('porcentaje', 'monto_fijo') NOT NULL,
    valor_descuento DECIMAL(10, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    plan_id INT,
    producto_id INT,
    aplica_todos BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fechas (fecha_inicio, fecha_fin),
    INDEX idx_activo (activo),
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE SET NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: salones
-- ============================================================================
-- Almacena información de salones disponibles
-- ============================================================================
CREATE TABLE IF NOT EXISTS salones (
    id_salon INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    capacidad INT NOT NULL,
    ubicacion VARCHAR(255),
    descripcion TEXT,
    precio_base DECIMAL(10, 2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: eventos
-- ============================================================================
-- Almacena información de eventos
-- NOTA: El código Python usa id_evento como PRIMARY KEY
-- ============================================================================
CREATE TABLE IF NOT EXISTS eventos (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_salon INT,
    plan_id INT,
    salon VARCHAR(100),  -- Nombre del evento/salón (legacy)
    nombre_evento VARCHAR(100),
    tipo_evento VARCHAR(50),
    fecha_evento DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    numero_invitados INT,
    estado ENUM('cotizacion', 'confirmado', 'en_proceso', 'completado', 'cancelado') DEFAULT 'cotizacion',
    total DECIMAL(10, 2) DEFAULT 0.00,  -- Precio total del evento
    saldo DECIMAL(10, 2) DEFAULT 0.00,  -- Saldo pendiente
    total_pagado DECIMAL(10, 2) DEFAULT 0.00,  -- Total pagado hasta el momento
    observaciones TEXT,
    coordinador_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_id_cliente (id_cliente),
    INDEX idx_id_salon (id_salon),
    INDEX idx_fecha_evento (fecha_evento),
    INDEX idx_estado (estado),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_salon) REFERENCES salones(id_salon) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE SET NULL,
    FOREIGN KEY (coordinador_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: evento_productos
-- ============================================================================
-- Relación muchos a muchos entre eventos y productos adicionales
-- ============================================================================
CREATE TABLE IF NOT EXISTS evento_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    INDEX idx_id_evento (id_evento),
    INDEX idx_producto_id (producto_id),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: inventario
-- ============================================================================
-- Control de inventario y reservas de productos
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    id_evento INT,
    cantidad_solicitada INT NOT NULL,
    cantidad_disponible INT,
    cantidad_utilizada INT DEFAULT 0,
    estado ENUM('disponible', 'reservado', 'en_uso', 'devuelto') DEFAULT 'disponible',
    fecha_reserva DATE,
    fecha_devolucion DATE,
    observaciones TEXT,
    INDEX idx_producto_id (producto_id),
    INDEX idx_id_evento (id_evento),
    INDEX idx_estado (estado),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: pagos
-- ============================================================================
-- Registro de pagos y abonos de eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    tipo_pago ENUM('abono', 'pago_completo', 'reembolso') DEFAULT 'abono',
    estado_pago ENUM('en_revision', 'aprobado', 'rechazado') DEFAULT 'en_revision',
    metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'cheque') NOT NULL,
    numero_referencia VARCHAR(50),
    fecha_pago DATE NOT NULL,
    observaciones TEXT,
    usuario_registro_id INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_id_evento (id_evento),
    INDEX idx_fecha_pago (fecha_pago),
    INDEX idx_tipo_pago (tipo_pago),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: recursos_humanos
-- ============================================================================
-- Almacena información de recursos humanos (mesoneros, DJs, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS recursos_humanos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_recurso ENUM('mesonero', 'dj', 'decorador', 'catering', 'seguridad', 'otro') NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    tarifa_hora DECIMAL(10, 2),
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo_recurso (tipo_recurso),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: evento_recursos
-- ============================================================================
-- Asignación de recursos humanos a eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS evento_recursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    recurso_id INT NOT NULL,
    horas_asignadas INT,
    fecha_asignacion DATE,
    confirmado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    INDEX idx_id_evento (id_evento),
    INDEX idx_recurso_id (recurso_id),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (recurso_id) REFERENCES recursos_humanos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: tareas_evento
-- ============================================================================
-- Tareas y seguimiento de eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS tareas_evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    descripcion TEXT NOT NULL,
    responsable_id INT,
    estado ENUM('pendiente', 'en_proceso', 'completada', 'cancelada') DEFAULT 'pendiente',
    fecha_limite DATE,
    fecha_completada DATE,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_id_evento (id_evento),
    INDEX idx_responsable_id (responsable_id),
    INDEX idx_estado (estado),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: confirmaciones_cliente
-- ============================================================================
-- Confirmaciones de detalles del evento por parte del cliente
-- ============================================================================
CREATE TABLE IF NOT EXISTS confirmaciones_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    tipo_confirmacion ENUM('decoracion', 'colores', 'menu', 'otro') NOT NULL,
    descripcion TEXT,
    confirmado BOOLEAN DEFAULT FALSE,
    fecha_confirmacion TIMESTAMP NULL,
    observaciones_cliente TEXT,
    INDEX idx_id_evento (id_evento),
    INDEX idx_tipo (tipo_confirmacion),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: logs_sistema
-- ============================================================================
-- Registro de actividades del sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50),
    descripcion TEXT,
    ip_address VARCHAR(45),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_registro (fecha_registro),
    INDEX idx_modulo (modulo),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: configuracion_integraciones
-- ============================================================================
-- Configuración de integraciones externas (WhatsApp, Google Sheets, Email)
-- ============================================================================
CREATE TABLE IF NOT EXISTS configuracion_integraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_integracion ENUM('whatsapp', 'google_sheets', 'email') NOT NULL,
    nombre VARCHAR(100),
    configuracion JSON,
    activo BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo_integracion),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: tipos_evento
-- ============================================================================
-- Tipos de eventos disponibles en el sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS tipos_evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria ENUM('social', 'corporativo', 'religioso', 'familiar', 'otro') DEFAULT 'otro',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: configuracion_notificaciones
-- ============================================================================
-- Configuración de notificaciones automáticas
-- ============================================================================
CREATE TABLE IF NOT EXISTS configuracion_notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_notificacion VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    enviar_email BOOLEAN DEFAULT TRUE,
    enviar_whatsapp BOOLEAN DEFAULT TRUE,
    dias_antes INT DEFAULT 0 COMMENT 'Días antes del evento (0 = inmediato, -1 = después del evento)',
    plantilla_email TEXT,
    plantilla_whatsapp TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo_notificacion),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: historial_notificaciones
-- ============================================================================
-- Historial de notificaciones enviadas
-- ============================================================================
CREATE TABLE IF NOT EXISTS historial_notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    tipo_notificacion VARCHAR(50) NOT NULL,
    canal ENUM('email', 'whatsapp', 'ambos') NOT NULL,
    destinatario VARCHAR(255) NOT NULL,
    asunto VARCHAR(255),
    mensaje TEXT,
    enviado BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    fecha_programada TIMESTAMP NULL,
    error TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_id_evento (id_evento),
    INDEX idx_tipo (tipo_notificacion),
    INDEX idx_fecha_programada (fecha_programada),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: destinatarios_notificaciones
-- ============================================================================
-- Correos adicionales que deben recibir notificaciones (además del cliente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS destinatarios_notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_notificacion VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    rol ENUM('administrador', 'coordinador', 'gerente_general', 'custom') DEFAULT 'custom',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tipo_email (tipo_notificacion, email),
    INDEX idx_tipo_notificacion (tipo_notificacion),
    INDEX idx_email (email),
    INDEX idx_activo (activo),
    FOREIGN KEY (tipo_notificacion) REFERENCES configuracion_notificaciones(tipo_notificacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: notificaciones_pendientes
-- ============================================================================
-- Notificaciones pendientes de envío
-- ============================================================================
CREATE TABLE IF NOT EXISTS notificaciones_pendientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    tipo_notificacion VARCHAR(50) NOT NULL,
    canal ENUM('email', 'whatsapp', 'ambos') NOT NULL DEFAULT 'ambos',
    destinatario_email VARCHAR(255),
    destinatario_telefono VARCHAR(20),
    asunto VARCHAR(255),
    mensaje_email TEXT,
    mensaje_whatsapp TEXT,
    fecha_programada DATETIME NOT NULL,
    fecha_envio DATETIME NULL,
    enviado BOOLEAN DEFAULT FALSE,
    intentos INT DEFAULT 0,
    error TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha_programada (fecha_programada),
    INDEX idx_enviado (enviado),
    INDEX idx_id_evento (id_evento),
    INDEX idx_tipo (tipo_notificacion),
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FIN DEL ARCHIVO DE ESTRUCTURA DE TABLAS
-- ============================================================================

