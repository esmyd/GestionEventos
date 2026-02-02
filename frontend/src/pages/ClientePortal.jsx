import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientesService, eventosService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Calendar, Clock, MapPin, Package, AlertCircle, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

// Pasos del proceso del evento (para el cliente)
const PASOS_PROCESO = [
  { id: 'cotizacion', label: 'Cotización', orden: 0 },
  { id: 'confirmado', label: 'Confirmado', orden: 1 },
  { id: 'en_proceso', label: 'En proceso', orden: 2 },
  { id: 'completado', label: 'Completado', orden: 3 },
];

const getStepIndexByEstado = (estado) => {
  if (!estado) return 0;
  const step = PASOS_PROCESO.find((s) => s.id === estado);
  return step ? step.orden : 0;
};

const getPorcentajeProceso = (estado, progresoServicios = 0) => {
  if (estado === 'cancelado') return 0;
  const stepIndex = getStepIndexByEstado(estado);
  const base = (stepIndex / (PASOS_PROCESO.length - 1)) * 100;
  if (estado === 'completado') return 100;
  if (estado === 'en_proceso') return Math.min(75 + (progresoServicios * 0.25) / 100, 99);
  if (estado === 'confirmado') return 50;
  return Math.min(25 + (progresoServicios * 0.25) / 100, 49);
};

