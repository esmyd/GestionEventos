"""
Rutas para gestión de eventos
"""
from flask import Blueprint, request, jsonify
from modelos.evento_modelo import EventoModelo
from modelos.usuario_modelo import UsuarioModelo
from modelos.pago_modelo import PagoModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger
from integraciones.sistema_notificaciones import SistemaNotificaciones

eventos_bp = Blueprint('eventos', __name__)
logger = obtener_logger()
evento_modelo = EventoModelo()
usuario_modelo = UsuarioModelo()
pago_modelo = PagoModelo()


@eventos_bp.route('', methods=['GET'])
@requiere_autenticacion
def obtener_eventos():
    """Obtiene todos los eventos"""
    try:
        filtro_estado = request.args.get('estado')
        filtro_fecha = request.args.get('fecha')
        cliente_id = request.args.get('cliente_id')
        coordinador_id = request.args.get('coordinador_id')
        incluir_porcentaje_avance = request.args.get('incluir_porcentaje_avance', 'false').lower() == 'true'
        
        if cliente_id:
            eventos = evento_modelo.obtener_eventos_por_cliente(int(cliente_id))
        elif coordinador_id:
            eventos = evento_modelo.obtener_eventos_por_coordinador(int(coordinador_id))
        else:
            eventos = evento_modelo.obtener_todos_eventos(filtro_estado=filtro_estado, filtro_fecha=filtro_fecha)
        
        # Calcular y agregar porcentaje de avance para cada evento
        for evento in eventos:
            evento_id = evento.get('id_evento') or evento.get('id')
            if evento_id:
                evento['progreso_servicios'] = evento_modelo.obtener_porcentaje_avance_servicios(evento_id)
                # Mantener compatibilidad con nombre anterior
                evento['porcentaje_avance_servicios'] = evento['progreso_servicios']
        
        return jsonify({'eventos': eventos}), 200
    except Exception as e:
        logger.error(f"Error al obtener eventos: {str(e)}")
        return jsonify({'error': 'Error al obtener eventos'}), 500


@eventos_bp.route('/<int:evento_id>', methods=['GET'])
@requiere_autenticacion
def obtener_evento(evento_id):
    """Obtiene un evento por ID"""
    try:
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        if evento:
            # Obtener productos del evento
            productos = evento_modelo.obtener_productos_evento(evento_id)
            evento['productos'] = productos
            # Obtener porcentaje de avance de servicios
            evento['progreso_servicios'] = evento_modelo.obtener_porcentaje_avance_servicios(evento_id)
            # Mantener compatibilidad con nombre anterior
            evento['porcentaje_avance_servicios'] = evento['progreso_servicios']
            return jsonify({'evento': evento}), 200
        else:
            return jsonify({'error': 'Evento no encontrado'}), 404
    except Exception as e:
        logger.error(f"Error al obtener evento: {str(e)}")
        return jsonify({'error': 'Error al obtener evento'}), 500


