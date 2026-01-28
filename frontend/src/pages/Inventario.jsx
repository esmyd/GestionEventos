import React, { useState, useEffect } from 'react';
import { inventarioService, eventosService, productosService } from '../services/api';
import { Package, Search, TrendingUp, TrendingDown, AlertTriangle, History, Calendar, Plus, Minus, RefreshCw } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';

const Inventario = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('stock');
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [inventarioEvento, setInventarioEvento] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Modal para ajuste de stock
  const [modalAjuste, setModalAjuste] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipoAjuste, setTipoAjuste] = useState('entrada');
  const [cantidadAjuste, setCantidadAjuste] = useState('');
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [recalculando, setRecalculando] = useState(false);
  
  // Búsqueda y paginación de movimientos
  const [busquedaMovimientos, setBusquedaMovimientos] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(15);

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock' || activeTab === 'alertas') {
        await cargarProductos();
      } else if (activeTab === 'movimientos') {
        await cargarMovimientos();
      } else if (activeTab === 'eventos') {
        await cargarEventos();
      }
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const data = await productosService.getAll();
      setProductos(data.productos || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const cargarMovimientos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventario/movimientos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMovimientos(data.movimientos || []);
      }
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
      setMovimientos([]);
    }
  };

  const cargarEventos = async () => {
    try {
      const data = await eventosService.getAll();
      setEventos(data.eventos || []);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
    }
  };

  const cargarInventarioEvento = async (eventoId) => {
    try {
      const data = await inventarioService.getByEvento(eventoId);
      setInventarioEvento(data.inventario || []);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
    }
  };

  const handleAjusteStock = async () => {
    if (!productoSeleccionado || !cantidadAjuste || parseInt(cantidadAjuste) <= 0) {
      return;
    }
    
    try {
      const cantidad = tipoAjuste === 'entrada' ? parseInt(cantidadAjuste) : -parseInt(cantidadAjuste);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/productos/${productoSeleccionado.id}/stock`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cantidad,
          motivo: motivoAjuste || `${tipoAjuste === 'entrada' ? 'Entrada' : 'Salida'} manual de stock`
        })
      });
      
      if (response.ok) {
        await cargarProductos();
        setModalAjuste(false);
        setProductoSeleccionado(null);
        setCantidadAjuste('');
        setMotivoAjuste('');
      }
    } catch (err) {
      console.error('Error al ajustar stock:', err);
    }
  };

  const getStockColor = (stock, stockMinimo) => {
    if (stock <= 0) return '#ef4444';
    if (stockMinimo && stock <= stockMinimo) return '#f59e0b';
    return '#10b981';
  };

  const tabs = [
    { id: 'stock', label: 'Stock General', icon: Package },
    { id: 'movimientos', label: 'Movimientos', icon: History },
    { id: 'eventos', label: 'Por Evento', icon: Calendar },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
  ];

  const productosFiltrados = productos.filter(p => {
    if (!busqueda) return true;
    return p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
           p.nombre_categoria?.toLowerCase().includes(busqueda.toLowerCase());
  });

  const productosConAlerta = productos.filter(p => {
    const stock = parseInt(p.stock || p.stock_disponible || 0);
    const stockMin = parseInt(p.stock_minimo || 0);
    return stock <= stockMin || stock <= 0;
  });

  const renderTabs = () => (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '0.5rem',
      overflowX: 'auto'
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const alertCount = tab.id === 'alertas' ? productosConAlerta.length : 0;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: isActive ? '#6366f1' : 'transparent',
              color: isActive ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: isActive ? '600' : '500',
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              whiteSpace: 'nowrap',
              position: 'relative'
            }}
          >
            <Icon size={18} />
            {!isMobile && tab.label}
            {alertCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '9999px',
                padding: '0.125rem 0.5rem',
                fontSize: '0.7rem',
                fontWeight: '700'
              }}>
                {alertCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderStockGeneral = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.95rem'
            }}
          />
        </div>
        <button
          onClick={() => cargarProductos()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Productos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{productos.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Con Stock</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {productos.filter(p => (p.stock || p.stock_disponible || 0) > 0).length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Stock Bajo</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
            {productosConAlerta.filter(p => (p.stock || p.stock_disponible || 0) > 0).length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Agotados</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
            {productos.filter(p => (p.stock || p.stock_disponible || 0) <= 0).length}
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
            {productosFiltrados.map(producto => {
              const stock = parseInt(producto.stock || producto.stock_disponible || 0);
              const stockMin = parseInt(producto.stock_minimo || 0);
              return (
                <div key={producto.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{producto.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{producto.nombre_categoria || 'Sin categoría'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{producto.unidad_medida || 'unidad'}</div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      backgroundColor: `${getStockColor(stock, stockMin)}15`,
                      color: getStockColor(stock, stockMin)
                    }}>
                      {stock} {producto.unidad_medida || 'uds'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setProductoSeleccionado(producto);
                        setTipoAjuste('entrada');
                        setModalAjuste(true);
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Plus size={14} /> Entrada
                    </button>
                    <button
                      onClick={() => {
                        setProductoSeleccionado(producto);
                        setTipoAjuste('salida');
                        setModalAjuste(true);
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Minus size={14} /> Salida
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Producto</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Categoría</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Unidad</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Stock Actual</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Stock Mínimo</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(producto => {
                const stock = parseInt(producto.stock || producto.stock_disponible || 0);
                const stockMin = parseInt(producto.stock_minimo || 0);
                const unidad = producto.unidad_medida || 'unidad';
                let estado = 'Normal';
                let estadoColor = '#10b981';
                if (stock <= 0) {
                  estado = 'Agotado';
                  estadoColor = '#ef4444';
                } else if (stockMin && stock <= stockMin) {
                  estado = 'Stock Bajo';
                  estadoColor = '#f59e0b';
                }
                
                return (
                  <tr key={producto.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{producto.nombre}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                      {producto.nombre_categoria || 'Sin categoría'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                      {unidad}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontWeight: '700',
                        backgroundColor: `${getStockColor(stock, stockMin)}15`,
                        color: getStockColor(stock, stockMin)
                      }}>
                        {stock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                      {stockMin || '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: `${estadoColor}15`,
                        color: estadoColor
                      }}>
                        {estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setProductoSeleccionado(producto);
                            setTipoAjuste('entrada');
                            setModalAjuste(true);
                          }}
                          title="Registrar entrada"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          <TrendingUp size={14} /> Entrada
                        </button>
                        <button
                          onClick={() => {
                            setProductoSeleccionado(producto);
                            setTipoAjuste('salida');
                            setModalAjuste(true);
                          }}
                          title="Registrar salida"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          <TrendingDown size={14} /> Salida
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const handleRecalcular = async () => {
    if (!window.confirm('¿Está seguro de recalcular el inventario? Esto ajustará el stock de todos los productos basándose en los movimientos registrados.')) {
      return;
    }
    setRecalculando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventario/recalcular', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        await cargarProductos();
        await cargarMovimientos();
      }
    } catch (err) {
      console.error('Error al recalcular:', err);
    } finally {
      setRecalculando(false);
    }
  };

  const renderMovimientos = () => {
    // Filtrar movimientos por búsqueda
    const movimientosFiltrados = movimientos.filter(mov => {
      if (!busquedaMovimientos) return true;
      const busquedaLower = busquedaMovimientos.toLowerCase();
      return (
        (mov.producto_nombre || '').toLowerCase().includes(busquedaLower) ||
        (mov.tipo_movimiento || '').toLowerCase().includes(busquedaLower) ||
        (mov.cliente_nombre || '').toLowerCase().includes(busquedaLower) ||
        (mov.nombre_evento || '').toLowerCase().includes(busquedaLower) ||
        (mov.motivo || '').toLowerCase().includes(busquedaLower) ||
        String(mov.evento_id || '').includes(busquedaLower)
      );
    });

    // Paginación
    const totalPaginas = Math.ceil(movimientosFiltrados.length / elementosPorPagina);
    const indexInicio = (paginaActual - 1) * elementosPorPagina;
    const indexFin = indexInicio + elementosPorPagina;
    const movimientosPaginados = movimientosFiltrados.slice(indexInicio, indexFin);

    return (
      <div>
        {/* Barra de búsqueda y botón recalcular */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Buscar por producto, cliente, evento, tipo..."
              value={busquedaMovimientos}
              onChange={(e) => {
                setBusquedaMovimientos(e.target.value);
                setPaginaActual(1);
              }}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <button
            onClick={handleRecalcular}
            disabled={recalculando}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: recalculando ? 'wait' : 'pointer',
              fontSize: '0.875rem',
              opacity: recalculando ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} className={recalculando ? 'animate-spin' : ''} />
            {recalculando ? 'Recalculando...' : 'Recalcular Inventario'}
          </button>
        </div>

        {/* Info de resultados */}
        {busquedaMovimientos && (
          <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
            {movimientosFiltrados.length} resultado(s) encontrado(s)
            {busquedaMovimientos && (
              <button
                onClick={() => { setBusquedaMovimientos(''); setPaginaActual(1); }}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Limpiar filtro
              </button>
            )}
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {movimientos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <History size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No hay movimientos registrados</p>
              <p style={{ fontSize: '0.875rem' }}>Los movimientos se registrarán automáticamente al:</p>
              <ul style={{ textAlign: 'left', maxWidth: '300px', margin: '1rem auto', fontSize: '0.875rem' }}>
                <li>Reservar productos para eventos</li>
                <li>Devolver productos de eventos</li>
                <li>Ajustar stock manualmente</li>
              </ul>
            </div>
          ) : movimientosFiltrados.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              <Search size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p>No se encontraron movimientos con "{busquedaMovimientos}"</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>Fecha</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>Producto</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.8rem' }}>Tipo</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.8rem' }}>Cant.</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.8rem' }}>Anterior</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.8rem' }}>Nuevo</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>Evento</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>Cliente</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosPaginados.map(mov => {
                    const tipoColor = {
                      entrada: '#10b981',
                      salida: '#ef4444',
                      ajuste: '#3b82f6',
                      reserva: '#f59e0b',
                      devolucion: '#8b5cf6'
                    }[mov.tipo_movimiento] || '#6b7280';
                    
                    const estadoEventoColor = {
                      completado: '#10b981',
                      confirmado: '#3b82f6',
                      en_proceso: '#f59e0b',
                      cancelado: '#ef4444'
                    }[mov.evento_estado] || '#6b7280';
                    
                    return (
                      <tr key={mov.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                          {mov.fecha_movimiento ? new Date(mov.fecha_movimiento).toLocaleString('es-CO') : '-'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{mov.producto_nombre || `ID: ${mov.producto_id}`}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            backgroundColor: `${tipoColor}15`,
                            color: tipoColor,
                            textTransform: 'capitalize'
                          }}>
                            {mov.tipo_movimiento}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem' }}>
                          {mov.tipo_movimiento === 'entrada' || mov.tipo_movimiento === 'devolucion' ? '+' : '-'}{mov.cantidad}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>{mov.stock_anterior}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem' }}>{mov.stock_nuevo}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                          {mov.evento_id ? (
                            <div>
                              <div style={{ fontWeight: '500' }}>#{mov.evento_id}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{mov.nombre_evento || ''}</div>
                              {mov.evento_estado && (
                                <span style={{
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  fontSize: '0.65rem',
                                  backgroundColor: `${estadoEventoColor}15`,
                                  color: estadoEventoColor,
                                  textTransform: 'capitalize'
                                }}>
                                  {mov.evento_estado}
                                </span>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#374151' }}>
                          {mov.cliente_nombre || '-'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#6b7280', maxWidth: '200px' }}>
                          {mov.motivo || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {movimientosFiltrados.length > elementosPorPagina && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Mostrando {indexInicio + 1} - {Math.min(indexFin, movimientosFiltrados.length)} de {movimientosFiltrados.length}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setPaginaActual(1)}
                disabled={paginaActual === 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: paginaActual === 1 ? '#f3f4f6' : 'white',
                  cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                  opacity: paginaActual === 1 ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                ««
              </button>
              <button
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: paginaActual === 1 ? '#f3f4f6' : 'white',
                  cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                  opacity: paginaActual === 1 ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                «
              </button>
              
              {/* Números de página */}
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let pageNum;
                if (totalPaginas <= 5) {
                  pageNum = i + 1;
                } else if (paginaActual <= 3) {
                  pageNum = i + 1;
                } else if (paginaActual >= totalPaginas - 2) {
                  pageNum = totalPaginas - 4 + i;
                } else {
                  pageNum = paginaActual - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPaginaActual(pageNum)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      backgroundColor: paginaActual === pageNum ? '#6366f1' : 'white',
                      color: paginaActual === pageNum ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontWeight: paginaActual === pageNum ? '600' : '400',
                      fontSize: '0.875rem'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: paginaActual === totalPaginas ? '#f3f4f6' : 'white',
                  cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                  opacity: paginaActual === totalPaginas ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                »
              </button>
              <button
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: paginaActual === totalPaginas ? '#f3f4f6' : 'white',
                  cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                  opacity: paginaActual === totalPaginas ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPorEvento = () => (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          Seleccionar Evento
        </label>
        <select
          value={filtroEvento}
          onChange={(e) => {
            setFiltroEvento(e.target.value);
            if (e.target.value) cargarInventarioEvento(e.target.value);
          }}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        >
          <option value="">Seleccione un evento</option>
          {eventos.map(evento => (
            <option key={evento.id_evento} value={evento.id_evento}>
              {evento.nombre_evento} - {evento.nombre_cliente} ({evento.estado})
            </option>
          ))}
        </select>
      </div>

      {filtroEvento && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {inventarioEvento.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No hay productos asignados a este evento</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Producto</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Cantidad</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Fecha Reserva</th>
                </tr>
              </thead>
              <tbody>
                {inventarioEvento.map(item => {
                  const estadoColor = {
                    disponible: '#10b981',
                    reservado: '#3b82f6',
                    en_uso: '#f59e0b',
                    devuelto: '#6b7280'
                  }[item.estado] || '#6b7280';
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>{item.nombre_producto}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>{item.cantidad_solicitada}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: `${estadoColor}15`,
                          color: estadoColor,
                          textTransform: 'capitalize'
                        }}>
                          {item.estado}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {item.fecha_reserva ? new Date(item.fecha_reserva).toLocaleDateString('es-CO') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );

  const renderAlertas = () => (
    <div>
      {productosConAlerta.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <AlertTriangle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#10b981' }} />
          <p style={{ fontWeight: '600', color: '#10b981' }}>Todo en orden</p>
          <p>No hay productos con stock bajo o agotado</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderBottom: '1px solid #fcd34d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
              <AlertTriangle size={20} />
              <span style={{ fontWeight: '600' }}>{productosConAlerta.length} producto(s) requieren atención</span>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Producto</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Stock Actual</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Stock Mínimo</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosConAlerta.map(producto => {
                const stock = parseInt(producto.stock || producto.stock_disponible || 0);
                const stockMin = parseInt(producto.stock_minimo || 0);
                const agotado = stock <= 0;
                
                return (
                  <tr key={producto.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{producto.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{producto.nombre_categoria}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontWeight: '700',
                        backgroundColor: agotado ? '#fee2e2' : '#fef3c7',
                        color: agotado ? '#ef4444' : '#f59e0b'
                      }}>
                        {stock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>{stockMin}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: agotado ? '#fee2e2' : '#fef3c7',
                        color: agotado ? '#ef4444' : '#f59e0b'
                      }}>
                        {agotado ? 'AGOTADO' : 'Stock Bajo'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setProductoSeleccionado(producto);
                          setTipoAjuste('entrada');
                          setModalAjuste(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          margin: '0 auto'
                        }}
                      >
                        <Plus size={14} /> Reponer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderModal = () => {
    if (!modalAjuste || !productoSeleccionado) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            {tipoAjuste === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Producto
            </label>
            <div style={{ fontWeight: '600' }}>{productoSeleccionado.nombre}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Stock actual: {productoSeleccionado.stock || productoSeleccionado.stock_disponible || 0} {productoSeleccionado.unidad_medida || 'unidades'}
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Cantidad ({productoSeleccionado.unidad_medida || 'unidades'})
            </label>
            <input
              type="number"
              min="1"
              value={cantidadAjuste}
              onChange={(e) => setCantidadAjuste(e.target.value)}
              placeholder={`Ingrese cantidad en ${productoSeleccionado.unidad_medida || 'unidades'}`}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={motivoAjuste}
              onChange={(e) => setMotivoAjuste(e.target.value)}
              placeholder="Ej: Compra, Ajuste de inventario..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setModalAjuste(false);
                setProductoSeleccionado(null);
                setCantidadAjuste('');
                setMotivoAjuste('');
              }}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAjusteStock}
              disabled={!cantidadAjuste || parseInt(cantidadAjuste) <= 0}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: tipoAjuste === 'entrada' ? '#10b981' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
                opacity: (!cantidadAjuste || parseInt(cantidadAjuste) <= 0) ? 0.5 : 1
              }}
            >
              {tipoAjuste === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && activeTab !== 'eventos') {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Inventario
        </h1>
        <p style={{ color: '#6b7280' }}>Control de stock, movimientos y alertas</p>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {renderTabs()}

      {activeTab === 'stock' && renderStockGeneral()}
      {activeTab === 'movimientos' && renderMovimientos()}
      {activeTab === 'eventos' && renderPorEvento()}
      {activeTab === 'alertas' && renderAlertas()}
      
      {renderModal()}
    </div>
  );
};

export default Inventario;
