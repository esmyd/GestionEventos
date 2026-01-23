"""
Modelo para gestión de eventos
"""
from datetime import timedelta
from modelos.base_datos import BaseDatos


class EventoModelo:
    """Clase para operaciones CRUD de eventos"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def crear_evento(self, datos_evento):
        """Crea un nuevo evento"""
        # La tabla eventos usa id_cliente, id_evento, total, saldo, salon, tipo_evento, id_salon
        consulta = """
        INSERT INTO eventos (id_cliente, id_salon, plan_id, salon, nombre_evento, tipo_evento, fecha_evento, hora_inicio, hora_fin, numero_invitados, estado, total, saldo, observaciones, coordinador_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos_evento['cliente_id'],
            datos_evento.get('id_salon'),
            datos_evento.get('plan_id'),
            datos_evento.get('salon'),
            datos_evento.get('nombre_evento'),
            datos_evento.get('tipo_evento'),
            datos_evento.get('fecha_evento'),
            datos_evento.get('hora_inicio'),
            datos_evento.get('hora_fin'),
            datos_evento.get('numero_invitados'),
            datos_evento.get('estado', 'cotizacion'),  # Valor por defecto si no se especifica
            datos_evento.get('total', 0) or 0,
            datos_evento.get('saldo') or datos_evento.get('total', 0) or 0,  # Si no hay saldo, usar total
            datos_evento.get('observaciones'),
            datos_evento.get('coordinador_id')
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            evento_id = self.base_datos.obtener_ultimo_id()
            return evento_id
        return None
    
    def obtener_evento_por_id(self, evento_id):
        """Obtiene un evento por su ID con información del cliente, salón y plan"""
        consulta = """
        SELECT e.*, c.usuario_id, c.documento_identidad as documento_identidad_cliente, c.direccion as direccion_cliente,
               u.nombre_completo as nombre_cliente, u.email, u.telefono,
               s.nombre as nombre_salon, s.capacidad as capacidad_salon, s.ubicacion as ubicacion_salon,
               p.nombre as nombre_plan, p.precio_base as precio_plan, p.incluye as plan_incluye,
               u_coor.nombre_completo as nombre_coordinador
        FROM eventos e
        JOIN clientes c ON e.id_cliente = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN usuarios u_coor ON e.coordinador_id = u_coor.id
        LEFT JOIN salones s ON e.id_salon = s.id_salon
        LEFT JOIN planes p ON e.plan_id = p.id
        WHERE e.id_evento = %s
        """
        resultado = self.base_datos.obtener_uno(consulta, (evento_id,))
        
        if resultado:
            # Convertir timedelta a string si es necesario
            hora_inicio = resultado.get('hora_inicio')
            if isinstance(hora_inicio, timedelta):
                total_seconds = int(hora_inicio.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                resultado['hora_inicio'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_inicio is not None:
                resultado['hora_inicio'] = str(hora_inicio)
            
            hora_fin = resultado.get('hora_fin')
            if isinstance(hora_fin, timedelta):
                total_seconds = int(hora_fin.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                resultado['hora_fin'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_fin is not None:
                resultado['hora_fin'] = str(hora_fin)
            
            # Convertir fecha a string si es necesario
            fecha_evento = resultado.get('fecha_evento')
            if fecha_evento is not None and not isinstance(fecha_evento, str):
                resultado['fecha_evento'] = str(fecha_evento)
            
            # Asegurar que total_pagado esté presente (por si la columna no existe aún)
            if 'total_pagado' not in resultado:
                # Calcular total_pagado si no está en la consulta
                from modelos.pago_modelo import PagoModelo
                pago_modelo = PagoModelo()
                resultado['total_pagado'] = pago_modelo.obtener_total_pagado_evento(evento_id)
        
        return resultado
    
    def obtener_todos_eventos(self, filtro_estado=None, filtro_fecha=None):
        """Obtiene todos los eventos con filtros opcionales"""
        consulta = """
        SELECT e.*, c.usuario_id, c.documento_identidad as documento_identidad_cliente,
               u.nombre_completo as nombre_cliente,
               salones.nombre as nombre_salon, p.nombre as nombre_plan,
               u_coor.nombre_completo as nombre_coordinador
        FROM eventos e
        LEFT JOIN clientes c ON e.id_cliente = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN usuarios u_coor ON e.coordinador_id = u_coor.id
        LEFT JOIN salones ON e.id_salon = salones.id_salon
        LEFT JOIN planes p ON e.plan_id = p.id
        WHERE 1=1
        """
        parametros = []
        # Filtros opcionales
        if filtro_estado:
            consulta += " AND e.estado = %s"
            parametros.append(filtro_estado)
        # Filtro por fecha
        if filtro_fecha:
            consulta += " AND e.fecha_evento = %s"
            parametros.append(filtro_fecha)
        # Ordenar por fecha de evento descendente
        consulta += " ORDER BY e.fecha_evento DESC"
        
        # Ejecutar consulta con parámetros opcionales
        if parametros:
            resultados = self.base_datos.obtener_todos(consulta, tuple(parametros))
        else:
            resultados = self.base_datos.obtener_todos(consulta)
        
        # Mapear nombres de columnas para compatibilidad con la vista
        eventos_mapeados = []
        for evento in resultados:
            # Convertir timedelta a string si es necesario
            hora_inicio = evento.get('hora_inicio')
            if isinstance(hora_inicio, timedelta):
                total_seconds = int(hora_inicio.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                hora_inicio = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_inicio is not None:
                hora_inicio = str(hora_inicio)
            
            hora_fin = evento.get('hora_fin')
            if isinstance(hora_fin, timedelta):
                total_seconds = int(hora_fin.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                hora_fin = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_fin is not None:
                hora_fin = str(hora_fin)
            
            # Convertir fecha a string si es necesario
            fecha_evento = evento.get('fecha_evento')
            if fecha_evento is not None and not isinstance(fecha_evento, str):
                fecha_evento = str(fecha_evento)
            
            # Mapear nombres de columnas para compatibilidad con la vista
            evento_mapeado = {
                'id_evento': evento.get('id_evento', evento.get('id')),
                'id': evento.get('id_evento', evento.get('id')),
                'id_salon': evento.get('id_salon'),
                'salon_id': evento.get('id_salon'),  # Alias para compatibilidad
                'salon': evento.get('salon', evento.get('salon_nombre')),
                'cliente_id': evento.get('id_cliente'),
                'nombre_evento': evento.get('nombre_evento', evento.get('evento_nombre', 'Evento')),
                'tipo_evento': evento.get('tipo_evento', 'Otro'),
                'fecha_evento': fecha_evento,
                'estado': evento.get('estado'),
                'hora_inicio': hora_inicio,
                'hora_fin': hora_fin,
                'numero_invitados': evento.get('numero_invitados'),
                'total': float(evento.get('total', 0) or 0),
                'precio_total': float(evento.get('total', 0) or 0),
                'saldo': float(evento.get('saldo', 0) or 0),
                'saldo_pendiente': float(evento.get('saldo', 0) or 0),
                'nombre_cliente': evento.get('nombre_cliente', 'N/A'),
                'documento_identidad_cliente': evento.get('documento_identidad_cliente') or evento.get('documento_identidad'),
                'nombre_salon': evento.get('nombre_salon'),
                'nombre_plan': evento.get('nombre_plan'),
                'coordinador_id': evento.get('coordinador_id'),
                'nombre_coordinador': evento.get('nombre_coordinador')
            }
            eventos_mapeados.append(evento_mapeado)
        
        return eventos_mapeados
    
    def obtener_eventos_por_cliente(self, cliente_id):
        """Obtiene todos los eventos de un cliente"""
        consulta = """
        SELECT e.*, c.usuario_id, c.documento_identidad as documento_identidad_cliente,
               u.nombre_completo as nombre_cliente,
               u_coor.nombre_completo as nombre_coordinador
        FROM eventos e
        LEFT JOIN clientes c ON e.id_cliente = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN usuarios u_coor ON e.coordinador_id = u_coor.id
        WHERE e.id_cliente = %s
        ORDER BY e.fecha_evento DESC
        """
        resultados = self.base_datos.obtener_todos(consulta, (cliente_id,))
        
        # Mapear nombres de columnas
        eventos_mapeados = []
        for evento in resultados:
            # Convertir timedelta a string si es necesario
            hora_inicio = evento.get('hora_inicio')
            if isinstance(hora_inicio, timedelta):
                total_seconds = int(hora_inicio.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                hora_inicio = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_inicio is not None:
                hora_inicio = str(hora_inicio)
            
            hora_fin = evento.get('hora_fin')
            if isinstance(hora_fin, timedelta):
                total_seconds = int(hora_fin.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                hora_fin = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_fin is not None:
                hora_fin = str(hora_fin)
            
            # Convertir fecha a string si es necesario
            fecha_evento = evento.get('fecha_evento')
            if fecha_evento is not None and not isinstance(fecha_evento, str):
                fecha_evento = str(fecha_evento)
            
            evento_mapeado = {
                'id': evento.get('id_evento', evento.get('id')),
                'id_evento': evento.get('id_evento', evento.get('id')),
                'cliente_id': evento.get('id_cliente'),
                'nombre_evento': evento.get('salon', 'Evento'),
                'tipo_evento': evento.get('tipo_evento', 'Otro'),
                'fecha_evento': fecha_evento,
                'estado': evento.get('estado'),
                'hora_inicio': hora_inicio,
                'hora_fin': hora_fin,
                'total': float(evento.get('total', 0) or 0),
                'precio_total': float(evento.get('total', 0) or 0),
                'saldo': float(evento.get('saldo', 0) or 0),
                'saldo_pendiente': float(evento.get('saldo', 0) or 0),
                'nombre_cliente': evento.get('nombre_cliente', 'N/A'),
                'documento_identidad_cliente': evento.get('documento_identidad_cliente') or evento.get('documento_identidad'),
                'coordinador_id': evento.get('coordinador_id'),
                'nombre_coordinador': evento.get('nombre_coordinador')
            }
            eventos_mapeados.append(evento_mapeado)
        
        return eventos_mapeados
    
    def obtener_eventos_por_coordinador(self, coordinador_id):
        """Obtiene todos los eventos asignados a un coordinador"""
        # Filtrar por coordinador_id
        consulta = """
        SELECT e.*, c.usuario_id, c.documento_identidad as documento_identidad_cliente,
               u.nombre_completo as nombre_cliente, s.nombre as nombre_salon,
               u_coor.nombre_completo as nombre_coordinador
        FROM eventos e
        LEFT JOIN clientes c ON e.id_cliente = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN usuarios u_coor ON e.coordinador_id = u_coor.id
        LEFT JOIN salones s ON e.id_salon = s.id_salon
        WHERE e.coordinador_id = %s
        ORDER BY e.fecha_evento DESC
        """
        resultados = self.base_datos.obtener_todos(consulta, (coordinador_id,))
        
        # Mapear nombres de columnas
        eventos_mapeados = []
        for evento in resultados:
            # Convertir timedelta a string si es necesario
            hora_inicio = evento.get('hora_inicio')
            if isinstance(hora_inicio, timedelta):
                total_seconds = int(hora_inicio.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                hora_inicio = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_inicio is not None:
                hora_inicio = str(hora_inicio)
            
            hora_fin = evento.get('hora_fin')
            if isinstance(hora_fin, timedelta):
                total_seconds = int(hora_fin.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                hora_fin = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hora_fin is not None:
                hora_fin = str(hora_fin)
            
            # Convertir fecha a string si es necesario
            fecha_evento = evento.get('fecha_evento')
            if fecha_evento is not None and not isinstance(fecha_evento, str):
                fecha_evento = str(fecha_evento)
            
            evento_mapeado = {
                'id': evento.get('id_evento', evento.get('id')),
                'id_evento': evento.get('id_evento', evento.get('id')),
                'cliente_id': evento.get('id_cliente'),
                'salon': evento.get('salon', evento.get('nombre_salon')),
                'nombre_evento': evento.get('salon', evento.get('nombre_evento', 'Evento')),
                'tipo_evento': evento.get('tipo_evento', 'Otro'),
                'fecha_evento': fecha_evento,
                'estado': evento.get('estado'),
                'hora_inicio': hora_inicio,
                'hora_fin': hora_fin,
                'numero_invitados': evento.get('numero_invitados'),
                'total': float(evento.get('total', 0) or 0),
                'precio_total': float(evento.get('total', 0) or 0),
                'saldo': float(evento.get('saldo', 0) or 0),
                'saldo_pendiente': float(evento.get('saldo', 0) or 0),
                'nombre_cliente': evento.get('nombre_cliente', 'N/A'),
                'documento_identidad_cliente': evento.get('documento_identidad_cliente') or evento.get('documento_identidad'),
                'coordinador_id': evento.get('coordinador_id'),
                'nombre_coordinador': evento.get('nombre_coordinador')
            }
            eventos_mapeados.append(evento_mapeado)
        
        return eventos_mapeados
    
    def actualizar_evento(self, evento_id, datos_evento):
        """Actualiza los datos de un evento"""
        evento_actual = self.obtener_evento_por_id(evento_id)
        if not evento_actual:
            return False

        plan_id = datos_evento.get('plan_id', evento_actual.get('plan_id'))
        if plan_id in ('', None):
            plan_id = None

        id_salon = datos_evento.get('id_salon', evento_actual.get('id_salon'))
        if id_salon in ('', None):
            id_salon = None

        total = datos_evento.get('total', datos_evento.get('precio_total', evento_actual.get('total', 0) or 0))
        saldo = datos_evento.get('saldo', datos_evento.get('saldo_pendiente', evento_actual.get('saldo', total) or total))

        consulta = """
        UPDATE eventos
        SET id_cliente = %s,
            id_salon = %s,
            plan_id = %s,
            salon = %s,
            nombre_evento = %s,
            tipo_evento = %s,
            fecha_evento = %s,
            hora_inicio = %s,
            hora_fin = %s,
            numero_invitados = %s,
            estado = %s,
            total = %s,
            saldo = %s,
            observaciones = %s,
            coordinador_id = %s
        WHERE id_evento = %s
        """
        parametros = (
            datos_evento.get('cliente_id', evento_actual.get('id_cliente')),
            id_salon,
            plan_id,
            datos_evento.get('salon', evento_actual.get('salon')),
            datos_evento.get('nombre_evento', evento_actual.get('nombre_evento')),
            datos_evento.get('tipo_evento', evento_actual.get('tipo_evento')),
            datos_evento.get('fecha_evento', evento_actual.get('fecha_evento')),
            datos_evento.get('hora_inicio', evento_actual.get('hora_inicio')),
            datos_evento.get('hora_fin', evento_actual.get('hora_fin')),
            datos_evento.get('numero_invitados', evento_actual.get('numero_invitados')),
            datos_evento.get('estado', evento_actual.get('estado')),
            total,
            saldo,
            datos_evento.get('observaciones', evento_actual.get('observaciones')),
            datos_evento.get('coordinador_id', evento_actual.get('coordinador_id')),
            evento_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)

    def actualizar_coordinador_evento(self, evento_id, coordinador_id):
        """Actualiza el coordinador asignado a un evento"""
        consulta = """
        UPDATE eventos
        SET coordinador_id = %s
        WHERE id_evento = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (coordinador_id, evento_id))
    
    def actualizar_estado(self, evento_id, nuevo_estado):
        """Actualiza el estado de un evento y envía notificación"""
        # Obtener estado actual antes de actualizar
        evento_actual = self.obtener_evento_por_id(evento_id)
        estado_anterior = evento_actual.get('estado') if evento_actual else None
        
        # Actualizar estado
        consulta = "UPDATE eventos SET estado = %s WHERE id_evento = %s"
        resultado = self.base_datos.ejecutar_consulta(consulta, (nuevo_estado, evento_id))
        
        # Enviar notificación si el estado cambió
        if resultado and estado_anterior and estado_anterior != nuevo_estado:
            try:
                evento = self.obtener_evento_por_id(evento_id)
                if evento:
                    from integraciones.notificaciones_automaticas import NotificacionesAutomaticas
                    notif = NotificacionesAutomaticas()
                    notif.enviar_notificacion_cambio_estado(
                        evento=evento,
                        estado_anterior=estado_anterior,
                        estado_nuevo=nuevo_estado
                    )
            except Exception as e:
                print(f"Error al enviar notificación de cambio de estado: {e}")
        
        return resultado
    
    def actualizar_saldo_pendiente(self, evento_id, nuevo_saldo):
        """Actualiza el saldo pendiente de un evento"""
        consulta = "UPDATE eventos SET saldo = %s WHERE id_evento = %s"
        return self.base_datos.ejecutar_consulta(consulta, (nuevo_saldo, evento_id))

    def actualizar_eventos_finalizados(self):
        """Marca eventos como completados cuando ya paso la fecha"""
        consulta = """
        UPDATE eventos
        SET estado = 'completado'
        WHERE DATE(fecha_evento) < CURDATE()
          AND estado IN ('confirmado', 'en_proceso')
        """
        return self.base_datos.ejecutar_consulta(consulta)

    def eliminar_evento(self, evento_id):
        """Elimina un evento y sus pagos asociados"""
        # Eliminar pagos primero por la restricción de clave foránea
        eliminar_pagos = "DELETE FROM pagos WHERE id_evento = %s"
        self.base_datos.ejecutar_consulta(eliminar_pagos, (evento_id,))

        consulta = "DELETE FROM eventos WHERE id_evento = %s"
        return self.base_datos.ejecutar_consulta(consulta, (evento_id,))
    
    def agregar_producto_evento(self, evento_id, producto_id, cantidad, precio_unitario):
        """Agrega un producto a un evento"""
        subtotal = cantidad * precio_unitario
        consulta = """
        INSERT INTO evento_productos (id_evento, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (%s, %s, %s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(consulta, (evento_id, producto_id, cantidad, precio_unitario, subtotal))
    
    def eliminar_producto_evento(self, evento_id, producto_id):
        """Elimina un producto de un evento"""
        consulta = "DELETE FROM evento_productos WHERE id_evento = %s AND producto_id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (evento_id, producto_id))
    
    def calcular_total_evento(self, evento_id):
        """Calcula el total de un evento: precio del plan + suma de productos adicionales"""
        # Obtener precio del plan
        consulta_plan = """
        SELECT COALESCE(p.precio_base, 0) as precio_plan
        FROM eventos e
        LEFT JOIN planes p ON e.plan_id = p.id
        WHERE e.id_evento = %s
        """
        plan_data = self.base_datos.obtener_uno(consulta_plan, (evento_id,))
        precio_plan = float(plan_data.get('precio_plan', 0) or 0) if plan_data else 0
        
        # Obtener suma de productos adicionales
        consulta_productos = """
        SELECT COALESCE(SUM(subtotal), 0) as total_productos
        FROM evento_productos
        WHERE id_evento = %s
        """
        productos_data = self.base_datos.obtener_uno(consulta_productos, (evento_id,))
        total_productos = float(productos_data.get('total_productos', 0) or 0) if productos_data else 0
        
        total = precio_plan + total_productos
        
        # Actualizar el total en el evento
        consulta_update = "UPDATE eventos SET total = %s, saldo = %s WHERE id_evento = %s"
        self.base_datos.ejecutar_consulta(consulta_update, (total, total, evento_id))
        
        return total
    
    def obtener_productos_evento(self, evento_id):
        """Obtiene todos los productos asociados a un evento"""
        consulta = """
        SELECT ep.*, p.nombre as nombre_producto, p.categoria
        FROM evento_productos ep
        JOIN productos p ON ep.producto_id = p.id
        WHERE ep.id_evento = %s
        """
        return self.base_datos.obtener_todos(consulta, (evento_id,))

    def obtener_servicios_evento(self, evento_id):
        """Obtiene los servicios asociados a un evento"""
        consulta = """
        SELECT id, evento_id, plan_servicio_id, nombre, orden, completado, descartado, fecha_actualizacion
        FROM evento_servicios
        WHERE evento_id = %s
        ORDER BY orden, id
        """
        return self.base_datos.obtener_todos(consulta, (evento_id,))

    def actualizar_servicio_evento(self, servicio_id, completado):
        """Actualiza el estado de un servicio del evento"""
        consulta = """
        UPDATE evento_servicios
        SET completado = %s, fecha_actualizacion = NOW()
        WHERE id = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (1 if completado else 0, servicio_id))

    def crear_servicios_evento_desde_plan(self, evento_id, plan_id):
        """Crea servicios de evento basados en el plan"""
        consulta_plan = """
        SELECT id, nombre, orden
        FROM plan_servicios
        WHERE plan_id = %s AND activo = TRUE
        ORDER BY orden, id
        """
        servicios_plan = self.base_datos.obtener_todos(consulta_plan, (plan_id,))
        if not servicios_plan:
            return True
        consulta_insert = """
        INSERT INTO evento_servicios (evento_id, plan_servicio_id, nombre, orden, completado, descartado)
        VALUES (%s, %s, %s, %s, 0, 0)
        """
        for servicio in servicios_plan:
            self.base_datos.ejecutar_consulta(
                consulta_insert,
                (evento_id, servicio.get('id'), servicio.get('nombre'), servicio.get('orden') or 0)
            )
        return True

    def reemplazar_servicios_evento_desde_plan(self, evento_id, plan_id):
        """Reemplaza los servicios del evento basados en el plan"""
        eliminar = "DELETE FROM evento_servicios WHERE evento_id = %s"
        self.base_datos.ejecutar_consulta(eliminar, (evento_id,))
        return self.crear_servicios_evento_desde_plan(evento_id, plan_id)
    
    def verificar_conflicto_evento(self, salon_id, fecha_evento, hora_inicio, hora_fin, evento_id_excluir=None):
        """Verifica si hay conflictos de horario para un salón en una fecha"""
        if not salon_id or not fecha_evento or not hora_inicio or not hora_fin:
            return False
        
        # Convertir horas a minutos para comparación
        def hora_a_minutos(hora_str):
            if not hora_str:
                return None
            partes = str(hora_str).split(':')
            if len(partes) < 2:
                return None
            try:
                horas = int(partes[0])
                minutos = int(partes[1])
                return horas * 60 + minutos
            except:
                return None
        
        inicio_min = hora_a_minutos(hora_inicio)
        fin_min = hora_a_minutos(hora_fin)
        if inicio_min is None or fin_min is None:
            return False
        
        # Ajustar si cruza medianoche
        if fin_min < inicio_min or (inicio_min >= 12 * 60 and fin_min < 12 * 60):
            fin_min += 24 * 60
        
        # Buscar eventos en el mismo salón y fecha (o fechas adyacentes si cruza medianoche)
        from datetime import datetime
        try:
            if isinstance(fecha_evento, str):
                fecha_obj = datetime.strptime(fecha_evento, '%Y-%m-%d').date()
            else:
                fecha_obj = fecha_evento
            
            fecha_anterior = (fecha_obj - timedelta(days=1)).strftime('%Y-%m-%d')
            fecha_siguiente = (fecha_obj + timedelta(days=1)).strftime('%Y-%m-%d')
        except:
            fecha_anterior = None
            fecha_siguiente = None
        
        # Construir consulta SQL
        consulta = """
        SELECT id_evento, fecha_evento, hora_inicio, hora_fin, estado
        FROM eventos
        WHERE id_salon = %s 
        AND estado != 'cancelado'
        AND (
            fecha_evento = %s
            OR (fecha_evento = %s AND hora_fin IS NOT NULL AND hora_inicio IS NOT NULL)
            OR (fecha_evento = %s AND hora_fin IS NOT NULL AND hora_inicio IS NOT NULL)
        )
        """
        params = [salon_id, fecha_evento]
        params.append(fecha_anterior if fecha_anterior else None)
        params.append(fecha_siguiente if fecha_siguiente else None)
        
        if evento_id_excluir:
            consulta += " AND id_evento != %s"
            params.append(evento_id_excluir)
        
        eventos = self.base_datos.obtener_todos(consulta, tuple(params))
        
        for evento in eventos:
            ev_inicio = hora_a_minutos(evento.get('hora_inicio'))
            ev_fin = hora_a_minutos(evento.get('hora_fin'))
            if ev_inicio is None or ev_fin is None:
                # Si no tiene horas, considerar conflicto si es el mismo día
                if str(evento.get('fecha_evento')) == str(fecha_evento):
                    return True
                continue
            
            # Ajustar si cruza medianoche
            if ev_fin < ev_inicio or (ev_inicio >= 12 * 60 and ev_fin < 12 * 60):
                ev_fin += 24 * 60
            
            # Calcular offset según la fecha del evento existente
            ev_fecha = str(evento.get('fecha_evento'))
            fecha_evento_str = str(fecha_evento)
            if ev_fecha == fecha_evento_str:
                offset = 0
            elif fecha_anterior and ev_fecha == fecha_anterior:
                offset = -24 * 60
            elif fecha_siguiente and ev_fecha == fecha_siguiente:
                offset = 24 * 60
            else:
                continue
            
            ev_inicio_abs = ev_inicio + offset
            ev_fin_abs = ev_fin + offset
            
            # Verificar solapamiento: los intervalos se solapan si uno empieza antes de que termine el otro
            if inicio_min < ev_fin_abs and ev_inicio_abs < fin_min:
                return True
        
        return False
    
    def obtener_fechas_ocupadas_salon(self, salon_id):
        """Obtiene las fechas ocupadas para un salón específico"""
        if not salon_id:
            return []
        
        consulta = """
        SELECT DISTINCT fecha_evento
        FROM eventos
        WHERE id_salon = %s 
        AND estado != 'cancelado'
        AND fecha_evento >= CURRENT_DATE
        ORDER BY fecha_evento
        """
        
        resultados = self.base_datos.obtener_todos(consulta, (salon_id,))
        fechas = []
        for resultado in resultados:
            fecha = resultado.get('fecha_evento')
            if fecha:
                # Convertir a string en formato YYYY-MM-DD
                if isinstance(fecha, str):
                    fechas.append(fecha)
                else:
                    fechas.append(str(fecha))
        
        return fechas
    def actualizar_estado_descartado_servicio(self, servicio_id, descartado):
        """Actualiza el estado de descartado de un servicio del evento"""
        consulta = """
        UPDATE evento_servicios
        SET descartado = %s, fecha_actualizacion = NOW()
        WHERE id = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (1 if descartado else 0, servicio_id))
    
    def obtener_porcentaje_avance_servicios(self, evento_id):
        """Calcula el porcentaje de servicios completados para un evento, excluyendo los descartados."""
        consulta = """
        SELECT COUNT(id) AS total_servicios,
               SUM(CASE WHEN completado = TRUE THEN 1 ELSE 0 END) AS servicios_completados
        FROM evento_servicios
        WHERE evento_id = %s AND descartado = FALSE
        """
        resultado = self.base_datos.obtener_uno(consulta, (evento_id,))
        
        if resultado and resultado['total_servicios'] > 0:
            return round((resultado['servicios_completados'] / resultado['total_servicios']) * 100)
        return 0
