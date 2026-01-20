"""
Modelo para gestión de planes y paquetes
"""
from modelos.base_datos import BaseDatos


class PlanModelo:
    """Clase para operaciones CRUD de planes"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def crear_plan(self, datos_plan):
        """Crea un nuevo plan"""
        consulta = """
        INSERT INTO planes (nombre, descripcion, precio_base, capacidad_minima, capacidad_maxima, duracion_horas, incluye)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos_plan['nombre'],
            datos_plan.get('descripcion'),
            datos_plan['precio_base'],
            datos_plan.get('capacidad_minima'),
            datos_plan.get('capacidad_maxima'),
            datos_plan.get('duracion_horas'),
            datos_plan.get('incluye')
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def obtener_plan_por_id(self, plan_id):
        """Obtiene un plan por su ID"""
        consulta = "SELECT * FROM planes WHERE id = %s"
        return self.base_datos.obtener_uno(consulta, (plan_id,))
    
    def obtener_todos_planes(self, solo_activos=True):
        """Obtiene todos los planes"""
        if solo_activos:
            consulta = "SELECT * FROM planes WHERE activo = TRUE ORDER BY id desc"
        else:
            consulta = "SELECT * FROM planes ORDER BY nombre"
        return self.base_datos.obtener_todos(consulta)
    
    def actualizar_plan(self, plan_id, datos_plan):
        """Actualiza los datos de un plan"""
        consulta = """
        UPDATE planes 
        SET nombre = %s, descripcion = %s, precio_base = %s, capacidad_minima = %s,
            capacidad_maxima = %s, duracion_horas = %s, incluye = %s, activo = %s
        WHERE id = %s
        """
        parametros = (
            datos_plan['nombre'],
            datos_plan.get('descripcion'),
            datos_plan['precio_base'],
            datos_plan.get('capacidad_minima'),
            datos_plan.get('capacidad_maxima'),
            datos_plan.get('duracion_horas'),
            datos_plan.get('incluye'),
            datos_plan.get('activo', True),
            plan_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_plan(self, plan_id):
        """Elimina (desactiva) un plan"""
        consulta = "UPDATE planes SET activo = FALSE WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (plan_id,))

    def plan_tiene_eventos(self, plan_id):
        """Verifica si el plan tiene eventos asociados"""
        consulta = "SELECT COUNT(*) as total FROM eventos WHERE plan_id = %s"
        resultado = self.base_datos.obtener_uno(consulta, (plan_id,))
        return (resultado or {}).get('total', 0) > 0
    
    def agregar_producto_plan(self, plan_id, producto_id, cantidad):
        """Agrega un producto a un plan"""
        consulta = """
        INSERT INTO plan_productos (plan_id, producto_id, cantidad)
        VALUES (%s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(consulta, (plan_id, producto_id, cantidad))
    
    def obtener_productos_plan(self, plan_id):
        """Obtiene todos los productos incluidos en un plan"""
        consulta = """
        SELECT pp.*, p.nombre as nombre_producto, p.precio, p.categoria
        FROM plan_productos pp
        JOIN productos p ON pp.producto_id = p.id
        WHERE pp.plan_id = %s
        """
        return self.base_datos.obtener_todos(consulta, (plan_id,))
    
    def eliminar_producto_plan(self, plan_id, producto_id):
        """Elimina un producto de un plan"""
        consulta = "DELETE FROM plan_productos WHERE plan_id = %s AND producto_id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (plan_id, producto_id))

    def obtener_servicios_plan(self, plan_id):
        """Obtiene los servicios asociados a un plan"""
        consulta = """
        SELECT id, plan_id, nombre, orden, activo
        FROM plan_servicios
        WHERE plan_id = %s AND activo = TRUE
        ORDER BY orden, id
        """
        return self.base_datos.obtener_todos(consulta, (plan_id,))

    def reemplazar_servicios_plan(self, plan_id, servicios):
        """Reemplaza los servicios de un plan"""
        eliminar = "DELETE FROM plan_servicios WHERE plan_id = %s"
        self.base_datos.ejecutar_consulta(eliminar, (plan_id,))
        if not servicios:
            return True
        consulta = """
        INSERT INTO plan_servicios (plan_id, nombre, orden, activo)
        VALUES (%s, %s, %s, TRUE)
        """
        for indice, servicio in enumerate(servicios):
            nombre = (servicio.get('nombre') or '').strip()
            if not nombre:
                continue
            orden = servicio.get('orden')
            if orden is None:
                orden = indice + 1
            self.base_datos.ejecutar_consulta(consulta, (plan_id, nombre, orden))
        return True