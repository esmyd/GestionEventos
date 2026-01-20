"""
Modelo para gestión de productos
"""
from modelos.base_datos import BaseDatos


class ProductoModelo:
    """Clase para operaciones CRUD de productos"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def crear_producto(self, datos_producto):
        """Crea un nuevo producto"""
        # Si no se proporciona precio pero sí precio_minimo o precio_maximo, usar precio_minimo como precio base
        precio = datos_producto.get('precio')
        if not precio and datos_producto.get('precio_minimo'):
            precio = datos_producto.get('precio_minimo')
        elif not precio:
            precio = 0.00
        
        consulta = """
        INSERT INTO productos (nombre, descripcion, detalles_adicionales, variantes, precio, precio_minimo, precio_maximo, 
                              duracion_horas, id_categoria, stock, unidad_medida, tipo_servicio)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos_producto['nombre'],
            datos_producto.get('descripcion'),
            datos_producto.get('detalles_adicionales'),
            datos_producto.get('variantes'),
            precio,
            datos_producto.get('precio_minimo'),
            datos_producto.get('precio_maximo'),
            datos_producto.get('duracion_horas'),
            datos_producto.get('id_categoria') if datos_producto.get('id_categoria') else None,
            datos_producto.get('stock', 0),
            datos_producto.get('unidad_medida', 'unidad'),
            datos_producto.get('tipo_servicio', 'servicio')
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def obtener_producto_por_id(self, producto_id):
        """Obtiene un producto por su ID con información de categoría"""
        consulta = """
        SELECT p.*, c.nombre as nombre_categoria, c.id as categoria_id
        FROM productos p 
        LEFT JOIN categorias c ON p.id_categoria = c.id 
        WHERE p.id = %s
        """
        return self.base_datos.obtener_uno(consulta, (producto_id,))
    
    def obtener_todos_productos(self, solo_activos=True):
        """Obtiene todos los productos con información de categoría"""
        if solo_activos:
            consulta = """
            SELECT p.*, c.nombre as nombre_categoria, c.id as categoria_id
            FROM productos p 
            LEFT JOIN categorias c ON p.id_categoria = c.id 
            WHERE (p.activo = TRUE OR p.activo IS NULL)
            ORDER BY p.id desc
            """
        else:
            consulta = """
            SELECT p.*, c.nombre as nombre_categoria, c.id as categoria_id
            FROM productos p 
            LEFT JOIN categorias c ON p.id_categoria = c.id 
            ORDER BY p.id desc
            """
        return self.base_datos.obtener_todos(consulta)
    
    def obtener_productos_por_categoria(self, categoria_id):
        """Obtiene productos filtrados por categoría"""
        consulta = """
        SELECT p.*, c.nombre as nombre_categoria, c.id as categoria_id
        FROM productos p 
        LEFT JOIN categorias c ON p.id_categoria = c.id 
        WHERE p.id_categoria = %s AND (p.activo = TRUE OR p.activo IS NULL)
        ORDER BY p.id desc
        """
        return self.base_datos.obtener_todos(consulta, (categoria_id,))
    
    def actualizar_producto(self, producto_id, datos_producto):
        """Actualiza los datos de un producto"""
        # Si no se proporciona precio pero sí precio_minimo o precio_maximo, usar precio_minimo como precio base
        precio = datos_producto.get('precio')
        if not precio and datos_producto.get('precio_minimo'):
            precio = datos_producto.get('precio_minimo')
        elif not precio:
            precio = 0.00
        
        consulta = """
        UPDATE productos 
        SET nombre = %s, descripcion = %s, detalles_adicionales = %s, variantes = %s, 
            precio = %s, precio_minimo = %s, precio_maximo = %s, duracion_horas = %s, 
            id_categoria = %s, stock = %s, unidad_medida = %s, tipo_servicio = %s
        WHERE id = %s
        """
        parametros = (
            datos_producto['nombre'],
            datos_producto.get('descripcion'),
            datos_producto.get('detalles_adicionales'),
            datos_producto.get('variantes'),
            precio,
            datos_producto.get('precio_minimo'),
            datos_producto.get('precio_maximo'),
            datos_producto.get('duracion_horas'),
            datos_producto.get('id_categoria') if datos_producto.get('id_categoria') else None,
            datos_producto.get('stock', 0),
            datos_producto.get('unidad_medida', 'unidad'),
            datos_producto.get('tipo_servicio', 'servicio'),
            producto_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_producto(self, producto_id):
        """Elimina (desactiva) un producto"""
        consulta = "UPDATE productos SET activo = FALSE WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (producto_id,))
    
    def actualizar_stock(self, producto_id, cantidad):
        """Actualiza el stock disponible de un producto"""
        consulta = "UPDATE productos SET stock = stock + %s WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (cantidad, producto_id))

