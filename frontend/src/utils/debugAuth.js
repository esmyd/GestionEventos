/**
 * Utilidades de debug para autenticación
 */
export const debugAuth = {
  checkToken: () => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    console.log('=== Debug de Autenticación ===');
    console.log('Token presente:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Usuario presente:', !!usuario);
    
    if (token) {
      try {
        // Intentar decodificar el token (sin verificar firma)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Token expira:', new Date(payload.exp * 1000));
          console.log('Token válido:', new Date() < new Date(payload.exp * 1000));
        }
      } catch (e) {
        console.error('Error al decodificar token:', e);
      }
    }
    
    if (usuario) {
      try {
        const usuarioData = JSON.parse(usuario);
        console.log('Usuario data:', usuarioData);
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
    
    console.log('==============================');
  },
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    console.log('Autenticación limpiada');
  }
};

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}
