import React, { useState, useEffect } from 'react';
import { usuariosService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Plus, Search, User, Eye, Edit, Trash2, X, Save, AlertCircle, Lock } from 'lucide-react';
import { hasRole, ROLES } from '../utils/roles';

const Usuarios = () => {
  const { usuario: usuarioActual } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  // Estados para modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalCambiarContrasena, setMostrarModalCambiarContrasena] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contrasena: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    rol: 'cliente',
    activo: true,
  });
  const [formDataContrasena, setFormDataContrasena] = useState({
    nueva_contrasena: '',
    confirmar_contrasena: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  // Verificar permisos
  const puedeCrear = hasRole(usuarioActual?.rol, [ROLES.ADMIN]);
  const puedeEditar = hasRole(usuarioActual?.rol, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEliminar = hasRole(usuarioActual?.rol, [ROLES.ADMIN]);
  const puedeCambiarContrasena = hasRole(usuarioActual?.rol, [ROLES.ADMIN, ROLES.MANAGER]);

  useEffect(() => {
    cargarUsuarios();
  }, [filtroRol]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const params = filtroRol ? { rol: filtroRol } : {};
      const data = await usuariosService.getAll(params);
      setUsuarios(data.usuarios || []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar los usuarios';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      usuario.nombre_usuario?.toLowerCase().includes(busquedaLower) ||
      usuario.nombre_completo?.toLowerCase().includes(busquedaLower) ||
      usuario.email?.toLowerCase().includes(busquedaLower)
    );
  });

  const abrirModalCrear = () => {
    setFormData({
      nombre_usuario: '',
      contrasena: '',
      nombre_completo: '',
      email: '',
      telefono: '',
      rol: 'cliente',
      activo: true,
    });
    setErrorFormulario('');
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({
      nombre_usuario: '',
      contrasena: '',
      nombre_completo: '',
      email: '',
      telefono: '',
      rol: 'cliente',
      activo: true,
    });
    setErrorFormulario('');
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      nombre_usuario: usuario.nombre_usuario || '',
      contrasena: '',
      nombre_completo: usuario.nombre_completo || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      rol: usuario.rol || 'cliente',
      activo: usuario.activo !== false,
    });
    setErrorFormulario('');
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setUsuarioSeleccionado(null);
    setFormData({
      nombre_usuario: '',
      contrasena: '',
      nombre_completo: '',
      email: '',
      telefono: '',
      rol: 'cliente',
      activo: true,
    });
    setErrorFormulario('');
  };

  const abrirModalDetalle = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalDetalle(true);
  };

  const cerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    setUsuarioSeleccionado(null);
  };

  const abrirModalEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalEliminar(true);
  };

  const cerrarModalEliminar = () => {
    setMostrarModalEliminar(false);
    setUsuarioSeleccionado(null);
  };

  const abrirModalCambiarContrasena = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormDataContrasena({
      nueva_contrasena: '',
      confirmar_contrasena: '',
    });
    setErrorFormulario('');
    setMostrarModalCambiarContrasena(true);
  };

  const cerrarModalCambiarContrasena = () => {
    setMostrarModalCambiarContrasena(false);
    setUsuarioSeleccionado(null);
    setFormDataContrasena({
      nueva_contrasena: '',
      confirmar_contrasena: '',
    });
    setErrorFormulario('');
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre_usuario || !formData.contrasena || !formData.nombre_completo || !formData.rol) {
      setErrorFormulario('Los campos nombre de usuario, contraseña, nombre completo y rol son requeridos');
      return;
    }

    if (formData.contrasena.length < 6) {
      setErrorFormulario('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setGuardando(true);
      const usuarioData = {
        ...formData,
        activo: formData.activo,
      };
      await usuariosService.create(usuarioData);
      await cargarUsuarios();
      cerrarModalCrear();
      success('Usuario creado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear el usuario';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditarUsuario = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre_completo) {
      setErrorFormulario('El nombre completo es requerido');
      return;
    }

    try {
      setGuardando(true);
      const usuarioData = {
        nombre_completo: formData.nombre_completo,
        email: formData.email || null,
        telefono: formData.telefono || null,
        activo: formData.activo,
      };

      // Solo incluir rol si es administrador
      if (hasRole(usuarioActual?.rol, [ROLES.ADMIN])) {
        usuarioData.rol = formData.rol;
      }

      await usuariosService.update(usuarioSeleccionado.id, usuarioData);
      await cargarUsuarios();
      cerrarModalEditar();
      success('Usuario actualizado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al actualizar el usuario';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarUsuario = async () => {
    try {
      setGuardando(true);
      await usuariosService.delete(usuarioSeleccionado.id);
      await cargarUsuarios();
      cerrarModalEliminar();
      success('Usuario eliminado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al eliminar el usuario';
      showError(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formDataContrasena.nueva_contrasena || !formDataContrasena.confirmar_contrasena) {
      setErrorFormulario('Ambos campos son requeridos');
      return;
    }

    if (formDataContrasena.nueva_contrasena.length < 6) {
      setErrorFormulario('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formDataContrasena.nueva_contrasena !== formDataContrasena.confirmar_contrasena) {
      setErrorFormulario('Las contraseñas no coinciden');
      return;
    }

    try {
      setGuardando(true);
      await usuariosService.cambiarContrasena(usuarioSeleccionado.id, formDataContrasena.nueva_contrasena);
      cerrarModalCambiarContrasena();
      success('Contraseña cambiada exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al cambiar la contraseña';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando usuarios...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Usuarios</h1>
          <p style={{ color: '#6b7280' }}>Gestión de usuarios del sistema</p>
        </div>
        {puedeCrear && (
          <button
            onClick={abrirModalCrear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6366f1',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
        </div>
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            minWidth: '200px',
          }}
        >
          <option value="">Todos los roles</option>
          <option value="administrador">Administrador</option>
          <option value="gerente_general">Gerente General</option>
          <option value="coordinador">Coordinador</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>

      {/* Tabla de usuarios */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                  Usuario
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                  Nombre Completo
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                  Email
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                  Rol
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                  Estado
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    {busqueda || filtroRol ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios disponibles'}
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            backgroundColor: '#6366f120',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <User size={20} color="#6366f1" />
                        </div>
                        <div style={{ fontWeight: '500' }}>{usuario.nombre_usuario || '-'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>{usuario.nombre_completo || '-'}</td>
                    <td style={{ padding: '1rem' }}>{usuario.email || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: '#6366f120',
                          color: '#6366f1',
                        }}
                      >
                        {usuario.rol || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: usuario.activo ? '#10b98120' : '#ef444420',
                          color: usuario.activo ? '#10b981' : '#ef4444',
                        }}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => abrirModalDetalle(usuario)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                          title="Ver Detalle"
                        >
                          <Eye size={16} />
                        </button>
                        {puedeEditar && (
                          <button
                            onClick={() => abrirModalEditar(usuario)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {puedeCambiarContrasena && (
                          <button
                            onClick={() => abrirModalCambiarContrasena(usuario)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d97706')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f59e0b')}
                            title="Cambiar Contraseña"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                        {puedeEliminar && (
                          <button
                            onClick={() => abrirModalEliminar(usuario)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {mostrarModalCrear && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={cerrarModalCrear}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Nuevo Usuario</h2>
              <button
                onClick={cerrarModalCrear}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            {errorFormulario && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {errorFormulario}
              </div>
            )}

            <form onSubmit={handleCrearUsuario}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Nombre de Usuario <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre_usuario}
                      onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Contraseña <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.contrasena}
                      onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Nombre Completo <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Rol <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="cliente">Cliente</option>
                      <option value="coordinador">Coordinador</option>
                      <option value="gerente_general">Gerente General</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <label style={{ fontWeight: '500', cursor: 'pointer' }}>Usuario activo</label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={cerrarModalCrear}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: guardando ? '#9ca3af' : '#6366f1',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Save size={18} />
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {mostrarModalEditar && usuarioSeleccionado && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={cerrarModalEditar}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Editar Usuario</h2>
              <button
                onClick={cerrarModalEditar}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            {errorFormulario && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {errorFormulario}
              </div>
            )}

            <form onSubmit={handleEditarUsuario}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_usuario}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Nombre Completo <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </div>

                {hasRole(usuarioActual?.rol, [ROLES.ADMIN]) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Rol
                      </label>
                      <select
                        value={formData.rol}
                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="coordinador">Coordinador</option>
                        <option value="gerente_general">Gerente General</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                      />
                      <label style={{ fontWeight: '500', cursor: 'pointer' }}>Usuario activo</label>
                    </div>
                  </div>
                )}

                {!hasRole(usuarioActual?.rol, [ROLES.ADMIN]) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <label style={{ fontWeight: '500', cursor: 'pointer' }}>Usuario activo</label>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={cerrarModalEditar}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: guardando ? '#9ca3af' : '#6366f1',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Save size={18} />
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle Usuario */}
      {mostrarModalDetalle && usuarioSeleccionado && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={cerrarModalDetalle}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Detalle del Usuario</h2>
              <button
                onClick={cerrarModalDetalle}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: '#6366f120',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={32} color="#6366f1" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                    {usuarioSeleccionado.nombre_completo || 'N/A'}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    @{usuarioSeleccionado.nombre_usuario || 'N/A'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Email
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {usuarioSeleccionado.email || '-'}
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Teléfono
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {usuarioSeleccionado.telefono || '-'}
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Rol
                  </label>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: '#6366f120',
                      color: '#6366f1',
                    }}
                  >
                    {usuarioSeleccionado.rol || '-'}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Estado
                  </label>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: usuarioSeleccionado.activo ? '#10b98120' : '#ef444420',
                      color: usuarioSeleccionado.activo ? '#10b981' : '#ef4444',
                    }}
                  >
                    {usuarioSeleccionado.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {usuarioSeleccionado.fecha_creacion && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Fecha de Creación
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {formatearFecha(usuarioSeleccionado.fecha_creacion)}
                    </p>
                  </div>
                )}

                {usuarioSeleccionado.fecha_ultimo_acceso && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Último Acceso
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {formatearFecha(usuarioSeleccionado.fecha_ultimo_acceso)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cerrarModalDetalle}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Usuario */}
      {mostrarModalEliminar && usuarioSeleccionado && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={cerrarModalEliminar}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={24} color="#dc2626" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Eliminar Usuario</h2>
                <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  ¿Está seguro de eliminar este usuario?
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{usuarioSeleccionado.nombre_completo}</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                @{usuarioSeleccionado.nombre_usuario}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cerrarModalEliminar}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarUsuario}
                disabled={guardando}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: guardando ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Trash2 size={18} />
                {guardando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {mostrarModalCambiarContrasena && usuarioSeleccionado && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={cerrarModalCambiarContrasena}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Cambiar Contraseña</h2>
              <button
                onClick={cerrarModalCambiarContrasena}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>Usuario: {usuarioSeleccionado.nombre_completo}</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                @{usuarioSeleccionado.nombre_usuario}
              </p>
            </div>

            {errorFormulario && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {errorFormulario}
              </div>
            )}

            <form onSubmit={handleCambiarContrasena}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Nueva Contraseña <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={formDataContrasena.nueva_contrasena}
                    onChange={(e) => setFormDataContrasena({ ...formDataContrasena, nueva_contrasena: e.target.value })}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Confirmar Contraseña <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={formDataContrasena.confirmar_contrasena}
                    onChange={(e) => setFormDataContrasena({ ...formDataContrasena, confirmar_contrasena: e.target.value })}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={cerrarModalCambiarContrasena}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: guardando ? '#9ca3af' : '#6366f1',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Lock size={18} />
                  {guardando ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
