"""
Modelo para gestión de configuraciones de integraciones externas
"""
import json
from modelos.base_datos import BaseDatos


class IntegracionModelo:
    """CRUD para configuracion_integraciones"""

    def __init__(self):
        self.base_datos = BaseDatos()

    def obtener_integracion(self, tipo_integracion):
        consulta = """
        SELECT * FROM configuracion_integraciones
        WHERE tipo_integracion = %s
        ORDER BY fecha_actualizacion DESC, id DESC
        LIMIT 1
        """
        resultado = self.base_datos.obtener_uno(consulta, (tipo_integracion,))
        if resultado and resultado.get("configuracion"):
            try:
                resultado["configuracion"] = json.loads(resultado["configuracion"])
            except Exception:
                pass
        return resultado

    def guardar_integracion(self, tipo_integracion, nombre, configuracion, activo):
        configuracion_json = json.dumps(configuracion or {})
        existente = self.base_datos.obtener_uno(
            "SELECT id FROM configuracion_integraciones WHERE tipo_integracion = %s ORDER BY id DESC LIMIT 1",
            (tipo_integracion,),
        )
        if existente and existente.get("id"):
            consulta = """
            UPDATE configuracion_integraciones
            SET nombre = %s, configuracion = %s, activo = %s, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = %s
            """
            return self.base_datos.ejecutar_consulta(
                consulta, (nombre, configuracion_json, bool(activo), existente["id"])
            )

        consulta = """
        INSERT INTO configuracion_integraciones (tipo_integracion, nombre, configuracion, activo)
        VALUES (%s, %s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(
            consulta, (tipo_integracion, nombre, configuracion_json, bool(activo))
        )
