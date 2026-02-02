export const ROLES = {
  /** Creador/vendedor del software: controla suscripción y config. del sistema (una instancia) */
  ADMIN_SISTEMA: 'administrador_sistema',
  /** Administrador de la empresa (cliente que usa el software): usuarios, roles y permisos */
  ADMIN: 'administrador',
  MANAGER: 'gerente_general',
  COORDINATOR: 'coordinador',
  CLIENT: 'cliente',
};

export const MODULES = {
  COTIZADOR: 'cotizador', /*Cotizador*/
  DASHBOARD: 'dashboard',
  EVENTOS: 'eventos', /*Eventos*/
  CALENDARIO: 'calendario', /*Calendario*/
  PORTAL_CLIENTE: 'portal_cliente', /*Portal del cliente*/
  PERFIL: 'perfil', /*Perfil*/
  CLIENTES: 'clientes', /*Clientes*/
  PRODUCTOS: 'productos', /*Productos*/
  CATEGORIAS: 'categorias', /*Categorías*/
  PLANES: 'planes', /*Paquetes*/
  PAGOS: 'pagos', /*Pagos*/
  CUENTAS: 'cuentas', /*Cuentas*/
  INVENTARIO: 'inventario', /*Inventario*/
  SALONES: 'salones', /*Salones*/
  REPORTES: 'reportes', /*Reportes*/
  USUARIOS: 'usuarios', /*Usuarios*/
  PERMISOS: 'permisos', /*Roles y Permisos*/
  ADMIN_SUSCRIPCION: 'admin_suscripcion', /*Admin Suscripción*/
  MI_PLAN: 'mi_plan', /*Mi Plan*/
  NOTIFICACIONES_NATIVAS: 'notificaciones_nativas',
  INTEGRACIONES: 'integraciones',
  WHATSAPP_CHAT: 'whatsapp_chat',
  WHATSAPP_METRICAS: 'whatsapp_metricas',
  WHATSAPP_TEMPLATES: 'whatsapp_templates',
  CONFIG_DATOS: 'config_datos',/*Configuración del sistema*/
  CARGA_MASIVA: 'carga_masiva',/*Carga masiva de datos*/
  // Próximas implementaciones (placeholders)
  ENVIO_SUGERENCIA: 'envio_sugerencia',/*Envío de sugerencia*/
  PROVEEDORES: 'proveedores',
  FACTURACION_ELECTRONICA: 'facturacion_electronica',
  CONTRATOS: 'contratos',
  RESERVAS_ONLINE: 'reservas_online',
  CRM_AVANZADO: 'crm_avanzado',
  INTEGRACION_CONTABILIDAD: 'integracion_contabilidad',
  SITIO_WEB_EVENTOS: 'sitio_web_eventos',
  INSTAGRAM: 'instagram',
};

export const PERMISSIONS = {
  EVENTOS_EDITAR_ESTADO: 'eventos:editar_estado',
  EVENTOS_FINALIZAR: 'eventos:finalizar',
  EVENTOS_AGREGAR_PRODUCTO: 'eventos:agregar_producto',
  EVENTOS_ELIMINAR_PRODUCTO: 'eventos:eliminar_producto',
  EVENTOS_ELIMINAR: 'eventos:eliminar',
  EVENTOS_ACTUALIZAR_SERVICIOS: 'eventos:actualizar_servicios',
  EVENTOS_GENERAR_SERVICIOS: 'eventos:generar_servicios',
  EVENTOS_DESCARTAR_SERVICIO: 'eventos:descartar_servicio',
  EVENTOS_ASIGNAR_COORDINADOR: 'eventos:asignar_coordinador',
  PAGOS_REGISTRAR: 'pagos:registrar',
  PAGOS_REEMBOLSAR: 'pagos:reembolsar',
  PAGOS_ELIMINAR: 'pagos:eliminar',
  PAGOS_APROBAR: 'pagos:aprobar',
  PAGOS_ANULAR: 'pagos:anular',
  CUENTAS_VER: 'cuentas:ver',
  CUENTAS_CREAR: 'cuentas:crear',
  CUENTAS_EDITAR: 'cuentas:editar',
  CUENTAS_ELIMINAR: 'cuentas:eliminar',
  PLANES_CREAR: 'planes:crear',
  PLANES_EDITAR: 'planes:editar',
  PLANES_ELIMINAR: 'planes:eliminar',
};

const ROLE_ALIASES = {
  administrador_sistema: ROLES.ADMIN_SISTEMA,
  'administrador sistema': ROLES.ADMIN_SISTEMA,
  admin: ROLES.ADMIN,
  administrador: ROLES.ADMIN,
  administrator: ROLES.ADMIN,
  'gerente general': ROLES.MANAGER,
  gerente_general: ROLES.MANAGER,
  manager: ROLES.MANAGER,
  coordinador: ROLES.COORDINATOR,
  coordinator: ROLES.COORDINATOR,
  cliente: ROLES.CLIENT,
  client: ROLES.CLIENT,
};

const ROLE_LABELS = {
  [ROLES.ADMIN_SISTEMA]: 'Administrador del sistema',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.MANAGER]: 'Gerente General',
  [ROLES.COORDINATOR]: 'Coordinador',
  [ROLES.CLIENT]: 'Cliente',
};

export const normalizeRole = (rawRole) => {
  if (!rawRole) return null;
  const normalized = String(rawRole).trim().toLowerCase();
  if (ROLE_ALIASES[normalized]) return ROLE_ALIASES[normalized];
  const underscored = normalized.replace(/\s+/g, '_');
  return ROLE_ALIASES[underscored] || underscored;
};

export const isRoleAllowed = (userRole, allowedRoles = []) => {
  const normalizedUserRole = normalizeRole(userRole);
  if (!normalizedUserRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.some((role) => normalizeRole(role) === normalizedUserRole);
};

export const getRoleLabel = (rawRole) => {
  const normalizedRole = normalizeRole(rawRole);
  if (!normalizedRole) return '';
  return ROLE_LABELS[normalizedRole] || normalizedRole;
};

export const hasRole = (userRole, allowedRoles = []) => isRoleAllowed(userRole, allowedRoles);

export const hasModuleAccess = (usuario, moduleKey, fallbackRoles = []) => {
  if (!usuario) return false;
  if (Array.isArray(usuario.permisos) && usuario.permisos.length > 0) {
    return usuario.permisos.includes(moduleKey);
  }
  return isRoleAllowed(usuario.rol, fallbackRoles);
};

export const hasPermission = (usuario, permiso, fallbackRoles = []) => {
  if (!usuario) return false;
  if (Array.isArray(usuario.permisos) && usuario.permisos.length > 0) {
    return usuario.permisos.includes(permiso);
  }
  return isRoleAllowed(usuario.rol, fallbackRoles);
};

export const hasAnyPermission = (usuario, permisos = [], fallbackRoles = []) => {
  if (!usuario) return false;
  if (Array.isArray(usuario.permisos) && usuario.permisos.length > 0) {
    return permisos.some((permiso) => usuario.permisos.includes(permiso));
  }
  return isRoleAllowed(usuario.rol, fallbackRoles);
};
