"""
Modelo para gestión de clientes
"""
from modelos.base_datos import BaseDatos


class ClienteModelo:
    """Clase para operaciones CRUD de clientes"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def crear_cliente(self, datos_cliente):
        """Crea un nuevo cliente"""
        consulta = """
        INSERT INTO clientes (usuario_id, documento_identidad, direccion)
        VALUES (%s, %s, %s)
        """
        parametros = (
            datos_cliente['usuario_id'],
            datos_cliente.get('documento_identidad'),
            datos_cliente.get('direccion')
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def obtener_cliente_por_id(self, cliente_id):
        """Obtiene un cliente por su ID"""
        consulta = """
        SELECT c.*, u.nombre_completo, u.email, u.telefono
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = %s
        """
        return self.base_datos.obtener_uno(consulta, (cliente_id,))
    
    def obtener_cliente_por_usuario(self, usuario_id):
        """Obtiene un cliente por su usuario_id"""
        consulta = """
        SELECT c.*, u.nombre_completo, u.email, u.telefono
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.usuario_id = %s
        """
        return self.base_datos.obtener_uno(consulta, (usuario_id,))
    
    def obtener_todos_clientes(self):
        """Obtiene todos los clientes"""
        consulta = """
        SELECT c.*, u.nombre_completo, u.email, u.telefono
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        ORDER BY u.nombre_completo
        """
        return self.base_datos.obtener_todos(consulta)
    
    def actualizar_cliente(self, cliente_id, datos_cliente):
        """Actualiza los datos de un cliente"""
        consulta = """
        UPDATE clientes 
        SET documento_identidad = %s, direccion = %s
        WHERE id = %s
        """
        parametros = (
            datos_cliente.get('documento_identidad'),
            datos_cliente.get('direccion'),
            cliente_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_cliente(self, cliente_id):
        """Elimina un cliente"""
        consulta = "DELETE FROM clientes WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (cliente_id,))

