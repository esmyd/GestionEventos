"""
Modelo para gestión de permisos por usuario.
Los permisos efectivos de un usuario son: los asignados al usuario (usuario_permisos)
si tiene alguno; si no, los del rol asignado (rol_permisos). Así, al asignar un rol
a un usuario desde el panel de Usuarios, el usuario hereda los permisos del rol.
"""
import json
from modelos.base_datos import BaseDatos


def _normalizar_rol(rol):
    """Normaliza el rol para consulta en BD (evita fallos por mayúsculas/espacios)."""
    if rol is None:
        return None
    s = str(rol).strip().lower()
    return s if s else None


class PermisoModelo:
    """Clase para operaciones de permisos de usuarios"""

    def __init__(self):
        self.base_datos = BaseDatos()

    def obtener_permisos_usuario(self, usuario_id):
        """Obtiene la lista de permisos asignados directamente al usuario (usuario_permisos)."""
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
        """Elimina permisos personalizados de un usuario (vuelve a heredar solo del rol)."""
        consulta = "DELETE FROM usuario_permisos WHERE usuario_id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (usuario_id,))

    def obtener_permisos_rol(self, rol):
        """Obtiene la lista de permisos del rol. Comparación insensible a mayúsculas."""
        rol_norm = _normalizar_rol(rol)
        if not rol_norm:
            return None
        consulta = "SELECT permisos_json FROM rol_permisos WHERE LOWER(TRIM(rol)) = %s"
        resultado = self.base_datos.obtener_uno(consulta, (rol_norm,))
        if not resultado or not resultado.get('permisos_json'):
            return None
        try:
            return json.loads(resultado['permisos_json'])
        except Exception:
            return None

    def obtener_permisos_efectivos(self, usuario_id, rol):
        """
        Permisos efectivos del usuario: si tiene permisos asignados en usuario_permisos
        (y no está vacío), se usan esos; si no, se heredan del rol. Así, al asignar
        un rol a un usuario desde el panel de Usuarios, el usuario obtiene los
        permisos definidos en Roles y Permisos para ese rol.
        """
        permisos = self.obtener_permisos_usuario(usuario_id)
        if permisos is not None and isinstance(permisos, list) and len(permisos) > 0:
            return permisos
        return self.obtener_permisos_rol(rol)

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