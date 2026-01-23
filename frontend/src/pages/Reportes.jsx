import React, { useState, useEffect } from 'react';
import { reportesService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Package,
  FileText,
  Building,
  CreditCard,
  Target,
  Activity,
  PieChart,
  Mail,
  MessageCircle,
} from 'lucide-react';

const Reportes = ({
  titulo = 'Reportes y Análisis',
  subtitulo = 'Métricas y estadísticas del sistema',
  mostrarToast = true,
}) => {
  const { toasts, removeToast, error: showError } = useToast();
  const [metricas, setMetricas] = useState(null);
  const [eventosPorEstado, setEventosPorEstado] = useState(null);
  const [resumenFinanciero, setResumenFinanciero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      const [metricasData, eventosData, resumenData] = await Promise.all([
        reportesService.getMetricas(),
        reportesService.getEventosPorEstado().catch(() => null),
        reportesService.getResumenFinanciero().catch(() => null),
      ]);
      setMetricas(metricasData.metricas);
      setEventosPorEstado(eventosData?.resumen || null);
      setResumenFinanciero(resumenData?.resumen_financiero || null);
      setError('');
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        (err.response?.status === 401
          ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          : 'Error al cargar los reportes');
      setError(errorMessage);
      if (mostrarToast) {
        showError(errorMessage);
      }
      console.error(err);

      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }, 2000);
      }
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

  const formatearMonedaSimple = (valor) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(valor);

  // Componente de gráfico de barras
  const GraficoBarras = ({ datos, altura = 200, color = '#6366f1' }) => {
    const maxValor = Math.max(...datos.map((d) => d.valor), 1);
    const alturaMaxima = altura - 40;

    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: `${altura}px`, padding: '1rem' }}>
        {datos.map((item, index) => {
          const alturaBarra = (item.valor / maxValor) * alturaMaxima;
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '100%',
                  height: `${alturaBarra}px`,
                  backgroundColor: item.color || color,
                  borderRadius: '0.25rem 0.25rem 0 0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'scaleY(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scaleY(1)';
                }}
              >
                {alturaBarra > 20 && (
                  <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>{item.valor}</span>
                )}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Componente de gráfico de pastel
  const GraficoPastel = ({ datos, tamaño = 200 }) => {
    let acumulado = 0;
    const total = datos.reduce((sum, item) => sum + item.valor, 0);
    const radio = tamaño / 2 - 10;
    const centro = tamaño / 2;

    if (total === 0) {
      return (
        <div
          style={{
            width: `${tamaño}px`,
            height: `${tamaño}px`,
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
          }}
        >
          Sin datos
        </div>
      );
    }

    const segmentos = datos.map((item, index) => {
      const porcentaje = (item.valor / total) * 100;
      const anguloInicio = (acumulado / total) * 360;
      const anguloFin = ((acumulado + item.valor) / total) * 360;
      acumulado += item.valor;

      const x1 = centro + radio * Math.cos((anguloInicio * Math.PI) / 180);
      const y1 = centro + radio * Math.sin((anguloInicio * Math.PI) / 180);
      const x2 = centro + radio * Math.cos((anguloFin * Math.PI) / 180);
      const y2 = centro + radio * Math.sin((anguloFin * Math.PI) / 180);

      const largeArc = porcentaje > 50 ? 1 : 0;

      return (
        <path
          key={index}
          d={`M ${centro} ${centro} L ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={item.color}
          stroke="white"
          strokeWidth="2"
        />
      );
    });

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <svg width={tamaño} height={tamaño} style={{ transform: 'rotate(-90deg)' }}>
          {segmentos}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {datos.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '0.25rem',
                  backgroundColor: item.color,
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                {item.label}: {item.valor} ({((item.valor / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente de indicador con progreso
  const IndicadorProgreso = ({ titulo, valor, total, color, icono, formatear = (v) => v }) => {
    const porcentaje = total > 0 ? (valor / total) * 100 : 0;
    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.5rem',
                backgroundColor: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.createElement(icono, { size: 24, color: color })}
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>{titulo}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color, margin: '0.25rem 0 0 0' }}>
                {formatear(valor)}
              </p>
            </div>
          </div>
        </div>
        {total > 0 && (
          <div>
            <div
              style={{
                width: '100%',
                height: '0.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(porcentaje, 100)}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0 0', textAlign: 'right' }}>
              {porcentaje.toFixed(1)}% del total
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Activity size={48} color="#6366f1" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={cargarReportes}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#6366f1',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!metricas) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#ef4444' }}>No se pudieron cargar los reportes</p>
      </div>
    );
  }

  // Preparar datos para gráficos
  const datosEventosPorEstado = eventosPorEstado
    ? Object.entries(eventosPorEstado)
        .filter(([estado]) => estado !== 'total_eventos')
        .map(([estado, datos]) => ({
          label: estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' '),
          valor: datos.cantidad || 0,
          color:
            estado === 'completado'
              ? '#10b981'
              : estado === 'en_proceso'
              ? '#3b82f6'
              : estado === 'confirmado'
              ? '#8b5cf6'
              : estado === 'cancelado'
              ? '#ef4444'
              : '#6b7280',
        }))
    : [];

  const datosFinanciero = resumenFinanciero
    ? [
        { label: 'Cobrado', valor: resumenFinanciero.total_cobrado || 0, color: '#10b981' },
        { label: 'Pendiente', valor: resumenFinanciero.total_pendiente || 0, color: '#f59e0b' },
      ]
    : [];

  return (
    <div>
      {mostrarToast && <ToastContainer toasts={toasts} removeToast={removeToast} />}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{titulo}</h1>
        <p style={{ color: '#6b7280' }}>{subtitulo}</p>
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

      {/* Indicadores principales */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <IndicadorProgreso
          titulo="Total Eventos"
          valor={metricas.eventos?.total || 0}
          total={metricas.eventos?.total || 0}
          color="#6366f1"
          icono={Calendar}
        />
        <IndicadorProgreso
          titulo="Ingresos Totales"
          valor={metricas.financiero?.total_ingresos || 0}
          total={metricas.financiero?.total_ingresos || 0}
          color="#10b981"
          icono={DollarSign}
          formatear={formatearMoneda}
        />
        <IndicadorProgreso
          titulo="Total Cobrado"
          valor={metricas.financiero?.total_cobrado || 0}
          total={metricas.financiero?.total_ingresos || 1}
          color="#3b82f6"
          icono={CreditCard}
          formatear={formatearMoneda}
        />
        <IndicadorProgreso
          titulo="Saldo Pendiente"
          valor={metricas.financiero?.total_pendiente || 0}
          total={metricas.financiero?.total_ingresos || 1}
          color="#f59e0b"
          icono={Target}
          formatear={formatearMoneda}
        />
        <IndicadorProgreso
          titulo="Ticket Promedio"
          valor={metricas.financiero?.ticket_promedio || 0}
          total={metricas.financiero?.ticket_promedio || 0}
          color="#8b5cf6"
          icono={TrendingUp}
          formatear={formatearMoneda}
        />
        <IndicadorProgreso
          titulo="Total Clientes"
          valor={metricas.clientes?.total || 0}
          total={metricas.clientes?.total || 0}
          color="#ec4899"
          icono={Users}
        />
      </div>

      {/* Gráfico de eventos por estado */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <BarChart3 size={24} color="#6366f1" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Eventos por Estado</h2>
        </div>
        {datosEventosPorEstado.length > 0 ? (
          <GraficoBarras datos={datosEventosPorEstado} altura={250} />
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No hay datos disponibles</p>
        )}
      </div>

      {/* Gráfico de pastel - Eventos por estado */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <PieChart size={24} color="#6366f1" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Distribución de Eventos</h2>
        </div>
        {datosEventosPorEstado.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GraficoPastel datos={datosEventosPorEstado} tamaño={250} />
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No hay datos disponibles</p>
        )}
      </div>

      {/* Gráfico financiero */}
      {datosFinanciero.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <DollarSign size={24} color="#10b981" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Estado Financiero</h2>
          </div>
          <GraficoBarras datos={datosFinanciero} altura={200} />
        </div>
      )}

      {/* Notificaciones y WhatsApp */}
      {metricas?.notificaciones && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Activity size={24} color="#6366f1" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Notificaciones y WhatsApp</h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <IndicadorProgreso
              titulo="Email (notificaciones)"
              valor={metricas.notificaciones.envios?.email || 0}
              total={metricas.notificaciones.envios?.email || 0}
              color="#10b981"
              icono={Mail}
            />
            <IndicadorProgreso
              titulo="WhatsApp (notificaciones)"
              valor={metricas.notificaciones.envios?.whatsapp || 0}
              total={metricas.notificaciones.envios?.whatsapp || 0}
              color="#3b82f6"
              icono={MessageCircle}
            />
            <IndicadorProgreso
              titulo="Costo Email"
              valor={metricas.notificaciones.costos?.email || 0}
              total={metricas.notificaciones.costos?.email || 0}
              color="#f59e0b"
              icono={DollarSign}
              formatear={formatearMonedaSimple}
            />
            <IndicadorProgreso
              titulo="Costo WhatsApp"
              valor={metricas.notificaciones.costos?.whatsapp || 0}
              total={metricas.notificaciones.costos?.whatsapp || 0}
              color="#8b5cf6"
              icono={DollarSign}
              formatear={formatearMonedaSimple}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }}>
              <h4 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.95rem' }}>WhatsApp (inbound/outbound)</h4>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                <div>Inbound: {metricas.notificaciones.whatsapp_chat?.inbound || 0}</div>
                <div>Outbound: {metricas.notificaciones.whatsapp_chat?.outbound || 0}</div>
                <div>Bot: {metricas.notificaciones.whatsapp_chat?.bot || 0}</div>
                <div>Humano: {metricas.notificaciones.whatsapp_chat?.humano || 0}</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }}>
              <h4 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Totales WhatsApp</h4>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                <div>Total outbound: {metricas.notificaciones.whatsapp_total_out || 0}</div>
                <div>
                  Costo total: {formatearMonedaSimple(metricas.notificaciones.whatsapp_total_cost || 0)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Notificaciones por tipo</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Tipo</th>
                    <th style={{ padding: '0.6rem' }}>Email</th>
                    <th style={{ padding: '0.6rem' }}>WhatsApp</th>
                    <th style={{ padding: '0.6rem' }}>Total</th>
                    <th style={{ padding: '0.6rem' }}>Costo Email</th>
                    <th style={{ padding: '0.6rem' }}>Costo WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {(metricas.notificaciones.por_tipo || []).map((row) => (
                    <tr key={row.tipo_notificacion} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.6rem' }}>{row.tipo_notificacion}</td>
                      <td style={{ padding: '0.6rem' }}>{row.email_out}</td>
                      <td style={{ padding: '0.6rem' }}>{row.whatsapp_out}</td>
                      <td style={{ padding: '0.6rem' }}>{row.total}</td>
                      <td style={{ padding: '0.6rem' }}>{formatearMonedaSimple(row.costo_email || 0)}</td>
                      <td style={{ padding: '0.6rem' }}>{formatearMonedaSimple(row.costo_whatsapp || 0)}</td>
                    </tr>
                  ))}
                  {(metricas.notificaciones.por_tipo || []).length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '0.75rem', color: '#6b7280' }}>
                        Sin datos de notificaciones enviadas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resumen detallado */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Estadísticas de eventos */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Calendar size={20} color="#6366f1" />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Estadísticas de Eventos</h3>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              { label: 'Cotización', valor: metricas.eventos?.cotizacion || 0, color: '#6b7280' },
              { label: 'Confirmados', valor: metricas.eventos?.confirmados || 0, color: '#8b5cf6' },
              { label: 'En Proceso', valor: metricas.eventos?.en_proceso || 0, color: '#3b82f6' },
              { label: 'Completados', valor: metricas.eventos?.completados || 0, color: '#10b981' },
              { label: 'Cancelados', valor: metricas.eventos?.cancelados || 0, color: '#ef4444' },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.label}</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: item.color }}>{item.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas financieras */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <DollarSign size={20} color="#10b981" />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Resumen Financiero</h3>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              {
                label: 'Total Ingresos',
                valor: formatearMoneda(metricas.financiero?.total_ingresos || 0),
                color: '#10b981',
              },
              {
                label: 'Total Cobrado',
                valor: formatearMoneda(metricas.financiero?.total_cobrado || 0),
                color: '#3b82f6',
              },
              {
                label: 'Saldo Pendiente',
                valor: formatearMoneda(metricas.financiero?.total_pendiente || 0),
                color: '#f59e0b',
              },
              {
                label: '% Cobrado',
                valor: `${(metricas.financiero?.porcentaje_cobrado || 0).toFixed(1)}%`,
                color: '#8b5cf6',
              },
              {
                label: 'Total Pagos',
                valor: metricas.financiero?.total_pagos || 0,
                color: '#6366f1',
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.label}</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: item.color }}>{item.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas de recursos */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Package size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Recursos del Sistema</h3>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              {
                label: 'Productos',
                valor: `${metricas.recursos?.productos?.activos || 0} / ${metricas.recursos?.productos?.total || 0}`,
                icono: Package,
                color: '#6366f1',
              },
              {
                label: 'Planes',
                valor: `${metricas.recursos?.planes?.activos || 0} / ${metricas.recursos?.planes?.total || 0}`,
                icono: FileText,
                color: '#8b5cf6',
              },
              {
                label: 'Salones',
                valor: `${metricas.recursos?.salones?.activos || 0} / ${metricas.recursos?.salones?.total || 0}`,
                icono: Building,
                color: '#10b981',
              },
              {
                label: 'Promedio Eventos/Cliente',
                valor: (metricas.clientes?.promedio_eventos_cliente || 0).toFixed(1),
                icono: Users,
                color: '#ec4899',
              },
              {
                label: 'Promedio Invitados',
                valor: Math.round(metricas.estadisticas?.promedio_invitados || 0),
                icono: Users,
                color: '#f59e0b',
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {React.createElement(item.icono, { size: 16, color: item.color })}
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: item.color }}>{item.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
