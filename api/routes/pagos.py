"""
Rutas para gestión de pagos
"""
from flask import Blueprint, request, jsonify
from modelos.pago_modelo import PagoModelo
from api.middleware import requiere_autenticacion, requiere_rol, obtener_usuario_actual
from utilidades.logger import obtener_logger

pagos_bp = Blueprint('pagos', __name__)
logger = obtener_logger()
pago_modelo = PagoModelo()


@pagos_bp.route('', methods=['GET'])
@requiere_autenticacion
def obtener_pagos():
    """Obtiene todos los pagos (filtrados por evento si se proporciona evento_id)"""
    try:
        evento_id = request.args.get('evento_id')
        if evento_id:
            pagos = pago_modelo.obtener_pagos_por_evento(int(evento_id))
            total_pagado = pago_modelo.obtener_total_pagado_evento(int(evento_id))
            return jsonify({
                'pagos': pagos,
                'total_pagado': total_pagado
            }), 200
        else:
            return jsonify({'error': 'evento_id es requerido'}), 400
    except Exception as e:
        logger.error(f"Error al obtener pagos: {str(e)}")
        return jsonify({'error': 'Error al obtener pagos'}), 500


@pagos_bp.route('/<int:pago_id>', methods=['GET'])
@requiere_autenticacion
def obtener_pago(pago_id):
    """Obtiene un pago por ID"""
    try:
        pago = pago_modelo.obtener_pago_por_id(pago_id)
        if pago:
            return jsonify({'pago': pago}), 200
        else:
            return jsonify({'error': 'Pago no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener pago: {str(e)}")
        return jsonify({'error': 'Error al obtener pago'}), 500


@pagos_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_pago():
    """Crea un nuevo pago o abono"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        campos_requeridos = ['evento_id', 'monto', 'metodo_pago', 'fecha_pago']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        # Agregar usuario que registra el pago
        usuario_actual = obtener_usuario_actual()
        if usuario_actual:
            data['usuario_registro_id'] = usuario_actual['id']
        
        # Si no se especifica origen, asumir 'web' (ya que viene de la API web)
        if 'origen' not in data:
            data['origen'] = 'web'
        
        pago_id = pago_modelo.crear_pago(data)
        if pago_id:
            pago = pago_modelo.obtener_pago_por_id(pago_id)
            total_pagado = pago_modelo.obtener_total_pagado_evento(data['evento_id'])
            
            # Cambiar estado del evento a "en_proceso" si está en "cotizacion" o "confirmado"
            from modelos.evento_modelo import EventoModelo
            evento_modelo = EventoModelo()
            evento = evento_modelo.obtener_evento_por_id(data['evento_id'])
            if evento:
                estado_actual = evento.get('estado')
                # Solo cambiar a "en_proceso" si está en cotización o confirmado
                if estado_actual in ['cotizacion', 'confirmado']:
                    evento_modelo.actualizar_estado(data['evento_id'], 'en_proceso')
                    logger.info(f"Estado del evento {data['evento_id']} cambiado a 'en_proceso' después de registrar pago")
            
            return jsonify({
                'message': 'Pago registrado exitosamente',
                'pago': pago,
                'total_pagado': total_pagado
            }), 201
        else:
            return jsonify({'error': 'Error al registrar pago'}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error al crear pago: {str(e)}")
        return jsonify({'error': f'Error al crear pago: {str(e)}'}), 500


@pagos_bp.route('/<int:pago_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_pago(pago_id):
    """Elimina un pago"""
    try:
        # Obtener evento_id antes de eliminar
        pago = pago_modelo.obtener_pago_por_id(pago_id)
        if not pago:
            return jsonify({'error': 'Pago no encontrado'}), 404
        
        evento_id = pago.get('id_evento')
        resultado = pago_modelo.eliminar_pago(pago_id)
        if resultado:
            total_pagado = pago_modelo.obtener_total_pagado_evento(evento_id) if evento_id else 0
            return jsonify({
                'message': 'Pago eliminado exitosamente',
                'total_pagado': total_pagado
            }), 200
        else:
            return jsonify({'error': 'Error al eliminar pago'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar pago: {str(e)}")
        return jsonify({'error': 'Error al eliminar pago'}), 500


@pagos_bp.route('/evento/<int:evento_id>/total', methods=['GET'])
@requiere_autenticacion
def obtener_total_pagado(evento_id):
    """Obtiene el total pagado de un evento"""
    try:
        total_pagado = pago_modelo.obtener_total_pagado_evento(evento_id)
        total_reembolsos = pago_modelo.obtener_total_reembolsos_evento(evento_id)
        return jsonify({
            'total_pagado': total_pagado,
            'total_reembolsos': total_reembolsos
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener total pagado: {str(e)}")
        return jsonify({'error': 'Error al obtener total pagado'}), 500
