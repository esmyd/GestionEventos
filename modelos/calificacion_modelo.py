"""
Modelo para gestionar calificaciones de eventos
"""
import logging
from datetime import datetime
from modelos.base_datos import BaseDatos

class CalificacionModelo:
    def __init__(self):
        self.base_datos = BaseDatos()
        self.logger = logging.getLogger(__name__)

    def _tabla_existe(self):
        """Verifica si la tabla de calificaciones existe"""
        consulta = """
        SELECT COUNT(*) as existe FROM information_schema.tables 
        WHERE table_schema = DATABASE() AND table_name = 'calificaciones_eventos'
        """
        resultado = self.base_datos.obtener_uno(consulta)
        return resultado and resultado.get('existe', 0) > 0

    def crear_solicitud_calificacion(self, evento_id, cliente_id):
        """Crea un registro de solicitud de calificación pendiente"""
        # Usar logger global para asegurar que se registre
        from utilidades.logger import obtener_logger
        logger = obtener_logger()
        
        logger.info(f"[CALIFICACION] Creando solicitud para evento {evento_id}, cliente {cliente_id}")
        
        tabla_existe = self._tabla_existe()
        logger.info(f"[CALIFICACION] Tabla existe: {tabla_existe}")
        
        if not tabla_existe:
            logger.warning("[CALIFICACION] TABLA NO EXISTE - ejecute documentos/21_calificaciones_eventos.sql")
            return None
            
        try:
            # Verificar si ya existe una calificación para este evento
            consulta_existe = """
            SELECT id, estado FROM calificaciones_eventos 
            WHERE id_evento = %s AND id_cliente = %s
            """
            existente = self.base_datos.obtener_uno(consulta_existe, (evento_id, cliente_id))
            
            if existente:
                logger.info(f"[CALIFICACION] Solicitud existente encontrada: {existente}")
                # Si ya está calificado, resetear a pendiente para permitir nueva calificación
                # Actualizar fecha de solicitud y resetear estado a pendiente
                consulta_update = """
                UPDATE calificaciones_eventos 
                SET fecha_solicitud = NOW(), estado = 'pendiente', calificacion = NULL, observaciones = NULL
                WHERE id = %s
                """
                self.base_datos.ejecutar_consulta(consulta_update, (existente.get('id'),))
                logger.info(f"[CALIFICACION] Solicitud actualizada a pendiente, ID: {existente.get('id')}")
                return existente.get('id')
            
            # Crear nueva solicitud - usar INSERT directo con verificación
            try:
                conexion = self.base_datos._obtener_conexion()
                cursor = conexion.cursor()
                consulta = """
                INSERT INTO calificaciones_eventos (id_evento, id_cliente, estado, fecha_solicitud)
                VALUES (%s, %s, 'pendiente', NOW())
                """
                cursor.execute(consulta, (evento_id, cliente_id))
                conexion.commit()
                nuevo_id = cursor.lastrowid
                cursor.close()
                logger.info(f"[CALIFICACION] Nueva solicitud creada con ID: {nuevo_id}, rows affected: {cursor.rowcount}")
                
                # Verificar que se insertó
                verificacion = self.base_datos.obtener_uno(
                    "SELECT id, estado FROM calificaciones_eventos WHERE id_evento = %s AND id_cliente = %s",
                    (evento_id, cliente_id)
                )
                logger.info(f"[CALIFICACION] Verificación después de INSERT: {verificacion}")
                
                return nuevo_id if nuevo_id else (verificacion.get('id') if verificacion else None)
            except Exception as insert_error:
                logger.error(f"[CALIFICACION] Error en INSERT: {insert_error}")
                return None
            
        except Exception as e:
            logger.error(f"[CALIFICACION] Error al crear solicitud: {e}")
            return None

    def registrar_calificacion(self, evento_id, cliente_id, calificacion, observaciones=None, canal='whatsapp', mensaje_id=None):
        """Registra la calificación de un cliente para un evento"""
        if not self._tabla_existe():
            self.logger.warning("Tabla calificaciones_eventos no existe")
            return False, "Sistema de calificaciones no disponible"
            
        try:
            # Validar calificación
            if not 1 <= calificacion <= 5:
                return False, "La calificación debe ser entre 1 y 5"
            
            # Si calificación < 4 y no hay observaciones, marcar como pendiente de observaciones
            # Calificaciones de 4 o 5 se consideran buenas y no necesitan observaciones
            estado = 'calificado'
            if calificacion < 4 and not observaciones:
                estado = 'observaciones_pendientes'
            
            # Verificar si ya existe registro
            consulta_existe = """
            SELECT id FROM calificaciones_eventos 
            WHERE id_evento = %s AND id_cliente = %s
            """
            existente = self.base_datos.obtener_uno(consulta_existe, (evento_id, cliente_id))
            
            if existente:
                # Actualizar registro existente
                consulta_update = """
                UPDATE calificaciones_eventos 
                SET calificacion = %s, observaciones = %s, canal = %s, 
                    mensaje_id = %s, estado = %s, fecha_calificacion = NOW()
                WHERE id = %s
                """
                self.base_datos.ejecutar_consulta(consulta_update, (
                    calificacion, observaciones, canal, mensaje_id, estado, existente.get('id')
                ))
            else:
                # Insertar nuevo registro
                consulta_insert = """
                INSERT INTO calificaciones_eventos 
                (id_evento, id_cliente, calificacion, observaciones, canal, mensaje_id, estado, fecha_calificacion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                """
                self.base_datos.ejecutar_consulta(consulta_insert, (
                    evento_id, cliente_id, calificacion, observaciones, canal, mensaje_id, estado
                ))
            
            # Actualizar calificación en la tabla de eventos
            self._actualizar_calificacion_evento(evento_id, calificacion, observaciones)
            
            self.logger.info(f"Calificación {calificacion} registrada para evento {evento_id}")
            return True, "Calificación registrada exitosamente"
            
        except Exception as e:
            self.logger.error(f"Error al registrar calificación: {e}")
            return False, str(e)

    def agregar_observaciones(self, evento_id, cliente_id, observaciones):
        """Agrega observaciones a una calificación existente"""
        if not self._tabla_existe():
            return False, "Sistema de calificaciones no disponible"
            
        try:
            consulta = """
            UPDATE calificaciones_eventos 
            SET observaciones = %s, estado = 'calificado'
            WHERE id_evento = %s AND id_cliente = %s AND estado = 'observaciones_pendientes'
            """
            resultado = self.base_datos.ejecutar_consulta(consulta, (observaciones, evento_id, cliente_id))
            
            if resultado:
                # Actualizar observaciones en evento
                consulta_evento = """
                UPDATE eventos SET observaciones_calificacion = %s WHERE id_evento = %s
                """
                self.base_datos.ejecutar_consulta(consulta_evento, (observaciones, evento_id))
                
            return True, "Observaciones agregadas"
        except Exception as e:
            self.logger.error(f"Error al agregar observaciones: {e}")
            return False, str(e)

    def _actualizar_calificacion_evento(self, evento_id, calificacion, observaciones=None):
        """Actualiza la calificación en la tabla de eventos"""
        try:
            # Verificar si existen las columnas
            check_columna = """
            SELECT COUNT(*) as existe FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'eventos' AND column_name = 'calificacion_cliente'
            """
            resultado = self.base_datos.obtener_uno(check_columna)
            
            if not resultado or resultado.get('existe', 0) == 0:
                return
            
            consulta = """
            UPDATE eventos 
            SET calificacion_cliente = %s, 
                observaciones_calificacion = %s,
                fecha_calificacion = NOW()
            WHERE id_evento = %s
            """
            self.base_datos.ejecutar_consulta(consulta, (calificacion, observaciones, evento_id))
        except Exception as e:
            self.logger.error(f"Error al actualizar calificación en evento: {e}")

    def obtener_calificacion_evento(self, evento_id):
        """Obtiene la calificación de un evento"""
        if not self._tabla_existe():
            return None
            
        consulta = """
        SELECT ce.*, u.nombre_completo as nombre_cliente
        FROM calificaciones_eventos ce
        JOIN clientes c ON ce.id_cliente = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE ce.id_evento = %s
        """
        return self.base_datos.obtener_uno(consulta, (evento_id,))

    def obtener_evento_pendiente_calificacion(self, telefono):
        """Busca si hay un evento pendiente de calificación para un teléfono"""
        # Usar logger global para asegurar que se registre
        from utilidades.logger import obtener_logger
        logger = obtener_logger()
        
        logger.info(f"[CALIFICACION] Buscando para teléfono: {telefono}")
        
        tabla_existe = self._tabla_existe()
        logger.info(f"[CALIFICACION] Tabla calificaciones_eventos existe: {tabla_existe}")
        
        if not tabla_existe:
            logger.warning("[CALIFICACION] TABLA NO EXISTE - ejecute documentos/21_calificaciones_eventos.sql")
            return None
        
        # Probar con diferentes formatos de teléfono
        telefono_limpio = telefono.replace('+', '').replace(' ', '')
        logger.info(f"[CALIFICACION] Teléfono limpio: {telefono_limpio}")
        
        # Debug: ver solicitudes pendientes
        debug_query = """
        SELECT ce.id, ce.id_evento, ce.id_cliente, ce.estado, u.telefono as tel_usuario
        FROM calificaciones_eventos ce
        JOIN clientes c ON ce.id_cliente = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE ce.estado = 'pendiente'
        """
        debug_result = self.base_datos.obtener_todos(debug_query)
        logger.info(f"[CALIFICACION] Solicitudes pendientes en BD: {debug_result}")
        
        consulta = """
        SELECT ce.id_evento, ce.id_cliente, ce.estado, e.nombre_evento, u.telefono as telefono_usuario
        FROM calificaciones_eventos ce
        JOIN eventos e ON ce.id_evento = e.id_evento
        JOIN clientes c ON ce.id_cliente = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE (u.telefono = %s OR u.telefono = %s OR u.telefono = %s
               OR u.telefono LIKE %s OR u.telefono LIKE %s)
        AND ce.estado IN ('pendiente', 'observaciones_pendientes')
        ORDER BY ce.fecha_solicitud DESC
        LIMIT 1
        """
        resultado = self.base_datos.obtener_uno(consulta, (
            telefono, telefono_limpio, f"+{telefono_limpio}",
            f"%{telefono_limpio[-9:]}", f"%{telefono_limpio[-10:]}"
        ))
        logger.info(f"[CALIFICACION] Resultado búsqueda: {resultado}")
        return resultado

    def obtener_estadisticas_calificaciones(self):
        """Obtiene estadísticas generales de calificaciones"""
        if not self._tabla_existe():
            return {}
            
        consulta = """
        SELECT 
            COUNT(*) as total_calificaciones,
            AVG(calificacion) as promedio,
            SUM(CASE WHEN calificacion = 5 THEN 1 ELSE 0 END) as excelentes,
            SUM(CASE WHEN calificacion = 4 THEN 1 ELSE 0 END) as muy_buenos,
            SUM(CASE WHEN calificacion = 3 THEN 1 ELSE 0 END) as buenos,
            SUM(CASE WHEN calificacion = 2 THEN 1 ELSE 0 END) as regulares,
            SUM(CASE WHEN calificacion = 1 THEN 1 ELSE 0 END) as malos
        FROM calificaciones_eventos
        WHERE estado = 'calificado'
        """
        return self.base_datos.obtener_uno(consulta) or {}
