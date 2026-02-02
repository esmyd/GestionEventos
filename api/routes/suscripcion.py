"""
Rutas API para gestión de suscripciones, planes y módulos
"""
import json
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from api.middleware import requiere_autenticacion, requiere_rol
from modelos.suscripcion_modelo import SuscripcionModelo
from modelos.whatsapp_metricas_modelo import WhatsAppMetricasModelo
from modelos.integracion_modelo import IntegracionModelo
from utilidades.logger import obtener_logger

suscripcion_bp = Blueprint('suscripcion', __name__)
suscripcion_modelo = SuscripcionModelo()
whatsapp_metricas_modelo = WhatsAppMetricasModelo()
integracion_modelo = IntegracionModelo()
logger = obtener_logger()


# =========================================================
# ENDPOINTS PÚBLICOS (Para el cliente)
# =========================================================

@suscripcion_bp.route('/mi-plan', methods=['GET'])
@requiere_autenticacion
def obtener_mi_plan():
    """Obtiene información del plan actual del cliente"""
    try:
        plan = suscripcion_modelo.obtener_plan_actual()
        estado = suscripcion_modelo.obtener_estado_suscripcion()
        uso = suscripcion_modelo.obtener_uso_actual()
        
        return jsonify({
            'plan': plan,
            'estado_suscripcion': estado,
            'uso': uso
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/modulos', methods=['GET'])
@requiere_autenticacion
def obtener_modulos():
    """Obtiene lista de módulos con disponibilidad"""
    try:
        modulos = suscripcion_modelo.obtener_modulos_disponibles()
        return jsonify({'modulos': modulos}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/modulos/categorias', methods=['GET'])
@requiere_autenticacion
def obtener_modulos_por_categoria():
    """Obtiene módulos agrupados por categoría"""
    try:
        categorias = suscripcion_modelo.obtener_modulos_por_categoria()
        return jsonify({'categorias': categorias}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/modulos/<codigo>/disponible', methods=['GET'])
@requiere_autenticacion
def verificar_modulo_disponible(codigo):
    """Verifica si un módulo específico está disponible"""
    try:
        disponible = suscripcion_modelo.modulo_disponible(codigo)
        return jsonify({
            'codigo': codigo,
            'disponible': disponible
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/rutas-permitidas', methods=['GET'])
@requiere_autenticacion
def obtener_rutas_permitidas():
    """Obtiene lista de rutas del frontend permitidas según el plan"""
    try:
        rutas = suscripcion_modelo.obtener_rutas_permitidas()
        return jsonify({'rutas': rutas}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/planes', methods=['GET'])
@requiere_autenticacion
def obtener_planes():
    """Obtiene todos los planes disponibles para ver opciones de upgrade"""
    try:
        planes = suscripcion_modelo.obtener_todos_planes()
        plan_actual = suscripcion_modelo.obtener_plan_actual()
        
        return jsonify({
            'planes': planes,
            'plan_actual_codigo': plan_actual.get('plan_codigo') if plan_actual else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/planes/comparar', methods=['GET'])
@requiere_autenticacion
def comparar_planes():
    """Obtiene comparación detallada de planes con módulos"""
    try:
        comparacion = suscripcion_modelo.comparar_planes()
        plan_actual = suscripcion_modelo.obtener_plan_actual()
        
        return jsonify({
            'comparacion': comparacion,
            'plan_actual_codigo': plan_actual.get('plan_codigo') if plan_actual else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/limites', methods=['GET'])
@requiere_autenticacion
def verificar_limites():
    """Verifica los límites actuales de la suscripción"""
    try:
        uso = suscripcion_modelo.obtener_uso_actual()
        
        # Verificaciones específicas
        usuarios_ok, usuarios_msg = suscripcion_modelo.verificar_limite_usuarios()
        eventos_ok, eventos_msg = suscripcion_modelo.verificar_limite_eventos_mes()
        clientes_ok, clientes_msg = suscripcion_modelo.verificar_limite_clientes()
        
        return jsonify({
            'uso': uso,
            'verificaciones': {
                'usuarios': {'permitido': usuarios_ok, 'mensaje': usuarios_msg},
                'eventos_mes': {'permitido': eventos_ok, 'mensaje': eventos_msg},
                'clientes': {'permitido': clientes_ok, 'mensaje': clientes_msg}
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================================
# ENDPOINTS DE ADMINISTRACIÓN (Solo para ti como admin del sistema)
# =========================================================

@suscripcion_bp.route('/admin/plan', methods=['PUT'])
@requiere_rol('administrador_sistema')
def admin_cambiar_plan():
    """Cambia el plan de la suscripción (solo admin)"""
    try:
        datos = request.get_json()
        nuevo_plan = datos.get('plan_codigo')
        notas = datos.get('notas')
        
        if not nuevo_plan:
            return jsonify({'error': 'plan_codigo es requerido'}), 400
        
        exito, mensaje = suscripcion_modelo.cambiar_plan(nuevo_plan, notas)
        
        if exito:
            return jsonify({'message': mensaje}), 200
        return jsonify({'error': mensaje}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/admin/modulo/<codigo>', methods=['PUT'])
@requiere_rol('administrador_sistema')
def admin_toggle_modulo(codigo):
    """Habilita o deshabilita un módulo específico (solo admin)"""
    try:
        datos = request.get_json()
        habilitar = datos.get('habilitar', True)
        notas = datos.get('notas')
        
        exito, mensaje = suscripcion_modelo.toggle_modulo(codigo, habilitar, notas)
        
        if exito:
            return jsonify({'message': mensaje}), 200
        return jsonify({'error': mensaje}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/admin/limites', methods=['PUT'])
@requiere_rol('administrador_sistema')
def admin_actualizar_limites():
    """Actualiza límites personalizados (solo admin)"""
    try:
        datos = request.get_json()
        
        exito, mensaje = suscripcion_modelo.actualizar_limites(
            limite_usuarios=datos.get('limite_usuarios'),
            limite_eventos=datos.get('limite_eventos_mes'),
            limite_clientes=datos.get('limite_clientes')
        )
        
        if exito:
            return jsonify({'message': mensaje}), 200
        return jsonify({'error': mensaje}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/admin/estado', methods=['PUT'])
@requiere_rol('administrador', 'administrador_sistema')
def admin_actualizar_estado():
    """Actualiza el estado de la suscripción (solo admin)"""
    try:
        datos = request.get_json()
        nuevo_estado = datos.get('estado')
        fecha_vencimiento = datos.get('fecha_vencimiento')
        notas = datos.get('notas')
        
        if not nuevo_estado:
            return jsonify({'error': 'estado es requerido'}), 400
        
        exito, mensaje = suscripcion_modelo.actualizar_estado_suscripcion(
            nuevo_estado, fecha_vencimiento, notas
        )
        
        if exito:
            return jsonify({'message': mensaje}), 200
        return jsonify({'error': mensaje}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/admin/empresa', methods=['PUT'])
@requiere_rol('administrador_sistema')
def admin_actualizar_empresa():
    """Actualiza información de la empresa cliente (solo admin)"""
    try:
        datos = request.get_json()
        
        exito, mensaje = suscripcion_modelo.actualizar_info_empresa(
            nombre_empresa=datos.get('nombre_empresa'),
            email=datos.get('email_contacto'),
            telefono=datos.get('telefono_contacto')
        )
        
        if exito:
            return jsonify({'message': mensaje}), 200
        return jsonify({'error': mensaje}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def _llamar_meta_pricing_analytics(waba_id, access_token, start_ts, end_ts):
    """Llama a la API de Meta pricing_analytics para obtener volumen y costo."""
    base = f"https://graph.facebook.com/v24.0/{waba_id}/pricing_analytics"
    params = [
        ("start", start_ts),
        ("end", end_ts),
        ("granularity", "MONTHLY"),
        ("metric_types", "VOLUME"),
        ("metric_types", "COST"),
    ]
    qs = "&".join(f"{k}={v}" for k, v in params)
    url = f"{base}?{qs}"
    req = urllib.request.Request(url, method="GET")
    req.add_header("Authorization", f"Bearer {access_token}")
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode("utf-8")
        return json.loads(body) if body else {}


@suscripcion_bp.route('/admin/whatsapp-consumo-meta', methods=['GET'])
@requiere_rol('administrador_sistema')
def admin_whatsapp_consumo_meta():
    """Obtiene consumos y costos desde la API de Meta (pricing_analytics)"""
    try:
        integracion = integracion_modelo.obtener_integracion("whatsapp")
        if not integracion or not integracion.get("configuracion"):
            return jsonify({"error": "Integración WhatsApp no configurada", "conectado": False}), 400
        config = integracion["configuracion"]
        if isinstance(config, str):
            config = json.loads(config or "{}")
        access_token = config.get("access_token")
        waba_id = config.get("waba_id") or None
        if not access_token:
            return jsonify({
                "error": "Falta access_token en la integración WhatsApp",
                "conectado": False,
            }), 400
        if not waba_id:
            return jsonify({
                "error": "Falta WABA ID. Ve a Meta Business Manager → Configuración → Cuentas → WhatsApp Business Accounts y copia el ID.",
                "conectado": False,
            }), 400
        fecha_desde = request.args.get("fecha_desde")
        fecha_hasta = request.args.get("fecha_hasta")
        hoy = datetime.now(timezone.utc)
        if not fecha_desde or not fecha_hasta:
            fecha_desde = hoy.replace(day=1).strftime("%Y-%m-%d")
            fecha_hasta = hoy.strftime("%Y-%m-%d")
        start_dt = datetime.strptime(fecha_desde, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end_dt = datetime.strptime(fecha_hasta, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
        start_ts = int(start_dt.timestamp())
        end_ts = int(end_dt.timestamp())
        data = _llamar_meta_pricing_analytics(waba_id, access_token, start_ts, end_ts)
        rows = data.get("data") or []
        total_volumen = 0
        total_costo = 0.0
        desglose = []
        for row in rows:
            vol = int(row.get("VOLUME") or row.get("volume") or 0)
            cost = float(row.get("COST") or row.get("cost") or 0)
            total_volumen += vol
            total_costo += cost
            dims = row.get("dimensions") or {}
            desglose.append({
                "dimensions": dims,
                "volumen": vol,
                "costo": cost,
            })
        return jsonify({
            "conectado": True,
            "fecha_desde": fecha_desde,
            "fecha_hasta": fecha_hasta,
            "waba_id": waba_id,
            "mensajes_volumen": total_volumen,
            "costo_total": round(total_costo, 2),
            "desglose": desglose,
        }), 200
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8")
        except Exception:
            body = str(e)
        logger.error(f"Meta API error: {e.code} {body}")
        try:
            err_data = json.loads(body) if body else {}
            err_msg = err_data.get("error", {}).get("message", body)
        except Exception:
            err_msg = body
        return jsonify({
            "error": f"Error Meta API: {err_msg}",
            "conectado": False,
        }), 502
    except Exception as e:
        logger.error(f"Error consumo Meta: {e}")
        return jsonify({"error": str(e), "conectado": False}), 500


@suscripcion_bp.route('/admin/whatsapp-consumo', methods=['GET'])
@requiere_rol('administrador_sistema')
def admin_whatsapp_consumo():
    """Obtiene consumos de WhatsApp y costo actual para el admin del sistema"""
    try:
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        # Si no hay fechas, usar mes actual
        if not fecha_desde or not fecha_hasta:
            hoy = datetime.now()
            fecha_desde = hoy.replace(day=1).strftime('%Y-%m-%d')
            fecha_hasta = hoy.strftime('%Y-%m-%d')
        metricas = whatsapp_metricas_modelo.obtener_metricas_globales(fecha_desde, fecha_hasta)
        config = whatsapp_metricas_modelo.obtener_config()
        precio_whatsapp = float(config.get('precio_whatsapp') or 0)
        maximo_whatsapp = config.get('maximo_whatsapp')
        whatsapp_out = int(metricas.get('whatsapp_out') or 0)
        costo_total = float(metricas.get('costo_whatsapp_total') or 0)
        # Si no hay costo almacenado, calcular con precio unitario
        if costo_total == 0 and precio_whatsapp > 0:
            costo_total = whatsapp_out * precio_whatsapp
        return jsonify({
            'fecha_desde': fecha_desde,
            'fecha_hasta': fecha_hasta,
            'precio_unitario': precio_whatsapp,
            'maximo_mensajes': int(maximo_whatsapp) if maximo_whatsapp is not None else None,
            'mensajes_enviados': whatsapp_out,
            'desglose': {
                'chat_bot': int(metricas.get('whatsapp_bot') or 0),
                'chat_humano': int(metricas.get('whatsapp_humano') or 0),
                'notificaciones': int(metricas.get('whatsapp_notificaciones') or 0),
                'entrantes': int(metricas.get('whatsapp_in') or 0),
            },
            'costo_total': round(costo_total, 2),
            'email_enviados': int(metricas.get('email_out') or 0),
            'costo_email': float(metricas.get('costo_email_total') or 0),
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@suscripcion_bp.route('/admin/resumen', methods=['GET'])
@requiere_rol('administrador_sistema')
def admin_resumen_completo():
    """Obtiene resumen completo de la suscripción para admin"""
    try:
        plan = suscripcion_modelo.obtener_plan_actual()
        estado = suscripcion_modelo.obtener_estado_suscripcion()
        uso = suscripcion_modelo.obtener_uso_actual()
        modulos = suscripcion_modelo.obtener_modulos_disponibles(usar_cache=False)
        todos_planes = suscripcion_modelo.obtener_todos_planes()
        
        # Contar módulos por estado
        modulos_activos = sum(1 for m in modulos if m['disponible'])
        modulos_inactivos = len(modulos) - modulos_activos
        
        return jsonify({
            'plan': plan,
            'estado': estado,
            'uso': uso,
            'modulos': {
                'lista': modulos,
                'activos': modulos_activos,
                'inactivos': modulos_inactivos,
                'total': len(modulos)
            },
            'planes_disponibles': todos_planes
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
