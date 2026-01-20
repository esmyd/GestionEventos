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
