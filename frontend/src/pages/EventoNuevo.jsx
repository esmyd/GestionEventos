import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventosService, clientesService, planesService, salonesService, productosService, tiposEventoService } from '../services/api';
import { ArrowLeft, Save, Calendar, User, MapPin, Users, Clock, RefreshCw, Plus, Trash2, X } from 'lucide-react';
import { hasRole, ROLES } from '../utils/roles';

const EventoNuevo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [salones, setSalones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [productosAdicionales, setProductosAdicionales] = useState([]);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [precioPlan, setPrecioPlan] = useState(0);
  const [capacidadMinimaPlan, setCapacidadMinimaPlan] = useState(null);
  const [capacidadMaximaPlan, setCapacidadMaximaPlan] = useState(null);
  const [duracionMaximaPlan, setDuracionMaximaPlan] = useState(null);
  const [capacidadSalon, setCapacidadSalon] = useState(null);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [cargandoFechasOcupadas, setCargandoFechasOcupadas] = useState(false);
  const [formProducto, setFormProducto] = useState({
    producto_id: '',
    cantidad: '1',
  });

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    cliente_id: '',
    plan_id: '',
    id_salon: '',
    nombre_evento: '',
    tipo_evento: '',
    fecha_evento: getTodayDate(), // Precargar con fecha de hoy
    hora_inicio: '20:00',
    hora_fin: '02:00',
    numero_invitados: '50',
    estado: 'cotizacion',
    total: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargandoDatos(true);
      setError('');
      
      // Verificar token antes de hacer peticiones
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      // Cargar datos de forma independiente para que si uno falla, los otros puedan cargarse
      const resultados = await Promise.allSettled([
        clientesService.getAll().then(data => ({ tipo: 'clientes', data })),
        planesService.getAll(true).then(data => ({ tipo: 'planes', data })),
        salonesService.getAll(true).then(data => ({ tipo: 'salones', data })),
        productosService.getAll(true).then(data => ({ tipo: 'productos', data })),
        tiposEventoService.getAll(true).then(data => ({ tipo: 'tipos_evento', data })),
      ]);

      // Procesar resultados
      let errores = [];
      resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
          const { tipo, data } = resultado.value;
          if (tipo === 'clientes') {
            setClientes(data.clientes || []);
          } else if (tipo === 'planes') {
            setPlanes(data.planes || []);
          } else if (tipo === 'salones') {
            setSalones(data.salones || []);
          } else if (tipo === 'productos') {
            setProductos(data.productos || []);
          } else if (tipo === 'tipos_evento') {
            setTiposEvento(data.tipos_evento || []);
          }
        } else {
          const error = resultado.reason;
          console.error(`Error al cargar ${['clientes', 'planes', 'salones', 'productos', 'tipos_evento'][index]}:`, error);
          
          if (error.response?.status === 401) {
            errores.push('Sesión expirada');
          } else {
            errores.push(`Error al cargar ${['clientes', 'planes', 'salones', 'productos', 'tipos_evento'][index]}`);
          }
        }
      });

      // Si hay errores de autenticación, manejar de forma especial
      if (errores.some(e => e === 'Sesión expirada')) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }, 3000);
      } else if (errores.length > 0) {
        // Si hay errores pero no son de autenticación, mostrar advertencia pero permitir continuar
        const mensaje = errores.length === 5 
          ? 'Error al cargar los datos. Por favor, verifica tu conexión y recarga la página.'
          : `Algunos datos no se pudieron cargar: ${errores.join(', ')}. Puedes continuar creando el evento.`;
        setError(mensaje);
      }
    } catch (err) {
      console.error('Error inesperado al cargar datos:', err);
      if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }, 3000);
      } else {
        setError('Error al cargar los datos necesarios. Por favor, recarga la página.');
      }
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Si cambia el tipo de evento, precargar en nombre del evento
    if (name === 'tipo_evento') {
      setFormData((prev) => {
        const nombreActual = prev.nombre_evento || '';
        const tipoAnterior = prev.tipo_evento || '';
        
        // Si el nombre está vacío, precargar con el nuevo tipo
        if (!nombreActual) {
          return {
            ...prev,
            nombre_evento: value ? `${value} - ` : '',
          };
        }
        
        // Si el nombre empieza con el tipo anterior seguido de " - ", actualizar con el nuevo tipo
        if (tipoAnterior && nombreActual.startsWith(`${tipoAnterior} - `)) {
          const restoNombre = nombreActual.substring(tipoAnterior.length + 3); // +3 para " - "
          return {
            ...prev,
            nombre_evento: value ? `${value} - ${restoNombre}` : restoNombre,
          };
        }
        
        // Si el nombre no sigue el patrón, no sobrescribir (usuario escribió algo personalizado)
        return prev;
      });
    }
    
    // Si cambia el plan, actualizar el precio, capacidad y duración del plan
    if (name === 'plan_id') {
      const planSeleccionado = planes.find(p => p.id === parseInt(value));
      if (planSeleccionado) {
        setPrecioPlan(parseFloat(planSeleccionado.precio_base || 0));
        setCapacidadMinimaPlan(planSeleccionado.capacidad_minima || null);
        setCapacidadMaximaPlan(planSeleccionado.capacidad_maxima || null);
        setDuracionMaximaPlan(planSeleccionado.duracion_horas || null);
      } else {
        setPrecioPlan(0);
        setCapacidadMinimaPlan(null);
        setCapacidadMaximaPlan(null);
        setDuracionMaximaPlan(null);
      }
    }

    // Si cambia el número de invitados, validar plan actual
    if (name === 'numero_invitados') {
      const numInvitados = parseInt(value);
      const planSeleccionado = planes.find(p => p.id === parseInt(formData.plan_id));
      const capacidadMinPlan = planSeleccionado?.capacidad_minima;
      const capacidadMaxPlan = planSeleccionado?.capacidad_maxima;
      const salonSeleccionado = salones.find(s => (s.id_salon || s.id) === parseInt(formData.id_salon));
      const capacidadSalonSeleccionado = salonSeleccionado?.capacidad;

      if (!value) {
        setFormData((prev) => ({ ...prev, plan_id: '', id_salon: '' }));
        setPrecioPlan(0);
        setCapacidadMinimaPlan(null);
        setCapacidadMaximaPlan(null);
        setDuracionMaximaPlan(null);
        setCapacidadSalon(null);
        return;
      }

      if (
        planSeleccionado &&
        ((capacidadMinPlan && numInvitados < capacidadMinPlan) ||
          (capacidadMaxPlan && numInvitados > capacidadMaxPlan))
      ) {
        setFormData((prev) => ({ ...prev, plan_id: '' }));
        setPrecioPlan(0);
        setCapacidadMinimaPlan(null);
        setCapacidadMaximaPlan(null);
        setDuracionMaximaPlan(null);
      }

      if (salonSeleccionado && capacidadSalonSeleccionado && numInvitados > capacidadSalonSeleccionado) {
        setFormData((prev) => ({ ...prev, id_salon: '' }));
        setCapacidadSalon(null);
      }
    }
    
    // Si cambia el salón, actualizar la capacidad del salón y cargar fechas ocupadas
    if (name === 'id_salon') {
      const salonSeleccionado = salones.find(s => (s.id_salon || s.id) === parseInt(value));
      if (salonSeleccionado) {
        setCapacidadSalon(salonSeleccionado.capacidad || null);
        cargarFechasOcupadas(parseInt(value));
      } else {
        setCapacidadSalon(null);
        setFechasOcupadas([]);
      }
    }
  };

  const cargarFechasOcupadas = async (salonId) => {
    if (!salonId) {
      setFechasOcupadas([]);
      return;
    }
    
    try {
      setCargandoFechasOcupadas(true);
      const data = await eventosService.getFechasOcupadas(salonId);
      setFechasOcupadas(data.fechas_ocupadas || []);
    } catch (err) {
      console.error('Error al cargar fechas ocupadas:', err);
      setFechasOcupadas([]);
    } finally {
      setCargandoFechasOcupadas(false);
    }
  };

  // Calcular total: precio plan + productos adicionales
  const calcularTotal = () => {
    const totalProductos = productosAdicionales.reduce((sum, p) => sum + (parseFloat(p.subtotal) || 0), 0);
    return precioPlan + totalProductos;
  };

  const handleAgregarProducto = () => {
    if (!formProducto.producto_id || !formProducto.cantidad || parseInt(formProducto.cantidad) <= 0) {
      setError('Debes seleccionar un producto y una cantidad válida');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(formProducto.producto_id));
    if (!producto) {
      setError('Producto no encontrado');
      return;
    }

    const cantidad = parseInt(formProducto.cantidad);
    const precioUnitario = parseFloat(producto.precio || 0);
    const subtotal = cantidad * precioUnitario;

    // Verificar si el producto ya está agregado
    const existe = productosAdicionales.find(p => p.producto_id === producto.id);
    if (existe) {
      setError('Este producto ya está agregado. Elimínalo primero si deseas cambiar la cantidad.');
      return;
    }

    setProductosAdicionales((prev) => [
      ...prev,
      {
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      },
    ]);

    setFormProducto({ producto_id: '', cantidad: '1' });
    setMostrarModalProducto(false);
    setError('');
  };

  const handleEliminarProducto = (productoId) => {
    setProductosAdicionales((prev) => prev.filter((p) => p.producto_id !== productoId));
  };

  // Validar fecha (debe ser >= hoy)
  const validarFecha = (fecha) => {
    if (!fecha) return true; // Permitir vacío si no es requerido
    const fechaEvento = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaEvento.setHours(0, 0, 0, 0);
    return fechaEvento >= hoy;
  };

  // Validar horas
  const validarHoras = () => {
    if (!formData.hora_inicio || !formData.hora_fin) {
      return { valido: true }; // Permitir vacío si no son requeridos
    }

    const [horaInicio, minutoInicio] = formData.hora_inicio.split(':').map(Number);
    const [horaFin, minutoFin] = formData.hora_fin.split(':').map(Number);

    let inicioMinutos = horaInicio * 60 + minutoInicio;
    let finMinutos = horaFin * 60 + minutoFin;

    // Si la hora de fin es menor o igual, el evento cruza a día siguiente
    if (finMinutos <= inicioMinutos) {
      finMinutos += 24 * 60;
    }

    // Validar duración mínima de 2 horas
    const duracionMinutos = finMinutos - inicioMinutos;
    const duracionHoras = duracionMinutos / 60;
    if (duracionHoras < 2) {
      return { valido: false, mensaje: 'El evento debe durar al menos 2 horas' };
    }

    // Validar duración máxima según el plan
    if (duracionMaximaPlan && duracionHoras > duracionMaximaPlan) {
      return { valido: false, mensaje: `El evento no puede durar más de ${duracionMaximaPlan} horas según el plan seleccionado` };
    }

    return { valido: true };
  };

  // Validar número de invitados
  const validarInvitados = () => {
    if (!formData.numero_invitados) {
      return { valido: true }; // Permitir vacío si no es requerido
    }

    const numInvitados = parseInt(formData.numero_invitados);
    
    if (numInvitados <= 0) {
      return { valido: false, mensaje: 'El número de invitados debe ser mayor a 0' };
    }

    // Validar contra capacidad máxima del plan
    if (capacidadMaximaPlan && numInvitados > capacidadMaximaPlan) {
      return { valido: false, mensaje: `El número de invitados no puede superar la capacidad máxima del plan (${capacidadMaximaPlan})` };
    }

    // Validar contra capacidad mínima del plan
    if (capacidadMinimaPlan && numInvitados < capacidadMinimaPlan) {
      return { valido: false, mensaje: `El número de invitados no puede ser menor que la capacidad mínima del plan (${capacidadMinimaPlan})` };
    }

    // Validar contra capacidad del salón
    if (capacidadSalon && numInvitados > capacidadSalon) {
      return { valido: false, mensaje: `El número de invitados no puede superar la capacidad del salón (${capacidadSalon})` };
    }

    return { valido: true };
  };

  const parseHoraMinutos = (hora) => {
    if (!hora) return null;
    const partes = hora.split(':');
    if (partes.length < 2) return null;
    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);
    if (Number.isNaN(horas) || Number.isNaN(minutos)) return null;
    return horas * 60 + minutos;
  };

  const ajustarIntervalo = (inicio, fin) => {
    if (inicio === null || fin === null) return null;
    let inicioMin = inicio;
    let finMin = fin;
    // Si fin es menor que inicio, o si inicio es tarde (después de las 12pm) y fin es temprano (antes de las 12pm)
    // asumimos que cruza medianoche
    if (finMin < inicioMin || (inicioMin >= 12 * 60 && finMin < 12 * 60)) {
      finMin += 24 * 60;
    }
    return { inicioMin, finMin };
  };

  const formatearFechaLocal = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const sumarDias = (fechaStr, dias) => {
    const base = new Date(`${fechaStr}T00:00:00`);
    base.setDate(base.getDate() + dias);
    return formatearFechaLocal(base);
  };

  const diferenciaDias = (fechaA, fechaB) => {
    const a = new Date(`${fechaA}T00:00:00`);
    const b = new Date(`${fechaB}T00:00:00`);
    return Math.round((a - b) / (24 * 60 * 60 * 1000));
  };

  const verificarDisponibilidadEvento = async () => {
    if (!formData.fecha_evento || !formData.id_salon || !formData.hora_inicio || !formData.hora_fin) {
      return { disponible: true };
    }

    const inicioNuevo = parseHoraMinutos(formData.hora_inicio);
    const finNuevo = parseHoraMinutos(formData.hora_fin);
    const intervaloNuevo = ajustarIntervalo(inicioNuevo, finNuevo);
    if (!intervaloNuevo) {
      return { disponible: false, mensaje: 'La hora de inicio o fin no es válida' };
    }

    const salonId = parseInt(formData.id_salon);
    if (!salonId || isNaN(salonId)) {
      return { disponible: true }; // Si no hay salón seleccionado, no validar
    }

    const fechaBase = formData.fecha_evento;
    const fechasBusqueda = [
      sumarDias(fechaBase, -1),
      fechaBase,
      sumarDias(fechaBase, 1),
    ];
    
    try {
      const respuestas = await Promise.all(
        fechasBusqueda.map((fecha) => eventosService.getAll({ fecha }))
      );
      const eventos = respuestas.flatMap((resp) => resp.eventos || []);

      const hayConflicto = eventos.some((evento) => {
        // Ignorar eventos cancelados
        const estado = (evento.estado || '').toLowerCase();
        if (estado === 'cancelado') return false;

        // Verificar que el evento tenga salón y que coincida
        const eventoSalonId = evento.id_salon !== undefined && evento.id_salon !== null 
          ? parseInt(evento.id_salon) 
          : (evento.salon_id !== undefined && evento.salon_id !== null 
            ? parseInt(evento.salon_id) 
            : null);
        
        if (!eventoSalonId || isNaN(eventoSalonId) || eventoSalonId !== salonId) {
          return false;
        }

        // Si el evento no tiene horas definidas, considerar conflicto si es el mismo día
        if (!evento.hora_inicio || !evento.hora_fin) {
          return evento.fecha_evento === fechaBase;
        }

        const inicioExistente = parseHoraMinutos(evento.hora_inicio);
        const finExistente = parseHoraMinutos(evento.hora_fin);
        if (inicioExistente === null || finExistente === null) {
          return evento.fecha_evento === fechaBase;
        }

        const intervaloExistente = ajustarIntervalo(inicioExistente, finExistente);
        if (!intervaloExistente) {
          return evento.fecha_evento === fechaBase;
        }

        // Calcular la diferencia en días entre el evento existente y el nuevo
        const diffDias = diferenciaDias(evento.fecha_evento, fechaBase);
        const offset = diffDias * 24 * 60;
        
        // Convertir intervalos a minutos absolutos desde la fecha base
        const inicioAbsExistente = intervaloExistente.inicioMin + offset;
        const finAbsExistente = intervaloExistente.finMin + offset;
        const inicioAbsNuevo = intervaloNuevo.inicioMin;
        const finAbsNuevo = intervaloNuevo.finMin;

        // Verificar solapamiento: los intervalos se solapan si uno empieza antes de que termine el otro
        // y viceversa
        const haySolapamiento = inicioAbsNuevo < finAbsExistente && inicioAbsExistente < finAbsNuevo;
        
        return haySolapamiento;
      });

      if (hayConflicto) {
        // Encontrar el evento que causa el conflicto para mostrar información más detallada
        const eventoConflictivo = eventos.find((evento) => {
          const estado = (evento.estado || '').toLowerCase();
          if (estado === 'cancelado') return false;

          const eventoSalonId = evento.id_salon !== undefined && evento.id_salon !== null 
            ? parseInt(evento.id_salon) 
            : (evento.salon_id !== undefined && evento.salon_id !== null 
              ? parseInt(evento.salon_id) 
              : null);
          
          if (!eventoSalonId || isNaN(eventoSalonId) || eventoSalonId !== salonId) {
            return false;
          }

          if (!evento.hora_inicio || !evento.hora_fin) {
            return evento.fecha_evento === fechaBase;
          }

          const inicioExistente = parseHoraMinutos(evento.hora_inicio);
          const finExistente = parseHoraMinutos(evento.hora_fin);
          if (inicioExistente === null || finExistente === null) {
            return evento.fecha_evento === fechaBase;
          }

          const intervaloExistente = ajustarIntervalo(inicioExistente, finExistente);
          if (!intervaloExistente) {
            return evento.fecha_evento === fechaBase;
          }

          const diffDias = diferenciaDias(evento.fecha_evento, fechaBase);
          const offset = diffDias * 24 * 60;
          
          const inicioAbsExistente = intervaloExistente.inicioMin + offset;
          const finAbsExistente = intervaloExistente.finMin + offset;
          const inicioAbsNuevo = intervaloNuevo.inicioMin;
          const finAbsNuevo = intervaloNuevo.finMin;

          return inicioAbsNuevo < finAbsExistente && inicioAbsExistente < finAbsNuevo;
        });

        let mensajeError = 'Ya existe un evento en ese salón para la fecha y horario seleccionados';
        if (eventoConflictivo) {
          // Formatear fecha para mostrar
          const fechaFormateada = fechaBase.split('-').reverse().join('/');
          if (eventoConflictivo.hora_inicio && eventoConflictivo.hora_fin) {
            mensajeError = `Ya existe un evento en ese salón el ${fechaFormateada} de ${eventoConflictivo.hora_inicio} a ${eventoConflictivo.hora_fin}. Tu evento (${formData.hora_inicio} - ${formData.hora_fin}) se solapa con este horario.`;
          } else {
            mensajeError = `Ya existe un evento en ese salón el ${fechaFormateada} sin horario definido. Por favor, elige otra fecha.`;
          }
        }
        
        return {
          disponible: false,
          mensaje: mensajeError,
        };
      }

      return { disponible: true };
    } catch (err) {
      console.error('Error al verificar disponibilidad:', err);
      // Si hay error al verificar, permitir continuar pero mostrar advertencia
      return { 
        disponible: true, 
        advertencia: 'No se pudo verificar la disponibilidad. Por favor, verifica manualmente que no haya conflictos.' 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar campos requeridos
      if (!formData.cliente_id) {
        setError('Debes seleccionar un cliente');
        setLoading(false);
        return;
      }

      // Validar fecha
      if (!validarFecha(formData.fecha_evento)) {
        setError('La fecha del evento debe ser igual o mayor a la fecha de hoy');
        setLoading(false);
        return;
      }

      // Validar horas
      const validacionHoras = validarHoras();
      if (!validacionHoras.valido) {
        setError(validacionHoras.mensaje);
        setLoading(false);
        return;
      }

      // Validar número de invitados
      const validacionInvitados = validarInvitados();
      if (!validacionInvitados.valido) {
        setError(validacionInvitados.mensaje);
        setLoading(false);
        return;
      }

      // Verificar disponibilidad de salón y horario (incluye validación por fecha, salón y horarios)
      const disponibilidad = await verificarDisponibilidadEvento();
      if (!disponibilidad.disponible) {
        setError(disponibilidad.mensaje);
        setLoading(false);
        return;
      }

      // Calcular total: precio plan + productos adicionales
      const totalCalculado = calcularTotal();

      // Obtener nombre del salón si está seleccionado
      let nombreSalon = null;
      if (formData.id_salon) {
        const salonSeleccionado = salones.find(s => (s.id_salon || s.id) === parseInt(formData.id_salon));
        if (salonSeleccionado) {
          // Construir el nombre del salón con capacidad si está disponible
          nombreSalon = salonSeleccionado.nombre || null;
          if (nombreSalon && salonSeleccionado.capacidad) {
            nombreSalon = `${nombreSalon} (Cap: ${salonSeleccionado.capacidad})`;
          }
        }
      }

      // Obtener usuario actual para coordinador_id si es coordinador
      const usuarioStr = localStorage.getItem('usuario');
      let coordinadorId = null;
      if (usuarioStr) {
        try {
          const usuario = JSON.parse(usuarioStr);
          if (hasRole(usuario?.rol, [ROLES.COORDINATOR])) {
            coordinadorId = usuario.id;
          }
        } catch (e) {
          console.error('Error al parsear usuario:', e);
        }
      }

      // Preparar datos para enviar
      const eventoData = {
        cliente_id: parseInt(formData.cliente_id),
        nombre_evento: formData.nombre_evento || null,
        tipo_evento: formData.tipo_evento || null,
        fecha_evento: formData.fecha_evento || null,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null,
        numero_invitados: formData.numero_invitados ? parseInt(formData.numero_invitados) : null,
        estado: formData.estado || 'cotizacion',
        total: totalCalculado,
        saldo: totalCalculado,
        observaciones: formData.observaciones || null,
        coordinador_id: coordinadorId,
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.plan_id) {
        eventoData.plan_id = parseInt(formData.plan_id);
      }
      if (formData.id_salon) {
        eventoData.id_salon = parseInt(formData.id_salon);
        // Agregar el nombre del salón (campo 'salon' en la BD)
        if (nombreSalon) {
          eventoData.salon = nombreSalon;
        }
      }

      const response = await eventosService.create(eventoData);

      if (response.evento) {
        const eventoId = response.evento.id_evento || response.evento.id;
        
        // Agregar productos adicionales si hay
        if (productosAdicionales.length > 0) {
          try {
            for (const producto of productosAdicionales) {
              await eventosService.agregarProducto(
                eventoId,
                producto.producto_id,
                producto.cantidad,
                producto.precio_unitario
              );
            }
            
            // Recalcular total después de agregar productos
            await eventosService.calcularTotal(eventoId);
          } catch (err) {
            console.error('Error al agregar productos:', err);
            setError('El evento se creó pero hubo un error al agregar algunos productos. Puedes agregarlos manualmente desde el detalle del evento.');
            // No bloqueamos la creación del evento si falla agregar productos
          }
        }
        
        // Redirigir al detalle del evento creado
        navigate(`/eventos/${eventoId}`);
      } else {
        setError('Error al crear el evento. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error al crear evento:', err);
      
      // Manejar errores de autenticación
      if (err.response?.status === 401 || err.isAuthError) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }, 3000);
      } else {
        const errorMessage = err.response?.data?.error || err.message || 'Error al crear el evento';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const numeroInvitados = parseInt(formData.numero_invitados);
  const invitadosValidos = Number.isFinite(numeroInvitados) && numeroInvitados > 0;
  const planesDisponibles = invitadosValidos
    ? planes.filter((plan) => {
        const min = parseInt(plan.capacidad_minima || '0', 10) || 0;
        const max = parseInt(plan.capacidad_maxima || '0', 10) || 0;
        const cumpleMin = numeroInvitados >= min;
        const cumpleMax = !max || numeroInvitados <= max;
        return cumpleMin && cumpleMax;
      })
    : [];
  const salonesDisponibles = invitadosValidos
    ? salones.filter((salon) => !salon.capacidad || parseInt(salon.capacidad) >= numeroInvitados)
    : [];
  const planPlaceholder = !invitadosValidos
    ? 'Ingresa número de invitados'
    : planes.length === 0 && cargandoDatos
    ? 'Cargando planes...'
    : planes.length === 0
    ? 'No hay planes disponibles'
    : planesDisponibles.length === 0
    ? `No hay planes para ${numeroInvitados} invitados`
    : 'Seleccione un plan';
  const planSelectDisabled = !invitadosValidos || planes.length === 0 || planesDisponibles.length === 0;
  const salonPlaceholder = !invitadosValidos
    ? 'Ingresa número de invitados'
    : salones.length === 0 && cargandoDatos
    ? 'Cargando salones...'
    : salones.length === 0
    ? 'No hay salones disponibles'
    : salonesDisponibles.length === 0
    ? `No hay salones para ${numeroInvitados} invitados`
    : 'Seleccione un salón';
  const salonSelectDisabled = !invitadosValidos || salones.length === 0 || salonesDisponibles.length === 0;

  if (cargandoDatos && !error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando datos...</div>
      </div>
    );
  }

  // Si hay error de autenticación crítico, mostrar mensaje especial
  if (error && (error.includes('Sesión expirada') || error.includes('expirado')) && clientes.length === 0 && planes.length === 0 && salones.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/eventos')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: '#6366f1',
              border: '1px solid #6366f1',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Nuevo Evento
          </h1>
        </div>
        {error && (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #fbbf24',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              ⚠️ Sesión Expirada
            </div>
            <div style={{ marginBottom: '1rem' }}>
              Tu sesión ha expirado. Por favor, inicia sesión nuevamente para crear eventos.
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/login';
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Ir al Login
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/eventos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#6366f1',
            border: '1px solid #6366f1',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Nuevo Evento
        </h1>
        <p style={{ color: '#6b7280' }}>Crear un nuevo evento</p>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: error.includes('Sesión expirada') || error.includes('expirado') 
              ? '#fef3c7' 
              : error.includes('Algunos datos') || error.includes('Puedes continuar')
              ? '#dbeafe'
              : '#fee2e2',
            color: error.includes('Sesión expirada') || error.includes('expirado')
              ? '#92400e'
              : error.includes('Algunos datos') || error.includes('Puedes continuar')
              ? '#1e40af'
              : '#dc2626',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            border: `1px solid ${error.includes('Sesión expirada') || error.includes('expirado')
              ? '#fbbf24'
              : error.includes('Algunos datos') || error.includes('Puedes continuar')
              ? '#60a5fa'
              : '#fca5a5'}`,
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {error.includes('Sesión expirada') || error.includes('expirado') ? '⚠️' : 
             error.includes('Algunos datos') || error.includes('Puedes continuar') ? 'ℹ️' : '❌'}
            {error}
          </div>
          {error.includes('Sesión expirada') || error.includes('expirado') ? (
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Por favor, inicia sesión nuevamente para continuar.
            </div>
          ) : (error.includes('Algunos datos') || error.includes('Puedes continuar')) ? (
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Puedes continuar creando el evento. Los campos que no se cargaron estarán vacíos.
              <button
                onClick={cargarDatosIniciales}
                disabled={cargandoDatos}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: cargandoDatos ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <RefreshCw size={12} />
                Recargar
              </button>
            </div>
          ) : error && !error.includes('Sesión expirada') && !error.includes('expirado') ? (
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={cargarDatosIniciales}
                disabled={cargandoDatos}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: cargandoDatos ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <RefreshCw size={16} />
                {cargandoDatos ? 'Recargando...' : 'Recargar Datos'}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* 1. Número de Invitados */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Número de Invitados
              </label>
              <input
                type="number"
                name="numero_invitados"
                value={formData.numero_invitados}
                onChange={handleChange}
                min="1"
                max={capacidadSalon || undefined}
                placeholder="Ej: 120"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {capacidadSalon
                  ? `Capacidad del salón seleccionado: ${capacidadSalon} personas`
                  : 'Los planes se filtran según esta cantidad'}
              </div>
            </div>

            {/* 2. Salón */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Salón
              </label>
              <select
                name="id_salon"
                value={formData.id_salon}
                onChange={handleChange}
                disabled={salonSelectDisabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: salonSelectDisabled ? '#f3f4f6' : 'white',
                }}
              >
                <option value="">{salonPlaceholder}</option>
                {salonesDisponibles.map((salon) => (
                  <option key={salon.id_salon || salon.id} value={salon.id_salon || salon.id}>
                    {salon.nombre} - Capacidad: {salon.capacidad || 0}
                  </option>
                ))}
              </select>
              {formData.id_salon && capacidadSalon && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Capacidad del salón: {capacidadSalon} personas
                </div>
              )}
            </div>

            {/* 3. Plan */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Plan disponible
              </label>
              <select
                name="plan_id"
                value={formData.plan_id}
                onChange={handleChange}
                disabled={planSelectDisabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: planSelectDisabled ? '#f3f4f6' : 'white',
                }}
              >
                <option value="">{planPlaceholder}</option>
                {planesDisponibles.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre} • Min: {plan.capacidad_minima || 0}
                    {plan.capacidad_maxima ? ` - Max: ${plan.capacidad_maxima}` : ' - Max: Sin límite'} •{' '}
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(plan.precio_base || 0)}
                  </option>
                ))}
              </select>
              {formData.plan_id && (capacidadMinimaPlan || capacidadMaximaPlan || duracionMaximaPlan) && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {capacidadMinimaPlan && `Capacidad mínima: ${capacidadMinimaPlan} personas`}
                  {capacidadMinimaPlan && capacidadMaximaPlan ? ' • ' : ''}
                  {capacidadMaximaPlan && `Capacidad máxima: ${capacidadMaximaPlan} personas`}
                  {(capacidadMinimaPlan || capacidadMaximaPlan) && duracionMaximaPlan ? ' • ' : ''}
                  {duracionMaximaPlan && `Duración máxima: ${duracionMaximaPlan} horas`}
                </div>
              )}
            </div>

            {/* 4. Fecha del Evento */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Fecha del Evento
              </label>
              <input
                type="date"
                name="fecha_evento"
                value={formData.fecha_evento}
                onChange={(e) => {
                  handleChange(e);
                  // Limpiar error al cambiar fecha
                  if (error && error.includes('fecha')) {
                    setError('');
                  }
                }}
                min={getTodayDate()}
                disabled={!formData.id_salon || cargandoFechasOcupadas}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: (!formData.id_salon || cargandoFechasOcupadas) ? '#f3f4f6' : 'white',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {!formData.id_salon ? (
                  'Selecciona un salón primero para ver las fechas disponibles'
                ) : cargandoFechasOcupadas ? (
                  'Cargando fechas ocupadas...'
                ) : fechasOcupadas.length > 0 ? (
                  `${fechasOcupadas.length} ${fechasOcupadas.length === 1 ? 'fecha tiene eventos' : 'fechas tienen eventos'} para este salón. La disponibilidad se verifica según horario al guardar.`
                ) : (
                  'La fecha debe ser igual o mayor a hoy y se valida disponibilidad según salón y horario'
                )}
              </div>
              {fechasOcupadas.includes(formData.fecha_evento) && (
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.25rem', fontWeight: '500' }}>
                  ℹ️ Esta fecha tiene eventos. Se verificará la disponibilidad por horario al guardar.
                </div>
              )}
            </div>

            {/* 6. Cliente - Requerido */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Cliente *
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                required
                disabled={clientes.length === 0 && cargandoDatos}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: clientes.length === 0 && cargandoDatos ? '#f3f4f6' : 'white',
                }}
              >
                <option value="">
                  {clientes.length === 0 && cargandoDatos 
                    ? 'Cargando clientes...' 
                    : clientes.length === 0 
                    ? 'No hay clientes disponibles' 
                    : 'Seleccione un cliente'}
                </option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre_completo || cliente.email || `Cliente #${cliente.id}`}
                  </option>
                ))}
              </select>
              {clientes.length === 0 && !cargandoDatos && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  No se pudieron cargar los clientes. Puedes crear el evento manualmente ingresando el ID del cliente.
                </div>
              )}
            </div>

              {/* 8. Tipo de Evento - Selector */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Tipo de Evento
                </label>
                <select
                  name="tipo_evento"
                  value={formData.tipo_evento}
                  onChange={handleChange}
                  disabled={tiposEvento.length === 0 && cargandoDatos}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    backgroundColor: tiposEvento.length === 0 && cargandoDatos ? '#f3f4f6' : 'white',
                  }}
                >
                  <option value="">
                    {tiposEvento.length === 0 && cargandoDatos 
                      ? 'Cargando tipos...' 
                      : tiposEvento.length === 0 
                      ? 'No hay tipos disponibles' 
                      : 'Seleccione un tipo'}
                  </option>
                  {tiposEvento.map((tipo) => (
                    <option key={tipo.id} value={tipo.nombre}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            {/* 7. Nombre del Evento */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Nombre del Evento
              </label>
              <input
                type="text"
                name="nombre_evento"
                value={formData.nombre_evento}
                onChange={handleChange}
                placeholder="Nombre descriptivo del evento"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
            </div>


            {/* 9. Hora Inicio */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Hora de Inicio
              </label>
              <input
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
              {formData.hora_inicio && formData.hora_fin && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {(() => {
                    const inicioMinutos = parseHoraMinutos(formData.hora_inicio);
                    const finMinutos = parseHoraMinutos(formData.hora_fin);
                    const intervalo = ajustarIntervalo(inicioMinutos, finMinutos);
                    if (!intervalo) return '';
                    const duracionHoras = (intervalo.finMin - intervalo.inicioMin) / 60;
                    if (duracionHoras > 0) {
                      return `Duración: ${duracionHoras.toFixed(1)} horas${duracionMaximaPlan ? ` (Máx: ${duracionMaximaPlan}h)` : ''}`;
                    }
                    return '';
                  })()}
                </div>
              )}
            </div>

            {/* 10. Hora Fin */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Hora de Fin
              </label>
              <input
                type="time"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Mínimo 2 horas de duración
              </div>
            </div>

            {/* 11. Estado */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              >
                <option value="cotizacion">Cotización</option>
                <option value="confirmado">Confirmado</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

          </div>

          {/* Sección de Productos Adicionales */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>Productos Adicionales</h3>
              <button
                type="button"
                onClick={() => setMostrarModalProducto(true)}
                disabled={productos.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: productos.length === 0 ? '#d1d5db' : '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: productos.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                <Plus size={16} />
                Agregar Producto
              </button>
            </div>

            {productosAdicionales.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
                No hay productos adicionales agregados
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
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
                    {productosAdicionales.map((producto) => (
                      <tr key={producto.producto_id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                        <td style={{ padding: '0.75rem' }}>{producto.nombre}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{producto.cantidad}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                          }).format(producto.precio_unitario)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                          }).format(producto.subtotal)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleEliminarProducto(producto.producto_id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Resumen de Precios */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Precio Plan:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(precioPlan)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>+ Productos:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(productosAdicionales.reduce((sum, p) => sum + (parseFloat(p.subtotal) || 0), 0))}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '2px solid #d1d5db' }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>= Total:</span>
              <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#6366f1' }}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(calcularTotal())}
              </span>
            </div>
          </div>

          {/* Modal para agregar producto */}
          {mostrarModalProducto && (
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
                padding: '1rem',
              }}
              onClick={() => setMostrarModalProducto(false)}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '2rem',
                  width: '100%',
                  maxWidth: '500px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Agregar Producto</h2>
                  <button
                    onClick={() => setMostrarModalProducto(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#6b7280',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Producto *
                    </label>
                    <select
                      value={formProducto.producto_id}
                      onChange={(e) => setFormProducto({ ...formProducto, producto_id: e.target.value })}
                      disabled={productos.length === 0}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        backgroundColor: productos.length === 0 ? '#f3f4f6' : 'white',
                      }}
                    >
                      <option value="">
                        {productos.length === 0 ? 'No hay productos disponibles' : 'Seleccione un producto'}
                      </option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre} - {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                          }).format(producto.precio || 0)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formProducto.cantidad}
                      onChange={(e) => setFormProducto({ ...formProducto, cantidad: e.target.value })}
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

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setMostrarModalProducto(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAgregarProducto}
                    disabled={!formProducto.producto_id || !formProducto.cantidad}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: !formProducto.producto_id || !formProducto.cantidad ? '#9ca3af' : '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: !formProducto.producto_id || !formProducto.cantidad ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div style={{ marginTop: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
              }}
            >
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              placeholder="Notas adicionales sobre el evento..."
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

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/eventos')}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#9ca3af' : '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              <Save size={16} />
              {loading ? 'Guardando...' : 'Crear Evento'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventoNuevo;
