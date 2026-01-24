import React, { useEffect, useMemo, useRef, useState } from 'react';
import { whatsappChatService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import useIsMobile from '../hooks/useIsMobile';
import { Image, FileText, Mic, Smile, Search, MessageSquare, ArrowLeft } from 'lucide-react';

const WhatsAppChat = () => {
  const { toasts, removeToast, error: showError, success } = useToast();
  const isMobile = useIsMobile();
  const [conversaciones, setConversaciones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const inputImagen = useRef(null);
  const inputAudio = useRef(null);
  const inputDocumento = useRef(null);
  const [mostrarLista, setMostrarLista] = useState(true);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [mediaCache, setMediaCache] = useState({});
  const messagesEndRef = useRef(null);

  const conversacionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return conversaciones;
    const needle = busqueda.toLowerCase();
    return conversaciones.filter(
      (conv) =>
        String(conv.nombre_cliente || '').toLowerCase().includes(needle) ||
        String(conv.telefono || '').toLowerCase().includes(needle)
    );
  }, [busqueda, conversaciones]);

  const cargarConversaciones = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await whatsappChatService.getConversations();
      const nuevas = data.conversaciones || [];
      const actualHash = (conversaciones || [])
        .map((c) => `${c.id}-${c.ultimo_mensaje}-${c.ultima_fecha}-${c.bot_activo}-${c.requiere_reengagement}`)
        .join('|');
      const nuevoHash = nuevas
        .map((c) => `${c.id}-${c.ultimo_mensaje}-${c.ultima_fecha}-${c.bot_activo}-${c.requiere_reengagement}`)
        .join('|');
      if (actualHash !== nuevoHash) {
        setConversaciones(nuevas);
      }
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al cargar conversaciones';
      showError(mensaje);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const cargarMensajes = async (convId) => {
    try {
      const data = await whatsappChatService.getMessages(convId);
      const nuevos = data.mensajes || [];
      const ultimoActual = mensajes[mensajes.length - 1]?.id;
      const ultimoNuevo = nuevos[nuevos.length - 1]?.id;
      if (ultimoActual !== ultimoNuevo || mensajes.length !== nuevos.length) {
        setMensajes(nuevos);
      }
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al cargar mensajes';
      showError(mensaje);
    }
  };

  useEffect(() => {
    cargarConversaciones();
  }, []);

  useEffect(() => {
    if (seleccion?.id) {
      cargarMensajes(seleccion.id);
    } else {
      setMensajes([]);
    }
  }, [seleccion]);

  useEffect(() => {
    if (!seleccion?.id) return;
    const actualizada = conversaciones.find((c) => c.id === seleccion.id);
    if (!actualizada) return;
    if (
      actualizada.requiere_reengagement !== seleccion.requiere_reengagement ||
      actualizada.ultimo_mensaje !== seleccion.ultimo_mensaje ||
      actualizada.ultima_fecha !== seleccion.ultima_fecha ||
      actualizada.bot_activo !== seleccion.bot_activo
    ) {
      setSeleccion(actualizada);
    }
  }, [conversaciones, seleccion]);

  useEffect(() => {
    const intervaloMs = 5000;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      if (seleccion?.id) {
        await cargarMensajes(seleccion.id);
      }
      await cargarConversaciones(true);
    };
    tick();
    const intervalId = setInterval(tick, intervaloMs);
    return () => clearInterval(intervalId);
  }, [seleccion?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [mensajes, seleccion]);

  useEffect(() => {
    const pendientes = mensajes.filter((msg) => msg.media_id && !mediaCache[msg.media_id]);
    if (pendientes.length === 0) return;
    pendientes.forEach(async (msg) => {
      try {
        const blob = await whatsappChatService.getMedia(msg.media_id);
        const url = URL.createObjectURL(blob);
        setMediaCache((prev) => ({ ...prev, [msg.media_id]: url }));
      } catch (err) {
        // Si falla, dejamos sin preview
      }
    });
  }, [mensajes, mediaCache]);

  useEffect(() => {
    if (!isMobile) {
      setMostrarLista(true);
    }
  }, [isMobile]);

  const seleccionarConversacion = (conv) => {
    setSeleccion(conv);
    if (isMobile) {
      setMostrarLista(false);
    }
  };

  const enviarMensaje = async () => {
    if (!seleccion?.id) return;
    const texto = mensaje.trim();
    if (!texto && !pendingMedia) return;
    if (pendingMedia) {
      return enviarMedia(pendingMedia.tipo, pendingMedia.archivo, texto);
    }
    try {
      await whatsappChatService.sendMessage(seleccion.id, texto);
      setMensaje('');
      await cargarMensajes(seleccion.id);
      await cargarConversaciones();
      success('Mensaje enviado');
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'No se pudo enviar el mensaje';
      showError(mensajeError);
    }
  };

  const enviarMedia = async (tipo, archivo, caption = '') => {
    if (!seleccion?.id || !archivo) return;
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('tipo', tipo);
      if (caption && (tipo === 'image' || tipo === 'document')) {
        formData.append('caption', caption);
      }
      await whatsappChatService.sendMedia(seleccion.id, formData);
      await cargarMensajes(seleccion.id);
      await cargarConversaciones();
      setPendingMedia(null);
      setMensaje('');
      success('Archivo enviado');
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'No se pudo enviar el archivo';
      showError(mensajeError);
    }
  };

  const toggleModo = async () => {
    if (!seleccion?.id) return;
    const nuevoModo = seleccion.bot_activo ? 'humano' : 'bot';
    try {
      await whatsappChatService.setMode(seleccion.id, nuevoModo);
      success(nuevoModo === 'bot' ? 'Bot activado' : 'Bot desactivado');
      await cargarConversaciones();
      const actualizada = conversaciones.find((c) => c.id === seleccion.id);
      if (actualizada) {
        setSeleccion({ ...actualizada, bot_activo: nuevoModo === 'bot' });
      } else {
        setSeleccion((prev) => (prev ? { ...prev, bot_activo: nuevoModo === 'bot' } : prev));
      }
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'No se pudo actualizar el modo';
      showError(mensajeError);
    }
  };

  const resetBot = async () => {
    if (!seleccion?.id) return;
    try {
      await whatsappChatService.resetBot(seleccion.id);
      success('Estado del bot reiniciado');
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'No se pudo reiniciar el bot';
      showError(mensajeError);
    }
  };

  const seleccionarArchivo = (tipo, archivo) => {
    if (!archivo) return;
    if (pendingMedia?.previewUrl) {
      URL.revokeObjectURL(pendingMedia.previewUrl);
    }
    const previewUrl = tipo === 'image' ? URL.createObjectURL(archivo) : null;
    setPendingMedia({ tipo, archivo, previewUrl });
  };

  useEffect(() => {
    return () => {
      if (pendingMedia?.previewUrl) {
        URL.revokeObjectURL(pendingMedia.previewUrl);
      }
      Object.values(mediaCache).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // no-op
        }
      });
    };
  }, [pendingMedia, mediaCache]);

  const formatFechaLista = (valor) => {
    if (!valor) return '';
    try {
      // Si viene como string sin zona horaria (formato MySQL), interpretarlo como hora local
      let fecha;
      if (typeof valor === 'string' && !valor.includes('T') && !valor.includes('Z') && !valor.includes('+')) {
        // Formato MySQL: 'YYYY-MM-DD HH:MM:SS'
        const partes = valor.split(' ');
        if (partes.length === 2) {
          const [fechaPart, horaPart] = partes;
          fecha = new Date(`${fechaPart}T${horaPart}`);
        } else {
          fecha = new Date(valor);
        }
      } else if (typeof valor === 'string' && valor.includes('T') && !valor.includes('Z') && !valor.includes('+')) {
        // Formato ISO sin zona horaria: 'YYYY-MM-DDTHH:MM:SS'
        fecha = new Date(valor);
      } else {
        fecha = new Date(valor);
      }
      
      if (Number.isNaN(fecha.getTime())) return '';
      
      const hoy = new Date();
      const esHoy =
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getDate() === hoy.getDate();
      
      const hora = fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      
      if (esHoy) {
        return hora;
      }
      
      const dia = fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      return `${dia} ${hora}`;
    } catch (err) {
      return '';
    }
  };

  const formatFechaMensaje = (valor) => {
    if (!valor) return '';
    try {
      // Si viene como string sin zona horaria (formato MySQL), interpretarlo como hora local
      let fecha;
      if (typeof valor === 'string' && !valor.includes('T') && !valor.includes('Z') && !valor.includes('+')) {
        // Formato MySQL: 'YYYY-MM-DD HH:MM:SS'
        const partes = valor.split(' ');
        if (partes.length === 2) {
          const [fechaPart, horaPart] = partes;
          fecha = new Date(`${fechaPart}T${horaPart}`);
        } else {
          fecha = new Date(valor);
        }
      } else if (typeof valor === 'string' && valor.includes('T') && !valor.includes('Z') && !valor.includes('+')) {
        // Formato ISO sin zona horaria: 'YYYY-MM-DDTHH:MM:SS'
        fecha = new Date(valor);
      } else {
        fecha = new Date(valor);
      }
      
      if (Number.isNaN(fecha.getTime())) return '';
      
      // Formatear en zona horaria local
      const dia = fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      const hora = fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      return `${dia} ${hora}`;
    } catch (err) {
      return '';
    }
  };

  const previewTexto = (texto) => {
    if (!texto) return 'Sin mensajes';
    const limpio = String(texto).replace(/\s+/g, ' ').trim();
    if (limpio.length <= 48) return limpio;
    return `${limpio.slice(0, 48)}...`;
  };

  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        height: 'calc(100vh - 56px)',
      }}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',
          gap: 0,
          height: '100%',
        }}
      >
        {(mostrarLista || !isMobile) && (
        <div style={{ background: 'white', borderRadius: 0, borderRight: '1px solid #e5e7eb', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.9rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> Conversaciones
            </div>
            <div style={{ marginTop: '0.6rem', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#9ca3af' }} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o telefono"
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem 0.45rem 2rem',
                  borderRadius: '999px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '1rem', color: 'var(--gray-500)' }}>Cargando...</div>
            ) : conversacionesFiltradas.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--gray-500)' }}>No hay conversaciones.</div>
            ) : (
              conversacionesFiltradas.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => seleccionarConversacion(conv)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 0.9rem',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      background: seleccion?.id === conv.id ? '#e0f2fe' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#10b981',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                        }}
                      >
                        {(conv.nombre_cliente || conv.telefono || '?').trim().charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{conv.nombre_cliente || conv.telefono}</span>
                          {conv.requiere_reengagement ? (
                            <span
                              style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '999px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                              }}
                            >
                              Re-engagement
                            </span>
                          ) : null}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {previewTexto(conv.ultimo_mensaje)}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        {formatFechaLista(conv.ultima_fecha)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      Bot: {conv.bot_activo ? 'Activo' : 'Humano'}
                    </div>
                  </button>
              ))
            )}
          </div>
        </div>
        )}

        {(!isMobile || !mostrarLista) && (
        <div
          style={{
            background: 'white',
            borderRadius: 0,
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.9rem 1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 5,
            }}
          >
            <div>
              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => setMostrarLista(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                {seleccion?.nombre_cliente || seleccion?.telefono || 'Selecciona un chat'}
                {seleccion?.requiere_reengagement ? (
                  <span
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    Re-engagement requerido
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{seleccion?.telefono || ''}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={toggleModo}
                disabled={!seleccion}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: seleccion?.bot_activo ? '#f97316' : '#10b981',
                  color: 'white',
                  cursor: seleccion ? 'pointer' : 'not-allowed',
                }}
              >
                {seleccion?.bot_activo ? 'Modo humano' : 'Activar bot'}
              </button>
              <button
                type="button"
                onClick={resetBot}
                disabled={!seleccion}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#374151',
                  cursor: seleccion ? 'pointer' : 'not-allowed',
                }}
              >
                Reiniciar bot
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '1.2rem', overflowY: 'auto', background: '#efeae2' }}>
            {seleccion ? (
              mensajes.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.direccion === 'out' ? 'flex-end' : 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ maxWidth: '70%' }}>
                    <div
                      style={{
                        padding: '0.6rem 0.9rem',
                        borderRadius: '12px',
                        background: msg.direccion === 'out' ? '#dcf8c6' : '#ffffff',
                        color: '#111827',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      }}
                    >
                      {msg.media_type === 'image' && msg.media_id && mediaCache[msg.media_id] && (
                        <img
                          src={mediaCache[msg.media_id]}
                          alt="imagen enviada"
                          style={{ maxWidth: '100%', borderRadius: '10px', marginBottom: msg.mensaje ? '0.4rem' : 0 }}
                        />
                      )}
                      {msg.media_type === 'audio' && msg.media_id && mediaCache[msg.media_id] && (
                        <audio controls style={{ width: '100%' }}>
                          <source src={mediaCache[msg.media_id]} />
                        </audio>
                      )}
                      {msg.media_type === 'document' && msg.media_id && mediaCache[msg.media_id] && (
                        <a
                          href={mediaCache[msg.media_id]}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-block', marginBottom: msg.mensaje ? '0.4rem' : 0 }}
                        >
                          Descargar documento
                        </a>
                      )}
                      {msg.mensaje}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: msg.direccion === 'out' ? 'flex-end' : 'flex-start',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.7rem',
                        color: msg.estado === 'read' ? '#3b82f6' : '#6b7280',
                        marginTop: '0.2rem',
                      }}
                    >
                      <span>{formatFechaMensaje(msg.fecha_creacion)}</span>
                      {msg.direccion === 'out' && (
                        <span>
                          {msg.estado === 'read'
                            ? '✓✓'
                            : msg.estado === 'delivered'
                              ? '✓✓'
                              : msg.estado === 'sent'
                                ? '✓'
                                : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#9ca3af' }}>Selecciona una conversación para ver mensajes.</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {pendingMedia && (
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {pendingMedia.previewUrl ? (
                  <img
                    src={pendingMedia.previewUrl}
                    alt="preview"
                    style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      background: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    {pendingMedia.tipo.toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>Adjunto listo</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{pendingMedia.archivo?.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingMedia(null)}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              background: '#f9fafb',
              position: 'sticky',
              bottom: 0,
              zIndex: 5,
            }}
          >
            <button
              type="button"
              onClick={() => setMensaje((prev) => `${prev} 😊`)}
              disabled={!seleccion}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: seleccion ? 'pointer' : 'not-allowed',
                color: '#6b7280',
              }}
            >
              <Smile size={20} />
            </button>
            <button
              type="button"
              onClick={() => inputImagen.current?.click()}
              disabled={!seleccion}
              style={{ background: 'transparent', border: 'none', cursor: seleccion ? 'pointer' : 'not-allowed', color: '#6b7280' }}
            >
              <Image size={20} />
            </button>
            <button
              type="button"
              onClick={() => inputAudio.current?.click()}
              disabled={!seleccion}
              style={{ background: 'transparent', border: 'none', cursor: seleccion ? 'pointer' : 'not-allowed', color: '#6b7280' }}
            >
              <Mic size={20} />
            </button>
            <button
              type="button"
              onClick={() => inputDocumento.current?.click()}
              disabled={!seleccion}
              style={{ background: 'transparent', border: 'none', cursor: seleccion ? 'pointer' : 'not-allowed', color: '#6b7280' }}
            >
              <FileText size={20} />
            </button>
            <input
              ref={inputImagen}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => seleccionarArchivo('image', e.target.files?.[0])}
            />
            <input
              ref={inputAudio}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => seleccionarArchivo('audio', e.target.files?.[0])}
            />
            <input
              ref={inputDocumento}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              style={{ display: 'none' }}
              onChange={(e) => seleccionarArchivo('document', e.target.files?.[0])}
            />
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={!seleccion}
              style={{
                flex: 1,
                padding: '0.6rem 0.8rem',
                borderRadius: '999px',
                border: '1px solid #d1d5db',
                background: 'white',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  enviarMensaje();
                }
              }}
            />
            <button
              type="button"
              onClick={enviarMensaje}
              disabled={!seleccion}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '999px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                cursor: seleccion ? 'pointer' : 'not-allowed',
              }}
            >
              Enviar
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
