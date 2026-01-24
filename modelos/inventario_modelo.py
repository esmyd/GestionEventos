"""
Modelo para gestión de inventario dinámico
"""
from modelos.base_datos import BaseDatos
from utilidades.logger import obtener_logger


class InventarioModelo:
    """Clase para operaciones de inventario dinámico"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.logger = obtener_logger()
        self._asegurar_columnas_producto()
    
    def _asegurar_columnas_producto(self):
        """Asegura que los productos tengan las columnas necesarias para control de inventario"""
        try:
            # Verificar si existe control_inventario
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'productos'
              AND COLUMN_NAME = 'control_inventario'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE productos ADD COLUMN control_inventario ENUM('ilimitado', 'controlado') DEFAULT 'ilimitado'"
                )
            
            # Verificar si existe stock_minimo
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'productos'
              AND COLUMN_NAME = 'stock_minimo'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE productos ADD COLUMN stock_minimo INT DEFAULT 0"
                )
            
            # Verificar si existe alerta_stock_bajo
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'productos'
              AND COLUMN_NAME = 'alerta_stock_bajo'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE productos ADD COLUMN alerta_stock_bajo BOOLEAN DEFAULT TRUE"
                )
        except Exception as e:
            self.logger.warning(f"Error al asegurar columnas de inventario: {e}")
    
    def obtener_stock_disponible(self, producto_id):
        """Obtiene el stock disponible de un producto"""
        consulta = """
        SELECT 
            stock_disponible,
            stock,
            control_inventario,
            stock_minimo,
            alerta_stock_bajo
        FROM productos
        WHERE id = %s
        """
        return self.base_datos.obtener_uno(consulta, (producto_id,))
    
    def validar_stock_suficiente(self, producto_id, cantidad_requerida):
        """Valida si hay stock suficiente para una cantidad requerida"""
        producto = self.obtener_stock_disponible(producto_id)
        if not producto:
            return False, "Producto no encontrado"
        
        control = producto.get("control_inventario", "ilimitado")
        if control == "ilimitado":
            return True, None
        
        stock_disponible = int(producto.get("stock_disponible") or 0)
        if stock_disponible >= cantidad_requerida:
            return True, None
        
        return False, f"Stock insuficiente. Disponible: {stock_disponible}, Requerido: {cantidad_requerida}"
    
    def reservar_stock(self, producto_id, evento_id, cantidad, tipo="reservado"):
        """
        Reserva stock para un evento
        tipo: 'reservado' (para eventos confirmados) o 'temporal' (para cotizaciones)
        """
        producto = self.obtener_stock_disponible(producto_id)
        if not producto:
            return False, "Producto no encontrado"
        
        control = producto.get("control_inventario", "ilimitado")
        if control == "ilimitado":
            # Registrar en inventario pero no descontar stock
            self._registrar_movimiento(producto_id, evento_id, cantidad, tipo, "reservado")
            return True, None
        
        stock_disponible = int(producto.get("stock_disponible") or 0)
        if stock_disponible < cantidad:
            return False, f"Stock insuficiente. Disponible: {stock_disponible}, Requerido: {cantidad}"
        
        # Descontar del stock disponible
        nuevo_stock = stock_disponible - cantidad
        consulta = "UPDATE productos SET stock_disponible = %s WHERE id = %s"
        self.base_datos.ejecutar_consulta(consulta, (nuevo_stock, producto_id))
        
        # Registrar movimiento
        self._registrar_movimiento(producto_id, evento_id, cantidad, tipo, "reservado")
        
        # Verificar alerta de stock bajo
        self._verificar_alerta_stock_bajo(producto_id, nuevo_stock)
        
        return True, None
    
    def liberar_stock(self, producto_id, evento_id, cantidad):
        """Libera stock reservado para un evento"""
        producto = self.obtener_stock_disponible(producto_id)
        if not producto:
            return False, "Producto no encontrado"
        
        control = producto.get("control_inventario", "ilimitado")
        if control == "ilimitado":
            # Solo marcar como devuelto en inventario
            self._marcar_devuelto(producto_id, evento_id)
            return True, None
        
        # Incrementar stock disponible
        stock_disponible = int(producto.get("stock_disponible") or 0)
        nuevo_stock = stock_disponible + cantidad
        consulta = "UPDATE productos SET stock_disponible = %s WHERE id = %s"
        self.base_datos.ejecutar_consulta(consulta, (nuevo_stock, producto_id))
        
        # Marcar como devuelto en inventario
        self._marcar_devuelto(producto_id, evento_id)
        
        return True, None
    
    def _registrar_movimiento(self, producto_id, evento_id, cantidad, tipo, estado):
        """Registra un movimiento en la tabla inventario"""
        # Verificar si ya existe un registro para este producto y evento
        consulta_existe = """
        SELECT id FROM inventario
        WHERE producto_id = %s AND id_evento = %s AND estado != 'devuelto'
        """
        existente = self.base_datos.obtener_uno(consulta_existe, (producto_id, evento_id))
        
        if existente:
            # Actualizar registro existente
            consulta = """
            UPDATE inventario
            SET cantidad_solicitada = %s,
                cantidad_disponible = cantidad_disponible - %s,
                estado = %s,
                fecha_reserva = CURDATE()
            WHERE id = %s
            """
            self.base_datos.ejecutar_consulta(consulta, (cantidad, cantidad, estado, existente.get("id")))
        else:
            # Crear nuevo registro
            consulta = """
            INSERT INTO inventario (producto_id, id_evento, cantidad_solicitada, cantidad_disponible, estado, fecha_reserva)
            VALUES (%s, %s, %s, %s, %s, CURDATE())
            """
            producto = self.obtener_stock_disponible(producto_id)
            stock_actual = int(producto.get("stock_disponible") or 0) if producto else 0
            self.base_datos.ejecutar_consulta(consulta, (producto_id, evento_id, cantidad, stock_actual, estado))
    
    def _marcar_devuelto(self, producto_id, evento_id):
        """Marca el inventario como devuelto"""
        consulta = """
        UPDATE inventario
        SET estado = 'devuelto',
            fecha_devolucion = CURDATE()
        WHERE producto_id = %s AND id_evento = %s AND estado != 'devuelto'
        """
        self.base_datos.ejecutar_consulta(consulta, (producto_id, evento_id))
    
    def _verificar_alerta_stock_bajo(self, producto_id, stock_actual):
        """Verifica si el stock está por debajo del mínimo y genera alerta si es necesario"""
        producto = self.obtener_stock_disponible(producto_id)
        if not producto:
            return
        
        stock_minimo = int(producto.get("stock_minimo") or 0)
        alerta_activa = bool(producto.get("alerta_stock_bajo") or False)
        
        if alerta_activa and stock_actual <= stock_minimo:
            self.logger.warning(
                f"ALERTA: Producto ID {producto_id} tiene stock bajo. "
                f"Actual: {stock_actual}, Mínimo: {stock_minimo}"
            )
    
    def obtener_productos_stock_bajo(self):
        """Obtiene productos con stock bajo o agotado"""
        consulta = """
        SELECT 
            id,
            nombre,
            stock_disponible,
            stock_minimo,
            control_inventario,
            alerta_stock_bajo
        FROM productos
        WHERE control_inventario = 'controlado'
          AND alerta_stock_bajo = TRUE
          AND stock_disponible <= stock_minimo
          AND activo = TRUE
        ORDER BY stock_disponible ASC
        """
        return self.base_datos.obtener_todos(consulta)
    
    def obtener_movimientos_evento(self, evento_id):
        """Obtiene todos los movimientos de inventario para un evento"""
        consulta = """
        SELECT 
            i.*,
            p.nombre as nombre_producto,
            p.control_inventario
        FROM inventario i
        JOIN productos p ON i.producto_id = p.id
        WHERE i.id_evento = %s
        ORDER BY i.fecha_reserva DESC
        """
        return self.base_datos.obtener_todos(consulta, (evento_id,))
    
    def validar_stock_plan(self, plan_id, cantidad_eventos=1):
        """Valida si hay stock suficiente para todos los productos de un plan"""
        consulta = """
        SELECT pp.producto_id, pp.cantidad, p.nombre, p.control_inventario, p.stock_disponible
        FROM plan_productos pp
        JOIN productos p ON pp.producto_id = p.id
        WHERE pp.plan_id = %s
        """
        productos_plan = self.base_datos.obtener_todos(consulta, (plan_id,))
        
        productos_insuficientes = []
        for producto in productos_plan or []:
            producto_id = producto.get("producto_id")
            cantidad_requerida = int(producto.get("cantidad") or 1) * cantidad_eventos
            control = producto.get("control_inventario", "ilimitado")
            
            if control == "controlado":
                stock_disponible = int(producto.get("stock_disponible") or 0)
                if stock_disponible < cantidad_requerida:
                    productos_insuficientes.append({
                        "producto_id": producto_id,
                        "nombre": producto.get("nombre"),
                        "requerido": cantidad_requerida,
                        "disponible": stock_disponible
                    })
        
        if productos_insuficientes:
            return False, productos_insuficientes
        
        return True, None
    
    def reservar_stock_plan(self, plan_id, evento_id, cantidad_eventos=1):
        """Reserva stock para todos los productos de un plan"""
        consulta = """
        SELECT pp.producto_id, pp.cantidad
        FROM plan_productos pp
        JOIN productos p ON pp.producto_id = p.id
        WHERE pp.plan_id = %s
        """
        productos_plan = self.base_datos.obtener_todos(consulta, (plan_id,))
        
        errores = []
        for producto in productos_plan or []:
            producto_id = producto.get("producto_id")
            cantidad_requerida = int(producto.get("cantidad") or 1) * cantidad_eventos
            ok, error = self.reservar_stock(producto_id, evento_id, cantidad_requerida)
            if not ok:
                errores.append(f"Producto ID {producto_id}: {error}")
        
        if errores:
            return False, errores
        
        return True, None
    
    def liberar_stock_plan(self, plan_id, evento_id, cantidad_eventos=1):
        """Libera stock reservado para todos los productos de un plan"""
        consulta = """
        SELECT pp.producto_id, pp.cantidad
        FROM plan_productos pp
        JOIN productos p ON pp.producto_id = p.id
        WHERE pp.plan_id = %s
        """
        productos_plan = self.base_datos.obtener_todos(consulta, (plan_id,))
        
        for producto in productos_plan or []:
            producto_id = producto.get("producto_id")
            cantidad_requerida = int(producto.get("cantidad") or 1) * cantidad_eventos
            self.liberar_stock(producto_id, evento_id, cantidad_requerida)
        
        return True
