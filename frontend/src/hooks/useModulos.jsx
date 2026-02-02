import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import api from '../services/api';

// Context para compartir datos de módulos en toda la app
const ModulosContext = createContext(null);

// Provider del context
export function ModulosProvider({ children }) {
  const [modulos, setModulos] = useState([]);
  const [rutasPermitidas, setRutasPermitidas] = useState([]);
  const [planActual, setPlanActual] = useState(null);
  const [estadoSuscripcion, setEstadoSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de módulos
  const cargarModulos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const [modulosRes, rutasRes, planRes] = await Promise.all([
        api.get('/suscripcion/modulos'),
        api.get('/suscripcion/rutas-permitidas'),
        api.get('/suscripcion/mi-plan')
      ]);

      setModulos(modulosRes.data.modulos || []);
      setRutasPermitidas(rutasRes.data.rutas || []);
      setPlanActual(planRes.data.plan);
      setEstadoSuscripcion(planRes.data.estado_suscripcion);
      setError(null);
    } catch (err) {
      console.error('Error al cargar módulos:', err);
      // No establecer error si es 401 (no autenticado)
      if (err.response?.status !== 401) {
        setError('Error al cargar configuración de módulos');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar y cuando cambie la autenticación
  useEffect(() => {
    cargarModulos();
  }, [cargarModulos]);

  // Verificar si un módulo está disponible
  const moduloDisponible = useCallback((codigoModulo) => {
    const modulo = modulos.find(m => m.codigo === codigoModulo);
    return modulo?.disponible ?? false;
  }, [modulos]);

  // True solo si el módulo existe en el plan Y no está disponible (ocultar en menú)
  const moduloExcluidoPorPlan = useCallback((codigoModulo) => {
    const modulo = modulos.find(m => m.codigo === codigoModulo);
    return modulo != null && modulo.disponible === false;
  }, [modulos]);

  // Verificar si una ruta está permitida
  const rutaPermitida = useCallback((ruta) => {
    // Rutas siempre permitidas
    const rutasBase = ['/', '/login', '/perfil', '/mi-plan', '/dashboard'];
    if (rutasBase.includes(ruta)) return true;
    
    // Verificar contra rutas permitidas por el plan
    return rutasPermitidas.some(r => ruta.startsWith(r));
  }, [rutasPermitidas]);

  // Obtener módulos por categoría
  const obtenerModulosPorCategoria = useCallback((categoria) => {
    return modulos.filter(m => m.categoria === categoria);
  }, [modulos]);

  // Obtener solo módulos disponibles
  const obtenerModulosDisponibles = useCallback(() => {
    return modulos.filter(m => m.disponible);
  }, [modulos]);

  // Refrescar datos (útil después de cambios de admin)
  const refrescar = useCallback(() => {
    setLoading(true);
    return cargarModulos();
  }, [cargarModulos]);

  const value = {
    modulos,
    rutasPermitidas,
    planActual,
    estadoSuscripcion,
    loading,
    error,
    moduloDisponible,
    moduloExcluidoPorPlan,
    rutaPermitida,
    obtenerModulosPorCategoria,
    obtenerModulosDisponibles,
    refrescar
  };

  return (
    <ModulosContext.Provider value={value}>
      {children}
    </ModulosContext.Provider>
  );
}

// Hook para usar el context
export function useModulos() {
  const context = useContext(ModulosContext);
  if (!context) {
    throw new Error('useModulos debe usarse dentro de ModulosProvider');
  }
  return context;
}

// Hook simplificado para verificar un módulo específico
export function useModuloDisponible(codigoModulo) {
  const { moduloDisponible, loading } = useModulos();
  return {
    disponible: moduloDisponible(codigoModulo),
    loading
  };
}

// Componente para renderizado condicional basado en módulo
export function ConModulo({ codigo, children, fallback = null }) {
  const { moduloDisponible, loading } = useModulos();
  
  if (loading) return null;
  if (!moduloDisponible(codigo)) return fallback;
  
  return children;
}

// Componente para mostrar mensaje cuando módulo no está disponible
export function ModuloNoDisponible({ codigo, nombreModulo }) {
  const { planActual } = useModulos();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Módulo no disponible
      </h2>
      <p className="text-gray-600 text-center max-w-md mb-4">
        El módulo <strong>{nombreModulo || codigo}</strong> no está incluido en tu plan{' '}
        <strong>{planActual?.plan_nombre || 'actual'}</strong>.
      </p>
      <div className="flex gap-3">
        <a 
          href="/mi-plan" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver mi plan
        </a>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default useModulos;
