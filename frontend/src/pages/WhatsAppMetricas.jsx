import React, { useEffect, useMemo, useState } from 'react';
import { whatsappMetricasService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

const WhatsAppMetricas = () => {
  const { toasts, removeToast, error: showError, success } = useToast();
  const [resumen, setResumen] = useState(null);
  const [config, setConfig] = useState({ precio_whatsapp: 0, precio_email: 0, whatsapp_desactivado: false });
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const [resumenResp, clientesResp] = await Promise.all([
        whatsappMetricasService.getResumen(),
        whatsappMetricasService.getClientes(),
      ]);
      setResumen(resumenResp.resumen || {});
      setConfig(resumenResp.config || { precio_whatsapp: 0, precio_email: 0, whatsapp_desactivado: false });
      setClientes(clientesResp.clientes || []);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al cargar métricas';
      showError(mensaje);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

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
      });
      success('Precios actualizados');
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
    const totalWhatsapp = clientes.reduce((acc, c) => acc + (c.whatsapp_out || 0) + (c.whatsapp_sistema || 0), 0);
    const totalEmail = clientes.reduce((acc, c) => acc + (c.email_out || 0), 0);
    const totalCostoWhatsapp = clientes.reduce((acc, c) => acc + (c.costo_whatsapp || 0), 0);
    const totalCostoEmail = clientes.reduce((acc, c) => acc + (c.costo_email || 0), 0);
    return {
      totalWhatsapp,
      totalEmail,
      totalCostoWhatsapp,
      totalCostoEmail,
    };
  }, [clientes]);

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Panel WhatsApp & Email</h2>
        <p style={{ color: 'var(--gray-600)' }}>
          Control de consumos, costos y bloqueos por cliente.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>WhatsApp Out</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{resumen?.whatsapp_out || 0}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            Bot: {resumen?.whatsapp_bot || 0} · Humano: {resumen?.whatsapp_humano || 0}
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>WhatsApp In</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{resumen?.whatsapp_in || 0}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            Sistema (notificaciones): {resumen?.whatsapp_sistema || 0}
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Email enviados</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{resumen?.email_out || 0}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Totales actuales</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>WhatsApp: {totales.totalWhatsapp}</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Email: {totales.totalEmail}</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Costo: ${totales.totalCostoWhatsapp.toFixed(2)} · ${totales.totalCostoEmail.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Precios base</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.75rem', alignItems: 'center' }}>
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
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>WhatsApp Out</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>WhatsApp Sistema</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Bot/Humano</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Costo WhatsApp</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Costo Email</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Bloqueos</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr key={c.cliente_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{c.nombre_cliente}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{c.telefono}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{c.whatsapp_out || 0}</td>
                  <td style={{ padding: '0.75rem' }}>{c.whatsapp_sistema || 0}</td>
                  <td style={{ padding: '0.75rem' }}>{c.whatsapp_bot || 0} / {c.whatsapp_humano || 0}</td>
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
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '1rem', color: '#9ca3af' }}>
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
