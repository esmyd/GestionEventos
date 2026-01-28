import React, { useState, useEffect } from 'react';
import { cuentasService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { hasPermission, PERMISSIONS, ROLES } from '../utils/roles';
import { Plus, Search, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, Landmark, Wallet, Banknote, CreditCard } from 'lucide-react';

const TIPOS_CUENTA = [
  { valor: 'ahorros', etiqueta: 'Cuenta de Ahorros', icono: Landmark },
  { valor: 'corriente', etiqueta: 'Cuenta Corriente', icono: CreditCard },
  { valor: 'digital', etiqueta: 'Billetera Digital', icono: Wallet },
  { valor: 'efectivo', etiqueta: 'Cuenta en Efectivo', icono: Banknote },
  { valor: 'otro', etiqueta: 'Otro', icono: CreditCard },
];

const Cuentas = () => {
  const { usuario } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  // Estados para modales
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estados para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'ahorros',
    numero_cuenta: '',
    descripcion: '',
  });

  // Permisos
  const puedeCrear = hasPermission(usuario, PERMISSIONS.CUENTAS_CREAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEditar = hasPermission(usuario, PERMISSIONS.CUENTAS_EDITAR, [ROLES.ADMIN, ROLES.MANAGER]);
  const puedeEliminar = hasPermission(usuario, PERMISSIONS.CUENTAS_ELIMINAR, [ROLES.ADMIN, ROLES.MANAGER]);

  useEffect(() => {
    cargarCuentas();
  }, [mostrarInactivas]);

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const data = await cuentasService.getAll(mostrarInactivas);
      setCuentas(data.cuentas || []);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al cargar las cuentas';
      showError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const obtenerIconoTipo = (tipo) => {
    const tipoConfig = TIPOS_CUENTA.find((t) => t.valor === tipo);
    return tipoConfig?.icono || CreditCard;
  };

  const obtenerEtiquetaTipo = (tipo) => {
    const tipoConfig = TIPOS_CUENTA.find((t) => t.valor === tipo);
    return tipoConfig?.etiqueta || tipo;
  };

  const cuentasFiltradas = cuentas
    .filter((cuenta) => {
      if (!busqueda) return true;
      const texto = busqueda.toLowerCase();
      return (
        cuenta.nombre?.toLowerCase().includes(texto) ||
        cuenta.descripcion?.toLowerCase().includes(texto)
      );
    })
    .filter((cuenta) => (filtroTipo === 'todos' ? true : cuenta.tipo === filtroTipo));

  const abrirModalCrear = () => {
    setFormData({ nombre: '', tipo: 'ahorros', numero_cuenta: '', descripcion: '' });
    setCuentaSeleccionada(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (cuenta) => {
    setFormData({
      nombre: cuenta.nombre || '',
      tipo: cuenta.tipo || 'ahorros',
      numero_cuenta: cuenta.numero_cuenta || '',
      descripcion: cuenta.descripcion || '',
    });
    setCuentaSeleccionada(cuenta);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setCuentaSeleccionada(null);
    setFormData({ nombre: '', tipo: 'ahorros', numero_cuenta: '', descripcion: '' });
  };

  const guardarCuenta = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      showError('El nombre de la cuenta es requerido');
      return;
    }

    try {
      setGuardando(true);
      if (cuentaSeleccionada) {
        await cuentasService.update(cuentaSeleccionada.id, formData);
        success('Cuenta actualizada exitosamente');
      } else {
        await cuentasService.create(formData);
        success('Cuenta creada exitosamente');
      }
      await cargarCuentas();
      cerrarModal();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al guardar la cuenta';
      showError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setMostrarModalEliminar(true);
  };

  const eliminarCuenta = async () => {
    if (!cuentaSeleccionada) return;
    try {
      setGuardando(true);
      await cuentasService.delete(cuentaSeleccionada.id);
      success('Cuenta desactivada exitosamente');
      await cargarCuentas();
      setMostrarModalEliminar(false);
      setCuentaSeleccionada(null);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al desactivar la cuenta';
      showError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const activarCuenta = async (cuenta) => {
    try {
      await cuentasService.activar(cuenta.id);
      success('Cuenta activada exitosamente');
      await cargarCuentas();
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al activar la cuenta';
      showError(mensaje);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando cuentas...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cuentas</h1>
          <p style={{ color: '#6b7280' }}>Gestión de cuentas para confirmación de pagos</p>
        </div>
        {puedeCrear && (
          <button
            onClick={abrirModalCrear}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            <Plus size={20} />
            Nueva Cuenta
          </button>
        )}
      </div>

      {/* Filtros */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem',
            }}
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          style={{
            padding: '0.65rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.95rem',
            minWidth: '180px',
          }}
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS_CUENTA.map((tipo) => (
            <option key={tipo.valor} value={tipo.valor}>
              {tipo.etiqueta}
            </option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={mostrarInactivas}
            onChange={(e) => setMostrarInactivas(e.target.checked)}
          />
          <span style={{ fontSize: '0.9rem', color: '#374151' }}>Mostrar inactivas</span>
        </label>
      </div>

      {/* Estadísticas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Total Cuentas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{cuentasFiltradas.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Activas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {cuentasFiltradas.filter((c) => c.activo).length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Ahorros</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6366f1' }}>
            {cuentasFiltradas.filter((c) => c.tipo === 'ahorros').length}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Corrientes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0ea5e9' }}>
            {cuentasFiltradas.filter((c) => c.tipo === 'corriente').length}
          </div>
        </div>
      </div>

      {/* Lista de cuentas */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Cuenta</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Tipo</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Número de Cuenta</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Descripción</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No hay cuentas que mostrar
                  </td>
                </tr>
              ) : (
                cuentasFiltradas.map((cuenta) => {
                  const IconoTipo = obtenerIconoTipo(cuenta.tipo);
                  return (
                    <tr key={cuenta.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '0.5rem',
                              backgroundColor: cuenta.activo ? '#eef2ff' : '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconoTipo size={20} color={cuenta.activo ? '#4f46e5' : '#9ca3af'} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: cuenta.activo ? '#111827' : '#9ca3af' }}>
                              {cuenta.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor:
                              cuenta.tipo === 'ahorros'
                                ? '#dbeafe'
                                : cuenta.tipo === 'corriente'
                                ? '#e0f2fe'
                                : cuenta.tipo === 'digital'
                                ? '#f3e8ff'
                                : cuenta.tipo === 'efectivo'
                                ? '#dcfce7'
                                : '#f3f4f6',
                            color:
                              cuenta.tipo === 'ahorros'
                                ? '#1d4ed8'
                                : cuenta.tipo === 'corriente'
                                ? '#0369a1'
                                : cuenta.tipo === 'digital'
                                ? '#7c3aed'
                                : cuenta.tipo === 'efectivo'
                                ? '#16a34a'
                                : '#6b7280',
                          }}
                        >
                          {obtenerEtiquetaTipo(cuenta.tipo)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#374151', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {cuenta.numero_cuenta || '-'}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem', maxWidth: '300px' }}>
                        {cuenta.descripcion || '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: cuenta.activo ? '#dcfce7' : '#fee2e2',
                            color: cuenta.activo ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {cuenta.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {puedeEditar && (
                            <button
                              onClick={() => abrirModalEditar(cuenta)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {puedeEliminar && cuenta.activo && (
                            <button
                              onClick={() => confirmarEliminar(cuenta)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              title="Desactivar"
                            >
                              <ToggleRight size={16} />
                            </button>
                          )}
                          {puedeEliminar && !cuenta.activo && (
                            <button
                              onClick={() => activarCuenta(cuenta)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              title="Activar"
                            >
                              <ToggleLeft size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {mostrarModal && (
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
          onClick={cerrarModal}
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {cuentaSeleccionada ? 'Editar Cuenta' : 'Nueva Cuenta'}
              </h2>
              <button
                onClick={cerrarModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={guardarCuenta}>
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
                    placeholder="Ej: Bancolombia Ahorros"
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
                    Tipo <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  >
                    {TIPOS_CUENTA.map((tipo) => (
                      <option key={tipo.valor} value={tipo.valor}>
                        {tipo.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    value={formData.numero_cuenta}
                    onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                    placeholder="Ej: 2200012345"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
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
                    placeholder="Descripción opcional de la cuenta..."
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
                  onClick={cerrarModal}
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
                    backgroundColor: guardando ? '#9ca3af' : '#4f46e5',
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

      {/* Modal Confirmar Eliminar */}
      {mostrarModalEliminar && cuentaSeleccionada && (
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
          onClick={() => setMostrarModalEliminar(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Desactivar cuenta
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              ¿Estás seguro de desactivar la cuenta <strong>{cuentaSeleccionada.nombre}</strong>?
              Podrás reactivarla más tarde si lo necesitas.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMostrarModalEliminar(false)}
                disabled={guardando}
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
                onClick={eliminarCuenta}
                disabled={guardando}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                }}
              >
                {guardando ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cuentas;
