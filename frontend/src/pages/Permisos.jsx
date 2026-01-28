import React, { useEffect, useMemo, useState } from 'react';
import { usuariosService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { MODULES, PERMISSIONS } from '../utils/roles';

const MODULOS = [
  { key: MODULES.COTIZADOR, label: 'Cotizador' },
  { key: MODULES.DASHBOARD, label: 'Dashboard' },
  { key: MODULES.EVENTOS, label: 'Eventos' },
  { key: MODULES.PORTAL_CLIENTE, label: 'Portal cliente' },
  { key: MODULES.PERFIL, label: 'Perfil' },
  { key: MODULES.CLIENTES, label: 'Clientes' },
  { key: MODULES.PRODUCTOS, label: 'Productos' },
  { key: MODULES.CATEGORIAS, label: 'Categorías' },
  { key: MODULES.PLANES, label: 'Planes' },
  { key: MODULES.PAGOS, label: 'Pagos' },
  { key: MODULES.CUENTAS, label: 'Cuentas' },
  { key: MODULES.INVENTARIO, label: 'Inventario' },
  { key: MODULES.SALONES, label: 'Salones' },
  { key: MODULES.NOTIFICACIONES_NATIVAS, label: 'Notificaciones' },
  { key: MODULES.REPORTES, label: 'Reportes' },
  { key: MODULES.USUARIOS, label: 'Usuarios' },
  { key: MODULES.PERMISOS, label: 'Roles y Permisos' },
  { key: MODULES.INTEGRACIONES, label: 'Integraciones' },
  { key: MODULES.WHATSAPP_CHAT, label: 'WhatsApp Chat' },
  { key: MODULES.WHATSAPP_METRICAS, label: 'Panel WhatsApp/Email' },
  { key: MODULES.WHATSAPP_TEMPLATES, label: 'Plantillas WhatsApp' },
  { key: MODULES.CARGA_MASIVA, label: 'Carga masiva' },
  { key: MODULES.CONFIG_DATOS, label: 'Limpieza de datos' },
];

const ACCIONES = [
  { key: PERMISSIONS.EVENTOS_EDITAR_ESTADO, label: 'Eventos · Editar estado' },
  { key: PERMISSIONS.EVENTOS_AGREGAR_PRODUCTO, label: 'Eventos · Agregar producto' },
  { key: PERMISSIONS.EVENTOS_ELIMINAR_PRODUCTO, label: 'Eventos · Eliminar producto' },
  { key: PERMISSIONS.EVENTOS_ELIMINAR, label: 'Eventos · Eliminar' },
  { key: PERMISSIONS.EVENTOS_ACTUALIZAR_SERVICIOS, label: 'Eventos · Actualizar servicios' },
  { key: PERMISSIONS.EVENTOS_GENERAR_SERVICIOS, label: 'Eventos · Generar servicios' },
  { key: PERMISSIONS.EVENTOS_DESCARTAR_SERVICIO, label: 'Eventos · Descartar servicio' },
  { key: PERMISSIONS.EVENTOS_ASIGNAR_COORDINADOR, label: 'Eventos · Asignar coordinador' },
  { key: PERMISSIONS.PAGOS_REGISTRAR, label: 'Pagos · Registrar' },
  { key: PERMISSIONS.PAGOS_REEMBOLSAR, label: 'Pagos · Reembolsar' },
  { key: PERMISSIONS.PAGOS_ELIMINAR, label: 'Pagos · Eliminar' },
  { key: PERMISSIONS.PAGOS_APROBAR, label: 'Pagos · Aprobar' },
  { key: PERMISSIONS.PAGOS_ANULAR, label: 'Pagos · Anular' },
  { key: PERMISSIONS.CUENTAS_VER, label: 'Cuentas · Ver' },
  { key: PERMISSIONS.CUENTAS_CREAR, label: 'Cuentas · Crear' },
  { key: PERMISSIONS.CUENTAS_EDITAR, label: 'Cuentas · Editar' },
  { key: PERMISSIONS.CUENTAS_ELIMINAR, label: 'Cuentas · Eliminar' },
  { key: PERMISSIONS.PLANES_CREAR, label: 'Planes · Crear' },
  { key: PERMISSIONS.PLANES_EDITAR, label: 'Planes · Editar' },
  { key: PERMISSIONS.PLANES_ELIMINAR, label: 'Planes · Eliminar' },
];

const Permisos = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState('');
  const [permisosRolSeleccionados, setPermisosRolSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [tab, setTab] = useState('usuarios');

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
    setPermisosSeleccionados((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  };

  const togglePermisoRol = (key) => {
    setPermisosRolSeleccionados((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  };

  const guardarPermisos = async () => {
    if (!usuarioSeleccionado) return;
    try {
      setGuardando(true);
      await usuariosService.updatePermisos(usuarioSeleccionado.id, permisosSeleccionados);
      success('Permisos actualizados');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al guardar permisos';
      showError(mensaje);
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
      const mensaje = err.response?.data?.error || 'Error al restablecer permisos';
      showError(mensaje);
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
      const mensaje = err.response?.data?.error || 'Error al cargar permisos del rol';
      showError(mensaje);
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
      const mensaje = err.response?.data?.error || 'Error al guardar permisos del rol';
      showError(mensaje);
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
      const mensaje = err.response?.data?.error || 'Error al restablecer permisos del rol';
      showError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const usuarioLabel = useMemo(() => {
    if (!usuarioSeleccionado) return 'Selecciona un usuario';
    return usuarioSeleccionado.nombre_completo || usuarioSeleccionado.nombre_usuario;
  }, [usuarioSeleccionado]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando usuarios...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Roles y Permisos</h1>
        <p style={{ color: '#6b7280' }}>
          Define permisos por rol y permisos personalizados por usuario.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setTab('roles')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              backgroundColor: tab === 'roles' ? '#6366f1' : 'white',
              color: tab === 'roles' ? 'white' : '#374151',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Permisos por rol
          </button>
          <button
            type="button"
            onClick={() => setTab('usuarios')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              backgroundColor: tab === 'usuarios' ? '#6366f1' : 'white',
              color: tab === 'usuarios' ? 'white' : '#374151',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Permisos por usuario
          </button>
        </div>
      </div>

      {tab === 'roles' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>
              Roles
            </div>
            <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
              {roles.map((rol) => {
                const activo = rolSeleccionado === rol;
                return (
                  <button
                    key={rol}
                    type="button"
                    onClick={() => seleccionarRol(rol)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.85rem 1rem',
                      border: 'none',
                      backgroundColor: activo ? '#eef2ff' : 'transparent',
                      color: activo ? '#3730a3' : '#111827',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{rol}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              {rolSeleccionado ? `Rol: ${rolSeleccionado}` : 'Selecciona un rol'}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Marca los módulos y acciones permitidas para este rol.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {MODULOS.map((modulo) => (
                <label
                  key={modulo.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    border: '1px solid #e2e8f0',
                    backgroundColor: permisosRolSeleccionados.includes(modulo.key) ? '#eef2ff' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={permisosRolSeleccionados.includes(modulo.key)}
                    onChange={() => togglePermisoRol(modulo.key)}
                  />
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{modulo.label}</span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
                Acciones
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {ACCIONES.map((accion) => (
                  <label
                    key={accion.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem',
                      borderRadius: '0.6rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: permisosRolSeleccionados.includes(accion.key) ? '#eef2ff' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={permisosRolSeleccionados.includes(accion.key)}
                      onChange={() => togglePermisoRol(accion.key)}
                    />
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{accion.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={limpiarPermisosRol}
                disabled={!rolSeleccionado}
                style={{
                  padding: '0.7rem 1.2rem',
                  borderRadius: '0.6rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  cursor: rolSeleccionado ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  color: '#64748b',
                }}
              >
                Restablecer rol
              </button>
              <button
                type="button"
                onClick={guardarPermisosRol}
                disabled={!rolSeleccionado || guardando}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '0.6rem',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  cursor: !rolSeleccionado || guardando ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                }}
              >
                {guardando ? 'Guardando...' : 'Guardar permisos'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>
              Usuarios
            </div>
            <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
              {usuarios.map((usuario) => {
                const activo = usuarioSeleccionado?.id === usuario.id;
                return (
                  <button
                    key={usuario.id}
                    type="button"
                    onClick={() => seleccionarUsuario(usuario)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.85rem 1rem',
                      border: 'none',
                      backgroundColor: activo ? '#eef2ff' : 'transparent',
                      color: activo ? '#3730a3' : '#111827',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>
                      {usuario.nombre_completo || usuario.nombre_usuario}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{usuario.rol}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>{usuarioLabel}</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Marca los módulos y acciones permitidas para este usuario.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {MODULOS.map((modulo) => (
                <label
                  key={modulo.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    border: '1px solid #e2e8f0',
                    backgroundColor: permisosSeleccionados.includes(modulo.key) ? '#eef2ff' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={permisosSeleccionados.includes(modulo.key)}
                    onChange={() => togglePermiso(modulo.key)}
                  />
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{modulo.label}</span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#111827' }}>
                Acciones
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {ACCIONES.map((accion) => (
                  <label
                    key={accion.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem',
                      borderRadius: '0.6rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: permisosSeleccionados.includes(accion.key) ? '#eef2ff' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={permisosSeleccionados.includes(accion.key)}
                      onChange={() => togglePermiso(accion.key)}
                    />
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{accion.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={limpiarPermisos}
                disabled={!usuarioSeleccionado}
                style={{
                  padding: '0.7rem 1.2rem',
                  borderRadius: '0.6rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  cursor: usuarioSeleccionado ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  color: '#64748b',
                }}
              >
                Usar permisos del rol
              </button>
              <button
                type="button"
                onClick={guardarPermisos}
                disabled={!usuarioSeleccionado || guardando}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '0.6rem',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  cursor: !usuarioSeleccionado || guardando ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                }}
              >
                {guardando ? 'Guardando...' : 'Guardar permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permisos;
