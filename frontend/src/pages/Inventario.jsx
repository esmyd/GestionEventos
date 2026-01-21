import React, { useState, useEffect } from 'react';
import { inventarioService, eventosService } from '../services/api';
import { Package, Search } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';

const Inventario = () => {
  const isMobile = useIsMobile();
  const [inventario, setInventario] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenInventario, setOrdenInventario] = useState('fecha_desc');

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    if (filtroEvento) {
      cargarInventario();
    } else {
      setInventario([]);
    }
  }, [filtroEvento]);

  const cargarEventos = async () => {
    try {
      const data = await eventosService.getAll();
      setEventos(data.eventos || []);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
    }
  };

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getByEvento(filtroEvento);
      setInventario(data.inventario || []);
      setError('');
    } catch (err) {
      setError('Error al cargar el inventario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      disponible: '#10b981',
      reservado: '#3b82f6',
      en_uso: '#f59e0b',
      devuelto: '#6b7280',
    };
    return colores[estado] || '#6b7280';
  };

  const inventarioFiltrado = inventario
    .filter((item) => {
      if (!busqueda) return true;
      const texto = busqueda.toLowerCase();
      return (
        item.nombre_producto?.toLowerCase().includes(texto) ||
        item.observaciones?.toLowerCase().includes(texto) ||
        item.estado?.toLowerCase().includes(texto)
      );
    })
    .filter((item) => (filtroEstado === 'todos' ? true : item.estado === filtroEstado))
    .sort((a, b) => {
      switch (ordenInventario) {
        case 'producto_asc':
          return (a.nombre_producto || '').localeCompare(b.nombre_producto || '');
        case 'producto_desc':
          return (b.nombre_producto || '').localeCompare(a.nombre_producto || '');
        case 'cantidad_desc':
          return (b.cantidad_solicitada || 0) - (a.cantidad_solicitada || 0);
        case 'cantidad_asc':
          return (a.cantidad_solicitada || 0) - (b.cantidad_solicitada || 0);
        case 'fecha_asc':
          return new Date(a.fecha_reserva || 0).getTime() - new Date(b.fecha_reserva || 0).getTime();
        default:
          return new Date(b.fecha_reserva || 0).getTime() - new Date(a.fecha_reserva || 0).getTime();
      }
    });

  const metricasInventario = inventarioFiltrado.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.estado && acc.porEstado[item.estado] !== undefined) {
        acc.porEstado[item.estado] += 1;
      }
      return acc;
    },
    { total: 0, porEstado: { disponible: 0, reservado: 0, en_uso: 0, devuelto: 0 } }
  );

  if (loading && filtroEvento) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando inventario...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Inventario</h1>
        <p style={{ color: '#6b7280' }}>Gestión de inventario por evento</p>
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

      {/* Filtro de evento */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
          }}
        >
          Seleccionar Evento
        </label>
        <select
          value={filtroEvento}
          onChange={(e) => setFiltroEvento(e.target.value)}
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '500px',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
          }}
        >
          <option value="">Seleccione un evento</option>
          {eventos.map((evento) => (
            <option key={evento.id_evento} value={evento.id_evento}>
              {evento.nombre_evento} - {evento.nombre_cliente}
            </option>
          ))}
        </select>
      </div>

      {filtroEvento && (
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
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
                placeholder="Buscar producto u observaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.95rem',
                }}
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.95rem',
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
              <option value="en_uso">En uso</option>
              <option value="devuelto">Devuelto</option>
            </select>
            <select
              value={ordenInventario}
              onChange={(e) => setOrdenInventario(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.95rem',
              }}
            >
              <option value="fecha_desc">Ordenar: Más recientes</option>
              <option value="fecha_asc">Ordenar: Más antiguos</option>
              <option value="producto_asc">Ordenar: Producto (A-Z)</option>
              <option value="producto_desc">Ordenar: Producto (Z-A)</option>
              <option value="cantidad_desc">Ordenar: Cantidad (Mayor)</option>
              <option value="cantidad_asc">Ordenar: Cantidad (Menor)</option>
            </select>
          </div>
        </div>
      )}

      {filtroEvento && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total</label>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{metricasInventario.total}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Disponibles</label>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
              {metricasInventario.porEstado.disponible}
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Reservados</label>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#3b82f6' }}>
              {metricasInventario.porEstado.reservado}
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>En uso</label>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#f59e0b' }}>
              {metricasInventario.porEstado.en_uso}
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Devueltos</label>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#6b7280' }}>
              {metricasInventario.porEstado.devuelto}
            </p>
          </div>
        </div>
      )}
      {filtroEvento && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inventarioFiltrado.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No hay registros que coincidan con los filtros
                </div>
              ) : (
                inventarioFiltrado.map((item) => (
                  <div
                    key={item.id}
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
                      <Package size={18} color="#6366f1" />
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{item.nombre_producto || '-'}</div>
                        {item.observaciones && (
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.observaciones}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Solicitado</div>
                        <div style={{ fontWeight: '600' }}>{item.cantidad_solicitada || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Disponible</div>
                        <div style={{ fontWeight: '600' }}>{item.cantidad_disponible || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Utilizado</div>
                        <div style={{ fontWeight: '600' }}>{item.cantidad_utilizada || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Fecha</div>
                        <div style={{ fontWeight: '600' }}>
                          {item.fecha_reserva ? new Date(item.fecha_reserva).toLocaleDateString('es-CO') : '-'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: `${getEstadoColor(item.estado)}20`,
                          color: getEstadoColor(item.estado),
                        }}
                      >
                        {item.estado || '-'}
                      </span>
                    </div>
                    <div>
                      <button
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#6366f1',
                          color: 'white',
                          borderRadius: '0.375rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                        }}
                      >
                        Actualizar
                      </button>
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
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                      Solicitado
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                      Disponible
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                      Utilizado
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                      Estado
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                      Fecha Reserva
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        No hay registros que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    inventarioFiltrado.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Package size={20} color="#6366f1" />
                            <div>
                              <div style={{ fontWeight: '500' }}>{item.nombre_producto || '-'}</div>
                              {item.observaciones && (
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                  {item.observaciones}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{item.cantidad_solicitada || 0}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{item.cantidad_disponible || 0}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{item.cantidad_utilizada || 0}</td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: `${getEstadoColor(item.estado)}20`,
                              color: getEstadoColor(item.estado),
                            }}
                          >
                            {item.estado || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {item.fecha_reserva
                            ? new Date(item.fecha_reserva).toLocaleDateString('es-CO')
                            : '-'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                            }}
                          >
                            Actualizar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventario;
