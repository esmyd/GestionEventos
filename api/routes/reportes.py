"""
Rutas para reportes y métricas
"""
import csv
import io
from datetime import datetime
from flask import Blueprint, request, jsonify, Response
from modelos.evento_modelo import EventoModelo
from modelos.pago_modelo import PagoModelo
from modelos.cliente_modelo import ClienteModelo
from modelos.producto_modelo import ProductoModelo
from modelos.plan_modelo import PlanModelo
from modelos.salon_modelo import SalonModelo
from modelos.base_datos import BaseDatos
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

reportes_bp = Blueprint('reportes', __name__)
logger = obtener_logger()

evento_modelo = EventoModelo()
pago_modelo = PagoModelo()
cliente_modelo = ClienteModelo()
producto_modelo = ProductoModelo()
plan_modelo = PlanModelo()
salon_modelo = SalonModelo()
base_datos = BaseDatos()


def _columna_existe(tabla, columna):
    consulta = """
    SELECT COUNT(*) as total
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = %s
      AND COLUMN_NAME = %s
    """
    row = base_datos.obtener_uno(consulta, (tabla, columna)) or {}
    return int(row.get("total") or 0) > 0


@reportes_bp.route('/metricas', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_metricas():
    """Obtiene todas las métricas del sistema"""
    try:
        # Obtener filtros de fecha
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Obtener datos (filtrados por fecha si se proporcionan)
        if fecha_desde or fecha_hasta:
            eventos = evento_modelo.obtener_eventos_por_rango(fecha_desde, fecha_hasta)
        else:
            eventos = evento_modelo.obtener_todos_eventos()
        clientes = cliente_modelo.obtener_todos_clientes()
        productos = producto_modelo.obtener_todos_productos(solo_activos=False)
        planes = plan_modelo.obtener_todos_planes(solo_activos=False)
        salones = salon_modelo.obtener_todos_salones(solo_activos=False)
        
        # Calcular métricas de eventos
        total_eventos = len(eventos)
        eventos_confirmados = len([e for e in eventos if e.get('estado') == 'confirmado'])
        eventos_completados = len([e for e in eventos if e.get('estado') == 'completado'])
        eventos_en_proceso = len([e for e in eventos if e.get('estado') == 'en_proceso'])
        eventos_cotizacion = len([e for e in eventos if e.get('estado') == 'cotizacion'])
        eventos_cancelados = len([e for e in eventos if e.get('estado') == 'cancelado'])
        
        # Calcular métricas financieras
        total_ingresos = sum(float(e.get('total', e.get('precio_total', 0) or 0)) for e in eventos)
        total_pendiente = sum(float(e.get('saldo', e.get('saldo_pendiente', 0) or 0)) for e in eventos)
        total_cobrado = total_ingresos - total_pendiente
        porcentaje_cobrado = (total_cobrado / total_ingresos * 100) if total_ingresos > 0 else 0
        ticket_promedio = (total_ingresos / total_eventos) if total_eventos > 0 else 0
        
        # Calcular total de pagos (consulta agregada)
        total_pagos = pago_modelo.obtener_total_pagos()
        
        # Calcular métricas de clientes
        total_clientes = len(clientes)
        promedio_eventos_cliente = (total_eventos / total_clientes) if total_clientes > 0 else 0
        
        # Calcular métricas de recursos
        total_productos = len(productos)
        productos_activos = len([p for p in productos if p.get('activo', True)])
        total_planes = len(planes)
        planes_activos = len([p for p in planes if p.get('activo', True)])
        total_salones = len(salones)
        salones_activos = len([s for s in salones if s.get('activo', True)])
        
        # Calcular promedio de invitados
        total_invitados = sum(int(e.get('numero_invitados', 0) or 0) for e in eventos)
        promedio_invitados = (total_invitados / total_eventos) if total_eventos > 0 else 0

        # Métricas de notificaciones y WhatsApp (costos + segmentación)
        precio_whatsapp = 0.0
        precio_email = 0.0
        try:
            # Verificar si la tabla existe antes de consultarla
            tabla_existe = base_datos.obtener_uno(
                """
                SELECT COUNT(*) as total
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'whatsapp_metricas_config'
                """
            ) or {}
            if int(tabla_existe.get("total") or 0) > 0:
                config_costos = base_datos.obtener_uno(
                    "SELECT precio_whatsapp, precio_email, maximo_whatsapp, maximo_email FROM whatsapp_metricas_config ORDER BY id ASC LIMIT 1"
                ) or {}
                precio_whatsapp = float(config_costos.get("precio_whatsapp") or 0)
                precio_email = float(config_costos.get("precio_email") or 0)
                maximo_whatsapp = config_costos.get("maximo_whatsapp")
                maximo_email = config_costos.get("maximo_email")
            else:
                maximo_whatsapp = None
                maximo_email = None
        except Exception as e:
            logger.warning(f"No se pudo obtener configuración de costos: {str(e)}")
            precio_whatsapp = 0.0
            precio_email = 0.0
            maximo_whatsapp = None
            maximo_email = None

        # Verificar si la tabla historial_notificaciones existe
        tabla_notif_existe = base_datos.obtener_uno(
            """
            SELECT COUNT(*) as total
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'historial_notificaciones'
            """
        ) or {}
        tiene_tabla_notif = int(tabla_notif_existe.get("total") or 0) > 0
        
        tiene_costo_email = False
        tiene_costo_whatsapp = False
        if tiene_tabla_notif:
            tiene_costo_email = _columna_existe("historial_notificaciones", "costo_email")
            tiene_costo_whatsapp = _columna_existe("historial_notificaciones", "costo_whatsapp")
        
        # Verificar si la tabla whatsapp_mensajes existe (necesario para calcular notificaciones WhatsApp)
        tabla_chat_existe = base_datos.obtener_uno(
            """
            SELECT COUNT(*) as total
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'whatsapp_mensajes'
            """
        ) or {}
        tiene_tabla_chat = int(tabla_chat_existe.get("total") or 0) > 0
        
        # Construir filtros de fecha para consultas de notificaciones
        filtro_fecha_notif = "WHERE enviado = TRUE"
        filtro_fecha_wa = ""
        if fecha_desde and fecha_hasta:
            filtro_fecha_notif = f"WHERE enviado = TRUE AND fecha_envio BETWEEN '{fecha_desde}' AND '{fecha_hasta} 23:59:59'"
            filtro_fecha_wa = f"WHERE fecha_creacion BETWEEN '{fecha_desde}' AND '{fecha_hasta} 23:59:59'"
        elif fecha_desde:
            filtro_fecha_notif = f"WHERE enviado = TRUE AND fecha_envio >= '{fecha_desde}'"
            filtro_fecha_wa = f"WHERE fecha_creacion >= '{fecha_desde}'"
        elif fecha_hasta:
            filtro_fecha_notif = f"WHERE enviado = TRUE AND fecha_envio <= '{fecha_hasta} 23:59:59'"
            filtro_fecha_wa = f"WHERE fecha_creacion <= '{fecha_hasta} 23:59:59'"

        notif_totales = {}
        if tiene_tabla_notif:
            try:
                consulta_notif = f"""
                SELECT
                  SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
                  SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out,
                  SUM(COALESCE(costo_email, 0)) as costo_email_total,
                  SUM(COALESCE(costo_whatsapp, 0)) as costo_whatsapp_total
                FROM historial_notificaciones
                {filtro_fecha_notif}
                """ if (tiene_costo_email or tiene_costo_whatsapp) else f"""
                SELECT
                  SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
                  SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out
                FROM historial_notificaciones
                {filtro_fecha_notif}
                """
                notif_totales = base_datos.obtener_uno(consulta_notif) or {}
            except Exception as e:
                logger.warning(f"Error al obtener totales de notificaciones: {str(e)}")
                notif_totales = {}
        notif_email = int(notif_totales.get("email_out") or 0)
        # WhatsApp notificaciones: contar desde whatsapp_mensajes (origen='sistema' o 'campana')
        # NO desde historial_notificaciones para evitar discrepancias con el panel
        notif_whatsapp = 0
        if tiene_tabla_chat:
            try:
                consulta_base = """
                SELECT
                  SUM(CASE WHEN direccion='out' AND (origen='sistema' OR origen='campana') THEN 1 ELSE 0 END) as whatsapp_notificaciones
                FROM whatsapp_mensajes
                """
                if filtro_fecha_wa:
                    consulta_notif_whatsapp = consulta_base + " " + filtro_fecha_wa
                else:
                    consulta_notif_whatsapp = consulta_base
                notif_whatsapp_data = base_datos.obtener_uno(consulta_notif_whatsapp) or {}
                notif_whatsapp = int(notif_whatsapp_data.get("whatsapp_notificaciones") or 0)
            except Exception as e:
                logger.warning(f"Error al obtener notificaciones WhatsApp desde whatsapp_mensajes: {str(e)}")
                # Fallback: usar historial_notificaciones
                notif_whatsapp = int(notif_totales.get("whatsapp_out") or 0)

        notif_por_tipo = []
        if tiene_tabla_notif:
            try:
                consulta_por_tipo = f"""
                SELECT tipo_notificacion,
                  SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
                  SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out,
                  SUM(COALESCE(costo_email, 0)) as costo_email_total,
                  SUM(COALESCE(costo_whatsapp, 0)) as costo_whatsapp_total
                FROM historial_notificaciones
                {filtro_fecha_notif}
                GROUP BY tipo_notificacion
                ORDER BY tipo_notificacion
                """ if (tiene_costo_email or tiene_costo_whatsapp) else f"""
                SELECT tipo_notificacion,
                  SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
                  SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out
                FROM historial_notificaciones
                {filtro_fecha_notif}
                GROUP BY tipo_notificacion
                ORDER BY tipo_notificacion
                """
                notif_por_tipo = base_datos.obtener_todos(consulta_por_tipo) or []
            except Exception as e:
                logger.warning(f"Error al obtener notificaciones por tipo: {str(e)}")
                notif_por_tipo = []
        por_tipo = []
        for fila in notif_por_tipo:
            email_out = int(fila.get("email_out") or 0)
            whatsapp_out = int(fila.get("whatsapp_out") or 0)
            # Convertir valores Decimal a float de forma segura
            costo_email_val = fila.get("costo_email_total") if (tiene_costo_email and fila.get("costo_email_total") is not None) else None
            costo_whatsapp_val = fila.get("costo_whatsapp_total") if (tiene_costo_whatsapp and fila.get("costo_whatsapp_total") is not None) else None
            por_tipo.append(
                {
                    "tipo_notificacion": fila.get("tipo_notificacion"),
                    "email_out": email_out,
                    "whatsapp_out": whatsapp_out,
                    "total": email_out + whatsapp_out,
                    "costo_email": float(costo_email_val) if costo_email_val is not None else float(email_out * precio_email),
                    "costo_whatsapp": float(costo_whatsapp_val) if costo_whatsapp_val is not None else float(whatsapp_out * precio_whatsapp),
                }
            )

        tiene_costo_chat = False
        chat_totales = {}
        if tiene_tabla_chat:
            tiene_costo_chat = _columna_existe("whatsapp_mensajes", "costo_total")
            try:
                consulta_base = """
                SELECT
                  SUM(CASE WHEN direccion='in' THEN 1 ELSE 0 END) as whatsapp_in,
                  SUM(CASE WHEN direccion='out' THEN 1 ELSE 0 END) as whatsapp_out,
                  SUM(CASE WHEN direccion='out' AND origen='bot' THEN 1 ELSE 0 END) as whatsapp_bot,
                  SUM(CASE WHEN direccion='out' AND origen='humano' THEN 1 ELSE 0 END) as whatsapp_humano
                  {costo}
                FROM whatsapp_mensajes
                {filtro}
                """.format(
                    costo=", SUM(COALESCE(costo_total, 0)) as costo_total" if tiene_costo_chat else "",
                    filtro=filtro_fecha_wa if filtro_fecha_wa else ""
                )
                chat_totales = base_datos.obtener_uno(consulta_base) or {}
            except Exception as e:
                logger.warning(f"Error al obtener totales de chat: {str(e)}")
                chat_totales = {}
        whatsapp_in = int(chat_totales.get("whatsapp_in") or 0)
        whatsapp_out = int(chat_totales.get("whatsapp_out") or 0)
        whatsapp_bot = int(chat_totales.get("whatsapp_bot") or 0)
        whatsapp_humano = int(chat_totales.get("whatsapp_humano") or 0)

        # Convertir valores Decimal a float de forma segura
        # Email: solo desde historial_notificaciones (no hay duplicación)
        costo_email_val = notif_totales.get("costo_email_total") if (tiene_costo_email and notif_totales.get("costo_email_total") is not None) else None
        costo_notif_email = float(costo_email_val) if costo_email_val is not None else float(notif_email * precio_email)
        
        # WhatsApp: usar solo whatsapp_mensajes.costo_total (ya incluye chat + sistema)
        # NO sumar con historial_notificaciones para evitar duplicación
        costo_chat_whatsapp = float(chat_totales.get("costo_total") or 0) if (tiene_costo_chat and chat_totales.get("costo_total") is not None) else 0.0
        # Si no hay costo almacenado en whatsapp_mensajes, calcular desde historial_notificaciones como fallback
        if costo_chat_whatsapp == 0:
            costo_whatsapp_val = notif_totales.get("costo_whatsapp_total") if (tiene_costo_whatsapp and notif_totales.get("costo_whatsapp_total") is not None) else None
            costo_chat_whatsapp = float(costo_whatsapp_val) if costo_whatsapp_val is not None else float(notif_whatsapp * precio_whatsapp)
        
        costo_whatsapp_total = float(costo_chat_whatsapp)
        costo_notif_total = float(costo_notif_email + costo_whatsapp_total)
        
        metricas = {
            'eventos': {
                'total': total_eventos,
                'confirmados': eventos_confirmados,
                'completados': eventos_completados,
                'en_proceso': eventos_en_proceso,
                'cotizacion': eventos_cotizacion,
                'cancelados': eventos_cancelados
            },
            'financiero': {
                'total_ingresos': float(total_ingresos),
                'total_pendiente': float(total_pendiente),
                'total_cobrado': float(total_cobrado),
                'porcentaje_cobrado': float(porcentaje_cobrado),
                'ticket_promedio': float(ticket_promedio),
                'total_pagos': total_pagos
            },
            'clientes': {
                'total': total_clientes,
                'promedio_eventos_cliente': float(promedio_eventos_cliente)
            },
            'recursos': {
                'productos': {
                    'total': total_productos,
                    'activos': productos_activos
                },
                'planes': {
                    'total': total_planes,
                    'activos': planes_activos
                },
                'salones': {
                    'total': total_salones,
                    'activos': salones_activos
                }
            },
            'estadisticas': {
                'promedio_invitados': float(promedio_invitados)
            },
            'notificaciones': {
                'precio_email': float(precio_email),
                'precio_whatsapp': float(precio_whatsapp),
                'maximo_email': int(maximo_email) if maximo_email is not None else None,
                'maximo_whatsapp': int(maximo_whatsapp) if maximo_whatsapp is not None else None,
                'envios': {
                    'email': notif_email,
                    'whatsapp': notif_whatsapp
                },
                'costos': {
                    'email': costo_notif_email,
                    'whatsapp': costo_whatsapp_total,  # Usar costo total desde whatsapp_mensajes (incluye chat + sistema)
                    'total': float(costo_notif_email + costo_whatsapp_total)
                },
                'por_tipo': por_tipo,
                'whatsapp_chat': {
                    'inbound': whatsapp_in,
                    'outbound': whatsapp_out,
                    'bot': whatsapp_bot,
                    'humano': whatsapp_humano
                },
                'whatsapp_total_out': whatsapp_out,  # Solo desde whatsapp_mensajes (ya incluye notificaciones)
                'whatsapp_total_cost': costo_whatsapp_total,
                'email_total_cost': costo_notif_email
            }
        }
        
        return jsonify({'metricas': metricas}), 200
    except Exception as e:
        logger.error(f"Error al obtener métricas: {str(e)}")
        return jsonify({'error': 'Error al obtener métricas'}), 500


@reportes_bp.route('/eventos-por-estado', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def eventos_por_estado():
    """Obtiene resumen de eventos por estado"""
    try:
        eventos = evento_modelo.obtener_todos_eventos()
        
        estados = {}
        for evento in eventos:
            estado = evento.get('estado', 'sin_estado')
            if estado not in estados:
                estados[estado] = {
                    'cantidad': 0,
                    'total_ingresos': 0.0,
                    'eventos': []
                }
            estados[estado]['cantidad'] += 1
            estados[estado]['total_ingresos'] += float(evento.get('total', evento.get('precio_total', 0) or 0))
            estados[estado]['eventos'].append(evento.get('id_evento') or evento.get('id'))
        
        total_eventos = len(eventos)
        for estado in estados:
            estados[estado]['porcentaje'] = (estados[estado]['cantidad'] / total_eventos * 100) if total_eventos > 0 else 0
            # No incluir lista de eventos en la respuesta para reducir tamaño
            del estados[estado]['eventos']
        
        return jsonify({'resumen': estados, 'total_eventos': total_eventos}), 200
    except Exception as e:
        logger.error(f"Error al obtener eventos por estado: {str(e)}")
        return jsonify({'error': 'Error al obtener eventos por estado'}), 500


@reportes_bp.route('/resumen-financiero', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def resumen_financiero():
    """Obtiene resumen financiero del sistema"""
    try:
        eventos = evento_modelo.obtener_todos_eventos()
        
        total_ingresos = sum(float(e.get('total', e.get('precio_total', 0) or 0)) for e in eventos)
        total_pendiente = sum(float(e.get('saldo', e.get('saldo_pendiente', 0) or 0)) for e in eventos)
        total_cobrado = total_ingresos - total_pendiente
        
        # Calcular total pagado verificado (consulta agregada)
        total_pagado_verificado = pago_modelo.obtener_total_pagado_global()
        
        resumen = {
            'total_ingresos': float(total_ingresos),
            'total_pendiente': float(total_pendiente),
            'total_cobrado': float(total_cobrado),
            'total_pagado_verificado': float(total_pagado_verificado),
            'porcentaje_cobrado': float((total_cobrado / total_ingresos * 100) if total_ingresos > 0 else 0),
            'total_eventos': len(eventos),
            'ticket_promedio': float((total_ingresos / len(eventos)) if len(eventos) > 0 else 0)
        }
        
        return jsonify({'resumen_financiero': resumen}), 200
    except Exception as e:
        logger.error(f"Error al obtener resumen financiero: {str(e)}")
        return jsonify({'error': 'Error al obtener resumen financiero'}), 500


@reportes_bp.route('/pagos-por-cuenta', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def pagos_por_cuenta():
    """Obtiene resumen de pagos agrupados por cuenta destino"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si existe la columna cuenta_id en pagos
        if not _columna_existe('pagos', 'cuenta_id'):
            return jsonify({
                'pagos_por_cuenta': [],
                'total_general': 0,
                'mensaje': 'La columna cuenta_id no existe en la tabla pagos'
            }), 200
        
        # Construir consulta
        consulta = """
        SELECT 
            c.id as cuenta_id,
            c.nombre as nombre_cuenta,
            c.tipo as tipo_cuenta,
            c.numero_cuenta,
            COUNT(p.id) as total_pagos,
            COALESCE(SUM(CASE WHEN p.tipo_pago != 'reembolso' THEN p.monto ELSE 0 END), 0) as total_ingresos,
            COALESCE(SUM(CASE WHEN p.tipo_pago = 'reembolso' THEN p.monto ELSE 0 END), 0) as total_reembolsos,
            COALESCE(SUM(CASE WHEN p.tipo_pago != 'reembolso' THEN p.monto ELSE -p.monto END), 0) as total_neto
        FROM cuentas c
        LEFT JOIN pagos p ON c.id = p.cuenta_id
        """
        
        condiciones = ["c.activo = 1"]
        parametros = []
        
        # Filtrar por estado aprobado si existe la columna
        if _columna_existe('pagos', 'estado_pago'):
            condiciones.append("(p.estado_pago = 'aprobado' OR p.estado_pago IS NULL OR p.id IS NULL)")
        
        if fecha_desde:
            condiciones.append("(p.fecha_pago >= %s OR p.id IS NULL)")
            parametros.append(fecha_desde)
        
        if fecha_hasta:
            condiciones.append("(p.fecha_pago <= %s OR p.id IS NULL)")
            parametros.append(fecha_hasta)
        
        if condiciones:
            consulta += " WHERE " + " AND ".join(condiciones)
        
        consulta += " GROUP BY c.id, c.nombre, c.tipo, c.numero_cuenta ORDER BY total_neto DESC"
        
        resultados = base_datos.obtener_todos(consulta, tuple(parametros) if parametros else None)
        
        # Calcular totales
        total_general = sum(float(r.get('total_neto', 0) or 0) for r in resultados)
        total_ingresos = sum(float(r.get('total_ingresos', 0) or 0) for r in resultados)
        total_reembolsos = sum(float(r.get('total_reembolsos', 0) or 0) for r in resultados)
        
        # Convertir a formato serializable
        pagos_cuenta = []
        for r in resultados:
            pagos_cuenta.append({
                'cuenta_id': r.get('cuenta_id'),
                'nombre_cuenta': r.get('nombre_cuenta'),
                'tipo_cuenta': r.get('tipo_cuenta'),
                'numero_cuenta': r.get('numero_cuenta'),
                'total_pagos': int(r.get('total_pagos', 0) or 0),
                'total_ingresos': float(r.get('total_ingresos', 0) or 0),
                'total_reembolsos': float(r.get('total_reembolsos', 0) or 0),
                'total_neto': float(r.get('total_neto', 0) or 0),
            })
        
        return jsonify({
            'pagos_por_cuenta': pagos_cuenta,
            'total_general': float(total_general),
            'total_ingresos': float(total_ingresos),
            'total_reembolsos': float(total_reembolsos),
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener pagos por cuenta: {str(e)}")
        return jsonify({'error': 'Error al obtener pagos por cuenta'}), 500


# ============================================================================
# ENDPOINTS DE DESCARGA DE REPORTES
# ============================================================================

def _generar_csv(datos, columnas, nombre_archivo):
    """Genera un archivo CSV para descarga con codificación UTF-8 BOM (para Excel)"""
    output = io.StringIO()
    
    # Agregar BOM UTF-8 para que Excel reconozca correctamente los caracteres especiales
    output.write('\ufeff')
    
    writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
    
    # Escribir encabezados
    writer.writerow(columnas)
    
    # Escribir datos
    for fila in datos:
        row = []
        for col in columnas:
            valor = fila.get(col, '')
            if valor is None:
                valor = ''
            elif isinstance(valor, datetime):
                valor = valor.strftime('%Y-%m-%d %H:%M:%S')
            row.append(str(valor))
        writer.writerow(row)
    
    output.seek(0)
    # Codificar a bytes con UTF-8
    csv_content = output.getvalue().encode('utf-8')
    
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename={nombre_archivo}',
            'Content-Type': 'text/csv; charset=utf-8-sig'
        }
    )


@reportes_bp.route('/descargar/eventos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def descargar_eventos():
    """Descarga reporte de eventos en CSV"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        if fecha_desde or fecha_hasta:
            eventos = evento_modelo.obtener_eventos_por_rango(fecha_desde, fecha_hasta)
        else:
            eventos = evento_modelo.obtener_todos_eventos()
        
        columnas = [
            'id_evento', 'nombre_evento', 'nombre_cliente', 'tipo_evento',
            'fecha_evento', 'hora_inicio', 'hora_fin', 'numero_invitados',
            'nombre_salon', 'nombre_plan', 'estado', 'total', 'saldo',
            'fecha_creacion', 'observaciones'
        ]
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(eventos, columnas, f'reporte_eventos_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de eventos: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500


@reportes_bp.route('/descargar/inventario', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def descargar_inventario():
    """Descarga reporte de inventario en CSV"""
    try:
        productos = producto_modelo.obtener_todos_productos(solo_activos=False)
        
        columnas = [
            'id', 'nombre', 'descripcion', 'categoria_nombre', 'precio',
            'stock_actual', 'stock_minimo', 'unidad_medida', 'activo',
            'fecha_creacion'
        ]
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(productos, columnas, f'reporte_inventario_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de inventario: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500


@reportes_bp.route('/descargar/cardex', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def descargar_cardex():
    """Descarga reporte de movimientos de inventario (cardex) en CSV"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si existe la tabla de movimientos de inventario
        tabla_existe = base_datos.obtener_uno(
            """
            SELECT COUNT(*) as total
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'movimientos_inventario'
            """
        ) or {}
        
        if int(tabla_existe.get("total") or 0) == 0:
            return jsonify({'error': 'No existe la tabla de movimientos de inventario'}), 404
        
        # Construir consulta con filtros de fecha
        consulta = """
        SELECT 
            mi.id,
            mi.producto_id,
            p.nombre as producto_nombre,
            mi.tipo_movimiento,
            mi.cantidad,
            mi.stock_anterior,
            mi.stock_nuevo,
            mi.motivo,
            mi.referencia_tipo,
            mi.referencia_id,
            u.nombre_completo as usuario_nombre,
            mi.fecha_movimiento
        FROM movimientos_inventario mi
        LEFT JOIN productos p ON mi.producto_id = p.id
        LEFT JOIN usuarios u ON mi.usuario_id = u.id
        WHERE 1=1
        """
        params = []
        
        if fecha_desde:
            consulta += " AND mi.fecha_movimiento >= %s"
            params.append(fecha_desde)
        if fecha_hasta:
            consulta += " AND mi.fecha_movimiento <= %s"
            params.append(fecha_hasta + ' 23:59:59')
        
        consulta += " ORDER BY mi.fecha_movimiento DESC"
        
        movimientos = base_datos.obtener_todos(consulta, tuple(params) if params else None) or []
        
        columnas = [
            'id', 'producto_id', 'producto_nombre', 'tipo_movimiento',
            'cantidad', 'stock_anterior', 'stock_nuevo', 'motivo',
            'referencia_tipo', 'referencia_id', 'usuario_nombre', 'fecha_movimiento'
        ]
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(movimientos, columnas, f'reporte_cardex_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de cardex: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500


@reportes_bp.route('/descargar/notificaciones', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def descargar_notificaciones():
    """Descarga reporte de historial de notificaciones en CSV"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si existe la tabla
        tabla_existe = base_datos.obtener_uno(
            """
            SELECT COUNT(*) as total
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'historial_notificaciones'
            """
        ) or {}
        
        if int(tabla_existe.get("total") or 0) == 0:
            return jsonify({'error': 'No existe la tabla de historial de notificaciones'}), 404
        
        # Construir consulta con filtros de fecha
        # Verificar si existen columnas de costo
        tiene_costo_email = base_datos.obtener_uno("""
            SELECT COUNT(*) as total FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'historial_notificaciones' 
            AND column_name = 'costo_email'
        """) or {}
        tiene_costo_whatsapp = base_datos.obtener_uno("""
            SELECT COUNT(*) as total FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'historial_notificaciones' 
            AND column_name = 'costo_whatsapp'
        """) or {}
        
        costo_cols = ""
        if int(tiene_costo_email.get("total") or 0) > 0:
            costo_cols += ", hn.costo_email"
        if int(tiene_costo_whatsapp.get("total") or 0) > 0:
            costo_cols += ", hn.costo_whatsapp"
        
        consulta = f"""
        SELECT 
            hn.id,
            hn.id_evento,
            e.nombre_evento,
            c.nombre_completo as cliente_nombre,
            hn.tipo_notificacion,
            hn.canal,
            hn.destinatario,
            hn.enviado,
            hn.fecha_envio,
            hn.error
            {costo_cols}
        FROM historial_notificaciones hn
        LEFT JOIN eventos e ON hn.id_evento = e.id_evento
        LEFT JOIN clientes cl ON e.id_cliente = cl.id
        LEFT JOIN usuarios c ON cl.usuario_id = c.id
        WHERE 1=1
        """
        params = []
        
        if fecha_desde:
            consulta += " AND hn.fecha_envio >= %s"
            params.append(fecha_desde)
        if fecha_hasta:
            consulta += " AND hn.fecha_envio <= %s"
            params.append(fecha_hasta + ' 23:59:59')
        
        consulta += " ORDER BY hn.fecha_envio DESC"
        
        notificaciones = base_datos.obtener_todos(consulta, tuple(params) if params else None) or []
        
        columnas = [
            'id', 'id_evento', 'nombre_evento', 'cliente_nombre',
            'tipo_notificacion', 'canal', 'destinatario', 'enviado',
            'fecha_envio', 'error'
        ]
        if int(tiene_costo_email.get("total") or 0) > 0:
            columnas.append('costo_email')
        if int(tiene_costo_whatsapp.get("total") or 0) > 0:
            columnas.append('costo_whatsapp')
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(notificaciones, columnas, f'reporte_notificaciones_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de notificaciones: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500


@reportes_bp.route('/descargar/clientes', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def descargar_clientes():
    """Descarga reporte de clientes en CSV"""
    try:
        clientes = cliente_modelo.obtener_todos_clientes()
        
        columnas = [
            'id', 'nombre_completo', 'email', 'telefono',
            'documento_identidad', 'direccion', 'fecha_registro'
        ]
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(clientes, columnas, f'reporte_clientes_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de clientes: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500


@reportes_bp.route('/descargar/pagos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def descargar_pagos():
    """Descarga reporte de pagos en CSV"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si existe la columna cuenta_id
        tiene_cuenta = _columna_existe('pagos', 'cuenta_id')
        
        if tiene_cuenta:
            consulta = """
            SELECT 
                p.id,
                p.id_evento,
                e.nombre_evento,
                c.nombre_completo as cliente_nombre,
                p.monto,
                p.tipo_pago,
                p.metodo_pago,
                cu.nombre as cuenta_destino,
                cu.tipo as tipo_cuenta,
                cu.numero_cuenta,
                p.numero_referencia as referencia,
                p.fecha_pago,
                p.estado_pago,
                p.observaciones,
                u.nombre_completo as registrado_por
            FROM pagos p
            LEFT JOIN eventos e ON p.id_evento = e.id_evento
            LEFT JOIN clientes cl ON e.id_cliente = cl.id
            LEFT JOIN usuarios c ON cl.usuario_id = c.id
            LEFT JOIN usuarios u ON p.usuario_registro_id = u.id
            LEFT JOIN cuentas cu ON p.cuenta_id = cu.id
            WHERE 1=1
            """
        else:
            consulta = """
            SELECT 
                p.id,
                p.id_evento,
                e.nombre_evento,
                c.nombre_completo as cliente_nombre,
                p.monto,
                p.tipo_pago,
                p.metodo_pago,
                p.numero_referencia as referencia,
                p.fecha_pago,
                p.observaciones,
                u.nombre_completo as registrado_por
            FROM pagos p
            LEFT JOIN eventos e ON p.id_evento = e.id_evento
            LEFT JOIN clientes cl ON e.id_cliente = cl.id
            LEFT JOIN usuarios c ON cl.usuario_id = c.id
            LEFT JOIN usuarios u ON p.usuario_registro_id = u.id
            WHERE 1=1
            """
        params = []
        
        if fecha_desde:
            consulta += " AND p.fecha_pago >= %s"
            params.append(fecha_desde)
        if fecha_hasta:
            consulta += " AND p.fecha_pago <= %s"
            params.append(fecha_hasta + ' 23:59:59')
        
        consulta += " ORDER BY p.fecha_pago DESC"
        
        pagos = base_datos.obtener_todos(consulta, tuple(params) if params else None) or []
        
        if tiene_cuenta:
            columnas = [
                'id', 'id_evento', 'nombre_evento', 'cliente_nombre',
                'monto', 'tipo_pago', 'metodo_pago', 'cuenta_destino',
                'tipo_cuenta', 'numero_cuenta', 'referencia',
                'fecha_pago', 'estado_pago', 'observaciones', 'registrado_por'
            ]
        else:
            columnas = [
                'id', 'id_evento', 'nombre_evento', 'cliente_nombre',
                'monto', 'tipo_pago', 'metodo_pago', 'referencia',
                'fecha_pago', 'observaciones', 'registrado_por'
            ]
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(pagos, columnas, f'reporte_pagos_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de pagos: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500


@reportes_bp.route('/resumen-danos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_resumen_danos():
    """Obtiene resumen de daños para el dashboard"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si las columnas de daños existen
        if not _columna_existe('eventos', 'tiene_danos'):
            return jsonify({'resumen': None}), 200
        
        where_fecha = ""
        params = []
        if fecha_desde:
            where_fecha += " AND e.fecha_finalizacion >= %s"
            params.append(fecha_desde)
        if fecha_hasta:
            where_fecha += " AND e.fecha_finalizacion <= %s"
            params.append(fecha_hasta + ' 23:59:59')
        
        consulta = f"""
        SELECT 
            COUNT(*) as total_eventos_con_danos,
            COALESCE(SUM(e.costo_danos), 0) as costo_total_danos,
            COALESCE(SUM(CASE WHEN e.cobrar_danos = TRUE THEN e.costo_danos ELSE 0 END), 0) as total_a_cobrar,
            COALESCE(SUM(CASE WHEN e.cobrar_danos = FALSE THEN e.costo_danos ELSE 0 END), 0) as total_asumido_empresa,
            COALESCE(SUM(COALESCE(e.monto_pagado_danos, 0)), 0) as total_pagado,
            COALESCE(SUM(CASE WHEN e.cobrar_danos = TRUE THEN (e.costo_danos - COALESCE(e.monto_pagado_danos, 0)) ELSE 0 END), 0) as total_pendiente,
            COUNT(CASE WHEN e.cobrar_danos = TRUE AND (e.danos_pagados = FALSE OR e.danos_pagados IS NULL) THEN 1 END) as eventos_pendientes_pago
        FROM eventos e
        WHERE e.tiene_danos = TRUE
        {where_fecha}
        """
        resumen = base_datos.obtener_uno(consulta, tuple(params) if params else None) or {}
        
        # Convertir Decimals a float para serialización JSON
        for key in resumen:
            if hasattr(resumen[key], '__float__'):
                resumen[key] = float(resumen[key])
        
        return jsonify({'resumen': resumen}), 200
    except Exception as e:
        logger.error(f"Error al obtener resumen de daños: {str(e)}")
        return jsonify({'error': 'Error al obtener resumen'}), 500


@reportes_bp.route('/resumen-calificaciones', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_resumen_calificaciones():
    """Obtiene resumen de calificaciones para el dashboard"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si las columnas de calificaciones existen
        if not _columna_existe('eventos', 'calificacion_cliente'):
            return jsonify({'resumen': None}), 200
        
        where_fecha = ""
        params = []
        if fecha_desde:
            where_fecha += " AND e.fecha_calificacion >= %s"
            params.append(fecha_desde)
        if fecha_hasta:
            where_fecha += " AND e.fecha_calificacion <= %s"
            params.append(fecha_hasta + ' 23:59:59')
        
        consulta = f"""
        SELECT 
            COUNT(e.calificacion_cliente) as total_calificaciones,
            COALESCE(AVG(e.calificacion_cliente), 0) as promedio_calificacion,
            COUNT(CASE WHEN e.calificacion_cliente = 5 THEN 1 END) as calificaciones_5,
            COUNT(CASE WHEN e.calificacion_cliente = 4 THEN 1 END) as calificaciones_4,
            COUNT(CASE WHEN e.calificacion_cliente = 3 THEN 1 END) as calificaciones_3,
            COUNT(CASE WHEN e.calificacion_cliente = 2 THEN 1 END) as calificaciones_2,
            COUNT(CASE WHEN e.calificacion_cliente = 1 THEN 1 END) as calificaciones_1
        FROM eventos e
        WHERE e.calificacion_cliente IS NOT NULL
        {where_fecha}
        """
        resumen = base_datos.obtener_uno(consulta, tuple(params) if params else None) or {}
        
        # Obtener eventos completados sin calificación
        consulta_pendientes = """
        SELECT COUNT(*) as pendientes_calificar
        FROM eventos e
        WHERE e.estado = 'completado' 
        AND e.calificacion_cliente IS NULL
        """
        pendientes = base_datos.obtener_uno(consulta_pendientes) or {}
        resumen['pendientes_calificar'] = pendientes.get('pendientes_calificar', 0)
        
        # Convertir Decimals a float para serialización JSON
        for key in resumen:
            if hasattr(resumen[key], '__float__'):
                resumen[key] = float(resumen[key])
        
        return jsonify({'resumen': resumen}), 200
    except Exception as e:
        logger.error(f"Error al obtener resumen de calificaciones: {str(e)}")
        return jsonify({'error': 'Error al obtener resumen'}), 500


@reportes_bp.route('/descargar/danos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def descargar_danos():
    """Descarga reporte de daños en CSV"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si las columnas de daños existen
        if not _columna_existe('eventos', 'tiene_danos'):
            return jsonify({'error': 'Campos de daños no configurados'}), 400
        
        consulta = """
        SELECT 
            e.id_evento,
            e.nombre_evento,
            e.fecha_evento,
            e.fecha_finalizacion,
            u.nombre_completo as cliente_nombre,
            u.telefono as cliente_telefono,
            e.descripcion_danos,
            e.costo_danos,
            CASE WHEN e.cobrar_danos = TRUE THEN 'Si' ELSE 'No' END as se_cobra_cliente,
            CASE WHEN e.danos_pagados = TRUE THEN 'Pagado' ELSE 'Pendiente' END as estado_pago,
            e.monto_pagado_danos,
            (e.costo_danos - COALESCE(e.monto_pagado_danos, 0)) as saldo_danos,
            e.fecha_pago_danos,
            e.metodo_pago_danos,
            e.observaciones_pago_danos
        FROM eventos e
        LEFT JOIN clientes c ON e.id_cliente = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE e.tiene_danos = TRUE
        """
        params = []
        
        if fecha_desde:
            consulta += " AND e.fecha_finalizacion >= %s"
            params.append(fecha_desde)
        if fecha_hasta:
            consulta += " AND e.fecha_finalizacion <= %s"
            params.append(fecha_hasta + ' 23:59:59')
        
        consulta += " ORDER BY e.fecha_finalizacion DESC"
        
        danos = base_datos.obtener_todos(consulta, tuple(params) if params else None) or []
        
        columnas = [
            'id_evento', 'nombre_evento', 'fecha_evento', 'fecha_finalizacion',
            'cliente_nombre', 'cliente_telefono', 'descripcion_danos', 'costo_danos',
            'se_cobra_cliente', 'estado_pago', 'monto_pagado_danos', 'saldo_danos',
            'fecha_pago_danos', 'metodo_pago_danos', 'observaciones_pago_danos'
        ]
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(danos, columnas, f'reporte_danos_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de daños: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500


@reportes_bp.route('/descargar/calificaciones', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def descargar_calificaciones():
    """Descarga reporte de calificaciones en CSV"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Verificar si las columnas de calificaciones existen
        if not _columna_existe('eventos', 'calificacion_cliente'):
            return jsonify({'error': 'Campos de calificaciones no configurados'}), 400
        
        consulta = """
        SELECT 
            e.id_evento,
            e.nombre_evento,
            e.fecha_evento,
            e.fecha_finalizacion,
            u.nombre_completo as cliente_nombre,
            u.telefono as cliente_telefono,
            u.email as cliente_email,
            e.calificacion_cliente,
            e.observaciones_calificacion,
            e.fecha_calificacion,
            e.total as monto_evento,
            CASE 
                WHEN e.calificacion_cliente = 5 THEN 'Excelente'
                WHEN e.calificacion_cliente = 4 THEN 'Muy bueno'
                WHEN e.calificacion_cliente = 3 THEN 'Bueno'
                WHEN e.calificacion_cliente = 2 THEN 'Regular'
                WHEN e.calificacion_cliente = 1 THEN 'Malo'
                ELSE 'Sin calificar'
            END as nivel_satisfaccion
        FROM eventos e
        LEFT JOIN clientes c ON e.id_cliente = c.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE e.estado = 'completado'
        """
        params = []
        
        if fecha_desde:
            consulta += " AND e.fecha_calificacion >= %s"
            params.append(fecha_desde)
        if fecha_hasta:
            consulta += " AND e.fecha_calificacion <= %s"
            params.append(fecha_hasta + ' 23:59:59')
        
        consulta += " ORDER BY e.fecha_calificacion DESC, e.fecha_finalizacion DESC"
        
        calificaciones = base_datos.obtener_todos(consulta, tuple(params) if params else None) or []
        
        columnas = [
            'id_evento', 'nombre_evento', 'fecha_evento', 'fecha_finalizacion',
            'cliente_nombre', 'cliente_telefono', 'cliente_email', 'calificacion_cliente',
            'nivel_satisfaccion', 'observaciones_calificacion', 'fecha_calificacion', 'monto_evento'
        ]
        
        fecha_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        return _generar_csv(calificaciones, columnas, f'reporte_calificaciones_{fecha_str}.csv')
    except Exception as e:
        logger.error(f"Error al descargar reporte de calificaciones: {str(e)}")
        return jsonify({'error': 'Error al generar reporte'}), 500
