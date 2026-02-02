import React, { useEffect, useMemo, useState } from 'react';
import { whatsappMetricasService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Calendar, Filter, MessageSquare, X } from 'lucide-react';

const WhatsAppMetricas = () => {
  const { toasts, removeToast, error: showError, success } = useToast();
  const [resumen, setResumen] = useState(null);
  const [config, setConfig] = useState({ 
    precio_whatsapp: 0, 
    precio_whatsapp_marketing: 0,
    precio_whatsapp_utility: 0,
    precio_whatsapp_service: 0,
    precio_email: 0, 
    whatsapp_desactivado: false,
    maximo_whatsapp: null,
    maximo_email: null
  });
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  // Modal detalle mensajes
  const [modalCliente, setModalCliente] = useState(null);
  const [mensajesDetalle, setMensajesDetalle] = useState([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);

  const cargar = async (desde = fechaDesde, hasta = fechaHasta) => {
    try {
      const params = {};
      if (desde) params.fecha_desde = desde;
      if (hasta) params.fecha_hasta = hasta;
      
      const [resumenResp, clientesResp] = await Promise.all([
        whatsappMetricasService.getResumen(params),
        whatsappMetricasService.getClientes(params),
      ]);
      setResumen(resumenResp.resumen || {});
      setConfig(resumenResp.config || { 
        precio_whatsapp: 0,
        precio_whatsapp_marketing: 0,
        precio_whatsapp_utility: 0,
        precio_whatsapp_service: 0,
        precio_email: 0, 
        whatsapp_desactivado: false,
        maximo_whatsapp: null,
        maximo_email: null
      });
      setClientes(clientesResp.clientes || []);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al cargar métricas';
      showError(mensaje);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const aplicarFiltros = () => {
    cargar(fechaDesde, fechaHasta);
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    cargar('', '');
  };

  const parseDecimal = (valor) => {
    if (valor === null || valor === undefined) return 0;
    const normalizado = String(valor).replace(',', '.').trim();
    const parsed = Number(normalizado);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const guardarConfig = async () => {
    try {
      setGuardando(true);
      await whatsappMetricasService.updateConfig({
        precio_whatsapp: parseDecimal(config.precio_whatsapp),
        precio_whatsapp_marketing: parseDecimal(config.precio_whatsapp_marketing),
        precio_whatsapp_utility: parseDecimal(config.precio_whatsapp_utility),
        precio_whatsapp_service: parseDecimal(config.precio_whatsapp_service),
        precio_email: parseDecimal(config.precio_email),
        whatsapp_desactivado: Boolean(config.whatsapp_desactivado),
        maximo_whatsapp: config.maximo_whatsapp ? parseInt(config.maximo_whatsapp) : null,
        maximo_email: config.maximo_email ? parseInt(config.maximo_email) : null,
      });
      success('Configuración actualizada');
      await cargar();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo actualizar';
      showError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const toggleWhatsapp = async () => {
    const nuevoEstado = !config.whatsapp_desactivado;
    try {
      setGuardando(true);
      await whatsappMetricasService.updateConfig({
        precio_whatsapp: parseDecimal(config.precio_whatsapp),
        precio_whatsapp_marketing: parseDecimal(config.precio_whatsapp_marketing),
        precio_whatsapp_utility: parseDecimal(config.precio_whatsapp_utility),
        precio_whatsapp_service: parseDecimal(config.precio_whatsapp_service),
        precio_email: parseDecimal(config.precio_email),
        whatsapp_desactivado: nuevoEstado,
        maximo_whatsapp: config.maximo_whatsapp ? parseInt(config.maximo_whatsapp) : null,
        maximo_email: config.maximo_email ? parseInt(config.maximo_email) : null,
      });
      setConfig((prev) => ({ ...prev, whatsapp_desactivado: nuevoEstado }));
      success(nuevoEstado ? 'WhatsApp desactivado' : 'WhatsApp activado');
      await cargar();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo actualizar';
      showError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const actualizarControl = async (clienteId, patch) => {
    try {
      await whatsappMetricasService.updateControlCliente(clienteId, patch);
      await cargar();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo actualizar control';
      showError(mensaje);
    }
  };

  const abrirDetalleMensajes = async (cliente) => {
    setModalCliente(cliente);
    setMensajesDetalle([]);
    setLoadingMensajes(true);
    try {
      const params = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const data = await whatsappMetricasService.getMensajesCliente(cliente.cliente_id, params);
      setMensajesDetalle(data.mensajes || []);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al cargar mensajes';
      showError(mensaje);
      setMensajesDetalle([]);
    } finally {
      setLoadingMensajes(false);
    }
  };

  const cerrarModalDetalle = () => {
    setModalCliente(null);
    setMensajesDetalle([]);
  };

  const etiquetaOrigen = (origen) => {
    const map = { campana: 'Campaña', sistema: 'Sistema', bot: 'Bot', humano: 'Humano' };
    return map[origen] || origen || '—';
  };

  const clientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return clientes;
    const needle = busqueda.toLowerCase();
    return clientes.filter(
      (c) =>
        String(c.nombre_cliente || '').toLowerCase().includes(needle) ||
        String(c.telefono || '').toLowerCase().includes(needle)
    );
  }, [busqueda, clientes]);

  const totales = useMemo(() => {
    // Calcular totales desde el resumen global (más preciso)
    const totalWhatsappOut = resumen?.whatsapp_out || 0;
    const totalWhatsappIn = resumen?.whatsapp_in || 0;
    const totalEmail = resumen?.email_out || 0;
    
    // Usar costos totales desde el resumen (igual que reportes)
    // Esto asegura que ambos módulos muestren los mismos valores
    const totalCostoWhatsapp = resumen?.costo_whatsapp_total || 0;
    const totalCostoEmail = resumen?.costo_email_total || 0;
    
    return {
      totalWhatsappOut,
      totalWhatsappIn,
      totalWhatsapp: totalWhatsappOut + totalWhatsappIn,
      totalEmail,
      totalCostoWhatsapp,
      totalCostoEmail,
      totalCosto: totalCostoWhatsapp + totalCostoEmail,
    };
  }, [resumen]);

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Panel WhatsApp & Email</h2>
          <p style={{ color: 'var(--gray-600)' }}>
            Control de consumos, costos y bloqueos por cliente.
          </p>
        </div>
        
        {/* Filtros de fecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="#6b7280" />
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
              }}
              placeholder="Desde"
            />
            <span style={{ color: '#6b7280' }}>-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
              }}
              placeholder="Hasta"
            />
          </div>
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
              gap: '0.35rem',
              fontSize: '0.875rem',
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
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.25rem' }}>WhatsApp Salientes</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3b82f6' }}>{resumen?.whatsapp_out || 0}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ color: '#dc2626', fontWeight: 500 }}>
              🎯 Campañas (Marketing): {resumen?.whatsapp_campana || 0}
            </div>
            <div style={{ marginTop: '0.25rem', color: '#6366f1' }}>
              📋 Notificaciones (Utility): {resumen?.whatsapp_notificaciones || 0}
            </div>
            <div style={{ marginTop: '0.25rem', color: '#10b981' }}>
              💬 Chat (Service): {(resumen?.whatsapp_bot || 0) + (resumen?.whatsapp_humano || 0)}
              <span style={{ color: '#9ca3af', marginLeft: '0.5rem' }}>
                (Bot: {resumen?.whatsapp_bot || 0} · Humano: {resumen?.whatsapp_humano || 0})
              </span>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.25rem' }}>WhatsApp Entrantes</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{resumen?.whatsapp_in || 0}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Mensajes recibidos del cliente
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email Enviados</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#8b5cf6' }}>{resumen?.email_out || 0}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Notificaciones por correo
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Resumen Total</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            WhatsApp: {(resumen?.whatsapp_out || 0) + (resumen?.whatsapp_in || 0)}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Email: {resumen?.email_out || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ color: '#dc2626' }}>Marketing: ${(resumen?.costo_marketing || 0).toFixed(2)}</div>
            <div style={{ color: '#6366f1' }}>Utility: ${(resumen?.costo_utility || 0).toFixed(2)}</div>
            <div style={{ color: '#10b981' }}>Service: ${(resumen?.costo_service || 0).toFixed(2)}</div>
            <div style={{ marginTop: '0.25rem' }}>Email: ${totales.totalCostoEmail.toFixed(2)}</div>
            <div style={{ marginTop: '0.5rem', fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>
              Total: ${(totales.totalCostoWhatsapp + totales.totalCostoEmail).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Configuración</h3>
        
        {/* Precios por tipo de mensaje */}
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>
            Precios por tipo de mensaje WhatsApp
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#dc2626' }}>
                🎯 Marketing (Campañas)
              </label>
              <input
                value={config.precio_whatsapp_marketing || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, precio_whatsapp_marketing: e.target.value }))}
                type="number"
                step="0.0001"
                placeholder="0.0500"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#6366f1' }}>
                📋 Utility (Notificaciones)
              </label>
              <input
                value={config.precio_whatsapp_utility || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, precio_whatsapp_utility: e.target.value }))}
                type="number"
                step="0.0001"
                placeholder="0.0200"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #a5b4fc', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#10b981' }}>
                💬 Service (Chat 24h)
              </label>
              <input
                value={config.precio_whatsapp_service || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, precio_whatsapp_service: e.target.value }))}
                type="number"
                step="0.0001"
                placeholder="0.0000"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#6b7280' }}>
                Precio General (fallback)
              </label>
              <input
                value={config.precio_whatsapp}
                onChange={(e) => setConfig((prev) => ({ ...prev, precio_whatsapp: e.target.value }))}
                type="number"
                step="0.0001"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>Precio Email</label>
            <input
              value={config.precio_email}
              onChange={(e) => setConfig((prev) => ({ ...prev, precio_email: e.target.value }))}
              type="number"
              step="0.0001"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>Máximo WhatsApp</label>
            <input
              value={config.maximo_whatsapp || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, maximo_whatsapp: e.target.value || null }))}
              type="number"
              min="1"
              placeholder="Ilimitado"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>Máximo Email</label>
            <input
              value={config.maximo_email || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, maximo_email: e.target.value || null }))}
              type="number"
              min="1"
              placeholder="Ilimitado"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={toggleWhatsapp}
            disabled={guardando}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: config.whatsapp_desactivado ? '#ef4444' : '#f3f4f6',
              color: config.whatsapp_desactivado ? 'white' : '#374151',
              cursor: guardando ? 'not-allowed' : 'pointer',
            }}
          >
            {guardando ? 'Actualizando...' : (config.whatsapp_desactivado ? 'Activar WhatsApp' : 'Desactivar WhatsApp')}
          </button>
          <button
            type="button"
            onClick={guardarConfig}
            disabled={guardando}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              cursor: guardando ? 'not-allowed' : 'pointer',
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '0.9rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Clientes</h3>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente o telefono"
            style={{ padding: '0.5rem 0.75rem', borderRadius: '999px', border: '1px solid #e5e7eb' }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>WhatsApp Enviados</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Costo WhatsApp</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Costo Email</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Bloqueos</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => {
                const totalWA = c.whatsapp_out || 0;
                const sistemaWA = c.whatsapp_sistema || 0;
                const chatWA = (c.whatsapp_bot || 0) + (c.whatsapp_humano || 0);
                return (
                <tr key={c.cliente_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{c.nombre_cliente}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{c.telefono}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{totalWA}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {sistemaWA > 0 && <span>Sistema: {sistemaWA}</span>}
                      {sistemaWA > 0 && chatWA > 0 && <span> · </span>}
                      {chatWA > 0 && <span>Chat: {chatWA}</span>}
                      {sistemaWA === 0 && chatWA === 0 && totalWA > 0 && <span>Otros: {totalWA}</span>}
                    </div>
                    {totalWA > 0 && (
                      <button
                        type="button"
                        onClick={() => abrirDetalleMensajes(c)}
                        style={{
                          marginTop: '0.35rem',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #3b82f6',
                          background: '#eff6ff',
                          color: '#2563eb',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <MessageSquare size={12} />
                        Ver detalle
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{c.email_out || 0}</td>
                  <td style={{ padding: '0.75rem' }}>${(c.costo_whatsapp || 0).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>${(c.costo_email || 0).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => actualizarControl(c.cliente_id, { bloquear_whatsapp: !c.bloquear_whatsapp })}
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          background: c.bloquear_whatsapp ? '#ef4444' : '#f3f4f6',
                          color: c.bloquear_whatsapp ? 'white' : '#374151',
                          cursor: 'pointer',
                        }}
                      >
                        {c.bloquear_whatsapp ? 'Desbloq. WhatsApp' : 'Bloq. WhatsApp'}
                      </button>
                      <button
                        type="button"
                        onClick={() => actualizarControl(c.cliente_id, { bloquear_email: !c.bloquear_email })}
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          background: c.bloquear_email ? '#ef4444' : '#f3f4f6',
                          color: c.bloquear_email ? 'white' : '#374151',
                          cursor: 'pointer',
                        }}
                      >
                        {c.bloquear_email ? 'Desbloq. Email' : 'Bloq. Email'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', color: '#9ca3af' }}>
                    No hay clientes para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal detalle mensajes */}
      {modalCliente && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && cerrarModalDetalle()}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Mensajes WhatsApp · {modalCliente.nombre_cliente}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  {modalCliente.telefono}
                  {(fechaDesde || fechaHasta) && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {fechaDesde || '…'} — {fechaHasta || '…'}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalDetalle}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ overflow: 'auto', flex: 1, padding: '0.75rem' }}>
              {loadingMensajes ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Cargando mensajes...</p>
              ) : mensajesDetalle.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No hay mensajes en el período seleccionado.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>Fecha</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>Dirección</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>Tipo</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>Mensaje</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mensajesDetalle.map((m) => {
                      const fecha = m.fecha_creacion ? (m.fecha_creacion.slice ? m.fecha_creacion.slice(0, 19).replace('T', ' ') : String(m.fecha_creacion)) : '—';
                      const dir = m.direccion === 'out' ? 'Saliente' : 'Entrante';
                      const costo = m.costo_total != null ? Number(m.costo_total).toFixed(2) : '—';
                      return (
                        <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{fecha}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <span style={{ color: m.direccion === 'out' ? '#3b82f6' : '#10b981', fontWeight: 500 }}>{dir}</span>
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <span style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              background: m.origen === 'campana' ? '#fef2f2' : m.origen === 'sistema' ? '#eef2ff' : m.origen === 'bot' ? '#f0fdf4' : '#f5f5f5',
                              color: m.origen === 'campana' ? '#dc2626' : m.origen === 'sistema' ? '#6366f1' : m.origen === 'bot' ? '#10b981' : '#374151',
                            }}>
                              {etiquetaOrigen(m.origen)}
                            </span>
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.mensaje || ''}>
                            {m.media_type ? `[${m.media_type}] ` : ''}{(m.mensaje || '').slice(0, 80)}{(m.mensaje && m.mensaje.length > 80) ? '…' : ''}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#6b7280' }}>{costo !== '—' ? `$${costo}` : costo}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppMetricas;
