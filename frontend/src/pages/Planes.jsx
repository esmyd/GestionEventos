import React, { useState, useEffect } from 'react';
import { planesService, productosService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Plus, Search, FileText, Eye, Edit, Trash2, X, Save, AlertCircle, Package, Minus } from 'lucide-react';
import { hasPermission, PERMISSIONS, ROLES } from '../utils/roles';

const Planes = () => {
  const { usuario } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [planes, setPlanes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
  const [ordenPlanes, setOrdenPlanes] = useState('fecha_desc');

  // Estados para modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [productosPlan, setProductosPlan] = useState([]);

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_base: '',
    capacidad_minima: '',
    capacidad_maxima: '',
    duracion_horas: '',
    incluye: '',
    activo: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  // Estados para agregar productos
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState('1');
  const [productoSeleccionadoForm, setProductoSeleccionadoForm] = useState('');
  const [cantidadProductoForm, setCantidadProductoForm] = useState('1');
  const [busquedaProductoForm, setBusquedaProductoForm] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productosSeleccionadosOriginal, setProductosSeleccionadosOriginal] = useState([]);
  const [cargandoProductosPlan, setCargandoProductosPlan] = useState(false);
  const [serviciosPlan, setServiciosPlan] = useState([]);
  const [serviciosPlanOriginal, setServiciosPlanOriginal] = useState([]);
  const [servicioNombreForm, setServicioNombreForm] = useState('');
  const [errorServicioForm, setErrorServicioForm] = useState('');

  // Verificar permisos
  const puedeCrear = hasPermission(usuario, PERMISSIONS.PLANES_CREAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEditar = hasPermission(usuario, PERMISSIONS.PLANES_EDITAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEliminar = hasPermission(usuario, PERMISSIONS.PLANES_ELIMINAR, [ROLES.ADMIN, ROLES.MANAGER]);

  useEffect(() => {
    cargarPlanes();
    cargarProductos();
  }, []);

  const cargarPlanes = async () => {
    try {
      setLoading(true);
      const data = await planesService.getAll(false);
      setPlanes(data.planes || []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar los planes';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const data = await productosService.getAll(true);
      setProductos(data.productos || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const cargarProductosPlan = async (planId) => {
    try {
      const data = await planesService.getProductos(planId);
      setProductosPlan(data.productos || []);
    } catch (err) {
      console.error('Error al cargar productos del plan:', err);
      setProductosPlan([]);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const obtenerProductoPorId = (productoId) => {
    return productos.find((producto) => producto.id === productoId);
  };

  const normalizarProductos = (lista) => {
    return (lista || []).map((item) => ({
      producto_id: Number(item.producto_id),
      cantidad: Number(item.cantidad),
    }));
  };

  const mapearProductosPlan = (lista) => {
    return (lista || []).map((item) => ({
      producto_id: Number(item.producto_id),
      nombre_producto: item.nombre_producto || item.nombre || 'N/A',
      cantidad: Number(item.cantidad) || 1,
      precio_unitario: Number(item.precio_unitario ?? item.precio ?? 0),
    }));
  };

  const totalProductosSeleccionados = productosSeleccionados.reduce((acc, item) => {
    const precio = Number(item.precio_unitario ?? item.precio ?? 0);
    const cantidad = Number(item.cantidad) || 0;
    return acc + precio * cantidad;
  }, 0);

  const precioPlanValor = Number.isFinite(parseFloat(formData.precio_base))
    ? parseFloat(formData.precio_base)
    : 0;
  const descuentoPlan = Math.max(0, totalProductosSeleccionados - precioPlanValor);

  const totalProductosDetalle = productosPlan.reduce((acc, item) => {
    const precio = Number(item.precio || 0);
    const cantidad = Number(item.cantidad) || 0;
    return acc + precio * cantidad;
  }, 0);
  const descuentoDetalle = Math.max(
    0,
    totalProductosDetalle - Number(planSeleccionado?.precio_base || 0)
  );

  const precioMinValor = filtroPrecioMin === '' ? null : parseFloat(filtroPrecioMin);
  const precioMaxValor = filtroPrecioMax === '' ? null : parseFloat(filtroPrecioMax);

  const planesFiltrados = planes
    .filter((plan) => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      plan.nombre?.toLowerCase().includes(busquedaLower) ||
      plan.descripcion?.toLowerCase().includes(busquedaLower)
    );
    })
    .filter((plan) => {
      if (filtroEstado === 'activos') return plan.activo !== false;
      if (filtroEstado === 'inactivos') return plan.activo === false;
      return true;
    })
    .filter((plan) => {
      if (precioMinValor === null && precioMaxValor === null) return true;
      const precio = Number(plan.precio_base || 0);
      if (precioMinValor !== null && precio < precioMinValor) return false;
      if (precioMaxValor !== null && precio > precioMaxValor) return false;
      return true;
    })
    .sort((a, b) => {
      const fechaA =
        a.fecha_creacion || a.created_at || a.fecha || a.fecha_creado || a.fechaCreacion || a.id;
      const fechaB =
        b.fecha_creacion || b.created_at || b.fecha || b.fecha_creado || b.fechaCreacion || b.id;

      switch (ordenPlanes) {
        case 'nombre_desc':
          return (b.nombre || '').localeCompare(a.nombre || '');
        case 'fecha_desc':
          return new Date(fechaB).getTime() - new Date(fechaA).getTime();
        case 'fecha_asc':
          return new Date(fechaA).getTime() - new Date(fechaB).getTime();
        case 'precio_asc':
          return Number(a.precio_base || 0) - Number(b.precio_base || 0);
        case 'precio_desc':
          return Number(b.precio_base || 0) - Number(a.precio_base || 0);
        case 'capacidad_desc':
          return Number(b.capacidad_maxima || 0) - Number(a.capacidad_maxima || 0);
        case 'duracion_desc':
          return Number(b.duracion_horas || 0) - Number(a.duracion_horas || 0);
        default:
          return (a.nombre || '').localeCompare(b.nombre || '');
      }
  });

  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio_base: '',
      capacidad_minima: '',
      capacidad_maxima: '',
      duracion_horas: '',
      incluye: '',
      activo: true,
    });
    setProductoSeleccionadoForm('');
    setCantidadProductoForm('1');
    setBusquedaProductoForm('');
    setProductosSeleccionados([]);
    setProductosSeleccionadosOriginal([]);
    setServiciosPlan([]);
    setServiciosPlanOriginal([]);
    setServicioNombreForm('');
    setErrorServicioForm('');
    setErrorFormulario('');
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({
      nombre: '',
      descripcion: '',
      precio_base: '',
      capacidad_minima: '',
      capacidad_maxima: '',
      duracion_horas: '',
      incluye: '',
      activo: true,
    });
    setProductoSeleccionadoForm('');
    setCantidadProductoForm('1');
    setBusquedaProductoForm('');
    setProductosSeleccionados([]);
    setProductosSeleccionadosOriginal([]);
    setServiciosPlan([]);
    setServiciosPlanOriginal([]);
    setServicioNombreForm('');
    setErrorServicioForm('');
    setErrorFormulario('');
  };

  const abrirModalEditar = async (plan) => {
    setPlanSeleccionado(plan);
    setFormData({
      nombre: plan.nombre || '',
      descripcion: plan.descripcion || '',
      precio_base: plan.precio_base || '',
      capacidad_minima: plan.capacidad_minima || '',
      capacidad_maxima: plan.capacidad_maxima || '',
      duracion_horas: plan.duracion_horas || '',
      incluye: plan.incluye || '',
      activo: plan.activo !== false,
    });
    setProductoSeleccionadoForm('');
    setCantidadProductoForm('1');
    setBusquedaProductoForm('');
    setCargandoProductosPlan(true);
    setMostrarModalEditar(true);
    try {
      const data = await planesService.getProductos(plan.id);
      const productosPlanActuales = mapearProductosPlan(data.productos || []);
      setProductosSeleccionados(productosPlanActuales);
      setProductosSeleccionadosOriginal(productosPlanActuales);
      const serviciosData = await planesService.getServicios(plan.id);
      const serviciosActuales = (serviciosData.servicios || []).map((servicio) => ({
        id: servicio.id,
        nombre: servicio.nombre,
        orden: servicio.orden,
      }));
      setServiciosPlan(serviciosActuales);
      setServiciosPlanOriginal(serviciosActuales);
    } catch (err) {
      console.error('Error al cargar productos del plan:', err);
      setProductosSeleccionados([]);
      setProductosSeleccionadosOriginal([]);
      setServiciosPlan([]);
      setServiciosPlanOriginal([]);
    } finally {
      setCargandoProductosPlan(false);
    }
    setErrorFormulario('');
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setPlanSeleccionado(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio_base: '',
      capacidad_minima: '',
      capacidad_maxima: '',
      duracion_horas: '',
      incluye: '',
      activo: true,
    });
    setProductoSeleccionadoForm('');
    setCantidadProductoForm('1');
    setBusquedaProductoForm('');
    setProductosSeleccionados([]);
    setProductosSeleccionadosOriginal([]);
    setServiciosPlan([]);
    setServiciosPlanOriginal([]);
    setServicioNombreForm('');
    setErrorServicioForm('');
    setErrorFormulario('');
  };

  const abrirModalDetalle = async (plan) => {
    setPlanSeleccionado(plan);
    await cargarProductosPlan(plan.id);
    try {
      const serviciosData = await planesService.getServicios(plan.id);
      setServiciosPlan(serviciosData.servicios || []);
    } catch (err) {
      console.error('Error al cargar servicios del plan:', err);
      setServiciosPlan([]);
    }
    setMostrarModalDetalle(true);
  };

  const cerrarModalDetalle = () => {
    setMostrarModalDetalle(false);
    setPlanSeleccionado(null);
    setProductosPlan([]);
    setServiciosPlan([]);
  };

  const abrirModalEliminar = (plan) => {
    setPlanSeleccionado(plan);
    setMostrarModalEliminar(true);
  };

  const cerrarModalEliminar = () => {
    setMostrarModalEliminar(false);
    setPlanSeleccionado(null);
  };

  const abrirModalProductos = async (plan) => {
    setPlanSeleccionado(plan);
    await cargarProductosPlan(plan.id);
    setProductoSeleccionado('');
    setCantidadProducto('1');
    setMostrarModalProductos(true);
  };

  const cerrarModalProductos = () => {
    setMostrarModalProductos(false);
    setPlanSeleccionado(null);
    setProductosPlan([]);
    setProductoSeleccionado('');
    setCantidadProducto('1');
  };

  const handleAgregarProductoForm = () => {
    if (!productoSeleccionadoForm || !cantidadProductoForm || parseInt(cantidadProductoForm) <= 0) {
      showError('Seleccione un producto y una cantidad válida');
      return;
    }
    const productoId = parseInt(productoSeleccionadoForm);
    const cantidad = parseInt(cantidadProductoForm);
    const producto = obtenerProductoPorId(productoId);
    if (!producto) {
      showError('Producto no encontrado');
      return;
    }
    const yaExiste = productosSeleccionados.some((item) => item.producto_id === productoId);
    if (yaExiste) {
      showError('Este producto ya está agregado al plan');
      return;
    }

    setProductosSeleccionados((prev) => {
      return [
        ...prev,
        {
          producto_id: productoId,
          nombre_producto: producto.nombre || 'N/A',
          cantidad,
          precio_unitario: Number(producto.precio || 0),
        },
      ];
    });
    setProductoSeleccionadoForm('');
    setCantidadProductoForm('1');
  };

  const handleEliminarProductoForm = (productoId) => {
    setProductosSeleccionados((prev) => prev.filter((item) => item.producto_id !== productoId));
  };

  const handleActualizarCantidadProductoForm = (productoId, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return;
    }
    setProductosSeleccionados((prev) =>
      prev.map((item) => (item.producto_id === productoId ? { ...item, cantidad } : item))
    );
  };

  const handleAgregarServicioForm = () => {
    const nombre = servicioNombreForm.trim();
    if (!nombre) {
      setErrorServicioForm('Ingresa un servicio válido.');
      return;
    }
    const existe = serviciosPlan.some(
      (servicio) => servicio.nombre?.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      setErrorServicioForm('Este servicio ya está agregado.');
      return;
    }
    setServiciosPlan((prev) => [...prev, { nombre, orden: prev.length + 1 }]);
    setServicioNombreForm('');
    setErrorServicioForm('');
  };

  const handleEliminarServicioForm = (index) => {
    setServiciosPlan((prev) => prev.filter((_, i) => i !== index));
  };

  const sincronizarProductosPlan = async (planId, nuevosProductos, productosOriginales = []) => {
    const originalesMap = new Map(normalizarProductos(productosOriginales).map((item) => [item.producto_id, item]));
    const nuevosMap = new Map(normalizarProductos(nuevosProductos).map((item) => [item.producto_id, item]));

    const productosParaEliminar = [];
    const productosParaAgregar = [];

    originalesMap.forEach((itemOriginal) => {
      const itemNuevo = nuevosMap.get(itemOriginal.producto_id);
      if (!itemNuevo) {
        productosParaEliminar.push(itemOriginal.producto_id);
        return;
      }
      if (itemNuevo.cantidad !== itemOriginal.cantidad) {
        productosParaEliminar.push(itemOriginal.producto_id);
        productosParaAgregar.push(itemNuevo);
      }
    });

    nuevosMap.forEach((itemNuevo) => {
      if (!originalesMap.has(itemNuevo.producto_id)) {
        productosParaAgregar.push(itemNuevo);
      }
    });

    for (const productoId of productosParaEliminar) {
      await planesService.eliminarProducto(planId, productoId);
    }
    for (const item of productosParaAgregar) {
      await planesService.agregarProducto(planId, item.producto_id, item.cantidad);
    }
  };

  const sincronizarServiciosPlan = async (planId, servicios) => {
    const serviciosOrdenados = (servicios || []).map((servicio, index) => ({
      nombre: servicio.nombre,
      orden: index + 1,
    }));
    await planesService.actualizarServicios(planId, serviciosOrdenados);
  };

  const handleCrearPlan = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre || !formData.precio_base) {
      setErrorFormulario('El nombre y el precio base son requeridos');
      return;
    }

    try {
      setGuardando(true);
      const planData = {
        ...formData,
        precio_base: parseFloat(formData.precio_base),
        capacidad_minima: formData.capacidad_minima ? parseInt(formData.capacidad_minima) : null,
        capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : null,
        duracion_horas: formData.duracion_horas ? parseFloat(formData.duracion_horas) : null,
        activo: formData.activo,
      };
      const response = await planesService.create(planData);
      const planId = response?.plan?.id;
      if (planId && productosSeleccionados.length > 0) {
        try {
          await sincronizarProductosPlan(planId, productosSeleccionados, []);
        } catch (err) {
          console.error('Error al agregar productos al plan:', err);
          showError('Plan creado, pero ocurrió un error al agregar productos');
        }
      }
      if (planId) {
        try {
          await sincronizarServiciosPlan(planId, serviciosPlan);
        } catch (err) {
          console.error('Error al agregar servicios al plan:', err);
          showError('Plan creado, pero ocurrió un error al agregar servicios');
        }
      }
      await cargarPlanes();
      cerrarModalCrear();
      success('Plan creado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear el plan';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditarPlan = async (e) => {
    e.preventDefault();
    setErrorFormulario('');

    if (!formData.nombre || !formData.precio_base) {
      setErrorFormulario('El nombre y el precio base son requeridos');
      return;
    }

    try {
      setGuardando(true);
      const planData = {
        ...formData,
        precio_base: parseFloat(formData.precio_base),
        capacidad_minima: formData.capacidad_minima ? parseInt(formData.capacidad_minima) : null,
        capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : null,
        duracion_horas: formData.duracion_horas ? parseFloat(formData.duracion_horas) : null,
        activo: formData.activo,
      };
      await planesService.update(planSeleccionado.id, planData);
      await sincronizarProductosPlan(planSeleccionado.id, productosSeleccionados, productosSeleccionadosOriginal);
      await sincronizarServiciosPlan(planSeleccionado.id, serviciosPlan);
      await cargarPlanes();
      setProductosSeleccionadosOriginal(productosSeleccionados);
      setServiciosPlanOriginal(serviciosPlan);
      cerrarModalEditar();
      success('Plan actualizado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al actualizar el plan';
      setErrorFormulario(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarPlan = async () => {
    try {
      setGuardando(true);
      await planesService.delete(planSeleccionado.id);
      await cargarPlanes();
      cerrarModalEliminar();
      success('Plan eliminado exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al eliminar el plan';
      showError(errorMessage);
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarProducto = async () => {
    if (!productoSeleccionado || !cantidadProducto || parseInt(cantidadProducto) <= 0) {
      showError('Seleccione un producto y una cantidad válida');
      return;
    }

    try {
      await planesService.agregarProducto(planSeleccionado.id, parseInt(productoSeleccionado), parseInt(cantidadProducto));
      await cargarProductosPlan(planSeleccionado.id);
      setProductoSeleccionado('');
      setCantidadProducto('1');
      success('Producto agregado al plan exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al agregar el producto';
      showError(errorMessage);
      console.error(err);
    }
  };

  const handleEliminarProducto = async (productoId) => {
    try {
      await planesService.eliminarProducto(planSeleccionado.id, productoId);
      await cargarProductosPlan(planSeleccionado.id);
      success('Producto eliminado del plan exitosamente');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al eliminar el producto';
      showError(errorMessage);
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando planes...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Planes</h1>
          <p style={{ color: '#6b7280' }}>Gestión de planes de eventos</p>
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
            Nuevo Plan
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

      {/* Búsqueda y filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
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
          placeholder="Buscar planes..."
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
          <div>
            <select
              value={ordenPlanes}
              onChange={(e) => setOrdenPlanes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
            >
              <option value="fecha_desc">Ordenar: Fecha creación (Más recientes)</option>
              <option value="fecha_asc">Ordenar: Fecha creación (Más antiguos)</option>
              <option value="nombre_asc">Ordenar: Nombre (A-Z)</option>
              <option value="nombre_desc">Ordenar: Nombre (Z-A)</option>
              <option value="precio_asc">Ordenar: Precio (Menor a mayor)</option>
              <option value="precio_desc">Ordenar: Precio (Mayor a menor)</option>
              <option value="capacidad_desc">Ordenar: Capacidad (Mayor a menor)</option>
              <option value="duracion_desc">Ordenar: Duración (Mayor a menor)</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Precio mínimo</label>
            <input
              type="number"
              min="0"
              value={filtroPrecioMin}
              onChange={(e) => setFiltroPrecioMin(e.target.value)}
              placeholder="0"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Precio máximo</label>
            <input
              type="number"
              min="0"
              value={filtroPrecioMax}
              onChange={(e) => setFiltroPrecioMax(e.target.value)}
              placeholder="Sin tope"
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
      </div>

      {/* Grid de planes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {planesFiltrados.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            {busqueda ? 'No se encontraron planes con ese criterio' : 'No hay planes disponibles'}
          </div>
        ) : (
          planesFiltrados.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
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
                  <FileText size={24} color="#6366f1" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem', margin: 0 }}>
                    {plan.nombre}
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1', margin: 0 }}>
                    {formatearMoneda(plan.precio_base || 0)}
                  </p>
                </div>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {plan.descripcion || 'Sin descripción'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {plan.capacidad_minima && (
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    Min: {plan.capacidad_minima} personas
                  </span>
                )}
                {plan.capacidad_maxima && (
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    Max: {plan.capacidad_maxima} personas
                  </span>
                )}
                {plan.duracion_horas && (
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    {plan.duracion_horas} horas
                  </span>
                )}
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: plan.activo !== false ? '#10b98120' : '#ef444420',
                    color: plan.activo !== false ? '#10b981' : '#ef4444',
                  }}
                >
                  {plan.activo !== false ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => abrirModalDetalle(plan)}
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
                  Ver Detalle
                </button>
                {puedeEditar && (
                  <button
                    onClick={() => abrirModalEditar(plan)}
                    style={{
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
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {puedeEliminar && (
                  <button
                    onClick={() => abrirModalEliminar(plan)}
                    style={{
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
            </div>
          ))
        )}
      </div>

      {/* Modal Crear Plan */}
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Nuevo Plan</h2>
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

            <form onSubmit={handleCrearPlan}>
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
                      Precio del Plan <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_base}
                      onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
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
                      Total Productos
                    </label>
                    <input
                      type="text"
                      value={formatearMoneda(totalProductosSeleccionados)}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        backgroundColor: '#f9fafb',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Descuento (Oferta)
                    </label>
                    <input
                      type="text"
                      value={formatearMoneda(descuentoPlan)}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        backgroundColor: '#f9fafb',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Capacidad Mínima
                    </label>
                    <input
                      type="number"
                      value={formData.capacidad_minima}
                      onChange={(e) => setFormData({ ...formData, capacidad_minima: e.target.value })}
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
                      Capacidad Máxima
                    </label>
                    <input
                      type="number"
                      value={formData.capacidad_maxima}
                      onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
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

                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Productos del Plan</h3>
                  {cargandoProductosPlan && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Cargando productos...</p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Producto
                  </label>
                      <input
                        type="text"
                        value={busquedaProductoForm}
                        onChange={(e) => setBusquedaProductoForm(e.target.value)}
                        placeholder="Buscar producto..."
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <select
                        value={productoSeleccionadoForm}
                        onChange={(e) => setProductoSeleccionadoForm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                        }}
                      >
                        <option value="">Seleccione un producto</option>
                        {productos
                          .filter((p) => !productosSeleccionados.some((pp) => pp.producto_id === p.id))
                          .filter((p) => p.nombre?.toLowerCase().includes(busquedaProductoForm.toLowerCase()))
                          .map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.nombre} - {formatearMoneda(prod.precio || 0)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cantidadProductoForm}
                        onChange={(e) => setCantidadProductoForm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAgregarProductoForm}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Plus size={18} />
                      Agregar
                    </button>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    {productosSeleccionados.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                        No hay productos asignados a este plan
                      </p>
                    ) : (
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                                Producto
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                Cantidad
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                                Precio Unit.
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                                Subtotal
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                Acción
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {productosSeleccionados.map((prod) => (
                              <tr key={prod.producto_id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem' }}>{prod.nombre_producto || 'N/A'}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    min="1"
                                    value={prod.cantidad}
                                    onChange={(e) => handleActualizarCantidadProductoForm(prod.producto_id, e.target.value)}
                                    style={{
                                      width: '5rem',
                                      padding: '0.4rem',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '0.375rem',
                                      fontSize: '0.875rem',
                                      textAlign: 'center',
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                  {formatearMoneda(prod.precio_unitario || 0)}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                                  {formatearMoneda((prod.precio_unitario || 0) * (prod.cantidad || 1))}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarProductoForm(prod.producto_id)}
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
                                    }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Servicios del Plan</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Servicio
                      </label>
                      <input
                        type="text"
                        value={servicioNombreForm}
                        onChange={(e) => setServicioNombreForm(e.target.value)}
                        placeholder="Ej: Confirmación de proteínas"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAgregarServicioForm}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Plus size={18} />
                      Agregar
                    </button>
                  </div>
                  {errorServicioForm && (
                    <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
                      {errorServicioForm}
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    {serviciosPlan.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                        No hay servicios asignados a este plan
                      </p>
                    ) : (
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                                Servicio
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                Acción
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviciosPlan.map((servicio, index) => (
                              <tr key={`${servicio.nombre}-${index}`} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem' }}>{servicio.nombre}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarServicioForm(index)}
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
                                    }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Servicios del Plan</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Servicio
                      </label>
                      <input
                        type="text"
                        value={servicioNombreForm}
                        onChange={(e) => setServicioNombreForm(e.target.value)}
                        placeholder="Ej: Confirmación de proteínas"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAgregarServicioForm}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Plus size={18} />
                      Agregar
                    </button>
                  </div>
                  {errorServicioForm && (
                    <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
                      {errorServicioForm}
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    {serviciosPlan.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                        No hay servicios asignados a este plan
                      </p>
                    ) : (
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                                Servicio
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                Acción
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviciosPlan.map((servicio, index) => (
                              <tr key={`${servicio.nombre}-${index}`} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem' }}>{servicio.nombre}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarServicioForm(index)}
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
                                    }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Plan activo</label>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Consideraciones
                  </label>
                  <textarea
                    value={formData.incluye}
                    onChange={(e) => setFormData({ ...formData, incluye: e.target.value })}
                    rows={3}
                    placeholder="Notas, restricciones o consideraciones del plan..."
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

      {/* Modal Editar Plan - Similar estructura al crear */}
      {mostrarModalEditar && planSeleccionado && (
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Editar Plan</h2>
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

            <form onSubmit={handleEditarPlan}>
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
                      Precio del Plan <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_base}
                      onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
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
                      Total Productos
                    </label>
                    <input
                      type="text"
                      value={formatearMoneda(totalProductosSeleccionados)}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        backgroundColor: '#f9fafb',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Descuento (Oferta)
                    </label>
                    <input
                      type="text"
                      value={formatearMoneda(descuentoPlan)}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        backgroundColor: '#f9fafb',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Capacidad Mínima
                    </label>
                    <input
                      type="number"
                      value={formData.capacidad_minima}
                      onChange={(e) => setFormData({ ...formData, capacidad_minima: e.target.value })}
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
                      Capacidad Máxima
                    </label>
                    <input
                      type="number"
                      value={formData.capacidad_maxima}
                      onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
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

                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Productos del Plan</h3>
                  {cargandoProductosPlan && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Cargando productos...</p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Producto
                  </label>
                      <input
                        type="text"
                        value={busquedaProductoForm}
                        onChange={(e) => setBusquedaProductoForm(e.target.value)}
                        placeholder="Buscar producto..."
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <select
                        value={productoSeleccionadoForm}
                        onChange={(e) => setProductoSeleccionadoForm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                        }}
                      >
                        <option value="">Seleccione un producto</option>
                        {productos
                          .filter((p) => !productosSeleccionados.some((pp) => pp.producto_id === p.id))
                          .filter((p) => p.nombre?.toLowerCase().includes(busquedaProductoForm.toLowerCase()))
                          .map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.nombre} - {formatearMoneda(prod.precio || 0)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cantidadProductoForm}
                        onChange={(e) => setCantidadProductoForm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAgregarProductoForm}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Plus size={18} />
                      Agregar
                    </button>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    {productosSeleccionados.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                        No hay productos asignados a este plan
                      </p>
                    ) : (
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                                Producto
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                Cantidad
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                                Precio Unit.
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                                Subtotal
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                Acción
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {productosSeleccionados.map((prod) => (
                              <tr key={prod.producto_id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem' }}>{prod.nombre_producto || 'N/A'}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    min="1"
                                    value={prod.cantidad}
                                    onChange={(e) => handleActualizarCantidadProductoForm(prod.producto_id, e.target.value)}
                                    style={{
                                      width: '5rem',
                                      padding: '0.4rem',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '0.375rem',
                                      fontSize: '0.875rem',
                                      textAlign: 'center',
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                  {formatearMoneda(prod.precio_unitario || 0)}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                                  {formatearMoneda((prod.precio_unitario || 0) * (prod.cantidad || 1))}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarProductoForm(prod.producto_id)}
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
                                    }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Servicios del Plan</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Servicio
                      </label>
                      <input
                        type="text"
                        value={servicioNombreForm}
                        onChange={(e) => setServicioNombreForm(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAgregarServicioForm();
                          }
                        }}
                        placeholder="Ej: Confirmación de proteínas"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAgregarServicioForm}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Plus size={18} />
                      Agregar
                    </button>
                  </div>
                  {errorServicioForm && (
                    <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
                      {errorServicioForm}
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    {serviciosPlan.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                        No hay servicios asignados a este plan
                      </p>
                    ) : (
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', width: '3rem' }}>
                                Orden
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                                Servicio
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                Acción
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviciosPlan.map((servicio, index) => (
                              <tr key={`${servicio.nombre}-${index}`} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280' }}>
                                  {index + 1}
                                </td>
                                <td style={{ padding: '0.75rem' }}>{servicio.nombre}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarServicioForm(index)}
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
                                    }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label style={{ fontWeight: '500', cursor: 'pointer' }}>Plan activo</label>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Consideraciones
                  </label>
                  <textarea
                    value={formData.incluye}
                    onChange={(e) => setFormData({ ...formData, incluye: e.target.value })}
                    rows={3}
                    placeholder="Notas, restricciones o consideraciones del plan..."
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

      {/* Modal Detalle Plan */}
      {mostrarModalDetalle && planSeleccionado && (
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Detalle del Plan</h2>
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
                  <FileText size={32} color="#6366f1" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                    {planSeleccionado.nombre || 'N/A'}
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1', margin: '0.25rem 0 0 0' }}>
                    {formatearMoneda(planSeleccionado.precio_base || 0)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Descripción
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {planSeleccionado.descripcion || 'Sin descripción'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {planSeleccionado.capacidad_minima && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Capacidad Mínima
                      </label>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                        {planSeleccionado.capacidad_minima} personas
                      </p>
                    </div>
                  )}

                  {planSeleccionado.capacidad_maxima && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Capacidad Máxima
                      </label>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                        {planSeleccionado.capacidad_maxima} personas
                      </p>
                    </div>
                  )}
                </div>

                {planSeleccionado.duracion_horas && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Duración
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {planSeleccionado.duracion_horas} horas
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Total Productos
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {formatearMoneda(totalProductosDetalle)}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Descuento (Oferta)
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {formatearMoneda(descuentoDetalle)}
                    </p>
                  </div>
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
                      backgroundColor: planSeleccionado.activo !== false ? '#10b98120' : '#ef444420',
                      color: planSeleccionado.activo !== false ? '#10b981' : '#ef4444',
                    }}
                  >
                    {planSeleccionado.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Productos del plan */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                      Productos Incluidos
                    </label>
                    {puedeEditar && (
                      <button
                        onClick={() => {
                          cerrarModalDetalle();
                          abrirModalProductos(planSeleccionado);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#6366f1',
                          color: 'white',
                          borderRadius: '0.375rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Plus size={16} />
                        Gestionar Productos
                      </button>
                    )}
                  </div>
                  {productosPlan.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                      No hay productos asignados a este plan
                    </p>
                  ) : (
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.375rem', padding: '1rem' }}>
                      {productosPlan.map((prod) => (
                        <div
                          key={prod.producto_id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          <div>
                            <p style={{ margin: 0, fontWeight: '500' }}>{prod.nombre_producto || 'N/A'}</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                              Cantidad: {prod.cantidad}
                            </p>
                          </div>
                          <p style={{ margin: 0, fontWeight: '500', color: '#6366f1' }}>
                            {formatearMoneda(prod.precio || 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Servicios del plan */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Servicios del Plan
                  </label>
                  {serviciosPlan.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                      No hay servicios asignados a este plan
                    </p>
                  ) : (
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.375rem', padding: '1rem' }}>
                      {serviciosPlan.map((servicio, index) => (
                        <div
                          key={`${servicio.nombre}-${index}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: '500' }}>{servicio.nombre}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {planSeleccionado.incluye && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Consideraciones
                    </label>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                      {planSeleccionado.incluye}
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

      {/* Modal Eliminar Plan */}
      {mostrarModalEliminar && planSeleccionado && (
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Eliminar Plan</h2>
                <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  ¿Está seguro de eliminar este plan?
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>{planSeleccionado.nombre}</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                {formatearMoneda(planSeleccionado.precio_base || 0)}
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
                onClick={handleEliminarPlan}
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

      {/* Modal Gestionar Productos del Plan */}
      {mostrarModalProductos && planSeleccionado && (
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
          onClick={cerrarModalProductos}
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Gestionar Productos del Plan</h2>
              <button
                onClick={cerrarModalProductos}
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

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>Plan: {planSeleccionado.nombre}</p>
            </div>

            {/* Agregar producto */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Agregar Producto</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Producto
                  </label>
                  <select
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="">Seleccione un producto</option>
                    {productos
                      .filter((p) => !productosPlan.some((pp) => pp.producto_id === p.id))
                      .map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.nombre} - {formatearMoneda(prod.precio || 0)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadProducto}
                    onChange={(e) => setCantidadProducto(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>
                <button
                  onClick={handleAgregarProducto}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Plus size={18} />
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de productos */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Productos Incluidos</h3>
              {productosPlan.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No hay productos asignados a este plan
                </p>
              ) : (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                          Producto
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                          Cantidad
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                          Precio Unit.
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>
                          Subtotal
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosPlan.map((prod) => (
                        <tr key={prod.producto_id} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem' }}>{prod.nombre_producto || 'N/A'}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>{prod.cantidad}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            {formatearMoneda(prod.precio || 0)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                            {formatearMoneda((prod.precio || 0) * (prod.cantidad || 1))}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleEliminarProducto(prod.producto_id)}
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
                              }}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cerrarModalProductos}
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
    </div>
  );
};

export default Planes;