@eventos_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador', 'cliente')
def crear_evento():
    """Crea un nuevo evento"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if 'cliente_id' not in data:
            return jsonify({'error': 'cliente_id es requerido'}), 400
        
        # Verificar conflicto de horarios si se proporciona salón, fecha y horas
        if data.get('id_salon') and data.get('fecha_evento') and data.get('hora_inicio') and data.get('hora_fin'):
            try:
                tiene_conflicto = evento_modelo.verificar_conflicto_evento(
                    salon_id=data.get('id_salon'),
                    fecha_evento=data.get('fecha_evento'),
                    hora_inicio=data.get('hora_inicio'),
                    hora_fin=data.get('hora_fin')
                )
                if tiene_conflicto:
                    return jsonify({
                        'error': 'Ya existe un evento en ese salón para la fecha y horario seleccionados. Por favor, selecciona otro salón, fecha u horario.'
                    }), 400
            except AttributeError:
                # Si el método no existe aún, continuar sin validación (para compatibilidad)
                logger.warning("Método verificar_conflicto_evento no disponible, saltando validación")
            except Exception as e:
                logger.error(f"Error al verificar conflicto: {str(e)}")
                # Continuar con la creación si hay error en la verificación
        
        evento_id = evento_modelo.crear_evento(data)
        if evento_id:
            if data.get('plan_id'):
                evento_modelo.crear_servicios_evento_desde_plan(evento_id, data.get('plan_id'))
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            try:
                SistemaNotificaciones().enviar_notificacion(evento_id, 'evento_creado')
            except Exception as e:
                logger.error(f"Error al enviar notificación evento_creado: {str(e)}")
            return jsonify({'message': 'Evento creado exitosamente', 'evento': evento}), 201
        else:
            return jsonify({'error': 'Error al crear evento'}), 500
    except Exception as e:
        logger.error(f"Error al crear evento: {str(e)}")
        return jsonify({'error': f'Error al crear evento: {str(e)}'}), 500


@eventos_bp.route('/<int:evento_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_evento(evento_id):
    """Actualiza un evento"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        resultado = evento_modelo.actualizar_evento(evento_id, data)
        if resultado:
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            return jsonify({'message': 'Evento actualizado exitosamente', 'evento': evento}), 200
        else:
            return jsonify({'error': 'Error al actualizar evento'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar evento: {str(e)}")
        return jsonify({'error': 'Error al actualizar evento'}), 500


@eventos_bp.route('/<int:evento_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_evento(evento_id):
    """Elimina un evento si no tiene pagos pendientes de reembolso"""
    try:
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404

        total_pagado = pago_modelo.obtener_total_pagado_evento(evento_id)
        total_reembolsos = pago_modelo.obtener_total_reembolsos_evento(evento_id)
        saldo_por_reembolsar = total_pagado - total_reembolsos

        if saldo_por_reembolsar > 0:
            return jsonify({
                'error': 'Existen pagos sin reembolsar. Debe reembolsar antes de eliminar el evento.',
                'total_pagado': total_pagado,
                'total_reembolsos': total_reembolsos
            }), 400

        resultado = evento_modelo.eliminar_evento(evento_id)
        if resultado:
            return jsonify({'message': 'Evento eliminado exitosamente'}), 200
        return jsonify({'error': 'Error al eliminar evento'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar evento: {str(e)}")
        return jsonify({'error': 'Error al eliminar evento'}), 500


@eventos_bp.route('/<int:evento_id>/coordinador', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def asignar_coordinador_evento(evento_id):
    """Asigna o elimina el coordinador de un evento"""
    try:
        data = request.get_json() or {}
        coordinador_id = data.get('coordinador_id')
        if coordinador_id in ('', None):
            coordinador_id = None
        else:
            coordinador_id = int(coordinador_id)
            usuario = usuario_modelo.obtener_usuario_por_id(coordinador_id)
            if not usuario or usuario.get('rol') != 'coordinador':
                return jsonify({'error': 'El usuario asignado debe tener rol de coordinador'}), 400

        resultado = evento_modelo.actualizar_coordinador_evento(evento_id, coordinador_id)
        if resultado:
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            return jsonify({'message': 'Coordinador actualizado', 'evento': evento}), 200
        return jsonify({'error': 'Error al actualizar coordinador'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar coordinador: {str(e)}")
        return jsonify({'error': 'Error al actualizar coordinador'}), 500


@eventos_bp.route('/<int:evento_id>/estado', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_estado_evento(evento_id):
    """Actualiza el estado de un evento con validaciones"""
    try:
        data = request.get_json()
        if not data or 'estado' not in data:
            return jsonify({'error': 'estado es requerido'}), 400
        
        nuevo_estado = data['estado']
        estados_validos = ['cotizacion', 'confirmado', 'en_proceso', 'completado', 'cancelado']
        
        if nuevo_estado not in estados_validos:
            return jsonify({'error': f'Estado inválido. Estados válidos: {", ".join(estados_validos)}'}), 400
        
        # Obtener el evento actual para validaciones
        evento_actual = evento_modelo.obtener_evento_por_id(evento_id)
        if not evento_actual:
            return jsonify({'error': 'Evento no encontrado'}), 404
        
        estado_actual = evento_actual.get('estado')
        saldo_pendiente = float(evento_actual.get('saldo', 0) or 0)
        
        # Validación: No se puede actualizar un evento que ya está completado
        if estado_actual == 'completado':
            return jsonify({
                'error': 'No se puede modificar el estado de un evento que ya está completado'
            }), 400
        
        # Validación: No se puede cambiar a "completado" si hay saldo pendiente
        if nuevo_estado == 'completado' and saldo_pendiente > 0:
            return jsonify({
                'error': f'No se puede cambiar el estado a "completado" si hay saldo pendiente. Saldo actual: ${saldo_pendiente:,.0f}'
            }), 400
        
        # Validación: No se puede cancelar un evento ya completado
        if nuevo_estado == 'cancelado' and estado_actual == 'completado':
            return jsonify({
                'error': 'No se puede cancelar un evento que ya está completado'
            }), 400
        
        # Validación: No se puede cambiar de cancelado a otros estados (excepto si se reactiva)
        if estado_actual == 'cancelado' and nuevo_estado != 'cotizacion':
            return jsonify({
                'error': 'Un evento cancelado solo puede reactivarse cambiándolo a "cotización"'
            }), 400
        
        # Validación de stock antes de confirmar evento
        if nuevo_estado in ('confirmado', 'en_proceso') and estado_actual not in ('confirmado', 'en_proceso'):
            from modelos.inventario_modelo import InventarioModelo
            inventario = InventarioModelo()
            
            # Validar stock del plan
            plan_id = evento_actual.get('plan_id')
            if plan_id:
                ok, productos_insuficientes = inventario.validar_stock_plan(plan_id)
                if not ok:
                    return jsonify({
                        'error': 'Stock insuficiente para confirmar el evento',
                        'productos_insuficientes': productos_insuficientes,
                        'detalle': 'Uno o más productos del plan no tienen stock suficiente'
                    }), 400
            
            # Validar stock de productos adicionales
            productos_adicionales = evento_modelo.obtener_productos_evento(evento_id)
            productos_insuficientes_adicionales = []
            for producto in productos_adicionales or []:
                producto_id = producto.get('producto_id')
                cantidad = int(producto.get('cantidad') or 1)
                ok, error = inventario.validar_stock_suficiente(producto_id, cantidad)
                if not ok:
                    producto_info = evento_modelo.base_datos.obtener_uno(
                        "SELECT nombre FROM productos WHERE id = %s", (producto_id,)
                    ) or {}
                    productos_insuficientes_adicionales.append({
                        'producto_id': producto_id,
                        'nombre': producto_info.get('nombre', f'Producto {producto_id}'),
                        'requerido': cantidad,
                        'error': error
                    })
            
            if productos_insuficientes_adicionales:
                return jsonify({
                    'error': 'Stock insuficiente en productos adicionales',
                    'productos_insuficientes': productos_insuficientes_adicionales,
                    'detalle': 'Uno o más productos adicionales no tienen stock suficiente'
                }), 400
        
        # Actualizar el estado
        resultado = evento_modelo.actualizar_estado(evento_id, nuevo_estado)
        if resultado:
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            return jsonify({'message': 'Estado actualizado exitosamente', 'evento': evento}), 200
        else:
            return jsonify({'error': 'Error al actualizar estado'}), 500
    except Exception as e:
        logger.error(f"Error al actualizar estado: {str(e)}")
        return jsonify({'error': f'Error al actualizar estado: {str(e)}'}), 500


@eventos_bp.route('/<int:evento_id>/productos', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador', 'cliente')
def agregar_producto_evento(evento_id):
    """Agrega un producto a un evento"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        campos_requeridos = ['producto_id', 'cantidad', 'precio_unitario']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400
        
        resultado = evento_modelo.agregar_producto_evento(
            evento_id,
            data['producto_id'],
            data['cantidad'],
            data['precio_unitario']
        )
        if resultado:
            # Recalcular total
            evento_modelo.calcular_total_evento(evento_id)
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            return jsonify({'message': 'Producto agregado exitosamente', 'evento': evento}), 200
        else:
            return jsonify({'error': 'Error al agregar producto'}), 500
    except Exception as e:
        logger.error(f"Error al agregar producto: {str(e)}")
        return jsonify({'error': 'Error al agregar producto'}), 500


@eventos_bp.route('/<int:evento_id>/productos/<int:producto_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def eliminar_producto_evento(evento_id, producto_id):
    """Elimina un producto de un evento"""
    try:
        data = request.get_json(silent=True) or {}
        observacion = (data.get('observacion') or '').strip()
        resultado = evento_modelo.eliminar_producto_evento(evento_id, producto_id)
        if resultado:
            if observacion:
                logger.info(
                    f"Observación al eliminar producto. Evento: {evento_id} "
                    f"Producto: {producto_id}. Observación: {observacion}"
                )
            # Recalcular total
            evento_modelo.calcular_total_evento(evento_id)
            evento = evento_modelo.obtener_evento_por_id(evento_id)
            return jsonify({'message': 'Producto eliminado exitosamente', 'evento': evento}), 200
        else:
            return jsonify({'error': 'Error al eliminar producto'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar producto: {str(e)}")
        return jsonify({'error': 'Error al eliminar producto'}), 500


@eventos_bp.route('/<int:evento_id>/productos', methods=['GET'])
@requiere_autenticacion
def obtener_productos_evento(evento_id):
    """Obtiene los productos de un evento"""
    try:
        productos = evento_modelo.obtener_productos_evento(evento_id)
        return jsonify({'productos': productos}), 200
    except Exception as e:
        logger.error(f"Error al obtener productos: {str(e)}")
        return jsonify({'error': 'Error al obtener productos'}), 500


@eventos_bp.route('/<int:evento_id>/servicios', methods=['GET'])
@requiere_autenticacion
def obtener_servicios_evento(evento_id):
    """Obtiene los servicios de un evento"""
    try:
        servicios = evento_modelo.obtener_servicios_evento(evento_id)
        return jsonify({'servicios': servicios}), 200
    except Exception as e:
        logger.error(f"Error al obtener servicios: {str(e)}")
        return jsonify({'error': 'Error al obtener servicios'}), 500


@eventos_bp.route('/<int:evento_id>/servicios/<int:servicio_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def actualizar_servicio_evento(evento_id, servicio_id):
    """Actualiza el estado de un servicio del evento"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        # Actualizar completado y/o descartado
        completado = data.get('completado')
        descartado = data.get('descartado')
        resultado = evento_modelo.actualizar_servicio_evento(
            servicio_id, 
            completado=completado if completado is not None else None,
            descartado=descartado if descartado is not None else None
        )
        if not resultado:
            return jsonify({'error': 'Error al actualizar servicio'}), 500
        
        servicios = evento_modelo.obtener_servicios_evento(evento_id)
        porcentaje_avance = evento_modelo.obtener_porcentaje_avance_servicios(evento_id)
        return jsonify({
            'message': 'Servicio actualizado',
            'servicios': servicios,
            'porcentaje_avance': porcentaje_avance
        }), 200
    except Exception as e:
        logger.error(f"Error al actualizar servicio: {str(e)}")
        return jsonify({'error': 'Error al actualizar servicio'}), 500


@eventos_bp.route('/<int:evento_id>/servicios', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def crear_servicio_personalizado(evento_id):
    """Crea un servicio personalizado para un evento"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        nombre = data.get('nombre')
        if not nombre or not nombre.strip():
            return jsonify({'error': 'El nombre del servicio es requerido'}), 400
        
        orden = data.get('orden')
        servicio_id = evento_modelo.crear_servicio_personalizado(evento_id, nombre.strip(), orden)
        
        if servicio_id:
            servicios = evento_modelo.obtener_servicios_evento(evento_id)
            porcentaje_avance = evento_modelo.obtener_porcentaje_avance_servicios(evento_id)
            return jsonify({
                'message': 'Servicio creado exitosamente',
                'servicios': servicios,
                'porcentaje_avance': porcentaje_avance
            }), 201
        else:
            return jsonify({'error': 'Error al crear servicio'}), 500
    except Exception as e:
        logger.error(f"Error al crear servicio personalizado: {str(e)}")
        return jsonify({'error': 'Error al crear servicio'}), 500


@eventos_bp.route('/<int:evento_id>/servicios/<int:servicio_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def eliminar_servicio_evento(evento_id, servicio_id):
    """Elimina un servicio del evento (solo servicios personalizados)"""
    try:
        # Verificar que el servicio sea personalizado (sin plan_servicio_id)
        servicios = evento_modelo.obtener_servicios_evento(evento_id)
        servicio = next((s for s in servicios if s.get('id') == servicio_id), None)
        
        if not servicio:
            return jsonify({'error': 'Servicio no encontrado'}), 404
        
        # Solo permitir eliminar servicios personalizados (sin plan_servicio_id)
        if servicio.get('plan_servicio_id') is not None:
            return jsonify({'error': 'No se puede eliminar un servicio del plan. Use la opción de descartar.'}), 400
        
        resultado = evento_modelo.eliminar_servicio_evento(servicio_id)
        if resultado:
            servicios = evento_modelo.obtener_servicios_evento(evento_id)
            porcentaje_avance = evento_modelo.obtener_porcentaje_avance_servicios(evento_id)
            return jsonify({
                'message': 'Servicio eliminado exitosamente',
                'servicios': servicios,
                'porcentaje_avance': porcentaje_avance
            }), 200
        else:
            return jsonify({'error': 'Error al eliminar servicio'}), 500
    except Exception as e:
        logger.error(f"Error al eliminar servicio: {str(e)}")
        return jsonify({'error': 'Error al eliminar servicio'}), 500


@eventos_bp.route('/<int:evento_id>/servicios/generar', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def generar_servicios_evento(evento_id):
    """Genera (reemplaza) los servicios del evento desde el plan"""
    try:
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404
        if not evento.get('plan_id'):
            return jsonify({'error': 'El evento no tiene plan asociado'}), 400
        
        # Verificar si el plan tiene servicios configurados
        from modelos.plan_modelo import PlanModelo
        plan_modelo = PlanModelo()
        servicios_plan = plan_modelo.obtener_servicios_plan(evento.get('plan_id'))
        
        if not servicios_plan or len(servicios_plan) == 0:
            return jsonify({
                'error': 'El plan seleccionado no tiene servicios configurados. Por favor, configura los servicios del plan primero.'
            }), 400
        
        evento_modelo.reemplazar_servicios_evento_desde_plan(evento_id, evento.get('plan_id'))
        servicios = evento_modelo.obtener_servicios_evento(evento_id)
        return jsonify({'message': 'Servicios generados exitosamente', 'servicios': servicios}), 200
    except Exception as e:
        logger.error(f"Error al generar servicios: {str(e)}")
        return jsonify({'error': f'Error al generar servicios: {str(e)}'}), 500


@eventos_bp.route('/<int:evento_id>/calcular-total', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador', 'cliente')
def calcular_total_evento(evento_id):
    """Calcula y actualiza el total de un evento"""
    try:
        total = evento_modelo.calcular_total_evento(evento_id)
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        return jsonify({'message': 'Total calculado exitosamente', 'total': total, 'evento': evento}), 200
    except Exception as e:
        logger.error(f"Error al calcular total: {str(e)}")
        return jsonify({'error': 'Error al calcular total'}), 500


@eventos_bp.route('/fechas-ocupadas', methods=['GET'])
@requiere_autenticacion
def obtener_fechas_ocupadas():
    """Obtiene las fechas ocupadas para un salón específico"""
    try:
        salon_id = request.args.get('salon_id')
        if not salon_id:
            return jsonify({'error': 'salon_id es requerido'}), 400
        
        try:
            salon_id = int(salon_id)
        except ValueError:
            return jsonify({'error': 'salon_id debe ser un número'}), 400
        
        fechas = evento_modelo.obtener_fechas_ocupadas_salon(salon_id)
        return jsonify({'fechas_ocupadas': fechas}), 200
    except Exception as e:
        logger.error(f"Error al obtener fechas ocupadas: {str(e)}")
        return jsonify({'error': 'Error al obtener fechas ocupadas'}), 500


@eventos_bp.route('/<int:evento_id>/cotizacion-pdf', methods=['GET'])
@requiere_autenticacion
def descargar_cotizacion_pdf(evento_id):
    """Genera y descarga un PDF de cotización del evento"""
    try:
        from utilidades.generar_pdf_cotizacion import generar_pdf_cotizacion
        from flask import Response
        
        # Obtener información del evento
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404
        
        # Obtener productos adicionales
        productos_adicionales = evento_modelo.obtener_productos_evento(evento_id)
        
        # Generar PDF
        pdf_bytes = generar_pdf_cotizacion(evento, productos_adicionales)
        
        # Crear respuesta con el PDF
        response = Response(
            pdf_bytes,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename=cotizacion_evento_{evento_id}.pdf'
            }
        )
        return response
    except Exception as e:
        logger.error(f"Error al generar PDF de cotización: {str(e)}")
        return jsonify({'error': f'Error al generar PDF: {str(e)}'}), 500


@eventos_bp.route('/<int:evento_id>/contrato-pdf', methods=['GET'])
@requiere_autenticacion
def descargar_contrato_pdf(evento_id):
    """Genera y descarga un PDF de contrato del evento"""
    try:
        from utilidades.generar_pdf_contrato import generar_pdf_contrato
        from flask import Response

        # Obtener informacion del evento
        evento = evento_modelo.obtener_evento_por_id(evento_id)
        if not evento:
            return jsonify({'error': 'Evento no encontrado'}), 404

        # Generar PDF
        pdf_bytes = generar_pdf_contrato(evento)

        # Crear respuesta con el PDF
        documento_identidad = evento.get('documento_identidad_cliente') or evento.get('documento_identidad') or 'sin_documento_identidad'
        fecha_evento = str(evento.get('fecha_evento') or 'sin_fecha')
        fecha_evento = fecha_evento.replace('-', '')
        nombre_archivo = f"Contrato_{documento_identidad}_{evento_id}_{fecha_evento}.pdf"

        response = Response(
            pdf_bytes,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename={nombre_archivo}'
            }
        )
        return response
    except Exception as e:
        logger.error(f"Error al generar PDF de contrato: {str(e)}")
        return jsonify({'error': f'Error al generar PDF: {str(e)}'}), 500