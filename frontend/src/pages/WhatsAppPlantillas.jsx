import React, { useEffect, useMemo, useState } from 'react';
import { whatsappTemplatesService, clientesService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

const initialTemplate = {
  nombre: '',
  idioma: 'es',
  categoria: '',
  descripcion: '',
  parametros: 0,
  header_parametros: 0,
  body_parametros: 0,
  ejemplo: '',
  header_ejemplo: '',
  body_ejemplo: '',
  activo: true,
};

const WhatsAppPlantillas = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTemplate, setFormTemplate] = useState(initialTemplate);
  const [editandoId, setEditandoId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [envio, setEnvio] = useState({
    template_id: '',
    cliente_id: '',
    telefono: '',
    parametros: [],
    header_parametros: [],
    body_parametros: [],
  });
  const [parametrosEsperados, setParametrosEsperados] = useState(0);
  const [headerEsperados, setHeaderEsperados] = useState(0);
  const [bodyEsperados, setBodyEsperados] = useState(0);
  const [sending, setSending] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [templatesResp, clientesResp] = await Promise.all([
        whatsappTemplatesService.getAll(),
        clientesService.getAll(),
      ]);
      setTemplates(templatesResp.templates || []);
      setClientes(clientesResp.clientes || []);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo cargar las plantillas';
      showError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setFormTemplate(initialTemplate);
    setEditandoId(null);
  };

  const guardarTemplate = async () => {
    if (!formTemplate.nombre.trim()) {
      showError('El nombre de la plantilla es requerido');
      return;
    }
    try {
      const payload = {
        ...formTemplate,
        parametros: Number(formTemplate.parametros || 0),
        header_parametros: Number(formTemplate.header_parametros || 0),
        body_parametros: Number(formTemplate.body_parametros || 0),
      };
      if (editandoId) {
        await whatsappTemplatesService.update(editandoId, payload);
        success('Plantilla actualizada');
      } else {
        await whatsappTemplatesService.create(payload);
        success('Plantilla creada');
      }
      await cargarDatos();
      limpiarFormulario();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo guardar la plantilla';
      showError(mensaje);
    }
  };

  const editarTemplate = (template) => {
    setEditandoId(template.id);
    setFormTemplate({
      nombre: template.nombre || '',
      idioma: template.idioma || 'es',
      categoria: template.categoria || '',
      descripcion: template.descripcion || '',
      parametros: template.parametros || 0,
      header_parametros: template.header_parametros || 0,
      body_parametros: template.body_parametros || 0,
      ejemplo: template.ejemplo || '',
      header_ejemplo: template.header_ejemplo || '',
      body_ejemplo: template.body_ejemplo || '',
      activo: Boolean(template.activo),
    });
  };

  const eliminarTemplate = async (templateId) => {
    try {
      await whatsappTemplatesService.remove(templateId);
      success('Plantilla eliminada');
      await cargarDatos();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo eliminar la plantilla';
      showError(mensaje);
    }
  };

  const templatesActivos = useMemo(() => templates.filter((t) => t.activo), [templates]);
  const templateSeleccionado = useMemo(
    () => templatesActivos.find((t) => String(t.id) === String(envio.template_id)),
    [templatesActivos, envio.template_id]
  );

  useEffect(() => {
    const header = Number(templateSeleccionado?.header_parametros || 0);
    const body = Number(templateSeleccionado?.body_parametros || 0);
    const cantidad = Number(templateSeleccionado?.parametros || 0) || (header + body);
    setParametrosEsperados(cantidad);
    setHeaderEsperados(header);
    setBodyEsperados(body);
    if (cantidad === 0) {
      setEnvio((prev) => ({ ...prev, parametros: [], header_parametros: [], body_parametros: [] }));
    } else {
      setEnvio((prev) => ({
        ...prev,
        parametros: Array.from({ length: cantidad }, (_, idx) => prev.parametros[idx] || ''),
        header_parametros: Array.from({ length: header }, (_, idx) => prev.header_parametros[idx] || ''),
        body_parametros: Array.from({ length: body }, (_, idx) => prev.body_parametros[idx] || ''),
      }));
    }
  }, [templateSeleccionado]);

  const enviarPlantilla = async () => {
    if (!envio.template_id) {
      showError('Selecciona una plantilla');
      return;
    }
    if (!envio.cliente_id && !envio.telefono.trim()) {
      showError('Selecciona un cliente o ingresa un telefono');
      return;
    }
    const parametros = (envio.parametros || []).map((valor) => String(valor || '').trim());
    const headerParams = (envio.header_parametros || []).map((valor) => String(valor || '').trim());
    const bodyParams = (envio.body_parametros || []).map((valor) => String(valor || '').trim());
    if (headerEsperados && headerParams.some((valor) => !valor)) {
      showError('Completa todos los parametros del header.');
      return;
    }
    if (bodyEsperados && bodyParams.some((valor) => !valor)) {
      showError('Completa todos los parametros del body.');
      return;
    }
    if (headerEsperados && headerParams.length !== headerEsperados) {
      showError(`Debes enviar ${headerEsperados} parametro(s) en el header.`);
      return;
    }
    if (bodyEsperados && bodyParams.length !== bodyEsperados) {
      showError(`Debes enviar ${bodyEsperados} parametro(s) en el body.`);
      return;
    }
    if (!headerEsperados && !bodyEsperados && parametrosEsperados && parametros.length !== parametrosEsperados) {
      showError(`Debes enviar ${parametrosEsperados} parametro(s).`);
      return;
    }
    try {
      setSending(true);
      await whatsappTemplatesService.send({
        template_id: Number(envio.template_id),
        cliente_id: envio.cliente_id ? Number(envio.cliente_id) : null,
        telefono: envio.telefono.trim(),
        parametros,
        header_parametros: headerParams,
        body_parametros: bodyParams,
      });
      success('Plantilla enviada');
      setEnvio({ template_id: '', cliente_id: '', telefono: '', parametros: [], header_parametros: [], body_parametros: [] });
      await cargarDatos();
    } catch (err) {
      const mensaje = err.response?.data?.error || err.response?.data?.detalle || 'No se pudo enviar la plantilla';
      showError(mensaje);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Plantillas WhatsApp</h2>
        <p style={{ color: 'var(--gray-600)' }}>
          Envía plantillas aprobadas para abrir conversaciones fuera de la ventana de 24h.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Plantillas registradas</div>
          {loading ? (
            <div style={{ color: '#6b7280' }}>Cargando...</div>
          ) : templates.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No hay plantillas registradas.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {template.nombre} <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>({template.idioma})</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {template.descripcion || 'Sin descripcion'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      Parametros: {template.parametros || 0} · {template.activo ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => editarTemplate(template)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        background: '#f3f4f6',
                        cursor: 'pointer',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarTemplate(template.id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fee2e2',
                        color: '#991b1b',
                        cursor: 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{editandoId ? 'Editar plantilla' : 'Nueva plantilla'}</div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input
                value={formTemplate.nombre}
                onChange={(e) => setFormTemplate((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre exacto (Meta)"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  value={formTemplate.idioma}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, idioma: e.target.value }))}
                  placeholder="Idioma (ej: es)"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
                <input
                  value={formTemplate.categoria}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Categoria"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <input
                value={formTemplate.descripcion}
                onChange={(e) => setFormTemplate((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripcion"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  type="number"
                  min="0"
                  value={formTemplate.parametros}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, parametros: e.target.value }))}
                  placeholder="Cantidad parametros (legacy)"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
                <input
                  type="number"
                  min="0"
                  value={formTemplate.header_parametros}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, header_parametros: e.target.value }))}
                  placeholder="Parametros header"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  type="number"
                  min="0"
                  value={formTemplate.body_parametros}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, body_parametros: e.target.value }))}
                  placeholder="Parametros body"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
                <select
                  value={formTemplate.activo ? '1' : '0'}
                  onChange={(e) => setFormTemplate((prev) => ({ ...prev, activo: e.target.value === '1' }))}
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                  <option value="1">Activa</option>
                  <option value="0">Inactiva</option>
                </select>
              </div>
              <textarea
                value={formTemplate.ejemplo}
                onChange={(e) => setFormTemplate((prev) => ({ ...prev, ejemplo: e.target.value }))}
                placeholder="Ejemplo legacy (opcional)"
                rows={2}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <textarea
                value={formTemplate.header_ejemplo}
                onChange={(e) => setFormTemplate((prev) => ({ ...prev, header_ejemplo: e.target.value }))}
                placeholder="Ejemplo header (opcional)"
                rows={2}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <textarea
                value={formTemplate.body_ejemplo}
                onChange={(e) => setFormTemplate((prev) => ({ ...prev, body_ejemplo: e.target.value }))}
                placeholder="Ejemplo body (opcional)"
                rows={2}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={guardarTemplate}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#111827',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Guardar
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#f3f4f6',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Enviar plantilla</div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <select
                value={envio.template_id}
                onChange={(e) => setEnvio((prev) => ({ ...prev, template_id: e.target.value }))}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              >
                <option value="">Selecciona una plantilla</option>
                {templatesActivos.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.nombre} ({template.idioma})
                  </option>
                ))}
              </select>
              {templateSeleccionado ? (
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  Parametros requeridos: {parametrosEsperados}
                  {templateSeleccionado.ejemplo ? ` · Ejemplo: ${templateSeleccionado.ejemplo}` : ''}
                </div>
              ) : null}
              <select
                value={envio.cliente_id}
                onChange={(e) => setEnvio((prev) => ({ ...prev, cliente_id: e.target.value }))}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              >
                <option value="">Selecciona un cliente (opcional)</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre_completo} {cliente.telefono ? `· ${cliente.telefono}` : ''}
                  </option>
                ))}
              </select>
              <input
                value={envio.telefono}
                onChange={(e) => setEnvio((prev) => ({ ...prev, telefono: e.target.value }))}
                placeholder="Telefono directo (si no eliges cliente)"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              {(headerEsperados > 0 || bodyEsperados > 0) ? (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {headerEsperados > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Header</div>
                  )}
                  {Array.from({ length: headerEsperados }).map((_, idx) => {
                    const ejemplo = (templateSeleccionado?.header_ejemplo || '')
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)[idx];
                    return (
                      <input
                        key={`header-param-${idx}`}
                        value={envio.header_parametros[idx] || ''}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setEnvio((prev) => {
                            const copia = [...(prev.header_parametros || [])];
                            copia[idx] = valor;
                            return { ...prev, header_parametros: copia };
                          });
                        }}
                        placeholder={ejemplo ? `Header ${idx + 1} (ej: ${ejemplo})` : `Header ${idx + 1}`}
                        style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                    );
                  })}
                  {bodyEsperados > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>Body</div>
                  )}
                  {Array.from({ length: bodyEsperados }).map((_, idx) => {
                    const ejemplo = (templateSeleccionado?.body_ejemplo || '')
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)[idx];
                    return (
                      <input
                        key={`body-param-${idx}`}
                        value={envio.body_parametros[idx] || ''}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setEnvio((prev) => {
                            const copia = [...(prev.body_parametros || [])];
                            copia[idx] = valor;
                            return { ...prev, body_parametros: copia };
                          });
                        }}
                        placeholder={ejemplo ? `Body ${idx + 1} (ej: ${ejemplo})` : `Body ${idx + 1}`}
                        style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                    );
                  })}
                </div>
              ) : parametrosEsperados > 0 ? (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {Array.from({ length: parametrosEsperados }).map((_, idx) => {
                    const ejemplo = (templateSeleccionado?.ejemplo || '')
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)[idx];
                    return (
                      <input
                        key={`legacy-param-${idx}`}
                        value={envio.parametros[idx] || ''}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setEnvio((prev) => {
                            const copia = [...(prev.parametros || [])];
                            copia[idx] = valor;
                            return { ...prev, parametros: copia };
                          });
                        }}
                        placeholder={ejemplo ? `Parametro ${idx + 1} (ej: ${ejemplo})` : `Parametro ${idx + 1}`}
                        style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                    );
                  })}
                </div>
              ) : (
                <input
                  value=""
                  disabled
                  placeholder="Esta plantilla no requiere parametros"
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#f3f4f6',
                  }}
                />
              )}
            </div>
            <div style={{ marginTop: '0.9rem' }}>
              <button
                type="button"
                onClick={enviarPlantilla}
                disabled={sending}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#16a34a',
                  color: 'white',
                  cursor: sending ? 'not-allowed' : 'pointer',
                }}
              >
                {sending ? 'Enviando...' : 'Enviar plantilla'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPlantillas;
