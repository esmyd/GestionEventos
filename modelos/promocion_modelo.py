"""
Modelo para gestión de promociones
"""
from modelos.base_datos import BaseDatos
from datetime import date


class PromocionModelo:
    """Clase para operaciones CRUD de promociones"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def crear_promocion(self, datos_promocion):
        """Crea una nueva promoción"""
        consulta = """
        INSERT INTO promociones (nombre, descripcion, tipo_descuento, valor_descuento, 
                                fecha_inicio, fecha_fin, plan_id, producto_id, aplica_todos)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos_promocion['nombre'],
            datos_promocion.get('descripcion'),
            datos_promocion['tipo_descuento'],
            datos_promocion['valor_descuento'],
            datos_promocion['fecha_inicio'],
            datos_promocion['fecha_fin'],
            datos_promocion.get('plan_id'),
            datos_promocion.get('producto_id'),
            datos_promocion.get('aplica_todos', False)
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def obtener_promocion_por_id(self, promocion_id):
        """Obtiene una promoción por su ID"""
        consulta = "SELECT * FROM promociones WHERE id = %s"
        return self.base_datos.obtener_uno(consulta, (promocion_id,))
    
    def obtener_promociones_activas(self):
        """Obtiene todas las promociones activas y vigentes"""
        hoy = date.today()
        consulta = """
        SELECT * FROM promociones 
        WHERE activo = TRUE 
        AND fecha_inicio <= %s 
        AND fecha_fin >= %s
        ORDER BY fecha_inicio DESC
        """
        return self.base_datos.obtener_todos(consulta, (hoy, hoy))
    
    def obtener_todas_promociones(self):
        """Obtiene todas las promociones"""
        consulta = "SELECT * FROM promociones ORDER BY fecha_inicio DESC"
        return self.base_datos.obtener_todos(consulta)
    
    def obtener_promociones_por_plan(self, plan_id):
        """Obtiene promociones aplicables a un plan"""
        hoy = date.today()
        consulta = """
        SELECT * FROM promociones 
        WHERE activo = TRUE 
        AND (plan_id = %s OR aplica_todos = TRUE)
        AND fecha_inicio <= %s 
        AND fecha_fin >= %s
        """
        return self.base_datos.obtener_todos(consulta, (plan_id, hoy, hoy))
    
    def obtener_promociones_por_producto(self, producto_id):
        """Obtiene promociones aplicables a un producto"""
        hoy = date.today()
        consulta = """
        SELECT * FROM promociones 
        WHERE activo = TRUE 
        AND (producto_id = %s OR aplica_todos = TRUE)
        AND fecha_inicio <= %s 
        AND fecha_fin >= %s
        """
        return self.base_datos.obtener_todos(consulta, (producto_id, hoy, hoy))
    
    def calcular_descuento(self, precio_base, promocion):
        """Calcula el descuento aplicado según la promoción"""
        if promocion['tipo_descuento'] == 'porcentaje':
            return precio_base * (promocion['valor_descuento'] / 100)
        else:  # monto_fijo
            return min(promocion['valor_descuento'], precio_base)
    
    def actualizar_promocion(self, promocion_id, datos_promocion):
        """Actualiza los datos de una promoción"""
        consulta = """
        UPDATE promociones 
        SET nombre = %s, descripcion = %s, tipo_descuento = %s, valor_descuento = %s,
            fecha_inicio = %s, fecha_fin = %s, plan_id = %s, producto_id = %s,
            aplica_todos = %s, activo = %s
        WHERE id = %s
        """
        parametros = (
            datos_promocion['nombre'],
            datos_promocion.get('descripcion'),
            datos_promocion['tipo_descuento'],
            datos_promocion['valor_descuento'],
            datos_promocion['fecha_inicio'],
            datos_promocion['fecha_fin'],
            datos_promocion.get('plan_id'),
            datos_promocion.get('producto_id'),
            datos_promocion.get('aplica_todos', False),
            datos_promocion.get('activo', True),
            promocion_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_promocion(self, promocion_id):
        """Elimina (desactiva) una promoción"""
        consulta = "UPDATE promociones SET activo = FALSE WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (promocion_id,))

