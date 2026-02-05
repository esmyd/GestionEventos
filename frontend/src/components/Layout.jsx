import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNombrePlataforma } from '../hooks/useNombrePlataforma';
import { useModulos } from '../hooks/useModulos';
import { getRoleLabel, hasModuleAccess, hasRole, MODULES, ROLES } from '../utils/roles';
import { whatsappChatService } from '../services/api';
import {
  Calendar,
  CalendarDays,
  Users,
  Package,
  FolderTree,
  FileText,
  CreditCard,
  Landmark,
  Warehouse,
  Building,
  BarChart3,
  Bell,
  Home,
  UserCircle,
  Settings,
  MessageCircle,
  Gauge,
  Mail,
  Trash2,
  Upload,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Crown,
  Shield,
  Send,
  Truck,
  FileDigit,
  FileSignature,
  Globe,
  Sparkles,
  Calculator,
  Camera,
} from 'lucide-react';

const Layout = () => {
  const { usuario, logout } = useAuth();
  const { nombrePlataforma } = useNombrePlataforma();
  const { moduloExcluidoPorPlan } = useModulos();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [administracionOpen, setAdministracionOpen] = useState(true);
  const [catalogoOpen, setCatalogoOpen] = useState(true);
  const [operacionesOpen, setOperacionesOpen] = useState(true);
  const [configuracionesOpen, setConfiguracionesOpen] = useState(true);
  const [usuariosOpen, setUsuariosOpen] = useState(true);
  const [proximasImplementacionesOpen, setProximasImplementacionesOpen] = useState(false);
  const [whatsappNoLeidos, setWhatsappNoLeidos] = useState(0);
  const iniciales = nombrePlataforma
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');

  // Definir permisos por rol
  const getMenuItemsByRole = (rol, usuarioActual) => {
    const todosLosItems = [
      { path: '/panel', icon: Home, label: 'Panel', moduleKey: null, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/mi-evento', icon: Calendar, label: 'Mi evento', moduleKey: MODULES.PORTAL_CLIENTE, roles: [ROLES.CLIENT] },
      { path: '/perfil', icon: UserCircle, label: 'Mi perfil', moduleKey: MODULES.PERFIL, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/mi-plan', icon: Crown, label: 'Mi Plan', moduleKey: MODULES.MI_PLAN, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/admin/suscripcion', icon: Shield, label: 'Admin Suscripción', moduleKey: MODULES.ADMIN_SUSCRIPCION, roles: [ROLES.ADMIN_SISTEMA] },
      { path: '/reportes', icon: BarChart3, label: 'Reportes', moduleKey: MODULES.REPORTES, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/eventos', icon: Calendar, label: 'Eventos', moduleKey: MODULES.EVENTOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/pagos', icon: CreditCard, label: 'Pagos', moduleKey: MODULES.PAGOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/cuentas', icon: Landmark, label: 'Cuentas', moduleKey: MODULES.CUENTAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/salones', icon: Building, label: 'Salones', moduleKey: MODULES.SALONES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/notificaciones-nativas', icon: Bell, label: 'Notificaciones', moduleKey: MODULES.NOTIFICACIONES_NATIVAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/calendario', icon: CalendarDays, label: 'Calendario', moduleKey: MODULES.CALENDARIO, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/planes', icon: FileText, label: 'Paquetes', moduleKey: MODULES.PLANES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/productos', icon: Package, label: 'Productos', moduleKey: MODULES.PRODUCTOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/categorias', icon: FolderTree, label: 'Categorías', moduleKey: MODULES.CATEGORIAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/inventario', icon: Warehouse, label: 'Inventario', moduleKey: MODULES.INVENTARIO, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/usuarios', icon: Settings, label: 'Usuarios', moduleKey: MODULES.USUARIOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/clientes', icon: Users, label: 'Clientes', moduleKey: MODULES.CLIENTES, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/permisos', icon: Shield, label: 'Roles y Permisos', moduleKey: MODULES.PERMISOS, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN] },
      { path: '/configuraciones/whatsapp-chat', icon: MessageCircle, label: 'WhatsApp', moduleKey: MODULES.WHATSAPP_CHAT, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/configuraciones/whatsapp-panel', icon: Gauge, label: 'Panel WhatsApp', moduleKey: MODULES.WHATSAPP_METRICAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/whatsapp-plantillas', icon: Mail, label: 'Plantillas WhatsApp', moduleKey: MODULES.WHATSAPP_TEMPLATES, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/carga-masiva', icon: Upload, label: 'Carga masiva', moduleKey: MODULES.CARGA_MASIVA, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/limpieza-datos', icon: Settings, label: 'Config. Sistema', moduleKey: MODULES.CONFIG_DATOS, roles: [ROLES.ADMIN_SISTEMA] },
      // Próximas implementaciones (en construcción)
      { path: '/proximas/envio-sugerencia', icon: Send, label: 'Envío de Sugerencia', moduleKey: MODULES.ENVIO_SUGERENCIA, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
      { path: '/proximas/proveedores', icon: Truck, label: 'Proveedores', moduleKey: MODULES.PROVEEDORES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
      { path: '/proximas/facturacion-electronica', icon: FileDigit, label: 'Facturación Electrónica', moduleKey: MODULES.FACTURACION_ELECTRONICA, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
      { path: '/proximas/contratos', icon: FileSignature, label: 'Contratos Digitales', moduleKey: MODULES.CONTRATOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
      { path: '/proximas/reservas-online', icon: Globe, label: 'Reservas Online', moduleKey: MODULES.RESERVAS_ONLINE, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
      { path: '/proximas/crm-avanzado', icon: Users, label: 'CRM Avanzado', moduleKey: MODULES.CRM_AVANZADO, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
      { path: '/proximas/integracion-contabilidad', icon: Calculator, label: 'Integración Contable', moduleKey: MODULES.INTEGRACION_CONTABILIDAD, roles: [ROLES.ADMIN, ROLES.MANAGER], enConstruccion: true },
      { path: '/proximas/sitio-web-eventos', icon: Globe, label: 'Sitio Web de Eventos', moduleKey: MODULES.SITIO_WEB_EVENTOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
      { path: '/proximas/instagram', icon: Camera, label: 'Instagram', moduleKey: MODULES.INSTAGRAM, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR], enConstruccion: true },
    ];

    if (!rol) return [];

    // Filtrar: rol/permisos Y que el plan no excluya el módulo
    return todosLosItems.filter((item) => {
      if (!hasModuleAccess(usuarioActual, item.moduleKey, item.roles)) return false;
      // Módulos en construcción no se excluyen por plan
      if (item.enConstruccion) return true;
      // Si el módulo está en el plan y explícitamente no disponible, ocultar
      if (item.moduleKey && moduloExcluidoPorPlan(item.moduleKey)) return false;
      return true;
    });
  };

  const menuItems = usuario ? getMenuItemsByRole(usuario.rol, usuario) : [];
  const esCliente = hasRole(usuario?.rol, [ROLES.CLIENT]);
  const rutasAdministracionSistema = ['/admin/suscripcion', '/configuraciones/limpieza-datos'];
  const rutasCatalogo = ['/planes', '/productos', '/categorias', '/inventario', '/salones', '/cuentas', '/configuraciones/carga-masiva'];
  const rutasOperaciones = [
    '/calendario',
    '/eventos',
    '/clientes',
    '/pagos',
    '/configuraciones/whatsapp-chat'
  ];
  const rutasConfiguraciones = [
    '/notificaciones-nativas',
    '/configuraciones/whatsapp-panel',
    '/configuraciones/whatsapp-plantillas',
  ];
  const rutasUsuarios = ['/usuarios', '/permisos'];
  const rutasProximasImplementaciones = [
    '/proximas/envio-sugerencia',
    '/proximas/proveedores',
    '/proximas/facturacion-electronica',
    '/proximas/contratos',
    '/proximas/reservas-online',
    '/proximas/crm-avanzado',
    '/proximas/integracion-contabilidad',
    '/proximas/sitio-web-eventos',
    '/proximas/instagram',
  ];

  const menuItemsFiltrados = esCliente
    ? menuItems.filter((item) => ['/panel', '/mi-evento'].includes(item.path))
    : menuItems;

  const administracionSistemaItems = menuItemsFiltrados.filter((item) => rutasAdministracionSistema.includes(item.path));
  const catalogoItems = menuItemsFiltrados.filter((item) => rutasCatalogo.includes(item.path));
  const operacionesItems = menuItemsFiltrados.filter((item) => rutasOperaciones.includes(item.path));
  const configuracionesItems = menuItemsFiltrados.filter((item) => rutasConfiguraciones.includes(item.path));
  const usuariosItems = menuItemsFiltrados.filter((item) => rutasUsuarios.includes(item.path));
  const proximasImplementacionesItems = menuItemsFiltrados.filter((item) => rutasProximasImplementaciones.includes(item.path));
  const rutasInferior = ['/perfil', '/reportes', '/mi-plan'];
  const menuItemsRest = menuItemsFiltrados.filter(
    (item) =>
      !rutasAdministracionSistema.includes(item.path) &&
      !rutasCatalogo.includes(item.path) &&
      !rutasOperaciones.includes(item.path) &&
      !rutasConfiguraciones.includes(item.path) &&
      !rutasUsuarios.includes(item.path) &&
      !rutasProximasImplementaciones.includes(item.path) &&
      !rutasInferior.includes(item.path)
  );
  const menuItemsInferior = menuItemsFiltrados.filter((item) => rutasInferior.includes(item.path));

  // Resaltar módulo activo: coincide exactamente o está en una sub-ruta (ej: /eventos/123)
  const isPathActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const administracionSistemaActivo = administracionSistemaItems.some((item) => isPathActive(item.path));
  const catalogoActivo = catalogoItems.some((item) => isPathActive(item.path));
  const operacionesActivo = operacionesItems.some((item) => isPathActive(item.path));
  const configuracionesActivo = configuracionesItems.some((item) => isPathActive(item.path));
  const usuariosActivo = usuariosItems.some((item) => isPathActive(item.path));
  const proximasImplementacionesActivo = proximasImplementacionesItems.some((item) => isPathActive(item.path));

  useEffect(() => {
    if (administracionSistemaActivo) setAdministracionOpen(true);
  }, [administracionSistemaActivo]);

  useEffect(() => {
    if (catalogoActivo) {
      setCatalogoOpen(true);
    }
  }, [catalogoActivo]);

  useEffect(() => {
    if (operacionesActivo) {
      setOperacionesOpen(true);
    }
  }, [operacionesActivo]);

  useEffect(() => {
    if (configuracionesActivo) {
      setConfiguracionesOpen(true);
    }
  }, [configuracionesActivo]);

  useEffect(() => {
    if (usuariosActivo) {
      setUsuariosOpen(true);
    }
  }, [usuariosActivo]);

  useEffect(() => {
    if (proximasImplementacionesActivo) {
      setProximasImplementacionesOpen(true);
    }
  }, [proximasImplementacionesActivo]);

  useEffect(() => {
    const actualizarVista = () => {
      const esMovil = window.innerWidth < 768;
      setIsMobile(esMovil);
      if (esMovil) {
        setSidebarOpen(false);
      }
    };
    actualizarVista();
    window.addEventListener('resize', actualizarVista);
    return () => window.removeEventListener('resize', actualizarVista);
  }, []);

  // Cargar notificaciones de WhatsApp no leídos
  const cargarNoLeidos = useCallback(async () => {
    if (!usuario || !hasModuleAccess(usuario.rol, MODULES.WHATSAPP_CHAT)) return;
    try {
      const data = await whatsappChatService.getNoLeidos();
      setWhatsappNoLeidos(data.total || 0);
    } catch (err) {
      // Silenciar errores
    }
  }, [usuario]);

  useEffect(() => {
    cargarNoLeidos();
    // Actualizar cada 10 segundos
    const interval = setInterval(cargarNoLeidos, 10000);
    return () => clearInterval(interval);
  }, [cargarNoLeidos]);

  // Cuando cambie la ubicación y estemos en WhatsApp Chat, resetear el badge
  useEffect(() => {
    if (location.pathname === '/configuraciones/whatsapp-chat') {
      // Dar tiempo para que el componente interno marque como leído
      setTimeout(cargarNoLeidos, 500);
    }
  }, [location.pathname, cargarNoLeidos]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 900,
          }}
        />
      )}
      {/* Sidebar */}
      <aside
        style={{
          width: isMobile ? '80vw' : (sidebarOpen ? '260px' : '80px'),
          backgroundColor: '#1f2937',
          color: 'white',
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          boxShadow: isMobile ? '0 10px 25px rgba(0, 0, 0, 0.25)' : 'none',
        }}
      >
        {/* Header del sidebar */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {sidebarOpen && (
            /**QUE ENLACE AL INICIO DEL SISTEMA */
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        
            <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: '#e6c225',
              fontWeight: '800',
              fontSize: '1.1rem',
            }}
          >
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '700',
              }}
            >
              {iniciales || 'LE'}
            </span>
            {nombrePlataforma}
          </Link>
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menú */}
        <nav
          style={{
            flex: 1,
            minHeight: 0,
            padding: '1rem 0',
            overflowY: 'auto',
            paddingBottom: '1.5rem',
          }}
        >
          {menuItems.length === 0 ? (
            <div style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' }}>
              No hay módulos disponibles
            </div>
          ) : (
            <>
              {administracionSistemaItems.length > 0 && (
                <div>
                  <button
                    onClick={() => setAdministracionOpen((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: administracionSistemaActivo ? 'white' : '#d1d5db',
                      cursor: 'pointer',
                      gap: '0.75rem',
                    }}
                  >
                    <Shield size={20} />
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left' }}>Administración del sistema</span>
                        {administracionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {administracionOpen && (
                    <div style={{ paddingLeft: sidebarOpen ? '1.5rem' : '0.5rem' }}>
                      {administracionSistemaItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isPathActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#d1d5db',
                              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? (isActive ? '3px solid #a5b4fc' : '2px solid #374151') : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Icon size={18} />
                            {sidebarOpen && <span>{item.label}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {operacionesItems.length > 0 && (
                <div>
                  <button
                    onClick={() => setOperacionesOpen((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: operacionesActivo ? 'white' : '#d1d5db',
                      cursor: 'pointer',
                      gap: '0.75rem',
                    }}
                  >
                    <Calendar size={20} />
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left' }}>Operaciones</span>
                        {operacionesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {operacionesOpen && (
                    <div style={{ paddingLeft: sidebarOpen ? '1.5rem' : '0.5rem' }}>
                      {operacionesItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isPathActive(item.path);
                        const esWhatsApp = item.path === '/configuraciones/whatsapp-chat';
                        const mostrarBadgeWA = esWhatsApp && whatsappNoLeidos > 0;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#d1d5db',
                              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? (isActive ? '3px solid #a5b4fc' : '2px solid #374151') : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{ position: 'relative', display: 'inline-flex' }}>
                              <Icon size={18} />
                              {mostrarBadgeWA && !sidebarOpen && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    minWidth: '16px',
                                    height: '16px',
                                    borderRadius: '8px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 4px',
                                  }}
                                >
                                  {whatsappNoLeidos > 9 ? '9+' : whatsappNoLeidos}
                                </span>
                              )}
                            </div>
                            {sidebarOpen && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {item.label}
                                {mostrarBadgeWA && (
                                  <span
                                    style={{
                                      minWidth: '18px',
                                      height: '18px',
                                      borderRadius: '9px',
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '0 5px',
                                    }}
                                  >
                                    {whatsappNoLeidos > 99 ? '99+' : whatsappNoLeidos}
                                  </span>
                                )}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {menuItemsRest.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      color: isActive ? 'white' : '#d1d5db',
                      backgroundColor: isActive ? '#4f46e5' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      gap: '0.75rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}

              {catalogoItems.length > 0 && (
                <div>
                  <button
                    onClick={() => setCatalogoOpen((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: catalogoActivo ? 'white' : '#d1d5db',
                      cursor: 'pointer',
                      gap: '0.75rem',
                    }}
                  >
                    <FolderTree size={20} />
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left' }}>Catálogos</span>
                        {catalogoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {catalogoOpen && (
                    <div style={{ paddingLeft: sidebarOpen ? '1.5rem' : '0.5rem' }}>
                      {catalogoItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isPathActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.6rem 1.5rem',
                      color: isActive ? 'white' : '#d1d5db',
                      backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      gap: '0.75rem',
                      borderLeft: sidebarOpen ? (isActive ? '3px solid #a5b4fc' : '2px solid #374151') : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={18} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {usuariosItems.length > 0 && (
                <div>
                  <button
                    onClick={() => setUsuariosOpen((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: usuariosActivo ? 'white' : '#d1d5db',
                      cursor: 'pointer',
                      gap: '0.75rem',
                    }}
                  >
                    <Users size={20} />
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left' }}>Usuarios</span>
                        {usuariosOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {usuariosOpen && (
                    <div style={{ paddingLeft: sidebarOpen ? '1.5rem' : '0.5rem' }}>
                      {usuariosItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isPathActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.6rem 1.5rem',
                      color: isActive ? 'white' : '#d1d5db',
                      backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      gap: '0.75rem',
                      borderLeft: sidebarOpen ? (isActive ? '3px solid #a5b4fc' : '2px solid #374151') : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={18} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {configuracionesItems.length > 0 && (
                <div>
                  <button
                    onClick={() => setConfiguracionesOpen((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: configuracionesActivo ? 'white' : '#d1d5db',
                      cursor: 'pointer',
                      gap: '0.75rem',
                    }}
                  >
                    <Settings size={20} />
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left' }}>Configuraciones</span>
                        {configuracionesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {configuracionesOpen && (
                    <div style={{ paddingLeft: sidebarOpen ? '1.5rem' : '0.5rem' }}>
                      {configuracionesItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isPathActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#d1d5db',
                              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? (isActive ? '3px solid #a5b4fc' : '2px solid #374151') : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Icon size={18} />
                            {sidebarOpen && <span>{item.label}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

      {proximasImplementacionesItems.length > 0 && (
                <div>
                  <button
                    onClick={() => setProximasImplementacionesOpen((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: proximasImplementacionesActivo ? 'white' : '#9ca3af',
                      cursor: 'pointer',
                      gap: '0.75rem',
                    }}
                  >
                    <Sparkles size={20} style={{ opacity: 0.9 }} />
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left', fontSize: '0.9rem' }}>Próximas implementaciones</span>
                        {proximasImplementacionesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {proximasImplementacionesOpen && (
                    <div style={{ paddingLeft: sidebarOpen ? '1.5rem' : '0.5rem' }}>
                      {proximasImplementacionesItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isPathActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#9ca3af',
                              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? (isActive ? '3px solid #a5b4fc' : '2px solid #4b5563') : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Icon size={18} style={{ opacity: 0.85 }} />
                            {sidebarOpen && <span style={{ fontSize: '0.875rem' }}>{item.label}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </>
          )}
        </nav>

        {/* Footer del sidebar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #374151',
          }}
        >
          {sidebarOpen && usuario && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {usuario.nombre_completo || usuario.nombre_usuario}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {getRoleLabel(usuario.rol)}
              </div>
            </div>
          )}
          {menuItemsInferior.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
              {menuItemsInferior.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      color: isActive ? 'white' : '#d1d5db',
                      backgroundColor: isActive ? '#4f46e5' : 'transparent',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={16} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem',
              background: 'none',
              border: '1px solid #ef4444',
              color: '#ef4444',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ef4444';
            }}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main
        style={{
          marginLeft: isMobile ? '0' : (sidebarOpen ? '260px' : '80px'),
          flex: 1,
          transition: 'margin-left 0.3s',
          padding: isMobile ? '1rem' : '2rem',
          paddingTop: isMobile ? '4.5rem' : '2rem',
          backgroundColor: '#f9fafb',
        }}
      >
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '56px',
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1rem',
              zIndex: 800,
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#111827',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <Menu size={22} />
            </button>
            <div style={{ marginLeft: '0.75rem', fontWeight: '600', color: '#111827' }}>
              {menuItems.find((item) => item.path === location.pathname)?.label || nombrePlataforma}
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
