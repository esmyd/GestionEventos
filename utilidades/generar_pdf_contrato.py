"""
Utilidad para generar PDF de contrato de evento
"""
from datetime import datetime
import io

from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _formatear_fecha_larga(fecha):
    """Formatea una fecha en formato largo en mayusculas."""
    if not fecha:
        return "N/A"
    try:
        if isinstance(fecha, str):
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S"]:
                try:
                    fecha = datetime.strptime(fecha, fmt)
                    break
                except ValueError:
                    continue
        elif hasattr(fecha, "strftime"):
            fecha = fecha
        else:
            return str(fecha)
        if not isinstance(fecha, datetime):
            return str(fecha)
        dias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]
        meses = [
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
        ]
        dia_semana = dias[fecha.weekday()]
        mes = meses[fecha.month - 1]
        return f"{dia_semana} {fecha.day:02d} {mes} DEL {fecha.year}"
    except Exception:
        return str(fecha)


def _formatear_fecha_corta(fecha):
    if not fecha:
        return "N/A"
    try:
        if isinstance(fecha, str):
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S"]:
                try:
                    return datetime.strptime(fecha, fmt).strftime("%d/%m/%Y")
                except ValueError:
                    continue
        elif hasattr(fecha, "strftime"):
            return fecha.strftime("%d/%m/%Y")
        return str(fecha)
    except Exception:
        return str(fecha)


def _mes_en_espanol(fecha):
    try:
        if isinstance(fecha, str):
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S"]:
                try:
                    fecha = datetime.strptime(fecha, fmt)
                    break
                except ValueError:
                    continue
        if not isinstance(fecha, datetime):
            return "N/A"
        meses = [
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
        ]
        return meses[fecha.month - 1]
    except Exception:
        return "N/A"


