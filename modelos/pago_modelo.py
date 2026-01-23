"""
Modelo para gestión de pagos y abonos
"""
from modelos.base_datos import BaseDatos
from modelos.evento_modelo import EventoModelo
from utilidades.logger import obtener_logger
from integraciones.notificaciones_automaticas import NotificacionesAutomaticas
from modelos.evento_modelo import EventoModelo

class PagoModelo:
    """Clase para operaciones CRUD de pagos"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.logger = obtener_logger()
        self._pagos_columnas_cache = None

    def _pagos_tiene_columna(self, nombre):
        if self._pagos_columnas_cache is None:
            try:
                columnas = self.base_datos.obtener_todos("SHOW COLUMNS FROM pagos")
                self._pagos_columnas_cache = {col.get("Field") for col in columnas if col.get("Field")}
            except Exception as e:
                self.logger.warning(f"No se pudieron cargar columnas de pagos: {e}")
                self._pagos_columnas_cache = set()
        return nombre in self._pagos_columnas_cache
    
    def crear_pago(self, datos_pago):
        """Crea un nuevo pago o abono
        
        Valida que el total pagado no exceda el monto total del evento
        """
        evento_id = datos_pago.get('evento_id') or datos_pago.get('id_evento')
        monto = float(datos_pago['monto'])
        tipo_pago = datos_pago.get('tipo_pago', 'abono')
        
        self.logger.info(f"Iniciando registro de pago - Evento ID: {evento_id}, Monto: ${monto:.2f}, Tipo: {tipo_pago}")

        if tipo_pago == 'reembolso':
            total_pagado_actual = self.obtener_total_pagado_evento(evento_id)
            total_reembolsos_actual = self.obtener_total_reembolsos_evento(evento_id)
            saldo_por_reembolsar = total_pagado_actual - total_reembolsos_actual
            if monto > saldo_por_reembolsar:
                error_msg = (
                    f"El reembolso excede el total pagado. "
                    f"Pagado: ${total_pagado_actual:.2f}, "
                    f"Reembolsado: ${total_reembolsos_actual:.2f}, "
                    f"Disponible: ${saldo_por_reembolsar:.2f}"
                )
                self.logger.warning(f"Validación reembolso fallida: {error_msg}")
                raise ValueError(error_msg)
        
        # Validar que no se exceda el monto total (solo para abonos y pagos completos, no reembolsos)
        if tipo_pago != 'reembolso':
            # Obtener información del evento
           
            evento_modelo = EventoModelo()
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            
            if not evento:
                self.logger.error(f"Evento {evento_id} no encontrado al intentar registrar pago")
                raise ValueError(f"Evento {evento_id} no encontrado")
            
            precio_total = float(evento.get('total', evento.get('precio_total', 0)) or 0)
            total_pagado_actual = self.obtener_total_pagado_evento(evento_id)
            nuevo_total_pagado = total_pagado_actual + monto
            
            self.logger.debug(f"Validación de pago - Total actual: ${total_pagado_actual:.2f}, Monto a agregar: ${monto:.2f}, Precio total evento: ${precio_total:.2f}")
            
            # Validar que no se exceda el monto total
            if nuevo_total_pagado > precio_total:
                error_msg = (
                    f"No se puede registrar el pago. "
                    f"Total pagado actual: ${total_pagado_actual:.2f}, "
                    f"Monto a agregar: ${monto:.2f}, "
                    f"Total sería: ${nuevo_total_pagado:.2f}, "
                    f"pero el monto total del evento es: ${precio_total:.2f}"
                )
                self.logger.warning(f"Validación fallida - Intentando exceder monto total: {error_msg}")
                raise ValueError(error_msg)
            
            # Si ya está pagado completamente, no permitir más abonos
            if total_pagado_actual >= precio_total and precio_total > 0:
                error_msg = (
                    f"El evento ya está completamente pagado. "
                    f"Total pagado: ${total_pagado_actual:.2f}, "
                    f"Monto total: ${precio_total:.2f}"
                )
                self.logger.warning(f"Validación fallida - Evento ya completamente pagado: {error_msg}")
                raise ValueError(error_msg)
        
        # Usar id_evento en lugar de evento_id (nombre real de la columna)
        # Origen: 'web' para aplicación web, 'desktop' para aplicación de escritorio
        origen = datos_pago.get('origen', 'desktop')  # Por defecto 'desktop' para compatibilidad
        if self._pagos_tiene_columna("origen"):
            consulta = """
            INSERT INTO pagos (id_evento, monto, tipo_pago, metodo_pago, numero_referencia, 
                              fecha_pago, observaciones, usuario_registro_id, origen)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            parametros = (
                evento_id,
                monto,
                tipo_pago,
                datos_pago['metodo_pago'],
                datos_pago.get('numero_referencia'),
                datos_pago['fecha_pago'],
                datos_pago.get('observaciones'),
                datos_pago.get('usuario_registro_id'),
                origen
            )
        else:
            consulta = """
            INSERT INTO pagos (id_evento, monto, tipo_pago, metodo_pago, numero_referencia, 
                              fecha_pago, observaciones, usuario_registro_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            parametros = (
                evento_id,
                monto,
                tipo_pago,
                datos_pago['metodo_pago'],
                datos_pago.get('numero_referencia'),
                datos_pago['fecha_pago'],
                datos_pago.get('observaciones'),
                datos_pago.get('usuario_registro_id'),
            )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            # Obtener el último ID insertado (puede ser id_pago o id)
            pago_id = self.base_datos.obtener_ultimo_id()
            self.logger.info(f"Pago registrado exitosamente - ID: {pago_id}, Evento: {evento_id}, Monto: ${monto:.2f}, Tipo: {tipo_pago}")
            # El trigger actualizará automáticamente el saldo pendiente del evento
            
            # Enviar notificación automática
            try:
                evento_id = datos_pago.get('evento_id') or datos_pago.get('id_evento')
                
                # Verificar si es pago completo
                total_pagado = self.obtener_total_pagado_evento(evento_id)
                precio_total = self._obtener_precio_total_evento(evento_id)
                
                # Obtener datos del evento
                
                evento_modelo = EventoModelo()
                evento = evento_modelo.obtener_evento_por_id(evento_id)
                
                if evento:
                    # Determinar tipo de pago
                    if precio_total > 0 and total_pagado >= precio_total:
                        tipo_notif = 'pago_completo'
                    elif datos_pago.get('tipo_pago') == 'reembolso':
                        tipo_notif = 'reembolso'
                    else:
                        tipo_notif = 'abono'
                    
                    # Enviar notificación automáticamente
                    from integraciones.notificaciones_automaticas import NotificacionesAutomaticas
                    notif = NotificacionesAutomaticas()
                    saldo_pendiente = float(evento.get('saldo', 0) or 0)
                    
                    notif.enviar_notificacion_pago(
                        evento=evento,
                        monto=float(monto),
                        tipo_pago=tipo_notif,
                        metodo_pago=datos_pago.get('metodo_pago', ''),
                        fecha_pago=str(datos_pago.get('fecha_pago', '')),
                        saldo_pendiente=saldo_pendiente
                    )
                    self.logger.debug(f"Notificación enviada para pago ID: {pago_id}, Tipo: {tipo_notif}")
            except Exception as e:
                self.logger.error(f"Error al enviar notificación de pago ID {pago_id}: {str(e)}")
                import traceback
                self.logger.debug(f"Traceback notificación: {traceback.format_exc()}")

            return pago_id
        detalle_error = getattr(self.base_datos, "ultimo_error", None)
        if detalle_error:
            self.logger.error(
                f"Error al ejecutar consulta de inserción de pago - Evento: {evento_id}, "
                f"Monto: ${monto:.2f}, Detalle: {detalle_error}"
            )
        else:
            self.logger.error(f"Error al ejecutar consulta de inserción de pago - Evento: {evento_id}, Monto: ${monto:.2f}")
        return None
    
    def _obtener_precio_total_evento(self, evento_id):
        """Obtiene el precio total de un evento"""
        from modelos.evento_modelo import EventoModelo
        evento_modelo = EventoModelo()
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        if evento:
            return float(evento.get('total', evento.get('precio_total', 0)) or 0)
        return 0
    
    
    def obtener_pago_por_id(self, pago_id):
        """Obtiene un pago por su ID"""
        # La tabla pagos usa 'id' como clave primaria
        consulta = "SELECT * FROM pagos WHERE id = %s LIMIT 1"
        resultado = self.base_datos.obtener_uno(consulta, (pago_id,))
        if resultado:
            self.logger.debug(f"Pago obtenido por ID: {pago_id}")
        else:
            self.logger.debug(f"Pago ID {pago_id} no encontrado")
        return resultado
    
    def obtener_pagos_por_evento(self, evento_id):
        """Obtiene todos los pagos de un evento"""
        consulta = """
        SELECT p.*, u.nombre_completo as nombre_registro
        FROM pagos p
        LEFT JOIN usuarios u ON p.usuario_registro_id = u.id
        WHERE p.id_evento = %s
        ORDER BY p.fecha_pago DESC
        """
        return self.base_datos.obtener_todos(consulta, (evento_id,))
    
    def obtener_total_pagado_evento(self, evento_id):
        """Calcula el total pagado de un evento"""
        consulta = """
        SELECT COALESCE(SUM(monto), 0) as total_pagado
        FROM pagos
        WHERE id_evento = %s AND tipo_pago != 'reembolso'
        """
        resultado = self.base_datos.obtener_uno(consulta, (evento_id,))
        return float(resultado['total_pagado']) if resultado else 0.0

    def obtener_total_pagos(self):
        """Obtiene el total de pagos registrados"""
        consulta = "SELECT COUNT(*) as total_pagos FROM pagos"
        resultado = self.base_datos.obtener_uno(consulta)
        return int(resultado['total_pagos']) if resultado else 0

    def obtener_total_pagado_global(self):
        """Calcula el total pagado global (sin reembolsos)"""
        consulta = """
        SELECT COALESCE(SUM(monto), 0) as total_pagado
        FROM pagos
        WHERE tipo_pago != 'reembolso'
        """
        resultado = self.base_datos.obtener_uno(consulta)
        return float(resultado['total_pagado']) if resultado else 0.0
    
    def obtener_total_reembolsos_evento(self, evento_id):
        """Calcula el total de reembolsos de un evento"""
        consulta = """
        SELECT COALESCE(SUM(monto), 0) as total_reembolsos
        FROM pagos
        WHERE id_evento = %s AND tipo_pago = 'reembolso'
        """
        resultado = self.base_datos.obtener_uno(consulta, (evento_id,))
        return float(resultado['total_reembolsos']) if resultado else 0.0
    
    def actualizar_saldo_evento(self, evento_id):
        """Actualiza el saldo pendiente de un evento basado en los pagos
        NOTA: Los triggers de MySQL ahora se encargan de esto automáticamente,
        pero mantenemos este método por compatibilidad"""
        from modelos.evento_modelo import EventoModelo
        evento_modelo = EventoModelo()
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        
        if evento:
            precio_total = float(evento.get('total') or evento.get('precio_total') or 0)
            total_pagado = self.obtener_total_pagado_evento(evento_id)
            total_reembolsos = self.obtener_total_reembolsos_evento(evento_id)
            saldo_pendiente = precio_total - total_pagado + total_reembolsos
            
            evento_modelo.actualizar_saldo_pendiente(evento_id, saldo_pendiente)
    
    def eliminar_pago(self, pago_id):
        """Elimina un pago y actualiza el saldo del evento
        NOTA: El trigger se encargará automáticamente de actualizar el saldo"""
        self.logger.info(f"Iniciando eliminación de pago ID: {pago_id}")
        
        # La tabla pagos usa 'id' como clave primaria
        consulta = "SELECT id_evento FROM pagos WHERE id = %s LIMIT 1"
        pago = self.base_datos.obtener_uno(consulta, (pago_id,))
        
        if pago:
            evento_id = pago.get('id_evento')
            if evento_id:
                consulta_delete = "DELETE FROM pagos WHERE id = %s LIMIT 1"
                if self.base_datos.ejecutar_consulta(consulta_delete, (pago_id,)):
                    self.logger.info(f"Pago eliminado exitosamente - ID: {pago_id}, Evento: {evento_id}")
                    # El trigger actualizará automáticamente, pero mantenemos esto por compatibilidad
                    try:
                        self.actualizar_saldo_evento(evento_id)
                    except Exception as e:
                        self.logger.warning(f"Error al actualizar saldo del evento {evento_id} después de eliminar pago: {str(e)}")
                    return True
                else:
                    self.logger.error(f"Error al ejecutar consulta de eliminación de pago ID: {pago_id}")
            else:
                self.logger.warning(f"Pago ID {pago_id} no tiene evento_id asociado")
        else:
            self.logger.warning(f"Pago ID {pago_id} no encontrado para eliminar")
        return False
    
    def obtener_resumen_pagos_periodo(self, fecha_inicio, fecha_fin):
        """Obtiene un resumen de pagos en un período"""
        consulta = """
        SELECT 
            metodo_pago,
            tipo_pago,
            COUNT(*) as cantidad,
            SUM(monto) as total
        FROM pagos
        WHERE fecha_pago BETWEEN %s AND %s
        GROUP BY metodo_pago, tipo_pago
        """
        return self.base_datos.obtener_todos(consulta, (fecha_inicio, fecha_fin))

