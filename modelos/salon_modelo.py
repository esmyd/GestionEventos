"""
Modelo para gestión de salones
"""
from modelos.base_datos import BaseDatos
from utilidades.logger import obtener_logger


class SalonModelo:
    """Clase para operaciones CRUD de salones"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.logger = obtener_logger()
    
    def crear_salon(self, datos_salon):
        """Crea un nuevo salón"""
        consulta = """
        INSERT INTO salones (nombre, capacidad, ubicacion, descripcion, precio_base, activo)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos_salon['nombre'],
            datos_salon['capacidad'],
            datos_salon.get('ubicacion'),
            datos_salon.get('descripcion'),
            datos_salon.get('precio_base', 0),
            datos_salon.get('activo', True)
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            salon_id = self.base_datos.obtener_ultimo_id()
            return salon_id
        return None
    
    def obtener_salon_por_id(self, salon_id):
        """Obtiene un salón por su ID"""
        consulta = "SELECT * FROM salones WHERE id_salon = %s LIMIT 1"
        return self.base_datos.obtener_uno(consulta, (salon_id,))
    
    def obtener_todos_salones(self, solo_activos=False):
        """Obtiene todos los salones"""
        if solo_activos:
            consulta = "SELECT * FROM salones WHERE activo = TRUE ORDER BY id_salon DESC"
        else:
            consulta = "SELECT * FROM salones ORDER BY id_salon DESC"
        return self.base_datos.obtener_todos(consulta)
    
    def actualizar_salon(self, salon_id, datos_salon):
        """Actualiza un salón"""
        consulta = """
        UPDATE salones 
        SET nombre = %s, capacidad = %s, ubicacion = %s, descripcion = %s, 
            precio_base = %s, activo = %s
        WHERE id_salon = %s
        """
        parametros = (
            datos_salon['nombre'],
            datos_salon['capacidad'],
            datos_salon.get('ubicacion'),
            datos_salon.get('descripcion'),
            datos_salon.get('precio_base', 0),
            datos_salon.get('activo', True),
            salon_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_salon(self, salon_id):
        """Desactiva un salón (no se elimina físicamente)"""
        try:
            # Verificar si el salón existe
            salon = self.obtener_salon_por_id(salon_id)
            if not salon:
                self.logger.warning(f"Intento de eliminar salón inexistente: ID {salon_id}")
                return False
            
            # Desactivar siempre, sin eliminar físicamente
            self.logger.info(f"Desactivando salón ID {salon_id}")
            consulta = "UPDATE salones SET activo = FALSE WHERE id_salon = %s"
            return self.base_datos.ejecutar_consulta(consulta, (salon_id,))
        except Exception as e:
            self.logger.error(f"Error al eliminar salón ID {salon_id}: {str(e)}")
            return False
    
    def verificar_disponibilidad(self, salon_id, fecha_evento):
        """Verifica si un salón está disponible en una fecha"""
        consulta = """
        SELECT COUNT(*) as eventos_count
        FROM eventos
        WHERE id_salon = %s AND fecha_evento = %s AND estado != 'cancelado'
        """
        resultado = self.base_datos.obtener_uno(consulta, (salon_id, fecha_evento))
        return resultado['eventos_count'] == 0 if resultado else True

