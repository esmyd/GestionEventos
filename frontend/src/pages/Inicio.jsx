import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { planesService, salonesService, productosService, tiposEventoService, eventosService, clientesService, usuariosService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import ToastContainer from '../components/ToastContainer';
import { Calculator, Calendar, Users, Building, FileText, Plus, Trash2, MapPin, Mail, Phone, Instagram, Facebook, MessageCircle, Video } from 'lucide-react';
import { isRoleAllowed, ROLES } from '../utils/roles';

const Inicio = () => {
  const { toasts, removeToast, error: showError, success } = useToast();
  const { usuario, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const usuarioId = usuario?.id || usuario?.user_id || null;
  const obtenerFechaProximoFinSemana = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    let diasHastaSabado = (6 - diaSemana + 7) % 7;
    if (diasHastaSabado === 0) {
      diasHastaSabado = 7;
    }
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + diasHastaSabado);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [planes, setPlanes] = useState([]);
  const [salones, setSalones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    tipo_evento: '',
    fecha_evento: obtenerFechaProximoFinSemana(),
    invitados: '50',
    plan_id: '',
    salon_id: '',
  });
  const [extras, setExtras] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState('1');
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [registroData, setRegistroData] = useState({
    nombre_completo: '',
    nombre_usuario: '',
    contrasena: '',
    email: '',
    telefono: '',
    documento_identidad: '',
    direccion: '',
  });
  const [registroError, setRegistroError] = useState('');
  const [registroLoading, setRegistroLoading] = useState(false);
  const [cotizacionLoading, setCotizacionLoading] = useState(false);
  const [mostrarCompletarCliente, setMostrarCompletarCliente] = useState(false);
  const [clienteData, setClienteData] = useState({
    nombre_completo: '',
    telefono: '',
    documento_identidad: '',
  });
  const [clienteError, setClienteError] = useState('');
  const [clienteLoading, setClienteLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [planesData, salonesData, productosData, tiposData] = await Promise.all([
          planesService.getAll(true),
          salonesService.getAll(true),
          productosService.getAll(true),
          tiposEventoService.getAll(true),
        ]);
        setPlanes(planesData.planes || []);
        setSalones(salonesData.salones || []);
        setProductos(productosData.productos || []);
        setTiposEvento(tiposData.tipos_evento || tiposData.tipos || []);
        setError('');
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'No se pudieron cargar los datos del cotizador';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [showError]);

  useEffect(() => {
    const pendiente = sessionStorage.getItem('cotizacion_pendiente');
    if (!pendiente) return;
    try {
      const data = JSON.parse(pendiente);
      if (data?.formData) {
        setFormData(data.formData);
      }
      if (Array.isArray(data?.extras)) {
        setExtras(data.extras);
      }
      sessionStorage.removeItem('cotizacion_pendiente');
      if (isAuthenticated) {
        success('Completa tus datos para descargar la cotización.');
      }
    } catch {
      sessionStorage.removeItem('cotizacion_pendiente');
    }
  }, [isAuthenticated, success]);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);
  };

  const parseNumero = (valor) => {
    const numero = Number.parseFloat(valor);
    return Number.isFinite(numero) ? numero : 0;
  };

  const planSeleccionado = useMemo(
    () => planes.find((plan) => String(plan.id) === String(formData.plan_id)),
    [planes, formData.plan_id]
  );

  const salonSeleccionado = useMemo(
    () => salones.find((salon) => String(salon.id_salon || salon.id) === String(formData.salon_id)),
    [salones, formData.salon_id]
  );

  const planSugerido = useMemo(() => {
    const invitados = parseInt(formData.invitados || '0', 10);
    if (!invitados || planes.length === 0) return null;

    const normalizados = planes.map((plan) => {
      const min = parseInt(plan.capacidad_minima || '0', 10) || 0;
      const max = parseInt(plan.capacidad_maxima || '0', 10) || 0;
      return { ...plan, min, max };
    });

    const candidatos = normalizados.filter((plan) => {
      if (plan.max > 0) {
        return invitados >= plan.min && invitados <= plan.max;
      }
      return invitados >= plan.min;
    });

    const seleccion = (candidatos.length > 0 ? candidatos : normalizados)
      .slice()
      .sort((a, b) => {
        const diffA = a.max ? Math.abs(a.max - invitados) : Math.abs(a.min - invitados);
        const diffB = b.max ? Math.abs(b.max - invitados) : Math.abs(b.min - invitados);
        if (diffA !== diffB) return diffA - diffB;
        const precioA = parseNumero(a.precio_base || a.precio);
        const precioB = parseNumero(b.precio_base || b.precio);
        return precioA - precioB;
      })[0];

    return seleccion || null;
  }, [formData.invitados, planes]);

  const salonSugerido = useMemo(() => {
    const invitados = parseInt(formData.invitados || '0', 10);
    if (!invitados || salones.length === 0) return null;

    const normalizados = salones.map((salon) => {
      const capacidad = parseInt(salon.capacidad || '0', 10) || 0;
      return { ...salon, capacidad };
    });

    const candidatos = normalizados.filter((salon) => salon.capacidad >= invitados);
    const seleccion = (candidatos.length > 0 ? candidatos : normalizados)
      .slice()
      .sort((a, b) => {
        const diffA = Math.abs(a.capacidad - invitados);
        const diffB = Math.abs(b.capacidad - invitados);
        if (diffA !== diffB) return diffA - diffB;
        const precioA = parseNumero(a.precio_base || a.precio);
        const precioB = parseNumero(b.precio_base || b.precio);
        return precioA - precioB;
      })[0];

    return seleccion || null;
  }, [formData.invitados, salones]);

  const productosSeleccionados = useMemo(() => {
    return extras.map((extra) => {
      const producto = productos.find((item) => String(item.id_producto || item.id) === String(extra.producto_id));
      return {
        ...extra,
        producto,
      };
    });
  }, [extras, productos]);

  const totalEstimado = useMemo(() => {
    const totalPlan = parseNumero(planSeleccionado?.precio_base || planSeleccionado?.precio);
    const totalSalon = parseNumero(salonSeleccionado?.precio_base || salonSeleccionado?.precio);
    const totalExtras = productosSeleccionados.reduce((sum, item) => {
      const precio = parseNumero(item.producto?.precio || item.producto?.precio_base);
      return sum + precio * parseNumero(item.cantidad);
    }, 0);
    return totalPlan + totalSalon + totalExtras;
  }, [planSeleccionado, salonSeleccionado, productosSeleccionados]);

  const agregarExtra = () => {
    if (!productoSeleccionado) return;
    const cantidad = parseInt(cantidadProducto, 10);
    if (!Number.isFinite(cantidad) || cantidad <= 0) return;
    setExtras((prev) => [...prev, { producto_id: productoSeleccionado, cantidad }]);
    setProductoSeleccionado('');
    setCantidadProducto('1');
  };

  const eliminarExtra = (index) => {
    setExtras((prev) => prev.filter((_, idx) => idx !== index));
  };

  const obtenerNombreSalon = () => {
    if (!salonSeleccionado) return null;
    const nombre = salonSeleccionado.nombre || null;
    if (!nombre) return null;
    if (salonSeleccionado.capacidad) {
      return `${nombre} (Cap: ${salonSeleccionado.capacidad})`;
    }
    return nombre;
  };

  const crearEventoConExtras = async (clienteId) => {
    const eventoData = {
      cliente_id: clienteId,
      nombre_evento: formData.tipo_evento ? `Cotizacion ${formData.tipo_evento}` : 'Cotizacion',
      tipo_evento: formData.tipo_evento || null,
      fecha_evento: formData.fecha_evento || null,
      numero_invitados: formData.invitados ? parseInt(formData.invitados, 10) : null,
      estado: 'cotizacion',
      total: totalEstimado,
      saldo: totalEstimado,
      observaciones: 'Cotizacion creada desde la web',
    };

    if (formData.plan_id) {
      eventoData.plan_id = parseInt(formData.plan_id, 10);
    }
    if (formData.salon_id) {
      eventoData.id_salon = parseInt(formData.salon_id, 10);
      const nombreSalon = obtenerNombreSalon();
      if (nombreSalon) {
        eventoData.salon = nombreSalon;
      }
    }

    const response = await eventosService.create(eventoData);
    const eventoId = response.evento?.id_evento || response.evento?.id;

    if (eventoId && extras.length > 0) {
      for (const extra of extras) {
        const producto = productos.find((item) => String(item.id_producto || item.id) === String(extra.producto_id));
        const precioUnitario = parseNumero(producto?.precio || producto?.precio_base);
        await eventosService.agregarProducto(eventoId, extra.producto_id, extra.cantidad, precioUnitario);
      }
      await eventosService.calcularTotal(eventoId);
    }

    return eventoId;
  };

  const guardarCotizacionPendiente = () => {
    const snapshot = {
      formData,
      extras,
      totalEstimado,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem('cotizacion_pendiente', JSON.stringify(snapshot));
  };

  const handleSolicitarCotizacion = async () => {
    if (!formData.invitados || !formData.fecha_evento) {
      showError('Completa la fecha del evento y el numero de invitados.');
      return;
    }
    if (!formData.plan_id && !formData.salon_id) {
      showError('Selecciona un plan o un salon para continuar.');
      return;
    }

    if (!isAuthenticated) {
      guardarCotizacionPendiente();
      setMostrarRegistro(true);
      return;
    }

    try {
      setCotizacionLoading(true);
      const clienteData = await clientesService.getMe();
      const clienteId = clienteData.cliente?.id || clienteData.cliente?.cliente_id;
      if (!clienteId) {
        setClienteData((prev) => ({
          ...prev,
          nombre_completo: usuario?.nombre_completo || prev.nombre_completo,
          telefono: usuario?.telefono || prev.telefono,
        }));
        setMostrarCompletarCliente(true);
        return;
      }
      const eventoId = await crearEventoConExtras(clienteId);
      if (eventoId) {
        success('Cotizacion creada. Ya puedes descargarla desde tu cuenta.');
      } else {
        showError('No se pudo crear la cotizacion. Intenta nuevamente.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setClienteData((prev) => ({
          ...prev,
          nombre_completo: usuario?.nombre_completo || prev.nombre_completo,
          telefono: usuario?.telefono || prev.telefono,
        }));
        setMostrarCompletarCliente(true);
        return;
      }
      const errorMessage = err.response?.data?.error || 'Error al enviar la cotizacion';
      showError(errorMessage);
    } finally {
      setCotizacionLoading(false);
    }
  };

  const handleIrLogin = () => {
    guardarCotizacionPendiente();
    navigate('/login');
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setRegistroError('');

    if (!registroData.nombre_completo || !registroData.nombre_usuario || !registroData.contrasena) {
      setRegistroError('Nombre completo, usuario y contraseña son obligatorios.');
      return;
    }

    try {
      setRegistroLoading(true);
      const clienteResponse = await clientesService.create({
        nombre_usuario: registroData.nombre_usuario,
        contrasena: registroData.contrasena,
        nombre_completo: registroData.nombre_completo,
        email: registroData.email || null,
        telefono: registroData.telefono || null,
        documento_identidad: registroData.documento_identidad || null,
        direccion: registroData.direccion || null,
      });

      const loginResult = await login(registroData.nombre_usuario, registroData.contrasena);
      if (!loginResult.success) {
        setRegistroError(loginResult.error || 'No se pudo iniciar sesion.');
        return;
      }

      const clienteId = clienteResponse.cliente?.id || clienteResponse.cliente?.cliente_id;
      if (!clienteId) {
        setRegistroError('No se pudo obtener el cliente creado.');
        return;
      }

      setCotizacionLoading(true);
      const eventoId = await crearEventoConExtras(clienteId);
      if (eventoId) {
        setMostrarRegistro(false);
        success('Registro completado y cotizacion enviada.');
      } else {
        setRegistroError('No se pudo crear la cotizacion.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'No se pudo completar el registro.';
      setRegistroError(errorMessage);
    } finally {
      setRegistroLoading(false);
      setCotizacionLoading(false);
    }
  };

  const handleCompletarCliente = async (e) => {
    e.preventDefault();
    setClienteError('');

    if (!clienteData.nombre_completo || !clienteData.telefono || !clienteData.documento_identidad) {
      setClienteError('Nombre completo, telefono y cedula son obligatorios.');
      return;
    }

    try {
      setClienteLoading(true);
      if (!usuarioId) {
        setClienteError('No se pudo identificar el usuario.');
        return;
      }

      await usuariosService.update(usuarioId, {
        nombre_completo: clienteData.nombre_completo,
        telefono: clienteData.telefono,
      });

      const clienteResponse = await clientesService.create({
        usuario_id: usuarioId,
        documento_identidad: clienteData.documento_identidad,
      });

      const clienteId = clienteResponse.cliente?.id || clienteResponse.cliente?.cliente_id;
      if (!clienteId) {
        setClienteError('No se pudo crear el cliente.');
        return;
      }

      setCotizacionLoading(true);
      const eventoId = await crearEventoConExtras(clienteId);
      if (eventoId) {
        setMostrarCompletarCliente(false);
        success('Cliente creado y cotizacion enviada.');
      } else {
        setClienteError('No se pudo crear la cotizacion.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'No se pudo completar el cliente.';
      setClienteError(errorMessage);
    } finally {
      setClienteLoading(false);
      setCotizacionLoading(false);
    }
  };

  const invitadosNumero = parseInt(formData.invitados || '0', 10);
  const capacidadSalon = parseInt(salonSeleccionado?.capacidad || '0', 10);
  const capacidadMinimaPlan = parseInt(planSeleccionado?.capacidad_minima || '0', 10);
  const capacidadMaximaPlan = parseInt(planSeleccionado?.capacidad_maxima || '0', 10);

  const advertencias = [];
  if (capacidadSalon && invitadosNumero > capacidadSalon) {
    advertencias.push('El número de invitados supera la capacidad del salón seleccionado.');
  }
  if (capacidadMinimaPlan && invitadosNumero > 0 && invitadosNumero < capacidadMinimaPlan) {
    advertencias.push('El número de invitados es menor a la capacidad mínima del plan.');
  }
  if (capacidadMaximaPlan && invitadosNumero > capacidadMaximaPlan) {
    advertencias.push('El número de invitados supera la capacidad máxima del plan.');
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.65rem',
    backgroundColor: 'white',
    fontSize: '0.95rem',
    boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '0.9rem',
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.75rem',
    borderRadius: '1rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 12px 30px -24px rgba(15, 23, 42, 0.3)',
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '0.95rem',
  };

  const sectionTitleStyle = {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.35rem',
  };

  const sectionSubtitleStyle = {
    color: '#64748b',
    fontSize: '0.98rem',
    marginBottom: '1.5rem',
  };

  const featureCardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.9rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 12px 30px -24px rgba(15, 23, 42, 0.3)',
  };

  const navButtonLabel = isAuthenticated ? 'Panel administrativo' : 'Iniciar sesión';
  const navButtonLink = isAuthenticated ? '/dashboard' : '/login';

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando cotizador...</div>;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'rgba(248, 250, 252, 0.92)',
          borderBottom: '1px solid #e2e8f0',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: '#0f172a',
              fontWeight: '800',
              fontSize: '1.1rem',
            }}
          >
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '700',
              }}
            >
              LE
            </span>
            Lirios Eventos
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <a href="#cotizador" style={navLinkStyle}>
              Cotizador
            </a>
            <a href="#servicios" style={navLinkStyle}>
              Servicios
            </a>
            <a href="#proceso" style={navLinkStyle}>
              Proceso
            </a>
            <Link
              to={navButtonLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.3rem',
                backgroundColor: '#0f172a',
                color: 'white',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: '700',
                boxShadow: '0 12px 26px -18px rgba(15, 23, 42, 0.7)',
              }}
            >
              {navButtonLabel}
            </Link>
          </nav>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '2.5rem 1.5rem 0' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #6366f1 100%)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at top right, rgba(255,255,255,0.25), transparent 45%)',
              opacity: 0.6,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '640px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                }}
              >
                <Calculator size={16} />
                Cotizador en linea
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0.85rem 0 0.5rem' }}>
                Cotiza tu evento en minutos
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
                Elige plan, salon y servicios adicionales. Te mostramos un estimado claro y rapido antes de solicitar tu cotizacion formal.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                {['Sin registro', 'Estimado inmediato', 'Descarga al registrarte'].map((item) => (
                  <span
                    key={item}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.18)',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {isRoleAllowed(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]) && (
              <Link
                to="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.6rem',
                  backgroundColor: 'white',
                  color: '#1e1b4b',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: '700',
                  boxShadow: '0 12px 24px -16px rgba(15,23,42,0.6)',
                }}
              >
                Ir al Dashboard
              </Link>
            )}
          </div>
        </div>

        <section id="servicios" style={{ marginTop: '3rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={sectionTitleStyle}>Experiencias que dejan huella</h2>
            <p style={sectionSubtitleStyle}>
              Diseñamos celebraciones únicas con un equipo experto, proveedores seleccionados y una ejecución impecable.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                titulo: 'Planeación integral',
                descripcion: 'Acompañamiento en cada fase: concepto, logística y coordinación en sitio.',
              },
              {
                titulo: 'Ambientes memorables',
                descripcion: 'Decoración, iluminación y detalles diseñados a la medida de tu estilo.',
              },
              {
                titulo: 'Proveedores premium',
                descripcion: 'Aliados en catering, música y fotografía para una experiencia perfecta.',
              },
              {
                titulo: 'Gestión transparente',
                descripcion: 'Cronogramas claros, reportes y seguimiento en tiempo real.',
              },
            ].map((item) => (
              <div key={item.titulo} style={featureCardStyle}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>{item.titulo}</h3>
                <p style={{ margin: '0.6rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>{item.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="proceso" style={{ marginTop: '3rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={sectionTitleStyle}>Un proceso claro y elegante</h2>
            <p style={sectionSubtitleStyle}>
              Desde la primera idea hasta el cierre del evento, cada detalle se gestiona con precisión.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {[
              { titulo: '1. Inspírate', descripcion: 'Define fecha, invitados y estilo. Nosotros te guiamos.' },
              { titulo: '2. Cotiza', descripcion: 'Calcula tu inversión con nuestro cotizador en línea.' },
              { titulo: '3. Planea', descripcion: 'Ajustamos la propuesta y cerramos proveedores.' },
              { titulo: '4. Disfruta', descripcion: 'Coordinamos en sitio para que vivas tu evento sin estrés.' },
            ].map((item) => (
              <div key={item.titulo} style={featureCardStyle}>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e1b4b', marginBottom: '0.35rem' }}>
                  {item.titulo}
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{item.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        {mostrarRegistro && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#eef2ff',
              color: '#3730a3',
              borderRadius: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid #c7d2fe',
            }}
          >
            <div>
              Para descargar la cotización, necesitamos que te registres o inicies sesión.
            </div>
            <button
              type="button"
              onClick={handleIrLogin}
              style={{
                padding: '0.65rem 1.4rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.55rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {mostrarRegistro && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.75rem',
                width: '100%',
                maxWidth: '520px',
                boxShadow: '0 20px 40px -24px rgba(15, 23, 42, 0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                    Completa tus datos
                  </h3>
                  <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Necesitamos estos datos para crear tu cuenta y enviar la cotizacion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarRegistro(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegistroSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  <div>
                    <label style={labelStyle}>Nombre completo</label>
                    <input
                      type="text"
                      value={registroData.nombre_completo}
                      onChange={(e) => setRegistroData({ ...registroData, nombre_completo: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Usuario</label>
                      <input
                        type="text"
                        value={registroData.nombre_usuario}
                        onChange={(e) => setRegistroData({ ...registroData, nombre_usuario: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Contraseña</label>
                      <input
                        type="password"
                        value={registroData.contrasena}
                        onChange={(e) => setRegistroData({ ...registroData, contrasena: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Email (opcional)</label>
                      <input
                        type="email"
                        value={registroData.email}
                        onChange={(e) => setRegistroData({ ...registroData, email: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Teléfono (opcional)</label>
                      <input
                        type="tel"
                        value={registroData.telefono}
                        onChange={(e) => setRegistroData({ ...registroData, telefono: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Documento (opcional)</label>
                      <input
                        type="text"
                        value={registroData.documento_identidad}
                        onChange={(e) => setRegistroData({ ...registroData, documento_identidad: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Dirección (opcional)</label>
                      <input
                        type="text"
                        value={registroData.direccion}
                        onChange={(e) => setRegistroData({ ...registroData, direccion: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {registroError && (
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #fecaca',
                      fontSize: '0.85rem',
                    }}
                  >
                    {registroError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setMostrarRegistro(false)}
                    style={{
                      padding: '0.65rem 1.2rem',
                      borderRadius: '0.6rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={registroLoading || cotizacionLoading}
                    style={{
                      padding: '0.65rem 1.2rem',
                      borderRadius: '0.6rem',
                      border: 'none',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      cursor: registroLoading || cotizacionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                    }}
                  >
                    {registroLoading || cotizacionLoading ? 'Procesando...' : 'Crear cuenta y enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {mostrarCompletarCliente && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.75rem',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 20px 40px -24px rgba(15, 23, 42, 0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                    Completar datos del cliente
                  </h3>
                  <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Necesitamos estos datos para crear tu perfil.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarCompletarCliente(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCompletarCliente} style={{ display: 'grid', gap: '0.85rem' }}>
                <div>
                  <label style={labelStyle}>Nombres completos</label>
                  <input
                    type="text"
                    value={clienteData.nombre_completo}
                    onChange={(e) => setClienteData({ ...clienteData, nombre_completo: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input
                    type="tel"
                    value={clienteData.telefono}
                    onChange={(e) => setClienteData({ ...clienteData, telefono: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Cedula</label>
                  <input
                    type="text"
                    value={clienteData.documento_identidad}
                    onChange={(e) => setClienteData({ ...clienteData, documento_identidad: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {clienteError && (
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #fecaca',
                      fontSize: '0.85rem',
                    }}
                  >
                    {clienteError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setMostrarCompletarCliente(false)}
                    style={{
                      padding: '0.6rem 1.15rem',
                      borderRadius: '0.6rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={clienteLoading || cotizacionLoading}
                    style={{
                      padding: '0.6rem 1.15rem',
                      borderRadius: '0.6rem',
                      border: 'none',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      cursor: clienteLoading || cotizacionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                    }}
                  >
                    {clienteLoading || cotizacionLoading ? 'Guardando...' : 'Guardar y enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <section id="cotizador" style={{ marginTop: '3rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={sectionTitleStyle}>Cotizador rápido</h2>
            <p style={sectionSubtitleStyle}>
              Configura tu evento y recibe un estimado inmediato. Luego nuestro equipo ajusta los detalles contigo.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '2rem', alignItems: 'start' }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                Detalles del evento
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                Selecciona los datos clave para estimar tu cotización.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>
                <Calendar size={16} />
                Fecha del evento
              </label>
              <input
                type="date"
                value={formData.fecha_evento}
                onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Users size={16} />
                Número de invitados
              </label>
              <input
                type="number"
                min="1"
                value={formData.invitados}
                onChange={(e) => setFormData({ ...formData, invitados: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <FileText size={16} />
                Tipo de evento
              </label>
              <select
                value={formData.tipo_evento}
                onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                style={inputStyle}
              >
                <option value="">Selecciona un tipo</option>
                {tiposEvento.map((tipo) => (
                  <option key={tipo.id || tipo.id_tipo} value={tipo.nombre || tipo.tipo_evento || tipo.descripcion}>
                    {tipo.nombre || tipo.tipo_evento || tipo.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                <FileText size={16} />
                Plan
              </label>
              <select
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                style={inputStyle}
              >
                <option value="">Selecciona un plan</option>
                {planes.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre} - {formatearMoneda(plan.precio_base || plan.precio)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                <Building size={16} />
                Salón
              </label>
              <select
                value={formData.salon_id}
                onChange={(e) => setFormData({ ...formData, salon_id: e.target.value })}
                style={inputStyle}
              >
                <option value="">Selecciona un salón</option>
                {salones.map((salon) => (
                  <option key={salon.id_salon || salon.id} value={salon.id_salon || salon.id}>
                    {salon.nombre} ({salon.capacidad || 'Cap. N/A'}) - {formatearMoneda(salon.precio_base || salon.precio)}
                  </option>
                ))}
              </select>
            </div>
          </div>

            {(planSugerido || salonSugerido) && (
              <div
                style={{
                  marginTop: '1.75rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '0.9rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                  Recomendación según invitados
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {planSugerido && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>Plan sugerido</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          {planSugerido.nombre} · Capacidad {planSugerido.capacidad_minima || 0}
                          {planSugerido.capacidad_maxima ? `-${planSugerido.capacidad_maxima}` : '+'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, plan_id: String(planSugerido.id) }))}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '0.6rem',
                          border: '1px solid #cbd5f5',
                          backgroundColor: 'white',
                          color: '#3730a3',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        Usar plan
                      </button>
                    </div>
                  )}
                  {salonSugerido && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>Salón sugerido</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          {salonSugerido.nombre} · Capacidad {salonSugerido.capacidad || 'N/A'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            salon_id: String(salonSugerido.id_salon || salonSugerido.id),
                          }))
                        }
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '0.6rem',
                          border: '1px solid #cbd5f5',
                          backgroundColor: 'white',
                          color: '#3730a3',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        Usar salón
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          <div style={{ marginTop: '2.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#0f172a' }}>
              Servicios adicionales
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  ...inputStyle,
                }}
              >
                <option value="">Selecciona un servicio</option>
                {productos.map((producto) => (
                  <option key={producto.id_producto || producto.id} value={producto.id_producto || producto.id}>
                    {producto.nombre} - {formatearMoneda(producto.precio || producto.precio_base)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={cantidadProducto}
                onChange={(e) => setCantidadProducto(e.target.value)}
                style={{
                  width: '120px',
                  ...inputStyle,
                }}
              />
              <button
                type="button"
                onClick={agregarExtra}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.2rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.65rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 10px 20px -16px rgba(79, 70, 229, 0.8)',
                }}
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>

            {productosSeleccionados.length > 0 && (
              <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                {productosSeleccionados.map((item, index) => (
                  <div
                    key={`${item.producto_id}-${index}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500' }}>{item.producto?.nombre || 'Servicio'}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Cantidad: {item.cantidad}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: '600' }}>
                        {formatearMoneda((item.producto?.precio || item.producto?.precio_base || 0) * item.cantidad)}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminarExtra(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...cardStyle, height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Calculator size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>Resumen estimado</h3>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem', color: '#1f2937' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Plan</span>
              <span>{formatearMoneda(planSeleccionado?.precio_base || planSeleccionado?.precio)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Salón</span>
              <span>{formatearMoneda(salonSeleccionado?.precio_base || salonSeleccionado?.precio)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Servicios adicionales</span>
              <span>{formatearMoneda(productosSeleccionados.reduce((sum, item) => {
                const precio = item.producto?.precio || item.producto?.precio_base || 0;
                return sum + precio * item.cantidad;
              }, 0))}</span>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem' }}>
              <span>Total estimado</span>
              <span>{formatearMoneda(totalEstimado)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSolicitarCotizacion}
            disabled={cotizacionLoading || registroLoading}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              backgroundColor: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: cotizacionLoading || registroLoading ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              marginBottom: '1rem',
              boxShadow: '0 12px 26px -18px rgba(15, 23, 42, 0.8)',
              opacity: cotizacionLoading || registroLoading ? 0.7 : 1,
            }}
          >
            {cotizacionLoading || registroLoading
              ? 'Enviando...'
              : isAuthenticated
                ? 'Solicitar descarga de cotizacion'
                : 'Enviar cotizacion'}
          </button>

          {advertencias.length > 0 && (
            <div
              style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {advertencias.map((item, index) => (
                <div key={index}>• {item}</div>
              ))}
            </div>
          )}

          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Este valor es solo una referencia. El equipo de Lirios Eventos confirmará la cotización final.
          </div>
        </div>
      </div>
        </section>
        <footer
          style={{
            marginTop: '4rem',
            padding: '2.5rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: 'white',
            borderRadius: '1.25rem',
            boxShadow: '0 16px 40px -28px rgba(15, 23, 42, 0.3)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.6rem' }}>
                Lirios Eventos
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                Diseñamos experiencias memorables para bodas, eventos corporativos y celebraciones únicas.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.6rem' }}>Contacto</div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.95rem' }}>
                  <Mail size={16} />
                  ventas@lirioseventos.com
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.95rem' }}>
                  <Phone size={16} />
                  +57 310 000 0000
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.95rem' }}>
                  <MapPin size={16} />
                  Medellín, Colombia
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.6rem' }}>Síguenos</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
                  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
                  { label: 'TikTok', href: 'https://tiktok.com', icon: Video },
                  { label: 'WhatsApp', href: 'https://wa.me/573100000000', icon: MessageCircle },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.5rem 0.9rem',
                      borderRadius: '999px',
                      border: '1px solid #e2e8f0',
                      textDecoration: 'none',
                      color: '#0f172a',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      backgroundColor: '#f8fafc',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} Lirios Eventos. Todos los derechos reservados.
          </div>
        </footer>
        <div style={{ paddingBottom: '3rem' }} />
      </div>
      </div>
    </div>
  );
};

export default Inicio;
