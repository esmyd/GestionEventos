import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNombrePlataforma } from '../hooks/useNombrePlataforma';
import { getRoleLabel, hasModuleAccess, hasRole, MODULES, ROLES } from '../utils/roles';
import {
  Calendar,
  CalendarDays,
  Users,
  Package,
  FolderTree,
  FileText,
  CreditCard,
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
} from 'lucide-react';

const Layout = () => {
  const { usuario, logout } = useAuth();
  const { nombrePlataforma } = useNombrePlataforma();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [catalogoOpen, setCatalogoOpen] = useState(true);
  const [operacionesOpen, setOperacionesOpen] = useState(true);
  const [configuracionesOpen, setConfiguracionesOpen] = useState(true);
  const [usuariosOpen, setUsuariosOpen] = useState(true);
  const iniciales = nombrePlataforma
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');

  // Definir permisos por rol
  const getMenuItemsByRole = (rol, usuarioActual) => {
    const todosLosItems = [
      { path: '/inicio', icon: Home, label: 'Inicio', moduleKey: null, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/mi-evento', icon: Calendar, label: 'Mi evento', moduleKey: MODULES.PORTAL_CLIENTE, roles: [ROLES.CLIENT] },
      { path: '/perfil', icon: UserCircle, label: 'Mi perfil', moduleKey: MODULES.PERFIL, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/reportes', icon: BarChart3, label: 'Reportes', moduleKey: MODULES.REPORTES, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/eventos', icon: Calendar, label: 'Eventos', moduleKey: MODULES.EVENTOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/pagos', icon: CreditCard, label: 'Pagos', moduleKey: MODULES.PAGOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/salones', icon: Building, label: 'Salones', moduleKey: MODULES.SALONES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/notificaciones-nativas', icon: Bell, label: 'Notificaciones', moduleKey: MODULES.NOTIFICACIONES_NATIVAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/calendario', icon: CalendarDays, label: 'Calendario', moduleKey: MODULES.CALENDARIO, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/planes', icon: FileText, label: 'Planes', moduleKey: MODULES.PLANES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/productos', icon: Package, label: 'Productos', moduleKey: MODULES.PRODUCTOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/categorias', icon: FolderTree, label: 'Categorías', moduleKey: MODULES.CATEGORIAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/inventario', icon: Warehouse, label: 'Inventario', moduleKey: MODULES.INVENTARIO, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/usuarios', icon: Settings, label: 'Usuarios', moduleKey: MODULES.USUARIOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/clientes', icon: Users, label: 'Clientes', moduleKey: MODULES.CLIENTES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/permisos', icon: Settings, label: 'Roles y Permisos', moduleKey: MODULES.PERMISOS, roles: [ROLES.ADMIN] },
      { path: '/configuraciones/whatsapp-chat', icon: MessageCircle, label: 'WhatsApp Chat', moduleKey: MODULES.WHATSAPP_CHAT, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/whatsapp-panel', icon: Gauge, label: 'Panel WhatsApp', moduleKey: MODULES.WHATSAPP_METRICAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/whatsapp-plantillas', icon: Mail, label: 'Plantillas WhatsApp', moduleKey: MODULES.WHATSAPP_TEMPLATES, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/carga-masiva', icon: Upload, label: 'Carga masiva', moduleKey: MODULES.CARGA_MASIVA, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/limpieza-datos', icon: Settings, label: 'Config. Sistema', moduleKey: MODULES.CONFIG_DATOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
    ];

    if (!rol) return [];

    // Filtrar items según el rol del usuario
    return todosLosItems.filter((item) => hasModuleAccess(usuarioActual, item.moduleKey, item.roles));
  };

  const menuItems = usuario ? getMenuItemsByRole(usuario.rol, usuario) : [];
  const esCliente = hasRole(usuario?.rol, [ROLES.CLIENT]);
  const rutasCatalogo = ['/planes', '/productos', '/categorias', '/inventario','/configuraciones/carga-masiva'];
  const rutasOperaciones = [
    '/calendario',
    '/eventos',
    '/pagos',
    '/salones',
    '/configuraciones/whatsapp-chat',
    '/configuraciones/whatsapp-plantillas',
  ];
  const rutasConfiguraciones = [
    '/notificaciones-nativas',
    '/configuraciones/whatsapp-panel',
    
    '/configuraciones/limpieza-datos',
  ];
  const rutasUsuarios = ['/usuarios', '/clientes', '/permisos'];

  const menuItemsFiltrados = esCliente
    ? menuItems.filter((item) => ['/inicio', '/mi-evento'].includes(item.path))
    : menuItems;

  const catalogoItems = menuItemsFiltrados.filter((item) => rutasCatalogo.includes(item.path));
  const operacionesItems = menuItemsFiltrados.filter((item) => rutasOperaciones.includes(item.path));
  const configuracionesItems = menuItemsFiltrados.filter((item) => rutasConfiguraciones.includes(item.path));
  const usuariosItems = menuItemsFiltrados.filter((item) => rutasUsuarios.includes(item.path));
  const rutasInferior = ['/perfil', '/reportes'];
  const menuItemsRest = menuItemsFiltrados.filter(
    (item) =>
      !rutasCatalogo.includes(item.path) &&
      !rutasOperaciones.includes(item.path) &&
      !rutasConfiguraciones.includes(item.path) &&
      !rutasUsuarios.includes(item.path) &&
      !rutasInferior.includes(item.path)
  );
  const menuItemsInferior = menuItemsFiltrados.filter((item) => rutasInferior.includes(item.path));

  const catalogoActivo = catalogoItems.some((item) => location.pathname === item.path);
  const operacionesActivo = operacionesItems.some((item) => location.pathname === item.path);
  const configuracionesActivo = configuracionesItems.some((item) => location.pathname.startsWith(item.path));
  const usuariosActivo = usuariosItems.some((item) => location.pathname === item.path);

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
                        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#d1d5db',
                              backgroundColor: isActive ? '#4f46e5' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? '2px solid #374151' : 'none',
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

              {menuItemsRest.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
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
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#d1d5db',
                              backgroundColor: isActive ? '#4f46e5' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? '2px solid #374151' : 'none',
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
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#d1d5db',
                              backgroundColor: isActive ? '#4f46e5' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? '2px solid #374151' : 'none',
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
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.6rem 1.5rem',
                              color: isActive ? 'white' : '#d1d5db',
                              backgroundColor: isActive ? '#4f46e5' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                              borderLeft: sidebarOpen ? '2px solid #374151' : 'none',
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
                const isActive = location.pathname === item.path;
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
