import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificacionesNativasService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

const NotificacionesNativas = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [configuraciones, setConfiguraciones] = useState([]);
  const navigate = useNavigate();

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionesNativasService.getConfiguraciones();
      setConfiguraciones(data.configuraciones || []);
    } catch (err) {
      const mensaje = err.response?.data?.error || err.message || 'Error al cargar notificaciones';
      showError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const formatMedio = (config) => {
    const medios = [];
    if (config.enviar_email) medios.push('Email');
    if (config.enviar_whatsapp) medios.push('WhatsApp');
    if (medios.length === 0) return 'Sin canal';
    return medios.join(' + ');
  };

  const formatCuando = (config) => {
    const dias = Number(config.dias_antes ?? 0);
    if (dias === 0) return 'Inmediato (al registrar pago)';
    if (dias === -1) return 'Despues del evento';
    return `${dias} dias antes del evento`;
  };

  const toggleEstado = async (config) => {
    try {
      const nuevoEstado = !config.activo;
      await notificacionesNativasService.updateEstado(config.tipo_notificacion, nuevoEstado);
      setConfiguraciones((prev) =>
        prev.map((item) =>
          item.tipo_notificacion === config.tipo_notificacion ? { ...item, activo: nuevoEstado } : item
        )
      );
      success(nuevoEstado ? 'Notificacion activada' : 'Notificacion desactivada');
    } catch (err) {
      const mensaje = err.response?.data?.error || err.message || 'Error al actualizar estado';
      showError(mensaje);
    }
  };

  const iniciarEdicion = (config) => {
    navigate(`/notificaciones-nativas/${config.tipo_notificacion}`);
  };

  const rows = useMemo(() => configuraciones, [configuraciones]);

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Notificaciones nativas</h2>
        <p style={{ color: 'var(--gray-600)' }}>
          Lista de notificaciones del sistema actual, con su estado, canal y momento de ejecucion.
        </p>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid var(--gray-100)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Medio</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Cuando se ejecuta</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Estado</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Accion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((config) => (
                <tr key={config.tipo_notificacion} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '0.75rem' }}>{config.nombre}</td>
                  <td style={{ padding: '0.75rem' }}>{config.tipo_notificacion}</td>
                  <td style={{ padding: '0.75rem' }}>{formatMedio(config)}</td>
                  <td style={{ padding: '0.75rem' }}>{formatCuando(config)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {config.activo ? 'Activo' : 'Inactivo'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => toggleEstado(config)}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px solid var(--gray-200)',
                          background: config.activo ? 'var(--gray-100)' : 'var(--primary)',
                          color: config.activo ? 'var(--gray-700)' : 'white',
                          cursor: 'pointer',
                        }}
                      >
                        {config.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => iniciarEdicion(config)}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px solid var(--gray-200)',
                          background: 'white',
                          color: 'var(--gray-700)',
                          cursor: 'pointer',
                        }}
                      >
                        Editar mensaje
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', color: 'var(--gray-500)' }}>
                    No hay configuraciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NotificacionesNativas;
