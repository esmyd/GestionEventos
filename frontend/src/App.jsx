import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModulosProvider } from './hooks/useModulos';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Layout from './components/Layout';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { MODULES, ROLES } from './utils/roles';
import Eventos from './pages/Eventos';
import EventoDetalle from './pages/EventoDetalle';
import EventoNuevo from './pages/EventoNuevo';
import Calendario from './pages/Calendario';
import ClientePortal from './pages/ClientePortal';
import Perfil from './pages/Perfil';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Planes from './pages/Planes';
import Pagos from './pages/Pagos';
import PagosEvento from './pages/PagosEvento';
import Cuentas from './pages/Cuentas';
import Inventario from './pages/Inventario';
import Salones from './pages/Salones';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Permisos from './pages/Permisos';
import NotificacionesNativas from './pages/NotificacionesNativas';
import NotificacionNativaEditar from './pages/NotificacionNativaEditar';
import IntegracionesWhatsApp from './pages/IntegracionesWhatsApp';
import WhatsAppChat from './pages/WhatsAppChat';
import WhatsAppMetricas from './pages/WhatsAppMetricas';
import ConfiguracionesDatos from './pages/ConfiguracionesDatos';
import WhatsAppPlantillas from './pages/WhatsAppPlantillas';
import CargaMasiva from './pages/CargaMasiva';
import PanelComun from './pages/PanelComun';
import MiPlan from './pages/MiPlan';
import AdminSuscripcion from './pages/AdminSuscripcion';
import EnConstruccion from './pages/EnConstruccion';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Cargando...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para redirigir si ya está autenticado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Cargando...</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/panel" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirigir dashboard e inicio al panel común */}
        <Route path="dashboard" element={<Navigate to="/panel" replace />} />
        <Route path="inicio" element={<Navigate to="/panel" replace />} />

        {/* Panel común - Todos los roles autenticados (incl. administrador del sistema) */}
        <Route
          path="panel"
          element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT]}>
              <PanelComun />
            </RoleProtectedRoute>
          }
        />

        {/* Calendario - Todos los roles autenticados */}
        <Route
          path="calendario"
          element={
            <RoleProtectedRoute moduleKey={MODULES.CALENDARIO} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Calendario />
            </RoleProtectedRoute>
          }
        />

        {/* Portal Cliente */}
        <Route
          path="mi-evento"
          element={
            <RoleProtectedRoute moduleKey={MODULES.PORTAL_CLIENTE} allowedRoles={[ROLES.CLIENT]}>
              <ClientePortal />
            </RoleProtectedRoute>
          }
        />

        {/* Perfil - Todos los roles */}
        <Route
          path="perfil"
          element={
            <RoleProtectedRoute moduleKey={MODULES.PERFIL} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT]}>
              <Perfil />
            </RoleProtectedRoute>
          }
        />

        {/* Eventos - Todos los roles autenticados */}
        <Route
          path="eventos"
          element={
            <RoleProtectedRoute moduleKey={MODULES.EVENTOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Eventos />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="eventos/nuevo"
          element={
<RoleProtectedRoute moduleKey={MODULES.EVENTOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <EventoNuevo />
            </RoleProtectedRoute>
          }
          />
          <Route
          path="eventos/editar/:id"
          element={
            <RoleProtectedRoute moduleKey={MODULES.EVENTOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <EventoNuevo />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="eventos/:id"
          element={
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT]}>
              <EventoDetalle />
            </RoleProtectedRoute>
          }
        />

        {/* Clientes - Solo admin, gerente y coordinador */}
        <Route
          path="clientes"
          element={
            <RoleProtectedRoute moduleKey={MODULES.CLIENTES} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Clientes />
            </RoleProtectedRoute>
          }
        />

        {/* Productos - Solo admin, gerente y coordinador */}
        <Route
          path="productos"
          element={
            <RoleProtectedRoute moduleKey={MODULES.PRODUCTOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Productos />
            </RoleProtectedRoute>
          }
        />

        {/* Categorías - Solo admin, gerente y coordinador */}
        <Route
          path="categorias"
          element={
            <RoleProtectedRoute moduleKey={MODULES.CATEGORIAS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Categorias />
            </RoleProtectedRoute>
          }
        />

        {/* Paquetes - Solo admin, gerente y coordinador */}
        <Route
          path="planes"
          element={
            <RoleProtectedRoute moduleKey={MODULES.PLANES} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Planes />
            </RoleProtectedRoute>
          }
        />

        {/* Pagos - Solo admin, gerente y coordinador */}
        <Route
          path="pagos"
          element={
            <RoleProtectedRoute moduleKey={MODULES.PAGOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Pagos />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="pagos/evento/:id"
          element={
            <RoleProtectedRoute moduleKey={MODULES.PAGOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <PagosEvento />
            </RoleProtectedRoute>
          }
        />

        {/* Cuentas - Solo admin y gerente */}
        <Route
          path="cuentas"
          element={
            <RoleProtectedRoute moduleKey={MODULES.CUENTAS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <Cuentas />
            </RoleProtectedRoute>
          }
        />

        {/* Inventario - Solo admin, gerente y coordinador */}
        <Route
          path="inventario"
          element={
            <RoleProtectedRoute moduleKey={MODULES.INVENTARIO} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Inventario />
            </RoleProtectedRoute>
          }
        />

        {/* Salones - Solo admin, gerente y coordinador */}
        <Route
          path="salones"
          element={
            <RoleProtectedRoute moduleKey={MODULES.SALONES} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Salones />
            </RoleProtectedRoute>
          }
        />

        {/* Reportes - Admin sistema, admin, gerente y coordinador */}
        <Route
          path="reportes"
          element={
            <RoleProtectedRoute moduleKey={MODULES.REPORTES} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <Reportes />
            </RoleProtectedRoute>
          }
        />

        {/* Notificaciones nativas */}
        <Route
          path="notificaciones-nativas"
          element={
            <RoleProtectedRoute moduleKey={MODULES.NOTIFICACIONES_NATIVAS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <NotificacionesNativas />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="notificaciones-nativas/:tipo"
          element={
            <RoleProtectedRoute moduleKey={MODULES.NOTIFICACIONES_NATIVAS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <NotificacionNativaEditar />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="configuraciones/integraciones-whatsapp"
          element={
            <RoleProtectedRoute moduleKey={MODULES.INTEGRACIONES} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <IntegracionesWhatsApp />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="configuraciones/whatsapp-chat"
          element={
            <RoleProtectedRoute moduleKey={MODULES.WHATSAPP_CHAT} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}>
              <WhatsAppChat />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="configuraciones/whatsapp-panel"
          element={
            <RoleProtectedRoute moduleKey={MODULES.WHATSAPP_METRICAS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <WhatsAppMetricas />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="configuraciones/whatsapp-plantillas"
          element={
            <RoleProtectedRoute moduleKey={MODULES.WHATSAPP_TEMPLATES} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <WhatsAppPlantillas />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="configuraciones/carga-masiva"
          element={
            <RoleProtectedRoute moduleKey={MODULES.CARGA_MASIVA} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <CargaMasiva />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="configuraciones/limpieza-datos"
          element={
            <RoleProtectedRoute moduleKey={MODULES.CONFIG_DATOS} allowedRoles={[ROLES.ADMIN_SISTEMA]}>
              <ConfiguracionesDatos />
            </RoleProtectedRoute>
          }
        />


        {/* Usuarios - Solo admin y gerente */}
        <Route
          path="usuarios"
          element={
            <RoleProtectedRoute moduleKey={MODULES.USUARIOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER]}>
              <Usuarios />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="permisos"
          element={
            <RoleProtectedRoute moduleKey={MODULES.PERMISOS} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN]}>
              <Permisos />
            </RoleProtectedRoute>
          }
        />

        {/* Mi Plan - Ver plan, beneficios y uso (módulo controlado por plan) */}
        <Route
          path="mi-plan"
          element={
            <RoleProtectedRoute moduleKey={MODULES.MI_PLAN} allowedRoles={[ROLES.ADMIN_SISTEMA, ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR, ROLES.CLIENT]}>
              <MiPlan />
            </RoleProtectedRoute>
          }
        />

        {/* Admin Suscripción - Solo administrador del sistema (creador/vendedor del software) */}
        <Route
          path="admin/suscripcion"
          element={
            <RoleProtectedRoute moduleKey={MODULES.ADMIN_SUSCRIPCION} allowedRoles={[ROLES.ADMIN_SISTEMA]}>
              <AdminSuscripcion />
            </RoleProtectedRoute>
          }
        />

        {/* Próximas implementaciones - Placeholders con mensaje en construcción */}
        <Route path="proximas/envio-sugerencia" element={<RoleProtectedRoute moduleKey={MODULES.ENVIO_SUGERENCIA} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/proveedores" element={<RoleProtectedRoute moduleKey={MODULES.PROVEEDORES} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/facturacion-electronica" element={<RoleProtectedRoute moduleKey={MODULES.FACTURACION_ELECTRONICA} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/contratos" element={<RoleProtectedRoute moduleKey={MODULES.CONTRATOS} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/reservas-online" element={<RoleProtectedRoute moduleKey={MODULES.RESERVAS_ONLINE} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/crm-avanzado" element={<RoleProtectedRoute moduleKey={MODULES.CRM_AVANZADO} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/integracion-contabilidad" element={<RoleProtectedRoute moduleKey={MODULES.INTEGRACION_CONTABILIDAD} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/sitio-web-eventos" element={<RoleProtectedRoute moduleKey={MODULES.SITIO_WEB_EVENTOS} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
        <Route path="proximas/instagram" element={<RoleProtectedRoute moduleKey={MODULES.INSTAGRAM} allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]}><EnConstruccion /></RoleProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModulosProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ModulosProvider>
    </AuthProvider>
  );
}

export default App;