def _dibujar_pie_pagina(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica-Oblique", 10)
    canvas.drawRightString(doc.pagesize[0] - doc.rightMargin, 1.1 * cm, "Plasmamos el amor que hay en ti...")
    canvas.restoreState()


def _formatear_hora(hora):
    if not hora:
        return "N/A"
    try:
        if isinstance(hora, str) and ":" in hora:
            partes = hora.split(":")
            return f"{partes[0]}:{partes[1]}"
        return str(hora)
    except Exception:
        return str(hora)


def _calcular_duracion_horas(hora_inicio, hora_fin):
    try:
        if not hora_inicio or not hora_fin:
            return None
        if isinstance(hora_inicio, str) and isinstance(hora_fin, str):
            inicio = datetime.strptime(hora_inicio[:5], "%H:%M")
            fin = datetime.strptime(hora_fin[:5], "%H:%M")
            delta = (fin - inicio).seconds / 3600
            if delta <= 0:
                return None
            return int(delta) if delta.is_integer() else round(delta, 2)
        return None
    except Exception:
        return None


def generar_pdf_contrato(evento):
    """
    Genera un PDF del contrato de evento con datos dinamicos del cliente y evento.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2.2 * cm,
        leftMargin=2.2 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
    )

    styles = getSampleStyleSheet()
    titulo_style = ParagraphStyle(
        "TituloPrincipal",
        parent=styles["Heading1"],
        fontSize=11,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
        spaceAfter=6,
    )
    subtitulo_style = ParagraphStyle(
        "Subtitulo",
        parent=styles["Heading2"],
        fontSize=9,
        alignment=TA_LEFT,
        fontName="Helvetica-Bold",
        spaceBefore=6,
        spaceAfter=3,
    )
    texto_style = ParagraphStyle(
        "TextoNormal",
        parent=styles["Normal"],
        fontSize=9,
        alignment=TA_JUSTIFY,
        leading=12,
        spaceAfter=2,
    )
    texto_center_style = ParagraphStyle(
        "TextoCenter",
        parent=texto_style,
        alignment=TA_CENTER,
    )
    etiqueta_style = ParagraphStyle(
        "Etiqueta",
        parent=texto_style,
        fontName="Helvetica-Bold",
    )

    contratista = {
        "nombre": "Alfredo Figueredo Vera",
        "cedula": "0910455856",
        "direccion": "Samanes 3 mz 311 solar #1",
        "telefono": "0981709875",
        "email": "lirioseventosinfo@gmail.com",
    }

    nombre_cliente = evento.get("nombre_cliente", "N/A")
    documento_cliente = evento.get("documento_identidad_cliente") or "N/A"
    direccion_cliente = evento.get("direccion_cliente") or "N/A"
    salon = evento.get("nombre_salon") or evento.get("salon") or "N/A"
    tipo_evento = evento.get("tipo_evento", "N/A")
    fecha_evento = _formatear_fecha_larga(evento.get("fecha_evento"))
    hora_inicio = _formatear_hora(evento.get("hora_inicio"))
    hora_fin = _formatear_hora(evento.get("hora_fin"))
    numero_invitados = evento.get("numero_invitados") or "N/A"
    nombre_plan = evento.get("nombre_plan") or "PAQUETE CONTRATADO"

    numero_contrato_base = documento_cliente if documento_cliente != "N/A" else str(evento.get("id_evento", "000"))
    numero_contrato = f"00-{numero_contrato_base}"

    duracion_horas = _calcular_duracion_horas(evento.get("hora_inicio"), evento.get("hora_fin")) or 6

    elements = []
    elements.append(Paragraph(f"CONTRATO DE EVENTO AFV# {numero_contrato}", titulo_style))
    elements.append(Spacer(1, 0.2 * cm))

    intro = (
        "Conste por el presente documento el Contrato de Alquiler de Salon de Eventos Lirios que celebran: "
        f"{contratista['nombre']} cedula {contratista['cedula']} con direccion en {contratista['direccion']}, "
        f"celular {contratista['telefono']}, correo {contratista['email']}, "
        "a quien se denominara <b>CONTRATISTA</b>. "
        f"{nombre_cliente}, cedula {documento_cliente}, domicilio {direccion_cliente}, "
        "a quien en lo sucesivo se denominara <b>EL CLIENTE</b>. "
        "A quienes en adelante se les denominara <b>LAS PARTES</b>; en los terminos y condiciones siguientes:"
    )
    elements.append(Paragraph(intro, texto_style))
    elements.append(Spacer(1, 0.2 * cm))

    elements.append(Paragraph("CLAUSULA PRIMERA. - ANTECEDENTES", subtitulo_style))
    elements.append(Paragraph(
        "El Contratista debidamente inscrito en los Registros Publicos cuyo objeto social es la prestacion "
        "de servicios de elaboracion de comidas, banquetes, aniversario de empresas y fiestas en general, "
        "cenas, asi como otros eventos sociales, incluido el alquiler de salones para eventos.",
        texto_style
    ))
    elements.append(Paragraph(
        "EL CLIENTE es una persona natural, interesado en contratar los servicios de <b>LIRIOS EVENTOS</b> dirigidos "
        "por nuestra organizadora de eventos a fin de que se encargue de la coordinacion y ejecucion del evento "
        "que se detallara en clausulas posteriores.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA SEGUNDA. - OBJETO DEL CONTRATO", subtitulo_style))
    elements.append(Paragraph(
        f"En virtud del presente contrato, El Contratista se obliga a alquilar el salon de eventos (<b>{salon}</b>) al "
        "cliente bajo las siguientes condiciones:",
        texto_style
    ))
    elements.append(Paragraph(
        f"Un salon de evento para organizar una reunion con motivo de <b>{tipo_evento}</b>, a realizarse en la fecha "
        f"<b>{fecha_evento}</b>.",
        texto_style
    ))
    elements.append(Paragraph(
        "Se deja constancia que se alquilara el Salon en perfectas condiciones a satisfaccion del cliente, "
        "cabe indicar todo menaje solicitado adicional al paquete contratado tiene un costo adicional de "
        "alquiler durante el evento.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA TERCERA. - DURACION DEL CONTRATO", subtitulo_style))
    elements.append(Paragraph(
        "Este contrato entra en vigencia desde la fecha en que es reservado el evento por ambas partes y el mismo "
        "tendra una duracion hasta el dia en que se celebra el evento y se efectue la devolucion de garantia.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA CUARTA. - CARACTERISTICAS DEL CONTRATO", subtitulo_style))
    elements.append(Paragraph(
        "Este es un contrato de tipo civil, El cliente no tiene ninguna responsabilidad con el personal del Contratista.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA QUINTA. - OBLIGACIONES Y DERECHOS DE LAS PARTES", subtitulo_style))
    obligaciones = [
        "5.1 El Contratista, se obliga a mantener en condiciones higienicas aceptables el espacio y los materiales "
        "utilizados para el Evento.",
        "5.2 En caso de dano de algun elemento del salon o de sus materiales, el cliente se compromete a reponerlo.",
        "5.3 El cliente se compromete a dejar un valor de US. 60.00 dolares americanos, en efectivo o transferencia "
        "en garantia que se devolvera al siguiente dia habil despues del termino del evento. Una vez constatado que "
        "todos los materiales se encuentran en perfectas condiciones, de haber alguna anomalia se notificara al "
        "cliente y se descontara del valor entregado como garantia, si el dano supera el valor entregado de garantia "
        "el cliente se compromete a reponer o cancelar el valor.",
        f"5.4 El tiempo establecido para el desarrollo del evento es de {duracion_horas} horas, el horario establecido "
        f"para el evento es de {hora_inicio} hasta las {hora_fin}, por cada hora adicional que dure el evento se hara "
        "el recargo de $180.00 por hora, cubriendo asi valores extras al personal y el uso de las instalaciones.",
        f"5.5 La organizacion del evento es sobre {numero_invitados} personas con el paquete {nombre_plan}, de haber "
        "personas adicionales a la cantidad cotizada durante el evento, se descontara el valor de $15 por persona "
        "del valor entregado como garantia, cubriendo asi costos adicionales de servicio y menaje del salon.",
        "5.6 Se tomaran fotos durante el evento, las mismas seran utilizadas con fines de publicidad a favor de "
        "Lirios Eventos.",
        "5.7 Realizacion del evento sera guiado por el protocolo o cronograma que proveera el cliente con cinco dias "
        "de anticipacion, asi mismo la asistencia de las personas sera controlada con la lista de invitados "
        "proporcionada por el cliente, las actividades del festejo deben realizarse dentro de las 6 horas de servicio "
        "establecidas para el evento.",
        "5.8 Todo proveedor externo contratado por el cliente para el evento es responsabilidad del cliente y debe "
        "indicar los nombres de las personas que ingresen a realizar el servicio.",
    ]
    for item in obligaciones:
        elements.append(Paragraph(item, texto_style))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA SEXTA. - GARANTIAS DE LA PARTES", subtitulo_style))
    elements.append(Paragraph(
        "Se deja establecido que para seguridad de las partes que, por situaciones ajenas de emergencia, como "
        "temblores, incendios, apagones de luz electrica, inundaciones, catastrofes naturales, pandemias, ademas "
        "de situaciones como paralizaciones nacional o locales que pueda afectar la colectividad.",
        texto_style
    ))
    elements.append(Paragraph(
        "La contratista no reembolsara los abonos entregados para el evento, para lo cual se podra reagendar una "
        "nueva fecha coordinadamente con la agenda del contratista, teniendo en cuenta los pagos ya realizados a "
        "proveedores y tiempo utilizado en el evento.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph(
        "CLAUSULA SEPTIMA.- BEBIDAS ALCOHOLICAS QUE EL CONTRATANTE TRAIGA POR SU CUENTA O CONTRATE CON OTRO PROVEEDOR.",
        subtitulo_style,
    ))
    alcohol = [
        "Se realizara un acta de recepcion de botellas de licor, con el fin de validar que sean bebidas aptas para el consumo.",
        "Todas las botellas de licor deben estar selladas.",
        "La Contratista no tiene ninguna responsabilidad sobre el contenido de las botellas de bebidas alcoholicas que "
        "el cliente entregue, ni tampoco sobre la calidad de los materiales que utilice otro proveedor que cliente "
        "contrate para el abastecimiento de cocteles u otro tipo de bebidas alcoholicas.",
        "Todas las bebidas alcoholicas seran servidas conforme establece la ley al respecto, la contratista no tiene "
        "responsabilidad en el caso que el cliente o el proveedor que contrate el cliente proporcione bebidas alcoholicas "
        "a personas menores de edad.",
        "La contratista no es responsable por controlar el cumplimiento del contrato de servicios que haga el cliente "
        "con otro proveedor para provision de bebidas alcoholicas o cualquier otro servicio.",
        "Todo proveedor externo debe traer sus implementos necesarios para realizar su trabajo durante el evento.",
    ]
    for item in alcohol:
        elements.append(Paragraph(f"- {item}", texto_style))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA OCTAVA. - CLAUSULA ARBITRAL", subtitulo_style))
    elements.append(Paragraph(
        "Las controversias que pudieran suscitarse en torno al presente contrato, seran sometidas a arbitraje, "
        "mediante un Tribunal Arbitral integrado por tres expertos en la materia, uno de ellos designado de comun "
        "acuerdo por las partes, quien lo presidira y los otros designados por cada uno de ellos.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA NOVENA. - DOMICILIO", subtitulo_style))
    elements.append(Paragraph(
        "Para la validez de todas las comunicaciones y notificaciones a las partes, con motivo de la ejecucion de "
        "este contrato, ambas senalan como sus respectivos domicilios los indicados en la parte introductoria del "
        "presente documento. El cambio de cualquiera de las partes surtira efectos desde la fecha de comunicacion de "
        "dicho cambio a la otra parte, por via notarial.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA DECIMA PRIMERA. - APLICACION SUPLETORIA DE LA LEY", subtitulo_style))
    elements.append(Paragraph(
        "En todo lo no previsto por las partes en el presente contrato, ambas se someten a lo establecido por las "
        "normas del Codigo Civil y demas del sistema juridico que resulten aplicables.",
        texto_style
    ))
    elements.append(Spacer(1, 0.15 * cm))

    elements.append(Paragraph("CLAUSULA DECIMA SEGUNDA - CONFORMIDAD DE ACUERDOS", subtitulo_style))
    hoy = datetime.now()
    elements.append(Paragraph(
        "En senal de conformidad las partes suscriben este documento en la ciudad de GUAYAQUIL a los "
        f"{hoy.day} dias del mes de {_mes_en_espanol(hoy)} del {hoy.year}.",
        texto_style
    ))
    elements.append(Spacer(1, 0.4 * cm))

    firmas_data = [
        [Paragraph("Contratista", etiqueta_style), Paragraph("Firma cliente", etiqueta_style)],
        [Paragraph("__________________________", texto_style), Paragraph("__________________________", texto_style)],
    ]
    firmas_table = Table(firmas_data, colWidths=[9 * cm, 9 * cm])
    firmas_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(firmas_table)

    doc.build(elements, onFirstPage=_dibujar_pie_pagina, onLaterPages=_dibujar_pie_pagina)
    buffer.seek(0)
    return buffer.getvalue()
