import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { debugAuth } from '../utils/debugAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la app
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (token && usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);
        setIsAuthenticated(true);
        // Verificar si el token sigue siendo válido
        verificarToken();
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  const verificarToken = async () => {
    try {
      const data = await authService.verificar();
      if (data.authenticated) {
        setUsuario(data.usuario);
        setIsAuthenticated(true);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      logout();
    }
  };

  const login = async (nombreUsuario, contrasena) => {
    try {
      const data = await authService.login(nombreUsuario, contrasena);
      
      // Verificar si la respuesta tiene el formato esperado
      if (data && data.success && data.token) {
        // Guardar token y usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        // Verificar que se guardó correctamente
        const tokenGuardado = localStorage.getItem('token');
        if (!tokenGuardado || tokenGuardado !== data.token) {
          console.error('Error: Token no se guardó correctamente');
          return { success: false, error: 'Error al guardar la sesión' };
        }
        
        setUsuario(data.usuario);
        setIsAuthenticated(true);
        
        // Debug: verificar que todo se guardó correctamente
        if (process.env.NODE_ENV === 'development') {
          debugAuth.checkToken();
        }
        
        return { success: true };
      } else if (data && data.error) {
        // El servidor devolvió un error
        return { success: false, error: data.error };
      } else {
        // Respuesta inesperada
        return { success: false, error: 'Error al iniciar sesión. Respuesta inesperada del servidor.' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      // Detectar diferentes tipos de errores
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          success: false,
          error: 'El servidor no responde. Verifica que el servidor API esté corriendo en http://localhost:5000',
        };
      }
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'No se puede conectar con el servidor. Asegúrate de que el servidor API esté corriendo en http://localhost:5000',
        };
      }
      
      if (error.response) {
        // El servidor respondió con un código de error
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message || 
                            `Error del servidor: ${error.response.status}`;
        return {
          success: false,
          error: errorMessage,
        };
      }
      
      return {
        success: false,
        error: error.message || 'Error al conectar con el servidor. Verifica que el servidor API esté corriendo.',
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
    setIsAuthenticated(false);
  };

  const value = {
    usuario,
    isAuthenticated,
    loading,
    login,
    logout,
    verificarToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
