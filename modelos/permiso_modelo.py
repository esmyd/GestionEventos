"""
Modelo para gestión de permisos por usuario
"""
import json
from modelos.base_datos import BaseDatos


class PermisoModelo:
    """Clase para operaciones de permisos de usuarios"""

    def __init__(self):
        self.base_datos = BaseDatos()

    def obtener_permisos_usuario(self, usuario_id):
        """Obtiene la lista de permisos (modulos) de un usuario"""
        consulta = "SELECT permisos_json FROM usuario_permisos WHERE usuario_id = %s"
        resultado = self.base_datos.obtener_uno(consulta, (usuario_id,))
        if not resultado or not resultado.get('permisos_json'):
            return None
        try:
            return json.loads(resultado['permisos_json'])
        except Exception:
            return None

    def guardar_permisos_usuario(self, usuario_id, permisos):
        """Guarda o actualiza la lista de permisos (modulos) de un usuario"""
        permisos_json = json.dumps(permisos or [])
        consulta = """
        INSERT INTO usuario_permisos (usuario_id, permisos_json)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE permisos_json = VALUES(permisos_json), fecha_actualizacion = CURRENT_TIMESTAMP
        """
        return self.base_datos.ejecutar_consulta(consulta, (usuario_id, permisos_json))

    def eliminar_permisos_usuario(self, usuario_id):
        """Elimina permisos personalizados de un usuario"""
        consulta = "DELETE FROM usuario_permisos WHERE usuario_id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (usuario_id,))

    def obtener_permisos_rol(self, rol):
        """Obtiene la lista de permisos de un rol"""
        consulta = "SELECT permisos_json FROM rol_permisos WHERE rol = %s"
        resultado = self.base_datos.obtener_uno(consulta, (rol,))
        if not resultado or not resultado.get('permisos_json'):
            return None
        try:
            return json.loads(resultado['permisos_json'])
        except Exception:
            return None

    def guardar_permisos_rol(self, rol, permisos):
        """Guarda o actualiza la lista de permisos de un rol"""
        permisos_json = json.dumps(permisos or [])
        consulta = """
        INSERT INTO rol_permisos (rol, permisos_json)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE permisos_json = VALUES(permisos_json), fecha_actualizacion = CURRENT_TIMESTAMP
        """
        return self.base_datos.ejecutar_consulta(consulta, (rol, permisos_json))

    def eliminar_permisos_rol(self, rol):
        """Elimina permisos personalizados de un rol"""
        consulta = "DELETE FROM rol_permisos WHERE rol = %s"
        return self.base_datos.ejecutar_consulta(consulta, (rol,))