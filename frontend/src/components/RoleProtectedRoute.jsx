import React from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModulos } from '../hooks/useModulos';
import { hasModuleAccess, isRoleAllowed, ROLES } from '../utils/roles';

/**
 * Redirige "Volver" según el rol: cliente -> /mi-evento, resto -> /panel
 */
const getRutaVolver = (rol) => {
  if (rol === ROLES.CLIENT) return '/mi-evento';
  return '/panel';
};

/**
 * Componente para proteger rutas según roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene permisos
 * @param {string[]} props.allowedRoles - Roles permitidos para acceder a la ruta
 */
const RoleProtectedRoute = ({ children, allowedRoles = [], moduleKey = null }) => {
  const { usuario, loading } = useAuth();
  const { moduloExcluidoPorPlan, loading: modulosLoading } = useModulos();
  const navigate = useNavigate();

  if (loading || modulosLoading) {
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

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (moduleKey) {
    const tieneAccesoRol = hasModuleAccess(usuario, moduleKey, allowedRoles);
    const excluidoPorPlan = moduloExcluidoPorPlan(moduleKey);
    if (!tieneAccesoRol) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
            Acceso Denegado
          </h2>
          <p style={{ color: '#6b7280' }}>
            No tienes permisos para acceder a esta sección.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Volver
          </button>
        </div>
      );
    }
    if (excluidoPorPlan) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: '1rem',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            Módulo no incluido en tu plan
          </h2>
          <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
            Esta funcionalidad no está incluida en tu plan actual. Revisa los beneficios disponibles o contacta a soporte para cambiar de plan.
          </p>
          <Link
            to="/mi-plan"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6366f1',
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Ver mi plan
          </Link>
        </div>
      );
    }
  } else if (allowedRoles.length > 0 && !isRoleAllowed(usuario?.rol, allowedRoles)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '1rem',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: '#6b7280' }}>
          No tienes permisos para acceder a esta sección.
        </p>
        <button
          onClick={() => navigate(getRutaVolver(usuario?.rol))}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;
