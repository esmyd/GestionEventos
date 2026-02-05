import React, { useEffect, useMemo, useState } from 'react';
import { usuariosService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { MODULES, PERMISSIONS, ROLES } from '../utils/roles';
import {
  Calendar,
  CreditCard,
  Users,
  Package,
  FolderTree,
  FileText,
  Landmark,
  Building,
  Shield,
  BarChart3,
  Settings,
  MessageCircle,
  Gauge,
  Mail,
  Upload,
  ChevronRight,
  Save,
  RotateCcw,
} from 'lucide-react';

/** Módulos con sus acciones (agrupados para la UI). Orden: operaciones, catálogos, configuración, sistema. */
const MODULOS_CON_ACCIONES = [
  {
    key: MODULES.EVENTOS,
    label: 'Eventos',
    icon: Calendar,
    acciones: [
      { key: PERMISSIONS.EVENTOS_EDITAR_ESTADO, label: 'Editar estado' },
      { key: PERMISSIONS.EVENTOS_FINALIZAR, label: 'Finalizar evento' },
      { key: PERMISSIONS.EVENTOS_AGREGAR_PRODUCTO, label: 'Agregar producto' },
      { key: PERMISSIONS.EVENTOS_ELIMINAR_PRODUCTO, label: 'Eliminar producto' },
      { key: PERMISSIONS.EVENTOS_ELIMINAR, label: 'Eliminar evento' },
      { key: PERMISSIONS.EVENTOS_ACTUALIZAR_SERVICIOS, label: 'Actualizar servicios' },
      { key: PERMISSIONS.EVENTOS_GENERAR_SERVICIOS, label: 'Generar servicios' },
      { key: PERMISSIONS.EVENTOS_DESCARTAR_SERVICIO, label: 'Descartar servicio' },
      { key: PERMISSIONS.EVENTOS_ASIGNAR_COORDINADOR, label: 'Asignar coordinador' },
      { key: PERMISSIONS.EVENTOS_SOLICITAR_EVALUACION, label: 'Solicitar Evaluación' },
      { key: PERMISSIONS.EVENTOS_CALIFICAR_MANUAL, label: 'Calificar Manual' },
      { key: PERMISSIONS.EVENTOS_VER_INFORMACION, label: 'Pestaña Información' },
      { key: PERMISSIONS.EVENTOS_VER_OPCIONES_CLIENTE, label: 'Pestaña Opciones del Cliente' },
      { key: PERMISSIONS.EVENTOS_VER_RECORDATORIOS, label: 'Pestaña Recordatorios' },
      { key: PERMISSIONS.EVENTOS_VER_FINANCIERO, label: 'Pestaña Financiero' },
    ],
  },
  {
    key: MODULES.PAGOS,
    label: 'Pagos',
    icon: CreditCard,
    acciones: [
      { key: PERMISSIONS.PAGOS_REGISTRAR, label: 'Registrar' },
      { key: PERMISSIONS.PAGOS_REEMBOLSAR, label: 'Reembolsar' },
      { key: PERMISSIONS.PAGOS_ELIMINAR, label: 'Eliminar' },
      { key: PERMISSIONS.PAGOS_APROBAR, label: 'Aprobar' },
      { key: PERMISSIONS.PAGOS_ANULAR, label: 'Anular' },
    ],
  },
  {
    key: MODULES.CLIENTES,
    label: 'Clientes',
    icon: Users,
    acciones: [
      { key: PERMISSIONS.CLIENTES_CREAR, label: 'Crear' },
      { key: PERMISSIONS.CLIENTES_EDITAR, label: 'Editar' },
      { key: PERMISSIONS.CLIENTES_ELIMINAR, label: 'Eliminar' },
    ],
  },
  {
    key: MODULES.SALONES,
    label: 'Salones',
    icon: Building,
    acciones: [
      { key: PERMISSIONS.SALONES_CREAR, label: 'Crear' },
      { key: PERMISSIONS.SALONES_EDITAR, label: 'Editar' },
      { key: PERMISSIONS.SALONES_ELIMINAR, label: 'Eliminar' },
    ],
  },
  {
    key: MODULES.PLANES,
    label: 'Paquetes',
    icon: FileText,
    acciones: [
      { key: PERMISSIONS.PLANES_CREAR, label: 'Crear' },
      { key: PERMISSIONS.PLANES_EDITAR, label: 'Editar' },
      { key: PERMISSIONS.PLANES_ELIMINAR, label: 'Eliminar' },
    ],
  },
  {
    key: MODULES.PRODUCTOS,
    label: 'Productos',
    icon: Package,
    acciones: [
      { key: PERMISSIONS.PRODUCTOS_CREAR, label: 'Crear' },
      { key: PERMISSIONS.PRODUCTOS_EDITAR, label: 'Editar' },
      { key: PERMISSIONS.PRODUCTOS_ELIMINAR, label: 'Eliminar' },
    ],
  },
  {
    key: MODULES.CATEGORIAS,
    label: 'Categorías',
    icon: FolderTree,
    acciones: [
      { key: PERMISSIONS.CATEGORIAS_CREAR, label: 'Crear' },
      { key: PERMISSIONS.CATEGORIAS_EDITAR, label: 'Editar' },
      { key: PERMISSIONS.CATEGORIAS_ELIMINAR, label: 'Eliminar' },
    ],
  },
  {
    key: MODULES.CUENTAS,
    label: 'Cuentas',
    icon: Landmark,
    acciones: [
      { key: PERMISSIONS.CUENTAS_VER, label: 'Ver' },
      { key: PERMISSIONS.CUENTAS_CREAR, label: 'Crear' },
      { key: PERMISSIONS.CUENTAS_EDITAR, label: 'Editar' },
      { key: PERMISSIONS.CUENTAS_ELIMINAR, label: 'Eliminar' },
    ],
  },
  {
    key: MODULES.USUARIOS,
    label: 'Usuarios',
    icon: Settings,
    acciones: [
      { key: PERMISSIONS.USUARIOS_CREAR, label: 'Crear' },
      { key: PERMISSIONS.USUARIOS_EDITAR, label: 'Editar' },
      { key: PERMISSIONS.USUARIOS_ELIMINAR, label: 'Eliminar' },
      { key: PERMISSIONS.USUARIOS_CAMBIAR_CONTRASENA, label: 'Cambiar contraseña' },
    ],
  },
  {
    key: MODULES.REPORTES,
    label: 'Reportes',
    icon: BarChart3,
    acciones: [{ key: PERMISSIONS.REPORTES_EXPORTAR, label: 'Exportar / descargar' }],
  },
  {
    key: MODULES.WHATSAPP_CHAT,
    label: 'WhatsApp Chat',
    icon: MessageCircle,
    acciones: [
      { key: PERMISSIONS.WHATSAPP_CHAT_ENVIAR_MENSAJE, label: 'Enviar mensaje' },
      { key: PERMISSIONS.WHATSAPP_CHAT_MODO_HUMANO, label: 'Modo humano' },
      { key: PERMISSIONS.WHATSAPP_CHAT_REINICIAR, label: 'Reiniciar' },
    ],
  },
];

/** Módulos que solo tienen acceso al menú (sin acciones granulares). */
const MODULOS_SOLO_ACCESO = [
  { key: MODULES.COTIZADOR, label: 'Cotizador' },
  { key: MODULES.DASHBOARD, label: 'Dashboard' },
  { key: MODULES.CALENDARIO, label: 'Calendario' },
  { key: MODULES.PORTAL_CLIENTE, label: 'Portal cliente' },
  { key: MODULES.PERFIL, label: 'Perfil' },
  { key: MODULES.INVENTARIO, label: 'Inventario' },
  { key: MODULES.NOTIFICACIONES_NATIVAS, label: 'Notificaciones' },
  { key: MODULES.PERMISOS, label: 'Roles y Permisos' },
  { key: MODULES.MI_PLAN, label: 'Mi Plan' },
  { key: MODULES.ADMIN_SUSCRIPCION, label: 'Admin Suscripción' },
  { key: MODULES.INTEGRACIONES, label: 'Integraciones' },
  { key: MODULES.WHATSAPP_METRICAS, label: 'Panel WhatsApp/Email' },
  { key: MODULES.WHATSAPP_TEMPLATES, label: 'Plantillas WhatsApp' },
  { key: MODULES.CARGA_MASIVA, label: 'Carga masiva' },
  { key: MODULES.CONFIG_DATOS, label: 'Config. Sistema' },
];

const MODULOS_SISTEMA = [MODULES.ADMIN_SUSCRIPCION, MODULES.CONFIG_DATOS];

const Permisos = () => {
  const { usuario: usuarioActual } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const esAdminSistema = usuarioActual?.rol === ROLES.ADMIN_SISTEMA;
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState('');
  const [permisosRolSeleccionados, setPermisosRolSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [tabPrincipal, setTabPrincipal] = useState('roles');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [usuariosData, rolesData] = await Promise.all([
          usuariosService.getAll(),
          usuariosService.getRoles(),
        ]);
        setUsuarios(usuariosData.usuarios || []);
        setRoles(rolesData.roles || []);
      } catch (err) {
        const mensaje = err.response?.data?.error || 'Error al cargar usuarios';
        showError(mensaje);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [showError]);

  const seleccionarUsuario = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    try {
      const data = await usuariosService.getPermisos(usuario.id);
      setPermisosSeleccionados(data.permisos || []);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al cargar permisos';
      showError(mensaje);
      setPermisosSeleccionados([]);
    }
  };

  const togglePermiso = (key) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const togglePermisoRol = (key) => {
    setPermisosRolSeleccionados((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const guardarPermisos = async () => {
    if (!usuarioSeleccionado) return;
    try {
      setGuardando(true);
      await usuariosService.updatePermisos(usuarioSeleccionado.id, permisosSeleccionados);
      success('Permisos actualizados');
    } catch (err) {
      showError(err.response?.data?.error || 'Error al guardar permisos');
    } finally {
      setGuardando(false);
    }
  };

  const limpiarPermisos = async () => {
    if (!usuarioSeleccionado) return;
    try {
      setGuardando(true);
      await usuariosService.deletePermisos(usuarioSeleccionado.id);
      setPermisosSeleccionados([]);
      success('Permisos restablecidos al rol');
    } catch (err) {
      showError(err.response?.data?.error || 'Error al restablecer permisos');
    } finally {
      setGuardando(false);
    }
  };

  const seleccionarRol = async (rol) => {
    setRolSeleccionado(rol);
    try {
      const data = await usuariosService.getPermisosRol(rol);
      setPermisosRolSeleccionados(data.permisos || []);
    } catch (err) {
      showError(err.response?.data?.error || 'Error al cargar permisos del rol');
      setPermisosRolSeleccionados([]);
    }
  };

  const guardarPermisosRol = async () => {
    if (!rolSeleccionado) return;
    try {
      setGuardando(true);
      await usuariosService.updatePermisosRol(rolSeleccionado, permisosRolSeleccionados);
      success('Permisos de rol actualizados');
    } catch (err) {
      showError(err.response?.data?.error || 'Error al guardar permisos del rol');
    } finally {
      setGuardando(false);
    }
  };

  const limpiarPermisosRol = async () => {
    if (!rolSeleccionado) return;
    try {
      setGuardando(true);
      await usuariosService.deletePermisosRol(rolSeleccionado);
      setPermisosRolSeleccionados([]);
      success('Permisos del rol restablecidos');
    } catch (err) {
      showError(err.response?.data?.error || 'Error al restablecer permisos del rol');
    } finally {
      setGuardando(false);
    }
  };

  const usuariosVisibles = useMemo(() => {
    if (esAdminSistema) return usuarios;
    return usuarios.filter((u) => u.rol !== ROLES.ADMIN_SISTEMA);
  }, [usuarios, esAdminSistema]);

  const rolesVisibles = useMemo(() => {
    if (esAdminSistema) return roles;
    return roles.filter((r) => r !== ROLES.ADMIN_SISTEMA);
  }, [roles, esAdminSistema]);

  const modulosConAccionesVisibles = useMemo(() => {
    if (esAdminSistema) return MODULOS_CON_ACCIONES;
    return MODULOS_CON_ACCIONES.filter((m) => !MODULOS_SISTEMA.includes(m.key));
  }, [esAdminSistema]);

  const modulosSoloAccesoVisibles = useMemo(() => {
    if (esAdminSistema) return MODULOS_SOLO_ACCESO;
    return MODULOS_SOLO_ACCESO.filter((m) => !MODULOS_SISTEMA.includes(m.key));
  }, [esAdminSistema]);

  const isRol = tabPrincipal === 'roles';
  const permisosActuales = isRol ? permisosRolSeleccionados : permisosSeleccionados;
  const toggleActual = isRol ? togglePermisoRol : togglePermiso;
  const haySeleccion = isRol ? !!rolSeleccionado : !!usuarioSeleccionado;
  const tituloSeleccion = isRol
    ? (rolSeleccionado ? `Rol: ${rolSeleccionado}` : 'Selecciona un rol')
    : (usuarioSeleccionado?.nombre_completo || usuarioSeleccionado?.nombre_usuario || 'Selecciona un usuario');
  const onGuardar = isRol ? guardarPermisosRol : guardarPermisos;
  const onRestablecer = isRol ? limpiarPermisosRol : limpiarPermisos;

  const checkbox = (key, label, checked, onChange) => (
    <label
      key={key}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.375rem',
        border: '1px solid #e2e8f0',
        backgroundColor: checked ? '#eef2ff' : 'white',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
      }}
    >
      <input type="checkbox" checked={checked} onChange={() => onChange(key)} />
      <span>{label}</span>
    </label>
  );

  const seccionModulo = (modulo, acciones) => {
    const Icon = modulo.icon;
    const tieneAcceso = permisosActuales.includes(modulo.key);
    return (
      <div
        key={modulo.key}
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem',
          backgroundColor: '#fafafa',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {Icon && (
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.5rem',
                backgroundColor: '#6366f120',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} color="#6366f1" />
            </div>
          )}
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0, color: '#111827' }}>
            {modulo.label}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {checkbox(modulo.key, 'Acceso al módulo (ver en menú)', tieneAcceso, toggleActual)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
          {acciones.map((acc) =>
            checkbox(acc.key, acc.label, permisosActuales.includes(acc.key), toggleActual)
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando usuarios y roles...</div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Roles y Permisos
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
          Define permisos por rol y por usuario. Los cambios se guardan en la base de datos.
        </p>

        {/* Pestañas principales */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            borderBottom: '2px solid #e5e7eb',
            marginTop: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setTabPrincipal('roles')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: '600',
              fontSize: '0.9375rem',
              border: 'none',
              borderBottom: tabPrincipal === 'roles' ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: '-2px',
              backgroundColor: 'transparent',
              color: tabPrincipal === 'roles' ? '#6366f1' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            Permisos por rol
          </button>
          <button
            type="button"
            onClick={() => setTabPrincipal('usuarios')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: '600',
              fontSize: '0.9375rem',
              border: 'none',
              borderBottom: tabPrincipal === 'usuarios' ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: '-2px',
              backgroundColor: 'transparent',
              color: tabPrincipal === 'usuarios' ? '#6366f1' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            Permisos por usuario
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Columna izquierda: roles o usuarios */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            position: 'sticky',
            top: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '700',
              fontSize: '0.875rem',
              color: '#374151',
            }}
          >
            {tabPrincipal === 'roles' ? 'Roles' : 'Usuarios'}
          </div>
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {isRol
              ? rolesVisibles.map((rol) => {
                  const activo = rolSeleccionado === rol;
                  return (
                    <button
                      key={rol}
                      type="button"
                      onClick={() => seleccionarRol(rol)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: activo ? '#eef2ff' : 'transparent',
                        color: activo ? '#4338ca' : '#111827',
                        cursor: 'pointer',
                        fontWeight: activo ? '600' : '500',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ textTransform: 'capitalize' }}>{rol.replace(/_/g, ' ')}</span>
                      {activo && <ChevronRight size={18} />}
                    </button>
                  );
                })
              : usuariosVisibles.map((u) => {
                  const activo = usuarioSeleccionado?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => seleccionarUsuario(u)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: activo ? '#eef2ff' : 'transparent',
                        color: activo ? '#4338ca' : '#111827',
                        cursor: 'pointer',
                        fontWeight: activo ? '600' : '500',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {u.nombre_completo || u.nombre_usuario}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{u.rol}</div>
                      </div>
                      {activo && <ChevronRight size={18} />}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Columna derecha: permisos por módulo */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            minHeight: '400px',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem', color: '#111827' }}>
            {tituloSeleccion}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {haySeleccion
              ? 'Marca el acceso a cada módulo y las acciones permitidas.'
              : `Selecciona un ${isRol ? 'rol' : 'usuario'} en la lista para editar sus permisos.`}
          </p>

          {!haySeleccion ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#9ca3af',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
              }}
            >
              Selecciona un {isRol ? 'rol' : 'usuario'} a la izquierda para ver y editar permisos.
            </div>
          ) : (
            <>
              {modulosConAccionesVisibles.map((mod) => seccionModulo(mod, mod.acciones))}

              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#fafafa',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0 1rem 0', color: '#111827' }}>
                  Otros módulos (solo acceso al menú)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {modulosSoloAccesoVisibles.map((m) =>
                    checkbox(m.key, m.label, permisosActuales.includes(m.key), toggleActual)
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  type="button"
                  onClick={onRestablecer}
                  disabled={!haySeleccion || guardando}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: haySeleccion && !guardando ? 'pointer' : 'not-allowed',
                  }}
                >
                  <RotateCcw size={18} />
                  {isRol ? 'Restablecer rol' : 'Usar permisos del rol'}
                </button>
                <button
                  type="button"
                  onClick={onGuardar}
                  disabled={!haySeleccion || guardando}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: haySeleccion && !guardando ? '#6366f1' : '#9ca3af',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    cursor: haySeleccion && !guardando ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Save size={18} />
                  {guardando ? 'Guardando...' : 'Guardar permisos'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Permisos;
