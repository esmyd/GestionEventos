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
            total_pagado = None
            try:
                total_pagado = pago_modelo.obtener_total_pagado_evento(data['evento_id'])
                pago_modelo.actualizar_saldo_evento(data['evento_id'])
            except Exception as e:
                logger.warning(f"No se pudo actualizar saldo/totales del evento {data['evento_id']}: {e}")

            # Cambios de estado y notificaciones no deben romper la respuesta
            try:
                estado_pago = (pago or {}).get('estado_pago')
                if estado_pago and estado_pago != 'aprobado':
                    return jsonify({
                        'message': 'Pago registrado en revisión',
                        'pago': pago,
                        'total_pagado': total_pagado
                    }), 201
                from modelos.evento_modelo import EventoModelo
                evento_modelo = EventoModelo()
                evento = evento_modelo.obtener_evento_por_id(data['evento_id'])
                if evento:
                    estado_actual = evento.get('estado')
                    # Solo cambiar a "en_proceso" si está en cotización o confirmado
                    if estado_actual in ['cotizacion', 'confirmado']:
                        evento_modelo.actualizar_estado(data['evento_id'], 'en_proceso')
                        logger.info(f"Estado del evento {data['evento_id']} cambiado a 'en_proceso' después de registrar pago")
                    evento_actualizado = evento_modelo.obtener_evento_por_id(data['evento_id'])
                    saldo_pendiente = float((evento_actualizado or evento).get('saldo') or 0)
                    if saldo_pendiente <= 0 and estado_actual not in ['completado', 'cancelado']:
                        evento_modelo.actualizar_estado(data['evento_id'], 'confirmado')
                        logger.info(f"Estado del evento {data['evento_id']} cambiado a 'confirmado' por pago completo")
            except Exception as e:
                logger.warning(f"Error al actualizar estado del evento {data['evento_id']} tras pago: {e}")

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


@pagos_bp.route('/<int:pago_id>/estado', methods=['PATCH'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_estado_pago(pago_id):
    """Actualiza el estado de un pago"""
    try:
        data = request.get_json() or {}
        nuevo_estado = data.get('estado_pago')
        if nuevo_estado not in ('en_revision', 'aprobado', 'rechazado'):
            return jsonify({'error': 'Estado inválido'}), 400

        pago_actual = pago_modelo.obtener_pago_por_id(pago_id)
        if not pago_actual:
            return jsonify({'error': 'Pago no encontrado'}), 404

        estado_anterior = pago_actual.get('estado_pago')
        if estado_anterior == nuevo_estado:
            return jsonify({'message': 'Estado sin cambios', 'pago': pago_actual}), 200

        if not pago_modelo.actualizar_estado_pago(pago_id, nuevo_estado):
            return jsonify({'error': 'No se pudo actualizar el estado'}), 500

        pago_actualizado = pago_modelo.obtener_pago_por_id(pago_id)
        evento_id = pago_actualizado.get('id_evento')
        total_pagado = None
        try:
            if evento_id:
                total_pagado = pago_modelo.obtener_total_pagado_evento(evento_id)
                pago_modelo.actualizar_saldo_evento(evento_id)
        except Exception as e:
            logger.warning(f"No se pudo actualizar saldo/totales del evento {evento_id}: {e}")

        if nuevo_estado == 'aprobado' and estado_anterior != 'aprobado' and evento_id:
            try:
                from modelos.evento_modelo import EventoModelo
                evento_modelo = EventoModelo()
                evento = evento_modelo.obtener_evento_por_id(evento_id)
                if evento:
                    estado_actual = evento.get('estado')
                    if estado_actual in ['cotizacion', 'confirmado']:
                        evento_modelo.actualizar_estado(evento_id, 'en_proceso')
                        logger.info(f"Estado del evento {evento_id} cambiado a 'en_proceso' por aprobación de pago")
                    evento_actualizado = evento_modelo.obtener_evento_por_id(evento_id)
                    saldo_pendiente = float((evento_actualizado or evento).get('saldo') or 0)
                    if saldo_pendiente <= 0 and estado_actual not in ['completado', 'cancelado']:
                        evento_modelo.actualizar_estado(evento_id, 'confirmado')
                        logger.info(f"Estado del evento {evento_id} cambiado a 'confirmado' por pago completo")
                    try:
                        pago_modelo._enviar_notificacion_pago(
                            evento,
                            float(pago_actualizado.get('monto') or 0),
                            pago_actualizado.get('tipo_pago'),
                            pago_actualizado.get('metodo_pago') or '',
                            str(pago_actualizado.get('fecha_pago') or '')
                        )
                    except Exception as e:
                        logger.warning(f"No se pudo enviar notificación de pago aprobado {pago_id}: {e}")
            except Exception as e:
                logger.warning(f"Error al actualizar estado del evento {evento_id} tras aprobación: {e}")
        elif nuevo_estado == 'rechazado' and estado_anterior != 'rechazado' and evento_id:
            try:
                from modelos.evento_modelo import EventoModelo
                from integraciones.notificaciones_automaticas import NotificacionesAutomaticas
                evento_modelo = EventoModelo()
                evento = evento_modelo.obtener_evento_por_id(evento_id)
                if evento:
                    notif = NotificacionesAutomaticas()
                    try:
                        notif.enviar_notificacion_pago_anulado(
                            evento=evento,
                            monto=float(pago_actualizado.get('monto') or 0),
                            metodo_pago=pago_actualizado.get('metodo_pago') or '',
                            fecha_pago=str(pago_actualizado.get('fecha_pago') or ''),
                            observaciones=pago_actualizado.get('observaciones')
                        )
                    except Exception as e:
                        logger.warning(f"No se pudo enviar notificación de pago anulado {pago_id}: {e}")
            except Exception as e:
                logger.warning(f"Error al procesar anulación del pago {pago_id}: {e}")

        return jsonify({
            'message': 'Estado actualizado',
            'pago': pago_actualizado,
            'total_pagado': total_pagado
        }), 200
    except Exception as e:
        logger.error(f"Error al actualizar estado del pago {pago_id}: {str(e)}")
        return jsonify({'error': 'Error al actualizar estado del pago'}), 500


@pagos_bp.route('/<int:pago_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_pago(pago_id):
    """Eliminar pagos no está permitido, solo anular"""
    return jsonify({'error': 'No se puede eliminar un pago. Usa anular.'}), 400


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
