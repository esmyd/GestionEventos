"""
Vista para reportes y métricas
"""
import tkinter as tk
from tkinter import ttk, messagebox
from utilidades.colores import ColoresBranding
from utilidades.estilos_formularios import EstilosFormulario
from modelos.evento_modelo import EventoModelo
from modelos.pago_modelo import PagoModelo
from modelos.cliente_modelo import ClienteModelo
from modelos.producto_modelo import ProductoModelo
from modelos.plan_modelo import PlanModelo
from modelos.salon_modelo import SalonModelo


class VistaReportes:
    """Interfaz para reportes y métricas"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.evento_modelo = EventoModelo()
        self.pago_modelo = PagoModelo()
        self.cliente_modelo = ClienteModelo()
        self.producto_modelo = ProductoModelo()
        self.plan_modelo = PlanModelo()
        self.salon_modelo = SalonModelo()
        
        self.crear_widgets()
        self.cargar_metricas()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Reportes y Métricas",
            font=('Arial', 20, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.DORADO_PRINCIPAL
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Frame scrollable para las métricas
        scroll_container, scrollable_frame = EstilosFormulario.crear_frame_scrollable(
            main_frame,
            bg=ColoresBranding.FONDO_CLARO
        )
        scroll_container.pack(fill=tk.BOTH, expand=True, pady=(0, 20))
        
        # Frame interno con padding
        content_frame = tk.Frame(scrollable_frame, bg=ColoresBranding.FONDO_CLARO, padx=10, pady=10)
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Contenedor para las cards de métricas
        self.metricas_container = tk.Frame(content_frame, bg=ColoresBranding.FONDO_CLARO)
        self.metricas_container.pack(fill=tk.BOTH, expand=True)
        
        # Configurar grid
        for i in range(4):
            self.metricas_container.columnconfigure(i, weight=1, uniform="metricas")
        
        # Botones
        button_container = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        button_container.pack(fill=tk.X, pady=(15, 10))
        
        btn_actualizar = EstilosFormulario.crear_button(
            button_container,
            "Actualizar Métricas",
            self.cargar_metricas,
            tipo='principal',
            width=25
        )
        btn_actualizar.pack(side=tk.LEFT)
    
    def crear_card_metrica(self, parent, titulo, valor, subtitulo="", fila=0, columna=0, color_borde=ColoresBranding.DORADO_PRINCIPAL):
        """Crea una card visual para una métrica"""
        # Frame exterior con borde dorado
        card_outer = tk.Frame(parent, bg=color_borde, bd=1, relief=tk.SOLID)
        card_outer.grid(row=fila, column=columna, sticky="nsew", padx=8, pady=8)
        
        # Frame interior blanco
        card_inner = tk.Frame(card_outer, bg=ColoresBranding.CARD, padx=20, pady=20)
        card_inner.pack(fill=tk.BOTH, expand=True, padx=2, pady=2)
        
        # Título
        titulo_label = tk.Label(
            card_inner,
            text=titulo,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.CARD,
            fg=ColoresBranding.TEXTO_OSCURO
        )
        titulo_label.pack(anchor=tk.W, pady=(0, 8))
        
        # Valor principal
        valor_label = tk.Label(
            card_inner,
            text=valor,
            font=('Arial', 24, 'bold'),
            bg=ColoresBranding.CARD,
            fg=color_borde
        )
        valor_label.pack(anchor=tk.W)
        
        # Subtítulo (opcional)
        if subtitulo:
            subtitulo_label = tk.Label(
                card_inner,
                text=subtitulo,
                font=('Arial', 9),
                bg=ColoresBranding.CARD,
                fg=ColoresBranding.TEXTO_GRIS
            )
            subtitulo_label.pack(anchor=tk.W, pady=(5, 0))
        
        return card_outer
    
    def cargar_metricas(self):
        """Carga las métricas en las cards visuales"""
        # Limpiar cards existentes
        for widget in self.metricas_container.winfo_children():
            widget.destroy()
        
        # Obtener datos
        eventos = self.evento_modelo.obtener_todos_eventos()
        clientes = self.cliente_modelo.obtener_todos_clientes()
        productos = self.producto_modelo.obtener_todos_productos(solo_activos=False)
        planes = self.plan_modelo.obtener_todos_planes(solo_activos=False)
        salones = self.salon_modelo.obtener_todos_salones(solo_activos=False)
        
        # Calcular métricas de eventos
        total_eventos = len(eventos)
        eventos_confirmados = len([e for e in eventos if e['estado'] == 'confirmado'])
        eventos_completados = len([e for e in eventos if e['estado'] == 'completado'])
        eventos_en_proceso = len([e for e in eventos if e['estado'] == 'en_proceso'])
        eventos_cotizacion = len([e for e in eventos if e['estado'] == 'cotizacion'])
        eventos_cancelados = len([e for e in eventos if e['estado'] == 'cancelado'])
        
        # Calcular métricas financieras
        total_ingresos = sum(float(e.get('total', e.get('precio_total', 0) or 0)) for e in eventos)
        total_pendiente = sum(float(e.get('saldo', e.get('saldo_pendiente', 0) or 0)) for e in eventos)
        total_cobrado = total_ingresos - total_pendiente
        porcentaje_cobrado = (total_cobrado / total_ingresos * 100) if total_ingresos > 0 else 0
        ticket_promedio = (total_ingresos / total_eventos) if total_eventos > 0 else 0
        
        # Calcular total de pagos
        total_pagos = 0
        for evento in eventos:
            evento_id = evento.get('id_evento') or evento.get('id')
            pagos = self.pago_modelo.obtener_pagos_por_evento(evento_id)
            total_pagos += len(pagos)
        
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
        
        # FILA 1: Métricas principales de eventos
        fila = 0
        self.crear_card_metrica(
            self.metricas_container,
            "Total de Eventos",
            str(total_eventos),
            "Todos los eventos registrados",
            fila, 0,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Eventos Confirmados",
            str(eventos_confirmados),
            "Eventos confirmados por clientes",
            fila, 1,
            ColoresBranding.DORADO_MEDIO
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Eventos Completados",
            str(eventos_completados),
            "Eventos finalizados exitosamente",
            fila, 2,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Eventos en Proceso",
            str(eventos_en_proceso),
            "Eventos actualmente en ejecución",
            fila, 3,
            ColoresBranding.DORADO_MEDIO
        )
        
        # FILA 2: Métricas financieras
        fila = 1
        self.crear_card_metrica(
            self.metricas_container,
            "Total de Ingresos",
            f"${total_ingresos:,.2f}",
            "Ingresos totales de todos los eventos",
            fila, 0,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Total Cobrado",
            f"${total_cobrado:,.2f}",
            "Total recibido hasta el momento",
            fila, 1,
            ColoresBranding.DORADO_MEDIO
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Total Pendiente",
            f"${total_pendiente:,.2f}",
            "Saldo pendiente por cobrar",
            fila, 2,
            '#dc3545' if total_pendiente > 0 else ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "% Cobrado",
            f"{porcentaje_cobrado:.1f}%",
            "Porcentaje de ingresos cobrados",
            fila, 3,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        # FILA 3: Métricas de clientes y operaciones
        fila = 2
        self.crear_card_metrica(
            self.metricas_container,
            "Total de Clientes",
            str(total_clientes),
            "Clientes registrados en el sistema",
            fila, 0,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Total de Pagos",
            str(total_pagos),
            "Pagos registrados en el sistema",
            fila, 1,
            ColoresBranding.DORADO_MEDIO
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Ticket Promedio",
            f"${ticket_promedio:,.2f}",
            "Promedio de precio por evento",
            fila, 2,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Promedio Eventos/Cliente",
            f"{promedio_eventos_cliente:.1f}",
            "Promedio de eventos por cliente",
            fila, 3,
            ColoresBranding.DORADO_MEDIO
        )
        
        # FILA 4: Métricas de recursos
        fila = 3
        self.crear_card_metrica(
            self.metricas_container,
            "Total Productos",
            str(total_productos),
            f"Productos totales ({productos_activos} activos)",
            fila, 0,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Total Planes",
            str(total_planes),
            f"Planes totales ({planes_activos} activos)",
            fila, 1,
            ColoresBranding.DORADO_MEDIO
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Total Salones",
            str(total_salones),
            f"Salones totales ({salones_activos} activos)",
            fila, 2,
            ColoresBranding.DORADO_PRINCIPAL
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Promedio Invitados",
            f"{promedio_invitados:.0f}",
            "Promedio de invitados por evento",
            fila, 3,
            ColoresBranding.DORADO_MEDIO
        )
        
        # FILA 5: Estados adicionales
        fila = 4
        self.crear_card_metrica(
            self.metricas_container,
            "Cotizaciones",
            str(eventos_cotizacion),
            "Eventos en etapa de cotización",
            fila, 0,
            ColoresBranding.DORADO_CLARO
        )
        
        self.crear_card_metrica(
            self.metricas_container,
            "Cancelados",
            str(eventos_cancelados),
            "Eventos cancelados",
            fila, 1,
            '#dc3545'
        )

