import React, { useState, useEffect } from 'react';
import { productoOpcionesService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Plus, Edit2, Trash2, X, Save, ListChecks, AlertCircle } from 'lucide-react';

/**
 * Componente para gestionar las opciones de un producto que requieren confirmación del cliente
 * 
 * @param {Object} props
 * @param {number} props.productoId - ID del producto
 * @param {string} props.productoNombre - Nombre del producto
 * @param {boolean} props.puedeEditar - Si el usuario puede editar
 * @param {Function} props.onClose - Función para cerrar el modal
 */
const ProductoOpciones = ({ productoId, productoNombre, puedeEditar = false, onClose }) => {
  const { success, error: showError } = useToast();
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [opcionEditando, setOpcionEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_grupo: '',
    opciones: '',
    permite_multiple: false,
    requerido: true,
    orden: 0
  });

  useEffect(() => {
    if (productoId) {
      cargarOpciones();
    }
  }, [productoId]);

  const cargarOpciones = async () => {
    try {
      setLoading(true);
      const data = await productoOpcionesService.getOpcionesProducto(productoId);
      setOpciones(data.opciones || []);
    } catch (err) {
      showError('Error al cargar opciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const abrirFormularioNuevo = () => {
    setFormData({
      nombre_grupo: '',
      opciones: '',
      permite_multiple: false,
      requerido: true,
      orden: opciones.length
    });
    setOpcionEditando(null);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (opcion) => {
    setFormData({
      nombre_grupo: opcion.nombre_grupo,
      opciones: opcion.opciones,
      permite_multiple: opcion.permite_multiple,
      requerido: opcion.requerido,
      orden: opcion.orden
    });
    setOpcionEditando(opcion);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setOpcionEditando(null);
    setFormData({
      nombre_grupo: '',
      opciones: '',
      permite_multiple: false,
      requerido: true,
      orden: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre_grupo.trim()) {
      showError('El nombre del grupo es requerido');
      return;
    }
    
    if (!formData.opciones.trim()) {
      showError('Las opciones son requeridas');
      return;
    }

    try {
      setGuardando(true);
      
      if (opcionEditando) {
        await productoOpcionesService.actualizarOpcion(opcionEditando.id, formData);
        success('Opción actualizada exitosamente');
      } else {
        await productoOpcionesService.crearOpcion(productoId, formData);
        success('Opción creada exitosamente');
      }
      
      await cargarOpciones();
      cerrarFormulario();
    } catch (err) {
      showError(err.response?.data?.error || 'Error al guardar opción');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarOpcion = async (opcion) => {
    if (!window.confirm(`¿Eliminar el grupo "${opcion.nombre_grupo}"?`)) {
      return;
    }

    try {
      await productoOpcionesService.eliminarOpcion(opcion.id, true);
      success('Opción eliminada');
      await cargarOpciones();
    } catch (err) {
      showError(err.response?.data?.error || 'Error al eliminar opción');
    }
  };

  return (
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
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListChecks size={24} style={{ color: '#6366f1' }} />
              Opciones del Producto
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              {productoNombre}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Info */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
              <strong>Opciones que el cliente debe confirmar</strong>
              <p style={{ margin: '0.25rem 0 0' }}>
                Define grupos de opciones (ej: "Tipo de Arroz") con sus variantes separadas por <code style={{ backgroundColor: '#e0f2fe', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>|</code> (ej: "Moro|Blanco|Con choclo").
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando opciones...
            </div>
          ) : (
            <>
              {/* Lista de opciones */}
              {opciones.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  color: '#6b7280'
                }}>
                  <ListChecks size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Este producto no tiene opciones configuradas</p>
                  {puedeEditar && (
                    <button
                      onClick={abrirFormularioNuevo}
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                      }}
                    >
                      <Plus size={18} />
                      Agregar primera opción
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {opciones.map((opcion) => (
                    <div
                      key={opcion.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>
                            {opcion.nombre_grupo}
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {opcion.requerido && (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                borderRadius: '9999px'
                              }}>
                                Requerido
                              </span>
                            )}
                            {opcion.permite_multiple && (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                backgroundColor: '#f0fdf4',
                                color: '#16a34a',
                                borderRadius: '9999px'
                              }}>
                                Múltiple
                              </span>
                            )}
                          </div>
                        </div>
                        {puedeEditar && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => abrirFormularioEditar(opcion)}
                              style={{
                                padding: '0.4rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer'
                              }}
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => eliminarOpcion(opcion)}
                              style={{
                                padding: '0.4rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer'
                              }}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {opcion.opciones_lista?.map((opt, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '0.35rem 0.75rem',
                              backgroundColor: '#e0e7ff',
                              color: '#4338ca',
                              borderRadius: '0.375rem',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón agregar */}
              {puedeEditar && opciones.length > 0 && !mostrarFormulario && (
                <button
                  onClick={abrirFormularioNuevo}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '500'
                  }}
                >
                  <Plus size={18} />
                  Agregar otro grupo de opciones
                </button>
              )}

              {/* Formulario */}
              {mostrarFormulario && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ margin: '0 0 1rem', fontWeight: '600' }}>
                    {opcionEditando ? 'Editar grupo de opciones' : 'Nuevo grupo de opciones'}
                  </h4>
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                        Nombre del grupo *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre_grupo}
                        onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })}
                        placeholder="Ej: Tipo de Arroz, Tipo de Proteína"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                        Opciones disponibles * <span style={{ fontWeight: 'normal', color: '#6b7280' }}>(separadas por |)</span>
                      </label>
                      <textarea
                        value={formData.opciones}
                        onChange={(e) => setFormData({ ...formData, opciones: e.target.value })}
                        placeholder="Ej: Moro|Blanco|Con choclo|Chicloso"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.95rem',
                          resize: 'vertical'
                        }}
                      />
                      {formData.opciones && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {formData.opciones.split('|').filter(o => o.trim()).map((opt, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#dbeafe',
                                color: '#1d4ed8',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem'
                              }}
                            >
                              {opt.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.requerido}
                          onChange={(e) => setFormData({ ...formData, requerido: e.target.checked })}
                        />
                        <span style={{ fontSize: '0.875rem' }}>Es requerido</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.permite_multiple}
                          onChange={(e) => setFormData({ ...formData, permite_multiple: e.target.checked })}
                        />
                        <span style={{ fontSize: '0.875rem' }}>Permite selección múltiple</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={cerrarFormulario}
                        disabled={guardando}
                        style={{
                          padding: '0.6rem 1.25rem',
                          backgroundColor: '#e5e7eb',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardando}
                        style={{
                          padding: '0.6rem 1.25rem',
                          backgroundColor: '#6366f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: guardando ? 'not-allowed' : 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          opacity: guardando ? 0.7 : 1
                        }}
                      >
                        <Save size={16} />
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoOpciones;
