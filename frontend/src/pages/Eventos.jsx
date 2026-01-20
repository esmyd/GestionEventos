import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventosService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Plus, Search, Filter, Calendar, Clock, MapPin, Package, Users, Download, Eye, Edit, X, FileText, CheckCircle2, AlertCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES, PERMISSIONS, hasRole, hasPermission } from '../utils/roles';

const Eventos = () => {
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const { usuario: usuarioActual } = useAuth();
  const esCoordinador = hasRole(usuarioActual?.rol, [ROLES.COORDINATOR]);
  const esAdminOGerente = hasRole(usuarioActual?.rol, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEditarEstado = hasPermission(usuarioActual, PERMISSIONS.EVENTOS_EDITAR_ESTADO, [ROLES.ADMIN, ROLES.MANAGER]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroAsignacion, setFiltroAsignacion] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    cargarEventos();
  }, [filtroEstado, filtroAsignacion, esCoordinador, usuarioActual?.id]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filtroEstado) filters.estado = filtroEstado;
      if (esCoordinador && usuarioActual?.id) {
        filters.coordinador_id = usuarioActual.id;
      } else if (esAdminOGerente && filtroAsignacion === 'mios' && usuarioActual?.id) {
        filters.coordinador_id = usuarioActual.id;
      }
      filters.incluir_porcentaje_avance = true; // Incluir porcentaje de avance
      const data = await eventosService.getAll(filters);
      setEventos(data.eventos || []);
      setError('');
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar los eventos';
      setError(`Error: ${errorMessage}`);
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

  const formatearFecha = (fecha) => {
    if (!fecha) return '/';
    return new Date(fecha).toLocaleDateString('es-EC');
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    try {
      if (typeof hora === 'string' && hora.includes(':')) {
        const partes = hora.split(':');
        return `${partes[0]}:${partes[1]}`;
      }
      return hora;
    } catch {
      return hora;
    }
  };


  const descargarCotizacion = async (eventoId) => {
    try {
      const response = await eventosService.descargarCotizacionPDF(eventoId);
      // Crear un blob y descargarlo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const evento = eventos.find(e => (e.id_evento || e.id) === eventoId);
      const nombreArchivo = evento 
        ? `cotizacion_${evento.nombre_evento?.replace(/[^a-zA-Z0-9]/g, '_') || 'evento'}_${eventoId}.pdf`
        : `cotizacion_evento_${eventoId}.pdf`;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Cotización descargada exitosamente');
    } catch (err) {
      console.error('Error al descargar cotización:', err);
      showError('Error al descargar la cotización. Por favor, intente nuevamente.');
    }
  };

  const descargarContrato = async (eventoId) => {
    try {
      const response = await eventosService.descargarContratoPDF(eventoId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const evento = eventos.find(e => (e.id_evento || e.id) === eventoId);
      const contentDisposition = response.headers?.['content-disposition'];
      let nombreArchivo = '';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        nombreArchivo = contentDisposition.split('filename=')[1].replace(/"/g, '').trim();
      }
      if (!nombreArchivo) {
        const documento = evento?.documento_identidad_cliente || evento?.documento_identidad || 'sin_documento_identidad';
        const fechaRaw = evento?.fecha_evento || '';
        const fecha = fechaRaw ? String(fechaRaw).replace(/[^0-9]/g, '') : 'sin_fecha';
        nombreArchivo = `Contrato_${documento}_${eventoId}_${fecha}.pdf`;
      }
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Contrato descargado exitosamente');
    } catch (err) {
      console.error('Error al descargar contrato:', err);
      showError('Error al descargar el contrato. Por favor, intente nuevamente.');
    }
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

  const abrirModalEstado = (evento) => {
    // No permitir abrir el modal si el evento está completado
    if (evento.estado === 'completado') {
      warning('No se puede modificar el estado de un evento que ya está completado.');
      return;
    }
    setEventoSeleccionado(evento);
    setNuevoEstado(evento.estado || 'cotizacion');
    setMostrarModalEstado(true);
  };

  const cerrarModalEstado = () => {
    setMostrarModalEstado(false);
    setEventoSeleccionado(null);
    setNuevoEstado('');
  };

  const actualizarEstado = async () => {
    if (!eventoSeleccionado || !nuevoEstado) return;
    
    try {
      setActualizandoEstado(true);
      await eventosService.updateEstado(eventoSeleccionado.id_evento || eventoSeleccionado.id, nuevoEstado);
      await cargarEventos();
      cerrarModalEstado();
      setError('');
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      const errorMessage = err.response?.data?.error || 'Error al actualizar el estado del evento';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setActualizandoEstado(false);
    }
  };

  const getEstadosDisponibles = (evento) => {
    const estados = ['cotizacion', 'confirmado', 'en_proceso', 'completado', 'cancelado'];
    const estadoActual = evento.estado;
    const saldoPendiente = parseFloat(evento.saldo || 0);
    
    // Si hay saldo pendiente, no permitir "completado"
    if (saldoPendiente > 0) {
      return estados.filter(e => e !== 'completado' || e === estadoActual);
    }
    
    return estados;
  };

  const eventosFiltrados = eventos.filter((evento) => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      evento.nombre_evento?.toLowerCase().includes(busquedaLower) ||
      evento.documento_identidad_cliente?.toLowerCase().includes(busquedaLower) ||
      evento.nombre_cliente?.toLowerCase().includes(busquedaLower) ||
      evento.tipo_evento?.toLowerCase().includes(busquedaLower)
    );
  });

  // Calcular estadísticas de eventos
  const estadisticas = {
    total: eventos.length,
    cotizacion: eventos.filter(e => e.estado === 'cotizacion').length,
    confirmado: eventos.filter(e => e.estado === 'confirmado').length,
    en_proceso: eventos.filter(e => e.estado === 'en_proceso').length,
    completado: eventos.filter(e => e.estado === 'completado').length,
    cancelado: eventos.filter(e => e.estado === 'cancelado').length,
    totalIngresos: eventos.reduce((sum, e) => sum + (parseFloat(e.total || 0)), 0),
    totalPendiente: eventos.reduce((sum, e) => sum + (parseFloat(e.saldo || 0)), 0),
    totalCobrado: eventos.reduce((sum, e) => sum + (parseFloat(e.total || 0) - parseFloat(e.saldo || 0)), 0),
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando eventos...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Eventos</h1>
          <p style={{ color: '#6b7280' }}>Gestión de eventos</p>
        </div>
        <Link
          to="/eventos/nuevo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6366f1',
            color: 'white',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          <Plus size={20} />
          Nuevo Evento
        </Link>
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

      {/* Indicadores de estadísticas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Total de Eventos */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
          onClick={() => setFiltroEstado('')}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Calendar size={24} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' }}>
              Total Eventos
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {estadisticas.total}
            </div>
          </div>
        </div>

        {/* En Proceso */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
          onClick={() => setFiltroEstado('en_proceso')}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Activity size={24} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' }}>
              En Proceso
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
              {estadisticas.en_proceso}
            </div>
          </div>
        </div>

        {/* Confirmados */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
          onClick={() => setFiltroEstado('confirmado')}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={24} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' }}>
              Confirmados
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
              {estadisticas.confirmado}
            </div>
          </div>
        </div>

        {/* Completados */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
          onClick={() => setFiltroEstado('completado')}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={24} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' }}>
              Completados
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
              {estadisticas.completado}
            </div>
          </div>
        </div>

        {!esCoordinador && (
          <>
            {/* Total Cobrado */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <DollarSign size={24} color="white" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Total Cobrado
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                  {formatearMoneda(estadisticas.totalCobrado)}
                </div>
              </div>
            </div>

            {/* Saldo Pendiente */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={24} color="white" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Saldo Pendiente
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
                  {formatearMoneda(estadisticas.totalPendiente)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search
            size={20}
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
            placeholder="Buscar eventos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            minWidth: '150px',
          }}
        >
          <option value="">Todos los estados</option>
          <option value="cotizacion">Cotización</option>
          <option value="confirmado">Confirmado</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        {esAdminOGerente && (
          <select
            value={filtroAsignacion}
            onChange={(e) => setFiltroAsignacion(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              minWidth: '150px',
            }}
          >
            <option value="todos">Todos los eventos</option>
            <option value="mios">Mis eventos</option>
          </select>
        )}
      </div>

      {/* Tabla de eventos */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Evento
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Cliente
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Fecha
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Hora
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Salón
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Plan
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Invitados
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Estado
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                  Avance
                </th>
                {!esCoordinador && (
                  <>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                      Total
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>
                      Saldo
                    </th>
                  </>
                )}
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap', minWidth: '200px' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {eventosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={esCoordinador ? 10 : 12} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No hay eventos disponibles
                  </td>
                </tr>
              ) : (
                eventosFiltrados.map((evento) => (
                  <tr
                    key={evento.id_evento || evento.id}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        {evento.nombre_evento || '-'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {evento.tipo_evento || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500', color: '#374151' }}>
                        {evento.nombre_cliente || '-'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {evento.documento_identidad_cliente || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="#6b7280" />
                        <span style={{ fontSize: '0.875rem' }}>{evento.fecha_evento}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {evento.hora_inicio ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} color="#6b7280" />
                          <span style={{ fontSize: '0.875rem' }}>
                            {formatearHora(evento.hora_inicio)}
                            {evento.hora_fin ? ` - ${formatearHora(evento.hora_fin)}` : ''}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {evento.nombre_salon || evento.salon ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={16} color="#6b7280" />
                          <span style={{ fontSize: '0.875rem' }}>{evento.nombre_salon || evento.salon}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {evento.nombre_plan ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Package size={16} color="#6b7280" />
                          <span style={{ fontSize: '0.875rem' }}>{evento.nombre_plan}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {evento.numero_invitados ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <Users size={16} color="#6b7280" />
                          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{evento.numero_invitados}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.375rem 0.875rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: `${getEstadoColor(evento.estado)}20`,
                          color: getEstadoColor(evento.estado),
                          textTransform: 'capitalize',
                          display: 'inline-block',
                        }}
                      >
                        {evento.estado || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {evento.porcentaje_avance_servicios !== undefined && evento.porcentaje_avance_servicios !== null ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: '80px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                            {evento.porcentaje_avance_servicios}%
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${evento.porcentaje_avance_servicios}%`,
                                height: '100%',
                                backgroundColor: evento.porcentaje_avance_servicios >= 100 ? '#10b981' : '#6366f1',
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    {!esCoordinador && (
                      <>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {formatearMoneda(evento.total || 0)}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: parseFloat(evento.saldo || 0) > 0 ? '#f59e0b' : '#10b981' 
                          }}>
                            {formatearMoneda(evento.saldo || 0)}
                          </div>
                        </td>
                      </>
                    )}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                          to={`/eventos/${evento.id_evento || evento.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            borderRadius: '0.375rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#4f46e5';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#6366f1';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <Eye size={18} strokeWidth={2.5} />
                           
                        </Link>
                        <details style={{ position: 'relative' }}>
                          <summary
                            title="Archivos"
                            style={{
                              listStyle: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              userSelect: 'none',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#059669';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#10b981';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <FileText size={18} strokeWidth={2.5} />
                            Archivos
                          </summary>
                          <div
                            style={{
                              position: 'absolute',
                              top: '110%',
                              right: 0,
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
                              minWidth: '180px',
                              zIndex: 20,
                              padding: '0.4rem',
                            }}
                          >
                            <button
                              onClick={() => descargarCotizacion(evento.id_evento || evento.id)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'transparent',
                                color: '#111827',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                textAlign: 'left',
                              }}
                            >
                              <FileText size={16} strokeWidth={2} />
                              Cotización
                            </button>
                            <button
                              onClick={() => descargarContrato(evento.id_evento || evento.id)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'transparent',
                                color: '#111827',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                textAlign: 'left',
                              }}
                            >
                              <Download size={16} strokeWidth={2} />
                              Contrato
                            </button>
                          </div>
                        </details>
                        {evento.estado !== 'completado' && puedeEditarEstado && (
                          <button
                            onClick={() => abrirModalEstado(evento)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#d97706';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f59e0b';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <CheckCircle2 size={18} strokeWidth={2.5} />
                             
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para cambiar estado */}
    
      {mostrarModalEstado && eventoSeleccionado && puedeEditarEstado && (
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
          onClick={cerrarModalEstado}
        >
          {/* validar rol del usuario */}
     
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={28} color="#f59e0b" strokeWidth={2.5} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Cambiar Estado</h2>
              </div>
              <button
                onClick={cerrarModalEstado}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  borderRadius: '0.25rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Package size={18} color="#6366f1" strokeWidth={2} />
                <p style={{ margin: 0, color: '#374151', fontSize: '0.875rem' }}>
                  <strong>Evento:</strong> {eventoSeleccionado.nombre_evento}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={18} color={getEstadoColor(eventoSeleccionado.estado)} strokeWidth={2} />
                <p style={{ margin: 0, color: '#374151', fontSize: '0.875rem' }}>
                  <strong>Estado actual:</strong>{' '}
                  <span style={{ color: getEstadoColor(eventoSeleccionado.estado), fontWeight: '600' }}>
                    {eventoSeleccionado.estado?.toUpperCase().replace('_', ' ')}
                  </span>
                </p>
              </div>
              {parseFloat(eventoSeleccionado.saldo || 0) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem', border: '1px solid #fde68a' }}>
                  <AlertCircle size={18} color="#f59e0b" strokeWidth={2.5} />
                  <p style={{ margin: 0, color: '#92400e', fontSize: '0.875rem', fontWeight: '500' }}>
                    Saldo pendiente: {formatearMoneda(parseFloat(eventoSeleccionado.saldo || 0))}
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                <Edit size={18} color="#6366f1" strokeWidth={2} />
                Nuevo Estado:
              </label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {getEstadosDisponibles(eventoSeleccionado).map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
              {parseFloat(eventoSeleccionado.saldo || 0) > 0 && nuevoEstado === 'completado' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.375rem', border: '1px solid #fecaca' }}>
                  <AlertCircle size={18} color="#ef4444" strokeWidth={2.5} />
                  <p style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem', fontWeight: '500' }}>
                    No se puede cambiar a "Completado" si hay saldo pendiente.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={cerrarModalEstado}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <X size={18} strokeWidth={2.5} />
                Cancelar
              </button>
              <button
                onClick={actualizarEstado}
                disabled={actualizandoEstado || (parseFloat(eventoSeleccionado.saldo || 0) > 0 && nuevoEstado === 'completado')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: actualizandoEstado || (parseFloat(eventoSeleccionado.saldo || 0) > 0 && nuevoEstado === 'completado') ? '#9ca3af' : '#10b981',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: actualizandoEstado || (parseFloat(eventoSeleccionado.saldo || 0) > 0 && nuevoEstado === 'completado') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!actualizandoEstado && !(parseFloat(eventoSeleccionado.saldo || 0) > 0 && nuevoEstado === 'completado')) {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!actualizandoEstado && !(parseFloat(eventoSeleccionado.saldo || 0) > 0 && nuevoEstado === 'completado')) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {actualizandoEstado ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eventos;
