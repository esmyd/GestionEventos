"""
Modelo para gestión de usuarios
"""
from modelos.base_datos import BaseDatos


class UsuarioModelo:
    """Clase para operaciones CRUD de usuarios"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
    
    def crear_usuario(self, datos_usuario):
        """Crea un nuevo usuario"""
        consulta = """
        INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, email, telefono, rol)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        parametros = (
            datos_usuario['nombre_usuario'],
            datos_usuario['contrasena'],
            datos_usuario['nombre_completo'],
            datos_usuario.get('email'),
            datos_usuario.get('telefono'),
            datos_usuario['rol']
        )
        if self.base_datos.ejecutar_consulta(consulta, parametros):
            return self.base_datos.obtener_ultimo_id()
        return None
    
    def obtener_usuario_por_id(self, usuario_id):
        """Obtiene un usuario por su ID"""
        consulta = "SELECT * FROM usuarios WHERE id = %s"
        return self.base_datos.obtener_uno(consulta, (usuario_id,))
    
    def obtener_usuario_por_nombre(self, nombre_usuario):
        """Obtiene un usuario por su nombre de usuario"""
        consulta = "SELECT * FROM usuarios WHERE nombre_usuario = %s"
        return self.base_datos.obtener_uno(consulta, (nombre_usuario,))
    
    def obtener_todos_usuarios(self, filtro_rol=None):
        """Obtiene todos los usuarios, opcionalmente filtrados por rol"""
        if filtro_rol:
            consulta = "SELECT * FROM usuarios WHERE rol = %s ORDER BY nombre_completo"
            return self.base_datos.obtener_todos(consulta, (filtro_rol,))
        else:
            consulta = "SELECT * FROM usuarios ORDER BY nombre_completo"
            return self.base_datos.obtener_todos(consulta)
    
    def actualizar_usuario(self, usuario_id, datos_usuario):
        """Actualiza los datos de un usuario"""
        consulta = """
        UPDATE usuarios 
        SET nombre_completo = %s, email = %s, telefono = %s, rol = %s, activo = %s
        WHERE id = %s
        """
        parametros = (
            datos_usuario['nombre_completo'],
            datos_usuario.get('email'),
            datos_usuario.get('telefono'),
            datos_usuario['rol'],
            datos_usuario.get('activo', True),
            usuario_id
        )
        return self.base_datos.ejecutar_consulta(consulta, parametros)
    
    def eliminar_usuario(self, usuario_id):
        """Elimina (desactiva) un usuario"""
        consulta = "UPDATE usuarios SET activo = FALSE WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (usuario_id,))
    
    def cambiar_contrasena(self, usuario_id, nueva_contrasena):
        """Cambia la contraseña de un usuario"""
        from modelos.autenticacion import Autenticacion
        auth = Autenticacion()
        contrasena_hash = auth.hash_contrasena(nueva_contrasena)
        consulta = "UPDATE usuarios SET contrasena = %s WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (contrasena_hash, usuario_id))
    
    def obtener_usuarios_por_rol(self, rol):
        """Obtiene usuarios activos por rol"""
        consulta = "SELECT * FROM usuarios WHERE rol = %s AND activo = TRUE ORDER BY nombre_completo"
        return self.base_datos.obtener_todos(consulta, (rol,))

    def obtener_roles_disponibles(self):
        """Obtiene los roles disponibles según los usuarios registrados"""
        consulta = "SELECT DISTINCT rol FROM usuarios ORDER BY rol"
        resultados = self.base_datos.obtener_todos(consulta)
        return [r.get('rol') for r in resultados if r.get('rol')]

