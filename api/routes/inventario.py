"""
Rutas para gestión de inventario
"""
from flask import Blueprint, request, jsonify
from modelos.inventario_modelo import InventarioModelo
from modelos.producto_modelo import ProductoModelo
from api.middleware import requiere_autenticacion, requiere_rol
from utilidades.logger import obtener_logger

inventario_bp = Blueprint('inventario', __name__)
logger = obtener_logger()
inventario_modelo = InventarioModelo()
producto_modelo = ProductoModelo()


@inventario_bp.route('', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_inventario():
    """Obtiene movimientos de inventario para un evento o productos con stock bajo"""
    try:
        evento_id = request.args.get('evento_id', type=int)
        
        if evento_id:
            # Obtener movimientos de inventario para un evento específico
            movimientos = inventario_modelo.obtener_movimientos_evento(evento_id)
            return jsonify({'inventario': movimientos, 'movimientos': movimientos}), 200
        else:
            # Si no se especifica evento_id, retornar productos con stock bajo
            productos = inventario_modelo.obtener_productos_stock_bajo()
            return jsonify({'productos': productos}), 200
    except Exception as e:
        logger.error(f"Error al obtener inventario: {str(e)}")
        return jsonify({'error': 'Error al obtener inventario'}), 500


@inventario_bp.route('/stock-bajo', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_productos_stock_bajo():
    """Obtiene productos con stock bajo o agotado"""
    try:
        productos = inventario_modelo.obtener_productos_stock_bajo()
        return jsonify({'productos': productos}), 200
    except Exception as e:
        logger.error(f"Error al obtener productos con stock bajo: {str(e)}")
        return jsonify({'error': 'Error al obtener productos con stock bajo'}), 500


@inventario_bp.route('/validar-stock', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def validar_stock():
    """Valida si hay stock suficiente para un producto"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        producto_id = data.get('producto_id')
        cantidad = data.get('cantidad', 1)
        
        if not producto_id:
            return jsonify({'error': 'producto_id es requerido'}), 400
        
        ok, error = inventario_modelo.validar_stock_suficiente(producto_id, cantidad)
        
        if ok:
            return jsonify({'valido': True}), 200
        else:
            return jsonify({'valido': False, 'error': error}), 200
    except Exception as e:
        logger.error(f"Error al validar stock: {str(e)}")
        return jsonify({'error': 'Error al validar stock'}), 500


@inventario_bp.route('/validar-stock-plan', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def validar_stock_plan():
    """Valida si hay stock suficiente para todos los productos de un plan"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        plan_id = data.get('plan_id')
        cantidad_eventos = data.get('cantidad_eventos', 1)
        
        if not plan_id:
            return jsonify({'error': 'plan_id es requerido'}), 400
        
        ok, productos_insuficientes = inventario_modelo.validar_stock_plan(plan_id, cantidad_eventos)
        
        if ok:
            return jsonify({'valido': True}), 200
        else:
            return jsonify({
                'valido': False,
                'productos_insuficientes': productos_insuficientes
            }), 200
    except Exception as e:
        logger.error(f"Error al validar stock del plan: {str(e)}")
        return jsonify({'error': 'Error al validar stock del plan'}), 500


@inventario_bp.route('/evento/<int:evento_id>/movimientos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_movimientos_evento(evento_id):
    """Obtiene todos los movimientos de inventario para un evento"""
    try:
        movimientos = inventario_modelo.obtener_movimientos_evento(evento_id)
        return jsonify({'movimientos': movimientos}), 200
    except Exception as e:
        logger.error(f"Error al obtener movimientos de inventario: {str(e)}")
        return jsonify({'error': 'Error al obtener movimientos de inventario'}), 500


@inventario_bp.route('/producto/<int:producto_id>/stock', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_stock_producto(producto_id):
    """Obtiene el stock disponible de un producto"""
    try:
        stock = inventario_modelo.obtener_stock_disponible(producto_id)
        if not stock:
            return jsonify({'error': 'Producto no encontrado'}), 404
        return jsonify({'stock': stock}), 200
    except Exception as e:
        logger.error(f"Error al obtener stock del producto: {str(e)}")
        return jsonify({'error': 'Error al obtener stock del producto'}), 500


@inventario_bp.route('/movimientos', methods=['GET'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general', 'coordinador')
def obtener_movimientos_cardex():
    """Obtiene todos los movimientos del cardex (movimientos_inventario)"""
    try:
        from modelos.base_datos import BaseDatos
        base_datos = BaseDatos()
        
        # Verificar si la tabla existe
        tabla_existe = base_datos.obtener_uno("""
            SELECT COUNT(*) as total
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'movimientos_inventario'
        """) or {}
        
        if int(tabla_existe.get("total") or 0) == 0:
            return jsonify({'movimientos': [], 'mensaje': 'Tabla de movimientos no existe aún'}), 200
        
        # Obtener movimientos con nombre de producto, evento y cliente
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
            CASE 
                WHEN mi.referencia_tipo = 'evento' THEN mi.referencia_id
                WHEN mi.referencia_tipo = 'devolucion' THEN mi.referencia_id
                ELSE NULL 
            END as evento_id,
            e.nombre_evento,
            e.estado as evento_estado,
            cl.nombre_completo as cliente_nombre,
            mi.usuario_id,
            u.nombre_completo as usuario_nombre,
            mi.fecha_movimiento
        FROM movimientos_inventario mi
        LEFT JOIN productos p ON mi.producto_id = p.id
        LEFT JOIN usuarios u ON mi.usuario_id = u.id
        LEFT JOIN eventos e ON (mi.referencia_tipo IN ('evento', 'devolucion') AND mi.referencia_id = e.id_evento)
        LEFT JOIN clientes c ON e.id_cliente = c.id
        LEFT JOIN usuarios cl ON c.usuario_id = cl.id
        ORDER BY mi.fecha_movimiento DESC
        LIMIT 500
        """
        movimientos = base_datos.obtener_todos(consulta) or []
        return jsonify({'movimientos': movimientos}), 200
    except Exception as e:
        logger.error(f"Error al obtener movimientos del cardex: {str(e)}")
        return jsonify({'error': 'Error al obtener movimientos'}), 500


@inventario_bp.route('/recalcular', methods=['POST'])
@requiere_autenticacion
@requiere_rol('administrador', 'gerente_general')
def recalcular_inventario():
    """Recalcula el inventario basándose en los movimientos registrados"""
    try:
        from modelos.base_datos import BaseDatos
        base_datos = BaseDatos()
        
        # Obtener todos los productos
        productos = base_datos.obtener_todos("SELECT id, nombre, stock, stock_disponible FROM productos WHERE activo = TRUE OR activo IS NULL")
        
        resultados = []
        for producto in productos or []:
            producto_id = producto.get('id')
            stock_actual = int(producto.get('stock') or 0)
            
            # Calcular stock basado en movimientos
            # Entradas + Devoluciones - Salidas - Reservas
            consulta_movimientos = """
            SELECT 
                SUM(CASE WHEN tipo_movimiento IN ('entrada', 'devolucion') THEN cantidad ELSE 0 END) as entradas,
                SUM(CASE WHEN tipo_movimiento IN ('salida', 'reserva') THEN cantidad ELSE 0 END) as salidas
            FROM movimientos_inventario
            WHERE producto_id = %s
            """
            mov = base_datos.obtener_uno(consulta_movimientos, (producto_id,)) or {}
            entradas = int(mov.get('entradas') or 0)
            salidas = int(mov.get('salidas') or 0)
            stock_calculado = entradas - salidas
            
            if stock_calculado != stock_actual:
                # Actualizar el stock
                base_datos.ejecutar_consulta(
                    "UPDATE productos SET stock = %s, stock_disponible = %s WHERE id = %s",
                    (stock_calculado, stock_calculado, producto_id)
                )
                resultados.append({
                    'producto_id': producto_id,
                    'nombre': producto.get('nombre'),
                    'stock_anterior': stock_actual,
                    'stock_nuevo': stock_calculado,
                    'diferencia': stock_calculado - stock_actual
                })
        
        logger.info(f"Inventario recalculado: {len(resultados)} productos actualizados")
        return jsonify({
            'message': f'Inventario recalculado. {len(resultados)} productos actualizados.',
            'productos_actualizados': resultados
        }), 200
    except Exception as e:
        logger.error(f"Error al recalcular inventario: {str(e)}")
        return jsonify({'error': 'Error al recalcular inventario'}), 500
