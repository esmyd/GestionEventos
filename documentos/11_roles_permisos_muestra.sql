-- ============================================================================
-- PERMISOS DE MUESTRA POR ROL
-- ============================================================================
-- Inserta permisos base para cada perfil (administrador, gerente_general,
-- coordinador, cliente)
-- ============================================================================

USE lirios_eventos;

-- Administrador: acceso total
INSERT INTO rol_permisos (rol, permisos_json) VALUES
('administrador', '[
  "cotizador",
  "dashboard",
  "eventos",
  "calendario",
  "portal_cliente",
  "perfil",
  "clientes",
  "productos",
  "categorias",
  "planes",
  "pagos",
  "inventario",
  "salones",
  "reportes",
  "usuarios",
  "permisos",
  "eventos:editar_estado",
  "eventos:agregar_producto",
  "eventos:eliminar_producto",
  "eventos:eliminar",
  "eventos:actualizar_servicios",
  "eventos:generar_servicios",
  "eventos:descartar_servicio",
  "eventos:asignar_coordinador",
  "pagos:registrar",
  "pagos:eliminar",
  "planes:crear",
  "planes:editar",
  "planes:eliminar"
]')
ON DUPLICATE KEY UPDATE permisos_json = VALUES(permisos_json);

-- Gerente general: acceso operativo completo, sin gestión de permisos
INSERT INTO rol_permisos (rol, permisos_json) VALUES
('gerente_general', '[
  "dashboard",
  "eventos",
  "calendario",
  "perfil",
  "clientes",
  "productos",
  "categorias",
  "planes",
  "pagos",
  "inventario",
  "salones",
  "reportes",
  "eventos:editar_estado",
  "eventos:agregar_producto",
  "eventos:eliminar_producto",
  "eventos:eliminar",
  "eventos:actualizar_servicios",
  "eventos:generar_servicios",
  "eventos:descartar_servicio",
  "eventos:asignar_coordinador",
  "pagos:registrar",
  "pagos:eliminar",
  "planes:crear",
  "planes:editar",
  "planes:eliminar"
]')
ON DUPLICATE KEY UPDATE permisos_json = VALUES(permisos_json);

-- Coordinador: operativo sin eliminaciones críticas
INSERT INTO rol_permisos (rol, permisos_json) VALUES
('coordinador', '[
  "eventos",
  "calendario",
  "perfil",
  "clientes",
  "productos",
  "planes",
  "salones",
  "pagos",
  "eventos:agregar_producto",
  "eventos:actualizar_servicios",
  "eventos:generar_servicios",
  "eventos:descartar_servicio",
  "pagos:registrar",
  "planes:crear",
  "planes:editar"
]')
ON DUPLICATE KEY UPDATE permisos_json = VALUES(permisos_json);

-- Cliente: solo portal cliente y cotizador
INSERT INTO rol_permisos (rol, permisos_json) VALUES
('cliente', '[
  "portal_cliente",
  "perfil",
  "cotizador"
]')
ON DUPLICATE KEY UPDATE permisos_json = VALUES(permisos_json);
