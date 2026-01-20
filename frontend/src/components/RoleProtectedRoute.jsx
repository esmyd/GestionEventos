import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasModuleAccess, isRoleAllowed } from '../utils/roles';

/**
 * Componente para proteger rutas según roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene permisos
 * @param {string[]} props.allowedRoles - Roles permitidos para acceder a la ruta
 */
const RoleProtectedRoute = ({ children, allowedRoles = [], moduleKey = null }) => {
  const { usuario, loading } = useAuth();

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

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (moduleKey) {
    const tieneAcceso = hasModuleAccess(usuario, moduleKey, allowedRoles);
    if (!tieneAcceso) {
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

  return children;
};

export default RoleProtectedRoute;
