import React, { useEffect, useMemo, useRef, useState } from 'react';
import { whatsappChatService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import useIsMobile from '../hooks/useIsMobile';
import { Image, FileText, Mic, Smile, Search, MessageSquare, ArrowLeft, Plus, Send, X, Camera } from 'lucide-react';

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
  const [mostrarMenuAdjuntos, setMostrarMenuAdjuntos] = useState(false);
  const [mostrarEmojis, setMostrarEmojis] = useState(false);

  // Lista completa de emojis organizados por categorías
  const emojis = {
    'Caras': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
    'Gestos': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
    'Corazones': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '🫶'],
    'Celebración': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎄', '🎃', '🎗️', '🎟️', '🎫', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🎮', '🎯', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎷', '🎺', '🎸', '🪕', '🎻'],
    'Naturaleza': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️'],
    'Comida': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'],
    'Objetos': ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🔗', '⛓️', '🧰', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪'],
    'Símbolos': ['✅', '❌', '❓', '❗', '‼️', '⁉️', '💯', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🔶', '🔷', '🔸', '🔹', '▪️', '▫️', '◾', '◽', '⬛', '⬜', '🔳', '🔲', '🏁', '🚩', '🎌', '🏴', '🏳️', '⭐', '🌟', '✨', '💫', '🔥', '💥', '💢', '💦', '💨', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🐧', '🐦', '🐤', '🐣', '🐥'],
  };
  const [categoriaEmoji, setCategoriaEmoji] = useState('Caras');
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

  const seleccionarConversacion = async (conv) => {
    setSeleccion(conv);
    if (isMobile) {
      setMostrarLista(false);
    }
    // Marcar como leído al abrir la conversación
    if (conv?.id && conv.mensajes_no_leidos > 0) {
      try {
        await whatsappChatService.marcarLeido(conv.id);
        // Actualizar la lista de conversaciones para reflejar el cambio
        setConversaciones((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, mensajes_no_leidos: 0 } : c))
        );
      } catch (err) {
        // Si falla, no bloqueamos la selección
      }
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
        margin: isMobile ? '-1rem' : '-1.5rem',
        marginBottom: isMobile ? '-2rem' : '-1.5rem',
        height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 56px)',
        minHeight: isMobile ? '100%' : 'calc(100vh - 56px)',
        background: '#111b21',
        overflow: 'hidden',
      }}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '380px 1fr',
          gap: 0,
          height: '100%',
        }}
      >
        {(mostrarLista || !isMobile) && (
        <div style={{ background: '#111b21', borderRadius: 0, borderRight: isMobile ? 'none' : '1px solid #222d34', overflow: 'hidden', height: '100%', minHeight: isMobile ? 'calc(100vh - 56px)' : '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1rem', background: '#202c33', borderBottom: '1px solid #222d34' }}>
            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e9edef', fontSize: isMobile ? '1.1rem' : '1.15rem', marginBottom: '0.75rem' }}>
              <MessageSquare size={isMobile ? 22 : 20} color="#00a884" /> Chats
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8696a0' }} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar o iniciar chat"
                style={{
                  width: '100%',
                  padding: isMobile ? '0.55rem 0.75rem 0.55rem 2.4rem' : '0.5rem 0.75rem 0.5rem 2.4rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#202c33',
                  fontSize: isMobile ? '0.9rem' : '0.875rem',
                  color: '#e9edef',
                  outline: 'none',
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '1rem', color: '#8696a0' }}>Cargando...</div>
            ) : conversacionesFiltradas.length === 0 ? (
              <div style={{ padding: '1rem', color: '#8696a0' }}>No hay conversaciones.</div>
            ) : (
              conversacionesFiltradas.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => seleccionarConversacion(conv)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: isMobile ? '0.65rem 0.75rem' : '0.7rem 1rem',
                      border: 'none',
                      borderBottom: '1px solid #222d34',
                      background: seleccion?.id === conv.id ? '#2a3942' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (seleccion?.id !== conv.id) e.currentTarget.style.background = '#202c33'; }}
                    onMouseLeave={(e) => { if (seleccion?.id !== conv.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: isMobile ? '44px' : '48px',
                          height: isMobile ? '44px' : '48px',
                          borderRadius: '50%',
                          background: '#00a884',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: isMobile ? '1rem' : '1.1rem',
                          flexShrink: 0,
                        }}
                      >
                        {(conv.nombre_cliente || conv.telefono || '?').trim().charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                          <span style={{ fontWeight: '500', color: '#e9edef', fontSize: isMobile ? '0.95rem' : '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.nombre_cliente || conv.telefono}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: conv.mensajes_no_leidos > 0 ? '#00a884' : '#8696a0', flexShrink: 0, marginLeft: '0.5rem' }}>
                            {formatFechaLista(conv.ultima_fecha)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div
                            style={{
                              fontSize: isMobile ? '0.8rem' : '0.85rem',
                              color: '#8696a0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                            }}
                          >
                            {conv.bot_activo ? '🤖 ' : ''}{previewTexto(conv.ultimo_mensaje)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                            {conv.requiere_reengagement && (
                              <span
                                style={{
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  background: '#5c3d3d',
                                  color: '#f15c6d',
                                  fontSize: '0.6rem',
                                  fontWeight: 600,
                                }}
                              >
                                24h
                              </span>
                            )}
                            {conv.mensajes_no_leidos > 0 && (
                              <div
                                style={{
                                  minWidth: '18px',
                                  height: '18px',
                                  borderRadius: '9px',
                                  backgroundColor: '#00a884',
                                  color: '#111b21',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 5px',
                                }}
                              >
                                {conv.mensajes_no_leidos > 99 ? '99+' : conv.mensajes_no_leidos}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
            background: '#0b141a',
            borderRadius: 0,
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: isMobile ? 'calc(100vh - 56px)' : '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '0.5rem 0.6rem' : '0.6rem 1rem',
              borderBottom: '1px solid #222d34',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? '0.5rem' : '0',
              position: 'sticky',
              top: 0,
              background: '#202c33',
              zIndex: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setMostrarLista(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#aebac1',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ArrowLeft size={22} />
                </button>
              )}
              <div
                style={{
                  width: isMobile ? '38px' : '42px',
                  height: isMobile ? '38px' : '42px',
                  borderRadius: '50%',
                  background: '#00a884',
                  color: '#111b21',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  flexShrink: 0,
                }}
              >
                {(seleccion?.nombre_cliente || seleccion?.telefono || '?').trim().charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ 
                  fontWeight: '500', 
                  color: '#e9edef', 
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {seleccion?.nombre_cliente || seleccion?.telefono || 'Selecciona un chat'}
                  </span>
                  {seleccion?.requiere_reengagement && !isMobile ? (
                    <span
                      style={{
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        background: '#5c3d3d',
                        color: '#f15c6d',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      24h expirado
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#8696a0' }}>
                  {seleccion?.telefono || ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
              {seleccion?.requiere_reengagement && isMobile && (
                <span
                  style={{
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                    background: '#5c3d3d',
                    color: '#f15c6d',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  24h
                </span>
              )}
              <button
                type="button"
                onClick={toggleModo}
                disabled={!seleccion}
                style={{
                  padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: seleccion?.bot_activo ? '#e97c20' : '#00a884',
                  color: seleccion?.bot_activo ? 'white' : '#111b21',
                  cursor: seleccion ? 'pointer' : 'not-allowed',
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  opacity: seleccion ? 1 : 0.5,
                }}
              >
                {seleccion?.bot_activo ? (isMobile ? '👤 Humano' : '👤 Modo humano') : (isMobile ? '🤖 Bot' : '🤖 Activar bot')}
              </button>
              <button
                type="button"
                onClick={resetBot}
                disabled={!seleccion}
                style={{
                  padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #3b4a54',
                  background: 'transparent',
                  color: '#aebac1',
                  cursor: seleccion ? 'pointer' : 'not-allowed',
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  opacity: seleccion ? 1 : 0.5,
                }}
              >
                {isMobile ? 'Reset' : 'Reiniciar'}
              </button>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            padding: isMobile ? '0.5rem 0.5rem' : '0.75rem 1.5rem', 
            overflowY: 'auto', 
            background: '#0b141a',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23182229\' fill-opacity=\'0.6\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            minHeight: 0,
          }}>
            {seleccion ? (
              mensajes.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.direccion === 'out' ? 'flex-end' : 'flex-start',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div style={{ maxWidth: isMobile ? '92%' : '75%' }}>
                    <div
                      style={{
                        padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 0.65rem',
                        borderRadius: msg.direccion === 'out' ? '7.5px 7.5px 0 7.5px' : '7.5px 7.5px 7.5px 0',
                        background: msg.direccion === 'out' ? '#005c4b' : '#202c33',
                        color: '#e9edef',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
                        fontSize: isMobile ? '0.875rem' : '0.9rem',
                        lineHeight: 1.35,
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
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.65rem',
                        color: msg.direccion === 'out' ? 'rgba(255,255,255,0.6)' : '#8696a0',
                        marginTop: '0.15rem',
                      }}
                    >
                      <span>{formatFechaMensaje(msg.fecha_creacion)}</span>
                      {msg.direccion === 'out' && (
                        <span style={{ color: msg.estado === 'read' ? '#53bdeb' : 'rgba(255,255,255,0.6)' }}>
                          {msg.estado === 'read'
                            ? '✓✓'
                            : msg.estado === 'delivered'
                              ? '✓✓'
                              : msg.estado === 'sent'
                                ? '✓'
                                : '⏳'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#8696a0',
                textAlign: 'center',
                padding: '2rem',
              }}>
                <MessageSquare size={64} color="#3b4a54" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.2rem', color: '#e9edef', marginBottom: '0.5rem' }}>WhatsApp para Lirios</div>
                <div style={{ fontSize: '0.875rem' }}>Selecciona una conversación para comenzar</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {pendingMedia && (
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #222d34', background: '#1f2c34' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {pendingMedia.previewUrl ? (
                  <img
                    src={pendingMedia.previewUrl}
                    alt="preview"
                    style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      background: '#3b4a54',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: '#8696a0',
                    }}
                  >
                    {pendingMedia.tipo.toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: '#e9edef', fontSize: '0.85rem' }}>Adjunto listo</div>
                  <div style={{ fontSize: '0.75rem', color: '#8696a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingMedia.archivo?.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingMedia(null)}
                  style={{
                    background: '#5c3d3d',
                    border: 'none',
                    color: '#f15c6d',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              padding: isMobile ? '0.6rem 0.5rem' : '0.6rem 1rem',
              paddingBottom: isMobile ? '0.8rem' : '0.6rem',
              borderTop: '1px solid #222d34',
              display: 'flex',
              gap: isMobile ? '0.4rem' : '0.75rem',
              alignItems: 'center',
              background: '#202c33',
              position: 'sticky',
              bottom: 0,
              zIndex: 5,
              flexShrink: 0,
            }}
          >
            {/* Botón + para adjuntos */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMostrarMenuAdjuntos(!mostrarMenuAdjuntos)}
                disabled={!seleccion}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: mostrarMenuAdjuntos ? '#00a884' : 'transparent',
                  color: mostrarMenuAdjuntos ? '#111b21' : '#8696a0',
                  cursor: seleccion ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: seleccion ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
              >
                {mostrarMenuAdjuntos ? <X size={22} /> : <Plus size={24} />}
              </button>
              
              {/* Menu dropdown de adjuntos */}
              {mostrarMenuAdjuntos && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '0',
                    background: '#233138',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    minWidth: '160px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { inputImagen.current?.click(); setMostrarMenuAdjuntos(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#e9edef',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#182229'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#bf59cf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image size={18} color="white" />
                    </div>
                    Fotos
                  </button>
                  <button
                    type="button"
                    onClick={() => { inputDocumento.current?.click(); setMostrarMenuAdjuntos(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#e9edef',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#182229'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#5157ae', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} color="white" />
                    </div>
                    Documento
                  </button>
                  <button
                    type="button"
                    onClick={() => { inputAudio.current?.click(); setMostrarMenuAdjuntos(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#e9edef',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#182229'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={18} color="white" />
                    </div>
                    Audio
                  </button>
                </div>
              )}
            </div>

            <input
              ref={inputImagen}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { seleccionarArchivo('image', e.target.files?.[0]); setMostrarMenuAdjuntos(false); }}
            />
            <input
              ref={inputAudio}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => { seleccionarArchivo('audio', e.target.files?.[0]); setMostrarMenuAdjuntos(false); }}
            />
            <input
              ref={inputDocumento}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              style={{ display: 'none' }}
              onChange={(e) => { seleccionarArchivo('document', e.target.files?.[0]); setMostrarMenuAdjuntos(false); }}
            />
            
            {/* Input de mensaje - ocupa todo el ancho */}
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe un mensaje"
              disabled={!seleccion}
              style={{
                flex: 1,
                padding: isMobile ? '0.7rem 1rem' : '0.75rem 1.25rem',
                borderRadius: '24px',
                border: 'none',
                background: '#2a3942',
                fontSize: isMobile ? '0.95rem' : '1rem',
                color: '#e9edef',
                outline: 'none',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  enviarMensaje();
                }
              }}
              onFocus={() => { setMostrarMenuAdjuntos(false); setMostrarEmojis(false); }}
            />
            
            {/* Botón de emoji con panel */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => { setMostrarEmojis(!mostrarEmojis); setMostrarMenuAdjuntos(false); }}
                disabled={!seleccion}
                style={{
                  background: mostrarEmojis ? '#00a884' : 'transparent',
                  border: 'none',
                  cursor: seleccion ? 'pointer' : 'not-allowed',
                  color: mostrarEmojis ? '#111b21' : '#8696a0',
                  padding: '0.35rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: seleccion ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
              >
                <Smile size={24} />
              </button>
              
              {/* Panel de emojis */}
              {mostrarEmojis && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    right: isMobile ? '-100px' : '0',
                    background: '#233138',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    width: isMobile ? 'calc(100vw - 20px)' : '340px',
                    maxWidth: isMobile ? '320px' : '340px',
                    maxHeight: isMobile ? '280px' : '320px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                  }}
                >
                  {/* Categorías */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.25rem', 
                    padding: '0.5rem', 
                    borderBottom: '1px solid #3b4a54',
                    overflowX: 'auto',
                    flexShrink: 0,
                  }}>
                    {Object.keys(emojis).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoriaEmoji(cat)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: categoriaEmoji === cat ? '#00a884' : 'transparent',
                          color: categoriaEmoji === cat ? '#111b21' : '#8696a0',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  {/* Grid de emojis */}
                  <div style={{ 
                    padding: '0.5rem',
                    overflowY: 'auto',
                    flex: 1,
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(8, 1fr)', 
                      gap: '0.15rem',
                    }}>
                      {emojis[categoriaEmoji].map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setMensaje((prev) => prev + emoji);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '1.3rem' : '1.5rem',
                            padding: '0.25rem',
                            borderRadius: '6px',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#3b4a54'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón enviar */}
            <button
              type="button"
              onClick={enviarMensaje}
              disabled={!seleccion || (!mensaje.trim() && !pendingMedia)}
              style={{
                width: '44px',
                height: '44px',
                padding: '0',
                borderRadius: '50%',
                border: 'none',
                background: (mensaje.trim() || pendingMedia) ? '#00a884' : 'transparent',
                color: (mensaje.trim() || pendingMedia) ? '#111b21' : '#8696a0',
                cursor: (seleccion && (mensaje.trim() || pendingMedia)) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <Send size={22} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
