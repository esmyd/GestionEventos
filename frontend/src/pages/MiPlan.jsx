import { useState, useEffect, useRef } from 'react';
import { 
  Package, Check, AlertCircle, Crown, Zap, Building, 
  Users, Calendar, UserPlus, ChevronRight, CreditCard,
  HelpCircle, Clock, Sparkles
} from 'lucide-react';
import api, { configuracionesService } from '../services/api';

// Mapeo de iconos por código
const iconMap = {
  'layout-dashboard': Package,
  'calendar': Calendar,
  'calendar-days': Calendar,
  'users': Users,
  'box': Package,
  'credit-card': CreditCard,
  'building': Building,
  'crown': Crown,
  'package': Package,
};

const getIcon = (iconName) => iconMap[iconName] || Package;

// KPI Card estilo reportes
const KPICard = ({ titulo, valor, subtexto, icono, color = '#22c55e' }) => {
  const Icon = icono;
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            {titulo}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0.25rem 0' }}>
            {valor}
          </p>
          {subtexto && (
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{subtexto}</p>
          )}
        </div>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: '0.5rem',
          }}
        >
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
};

// Progress bar estilo reportes
const UsageBar = ({ label, actual, limite }) => {
  const porcentaje = limite > 0 ? Math.min(100, (actual / limite) * 100) : 0;
  const esCritico = porcentaje >= 90;
  const esAdvertencia = porcentaje >= 70;
  const fillColor = esCritico ? '#ef4444' : esAdvertencia ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: esCritico ? '#ef4444' : esAdvertencia ? '#f59e0b' : '#111827' }}>
          {actual} / {limite}
        </span>
      </div>
      <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${porcentaje}%`, backgroundColor: fillColor, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

// Card contenedor
const Card = ({ titulo, icono, color, children, className = '' }) => {
  const Icon = icono;
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      {titulo && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {Icon && (
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: `${color || '#22c55e'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color={color || '#22c55e'} />
            </div>
          )}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{titulo}</h3>
        </div>
      )}
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  );
};

// Módulo card compacto
const ModuloCard = ({ modulo, disponible }) => {
  const Icon = getIcon(modulo.icono);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        backgroundColor: disponible ? '#f0fdf4' : '#f9fafb',
        border: `1px solid ${disponible ? '#bbf7d0' : '#e5e7eb'}`,
      }}
    >
      <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: disponible ? '#22c55e20' : '#e5e7eb', marginRight: '0.75rem' }}>
        <Icon size={18} color={disponible ? '#22c55e' : '#9ca3af'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: disponible ? '#111827' : '#6b7280', margin: 0, fontSize: '0.9rem' }}>{modulo.nombre}</p>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{modulo.descripcion}</p>
      </div>
      {disponible ? (
        <Check size={18} color="#22c55e" strokeWidth={2.5} />
      ) : (
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>No incluido</span>
      )}
    </div>
  );
};

