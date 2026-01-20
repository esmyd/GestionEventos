/**
 * Verifica si el servidor API está disponible
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return { available: true, data };
    }
    return { available: false, error: 'Servidor respondió con error' };
  } catch (error) {
    return { 
      available: false, 
      error: error.message || 'No se puede conectar con el servidor',
      details: error
    };
  }
};
