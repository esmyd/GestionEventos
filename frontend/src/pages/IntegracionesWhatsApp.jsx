import React, { useEffect, useState } from 'react';
import { integracionesService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

const IntegracionesWhatsApp = ({ embedded = false }) => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: 'WhatsApp Cloud API',
    access_token: '',
    phone_number_id: '',
    business_id: '',
    api_version: 'v18.0',
    verify_token: '',
    activo: false,
  });

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const data = await integracionesService.getWhatsApp();
      const integracion = data.integracion;
      if (integracion) {
        setFormData({
          nombre: integracion.nombre || 'WhatsApp Cloud API',
          access_token: integracion.configuracion?.access_token || '',
          phone_number_id: integracion.configuracion?.phone_number_id || '',
          business_id: integracion.configuracion?.business_id || '',
          api_version: integracion.configuracion?.api_version || 'v18.0',
          verify_token: integracion.configuracion?.verify_token || '',
          activo: Boolean(integracion.activo),
        });
      }
    } catch (err) {
      const mensaje = err.response?.data?.error || err.message || 'Error al cargar configuracion';
      showError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      await integracionesService.updateWhatsApp(formData);
      success('Configuracion de WhatsApp actualizada');
      await cargarConfiguracion();
    } catch (err) {
      const mensaje = err.response?.data?.error || err.message || 'Error al guardar configuracion';
      showError(mensaje);
    }
  };

  const probarWebhook = async () => {
    try {
      const params = new URLSearchParams({
        verify_token: formData.verify_token || '',
        'hub.mode': 'subscribe',
        'hub.challenge': 'test',
      });
      const response = await fetch(`/api/integraciones/whatsapp/test-webhook?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al probar webhook');
      }
      success('Webhook verificado correctamente');
    } catch (err) {
      const mensaje = err.message || 'Error al probar webhook';
      showError(mensaje);
    }
  };

  return (
    <div style={{ padding: embedded ? 0 : '1.5rem 2rem' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: embedded ? '1.25rem' : '1.6rem', marginBottom: '0.25rem' }}>Integracion WhatsApp</h2>
        <p style={{ color: 'var(--gray-600)' }}>
          Configura las credenciales de Meta para enviar mensajes via WhatsApp.
        </p>
      </div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ maxWidth: embedded ? '100%' : '720px', background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                Nombre
              </label>
              <input
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                Access Token
              </label>
              <input
                value={formData.access_token}
                onChange={(e) => setFormData((prev) => ({ ...prev, access_token: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                Phone Number ID
              </label>
              <input
                value={formData.phone_number_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone_number_id: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                Business ID
              </label>
              <input
                value={formData.business_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, business_id: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                API Version
              </label>
              <input
                value={formData.api_version}
                onChange={(e) => setFormData((prev) => ({ ...prev, api_version: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                Verify Token (Webhook)
              </label>
              <input
                value={formData.verify_token}
                onChange={(e) => setFormData((prev) => ({ ...prev, verify_token: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
              />
              Activar integracion
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={guardarConfiguracion}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #4338ca',
                  background: '#4f46e5',
                  color: 'white',
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Guardar configuracion
              </button>
              <button
                onClick={probarWebhook}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#111827',
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Probar webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegracionesWhatsApp;
