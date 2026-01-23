from modelos.base_datos import BaseDatos


class ConfiguracionGeneralModelo:
    def __init__(self):
        self.base_datos = BaseDatos()

    def _asegurar_columnas_contacto(self):
        columnas = {
            "contacto_nombre": "VARCHAR(255) NULL",
            "contacto_email": "VARCHAR(255) NULL",
            "contacto_telefono": "VARCHAR(50) NULL",
            "contacto_whatsapp": "VARCHAR(50) NULL",
            "establecimiento_direccion": "TEXT NULL",
            "establecimiento_horario": "VARCHAR(255) NULL",
        }
        try:
            consulta = """
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'configuracion_general'
              AND COLUMN_NAME IN ({placeholders})
            """.format(placeholders=",".join(["%s"] * len(columnas)))
            existentes = self.base_datos.obtener_todos(consulta, tuple(columnas.keys())) or []
            presentes = {row.get("COLUMN_NAME") for row in existentes}
            for columna, tipo in columnas.items():
                if columna not in presentes:
                    self.base_datos.ejecutar_consulta(
                        f"ALTER TABLE configuracion_general ADD COLUMN {columna} {tipo}"
                    )
        except Exception:
            pass

    def obtener_configuracion(self):
        self._asegurar_columnas_contacto()
        consulta = """
        SELECT
          id,
          nombre_plataforma,
          login_titulo,
          login_subtitulo,
          login_boton_texto,
          login_left_titulo,
          login_left_texto,
          login_left_items,
          login_left_imagen,
          login_acento_color,
          login_fondo_color,
          whatsapp_reengagement_template_id,
          contacto_nombre,
          contacto_email,
          contacto_telefono,
          contacto_whatsapp,
          establecimiento_direccion,
          establecimiento_horario
        FROM configuracion_general
        ORDER BY id DESC
        LIMIT 1
        """
        return self.base_datos.obtener_uno(consulta)

    def actualizar_nombre_plataforma(self, nombre_plataforma):
        existente = self.obtener_configuracion()
        if existente and existente.get("id"):
            consulta = """
            UPDATE configuracion_general
            SET nombre_plataforma = %s
            WHERE id = %s
            """
            return self.base_datos.ejecutar_consulta(consulta, (nombre_plataforma, existente.get("id")))
        consulta = """
        INSERT INTO configuracion_general (nombre_plataforma)
        VALUES (%s)
        """
        return self.base_datos.ejecutar_consulta(consulta, (nombre_plataforma,))

    def actualizar_configuracion(self, data):
        self._asegurar_columnas_contacto()
        existente = self.obtener_configuracion()
        campos = [
            "nombre_plataforma",
            "login_titulo",
            "login_subtitulo",
            "login_boton_texto",
            "login_left_titulo",
            "login_left_texto",
            "login_left_items",
            "login_left_imagen",
            "login_acento_color",
            "login_fondo_color",
            "whatsapp_reengagement_template_id",
            "contacto_nombre",
            "contacto_email",
            "contacto_telefono",
            "contacto_whatsapp",
            "establecimiento_direccion",
            "establecimiento_horario",
        ]
        valores = [data.get(campo) for campo in campos]
        if existente and existente.get("id"):
            consulta = """
            UPDATE configuracion_general
            SET nombre_plataforma = %s,
                login_titulo = %s,
                login_subtitulo = %s,
                login_boton_texto = %s,
                login_left_titulo = %s,
                login_left_texto = %s,
                login_left_items = %s,
                login_left_imagen = %s,
                login_acento_color = %s,
                login_fondo_color = %s,
                whatsapp_reengagement_template_id = %s,
                contacto_nombre = %s,
                contacto_email = %s,
                contacto_telefono = %s,
                contacto_whatsapp = %s,
                establecimiento_direccion = %s,
                establecimiento_horario = %s
            WHERE id = %s
            """
            return self.base_datos.ejecutar_consulta(consulta, (*valores, existente.get("id")))
        consulta = """
        INSERT INTO configuracion_general (
            nombre_plataforma,
            login_titulo,
            login_subtitulo,
            login_boton_texto,
            login_left_titulo,
            login_left_texto,
            login_left_items,
            login_left_imagen,
            login_acento_color,
            login_fondo_color,
            whatsapp_reengagement_template_id,
            contacto_nombre,
            contacto_email,
            contacto_telefono,
            contacto_whatsapp,
            establecimiento_direccion,
            establecimiento_horario
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        return self.base_datos.ejecutar_consulta(consulta, tuple(valores))
