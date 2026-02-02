import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Landmark,
  Warehouse,
  Building,
  BarChart3,
  Bell,
  UserCircle,
  Settings,
  MessageCircle,
  Gauge,
  Mail,
  Trash2,
  Upload,
  Home,
  Calculator,
} from 'lucide-react';

/**
 * Página común para todos los usuarios autenticados.
 * Muestra botones de los módulos que tienen activos.
 */
const PanelComun = () => {
  const { usuario } = useAuth();
  const { nombrePlataforma } = useNombrePlataforma();
  const location = useLocation();

  const getMenuItemsByRole = () => {
    // Orden por flujo: Operaciones → Catálogos → Comunicación → Usuarios → Configuración
    const todosLosItems = [
      // Operaciones
      { path: '/calendario', icon: CalendarDays, label: 'Calendario', moduleKey: MODULES.CALENDARIO, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/eventos', icon: Calendar, label: 'Eventos', moduleKey: MODULES.EVENTOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/clientes', icon: Users, label: 'Clientes', moduleKey: MODULES.CLIENTES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/pagos', icon: CreditCard, label: 'Pagos', moduleKey: MODULES.PAGOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      // Catálogos
      { path: '/planes', icon: FileText, label: 'Paquetes', moduleKey: MODULES.PLANES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/productos', icon: Package, label: 'Productos', moduleKey: MODULES.PRODUCTOS, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/categorias', icon: FolderTree, label: 'Categorías', moduleKey: MODULES.CATEGORIAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/inventario', icon: Warehouse, label: 'Inventario', moduleKey: MODULES.INVENTARIO, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/salones', icon: Building, label: 'Salones', moduleKey: MODULES.SALONES, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
      { path: '/cuentas', icon: Landmark, label: 'Cuentas', moduleKey: MODULES.CUENTAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      // Comunicación
      { path: '/notificaciones-nativas', icon: Bell, label: 'Notificaciones', moduleKey: MODULES.NOTIFICACIONES_NATIVAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/whatsapp-chat', icon: MessageCircle, label: 'WhatsApp', moduleKey: MODULES.WHATSAPP_CHAT, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/whatsapp-panel', icon: Gauge, label: 'Panel WhatsApp', moduleKey: MODULES.WHATSAPP_METRICAS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/whatsapp-plantillas', icon: Mail, label: 'Plantillas WhatsApp', moduleKey: MODULES.WHATSAPP_TEMPLATES, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      // Usuarios y administración
      { path: '/usuarios', icon: Settings, label: 'Usuarios', moduleKey: MODULES.USUARIOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/permisos', icon: Settings, label: 'Roles y Permisos', moduleKey: MODULES.PERMISOS, roles: [ROLES.ADMIN] },
      // Herramientas y otros
      { path: '/configuraciones/carga-masiva', icon: Upload, label: 'Carga masiva', moduleKey: MODULES.CARGA_MASIVA, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/configuraciones/limpieza-datos', icon: Settings, label: 'Config. Sistema', moduleKey: MODULES.CONFIG_DATOS, roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { path: '/mi-evento', icon: Calendar, label: 'Mi evento', moduleKey: MODULES.PORTAL_CLIENTE, roles: [ROLES.CLIENT] },
      { path: '/perfil', icon: UserCircle, label: 'Mi perfil', moduleKey: MODULES.PERFIL, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT] },
      { path: '/reportes', icon: BarChart3, label: 'Reportes', moduleKey: MODULES.REPORTES, roles: [ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR] },
    ];

    if (!usuario) return [];
    return todosLosItems.filter((item) => hasModuleAccess(usuario, item.moduleKey, item.roles));
  };

  const menuItems = getMenuItemsByRole();
  const isPathActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem' }}>
          Bienvenido, {usuario?.nombre_completo || usuario?.nombre_usuario || 'Usuario'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
          Selecciona un módulo para comenzar
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            color: 'white',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            minHeight: '120px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.4)';
          }}
        >
          <Calculator size={32} style={{ marginBottom: '0.5rem' }} />
          <span style={{ fontWeight: '600', fontSize: '1rem' }}>Cotizador</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>Página principal</span>
        </Link>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const activo = isPathActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                backgroundColor: activo ? '#6366f1' : 'white',
                color: activo ? 'white' : '#374151',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                border: `1px solid ${activo ? '#6366f1' : '#e5e7eb'}`,
                boxShadow: activo ? '0 4px 14px rgba(99, 102, 241, 0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
                minHeight: '120px',
              }}
              onMouseEnter={(e) => {
                if (!activo) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!activo) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                }
              }}
            >
              <Icon size={32} style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontWeight: '600', fontSize: '1rem', textAlign: 'center' }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PanelComun;
