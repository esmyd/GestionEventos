import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { eventosService, pagosService, planesService, productosService, usuariosService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Edit, DollarSign, X, Calendar, User, MapPin, Users, Clock, Package, FileText, Trash2 } from 'lucide-react';
import { hasPermission, PERMISSIONS, ROLES } from '../utils/roles';

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
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
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalEliminarEvento, setMostrarModalEliminarEvento] = useState(false);
  const [eliminandoEvento, setEliminandoEvento] = useState(false);
  const [errorEliminarEvento, setErrorEliminarEvento] = useState('');
  const [mostrarConfirmReembolso, setMostrarConfirmReembolso] = useState(false);
  const [formProducto, setFormProducto] = useState({ producto_id: '', cantidad: '1' });
  const [errorProducto, setErrorProducto] = useState('');
  const [agregandoProducto, setAgregandoProducto] = useState(false);
  const [mostrarModalEliminarProducto, setMostrarModalEliminarProducto] = useState(false);
  const [productoEliminar, setProductoEliminar] = useState(null);
  const [observacionEliminar, setObservacionEliminar] = useState('');
  const [errorEliminarProducto, setErrorEliminarProducto] = useState('');
  const [eliminandoProducto, setEliminandoProducto] = useState(false);
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

  const eventoCancelado = evento?.estado === 'cancelado';
  const puedeAgregarProducto = hasPermission(usuario, PERMISSIONS.EVENTOS_AGREGAR_PRODUCTO, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeActualizarServicios = hasPermission(usuario, PERMISSIONS.EVENTOS_ACTUALIZAR_SERVICIOS, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeDescartarServicios = hasPermission(usuario, PERMISSIONS.EVENTOS_DESCARTAR_SERVICIO, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeGenerarServicios = hasPermission(usuario, PERMISSIONS.EVENTOS_GENERAR_SERVICIOS, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEliminarProducto = hasPermission(usuario, PERMISSIONS.EVENTOS_ELIMINAR_PRODUCTO, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEliminarEvento = hasPermission(usuario, PERMISSIONS.EVENTOS_ELIMINAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeAsignarCoordinador = hasPermission(usuario, PERMISSIONS.EVENTOS_ASIGNAR_COORDINADOR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeRegistrarPago = hasPermission(usuario, PERMISSIONS.PAGOS_REGISTRAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const saldoPorReembolsar = Math.max(0, (parseFloat(totalPagado) || 0) - (parseFloat(totalReembolsos) || 0));

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
    }
  }, [id]);

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
    } catch (err) {
      setError('Error al cargar el evento');
      console.error(err);
    } finally {
      setLoading(false);
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
      setPagos(data.pagos || []);
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
        // Opcional: mostrar mensaje de éxito
        console.log(`Servicios generados exitosamente: ${servicios.length} servicio(s)`);
      }
    } catch (err) {
      console.error('Error al generar servicios:', err);
      const errorMessage = err.response?.data?.error || 'Error al generar servicios';
      setError(errorMessage);
    } finally {
      setGenerandoServicios(false);
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

  const obtenerCreadorEvento = () => {
    if (evento?.creado_por_nombre) return evento.creado_por_nombre;
    if (evento?.nombre_coordinador) return evento.nombre_coordinador;
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
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/eventos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#6366f1',
            border: '1px solid #6366f1',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {evento.nombre_evento || 'Evento'}
            </h1>
            <p style={{ color: '#6b7280' }}>Detalle del evento</p>
          </div>
          {puedeEliminarEvento && (
            <button
              type="button"
              onClick={() => {
                setErrorEliminarEvento('');
                setMostrarModalEliminarEvento(true);
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Eliminar evento
            </button>
          )}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Información del evento */}
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
            <Calendar size={20} color="#6366f1" />
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
            {puedeGenerarServicios && evento?.plan_id && (
              <button
                type="button"
                onClick={handleGenerarServicios}
                disabled={eventoCancelado || generandoServicios}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: eventoCancelado ? '#9ca3af' : '#6366f1',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: eventoCancelado || generandoServicios ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '0.8rem',
                }}
              >
                {generandoServicios ? 'Generando...' : 'Generar servicios'}
              </button>
            )}
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
                    disabled={!puedeActualizarServicios || eventoCancelado || actualizandoServicioId === servicio.id}
                    onChange={(e) => handleActualizarServicio(servicio.id, e.target.checked)}
                    style={{ width: '1rem', height: '1rem', cursor: puedeActualizarServicios && !eventoCancelado ? 'pointer' : 'default' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: servicio.completado ? '#10b981' : '#374151', flex: 1 }}>
                    {servicio.nombre}
                  </span>
                  {puedeDescartarServicios && !eventoCancelado && (
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
                        {puedeDescartarServicios && !eventoCancelado && (
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
          {puedeAgregarProducto && (
            <button
              type="button"
              onClick={abrirAdicionalesEvento}
              disabled={eventoCancelado}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: eventoCancelado ? '#9ca3af' : '#6366f1',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: eventoCancelado ? 'not-allowed' : 'pointer',
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
                      {puedeEliminarProducto && (
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

      {/* Pagos */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Pagos</h2>
          {puedeRegistrarPago && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    Fecha
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Tipo
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Método
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Monto
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Origen
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>{formatearFecha(pago.fecha_pago)}</td>
                    <td style={{ padding: '0.75rem' }}>{pago.tipo_pago || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{pago.metodo_pago || '-'}</td>
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
                          backgroundColor: pago.origen === 'web' ? '#dbeafe' : '#f3f4f6',
                          color: pago.origen === 'web' ? '#1e40af' : '#374151',
                        }}
                      >
                        {pago.origen === 'web' ? 'Web' : 'Escritorio'}
                      </span>
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
                    onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
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
                    Tipo de Pago *
                  </label>
                  <select
                    required
                    value={formPago.tipo_pago}
                    onChange={(e) => setFormPago({ ...formPago, tipo_pago: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="abono">Abono</option>
                    <option value="pago_completo">Pago Completo</option>
                    <option value="reembolso">Reembolso</option>
                  </select>
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
    </div>
  );
};

export default EventoDetalle;
