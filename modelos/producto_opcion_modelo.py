"""
Modelo para gestión de opciones de productos que requieren confirmación
"""
from modelos.base_datos import BaseDatos
from utilidades.logger import obtener_logger


class ProductoOpcionModelo:
    """Clase para gestionar opciones de productos"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.logger = obtener_logger()
    
    # ==========================================
    # GESTIÓN DE OPCIONES DE PRODUCTOS
    # ==========================================
    
    def crear_opcion(self, datos):
        """Crea un nuevo grupo de opciones para un producto
        
        Args:
            datos: dict con producto_id, nombre_grupo, opciones, permite_multiple, requerido, orden
        
        Returns:
            int: ID de la opción creada o None si falla
        """
        if not datos.get('producto_id') or not datos.get('nombre_grupo') or not datos.get('opciones'):
            raise ValueError("producto_id, nombre_grupo y opciones son requeridos")
        
        consulta = """
            INSERT INTO producto_opciones 
            (producto_id, nombre_grupo, opciones, permite_multiple, requerido, orden)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos['producto_id'],
            datos['nombre_grupo'],
            datos['opciones'],
            datos.get('permite_multiple', False),
            datos.get('requerido', True),
            datos.get('orden', 0)
        )
        
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            opcion_id = self.base_datos.obtener_ultimo_id()
            self.logger.info(f"Opción creada ID {opcion_id} para producto {datos['producto_id']}")
            return opcion_id
        
        self.logger.error(f"Error al crear opción para producto {datos['producto_id']}")
        return None
    
    def obtener_opciones_producto(self, producto_id):
        """Obtiene todas las opciones de un producto
        
        Args:
            producto_id: ID del producto
        
        Returns:
            list: Lista de opciones del producto
        """
        consulta = """
            SELECT id, producto_id, nombre_grupo, opciones, permite_multiple, 
                   requerido, orden, activo
            FROM producto_opciones
            WHERE producto_id = %s AND activo = 1
            ORDER BY orden ASC, id ASC
        """
        resultados = self.base_datos.obtener_todos(consulta, (producto_id,))
        
        # Convertir opciones de string a lista
        for opcion in resultados:
            if opcion.get('opciones'):
                opcion['opciones_lista'] = opcion['opciones'].split('|')
        
        return resultados
    
    def obtener_opcion_por_id(self, opcion_id):
        """Obtiene una opción por su ID
        
        Args:
            opcion_id: ID de la opción
        
        Returns:
            dict: Datos de la opción o None
        """
        consulta = """
            SELECT po.*, p.nombre as producto_nombre
            FROM producto_opciones po
            JOIN productos p ON po.producto_id = p.id
            WHERE po.id = %s
        """
        resultado = self.base_datos.obtener_uno(consulta, (opcion_id,))
        
        if resultado and resultado.get('opciones'):
            resultado['opciones_lista'] = resultado['opciones'].split('|')
        
        return resultado
    
    def actualizar_opcion(self, opcion_id, datos):
        """Actualiza una opción existente
        
        Args:
            opcion_id: ID de la opción
            datos: dict con campos a actualizar
        
        Returns:
            bool: True si se actualizó correctamente
        """
        campos = []
        valores = []
        
        if 'nombre_grupo' in datos:
            campos.append('nombre_grupo = %s')
            valores.append(datos['nombre_grupo'])
        
        if 'opciones' in datos:
            campos.append('opciones = %s')
            valores.append(datos['opciones'])
        
        if 'permite_multiple' in datos:
            campos.append('permite_multiple = %s')
            valores.append(datos['permite_multiple'])
        
        if 'requerido' in datos:
            campos.append('requerido = %s')
            valores.append(datos['requerido'])
        
        if 'orden' in datos:
            campos.append('orden = %s')
            valores.append(datos['orden'])
        
        if not campos:
            return False
        
        valores.append(opcion_id)
        consulta = f"UPDATE producto_opciones SET {', '.join(campos)} WHERE id = %s"
        
        if self.base_datos.ejecutar_consulta(consulta, tuple(valores)):
            self.logger.info(f"Opción ID {opcion_id} actualizada")
            return True
        
        return False
    
    def eliminar_opcion(self, opcion_id):
        """Elimina (desactiva) una opción
        
        Args:
            opcion_id: ID de la opción
        
        Returns:
            bool: True si se eliminó correctamente
        """
        consulta = "UPDATE producto_opciones SET activo = 0 WHERE id = %s"
        
        if self.base_datos.ejecutar_consulta(consulta, (opcion_id,)):
            self.logger.info(f"Opción ID {opcion_id} desactivada")
            return True
        
        return False
    
    def eliminar_opcion_permanente(self, opcion_id):
        """Elimina permanentemente una opción (solo si no tiene selecciones)
        
        Args:
            opcion_id: ID de la opción
        
        Returns:
            bool: True si se eliminó correctamente
        """
        # Verificar si tiene selecciones
        consulta_check = "SELECT COUNT(*) as total FROM evento_producto_selecciones WHERE opcion_id = %s"
        resultado = self.base_datos.obtener_uno(consulta_check, (opcion_id,))
        
        if resultado and resultado['total'] > 0:
            raise ValueError("No se puede eliminar la opción porque tiene selecciones asociadas")
        
        consulta = "DELETE FROM producto_opciones WHERE id = %s"
        
        if self.base_datos.ejecutar_consulta(consulta, (opcion_id,)):
            self.logger.info(f"Opción ID {opcion_id} eliminada permanentemente")
            return True
        
        return False
    
    # ==========================================
    # GESTIÓN DE SELECCIONES POR EVENTO
    # ==========================================
    
    def guardar_seleccion(self, datos):
        """Guarda o actualiza la selección de una opción para un evento
        
        Args:
            datos: dict con evento_id, producto_id, opcion_id, seleccion, cantidad, observaciones, confirmado_por
        
        Returns:
            int: ID de la selección o None si falla
        """
        if not datos.get('evento_id') or not datos.get('opcion_id') or not datos.get('seleccion'):
            raise ValueError("evento_id, opcion_id y seleccion son requeridos")
        
        # Verificar si ya existe una selección para este evento y opción
        consulta_check = """
            SELECT id FROM evento_producto_selecciones 
            WHERE evento_id = %s AND opcion_id = %s
        """
        existente = self.base_datos.obtener_uno(consulta_check, (datos['evento_id'], datos['opcion_id']))
        
        if existente:
            # Actualizar selección existente
            consulta = """
                UPDATE evento_producto_selecciones 
                SET seleccion = %s, cantidad = %s, observaciones = %s,
                    confirmado_por = %s, fecha_confirmacion = NOW()
                WHERE id = %s
            """
            parametros = (
                datos['seleccion'],
                datos.get('cantidad'),
                datos.get('observaciones'),
                datos.get('confirmado_por'),
                existente['id']
            )
            
            if self.base_datos.ejecutar_consulta(consulta, parametros):
                self.logger.info(f"Selección actualizada para evento {datos['evento_id']}, opción {datos['opcion_id']}")
                return existente['id']
        else:
            # Obtener producto_id de la opción
            opcion = self.obtener_opcion_por_id(datos['opcion_id'])
            if not opcion:
                raise ValueError("Opción no encontrada")
            
            # Crear nueva selección
            consulta = """
                INSERT INTO evento_producto_selecciones 
                (evento_id, producto_id, opcion_id, seleccion, cantidad, observaciones, confirmado_por, fecha_confirmacion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            """
            parametros = (
                datos['evento_id'],
                opcion['producto_id'],
                datos['opcion_id'],
                datos['seleccion'],
                datos.get('cantidad'),
                datos.get('observaciones'),
                datos.get('confirmado_por')
            )
            
            if self.base_datos.ejecutar_consulta(consulta, parametros):
                seleccion_id = self.base_datos.obtener_ultimo_id()
                self.logger.info(f"Selección creada ID {seleccion_id} para evento {datos['evento_id']}")
                return seleccion_id
        
        return None
    
    def obtener_selecciones_evento(self, evento_id):
        """Obtiene todas las selecciones de un evento
        
        Args:
            evento_id: ID del evento
        
        Returns:
            list: Lista de selecciones con información de producto y opción
        """
        consulta = """
            SELECT eps.*, 
                   po.nombre_grupo, po.opciones, po.permite_multiple, po.requerido,
                   p.nombre as producto_nombre,
                   u.nombre_completo as confirmado_por_nombre
            FROM evento_producto_selecciones eps
            JOIN producto_opciones po ON eps.opcion_id = po.id
            JOIN productos p ON eps.producto_id = p.id
            LEFT JOIN usuarios u ON eps.confirmado_por = u.id
            WHERE eps.evento_id = %s
            ORDER BY p.nombre, po.orden
        """
        resultados = self.base_datos.obtener_todos(consulta, (evento_id,))
        
        for seleccion in resultados:
            if seleccion.get('opciones'):
                seleccion['opciones_lista'] = seleccion['opciones'].split('|')
            if seleccion.get('seleccion'):
                seleccion['seleccion_lista'] = seleccion['seleccion'].split('|')
        
        return resultados
    
    def obtener_opciones_pendientes_evento(self, evento_id):
        """Obtiene las opciones que faltan por confirmar en un evento
        
        Args:
            evento_id: ID del evento
        
        Returns:
            list: Lista de opciones pendientes de confirmación
        """
        # Buscar opciones tanto en productos adicionales como en productos del plan
        consulta = """
            SELECT DISTINCT po.*, p.nombre as producto_nombre
            FROM producto_opciones po
            JOIN productos p ON po.producto_id = p.id
            LEFT JOIN evento_producto_selecciones eps 
                ON eps.evento_id = %s AND eps.opcion_id = po.id
            WHERE po.activo = 1
              AND eps.id IS NULL
              AND (
                  -- Productos adicionales del evento
                  EXISTS (
                      SELECT 1 FROM evento_productos ep 
                      WHERE ep.id_evento = %s AND ep.producto_id = p.id
                  )
                  OR
                  -- Productos del plan del evento
                  EXISTS (
                      SELECT 1 FROM eventos e
                      JOIN plan_productos pp ON e.plan_id = pp.plan_id
                      WHERE e.id_evento = %s AND pp.producto_id = p.id
                  )
              )
            ORDER BY p.nombre, po.orden
        """
        resultados = self.base_datos.obtener_todos(consulta, (evento_id, evento_id, evento_id))
        
        for opcion in resultados:
            if opcion.get('opciones'):
                opcion['opciones_lista'] = opcion['opciones'].split('|')
        
        return resultados
    
    def obtener_resumen_confirmaciones_evento(self, evento_id):
        """Obtiene un resumen de confirmaciones pendientes y completadas
        
        Args:
            evento_id: ID del evento
        
        Returns:
            dict: Resumen con totales y detalles
        """
        # Obtener opciones pendientes
        pendientes = self.obtener_opciones_pendientes_evento(evento_id)
        
        # Obtener selecciones confirmadas
        confirmadas = self.obtener_selecciones_evento(evento_id)
        
        return {
            'total_pendientes': len(pendientes),
            'total_confirmadas': len(confirmadas),
            'pendientes': pendientes,
            'confirmadas': confirmadas,
            'completo': len(pendientes) == 0
        }
    
    def eliminar_seleccion(self, seleccion_id):
        """Elimina una selección
        
        Args:
            seleccion_id: ID de la selección
        
        Returns:
            bool: True si se eliminó correctamente
        """
        consulta = "DELETE FROM evento_producto_selecciones WHERE id = %s"
        
        if self.base_datos.ejecutar_consulta(consulta, (seleccion_id,)):
            self.logger.info(f"Selección ID {seleccion_id} eliminada")
            return True
        
        return False
    
    # ==========================================
    # PRODUCTOS CON OPCIONES
    # ==========================================
    
    def obtener_productos_con_opciones(self):
        """Obtiene todos los productos que tienen opciones configuradas
        
        Returns:
            list: Lista de productos con sus opciones
        """
        consulta = """
            SELECT p.id, p.nombre, p.categoria, p.tipo,
                   COUNT(po.id) as total_opciones
            FROM productos p
            JOIN producto_opciones po ON p.id = po.producto_id
            WHERE po.activo = 1 AND p.activo = 1
            GROUP BY p.id
            ORDER BY p.nombre
        """
        return self.base_datos.obtener_todos(consulta)
    
    def marcar_producto_requiere_confirmacion(self, producto_id, requiere=True):
        """Marca un producto como que requiere confirmación
        
        Args:
            producto_id: ID del producto
            requiere: True si requiere confirmación
        
        Returns:
            bool: True si se actualizó correctamente
        """
        consulta = "UPDATE productos SET requiere_confirmacion = %s WHERE id = %s"
        
        if self.base_datos.ejecutar_consulta(consulta, (requiere, producto_id)):
            self.logger.info(f"Producto {producto_id} marcado requiere_confirmacion={requiere}")
            return True
        
        return False
