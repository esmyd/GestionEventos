import React, { useState, useEffect } from 'react';
import { productosService, categoriasService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import useIsMobile from '../hooks/useIsMobile';
import ToastContainer from '../components/ToastContainer';
import { Plus, Search, Package, Eye, Edit, Trash2, X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { hasRole, ROLES } from '../utils/roles';

const Productos = () => {
  const { usuario } = useAuth();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const isMobile = useIsMobile();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Estados para modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    detalles_adicionales: '',
    variantes: '',
    precio: '',
    precio_minimo: '',
    precio_maximo: '',
    duracion_horas: '',
    id_categoria: '',
    stock: '',
    unidad_medida: 'unidad',
    tipo_servicio: 'servicio',
    activo: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  // Verificar permisos
  const puedeCrear = hasRole(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]);
  const puedeEditar = hasRole(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER, ROLES.COORDINATOR]);
  const puedeEliminar = hasRole(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER]);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, [filtroCategoria]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.getAll(false, filtroCategoria || null);
      setProductos(data.productos || []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar los productos';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await categoriasService.getAll(true);
      setCategorias(data.categorias || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const productosFiltrados = productos.filter((producto) => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      producto.nombre?.toLowerCase().includes(busquedaLower) ||
      producto.descripcion?.toLowerCase().includes(busquedaLower)
    );
  });

  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      detalles_adicionales: '',
      variantes: '',
      precio: '',
      precio_minimo: '',
      precio_maximo: '',
      duracion_horas: '',
      id_categoria: '',
      stock: '0',
      unidad_medida: 'unidad',
      tipo_servicio: 'servicio',
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
      detalles_adicionales: '',
      variantes: '',
      precio: '',
      precio_minimo: '',
      precio_maximo: '',
      duracion_horas: '',
      id_categoria: '',
      stock: '0',
      unidad_medida: 'unidad',
      tipo_servicio: 'servicio',
      activo: true,
    });
    setErrorFormulario('');
  };

  const abrirModalEditar = (producto) => {
    setProductoSeleccionado(producto);
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      detalles_adicionales: producto.detalles_adicionales || '',
      variantes: producto.variantes || '',
      precio: producto.precio || '',
      precio_minimo: producto.precio_minimo || '',
      precio_maximo: producto.precio_maximo || '',
      duracion_horas: producto.duracion_horas || '',
      id_categoria: producto.id_categoria || producto.categoria_id || '',
      stock: producto.stock || '0',
      unidad_medida: producto.unidad_medida || 'unidad',
      tipo_servicio: producto.tipo_servicio || 'servicio',
      activo: producto.activo !== false,
    });
    setErrorFormulario('');
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setProductoSeleccionado(null);
    setFormData({
      nombre: '',
      descripcion: '',
      detalles_adicionales: '',
      variantes: '',
      precio: '',
      precio_minimo: '',
      precio_maximo: '',
      duracion_horas: '',
      id_categoria: '',
      stock: '0',
      unidad_medida: 'unidad',
      tipo_servicio: 'servicio',
      activo: true,
    });
    setErrorFormulario('');
  };

  const abrirModalDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModalDetalle(true);
  };

  const cerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    setProductoSeleccionado(null);
  };

  const abrirModalEliminar = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModalEliminar(true);
  };

  const cerrarModalEliminar = () => {
    setMostrarModalEliminar(false);
    setProductoSeleccionado(null);
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre) {
      setErrorFormulario('El nombre del producto es requerido');
      return;
    }

    try {
      setGuardando(true);
      const productoData = {
        ...formData,
        precio: formData.precio ? parseFloat(formData.precio) : null,
        precio_minimo: formData.precio_minimo ? parseFloat(formData.precio_minimo) : null,
        precio_maximo: formData.precio_maximo ? parseFloat(formData.precio_maximo) : null,
        duracion_horas: formData.duracion_horas ? parseFloat(formData.duracion_horas) : null,
        id_categoria: formData.id_categoria || null,
        stock: parseInt(formData.stock) || 0,
        activo: formData.activo,
      };
      await productosService.create(productoData);
      await cargarProductos();
      cerrarModalCrear();
      success('Producto creado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear el producto';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditarProducto = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre) {
      setErrorFormulario('El nombre del producto es requerido');
      return;
    }

    try {
      setGuardando(true);
      const productoData = {
        ...formData,
        precio: formData.precio ? parseFloat(formData.precio) : null,
        precio_minimo: formData.precio_minimo ? parseFloat(formData.precio_minimo) : null,
        precio_maximo: formData.precio_maximo ? parseFloat(formData.precio_maximo) : null,
        duracion_horas: formData.duracion_horas ? parseFloat(formData.duracion_horas) : null,
        id_categoria: formData.id_categoria || null,
        stock: parseInt(formData.stock) || 0,
        activo: formData.activo,
      };
      await productosService.update(productoSeleccionado.id, productoData);
      await cargarProductos();
      cerrarModalEditar();
      success('Producto actualizado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al actualizar el producto';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarProducto = async () => {
    try {
      setGuardando(true);
      await productosService.delete(productoSeleccionado.id);
      await cargarProductos();
      cerrarModalEliminar();
      success('Producto eliminado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al eliminar el producto';
      showError(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando productos...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Productos</h1>
          <p style={{ color: '#6b7280' }}>Gestión de productos y servicios</p>
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
            Nuevo Producto
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
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '250px' }}>
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
            placeholder="Buscar productos..."
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
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            minWidth: isMobile ? '100%' : '200px',
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de productos */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        {isMobile ? (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {productosFiltrados.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                {busqueda || filtroCategoria ? 'No se encontraron productos con ese criterio' : 'No hay productos disponibles'}
              </div>
            ) : (
              productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: '#6366f120',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package size={18} color="#6366f1" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{producto.nombre || '-'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{producto.nombre_categoria || '-'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {producto.descripcion || '-'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Precio</div>
                      <div style={{ fontWeight: '600' }}>{formatearMoneda(producto.precio || 0)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Stock</div>
                      <div style={{ fontWeight: '600' }}>{producto.stock || 0}</div>
                    </div>
                  </div>
                  <div>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: producto.activo !== false ? '#10b98120' : '#ef444420',
                        color: producto.activo !== false ? '#10b981' : '#ef4444',
                      }}
                    >
                      {producto.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => abrirModalDetalle(producto)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Eye size={16} strokeWidth={2.5} />
                      Ver
                    </button>
                    {puedeEditar && (
                      <button
                        onClick={() => abrirModalEditar(producto)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '0.375rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <Edit size={16} strokeWidth={2.5} />
                        Editar
                      </button>
                    )}
                    {puedeEliminar && (
                      <button
                        onClick={() => abrirModalEliminar(producto)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '0.375rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Producto
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Categoría
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Precio
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                    Stock
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
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      {busqueda || filtroCategoria ? 'No se encontraron productos con ese criterio' : 'No hay productos disponibles'}
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => (
                    <tr key={producto.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '2.5rem',
                              height: '2.5rem',
                              borderRadius: '0.375rem',
                              backgroundColor: '#6366f120',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Package size={20} color="#6366f1" />
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{producto.nombre || '-'}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {producto.descripcion || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{producto.nombre_categoria || '-'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                        {formatearMoneda(producto.precio || 0)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{producto.stock || 0}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: producto.activo !== false ? '#10b98120' : '#ef444420',
                            color: producto.activo !== false ? '#10b981' : '#ef4444',
                          }}
                        >
                          {producto.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => abrirModalDetalle(producto)}
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
                            <Eye size={18} strokeWidth={2.5} />
                          </button>
                          {puedeEditar && (
                            <button
                              onClick={() => abrirModalEditar(producto)}
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
                              <Edit size={18} strokeWidth={2.5} />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              onClick={() => abrirModalEliminar(producto)}
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
                              <Trash2 size={18} strokeWidth={2.5} />
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
        )}
      </div>

      {/* Modal Crear Producto */}
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Nuevo Producto</h2>
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

            <form onSubmit={handleCrearProducto}>
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
                    rows={3}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Precio
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
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
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                      Precio Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_minimo}
                      onChange={(e) => setFormData({ ...formData, precio_minimo: e.target.value })}
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
                      Precio Máximo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_maximo}
                      onChange={(e) => setFormData({ ...formData, precio_maximo: e.target.value })}
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
                      Categoría
                    </label>
                    <select
                      value={formData.id_categoria}
                      onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="">Sin categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.duracion_horas}
                      onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
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
                      Unidad de Medida
                    </label>
                    <select
                      value={formData.unidad_medida}
                      onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="unidad">Unidad</option>
                      <option value="hora">Hora</option>
                      <option value="dia">Día</option>
                      <option value="servicio">Servicio</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Tipo de Servicio
                    </label>
                    <select
                      value={formData.tipo_servicio}
                      onChange={(e) => setFormData({ ...formData, tipo_servicio: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="servicio">Servicio</option>
                      <option value="producto">Producto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Detalles Adicionales
                  </label>
                  <textarea
                    value={formData.detalles_adicionales}
                    onChange={(e) => setFormData({ ...formData, detalles_adicionales: e.target.value })}
                    rows={2}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Variantes
                  </label>
                  <input
                    type="text"
                    value={formData.variantes}
                    onChange={(e) => setFormData({ ...formData, variantes: e.target.value })}
                    placeholder="Ej: Tamaño pequeño, mediano, grande"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
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
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Producto activo</label>
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

      {/* Modal Editar Producto - Similar al de crear pero con datos precargados */}
      {mostrarModalEditar && productoSeleccionado && (
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Editar Producto</h2>
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

            <form onSubmit={handleEditarProducto}>
              {/* Mismo formulario que crear pero con datos precargados */}
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
                    rows={3}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Precio
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
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
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                      Precio Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_minimo}
                      onChange={(e) => setFormData({ ...formData, precio_minimo: e.target.value })}
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
                      Precio Máximo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_maximo}
                      onChange={(e) => setFormData({ ...formData, precio_maximo: e.target.value })}
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
                      Categoría
                    </label>
                    <select
                      value={formData.id_categoria}
                      onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="">Sin categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.duracion_horas}
                      onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
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
                      Unidad de Medida
                    </label>
                    <select
                      value={formData.unidad_medida}
                      onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="unidad">Unidad</option>
                      <option value="hora">Hora</option>
                      <option value="dia">Día</option>
                      <option value="servicio">Servicio</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Tipo de Servicio
                    </label>
                    <select
                      value={formData.tipo_servicio}
                      onChange={(e) => setFormData({ ...formData, tipo_servicio: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="servicio">Servicio</option>
                      <option value="producto">Producto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Detalles Adicionales
                  </label>
                  <textarea
                    value={formData.detalles_adicionales}
                    onChange={(e) => setFormData({ ...formData, detalles_adicionales: e.target.value })}
                    rows={2}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Variantes
                  </label>
                  <input
                    type="text"
                    value={formData.variantes}
                    onChange={(e) => setFormData({ ...formData, variantes: e.target.value })}
                    placeholder="Ej: Tamaño pequeño, mediano, grande"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
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
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Producto activo</label>
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

      {/* Modal Detalle Producto */}
      {mostrarModalDetalle && productoSeleccionado && (
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Detalle del Producto</h2>
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
                  <Package size={32} color="#6366f1" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                    {productoSeleccionado.nombre || 'N/A'}
                  </h3>
                  <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {productoSeleccionado.nombre_categoria || 'Sin categoría'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Descripción
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {productoSeleccionado.descripcion || 'N/A'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Precio
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {formatearMoneda(productoSeleccionado.precio || 0)}
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Stock
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {productoSeleccionado.stock || 0}
                    </p>
                  </div>
                </div>

                {productoSeleccionado.precio_minimo && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Precio Mínimo
                      </label>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                        {formatearMoneda(productoSeleccionado.precio_minimo)}
                      </p>
                    </div>

                    {productoSeleccionado.precio_maximo && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          Precio Máximo
                        </label>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                          {formatearMoneda(productoSeleccionado.precio_maximo)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {productoSeleccionado.duracion_horas && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Duración
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {productoSeleccionado.duracion_horas} horas
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Unidad de Medida
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {productoSeleccionado.unidad_medida || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Tipo
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {productoSeleccionado.tipo_servicio || 'N/A'}
                    </p>
                  </div>
                </div>

                {productoSeleccionado.detalles_adicionales && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Detalles Adicionales
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {productoSeleccionado.detalles_adicionales}
                    </p>
                  </div>
                )}

                {productoSeleccionado.variantes && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Variantes
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {productoSeleccionado.variantes}
                    </p>
                  </div>
                )}

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
                      backgroundColor: productoSeleccionado.activo !== false ? '#10b98120' : '#ef444420',
                      color: productoSeleccionado.activo !== false ? '#10b981' : '#ef4444',
                    }}
                  >
                    {productoSeleccionado.activo !== false ? 'Activo' : 'Inactivo'}
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

      {/* Modal Eliminar Producto */}
      {mostrarModalEliminar && productoSeleccionado && (
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Eliminar Producto</h2>
                <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  ¿Está seguro de eliminar este producto?
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{productoSeleccionado.nombre}</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                {productoSeleccionado.nombre_categoria || 'Sin categoría'}
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
                onClick={handleEliminarProducto}
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

export default Productos;
