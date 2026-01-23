"""
Rutas para reportes y métricas
"""
from flask import Blueprint, request, jsonify
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
        # Obtener datos
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
        config_costos = base_datos.obtener_uno(
            "SELECT precio_whatsapp, precio_email FROM whatsapp_metricas_config ORDER BY id ASC LIMIT 1"
        ) or {}
        precio_whatsapp = float(config_costos.get("precio_whatsapp") or 0)
        precio_email = float(config_costos.get("precio_email") or 0)

        tiene_costo_email = _columna_existe("historial_notificaciones", "costo_email")
        tiene_costo_whatsapp = _columna_existe("historial_notificaciones", "costo_whatsapp")
        notif_totales = base_datos.obtener_uno(
            """
            SELECT
              SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
              SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out,
              SUM(COALESCE(costo_email, 0)) as costo_email_total,
              SUM(COALESCE(costo_whatsapp, 0)) as costo_whatsapp_total
            FROM historial_notificaciones
            WHERE enviado = TRUE
            """
            if (tiene_costo_email or tiene_costo_whatsapp)
            else
            """
            SELECT
              SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
              SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out
            FROM historial_notificaciones
            WHERE enviado = TRUE
            """
        ) or {}
        notif_email = int(notif_totales.get("email_out") or 0)
        notif_whatsapp = int(notif_totales.get("whatsapp_out") or 0)

        notif_por_tipo = base_datos.obtener_todos(
            """
            SELECT tipo_notificacion,
              SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
              SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out,
              SUM(COALESCE(costo_email, 0)) as costo_email_total,
              SUM(COALESCE(costo_whatsapp, 0)) as costo_whatsapp_total
            FROM historial_notificaciones
            WHERE enviado = TRUE
            GROUP BY tipo_notificacion
            ORDER BY tipo_notificacion
            """
            if (tiene_costo_email or tiene_costo_whatsapp)
            else
            """
            SELECT tipo_notificacion,
              SUM(CASE WHEN canal='email' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as email_out,
              SUM(CASE WHEN canal='whatsapp' THEN 1 WHEN canal='ambos' THEN 1 ELSE 0 END) as whatsapp_out
            FROM historial_notificaciones
            WHERE enviado = TRUE
            GROUP BY tipo_notificacion
            ORDER BY tipo_notificacion
            """
        ) or []
        por_tipo = []
        for fila in notif_por_tipo:
            email_out = int(fila.get("email_out") or 0)
            whatsapp_out = int(fila.get("whatsapp_out") or 0)
            por_tipo.append(
                {
                    "tipo_notificacion": fila.get("tipo_notificacion"),
                    "email_out": email_out,
                    "whatsapp_out": whatsapp_out,
                    "total": email_out + whatsapp_out,
                    "costo_email": float(
                        fila.get("costo_email_total")
                        if (tiene_costo_email and fila.get("costo_email_total") is not None)
                        else email_out * precio_email
                    ),
                    "costo_whatsapp": float(
                        fila.get("costo_whatsapp_total")
                        if (tiene_costo_whatsapp and fila.get("costo_whatsapp_total") is not None)
                        else whatsapp_out * precio_whatsapp
                    ),
                }
            )

        tiene_costo_chat = _columna_existe("whatsapp_mensajes", "costo_total")
        chat_totales = base_datos.obtener_uno(
            """
            SELECT
              SUM(CASE WHEN direccion='in' THEN 1 ELSE 0 END) as whatsapp_in,
              SUM(CASE WHEN direccion='out' THEN 1 ELSE 0 END) as whatsapp_out,
              SUM(CASE WHEN direccion='out' AND origen='bot' THEN 1 ELSE 0 END) as whatsapp_bot,
              SUM(CASE WHEN direccion='out' AND origen='humano' THEN 1 ELSE 0 END) as whatsapp_humano,
              SUM(COALESCE(costo_total, 0)) as costo_total
            FROM whatsapp_mensajes
            """
            if tiene_costo_chat
            else
            """
            SELECT
              SUM(CASE WHEN direccion='in' THEN 1 ELSE 0 END) as whatsapp_in,
              SUM(CASE WHEN direccion='out' THEN 1 ELSE 0 END) as whatsapp_out,
              SUM(CASE WHEN direccion='out' AND origen='bot' THEN 1 ELSE 0 END) as whatsapp_bot,
              SUM(CASE WHEN direccion='out' AND origen='humano' THEN 1 ELSE 0 END) as whatsapp_humano
            FROM whatsapp_mensajes
            """
        ) or {}
        whatsapp_in = int(chat_totales.get("whatsapp_in") or 0)
        whatsapp_out = int(chat_totales.get("whatsapp_out") or 0)
        whatsapp_bot = int(chat_totales.get("whatsapp_bot") or 0)
        whatsapp_humano = int(chat_totales.get("whatsapp_humano") or 0)

        costo_notif_email = float(
            notif_totales.get("costo_email_total")
            if (tiene_costo_email and notif_totales.get("costo_email_total") is not None)
            else notif_email * precio_email
        )
        costo_notif_whatsapp = float(
            notif_totales.get("costo_whatsapp_total")
            if (tiene_costo_whatsapp and notif_totales.get("costo_whatsapp_total") is not None)
            else notif_whatsapp * precio_whatsapp
        )
        costo_notif_total = float(costo_notif_email + costo_notif_whatsapp)
        costo_whatsapp_total = float(
            (chat_totales.get("costo_total") if tiene_costo_chat else 0) + costo_notif_whatsapp
        )
        
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
                'envios': {
                    'email': notif_email,
                    'whatsapp': notif_whatsapp
                },
                'costos': {
                    'email': costo_notif_email,
                    'whatsapp': costo_notif_whatsapp,
                    'total': costo_notif_total
                },
                'por_tipo': por_tipo,
                'whatsapp_chat': {
                    'inbound': whatsapp_in,
                    'outbound': whatsapp_out,
                    'bot': whatsapp_bot,
                    'humano': whatsapp_humano
                },
                'whatsapp_total_out': notif_whatsapp + whatsapp_out,
                'whatsapp_total_cost': costo_whatsapp_total
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
