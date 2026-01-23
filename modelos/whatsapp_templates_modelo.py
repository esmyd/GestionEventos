from modelos.base_datos import BaseDatos


class WhatsAppTemplatesModelo:
    def __init__(self):
        self.base_datos = BaseDatos()

    def listar(self):
        consulta = """
        SELECT * FROM whatsapp_templates
        ORDER BY nombre, idioma
        """
        return self.base_datos.obtener_todos(consulta)

    def obtener_por_id(self, template_id):
        consulta = "SELECT * FROM whatsapp_templates WHERE id = %s"
        return self.base_datos.obtener_uno(consulta, (template_id,))

    def crear(self, data):
        consulta = """
        INSERT INTO whatsapp_templates (
          nombre, idioma, categoria, descripcion,
          parametros, header_parametros, body_parametros,
          ejemplo, header_ejemplo, body_ejemplo, activo
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(
            consulta,
            (
                data.get("nombre"),
                data.get("idioma") or "es",
                data.get("categoria"),
                data.get("descripcion"),
                int(data.get("parametros") or 0),
                int(data.get("header_parametros") or 0),
                int(data.get("body_parametros") or 0),
                data.get("ejemplo"),
                data.get("header_ejemplo"),
                data.get("body_ejemplo"),
                int(bool(data.get("activo", True))),
            ),
        )

    def actualizar(self, template_id, data):
        consulta = """
        UPDATE whatsapp_templates
        SET nombre = %s,
            idioma = %s,
            categoria = %s,
            descripcion = %s,
            parametros = %s,
            header_parametros = %s,
            body_parametros = %s,
            ejemplo = %s,
            header_ejemplo = %s,
            body_ejemplo = %s,
            activo = %s
        WHERE id = %s
        """
        return self.base_datos.ejecutar_consulta(
            consulta,
            (
                data.get("nombre"),
                data.get("idioma") or "es",
                data.get("categoria"),
                data.get("descripcion"),
                int(data.get("parametros") or 0),
                int(data.get("header_parametros") or 0),
                int(data.get("body_parametros") or 0),
                data.get("ejemplo"),
                data.get("header_ejemplo"),
                data.get("body_ejemplo"),
                int(bool(data.get("activo", True))),
                template_id,
            ),
        )

    def eliminar(self, template_id):
        consulta = "DELETE FROM whatsapp_templates WHERE id = %s"
        return self.base_datos.ejecutar_consulta(consulta, (template_id,))
