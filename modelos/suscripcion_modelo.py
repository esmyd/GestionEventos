"""
Modelo para gestión de suscripciones, planes y módulos
Sistema de control de features por cliente/instancia
"""
import json
from datetime import datetime, date
from modelos.base_datos import BaseDatos


class SuscripcionModelo:
    """Clase para gestionar la suscripción y módulos disponibles"""
    
    def __init__(self):
        self.base_datos = BaseDatos()
        self._cache_modulos = None
        self._cache_timestamp = None
        self._cache_ttl = 60  # Cache por 60 segundos
    
    # =========================================================
    # INFORMACIÓN DEL PLAN ACTUAL
    # =========================================================
    
    def obtener_plan_actual(self):
        """Obtiene información completa del plan actual de la instancia"""
        consulta = """
        SELECT 
            s.id as suscripcion_id,
            s.nombre_empresa,
            s.email_contacto,
            s.telefono_contacto,
            s.estado,
            s.fecha_inicio,
            s.fecha_vencimiento,
            DATEDIFF(s.fecha_vencimiento, CURDATE()) as dias_restantes,
            s.ciclo_facturacion,
            s.modulos_adicionales,
            s.modulos_deshabilitados,
            s.notas_admin,
            p.id as plan_id,
            p.codigo as plan_codigo,
            p.nombre as plan_nombre,
            p.descripcion as plan_descripcion,
            p.precio_mensual,
            p.precio_anual,
            p.color_tema,
            p.icono as plan_icono,
            COALESCE(s.limite_usuarios_custom, p.limite_usuarios) as limite_usuarios,
            COALESCE(s.limite_eventos_mes_custom, p.limite_eventos_mes) as limite_eventos_mes,
            COALESCE(s.limite_clientes_custom, p.limite_clientes) as limite_clientes,
            p.limite_productos,
            p.limite_salones
        FROM suscripcion_actual s
        JOIN planes_sistema p ON s.plan_id = p.id
        LIMIT 1
        """
        resultado = self.base_datos.obtener_uno(consulta)
        
        if resultado:
            # Convertir fechas a string
            for campo in ['fecha_inicio', 'fecha_vencimiento']:
                if resultado.get(campo) and isinstance(resultado[campo], (datetime, date)):
                    resultado[campo] = resultado[campo].strftime('%Y-%m-%d')
            
            # Parsear JSON
            for campo in ['modulos_adicionales', 'modulos_deshabilitados']:
                if resultado.get(campo):
                    try:
                        if isinstance(resultado[campo], str):
                            resultado[campo] = json.loads(resultado[campo])
                    except:
                        resultado[campo] = []
                else:
                    resultado[campo] = []
        
        return resultado
    
    def obtener_estado_suscripcion(self):
        """Obtiene el estado resumido de la suscripción"""
        plan = self.obtener_plan_actual()
        if not plan:
            return {
                'activa': False,
                'mensaje': 'Sin suscripción configurada',
                'estado': 'sin_configurar'
            }
        
        dias_restantes = plan.get('dias_restantes', 0)
        estado = plan.get('estado', 'activa')
        
        if estado == 'suspendida':
            return {
                'activa': False,
                'mensaje': 'Suscripción suspendida. Contacte a soporte.',
                'estado': 'suspendida'
            }
        elif estado == 'cancelada':
            return {
                'activa': False,
                'mensaje': 'Suscripción cancelada.',
                'estado': 'cancelada'
            }
        elif estado == 'vencida' or (dias_restantes is not None and dias_restantes < 0):
            return {
                'activa': False,
                'mensaje': 'Suscripción vencida. Renueve para continuar.',
                'estado': 'vencida',
                'dias_vencida': abs(dias_restantes) if dias_restantes else 0
            }
        elif estado == 'prueba':
            return {
                'activa': True,
                'mensaje': f'Período de prueba: {dias_restantes} días restantes',
                'estado': 'prueba',
                'dias_restantes': dias_restantes
            }
        else:
            return {
                'activa': True,
                'mensaje': 'Suscripción activa',
                'estado': 'activa',
                'dias_restantes': dias_restantes
            }
    
    # =========================================================
    # MÓDULOS DISPONIBLES
    # =========================================================
    
    def obtener_modulos_disponibles(self, usar_cache=True):
        """Obtiene todos los módulos con su estado de disponibilidad"""
        # Verificar cache
        if usar_cache and self._cache_modulos:
            tiempo_actual = datetime.now().timestamp()
            if self._cache_timestamp and (tiempo_actual - self._cache_timestamp) < self._cache_ttl:
                return self._cache_modulos
        
        consulta = """
        SELECT 
            m.id,
            m.codigo,
            m.nombre,
            m.descripcion,
            m.icono,
            m.categoria,
            m.ruta_frontend,
            m.orden,
            CASE 
                WHEN JSON_CONTAINS(COALESCE(s.modulos_adicionales, '[]'), CONCAT('"', m.codigo, '"')) THEN TRUE
                WHEN JSON_CONTAINS(COALESCE(s.modulos_deshabilitados, '[]'), CONCAT('"', m.codigo, '"')) THEN FALSE
                WHEN pm.incluido = TRUE THEN TRUE
                ELSE FALSE
            END as disponible,
            CASE 
                WHEN JSON_CONTAINS(COALESCE(s.modulos_adicionales, '[]'), CONCAT('"', m.codigo, '"')) THEN 'adicional'
                WHEN pm.incluido = TRUE THEN 'plan'
                ELSE 'no_incluido'
            END as origen
        FROM modulos_sistema m
        CROSS JOIN suscripcion_actual s
        LEFT JOIN plan_modulos pm ON pm.modulo_id = m.id AND pm.plan_id = s.plan_id
        WHERE m.activo = TRUE
        ORDER BY m.categoria, m.orden
        """
        modulos = self.base_datos.obtener_todos(consulta) or []
        
        # Convertir booleanos
        for modulo in modulos:
            modulo['disponible'] = bool(modulo.get('disponible'))
        
        # Guardar en cache
        self._cache_modulos = modulos
        self._cache_timestamp = datetime.now().timestamp()
        
        return modulos
    
    def modulo_disponible(self, codigo_modulo):
        """Verifica si un módulo específico está disponible"""
        modulos = self.obtener_modulos_disponibles()
        for modulo in modulos:
            if modulo['codigo'] == codigo_modulo:
                return modulo['disponible']
        return False
    
    def obtener_modulos_por_categoria(self):
        """Obtiene módulos agrupados por categoría"""
        modulos = self.obtener_modulos_disponibles()
        
        categorias = {
            'core': {'nombre': 'Funciones Principales', 'modulos': []},
            'finanzas': {'nombre': 'Finanzas y Reportes', 'modulos': []},
            'comunicacion': {'nombre': 'Comunicación', 'modulos': []},
            'integracion': {'nombre': 'Integraciones', 'modulos': []},
            'avanzado': {'nombre': 'Funciones Avanzadas', 'modulos': []}
        }
        
        for modulo in modulos:
            cat = modulo.get('categoria', 'core')
            if cat in categorias:
                categorias[cat]['modulos'].append(modulo)
        
        return categorias
    
    def obtener_rutas_permitidas(self):
        """Obtiene lista de rutas del frontend que están permitidas"""
        modulos = self.obtener_modulos_disponibles()
        rutas = []
        
        for modulo in modulos:
            if modulo['disponible'] and modulo.get('ruta_frontend'):
                rutas.append(modulo['ruta_frontend'])
        
        return rutas
    
    def invalidar_cache(self):
        """Invalida el cache de módulos (llamar después de cambios)"""
        self._cache_modulos = None
        self._cache_timestamp = None
    
    # =========================================================
    # PLANES DISPONIBLES
    # =========================================================
    
    def obtener_todos_planes(self, solo_activos=True):
        """Obtiene todos los planes disponibles"""
        consulta = """
        SELECT 
            p.*,
            (SELECT COUNT(*) FROM plan_modulos pm WHERE pm.plan_id = p.id AND pm.incluido = TRUE) as total_modulos
        FROM planes_sistema p
        """
        if solo_activos:
            consulta += " WHERE p.activo = TRUE"
        consulta += " ORDER BY p.orden"
        
        planes = self.base_datos.obtener_todos(consulta) or []
        
        # Convertir decimales y booleanos
        for plan in planes:
            plan['precio_mensual'] = float(plan.get('precio_mensual') or 0)
            plan['precio_anual'] = float(plan.get('precio_anual') or 0)
            plan['destacado'] = bool(plan.get('destacado'))
            plan['activo'] = bool(plan.get('activo'))
        
        return planes
    
    def obtener_plan_por_codigo(self, codigo):
        """Obtiene un plan específico por su código"""
        consulta = """
        SELECT p.*
        FROM planes_sistema p
        WHERE p.codigo = %s AND p.activo = TRUE
        """
        plan = self.base_datos.obtener_uno(consulta, (codigo,))
        
        if plan:
            plan['precio_mensual'] = float(plan.get('precio_mensual') or 0)
            plan['precio_anual'] = float(plan.get('precio_anual') or 0)
            
            # Obtener módulos del plan
            plan['modulos'] = self.obtener_modulos_plan(plan['id'])
        
        return plan
    
    def obtener_modulos_plan(self, plan_id):
        """Obtiene los módulos incluidos en un plan"""
        consulta = """
        SELECT m.codigo, m.nombre, m.descripcion, m.icono, m.categoria
        FROM plan_modulos pm
        JOIN modulos_sistema m ON pm.modulo_id = m.id
        WHERE pm.plan_id = %s AND pm.incluido = TRUE AND m.activo = TRUE
        ORDER BY m.categoria, m.orden
        """
        return self.base_datos.obtener_todos(consulta, (plan_id,)) or []
    
    def comparar_planes(self):
        """Obtiene comparación de todos los planes con sus módulos"""
        planes = self.obtener_todos_planes()
        modulos = self.base_datos.obtener_todos(
            "SELECT id, codigo, nombre, categoria FROM modulos_sistema WHERE activo = TRUE ORDER BY categoria, orden"
        ) or []
        
        # Obtener matriz de plan-módulos
        consulta_matriz = """
        SELECT pm.plan_id, m.codigo as modulo_codigo, pm.incluido
        FROM plan_modulos pm
        JOIN modulos_sistema m ON pm.modulo_id = m.id
        """
        matriz = self.base_datos.obtener_todos(consulta_matriz) or []
        
        # Crear lookup
        incluidos = {}
        for item in matriz:
            key = f"{item['plan_id']}_{item['modulo_codigo']}"
            incluidos[key] = bool(item['incluido'])
        
        # Estructurar respuesta
        for plan in planes:
            plan['modulos_incluidos'] = {}
            for modulo in modulos:
                key = f"{plan['id']}_{modulo['codigo']}"
                plan['modulos_incluidos'][modulo['codigo']] = incluidos.get(key, False)
        
        return {
            'planes': planes,
            'modulos': modulos
        }
    
    # =========================================================
    # ADMINISTRACIÓN (Solo para admin del sistema)
    # =========================================================
    
    def cambiar_plan(self, nuevo_plan_codigo, notas=None):
        """Cambia el plan de la suscripción actual"""
        # Obtener ID del nuevo plan
        plan = self.base_datos.obtener_uno(
            "SELECT id FROM planes_sistema WHERE codigo = %s AND activo = TRUE",
            (nuevo_plan_codigo,)
        )
        
        if not plan:
            return False, "Plan no encontrado o inactivo"
        
        # Actualizar suscripción
        consulta = """
        UPDATE suscripcion_actual
        SET 
            plan_id = %s,
            notas_admin = CONCAT(COALESCE(notas_admin, ''), '\n[', NOW(), '] Cambio de plan: ', %s),
            fecha_actualizacion = NOW()
        """
        
        resultado = self.base_datos.ejecutar_consulta(consulta, (plan['id'], notas or 'Sin notas'))
        
        if resultado:
            self.invalidar_cache()
            return True, "Plan actualizado exitosamente"
        
        return False, "Error al actualizar el plan"
    
    def toggle_modulo(self, codigo_modulo, habilitar, notas=None):
        """Habilita o deshabilita un módulo específico"""
        # Verificar que el módulo existe
        modulo = self.base_datos.obtener_uno(
            "SELECT id FROM modulos_sistema WHERE codigo = %s",
            (codigo_modulo,)
        )
        
        if not modulo:
            return False, "Módulo no encontrado"
        
        # Obtener configuración actual
        suscripcion = self.base_datos.obtener_uno(
            "SELECT modulos_adicionales, modulos_deshabilitados FROM suscripcion_actual LIMIT 1"
        )
        
        if not suscripcion:
            return False, "No hay suscripción configurada"
        
        adicionales = json.loads(suscripcion['modulos_adicionales'] or '[]')
        deshabilitados = json.loads(suscripcion['modulos_deshabilitados'] or '[]')
        
        if habilitar:
            # Agregar a adicionales si no está
            if codigo_modulo not in adicionales:
                adicionales.append(codigo_modulo)
            # Remover de deshabilitados si está
            if codigo_modulo in deshabilitados:
                deshabilitados.remove(codigo_modulo)
        else:
            # Agregar a deshabilitados si no está
            if codigo_modulo not in deshabilitados:
                deshabilitados.append(codigo_modulo)
            # Remover de adicionales si está
            if codigo_modulo in adicionales:
                adicionales.remove(codigo_modulo)
        
        # Actualizar
        accion = 'Habilitado' if habilitar else 'Deshabilitado'
        nota_completa = f"{accion} módulo: {codigo_modulo}"
        if notas:
            nota_completa += f" - {notas}"
        
        consulta = """
        UPDATE suscripcion_actual
        SET 
            modulos_adicionales = %s,
            modulos_deshabilitados = %s,
            notas_admin = CONCAT(COALESCE(notas_admin, ''), '\n[', NOW(), '] ', %s)
        """
        
        resultado = self.base_datos.ejecutar_consulta(
            consulta, 
            (json.dumps(adicionales), json.dumps(deshabilitados), nota_completa)
        )
        
        if resultado:
            self.invalidar_cache()
            return True, f"Módulo {accion.lower()} exitosamente"
        
        return False, "Error al actualizar el módulo"
    
    def actualizar_limites(self, limite_usuarios=None, limite_eventos=None, limite_clientes=None):
        """Actualiza límites personalizados de la suscripción"""
        campos = []
        valores = []
        
        if limite_usuarios is not None:
            campos.append("limite_usuarios_custom = %s")
            valores.append(limite_usuarios if limite_usuarios > 0 else None)
        
        if limite_eventos is not None:
            campos.append("limite_eventos_mes_custom = %s")
            valores.append(limite_eventos if limite_eventos > 0 else None)
        
        if limite_clientes is not None:
            campos.append("limite_clientes_custom = %s")
            valores.append(limite_clientes if limite_clientes > 0 else None)
        
        if not campos:
            return False, "No hay cambios que aplicar"
        
        consulta = f"UPDATE suscripcion_actual SET {', '.join(campos)}"
        resultado = self.base_datos.ejecutar_consulta(consulta, tuple(valores))
        
        if resultado:
            self.invalidar_cache()
            return True, "Límites actualizados"
        
        return False, "Error al actualizar límites"
    
    def actualizar_estado_suscripcion(self, nuevo_estado, fecha_vencimiento=None, notas=None):
        """Actualiza el estado de la suscripción"""
        estados_validos = ['activa', 'prueba', 'suspendida', 'cancelada', 'vencida']
        if nuevo_estado not in estados_validos:
            return False, f"Estado inválido. Válidos: {', '.join(estados_validos)}"
        
        campos = ["estado = %s"]
        valores = [nuevo_estado]
        
        if fecha_vencimiento:
            campos.append("fecha_vencimiento = %s")
            valores.append(fecha_vencimiento)
        
        nota_registro = f"Estado cambiado a: {nuevo_estado}"
        if notas:
            nota_registro += f" - {notas}"
        
        campos.append("notas_admin = CONCAT(COALESCE(notas_admin, ''), '\n[', NOW(), '] ', %s)")
        valores.append(nota_registro)
        
        consulta = f"UPDATE suscripcion_actual SET {', '.join(campos)}"
        resultado = self.base_datos.ejecutar_consulta(consulta, tuple(valores))
        
        if resultado:
            self.invalidar_cache()
            return True, "Estado actualizado"
        
        return False, "Error al actualizar estado"
    
    def actualizar_info_empresa(self, nombre_empresa=None, email=None, telefono=None):
        """Actualiza información de la empresa cliente"""
        campos = []
        valores = []
        
        if nombre_empresa:
            campos.append("nombre_empresa = %s")
            valores.append(nombre_empresa)
        
        if email:
            campos.append("email_contacto = %s")
            valores.append(email)
        
        if telefono:
            campos.append("telefono_contacto = %s")
            valores.append(telefono)
        
        if not campos:
            return False, "No hay cambios que aplicar"
        
        consulta = f"UPDATE suscripcion_actual SET {', '.join(campos)}"
        resultado = self.base_datos.ejecutar_consulta(consulta, tuple(valores))
        
        return (True, "Información actualizada") if resultado else (False, "Error al actualizar")
    
    # =========================================================
    # VERIFICACIÓN DE LÍMITES
    # =========================================================
    
    def verificar_limite_usuarios(self):
        """Verifica si se puede crear más usuarios"""
        plan = self.obtener_plan_actual()
        if not plan:
            return False, "Sin suscripción"
        
        limite = plan.get('limite_usuarios', 2)
        
        # Contar usuarios activos
        resultado = self.base_datos.obtener_uno(
            "SELECT COUNT(*) as total FROM usuarios WHERE activo = TRUE"
        )
        actual = resultado.get('total', 0) if resultado else 0
        
        if actual >= limite:
            return False, f"Límite de usuarios alcanzado ({actual}/{limite})"
        
        return True, f"Usuarios: {actual}/{limite}"
    
    def verificar_limite_eventos_mes(self):
        """Verifica si se puede crear más eventos este mes"""
        plan = self.obtener_plan_actual()
        if not plan:
            return False, "Sin suscripción"
        
        limite = plan.get('limite_eventos_mes', 20)
        
        # Contar eventos del mes actual
        resultado = self.base_datos.obtener_uno("""
            SELECT COUNT(*) as total FROM eventos 
            WHERE MONTH(fecha_creacion) = MONTH(CURDATE()) 
            AND YEAR(fecha_creacion) = YEAR(CURDATE())
        """)
        actual = resultado.get('total', 0) if resultado else 0
        
        if actual >= limite:
            return False, f"Límite de eventos del mes alcanzado ({actual}/{limite})"
        
        return True, f"Eventos este mes: {actual}/{limite}"
    
    def verificar_limite_clientes(self):
        """Verifica si se puede crear más clientes"""
        plan = self.obtener_plan_actual()
        if not plan:
            return False, "Sin suscripción"
        
        limite = plan.get('limite_clientes', 100)
        
        resultado = self.base_datos.obtener_uno(
            "SELECT COUNT(*) as total FROM clientes"
        )
        actual = resultado.get('total', 0) if resultado else 0
        
        if actual >= limite:
            return False, f"Límite de clientes alcanzado ({actual}/{limite})"
        
        return True, f"Clientes: {actual}/{limite}"
    
    def obtener_uso_actual(self):
        """Obtiene resumen del uso actual vs límites"""
        plan = self.obtener_plan_actual()
        if not plan:
            return None
        
        # Contar recursos
        usuarios = self.base_datos.obtener_uno(
            "SELECT COUNT(*) as total FROM usuarios WHERE activo = TRUE"
        )
        eventos_mes = self.base_datos.obtener_uno("""
            SELECT COUNT(*) as total FROM eventos 
            WHERE MONTH(fecha_creacion) = MONTH(CURDATE()) 
            AND YEAR(fecha_creacion) = YEAR(CURDATE())
        """)
        clientes = self.base_datos.obtener_uno(
            "SELECT COUNT(*) as total FROM clientes"
        )
        productos = self.base_datos.obtener_uno(
            "SELECT COUNT(*) as total FROM productos WHERE activo = TRUE"
        )
        salones = self.base_datos.obtener_uno(
            "SELECT COUNT(*) as total FROM salones WHERE activo = TRUE"
        )
        
        return {
            'usuarios': {
                'actual': usuarios.get('total', 0) if usuarios else 0,
                'limite': plan.get('limite_usuarios', 2),
                'porcentaje': min(100, round((usuarios.get('total', 0) / plan.get('limite_usuarios', 2)) * 100)) if plan.get('limite_usuarios') else 0
            },
            'eventos_mes': {
                'actual': eventos_mes.get('total', 0) if eventos_mes else 0,
                'limite': plan.get('limite_eventos_mes', 20),
                'porcentaje': min(100, round((eventos_mes.get('total', 0) / plan.get('limite_eventos_mes', 20)) * 100)) if plan.get('limite_eventos_mes') else 0
            },
            'clientes': {
                'actual': clientes.get('total', 0) if clientes else 0,
                'limite': plan.get('limite_clientes', 100),
                'porcentaje': min(100, round((clientes.get('total', 0) / plan.get('limite_clientes', 100)) * 100)) if plan.get('limite_clientes') else 0
            },
            'productos': {
                'actual': productos.get('total', 0) if productos else 0,
                'limite': plan.get('limite_productos', 50)
            },
            'salones': {
                'actual': salones.get('total', 0) if salones else 0,
                'limite': plan.get('limite_salones', 2)
            }
        }
