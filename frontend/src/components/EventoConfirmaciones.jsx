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
 * @param {boolean} props.fijo - Si true, la barra se fija al fondo y permanece visible en todas las pestañas
 * @param {Function} props.onConfirmacionCompleta - Callback cuando todas las confirmaciones están completas
 * @param {Function} props.onConfirmacionGuardada - Callback cuando se guarda o elimina una confirmación (para actualizar avance en padre)
 */
const EventoConfirmaciones = ({ eventoId, puedeEditar = false, compacto = false, fijo = false, onConfirmacionCompleta, onConfirmacionGuardada }) => {
  const { success, error: showError } = useToast();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(!compacto);
  const [guardando, setGuardando] = useState(false);
  const [guardandoOpcionId, setGuardandoOpcionId] = useState(null);
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

  const handleSeleccionChange = (opcionId, valor, esMultiple = false, opcion = null) => {
    setSeleccionActual(prev => {
      const actual = prev[opcionId]?.seleccion || '';
      let nuevaSeleccion;
      
      if (esMultiple) {
        const seleccionesActuales = actual ? actual.split('|').filter(Boolean) : [];
        if (seleccionesActuales.includes(valor)) {
          nuevaSeleccion = seleccionesActuales.filter(s => s !== valor).join('|');
        } else {
          const max = opcion?.cantidad_max_multiples != null ? parseInt(opcion.cantidad_max_multiples, 10) : null;
          if (max != null && seleccionesActuales.length >= max) {
            return prev;
          }
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
    const opcion = resumen?.pendientes?.find(p => p.id === opcionId) || resumen?.confirmadas?.find(c => c.opcion_id === opcionId);
    
    if (!seleccion?.seleccion) {
      showError('Debe seleccionar al menos una opción');
      return;
    }

    if (opcion?.permite_multiple) {
      const lista = seleccion.seleccion.split('|').filter(Boolean);
      const min = opcion.minimo_multiples != null ? parseInt(opcion.minimo_multiples, 10) : null;
      const max = opcion.cantidad_max_multiples != null ? parseInt(opcion.cantidad_max_multiples, 10) : null;
      if (min != null && lista.length < min) {
        showError(`Debe seleccionar al menos ${min} opción(es)`);
        return;
      }
      if (max != null && lista.length > max) {
        showError(`Puede seleccionar como máximo ${max} opción(es)`);
        return;
      }
    }

    const debePedirCantidad = opcion?.pedir_cantidad === true || opcion?.pedir_cantidad === 1;
    if (debePedirCantidad && (!seleccion.cantidad || seleccion.cantidad < 1)) {
      showError('Debe indicar la cantidad');
      return;
    }

    try {
      setGuardando(true);
      setGuardandoOpcionId(opcionId);
      await productoOpcionesService.guardarSeleccion(eventoId, {
        opcion_id: opcionId,
        seleccion: seleccion.seleccion,
        cantidad: debePedirCantidad ? seleccion.cantidad : null,
        observaciones: seleccion.observaciones
      });
      success('Confirmación guardada');
      await cargarResumen();
    } catch (err) {
      showError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
      setGuardandoOpcionId(null);
    }
  };

  const eliminarConfirmacion = async (seleccionId) => {
    if (!window.confirm('¿Eliminar esta confirmación?')) return;

    try {
      await productoOpcionesService.eliminarSeleccion(seleccionId);
      success('Confirmación eliminada');
      await cargarResumen();
      if (onConfirmacionGuardada) onConfirmacionGuardada();
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
  const progreso = totalOpciones > 0 ? Math.round((resumen.total_confirmadas / totalOpciones) * 100) : 0;

  const contenido = (
    <div style={{
      marginBottom: fijo ? 0 : '1rem',
    }}>
      {/* Barra de progreso mínima - diseño limpio */}
      <div
        onClick={() => compacto && setExpandido(!expandido)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 0',
          marginBottom: expandido ? '1.5rem' : 0,
          cursor: compacto ? 'pointer' : 'default',
          borderBottom: expandido ? '1px solid #f1f5f9' : 'none',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
              {resumen.completo ? 'Todo confirmado' : 'Pendientes de confirmar'}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: resumen.completo ? '#0d9488' : '#64748b' }}>
              {resumen.total_confirmadas}/{totalOpciones}
            </span>
          </div>
          <div style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${progreso}%`,
              height: '100%',
              backgroundColor: resumen.completo ? '#0d9488' : '#94a3b8',
              borderRadius: 2,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
        {compacto && (
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748b' }}>
            {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {/* Content */}
      {expandido && (
        <div>
          {/* Pendientes - diseño tipo lista con acento lateral */}
          {resumen.pendientes?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                Seleccione las opciones para cada ítem
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {resumen.pendientes.map((opcion, index) => (
                  <div
                    key={opcion.id}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      borderLeft: '4px solid #0ea5e9',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {opcion.producto_nombre}
                        </span>
                        <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>
                          {opcion.nombre_grupo}
                          {opcion.requerido && <span style={{ color: '#f43f5e', marginLeft: 2 }}>*</span>}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>#{index + 1}</span>
                    </div>

                    {puedeEditar ? (
                      <>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {(opcion.permite_multiple && (opcion.minimo_multiples != null || opcion.cantidad_max_multiples != null)) && (
                              <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                {opcion.minimo_multiples != null && opcion.cantidad_max_multiples != null && (
                                  <>Seleccione entre {opcion.minimo_multiples} y {opcion.cantidad_max_multiples} opciones</>
                                )}
                                {opcion.minimo_multiples != null && opcion.cantidad_max_multiples == null && (
                                  <>Mínimo {opcion.minimo_multiples} opción(es)</>
                                )}
                                {opcion.minimo_multiples == null && opcion.cantidad_max_multiples != null && (
                                  <>Máximo {opcion.cantidad_max_multiples} opciones</>
                                )}
                              </p>
                            )}
                            {opcion.opciones_lista?.map((opt, idx) => {
                              const seleccionadas = (seleccionActual[opcion.id]?.seleccion || '').split('|').filter(Boolean);
                              const seleccionado = seleccionadas.includes(opt);
                              const max = opcion.cantidad_max_multiples != null ? parseInt(opcion.cantidad_max_multiples, 10) : null;
                              const maxAlcanzado = max != null && seleccionadas.length >= max;
                              const deshabilitado = !seleccionado && maxAlcanzado;
                              return (
                                <label
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: seleccionado ? '#0f172a' : deshabilitado ? '#f1f5f9' : 'white',
                                    color: seleccionado ? 'white' : deshabilitado ? '#94a3b8' : '#475569',
                                    border: `1px solid ${seleccionado ? '#0f172a' : deshabilitado ? '#e2e8f0' : '#e2e8f0'}`,
                                    borderRadius: 6,
                                    cursor: deshabilitado ? 'not-allowed' : 'pointer',
                                    fontWeight: seleccionado ? '600' : '500',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.15s',
                                    boxShadow: seleccionado ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    opacity: deshabilitado ? 0.7 : 1,
                                  }}
                                >
                                  <input
                                    type={opcion.permite_multiple ? 'checkbox' : 'radio'}
                                    name={`opcion-${opcion.id}`}
                                    checked={seleccionado}
                                    disabled={deshabilitado}
                                    onChange={() => !deshabilitado && handleSeleccionChange(opcion.id, opt, opcion.permite_multiple, opcion)}
                                    style={{ display: 'none' }}
                                  />
                                  <span style={{ width: 18, height: 18, borderRadius: opcion.permite_multiple ? 4 : '50%', border: `2px solid ${seleccionado ? 'white' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {seleccionado && <span style={{ fontSize: 10 }}>✓</span>}
                                  </span>
                                  {opt}
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          {(opcion.pedir_cantidad === true || opcion.pedir_cantidad === 1) && (
                            <div style={{ width: 90 }}>
                              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Cantidad *</label>
                              <input
                                type="number"
                                min="1"
                                value={(() => {
                                  const c = seleccionActual[opcion.id]?.cantidad;
                                  return (c != null && Number(c) > 0) ? Number(c) : '';
                                })()}
                                onChange={(e) => handleCantidadChange(opcion.id, e.target.value)}
                                placeholder="1"
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 0.6rem',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 6,
                                  fontSize: '0.9rem',
                                  backgroundColor: 'white',
                                }}
                              />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Observaciones</label>
                            <input
                              type="text"
                              value={seleccionActual[opcion.id]?.observaciones || ''}
                              onChange={(e) => handleObservacionesChange(opcion.id, e.target.value)}
                              placeholder="Opcional"
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.6rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                fontSize: '0.9rem',
                                backgroundColor: 'white',
                              }}
                            />
                          </div>
                          <button
                            onClick={() => guardarSeleccion(opcion.id)}
                            disabled={guardando || !seleccionActual[opcion.id]?.seleccion}
                            title={!seleccionActual[opcion.id]?.seleccion ? 'Seleccione una opción' : 'Guardar'}
                            style={{
                              padding: '0.5rem 1.25rem',
                              backgroundColor: seleccionActual[opcion.id]?.seleccion ? '#0f172a' : '#e2e8f0',
                              color: seleccionActual[opcion.id]?.seleccion ? 'white' : '#94a3b8',
                              border: 'none',
                              borderRadius: 6,
                              cursor: seleccionActual[opcion.id]?.seleccion ? 'pointer' : 'not-allowed',
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            <Save size={16} />
                            {guardandoOpcionId === opcion.id ? '...' : 'Guardar'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>
                        Pendiente de confirmación
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmadas - diseño minimalista */}
          {resumen.confirmadas?.length > 0 && (
            <div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                Opciones ya confirmadas
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resumen.confirmadas.map((conf) => (
                  <div
                    key={conf.id}
                    style={{
                      padding: '1rem 1.25rem',
                      backgroundColor: '#f0fdfa',
                      borderRadius: 8,
                      borderLeft: '4px solid #14b8a6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <CheckCircle2 size={18} style={{ color: '#14b8a6', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{conf.producto_nombre}</span>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{conf.nombre_grupo}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', marginTop: '0.25rem' }}>
                        {conf.seleccion_lista?.map((sel, idx) => (
                          <span key={idx} style={{ padding: '0.15rem 0.5rem', backgroundColor: 'rgba(20,184,166,0.2)', color: '#0d9488', borderRadius: 4, fontSize: '0.8rem', fontWeight: '500' }}>
                            {sel}
                          </span>
                        ))}
                        {conf.cantidad > 0 && <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 4 }}>(x{conf.cantidad})</span>}
                        {conf.observaciones && <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}> - {conf.observaciones}</span>}
                      </div>
                      {conf.confirmado_por_nombre && (
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>Por {conf.confirmado_por_nombre}</div>
                      )}
                    </div>
                    {puedeEditar && (
                      <button
                        onClick={() => eliminarConfirmacion(conf.id)}
                        style={{ padding: '0.35rem', background: 'none', border: '1px solid #fecaca', color: '#f43f5e', borderRadius: 6, cursor: 'pointer' }}
                        title="Eliminar"
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

  if (fijo) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 800,
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {contenido}
      </div>
    );
  }
  return contenido;
};

export default EventoConfirmaciones;
