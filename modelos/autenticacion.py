"""
Módulo de autenticación y gestión de sesiones
"""
import hashlib
from modelos.base_datos import BaseDatos


class Autenticacion:
    """Clase para gestionar autenticación de usuarios"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self.usuario_actual = None
    
    def hash_contrasena(self, contrasena):
        """Genera hash de la contraseña"""
        return hashlib.sha256(contrasena.encode()).hexdigest()
    
    def verificar_contrasena(self, contrasena_plana, contrasena_hash):
        """Verifica si la contraseña coincide con el hash"""
        return self.hash_contrasena(contrasena_plana) == contrasena_hash
    
    def iniciar_sesion(self, nombre_usuario, contrasena):
        """Inicia sesión de un usuario"""
        consulta = "SELECT * FROM usuarios WHERE nombre_usuario = %s AND activo = TRUE"
        usuario = self.base_datos.obtener_uno(consulta, (nombre_usuario,))
        
        if usuario:
            # Verificar contraseña (en producción usar bcrypt)
            contrasena_hash = self.hash_contrasena(contrasena)
            if usuario['contrasena'] == contrasena_hash or self.verificar_contrasena(contrasena, usuario['contrasena']):
                # Actualizar último acceso
                self.actualizar_ultimo_acceso(usuario['id'])
                self.usuario_actual = usuario
                return usuario
        return None
    
    def cerrar_sesion(self):
        """Cierra la sesión del usuario actual"""
        self.usuario_actual = None
    
    def obtener_usuario_actual(self):
        """Retorna el usuario actualmente autenticado"""
        return self.usuario_actual
    
    def tiene_permiso(self, rol_requerido):
        """Verifica si el usuario tiene el rol requerido"""
        if not self.usuario_actual:
            return False
        
        roles_permisos = {
            'administrador': ['administrador', 'coordinador', 'gerente_general', 'cliente'],
            'coordinador': ['coordinador'],
            'gerente_general': ['gerente_general', 'administrador'],
            'cliente': ['cliente']
        }
        
        rol_usuario = self.usuario_actual['rol']
        return rol_requerido in roles_permisos.get(rol_usuario, [])
    
    def actualizar_ultimo_acceso(self, usuario_id):
        """Actualiza la fecha de último acceso del usuario"""
        consulta = "UPDATE usuarios SET fecha_ultimo_acceso = CURRENT_TIMESTAMP WHERE id = %s"
        self.base_datos.ejecutar_consulta(consulta, (usuario_id,))
    
    def registrar_log(self, accion, modulo, descripcion, ip_address=None):
        """Registra una acción en el log del sistema"""
        usuario_id = self.usuario_actual['id'] if self.usuario_actual else None
        consulta = """
        INSERT INTO logs_sistema (usuario_id, accion, modulo, descripcion, ip_address)
        VALUES (%s, %s, %s, %s, %s)
        """
        self.base_datos.ejecutar_consulta(consulta, (usuario_id, accion, modulo, descripcion, ip_address))

