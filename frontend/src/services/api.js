import axios from 'axios';

// Usar URL relativa para aprovechar el proxy de Vite en desarrollo
// En producción, cambiar a la URL completa del servidor
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Asegurar que el header se establezca correctamente
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: verificar que el token se está agregando
      if (import.meta.env.DEV) {
        console.log('Token agregado a petición:', config.url, 'Token length:', token.length);
      }
    } else {
      // Debug: avisar si no hay token
      if (import.meta.env.DEV) {
        console.warn('No hay token disponible para:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir al login si no estamos ya en la página de login
    // Y no es una petición de login o verificar
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/verificar');
    const isLoginPage = window.location.pathname.includes('/login');
    
    if (error.response?.status === 401 && !isLoginPage && !isAuthEndpoint) {
      // Marcar el error para que los componentes puedan manejarlo
      error.isAuthError = true;
      
      // Cerrar sesión automáticamente en token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (nombreUsuario, contrasena) => {
    const response = await api.post('/auth/login', {
      nombre_usuario: nombreUsuario,
      contrasena: contrasena,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  },

  verificar: async () => {
    const response = await api.get('/auth/verificar');
    return response.data;
  },
};

// Servicios de usuarios
export const usuariosService = {
  getAll: async (params = null) => {
    const normalizedParams =
      typeof params === 'string' ? { rol: params } : (params || {});
    const response = await api.get('/usuarios', { params: normalizedParams });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (usuarioData) => {
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
  },

  update: async (id, usuarioData) => {
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  cambiarContrasena: async (id, nuevaContrasena) => {
    const response = await api.post(`/usuarios/${id}/cambiar-contrasena`, {
      nueva_contrasena: nuevaContrasena,
    });
    return response.data;
  },

  getPermisos: async (id) => {
    const response = await api.get(`/usuarios/${id}/permisos`);
    return response.data;
  },

  updatePermisos: async (id, permisos) => {
    const response = await api.put(`/usuarios/${id}/permisos`, { permisos });
    return response.data;
  },

  deletePermisos: async (id) => {
    const response = await api.delete(`/usuarios/${id}/permisos`);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get('/usuarios/roles');
    return response.data;
  },

  getPermisosRol: async (rol) => {
    const response = await api.get(`/usuarios/roles/${rol}/permisos`);
    return response.data;
  },

  updatePermisosRol: async (rol, permisos) => {
    const response = await api.put(`/usuarios/roles/${rol}/permisos`, { permisos });
    return response.data;
  },

  deletePermisosRol: async (rol) => {
    const response = await api.delete(`/usuarios/roles/${rol}/permisos`);
    return response.data;
  },
};

// Servicios de clientes
export const clientesService = {
  getAll: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/clientes/me');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  create: async (clienteData) => {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  update: async (id, clienteData) => {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
};

// Servicios de productos
// Servicios de tipos de eventos
export const tiposEventoService = {
  getAll: async (soloActivos = true) => {
    const params = { solo_activos: soloActivos };
    const response = await api.get('/tipos_evento', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tipos_evento/${id}`);
    return response.data;
  },
};

export const productosService = {
  getAll: async (soloActivos = true, categoriaId = null) => {
    const params = { solo_activos: soloActivos };
    if (categoriaId) params.categoria_id = categoriaId;
    const response = await api.get('/productos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

  create: async (productoData) => {
    const response = await api.post('/productos', productoData);
    return response.data;
  },

  update: async (id, productoData) => {
    const response = await api.put(`/productos/${id}`, productoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  },

  updateStock: async (id, cantidad) => {
    const response = await api.put(`/productos/${id}/stock`, { cantidad });
    return response.data;
  },
};

// Servicios de categorías
export const categoriasService = {
  getAll: async (soloActivas = true) => {
    const params = { solo_activas: soloActivas };
    const response = await api.get('/categorias', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  create: async (categoriaData) => {
    const response = await api.post('/categorias', categoriaData);
    return response.data;
  },

  update: async (id, categoriaData) => {
    const response = await api.put(`/categorias/${id}`, categoriaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  },
};

// Servicios de eventos
export const eventosService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/eventos', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/eventos/${id}`);
    return response.data;
  },

  create: async (eventoData) => {
    const response = await api.post('/eventos', eventoData);
    return response.data;
  },

  update: async (id, eventoData) => {
    const response = await api.put(`/eventos/${id}`, eventoData);
    return response.data;
  },

  updateEstado: async (id, estado) => {
    const response = await api.put(`/eventos/${id}/estado`, { estado });
    return response.data;
  },

  asignarCoordinador: async (eventoId, coordinadorId) => {
    const response = await api.put(`/eventos/${eventoId}/coordinador`, { coordinador_id: coordinadorId });
    return response.data;
  },

  agregarProducto: async (eventoId, productoId, cantidad, precioUnitario) => {
    const response = await api.post(`/eventos/${eventoId}/productos`, {
      producto_id: productoId,
      cantidad,
      precio_unitario: precioUnitario,
    });
    return response.data;
  },

  eliminarProducto: async (eventoId, productoId, observacion = '') => {
    const response = await api.delete(`/eventos/${eventoId}/productos/${productoId}`, {
      data: { observacion },
    });
    return response.data;
  },

  delete: async (eventoId) => {
    const response = await api.delete(`/eventos/${eventoId}`);
    return response.data;
  },

  getProductos: async (eventoId) => {
    const response = await api.get(`/eventos/${eventoId}/productos`);
    return response.data;
  },

  getServicios: async (eventoId) => {
    const response = await api.get(`/eventos/${eventoId}/servicios`);
    return response.data;
  },

  actualizarServicio: async (eventoId, servicioId, completado, descartado) => {
    const payload = {};
    if (completado !== null && completado !== undefined) {
      payload.completado = completado;
    }
    if (descartado !== null && descartado !== undefined) {
      payload.descartado = descartado;
    }
    const response = await api.put(`/eventos/${eventoId}/servicios/${servicioId}`, payload);
    return response.data;
  },

  generarServicios: async (eventoId) => {
    const response = await api.post(`/eventos/${eventoId}/servicios/generar`);
    return response.data;
  },

  crearServicioPersonalizado: async (eventoId, nombre, orden) => {
    const response = await api.post(`/eventos/${eventoId}/servicios`, { nombre, orden });
    return response.data;
  },

  eliminarServicio: async (eventoId, servicioId) => {
    const response = await api.delete(`/eventos/${eventoId}/servicios/${servicioId}`);
    return response.data;
  },

  calcularTotal: async (eventoId) => {
    const response = await api.post(`/eventos/${eventoId}/calcular-total`);
    return response.data;
  },

  descargarCotizacionPDF: async (eventoId) => {
    const response = await api.get(`/eventos/${eventoId}/cotizacion-pdf`, {
      responseType: 'blob',
    });
    return response;
  },

  descargarContratoPDF: async (eventoId) => {
    const response = await api.get(`/eventos/${eventoId}/contrato-pdf`, {
      responseType: 'blob',
    });
    return response;
  },

  getFechasOcupadas: async (salonId) => {
    const response = await api.get('/eventos/fechas-ocupadas', {
      params: { salon_id: salonId },
    });
    return response.data;
  },
};

// Servicios de planes
export const planesService = {
  getAll: async (soloActivos = true) => {
    const params = { solo_activos: soloActivos };
    const response = await api.get('/planes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/planes/${id}`);
    return response.data;
  },

  create: async (planData) => {
    const response = await api.post('/planes', planData);
    return response.data;
  },

  update: async (id, planData) => {
    const response = await api.put(`/planes/${id}`, planData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/planes/${id}`);
    return response.data;
  },

  agregarProducto: async (planId, productoId, cantidad) => {
    const response = await api.post(`/planes/${planId}/productos`, {
      producto_id: productoId,
      cantidad,
    });
    return response.data;
  },

  eliminarProducto: async (planId, productoId) => {
    const response = await api.delete(`/planes/${planId}/productos/${productoId}`);
    return response.data;
  },

  getProductos: async (planId) => {
    const response = await api.get(`/planes/${planId}/productos`);
    return response.data;
  },

  getServicios: async (planId) => {
    const response = await api.get(`/planes/${planId}/servicios`);
    return response.data;
  },

  actualizarServicios: async (planId, servicios) => {
    const response = await api.put(`/planes/${planId}/servicios`, { servicios });
    return response.data;
  },
};

// Servicios de pagos
export const pagosService = {
  getByEvento: async (eventoId) => {
    const response = await api.get('/pagos', { params: { evento_id: eventoId } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  create: async (pagoData) => {
    const response = await api.post('/pagos', pagoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pagos/${id}`);
    return response.data;
  },

  updateEstado: async (id, estado_pago) => {
    const response = await api.patch(`/pagos/${id}/estado`, { estado_pago });
    return response.data;
  },

  getTotalEvento: async (eventoId) => {
    const response = await api.get(`/pagos/evento/${eventoId}/total`);
    return response.data;
  },
};

export const cargaMasivaService = {
  downloadTemplate: async (tipo) => {
    const response = await api.get(`/carga_masiva/template/${tipo}`, { responseType: 'blob' });
    return response.data;
  },

  upload: async (tipo, archivo) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    const response = await api.post(`/carga_masiva/${tipo}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Servicios de inventario
export const inventarioService = {
  getByEvento: async (eventoId) => {
    const response = await api.get('/inventario', { params: { evento_id: eventoId } });
    return response.data;
  },

  create: async (inventarioData) => {
    const response = await api.post('/inventario', inventarioData);
    return response.data;
  },

  updateEstado: async (id, estado, cantidadUtilizada = null) => {
    const data = { estado };
    if (cantidadUtilizada !== null) data.cantidad_utilizada = cantidadUtilizada;
    const response = await api.put(`/inventario/${id}/estado`, data);
    return response.data;
  },

  registrarDevolucion: async (id, fechaDevolucion) => {
    const response = await api.post(`/inventario/${id}/devolucion`, {
      fecha_devolucion: fechaDevolucion,
    });
    return response.data;
  },

  verificarDisponibilidad: async (productoId, cantidad, fechaEvento) => {
    const response = await api.post('/inventario/verificar-disponibilidad', {
      producto_id: productoId,
      cantidad,
      fecha_evento: fechaEvento,
    });
    return response.data;
  },
};

// Servicios de salones
export const salonesService = {
  getAll: async (soloActivos = false) => {
    const params = { solo_activos: soloActivos };
    const response = await api.get('/salones', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/salones/${id}`);
    return response.data;
  },

  create: async (salonData) => {
    const response = await api.post('/salones', salonData);
    return response.data;
  },

  update: async (id, salonData) => {
    const response = await api.put(`/salones/${id}`, salonData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/salones/${id}`);
    return response.data;
  },

  verificarDisponibilidad: async (id, fechaEvento) => {
    const response = await api.post(`/salones/${id}/verificar-disponibilidad`, {
      fecha_evento: fechaEvento,
    });
    return response.data;
  },
};

// Servicios de reportes
export const reportesService = {
  getMetricas: async () => {
    const response = await api.get('/reportes/metricas');
    return response.data;
  },

  getEventosPorEstado: async () => {
    const response = await api.get('/reportes/eventos-por-estado');
    return response.data;
  },

  getResumenFinanciero: async () => {
    const response = await api.get('/reportes/resumen-financiero');
    return response.data;
  },
};

export const notificacionesNativasService = {
  getConfiguraciones: async () => {
    const response = await api.get('/notificaciones_nativas/configuraciones');
    return response.data;
  },
  getConfiguracion: async (tipo) => {
    const response = await api.get(`/notificaciones_nativas/configuraciones/${tipo}`);
    return response.data;
  },
  updateEstado: async (tipo, activo) => {
    const response = await api.patch(`/notificaciones_nativas/configuraciones/${tipo}/status`, { activo });
    return response.data;
  },
  updateConfiguracion: async (tipo, payload) => {
    const response = await api.put(`/notificaciones_nativas/configuraciones/${tipo}`, payload);
    return response.data;
  },
  getProximasEvento: async (eventoId) => {
    const response = await api.get(`/notificaciones_nativas/evento/${eventoId}/proximas`);
    return response.data;
  },
  forzarNotificacion: async (eventoId, tipo, canal = null) => {
    const response = await api.post(`/notificaciones_nativas/evento/${eventoId}/forzar`, {
      tipo_notificacion: tipo,
      canal,
    });
    return response.data;
  },
};

export const integracionesService = {
  getWhatsApp: async () => {
    const response = await api.get('/integraciones/whatsapp');
    return response.data;
  },
  updateWhatsApp: async (payload) => {
    const response = await api.put('/integraciones/whatsapp', payload);
    return response.data;
  },
};

export const whatsappChatService = {
  getConversations: async () => {
    const response = await api.get('/whatsapp_chat/conversations');
    return response.data;
  },
  getMessages: async (conversationId) => {
    const response = await api.get(`/whatsapp_chat/conversations/${conversationId}/messages`);
    return response.data;
  },
  sendMessage: async (conversationId, mensaje) => {
    const response = await api.post(`/whatsapp_chat/conversations/${conversationId}/send`, { mensaje });
    return response.data;
  },
  setMode: async (conversationId, modo) => {
    const response = await api.patch(`/whatsapp_chat/conversations/${conversationId}/modo`, { modo });
    return response.data;
  },
  resetBot: async (conversationId) => {
    const response = await api.post(`/whatsapp_chat/conversations/${conversationId}/reset-bot`);
    return response.data;
  },
  sendMedia: async (conversationId, formData) => {
    const response = await api.post(`/whatsapp_chat/conversations/${conversationId}/send-media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getMedia: async (mediaId) => {
    const response = await api.get(`/whatsapp_chat/media/${mediaId}`, { responseType: 'blob' });
    return response.data;
  },
};

export const whatsappMetricasService = {
  getResumen: async () => {
    const response = await api.get('/whatsapp_metricas/resumen');
    return response.data;
  },
  getClientes: async () => {
    const response = await api.get('/whatsapp_metricas/clientes');
    return response.data;
  },
  updateConfig: async (payload) => {
    const response = await api.put('/whatsapp_metricas/config', payload);
    return response.data;
  },
  updateControlCliente: async (clienteId, payload) => {
    const response = await api.patch(`/whatsapp_metricas/clientes/${clienteId}/control`, payload);
    return response.data;
  },
};

export const configuracionesService = {
  limpiarDatosPrueba: async () => {
    const response = await api.post('/configuraciones/limpiar-datos-prueba');
    return response.data;
  },
  getNombrePlataforma: async () => {
    const response = await api.get('/configuraciones/nombre-plataforma');
    return response.data;
  },
  updateNombrePlataforma: async (payload) => {
    const response = await api.put('/configuraciones/nombre-plataforma', payload);
    return response.data;
  },
  getGeneral: async () => {
    const response = await api.get('/configuraciones/general');
    return response.data;
  },
  getGeneralPublic: async () => {
    const response = await api.get('/configuraciones/general-public');
    return response.data;
  },
  updateGeneral: async (payload) => {
    const response = await api.put('/configuraciones/general', payload);
    return response.data;
  },
};

export const whatsappTemplatesService = {
  getAll: async () => {
    const response = await api.get('/whatsapp_templates');
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post('/whatsapp_templates', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/whatsapp_templates/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/whatsapp_templates/${id}`);
    return response.data;
  },
  send: async (payload) => {
    const response = await api.post('/whatsapp_templates/enviar', payload);
    return response.data;
  },
};


export default api;
