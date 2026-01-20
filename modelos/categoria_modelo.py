"""
Modelo para gestión de categorías
"""
from modelos.base_datos import BaseDatos
from utilidades.logger import obtener_logger


class CategoriaModelo:
    """Clase para operaciones CRUD de categorías"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.logger = obtener_logger()
    
    def crear_categoria(self, datos_categoria):
        """Crea una nueva categoría"""
        consulta = """
        INSERT INTO categorias (nombre, descripcion, activo)
        VALUES (%s, %s, %s)
        """
        parametros = (
            datos_categoria['nombre'],
            datos_categoria.get('descripcion'),
            datos_categoria.get('activo', True)
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def obtener_categoria_por_id(self, categoria_id):
        """Obtiene una categoría por su ID"""
        consulta = "SELECT * FROM categorias WHERE id = %s"
        return self.base_datos.obtener_uno(consulta, (categoria_id,))
    
    def obtener_todas_categorias(self, solo_activas=True):
        """Obtiene todas las categorías"""
        if solo_activas:
            consulta = "SELECT * FROM categorias WHERE activo = TRUE ORDER BY id desc"
        else:
            consulta = "SELECT * FROM categorias ORDER BY id desc"
        return self.base_datos.obtener_todos(consulta)
    
    def obtener_categoria_por_nombre(self, nombre):
        """Obtiene una categoría por su nombre"""
        consulta = "SELECT * FROM categorias WHERE nombre = %s AND activo = TRUE"
        return self.base_datos.obtener_uno(consulta, (nombre,))
    
    def actualizar_categoria(self, categoria_id, datos_categoria):
        """Actualiza los datos de una categoría"""
        consulta = """
        UPDATE categorias 
        SET nombre = %s, descripcion = %s, activo = %s
        WHERE id = %s
        """
        parametros = (
            datos_categoria['nombre'],
            datos_categoria.get('descripcion'),
            datos_categoria.get('activo', True),
            categoria_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_categoria(self, categoria_id):
        """Elimina una categoría
        
        Si la categoría tiene productos asociados, solo la desactiva.
        Si no tiene productos, la elimina físicamente de la base de datos.
        """
        try:
            # Verificar si la categoría existe
            categoria = self.obtener_categoria_por_id(categoria_id)
            if not categoria:
                self.logger.warning(f"Intento de eliminar categoría inexistente: ID {categoria_id}")
                return False
            
            # Contar productos asociados (activos e inactivos)
            consulta_count = "SELECT COUNT(*) as total FROM productos WHERE id_categoria = %s"
            resultado = self.base_datos.obtener_uno(consulta_count, (categoria_id,))
            num_productos = resultado['total'] if resultado else 0
            
            if num_productos > 0:
                # Si tiene productos, solo desactivar
                self.logger.info(f"Desactivando categoría ID {categoria_id} (tiene {num_productos} productos asociados)")
                consulta = "UPDATE categorias SET activo = FALSE WHERE id = %s"
                return self.base_datos.ejecutar_consulta(consulta, (categoria_id,))
            else:
                # Si no tiene productos, eliminar físicamente
                self.logger.info(f"Eliminando físicamente categoría ID {categoria_id} (sin productos asociados)")
                consulta = "DELETE FROM categorias WHERE id = %s"
                resultado = self.base_datos.ejecutar_consulta(consulta, (categoria_id,))
                if resultado:
                    self.logger.info(f"Categoría ID {categoria_id} eliminada exitosamente")
                return resultado
        except Exception as e:
            self.logger.error(f"Error al eliminar categoría ID {categoria_id}: {str(e)}")
            return False
    
    def contar_productos_por_categoria(self, categoria_id):
        """Cuenta cuántos productos tienen esta categoría"""
        consulta = "SELECT COUNT(*) as total FROM productos WHERE id_categoria = %s AND activo = TRUE"
        resultado = self.base_datos.obtener_uno(consulta, (categoria_id,))
        return resultado['total'] if resultado else 0