export default function MiPlan() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [categorias, setCategorias] = useState(null);
  const [planesDisponibles, setPlanesDisponibles] = useState([]);
  const [mostrarPlanes, setMostrarPlanes] = useState(false);
  const [contacto, setContacto] = useState({ email: '', whatsapp: '' });
  const planesRef = useRef(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [miPlanRes, categoriasRes, planesRes, configRes] = await Promise.all([
        api.get('/suscripcion/mi-plan'),
        api.get('/suscripcion/modulos/categorias'),
        api.get('/suscripcion/planes'),
        configuracionesService.getGeneralPublic().catch(() => ({ configuracion: {} })),
      ]);
      setPlanData(miPlanRes.data);
      setCategorias(categoriasRes.data.categorias);
      setPlanesDisponibles(planesRes.data.planes || []);
      const conf = configRes?.configuracion || configRes || {};
      setContacto({
        email: conf.contacto_email || '',
        whatsapp: conf.contacto_whatsapp || conf.contacto_telefono || '',
      });
    } catch (err) {
      console.error('Error al cargar datos del plan:', err);
      setError('Error al cargar la información del plan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Cargando tu plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Card titulo="Error" icono={AlertCircle} color="#ef4444">
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={cargarDatos}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#22c55e',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Reintentar
          </button>
        </Card>
      </div>
    );
  }

  const { plan, estado_suscripcion, uso } = planData || {};
  const PlanIcon = plan?.plan_icono ? getIcon(plan.plan_icono) : Package;
  const diasRestantes = plan?.dias_restantes;
  const diasTexto = diasRestantes != null
    ? (diasRestantes >= 0 ? `${diasRestantes} días restantes` : `Vencido hace ${Math.abs(diasRestantes)} días`)
    : 'Sin vencimiento';

  const modulosActivos = categorias ? Object.values(categorias).reduce((acc, cat) => acc + (cat.modulos?.filter((m) => m.disponible)?.length || 0), 0) : 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111827' }}>Mi Plan</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Tu plan actual, beneficios incluidos y uso de recursos</p>
      </div>

      {/* Alerta suscripción inactiva */}
      {estado_suscripcion && !estado_suscripcion.activa && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}>
          <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, color: '#991b1b', margin: 0 }}>Atención requerida</p>
            <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>{estado_suscripcion.mensaje}</p>
          </div>
        </div>
      )}

      {/* KPI Cards - Beneficios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard titulo="Usuarios" valor={uso?.usuarios?.limite ?? 0} icono={Users} color="#3b82f6" />
        <KPICard titulo="Eventos/mes" valor={uso?.eventos_mes?.limite ?? 0} icono={Calendar} color="#22c55e" />
        <KPICard titulo="Clientes" valor={uso?.clientes?.limite ?? 0} icono={UserPlus} color="#8b5cf6" />
        <KPICard titulo="Módulos activos" valor={modulosActivos} subtexto={`de ${categorias ? Object.values(categorias).reduce((a, c) => a + (c.modulos?.length || 0), 0) : 0} disponibles`} icono={Package} color="#f59e0b" />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Plan y uso */}
          <Card titulo={`Plan ${plan?.plan_nombre || 'Sin plan'}`} icono={PlanIcon} color={plan?.color_tema || '#22c55e'}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>{plan?.plan_descripcion}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              {plan?.precio_mensual > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: '#374151' }}>
                  <CreditCard size={14} color="#22c55e" /> ${Number(plan.precio_mensual).toFixed(2)}/mes
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: '#374151' }}>
                <Clock size={14} color="#22c55e" /> {diasTexto}
              </span>
              {estado_suscripcion?.estado && (
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: estado_suscripcion.estado === 'activa' ? '#dcfce7' : estado_suscripcion.estado === 'prueba' ? '#fef3c7' : '#f3f4f6',
                  color: estado_suscripcion.estado === 'activa' ? '#166534' : estado_suscripcion.estado === 'prueba' ? '#92400e' : '#4b5563',
                }}>
                  {estado_suscripcion.estado}
                </span>
              )}
            </div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uso de recursos</h4>
            {uso?.usuarios && <UsageBar label="Usuarios" actual={uso.usuarios.actual} limite={uso.usuarios.limite} />}
            {uso?.eventos_mes && <UsageBar label="Eventos este mes" actual={uso.eventos_mes.actual} limite={uso.eventos_mes.limite} />}
            {uso?.clientes && <UsageBar label="Clientes registrados" actual={uso.clientes.actual} limite={uso.clientes.limite} />}
          </Card>

          {/* Módulos */}
          <Card titulo="Módulos de tu plan" icono={Sparkles} color="#22c55e">
            {categorias && Object.entries(categorias).map(([key, cat]) =>
              cat.modulos && cat.modulos.length > 0 && (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>{cat.nombre}</p>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {cat.modulos.map((m) => (
                      <ModuloCard key={m.codigo} modulo={m} disponible={m.disponible} />
                    ))}
                  </div>
                </div>
              )
            )}
          </Card>
        </div>

        {/* Columna derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card titulo="Información de cuenta" icono={Building} color="#6366f1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Empresa</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', margin: '0.25rem 0 0 0' }}>{plan?.nombre_empresa || 'Sin configurar'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Estado</p>
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.25rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: estado_suscripcion?.estado === 'activa' ? '#dcfce7' : '#f3f4f6',
                  color: estado_suscripcion?.estado === 'activa' ? '#166534' : '#4b5563',
                }}>
                  {estado_suscripcion?.estado || 'Desconocido'}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Vencimiento</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', margin: '0.25rem 0 0 0' }}>{plan?.fecha_vencimiento || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Ciclo</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', margin: '0.25rem 0 0 0' }}>{plan?.ciclo_facturacion || 'Mensual'}</p>
              </div>
            </div>
          </Card>

          <button
            onClick={() => setMostrarPlanes(!mostrarPlanes)}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#22c55e15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} color="#22c55e" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>¿Necesitas más?</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Ver planes disponibles</p>
              </div>
            </div>
            <ChevronRight size={20} color="#6b7280" style={{ transform: mostrarPlanes ? 'rotate(90deg)' : 'none' }} />
          </button>

          <a
            href={contacto.whatsapp
              ? `https://wa.me/${(contacto.whatsapp || '').replace(/\D/g, '')}`
              : contacto.email
                ? `mailto:${contacto.email}?subject=Soporte - Mi Plan`
                : undefined
            }
            target={contacto.whatsapp || contacto.email ? '_blank' : undefined}
            rel="noopener noreferrer"
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'inherit',
              cursor: contacto.whatsapp || contacto.email ? 'pointer' : 'default',
              pointerEvents: contacto.whatsapp || contacto.email ? 'auto' : 'none',
              opacity: contacto.whatsapp || contacto.email ? 1 : 0.7,
            }}
          >
            <HelpCircle size={20} color="#6b7280" />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              ¿Necesitas ayuda? Contacta a soporte
              {contacto.whatsapp && ' (WhatsApp)'}
              {!contacto.whatsapp && contacto.email && ' (Email)'}
            </span>
          </a>
        </div>
      </div>

      {/* Comparación de planes */}
      {mostrarPlanes && (
        <div style={{ marginTop: '1.5rem' }}>
          <Card titulo="Planes disponibles" icono={Crown} color="#f59e0b">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {planesDisponibles.map((planItem) => {
                const esActual = planItem.codigo === plan?.plan_codigo;
                const ItemIcon = getIcon(planItem.icono);
                return (
                  <div
                    key={planItem.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: `2px solid ${esActual ? '#22c55e' : '#e5e7eb'}`,
                      backgroundColor: esActual ? '#f0fdf4' : 'white',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <ItemIcon size={18} color={planItem.color_tema || '#22c55e'} />
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{planItem.nombre}</span>
                      {esActual && <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '9999px', backgroundColor: '#22c55e', color: 'white', fontWeight: 600 }}>Tu plan</span>}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>{planItem.descripcion}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                      {planItem.precio_mensual > 0 ? `$${planItem.precio_mensual}/mes` : 'Contactar'}
                    </p>
                    <ul style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0, paddingLeft: '1.25rem' }}>
                      <li>{planItem.limite_usuarios} usuarios</li>
                      <li>{planItem.limite_eventos_mes} eventos/mes</li>
                      <li>{planItem.limite_clientes} clientes</li>
                    </ul>
                    {!esActual && (contacto.whatsapp || contacto.email) && (
                      <a
                        href={
                          contacto.whatsapp
                            ? `https://wa.me/${(contacto.whatsapp || '').replace(/\D/g, '')}?text=Hola, deseo solicitar cambio al plan ${encodeURIComponent(planItem.nombre)}`
                            : `mailto:${contacto.email}?subject=Solicitud cambio plan - ${encodeURIComponent(planItem.nombre)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          marginTop: '0.75rem',
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #22c55e',
                          backgroundColor: 'transparent',
                          color: '#22c55e',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          textDecoration: 'none',
                        }}
                      >
                        Solicitar cambio
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
