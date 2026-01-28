import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { eventosService, pagosService, planesService, productosService, usuariosService, notificacionesNativasService, cuentasService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Edit, DollarSign, X, Calendar, User, MapPin, Users, Clock, Package, FileText, Trash2, Eye, Check, Ban, Landmark } from 'lucide-react';
import { hasPermission, PERMISSIONS, ROLES } from '../utils/roles';
import { useToast } from '../hooks/useToast';
import useIsMobile from '../hooks/useIsMobile';
import ToastContainer from '../components/ToastContainer';
import EventoConfirmaciones from '../components/EventoConfirmaciones';

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const isMobile = useIsMobile();
  const [evento, setEvento] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [productosAdicionales, setProductosAdicionales] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [cargandoProductosDisponibles, setCargandoProductosDisponibles] = useState(false);
  const [serviciosEvento, setServiciosEvento] = useState([]);
  const [cargandoServiciosEvento, setCargandoServiciosEvento] = useState(false);
  const [actualizandoServicioId, setActualizandoServicioId] = useState(null);
  const [generandoServicios, setGenerandoServicios] = useState(false);
  const [productosPlan, setProductosPlan] = useState([]);
  const [cargandoProductosPlan, setCargandoProductosPlan] = useState(false);
  const [totalPagado, setTotalPagado] = useState(0);
  const [totalReembolsos, setTotalReembolsos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [mostrarModalPagoDetalle, setMostrarModalPagoDetalle] = useState(false);
  const [pagoDetalle, setPagoDetalle] = useState(null);
  const [confirmacionPago, setConfirmacionPago] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [cuentaAprobacion, setCuentaAprobacion] = useState('');
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalEliminarEvento, setMostrarModalEliminarEvento] = useState(false);
  const [eliminandoEvento, setEliminandoEvento] = useState(false);
  const [errorEliminarEvento, setErrorEliminarEvento] = useState('');
  const [mostrarConfirmReembolso, setMostrarConfirmReembolso] = useState(false);
  const [notificacionesProximas, setNotificacionesProximas] = useState([]);
  const [proximasEjecuciones, setProximasEjecuciones] = useState([]);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);
  const [forzandoNotificacion, setForzandoNotificacion] = useState(null);
  const [previewRecordatorio, setPreviewRecordatorio] = useState(null);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [formProducto, setFormProducto] = useState({ producto_id: '', cantidad: '1' });
  const [errorProducto, setErrorProducto] = useState('');
  const [agregandoProducto, setAgregandoProducto] = useState(false);
  const [mostrarModalEliminarProducto, setMostrarModalEliminarProducto] = useState(false);
  const [productoEliminar, setProductoEliminar] = useState(null);
  const [observacionEliminar, setObservacionEliminar] = useState('');
  const [errorEliminarProducto, setErrorEliminarProducto] = useState('');
  const [eliminandoProducto, setEliminandoProducto] = useState(false);
  const [mostrarModalServicioPersonalizado, setMostrarModalServicioPersonalizado] = useState(false);
  const [formServicioPersonalizado, setFormServicioPersonalizado] = useState({ nombre: '' });
  const [errorServicioPersonalizado, setErrorServicioPersonalizado] = useState('');
  const [creandoServicioPersonalizado, setCreandoServicioPersonalizado] = useState(false);
  const [eliminandoServicioPersonalizado, setEliminandoServicioPersonalizado] = useState(null);
  const [formPago, setFormPago] = useState({
    monto: '',
    tipo_pago: 'abono',
    metodo_pago: 'efectivo',
    fecha_pago: new Date().toISOString().split('T')[0],
    numero_referencia: '',
    observaciones: '',
  });
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [coordinadores, setCoordinadores] = useState([]);
  const [cargandoCoordinadores, setCargandoCoordinadores] = useState(false);
  const [asignandoCoordinador, setAsignandoCoordinador] = useState(false);
  
  // Estados para modal de finalización de evento
  const [mostrarModalFinalizar, setMostrarModalFinalizar] = useState(false);
  const [finalizandoEvento, setFinalizandoEvento] = useState(false);
  const [formFinalizacion, setFormFinalizacion] = useState({
    observacion_finalizacion: '',
    tiene_danos: false,
    descripcion_danos: '',
    costo_danos: '',
    cobrar_danos: false,
  });
  const [infoFinalizacion, setInfoFinalizacion] = useState(null);
  const [danosEvento, setDanosEvento] = useState([]);
  const [enviandoEvaluacion, setEnviandoEvaluacion] = useState(false);
  const [mostrarModalPagoDanos, setMostrarModalPagoDanos] = useState(false);
  const [mostrarModalCalificacionManual, setMostrarModalCalificacionManual] = useState(false);
  const [guardandoCalificacion, setGuardandoCalificacion] = useState(false);
  const [formCalificacion, setFormCalificacion] = useState({
    calificacion: 5,
    observaciones: '',
  });
  const [registrandoPagoDanos, setRegistrandoPagoDanos] = useState(false);
  const [formPagoDanos, setFormPagoDanos] = useState({
    monto: '',
    metodo_pago: 'efectivo',
    observaciones: '',
  });

  const eventoCancelado = evento?.estado === 'cancelado';
  const eventoCompletado = evento?.estado === 'completado';
  const eventoFinalizado = eventoCancelado || eventoCompletado; // No permite ediciones
  const saldoPendiente = parseFloat(evento?.saldo || 0);
  const puedeAgregarProducto = hasPermission(usuario, PERMISSIONS.EVENTOS_AGREGAR_PRODUCTO, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeActualizarServicios = hasPermission(usuario, PERMISSIONS.EVENTOS_ACTUALIZAR_SERVICIOS, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeDescartarServicios = hasPermission(usuario, PERMISSIONS.EVENTOS_DESCARTAR_SERVICIO, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeGenerarServicios = hasPermission(usuario, PERMISSIONS.EVENTOS_GENERAR_SERVICIOS, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeCrearServicioPersonalizado = hasPermission(usuario, PERMISSIONS.EVENTOS_GENERAR_SERVICIOS, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEliminarProducto = hasPermission(usuario, PERMISSIONS.EVENTOS_ELIMINAR_PRODUCTO, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEliminarEvento = hasPermission(usuario, PERMISSIONS.EVENTOS_ELIMINAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeAsignarCoordinador = hasPermission(usuario, PERMISSIONS.EVENTOS_ASIGNAR_COORDINADOR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeNotificarPago = Boolean(evento?.email || evento?.telefono);
  const puedeRegistrarPago = hasPermission(usuario, PERMISSIONS.PAGOS_REGISTRAR, [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]);
  const puedeReembolsar = hasPermission(usuario, PERMISSIONS.PAGOS_REEMBOLSAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeAprobarPago = hasPermission(usuario, PERMISSIONS.PAGOS_APROBAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeAnularPago = hasPermission(usuario, PERMISSIONS.PAGOS_ANULAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const saldoPorReembolsar = Math.max(0, (parseFloat(totalPagado) || 0) - (parseFloat(totalReembolsos) || 0));

  // Determinar tipo de pago automáticamente según el monto
  const determinarTipoPago = (monto) => {
    if (!monto || parseFloat(monto) <= 0) return 'abono';
    const montoNum = parseFloat(monto);
    // Si el monto cubre el saldo pendiente o más, es pago completo
    if (montoNum >= saldoPendiente && saldoPendiente > 0) {
      return 'pago_completo';
    }
    return 'abono';
  };

  // Manejar cambio de monto con tipo de pago automático
  const handleMontoChangePago = (e) => {
    const nuevoMonto = e.target.value;
    // Solo actualizar tipo automáticamente si no es reembolso
    if (formPago.tipo_pago !== 'reembolso') {
      const nuevoTipo = determinarTipoPago(nuevoMonto);
      setFormPago({ ...formPago, monto: nuevoMonto, tipo_pago: nuevoTipo });
    } else {
      setFormPago({ ...formPago, monto: nuevoMonto });
    }
  };

  const progresoServicios = useMemo(() => {
    if (eventoCancelado) return 0;
    if (evento?.estado === 'completado') return 100;
    // Excluir servicios descartados del cálculo
    const serviciosActivos = serviciosEvento.filter((servicio) => !servicio.descartado);
    const total = serviciosActivos.length;
    if (!total) return 0;
    const completados = serviciosActivos.filter((servicio) => servicio.completado).length;
    return Math.round((completados / total) * 100);
  }, [serviciosEvento, eventoCancelado, evento?.estado]);

  useEffect(() => {
    if (id) {
      cargarEvento();
      cargarPagos();
      cargarProductos();
      cargarServiciosEvento();
      cargarNotificacionesProximas();
      cargarCuentas();
    }
  }, [id]);

  const cargarCuentas = async () => {
    try {
      const data = await cuentasService.getAll();
      setCuentas(data.cuentas || []);
    } catch (err) {
      console.error('Error al cargar cuentas:', err);
    }
  };

  useEffect(() => {
    if (!puedeAsignarCoordinador) return;
    const cargarCoordinadores = async () => {
      try {
        setCargandoCoordinadores(true);
        const data = await usuariosService.getAll({ rol: 'coordinador' });
        setCoordinadores(data.usuarios || []);
      } catch (err) {
        console.error('Error al cargar coordinadores:', err);
        setError('Error al cargar coordinadores');
      } finally {
        setCargandoCoordinadores(false);
      }
    };
    cargarCoordinadores();
  }, [puedeAsignarCoordinador]);

  useEffect(() => {
    if (evento?.plan_id) {
      cargarProductosPlan(evento.plan_id);
    } else {
      setProductosPlan([]);
    }
  }, [evento?.plan_id]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab === 'productos' && !eventoCancelado && puedeAgregarProducto) {
      setMostrarModalProducto(true);
      if (productosDisponibles.length === 0) {
        cargarProductosDisponibles();
      }
    }
  }, [location.search, eventoCancelado, productosDisponibles.length, puedeAgregarProducto]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      const data = await eventosService.getById(id);
      setEvento(data.evento);
      setError('');
      
      // Si el evento está completado, cargar info de finalización
      if (data.evento?.estado === 'completado') {
        cargarInfoFinalizacion();
      }
    } catch (err) {
      setError('Error al cargar el evento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarInfoFinalizacion = async () => {
    try {
      const data = await eventosService.obtenerDanos(id);
      setInfoFinalizacion(data.info_finalizacion);
      setDanosEvento(data.danos || []);
    } catch (err) {
      console.error('Error al cargar info de finalización:', err);
    }
  };

  const enviarNotificacionEvaluacion = async () => {
    try {
      setEnviandoEvaluacion(true);
      await notificacionesNativasService.forzarNotificacion(id, 'solicitud_calificacion');
      success('Notificación de evaluación enviada al cliente');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al enviar notificación de evaluación';
      showError(mensaje);
    } finally {
      setEnviandoEvaluacion(false);
    }
  };

  const obtenerNombreCoordinador = () => {
    if (evento?.nombre_coordinador) return evento.nombre_coordinador;
    const coordinadorId = evento?.coordinador_id;
    if (coordinadorId && coordinadores.length > 0) {
      const coordinador = coordinadores.find((c) => c.id === coordinadorId);
      if (coordinador) return coordinador.nombre_completo || coordinador.nombre_usuario || 'Coordinador';
    }
    if (usuario?.id && coordinadorId && coordinadorId === usuario.id) {
      return 'Asignado a mí';
    }
    return '-';
  };

  const handleAsignarCoordinador = async (coordinadorId) => {
    if (!evento) return;
    try {
      setAsignandoCoordinador(true);
      setError('');
      const payloadId = coordinadorId ? parseInt(coordinadorId) : null;
      const response = await eventosService.asignarCoordinador(evento.id_evento || evento.id, payloadId);
      setEvento(response.evento || { ...evento, coordinador_id: payloadId });
    } catch (err) {
      console.error('Error al asignar coordinador:', err);
      setError(err.response?.data?.error || 'Error al asignar coordinador');
    } finally {
      setAsignandoCoordinador(false);
    }
  };

  const handleEliminarEvento = async () => {
    if (!evento) return;
    if (saldoPorReembolsar > 0) {
      setErrorEliminarEvento('Debes reembolsar todos los pagos antes de eliminar el evento.');
      return;
    }
    try {
      setEliminandoEvento(true);
      setErrorEliminarEvento('');
      await eventosService.delete(evento.id_evento || evento.id);
      navigate('/eventos');
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setErrorEliminarEvento(err.response?.data?.error || 'No se pudo eliminar el evento.');
    } finally {
      setEliminandoEvento(false);
    }
  };

  const cargarPagos = async () => {
    try {
      const data = await pagosService.getByEvento(id);
      // Ordenar por ID descendente
      const pagosOrdenados = (data.pagos || []).sort((a, b) => {
        return (b.id || 0) - (a.id || 0);
      });
      setPagos(pagosOrdenados);
      // Usar el total_pagado de la API si está disponible
      if (data.total_pagado !== undefined && data.total_pagado !== null) {
        setTotalPagado(parseFloat(data.total_pagado) || 0);
      } else {
        // Calcular manualmente si no viene de la API
        const calculado = (data.pagos || []).reduce((sum, pago) => {
          const monto = parseFloat(pago.monto) || 0;
          if (pago.tipo_pago === 'reembolso') {
            return sum - monto;
          }
          return sum + monto;
        }, 0);
        setTotalPagado(calculado);
      }
      try {
        const totales = await pagosService.getTotalEvento(id);
        if (totales.total_pagado !== undefined && totales.total_pagado !== null) {
          setTotalPagado(parseFloat(totales.total_pagado) || 0);
        }
        if (totales.total_reembolsos !== undefined && totales.total_reembolsos !== null) {
          setTotalReembolsos(parseFloat(totales.total_reembolsos) || 0);
        }
      } catch (err) {
        console.error('Error al cargar totales de pagos:', err);
      }
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setTotalPagado(0);
      setTotalReembolsos(0);
    }
  };

  const cargarNotificacionesProximas = async () => {
    try {
      setCargandoNotificaciones(true);
      const data = await notificacionesNativasService.getProximasEvento(id);
      setNotificacionesProximas(data.notificaciones || []);
      setProximasEjecuciones(data.proximas_ejecuciones || []);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setNotificacionesProximas([]);
      setProximasEjecuciones([]);
    } finally {
      setCargandoNotificaciones(false);
    }
  };

  const construirPreview = (plantilla, datos) => {
    let contenido = plantilla || '';
    Object.entries(datos).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      contenido = contenido.replace(regex, value ?? '');
    });
    return contenido;
  };

  const abrirPreviewRecordatorio = (notif) => {
    if (!notif) return;
    const fechaEvento = evento?.fecha_evento ? new Date(evento.fecha_evento) : null;
    const diasRestantes = fechaEvento
      ? Math.max(
          0,
          Math.ceil((fechaEvento - new Date()) / (1000 * 60 * 60 * 24))
        )
      : '';
    const datos = {
      nombre_cliente: evento?.nombre_cliente || '',
      nombre_evento: evento?.nombre_evento || evento?.salon || '',
      fecha_evento: evento?.fecha_evento || '',
      hora_inicio: evento?.hora_inicio || '',
      dias_restantes: diasRestantes,
      saldo_pendiente: evento?.saldo || '',
      total: evento?.total || '',
    };
    setPreviewRecordatorio({
      titulo: notif.nombre || 'Recordatorio del evento',
      email: construirPreview(notif.plantilla_email, datos),
      whatsapp: construirPreview(notif.plantilla_whatsapp, datos),
    });
    setMostrarPreview(true);
  };

  const cargarProductos = async () => {
    try {
      const data = await eventosService.getProductos(id);
      setProductosAdicionales(data.productos || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setProductosAdicionales([]);
    }
  };

  const cargarServiciosEvento = async () => {
    try {
      setCargandoServiciosEvento(true);
      const data = await eventosService.getServicios(id);
      setServiciosEvento(data.servicios || []);
    } catch (err) {
      console.error('Error al cargar servicios del evento:', err);
      setServiciosEvento([]);
    } finally {
      setCargandoServiciosEvento(false);
    }
  };

  const handleActualizarServicio = async (servicioId, completado) => {
    try {
      setActualizandoServicioId(servicioId);
      const data = await eventosService.actualizarServicio(
        evento.id_evento || evento.id,
        servicioId,
        completado
      );
      setServiciosEvento(data.servicios || []);
      // Actualizar porcentaje de avance si viene en la respuesta
      if (data.porcentaje_avance !== undefined && evento) {
        setEvento({ ...evento, porcentaje_avance_servicios: data.porcentaje_avance });
      }
    } catch (err) {
      console.error('Error al actualizar servicio:', err);
    } finally {
      setActualizandoServicioId(null);
    }
  };

  const handleDescartarServicio = async (servicioId, descartado) => {
    try {
      setActualizandoServicioId(servicioId);
      const data = await eventosService.actualizarServicio(
        evento.id_evento || evento.id,
        servicioId,
        null, // No cambiar completado
        descartado // Cambiar descartado
      );
      setServiciosEvento(data.servicios || []);
      // Actualizar porcentaje de avance si viene en la respuesta
      if (data.porcentaje_avance !== undefined && evento) {
        setEvento({ ...evento, porcentaje_avance_servicios: data.porcentaje_avance });
      }
    } catch (err) {
      console.error('Error al descartar servicio:', err);
    } finally {
      setActualizandoServicioId(null);
    }
  };

  const handleGenerarServicios = async () => {
    if (!evento?.plan_id) {
      setError('El evento no tiene plan asociado.');
      return;
    }
    try {
      setGenerandoServicios(true);
      setError(''); // Limpiar error previo
      const data = await eventosService.generarServicios(evento.id_evento || evento.id);
      const servicios = data.servicios || [];
      setServiciosEvento(servicios);
      if (servicios.length === 0) {
        setError('El plan seleccionado no tiene servicios configurados. Por favor, configura los servicios del plan primero.');
      } else {
        setError('');
        success(`Servicios generados exitosamente: ${servicios.length} servicio(s)`);
      }
    } catch (err) {
      console.error('Error al generar servicios:', err);
      const errorMessage = err.response?.data?.error || 'Error al generar servicios';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setGenerandoServicios(false);
    }
  };

  const handleCrearServicioPersonalizado = async () => {
    if (!formServicioPersonalizado.nombre || !formServicioPersonalizado.nombre.trim()) {
      setErrorServicioPersonalizado('El nombre del servicio es requerido');
      return;
    }
    try {
      setCreandoServicioPersonalizado(true);
      setErrorServicioPersonalizado('');
      const data = await eventosService.crearServicioPersonalizado(
        evento.id_evento || evento.id,
        formServicioPersonalizado.nombre.trim()
      );
      setServiciosEvento(data.servicios || []);
      setMostrarModalServicioPersonalizado(false);
      setFormServicioPersonalizado({ nombre: '' });
      success('Servicio personalizado creado exitosamente');
    } catch (err) {
      console.error('Error al crear servicio personalizado:', err);
      const errorMessage = err.response?.data?.error || 'Error al crear servicio';
      setErrorServicioPersonalizado(errorMessage);
      showError(errorMessage);
    } finally {
      setCreandoServicioPersonalizado(false);
    }
  };

  const handleEliminarServicioPersonalizado = async (servicioId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este servicio personalizado?')) {
      return;
    }
    try {
      setEliminandoServicioPersonalizado(servicioId);
      const data = await eventosService.eliminarServicio(evento.id_evento || evento.id, servicioId);
      setServiciosEvento(data.servicios || []);
      success('Servicio eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar servicio:', err);
      const errorMessage = err.response?.data?.error || 'Error al eliminar servicio';
      showError(errorMessage);
    } finally {
      setEliminandoServicioPersonalizado(null);
    }
  };

  const cargarProductosDisponibles = async () => {
    try {
      setCargandoProductosDisponibles(true);
      const data = await productosService.getAll(true);
      setProductosDisponibles(data.productos || []);
    } catch (err) {
      console.error('Error al cargar productos disponibles:', err);
      setProductosDisponibles([]);
    } finally {
      setCargandoProductosDisponibles(false);
    }
  };

  const cargarProductosPlan = async (planId) => {
    try {
      setCargandoProductosPlan(true);
      const data = await planesService.getProductos(planId);
      setProductosPlan(data.productos || []);
    } catch (err) {
      console.error('Error al cargar productos del plan:', err);
      setProductosPlan([]);
    } finally {
      setCargandoProductosPlan(false);
    }
  };

  const abrirModalEliminarProducto = (producto) => {
    setProductoEliminar(producto);
    setObservacionEliminar('');
    setErrorEliminarProducto('');
    setMostrarModalEliminarProducto(true);
  };

  const handleAgregarProducto = async () => {
    if (!formProducto.producto_id || !formProducto.cantidad || parseInt(formProducto.cantidad, 10) <= 0) {
      setErrorProducto('Selecciona un producto y una cantidad válida.');
      return;
    }

    const producto = productosDisponibles.find((p) => p.id === parseInt(formProducto.producto_id, 10));
    if (!producto) {
      setErrorProducto('Producto no encontrado.');
      return;
    }

    const productoId = producto.id;
    const existe = productosAdicionales.some((p) => (p.producto_id || p.id) === productoId);
    if (existe) {
      setErrorProducto('Este producto ya está agregado.');
      return;
    }

    try {
      setAgregandoProducto(true);
      await eventosService.agregarProducto(
        evento.id_evento || evento.id,
        productoId,
        parseInt(formProducto.cantidad, 10),
        parseFloat(producto.precio || 0)
      );
      await cargarProductos();
      setFormProducto({ producto_id: '', cantidad: '1' });
      setErrorProducto('');
      setMostrarModalProducto(false);
    } catch (err) {
      console.error('Error al agregar producto:', err);
      setErrorProducto('No se pudo agregar el producto. Intenta nuevamente.');
    } finally {
      setAgregandoProducto(false);
    }
  };

  const confirmarEliminarProducto = async () => {
    const observacion = observacionEliminar.trim();
    if (!observacion) {
      setErrorEliminarProducto('Debes agregar una observación antes de eliminar.');
      return;
    }
    if (!productoEliminar) {
      return;
    }
    try {
      setEliminandoProducto(true);
      const productoId = productoEliminar.producto_id || productoEliminar.id;
      const response = await eventosService.eliminarProducto(
        evento.id_evento || evento.id,
        productoId,
        observacion
      );
      setProductosAdicionales((prev) =>
        prev.filter((item) => (item.producto_id || item.id) !== productoId)
      );
      if (response?.evento) {
        setEvento(response.evento);
      }
      setMostrarModalEliminarProducto(false);
      setProductoEliminar(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setErrorEliminarProducto('No se pudo eliminar el producto. Intenta nuevamente.');
    } finally {
      setEliminandoProducto(false);
    }
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    try {
      // Si viene en formato HH:MM:SS, tomar solo HH:MM
      if (typeof hora === 'string' && hora.includes(':')) {
        const partes = hora.split(':');
        return `${partes[0]}:${partes[1]}`;
      }
      return hora;
    } catch {
      return hora;
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const parseFechaLocal = (valor) => {
    if (!valor) return null;
    if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      const [year, month, day] = valor.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(valor);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      const fechaObj = parseFechaLocal(fecha);
      return fechaObj.toLocaleDateString('es-CO');
    } catch {
      return fecha;
    }
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '-';
    try {
      const fechaObj = parseFechaLocal(fecha);
      const year = fechaObj.getFullYear();
      const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const day = String(fechaObj.getDate()).padStart(2, '0');
      const hours = String(fechaObj.getHours()).padStart(2, '0');
      const minutes = String(fechaObj.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return fecha;
    }
  };

  const obtenerLabelEstadoPago = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      case 'en_revision':
      default:
        return 'En revisión';
    }
  };

  const obtenerEstiloEstadoPago = (estado) => {
    switch (estado) {
      case 'aprobado':
        return { backgroundColor: '#16a34a20', color: '#16a34a' };
      case 'rechazado':
        return { backgroundColor: '#ef444420', color: '#ef4444' };
      default:
        return { backgroundColor: '#f59e0b20', color: '#d97706' };
    }
  };

  const abrirDetallePago = (pago) => {
    setPagoDetalle(pago);
    setMostrarModalPagoDetalle(true);
  };

  const cambiarEstadoPago = async (pago, nuevoEstado) => {
    if (!pago) return;
    try {
      await pagosService.updateEstado(pago.id, nuevoEstado);
      await cargarPagos();
      await cargarEvento();
      success('Estado del pago actualizado');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo actualizar el estado del pago';
      showError(mensaje);
    }
  };

  const solicitarConfirmacionEstadoPago = (pago, nuevoEstado) => {
    if (!pago) return;
    setConfirmacionPago({ pago, nuevoEstado });
    // Inicializar cuenta seleccionada con la cuenta actual del pago
    setCuentaAprobacion(pago.cuenta_id || '');
  };

  const confirmarCambioEstadoPago = async () => {
    if (!confirmacionPago) return;
    const { pago, nuevoEstado } = confirmacionPago;
    
    // Si se está aprobando y se seleccionó una cuenta, actualizar la cuenta primero
    if (nuevoEstado === 'aprobado' && cuentaAprobacion) {
      try {
        await pagosService.updateCuenta(pago.id, parseInt(cuentaAprobacion));
      } catch (err) {
        console.error('Error al actualizar cuenta del pago:', err);
      }
    }
    
    setConfirmacionPago(null);
    setCuentaAprobacion('');
    await cambiarEstadoPago(pago, nuevoEstado);
  };

  const obtenerCreadorEvento = () => {
    if (evento?.creado_por_nombre) return evento.creado_por_nombre;
    if (evento?.nombre_cliente) return evento.nombre_cliente;
    return '-';
  };

  const registrarPago = async (confirmado = false) => {
    if (formPago.tipo_pago === 'reembolso' && parseFloat(formPago.monto) > saldoPorReembolsar) {
      setError('El monto del reembolso supera el saldo disponible para reembolsar.');
      return;
    }
    if (formPago.tipo_pago === 'reembolso' && !confirmado) {
      setMostrarConfirmReembolso(true);
      return;
    }
    setGuardandoPago(true);
    try {
      const pagoData = {
        evento_id: parseInt(id),
        monto: parseFloat(formPago.monto),
        tipo_pago: formPago.tipo_pago,
        metodo_pago: formPago.metodo_pago,
        fecha_pago: formPago.fecha_pago,
        numero_referencia: formPago.numero_referencia || null,
        observaciones: formPago.observaciones || null,
        origen: 'web', // Identificar que el pago viene de la aplicación web
      };

      await pagosService.create(pagoData);

      // Recargar pagos y evento
      await cargarPagos();
      await cargarEvento();

      // Cerrar modal y resetear formulario
      setMostrarModalPago(false);
      setFormPago({
        monto: '',
        tipo_pago: 'abono',
        metodo_pago: 'efectivo',
        fecha_pago: new Date().toISOString().split('T')[0],
        numero_referencia: '',
        observaciones: '',
      });
      setError('');
      success(formPago.tipo_pago === 'reembolso' ? 'Reembolso registrado exitosamente' : 'Pago registrado exitosamente');
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError(err.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setGuardandoPago(false);
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    await registrarPago(false);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      cotizacion: '#6b7280',
      confirmado: '#10b981',
      en_proceso: '#3b82f6',
      completado: '#8b5cf6',
      cancelado: '#ef4444',
    };
    return colores[estado] || '#6b7280';
  };

  const abrirAdicionalesEvento = () => {
    if (!evento) return;
    if (eventoCancelado) return;
    setMostrarModalProducto(true);
    if (productosDisponibles.length === 0) {
      cargarProductosDisponibles();
    }
  };

  // Funciones para finalización de evento
  const abrirModalFinalizar = () => {
    setFormFinalizacion({
      observacion_finalizacion: '',
      tiene_danos: false,
      descripcion_danos: '',
      costo_danos: '',
      cobrar_danos: false,
    });
    setMostrarModalFinalizar(true);
  };

  const cerrarModalFinalizar = () => {
    setMostrarModalFinalizar(false);
    setFormFinalizacion({
      observacion_finalizacion: '',
      tiene_danos: false,
      descripcion_danos: '',
      costo_danos: '',
      cobrar_danos: false,
    });
  };

  const handleFinalizarEvento = async () => {
    try {
      setFinalizandoEvento(true);
      
      const datosFinalizacion = {
        observacion_finalizacion: formFinalizacion.observacion_finalizacion,
        tiene_danos: formFinalizacion.tiene_danos,
        descripcion_danos: formFinalizacion.descripcion_danos,
        costo_danos: formFinalizacion.tiene_danos ? parseFloat(formFinalizacion.costo_danos) || 0 : 0,
        cobrar_danos: formFinalizacion.tiene_danos && formFinalizacion.cobrar_danos,
      };

      const response = await eventosService.completarEvento(id, datosFinalizacion);
      
      if (response?.evento) {
        setEvento(response.evento);
      }
      
      cerrarModalFinalizar();
      success('Evento completado exitosamente');
      
      // Recargar datos
      await cargarEvento();
      await cargarPagos();
      
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al finalizar el evento';
      showError(mensaje);
    } finally {
      setFinalizandoEvento(false);
    }
  };

  const puedeFinalizarEvento = (evento?.estado === 'confirmado' || evento?.estado === 'en_proceso') && saldoPendiente <= 0;

  // Funciones para pago de daños
  const abrirModalPagoDanos = () => {
    const costoDanos = parseFloat(evento?.costo_danos || 0);
    const montoPagado = parseFloat(evento?.monto_pagado_danos || 0);
    const saldoDanos = costoDanos - montoPagado;
    setFormPagoDanos({
      monto: saldoDanos > 0 ? saldoDanos.toFixed(2) : '',
      metodo_pago: 'efectivo',
      observaciones: '',
    });
    setMostrarModalPagoDanos(true);
  };

  const cerrarModalPagoDanos = () => {
    setMostrarModalPagoDanos(false);
    setFormPagoDanos({ monto: '', metodo_pago: 'efectivo', observaciones: '' });
  };

  const handleRegistrarPagoDanos = async () => {
    try {
      setRegistrandoPagoDanos(true);
      const monto = parseFloat(formPagoDanos.monto);
      if (isNaN(monto) || monto <= 0) {
        showError('Ingrese un monto válido');
        return;
      }
      
      await eventosService.registrarPagoDanos(
        id, 
        monto, 
        formPagoDanos.metodo_pago, 
        formPagoDanos.observaciones
      );
      
      cerrarModalPagoDanos();
      success('Pago de daños registrado exitosamente');
      await cargarEvento();
      
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al registrar pago de daños';
      showError(mensaje);
    } finally {
      setRegistrandoPagoDanos(false);
    }
  };

  // Funciones para calificación manual
  const abrirModalCalificacionManual = () => {
    setFormCalificacion({
      calificacion: evento?.calificacion_cliente || 5,
      observaciones: evento?.observaciones_calificacion || '',
    });
    setMostrarModalCalificacionManual(true);
  };

  const cerrarModalCalificacionManual = () => {
    setMostrarModalCalificacionManual(false);
    setFormCalificacion({ calificacion: 5, observaciones: '' });
  };

  const handleGuardarCalificacion = async () => {
    try {
      setGuardandoCalificacion(true);
      
      await eventosService.registrarCalificacionManual(id, {
        calificacion: formCalificacion.calificacion,
        observaciones: formCalificacion.observaciones,
      });
      
      cerrarModalCalificacionManual();
      success('Calificación registrada exitosamente');
      await cargarEvento();
      
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al registrar calificación';
      showError(mensaje);
    } finally {
      setGuardandoCalificacion(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando evento...</div>;
  }

  if (error || !evento) {
    return (
      <div>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          {error || 'Evento no encontrado'}
        </div>
        <button
          onClick={() => navigate('/eventos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
          Volver a Eventos
        </button>
      </div>
    );
  }


  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
        <button
          onClick={() => navigate('/eventos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#6366f1',
            border: '1px solid #6366f1',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          <ArrowLeft size={isMobile ? 14 : 16} />
          Volver
        </button>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {evento.nombre_evento || 'Evento'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: isMobile ? '0.875rem' : '1rem' }}>Detalle del evento</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
            {puedeFinalizarEvento && (
              <button
                type="button"
                onClick={abrirModalFinalizar}
                style={{
                  padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <Check size={16} />
                Finalizar evento
              </button>
            )}
            {evento?.estado === 'completado' && (
              <button
                type="button"
                onClick={enviarNotificacionEvaluacion}
                disabled={enviandoEvaluacion}
                style={{
                  padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                  backgroundColor: enviandoEvaluacion ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: enviandoEvaluacion ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  flex: isMobile ? 1 : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                {enviandoEvaluacion ? 'Enviando...' : '⭐ Solicitar Evaluación'}
              </button>
            )}
            {evento.estado === 'completado' && (
              <button
                type="button"
                onClick={abrirModalCalificacionManual}
                style={{
                  padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                  backgroundColor: evento.calificacion_cliente ? '#10b981' : '#6366f1',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  flex: isMobile ? 1 : 'none',
                }}
              >
                {evento.calificacion_cliente ? `✏️ Editar (${evento.calificacion_cliente}⭐)` : '📝 Calificar Manual'}
              </button>
            )}
            {puedeEliminarEvento && (
              <button
                type="button"
                onClick={() => {
                  setErrorEliminarEvento('');
                  setMostrarModalEliminarEvento(true);
                }}
                style={{
                  padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  flex: isMobile ? 1 : 'none',
                }}
              >
                Eliminar evento
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '1rem' : '1.5rem', marginBottom: isMobile ? '1.5rem' : '2rem' }}>
        {/* Información del evento */}
        <div
          style={{
            backgroundColor: 'white',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '600', marginBottom: isMobile ? '1rem' : '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={isMobile ? 18 : 20} color="#6366f1" />
            Información del Evento
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <User size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Cliente</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{evento.nombre_cliente || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <MapPin size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tipo de Evento</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{evento.tipo_evento || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Calendar size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Fecha</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{formatearFecha(evento.fecha_evento)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Calendar size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Fecha de creación</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{formatearFecha(evento.fecha_creacion)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <User size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Creado por</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{obtenerCreadorEvento()}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Estado</div>
                <span
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: `${getEstadoColor(evento.estado)}20`,
                    color: getEstadoColor(evento.estado),
                    textTransform: 'capitalize',
                  }}
                >
                  {evento.estado || '-'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Users size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Número de Invitados</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{evento.numero_invitados || 0}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Clock size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hora de Inicio</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{formatearHora(evento.hora_inicio)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Clock size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hora de Fin</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{formatearHora(evento.hora_fin)}</div>
              </div>
            </div>
            {evento.nombre_salon || evento.salon ? (
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <MapPin size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Salón</div>
                  <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{evento.nombre_salon || evento.salon || '-'}</div>
                </div>
              </div>
            ) : null}
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <User size={18} color="#6b7280" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Coordinador</div>
                {puedeAsignarCoordinador ? (
                  <select
                    value={evento.coordinador_id || ''}
                    onChange={(e) => handleAsignarCoordinador(e.target.value)}
                    disabled={cargandoCoordinadores || asignandoCoordinador}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      minWidth: '220px',
                    }}
                  >
                    <option value="">Sin asignar</option>
                    {coordinadores.map((coordinador) => (
                      <option key={coordinador.id} value={coordinador.id}>
                        {coordinador.nombre_completo || coordinador.nombre_usuario || 'Coordinador'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{obtenerNombreCoordinador()}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recordatorios programados */}
        <div
          style={{
            backgroundColor: 'white',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '600', marginBottom: isMobile ? '1rem' : '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={isMobile ? 18 : 20} color="#6366f1" />
            Recordatorios programados
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
            <div>
              Correo: <span style={{ color: '#111827' }}>{evento?.email || 'No disponible'}</span>
            </div>
            <div>
              Telefono: <span style={{ color: '#111827' }}>{evento?.telefono || 'No disponible'}</span>
            </div>
          </div>
          {cargandoNotificaciones ? (
            <p style={{ color: '#6b7280' }}>Cargando recordatorios...</p>
          ) : notificacionesProximas.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No hay recordatorios activos para este evento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(() => {
                const recordatorios = notificacionesProximas.filter((n) =>
                  String(n.tipo_notificacion || '').startsWith('recordatorio')
                );
                const manualRecordatorio = recordatorios.find(
                  (n) => n.tipo_notificacion === 'recordatorio_evento'
                );
                const automaticos = recordatorios.filter(
                  (n) => n.tipo_notificacion !== 'recordatorio_evento'
                );
                const otros = notificacionesProximas.filter(
                  (n) => !String(n.tipo_notificacion || '').startsWith('recordatorio')
                );
                const totalEnviosRecordatorio = (manualRecordatorio?.total_envios || 0);
                const ultimoEnvioRecordatorio = manualRecordatorio?.ultimo_envio || null;
                const recordatorioForzar = manualRecordatorio || {
                  tipo_notificacion: 'recordatorio_evento',
                  enviar_email: automaticos[0]?.enviar_email ?? true,
                  enviar_whatsapp: automaticos[0]?.enviar_whatsapp ?? true,
                };

                const tarjetas = [];

                if (recordatorios.length > 0) {
                  tarjetas.push(
                    <div
                      key="recordatorio_evento"
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: manualRecordatorio ? 'pointer' : 'default',
                      }}
                      onClick={() => manualRecordatorio && abrirPreviewRecordatorio(manualRecordatorio)}
                    >
                      <div>
                        <div style={{ fontWeight: '600' }}>Recordatorio del evento</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          Automatico:{' '}
                          {automaticos.length > 0
                            ? automaticos.map((n) => `${n.dias_antes} dias antes`).join(' y ')
                            : 'No configurado'}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          Medio:{' '}
                          {automaticos[0]
                            ? [
                                automaticos[0].enviar_email ? 'Email' : null,
                                automaticos[0].enviar_whatsapp ? 'WhatsApp' : null,
                              ]
                                .filter(Boolean)
                                .join(' + ')
                            : 'Sin canal'}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          {manualRecordatorio?.fecha_evento
                            ? `Quedan ${Math.max(
                                0,
                                Math.ceil(
                                  (new Date(manualRecordatorio.fecha_evento) - new Date()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )} dias`
                            : 'Recordatorio manual'}
                          {totalEnviosRecordatorio
                            ? ` · Enviados: ${totalEnviosRecordatorio}`
                            : ' · Enviados: 0'}
                          {ultimoEnvioRecordatorio
                            ? ` · Ultimo: ${new Date(ultimoEnvioRecordatorio).toLocaleDateString()}`
                            : ''}
                        </div>
                      </div>
                      {recordatorios.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={async (event) => {
                              event.stopPropagation();
                              if (!evento?.email) {
                                showError('Este evento no tiene correo. No se puede enviar email.');
                                return;
                              }
                              try {
                                setForzandoNotificacion('email');
                                const resp = await notificacionesNativasService.forzarNotificacion(
                                  id,
                                  recordatorioForzar.tipo_notificacion,
                                  'email'
                                );
                                if (resp?.success) {
                                  success('Recordatorio enviado por email');
                                } else {
                                  showError(resp?.error || 'No se pudo enviar el recordatorio');
                                }
                                await cargarNotificacionesProximas();
                              } catch (err) {
                                const mensaje =
                                  err.response?.data?.error || 'No se pudo enviar el recordatorio';
                                showError(mensaje);
                              } finally {
                                setForzandoNotificacion(null);
                              }
                            }}
                          disabled={forzandoNotificacion === 'email' || !evento?.email}
                            style={{
                              padding: '0.5rem 0.9rem',
                              borderRadius: '0.5rem',
                              border: '1px solid #d1d5db',
                            background:
                              forzandoNotificacion === 'email' || !evento?.email ? '#e5e7eb' : '#f3f4f6',
                            cursor:
                              forzandoNotificacion === 'email' || !evento?.email ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {forzandoNotificacion === 'email' ? 'Enviando...' : 'Forzar email'}
                          </button>
                          <button
                            onClick={async (event) => {
                              event.stopPropagation();
                              if (!evento?.telefono) {
                                showError('Este evento no tiene telefono. No se puede enviar WhatsApp.');
                                return;
                              }
                              try {
                                setForzandoNotificacion('whatsapp');
                                const resp = await notificacionesNativasService.forzarNotificacion(
                                  id,
                                  recordatorioForzar.tipo_notificacion,
                                  'whatsapp'
                                );
                                if (resp?.success) {
                                  success('Recordatorio enviado por WhatsApp');
                                } else {
                                  showError(resp?.error || 'No se pudo enviar el recordatorio');
                                }
                                await cargarNotificacionesProximas();
                              } catch (err) {
                                const mensaje =
                                  err.response?.data?.error || 'No se pudo enviar el recordatorio';
                                showError(mensaje);
                              } finally {
                                setForzandoNotificacion(null);
                              }
                            }}
                            disabled={forzandoNotificacion === 'whatsapp' || !evento?.telefono}
                            style={{
                              padding: '0.5rem 0.9rem',
                              borderRadius: '0.5rem',
                              border: '1px solid #d1d5db',
                              background:
                                forzandoNotificacion === 'whatsapp' || !evento?.telefono ? '#e5e7eb' : '#f3f4f6',
                              cursor:
                                forzandoNotificacion === 'whatsapp' || !evento?.telefono ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {forzandoNotificacion === 'whatsapp' ? 'Enviando...' : 'Forzar WhatsApp'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                }

                // Tarjeta de recordatorio de valores pendientes (solo si hay saldo > 0)
                const saldoPendiente = parseFloat(evento?.saldo || evento?.saldo_pendiente || 0);
                if (saldoPendiente > 0) {
                  const valoresPendientes = notificacionesProximas.find(
                    (n) => n.tipo_notificacion === 'recordatorio_valores_pendientes'
                  ) || {
                    tipo_notificacion: 'recordatorio_valores_pendientes',
                    enviar_email: true,
                    enviar_whatsapp: true,
                    total_envios: 0,
                    ultimo_envio: null,
                  };

                  tarjetas.push(
                    <div
                      key="recordatorio_valores_pendientes"
                      style={{
                        border: '1px solid #fbbf24',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        backgroundColor: '#fffbeb',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#92400e' }}>Recordatorio de valores pendientes</div>
                        <div style={{ color: '#b45309', fontSize: '0.85rem' }}>
                          Saldo pendiente: ${saldoPendiente.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ color: '#b45309', fontSize: '0.85rem' }}>
                          Medio: Email + WhatsApp
                        </div>
                        <div style={{ color: '#b45309', fontSize: '0.85rem' }}>
                          Enviados: {valoresPendientes.total_envios || 0}
                          {valoresPendientes.ultimo_envio
                            ? ` · Ultimo: ${new Date(valoresPendientes.ultimo_envio).toLocaleDateString()}`
                            : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={async (event) => {
                            event.stopPropagation();
                            if (!evento?.email) {
                              showError('Este evento no tiene correo. No se puede enviar email.');
                              return;
                            }
                            try {
                              setForzandoNotificacion('valores_email');
                              const resp = await notificacionesNativasService.forzarNotificacion(
                                id,
                                'recordatorio_valores_pendientes',
                                'email'
                              );
                              if (resp?.success) {
                                success('Recordatorio de valores pendientes enviado por email');
                              } else {
                                showError(resp?.error || 'No se pudo enviar el recordatorio');
                              }
                              await cargarNotificacionesProximas();
                            } catch (err) {
                              const mensaje =
                                err.response?.data?.error || 'No se pudo enviar el recordatorio';
                              showError(mensaje);
                            } finally {
                              setForzandoNotificacion(null);
                            }
                          }}
                          disabled={forzandoNotificacion === 'valores_email' || !evento?.email}
                          style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #fbbf24',
                            background:
                              forzandoNotificacion === 'valores_email' || !evento?.email ? '#fef3c7' : '#fff',
                            cursor:
                              forzandoNotificacion === 'valores_email' || !evento?.email ? 'not-allowed' : 'pointer',
                            color: '#92400e',
                            fontWeight: '500',
                          }}
                        >
                          {forzandoNotificacion === 'valores_email' ? 'Enviando...' : 'Forzar email'}
                        </button>
                        <button
                          onClick={async (event) => {
                            event.stopPropagation();
                            if (!evento?.telefono) {
                              showError('Este evento no tiene telefono. No se puede enviar WhatsApp.');
                              return;
                            }
                            try {
                              setForzandoNotificacion('valores_whatsapp');
                              const resp = await notificacionesNativasService.forzarNotificacion(
                                id,
                                'recordatorio_valores_pendientes',
                                'whatsapp'
                              );
                              if (resp?.success) {
                                success('Recordatorio de valores pendientes enviado por WhatsApp');
                              } else {
                                showError(resp?.error || 'No se pudo enviar el recordatorio');
                              }
                              await cargarNotificacionesProximas();
                            } catch (err) {
                              const mensaje =
                                err.response?.data?.error || 'No se pudo enviar el recordatorio';
                              showError(mensaje);
                            } finally {
                              setForzandoNotificacion(null);
                            }
                          }}
                          disabled={forzandoNotificacion === 'valores_whatsapp' || !evento?.telefono}
                          style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #fbbf24',
                            background:
                              forzandoNotificacion === 'valores_whatsapp' || !evento?.telefono ? '#fef3c7' : '#fff',
                            cursor:
                              forzandoNotificacion === 'valores_whatsapp' || !evento?.telefono ? 'not-allowed' : 'pointer',
                            color: '#92400e',
                            fontWeight: '500',
                          }}
                        >
                          {forzandoNotificacion === 'valores_whatsapp' ? 'Enviando...' : 'Forzar WhatsApp'}
                        </button>
                      </div>
                    </div>
                  );
                }

                otros.forEach((notif) => {
                const fechaEvento = notif.fecha_evento ? new Date(notif.fecha_evento) : null;
                let fechaEnvio = null;
                if (fechaEvento) {
                  if (notif.dias_antes === -1) {
                    fechaEnvio = new Date(fechaEvento);
                    fechaEnvio.setDate(fechaEnvio.getDate() + 1);
                  } else {
                    fechaEnvio = new Date(fechaEvento);
                    fechaEnvio.setDate(fechaEnvio.getDate() - notif.dias_antes);
                  }
                }
                const medios = [
                  notif.enviar_email ? 'Email' : null,
                  notif.enviar_whatsapp ? 'WhatsApp' : null,
                ].filter(Boolean);
                tarjetas.push(
                  <div
                    key={notif.tipo_notificacion}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600' }}>{notif.nombre}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                        {notif.dias_antes === -1
                          ? 'Despues del evento'
                          : `${notif.dias_antes} dias antes del evento`}
                        {fechaEnvio ? ` · ${fechaEnvio.toLocaleDateString()}` : ''}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                        Medio: {medios.length > 0 ? medios.join(' + ') : 'Sin canal'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                        Enviados: {notif.total_envios || 0}
                        {notif.ultimo_envio ? ` · Ultimo: ${new Date(notif.ultimo_envio).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          setForzandoNotificacion(notif.tipo_notificacion);
                          await notificacionesNativasService.forzarNotificacion(id, notif.tipo_notificacion);
                          success('Recordatorio enviado');
                          await cargarNotificacionesProximas();
                        } catch (err) {
                          const mensaje = err.response?.data?.error || 'No se pudo enviar el recordatorio';
                          showError(mensaje);
                        } finally {
                          setForzandoNotificacion(null);
                        }
                      }}
                      disabled={forzandoNotificacion === notif.tipo_notificacion}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        background: forzandoNotificacion === notif.tipo_notificacion ? '#e5e7eb' : '#f3f4f6',
                        cursor: forzandoNotificacion === notif.tipo_notificacion ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {forzandoNotificacion === notif.tipo_notificacion ? 'Enviando...' : 'Forzar envio'}
                    </button>
                  </div>
                );
                });

                return tarjetas;
              })()}
            </div>
          )}
          
          {/* Próximas Ejecuciones Automáticas */}
          {proximasEjecuciones.length > 0 && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                Cronograma de Notificaciones Automáticas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {proximasEjecuciones.map((ejecucion, idx) => {
                  const getEstadoStyle = (estado) => {
                    switch (estado) {
                      case 'enviado':
                        return { bg: '#dcfce7', color: '#166534', icon: '✓' };
                      case 'hoy':
                        return { bg: '#fef3c7', color: '#92400e', icon: '⏰' };
                      case 'pendiente':
                        return { bg: '#e0e7ff', color: '#3730a3', icon: '📅' };
                      case 'pasado':
                        return { bg: '#fee2e2', color: '#991b1b', icon: '⚠️' };
                      default:
                        return { bg: '#f3f4f6', color: '#374151', icon: '•' };
                    }
                  };
                  
                  const getEstadoTexto = (estado, diasRestantes) => {
                    switch (estado) {
                      case 'enviado':
                        return 'Enviado';
                      case 'hoy':
                        return 'Se ejecuta hoy';
                      case 'pendiente':
                        return diasRestantes === 1 ? 'Mañana' : `En ${diasRestantes} días`;
                      case 'pasado':
                        return 'No enviado';
                      default:
                        return '';
                    }
                  };
                  
                  const estilo = getEstadoStyle(ejecucion.estado);
                  const fechaFormateada = new Date(ejecucion.fecha_ejecucion + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  });
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        backgroundColor: estilo.bg,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1rem' }}>{estilo.icon}</span>
                        <div>
                          <div style={{ fontWeight: '500', color: estilo.color }}>
                            {ejecucion.nombre}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                            {ejecucion.dias_antes > 0 
                              ? `${ejecucion.dias_antes} días antes del evento`
                              : ejecucion.dias_antes === -1 
                                ? '1 día después del evento'
                                : 'Día del evento'
                            }
                            {' • '}
                            {[
                              ejecucion.enviar_email ? 'Email' : null,
                              ejecucion.enviar_whatsapp ? 'WhatsApp' : null,
                            ].filter(Boolean).join(' + ')}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: estilo.color }}>
                          {fechaFormateada}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          {getEstadoTexto(ejecucion.estado, ejecucion.dias_restantes)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Información financiera */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} color="#10b981" />
            Información Financiera
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total del Evento</div>
              <div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#1f2937' }}>
                {formatearMoneda(parseFloat(evento.total) || 0)}
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Pagado</div>
              <div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#10b981' }}>
                {formatearMoneda(totalPagado)}
              </div>
            </div>
            <div style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Saldo Pendiente</div>
              <div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#f59e0b' }}>
                {formatearMoneda(Math.max(0, (parseFloat(evento.total) || 0) - totalPagado))}
              </div>
            </div>
            {totalPagado > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  Progreso: {((totalPagado / (parseFloat(evento.total) || 1)) * 100).toFixed(1)}%
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, (totalPagado / (parseFloat(evento.total) || 1)) * 100)}%`,
                      height: '100%',
                      backgroundColor: '#10b981',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan y Productos Adicionales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Plan */}
        {evento.nombre_plan || evento.plan_id ? (
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="#6366f1" />
              Plan
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Nombre del Plan</div>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{evento.nombre_plan || '-'}</div>
              </div>
              {evento.precio_plan !== undefined && evento.precio_plan !== null && (
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Precio del Plan</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#6366f1' }}>
                    {formatearMoneda(parseFloat(evento.precio_plan) || 0)}
                  </div>
                </div>
              )}
              {evento.plan_incluye && (
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Consideraciones del Plan
                  </div>
                  <div style={{ fontWeight: '500', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {evento.plan_incluye}
                  </div>
                </div>
              )}
              <div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Productos y servicios del plan
                </div>
                {cargandoProductosPlan ? (
                  <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Cargando...</div>
                ) : productosPlan.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    No hay productos asociados al plan.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>
                            Producto
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>
                            Cantidad
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>
                            Precio Unit.
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosPlan.map((item, index) => {
                          const cantidad = parseFloat(item.cantidad || 0);
                          const precio = parseFloat(item.precio || 0);
                          return (
                            <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                                {item.nombre_producto || '-'}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#374151' }}>
                                {cantidad}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.85rem', color: '#374151' }}>
                                {formatearMoneda(precio)}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
                                {formatearMoneda(cantidad * precio)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Servicios del Evento */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="#6366f1" />
              Servicios del evento
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {puedeCrearServicioPersonalizado && !eventoFinalizado && (
                <button
                  type="button"
                  onClick={() => setMostrarModalServicioPersonalizado(true)}
                  disabled={eventoFinalizado}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: eventoFinalizado ? '#9ca3af' : '#10b981',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: eventoFinalizado ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.8rem',
                  }}
                >
                  + Agregar servicio
                </button>
              )}
              {puedeGenerarServicios && evento?.plan_id && !eventoFinalizado && (
                <button
                  type="button"
                  onClick={handleGenerarServicios}
                  disabled={eventoFinalizado || generandoServicios}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: eventoFinalizado ? '#9ca3af' : '#6366f1',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: eventoFinalizado || generandoServicios ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.8rem',
                  }}
                >
                  {generandoServicios ? 'Generando...' : 'Generar servicios'}
                </button>
              )}
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
              Avance: {progresoServicios}%
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progresoServicios}%`,
                  height: '100%',
                  backgroundColor: progresoServicios >= 100 ? '#10b981' : '#6366f1',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>

          {cargandoServiciosEvento ? (
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Cargando servicios...</div>
          ) : serviciosEvento.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              No hay servicios configurados para este evento.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {serviciosEvento
                .filter((servicio) => !servicio.descartado) // Filtrar servicios descartados
                .map((servicio) => (
                <div
                  key={servicio.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb',
                    backgroundColor: servicio.completado ? '#ecfdf5' : '#f9fafb',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!servicio.completado}
                    disabled={!puedeActualizarServicios || eventoFinalizado || actualizandoServicioId === servicio.id}
                    onChange={(e) => handleActualizarServicio(servicio.id, e.target.checked)}
                    style={{ width: '1rem', height: '1rem', cursor: puedeActualizarServicios && !eventoFinalizado ? 'pointer' : 'default' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: servicio.completado ? '#10b981' : '#374151', flex: 1 }}>
                    {servicio.nombre}
                    {servicio.plan_servicio_id === null && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6366f1', fontStyle: 'italic' }}>
                        (Personalizado)
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {/* Botón eliminar solo para servicios personalizados */}
                    {servicio.plan_servicio_id === null && puedeCrearServicioPersonalizado && !eventoFinalizado && (
                      <button
                        type="button"
                        onClick={() => handleEliminarServicioPersonalizado(servicio.id)}
                        disabled={eliminandoServicioPersonalizado === servicio.id}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: eliminandoServicioPersonalizado === servicio.id ? '#9ca3af' : '#ef4444',
                          color: 'white',
                          borderRadius: '0.25rem',
                          border: 'none',
                          cursor: eliminandoServicioPersonalizado === servicio.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem',
                        }}
                        title="Eliminar servicio personalizado"
                      >
                        {eliminandoServicioPersonalizado === servicio.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    )}
                    {/* Botón descartar solo para servicios del plan */}
                    {servicio.plan_servicio_id !== null && puedeDescartarServicios && !eventoFinalizado && (
                      <button
                        type="button"
                        onClick={() => handleDescartarServicio(servicio.id, true)}
                        disabled={actualizandoServicioId === servicio.id}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '0.25rem',
                          border: 'none',
                          cursor: actualizandoServicioId === servicio.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem',
                        }}
                        title="Descartar servicio"
                      >
                        Descartar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {/* Mostrar servicios descartados con opción de reactivar */}
              {serviciosEvento.filter((servicio) => servicio.descartado).length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Servicios descartados ({serviciosEvento.filter((s) => s.descartado).length})
                  </div>
                  {serviciosEvento
                    .filter((servicio) => servicio.descartado)
                    .map((servicio) => (
                      <div
                        key={servicio.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#fef2f2',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                          {servicio.nombre}
                        </span>
                        {puedeDescartarServicios && !eventoFinalizado && (
                          <button
                            type="button"
                            onClick={() => handleDescartarServicio(servicio.id, false)}
                            disabled={actualizandoServicioId === servicio.id}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: actualizandoServicioId === servicio.id ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                            }}
                            title="Reactivar servicio"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
              {!puedeActualizarServicios && (
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  No tienes permisos para actualizar los servicios.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Observaciones */}
        {evento.observaciones ? (
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#6366f1" />
              Observaciones
            </h2>
            <div style={{ color: '#374151', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {evento.observaciones}
            </div>
          </div>
        ) : null}
      </div>

      {/* Confirmaciones de Opciones del Cliente */}
      {evento?.id_evento && (
        <EventoConfirmaciones
          eventoId={evento.id_evento}
          puedeEditar={puedeAgregarProducto && !eventoFinalizado}
          compacto={true}
        />
      )}

      {/* Productos Adicionales */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="#6366f1" />
            Productos Adicionales
          </h2>
          {puedeAgregarProducto && !eventoFinalizado && (
            <button
              type="button"
              onClick={abrirAdicionalesEvento}
              disabled={eventoFinalizado}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: eventoFinalizado ? '#9ca3af' : '#6366f1',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: eventoFinalizado ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              Agregar adicionales
            </button>
          )}
        </div>
        {productosAdicionales.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '1.5rem' }}>
            No hay productos adicionales registrados
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Producto</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Cantidad</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Precio Unit.</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Subtotal</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosAdicionales.map((producto, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {producto.nombre_producto || producto.nombre || '-'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#374151' }}>
                      {producto.cantidad || 0}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#374151' }}>
                      {formatearMoneda(parseFloat(producto.precio_unitario || producto.precio || 0))}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      {formatearMoneda(parseFloat(producto.subtotal || 0))}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {puedeEliminarProducto && !eventoFinalizado && (
                        <button
                          type="button"
                          onClick={() => abrirModalEliminarProducto(producto)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.25rem',
                          }}
                          title="Eliminar producto"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                  <td colSpan="4" style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Total Productos:
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#6366f1' }}>
                    {formatearMoneda(
                      productosAdicionales.reduce((sum, p) => sum + (parseFloat(p.subtotal || 0)), 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Información de Finalización - Solo visible si el evento está completado */}
      {evento.estado === 'completado' && (
        <div
          style={{
            backgroundColor: 'white',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginTop: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', marginBottom: '1.25rem' }}>
            <Check size={20} />
            Información de Finalización
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {/* Observaciones de finalización */}
            <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Observaciones de Finalización</div>
              <div style={{ 
                fontWeight: '500', 
                fontSize: '0.95rem', 
                backgroundColor: '#f9fafb', 
                padding: '0.75rem', 
                borderRadius: '0.375rem',
                minHeight: '60px',
              }}>
                {infoFinalizacion?.observacion_finalizacion || evento.observacion_finalizacion || 'Sin observaciones registradas'}
              </div>
            </div>

            {/* Fecha de finalización */}
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Fecha de Finalización</div>
              <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                {infoFinalizacion?.fecha_finalizacion || evento.fecha_finalizacion 
                  ? new Date(infoFinalizacion?.fecha_finalizacion || evento.fecha_finalizacion).toLocaleString('es-EC')
                  : 'No registrada'}
              </div>
            </div>

            {/* Calificación del cliente */}
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Calificación del Cliente</div>
              {evento.calificacion_cliente ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {'⭐'.repeat(evento.calificacion_cliente)}
                  </span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: evento.calificacion_cliente >= 4 ? '#16a34a' : evento.calificacion_cliente >= 3 ? '#f59e0b' : '#dc2626'
                  }}>
                    {evento.calificacion_cliente}/5
                  </span>
                </div>
              ) : (
                <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                  Pendiente de calificación
                </div>
              )}
            </div>
          </div>

          {/* Observaciones de la calificación */}
          {evento.observaciones_calificacion && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: evento.calificacion_cliente < 5 ? '#fef3c7' : '#ecfdf5',
              borderRadius: '0.375rem',
              border: `1px solid ${evento.calificacion_cliente < 5 ? '#fcd34d' : '#6ee7b7'}`,
            }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                💬 Comentarios del cliente
              </div>
              <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#374151' }}>
                {evento.observaciones_calificacion}
              </div>
            </div>
          )}

          {/* Sección de Daños */}
          {(infoFinalizacion?.tiene_danos || evento.tiene_danos) && (() => {
            const costoDanos = parseFloat(evento.costo_danos || 0);
            const montoPagadoDanos = parseFloat(evento.monto_pagado_danos || 0);
            const saldoDanos = costoDanos - montoPagadoDanos;
            const cobrarDanos = evento.cobrar_danos;
            const danosPagados = evento.danos_pagados;
            
            return (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                backgroundColor: danosPagados ? '#ecfdf5' : '#fef2f2', 
                borderRadius: '0.5rem',
                border: `1px solid ${danosPagados ? '#6ee7b7' : '#fecaca'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: danosPagados ? '#16a34a' : '#dc2626', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    {danosPagados ? '✅' : '⚠️'} Registro de Daños
                    {danosPagados && <span style={{ fontSize: '0.75rem', backgroundColor: '#16a34a', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>PAGADO</span>}
                    {cobrarDanos && !danosPagados && <span style={{ fontSize: '0.75rem', backgroundColor: '#f59e0b', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>PENDIENTE</span>}
                  </h3>
                  
                  {cobrarDanos && !danosPagados && saldoDanos > 0 && (
                    <button
                      onClick={abrirModalPagoDanos}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      💰 Registrar Pago de Daños
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Costo Total</div>
                    <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#dc2626' }}>
                      {formatearMoneda(costoDanos)}
                    </div>
                  </div>
                  
                  {cobrarDanos && (
                    <>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Pagado</div>
                        <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#16a34a' }}>
                          {formatearMoneda(montoPagadoDanos)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Saldo Pendiente</div>
                        <div style={{ fontWeight: '700', fontSize: '1.25rem', color: saldoDanos > 0 ? '#f59e0b' : '#16a34a' }}>
                          {formatearMoneda(Math.max(0, saldoDanos))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>¿Se cobra al cliente?</div>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '0.95rem',
                      color: cobrarDanos ? '#16a34a' : '#6b7280',
                    }}>
                      {cobrarDanos ? '✓ Sí, se cobra' : '✗ No (asumido por empresa)'}
                    </div>
                  </div>
                </div>

                {/* Info de pago si ya se pagó */}
                {danosPagados && evento.fecha_pago_danos && (
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '0.75rem', 
                    borderRadius: '0.375rem', 
                    marginBottom: '1rem',
                    border: '1px solid #6ee7b7',
                  }}>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ color: '#6b7280' }}>Fecha de pago: </span>
                        <span style={{ fontWeight: '500' }}>{new Date(evento.fecha_pago_danos).toLocaleString('es-EC')}</span>
                      </div>
                      {evento.metodo_pago_danos && (
                        <div>
                          <span style={{ color: '#6b7280' }}>Método: </span>
                          <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{evento.metodo_pago_danos}</span>
                        </div>
                      )}
                    </div>
                    {evento.observaciones_pago_danos && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        <span style={{ color: '#6b7280' }}>Observaciones: </span>
                        <span>{evento.observaciones_pago_danos}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.35rem' }}>Descripción de los Daños</div>
                  <div style={{ 
                    fontWeight: '500', 
                    fontSize: '0.9rem', 
                    backgroundColor: 'white', 
                    padding: '0.75rem', 
                    borderRadius: '0.375rem',
                    border: `1px solid ${danosPagados ? '#6ee7b7' : '#fecaca'}`,
                  }}>
                    {evento.descripcion_danos || 'Sin descripción'}
                  </div>
                </div>

                {/* Lista de daños detallados si existen */}
                {danosEvento.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Detalle de Daños Registrados</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {danosEvento.map((dano, idx) => (
                        <div key={dano.id || idx} style={{ 
                          backgroundColor: 'white', 
                          padding: '0.75rem', 
                          borderRadius: '0.375rem',
                          border: `1px solid ${danosPagados ? '#6ee7b7' : '#fecaca'}`,
                          fontSize: '0.875rem',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '500' }}>{dano.item_danado || dano.descripcion}</span>
                            <span style={{ color: '#dc2626', fontWeight: '600' }}>
                              {formatearMoneda(parseFloat(dano.costo_total) || 0)}
                            </span>
                          </div>
                          {dano.observaciones && (
                            <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                              {dano.observaciones}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Pagos */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginTop: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Pagos</h2>
          {puedeRegistrarPago && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Solo mostrar botón de pago si hay saldo pendiente y el evento no está finalizado */}
              {saldoPendiente > 0 && !eventoFinalizado && (
                <button
                  onClick={() => {
                    setFormPago((prev) => ({ ...prev, tipo_pago: 'abono' }));
                    setMostrarModalPago(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#059669')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#10b981')}
                >
                  <DollarSign size={16} />
                  Registrar Pago
                </button>
              )}
              {puedeReembolsar && !eventoFinalizado && (
                <button
                  onClick={() => {
                    if (saldoPorReembolsar <= 0) {
                      setError('No hay saldo disponible para reembolsar.');
                      return;
                    }
                    setFormPago((prev) => ({ ...prev, tipo_pago: 'reembolso', monto: saldoPorReembolsar || '' }));
                    setMostrarModalPago(true);
                  }}
                  disabled={saldoPorReembolsar <= 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    backgroundColor: saldoPorReembolsar <= 0 ? '#fca5a5' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: saldoPorReembolsar <= 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <DollarSign size={16} />
                  Registrar reembolso
                </button>
              )}
            </div>
          )}
        </div>
        {pagos.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No hay pagos registrados
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    ID
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Fecha
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Tipo
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Método
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Cuenta
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Estado
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Referencia
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Observación
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Monto
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Origen
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>#{pago.id}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{formatearFechaHora(pago.fecha_pago)}</td>
                    <td style={{ padding: '0.75rem' }}>{pago.tipo_pago || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{pago.metodo_pago || '-'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#4f46e5', fontWeight: '500' }}>
                      {pago.nombre_cuenta || '-'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...obtenerEstiloEstadoPago(pago.estado_pago),
                        }}
                      >
                        {obtenerLabelEstadoPago(pago.estado_pago)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{pago.numero_referencia || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{pago.observaciones || '-'}</td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontWeight: '500',
                        color: pago.tipo_pago === 'reembolso' ? '#ef4444' : '#10b981',
                      }}
                    >
                      {pago.tipo_pago === 'reembolso' ? '-' : '+'}
                      {formatearMoneda(pago.monto || 0)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor:
                            pago.origen === 'web'
                              ? '#dbeafe'
                              : pago.origen === 'whatsapp'
                                ? '#dcfce7'
                                : '#f3f4f6',
                          color:
                            pago.origen === 'web'
                              ? '#1e40af'
                              : pago.origen === 'whatsapp'
                                ? '#166534'
                                : '#374151',
                        }}
                      >
                        {pago.origen === 'web'
                          ? 'Web'
                          : pago.origen === 'whatsapp'
                            ? 'WhatsApp'
                            : 'Escritorio'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => abrirDetallePago(pago)}
                          style={{
                            padding: '0.35rem 0.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        {puedeReembolsar && (
                          <button
                            onClick={() => {
                              if (pago.tipo_pago === 'reembolso' || pago.estado_pago !== 'aprobado') return;
                              if (saldoPorReembolsar <= 0) {
                                setError('No hay saldo disponible para reembolsar.');
                                return;
                              }
                              setFormPago((prev) => ({
                                ...prev,
                                tipo_pago: 'reembolso',
                                monto: Math.min(parseFloat(pago.monto || 0), saldoPorReembolsar),
                                metodo_pago: prev.metodo_pago || 'efectivo',
                                fecha_pago: new Date().toISOString().split('T')[0],
                              }));
                              setMostrarModalPago(true);
                            }}
                            disabled={pago.tipo_pago === 'reembolso' || pago.estado_pago !== 'aprobado' || saldoPorReembolsar <= 0}
                            style={{
                              padding: '0.35rem 0.5rem',
                              backgroundColor:
                                pago.tipo_pago === 'reembolso' || pago.estado_pago !== 'aprobado' || saldoPorReembolsar <= 0
                                  ? '#fca5a5'
                                  : '#ef4444',
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor:
                                pago.tipo_pago === 'reembolso' || pago.estado_pago !== 'aprobado' || saldoPorReembolsar <= 0
                                  ? 'not-allowed'
                                  : 'pointer',
                            }}
                            title="Registrar reembolso"
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                        {pago.estado_pago === 'en_revision' && (
                          <>
                            <button
                              onClick={() => solicitarConfirmacionEstadoPago(pago, 'aprobado')}
                              disabled={!puedeAprobarPago}
                              style={{
                                padding: '0.35rem 0.5rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: puedeAprobarPago ? 'pointer' : 'not-allowed',
                                opacity: puedeAprobarPago ? 1 : 0.6,
                              }}
                              title="Aprobar pago"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => solicitarConfirmacionEstadoPago(pago, 'rechazado')}
                              disabled={!puedeAnularPago}
                              style={{
                                padding: '0.35rem 0.5rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: puedeAnularPago ? 'pointer' : 'not-allowed',
                                opacity: puedeAnularPago ? 1 : 0.6,
                              }}
                              title="Anular pago"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para registrar pago */}
      {mostrarModalPago && puedeRegistrarPago && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !guardandoPago && setMostrarModalPago(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {formPago.tipo_pago === 'reembolso' ? 'Registrar Reembolso' : 'Registrar Pago'}
              </h2>
              <button
                onClick={() => setMostrarModalPago(false)}
                disabled={guardandoPago}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: guardandoPago ? 'not-allowed' : 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegistrarPago}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                  }}
                >
                  {puedeNotificarPago
                    ? 'Al registrar este pago se enviara una notificacion automatica al cliente.'
                    : 'Este evento no tiene email/telefono registrado, por lo que no se enviara notificacion.'}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Monto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPago.monto}
                    onChange={handleMontoChangePago}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Tipo de Pago <span style={{ color: '#6b7280', fontWeight: '400', fontSize: '0.75rem' }}>(automático)</span>
                  </label>
                  <div
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      backgroundColor: formPago.tipo_pago === 'reembolso' ? '#fef2f2' : formPago.tipo_pago === 'pago_completo' ? '#f0fdf4' : '#eff6ff',
                      color: formPago.tipo_pago === 'reembolso' ? '#dc2626' : formPago.tipo_pago === 'pago_completo' ? '#16a34a' : '#2563eb',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      {formPago.tipo_pago === 'abono' ? 'Abono' : formPago.tipo_pago === 'pago_completo' ? 'Pago Completo' : 'Reembolso'}
                    </span>
                    {formPago.tipo_pago !== 'reembolso' && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '400' }}>
                        Saldo: ${saldoPendiente.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  {formPago.tipo_pago === 'pago_completo' && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#16a34a' }}>
                      El monto cubre el saldo pendiente del evento.
                    </div>
                  )}
                  {formPago.tipo_pago === 'reembolso' && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>
                      Este reembolso se descontará del total pagado y requiere confirmación.
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Método de Pago *
                  </label>
                  <select
                    required
                    value={formPago.metodo_pago}
                    onChange={(e) => setFormPago({ ...formPago, metodo_pago: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="cheque">Cheque</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Fecha de Pago *
                  </label>
                  <input
                    type="date"
                    required
                    value={formPago.fecha_pago}
                    onChange={(e) => setFormPago({ ...formPago, fecha_pago: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Número de Referencia
                  </label>
                  <input
                    type="text"
                    value={formPago.numero_referencia}
                    onChange={(e) => setFormPago({ ...formPago, numero_referencia: e.target.value })}
                    placeholder="Opcional"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Observaciones
                  </label>
                  <textarea
                    value={formPago.observaciones}
                    onChange={(e) => setFormPago({ ...formPago, observaciones: e.target.value })}
                    placeholder="Opcional"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMostrarModalPago(false)}
                  disabled={guardandoPago}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: guardandoPago ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPago}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: guardandoPago ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: guardandoPago ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  {guardandoPago
                    ? 'Guardando...'
                    : formPago.tipo_pago === 'reembolso'
                    ? 'Registrar Reembolso'
                    : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle pago */}
      {mostrarModalPagoDetalle && pagoDetalle && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => setMostrarModalPagoDetalle(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Detalle del pago</h2>
              <button
                onClick={() => setMostrarModalPagoDetalle(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div><strong>ID:</strong> {pagoDetalle.id}</div>
              <div><strong>Fecha:</strong> {formatearFecha(pagoDetalle.fecha_pago)}</div>
              <div><strong>Tipo:</strong> {pagoDetalle.tipo_pago || '-'}</div>
              <div><strong>Método:</strong> {pagoDetalle.metodo_pago || '-'}</div>
              <div><strong>Estado:</strong> {obtenerLabelEstadoPago(pagoDetalle.estado_pago)}</div>
              <div><strong>Referencia:</strong> {pagoDetalle.numero_referencia || '-'}</div>
              <div><strong>Observación:</strong> {pagoDetalle.observaciones || '-'}</div>
              <div><strong>Monto:</strong> {formatearMoneda(pagoDetalle.monto || 0)}</div>
              <div><strong>Origen:</strong> {pagoDetalle.origen || '-'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación aprobar/anular pago */}
      {confirmacionPago && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem',
          }}
          onClick={() => setConfirmacionPago(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              {confirmacionPago.nuevoEstado === 'aprobado' ? 'Aprobar pago' : 'Anular pago'}
            </h2>
            <div style={{ color: '#374151', marginBottom: '0.5rem' }}>
              Vas a {confirmacionPago.nuevoEstado === 'aprobado' ? 'aprobar' : 'anular'} el pago de{' '}
              {formatearMoneda(confirmacionPago.pago.monto || 0)}.
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
              Método: {confirmacionPago.pago.metodo_pago || '-'} · Fecha: {formatearFecha(confirmacionPago.pago.fecha_pago)}
            </div>

            {/* Selector de cuenta destino - solo para aprobación */}
            {confirmacionPago.nuevoEstado === 'aprobado' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  <Landmark size={18} color="#4f46e5" />
                  Cuenta Destino <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={cuentaAprobacion}
                  onChange={(e) => setCuentaAprobacion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    backgroundColor: 'white',
                  }}
                >
                  <option value="">Seleccionar cuenta...</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre} {cuenta.numero_cuenta ? `- ${cuenta.numero_cuenta}` : ''}
                    </option>
                  ))}
                </select>
                {!cuentaAprobacion && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    Seleccione la cuenta donde se registrará este pago
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setConfirmacionPago(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCambioEstadoPago}
                disabled={confirmacionPago.nuevoEstado === 'aprobado' && !cuentaAprobacion}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: (confirmacionPago.nuevoEstado === 'aprobado' && !cuentaAprobacion) 
                    ? '#9ca3af' 
                    : confirmacionPago.nuevoEstado === 'aprobado' ? '#10b981' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: (confirmacionPago.nuevoEstado === 'aprobado' && !cuentaAprobacion) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de reembolso */}
      {mostrarConfirmReembolso && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => !guardandoPago && setMostrarConfirmReembolso(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>Confirmar reembolso</h2>
            <div style={{ color: '#374151', marginBottom: '0.5rem' }}>
              Estás a punto de registrar un reembolso de {formatearMoneda(formPago.monto || 0)}.
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Disponible para reembolsar: {formatearMoneda(saldoPorReembolsar)}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMostrarConfirmReembolso(false)}
                disabled={guardandoPago}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: guardandoPago ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMostrarConfirmReembolso(false);
                  await registrarPago(true);
                }}
                disabled={guardandoPago}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: guardandoPago ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Confirmar reembolso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar producto adicional */}
      {mostrarModalProducto && puedeAgregarProducto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !agregandoProducto && setMostrarModalProducto(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Agregar producto adicional</h2>
              <button
                onClick={() => setMostrarModalProducto(false)}
                disabled={agregandoProducto}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: agregandoProducto ? 'not-allowed' : 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Producto *
                </label>
                <select
                  value={formProducto.producto_id}
                  onChange={(e) => setFormProducto({ ...formProducto, producto_id: e.target.value })}
                  disabled={cargandoProductosDisponibles || agregandoProducto}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                >
                  <option value="">
                    {cargandoProductosDisponibles ? 'Cargando productos...' : 'Selecciona un producto'}
                  </option>
                  {productosDisponibles.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} {producto.precio ? `- ${formatearMoneda(producto.precio)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formProducto.cantidad}
                  onChange={(e) => setFormProducto({ ...formProducto, cantidad: e.target.value })}
                  disabled={agregandoProducto}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
            </div>

            {errorProducto && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                {errorProducto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMostrarModalProducto(false)}
                disabled={agregandoProducto}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: agregandoProducto ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAgregarProducto}
                disabled={agregandoProducto}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: agregandoProducto ? '#93c5fd' : '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: agregandoProducto ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {agregandoProducto ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar producto adicional */}
      {mostrarModalEliminarProducto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !eliminandoProducto && setMostrarModalEliminarProducto(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Eliminar producto</h2>
              <button
                onClick={() => setMostrarModalEliminarProducto(false)}
                disabled={eliminandoProducto}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: eliminandoProducto ? 'not-allowed' : 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', color: '#374151' }}>
              {productoEliminar?.nombre_producto || productoEliminar?.nombre || 'Producto'}
            </div>

            <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Observación *
            </div>
            <textarea
              value={observacionEliminar}
              onChange={(e) => {
                setObservacionEliminar(e.target.value);
                if (errorEliminarProducto) {
                  setErrorEliminarProducto('');
                }
              }}
              placeholder="Describe el motivo de la eliminación"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.95rem',
                resize: 'vertical',
              }}
            />
            {errorEliminarProducto && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {errorEliminarProducto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMostrarModalEliminarProducto(false)}
                disabled={eliminandoProducto}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: eliminandoProducto ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarProducto}
                disabled={eliminandoProducto}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: eliminandoProducto ? '#fca5a5' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: eliminandoProducto ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {eliminandoProducto ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para calificación manual */}
      {mostrarModalCalificacionManual && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: isMobile ? '1rem' : '0',
          }}
          onClick={cerrarModalCalificacionManual}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: isMobile ? '1.25rem' : '1.5rem',
              width: '100%',
              maxWidth: '450px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⭐ Registrar Calificación
              </h2>
              <button
                onClick={cerrarModalCalificacionManual}
                disabled={guardandoCalificacion}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                Seleccione la calificación del cliente
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormCalificacion({ ...formCalificacion, calificacion: num })}
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.5rem',
                      border: formCalificacion.calificacion === num ? '3px solid #f59e0b' : '1px solid #d1d5db',
                      backgroundColor: formCalificacion.calificacion >= num ? '#fef3c7' : 'white',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {formCalificacion.calificacion >= num ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', fontWeight: '600', color: '#f59e0b' }}>
                {formCalificacion.calificacion === 5 && 'Excelente'}
                {formCalificacion.calificacion === 4 && 'Muy Bueno'}
                {formCalificacion.calificacion === 3 && 'Bueno'}
                {formCalificacion.calificacion === 2 && 'Regular'}
                {formCalificacion.calificacion === 1 && 'Malo'}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                Observaciones del cliente {formCalificacion.calificacion < 5 && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
              <textarea
                value={formCalificacion.observaciones}
                onChange={(e) => setFormCalificacion({ ...formCalificacion, observaciones: e.target.value })}
                placeholder={formCalificacion.calificacion < 5 ? 'Ingrese los comentarios del cliente...' : 'Comentarios opcionales...'}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                }}
              />
              {formCalificacion.calificacion < 5 && !formCalificacion.observaciones && (
                <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Se requieren observaciones para calificaciones menores a 5
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={cerrarModalCalificacionManual}
                disabled={guardandoCalificacion}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarCalificacion}
                disabled={guardandoCalificacion || (formCalificacion.calificacion < 5 && !formCalificacion.observaciones.trim())}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: guardandoCalificacion ? '#9ca3af' : '#6366f1',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: guardandoCalificacion || (formCalificacion.calificacion < 5 && !formCalificacion.observaciones.trim()) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {guardandoCalificacion ? 'Guardando...' : '⭐ Guardar Calificación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para registrar pago de daños */}
      {mostrarModalPagoDanos && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: isMobile ? '1rem' : '0',
          }}
          onClick={cerrarModalPagoDanos}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: isMobile ? '1.25rem' : '1.5rem',
              width: '100%',
              maxWidth: '450px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💰 Registrar Pago de Daños
              </h2>
              <button
                onClick={cerrarModalPagoDanos}
                disabled={registrandoPagoDanos}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#6b7280' }}>Costo total de daños:</span>
                <span style={{ fontWeight: '600', color: '#dc2626' }}>{formatearMoneda(parseFloat(evento?.costo_danos || 0))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                <span style={{ color: '#6b7280' }}>Ya pagado:</span>
                <span style={{ fontWeight: '600', color: '#16a34a' }}>{formatearMoneda(parseFloat(evento?.monto_pagado_danos || 0))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fecaca' }}>
                <span style={{ fontWeight: '500' }}>Saldo pendiente:</span>
                <span style={{ fontWeight: '700', color: '#f59e0b' }}>
                  {formatearMoneda(Math.max(0, parseFloat(evento?.costo_danos || 0) - parseFloat(evento?.monto_pagado_danos || 0)))}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Monto a pagar *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formPagoDanos.monto}
                  onChange={(e) => setFormPagoDanos({ ...formPagoDanos, monto: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Método de pago
                </label>
                <select
                  value={formPagoDanos.metodo_pago}
                  onChange={(e) => setFormPagoDanos({ ...formPagoDanos, metodo_pago: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Observaciones (opcional)
                </label>
                <textarea
                  value={formPagoDanos.observaciones}
                  onChange={(e) => setFormPagoDanos({ ...formPagoDanos, observaciones: e.target.value })}
                  placeholder="Notas adicionales sobre el pago..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={cerrarModalPagoDanos}
                disabled={registrandoPagoDanos}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegistrarPagoDanos}
                disabled={registrandoPagoDanos || !formPagoDanos.monto}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: registrandoPagoDanos ? '#9ca3af' : '#10b981',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: registrandoPagoDanos ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {registrandoPagoDanos ? 'Registrando...' : '💰 Registrar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para finalizar evento con observaciones y daños */}
      {mostrarModalFinalizar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: isMobile ? '1rem' : '0',
          }}
          onClick={cerrarModalFinalizar}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: isMobile ? '1.25rem' : '1.5rem',
              width: '100%',
              maxWidth: '560px',
              maxHeight: isMobile ? '90vh' : '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={24} />
                Finalizar Evento
              </h2>
              <button
                onClick={cerrarModalFinalizar}
                disabled={finalizandoEvento}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                Al finalizar el evento, se marcará como <strong>completado</strong> y se enviará una notificación al cliente solicitando su valoración.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Observación de finalización */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Observaciones de finalización
                </label>
                <textarea
                  value={formFinalizacion.observacion_finalizacion}
                  onChange={(e) => setFormFinalizacion({ ...formFinalizacion, observacion_finalizacion: e.target.value })}
                  placeholder="Ingrese observaciones generales sobre cómo se desarrolló el evento..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Checkbox de daños */}
              <div style={{ 
                padding: '1rem', 
                backgroundColor: formFinalizacion.tiene_danos ? '#fef2f2' : '#f9fafb', 
                borderRadius: '0.5rem',
                border: formFinalizacion.tiene_danos ? '1px solid #fecaca' : '1px solid #e5e7eb',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formFinalizacion.tiene_danos}
                    onChange={(e) => setFormFinalizacion({ 
                      ...formFinalizacion, 
                      tiene_danos: e.target.checked,
                      descripcion_danos: e.target.checked ? formFinalizacion.descripcion_danos : '',
                      costo_danos: e.target.checked ? formFinalizacion.costo_danos : '',
                      cobrar_danos: e.target.checked ? formFinalizacion.cobrar_danos : false,
                    })}
                    style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                  />
                  <span style={{ fontWeight: '600', color: formFinalizacion.tiene_danos ? '#dc2626' : '#374151' }}>
                    Hubo daños durante el evento
                  </span>
                </label>

                {/* Campos de daños (condicionales) */}
                {formFinalizacion.tiene_danos && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500', fontSize: '0.8rem', color: '#6b7280' }}>
                        Descripción de los daños *
                      </label>
                      <textarea
                        value={formFinalizacion.descripcion_danos}
                        onChange={(e) => setFormFinalizacion({ ...formFinalizacion, descripcion_danos: e.target.value })}
                        placeholder="Describa detalladamente los daños ocasionados (ej: Silla rota, mantel manchado, etc.)"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          border: '1px solid #fecaca',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          resize: 'vertical',
                          backgroundColor: 'white',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500', fontSize: '0.8rem', color: '#6b7280' }}>
                          Costo de los daños ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formFinalizacion.costo_danos}
                          onChange={(e) => setFormFinalizacion({ ...formFinalizacion, costo_danos: e.target.value })}
                          placeholder="0.00"
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            border: '1px solid #fecaca',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: 'white',
                          }}
                        />
                      </div>
                    </div>

                    {/* Checkbox cobrar al cliente */}
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: 'pointer',
                      padding: '0.75rem',
                      backgroundColor: formFinalizacion.cobrar_danos ? '#dcfce7' : 'white',
                      borderRadius: '0.375rem',
                      border: formFinalizacion.cobrar_danos ? '1px solid #86efac' : '1px solid #e5e7eb',
                    }}>
                      <input
                        type="checkbox"
                        checked={formFinalizacion.cobrar_danos}
                        onChange={(e) => setFormFinalizacion({ ...formFinalizacion, cobrar_danos: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: '#16a34a' }}
                      />
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>Cobrar al cliente</span>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>
                          Se agregará un cargo adicional al evento por el monto especificado
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={cerrarModalFinalizar}
                disabled={finalizandoEvento}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinalizarEvento}
                disabled={finalizandoEvento || (formFinalizacion.tiene_danos && !formFinalizacion.descripcion_danos.trim())}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: finalizandoEvento ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: finalizandoEvento ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {finalizandoEvento ? 'Finalizando...' : (
                  <>
                    <Check size={18} />
                    Finalizar evento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar evento */}
      {mostrarModalEliminarEvento && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !eliminandoEvento && setMostrarModalEliminarEvento(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Eliminar evento</h2>
              <button
                onClick={() => setMostrarModalEliminarEvento(false)}
                disabled={eliminandoEvento}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: eliminandoEvento ? 'not-allowed' : 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ color: '#374151', marginBottom: '0.75rem' }}>
              ¿Está seguro de eliminar este evento? Esta acción no se puede deshacer.
            </div>

            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Total pagado: {formatearMoneda(totalPagado)} · Total reembolsos: {formatearMoneda(totalReembolsos)}
            </div>
            {saldoPorReembolsar > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
                Debes reembolsar {formatearMoneda(saldoPorReembolsar)} antes de eliminar.
              </div>
            )}
            {errorEliminarEvento && (
              <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
                {errorEliminarEvento}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMostrarModalEliminarEvento(false)}
                disabled={eliminandoEvento}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: eliminandoEvento ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminarEvento}
                disabled={eliminandoEvento || saldoPorReembolsar > 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: eliminandoEvento || saldoPorReembolsar > 0 ? '#fca5a5' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: eliminandoEvento || saldoPorReembolsar > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {eliminandoEvento ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalServicioPersonalizado && puedeCrearServicioPersonalizado && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => {
            setMostrarModalServicioPersonalizado(false);
            setFormServicioPersonalizado({ nombre: '' });
            setErrorServicioPersonalizado('');
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Agregar servicio personalizado</h2>
              <button
                type="button"
                onClick={() => {
                  setMostrarModalServicioPersonalizado(false);
                  setFormServicioPersonalizado({ nombre: '' });
                  setErrorServicioPersonalizado('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 0,
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Nombre del servicio
              </label>
              <input
                type="text"
                value={formServicioPersonalizado.nombre}
                onChange={(e) => {
                  setFormServicioPersonalizado({ nombre: e.target.value });
                  setErrorServicioPersonalizado('');
                }}
                placeholder="Ej: Confirmar decoración, Revisar iluminación, etc."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCrearServicioPersonalizado();
                  }
                }}
              />
              {errorServicioPersonalizado && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {errorServicioPersonalizado}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setMostrarModalServicioPersonalizado(false);
                  setFormServicioPersonalizado({ nombre: '' });
                  setErrorServicioPersonalizado('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearServicioPersonalizado}
                disabled={creandoServicioPersonalizado || !formServicioPersonalizado.nombre.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: creandoServicioPersonalizado || !formServicioPersonalizado.nombre.trim() ? '#9ca3af' : '#10b981',
                  color: 'white',
                  cursor: creandoServicioPersonalizado || !formServicioPersonalizado.nombre.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {creandoServicioPersonalizado ? 'Creando...' : 'Crear servicio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarPreview && previewRecordatorio && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem',
          }}
          onClick={() => setMostrarPreview(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '860px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{previewRecordatorio.titulo}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                  Vista previa del mensaje que se enviara
                </p>
              </div>
              <button
                onClick={() => setMostrarPreview(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Email</h4>
                <div
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    minHeight: '180px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: previewRecordatorio.email.replace(/\n/g, '<br>'),
                  }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>WhatsApp</h4>
                <div
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    minHeight: '180px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {previewRecordatorio.whatsapp || 'Sin plantilla'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventoDetalle;
