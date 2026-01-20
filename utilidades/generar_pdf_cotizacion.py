"""
Utilidad para generar PDF de cotización de eventos
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import io


def formatear_moneda(valor):
    """Formatea un valor como moneda colombiana"""
    return f"${valor:,.0f}".replace(',', '.')


def _formatear_fecha_pdf(fecha):
    """Formatea una fecha para el PDF"""
    if not fecha:
        return 'N/A'
    try:
        if isinstance(fecha, str):
            # Intentar diferentes formatos
            for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']:
                try:
                    return datetime.strptime(fecha, fmt).strftime('%d/%m/%Y')
                except ValueError:
                    continue
        elif hasattr(fecha, 'strftime'):
            return fecha.strftime('%d/%m/%Y')
        return str(fecha)
    except:
        return str(fecha)


def generar_pdf_cotizacion(evento, productos_adicionales=None):
    """
    Genera un PDF profesional de cotización para un evento
    Estructura similar a factura oficial, sin colores
    
    Args:
        evento: Diccionario con la información del evento
        productos_adicionales: Lista de productos adicionales (opcional)
    
    Returns:
        Bytes del PDF generado
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, 
                           rightMargin=1.5*cm, leftMargin=1.5*cm,
                           topMargin=1.2*cm, bottomMargin=1.2*cm)
    
    # Contenedor para los elementos del PDF
    elements = []
    
    # Estilos - sin colores, solo negro y gris
    styles = getSampleStyleSheet()
    
    # Estilo para el título principal
    titulo_style = ParagraphStyle(
        'TituloPrincipal',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.black,
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para subtítulos
    subtitulo_style = ParagraphStyle(
        'Subtitulo',
        parent=styles['Heading2'],
        fontSize=10,
        textColor=colors.black,
        spaceAfter=6,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para texto normal
    texto_style = ParagraphStyle(
        'TextoNormal',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.black,
        alignment=TA_LEFT,
        leading=10
    )
    
    # Estilo para texto pequeño
    texto_pequeno_style = ParagraphStyle(
        'TextoPequeno',
        parent=styles['Normal'],
        fontSize=7,
        textColor=colors.black,
        alignment=TA_LEFT,
        leading=9
    )
    
    # Estilo para etiquetas (negritas)
    etiqueta_style = ParagraphStyle(
        'Etiqueta',
        parent=texto_style,
        fontSize=8,
        fontName='Helvetica-Bold',
        textColor=colors.black
    )
    
    # Encabezado tipo factura - Información del Emisor
    header_style = ParagraphStyle('Header', parent=texto_style, fontSize=12, fontName='Helvetica-Bold', textColor=colors.black)
    
    emisor_data = [
        [Paragraph("<b>LIRIOS EVENTOS</b>", header_style), 
         Paragraph("COTIZACIÓN", titulo_style)],
        [Paragraph("Sistema de Gestión de Eventos", texto_style),
         Paragraph(f"No. {evento.get('id_evento', 'N/A')}", texto_style)],
        [Paragraph("", texto_style),
         Paragraph(f"Fecha Emisión: {datetime.now().strftime('%d/%m/%Y')}", texto_pequeno_style)]
    ]
    emisor_table = Table(emisor_data, colWidths=[10*cm, 8*cm])
    emisor_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),
    ]))
    elements.append(emisor_table)
    elements.append(Spacer(1, 0.3*cm))
    
    # Información del Cliente/Receptor (estilo factura)
    cliente_data = [
        [Paragraph("<b>RAZÓN SOCIAL / NOMBRES Y APELLIDOS:</b>", etiqueta_style), 
         Paragraph(evento.get('nombre_cliente', 'N/A'), texto_style)],
        [Paragraph("<b>EVENTO:</b>", etiqueta_style), 
         Paragraph(evento.get('nombre_evento', 'N/A'), texto_style)],
        [Paragraph("<b>TIPO DE EVENTO:</b>", etiqueta_style), 
         Paragraph(evento.get('tipo_evento', 'N/A'), texto_style)],
        [Paragraph("<b>FECHA DEL EVENTO:</b>", etiqueta_style), 
         Paragraph(_formatear_fecha_pdf(evento.get('fecha_evento')), texto_style)],
        [Paragraph("<b>HORA:</b>", etiqueta_style), 
         Paragraph(f"{evento.get('hora_inicio', 'N/A')} - {evento.get('hora_fin', 'N/A')}", texto_style)],
        [Paragraph("<b>NÚMERO DE INVITADOS:</b>", etiqueta_style), 
         Paragraph(str(evento.get('numero_invitados', 'N/A')), texto_style)],
        [Paragraph("<b>SALÓN:</b>", etiqueta_style), 
         Paragraph(evento.get('nombre_salon') or evento.get('salon', 'N/A'), texto_style)],
        [Paragraph("<b>PLAN:</b>", etiqueta_style), 
         Paragraph(evento.get('nombre_plan', 'N/A'), texto_style)],
    ]
    
    cliente_table = Table(cliente_data, colWidths=[6*cm, 12*cm])
    cliente_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
    ]))
    elements.append(cliente_table)
    
    # Observaciones si existen
    if evento.get('observaciones'):
        elements.append(Spacer(1, 0.2*cm))
        obs_data = [
            [Paragraph("<b>OBSERVACIONES:</b>", etiqueta_style), 
             Paragraph(evento.get('observaciones'), texto_style)]
        ]
        obs_table = Table(obs_data, colWidths=[6*cm, 12*cm])
        obs_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(obs_table)
    
    elements.append(Spacer(1, 0.3*cm))
    
    # Tabla de Detalles (estilo factura)
    detalle_data = [
        [Paragraph("<b>Cód.</b>", etiqueta_style),
         Paragraph("<b>Cant.</b>", etiqueta_style),
         Paragraph("<b>Descripción</b>", etiqueta_style),
         Paragraph("<b>Precio Unit.</b>", etiqueta_style),
         Paragraph("<b>Descuento</b>", etiqueta_style),
         Paragraph("<b>Precio Total</b>", etiqueta_style)]
    ]
    
    # Agregar plan si existe
    codigo = 1
    if evento.get('nombre_plan'):
        precio_plan = float(evento.get('precio_plan', 0) or 0)
        if precio_plan > 0:
            nombre_plan = evento.get('nombre_plan', 'Plan')
            if len(nombre_plan) > 50:
                nombre_plan = nombre_plan[:47] + '...'
            detalle_data.append([
                Paragraph(str(codigo), texto_style),
                Paragraph("1", texto_style),
                Paragraph(f"PLAN: {nombre_plan}", texto_style),
                Paragraph(formatear_moneda(precio_plan), texto_style),
                Paragraph("0.00", texto_style),
                Paragraph(formatear_moneda(precio_plan), texto_style)
            ])
            codigo += 1
    
    # Agregar productos adicionales (máximo 6 para mantener en una página)
    total_productos = 0
    if productos_adicionales:
        productos_mostrar = productos_adicionales[:6]
        for producto in productos_mostrar:
            cantidad = producto.get('cantidad', 0)
            precio_unitario = float(producto.get('precio_unitario', 0) or 0)
            subtotal = float(producto.get('subtotal', 0) or 0)
            total_productos += subtotal
            
            nombre_prod = producto.get('nombre_producto', producto.get('nombre', 'Producto'))
            if len(nombre_prod) > 50:
                nombre_prod = nombre_prod[:47] + '...'
            
            detalle_data.append([
                Paragraph(str(codigo), texto_style),
                Paragraph(str(cantidad), texto_style),
                Paragraph(nombre_prod, texto_style),
                Paragraph(formatear_moneda(precio_unitario), texto_style),
                Paragraph("0.00", texto_style),
                Paragraph(formatear_moneda(subtotal), texto_style)
            ])
            codigo += 1
        
        # Si hay más productos, calcular total real
        if len(productos_adicionales) > 6:
            total_productos = sum(float(p.get('subtotal', 0) or 0) for p in productos_adicionales)
            detalle_data.append([
                Paragraph("", texto_style),
                Paragraph("", texto_style),
                Paragraph(f"... y {len(productos_adicionales) - 6} producto(s) adicional(es)", texto_pequeno_style),
                Paragraph("", texto_style),
                Paragraph("", texto_style),
                Paragraph("", texto_style)
            ])
    
    # Tabla de detalle - estilo factura
    if len(detalle_data) > 1:
        detalle_table = Table(detalle_data, colWidths=[1*cm, 1.2*cm, 9*cm, 2.5*cm, 2*cm, 2.3*cm])
        detalle_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (2, -1), 'LEFT'),
            ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),
        ]))
        elements.append(detalle_table)
    else:
        elements.append(Paragraph("No hay detalles de costos disponibles.", texto_style))
    elements.append(Spacer(1, 0.3*cm))
    
    # Resumen financiero - diseño compacto y profesional
    total_evento = float(evento.get('total', 0) or 0)
    total_pagado = float(evento.get('total_pagado', 0) or 0)
    saldo_pendiente = float(evento.get('saldo', evento.get('saldo_pendiente', 0)) or 0)
    precio_plan = float(evento.get('precio_plan', 0) or 0)
    
    resumen_style = ParagraphStyle('Resumen', parent=texto_style, fontSize=8, fontName='Helvetica-Bold', textColor=colors.black)
    resumen_total_style = ParagraphStyle('ResumenTotal', parent=texto_style, fontSize=9, fontName='Helvetica-Bold', textColor=colors.black)
    
    resumen_data = [
        [Paragraph("<b>SUBTOTAL SIN IMPUESTOS:</b>", resumen_style), Paragraph(formatear_moneda(total_evento), resumen_style)],
        [Paragraph("<b>DESCUENTO:</b>", resumen_style), Paragraph("0.00", resumen_style)],
        [Paragraph("<b>IVA 0.00%:</b>", resumen_style), Paragraph("0.00", resumen_style)],
        [Paragraph("<b>VALOR TOTAL:</b>", resumen_total_style), Paragraph(formatear_moneda(total_evento), resumen_total_style)],
        [Paragraph("<b>TOTAL PAGADO:</b>", resumen_style), Paragraph(formatear_moneda(total_pagado), resumen_style)],
        [Paragraph("<b>SALDO PENDIENTE:</b>", resumen_total_style), Paragraph(formatear_moneda(saldo_pendiente), resumen_total_style)],
    ]
    
    resumen_table = Table(resumen_data, colWidths=[12*cm, 6*cm])
    resumen_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('LINEBELOW', (0, 3), (-1, 3), 1, colors.black),
        ('LINEBELOW', (0, 5), (-1, 5), 1, colors.black),
    ]))
    elements.append(resumen_table)
    elements.append(Spacer(1, 0.3*cm))
    
    # Información adicional (estilo factura)
    info_adicional_data = [
        [Paragraph("<b>FORMA DE PAGO:</b>", etiqueta_style), 
         Paragraph("PENDIENTE DE DEFINIR", texto_style)],
        [Paragraph("<b>VALIDEZ:</b>", etiqueta_style), 
         Paragraph("Esta cotización es válida por 30 días a partir de la fecha de emisión.", texto_pequeno_style)],
        [Paragraph("<b>OBSERVACIONES GENERALES:</b>", etiqueta_style), 
         Paragraph("Los precios están sujetos a cambios sin previo aviso.", texto_pequeno_style)],
    ]
    
    info_adicional_table = Table(info_adicional_data, colWidths=[5*cm, 13*cm])
    info_adicional_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(info_adicional_table)
    
    # Construir el PDF
    doc.build(elements)
    
    # Obtener los bytes del PDF
    buffer.seek(0)
    return buffer.getvalue()
