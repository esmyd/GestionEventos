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
  EVENTOS_SOLICITAR_EVALUACION: 'eventos:solicitar_evaluacion',
  EVENTOS_CALIFICAR_MANUAL: 'eventos:calificar_manual',
  EVENTOS_VER_INFORMACION: 'eventos:ver_informacion',
  EVENTOS_VER_OPCIONES_CLIENTE: 'eventos:ver_opciones_cliente',
  EVENTOS_VER_RECORDATORIOS: 'eventos:ver_recordatorios',
  EVENTOS_VER_FINANCIERO: 'eventos:ver_financiero',
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
  SALONES_CREAR: 'salones:crear',
  SALONES_EDITAR: 'salones:editar',
  SALONES_ELIMINAR: 'salones:eliminar',
  CLIENTES_CREAR: 'clientes:crear',
  CLIENTES_EDITAR: 'clientes:editar',
  CLIENTES_ELIMINAR: 'clientes:eliminar',
  PRODUCTOS_CREAR: 'productos:crear',
  PRODUCTOS_EDITAR: 'productos:editar',
  PRODUCTOS_ELIMINAR: 'productos:eliminar',
  CATEGORIAS_CREAR: 'categorias:crear',
  CATEGORIAS_EDITAR: 'categorias:editar',
  CATEGORIAS_ELIMINAR: 'categorias:eliminar',
  USUARIOS_CREAR: 'usuarios:crear',
  USUARIOS_EDITAR: 'usuarios:editar',
  USUARIOS_ELIMINAR: 'usuarios:eliminar',
  USUARIOS_CAMBIAR_CONTRASENA: 'usuarios:cambiar_contrasena',
  REPORTES_EXPORTAR: 'reportes:exportar',
  WHATSAPP_CHAT_ENVIAR_MENSAJE: 'whatsapp_chat:enviar_mensaje',
  WHATSAPP_CHAT_MODO_HUMANO: 'whatsapp_chat:modo_humano',
  WHATSAPP_CHAT_REINICIAR: 'whatsapp_chat:reiniciar',
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

/**
 * Acceso a módulo (menú/página): si el usuario tiene permisos desde BD, se usa esa lista;
 * si no tiene permisos definidos, se usa el fallback por rol.
 */
export const hasModuleAccess = (usuario, moduleKey, fallbackRoles = []) => {
  if (!usuario) return false;
  if (Array.isArray(usuario.permisos) && usuario.permisos.length > 0) {
    return usuario.permisos.includes(moduleKey);
  }
  return isRoleAllowed(usuario.rol, fallbackRoles);
};

/**
 * Permiso para una acción (crear, editar, eliminar, etc.): si el usuario tiene permisos desde BD,
 * se usa esa lista; si no, se usa el fallback por rol.
 */
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
