"""
Módulo de conexión y operaciones con la base de datos MySQL
"""
import threading
import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG


class BaseDatos:
    """Clase para gestionar la conexión y operaciones con MySQL"""
    
    _thread_local = threading.local()

    def __init__(self):
        self.ultimo_error = None
        self.conectar()
    
    def conectar(self):
        """Establece conexión con la base de datos MySQL"""
        try:
            conexion = mysql.connector.connect(**DB_CONFIG)
            if conexion.is_connected():
                self._thread_local.conexion = conexion
                print("Conexión exitosa a MySQL")
                return True
        except Error as e:
            print(f"Error al conectar a MySQL: {e}")
            return False

    def _obtener_conexion(self):
        """Obtiene la conexión asociada al hilo actual"""
        conexion = getattr(self._thread_local, 'conexion', None)
        if not conexion or not conexion.is_connected():
            self.conectar()
            conexion = getattr(self._thread_local, 'conexion', None)
        return conexion

    @property
    def conexion(self):
        """Compatibilidad: devuelve la conexión del hilo actual"""
        return self._obtener_conexion()
    
    def desconectar(self):
        """Cierra la conexión con la base de datos"""
        conexion = getattr(self._thread_local, 'conexion', None)
        if conexion and conexion.is_connected():
            conexion.close()
            self._thread_local.conexion = None
            print("Conexión cerrada")
    
    def ejecutar_consulta(self, consulta, parametros=None):
        """Ejecuta una consulta que no retorna resultados (INSERT, UPDATE, DELETE)"""
        try:
            self.ultimo_error = None
            # Verificar que la conexión esté activa
            conexion = self._obtener_conexion()
            if not conexion or not conexion.is_connected():
                print("Error: No se pudo establecer conexión a MySQL")
                return False
            
            cursor = conexion.cursor(buffered=True)
            if parametros:
                cursor.execute(consulta, parametros)
            else:
                cursor.execute(consulta)
            conexion.commit()
            cursor.close()
            
            # Si es un CALL, consumir todos los resultados (si está disponible)
            if consulta.strip().upper().startswith('CALL'):
                try:
                    while conexion.next_result():
                        pass
                except AttributeError:
                    # next_result() no está disponible en esta versión
                    pass
                except Exception:
                    # Ignorar errores al consumir resultados adicionales
                    pass
            
            return True
        except Error as e:
            self.ultimo_error = str(e)
            print(f"Error al ejecutar consulta: {e}")
            try:
                conexion = self._obtener_conexion()
                if conexion and conexion.is_connected():
                    conexion.rollback()
            except:
                pass
            return False
    
    def obtener_todos(self, consulta, parametros=None):
        """Ejecuta una consulta SELECT y retorna todos los resultados"""
        try:
            # Verificar que la conexión esté activa
            conexion = self._obtener_conexion()
            if not conexion or not conexion.is_connected():
                error_msg = "Error: No se pudo establecer conexión a MySQL"
                print(error_msg)
                raise Error(error_msg)
            
            cursor = conexion.cursor(dictionary=True, buffered=True)
            if parametros:
                cursor.execute(consulta, parametros)
            else:
                cursor.execute(consulta)
            resultados = cursor.fetchall()
            cursor.close()
            return resultados
        except Error as e:
            print(f"Error al obtener datos: {e}")
            # Intentar reconectar si falló
            try:
                conexion = self._obtener_conexion()
                # Reintentar la consulta una vez más después de reconectar
                if conexion and conexion.is_connected():
                    cursor = conexion.cursor(dictionary=True, buffered=True)
                    if parametros:
                        cursor.execute(consulta, parametros)
                    else:
                        cursor.execute(consulta)
                    resultados = cursor.fetchall()
                    cursor.close()
                    return resultados
            except Exception as retry_error:
                print(f"Error al reintentar consulta: {retry_error}")
            # Si no se pudo reconectar, lanzar la excepción para que el llamador la maneje
            raise
    
    def obtener_uno(self, consulta, parametros=None):
        """Ejecuta una consulta SELECT y retorna un solo resultado"""
        try:
            # Verificar que la conexión esté activa
            conexion = self._obtener_conexion()
            if not conexion or not conexion.is_connected():
                error_msg = "Error: No se pudo establecer conexión a MySQL"
                print(error_msg)
                raise Error(error_msg)
            
            cursor = conexion.cursor(dictionary=True, buffered=True)
            if parametros:
                cursor.execute(consulta, parametros)
            else:
                cursor.execute(consulta)
            resultado = cursor.fetchone()
            # Consumir cualquier resultado adicional para evitar "Unread result found"
            try:
                cursor.fetchall()
            except Exception:
                pass
            cursor.close()
            return resultado
        except Error as e:
            print(f"Error al obtener dato: {e}")
            # Intentar reconectar si falló
            try:
                conexion = self._obtener_conexion()
                # Reintentar la consulta una vez más después de reconectar
                if conexion and conexion.is_connected():
                    cursor = conexion.cursor(dictionary=True, buffered=True)
                    if parametros:
                        cursor.execute(consulta, parametros)
                    else:
                        cursor.execute(consulta)
                    resultado = cursor.fetchone()
                    try:
                        cursor.fetchall()
                    except Exception:
                        pass
                    cursor.close()
                    return resultado
            except Exception as retry_error:
                print(f"Error al reintentar consulta: {retry_error}")
            # Si no se pudo reconectar, lanzar la excepción para que el llamador la maneje
            raise
    
    def obtener_ultimo_id(self):
        """Retorna el último ID insertado"""
        try:
            conexion = self._obtener_conexion()
            if not conexion or not conexion.is_connected():
                print("Error: No se pudo establecer conexión a MySQL")
                return None
            cursor = conexion.cursor(buffered=True)
            cursor.execute("SELECT LAST_INSERT_ID() as id")
            resultado = cursor.fetchone()
            cursor.close()
            return resultado[0] if resultado else None
        except Error as e:
            print(f"Error al obtener último ID: {e}")
            return None

