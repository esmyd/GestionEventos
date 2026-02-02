import { useState, useEffect } from 'react';
import { 
  Settings, Package, Check, X, AlertCircle, Save, RefreshCw,
  Users, Calendar, UserPlus, Shield, Zap, Eye, EyeOff,
  ChevronDown, ChevronUp, Building, Clock, CreditCard, Edit2,
  MessageCircle, DollarSign, Mail
} from 'lucide-react';
import api from '../services/api';

// Componente Toggle para módulos
const ModuloToggle = ({ modulo, onToggle, loading }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggle(modulo.codigo, !modulo.disponible);
    setIsToggling(false);
  };

  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all ${
      modulo.disponible ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={`font-semibold text-sm ${modulo.disponible ? 'text-slate-800' : 'text-slate-500'}`}>{modulo.nombre}</h4>
          {modulo.origen === 'adicional' && (
            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
              Adicional
            </span>
          )}
          {modulo.origen === 'plan' && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              Del plan
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{modulo.descripcion}</p>
        <p className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-2 gap-y-1">
          <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">{modulo.codigo}</code>
          {modulo.ruta_frontend && (
            <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[11px]">{modulo.ruta_frontend}</code>
          )}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading || isToggling}
        className={`ml-2 relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition-all ${
          modulo.disponible ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
        } ${(loading || isToggling) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-inner'}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
            modulo.disponible ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// Componente para editar límites
const LimiteEditor = ({ label, value, onChange, icon: Icon, descripcion }) => {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-5 h-5 text-slate-500" />}
        <label className="font-semibold text-slate-700">{label}</label>
      </div>
      <input
        type="number"
        min="0"
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium text-slate-800"
      />
      {descripcion && (
        <p className="text-xs text-slate-500 mt-1.5">{descripcion}</p>
      )}
    </div>
  );
};

export default function AdminSuscripcion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Datos
  const [resumen, setResumen] = useState(null);
  const [modulosExpandidos, setModulosExpandidos] = useState({});
  
  // Formularios de edición
  const [editandoLimites, setEditandoLimites] = useState(false);
  const [limites, setLimites] = useState({
    limite_usuarios: 0,
    limite_eventos_mes: 0,
    limite_clientes: 0
  });
  
  const [editandoEmpresa, setEditandoEmpresa] = useState(false);
  const [empresa, setEmpresa] = useState({
    nombre_empresa: '',
    email_contacto: '',
    telefono_contacto: ''
  });
  
  const [editandoEstado, setEditandoEstado] = useState(false);
  const [estadoForm, setEstadoForm] = useState({
    estado: 'activa',
    fecha_vencimiento: '',
    notas: ''
  });
  
  const [whatsappConsumo, setWhatsappConsumo] = useState(null);
  const [whatsappConsumoMeta, setWhatsappConsumoMeta] = useState(null);
  const [whatsappMetaError, setWhatsappMetaError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [resumenRes, consumoRes, consumoMetaRes] = await Promise.all([
        api.get('/suscripcion/admin/resumen'),
        api.get('/suscripcion/admin/whatsapp-consumo').catch(() => ({ data: null })),
        api.get('/suscripcion/admin/whatsapp-consumo-meta').catch((err) => ({
          data: err.response?.data || { error: err.message },
        })),
      ]);
      const response = resumenRes;
      setResumen(response.data);
      setWhatsappConsumo(consumoRes?.data || null);
      const metaData = consumoMetaRes?.data;
      if (metaData && !metaData.error) {
        setWhatsappConsumoMeta(metaData);
        setWhatsappMetaError(null);
      } else {
        setWhatsappConsumoMeta(null);
        setWhatsappMetaError(metaData?.error || 'No conectado');
      }
      
      // Inicializar formularios con datos actuales
      if (response.data.plan) {
        setLimites({
          limite_usuarios: response.data.plan.limite_usuarios || 0,
          limite_eventos_mes: response.data.plan.limite_eventos_mes || 0,
          limite_clientes: response.data.plan.limite_clientes || 0
        });
        setEmpresa({
          nombre_empresa: response.data.plan.nombre_empresa || '',
          email_contacto: response.data.plan.email_contacto || '',
          telefono_contacto: response.data.plan.telefono_contacto || ''
        });
        setEstadoForm({
          estado: response.data.estado?.estado || 'activa',
          fecha_vencimiento: response.data.plan.fecha_vencimiento || '',
          notas: ''
        });
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar la configuración de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const mostrarExito = (mensaje) => {
    setSuccess(mensaje);
    setTimeout(() => setSuccess(null), 3000);
  };

  const mostrarError = (mensaje) => {
    setError(mensaje);
    setTimeout(() => setError(null), 5000);
  };

  const handleToggleModulo = async (codigo, habilitar) => {
    try {
      await api.put(`/suscripcion/admin/modulo/${codigo}`, {
        habilitar,
        notas: `Cambiado desde panel admin`
      });
      mostrarExito(`Módulo ${habilitar ? 'habilitado' : 'deshabilitado'} exitosamente`);
      await cargarDatos();
    } catch (err) {
      console.error('Error al cambiar módulo:', err);
      mostrarError('Error al cambiar el estado del módulo');
    }
  };

  const handleCambiarPlan = async (planCodigo) => {
    if (!confirm(`¿Estás seguro de cambiar al plan "${planCodigo}"?`)) return;
    
    setSaving(true);
    try {
      await api.put('/suscripcion/admin/plan', {
        plan_codigo: planCodigo,
        notas: 'Cambio desde panel admin'
      });
      mostrarExito('Plan cambiado exitosamente');
      await cargarDatos();
    } catch (err) {
      console.error('Error al cambiar plan:', err);
      mostrarError('Error al cambiar el plan');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarLimites = async () => {
    setSaving(true);
    try {
      await api.put('/suscripcion/admin/limites', limites);
      mostrarExito('Límites actualizados exitosamente');
      setEditandoLimites(false);
      await cargarDatos();
    } catch (err) {
      console.error('Error al guardar límites:', err);
      mostrarError('Error al guardar los límites');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarEmpresa = async () => {
    setSaving(true);
    try {
      await api.put('/suscripcion/admin/empresa', empresa);
      mostrarExito('Información de empresa actualizada');
      setEditandoEmpresa(false);
      await cargarDatos();
    } catch (err) {
      console.error('Error al guardar empresa:', err);
      mostrarError('Error al guardar la información');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarEstado = async () => {
    setSaving(true);
    try {
      await api.put('/suscripcion/admin/estado', estadoForm);
      mostrarExito('Estado de suscripción actualizado');
      setEditandoEstado(false);
      await cargarDatos();
    } catch (err) {
      console.error('Error al guardar estado:', err);
      mostrarError('Error al actualizar el estado');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategoria = (categoria) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-50/90">
        <div className="flex flex-col items-center gap-5">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
          <p className="text-slate-600 font-semibold">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  const { plan, estado, uso, modulos, planes_disponibles } = resumen || {};

  // Agrupar módulos por categoría
  const modulosPorCategoria = {};
  if (modulos?.lista) {
    modulos.lista.forEach(m => {
      const cat = m.categoria || 'otros';
      if (!modulosPorCategoria[cat]) {
        modulosPorCategoria[cat] = [];
      }
      modulosPorCategoria[cat].push(m);
    });
  }

  const categoriasNombres = {
    'core': 'Funciones Principales',
    'finanzas': 'Finanzas y Reportes',
    'comunicacion': 'Comunicación',
    'integracion': 'Integraciones',
    'avanzado': 'Funciones Avanzadas',
    'otros': 'Otros'
  };

  return (
    <div className="min-h-full bg-slate-50/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
      {/* Header */}
      <header className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-start gap-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <Shield className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Administración de Suscripción
              </h1>
              <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed">
                Configura el plan, módulos y límites del cliente. El acceso se controla también por <strong className="text-slate-800 font-semibold">Roles y Permisos</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </header>

      {/* Mensajes */}
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-800 shadow-sm">
          <Check className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Panel izquierdo */}
        <div className="lg:col-span-1 space-y-6">
          {/* Plan actual */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600">
                  <Package className="w-5 h-5" />
                </span>
                Plan actual
              </h2>
            </div>
            <div className="p-5">
              <div
                className="p-5 rounded-xl mb-5 border-2"
                style={{ borderColor: `${plan?.color_tema || '#4F46E5'}30`, backgroundColor: `${plan?.color_tema || '#4F46E5'}0C` }}
              >
                <h3 className="text-lg font-bold text-slate-900">{plan?.plan_nombre}</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{plan?.plan_descripcion}</p>
                <p className="text-2xl font-bold mt-4 tracking-tight" style={{ color: plan?.color_tema || '#4F46E5' }}>
                  ${Number(plan?.precio_mensual || 0).toFixed(2)}
                  <span className="text-base font-normal text-slate-500">/mes</span>
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Cambiar plan</p>
              <div className="space-y-2">
                {planes_disponibles?.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleCambiarPlan(p.codigo)}
                    disabled={saving || p.codigo === plan?.plan_codigo}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 font-medium ${
                      p.codigo === plan?.plan_codigo
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm cursor-default ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span className="font-semibold">{p.nombre}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-slate-500">
                        {p.precio_mensual > 0 ? `$${Number(p.precio_mensual).toFixed(0)}/mes` : 'Contactar'}
                      </span>
                      {p.codigo === plan?.plan_codigo && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-200/80 px-2.5 py-0.5 rounded-full">Actual</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Consumo Meta (WhatsApp) - API de Meta */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-indigo-50/50">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600">
                  <MessageCircle className="w-5 h-5" />
                </span>
                Consumo Meta (WhatsApp)
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Datos desde la API de Meta (pricing_analytics)
              </p>
            </div>
            <div className="p-5">
              {whatsappConsumoMeta ? (
                <>
                  <p className="text-xs text-slate-500 mb-4">
                    {whatsappConsumoMeta.fecha_desde} — {whatsappConsumoMeta.fecha_hasta}
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">Volumen (Meta)</span>
                      <span className="font-bold tabular-nums text-slate-800">
                        {(whatsappConsumoMeta.mensajes_volumen ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4 py-2 px-3 rounded-xl bg-indigo-50 border border-indigo-200">
                      <span className="text-sm font-bold text-indigo-800 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        Costo (Meta)
                      </span>
                      <span className="font-bold text-indigo-700 tabular-nums">
                        ${Number(whatsappConsumoMeta.costo_total ?? 0).toFixed(2)}
                      </span>
                    </div>
                    {whatsappConsumoMeta.desglose?.length > 0 && (
                      <div className="text-xs text-slate-500 space-y-1 pl-2 border-l-2 border-indigo-200">
                        {whatsappConsumoMeta.desglose.slice(0, 5).map((d, i) => (
                          <div key={i}>
                            Vol: {d.volumen ?? 0} · Costo: ${Number(d.costo ?? 0).toFixed(2)}
                            {Object.keys(d.dimensions || {}).length > 0 && (
                              <span className="text-slate-400 ml-1">
                                ({JSON.stringify(d.dimensions)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">
                    Requiere el <strong>WABA ID</strong> en Config. Sistema → Integración WhatsApp.
                  </p>
                  <p className="text-xs text-slate-400">
                    Encuéntralo en Meta Business Manager → Configuración → Cuentas → WhatsApp Business Accounts.
                  </p>
                  {whatsappMetaError && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg">
                      {whatsappMetaError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Consumo WhatsApp (local) */}
          {whatsappConsumo && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50/50">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  Consumo WhatsApp
                </h2>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">
                  {whatsappConsumo.fecha_desde} — {whatsappConsumo.fecha_hasta}
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm font-medium text-slate-500">Mensajes enviados</span>
                    <span className="font-bold tabular-nums text-slate-800">
                      {whatsappConsumo.mensajes_enviados.toLocaleString()}
                      {whatsappConsumo.maximo_mensajes != null && (
                        <span className="text-slate-400 font-normal ml-1">/ {whatsappConsumo.maximo_mensajes}</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1 pl-2 border-l-2 border-emerald-200">
                    <div>Chat (bot): {whatsappConsumo.desglose?.chat_bot ?? 0}</div>
                    <div>Chat (humano): {whatsappConsumo.desglose?.chat_humano ?? 0}</div>
                    <div>Notificaciones: {whatsappConsumo.desglose?.notificaciones ?? 0}</div>
                    <div>Entrantes: {whatsappConsumo.desglose?.entrantes ?? 0}</div>
                  </div>
                  <div className="flex justify-between items-center gap-4 pt-2 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Precio unitario</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      ${Number(whatsappConsumo.precio_unitario || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      Costo WhatsApp
                    </span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      ${Number(whatsappConsumo.costo_total || 0).toFixed(2)}
                    </span>
                  </div>
                  {whatsappConsumo.email_enviados > 0 && (
                    <div className="flex justify-between items-center gap-4 text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        Email enviados
                      </span>
                      <span className="font-semibold text-slate-700">
                        {whatsappConsumo.email_enviados} · ${Number(whatsappConsumo.costo_email || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Estado */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600">
                  <Clock className="w-5 h-5" />
                </span>
                Estado
              </h2>
              <button
                onClick={() => setEditandoEstado(!editandoEstado)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
            {!editandoEstado ? (
              <dl className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <dt className="text-sm font-medium text-slate-500">Estado</dt>
                  <dd>
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-bold capitalize border ${
                      estado?.estado === 'activa' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      estado?.estado === 'prueba' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {estado?.estado}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <dt className="text-sm font-medium text-slate-500">Vencimiento</dt>
                  <dd className="font-semibold text-slate-800 tabular-nums">{plan?.fecha_vencimiento || '—'}</dd>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <dt className="text-sm font-medium text-slate-500">Días restantes</dt>
                  <dd className={`font-bold tabular-nums ${
                    (plan?.dias_restantes ?? 0) < 7 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {plan?.dias_restantes ?? '—'}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
                  <select
                    value={estadoForm.estado}
                    onChange={(e) => setEstadoForm({ ...estadoForm, estado: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="activa">Activa</option>
                    <option value="prueba">Prueba</option>
                    <option value="suspendida">Suspendida</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="vencida">Vencida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha vencimiento</label>
                  <input
                    type="date"
                    value={estadoForm.fecha_vencimiento}
                    onChange={(e) => setEstadoForm({ ...estadoForm, fecha_vencimiento: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notas</label>
                  <textarea
                    value={estadoForm.notas}
                    onChange={(e) => setEstadoForm({ ...estadoForm, notas: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows="2"
                  />
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleGuardarEstado}
                    disabled={saving}
                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditandoEstado(false)}
                    className="px-5 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            </div>
          </section>

          {/* Empresa */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 text-violet-600">
                  <Building className="w-5 h-5" />
                </span>
                Empresa
              </h2>
              <button
                onClick={() => setEditandoEmpresa(!editandoEmpresa)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
            {!editandoEmpresa ? (
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Nombre</dt>
                  <dd className="font-semibold text-slate-800 mt-1">{plan?.nombre_empresa || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Email</dt>
                  <dd className="font-semibold text-slate-800 mt-1 break-all">{plan?.email_contacto || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Teléfono</dt>
                  <dd className="font-semibold text-slate-800 mt-1">{plan?.telefono_contacto || '—'}</dd>
                </div>
              </dl>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre empresa</label>
                  <input
                    type="text"
                    placeholder="Ej: Mi Empresa de Eventos"
                    value={empresa.nombre_empresa}
                    onChange={(e) => setEmpresa({ ...empresa, nombre_empresa: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email contacto</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={empresa.email_contacto}
                    onChange={(e) => setEmpresa({ ...empresa, email_contacto: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej: +57 300 123 4567"
                    value={empresa.telefono_contacto}
                    onChange={(e) => setEmpresa({ ...empresa, telefono_contacto: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleGuardarEmpresa}
                    disabled={saving}
                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditandoEmpresa(false)}
                    className="px-5 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            </div>
          </section>

          {/* Límites */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 text-amber-600">
                  <Zap className="w-5 h-5" />
                </span>
                Límites de uso
              </h2>
              <button
                onClick={() => setEditandoLimites(!editandoLimites)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
            {!editandoLimites ? (
              <div className="space-y-5">
                {[
                  { key: 'usuarios', label: 'Usuarios', actual: uso?.usuarios?.actual ?? 0, limite: uso?.usuarios?.limite ?? 0, icon: Users },
                  { key: 'eventos_mes', label: 'Eventos / mes', actual: uso?.eventos_mes?.actual ?? 0, limite: uso?.eventos_mes?.limite ?? 0, icon: Calendar },
                  { key: 'clientes', label: 'Clientes', actual: uso?.clientes?.actual ?? 0, limite: uso?.clientes?.limite ?? 0, icon: UserPlus },
                ].map(({ key, label, actual, limite, icon: Icon }) => {
                  const excede = limite > 0 && actual > limite;
                  const porcentaje = limite > 0 ? Math.min(100, (actual / limite) * 100) : 0;
                  const widthPct = limite > 0 ? Math.min(100, (actual / limite) * 100) : 0;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Icon className="w-4 h-4 text-slate-500" />
                          {label}
                        </span>
                        <span className={`font-bold tabular-nums shrink-0 text-sm ${excede ? 'text-red-600' : 'text-slate-800'}`}>
                          {actual} <span className="text-slate-400 font-normal">/</span> {limite}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            excede ? 'bg-red-500' : porcentaje >= 80 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      {excede && (
                        <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Límite superado
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <LimiteEditor
                  label="Usuarios"
                  value={limites.limite_usuarios}
                  onChange={(v) => setLimites({ ...limites, limite_usuarios: v })}
                  icon={Users}
                  descripcion="0 = usar límite del plan"
                />
                <LimiteEditor
                  label="Eventos/mes"
                  value={limites.limite_eventos_mes}
                  onChange={(v) => setLimites({ ...limites, limite_eventos_mes: v })}
                  icon={Calendar}
                  descripcion="0 = usar límite del plan"
                />
                <LimiteEditor
                  label="Clientes"
                  value={limites.limite_clientes}
                  onChange={(v) => setLimites({ ...limites, limite_clientes: v })}
                  icon={UserPlus}
                  descripcion="0 = usar límite del plan"
                />
                <div className="flex gap-3 pt-5">
                  <button
                    onClick={handleGuardarLimites}
                    disabled={saving}
                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditandoLimites(false)}
                    className="px-5 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            </div>
          </section>
        </div>

        {/* Panel derecho - Módulos */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600">
                  <Settings className="w-5 h-5" />
                </span>
                Control de Módulos
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800 font-semibold border border-emerald-200/60">
                  <Eye className="w-4 h-4" />
                  {modulos?.activos ?? 0} activos
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 font-semibold border border-slate-200">
                  <EyeOff className="w-4 h-4" />
                  {modulos?.inactivos ?? 0} inactivos
                </span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Habilita o deshabilita módulos. Lo que esté activo aquí se combina con <strong className="text-slate-800 font-semibold">Roles y Permisos</strong>: el usuario solo verá el módulo si está en su plan y su rol tiene permiso.
              </p>

              {/* Módulos por categoría */}
              <div className="space-y-3">
                {Object.entries(modulosPorCategoria).map(([categoria, modulosCategoria]) => (
                  <div key={categoria} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <button
                      onClick={() => toggleCategoria(categoria)}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors text-left"
                    >
                      <span className="font-semibold text-slate-800">
                        {categoriasNombres[categoria] || categoria}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-500 tabular-nums">
                        {modulosCategoria.filter(m => m.disponible).length} / {modulosCategoria.length}
                        {modulosExpandidos[categoria] ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </span>
                    </button>
                    {modulosExpandidos[categoria] && (
                      <div className="p-4 space-y-3 bg-white">
                        {modulosCategoria.map(modulo => (
                          <ModuloToggle
                            key={modulo.codigo}
                            modulo={modulo}
                            onToggle={handleToggleModulo}
                            loading={saving}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
}
