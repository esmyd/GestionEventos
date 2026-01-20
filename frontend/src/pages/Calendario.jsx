import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventosService, salonesService } from '../services/api';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES, hasRole } from '../utils/roles';

const Calendario = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esCoordinador = hasRole(usuario?.rol, [ROLES.COORDINATOR]);
  const esAdminOGerente = hasRole(usuario?.rol, [ROLES.ADMIN, ROLES.MANAGER]);
  const [eventos, setEventos] = useState([]);
  const [salones, setSalones] = useState([]);
  const [salonFiltro, setSalonFiltro] = useState('');
  const [filtroAsignacion, setFiltroAsignacion] = useState('todos');
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vista, setVista] = useState('mes'); // 'mes' o 'año'
  const [loading, setLoading] = useState(true);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  useEffect(() => {
    cargarDatos();
  }, [salonFiltro, fechaActual, esCoordinador, esAdminOGerente, filtroAsignacion, usuario?.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const filtrosEventos = { incluir_porcentaje_avance: true };
      if (esCoordinador && usuario?.id) {
        filtrosEventos.coordinador_id = usuario.id;
      } else if (esAdminOGerente && filtroAsignacion === 'mios' && usuario?.id) {
        filtrosEventos.coordinador_id = usuario.id;
      }
      const [eventosData, salonesData] = await Promise.all([
        eventosService.getAll(filtrosEventos),
        salonesService.getAll(true)
      ]);
      
      let eventosFiltrados = eventosData.eventos || [];
      
      // Filtrar por salón si está seleccionado
      if (salonFiltro) {
        const salonIdFiltro = parseInt(salonFiltro);
        const salonSeleccionado = salonesData.salones?.find(
          s => (s.id_salon || s.id) === salonIdFiltro
        );
        
        eventosFiltrados = eventosFiltrados.filter(e => {
          // Intentar obtener el id_salon del evento de múltiples formas
          let eventoSalonId = null;
          
          if (e.id_salon !== undefined && e.id_salon !== null && e.id_salon !== '') {
            eventoSalonId = parseInt(e.id_salon);
          } else if (e.salon_id !== undefined && e.salon_id !== null && e.salon_id !== '') {
            eventoSalonId = parseInt(e.salon_id);
          }
          
          // Si tenemos id_salon, comparar directamente
          if (eventoSalonId !== null && !isNaN(eventoSalonId)) {
            return eventoSalonId === salonIdFiltro;
          }
          
          // Si no tenemos id_salon pero tenemos nombre_salon, buscar por nombre
          if (salonSeleccionado && e.nombre_salon && e.nombre_salon === salonSeleccionado.nombre) {
            return true;
          }
          
          // También verificar el campo 'salon' (texto)
          if (salonSeleccionado && e.salon && e.salon.includes(salonSeleccionado.nombre)) {
            return true;
          }
          
          return false;
        });
      }

      // Filtrar eventos cancelados
      eventosFiltrados = eventosFiltrados.filter(e => e.estado !== 'cancelado');

      setEventos(eventosFiltrados);
      setSalones(salonesData.salones || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      cotizacion: '#6b7280', // Gris
      confirmado: '#10b981', // Verde
      en_proceso: '#3b82f6', // Azul
      completado: '#8b5cf6', // Morado
      cancelado: '#ef4444', // Rojo
    };
    return colores[estado] || '#6b7280';
  };

  const obtenerEventosDia = (fecha) => {
    const fechaStr = formatearFecha(fecha);
    return eventos.filter(e => e.fecha_evento === fechaStr);
  };

  const formatearFecha = (fecha) => {
    if (typeof fecha === 'string') return fecha;
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const obtenerDiasMes = () => {
    const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();

    const dias = [];
    
    // Días del mes anterior para completar la semana
    const mesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0);
    const diasMesAnterior = mesAnterior.getDate();
    for (let i = diaInicio - 1; i >= 0; i--) {
      dias.push(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, diasMesAnterior - i));
    }

    // Días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(fechaActual.getFullYear(), fechaActual.getMonth(), i));
    }

    // Días del mes siguiente para completar la semana
    const diasFaltantes = 42 - dias.length; // 6 semanas * 7 días = 42
    for (let i = 1; i <= diasFaltantes; i++) {
      dias.push(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, i));
    }

    return dias;
  };

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const cambiarAño = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setFullYear(nuevaFecha.getFullYear() + direccion);
    setFechaActual(nuevaFecha);
  };

  const irHoy = () => {
    setFechaActual(new Date());
  };

  const obtenerIntensidadColor = (eventosDia) => {
    if (eventosDia.length === 0) return { backgroundColor: 'transparent', color: '#374151' };
    if (eventosDia.length === 1) return { backgroundColor: `${obtenerColorEstado(eventosDia[0].estado)}20`, color: obtenerColorEstado(eventosDia[0].estado) };
    // Si hay múltiples eventos, usar un color que indique alta ocupación
    return { backgroundColor: '#f59e0b30', color: '#f59e0b', fontWeight: '600' };
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const esMesActual = (fecha) => {
    return fecha.getMonth() === fechaActual.getMonth() && 
           fecha.getFullYear() === fechaActual.getFullYear();
  };

  const renderVistaMes = () => {
    const dias = obtenerDiasMes();
    const eventosDiaMap = {};

    dias.forEach(dia => {
      const fechaStr = formatearFecha(dia);
      eventosDiaMap[fechaStr] = obtenerEventosDia(fechaStr);
    });

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
        {diasSemana.map(dia => (
          <div
            key={dia}
            style={{
              padding: '0.75rem',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#374151',
              backgroundColor: '#f9fafb',
            }}
          >
            {dia}
          </div>
        ))}
        {dias.map((dia, index) => {
          const fechaStr = formatearFecha(dia);
          const eventosDia = eventosDiaMap[fechaStr] || [];
          const estilo = obtenerIntensidadColor(eventosDia);
          const esDiaActual = esHoy(dia);
          const esDelMesActual = esMesActual(dia);

          return (
            <div
              key={index}
              onClick={() => {
                if (eventosDia.length > 0) {
                  setEventoSeleccionado({ fecha: dia, eventos: eventosDia });
                }
              }}
              style={{
                minHeight: '100px',
                padding: '0.5rem',
                border: esDiaActual ? '2px solid #6366f1' : '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                backgroundColor: esDelMesActual ? estilo.backgroundColor : '#f9fafb',
                color: esDelMesActual ? estilo.color : '#9ca3af',
                cursor: eventosDia.length > 0 ? 'pointer' : 'default',
                transition: 'all 0.2s',
                position: 'relative',
                opacity: esDelMesActual ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (eventosDia.length > 0) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontWeight: esDiaActual ? '700' : '500', marginBottom: '0.25rem' }}>
                {dia.getDate()}
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                {eventosDia.length > 0 && (
                  <>
                    <div style={{ fontWeight: '600', marginBottom: '0.125rem' }}>
                      {eventosDia.length} {eventosDia.length === 1 ? 'evento' : 'eventos'}
                    </div>
                    {eventosDia.slice(0, 2).map((evento, idx) => (
                      <div
                        key={evento.id_evento || evento.id || idx}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.125rem 0.25rem',
                          marginBottom: '0.125rem',
                          backgroundColor: obtenerColorEstado(evento.estado),
                          color: 'white',
                          borderRadius: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={`${evento.nombre_evento || 'Evento'} (${evento.estado})${evento.porcentaje_avance_servicios !== undefined && evento.porcentaje_avance_servicios !== null ? ` - Avance: ${evento.porcentaje_avance_servicios}%` : ''}`}
                      >
                        {evento.nombre_evento || 'Evento'} ({evento.estado})
                        {evento.porcentaje_avance_servicios !== undefined && evento.porcentaje_avance_servicios !== null && (
                          <span style={{ marginLeft: '0.25rem', fontSize: '0.65rem', opacity: 0.9 }}>
                            • {evento.porcentaje_avance_servicios}%
                          </span>
                        )}
                      </div>
                    ))}
                    {eventosDia.length > 2 && (
                      <div style={{ fontSize: '0.65rem', color: estilo.color, fontWeight: '600' }}>
                        +{eventosDia.length - 2} más
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVistaAno = () => {
    const mesesAno = [];
    for (let mes = 0; mes < 12; mes++) {
      mesesAno.push(mes);
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {mesesAno.map(mes => {
          const fechaMes = new Date(fechaActual.getFullYear(), mes, 1);
          const diasMes = obtenerDiasMesParaVistaAno(fechaMes);
          
          return (
            <div key={mes} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                {meses[mes]}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', fontSize: '0.75rem' }}>
                {diasSemana.map(dia => (
                  <div key={dia} style={{ textAlign: 'center', fontWeight: '600', color: '#6b7280', padding: '0.25rem' }}>
                    {dia[0]}
                  </div>
                ))}
                {diasMes.map((dia, idx) => {
                  const fechaStr = formatearFecha(dia);
                  const eventosDia = obtenerEventosDia(fechaStr);
                  const estilo = eventosDia.length > 0 
                    ? obtenerIntensidadColor(eventosDia)
                    : { backgroundColor: 'transparent', color: '#374151' };

                  return (
                    <div
                      key={idx}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.25rem',
                        backgroundColor: estilo.backgroundColor,
                        color: estilo.color,
                        fontSize: '0.7rem',
                        fontWeight: eventosDia.length > 0 ? '600' : '400',
                        cursor: eventosDia.length > 0 ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (eventosDia.length > 0) {
                          setFechaActual(new Date(fechaStr));
                          setVista('mes');
                          setEventoSeleccionado({ fecha: dia, eventos: eventosDia });
                        }
                      }}
                      title={eventosDia.length > 0 ? `${eventosDia.length} eventos` : ''}
                    >
                      {dia.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const obtenerDiasMesParaVistaAno = (fecha) => {
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();

    const dias = [];
    
    // Días del mes anterior
    const mesAnterior = new Date(fecha.getFullYear(), fecha.getMonth(), 0);
    const diasMesAnterior = mesAnterior.getDate();
    for (let i = diaInicio - 1; i >= 0; i--) {
      dias.push(new Date(fecha.getFullYear(), fecha.getMonth() - 1, diasMesAnterior - i));
    }

    // Días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(fecha.getFullYear(), fecha.getMonth(), i));
    }

    // Días del mes siguiente
    const diasFaltantes = 42 - dias.length;
    for (let i = 1; i <= diasFaltantes; i++) {
      dias.push(new Date(fecha.getFullYear(), fecha.getMonth() + 1, i));
    }

    return dias;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Cargando calendario...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Calendario de Eventos
        </h1>
        <p style={{ color: '#6b7280' }}>Visualiza todos los eventos agendados</p>
      </div>

      {/* Filtros y controles */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {esAdminOGerente && (
            <select
              value={filtroAsignacion}
              onChange={(e) => setFiltroAsignacion(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
            >
              <option value="todos">Todos los eventos</option>
              <option value="mios">Mis eventos</option>
            </select>
          )}
          <select
            value={salonFiltro}
            onChange={(e) => setSalonFiltro(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="">Todos los salones</option>
            {salones.map(salon => (
              <option key={salon.id_salon || salon.id} value={salon.id_salon || salon.id}>
                {salon.nombre}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setVista('mes')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: vista === 'mes' ? '#6366f1' : '#f3f4f6',
                color: vista === 'mes' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Vista Mensual
            </button>
            <button
              onClick={() => setVista('año')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: vista === 'año' ? '#6366f1' : '#f3f4f6',
                color: vista === 'año' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Vista Anual
            </button>
          </div>
        </div>

        {vista === 'mes' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => cambiarMes(-1)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div style={{ minWidth: '200px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
                {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </div>
            </div>
            <button
              onClick={() => cambiarMes(1)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={irHoy}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Hoy
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => cambiarAño(-1)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div style={{ minWidth: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
                {fechaActual.getFullYear()}
              </div>
            </div>
            <button
              onClick={() => cambiarAño(1)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={irHoy}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Hoy
            </button>
          </div>
        )}
      </div>

      {/* Leyenda de colores */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        fontSize: '0.875rem',
      }}>
        <div style={{ fontWeight: '600', color: '#374151' }}>Leyenda:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#6b728020', borderRadius: '0.25rem' }}></div>
          <span>Cotización</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#10b98120', borderRadius: '0.25rem' }}></div>
          <span>Confirmado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#3b82f620', borderRadius: '0.25rem' }}></div>
          <span>En Proceso</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#8b5cf620', borderRadius: '0.25rem' }}></div>
          <span>Completado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b30', borderRadius: '0.25rem' }}></div>
          <span>Múltiples Eventos</span>
        </div>
      </div>

      {/* Calendario */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {vista === 'mes' ? renderVistaMes() : renderVistaAno()}
      </div>

      {/* Modal de eventos del día */}
      {eventoSeleccionado && (
        <div
          style={{
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
          }}
          onClick={() => setEventoSeleccionado(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
                Eventos del {eventoSeleccionado.fecha.getDate()} de {meses[eventoSeleccionado.fecha.getMonth()]} {eventoSeleccionado.fecha.getFullYear()}
              </h2>
              <button
                onClick={() => setEventoSeleccionado(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {eventoSeleccionado.eventos.map(evento => (
                <div
                  key={evento.id_evento || evento.id}
                  onClick={() => {
                    navigate(`/eventos/${evento.id_evento || evento.id}`);
                    setEventoSeleccionado(null);
                  }}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: `${obtenerColorEstado(evento.estado)}10`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = obtenerColorEstado(evento.estado);
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                      {evento.nombre_evento || 'Evento sin nombre'}
                    </h3>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: obtenerColorEstado(evento.estado),
                        color: 'white',
                        textTransform: 'capitalize',
                      }}
                    >
                      {evento.estado}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {evento.nombre_cliente && (
                      <div>Cliente: {evento.nombre_cliente}</div>
                    )}
                    {evento.nombre_salon && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} />
                        {evento.nombre_salon}
                      </div>
                    )}
                    {evento.hora_inicio && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} />
                        {evento.hora_inicio} {evento.hora_fin ? `- ${evento.hora_fin}` : ''}
                      </div>
                    )}
                    {evento.numero_invitados && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={14} />
                        {evento.numero_invitados} invitados
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;
