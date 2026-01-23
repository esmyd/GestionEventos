import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notificacionesNativasService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { useNombrePlataforma } from '../hooks/useNombrePlataforma';

const NotificacionNativaEditar = () => {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const { nombrePlataforma } = useNombrePlataforma();
  const [loading, setLoading] = useState(true);
  const [formTemplate, setFormTemplate] = useState({
    nombre: '',
    descripcion: '',
    enviar_email: true,
    enviar_whatsapp: true,
    plantilla_email: '',
    plantilla_whatsapp: '',
  });
  const [layoutHeader, setLayoutHeader] = useState('');
  const [layoutFooter, setLayoutFooter] = useState('');
  const [baseHeader, setBaseHeader] = useState('');
  const [baseFooter, setBaseFooter] = useState('');

  useEffect(() => {
    if (!baseHeader) {
      setLayoutHeader((prev) => prev || nombrePlataforma);
    }
    if (!baseFooter) {
      setLayoutFooter((prev) => prev || `${nombrePlataforma} · Estamos para ayudarte.`);
    }
  }, [nombrePlataforma, baseHeader, baseFooter]);

  const extractProfessionalTemplate = (rawTemplate) => {
    const raw = rawTemplate || '';
    const headerMatch = raw.match(
      /<div[^>]*font-size:18px;[^>]*>(.*?)<\/div>/is
    );
    const footerMatch = raw.match(
      /<td[^>]*padding:20px 32px[^>]*>(.*?)<\/td>/is
    );
    const bodyMatch = raw.match(
      /<td[^>]*padding:28px 32px[^>]*>([\s\S]*?)<\/td>/i
    );
    if (bodyMatch && bodyMatch[1]) {
      return {
        header: headerMatch?.[1]?.trim(),
        footer: footerMatch?.[1]?.trim(),
        body: bodyMatch[1].trim(),
        isWrapped: true,
      };
    }
    return {
      header: null,
      footer: null,
      body: raw,
      isWrapped: false,
    };
  };

  const buildPreviewHtml = (contenido, titulo) => {
    const raw = contenido || '';
    const lower = raw.toLowerCase();
    const isFullDoc = lower.includes('<html') || lower.includes('<body');
    if (isFullDoc) {
      return raw;
    }
    const isHtmlFragment = lower.includes('<table') || lower.includes('<div') || lower.includes('<p');
    const body = isHtmlFragment ? raw : raw.replace(/\n/g, '<br>');
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background-color:#111827; color:#ffffff; padding:24px 32px;">
                <div style="font-size:18px; font-weight:700;">${layoutHeader}</div>
                <div style="font-size:13px; opacity:0.85; margin-top:4px;">${titulo || 'Notificacion'}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px; color:#111827; font-size:14px; line-height:1.6;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280;">
                ${layoutFooter}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  };

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const data = await notificacionesNativasService.getConfiguracion(tipo);
      const config = data.configuracion;
      const headerMatch = (config.plantilla_email || '').match(/\[\[HEADER:(.*?)\]\]/);
      const footerMatch = (config.plantilla_email || '').match(/\[\[FOOTER:(.*?)\]\]/);
      if (headerMatch && headerMatch[1]) {
        setLayoutHeader(headerMatch[1].trim());
      }
      if (footerMatch && footerMatch[1]) {
        setLayoutFooter(footerMatch[1].trim());
      }
      const cleanEmail = (config.plantilla_email || '')
        .replace(/\[\[HEADER:.*?\]\]\s*/s, '')
        .replace(/\[\[FOOTER:.*?\]\]\s*/s, '');
      const extracted = extractProfessionalTemplate(cleanEmail);
      if (extracted.header) setLayoutHeader(extracted.header);
      if (extracted.footer) setLayoutFooter(extracted.footer);
      setFormTemplate({
        nombre: config.nombre || '',
        descripcion: config.descripcion || '',
        enviar_email: Boolean(config.enviar_email),
        enviar_whatsapp: Boolean(config.enviar_whatsapp),
        plantilla_email: extracted.body || cleanEmail,
        plantilla_whatsapp: config.plantilla_whatsapp || '',
      });
      if (!baseHeader) setBaseHeader(headerMatch?.[1]?.trim() || layoutHeader);
      if (!baseFooter) setBaseFooter(footerMatch?.[1]?.trim() || layoutFooter);
    } catch (err) {
      const mensaje = err.response?.data?.error || err.message || 'Error al cargar configuracion';
      showError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, [tipo]);

  const guardarEdicion = async () => {
    try {
      const payload = {
        ...formTemplate,
        plantilla_email: formTemplate.plantilla_email,
      };
      if (formTemplate.plantilla_email) {
        payload.plantilla_email = `[[HEADER:${layoutHeader}]]\n[[FOOTER:${layoutFooter}]]\n${formTemplate.plantilla_email}`;
      }
      await notificacionesNativasService.updateConfiguracion(tipo, payload);
      success('Plantilla actualizada');
    } catch (err) {
      const mensaje = err.response?.data?.error || err.message || 'Error al actualizar plantilla';
      showError(mensaje);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Editar notificacion</h2>
          <p style={{ color: 'var(--gray-600)' }}>{tipo}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/notificaciones-nativas')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Volver
          </button>
          <button
            onClick={guardarEdicion}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #4338ca',
              background: '#4f46e5',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Guardar cambios
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '1rem' }}>Contenido</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                  Header (titulo superior)
                </label>
                <input
                  value={layoutHeader}
                  onChange={(e) => setLayoutHeader(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                  Footer (pie de pagina)
                </label>
                <input
                  value={layoutFooter}
                  onChange={(e) => setLayoutFooter(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                  Nombre
                </label>
                <input
                  value={formTemplate.nombre}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, nombre: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                  Descripcion
                </label>
                <input
                  value={formTemplate.descripcion}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, descripcion: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formTemplate.enviar_email}
                    onChange={(e) => setFormTemplate((prev) => ({ ...prev, enviar_email: e.target.checked }))}
                  />
                  Enviar Email
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formTemplate.enviar_whatsapp}
                    onChange={(e) => setFormTemplate((prev) => ({ ...prev, enviar_whatsapp: e.target.checked }))}
                  />
                  Enviar WhatsApp
                </label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                  Plantilla Email (HTML permitido)
                </label>
                <textarea
                  rows={14}
                  value={formTemplate.plantilla_email}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, plantilla_email: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#374151' }}>
                  Plantilla WhatsApp
                </label>
                <textarea
                  rows={6}
                  value={formTemplate.plantilla_whatsapp}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, plantilla_whatsapp: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '1rem' }}>Vista previa</h3>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#f3f4f6',
                padding: '0.5rem',
                maxHeight: '720px',
                overflow: 'auto',
              }}
              dangerouslySetInnerHTML={{
                __html: buildPreviewHtml(formTemplate.plantilla_email, formTemplate.nombre),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionNativaEditar;
