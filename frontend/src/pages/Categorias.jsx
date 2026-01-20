import React, { useState, useEffect } from 'react';
import { categoriasService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Plus, Search, FolderTree, Eye, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { hasRole, ROLES } from '../utils/roles';

const Categorias = () => {
  const { usuario } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Estados para modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  // Verificar permisos
  const puedeCrear = hasRole(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]);
  const puedeEditar = hasRole(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]);
  const puedeEliminar = hasRole(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriasService.getAll(false);
      setCategorias(data.categorias || []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar las categorías';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = categorias.filter((categoria) => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      categoria.nombre?.toLowerCase().includes(busquedaLower) ||
      categoria.descripcion?.toLowerCase().includes(busquedaLower)
    );
  });

  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true,
    });
    setErrorFormulario('');
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true,
    });
    setErrorFormulario('');
  };

  const abrirModalEditar = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setFormData({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || '',
      activo: categoria.activo !== false,
    });
    setErrorFormulario('');
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setCategoriaSeleccionada(null);
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true,
    });
    setErrorFormulario('');
  };

  const abrirModalDetalle = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarModalDetalle(true);
  };

  const cerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    setCategoriaSeleccionada(null);
  };

  const abrirModalEliminar = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarModalEliminar(true);
  };

  const cerrarModalEliminar = () => {
    setMostrarModalEliminar(false);
    setCategoriaSeleccionada(null);
  };

  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre) {
      setErrorFormulario('El nombre de la categoría es requerido');
      return;
    }

    try {
      setGuardando(true);
      await categoriasService.create(formData);
      await cargarCategorias();
      cerrarModalCrear();
      success('Categoría creada exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear la categoría';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditarCategoria = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre) {
      setErrorFormulario('El nombre de la categoría es requerido');
      return;
    }

    try {
      setGuardando(true);
      await categoriasService.update(categoriaSeleccionada.id, formData);
      await cargarCategorias();
      cerrarModalEditar();
      success('Categoría actualizada exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al actualizar la categoría';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarCategoria = async () => {
    try {
      setGuardando(true);
      await categoriasService.delete(categoriaSeleccionada.id);
      await cargarCategorias();
      cerrarModalEliminar();
      success('Categoría eliminada exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al eliminar la categoría';
      showError(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando categorías...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Categorías</h1>
          <p style={{ color: '#6b7280' }}>Gestión de categorías de productos</p>
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
            Nueva Categoría
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

      {/* Búsqueda */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
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
          placeholder="Buscar categorías..."
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

      {/* Grid de categorías */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {categoriasFiltradas.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            {busqueda ? 'No se encontraron categorías con ese criterio' : 'No hay categorías disponibles'}
          </div>
        ) : (
          categoriasFiltradas.map((categoria) => (
            <div
              key={categoria.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
              onClick={() => abrirModalDetalle(categoria)}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#6366f120',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FolderTree size={24} color="#6366f1" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', margin: 0 }}>
                    {categoria.nombre}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                    {categoria.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: categoria.activo !== false ? '#10b98120' : '#ef444420',
                    color: categoria.activo !== false ? '#10b981' : '#ef4444',
                  }}
                >
                  {categoria.activo !== false ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => abrirModalDetalle(categoria)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                >
                  <Eye size={16} />
                  Ver
                </button>
                {puedeEditar && (
                  <button
                    onClick={() => abrirModalEditar(categoria)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                )}
                {puedeEliminar && (
                  <button
                    onClick={() => abrirModalEliminar(categoria)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear Categoría */}
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
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Nueva Categoría</h2>
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

            <form onSubmit={handleCrearCategoria}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Nombre <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Categoría activa</label>
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

      {/* Modal Editar Categoría */}
      {mostrarModalEditar && categoriaSeleccionada && (
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
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Editar Categoría</h2>
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

            <form onSubmit={handleEditarCategoria}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Nombre <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Categoría activa</label>
                </div>
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

      {/* Modal Detalle Categoría */}
      {mostrarModalDetalle && categoriaSeleccionada && (
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
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Detalle de la Categoría</h2>
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
                    borderRadius: '0.5rem',
                    backgroundColor: '#6366f120',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderTree size={32} color="#6366f1" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                    {categoriaSeleccionada.nombre || 'N/A'}
                  </h3>
                  <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Categoría</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Descripción
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {categoriaSeleccionada.descripcion || 'Sin descripción'}
                  </p>
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
                      backgroundColor: categoriaSeleccionada.activo !== false ? '#10b98120' : '#ef444420',
                      color: categoriaSeleccionada.activo !== false ? '#10b981' : '#ef4444',
                    }}
                  >
                    {categoriaSeleccionada.activo !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
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

      {/* Modal Eliminar Categoría */}
      {mostrarModalEliminar && categoriaSeleccionada && (
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Eliminar Categoría</h2>
                <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  ¿Está seguro de eliminar esta categoría?
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{categoriaSeleccionada.nombre}</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                {categoriaSeleccionada.descripcion || 'Sin descripción'}
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
                onClick={handleEliminarCategoria}
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
    </div>
  );
};

export default Categorias;
