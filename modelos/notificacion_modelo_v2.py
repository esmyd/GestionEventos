"""
Modelo simplificado de notificaciones que usa procedimientos almacenados
Este modelo reduce significativamente el código Python al usar los procedimientos
almacenados de MySQL
"""
from modelos.base_datos import BaseDatos


class NotificacionModeloV2:
    """Clase simplificada que usa procedimientos almacenados de MySQL"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def obtener_notificaciones_pendientes(self, limite=100):
        """
        Obtiene notificaciones pendientes de envío usando procedimiento almacenado
        Retorna las notificaciones que están listas para enviar
        """
        try:
            consulta = "CALL obtener_notificaciones_pendientes(%s)"
            cursor = self.base_datos.conexion.cursor(dictionary=True)
            cursor.execute(consulta, (limite,))
            resultados = cursor.fetchall()
            # Cerrar cursor explícitamente antes de procesar resultados
            cursor.close()
            # Consumir cualquier resultado adicional del procedimiento almacenado
            try:
                while self.base_datos.conexion.next_result():
                    pass
            except (AttributeError, Exception):
                # next_result() no está disponible o no hay más resultados
                pass
            return resultados
        except Exception as e:
            print(f"Error al obtener notificaciones pendientes: {e}")
            return []
    
    def marcar_como_enviada(self, notificacion_id, exito=True, error=None):
        """
        Marca una notificación como enviada usando procedimiento almacenado
        Parámetros:
            notificacion_id: ID de la notificación en notificaciones_pendientes
            exito: True si se envió exitosamente, False si hubo error
            error: Mensaje de error (opcional)
        """
        try:
            # Verificar que la conexión esté activa
            if not self.base_datos.conexion or not self.base_datos.conexion.is_connected():
                self.base_datos.conectar()
            
            consulta = "CALL marcar_notificacion_enviada(%s, %s, %s)"
            cursor = self.base_datos.conexion.cursor()
            cursor.execute(consulta, (notificacion_id, exito, error))
            self.base_datos.conexion.commit()
            cursor.close()
            # Consumir cualquier resultado adicional del procedimiento almacenado
            try:
                while self.base_datos.conexion.next_result():
                    pass
            except (AttributeError, Exception):
                # next_result() no está disponible o no hay más resultados
                pass
            return True
        except Exception as e:
            print(f"Error al marcar notificación {notificacion_id} como enviada: {e}")
            # Intentar rollback si es posible
            try:
                if self.base_datos.conexion and self.base_datos.conexion.is_connected():
                    self.base_datos.conexion.rollback()
            except:
                pass
            return False
    
    def generar_notificaciones_programadas(self):
        """
        Genera notificaciones programadas usando procedimiento almacenado
        Si el procedimiento no existe, retorna None para que se maneje desde Python
        """
        try:
            consulta = "CALL generar_notificaciones_programadas()"
            cursor = self.base_datos.conexion.cursor(dictionary=True)
            cursor.execute(consulta)
            resultado = cursor.fetchone()
            cursor.close()
            return resultado
        except Exception as e:
            # Procedimiento no existe o hay error, retornar None para manejar desde Python
            if 'does not exist' in str(e).lower() or '1305' in str(e):
                return None
            raise  # Re-lanzar otros errores
    
    def limpiar_antiguas(self, dias=90):
        """
        Limpia notificaciones antiguas usando procedimiento almacenado
        Parámetros:
            dias: Días de antigüedad para eliminar (por defecto 90)
        """
        consulta = "CALL limpiar_notificaciones_antiguas(%s)"
        return self.base_datos.ejecutar_consulta(consulta, (dias,))
    
    def verificar_ya_enviada(self, evento_id, tipo_notificacion):
        """
        Verifica si una notificación ya fue enviada usando función
        Parámetros:
            evento_id: ID del evento
            tipo_notificacion: Tipo de notificación a verificar
        Retorna: True si ya fue enviada, False si no
        """
        consulta = "SELECT notificacion_ya_enviada(%s, %s) as enviada"
        resultado = self.base_datos.obtener_uno(consulta, (evento_id, tipo_notificacion))
        return resultado['enviado'] if resultado else False
    
    def dias_hasta_evento(self, fecha_evento):
        """
        Calcula días hasta el evento usando función
        Parámetros:
            fecha_evento: Fecha del evento
        Retorna: Número de días (negativo si ya pasó)
        """
        consulta = "SELECT dias_hasta_evento(%s) as dias"
        resultado = self.base_datos.obtener_uno(consulta, (fecha_evento,))
        return resultado['dias'] if resultado else None

