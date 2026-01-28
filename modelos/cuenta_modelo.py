"""
Modelo para gestión de cuentas para confirmación de pagos
"""
from modelos.base_datos import BaseDatos
from utilidades.logger import obtener_logger


class CuentaModelo:
    """Clase para operaciones CRUD de cuentas"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.logger = obtener_logger()
        self._asegurar_tabla_cuentas()
    
    def _asegurar_tabla_cuentas(self):
        """Crea la tabla de cuentas si no existe"""
        try:
            consulta = """
            CREATE TABLE IF NOT EXISTS cuentas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL COMMENT 'Nombre identificador de la cuenta',
                tipo ENUM('ahorros', 'corriente', 'digital', 'efectivo', 'otro') NOT NULL DEFAULT 'ahorros' COMMENT 'Tipo de cuenta',
                numero_cuenta VARCHAR(50) NULL COMMENT 'Número de cuenta bancaria',
                descripcion TEXT NULL COMMENT 'Descripción detallada de la cuenta',
                activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado de la cuenta (1=activa, 0=inactiva)',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
                INDEX idx_cuentas_tipo (tipo),
                INDEX idx_cuentas_activo (activo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas para confirmación y registro de pagos'
            """
            self.base_datos.ejecutar_consulta(consulta)
            self._asegurar_columna_numero_cuenta()
        except Exception as e:
            self.logger.warning(f"No se pudo asegurar la tabla cuentas: {e}")
    
    def _asegurar_columna_numero_cuenta(self):
        """Asegura que exista la columna numero_cuenta"""
        try:
            columnas = self.base_datos.obtener_todos("SHOW COLUMNS FROM cuentas")
            columnas_nombres = {col.get("Field") for col in columnas if col.get("Field")}
            if "numero_cuenta" not in columnas_nombres:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE cuentas ADD COLUMN numero_cuenta VARCHAR(50) NULL COMMENT 'Número de cuenta bancaria' AFTER tipo"
                )
                self.logger.info("Columna numero_cuenta agregada a tabla cuentas")
        except Exception as e:
            self.logger.warning(f"No se pudo asegurar columna numero_cuenta: {e}")
    
    def crear_cuenta(self, datos_cuenta):
        """Crea una nueva cuenta
        
        Args:
            datos_cuenta: dict con nombre, tipo, numero_cuenta (opcional), descripcion (opcional)
        
        Returns:
            int: ID de la cuenta creada o None si hubo error
        """
        nombre = datos_cuenta.get('nombre')
        tipo = datos_cuenta.get('tipo', 'ahorros')
        numero_cuenta = datos_cuenta.get('numero_cuenta')
        descripcion = datos_cuenta.get('descripcion')
        activo = datos_cuenta.get('activo', True)
        
        if not nombre:
            self.logger.error("El nombre de la cuenta es requerido")
            raise ValueError("El nombre de la cuenta es requerido")
        
        # Validar tipo
        tipos_validos = ['ahorros', 'corriente', 'digital', 'efectivo', 'otro']
        if tipo not in tipos_validos:
            self.logger.error(f"Tipo de cuenta inválido: {tipo}")
            raise ValueError(f"Tipo de cuenta inválido. Debe ser uno de: {', '.join(tipos_validos)}")
        
        self.logger.info(f"Creando cuenta: {nombre}, tipo: {tipo}")
        
        consulta = """
        INSERT INTO cuentas (nombre, tipo, numero_cuenta, descripcion, activo)
        VALUES (%s, %s, %s, %s, %s)
        """
        parametros = (nombre, tipo, numero_cuenta, descripcion, 1 if activo else 0)
        
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            cuenta_id = self.base_datos.obtener_ultimo_id()
            self.logger.info(f"Cuenta creada exitosamente - ID: {cuenta_id}")
            return cuenta_id
        
        self.logger.error("Error al crear cuenta")
        return None
    
    def obtener_cuenta_por_id(self, cuenta_id):
        """Obtiene una cuenta por su ID
        
        Args:
            cuenta_id: ID de la cuenta
        
        Returns:
            dict: Datos de la cuenta o None si no existe
        """
        consulta = "SELECT * FROM cuentas WHERE id = %s LIMIT 1"
        resultado = self.base_datos.obtener_uno(consulta, (cuenta_id,))
        
        if resultado:
            self.logger.debug(f"Cuenta obtenida por ID: {cuenta_id}")
        else:
            self.logger.debug(f"Cuenta ID {cuenta_id} no encontrada")
        
        return resultado
    
    def obtener_todas_cuentas(self, incluir_inactivas=False):
        """Obtiene todas las cuentas
        
        Args:
            incluir_inactivas: Si es True, incluye cuentas inactivas
        
        Returns:
            list: Lista de cuentas
        """
        if incluir_inactivas:
            consulta = "SELECT * FROM cuentas ORDER BY nombre ASC"
            return self.base_datos.obtener_todos(consulta)
        else:
            consulta = "SELECT * FROM cuentas WHERE activo = 1 ORDER BY nombre ASC"
            return self.base_datos.obtener_todos(consulta)
    
    def obtener_cuentas_por_tipo(self, tipo):
        """Obtiene cuentas por tipo
        
        Args:
            tipo: Tipo de cuenta (bancaria, efectivo, digital, otro)
        
        Returns:
            list: Lista de cuentas del tipo especificado
        """
        consulta = "SELECT * FROM cuentas WHERE tipo = %s AND activo = 1 ORDER BY nombre ASC"
        return self.base_datos.obtener_todos(consulta, (tipo,))
    
    def actualizar_cuenta(self, cuenta_id, datos_cuenta):
        """Actualiza una cuenta existente
        
        Args:
            cuenta_id: ID de la cuenta a actualizar
            datos_cuenta: dict con los campos a actualizar
        
        Returns:
            bool: True si se actualizó correctamente
        """
        cuenta_actual = self.obtener_cuenta_por_id(cuenta_id)
        if not cuenta_actual:
            self.logger.error(f"Cuenta ID {cuenta_id} no encontrada para actualizar")
            raise ValueError(f"Cuenta {cuenta_id} no encontrada")
        
        campos = []
        valores = []
        
        if 'nombre' in datos_cuenta:
            campos.append("nombre = %s")
            valores.append(datos_cuenta['nombre'])
        
        if 'tipo' in datos_cuenta:
            tipos_validos = ['ahorros', 'corriente', 'digital', 'efectivo', 'otro']
            if datos_cuenta['tipo'] not in tipos_validos:
                raise ValueError(f"Tipo de cuenta inválido. Debe ser uno de: {', '.join(tipos_validos)}")
            campos.append("tipo = %s")
            valores.append(datos_cuenta['tipo'])
        
        if 'numero_cuenta' in datos_cuenta:
            campos.append("numero_cuenta = %s")
            valores.append(datos_cuenta['numero_cuenta'])
        
        if 'descripcion' in datos_cuenta:
            campos.append("descripcion = %s")
            valores.append(datos_cuenta['descripcion'])
        
        if 'activo' in datos_cuenta:
            campos.append("activo = %s")
            valores.append(1 if datos_cuenta['activo'] else 0)
        
        if not campos:
            self.logger.warning(f"No hay campos para actualizar en cuenta ID {cuenta_id}")
            return True
        
        valores.append(cuenta_id)
        consulta = f"UPDATE cuentas SET {', '.join(campos)} WHERE id = %s"
        
        self.logger.info(f"Actualizando cuenta ID {cuenta_id}")
        
        if self.base_datos.ejecutar_consulta(consulta, tuple(valores)):
            self.logger.info(f"Cuenta ID {cuenta_id} actualizada exitosamente")
            return True
        
        error_detalle = getattr(self.base_datos, 'ultimo_error', 'Sin detalle')
        self.logger.error(f"Error al actualizar cuenta ID {cuenta_id}: {error_detalle}")
        return False
    
    def eliminar_cuenta(self, cuenta_id):
        """Elimina (desactiva) una cuenta
        
        Nota: No elimina físicamente, solo marca como inactiva para
        mantener la integridad referencial con pagos existentes.
        
        Args:
            cuenta_id: ID de la cuenta a eliminar
        
        Returns:
            bool: True si se eliminó correctamente
        """
        cuenta_actual = self.obtener_cuenta_por_id(cuenta_id)
        if not cuenta_actual:
            self.logger.error(f"Cuenta ID {cuenta_id} no encontrada para eliminar")
            raise ValueError(f"Cuenta {cuenta_id} no encontrada")
        
        self.logger.info(f"Desactivando cuenta ID {cuenta_id}, estado actual: activo={cuenta_actual.get('activo')}")
        
        # Usar conexión directa para asegurar commit
        try:
            conexion = self.base_datos._obtener_conexion()
            cursor = conexion.cursor(buffered=True)
            consulta = "UPDATE cuentas SET activo = 0 WHERE id = %s"
            cursor.execute(consulta, (cuenta_id,))
            filas_afectadas = cursor.rowcount
            conexion.commit()
            cursor.close()
            
            self.logger.info(f"UPDATE ejecutado para cuenta ID {cuenta_id}, filas afectadas: {filas_afectadas}")
            
            if filas_afectadas > 0:
                self.logger.info(f"Cuenta ID {cuenta_id} desactivada exitosamente")
                return True
            else:
                self.logger.error(f"No se afectaron filas al desactivar cuenta ID {cuenta_id}")
                return False
        except Exception as e:
            self.logger.error(f"Error al desactivar cuenta ID {cuenta_id}: {str(e)}")
            return False
    
    def activar_cuenta(self, cuenta_id):
        """Reactiva una cuenta desactivada
        
        Args:
            cuenta_id: ID de la cuenta a activar
        
        Returns:
            bool: True si se activó correctamente
        """
        self.logger.info(f"Activando cuenta ID {cuenta_id}")
        
        try:
            conexion = self.base_datos._obtener_conexion()
            cursor = conexion.cursor(buffered=True)
            consulta = "UPDATE cuentas SET activo = 1 WHERE id = %s"
            cursor.execute(consulta, (cuenta_id,))
            filas_afectadas = cursor.rowcount
            conexion.commit()
            cursor.close()
            
            self.logger.info(f"UPDATE ejecutado para cuenta ID {cuenta_id}, filas afectadas: {filas_afectadas}")
            
            if filas_afectadas > 0:
                self.logger.info(f"Cuenta ID {cuenta_id} activada exitosamente")
                return True
            else:
                self.logger.error(f"No se afectaron filas al activar cuenta ID {cuenta_id}")
                return False
        except Exception as e:
            self.logger.error(f"Error al activar cuenta ID {cuenta_id}: {str(e)}")
            return False
    
    def obtener_total_cuentas(self):
        """Obtiene el total de cuentas activas"""
        consulta = "SELECT COUNT(*) as total FROM cuentas WHERE activo = 1"
        resultado = self.base_datos.obtener_uno(consulta)
        return int(resultado['total']) if resultado else 0
    
    def buscar_cuentas(self, termino):
        """Busca cuentas por nombre o descripción
        
        Args:
            termino: Término de búsqueda
        
        Returns:
            list: Lista de cuentas que coinciden
        """
        consulta = """
        SELECT * FROM cuentas 
        WHERE activo = 1 AND (nombre LIKE %s OR descripcion LIKE %s)
        ORDER BY nombre ASC
        """
        termino_busqueda = f"%{termino}%"
        return self.base_datos.obtener_todos(consulta, (termino_busqueda, termino_busqueda))
    
    def obtener_estadisticas_uso(self, cuenta_id):
        """Obtiene estadísticas de uso de una cuenta
        
        Args:
            cuenta_id: ID de la cuenta
        
        Returns:
            dict: Estadísticas de uso (total_pagos, monto_total)
        """
        try:
            consulta = """
            SELECT 
                COUNT(*) as total_pagos,
                COALESCE(SUM(monto), 0) as monto_total
            FROM pagos 
            WHERE cuenta_id = %s
            """
            resultado = self.base_datos.obtener_uno(consulta, (cuenta_id,))
            return {
                'total_pagos': int(resultado['total_pagos']) if resultado else 0,
                'monto_total': float(resultado['monto_total']) if resultado else 0.0
            }
        except Exception as e:
            self.logger.warning(f"Error al obtener estadísticas de cuenta {cuenta_id}: {e}")
            return {'total_pagos': 0, 'monto_total': 0.0}
