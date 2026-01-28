import React, { useState, useEffect } from 'react';
import { reportesService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Package,
  FileText,
  Building,
  Target,
  Activity,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  FileSpreadsheet,
  Box,
  CreditCard,
  Bell,
  AlertTriangle,
  Star,
  Landmark,
} from 'lucide-react';

const Reportes = ({
  titulo = 'Dashboard Ejecutivo',
  subtitulo = 'Resumen de operaciones y métricas clave',
  mostrarToast = true,
}) => {
  const { toasts, removeToast, error: showError } = useToast();
  const [metricas, setMetricas] = useState(null);
  const [eventosPorEstado, setEventosPorEstado] = useState(null);
  const [resumenFinanciero, setResumenFinanciero] = useState(null);
  const [resumenDanos, setResumenDanos] = useState(null);
  const [resumenCalificaciones, setResumenCalificaciones] = useState(null);
  const [pagosPorCuenta, setPagosPorCuenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    cargarReportes();
    
    // Detectar tamaño de pantalla
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cargarReportes = async (desde = fechaDesde, hasta = fechaHasta) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      const params = {};
      if (desde) params.fecha_desde = desde;
      if (hasta) params.fecha_hasta = hasta;
      
      const [metricasData, eventosData, resumenData, danosData, calificacionesData, pagosCuentaData] = await Promise.all([
        reportesService.getMetricas(params),
        reportesService.getEventosPorEstado().catch(() => null),
        reportesService.getResumenFinanciero().catch(() => null),
        reportesService.getResumenDanos(params).catch(() => null),
        reportesService.getResumenCalificaciones(params).catch(() => null),
        reportesService.getPagosPorCuenta(params).catch(() => null),
      ]);
      setMetricas(metricasData.metricas);
      setEventosPorEstado(eventosData?.resumen || null);
      setResumenFinanciero(resumenData?.resumen_financiero || null);
      setResumenDanos(danosData?.resumen || null);
      setResumenCalificaciones(calificacionesData?.resumen || null);
      setPagosPorCuenta(pagosCuentaData || null);
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

  const aplicarFiltros = () => {
    cargarReportes(fechaDesde, fechaHasta);
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    cargarReportes('', '');
  };

  const descargarReporte = async (tipo) => {
    try {
      setDescargando(tipo);
      const params = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      
      let response;
      switch (tipo) {
        case 'eventos':
          response = await reportesService.descargarEventos(params);
          break;
        case 'inventario':
          response = await reportesService.descargarInventario();
          break;
        case 'cardex':
          response = await reportesService.descargarCardex(params);
          break;
        case 'notificaciones':
          response = await reportesService.descargarNotificaciones(params);
          break;
        case 'clientes':
          response = await reportesService.descargarClientes();
          break;
        case 'pagos':
          response = await reportesService.descargarPagos(params);
          break;
        case 'danos':
          response = await reportesService.descargarDanos(params);
          break;
        case 'calificaciones':
          response = await reportesService.descargarCalificaciones(params);
          break;
        default:
          return;
      }
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo desde el header o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = `reporte_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error al descargar reporte de ${tipo}:`, err);
      if (mostrarToast) {
        showError(`Error al descargar el reporte de ${tipo}`);
      }
    } finally {
      setDescargando(null);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const formatearMonedaDecimal = (valor) =>
    new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(valor);

  // Componente KPI Card compacto y responsivo
  const KPICard = ({ titulo, valor, subtexto, icono, color, tendencia }) => (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: isMobile ? '1rem' : '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ 
            fontSize: isMobile ? '0.7rem' : '0.75rem', 
            color: '#6b7280', 
            margin: 0, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {titulo}
          </p>
          <p style={{ 
            fontSize: isMobile ? '1.25rem' : '1.75rem', 
            fontWeight: 700, 
            color: '#111827', 
            margin: '0.25rem 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {valor}
          </p>
          {subtexto && (
            <p style={{ 
              fontSize: isMobile ? '0.65rem' : '0.75rem', 
              color: tendencia === 'up' ? '#059669' : tendencia === 'down' ? '#dc2626' : '#6b7280', 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              whiteSpace: 'nowrap',
            }}>
              {tendencia === 'up' && <ArrowUpRight size={isMobile ? 10 : 12} />}
              {tendencia === 'down' && <ArrowDownRight size={isMobile ? 10 : 12} />}
              {subtexto}
            </p>
          )}
        </div>
        <div
          style={{
            width: isMobile ? '2rem' : '2.5rem',
            height: isMobile ? '2rem' : '2.5rem',
            borderRadius: '0.5rem',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: '0.5rem',
          }}
        >
          {React.createElement(icono, { size: isMobile ? 16 : 20, color: color })}
        </div>
      </div>
    </div>
  );

  // Barra de progreso horizontal compacta
  const ProgressBar = ({ label, valor, total, color }) => {
    const porcentaje = total > 0 ? (valor / total) * 100 : 0;
    return (
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{label}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>{valor}</span>
        </div>
        <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(porcentaje, 100)}%`, backgroundColor: color, borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
      </div>
    );
  };

  // Mini card de estado de evento (responsivo)
  const EstadoCard = ({ icono, label, valor, color, bgColor }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: isMobile ? '0.5rem' : '0.75rem',
      padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1rem',
      backgroundColor: bgColor,
      borderRadius: '0.5rem',
      flex: 1,
      minWidth: isMobile ? '100px' : '140px',
    }}>
      {React.createElement(icono, { size: isMobile ? 14 : 18, color: color })}
      <div>
        <p style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 700, color: color, margin: 0 }}>{valor}</p>
        <p style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: '#6b7280', margin: 0 }}>{label}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Activity size={48} color="#6366f1" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
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

  // Calculos financieros
  const totalIngresos = metricas.financiero?.total_ingresos || 0;
  const totalCobrado = metricas.financiero?.total_cobrado || 0;
  const saldoPendiente = metricas.financiero?.total_pendiente || 0;
  const porcentajeCobrado = totalIngresos > 0 ? ((totalCobrado / totalIngresos) * 100).toFixed(1) : 0;

  // Calculos de eventos
  const totalEventos = metricas.eventos?.total || 0;
  const eventosConfirmados = metricas.eventos?.confirmados || 0;
  const eventosEnProceso = metricas.eventos?.en_proceso || 0;
  const eventosCompletados = metricas.eventos?.completados || 0;
  const eventosCancelados = metricas.eventos?.cancelados || 0;
  const eventosCotizacion = metricas.eventos?.cotizacion || 0;

  // Calculos de notificaciones
  const totalWA = metricas.notificaciones?.whatsapp_total_out || 0;
  const maxWA = metricas.notificaciones?.maximo_whatsapp;
  const totalEmail = metricas.notificaciones?.envios?.email || 0;
  const maxEmail = metricas.notificaciones?.maximo_email;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '0 0.5rem' : 0 }}>
      {mostrarToast && <ToastContainer toasts={toasts} removeToast={removeToast} />}
      
      {/* Header con filtros */}
      <div style={{ 
        marginBottom: '1.5rem', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'flex-start', 
        gap: '1rem' 
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111827' }}>{titulo}</h1>
          <p style={{ color: '#6b7280', fontSize: isMobile ? '0.8rem' : '0.875rem', margin: 0 }}>{subtitulo}</p>
        </div>
        
        {/* Filtros de fecha - Responsivos */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center', 
          gap: '0.75rem', 
          flexWrap: 'wrap' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}>
            {!isMobile && <Calendar size={16} color="#6b7280" />}
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                flex: isMobile ? 1 : 'none',
                minWidth: isMobile ? '0' : 'auto',
              }}
              placeholder="Desde"
            />
            <span style={{ color: '#6b7280', display: isMobile ? 'none' : 'inline' }}>-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                flex: isMobile ? 1 : 'none',
                minWidth: isMobile ? '0' : 'auto',
              }}
              placeholder="Hasta"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={aplicarFiltros}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.875rem',
                flex: isMobile ? 1 : 'none',
              }}
            >
              <Filter size={14} />
              Filtrar
            </button>
            {(fechaDesde || fechaHasta) && (
              <button
                type="button"
                onClick={limpiarFiltros}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  flex: isMobile ? 1 : 'none',
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs Principales - Primera fila */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: isMobile ? '0.75rem' : '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <KPICard
          titulo="Ingresos Totales"
          valor={formatearMoneda(totalIngresos)}
          subtexto={`${totalEventos} eventos`}
          icono={DollarSign}
          color="#059669"
        />
        <KPICard
          titulo="Cobrado"
          valor={formatearMoneda(totalCobrado)}
          subtexto={`${porcentajeCobrado}% recaudado`}
          icono={CheckCircle}
          color="#3b82f6"
          tendencia="up"
        />
        <KPICard
          titulo="Pendiente"
          valor={formatearMoneda(saldoPendiente)}
          subtexto="Por cobrar"
          icono={Clock}
          color="#f59e0b"
          tendencia={saldoPendiente > totalCobrado ? 'down' : null}
        />
        <KPICard
          titulo="Ticket Promedio"
          valor={formatearMoneda(metricas.financiero?.ticket_promedio || 0)}
          subtexto="Por evento"
          icono={TrendingUp}
          color="#8b5cf6"
        />
        <KPICard
          titulo="Clientes"
          valor={metricas.clientes?.total || 0}
          subtexto={`${(metricas.clientes?.promedio_eventos_cliente || 0).toFixed(1)} eventos/cliente`}
          icono={Users}
          color="#ec4899"
        />
      </div>

      {/* KPIs de Daños y Calificaciones */}
      {(resumenDanos || resumenCalificaciones) && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: isMobile ? '0.75rem' : '1rem', 
          marginBottom: '1.5rem' 
        }}>
          {/* Indicadores de Daños */}
          {resumenDanos && (
            <>
              <KPICard
                titulo="Eventos con Daños"
                valor={resumenDanos.total_eventos_con_danos || 0}
                subtexto={`${resumenDanos.eventos_pendientes_pago || 0} pendientes pago`}
                icono={AlertTriangle}
                color="#dc2626"
                tendencia={resumenDanos.eventos_pendientes_pago > 0 ? 'down' : null}
              />
              <KPICard
                titulo="Costo Total Daños"
                valor={formatearMoneda(resumenDanos.costo_total_danos || 0)}
                subtexto={`${formatearMoneda(resumenDanos.total_asumido_empresa || 0)} asumido`}
                icono={AlertCircle}
                color="#f59e0b"
              />
              <KPICard
                titulo="Daños Cobrados"
                valor={formatearMoneda(resumenDanos.total_pagado || 0)}
                subtexto={`${formatearMoneda(resumenDanos.total_pendiente || 0)} pendiente`}
                icono={DollarSign}
                color={resumenDanos.total_pendiente > 0 ? '#f59e0b' : '#10b981'}
                tendencia={resumenDanos.total_pendiente > 0 ? 'down' : 'up'}
              />
            </>
          )}
          
          {/* Indicadores de Calificaciones */}
          {resumenCalificaciones && (
            <>
              <KPICard
                titulo="Promedio Calificación"
                valor={`${(resumenCalificaciones.promedio_calificacion || 0).toFixed(1)} / 5`}
                subtexto={`${resumenCalificaciones.total_calificaciones || 0} evaluaciones`}
                icono={Star}
                color="#f59e0b"
                tendencia={resumenCalificaciones.promedio_calificacion >= 4 ? 'up' : resumenCalificaciones.promedio_calificacion < 3 ? 'down' : null}
              />
              <KPICard
                titulo="Calificaciones 5⭐"
                valor={resumenCalificaciones.calificaciones_5 || 0}
                subtexto={`${((resumenCalificaciones.calificaciones_5 || 0) / Math.max(resumenCalificaciones.total_calificaciones || 1, 1) * 100).toFixed(0)}% del total`}
                icono={Star}
                color="#10b981"
                tendencia="up"
              />
              <KPICard
                titulo="Pendientes de Calificar"
                valor={resumenCalificaciones.pendientes_calificar || 0}
                subtexto="Eventos completados"
                icono={Clock}
                color="#6366f1"
              />
            </>
          )}
        </div>
      )}

      {/* Segunda fila: Estado Financiero + Pipeline de Eventos */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        {/* Estado Financiero - Gráfico de progreso */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: isMobile ? '1rem' : '1.25rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#374151' }}>
            Estado de Cartera
          </h3>
          
          {/* Barra visual principal */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', height: '32px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
              <div 
                style={{ 
                  width: `${totalIngresos > 0 ? (totalCobrado / totalIngresos) * 100 : 0}%`, 
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'width 0.5s ease',
                }}
              >
                {totalIngresos > 0 && (totalCobrado / totalIngresos) * 100 > 15 && (
                  <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                    {formatearMoneda(totalCobrado)}
                  </span>
                )}
              </div>
              <div 
                style={{ 
                  width: `${totalIngresos > 0 ? (saldoPendiente / totalIngresos) * 100 : 0}%`, 
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'width 0.5s ease',
                }}
              >
                {totalIngresos > 0 && (saldoPendiente / totalIngresos) * 100 > 15 && (
                  <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                    {formatearMoneda(saldoPendiente)}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Cobrado ({porcentajeCobrado}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Pendiente ({(100 - parseFloat(porcentajeCobrado)).toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total de pagos recibidos</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>{metricas.financiero?.total_pagos || 0}</span>
            </div>
          </div>
        </div>

        {/* Pipeline de Eventos */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: isMobile ? '1rem' : '1.25rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#374151' }}>
            Pipeline de Eventos
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: isMobile ? '0.5rem' : '0.75rem' 
          }}>
            <EstadoCard icono={FileText} label="Cotización" valor={eventosCotizacion} color="#6b7280" bgColor="#f9fafb" />
            <EstadoCard icono={CheckCircle} label="Confirmados" valor={eventosConfirmados} color="#8b5cf6" bgColor="#f5f3ff" />
            <EstadoCard icono={Activity} label="En Proceso" valor={eventosEnProceso} color="#3b82f6" bgColor="#eff6ff" />
            <EstadoCard icono={Target} label="Completados" valor={eventosCompletados} color="#059669" bgColor="#ecfdf5" />
            <EstadoCard icono={XCircle} label="Cancelados" valor={eventosCancelados} color="#dc2626" bgColor="#fef2f2" />
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Promedio invitados/evento</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>{Math.round(metricas.estadisticas?.promedio_invitados || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tercera fila: Comunicaciones + Recursos */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        {/* Comunicaciones */}
        {metricas?.notificaciones && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: isMobile ? '1rem' : '1.25rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#374151' }}>
              Comunicaciones
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* WhatsApp */}
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '0.5rem', padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MessageCircle size={16} color="#059669" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>WhatsApp</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {totalWA}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6b7280' }}>
                    {' '}/ {maxWA !== null && maxWA !== undefined ? maxWA.toLocaleString() : '∞'}
                  </span>
                </p>
                {maxWA !== null && maxWA !== undefined && totalWA > maxWA && (
                  <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '0.25rem 0 0 0' }}>
                    Excedidos: {totalWA - maxWA}
                  </p>
                )}
              </div>

              {/* Email */}
              <div style={{ backgroundColor: '#eff6ff', borderRadius: '0.5rem', padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Mail size={16} color="#3b82f6" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6' }}>Email</span>
                </div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {totalEmail}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6b7280' }}>
                    {' '}/ {maxEmail !== null && maxEmail !== undefined ? maxEmail.toLocaleString() : '∞'}
                  </span>
                </p>
                {maxEmail !== null && maxEmail !== undefined && totalEmail > maxEmail && (
                  <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '0.25rem 0 0 0' }}>
                    Excedidos: {totalEmail - maxEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Costos */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Costo WhatsApp</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>
                  {formatearMonedaDecimal(metricas.notificaciones.whatsapp_total_cost || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Costo Email</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>
                  {formatearMonedaDecimal(metricas.notificaciones.email_total_cost || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recursos del Sistema */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: isMobile ? '1rem' : '1.25rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#374151' }}>
            Recursos del Sistema
          </h3>

          <ProgressBar
            label="Productos activos"
            valor={`${metricas.recursos?.productos?.activos || 0} / ${metricas.recursos?.productos?.total || 0}`}
            total={metricas.recursos?.productos?.total || 1}
            color="#6366f1"
          />
          <ProgressBar
            label="Planes activos"
            valor={`${metricas.recursos?.planes?.activos || 0} / ${metricas.recursos?.planes?.total || 0}`}
            total={metricas.recursos?.planes?.total || 1}
            color="#8b5cf6"
          />
          <ProgressBar
            label="Salones activos"
            valor={`${metricas.recursos?.salones?.activos || 0} / ${metricas.recursos?.salones?.total || 0}`}
            total={metricas.recursos?.salones?.total || 1}
            color="#10b981"
          />
        </div>
      </div>

      {/* Tabla de notificaciones por tipo (compacta y responsiva) */}
      {metricas?.notificaciones?.por_tipo && metricas.notificaciones.por_tipo.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: isMobile ? '1rem' : '1.25rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#374151' }}>
            Detalle de Notificaciones
          </h3>
          <div style={{ overflowX: 'auto', margin: isMobile ? '0 -1rem' : 0, padding: isMobile ? '0 1rem' : 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '0.75rem' : '0.8rem', minWidth: isMobile ? '400px' : 'auto' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Tipo</th>
                  <th style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Email</th>
                  <th style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>WA</th>
                  <th style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Total</th>
                  <th style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Costo</th>
                </tr>
              </thead>
              <tbody>
                {metricas.notificaciones.por_tipo.map((row) => (
                  <tr key={row.tipo_notificacion} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: isMobile ? '0.5rem' : '0.6rem', color: '#4b5563', whiteSpace: 'nowrap' }}>{row.tipo_notificacion.replace(/_/g, ' ')}</td>
                    <td style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'center', color: '#4b5563' }}>{row.email_out}</td>
                    <td style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'center', color: '#4b5563' }}>{row.whatsapp_out}</td>
                    <td style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'center', fontWeight: 600, color: '#111827' }}>{row.total}</td>
                    <td style={{ padding: isMobile ? '0.5rem' : '0.6rem', textAlign: 'right', color: '#4b5563', whiteSpace: 'nowrap' }}>
                      {formatearMonedaDecimal((row.costo_email || 0) + (row.costo_whatsapp || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección de Descarga de Reportes */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        padding: isMobile ? '1rem' : '1.5rem', 
        border: '1px solid #e5e7eb',
        marginTop: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <FileSpreadsheet size={isMobile ? 18 : 20} color="#6366f1" />
          <h3 style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 600, margin: 0, color: '#374151' }}>
            Descargar Reportes
          </h3>
        </div>
        <p style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
          {isMobile 
            ? 'Descarga los datos en CSV.' 
            : `Descarga los datos de su sistema. ${fechaDesde || fechaHasta ? 'Los reportes con filtro de fecha usarán el rango seleccionado.' : 'Usa los filtros de fecha para limitar los datos.'}`
          }
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: isMobile ? '0.75rem' : '1rem' 
        }}>
          {/* Reporte de Eventos */}
          <button
            onClick={() => descargarReporte('eventos')}
            disabled={descargando === 'eventos'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'eventos' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'eventos' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Calendar size={isMobile ? 14 : 18} color="#2563eb" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Eventos</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'eventos' ? 'Descargando...' : 'Lista completa'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>

          {/* Reporte de Pagos */}
          <button
            onClick={() => descargarReporte('pagos')}
            disabled={descargando === 'pagos'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'pagos' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'pagos' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CreditCard size={isMobile ? 14 : 18} color="#16a34a" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Pagos</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'pagos' ? 'Descargando...' : 'Historial'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>

          {/* Reporte de Inventario */}
          <button
            onClick={() => descargarReporte('inventario')}
            disabled={descargando === 'inventario'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'inventario' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'inventario' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Package size={isMobile ? 14 : 18} color="#d97706" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Inventario</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'inventario' ? 'Descargando...' : 'Productos'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>

          {/* Reporte de Cardex */}
          <button
            onClick={() => descargarReporte('cardex')}
            disabled={descargando === 'cardex'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'cardex' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'cardex' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Box size={isMobile ? 14 : 18} color="#4f46e5" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Cardex</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'cardex' ? 'Descargando...' : 'Movimientos'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>

          {/* Reporte de Notificaciones */}
          <button
            onClick={() => descargarReporte('notificaciones')}
            disabled={descargando === 'notificaciones'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'notificaciones' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'notificaciones' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#fce7f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bell size={isMobile ? 14 : 18} color="#db2777" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Notificaciones</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'notificaciones' ? 'Descargando...' : 'Historial'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>

          {/* Reporte de Clientes */}
          <button
            onClick={() => descargarReporte('clientes')}
            disabled={descargando === 'clientes'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'clientes' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'clientes' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Users size={isMobile ? 14 : 18} color="#9333ea" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Clientes</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'clientes' ? 'Descargando...' : 'Base de datos'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>

          {/* Reporte de Daños */}
          <button
            onClick={() => descargarReporte('danos')}
            disabled={descargando === 'danos'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'danos' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'danos' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={isMobile ? 14 : 18} color="#dc2626" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Daños</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'danos' ? 'Descargando...' : 'Registro de daños'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>

          {/* Reporte de Calificaciones */}
          <button
            onClick={() => descargarReporte('calificaciones')}
            disabled={descargando === 'calificaciones'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '0.75rem',
              padding: isMobile ? '0.75rem' : '1rem',
              backgroundColor: descargando === 'calificaciones' ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: descargando === 'calificaciones' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => !descargando && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          >
            <div style={{ 
              width: isMobile ? '2rem' : '2.5rem', 
              height: isMobile ? '2rem' : '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#fef9c3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Star size={isMobile ? 14 : 18} color="#ca8a04" />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#111827' }}>Calificaciones</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {descargando === 'calificaciones' ? 'Descargando...' : 'Evaluaciones clientes'}
              </div>
            </div>
            <Download size={isMobile ? 14 : 18} color="#6b7280" />
          </button>
        </div>
      </div>

      {/* Sección de Pagos por Cuenta */}
      {pagosPorCuenta && pagosPorCuenta.pagos_por_cuenta && pagosPorCuenta.pagos_por_cuenta.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          padding: isMobile ? '1rem' : '1.5rem',
          marginTop: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              backgroundColor: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Landmark size={20} color="#4f46e5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#111827' }}>
                Pagos por Cuenta Destino
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                Distribución de ingresos por cuenta bancaria
              </p>
            </div>
          </div>

          {/* Totales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Total Ingresos</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(pagosPorCuenta.total_ingresos || 0)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Total Reembolsos</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444' }}>
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(pagosPorCuenta.total_reembolsos || 0)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Neto Total</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4f46e5' }}>
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(pagosPorCuenta.total_general || 0)}
              </div>
            </div>
          </div>

          {/* Tabla de cuentas */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Cuenta</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Tipo</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Pagos</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Ingresos</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Reembolsos</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Neto</th>
                </tr>
              </thead>
              <tbody>
                {pagosPorCuenta.pagos_por_cuenta.map((cuenta) => (
                  <tr key={cuenta.cuenta_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{cuenta.nombre_cuenta}</div>
                      {cuenta.numero_cuenta && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{cuenta.numero_cuenta}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        backgroundColor:
                          cuenta.tipo_cuenta === 'ahorros' ? '#dbeafe' :
                          cuenta.tipo_cuenta === 'corriente' ? '#e0f2fe' :
                          cuenta.tipo_cuenta === 'digital' ? '#f3e8ff' :
                          cuenta.tipo_cuenta === 'efectivo' ? '#dcfce7' : '#f3f4f6',
                        color:
                          cuenta.tipo_cuenta === 'ahorros' ? '#1d4ed8' :
                          cuenta.tipo_cuenta === 'corriente' ? '#0369a1' :
                          cuenta.tipo_cuenta === 'digital' ? '#7c3aed' :
                          cuenta.tipo_cuenta === 'efectivo' ? '#16a34a' : '#6b7280',
                      }}>
                        {cuenta.tipo_cuenta === 'ahorros' ? 'Ahorros' :
                         cuenta.tipo_cuenta === 'corriente' ? 'Corriente' :
                         cuenta.tipo_cuenta === 'digital' ? 'Digital' :
                         cuenta.tipo_cuenta === 'efectivo' ? 'Efectivo' : cuenta.tipo_cuenta}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                      {cuenta.total_pagos}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cuenta.total_ingresos)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#ef4444', fontWeight: '500' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cuenta.total_reembolsos)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#4f46e5', fontWeight: '700' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cuenta.total_neto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