const ClientePortal = () => {
  const { toasts, removeToast, error: showError } = useToast();
  const [cliente, setCliente] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertasVistas, setAlertasVistas] = useState([]);
  const DIAS_ALERTA = 7;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const clienteResp = await clientesService.getMe();
        const clienteData = clienteResp.cliente;
        setCliente(clienteData);
        if (clienteData) {
          const clienteId = clienteData.id || clienteData.cliente_id;
          const eventosResp = await eventosService.getAll({
            cliente_id: clienteId,
            incluir_porcentaje_avance: true,
          });
          setEventos(eventosResp.eventos || []);
        } else {
          setEventos([]);
        }
        setError('');
      } catch (err) {
        const mensaje = err.response?.data?.error || 'No se pudo cargar la información del cliente';
        setError(mensaje);
        showError(mensaje);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [showError]);

  useEffect(() => {
    const clienteId = cliente?.id || cliente?.cliente_id;
    if (!clienteId) {
      setAlertasVistas([]);
      return;
    }
    try {
      const guardadas = JSON.parse(localStorage.getItem(`alertas_eventos_vistas_${clienteId}`) || '[]');
      setAlertasVistas(Array.isArray(guardadas) ? guardadas : []);
    } catch {
      setAlertasVistas([]);
    }
  }, [cliente]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    if (typeof hora === 'string' && hora.includes(':')) {
      const partes = hora.split(':');
      return `${partes[0]}:${partes[1]}`;
    }
    return hora;
  };

  const parseFechaLocal = (fecha) => {
    if (!fecha) return null;
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [year, month, day] = fecha.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(fecha);
  };

  const obtenerDiasRestantes = (fechaEvento) => {
    const fecha = parseFechaLocal(fechaEvento);
    if (!fecha || Number.isNaN(fecha.getTime())) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffMs = fecha.getTime() - hoy.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);
  };

  const eventosOrdenados = useMemo(() => {
    return [...eventos].sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime());
  }, [eventos]);

  const ahora = new Date();
  const proximosEventos = eventosOrdenados.filter((evento) => {
    if (!evento.fecha_evento) return false;
    return new Date(evento.fecha_evento) >= ahora;
  });
  const totalSaldo = eventos.reduce((acc, evento) => acc + (parseFloat(evento.saldo || 0) || 0), 0);

  const alertasProximas = useMemo(() => {
    const ignorarEstados = new Set(['cancelado', 'completado']);
    return eventosOrdenados
      .filter((evento) => evento.fecha_evento && !ignorarEstados.has(evento.estado))
      .map((evento) => ({
        ...evento,
        diasRestantes: obtenerDiasRestantes(evento.fecha_evento),
      }))
      .filter((evento) => {
        if (evento.diasRestantes === null) return false;
        const id = evento.id_evento || evento.id;
        return evento.diasRestantes >= 0 && evento.diasRestantes <= DIAS_ALERTA && !alertasVistas.includes(id);
      });
  }, [eventosOrdenados, alertasVistas]);

  const guardarAlertasVistas = (ids) => {
    const clienteId = cliente?.id || cliente?.cliente_id;
    setAlertasVistas(ids);
    if (clienteId) {
      localStorage.setItem(`alertas_eventos_vistas_${clienteId}`, JSON.stringify(ids));
    }
  };

  const marcarAlertaRevisada = (eventoId) => {
    if (!eventoId) return;
    const nuevas = Array.from(new Set([...alertasVistas, eventoId]));
    guardarAlertasVistas(nuevas);
  };

  const marcarTodasRevisadas = () => {
    const ids = alertasProximas.map((evento) => evento.id_evento || evento.id).filter(Boolean);
    if (ids.length === 0) return;
    const nuevas = Array.from(new Set([...alertasVistas, ...ids]));
    guardarAlertasVistas(nuevas);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando tu portal...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Mi evento</h1>
        <p style={{ color: '#6b7280' }}>
          {cliente?.nombre_completo ? `Hola ${cliente.nombre_completo}` : 'Consulta el estado de tus eventos'}
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Eventos registrados</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{eventos.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Próximos eventos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{proximosEventos.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Saldo pendiente total</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: totalSaldo > 0 ? '#dc2626' : '#0f172a' }}>
            {formatearMoneda(totalSaldo)}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Por pagar en todos tus eventos</div>
        </div>
      </div>

      {alertasProximas.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff7ed',
            borderRadius: '0.75rem',
            border: '1px solid #fed7aa',
            padding: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} color="#f97316" />
              <strong style={{ color: '#9a3412' }}>Alertas de eventos próximos</strong>
            </div>
            <button
              onClick={marcarTodasRevisadas}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #fdba74',
                backgroundColor: 'white',
                color: '#9a3412',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              Marcar todas como revisadas
            </button>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {alertasProximas.map((evento) => {
              const eventoId = evento.id_evento || evento.id;
              return (
                <div
                  key={eventoId}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #fde68a',
                    padding: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{evento.nombre_evento || 'Evento'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {formatearFecha(evento.fecha_evento)} · {formatearHora(evento.hora_inicio)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#9a3412' }}>
                      Faltan {evento.diasRestantes} día{evento.diasRestantes === 1 ? '' : 's'}
                    </div>
                  </div>
                  <button
                    onClick={() => marcarAlertaRevisada(eventoId)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #fdba74',
                      backgroundColor: '#fff7ed',
                      color: '#9a3412',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      alignSelf: 'flex-start',
                    }}
                  >
                    Revisado
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {eventosOrdenados.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          No tienes eventos registrados todavía.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {eventosOrdenados.map((evento) => {
            const progresoConfirmaciones = evento.progreso_confirmaciones ?? evento.porcentaje_avance_confirmaciones ?? 0;
            const estadoActual = (evento.estado || 'cotizacion').toLowerCase().replace(/\s/g, '_');
            const pasoActual = getStepIndexByEstado(estadoActual);
            const porcentajeProceso = evento.estado === 'cancelado' ? 0 : getPorcentajeProceso(estadoActual, progresoConfirmaciones);
            const totalEvento = parseFloat(evento.total || 0) || 0;
            const saldoPendiente = parseFloat(evento.saldo || 0) || 0;
            const pagado = Math.max(0, totalEvento - saldoPendiente);

            return (
              <div
                key={evento.id_evento || evento.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem',
                  display: 'grid',
                  gap: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                      {evento.nombre_evento || 'Evento'}
                    </h3>
                    <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {evento.tipo_evento || 'Evento social'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {evento.estado === 'cancelado' ? (
                      <AlertCircle size={16} color="#9ca3af" />
                    ) : evento.estado === 'completado' ? (
                      <CheckCircle2 size={16} color="#10b981" />
                    ) : (
                      <Circle size={16} color="#6366f1" />
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'capitalize' }}>
                      {evento.estado ? evento.estado.replace(/_/g, ' ') : '-'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="#6b7280" />
                    <span style={{ fontSize: '0.85rem' }}>{formatearFecha(evento.fecha_evento)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="#6b7280" />
                    <span style={{ fontSize: '0.85rem' }}>
                      {formatearHora(evento.hora_inicio)}
                      {evento.hora_fin ? ` - ${formatearHora(evento.hora_fin)}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="#6b7280" />
                    <span style={{ fontSize: '0.85rem' }}>{evento.nombre_salon || evento.salon || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={16} color="#6b7280" />
                    <span style={{ fontSize: '0.85rem' }}>{evento.nombre_plan || 'Paquete no definido'}</span>
                  </div>
                </div>

                {evento.estado !== 'cancelado' && (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Progreso del proceso</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6366f1' }}>{Math.round(porcentajeProceso)}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {PASOS_PROCESO.map((paso, idx) => {
                        const completado = pasoActual > idx || (pasoActual === idx && paso.id === estadoActual);
                        const esActual = paso.id === estadoActual;
                        return (
                          <React.Fragment key={paso.id}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '9999px',
                                backgroundColor: completado ? '#6366f1' : esActual ? '#c7d2fe' : '#f1f5f9',
                                color: completado ? '#fff' : esActual ? '#4338ca' : '#94a3b8',
                                fontSize: '0.75rem',
                                fontWeight: esActual || completado ? '600' : '500',
                              }}
                            >
                              {completado ? <CheckCircle2 size={14} /> : null}
                              {paso.label}
                            </div>
                            {idx < PASOS_PROCESO.length - 1 && (
                              <ChevronRight size={14} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '0.75rem', width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${porcentajeProceso}%`,
                          height: '100%',
                          backgroundColor: porcentajeProceso >= 100 ? '#10b981' : '#6366f1',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      Avance de confirmaciones de ítems: {progresoConfirmaciones}%
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' }}>Total del paquete</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{formatearMoneda(totalEvento)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' }}>Pagado</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981' }}>{formatearMoneda(pagado)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' }}>Saldo pendiente</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: saldoPendiente > 0 ? '#dc2626' : '#0f172a' }}>{formatearMoneda(saldoPendiente)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Link
                    to={`/eventos/${evento.id_evento || evento.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientePortal;
