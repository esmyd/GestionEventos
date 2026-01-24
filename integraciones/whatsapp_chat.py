"""
Servicio de chat WhatsApp: inbox, bot y respuestas automaticas
"""
import random
import re
from datetime import datetime, timedelta
from modelos.whatsapp_chat_modelo import WhatsAppChatModelo
from modelos.cliente_modelo import ClienteModelo
from modelos.evento_modelo import EventoModelo
from modelos.pago_modelo import PagoModelo
from modelos.usuario_modelo import UsuarioModelo
from modelos.autenticacion import Autenticacion
from modelos.plan_modelo import PlanModelo
from modelos.salon_modelo import SalonModelo
from modelos.producto_modelo import ProductoModelo
from modelos.whatsapp_templates_modelo import WhatsAppTemplatesModelo
from integraciones.whatsapp import IntegracionWhatsApp
from utilidades.logger import obtener_logger
from modelos.configuracion_general_modelo import ConfiguracionGeneralModelo
from modelos.whatsapp_templates_modelo import WhatsAppTemplatesModelo


class WhatsAppChatService:
    def __init__(self):
        self.modelo = WhatsAppChatModelo()
        self.clientes = ClienteModelo()
        self.eventos = EventoModelo()
        self.pagos = PagoModelo()
        self.usuarios = UsuarioModelo()
        self.auth = Autenticacion()
        self.whatsapp = IntegracionWhatsApp()
        self.logger = obtener_logger()
        from modelos.whatsapp_metricas_modelo import WhatsAppMetricasModelo
        self.metricas = WhatsAppMetricasModelo()
        self.config_general = ConfiguracionGeneralModelo()
        self.templates = WhatsAppTemplatesModelo()
        self.planes = PlanModelo()
        self.salones = SalonModelo()
        self.productos = ProductoModelo()
        self.ultimo_error_envio = None

    def _normalizar_telefono(self, telefono):
        return self.modelo.normalizar_telefono(telefono)

    def _obtener_cliente_por_telefono(self, telefono):
        telefono = self._normalizar_telefono(telefono)
        consulta = """
        SELECT c.*, u.nombre_completo, u.email, u.telefono
        FROM clientes c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE REPLACE(REPLACE(REPLACE(u.telefono, '+', ''), ' ', ''), '-', '') = %s
        LIMIT 1
        """
        return self.modelo.base_datos.obtener_uno(consulta, (telefono,))

    def _obtener_eventos_por_telefono(self, telefono):
        telefono = self._normalizar_telefono(telefono)
        consulta = """
        SELECT e.*, c.usuario_id, u.nombre_completo as nombre_cliente, u.email, u.telefono
        FROM eventos e
        JOIN clientes c ON e.id_cliente = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE REPLACE(REPLACE(REPLACE(u.telefono, '+', ''), ' ', ''), '-', '') = %s
        ORDER BY e.fecha_evento DESC
        """
        return self.modelo.base_datos.obtener_todos(consulta, (telefono,))

    def _crear_cliente_si_no_existe(self, telefono, datos_cliente):
        telefono = self._normalizar_telefono(telefono)
        existente = self._obtener_cliente_por_telefono(telefono)
        if existente:
            return existente
        nombre_usuario = telefono
        contrasena_plana = f"{telefono[-4:]}{random.randint(100,999)}"
        contrasena_hash = self.auth.hash_contrasena(contrasena_plana)
        usuario_id = self.usuarios.crear_usuario({
            "nombre_usuario": nombre_usuario,
            "contrasena": contrasena_hash,
            "nombre_completo": datos_cliente.get("nombre_completo"),
            "email": datos_cliente.get("email"),
            "telefono": telefono,
            "rol": "cliente"
        })
        if not usuario_id:
            return None
        cliente_id = self.clientes.crear_cliente({
            "usuario_id": usuario_id,
            "documento_identidad": datos_cliente.get("documento_identidad"),
            "direccion": datos_cliente.get("direccion")
        })
        if not cliente_id:
            return None
        return self._obtener_cliente_por_telefono(telefono)

    def _registrar_mensaje(
        self,
        conversacion_id,
        direccion,
        mensaje,
        raw_json=None,
        estado=None,
        media_type=None,
        media_id=None,
        media_url=None,
        wa_message_id=None,
        origen=None,
        costo_unitario=None,
        costo_total=None
    ):
        self.modelo.registrar_mensaje(
            conversacion_id,
            direccion,
            mensaje,
            raw_json=raw_json,
            estado=estado,
            media_type=media_type,
            media_id=media_id,
            media_url=media_url,
            wa_message_id=wa_message_id,
            origen=origen,
            costo_unitario=costo_unitario,
            costo_total=costo_total
        )

    def _enviar_respuesta(self, conversacion, mensaje, allow_reengagement=True):
        telefono = conversacion.get("telefono")
        permitido, motivo = self._puede_enviar_whatsapp(telefono)
        if not permitido:
            if allow_reengagement and motivo in ("REENGAGEMENT", "FUERA_VENTANA", "SIN_INTERACCION"):
                if self._enviar_plantilla_reengagement(telefono, conversacion.get("cliente_id")):
                    return self._enviar_respuesta(conversacion, mensaje, allow_reengagement=False)
            self._registrar_mensaje(
                conversacion["id"],
                "out",
                self._mensaje_bloqueo(motivo),
                estado="bloqueado",
                origen="humano"
            )
            return False
        enviado, wa_message_id = self.whatsapp.enviar_mensaje_chat(telefono, mensaje)
        if enviado:
            precio_unitario = self._obtener_precio_whatsapp()
            self._registrar_mensaje(
                conversacion["id"],
                "out",
                mensaje,
                estado="sent",
                wa_message_id=wa_message_id,
                origen="bot",
                costo_unitario=precio_unitario,
                costo_total=precio_unitario
            )
            self.modelo.actualizar_conversacion(conversacion["id"])
            return True
        self._registrar_mensaje(
            conversacion["id"],
            "out",
            mensaje,
            estado="fallido",
            wa_message_id=wa_message_id,
            origen="bot"
        )
        return False

    def _resolver_opcion(self, texto, opciones):
        if not texto:
            return None
        texto_limpio = str(texto).strip().lower()
        if texto_limpio.isdigit():
            indice = int(texto_limpio) - 1
            if 0 <= indice < len(opciones):
                return opciones[indice].get("id")
        for opcion in opciones:
            if texto_limpio == str(opcion.get("id")).lower():
                return opcion.get("id")
            if texto_limpio == str(opcion.get("title")).lower():
                return opcion.get("id")
        return None

    def _enviar_opciones(self, conversacion, mensaje, opciones, boton_texto="Seleccionar", allow_reengagement=True):
        telefono = conversacion.get("telefono")
        permitido, motivo = self._puede_enviar_whatsapp(telefono)
        if not permitido:
            if allow_reengagement and motivo in ("REENGAGEMENT", "FUERA_VENTANA", "SIN_INTERACCION"):
                if self._enviar_plantilla_reengagement(telefono, conversacion.get("cliente_id")):
                    return self._enviar_opciones(conversacion, mensaje, opciones, boton_texto, allow_reengagement=False)
            self._registrar_mensaje(
                conversacion["id"],
                "out",
                self._mensaje_bloqueo(motivo),
                estado="bloqueado",
                origen="bot"
            )
            return False

        opciones_limpias = [opt for opt in (opciones or []) if opt.get("id") and opt.get("title")]
        if len(opciones_limpias) == 0:
            return self._enviar_respuesta(conversacion, mensaje)

        if len(opciones_limpias) <= 3:
            enviado, wa_message_id = self.whatsapp.enviar_botones_chat(telefono, mensaje, opciones_limpias)
        elif len(opciones_limpias) <= 10:
            enviado, wa_message_id = self.whatsapp.enviar_lista_chat(telefono, mensaje, opciones_limpias, boton_texto=boton_texto)
        else:
            lista = "\n".join([f"{idx+1}. {op.get('title')}" for idx, op in enumerate(opciones_limpias)])
            return self._enviar_respuesta(
                conversacion,
                f"{mensaje}\n{lista}\nResponde con el número de la opción."
            )

        estado = "sent" if enviado else "fallido"
        self._registrar_mensaje(
            conversacion["id"],
            "out",
            mensaje,
            estado=estado,
            wa_message_id=wa_message_id,
            origen="bot"
        )
        if enviado:
            self.modelo.actualizar_conversacion(conversacion["id"])
        return enviado

    def _mensaje_menu(self):
        nombre_plataforma = self._obtener_nombre_plataforma()
        return (
            f"Hola! Soy el asistente de {nombre_plataforma}.\n"
            "Puedes escribir:\n"
            "- Consultar mi evento\n"
            "- Consultar mis pagos\n"
            "- Direcciones\n"
            "- Horarios\n"
            "- Contactos\n"
            "- Crear evento"
        )

    def _enviar_menu(self, conversacion):
        opciones = [
            {"id": "menu:evento", "title": "Consultar mi evento"},
            {"id": "menu:registrar_pago", "title": "Registrar un pago"},
            {"id": "menu:pagos", "title": "Consultar mis pagos"},
            {"id": "menu:direccion", "title": "Direcciones"},
            {"id": "menu:horario", "title": "Horarios"},
            {"id": "menu:contacto", "title": "Contactos"},
            {"id": "menu:crear", "title": "Crear evento"},
        ]
        self._enviar_opciones(conversacion, self._mensaje_menu(), opciones)

    def _obtener_nombre_plataforma(self):
        try:
            configuracion = self.config_general.obtener_configuracion() or {}
            return configuracion.get("nombre_plataforma") or "Lirios Eventos"
        except Exception:
            return "Lirios Eventos"

    def _obtener_precio_whatsapp(self):
        try:
            config = self.metricas.obtener_config() or {}
            return float(config.get("precio_whatsapp") or 0)
        except Exception:
            return 0.0

    def _puede_enviar_whatsapp(self, telefono):
        if not self.metricas.permitir_envio_whatsapp(telefono):
            return False, "DESACTIVADO"
        permitido, motivo = self.modelo.puede_enviar_whatsapp(telefono)
        return permitido, motivo

    def _mensaje_bloqueo(self, motivo):
        if motivo in ("REENGAGEMENT", "FUERA_VENTANA", "SIN_INTERACCION"):
            return "WhatsApp fuera de ventana de 24h. Necesitas enviar un mensaje de plantilla para abrir el chat."
        return "WhatsApp esta desactivado temporalmente. Intenta mas tarde."

    def _render_parametros(self, plantilla_texto, datos):
        if not plantilla_texto:
            return []
        class SafeDict(dict):
            def __missing__(self, key):
                return f"{{{key}}}"
        valores = []
        for item in str(plantilla_texto).split(","):
            texto = item.strip()
            if not texto:
                continue
            try:
                valores.append(texto.format_map(SafeDict(datos)))
            except Exception:
                valores.append(texto)
        return valores

    def _enviar_plantilla_reengagement(self, telefono, cliente_id=None):
        config = self.config_general.obtener_configuracion() or {}
        template_id = config.get("whatsapp_reengagement_template_id")
        if not template_id:
            self.ultimo_error_envio = self._mensaje_bloqueo("REENGAGEMENT")
            return False
        plantilla = self.templates.obtener_por_id(int(template_id))
        if not plantilla or not plantilla.get("activo"):
            self.ultimo_error_envio = "Plantilla de re-apertura no activa"
            return False
        datos = {
            "nombre_plataforma": self._obtener_nombre_plataforma(),
            "telefono": telefono,
        }
        if cliente_id:
            cliente = self.clientes.obtener_cliente_por_id(cliente_id)
            if cliente:
                datos["nombre_cliente"] = cliente.get("nombre_completo") or "Cliente"
        header_params = self._render_parametros(plantilla.get("header_ejemplo"), datos)
        body_params = self._render_parametros(plantilla.get("body_ejemplo"), datos)
        ok, wa_id, error = self.whatsapp.enviar_template(
            telefono,
            plantilla.get("nombre"),
            plantilla.get("idioma") or "es",
            parametros=[],
            header_parametros=header_params,
            body_parametros=body_params
        )
        conversacion = self.modelo.obtener_conversacion_por_telefono(telefono)
        if not conversacion:
            conversacion_id = self.modelo.crear_conversacion(telefono, cliente_id=cliente_id)
            conversacion = self.modelo.obtener_conversacion_por_telefono(telefono)
        if conversacion:
            self.modelo.actualizar_conversacion(conversacion["id"])
            self._registrar_mensaje(
                conversacion["id"],
                "out",
                f"Plantilla: {plantilla.get('nombre')}",
                estado="sent" if ok else "fallido",
                wa_message_id=wa_id,
                origen="campana",
                raw_json=error
            )
        return ok

    def _formato_evento(self, evento):
        return (
            f"Evento #{evento.get('id_evento')}\n"
            f"Nombre: {evento.get('nombre_evento') or evento.get('salon')}\n"
            f"Fecha: {evento.get('fecha_evento')}\n"
            f"Hora: {evento.get('hora_inicio')}\n"
            f"Estado: {evento.get('estado')}\n"
            f"Total: ${evento.get('total')}"
        )

    def _formato_detalles_evento(self, evento):
        plan_lineas = self._formato_plan_evento(evento)
        return (
            f"Evento #{evento.get('id_evento')}\n"
            f"Cliente: {evento.get('nombre_cliente')}\n"
            f"Nombre: {evento.get('nombre_evento') or evento.get('salon')}\n"
            f"Tipo: {evento.get('tipo_evento')}\n"
            f"Fecha: {evento.get('fecha_evento')} {evento.get('hora_inicio')}\n"
            f"Salon: {evento.get('nombre_salon') or evento.get('salon')}\n"
            f"Ubicacion: {evento.get('ubicacion_salon') or evento.get('direccion_cliente') or 'No registrada'}\n"
            f"Coordinador: {evento.get('nombre_coordinador') or 'No asignado'}\n"
            f"{plan_lineas}"
        )

    def _formato_plan_evento(self, evento):
        plan_id = evento.get("plan_id")
        if not plan_id:
            return "Plan: No asignado"
        plan = self.planes.obtener_plan_por_id(plan_id) or {}
        nombre_plan = plan.get("nombre") or evento.get("nombre_plan") or f"Plan #{plan_id}"
        precio_plan = plan.get("precio_base") or evento.get("precio_plan") or 0
        productos = self.planes.obtener_productos_plan(plan_id) or []
        if productos:
            lista = "\n".join(
                [
                    f"- {p.get('nombre_producto') or p.get('nombre')} x{p.get('cantidad')}"
                    for p in productos
                ]
            )
            return f"Plan: {nombre_plan} (${precio_plan})\nProductos del plan:\n{lista}"
        return f"Plan: {nombre_plan} (${precio_plan})\nProductos del plan: No hay productos asociados."

    def _responder_eventos(self, conversacion, telefono):
        eventos = self._obtener_eventos_por_telefono(telefono)
        if not eventos:
            self._enviar_respuesta(conversacion, "No encontramos eventos asociados a este numero.")
            return
        if len(eventos) == 1:
            evento = self.eventos.obtener_evento_por_id(eventos[0].get("id_evento"))
            self._enviar_respuesta(conversacion, self._formato_detalles_evento(evento))
            return
        opciones = []
        mapa = {}
        ids = []
        for evento in eventos:
            evento_id = evento.get("id_evento")
            if not evento_id:
                continue
            titulo = evento.get("nombre_evento") or evento.get("salon") or f"Evento #{evento_id}"
            descripcion = evento.get("fecha_evento") or ""
            opcion_id = f"evento:{evento_id}"
            opciones.append({"id": opcion_id, "title": titulo, "description": descripcion})
            mapa[opcion_id] = evento_id
            ids.append(evento_id)
        self.modelo.guardar_estado_bot(
            conversacion["id"],
            "seleccionar_evento",
            {"accion": "evento", "ids": ids, "mapa": mapa, "opciones": opciones},
        )
        self._enviar_opciones(conversacion, "Selecciona el evento que deseas consultar:", opciones)

    def _responder_pagos(self, conversacion, telefono):
        eventos = self._obtener_eventos_por_telefono(telefono)
        if not eventos:
            self._enviar_respuesta(conversacion, "No encontramos eventos asociados a este numero.")
            return
        if len(eventos) == 1:
            evento_id = eventos[0].get("id_evento")
            pagos = self.pagos.obtener_pagos_por_evento(evento_id)
            if not pagos:
                self._enviar_respuesta(conversacion, "No hay pagos registrados para tu evento.")
                return
            lista = "\n".join([f"- {p.get('fecha_pago')}: ${p.get('monto')} ({p.get('metodo_pago')})" for p in pagos])
            self._enviar_respuesta(conversacion, f"Pagos del evento #{evento_id}:\n{lista}")
            return
        opciones = []
        mapa = {}
        ids = []
        for evento in eventos:
            evento_id = evento.get("id_evento")
            if not evento_id:
                continue
            titulo = evento.get("nombre_evento") or evento.get("salon") or f"Evento #{evento_id}"
            descripcion = evento.get("fecha_evento") or ""
            opcion_id = f"evento:{evento_id}"
            opciones.append({"id": opcion_id, "title": titulo, "description": descripcion})
            mapa[opcion_id] = evento_id
            ids.append(evento_id)
        self.modelo.guardar_estado_bot(
            conversacion["id"],
            "seleccionar_evento",
            {"accion": "pagos", "ids": ids, "mapa": mapa, "opciones": opciones},
        )
        self._enviar_opciones(conversacion, "Selecciona el evento para ver pagos:", opciones)

    def _iniciar_registro_pago(self, conversacion, telefono):
        eventos = self._obtener_eventos_por_telefono(telefono)
        if not eventos:
            self._enviar_respuesta(conversacion, "No encontramos eventos asociados a este numero.")
            return
        if len(eventos) == 1:
            evento_id = eventos[0].get("id_evento")
            evento = self.eventos.obtener_evento_por_id(evento_id)
            nombre_evento = evento.get("nombre_evento") or evento.get("salon") or f"Evento #{evento_id}"
            self.modelo.guardar_estado_bot(
                conversacion["id"],
                "registrar_pago",
                {"paso": "monto", "evento_id": evento_id},
            )
            self._enviar_respuesta(
                conversacion,
                f"Vamos a registrar un pago para {nombre_evento}. Indica el monto a pagar (ej: 150 o 150.50)."
            )
            return
        opciones = []
        mapa = {}
        ids = []
        for evento in eventos:
            evento_id = evento.get("id_evento")
            if not evento_id:
                continue
            titulo = evento.get("nombre_evento") or evento.get("salon") or f"Evento #{evento_id}"
            descripcion = evento.get("fecha_evento") or ""
            opcion_id = f"evento:{evento_id}"
            opciones.append({"id": opcion_id, "title": titulo, "description": descripcion})
            mapa[opcion_id] = evento_id
            ids.append(evento_id)
        self.modelo.guardar_estado_bot(
            conversacion["id"],
            "seleccionar_evento",
            {"accion": "registrar_pago", "ids": ids, "mapa": mapa, "opciones": opciones},
        )
        self._enviar_opciones(conversacion, "Selecciona el evento para registrar el pago:", opciones)

    def _continuar_registro_pago(self, conversacion, telefono, texto, estado, media_type=None, media_id=None):
        datos = estado.get("datos") or {}
        paso = datos.get("paso") or "monto"
        evento_id = datos.get("evento_id")
        if not evento_id:
            self.modelo.limpiar_estado_bot(conversacion["id"])
            return "No pude identificar el evento. Intenta nuevamente."

        if paso == "monto":
            monto = self._parse_monto(texto)
            if monto is None or monto <= 0:
                return "Monto no válido. Indica un monto válido (ej: 150 o 150.50)."
            datos["monto"] = monto
            datos["paso"] = "metodo"
            self.modelo.guardar_estado_bot(conversacion["id"], "registrar_pago", datos)
            opciones = [
                {"id": "pago:metodo:efectivo", "title": "Efectivo"},
                {"id": "pago:metodo:transferencia", "title": "Transferencia"},
                {"id": "pago:metodo:tarjeta", "title": "Tarjeta"},
                {"id": "pago:metodo:cheque", "title": "Cheque"},
            ]
            self._enviar_opciones(conversacion, "Selecciona el método de pago:", opciones, boton_texto="Métodos")
            return None

        if paso == "metodo":
            metodo = self._parse_metodo_pago(texto)
            if not metodo:
                opciones = [
                    {"id": "pago:metodo:efectivo", "title": "Efectivo"},
                    {"id": "pago:metodo:transferencia", "title": "Transferencia"},
                    {"id": "pago:metodo:tarjeta", "title": "Tarjeta"},
                    {"id": "pago:metodo:cheque", "title": "Cheque"},
                ]
                self._enviar_opciones(conversacion, "Selecciona un método válido:", opciones, boton_texto="Métodos")
                return None
            datos["metodo_pago"] = metodo
            datos["paso"] = "fecha"
            self.modelo.guardar_estado_bot(conversacion["id"], "registrar_pago", datos)
            return "Indica la fecha de pago (ej: 2026-01-23 o 23/01/2026). También puedes escribir 'hoy'."

        if paso == "fecha":
            fecha = self._parse_fecha_pago(texto)
            if not fecha:
                return "Fecha no válida. Usa formato 2026-01-23 o 23/01/2026, o escribe 'hoy'."
            datos["fecha_pago"] = fecha
            datos["paso"] = "referencia"
            self.modelo.guardar_estado_bot(conversacion["id"], "registrar_pago", datos)
            opciones = [
                {"id": "pago:referencia:omitir", "title": "Omitir"},
            ]
            self._enviar_opciones(conversacion, "Escribe el número de referencia o toca Omitir:", opciones, boton_texto="Referencia")
            return None

        if paso == "referencia":
            texto_normalizado = texto.strip().lower()
            referencia = texto.strip()
            if texto_normalizado in ("pago:referencia:omitir", "omitir", "no", "ninguno", "n/a", "-"):
                referencia = None
            datos["numero_referencia"] = referencia
            datos["paso"] = "observaciones"
            self.modelo.guardar_estado_bot(conversacion["id"], "registrar_pago", datos)
            opciones = [
                {"id": "pago:observacion:omitir", "title": "Omitir"},
            ]
            self._enviar_opciones(
                conversacion,
                "Observaciones (opcional). Puedes enviar una imagen del comprobante o tocar Omitir.",
                opciones,
                boton_texto="Observaciones"
            )
            return None

        if paso == "observaciones":
            texto_normalizado = texto.strip().lower()
            observaciones = texto.strip()
            evidencia_media_id = None
            if media_type == "image" and media_id:
                evidencia_media_id = media_id
                if observaciones in ("[Imagen]", "[Image]", "[Foto]"):
                    observaciones = ""
            if texto_normalizado in ("pago:observacion:omitir", "omitir", "no", "ninguno", "n/a", "-"):
                observaciones = None
            if observaciones == "":
                observaciones = None
            datos["observaciones"] = observaciones
            if evidencia_media_id:
                datos["evidencia_media_id"] = evidencia_media_id
            datos["paso"] = "confirmar"
            self.modelo.guardar_estado_bot(conversacion["id"], "registrar_pago", datos)
            resumen = (
                f"Resumen del pago:\n"
                f"- Evento: #{evento_id}\n"
                f"- Monto: ${datos.get('monto')}\n"
                f"- Método: {datos.get('metodo_pago')}\n"
                f"- Fecha: {datos.get('fecha_pago')}\n"
                f"- Referencia: {datos.get('numero_referencia') or 'N/A'}\n"
                f"- Observaciones: {datos.get('observaciones') or 'N/A'}\n"
                f"- Evidencia: {'Sí' if datos.get('evidencia_media_id') else 'No'}\n\n"
                f"Escribe 'confirmar' para registrar el pago o 'cancelar' para salir."
            )
            opciones = [
                {"id": "pago:confirmar", "title": "Confirmar"},
                {"id": "pago:cancelar", "title": "Cancelar"},
            ]
            self._enviar_opciones(conversacion, resumen, opciones, boton_texto="Acciones")
            return None

        if paso == "confirmar":
            texto_normalizado = texto.lower().strip()
            if texto_normalizado in ("pago:cancelar", "cancelar", "salir"):
                self.modelo.limpiar_estado_bot(conversacion["id"])
                return "Registro de pago cancelado."
            if texto_normalizado not in ("pago:confirmar", "confirmar"):
                opciones = [
                    {"id": "pago:confirmar", "title": "Confirmar"},
                    {"id": "pago:cancelar", "title": "Cancelar"},
                ]
                self._enviar_opciones(conversacion, "Selecciona una acción:", opciones, boton_texto="Acciones")
                return None
            try:
                observaciones = datos.get("observaciones")
                evidencia_media_id = datos.get("evidencia_media_id")
                if evidencia_media_id:
                    evidencia_texto = f"Evidencia WA media_id: {evidencia_media_id}"
                    if observaciones:
                        observaciones = f"{observaciones}\n{evidencia_texto}"
                    else:
                        observaciones = evidencia_texto
                datos_pago = {
                    "id_evento": evento_id,
                    "monto": float(datos.get("monto")),
                    "tipo_pago": "abono",
                    "metodo_pago": datos.get("metodo_pago"),
                    "numero_referencia": datos.get("numero_referencia"),
                    "fecha_pago": datos.get("fecha_pago"),
                    "observaciones": observaciones,
                    "usuario_registro_id": None,
                    "origen": "whatsapp",
                }
                pago_id = self.pagos.crear_pago(datos_pago)
                self.modelo.limpiar_estado_bot(conversacion["id"])
                if pago_id:
                    return f"Pago registrado correctamente. ID: {pago_id}"
                return "No fue posible registrar el pago. Intenta nuevamente o contacta a soporte."
            except Exception as e:
                self.logger.error(f"Error al registrar pago desde bot: {e}")
                self.modelo.limpiar_estado_bot(conversacion["id"])
                return f"No se pudo registrar el pago: {e}"

        self.modelo.limpiar_estado_bot(conversacion["id"])
        return "No pude completar el registro del pago. Intenta nuevamente."

    def _parse_monto(self, texto):
        if not texto:
            return None
        match = re.search(r"(\d+(?:[.,]\d{1,2})?)", texto)
        if not match:
            return None
        valor = match.group(1).replace(",", ".")
        try:
            return float(valor)
        except ValueError:
            return None

    def _parse_fecha_pago(self, texto):
        if not texto:
            return None
        texto_normalizado = texto.strip().lower()
        hoy = datetime.now().date()
        if texto_normalizado in ("hoy",):
            return hoy.isoformat()
        if texto_normalizado in ("ayer",):
            return (hoy - timedelta(days=1)).isoformat()
        if texto_normalizado in ("manana", "mañana"):
            return (hoy + timedelta(days=1)).isoformat()
        formatos = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y")
        for fmt in formatos:
            try:
                return datetime.strptime(texto_normalizado, fmt).date().isoformat()
            except ValueError:
                continue
        return None

    def _normalizar_metodo_pago(self, texto):
        if not texto:
            return None
        texto_normalizado = texto.strip().lower()
        mapa = {
            "efectivo": "efectivo",
            "cash": "efectivo",
            "transferencia": "transferencia",
            "transferencia bancaria": "transferencia",
            "transferencia bancaria y": "transferencia",
            "transferencia bancaria y/": "transferencia",
            "transfer": "transferencia",
            "tarjeta": "tarjeta",
            "credito": "tarjeta",
            "crédito": "tarjeta",
            "debito": "tarjeta",
            "débito": "tarjeta",
            "tc": "tarjeta",
            "cheque": "cheque",
            "deposito": "transferencia",
            "depósito": "transferencia",
            "otro": "efectivo",
        }
        for clave, valor in mapa.items():
            if clave in texto_normalizado:
                return valor
        return None

    def _parse_metodo_pago(self, texto):
        if not texto:
            return None
        texto_normalizado = texto.strip().lower()
        if texto_normalizado.startswith("pago:metodo:"):
            return texto_normalizado.split("pago:metodo:", 1)[1]
        return self._normalizar_metodo_pago(texto)

    def _es_intencion_registrar_pago(self, texto):
        if not texto:
            return False
        frases = (
            "registrar pago",
            "registrar abono",
            "hacer pago",
            "realizar pago",
            "quiero pagar",
            "pagar",
            "abonar",
        )
        if any(frase in texto for frase in frases):
            return True
        if "registrar" in texto and ("pago" in texto or "abono" in texto):
            return True
        return False

    def _responder_info_evento(self, conversacion, telefono, tipo_info):
        eventos = self._obtener_eventos_por_telefono(telefono)
        if not eventos:
            self._enviar_respuesta(conversacion, "No encontramos eventos asociados a este numero.")
            return
        evento = self.eventos.obtener_evento_por_id(eventos[0].get("id_evento"))
        configuracion = self.config_general.obtener_configuracion() or {}
        if tipo_info == "direccion":
            direccion = (
                configuracion.get("establecimiento_direccion")
                or evento.get("ubicacion_salon")
                or evento.get("direccion_cliente")
                or "No registrada"
            )
            self._enviar_respuesta(conversacion, f"Dirección del establecimiento: {direccion}")
        elif tipo_info == "horario":
            horario = configuracion.get("establecimiento_horario") or "No disponible"
            self._enviar_respuesta(conversacion, f"Horario del establecimiento: {horario}")
        elif tipo_info == "contacto":
            nombre = configuracion.get("contacto_nombre") or self._obtener_nombre_plataforma()
            telefono_contacto = configuracion.get("contacto_telefono") or "No disponible"
            whatsapp = configuracion.get("contacto_whatsapp") or telefono_contacto
            email = configuracion.get("contacto_email") or "No disponible"
            self._enviar_respuesta(
                conversacion,
                f"Contacto {nombre}\n"
                f"Teléfono: {telefono_contacto}\n"
                f"WhatsApp: {whatsapp}\n"
                f"Email: {email}"
            )

    def _responder_plan_evento(self, conversacion, telefono):
        eventos = self._obtener_eventos_por_telefono(telefono)
        if not eventos:
            self._enviar_respuesta(conversacion, "No encontramos eventos asociados a este numero.")
            return
        evento = self.eventos.obtener_evento_por_id(eventos[0].get("id_evento"))
        if not evento:
            self._enviar_respuesta(conversacion, "No se pudo obtener el detalle del evento.")
            return
        detalle_plan = self._formato_plan_evento(evento)
        self._enviar_respuesta(conversacion, detalle_plan)

    def _iniciar_creacion_evento(self, conversacion, telefono):
        cliente = self._obtener_cliente_por_telefono(telefono)
        if cliente:
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", {"paso": "nombre_evento", "cliente_id": cliente.get("id")})
            self._enviar_respuesta(conversacion, "Perfecto. Indica el nombre del evento.")
        else:
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", {"paso": "nombre_cliente"})
            self._enviar_respuesta(conversacion, "Para crear tu evento necesito algunos datos. ¿Cual es tu nombre completo?")

    def _continuar_creacion_evento(self, conversacion, telefono, texto, estado):
        datos = estado.get("datos") or {}
        paso = datos.get("paso")
        if paso == "nombre_cliente":
            datos["nombre_completo"] = texto.strip()
            datos["paso"] = "email"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "Indica tu correo (puedes escribir 'no' si no tienes)."
        if paso == "email":
            datos["email"] = None if texto.lower().startswith("no") else texto.strip()
            datos["paso"] = "direccion"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "¿Cual es tu direccion?"
        if paso == "direccion":
            datos["direccion"] = texto.strip()
            datos["paso"] = "nombre_evento"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "Indica el nombre del evento."
        if paso == "nombre_evento":
            datos["nombre_evento"] = texto.strip()
            datos["paso"] = "tipo_evento"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "¿Que tipo de evento es?"
        if paso == "tipo_evento":
            datos["tipo_evento"] = texto.strip()
            datos["paso"] = "fecha_evento"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "Indica la fecha del evento (YYYY-MM-DD)."
        if paso == "fecha_evento":
            datos["fecha_evento"] = texto.strip()
            datos["paso"] = "hora_inicio"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "Indica la hora de inicio (HH:MM)."
        if paso == "hora_inicio":
            datos["hora_inicio"] = texto.strip()
            datos["paso"] = "hora_fin"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "Indica la hora de fin (HH:MM)."
        if paso == "hora_fin":
            datos["hora_fin"] = texto.strip()
            datos["paso"] = "numero_invitados"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "¿Cuantos invitados estimas?"
        if paso == "numero_invitados":
            try:
                invitados = int(texto.strip() or 0)
            except Exception:
                return "Indica un número válido de invitados."
            if invitados <= 0:
                return "Indica un número válido de invitados."
            datos["numero_invitados"] = invitados
            datos["paso"] = "seleccionar_plan"
            planes = self.planes.obtener_todos_planes(True) or []
            opciones_planes = []
            for plan in planes:
                minimo = int(plan.get("capacidad_minima") or 0)
                maximo = int(plan.get("capacidad_maxima") or 0)
                if minimo and invitados < minimo:
                    continue
                if maximo and invitados > maximo:
                    continue
                plan_id = plan.get("id")
                if not plan_id:
                    continue
                opciones_planes.append(
                    {
                        "id": f"plan:{plan_id}",
                        "title": plan.get("nombre") or f"Plan #{plan_id}",
                        "description": f"${plan.get('precio_base') or 0}",
                    }
                )
            if not opciones_planes:
                self.modelo.limpiar_estado_bot(conversacion["id"])
                return "No hay planes disponibles para ese número de invitados. Un asesor te ayudará."
            datos["opciones"] = opciones_planes
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            self._enviar_opciones(conversacion, "Selecciona el plan para tu evento:", opciones_planes)
            return None
        if paso == "seleccionar_plan":
            opciones_planes = datos.get("opciones") or []
            seleccion = self._resolver_opcion(texto, opciones_planes)
            if not seleccion:
                self._enviar_opciones(conversacion, "Selecciona el plan para tu evento:", opciones_planes)
                return None
            plan_id = int(str(seleccion).split(":", 1)[1])
            plan = self.planes.obtener_plan_por_id(plan_id) or {}
            datos["plan_id"] = plan_id
            datos["plan_precio"] = float(plan.get("precio_base") or 0)
            datos["plan_nombre"] = plan.get("nombre") or f"Plan #{plan_id}"
            datos["paso"] = "seleccionar_salon"
            salones = self.salones.obtener_todos_salones(True) or []
            opciones_salones = []
            invitados = int(datos.get("numero_invitados") or 0)
            for salon in salones:
                capacidad = int(salon.get("capacidad") or 0)
                if capacidad and invitados and invitados > capacidad:
                    continue
                salon_id = salon.get("id_salon") or salon.get("id")
                if not salon_id:
                    continue
                opciones_salones.append(
                    {
                        "id": f"salon:{salon_id}",
                        "title": salon.get("nombre") or f"Salón #{salon_id}",
                        "description": f"Capacidad: {salon.get('capacidad') or '-'}",
                    }
                )
            if not opciones_salones:
                self.modelo.limpiar_estado_bot(conversacion["id"])
                return "No hay salones disponibles para ese número de invitados."
            datos["opciones"] = opciones_salones
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            self._enviar_opciones(conversacion, "Selecciona el salón para tu evento:", opciones_salones)
            return None
        if paso == "seleccionar_salon":
            opciones_salones = datos.get("opciones") or []
            seleccion = self._resolver_opcion(texto, opciones_salones)
            if not seleccion:
                self._enviar_opciones(conversacion, "Selecciona el salón para tu evento:", opciones_salones)
                return None
            salon_id = int(str(seleccion).split(":", 1)[1])
            salon = self.salones.obtener_salon_por_id(salon_id) or {}
            datos["salon_id"] = salon_id
            datos["salon_nombre"] = salon.get("nombre") or f"Salón #{salon_id}"
            datos["paso"] = "adicionales_confirm"
            opciones = [
                {"id": "adicionales:si", "title": "Sí, agregar"},
                {"id": "adicionales:no", "title": "No, gracias"},
            ]
            datos["opciones"] = opciones
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            self._enviar_opciones(conversacion, "¿Deseas agregar servicios o productos adicionales?", opciones)
            return None
        if paso == "adicionales_confirm":
            opciones = datos.get("opciones") or []
            seleccion = self._resolver_opcion(texto, opciones)
            if not seleccion:
                self._enviar_opciones(conversacion, "¿Deseas agregar servicios o productos adicionales?", opciones)
                return None
            if seleccion == "adicionales:si":
                productos = self.productos.obtener_todos_productos(True) or []
                opciones_productos = []
                for producto in productos:
                    producto_id = producto.get("id")
                    if not producto_id:
                        continue
                    opciones_productos.append(
                        {
                            "id": f"producto:{producto_id}",
                            "title": producto.get("nombre") or f"Producto #{producto_id}",
                            "description": f"${producto.get('precio') or 0}",
                        }
                    )
                if not opciones_productos:
                    datos["paso"] = "observaciones"
                    self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
                    return "No hay adicionales disponibles. ¿Alguna observación adicional?"
                datos["opciones"] = opciones_productos
                datos["paso"] = "seleccionar_adicional"
                self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
                self._enviar_opciones(conversacion, "Selecciona un adicional:", opciones_productos)
                return None
            datos["paso"] = "observaciones"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "¿Alguna observación adicional? (puedes escribir 'no')."
        if paso == "seleccionar_adicional":
            opciones_productos = datos.get("opciones") or []
            seleccion = self._resolver_opcion(texto, opciones_productos)
            if not seleccion:
                self._enviar_opciones(conversacion, "Selecciona un adicional:", opciones_productos)
                return None
            producto_id = int(str(seleccion).split(":", 1)[1])
            producto = self.productos.obtener_producto_por_id(producto_id) or {}
            datos["producto_actual_id"] = producto_id
            datos["producto_actual_nombre"] = producto.get("nombre") or f"Producto #{producto_id}"
            datos["producto_actual_precio"] = float(producto.get("precio") or 0)
            datos["paso"] = "cantidad_adicional"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return f"¿Cuántas unidades de {datos['producto_actual_nombre']} deseas agregar?"
        if paso == "cantidad_adicional":
            try:
                cantidad = int(texto.strip() or 0)
            except Exception:
                return "Indica una cantidad válida."
            if cantidad <= 0:
                return "Indica una cantidad válida."
            adicionales = datos.get("adicionales") or []
            subtotal = float(datos.get("producto_actual_precio") or 0) * cantidad
            adicionales.append(
                {
                    "producto_id": datos.get("producto_actual_id"),
                    "nombre": datos.get("producto_actual_nombre"),
                    "cantidad": cantidad,
                    "precio_unitario": float(datos.get("producto_actual_precio") or 0),
                    "subtotal": subtotal,
                }
            )
            datos["adicionales"] = adicionales
            datos["paso"] = "adicionales_mas"
            opciones = [
                {"id": "adicionales:mas", "title": "Agregar otro"},
                {"id": "adicionales:fin", "title": "No, continuar"},
            ]
            datos["opciones"] = opciones
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            self._enviar_opciones(conversacion, "¿Deseas agregar otro adicional?", opciones)
            return None
        if paso == "adicionales_mas":
            opciones = datos.get("opciones") or []
            seleccion = self._resolver_opcion(texto, opciones)
            if not seleccion:
                self._enviar_opciones(conversacion, "¿Deseas agregar otro adicional?", opciones)
                return None
            if seleccion == "adicionales:mas":
                productos = self.productos.obtener_todos_productos(True) or []
                opciones_productos = []
                for producto in productos:
                    producto_id = producto.get("id")
                    if not producto_id:
                        continue
                    opciones_productos.append(
                        {
                            "id": f"producto:{producto_id}",
                            "title": producto.get("nombre") or f"Producto #{producto_id}",
                            "description": f"${producto.get('precio') or 0}",
                        }
                    )
                datos["opciones"] = opciones_productos
                datos["paso"] = "seleccionar_adicional"
                self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
                self._enviar_opciones(conversacion, "Selecciona un adicional:", opciones_productos)
                return None
            datos["paso"] = "observaciones"
            self.modelo.guardar_estado_bot(conversacion["id"], "crear_evento", datos)
            return "¿Alguna observación adicional? (puedes escribir 'no')."
        if paso == "observaciones":
            observaciones = texto.strip()
            datos["observaciones"] = None if observaciones.lower().startswith("no") else observaciones
            cliente = self._obtener_cliente_por_telefono(telefono)
            if not cliente:
                cliente = self._crear_cliente_si_no_existe(telefono, datos)
            if not cliente:
                self.modelo.limpiar_estado_bot(conversacion["id"])
                return "No se pudo crear el cliente. Intenta mas tarde."
            total_plan = float(datos.get("plan_precio") or 0)
            total_adicionales = sum([float(a.get("subtotal") or 0) for a in (datos.get("adicionales") or [])])
            total_evento = total_plan + total_adicionales
            evento_id = self.eventos.crear_evento({
                "cliente_id": cliente.get("id"),
                "nombre_evento": datos.get("nombre_evento"),
                "tipo_evento": datos.get("tipo_evento"),
                "fecha_evento": datos.get("fecha_evento"),
                "hora_inicio": datos.get("hora_inicio"),
                "hora_fin": datos.get("hora_fin"),
                "numero_invitados": datos.get("numero_invitados"),
                "observaciones": datos.get("observaciones"),
                "salon": datos.get("salon_nombre"),
                "id_salon": datos.get("salon_id"),
                "plan_id": datos.get("plan_id"),
                "total": total_evento,
                "saldo": total_evento
            })
            if evento_id and datos.get("adicionales"):
                for adicional in datos.get("adicionales"):
                    self.eventos.agregar_producto_evento(
                        evento_id,
                        adicional.get("producto_id"),
                        adicional.get("cantidad"),
                        adicional.get("precio_unitario"),
                    )
            self.modelo.limpiar_estado_bot(conversacion["id"])
            if evento_id:
                return f"Listo, tu evento fue creado con ID #{evento_id}. Nos pondremos en contacto."
            return "No se pudo crear el evento. Intenta nuevamente."
        return "No te entendi. Escribe 'crear evento' para iniciar."

    def procesar_webhook(self, payload):
        try:
            entries = payload.get("entry") or []
            for entry in entries:
                changes = entry.get("changes") or []
                for change in changes:
                    value = change.get("value") or {}
                    mensajes = value.get("messages") or []
                    estados = value.get("statuses") or []
                    for status in estados:
                        wa_message_id = status.get("id")
                        estado = status.get("status")
                        if wa_message_id and estado:
                            self.modelo.actualizar_estado_por_wa_id_con_detalle(wa_message_id, estado, raw_json=status)
                            if estado == "failed":
                                errores = status.get("errors") or []
                                error_131047 = False
                                for error in errores:
                                    if str(error.get("code")) == "131047":
                                        error_131047 = True
                                        detalle = error.get("error_data", {}).get("details") or error.get("message")
                                        conversacion_id = self.modelo.obtener_conversacion_id_por_wa_id(wa_message_id)
                                        if conversacion_id:
                                            self.modelo.marcar_reengagement(conversacion_id, detalle=detalle)
                                        self.logger.warning(
                                            f"WhatsApp fuera de ventana 24h (re-engagement) para wa_id={wa_message_id}: {detalle}"
                                        )
                                
                                # Si no es error 131047, marcar como pendiente de reintento
                                if not error_131047:
                                    try:
                                        self.modelo.marcar_pendiente_reintento_por_wa_id(wa_message_id)
                                    except Exception as e:
                                        self.logger.warning(f"Error al marcar mensaje como pendiente de reintento: {e}")
                    for mensaje in mensajes:
                        texto = (mensaje.get("text") or {}).get("body") or ""
                        tipo = mensaje.get("type")
                        wa_message_id = mensaje.get("id")
                        media_type = None
                        media_id = None
                        if tipo in ("image", "audio", "document"):
                            media_info = mensaje.get(tipo) or {}
                            media_id = media_info.get("id")
                            media_type = tipo
                            if tipo == "image":
                                texto = media_info.get("caption") or "[Imagen]"
                            elif tipo == "audio":
                                texto = "[Audio]"
                            else:
                                texto = media_info.get("filename") or "[Documento]"
                        elif tipo == "interactive":
                            interactive = mensaje.get("interactive") or {}
                            if "button_reply" in interactive:
                                reply = interactive.get("button_reply") or {}
                                texto = reply.get("id") or reply.get("title") or ""
                            elif "list_reply" in interactive:
                                reply = interactive.get("list_reply") or {}
                                texto = reply.get("id") or reply.get("title") or ""
                        telefono = mensaje.get("from")
                        if not telefono:
                            continue
                        conversacion = self.modelo.obtener_conversacion_por_telefono(telefono)
                        if not conversacion:
                            cliente = self._obtener_cliente_por_telefono(telefono)
                            conversacion_id = self.modelo.crear_conversacion(telefono, cliente_id=cliente.get("id") if cliente else None)
                            conversacion = self.modelo.obtener_conversacion_por_telefono(telefono)
                        self.modelo.actualizar_conversacion(conversacion["id"])
                        self.modelo.actualizar_interaccion_cliente(conversacion["id"])
                        self._registrar_mensaje(
                            conversacion["id"],
                            "in",
                            texto,
                            raw_json=mensaje,
                            media_type=media_type,
                            media_id=media_id,
                            wa_message_id=wa_message_id,
                            estado="received",
                            origen="cliente"
                        )
                        if not conversacion.get("bot_activo"):
                            continue
                        self._procesar_bot(conversacion, telefono, texto, media_type=media_type, media_id=media_id)
        except Exception as e:
            self.logger.error(f"Error procesando webhook WhatsApp: {e}")

    def _procesar_bot(self, conversacion, telefono, texto, media_type=None, media_id=None):
        texto_normalizado = texto.lower().strip()
        estado = self.modelo.obtener_estado_bot(conversacion["id"])
        if estado and estado.get("estado") == "crear_evento":
            respuesta = self._continuar_creacion_evento(conversacion, telefono, texto, estado)
            if respuesta:
                self._enviar_respuesta(conversacion, respuesta)
            return
        if estado and estado.get("estado") == "registrar_pago":
            respuesta = self._continuar_registro_pago(conversacion, telefono, texto, estado, media_type=media_type, media_id=media_id)
            if respuesta:
                self._enviar_respuesta(conversacion, respuesta)
            return
        if estado and estado.get("estado") == "seleccionar_evento":
            datos = estado.get("datos") or {}
            ids = datos.get("ids") or []
            mapa = datos.get("mapa") or {}
            opciones = datos.get("opciones") or []
            seleccion = None
            if opciones:
                seleccion = self._resolver_opcion(texto, opciones)
            if texto_normalizado in mapa:
                seleccion = texto_normalizado
            elif texto_normalizado.startswith("evento:"):
                seleccion = texto_normalizado
            if seleccion:
                evento_id = int(str(seleccion).split(":", 1)[1])
            elif texto_normalizado.isdigit() and int(texto_normalizado) in ids:
                evento_id = int(texto_normalizado)
            else:
                if opciones:
                    self._enviar_opciones(conversacion, "Selecciona una opción válida:", opciones)
                else:
                    self._enviar_respuesta(conversacion, "Por favor responde con el ID del evento de la lista.")
                return
            if evento_id:
                accion = datos.get("accion")
                limpiar_estado = True
                if accion == "pagos":
                    pagos = self.pagos.obtener_pagos_por_evento(evento_id)
                    if not pagos:
                        self._enviar_respuesta(conversacion, "No hay pagos registrados para ese evento.")
                    else:
                        lista = "\n".join([f"- {p.get('fecha_pago')}: ${p.get('monto')} ({p.get('metodo_pago')})" for p in pagos])
                        self._enviar_respuesta(conversacion, f"Pagos del evento #{evento_id}:\n{lista}")
                elif accion == "registrar_pago":
                    evento = self.eventos.obtener_evento_por_id(evento_id)
                    self.modelo.guardar_estado_bot(
                        conversacion["id"],
                        "registrar_pago",
                        {"paso": "monto", "evento_id": evento_id},
                    )
                    nombre_evento = evento.get("nombre_evento") or evento.get("salon") or f"Evento #{evento_id}"
                    self._enviar_respuesta(
                        conversacion,
                        f"Vamos a registrar un pago para {nombre_evento}. Indica el monto a pagar (ej: 150 o 150.50)."
                    )
                    limpiar_estado = False
                else:
                    evento = self.eventos.obtener_evento_por_id(evento_id)
                    self._enviar_respuesta(conversacion, self._formato_detalles_evento(evento))
                if limpiar_estado:
                    self.modelo.limpiar_estado_bot(conversacion["id"])
                return
        if texto_normalizado in ("menu:crear", "menu:evento", "menu:registrar_pago", "menu:pagos", "menu:direccion", "menu:horario", "menu:contacto"):
            if texto_normalizado == "menu:crear":
                self._iniciar_creacion_evento(conversacion, telefono)
            elif texto_normalizado == "menu:registrar_pago":
                self._iniciar_registro_pago(conversacion, telefono)
            elif texto_normalizado == "menu:pagos":
                self._responder_pagos(conversacion, telefono)
            elif texto_normalizado == "menu:evento":
                self._responder_eventos(conversacion, telefono)
            elif texto_normalizado == "menu:direccion":
                self._responder_info_evento(conversacion, telefono, "direccion")
            elif texto_normalizado == "menu:horario":
                self._responder_info_evento(conversacion, telefono, "horario")
            elif texto_normalizado == "menu:contacto":
                self._responder_info_evento(conversacion, telefono, "contacto")
            return
        if "crear evento" in texto_normalizado or "agendar evento" in texto_normalizado:
            self._iniciar_creacion_evento(conversacion, telefono)
            return
        if self._es_intencion_registrar_pago(texto_normalizado):
            self._iniciar_registro_pago(conversacion, telefono)
            return
        if "consultar" in texto_normalizado and "pago" in texto_normalizado or "mis pagos" in texto_normalizado:
            self._responder_pagos(conversacion, telefono)
            return
        if ("consultar" in texto_normalizado and "evento" in texto_normalizado) or "mi evento" in texto_normalizado or "mis eventos" in texto_normalizado or "eventos" in texto_normalizado:
            self._responder_eventos(conversacion, telefono)
            return
        if "direccion" in texto_normalizado or "ubicacion" in texto_normalizado:
            self._responder_info_evento(conversacion, telefono, "direccion")
            return
        if "horario" in texto_normalizado or "hora" in texto_normalizado:
            self._responder_info_evento(conversacion, telefono, "horario")
            return
        if "contacto" in texto_normalizado:
            self._responder_info_evento(conversacion, telefono, "contacto")
            return
        self._enviar_menu(conversacion)

    def enviar_mensaje_manual(self, conversacion_id, mensaje):
        self.ultimo_error_envio = None
        conversacion = self.modelo.base_datos.obtener_uno(
            "SELECT * FROM whatsapp_conversaciones WHERE id = %s", (conversacion_id,)
        )
        if not conversacion:
            return False
        permitido, motivo = self._puede_enviar_whatsapp(conversacion.get("telefono"))
        if not permitido:
            if motivo in ("REENGAGEMENT", "FUERA_VENTANA", "SIN_INTERACCION"):
                if self._enviar_plantilla_reengagement(conversacion.get("telefono"), conversacion.get("cliente_id")):
                    return self.enviar_mensaje_manual(conversacion_id, mensaje)
            self.ultimo_error_envio = self._mensaje_bloqueo(motivo)
            self._registrar_mensaje(
                conversacion_id,
                "out",
                self._mensaje_bloqueo(motivo),
                estado="bloqueado",
                origen="humano"
            )
            return False
        telefono = conversacion.get("telefono")
        enviado, wa_message_id = self.whatsapp.enviar_mensaje_chat(telefono, mensaje)
        if enviado:
            precio_unitario = self._obtener_precio_whatsapp()
            self._registrar_mensaje(
                conversacion_id,
                "out",
                mensaje,
                estado="sent",
                wa_message_id=wa_message_id,
                origen="humano",
                costo_unitario=precio_unitario,
                costo_total=precio_unitario
            )
            self.modelo.actualizar_conversacion(conversacion_id)
            return True
        self._registrar_mensaje(conversacion_id, "out", mensaje, estado="fallido", wa_message_id=wa_message_id, origen="humano")
        return False

    def enviar_media_manual(self, conversacion_id, archivo, tipo, caption=None):
        self.ultimo_error_envio = None
        conversacion = self.modelo.base_datos.obtener_uno(
            "SELECT * FROM whatsapp_conversaciones WHERE id = %s", (conversacion_id,)
        )
        if not conversacion or not archivo:
            return False
        permitido, motivo = self._puede_enviar_whatsapp(conversacion.get("telefono"))
        if not permitido:
            if motivo in ("REENGAGEMENT", "FUERA_VENTANA", "SIN_INTERACCION"):
                if self._enviar_plantilla_reengagement(conversacion.get("telefono"), conversacion.get("cliente_id")):
                    return self.enviar_media_manual(conversacion_id, archivo, tipo, caption=caption)
            self.ultimo_error_envio = self._mensaje_bloqueo(motivo)
            self._registrar_mensaje(
                conversacion_id,
                "out",
                self._mensaje_bloqueo(motivo),
                estado="bloqueado",
                origen="humano"
            )
            return False
        telefono = conversacion.get("telefono")
        try:
            file_bytes = archivo.read()
            media_id = self.whatsapp.subir_media(file_bytes, archivo.mimetype, archivo.filename)
            if not media_id:
                self._registrar_mensaje(conversacion_id, "out", f"[{tipo}] {archivo.filename}", estado="fallido", origen="humano")
                return False
            enviado, wa_message_id = self.whatsapp.enviar_media_chat(telefono, media_id, tipo, caption=caption)
            estado = "sent" if enviado else "fallido"
            contenido = f"[{tipo.upper()}] {archivo.filename}"
            if caption:
                contenido = f"{contenido}\n{caption}"
            precio_unitario = self._obtener_precio_whatsapp() if enviado else None
            self._registrar_mensaje(
                conversacion_id,
                "out",
                contenido,
                estado=estado,
                media_type=tipo,
                media_id=media_id,
                wa_message_id=wa_message_id,
                origen="humano",
                costo_unitario=precio_unitario,
                costo_total=precio_unitario
            )
            if enviado:
                self.modelo.actualizar_conversacion(conversacion_id)
            return enviado
        except Exception as e:
            self.logger.error(f"Error al enviar media manual: {e}")
            self._registrar_mensaje(
                conversacion_id,
                "out",
                f"[{tipo}] {getattr(archivo, 'filename', '')}",
                estado="fallido",
                origen="humano"
            )
            return False
