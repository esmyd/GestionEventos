"""
Rutas para gestión de cuentas
"""
from flask import Blueprint, request, jsonify
from modelos.cuenta_modelo import CuentaModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

cuentas_bp = Blueprint('cuentas', __name__)
logger = obtener_logger()
cuenta_modelo = CuentaModelo()


@cuentas_bp.route('', methods=['GET'])
@requiere_autenticacion
def obtener_cuentas():
    """Obtiene todas las cuentas
    
    Query params:
        - incluir_inactivas: bool (default: false)
        - tipo: string (bancaria, efectivo, digital, otro)
        - buscar: string (término de búsqueda)
    """
    try:
        incluir_inactivas = request.args.get('incluir_inactivas', 'false').lower() == 'true'
        tipo = request.args.get('tipo')
        buscar = request.args.get('buscar')
        
        if buscar:
            cuentas = cuenta_modelo.buscar_cuentas(buscar)
        elif tipo:
            cuentas = cuenta_modelo.obtener_cuentas_por_tipo(tipo)
        else:
            cuentas = cuenta_modelo.obtener_todas_cuentas(incluir_inactivas)
        
        return jsonify({
            'cuentas': cuentas,
            'total': len(cuentas)
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener cuentas: {str(e)}")
        return jsonify({'error': 'Error al obtener cuentas'}), 500


@cuentas_bp.route('/<int:cuenta_id>', methods=['GET'])
@requiere_autenticacion
def obtener_cuenta(cuenta_id):
    """Obtiene una cuenta por ID"""
    try:
        cuenta = cuenta_modelo.obtener_cuenta_por_id(cuenta_id)
        if cuenta:
            # Agregar estadísticas de uso
            estadisticas = cuenta_modelo.obtener_estadisticas_uso(cuenta_id)
            cuenta['estadisticas'] = estadisticas
            return jsonify({'cuenta': cuenta}), 200
        else:
            return jsonify({'error': 'Cuenta no encontrada'}), 404
    except Exception as e:
        logger.error(f"Error al obtener cuenta {cuenta_id}: {str(e)}")
        return jsonify({'error': 'Error al obtener cuenta'}), 500


@cuentas_bp.route('', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def crear_cuenta():
    """Crea una nueva cuenta
    
    Body JSON:
        - nombre: string (requerido)
        - tipo: string (bancaria, efectivo, digital, otro)
        - descripcion: string (opcional)
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if not data.get('nombre'):
            return jsonify({'error': 'El nombre de la cuenta es requerido'}), 400
        
        cuenta_id = cuenta_modelo.crear_cuenta(data)
        if cuenta_id:
            cuenta = cuenta_modelo.obtener_cuenta_por_id(cuenta_id)
            return jsonify({
                'message': 'Cuenta creada exitosamente',
                'cuenta': cuenta
            }), 201
        else:
            return jsonify({'error': 'Error al crear cuenta'}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error al crear cuenta: {str(e)}")
        return jsonify({'error': f'Error al crear cuenta: {str(e)}'}), 500


@cuentas_bp.route('/<int:cuenta_id>', methods=['PUT'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def actualizar_cuenta(cuenta_id):
    """Actualiza una cuenta existente
    
    Body JSON:
        - nombre: string
        - tipo: string (bancaria, efectivo, digital, otro)
        - descripcion: string
        - activo: bool
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        if cuenta_modelo.actualizar_cuenta(cuenta_id, data):
            cuenta = cuenta_modelo.obtener_cuenta_por_id(cuenta_id)
            return jsonify({
                'message': 'Cuenta actualizada exitosamente',
                'cuenta': cuenta
            }), 200
        else:
            return jsonify({'error': 'Error al actualizar cuenta'}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error al actualizar cuenta {cuenta_id}: {str(e)}")
        return jsonify({'error': f'Error al actualizar cuenta: {str(e)}'}), 500


@cuentas_bp.route('/<int:cuenta_id>', methods=['DELETE'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def eliminar_cuenta(cuenta_id):
    """Desactiva una cuenta (no elimina físicamente)"""
    try:
        if cuenta_modelo.eliminar_cuenta(cuenta_id):
            return jsonify({
                'message': 'Cuenta desactivada exitosamente'
            }), 200
        else:
            return jsonify({'error': 'Error al desactivar cuenta'}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Error al eliminar cuenta {cuenta_id}: {str(e)}")
        return jsonify({'error': f'Error al eliminar cuenta: {str(e)}'}), 500


@cuentas_bp.route('/<int:cuenta_id>/activar', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def activar_cuenta(cuenta_id):
    """Reactiva una cuenta desactivada"""
    try:
        if cuenta_modelo.activar_cuenta(cuenta_id):
            cuenta = cuenta_modelo.obtener_cuenta_por_id(cuenta_id)
            return jsonify({
                'message': 'Cuenta activada exitosamente',
                'cuenta': cuenta
            }), 200
        else:
            return jsonify({'error': 'Error al activar cuenta'}), 500
    except Exception as e:
        logger.error(f"Error al activar cuenta {cuenta_id}: {str(e)}")
        return jsonify({'error': f'Error al activar cuenta: {str(e)}'}), 500


@cuentas_bp.route('/tipos', methods=['GET'])
@requiere_autenticacion
def obtener_tipos_cuenta():
    """Obtiene los tipos de cuenta disponibles"""
    tipos = [
        {'valor': 'ahorros', 'etiqueta': 'Cuenta de Ahorros'},
        {'valor': 'corriente', 'etiqueta': 'Cuenta Corriente'},
        {'valor': 'digital', 'etiqueta': 'Billetera Digital'},
        {'valor': 'efectivo', 'etiqueta': 'Cuenta en Efectivo'},
        {'valor': 'otro', 'etiqueta': 'Otro'}
    ]
    return jsonify({'tipos': tipos}), 200


@cuentas_bp.route('/estadisticas', methods=['GET'])
@requiere_autenticacion
def obtener_estadisticas_cuentas():
    """Obtiene estadísticas generales de cuentas"""
    try:
        total_cuentas = cuenta_modelo.obtener_total_cuentas()
        cuentas = cuenta_modelo.obtener_todas_cuentas(incluir_inactivas=True)
        
        # Contar por tipo
        por_tipo = {}
        activas = 0
        inactivas = 0
        
        for cuenta in cuentas:
            tipo = cuenta.get('tipo', 'otro')
            if tipo not in por_tipo:
                por_tipo[tipo] = 0
            por_tipo[tipo] += 1
            
            if cuenta.get('activo'):
                activas += 1
            else:
                inactivas += 1
        
        return jsonify({
            'total': len(cuentas),
            'activas': activas,
            'inactivas': inactivas,
            'por_tipo': por_tipo
        }), 200
    except Exception as e:
        logger.error(f"Error al obtener estadísticas de cuentas: {str(e)}")
        return jsonify({'error': 'Error al obtener estadísticas'}), 500
