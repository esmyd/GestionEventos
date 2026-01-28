import React, { useState, useEffect } from 'react';
import { productoOpcionesService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { CheckCircle2, AlertTriangle, ListChecks, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Componente para confirmar las opciones de productos de un evento
 * 
 * @param {Object} props
 * @param {number} props.eventoId - ID del evento
 * @param {boolean} props.puedeEditar - Si el usuario puede editar/confirmar
 * @param {boolean} props.compacto - Modo compacto para mostrar solo resumen
 * @param {Function} props.onConfirmacionCompleta - Callback cuando todas las confirmaciones están completas
 */
const EventoConfirmaciones = ({ eventoId, puedeEditar = false, compacto = false, onConfirmacionCompleta }) => {
  const { success, error: showError } = useToast();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(!compacto);
  const [guardando, setGuardando] = useState(false);
  const [seleccionActual, setSeleccionActual] = useState({});

  useEffect(() => {
    if (eventoId) {
      cargarResumen();
    }
  }, [eventoId]);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      const data = await productoOpcionesService.getResumenConfirmaciones(eventoId);
      setResumen(data);
      
      // Inicializar selecciones actuales
      const selecciones = {};
      data.confirmadas?.forEach(conf => {
        selecciones[conf.opcion_id] = {
          seleccion: conf.seleccion,
          cantidad: conf.cantidad,
          observaciones: conf.observaciones
        };
      });
      setSeleccionActual(selecciones);
      
      if (data.completo && onConfirmacionCompleta) {
        onConfirmacionCompleta(true);
      }
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionChange = (opcionId, valor, esMultiple = false) => {
    setSeleccionActual(prev => {
      const actual = prev[opcionId]?.seleccion || '';
      let nuevaSeleccion;
      
      if (esMultiple) {
        const seleccionesActuales = actual ? actual.split('|') : [];
        if (seleccionesActuales.includes(valor)) {
          nuevaSeleccion = seleccionesActuales.filter(s => s !== valor).join('|');
        } else {
          nuevaSeleccion = [...seleccionesActuales, valor].join('|');
        }
      } else {
        nuevaSeleccion = valor;
      }
      
      return {
        ...prev,
        [opcionId]: {
          ...prev[opcionId],
          seleccion: nuevaSeleccion
        }
      };
    });
  };

  const handleCantidadChange = (opcionId, cantidad) => {
    setSeleccionActual(prev => ({
      ...prev,
      [opcionId]: {
        ...prev[opcionId],
        cantidad: cantidad ? parseInt(cantidad) : null
      }
    }));
  };

  const handleObservacionesChange = (opcionId, observaciones) => {
    setSeleccionActual(prev => ({
      ...prev,
      [opcionId]: {
        ...prev[opcionId],
        observaciones
      }
    }));
  };

  const guardarSeleccion = async (opcionId) => {
    const seleccion = seleccionActual[opcionId];
    
    if (!seleccion?.seleccion) {
      showError('Debe seleccionar al menos una opción');
      return;
    }

    try {
      setGuardando(true);
      await productoOpcionesService.guardarSeleccion(eventoId, {
        opcion_id: opcionId,
        seleccion: seleccion.seleccion,
        cantidad: seleccion.cantidad,
        observaciones: seleccion.observaciones
      });
      success('Confirmación guardada');
      await cargarResumen();
    } catch (err) {
      showError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarConfirmacion = async (seleccionId) => {
    if (!window.confirm('¿Eliminar esta confirmación?')) return;

    try {
      await productoOpcionesService.eliminarSeleccion(seleccionId);
      success('Confirmación eliminada');
      await cargarResumen();
    } catch (err) {
      showError('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
        Cargando confirmaciones...
      </div>
    );
  }

  if (!resumen || (resumen.total_pendientes === 0 && resumen.total_confirmadas === 0)) {
    return null; // No hay opciones que confirmar
  }

  const totalOpciones = resumen.total_pendientes + resumen.total_confirmadas;

  return (
    <div style={{
      border: resumen.completo ? '1px solid #86efac' : '1px solid #fcd34d',
      borderRadius: '0.75rem',
      backgroundColor: resumen.completo ? '#f0fdf4' : '#fffbeb',
      overflow: 'hidden',
      marginBottom: '1rem'
    }}>
      {/* Header */}
      <div
        onClick={() => compacto && setExpandido(!expandido)}
        style={{
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: compacto ? 'pointer' : 'default',
          backgroundColor: resumen.completo ? '#dcfce7' : '#fef3c7'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {resumen.completo ? (
            <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
          ) : (
            <AlertTriangle size={24} style={{ color: '#d97706' }} />
          )}
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: resumen.completo ? '#166534' : '#92400e' }}>
              {resumen.completo ? 'Confirmaciones Completas' : 'Confirmaciones Pendientes'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: resumen.completo ? '#15803d' : '#a16207' }}>
              {resumen.total_confirmadas} de {totalOpciones} opciones confirmadas
            </p>
          </div>
        </div>
        {compacto && (
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
            {expandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>

      {/* Content */}
      {expandido && (
        <div style={{ padding: '1rem' }}>
          {/* Pendientes */}
          {resumen.pendientes?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: '600', color: '#92400e' }}>
                Por confirmar ({resumen.pendientes.length})
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {resumen.pendientes.map((opcion) => (
                  <div
                    key={opcion.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.25rem',
                        marginBottom: '0.25rem',
                        display: 'inline-block'
                      }}>
                        {opcion.producto_nombre}
                      </span>
                      <h6 style={{ margin: '0.25rem 0 0', fontWeight: '600', color: '#1f2937' }}>
                        {opcion.nombre_grupo}
                        {opcion.requerido && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
                      </h6>
                    </div>
                    
                    {puedeEditar ? (
                      <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {opcion.opciones_lista?.map((opt, idx) => {
                            const seleccionadas = (seleccionActual[opcion.id]?.seleccion || '').split('|');
                            const seleccionado = seleccionadas.includes(opt);
                            
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSeleccionChange(opcion.id, opt, opcion.permite_multiple)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: seleccionado ? '#4f46e5' : '#f3f4f6',
                                  color: seleccionado ? 'white' : '#374151',
                                  border: seleccionado ? '2px solid #4f46e5' : '2px solid #d1d5db',
                                  borderRadius: '0.5rem',
                                  cursor: 'pointer',
                                  fontWeight: seleccionado ? '600' : '400',
                                  fontSize: '0.9rem',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <div style={{ flex: '0 0 100px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={seleccionActual[opcion.id]?.cantidad || ''}
                              onChange={(e) => handleCantidadChange(opcion.id, e.target.value)}
                              placeholder="Opc."
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
                              Observaciones
                            </label>
                            <input
                              type="text"
                              value={seleccionActual[opcion.id]?.observaciones || ''}
                              onChange={(e) => handleObservacionesChange(opcion.id, e.target.value)}
                              placeholder="Notas adicionales..."
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                          <button
                            onClick={() => guardarSeleccion(opcion.id)}
                            disabled={guardando || !seleccionActual[opcion.id]?.seleccion}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: seleccionActual[opcion.id]?.seleccion ? '#10b981' : '#d1d5db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: seleccionActual[opcion.id]?.seleccion ? 'pointer' : 'not-allowed',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <Save size={16} />
                            Confirmar
                          </button>
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic' }}>
                        Pendiente de confirmación por el cliente
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmadas */}
          {resumen.confirmadas?.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: '600', color: '#166534' }}>
                Confirmadas ({resumen.confirmadas.length})
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {resumen.confirmadas.map((conf) => (
                  <div
                    key={conf.id}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      border: '1px solid #86efac',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{conf.producto_nombre}</span>
                        <span style={{ color: '#d1d5db' }}>•</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{conf.nombre_grupo}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                        {conf.seleccion_lista?.map((sel, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '0.2rem 0.6rem',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              borderRadius: '0.25rem',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            {sel}
                          </span>
                        ))}
                        {conf.cantidad && (
                          <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                            (Cantidad: {conf.cantidad})
                          </span>
                        )}
                        {conf.observaciones && (
                          <span style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                            - {conf.observaciones}
                          </span>
                        )}
                      </div>
                      {conf.confirmado_por_nombre && (
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          Confirmado por {conf.confirmado_por_nombre}
                        </div>
                      )}
                    </div>
                    {puedeEditar && (
                      <button
                        onClick={() => eliminarConfirmacion(conf.id)}
                        style={{
                          padding: '0.35rem',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                        title="Eliminar confirmación"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventoConfirmaciones;
