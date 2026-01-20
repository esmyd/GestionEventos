"""
Modelo para gestión de tipos de eventos
"""
from modelos.base_datos import BaseDatos


class TipoEventoModelo:
    """Clase para operaciones CRUD de tipos de eventos"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def obtener_todos_tipos(self, solo_activos=True):
        """Obtiene todos los tipos de eventos"""
        if solo_activos:
            consulta = "SELECT * FROM tipos_evento WHERE activo = TRUE ORDER BY nombre ASC"
        else:
            consulta = "SELECT * FROM tipos_evento ORDER BY nombre ASC"
        return self.base_datos.obtener_todos(consulta)
    
    def obtener_tipo_por_id(self, tipo_id):
        """Obtiene un tipo de evento por su ID"""
        consulta = "SELECT * FROM tipos_evento WHERE id = %s"
        return self.base_datos.obtener_uno(consulta, (tipo_id,))
    
    def obtener_tipo_por_nombre(self, nombre):
        """Obtiene un tipo de evento por su nombre"""
        consulta = "SELECT * FROM tipos_evento WHERE nombre = %s"
        return self.base_datos.obtener_uno(consulta, (nombre,))
    
    def crear_tipo(self, datos_tipo):
        """Crea un nuevo tipo de evento"""
        consulta = """
        INSERT INTO tipos_evento (nombre, descripcion, categoria, activo)
        VALUES (%s, %s, %s, %s)
        """
        parametros = (
            datos_tipo['nombre'],
            datos_tipo.get('descripcion'),
            datos_tipo.get('categoria', 'otro'),
            datos_tipo.get('activo', True)
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def actualizar_tipo(self, tipo_id, datos_tipo):
        """Actualiza los datos de un tipo de evento"""
        consulta = """
        UPDATE tipos_evento 
        SET nombre = %s, descripcion = %s, categoria = %s, activo = %s
        WHERE id = %s
        """
        parametros = (
            datos_tipo.get('nombre'),
            datos_tipo.get('descripcion'),
            datos_tipo.get('categoria'),
            datos_tipo.get('activo', True),
            tipo_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_tipo(self, tipo_id):
        """Elimina (desactiva) un tipo de evento"""
        consulta = "UPDATE tipos_evento SET activo = FALSE WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (tipo_id,))
    
    def obtener_nombres_tipos(self, solo_activos=True):
        """Obtiene solo los nombres de los tipos de eventos (para combos)"""
        tipos = self.obtener_todos_tipos(solo_activos)
        return [tipo['nombre'] for tipo in tipos]

