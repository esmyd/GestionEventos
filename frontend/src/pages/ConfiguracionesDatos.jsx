import React, { useEffect, useState } from 'react';
import { configuracionesService, whatsappTemplatesService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { useNombrePlataforma } from '../hooks/useNombrePlataforma';
import IntegracionesWhatsApp from './IntegracionesWhatsApp';

const ConfiguracionesDatos = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [confirmacion, setConfirmacion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [configGeneral, setConfigGeneral] = useState({
    nombre_plataforma: '',
    login_titulo: '',
    login_subtitulo: '',
    login_boton_texto: '',
    login_left_titulo: '',
    login_left_texto: '',
    login_left_items: '',
    login_left_imagen: '',
    login_acento_color: '',
    login_fondo_color: '',
    whatsapp_reengagement_template_id: '',
    contacto_nombre: '',
    contacto_email: '',
    contacto_telefono: '',
    contacto_whatsapp: '',
    establecimiento_direccion: '',
    establecimiento_horario: '',
  });
  const [cargandoGeneral, setCargandoGeneral] = useState(true);
  const [templates, setTemplates] = useState([]);
  const { nombrePlataforma, setNombrePlataforma } = useNombrePlataforma();

  useEffect(() => {
    const cargarGeneral = async () => {
      try {
        setCargandoGeneral(true);
        const [data, templatesResp] = await Promise.all([
          configuracionesService.getGeneral(),
          whatsappTemplatesService.getAll(),
        ]);
        const conf = data?.configuracion || {};
        setTemplates(templatesResp?.templates || []);
        setConfigGeneral({
          nombre_plataforma: conf.nombre_plataforma || nombrePlataforma || '',
          login_titulo: conf.login_titulo || '',
          login_subtitulo: conf.login_subtitulo || '',
          login_boton_texto: conf.login_boton_texto || '',
          login_left_titulo: conf.login_left_titulo || '',
          login_left_texto: conf.login_left_texto || '',
          login_left_items: conf.login_left_items || '',
          login_left_imagen: conf.login_left_imagen || '',
          login_acento_color: conf.login_acento_color || '',
          login_fondo_color: conf.login_fondo_color || '',
          whatsapp_reengagement_template_id: conf.whatsapp_reengagement_template_id || '',
          contacto_nombre: conf.contacto_nombre || '',
          contacto_email: conf.contacto_email || '',
          contacto_telefono: conf.contacto_telefono || '',
          contacto_whatsapp: conf.contacto_whatsapp || '',
          establecimiento_direccion: conf.establecimiento_direccion || '',
          establecimiento_horario: conf.establecimiento_horario || '',
        });
      } catch (err) {
        const mensaje = err.response?.data?.error || 'No se pudo cargar la configuración general';
        showError(mensaje);
      } finally {
        setCargandoGeneral(false);
      }
    };
    cargarGeneral();
  }, [nombrePlataforma, showError]);

  const limpiarDatos = async () => {
    if (confirmacion.trim().toUpperCase() !== 'ELIMINAR') {
      showError('Escribe ELIMINAR para confirmar.');
      return;
    }
    try {
      setProcesando(true);
      const data = await configuracionesService.limpiarDatosPrueba();
      success('Datos de prueba eliminados');
      if (data?.errores?.length) {
        showError('Algunas tablas no se pudieron limpiar.');
      }
      setConfirmacion('');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo limpiar los datos';
      showError(mensaje);
    } finally {
      setProcesando(false);
    }
  };

  const guardarGeneral = async () => {
    if (!configGeneral.nombre_plataforma.trim()) {
      showError('Ingresa un nombre valido para la plataforma.');
      return;
    }
    try {
      setGuardandoNombre(true);
      await configuracionesService.updateGeneral({
        ...configGeneral,
        nombre_plataforma: configGeneral.nombre_plataforma.trim(),
      });
      setNombrePlataforma(configGeneral.nombre_plataforma.trim());
      success('Configuración general actualizada');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo actualizar la configuración';
      showError(mensaje);
    } finally {
      setGuardandoNombre(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Limpieza de datos de prueba</h2>
        <p style={{ color: 'var(--gray-600)' }}>
          Elimina eventos, pagos y notificaciones (email/WhatsApp). No borra configuraciones, usuarios ni roles.
        </p>
      </div>

      <div style={{ maxWidth: '920px', background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.75rem', fontWeight: 700 }}>Configuraciones generales</div>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          Personaliza el contenido y la estética del login.
        </p>
        {cargandoGeneral ? (
          <div style={{ color: '#6b7280' }}>Cargando configuración...</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <input
              value={configGeneral.nombre_plataforma}
              onChange={(e) => setConfigGeneral((prev) => ({ ...prev, nombre_plataforma: e.target.value }))}
              placeholder="Nombre de la plataforma"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                value={configGeneral.login_titulo}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_titulo: e.target.value }))}
                placeholder="Titulo del login"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                value={configGeneral.login_subtitulo}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_subtitulo: e.target.value }))}
                placeholder="Subtitulo del login"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                value={configGeneral.login_boton_texto}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_boton_texto: e.target.value }))}
                placeholder="Texto del boton"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                value={configGeneral.login_left_titulo}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_left_titulo: e.target.value }))}
                placeholder="Titulo panel izquierdo"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <textarea
              value={configGeneral.login_left_texto}
              onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_left_texto: e.target.value }))}
              placeholder="Texto principal del panel izquierdo"
              rows={2}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <textarea
              value={configGeneral.login_left_items}
              onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_left_items: e.target.value }))}
              placeholder="Items del panel izquierdo (uno por linea)"
              rows={4}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <input
              value={configGeneral.login_left_imagen}
              onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_left_imagen: e.target.value }))}
              placeholder="URL de imagen del login"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                value={configGeneral.login_acento_color}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_acento_color: e.target.value }))}
                placeholder="Color acento (hex)"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                value={configGeneral.login_fondo_color}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, login_fondo_color: e.target.value }))}
                placeholder="Color fondo izquierdo (hex)"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <select
              value={configGeneral.whatsapp_reengagement_template_id || ''}
              onChange={(e) =>
                setConfigGeneral((prev) => ({
                  ...prev,
                  whatsapp_reengagement_template_id: e.target.value || '',
                }))
              }
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            >
              <option value="">Plantilla de re-apertura 24h (opcional)</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.nombre} ({template.idioma})
                </option>
              ))}
            </select>
            <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>Contacto y establecimiento</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                value={configGeneral.contacto_nombre}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, contacto_nombre: e.target.value }))}
                placeholder="Nombre de contacto"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                value={configGeneral.contacto_email}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, contacto_email: e.target.value }))}
                placeholder="Email de contacto"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                value={configGeneral.contacto_telefono}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, contacto_telefono: e.target.value }))}
                placeholder="Teléfono de contacto"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                value={configGeneral.contacto_whatsapp}
                onChange={(e) => setConfigGeneral((prev) => ({ ...prev, contacto_whatsapp: e.target.value }))}
                placeholder="WhatsApp de contacto"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <input
              value={configGeneral.establecimiento_direccion}
              onChange={(e) => setConfigGeneral((prev) => ({ ...prev, establecimiento_direccion: e.target.value }))}
              placeholder="Dirección del establecimiento"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <input
              value={configGeneral.establecimiento_horario}
              onChange={(e) => setConfigGeneral((prev) => ({ ...prev, establecimiento_horario: e.target.value }))}
              placeholder="Horario del establecimiento"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
        )}
        <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={guardarGeneral}
            disabled={guardandoNombre}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              background: '#111827',
              color: 'white',
              cursor: guardandoNombre ? 'not-allowed' : 'pointer',
            }}
          >
            {guardandoNombre ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '920px', background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <IntegracionesWhatsApp embedded />
      </div>

      <div style={{ maxWidth: '720px', background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>Acción irreversible</div>
          <div style={{ color: '#7f1d1d', fontSize: '0.9rem' }}>
            Esta acción elimina datos operativos (eventos, pagos, notificaciones y chats).
          </div>
        </div>

        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
          Escribe <strong>ELIMINAR</strong> para confirmar
        </label>
        <input
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
        />

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={limpiarDatos}
            disabled={procesando}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              background: '#dc2626',
              color: 'white',
              cursor: procesando ? 'not-allowed' : 'pointer',
            }}
          >
            {procesando ? 'Eliminando...' : 'Eliminar datos de prueba'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ConfiguracionesDatos;
