"""
Modelo para gestión de eventos
"""
from datetime import timedelta
from modelos.base_datos import BaseDatos
from modelos.inventario_modelo import InventarioModelo
from utilidades.logger import obtener_logger


class EventoModelo:
    """Clase para operaciones CRUD de eventos"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.inventario = InventarioModelo()
        self.logger = obtener_logger()
    
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
            
            # Gestionar inventario según el estado del evento
            estado = datos_evento.get('estado', 'cotizacion')
            plan_id = datos_evento.get('plan_id')
            
            if estado in ('confirmado', 'en_proceso') and plan_id:
                # Reservar stock del plan para eventos confirmados
                try:
                    ok, error = self.inventario.reservar_stock_plan(plan_id, evento_id)
                    if not ok:
                        self.logger.warning(f"Error al reservar stock del plan {plan_id} para evento {evento_id}: {error}")
                except Exception as e:
                    self.logger.error(f"Error al gestionar inventario al crear evento: {e}")
            
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
        # Ordenar por ID descendente (más reciente primero)
        consulta += " ORDER BY e.id_evento DESC"
        
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

    def obtener_eventos_por_rango(self, fecha_desde=None, fecha_hasta=None):
        """Obtiene eventos filtrados por rango de fechas"""
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
        
        if fecha_desde and fecha_hasta:
            consulta += " AND e.fecha_evento BETWEEN %s AND %s"
            parametros.extend([fecha_desde, fecha_hasta])
        elif fecha_desde:
            consulta += " AND e.fecha_evento >= %s"
            parametros.append(fecha_desde)
        elif fecha_hasta:
            consulta += " AND e.fecha_evento <= %s"
            parametros.append(fecha_hasta)
        
        consulta += " ORDER BY e.id_evento DESC"
        
        if parametros:
            resultados = self.base_datos.obtener_todos(consulta, tuple(parametros))
        else:
            resultados = self.base_datos.obtener_todos(consulta)
        
        # Usar el mismo mapeo que obtener_todos_eventos
        eventos_mapeados = []
        for evento in resultados:
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
            
            fecha_evento = evento.get('fecha_evento')
            if fecha_evento is not None and not isinstance(fecha_evento, str):
                fecha_evento = str(fecha_evento)
            
            evento_mapeado = {
                'id_evento': evento.get('id_evento', evento.get('id')),
                'id': evento.get('id_evento', evento.get('id')),
                'id_salon': evento.get('id_salon'),
                'salon_id': evento.get('id_salon'),
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
        ORDER BY e.id_evento DESC
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
        ORDER BY e.id_evento DESC
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
        resultado = self.base_datos.ejecutar_consulta(consulta, parametros)
        
        # Gestionar inventario si cambió el estado o el plan
        if resultado:
            estado_anterior = evento_actual.get('estado')
            estado_nuevo = datos_evento.get('estado', estado_anterior)
            plan_anterior = evento_actual.get('plan_id')
            plan_nuevo = plan_id
            
            try:
                # Si cambió el estado, gestionar inventario
                if estado_anterior != estado_nuevo:
                    self._gestionar_inventario_por_estado(evento_id, estado_anterior, estado_nuevo, plan_anterior, plan_nuevo)
                # Si cambió el plan pero el estado sigue siendo confirmado
                elif plan_anterior != plan_nuevo and estado_nuevo in ('confirmado', 'en_proceso'):
                    # Liberar stock del plan anterior
                    if plan_anterior:
                        self.inventario.liberar_stock_plan(plan_anterior, evento_id)
                    # Reservar stock del nuevo plan
                    if plan_nuevo:
                        ok, error = self.inventario.reservar_stock_plan(plan_nuevo, evento_id)
                        if not ok:
                            self.logger.warning(f"Error al reservar stock del nuevo plan {plan_nuevo}: {error}")
            except Exception as e:
                self.logger.error(f"Error al gestionar inventario al actualizar evento: {e}")
        
        return resultado

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
        plan_id = evento_actual.get('plan_id') if evento_actual else None
        
        # Actualizar estado
        consulta = "UPDATE eventos SET estado = %s WHERE id_evento = %s"
        resultado = self.base_datos.ejecutar_consulta(consulta, (nuevo_estado, evento_id))
        
        # Gestionar inventario si el estado cambió
        if resultado and estado_anterior and estado_anterior != nuevo_estado:
            try:
                self._gestionar_inventario_por_estado(evento_id, estado_anterior, nuevo_estado, plan_id, plan_id)
            except Exception as e:
                self.logger.error(f"Error al gestionar inventario al cambiar estado: {e}")
            
            # Enviar notificación
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
                self.logger.error(f"Error al enviar notificación de cambio de estado: {e}")
        
        return resultado
    
    def _gestionar_inventario_por_estado(self, evento_id, estado_anterior, estado_nuevo, plan_anterior, plan_nuevo):
        """Gestiona el inventario según el cambio de estado del evento"""
        # Estados que requieren reserva de stock
        estados_reservados = ('confirmado', 'en_proceso')
        # Estados que liberan stock
        estados_liberados = ('cancelado', 'cotizacion')
        
        # Si pasa de un estado que no reserva a uno que sí reserva
        if estado_anterior not in estados_reservados and estado_nuevo in estados_reservados:
            # Reservar stock del plan
            if plan_nuevo:
                ok, error = self.inventario.reservar_stock_plan(plan_nuevo, evento_id)
                if not ok:
                    self.logger.warning(f"Error al reservar stock del plan {plan_nuevo}: {error}")
            
            # Reservar stock de productos adicionales
            productos = self.obtener_productos_evento(evento_id)
            for producto in productos or []:
                producto_id = producto.get('producto_id')
                cantidad = int(producto.get('cantidad') or 1)
                ok, error = self.inventario.reservar_stock(producto_id, evento_id, cantidad)
                if not ok:
                    self.logger.warning(f"Error al reservar stock del producto {producto_id}: {error}")
        
        # Si pasa de un estado que reserva a uno que libera
        elif estado_anterior in estados_reservados and estado_nuevo in estados_liberados:
            # Liberar stock del plan
            if plan_anterior:
                self.inventario.liberar_stock_plan(plan_anterior, evento_id)
            
            # Liberar stock de productos adicionales
            productos = self.obtener_productos_evento(evento_id)
            for producto in productos or []:
                producto_id = producto.get('producto_id')
                cantidad = int(producto.get('cantidad') or 1)
                self.inventario.liberar_stock(producto_id, evento_id, cantidad)
    
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
        """Elimina un evento y sus pagos asociados, liberando inventario"""
        # Obtener información del evento antes de eliminar
        evento = self.obtener_evento_por_id(evento_id)
        if evento:
            estado = evento.get('estado')
            plan_id = evento.get('plan_id')
            
            # Si el evento estaba confirmado, liberar stock
            if estado in ('confirmado', 'en_proceso'):
                try:
                    # Liberar stock del plan
                    if plan_id:
                        self.inventario.liberar_stock_plan(plan_id, evento_id)
                    
                    # Liberar stock de productos adicionales
                    productos = self.obtener_productos_evento(evento_id)
                    for producto in productos or []:
                        producto_id = producto.get('producto_id')
                        cantidad = int(producto.get('cantidad') or 1)
                        self.inventario.liberar_stock(producto_id, evento_id, cantidad)
                except Exception as e:
                    self.logger.error(f"Error al liberar inventario al eliminar evento: {e}")
        
        # Eliminar pagos primero por la restricción de clave foránea
        eliminar_pagos = "DELETE FROM pagos WHERE id_evento = %s"
        self.base_datos.ejecutar_consulta(eliminar_pagos, (evento_id,))

        consulta = "DELETE FROM eventos WHERE id_evento = %s"
        return self.base_datos.ejecutar_consulta(consulta, (evento_id,))
    
    def agregar_producto_evento(self, evento_id, producto_id, cantidad, precio_unitario):
        """Agrega un producto a un evento y reserva stock si el evento está confirmado"""
        # Verificar estado del evento
        evento = self.obtener_evento_por_id(evento_id)
        if not evento:
            return False
        
        estado = evento.get('estado')
        
        # Si el evento está confirmado, validar y reservar stock
        if estado in ('confirmado', 'en_proceso'):
            ok, error = self.inventario.validar_stock_suficiente(producto_id, cantidad)
            if not ok:
                self.logger.warning(f"No se puede agregar producto {producto_id}: {error}")
                return False
            
            ok, error = self.inventario.reservar_stock(producto_id, evento_id, cantidad)
            if not ok:
                self.logger.warning(f"Error al reservar stock del producto {producto_id}: {error}")
                return False
        
        subtotal = cantidad * precio_unitario
        consulta = """
        INSERT INTO evento_productos (id_evento, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (%s, %s, %s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(consulta, (evento_id, producto_id, cantidad, precio_unitario, subtotal))
    
    def eliminar_producto_evento(self, evento_id, producto_id):
        """Elimina un producto de un evento y libera stock si el evento está confirmado"""
        # Obtener cantidad antes de eliminar
        consulta_cantidad = """
        SELECT cantidad FROM evento_productos
        WHERE id_evento = %s AND producto_id = %s
        """
        producto_data = self.base_datos.obtener_uno(consulta_cantidad, (evento_id, producto_id))
        cantidad = int(producto_data.get('cantidad') or 1) if producto_data else 1
        
        # Verificar estado del evento
        evento = self.obtener_evento_por_id(evento_id)
        if evento:
            estado = evento.get('estado')
            
            # Si el evento está confirmado, liberar stock
            if estado in ('confirmado', 'en_proceso'):
                try:
                    self.inventario.liberar_stock(producto_id, evento_id, cantidad)
                except Exception as e:
                    self.logger.error(f"Error al liberar stock al eliminar producto: {e}")
        
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

    def actualizar_servicio_evento(self, servicio_id, completado=None, descartado=None):
        """Actualiza el estado de un servicio del evento"""
        campos = []
        parametros = []
        if completado is not None:
            campos.append("completado = %s")
            parametros.append(1 if completado else 0)
        if descartado is not None:
            campos.append("descartado = %s")
            parametros.append(1 if descartado else 0)
        if campos:
            campos.append("fecha_actualizacion = NOW()")
            parametros.append(servicio_id)
            consulta = f"""
            UPDATE evento_servicios
            SET {", ".join(campos)}
            WHERE id = %s
            """
            return self.base_datos.ejecutar_consulta(consulta, tuple(parametros))
        return False

    def crear_servicio_personalizado(self, evento_id, nombre, orden=None):
        """Crea un servicio personalizado para un evento (sin plan_servicio_id)"""
        # Obtener el siguiente orden si no se proporciona
        if orden is None:
            consulta_max = """
            SELECT COALESCE(MAX(orden), 0) as max_orden
            FROM evento_servicios
            WHERE evento_id = %s
            """
            max_orden = self.base_datos.obtener_uno(consulta_max, (evento_id,)) or {}
            orden = (max_orden.get('max_orden') or 0) + 1
        
        consulta = """
        INSERT INTO evento_servicios (evento_id, plan_servicio_id, nombre, orden, completado, descartado)
        VALUES (%s, NULL, %s, %s, 0, 0)
        """
        if self.base_datos.ejecutar_consulta(consulta, (evento_id, nombre, orden)):
            return self.base_datos.obtener_ultimo_id()
        return None

    def eliminar_servicio_evento(self, servicio_id):
        """Elimina un servicio del evento"""
        consulta = "DELETE FROM evento_servicios WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (servicio_id,))

    def actualizar_orden_servicio(self, servicio_id, nuevo_orden):
        """Actualiza el orden de un servicio"""
        consulta = """
        UPDATE evento_servicios
        SET orden = %s, fecha_actualizacion = NOW()
        WHERE id = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (nuevo_orden, servicio_id))

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

    def completar_evento_con_observaciones(self, evento_id, datos_finalizacion, usuario_id=None):
        """
        Completa un evento registrando observaciones y daños si aplica.
        
        Args:
            evento_id: ID del evento
            datos_finalizacion: dict con:
                - observacion_finalizacion: str (observación general)
                - tiene_danos: bool
                - descripcion_danos: str (descripción general de daños)
                - costo_danos: float
                - cobrar_danos: bool
                - danos_detalle: list[dict] (lista de daños individuales, opcional)
            usuario_id: ID del usuario que registra la finalización
        """
        try:
            evento = self.obtener_evento_por_id(evento_id)
            if not evento:
                return False, "Evento no encontrado"
            
            estado_anterior = evento.get('estado')
            
            # Verificar que no esté ya completado
            if estado_anterior == 'completado':
                return False, "El evento ya está completado"
            
            # Extraer datos
            observacion = datos_finalizacion.get('observacion_finalizacion', '')
            tiene_danos = datos_finalizacion.get('tiene_danos', False)
            descripcion_danos = datos_finalizacion.get('descripcion_danos', '')
            costo_danos = float(datos_finalizacion.get('costo_danos', 0) or 0)
            cobrar_danos = datos_finalizacion.get('cobrar_danos', False)
            
            # Actualizar evento con datos de finalización
            consulta = """
            UPDATE eventos 
            SET estado = 'completado',
                observacion_finalizacion = %s,
                tiene_danos = %s,
                descripcion_danos = %s,
                costo_danos = %s,
                cobrar_danos = %s,
                fecha_finalizacion = NOW()
            WHERE id_evento = %s
            """
            self.base_datos.ejecutar_consulta(consulta, (
                observacion,
                tiene_danos,
                descripcion_danos if tiene_danos else None,
                costo_danos if tiene_danos else 0,
                cobrar_danos if tiene_danos else False,
                evento_id
            ))
            
            # Si hay daños detallados, registrarlos
            danos_detalle = datos_finalizacion.get('danos_detalle', [])
            if tiene_danos and danos_detalle:
                for dano in danos_detalle:
                    self.registrar_dano_evento(evento_id, dano, usuario_id)
            
            # Nota: Los daños ahora se manejan por separado con su propio estado de pago
            # Ya no se agregan como producto adicional al evento
            # El cobro de daños se gestiona con los campos: danos_pagados, monto_pagado_danos, etc.
            
            # Gestionar inventario
            plan_id = evento.get('plan_id')
            if estado_anterior and estado_anterior != 'completado':
                try:
                    self._gestionar_inventario_por_estado(evento_id, estado_anterior, 'completado', plan_id, plan_id)
                except Exception as e:
                    self.logger.error(f"Error al gestionar inventario al completar: {e}")
            
            # Enviar notificación de cambio de estado
            try:
                evento_actualizado = self.obtener_evento_por_id(evento_id)
                if evento_actualizado:
                    from integraciones.notificaciones_automaticas import NotificacionesAutomaticas
                    notif = NotificacionesAutomaticas()
                    notif.enviar_notificacion_cambio_estado(
                        evento=evento_actualizado,
                        estado_anterior=estado_anterior,
                        estado_nuevo='completado'
                    )
            except Exception as e:
                self.logger.error(f"Error al enviar notificación de evento completado: {e}")
            
            return True, "Evento completado exitosamente"
            
        except Exception as e:
            self.logger.error(f"Error al completar evento con observaciones: {e}")
            return False, str(e)
    
    def registrar_dano_evento(self, evento_id, dano_data, usuario_id=None):
        """
        Registra un daño específico para un evento.
        
        Args:
            evento_id: ID del evento
            dano_data: dict con descripcion, item_danado, cantidad, costo_unitario, cobrar_cliente, observaciones
            usuario_id: ID del usuario que registra
        """
        try:
            # Verificar si existe la tabla evento_danos
            check_tabla = """
            SELECT COUNT(*) as existe FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'evento_danos'
            """
            resultado = self.base_datos.obtener_uno(check_tabla)
            if not resultado or resultado.get('existe', 0) == 0:
                self.logger.warning("Tabla evento_danos no existe, saltando registro de daño")
                return None
            
            descripcion = dano_data.get('descripcion', '')
            item_danado = dano_data.get('item_danado', '')
            cantidad = int(dano_data.get('cantidad', 1) or 1)
            costo_unitario = float(dano_data.get('costo_unitario', 0) or 0)
            costo_total = cantidad * costo_unitario
            cobrar_cliente = dano_data.get('cobrar_cliente', False)
            observaciones = dano_data.get('observaciones', '')
            
            consulta = """
            INSERT INTO evento_danos 
            (id_evento, descripcion, item_danado, cantidad, costo_unitario, costo_total, cobrar_cliente, observaciones, registrado_por)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            return self.base_datos.ejecutar_consulta(consulta, (
                evento_id, descripcion, item_danado, cantidad, 
                costo_unitario, costo_total, cobrar_cliente, observaciones, usuario_id
            ))
        except Exception as e:
            self.logger.error(f"Error al registrar daño: {e}")
            return None
    
    def obtener_danos_evento(self, evento_id):
        """Obtiene todos los daños registrados para un evento."""
        try:
            # Verificar si existe la tabla
            check_tabla = """
            SELECT COUNT(*) as existe FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'evento_danos'
            """
            resultado = self.base_datos.obtener_uno(check_tabla)
            if not resultado or resultado.get('existe', 0) == 0:
                return []
            
            consulta = """
            SELECT ed.*, u.nombre_completo as registrado_por_nombre
            FROM evento_danos ed
            LEFT JOIN usuarios u ON ed.registrado_por = u.id
            WHERE ed.id_evento = %s
            ORDER BY ed.fecha_registro DESC
            """
            return self.base_datos.obtener_todos(consulta, (evento_id,)) or []
        except Exception as e:
            self.logger.error(f"Error al obtener daños del evento: {e}")
            return []
    
    def _agregar_cargo_danos(self, evento_id, monto, descripcion):
        """
        Agrega un cargo por daños como producto adicional al evento.
        """
        try:
            # Buscar o crear el producto de cargo por daños
            consulta_producto = """
            SELECT id FROM productos WHERE nombre = 'Cargo por daños' LIMIT 1
            """
            producto = self.base_datos.obtener_uno(consulta_producto)
            
            if not producto:
                # Crear el producto si no existe
                consulta_crear = """
                INSERT INTO productos (nombre, descripcion, precio, tipo_servicio, activo)
                VALUES ('Cargo por daños', 'Cargo aplicado por daños causados durante el evento', 0, 'servicio', TRUE)
                """
                self.base_datos.ejecutar_consulta(consulta_crear)
                producto = self.base_datos.obtener_uno(consulta_producto)
            
            if producto:
                producto_id = producto['id']
                
                # Verificar si ya existe un cargo por daños para este evento
                consulta_existe = """
                SELECT id FROM evento_productos 
                WHERE id_evento = %s AND producto_id = %s
                """
                existe = self.base_datos.obtener_uno(consulta_existe, (evento_id, producto_id))
                
                if existe:
                    # Actualizar el cargo existente
                    consulta_update = """
                    UPDATE evento_productos 
                    SET cantidad = 1, precio_unitario = %s, subtotal = %s, observaciones = %s
                    WHERE id_evento = %s AND producto_id = %s
                    """
                    self.base_datos.ejecutar_consulta(consulta_update, (monto, monto, descripcion, evento_id, producto_id))
                else:
                    # Insertar nuevo cargo
                    consulta_insert = """
                    INSERT INTO evento_productos (id_evento, producto_id, cantidad, precio_unitario, subtotal, observaciones)
                    VALUES (%s, %s, 1, %s, %s, %s)
                    """
                    self.base_datos.ejecutar_consulta(consulta_insert, (evento_id, producto_id, monto, monto, descripcion))
                
                # Recalcular total del evento
                self.calcular_total_evento(evento_id)
                
                self.logger.info(f"Cargo por daños de ${monto} agregado al evento {evento_id}")
                return True
                
        except Exception as e:
            self.logger.error(f"Error al agregar cargo por daños: {e}")
            return False
    
    def obtener_info_finalizacion(self, evento_id):
        """Obtiene la información de finalización de un evento."""
        try:
            # Verificar si existen las columnas
            check_columna = """
            SELECT COUNT(*) as existe FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'eventos' AND column_name = 'observacion_finalizacion'
            """
            resultado = self.base_datos.obtener_uno(check_columna)
            
            if not resultado or resultado.get('existe', 0) == 0:
                return None
            
            consulta = """
            SELECT observacion_finalizacion, tiene_danos, descripcion_danos, 
                   costo_danos, cobrar_danos, fecha_finalizacion,
                   danos_pagados, monto_pagado_danos, fecha_pago_danos, 
                   metodo_pago_danos, observaciones_pago_danos
            FROM eventos
            WHERE id_evento = %s
            """
            return self.base_datos.obtener_uno(consulta, (evento_id,))
        except Exception as e:
            self.logger.error(f"Error al obtener info de finalización: {e}")
            return None

    def registrar_pago_danos(self, evento_id, monto, metodo_pago='efectivo', observaciones=''):
        """
        Registra el pago de daños de un evento.
        
        Args:
            evento_id: ID del evento
            monto: Monto pagado
            metodo_pago: Método de pago (efectivo, transferencia, tarjeta, etc.)
            observaciones: Observaciones del pago
        """
        try:
            # Verificar que el evento exista y tenga daños por cobrar
            evento = self.obtener_evento_por_id(evento_id)
            if not evento:
                return False, "Evento no encontrado"
            
            if not evento.get('tiene_danos'):
                return False, "El evento no tiene daños registrados"
            
            if not evento.get('cobrar_danos'):
                return False, "Los daños de este evento no están marcados para cobrar al cliente"
            
            costo_danos = float(evento.get('costo_danos') or 0)
            monto_pagado_actual = float(evento.get('monto_pagado_danos') or 0)
            monto = float(monto)
            
            if monto <= 0:
                return False, "El monto debe ser mayor a 0"
            
            nuevo_monto_pagado = monto_pagado_actual + monto
            danos_pagados = nuevo_monto_pagado >= costo_danos
            
            # Verificar si existen las columnas
            check_columna = """
            SELECT COUNT(*) as existe FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'eventos' AND column_name = 'danos_pagados'
            """
            resultado = self.base_datos.obtener_uno(check_columna)
            
            if not resultado or resultado.get('existe', 0) == 0:
                return False, "Campos de pago de daños no disponibles. Ejecute el script SQL actualizado."
            
            consulta = """
            UPDATE eventos 
            SET danos_pagados = %s,
                monto_pagado_danos = %s,
                fecha_pago_danos = NOW(),
                metodo_pago_danos = %s,
                observaciones_pago_danos = %s
            WHERE id_evento = %s
            """
            self.base_datos.ejecutar_consulta(consulta, (
                danos_pagados,
                nuevo_monto_pagado,
                metodo_pago,
                observaciones,
                evento_id
            ))
            
            self.logger.info(f"Pago de daños registrado para evento {evento_id}: ${monto} ({metodo_pago})")
            
            return True, "Pago de daños registrado exitosamente"
            
        except Exception as e:
            self.logger.error(f"Error al registrar pago de daños: {e}")
            return False, str(e)

    def obtener_eventos_con_danos_pendientes(self):
        """Obtiene eventos con daños pendientes de pago"""
        try:
            # Verificar si existen las columnas
            check_columna = """
            SELECT COUNT(*) as existe FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'eventos' AND column_name = 'danos_pagados'
            """
            resultado = self.base_datos.obtener_uno(check_columna)
            
            if not resultado or resultado.get('existe', 0) == 0:
                return []
            
            consulta = """
            SELECT e.id_evento, e.nombre_evento, e.fecha_evento, e.fecha_finalizacion,
                   e.descripcion_danos, e.costo_danos, e.monto_pagado_danos,
                   (e.costo_danos - COALESCE(e.monto_pagado_danos, 0)) as saldo_danos,
                   u.nombre_completo as nombre_cliente, u.telefono, u.email
            FROM eventos e
            JOIN clientes c ON e.id_cliente = c.id
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE e.tiene_danos = TRUE 
            AND e.cobrar_danos = TRUE 
            AND (e.danos_pagados = FALSE OR e.danos_pagados IS NULL)
            ORDER BY e.fecha_finalizacion DESC
            """
            return self.base_datos.obtener_todos(consulta) or []
        except Exception as e:
            self.logger.error(f"Error al obtener eventos con daños pendientes: {e}")
            return []

    def obtener_resumen_danos(self, fecha_inicio=None, fecha_fin=None):
        """Obtiene resumen de daños para reportes"""
        try:
            # Verificar si existen las columnas
            check_columna = """
            SELECT COUNT(*) as existe FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'eventos' AND column_name = 'danos_pagados'
            """
            resultado = self.base_datos.obtener_uno(check_columna)
            
            if not resultado or resultado.get('existe', 0) == 0:
                return {}
            
            where_fecha = ""
            params = []
            if fecha_inicio and fecha_fin:
                where_fecha = "AND e.fecha_finalizacion BETWEEN %s AND %s"
                params = [fecha_inicio, fecha_fin]
            
            consulta = f"""
            SELECT 
                COUNT(*) as total_eventos_con_danos,
                SUM(e.costo_danos) as costo_total_danos,
                SUM(CASE WHEN e.cobrar_danos = TRUE THEN e.costo_danos ELSE 0 END) as total_a_cobrar,
                SUM(CASE WHEN e.cobrar_danos = FALSE THEN e.costo_danos ELSE 0 END) as total_asumido_empresa,
                SUM(COALESCE(e.monto_pagado_danos, 0)) as total_pagado,
                SUM(CASE WHEN e.cobrar_danos = TRUE THEN (e.costo_danos - COALESCE(e.monto_pagado_danos, 0)) ELSE 0 END) as total_pendiente,
                COUNT(CASE WHEN e.cobrar_danos = TRUE AND (e.danos_pagados = FALSE OR e.danos_pagados IS NULL) THEN 1 END) as eventos_pendientes_pago
            FROM eventos e
            WHERE e.tiene_danos = TRUE
            {where_fecha}
            """
            return self.base_datos.obtener_uno(consulta, tuple(params)) or {}
        except Exception as e:
            self.logger.error(f"Error al obtener resumen de daños: {e}")
            return {}
