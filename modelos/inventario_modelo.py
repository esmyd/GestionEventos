"""
Modelo para gestión de inventario
"""
from modelos.base_datos import BaseDatos


class InventarioModelo:
    """Clase para operaciones de inventario"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def crear_registro_inventario(self, datos_inventario):
        """Crea un nuevo registro de inventario"""
        consulta = """
        INSERT INTO inventario (producto_id, id_evento, cantidad_solicitada, cantidad_disponible, 
                               estado, fecha_reserva, observaciones)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos_inventario['producto_id'],
            datos_inventario.get('evento_id'),
            datos_inventario['cantidad_solicitada'],
            datos_inventario.get('cantidad_disponible'),
            datos_inventario.get('estado', 'disponible'),
            datos_inventario.get('fecha_reserva'),
            datos_inventario.get('observaciones')
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def obtener_inventario_por_evento(self, evento_id):
        """Obtiene el inventario asociado a un evento"""
        consulta = """
        SELECT i.*, p.nombre as nombre_producto, p.categoria, p.unidad_medida
        FROM inventario i
        JOIN productos p ON i.producto_id = p.id
        WHERE i.id_evento = %s
        ORDER BY p.nombre
        """
        return self.base_datos.obtener_todos(consulta, (evento_id,))
    
    def obtener_inventario_por_producto(self, producto_id):
        """Obtiene todos los registros de inventario de un producto"""
        consulta = """
        SELECT i.*, e.nombre_evento, e.fecha_evento
        FROM inventario i
        LEFT JOIN eventos e ON i.id_evento = e.id_evento
        WHERE i.producto_id = %s
        ORDER BY i.fecha_reserva DESC
        """
        return self.base_datos.obtener_todos(consulta, (producto_id,))
    
    def actualizar_estado_inventario(self, inventario_id, nuevo_estado, cantidad_utilizada=None):
        """Actualiza el estado de un registro de inventario"""
        consulta = """
        UPDATE inventario 
        SET estado = %s, cantidad_utilizada = %s
        WHERE id = %s
        """
        if cantidad_utilizada is None:
            # Si no se especifica, mantener el valor actual
            consulta = "UPDATE inventario SET estado = %s WHERE id = %s"
            return self.base_datos.ejecutar_consulta(consulta, (nuevo_estado, inventario_id))
        else:
            return self.base_datos.ejecutar_consulta(consulta, (nuevo_estado, cantidad_utilizada, inventario_id))
    
    def registrar_devolucion(self, inventario_id, fecha_devolucion):
        """Registra la devolución de un producto"""
        consulta = """
        UPDATE inventario 
        SET estado = 'devuelto', fecha_devolucion = %s
        WHERE id = %s
        """
        return self.base_datos.ejecutar_consulta(consulta, (fecha_devolucion, inventario_id))
    
    def verificar_disponibilidad(self, producto_id, cantidad, fecha_evento):
        """Verifica si hay disponibilidad de un producto para una fecha"""
        # Obtener stock disponible del producto
        consulta_producto = "SELECT stock_disponible FROM productos WHERE id = %s"
        producto = self.base_datos.obtener_uno(consulta_producto, (producto_id,))
        
        if not producto:
            return False
        
        stock_disponible = producto['stock_disponible']
        
        # Verificar reservas para esa fecha
        consulta_reservas = """
        SELECT SUM(cantidad_solicitada) as cantidad_reservada
        FROM inventario
        WHERE producto_id = %s 
        AND fecha_reserva = %s
        AND estado IN ('reservado', 'en_uso')
        """
        reservas = self.base_datos.obtener_uno(consulta_reservas, (producto_id, fecha_evento))
        cantidad_reservada = reservas['cantidad_reservada'] if reservas and reservas['cantidad_reservada'] else 0
        
        disponible = stock_disponible - cantidad_reservada
        return disponible >= cantidad

