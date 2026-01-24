import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pagosService, eventosService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import useIsMobile from '../hooks/useIsMobile';
import ToastContainer from '../components/ToastContainer';
import { ArrowLeft, Search, DollarSign, Eye, X, Save, FileText } from 'lucide-react';
import { hasPermission, PERMISSIONS, ROLES } from '../utils/roles';

const PagosEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const isMobile = useIsMobile();
  const [pagos, setPagos] = useState([]);
  const [evento, setEvento] = useState(null);
  const [totalPagado, setTotalPagado] = useState(0);
  const [totalReembolsosEvento, setTotalReembolsosEvento] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busquedaPago, setBusquedaPago] = useState('');
  const [filtroTipoPago, setFiltroTipoPago] = useState('todos');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroMontoMin, setFiltroMontoMin] = useState('');
  const [filtroMontoMax, setFiltroMontoMax] = useState('');
  const [ordenPagos, setOrdenPagos] = useState('id_desc');

  // Estados para modales
  const [mostrarModalRegistrar, setMostrarModalRegistrar] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarConfirmReembolso, setMostrarConfirmReembolso] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  // Estados para formulario
  const [formData, setFormData] = useState({
    evento_id: '',
    monto: '',
    metodo_pago: 'efectivo',
    tipo_pago: 'abono',
    fecha_pago: new Date().toISOString().split('T')[0],
    numero_referencia: '',
    observaciones: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  // Verificar permisos
  const puedeRegistrar = hasPermission(
    usuario,
    PERMISSIONS.PAGOS_REGISTRAR,
    [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]
  );
  const puedeReembolsar = hasPermission(
    usuario,
    PERMISSIONS.PAGOS_REEMBOLSAR,
    [ROLES.ADMIN, ROLES.MANAGER]
  );
  const puedeAgregarAdicionales = hasPermission(
    usuario,
    PERMISSIONS.EVENTOS_AGREGAR_PRODUCTO,
    [ROLES.ADMIN, ROLES.MANAGER]
  );
  const puedeAprobar = hasPermission(
    usuario,
    PERMISSIONS.PAGOS_APROBAR,
    [ROLES.ADMIN, ROLES.MANAGER]
  );
  const puedeAnular = hasPermission(
    usuario,
    PERMISSIONS.PAGOS_ANULAR,
    [ROLES.ADMIN, ROLES.MANAGER]
  );

  useEffect(() => {
    if (id) {
      cargarEvento();
      cargarPagos();
    }
  }, [id]);

  const cargarEvento = async () => {
    try {
      const data = await eventosService.getById(id);
      if (data.evento) {
        setEvento(data.evento);
        setFormData(prev => ({ ...prev, evento_id: data.evento.id_evento || data.evento.id }));
      } else {
        showError('Evento no encontrado');
        navigate('/pagos');
      }
    } catch (err) {
      console.error('Error al cargar evento:', err);
      showError('Error al cargar el evento');
      navigate('/pagos');
    }
  };

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const data = await pagosService.getByEvento(id);
      setPagos(data.pagos || []);
      setTotalPagado(data.total_pagado || 0);
      try {
        const totales = await pagosService.getTotalEvento(id);
        if (totales.total_pagado !== undefined && totales.total_pagado !== null) {
          setTotalPagado(parseFloat(totales.total_pagado) || 0);
        }
        if (totales.total_reembolsos !== undefined && totales.total_reembolsos !== null) {
          setTotalReembolsosEvento(parseFloat(totales.total_reembolsos) || 0);
        }
      } catch (err) {
        console.error('Error al cargar totales de pagos:', err);
      }
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al cargar los pagos';
      setError(errorMessage);
      showError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
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

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '-';
    try {
      const fechaObj = parseFechaLocal(fecha);
      return fechaObj.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  const parseNumero = (valor) => {
    const numero = Number.parseFloat(valor);
    return Number.isFinite(numero) ? numero : 0;
  };

  const normalizarTexto = (valor) => (valor || '').toString().toLowerCase();
  const totalPagadoNeto = Math.max(0, totalPagado - totalReembolsosEvento);

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

  const pagosFiltrados = pagos
    .filter((pago) => {
      if (!busquedaPago) return true;
      const texto = normalizarTexto(busquedaPago);
      return (
        normalizarTexto(pago.numero_referencia).includes(texto) ||
        normalizarTexto(pago.observaciones).includes(texto) ||
        normalizarTexto(pago.metodo_pago).includes(texto) ||
        normalizarTexto(pago.tipo_pago).includes(texto)
      );
    })
    .filter((pago) => (filtroTipoPago === 'todos' ? true : pago.tipo_pago === filtroTipoPago))
    .filter((pago) => (filtroMetodoPago === 'todos' ? true : pago.metodo_pago === filtroMetodoPago))
    .filter((pago) => {
      if (!filtroFechaDesde && !filtroFechaHasta) return true;
      const fecha = parseFechaLocal(pago.fecha_pago);
      if (filtroFechaDesde && fecha < parseFechaLocal(filtroFechaDesde)) return false;
      if (filtroFechaHasta && fecha > new Date(`${filtroFechaHasta}T23:59:59`)) return false;
      return true;
    })
    .filter((pago) => {
      if (!filtroMontoMin && !filtroMontoMax) return true;
      const monto = parseNumero(pago.monto || 0);
      if (filtroMontoMin && monto < parseNumero(filtroMontoMin)) return false;
      if (filtroMontoMax && monto > parseNumero(filtroMontoMax)) return false;
      return true;
    })
    .sort((a, b) => {
      let comparacion = 0;
      switch (ordenPagos) {
        case 'monto_asc':
          comparacion = parseNumero(a.monto || 0) - parseNumero(b.monto || 0);
          break;
        case 'monto_desc':
          comparacion = parseNumero(b.monto || 0) - parseNumero(a.monto || 0);
          break;
        case 'fecha_asc':
          comparacion = parseFechaLocal(a.fecha_pago).getTime() - parseFechaLocal(b.fecha_pago).getTime();
          break;
        case 'fecha_desc':
          comparacion = parseFechaLocal(b.fecha_pago).getTime() - parseFechaLocal(a.fecha_pago).getTime();
          break;
        case 'id_desc':
        default:
          comparacion = parseNumero(b.id || 0) - parseNumero(a.id || 0);
          break;
      }
      if (comparacion !== 0) return comparacion;
      return parseNumero(b.id || 0) - parseNumero(a.id || 0);
    });

  const metricasPagos = pagosFiltrados.reduce(
    (acc, pago) => {
      const monto = parseNumero(pago.monto || 0);
      acc.totalPagos += 1;
      if (pago.tipo_pago === 'reembolso') {
        acc.totalReembolsos += monto;
      } else {
        acc.totalIngresos += monto;
      }
      return acc;
    },
    { totalPagos: 0, totalIngresos: 0, totalReembolsos: 0 }
  );
  const netoPagos = metricasPagos.totalIngresos - metricasPagos.totalReembolsos;
  const ultimoPago = pagosFiltrados[0]?.fecha_pago;
  const saldoPorReembolsar = Math.max(0, totalPagado - totalReembolsosEvento);

  const abrirModalRegistrar = async (tipoPago = 'abono') => {
    if (!evento) {
      warning('Evento no encontrado');
      return;
    }
    if (tipoPago !== 'reembolso') {
      const saldoPendiente = calcularSaldoPendiente();
      if (parseNumero(saldoPendiente) <= 0) {
        warning('Este evento no tiene saldo pendiente. Agregue adicionales al evento si desea registrar pagos.');
        return;
      }
    } else {
      let saldoPorReembolsar = Math.max(0, totalPagado - totalReembolsosEvento);
      try {
        const totales = await pagosService.getTotalEvento(id);
        const totalPagadoLocal = parseFloat(totales.total_pagado) || 0;
        const totalReembolsosLocal = parseFloat(totales.total_reembolsos) || 0;
        setTotalPagado(totalPagadoLocal);
        setTotalReembolsosEvento(totalReembolsosLocal);
        saldoPorReembolsar = Math.max(0, totalPagadoLocal - totalReembolsosLocal);
      } catch (err) {
        console.error('Error al cargar totales para reembolso:', err);
      }
      if (saldoPorReembolsar <= 0) {
        warning('No hay saldo disponible para reembolsar.');
        return;
      }
    }
    setFormData({
      evento_id: evento.id_evento || evento.id,
      monto: tipoPago === 'reembolso' ? Math.max(0, totalPagado - totalReembolsosEvento) : '',
      metodo_pago: 'efectivo',
      tipo_pago: tipoPago,
      fecha_pago: new Date().toISOString().split('T')[0],
      numero_referencia: '',
      observaciones: '',
    });
    setErrorFormulario('');
    setMostrarModalRegistrar(true);
  };

  const cerrarModalRegistrar = () => {
    setMostrarModalRegistrar(false);
    setFormData({
      evento_id: evento?.id_evento || evento?.id || '',
      monto: '',
      metodo_pago: 'efectivo',
      tipo_pago: 'abono',
      fecha_pago: new Date().toISOString().split('T')[0],
      numero_referencia: '',
      observaciones: '',
    });
    setErrorFormulario('');
  };

  const abrirModalDetalle = (pago) => {
    setPagoSeleccionado(pago);
    setMostrarModalDetalle(true);
  };

  const cerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    setPagoSeleccionado(null);
  };

  const cambiarEstadoPago = async (pago, nuevoEstado) => {
    if (!pago) return;
    try {
      setActualizandoEstado(true);
      await pagosService.updateEstado(pago.id, nuevoEstado);
      await cargarPagos();
      const actualizado = await pagosService.getById(pago.id);
      if (actualizado?.pago) {
        setPagoSeleccionado(actualizado.pago);
      }
      success('Estado del pago actualizado');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'No se pudo actualizar el estado';
      showError(errorMessage);
    } finally {
      setActualizandoEstado(false);
    }
  };

  const registrarPago = async (confirmado = false) => {
    setErrorFormulario('');

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setErrorFormulario('El monto debe ser mayor a cero');
      return;
    }

    if (!formData.fecha_pago) {
      setErrorFormulario('La fecha de pago es requerida');
      return;
    }

    if (formData.tipo_pago === 'reembolso' && parseFloat(formData.monto) > saldoPorReembolsar) {
      setErrorFormulario('El monto del reembolso supera el saldo disponible para reembolsar.');
      return;
    }

    if (formData.tipo_pago === 'reembolso' && !confirmado) {
      setMostrarConfirmReembolso(true);
      return;
    }

    try {
      setGuardando(true);
      const pagoData = {
        evento_id: parseInt(formData.evento_id),
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        tipo_pago: formData.tipo_pago,
        fecha_pago: formData.fecha_pago,
        numero_referencia: formData.numero_referencia || null,
        observaciones: formData.observaciones || null,
        origen: 'web',
      };
      await pagosService.create(pagoData);
      await cargarPagos();
      cerrarModalRegistrar();
      success(formData.tipo_pago === 'reembolso' ? 'Reembolso registrado exitosamente' : 'Pago registrado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al registrar el pago';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    await registrarPago(false);
  };

  const calcularSaldoPendiente = () => {
    if (!evento) return 0;
    const totalEvento = parseFloat(evento.total || 0);
    return Math.max(0, totalEvento - totalPagadoNeto);
  };
  const tieneSaldoPendiente = calcularSaldoPendiente() > 0;
  const eventoCancelado = evento?.estado === 'cancelado';

  const abrirAdicionalesEvento = () => {
    if (!evento) return;
    if (eventoCancelado) {
      warning('No se pueden agregar adicionales a un evento cancelado.');
      return;
    }
    navigate(`/eventos/${evento.id_evento || evento.id}?tab=productos`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando pagos...</div>;
  }

  if (!evento) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Evento no encontrado</p>
        <Link to="/pagos" style={{ color: '#6366f1', textDecoration: 'none' }}>
          Volver a Pagos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/pagos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pagos del Evento</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>{evento.nombre_evento || 'Evento'}</p>
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

      {/* Información del evento y resumen financiero */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#374151' }}>Resumen del evento</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Agrega adicionales para generar saldo pendiente y registrar pagos.
            </p>
          </div>
          {puedeAgregarAdicionales && (
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={18} color="#6366f1" />
              <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Evento</label>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{evento.nombre_evento}</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              {evento.nombre_cliente}
            </p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <DollarSign size={18} color="#10b981" />
              <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Total Evento</label>
            </div>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#6366f1' }}>
              {formatearMoneda(parseFloat(evento.total || 0))}
            </p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <DollarSign size={18} color="#10b981" />
              <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Total Pagado</label>
            </div>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
              {formatearMoneda(totalPagadoNeto)}
            </p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <DollarSign size={18} color="#ef4444" />
              <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Saldo Pendiente</label>
            </div>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
              {formatearMoneda(calcularSaldoPendiente())}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros de pagos */}
      <div
        style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Buscar por referencia, observaciones, método..."
              value={busquedaPago}
              onChange={(e) => setBusquedaPago(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.95rem',
              }}
            />
          </div>
          <select
            value={filtroTipoPago}
            onChange={(e) => setFiltroTipoPago(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem',
            }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="abono">Abono</option>
            <option value="pago_completo">Pago Completo</option>
            <option value="reembolso">Reembolso</option>
          </select>
          <select
            value={filtroMetodoPago}
            onChange={(e) => setFiltroMetodoPago(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem',
            }}
          >
            <option value="todos">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta_debito">Tarjeta Débito</option>
            <option value="tarjeta_credito">Tarjeta Crédito</option>
            <option value="cheque">Cheque</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
              Desde
            </label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
              Hasta
            </label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
              Monto mínimo
            </label>
            <input
              type="number"
              min="0"
              value={filtroMontoMin}
              onChange={(e) => setFiltroMontoMin(e.target.value)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
              Monto máximo
            </label>
            <input
              type="number"
              min="0"
              value={filtroMontoMax}
              onChange={(e) => setFiltroMontoMax(e.target.value)}
              placeholder="Sin tope"
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', marginTop: '0.75rem' }}>
          <select
            value={ordenPagos}
            onChange={(e) => setOrdenPagos(e.target.value)}
            style={{
              padding: '0.6rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              minWidth: isMobile ? '100%' : '220px',
            }}
          >
            <option value="id_desc">Ordenar: Más recientes (ID)</option>
            <option value="fecha_desc">Ordenar: Más recientes (Fecha)</option>
            <option value="fecha_asc">Ordenar: Más antiguos</option>
            <option value="monto_desc">Ordenar: Monto mayor</option>
            <option value="monto_asc">Ordenar: Monto menor</option>
          </select>
        </div>
      </div>

      {/* Métricas de pagos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pagos encontrados</label>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{metricasPagos.totalPagos}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total ingresos</label>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
            {formatearMoneda(metricasPagos.totalIngresos)}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total reembolsos</label>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#ef4444' }}>
            {formatearMoneda(metricasPagos.totalReembolsos)}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Neto</label>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#6366f1' }}>
            {formatearMoneda(netoPagos)}
          </p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Último pago</label>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>
            {ultimoPago ? formatearFechaHora(ultimoPago) : 'Sin pagos'}
          </p>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#374151' }}>Pagos del evento</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {puedeRegistrar && (
              <button
                type="button"
                onClick={() => abrirModalRegistrar('abono')}
                disabled={!tieneSaldoPendiente}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: !tieneSaldoPendiente ? '#9ca3af' : '#10b981',
                  color: 'white',
                  cursor: !tieneSaldoPendiente ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                Registrar pago
              </button>
            )}
            {puedeReembolsar && (
              <button
                type="button"
                onClick={() => abrirModalRegistrar('reembolso')}
                disabled={saldoPorReembolsar <= 0}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: saldoPorReembolsar <= 0 ? '#fca5a5' : '#ef4444',
                  color: 'white',
                  cursor: saldoPorReembolsar <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                Registrar reembolso
              </button>
            )}
          </div>
        </div>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pagosFiltrados.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                No hay pagos que coincidan con los filtros
              </div>
            ) : (
              pagosFiltrados.map((pago) => (
                <div
                  key={pago.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>ID #{pago.id}</div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{formatearFechaHora(pago.fecha_pago)}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{pago.metodo_pago || '-'}</div>
                    </div>
                    <div
                      style={{
                        fontWeight: '600',
                        color: pago.tipo_pago === 'reembolso' ? '#ef4444' : '#10b981',
                      }}
                    >
                      {pago.tipo_pago === 'reembolso' ? '-' : '+'}
                      {formatearMoneda(pago.monto || 0)}
                    </div>
                  </div>
                  <div>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor:
                          pago.tipo_pago === 'reembolso'
                            ? '#ef444420'
                            : pago.tipo_pago === 'pago_completo'
                            ? '#10b98120'
                            : '#3b82f620',
                        color:
                          pago.tipo_pago === 'reembolso'
                            ? '#ef4444'
                            : pago.tipo_pago === 'pago_completo'
                            ? '#10b981'
                            : '#3b82f6',
                      }}
                    >
                      {pago.tipo_pago === 'reembolso'
                        ? 'Reembolso'
                        : pago.tipo_pago === 'pago_completo'
                        ? 'Pago Completo'
                        : 'Abono'}
                    </span>
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        ...obtenerEstiloEstadoPago(pago.estado_pago),
                      }}
                    >
                      {obtenerLabelEstadoPago(pago.estado_pago)}
                    </span>
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor:
                          pago.origen === 'web'
                            ? '#3b82f620'
                            : pago.origen === 'whatsapp'
                              ? '#22c55e20'
                              : '#6b728020',
                        color:
                          pago.origen === 'web'
                            ? '#3b82f6'
                            : pago.origen === 'whatsapp'
                              ? '#16a34a'
                              : '#6b7280',
                      }}
                    >
                      {pago.origen === 'web'
                        ? 'Web'
                        : pago.origen === 'whatsapp'
                          ? 'WhatsApp'
                          : 'Escritorio'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    <strong>Referencia:</strong> {pago.numero_referencia || '-'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    <strong>Observaciones:</strong> {pago.observaciones || '-'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => abrirModalDetalle(pago)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Eye size={16} />
                      Ver
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    ID
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Fecha
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Tipo
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Método
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Estado
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Referencia
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Monto
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Origen
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Observaciones
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No hay pagos que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  pagosFiltrados.map((pago) => (
                    <tr key={pago.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>#{pago.id}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{formatearFechaHora(pago.fecha_pago)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor:
                              pago.tipo_pago === 'reembolso'
                                ? '#ef444420'
                                : pago.tipo_pago === 'pago_completo'
                                ? '#10b98120'
                                : '#3b82f620',
                            color:
                              pago.tipo_pago === 'reembolso'
                                ? '#ef4444'
                                : pago.tipo_pago === 'pago_completo'
                                ? '#10b981'
                                : '#3b82f6',
                          }}
                        >
                          {pago.tipo_pago === 'reembolso'
                            ? 'Reembolso'
                            : pago.tipo_pago === 'pago_completo'
                            ? 'Pago Completo'
                            : 'Abono'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{pago.metodo_pago || '-'}</td>
                      <td style={{ padding: '1rem' }}>
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
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {pago.numero_referencia || '-'}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: pago.tipo_pago === 'reembolso' ? '#ef4444' : '#10b981',
                        }}
                      >
                        {pago.tipo_pago === 'reembolso' ? '-' : '+'}
                        {formatearMoneda(pago.monto || 0)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor:
                              pago.origen === 'web'
                                ? '#3b82f620'
                                : pago.origen === 'whatsapp'
                                  ? '#22c55e20'
                                  : '#6b728020',
                            color:
                              pago.origen === 'web'
                                ? '#3b82f6'
                                : pago.origen === 'whatsapp'
                                  ? '#16a34a'
                                  : '#6b7280',
                          }}
                        >
                          {pago.origen === 'web'
                            ? 'Web'
                            : pago.origen === 'whatsapp'
                              ? 'WhatsApp'
                              : 'Escritorio'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280', maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pago.observaciones || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => abrirModalDetalle(pago)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                            title="Ver Detalle"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Pago */}
      {mostrarModalRegistrar && (
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
          }}
          onClick={cerrarModalRegistrar}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {formData.tipo_pago === 'reembolso' ? 'Registrar Reembolso' : 'Registrar Pago'}
              </h2>
              <button
                onClick={cerrarModalRegistrar}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            {errorFormulario && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {errorFormulario}
              </div>
            )}

            <form onSubmit={handleRegistrarPago}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Evento
                  </label>
                  <input
                    type="text"
                    value={evento?.nombre_evento || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Tipo de Pago <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.tipo_pago}
                      onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value })}
                      required
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
                    {formData.tipo_pago === 'reembolso' && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>
                        Este reembolso se descontará del total pagado y requiere confirmación.
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Método de Pago <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.metodo_pago}
                      onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                      required
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
                      <option value="tarjeta_debito">Tarjeta Débito</option>
                      <option value="tarjeta_credito">Tarjeta Crédito</option>
                      <option value="cheque">Cheque</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Monto <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      required
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Fecha de Pago <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_pago}
                      onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                      required
                      max={new Date().toISOString().split('T')[0]}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Número de Referencia
                  </label>
                  <input
                    type="text"
                    value={formData.numero_referencia}
                    onChange={(e) => setFormData({ ...formData, numero_referencia: e.target.value })}
                    placeholder="Número de transacción, cheque, etc."
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                    placeholder="Notas adicionales sobre el pago..."
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={cerrarModalRegistrar}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e5e7eb',
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
                  type="submit"
                  disabled={guardando}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: guardando ? '#9ca3af' : '#10b981',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Save size={18} />
                  {guardando
                    ? 'Registrando...'
                    : formData.tipo_pago === 'reembolso'
                    ? 'Registrar Reembolso'
                    : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle Pago */}
      {mostrarModalDetalle && pagoSeleccionado && (
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
          }}
          onClick={cerrarModalDetalle}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Detalle del Pago</h2>
              <button
                onClick={cerrarModalDetalle}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: '#10b98120',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DollarSign size={32} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                    {formatearMoneda(pagoSeleccionado.monto || 0)}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {formatearFechaHora(pagoSeleccionado.fecha_pago)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Tipo de Pago
                  </label>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor:
                        pagoSeleccionado.tipo_pago === 'reembolso'
                          ? '#ef444420'
                          : pagoSeleccionado.tipo_pago === 'pago_completo'
                          ? '#10b98120'
                          : '#3b82f620',
                      color:
                        pagoSeleccionado.tipo_pago === 'reembolso'
                          ? '#ef4444'
                          : pagoSeleccionado.tipo_pago === 'pago_completo'
                          ? '#10b981'
                          : '#3b82f6',
                    }}
                  >
                    {pagoSeleccionado.tipo_pago === 'reembolso'
                      ? 'Reembolso'
                      : pagoSeleccionado.tipo_pago === 'pago_completo'
                      ? 'Pago Completo'
                      : 'Abono'}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Método de Pago
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {pagoSeleccionado.metodo_pago || '-'}
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Estado del Pago
                  </label>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      ...obtenerEstiloEstadoPago(pagoSeleccionado.estado_pago),
                    }}
                  >
                    {obtenerLabelEstadoPago(pagoSeleccionado.estado_pago)}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Número de Referencia
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {pagoSeleccionado.numero_referencia || '-'}
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Origen
                  </label>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor:
                        pagoSeleccionado.origen === 'web'
                          ? '#3b82f620'
                          : pagoSeleccionado.origen === 'whatsapp'
                            ? '#22c55e20'
                            : '#6b728020',
                      color:
                        pagoSeleccionado.origen === 'web'
                          ? '#3b82f6'
                          : pagoSeleccionado.origen === 'whatsapp'
                            ? '#16a34a'
                            : '#6b7280',
                    }}
                  >
                    {pagoSeleccionado.origen === 'web'
                      ? 'Web'
                      : pagoSeleccionado.origen === 'whatsapp'
                        ? 'WhatsApp'
                        : 'Escritorio'}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Observaciones
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {pagoSeleccionado.observaciones || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              {pagoSeleccionado.estado_pago === 'en_revision' && (puedeAprobar || puedeAnular) && (
                <>
                  <button
                    onClick={() => cambiarEstadoPago(pagoSeleccionado, 'rechazado')}
                    disabled={actualizandoEstado || !puedeAnular}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: actualizandoEstado || !puedeAnular ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      opacity: actualizandoEstado || !puedeAnular ? 0.7 : 1,
                    }}
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => cambiarEstadoPago(pagoSeleccionado, 'aprobado')}
                    disabled={actualizandoEstado || !puedeAprobar}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: actualizandoEstado || !puedeAprobar ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      opacity: actualizandoEstado || !puedeAprobar ? 0.7 : 1,
                    }}
                  >
                    Aprobar
                  </button>
                </>
              )}
              <button
                onClick={cerrarModalDetalle}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cerrar
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
          onClick={() => !guardando && setMostrarConfirmReembolso(false)}
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
              Estás a punto de registrar un reembolso de {formatearMoneda(formData.monto || 0)}.
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Disponible para reembolsar: {formatearMoneda(saldoPorReembolsar)}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMostrarConfirmReembolso(false)}
                disabled={guardando}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: guardando ? 'not-allowed' : 'pointer',
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
                disabled={guardando}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: guardando ? 'not-allowed' : 'pointer',
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
    </div>
  );
};

export default PagosEvento;
