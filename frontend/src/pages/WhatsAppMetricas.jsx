import React, { useEffect, useMemo, useState } from 'react';
import { whatsappMetricasService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Calendar, Filter } from 'lucide-react';

const WhatsAppMetricas = () => {
  const { toasts, removeToast, error: showError, success } = useToast();
  const [resumen, setResumen] = useState(null);
  const [config, setConfig] = useState({ 
    precio_whatsapp: 0, 
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
            <div>Chat: {(resumen?.whatsapp_bot || 0) + (resumen?.whatsapp_humano || 0)}</div>
            <div style={{ marginTop: '0.25rem' }}>
              Bot: {resumen?.whatsapp_bot || 0} · Humano: {resumen?.whatsapp_humano || 0}
            </div>
            <div style={{ marginTop: '0.25rem', color: '#6366f1' }}>
              Notificaciones: {resumen?.whatsapp_notificaciones || resumen?.whatsapp_sistema || 0}
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
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
            <div>Costo WhatsApp: ${totales.totalCostoWhatsapp.toFixed(2)}</div>
            <div style={{ marginTop: '0.25rem' }}>Costo Email: ${totales.totalCostoEmail.toFixed(2)}</div>
            <div style={{ marginTop: '0.5rem', fontWeight: 700, color: '#374151' }}>
              Total: ${(totales.totalCostoWhatsapp + totales.totalCostoEmail).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Configuración</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>Precio WhatsApp</label>
            <input
              value={config.precio_whatsapp}
              onChange={(e) => setConfig((prev) => ({ ...prev, precio_whatsapp: e.target.value }))}
              type="number"
              step="0.0001"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
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
    </div>
  );
};

export default WhatsAppMetricas;
