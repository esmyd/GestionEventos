"""
Modelo para gestión de clientes
"""
from datetime import date
from modelos.base_datos import BaseDatos


class ClienteModelo:
    """Clase para operaciones CRUD de clientes"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self._campos_extendidos = None
    
    def _tiene_campos_extendidos(self):
        """Verifica si la tabla clientes tiene los campos de fidelización"""
        if self._campos_extendidos is None:
            try:
                consulta = """
                SELECT COUNT(*) as existe FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = 'clientes' 
                AND column_name = 'fecha_nacimiento'
                """
                resultado = self.base_datos.obtener_uno(consulta)
                self._campos_extendidos = resultado and resultado.get('existe', 0) > 0
            except:
                self._campos_extendidos = False
        return self._campos_extendidos
    
    def crear_cliente(self, datos_cliente):
        """Crea un nuevo cliente"""
        if self._tiene_campos_extendidos():
            consulta = """
            INSERT INTO clientes (
                usuario_id, documento_identidad, direccion,
                fecha_nacimiento, pais, provincia, ciudad
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            parametros = (
                datos_cliente['usuario_id'],
                datos_cliente.get('documento_identidad'),
                datos_cliente.get('direccion'),
                datos_cliente.get('fecha_nacimiento'),
                datos_cliente.get('pais', 'Ecuador'),
                datos_cliente.get('provincia', 'Guayas'),
                datos_cliente.get('ciudad', 'Guayaquil')
            )
        else:
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
        """Obtiene un cliente por su ID con edad calculada"""
        if self._tiene_campos_extendidos():
            consulta = """
            SELECT 
                c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
                c.fecha_nacimiento, c.pais, c.provincia, c.ciudad,
                c.fecha_ultimo_evento, c.cantidad_eventos_completados,
                u.nombre_completo, u.email, u.telefono,
                CASE 
                    WHEN c.fecha_nacimiento IS NOT NULL 
                    THEN TIMESTAMPDIFF(YEAR, c.fecha_nacimiento, CURDATE())
                    ELSE NULL 
                END AS edad
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.id = %s
            """
        else:
            consulta = """
            SELECT 
                c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
                NULL AS fecha_nacimiento, 'Ecuador' AS pais, 'Guayas' AS provincia, 
                'Guayaquil' AS ciudad, NULL AS fecha_ultimo_evento, 
                0 AS cantidad_eventos_completados,
                u.nombre_completo, u.email, u.telefono,
                NULL AS edad
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.id = %s
            """
        return self.base_datos.obtener_uno(consulta, (cliente_id,))
    
    def obtener_cliente_por_usuario(self, usuario_id):
        """Obtiene un cliente por su usuario_id"""
        if self._tiene_campos_extendidos():
            consulta = """
            SELECT 
                c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
                c.fecha_nacimiento, c.pais, c.provincia, c.ciudad,
                c.fecha_ultimo_evento, c.cantidad_eventos_completados,
                u.nombre_completo, u.email, u.telefono,
                CASE 
                    WHEN c.fecha_nacimiento IS NOT NULL 
                    THEN TIMESTAMPDIFF(YEAR, c.fecha_nacimiento, CURDATE())
                    ELSE NULL 
                END AS edad
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.usuario_id = %s
            """
        else:
            consulta = """
            SELECT 
                c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
                NULL AS fecha_nacimiento, 'Ecuador' AS pais, 'Guayas' AS provincia, 
                'Guayaquil' AS ciudad, NULL AS fecha_ultimo_evento, 
                0 AS cantidad_eventos_completados,
                u.nombre_completo, u.email, u.telefono,
                NULL AS edad
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.usuario_id = %s
            """
        return self.base_datos.obtener_uno(consulta, (usuario_id,))
    
    def obtener_todos_clientes(self):
        """Obtiene todos los clientes con edad calculada"""
        if self._tiene_campos_extendidos():
            consulta = """
            SELECT 
                c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
                c.fecha_nacimiento, c.pais, c.provincia, c.ciudad,
                c.fecha_ultimo_evento, c.cantidad_eventos_completados,
                u.nombre_completo, u.email, u.telefono,
                CASE 
                    WHEN c.fecha_nacimiento IS NOT NULL 
                    THEN TIMESTAMPDIFF(YEAR, c.fecha_nacimiento, CURDATE())
                    ELSE NULL 
                END AS edad
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY u.nombre_completo
            """
        else:
            consulta = """
            SELECT 
                c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
                NULL AS fecha_nacimiento, 'Ecuador' AS pais, 'Guayas' AS provincia, 
                'Guayaquil' AS ciudad, NULL AS fecha_ultimo_evento, 
                0 AS cantidad_eventos_completados,
                u.nombre_completo, u.email, u.telefono,
                NULL AS edad
            FROM clientes c
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY u.nombre_completo
            """
        return self.base_datos.obtener_todos(consulta)
    
    def actualizar_cliente(self, cliente_id, datos_cliente):
        """Actualiza los datos de un cliente"""
        if self._tiene_campos_extendidos():
            consulta = """
            UPDATE clientes 
            SET 
                documento_identidad = %s, 
                direccion = %s,
                fecha_nacimiento = %s,
                pais = %s,
                provincia = %s,
                ciudad = %s
            WHERE id = %s
            """
            parametros = (
                datos_cliente.get('documento_identidad'),
                datos_cliente.get('direccion'),
                datos_cliente.get('fecha_nacimiento'),
                datos_cliente.get('pais'),
                datos_cliente.get('provincia'),
                datos_cliente.get('ciudad'),
                cliente_id
            )
        else:
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
    
    def obtener_clientes_cumpleaneros(self, mes=None):
        """Obtiene clientes que cumplen años en un mes específico (o el actual)"""
        if not self._tiene_campos_extendidos():
            return []  # Sin campos extendidos, no hay cumpleañeros
        if mes is None:
            mes = date.today().month
        consulta = """
        SELECT 
            c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
            c.fecha_nacimiento, c.pais, c.provincia, c.ciudad,
            c.fecha_ultimo_evento, c.cantidad_eventos_completados,
            u.nombre_completo, u.email, u.telefono,
            TIMESTAMPDIFF(YEAR, c.fecha_nacimiento, CURDATE()) AS edad,
            DAY(c.fecha_nacimiento) AS dia_cumple
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE MONTH(c.fecha_nacimiento) = %s
        ORDER BY DAY(c.fecha_nacimiento)
        """
        return self.base_datos.obtener_todos(consulta, (mes,))
    
    def obtener_clientes_frecuentes(self, minimo_eventos=2):
        """Obtiene clientes con múltiples eventos completados"""
        if not self._tiene_campos_extendidos():
            return []  # Sin campos extendidos, no hay tracking de eventos
        consulta = """
        SELECT 
            c.id, c.usuario_id, c.documento_identidad, c.direccion, c.fecha_registro,
            c.fecha_nacimiento, c.pais, c.provincia, c.ciudad,
            c.fecha_ultimo_evento, c.cantidad_eventos_completados,
            u.nombre_completo, u.email, u.telefono,
            CASE 
                WHEN c.fecha_nacimiento IS NOT NULL 
                THEN TIMESTAMPDIFF(YEAR, c.fecha_nacimiento, CURDATE())
                ELSE NULL 
            END AS edad
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.cantidad_eventos_completados >= %s
        ORDER BY c.cantidad_eventos_completados DESC
        """
        return self.base_datos.obtener_todos(consulta, (minimo_eventos,))

