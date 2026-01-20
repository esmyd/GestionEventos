"""
Vista para gestión de eventos
"""
import tkinter as tk
from tkinter import ttk
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import centrar_ventana, mostrar_error, mostrar_advertencia, mostrar_info, confirmar
from utilidades.widgets_fecha import SelectorFecha, SelectorHora
from utilidades.colores import ColoresBranding
from utilidades.estilos_formularios import EstilosFormulario
from modelos.evento_modelo import EventoModelo
from modelos.cliente_modelo import ClienteModelo
from modelos.plan_modelo import PlanModelo
from modelos.usuario_modelo import UsuarioModelo
from modelos.salon_modelo import SalonModelo
from modelos.cliente_modelo import ClienteModelo
from modelos.usuario_modelo import UsuarioModelo
from modelos.autenticacion import Autenticacion
from modelos.tipo_evento_modelo import TipoEventoModelo
from modelos.producto_modelo import ProductoModelo

class VistaEventos:
    """Interfaz para gestión de eventos"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = EventoModelo()
        self.cliente_modelo = ClienteModelo()
        self.plan_modelo = PlanModelo()
        self.usuario_modelo = UsuarioModelo()
        self.salon_modelo = SalonModelo()
        self.tipo_evento_modelo = TipoEventoModelo()
        self.producto_modelo = ProductoModelo()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Gestión de Eventos",
            font=('Arial', 18, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Tabla de eventos
        table_outer, table_frame = EstilosFormulario.crear_label_frame(
            main_frame,
            "Lista de Eventos",
            padx=15,
            pady=15
        )
        table_outer.pack(fill=tk.BOTH, expand=True)
        
        # Crear frame intermedio para scrollbars y tabla (usando pack)
        scroll_frame = tk.Frame(table_frame, bg=ColoresBranding.FONDO_CLARO)
        scroll_frame.pack(fill=tk.BOTH, expand=True)
        
        # Frame superior para tabla y scrollbar vertical
        top_frame = tk.Frame(scroll_frame, bg=ColoresBranding.FONDO_CLARO)
        top_frame.pack(fill=tk.BOTH, expand=True)
        
        columns = ('Salón', 'Cliente', 'Evento','Tipo de Evento', 'Hora Inicio', 'Hora Fin', 'Fecha', 'Estado', 'Total', 'Saldo')
        self.tree = ttk.Treeview(top_frame, columns=columns, show='headings', height=15)
        
        # Configurar columnas con anchos apropiados
        anchos_columnas = {
            'Salón': 120,
            'Cliente': 150,
            'Evento': 180,
            'Tipo de Evento': 150,
            'Hora Inicio': 100,
            'Hora Fin': 100,
            'Fecha': 120,
            'Estado': 120,
            'Total': 100,
            'Saldo': 100
        }
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=anchos_columnas.get(col, 120), anchor=tk.W)
        
        # Scrollbar vertical (arriba y abajo) - debe estar en top_frame junto con tree
        scrollbar_vertical = ttk.Scrollbar(top_frame, orient=tk.VERTICAL, command=self.tree.yview)
        scrollbar_vertical.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Treeview en top_frame
        self.tree.configure(yscrollcommand=scrollbar_vertical.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Scrollbar horizontal (izquierda y derecha) - en scroll_frame (abajo)
        scrollbar_horizontal = ttk.Scrollbar(scroll_frame, orient=tk.HORIZONTAL, command=self.tree.xview)
        scrollbar_horizontal.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.tree.configure(xscrollcommand=scrollbar_horizontal.set)
        
        # Botones organizados en dos filas
        button_container = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        button_container.pack(fill=tk.X, pady=(15, 10))
        
        # Primera fila
        button_frame_1 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_1.pack(fill=tk.X, pady=(0, 8))
        
        if self.usuario['rol'] in ['administrador', 'coordinador']:
            btn_nuevo = EstilosFormulario.crear_button(
                button_frame_1,
                "Nuevo Evento",
                self.nuevo_evento,
                tipo='principal',
                width=18
            )
            btn_nuevo.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_ver = EstilosFormulario.crear_button(
            button_frame_1,
            "Ver Detalles",
            self.ver_detalles,
            tipo='info',
            width=18
        )
        btn_ver.pack(side=tk.LEFT, padx=(0, 8) if self.usuario['rol'] in ['administrador', 'coordinador'] else (0, 0), fill=tk.X, expand=True)
        
        # Segunda fila
        button_frame_2 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_2.pack(fill=tk.X)
        
        if self.usuario['rol'] in ['administrador', 'coordinador']:
            btn_actualizar = EstilosFormulario.crear_button(
                button_frame_2,
                "Actualizar Estado",
                self.actualizar_estado,
                tipo='secundario',
                width=18
            )
            btn_actualizar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_refrescar = EstilosFormulario.crear_button(
            button_frame_2,
            "Refrescar",
            self.cargar_datos,
            tipo='info',
            width=18
        )
        btn_refrescar.pack(side=tk.LEFT, fill=tk.X, expand=True)
    
    def cargar_datos(self):
        """Carga los eventos en la tabla"""
        for item in self.tree.get_children(): #¿que es tree? es el treeview de la tabla de eventos
            self.tree.delete(item)
        
        # Filtrar según rol
        if self.usuario['rol'] == 'cliente':
            cliente = self.cliente_modelo.obtener_cliente_por_usuario(self.usuario['id'])
            if cliente:
                eventos = self.modelo.obtener_eventos_por_cliente(cliente['id'])
            else:
                eventos = []
        elif self.usuario['rol'] == 'coordinador':
            eventos = self.modelo.obtener_eventos_por_coordinador(self.usuario['id'])
        else:
            eventos = self.modelo.obtener_todos_eventos()
            #print("eventos: ", eventos)
        for evento in eventos:
            print("evento: ", evento)
            # Obtener el ID del evento
            evento_id = evento.get('id_evento') or evento.get('id')
            # Guardar el ID en los tags del item para poder recuperarlo después
            self.tree.insert('', tk.END, values=(
                evento.get('salon', 'N/A'),
                evento.get('nombre_cliente', 'N/A'),
                evento.get('nombre_evento', 'N/A'),
                evento.get('tipo_evento', 'N/A'),
                str(evento.get('hora_inicio', 'N/A')),
                str(evento.get('hora_fin', 'N/A')),
                evento.get('fecha_evento', 'N/A'),
                evento.get('estado', 'N/A'),
                f"${evento.get('total', evento.get('precio_total', 0)):.2f}",
                f"${evento.get('saldo', evento.get('saldo_pendiente', 0)):.2f}"
            ), tags=(str(evento_id),))
    
    def nuevo_evento(self):
        """Abre ventana para crear nuevo evento"""
        ventana = tk.Toplevel(self.parent)
        ventana.title("Nuevo Evento")
        ventana.geometry("750x800")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 750, 800)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        # Variables
        cliente_id_var = tk.StringVar()
        salon_id_var = tk.StringVar()
        plan_id_var = tk.StringVar()
        nombre_var = tk.StringVar()
        tipo_var = tk.StringVar()
        invitados_var = tk.StringVar()
        precio_var = tk.StringVar()
        precio_plan_var = tk.StringVar(value="0.00")
        precio_productos_var = tk.StringVar(value="0.00")
        observaciones_text = None
        selector_fecha = None
        selector_hora = None
        productos_adicionales = []  # Lista de productos adicionales: [{'producto_id': int, 'nombre': str, 'cantidad': int, 'precio_unitario': float}]
        
        # Obtener clientes, salones y planes
        clientes = self.cliente_modelo.obtener_todos_clientes()
        salones = self.salon_modelo.obtener_todos_salones(solo_activos=True)
        planes = self.plan_modelo.obtener_todos_planes()
        
        # Frame principal con estilo
        main_frame = EstilosFormulario.configurar_ventana_formulario(ventana, "Nuevo Evento", 750, 800)
        
        # Crear frame scrollable para el formulario completo
        scroll_container, scrollable_frame = EstilosFormulario.crear_frame_scrollable(
            main_frame,
            bg=ColoresBranding.FONDO_CLARO
        )
        scroll_container.pack(fill=tk.BOTH, expand=True)
        
        # Frame interno con padding
        form_padding = tk.Frame(scrollable_frame, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        form_padding.pack(fill=tk.BOTH, expand=True)
        
        # Configurar columnas para que se expandan
        form_padding.columnconfigure(1, weight=1)
        
        row = 0
        # Cliente
        label = EstilosFormulario.crear_label(form_padding, "Cliente *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        cliente_frame = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        cliente_frame.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12))
        cliente_combo = EstilosFormulario.crear_combobox(cliente_frame, textvariable=cliente_id_var, values=[], width=35)
        cliente_combo['values'] = [f"{c['id']} - {c['nombre_completo']}" for c in clientes]
        cliente_combo.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        def crear_cliente_desde_evento():
            """Crea un cliente desde la ventana de evento"""
            ventana_cliente = tk.Toplevel(ventana)
            ventana_cliente.title("Nuevo Cliente")
            ventana_cliente.geometry("500x450")
            ventana_cliente.configure(bg='#ecf0f1')
            centrar_ventana(ventana_cliente, 500, 450)
            ventana_cliente.transient(ventana)
            ventana_cliente.grab_set()
            
            
            
            cliente_modelo = ClienteModelo()
            usuario_modelo = UsuarioModelo()
            auth = Autenticacion()
            
            # Variables
            nombre_usuario_var = tk.StringVar()
            contrasena_var = tk.StringVar()
            nombre_completo_var = tk.StringVar()
            email_var = tk.StringVar()
            telefono_var = tk.StringVar()
            documento_var = tk.StringVar()
            direccion_text = None
            
            main_frame_cliente = tk.Frame(ventana_cliente, bg='#ecf0f1', padx=20, pady=20)
            main_frame_cliente.pack(fill=tk.BOTH, expand=True)
            
            row_cli = 0
            tk.Label(main_frame_cliente, text="Nombre Usuario *:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=row_cli, column=0, sticky=tk.W, pady=5
            )
            tk.Entry(main_frame_cliente, textvariable=nombre_usuario_var, width=40).grid(
                row=row_cli, column=1, pady=5, padx=5
            )
            
            row_cli += 1
            tk.Label(main_frame_cliente, text="Contraseña *:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=row_cli, column=0, sticky=tk.W, pady=5
            )
            tk.Entry(main_frame_cliente, textvariable=contrasena_var, show='*', width=40).grid(
                row=row_cli, column=1, pady=5, padx=5
            )
            
            row_cli += 1
            tk.Label(main_frame_cliente, text="Nombre Completo *:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=row_cli, column=0, sticky=tk.W, pady=5
            )
            tk.Entry(main_frame_cliente, textvariable=nombre_completo_var, width=40).grid(
                row=row_cli, column=1, pady=5, padx=5
            )
            
            row_cli += 1
            tk.Label(main_frame_cliente, text="Email:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=row_cli, column=0, sticky=tk.W, pady=5
            )
            tk.Entry(main_frame_cliente, textvariable=email_var, width=40).grid(
                row=row_cli, column=1, pady=5, padx=5
            )
            
            row_cli += 1
            tk.Label(main_frame_cliente, text="Teléfono:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=row_cli, column=0, sticky=tk.W, pady=5
            )
            tk.Entry(main_frame_cliente, textvariable=telefono_var, width=40).grid(
                row=row_cli, column=1, pady=5, padx=5
            )
            
            row_cli += 1
            tk.Label(main_frame_cliente, text="Documento Identidad:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=row_cli, column=0, sticky=tk.W, pady=5
            )
            tk.Entry(main_frame_cliente, textvariable=documento_var, width=40).grid(
                row=row_cli, column=1, pady=5, padx=5
            )
            
            row_cli += 1
            tk.Label(main_frame_cliente, text="Dirección:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=row_cli, column=0, sticky=tk.W, pady=5
            )
            direccion_text = tk.Text(main_frame_cliente, width=40, height=3)
            direccion_text.grid(row=row_cli, column=1, pady=5, padx=5)
            
            def guardar_cliente():
                if not nombre_usuario_var.get() or not contrasena_var.get() or not nombre_completo_var.get():
                    mostrar_error(ventana_cliente, "Error", "Complete los campos requeridos (*)")
                    return
                
                # Crear usuario primero
                contrasena_hash = auth.hash_contrasena(contrasena_var.get())
                datos_usuario = {
                    'nombre_usuario': nombre_usuario_var.get().strip(),
                    'contrasena': contrasena_hash,
                    'nombre_completo': nombre_completo_var.get().strip(),
                    'email': email_var.get().strip() or None,
                    'telefono': telefono_var.get().strip() or None,
                    'rol': 'cliente'
                }
                
                usuario_id = usuario_modelo.crear_usuario(datos_usuario)
                if not usuario_id:
                    mostrar_error(ventana_cliente, "Error", "Error al crear el usuario. El nombre de usuario puede estar en uso.")
                    return
                
                # Crear cliente
                datos_cliente = {
                    'usuario_id': usuario_id,
                    'documento_identidad': documento_var.get().strip() or None,
                    'direccion': direccion_text.get('1.0', tk.END).strip() or None
                }
                
                cliente_id = cliente_modelo.crear_cliente(datos_cliente)
                if cliente_id:
                    mostrar_info(ventana_cliente, "Éxito", "Cliente creado exitosamente")
                    ventana_cliente.destroy()
                    # Actualizar lista de clientes
                    clientes_actualizados = cliente_modelo.obtener_todos_clientes()
                    cliente_combo['values'] = [f"{c['id']} - {c['nombre_completo']}" for c in clientes_actualizados]
                    # Seleccionar el cliente recién creado
                    cliente_combo.set(f"{cliente_id} - {datos_usuario['nombre_completo']}")
                else:
                    mostrar_error(ventana_cliente, "Error", "Error al crear el cliente")
            
            button_frame_cliente = tk.Frame(main_frame_cliente, bg='#ecf0f1')
            button_frame_cliente.grid(row=row_cli+1, column=0, columnspan=2, pady=20)
            
            tk.Button(
                button_frame_cliente,
                text="Guardar",
                command=guardar_cliente,
                bg='#27ae60',
                fg='white',
                font=('Arial', 10, 'bold'),
                padx=20,
                pady=5
            ).pack(side=tk.LEFT, padx=5)
            
            tk.Button(
                button_frame_cliente,
                text="Cancelar",
                command=ventana_cliente.destroy,
                bg='#95a5a6',
                fg='white',
                font=('Arial', 10, 'bold'),
                padx=20,
                pady=5
            ).pack(side=tk.LEFT, padx=5)
        
        btn_nuevo_cliente = EstilosFormulario.crear_button(
            cliente_frame,
            "+ Nuevo Cliente",
            crear_cliente_desde_evento,
            tipo='info',
            width=15
        )
        btn_nuevo_cliente.pack(side=tk.LEFT, padx=(8, 0))
        
        row += 1
        # Salón
        label = EstilosFormulario.crear_label(form_padding, "Salón *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        salon_combo = EstilosFormulario.crear_combobox(form_padding, textvariable=salon_id_var, values=[], width=35)
        salon_combo['values'] = [f"{s['id_salon']} - {s['nombre']} (Cap: {s['capacidad']})" for s in salones]
        salon_combo.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12))
        
        row += 1
        # Plan
        label = EstilosFormulario.crear_label(form_padding, "Plan:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        plan_frame = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        plan_frame.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12))
        
        plan_combo = EstilosFormulario.crear_combobox(plan_frame, textvariable=plan_id_var, values=[], width=25)
        plan_combo['values'] = [''] + [f"{p['id']} - {p['nombre']}" for p in planes]
        plan_combo.pack(side=tk.LEFT)
        
        precio_plan_label = tk.Label(plan_frame, text="Precio: $0.00", bg=ColoresBranding.FONDO_CLARO, 
                                     font=('Arial', 9, 'bold'), fg=ColoresBranding.DORADO_PRINCIPAL)
        precio_plan_label.pack(side=tk.LEFT, padx=10)
        
        # Definir calcular_total antes de usarla
        def calcular_total():
            """Calcula el total: precio plan + productos adicionales"""
            precio_plan = float(precio_plan_var.get() or 0)
            total_productos = sum(p['subtotal'] for p in productos_adicionales)
            precio_productos_var.set(f"${total_productos:.2f}")
            total = precio_plan + total_productos
            precio_var.set(f"{total:.2f}")
        
        def actualizar_precio_plan(*args):
            """Actualiza el precio del plan cuando se selecciona uno"""
            if plan_id_var.get():
                try:
                    plan_id = int(plan_id_var.get().split(' - ')[0])
                    plan = self.plan_modelo.obtener_plan_por_id(plan_id)
                    if plan:
                        precio_plan = float(plan.get('precio_base', 0) or 0)
                        precio_plan_var.set(f"{precio_plan:.2f}")
                        precio_plan_label.config(text=f"Precio: ${precio_plan:.2f}")
                        calcular_total()
                except:
                    precio_plan_var.set("0.00")
                    precio_plan_label.config(text="Precio: $0.00")
                    calcular_total()
            else:
                precio_plan_var.set("0.00")
                precio_plan_label.config(text="Precio: $0.00")
                calcular_total()
        
        plan_id_var.trace('w', actualizar_precio_plan)
        
        row += 1
        # Nombre Evento
        label = EstilosFormulario.crear_label(form_padding, "Nombre Evento *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=nombre_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Tipo Evento
        label = EstilosFormulario.crear_label(form_padding, "Tipo Evento *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        # Obtener tipos de eventos desde la base de datos
        try:
            tipos_eventos = self.tipo_evento_modelo.obtener_nombres_tipos(solo_activos=True)
            if not tipos_eventos:
                # Fallback si no hay tipos en la BD
                tipos_eventos = ['Otro']
        except Exception as e:
            print(f"Error al cargar tipos de eventos: {e}")
            # Fallback a lista hardcodeada si hay error
            tipos_eventos = ['Matrimonio', 'Quince Años', 'Fiesta Corporativa', 'Bautizo', 'Primera Comunión', 
                           'Confirmación', 'Graduación', 'Aniversario', 'Cumpleaños', 'Otro']
        
        tipo_combo = EstilosFormulario.crear_combobox(form_padding, textvariable=tipo_var, values=tipos_eventos, width=35)
        tipo_combo.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12))
        
        row += 1
        selector_fecha = SelectorFecha(form_padding, texto_label="Fecha *:", bg=ColoresBranding.FONDO_CLARO)
        selector_fecha.grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(0, 12), padx=(0, 0))
        
        row += 1
        selector_hora = SelectorHora(form_padding, texto_label="Hora Inicio *:", bg=ColoresBranding.FONDO_CLARO)
        selector_hora.grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(0, 12), padx=(0, 0))

        row += 1
        selector_hora_fin = SelectorHora(form_padding, texto_label="Hora Fin *:", bg=ColoresBranding.FONDO_CLARO)
        selector_hora_fin.grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(0, 12), padx=(0, 0))
        
        row += 1
        # Número Invitados
        label = EstilosFormulario.crear_label(form_padding, "Número Invitados:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=invitados_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        # Sección de productos adicionales
        row += 1
        productos_outer, productos_frame = EstilosFormulario.crear_label_frame(
            form_padding,
            "Productos Adicionales",
            padx=10,
            pady=10
        )
        productos_outer.grid(row=row, column=0, columnspan=2, sticky=tk.W+tk.E, pady=(0, 12))
        
        # Treeview para productos adicionales
        productos_tree_frame = tk.Frame(productos_frame, bg=ColoresBranding.FONDO_CLARO)
        productos_tree_frame.pack(fill=tk.BOTH, expand=True)
        
        columns_prod = ('Producto', 'Cantidad', 'Precio Unit.', 'Subtotal')
        productos_tree = ttk.Treeview(productos_tree_frame, columns=columns_prod, show='headings', height=5)
        for col in columns_prod:
            productos_tree.heading(col, text=col)
            productos_tree.column(col, width=120)
        productos_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scrollbar_prod = ttk.Scrollbar(productos_tree_frame, orient=tk.VERTICAL, command=productos_tree.yview)
        productos_tree.configure(yscrollcommand=scrollbar_prod.set)
        scrollbar_prod.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Botones para productos
        productos_btn_frame = tk.Frame(productos_frame, bg=ColoresBranding.FONDO_CLARO)
        productos_btn_frame.pack(fill=tk.X, pady=5)
        
        def agregar_producto():
            """Abre ventana para agregar producto adicional"""
            prod_ventana = tk.Toplevel(ventana)
            prod_ventana.title("Agregar Producto")
            prod_ventana.geometry("400x300")
            prod_ventana.configure(bg='#ecf0f1')
            centrar_ventana(prod_ventana, 400, 300)
            prod_ventana.transient(ventana)
            prod_ventana.grab_set()
            
            prod_frame = tk.Frame(prod_ventana, bg='#ecf0f1', padx=20, pady=20)
            prod_frame.pack(fill=tk.BOTH, expand=True)
            
            tk.Label(prod_frame, text="Producto *:", bg='#ecf0f1', font=('Arial', 10, 'bold')).grid(
                row=0, column=0, sticky=tk.W, pady=5
            )
            producto_var = tk.StringVar()
            productos_disponibles = self.producto_modelo.obtener_todos_productos(solo_activos=True)
            producto_combo = ttk.Combobox(prod_frame, textvariable=producto_var, width=35, state='readonly')
            producto_combo['values'] = [f"{p['id']} - {p['nombre']} (${p['precio']:.2f})" for p in productos_disponibles]
            producto_combo.grid(row=0, column=1, pady=5, padx=5)
            
            tk.Label(prod_frame, text="Cantidad *:", bg='#ecf0f1', font=('Arial', 10)).grid(
                row=1, column=0, sticky=tk.W, pady=5
            )
            cantidad_var = tk.StringVar(value="1")
            tk.Entry(prod_frame, textvariable=cantidad_var, width=38).grid(row=1, column=1, pady=5, padx=5)
            
            def guardar_producto():
                if not producto_var.get() or not cantidad_var.get():
                    mostrar_error(prod_ventana, "Error", "Complete todos los campos requeridos")
                    return
                
                try:
                    producto_id = int(producto_var.get().split(' - ')[0])
                    cantidad = int(cantidad_var.get())
                    if cantidad <= 0:
                        mostrar_error(prod_ventana, "Error", "La cantidad debe ser mayor a 0")
                        return
                    
                    # Buscar el producto seleccionado
                    producto = next((p for p in productos_disponibles if p['id'] == producto_id), None)
                    if not producto:
                        mostrar_error(prod_ventana, "Error", "Producto no encontrado")
                        return
                    
                    precio_unitario = float(producto.get('precio', 0))
                    subtotal = cantidad * precio_unitario
                    
                    # Agregar a la lista
                    productos_adicionales.append({
                        'producto_id': producto_id,
                        'nombre': producto['nombre'],
                        'cantidad': cantidad,
                        'precio_unitario': precio_unitario,
                        'subtotal': subtotal
                    })
                    
                    # Actualizar treeview
                    productos_tree.insert('', tk.END, values=(
                        producto['nombre'],
                        cantidad,
                        f"${precio_unitario:.2f}",
                        f"${subtotal:.2f}"
                    ))
                    
                    calcular_total()
                    prod_ventana.destroy()
                except ValueError:
                    mostrar_error(prod_ventana, "Error", "Ingrese valores válidos")
            
            tk.Button(prod_frame, text="Agregar", command=guardar_producto, 
                     bg='#27ae60', fg='white', font=('Arial', 10, 'bold'), padx=15, pady=5).grid(
                row=2, column=0, columnspan=2, pady=20
            )
            
            tk.Button(prod_frame, text="Cancelar", command=prod_ventana.destroy,
                     bg='#95a5a6', fg='white', font=('Arial', 10, 'bold'), padx=15, pady=5).grid(
                row=3, column=0, columnspan=2
            )
        
        btn_agregar_prod = EstilosFormulario.crear_button(
            productos_btn_frame,
            "+ Agregar Producto",
            agregar_producto,
            tipo='info',
            width=18
        )
        btn_agregar_prod.pack(side=tk.LEFT, padx=(0, 8))
        
        def eliminar_producto():
            seleccion = productos_tree.selection()
            if not seleccion:
                mostrar_advertencia(ventana, "Advertencia", "Seleccione un producto para eliminar")
                return
            
            item = productos_tree.item(seleccion[0])
            nombre_producto = item['values'][0]
            
            # Remover de la lista
            productos_adicionales[:] = [p for p in productos_adicionales if p['nombre'] != nombre_producto]
            
            productos_tree.delete(seleccion[0])
            calcular_total()
        
        btn_eliminar_prod = EstilosFormulario.crear_button(
            productos_btn_frame,
            "Eliminar",
            eliminar_producto,
            tipo='peligro',
            width=18
        )
        btn_eliminar_prod.pack(side=tk.LEFT)
        
        # Resumen de precios
        row += 1
        resumen_frame = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        resumen_frame.grid(row=row, column=0, columnspan=2, sticky=tk.W+tk.E, pady=(0, 12))
        
        tk.Label(resumen_frame, text="Precio Plan:", bg=ColoresBranding.FONDO_CLARO, font=('Arial', 10)).pack(side=tk.LEFT, padx=10)
        precio_plan_resumen = tk.Label(resumen_frame, textvariable=precio_plan_var, bg=ColoresBranding.FONDO_CLARO, 
                                       font=('Arial', 10, 'bold'), fg=ColoresBranding.DORADO_PRINCIPAL)
        precio_plan_resumen.pack(side=tk.LEFT, padx=5)
        
        tk.Label(resumen_frame, text="+ Productos:", bg=ColoresBranding.FONDO_CLARO, font=('Arial', 10)).pack(side=tk.LEFT, padx=10)
        precio_productos_resumen = tk.Label(resumen_frame, textvariable=precio_productos_var, bg=ColoresBranding.FONDO_CLARO,
                                           font=('Arial', 10, 'bold'), fg=ColoresBranding.DORADO_MEDIO)
        precio_productos_resumen.pack(side=tk.LEFT, padx=5)
        
        tk.Label(resumen_frame, text="= Total:", bg=ColoresBranding.FONDO_CLARO, font=('Arial', 10, 'bold')).pack(side=tk.LEFT, padx=10)
        
        row += 1
        # Precio Total
        label = EstilosFormulario.crear_label(form_padding, "Precio Total:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        precio_total_entry = EstilosFormulario.crear_entry(form_padding, textvariable=precio_var, width=35, state='readonly')
        precio_total_entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        # Inicializar total
        calcular_total()
        
        row += 1
        # Observaciones
        label = EstilosFormulario.crear_label(form_padding, "Observaciones:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        observaciones_text = EstilosFormulario.crear_text(form_padding, width=35, height=4)
        observaciones_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=6)
        
        def guardar():
            fecha = selector_fecha.obtener_fecha()
            hora = selector_hora.obtener_hora()
            hora_fin = selector_hora_fin.obtener_hora()
            #print(hora_fin)
            if not cliente_id_var.get() or not nombre_var.get() or not fecha or not hora or not tipo_var.get():
                mostrar_error(ventana, "Error", "Complete los campos requeridos (*)")
                return
            
            cliente_id = int(cliente_id_var.get().split(' - ')[0])
            salon_id = int(salon_id_var.get().split(' - ')[0]) if salon_id_var.get() else None
            plan_id = int(plan_id_var.get().split(' - ')[0]) if plan_id_var.get() else None
            
            # Calcular total
            precio_plan = float(precio_plan_var.get() or 0)
            total_productos = sum(p['subtotal'] for p in productos_adicionales)
            total_evento = precio_plan + total_productos
            
            datos = {
                'cliente_id': cliente_id,
                'id_salon': salon_id,
                'plan_id': plan_id,
                'nombre_evento': nombre_var.get().strip(),
                'tipo_evento': tipo_var.get().strip(),
                'fecha_evento': fecha,
                'hora_inicio': hora,
                'hora_fin': hora_fin,
                'numero_invitados': int(invitados_var.get() or 0) or None,
                'total': total_evento,
                'saldo': total_evento,
                'salon': salon_id_var.get().split(' - ')[1].strip() if salon_id_var.get() else None,
                'observaciones': observaciones_text.get('1.0', tk.END).strip() or None,
                'coordinador_id': self.usuario['id'] if self.usuario['rol'] == 'coordinador' else None
            }
            
            evento_id = self.modelo.crear_evento(datos)
            if evento_id:
                # Agregar productos adicionales
                for producto in productos_adicionales:
                    self.modelo.agregar_producto_evento(
                        evento_id,
                        producto['producto_id'],
                        producto['cantidad'],
                        producto['precio_unitario']
                    )
                
                # Recalcular total (por si acaso)
                self.modelo.calcular_total_evento(evento_id)
                
                self.autenticacion.registrar_log("Crear evento", "Eventos", f"Evento creado: {datos['nombre_evento']}")
                
                # Enviar notificación de evento creado
                try:
                    from integraciones.sistema_notificaciones import SistemaNotificaciones
                    sistema_notif = SistemaNotificaciones()
                    sistema_notif.enviar_notificacion(evento_id, 'evento_creado')
                except Exception as e:
                    print(f"Error al enviar notificación de evento creado: {e}")
                    # No bloqueamos la creación del evento si falla la notificación
                
                mostrar_info(ventana, "Éxito", "Evento creado exitosamente")
                ventana.destroy()
                self.cargar_datos()
            else:
                mostrar_error(ventana, "Error", "Error al crear el evento")
        
        # Botones
        button_container = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        button_container.grid(row=row+1, column=0, columnspan=2, pady=(15, 10), sticky=tk.W+tk.E)
        
        btn_guardar = EstilosFormulario.crear_button(
            button_container,
            "Guardar",
            guardar,
            tipo='principal',
            width=18
        )
        btn_guardar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_cancelar = EstilosFormulario.crear_button(
            button_container,
            "Cancelar",
            ventana.destroy,
            tipo='info',
            width=18
        )
        btn_cancelar.pack(side=tk.LEFT, fill=tk.X, expand=True)
    
    def ver_detalles(self):
        """Muestra detalles del evento seleccionado"""
        selection = self.tree.selection()
        if not selection:
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un evento para ver sus detalles")
            return
        
        item = self.tree.item(selection[0])
        # Obtener el ID del evento desde los tags
        tags = item.get('tags', [])
        if not tags:
            mostrar_error(self.parent, "Error", "No se pudo identificar el evento")
            return
        
        try:
            evento_id = int(tags[0])
        except (ValueError, IndexError):
            mostrar_error(self.parent, "Error", "ID de evento inválido")
            return
        
        evento = self.modelo.obtener_evento_por_id(evento_id)
        
        if not evento:
            mostrar_error(self.parent, "Error", "No se pudo cargar la información del evento")
            return
        
        # Obtener información del plan
        plan_info = "No seleccionado"
        precio_plan = 0
        if evento.get('plan_id'):
            plan = self.plan_modelo.obtener_plan_por_id(evento['plan_id'])
            if plan:
                plan_info = plan.get('nombre', 'N/A')
                precio_plan = float(plan.get('precio_base', 0) or 0)
        
        # Obtener productos adicionales
        productos_adicionales = self.modelo.obtener_productos_evento(evento_id)
        total_productos = sum(float(p.get('subtotal', 0) or 0) for p in productos_adicionales)
        
        ventana = tk.Toplevel(self.parent)
        ventana.title(f"Detalles del Evento - {evento.get('nombre_evento', 'Evento')}")
        ventana.geometry("750x700")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 750, 700)
        ventana.transient(self.parent)
        
        # Frame principal
        main_frame = tk.Frame(ventana, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Frame scrollable
        scroll_container, scrollable_frame = EstilosFormulario.crear_frame_scrollable(
            main_frame,
            bg=ColoresBranding.FONDO_CLARO
        )
        scroll_container.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        # Título del evento
        titulo_frame = tk.Frame(scrollable_frame, bg=ColoresBranding.FONDO_CLARO, pady=10)
        titulo_frame.pack(fill=tk.X, padx=20, pady=(10, 20))
        
        tk.Label(
            titulo_frame,
            text=evento.get('nombre_evento', 'Evento'),
            font=('Arial', 18, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.DORADO_PRINCIPAL
        ).pack(anchor=tk.W)
        
        # Información General
        info_outer, info_frame = EstilosFormulario.crear_label_frame(
            scrollable_frame,
            "Información General",
            padx=20,
            pady=15
        )
        info_outer.pack(fill=tk.X, padx=20, pady=(0, 15))
        
        # Crear labels organizados en grid
        info_grid = tk.Frame(info_frame, bg=ColoresBranding.FONDO_CLARO)
        info_grid.pack(fill=tk.X)
        
        datos_info = [
            ("ID:", evento.get('id_evento', evento.get('id', 'N/A'))),
            ("Cliente:", evento.get('nombre_cliente', 'N/A')),
            ("Salón:", evento.get('nombre_salon', evento.get('salon', 'N/A'))),
            ("Tipo de Evento:", evento.get('tipo_evento', 'N/A')),
            ("Fecha:", evento.get('fecha_evento', 'N/A')),
            ("Hora Inicio:", str(evento.get('hora_inicio', 'N/A'))),
            ("Hora Fin:", str(evento.get('hora_fin', 'N/A'))),
            ("Número de Invitados:", evento.get('numero_invitados', 'N/A') if evento.get('numero_invitados') else 'N/A'),
            ("Estado:", evento.get('estado', 'N/A').replace('_', ' ').title())
        ]
        
        for i, (label, valor) in enumerate(datos_info):
            row = i // 2
            col = (i % 2) * 2
            
            # Label
            lbl = EstilosFormulario.crear_label(
                info_grid, label, row, col,
                font=('Arial', 10, 'bold'),
                bg=ColoresBranding.FONDO_CLARO
            )
            lbl.grid(row=row, column=col, sticky=tk.W, padx=(0, 5), pady=5)
            
            # Valor
            val = EstilosFormulario.crear_label(
                info_grid, valor, row, col + 1,
                font=('Arial', 10),
                bg=ColoresBranding.FONDO_CLARO,
                fg=ColoresBranding.TEXTO_OSCURO
            )
            val.grid(row=row, column=col + 1, sticky=tk.W, padx=(0, 30), pady=5)
        
        # Configurar columnas
        info_grid.columnconfigure(1, weight=1)
        info_grid.columnconfigure(3, weight=1)
        
        # Información del Plan
        plan_outer, plan_frame = EstilosFormulario.crear_label_frame(
            scrollable_frame,
            "Plan",
            padx=20,
            pady=15
        )
        plan_outer.pack(fill=tk.X, padx=20, pady=(0, 15))
        
        plan_grid = tk.Frame(plan_frame, bg=ColoresBranding.FONDO_CLARO)
        plan_grid.pack(fill=tk.X)
        
        lbl_plan = EstilosFormulario.crear_label(
            plan_grid, "Plan:", 0, 0,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.FONDO_CLARO
        )
        lbl_plan.grid(row=0, column=0, sticky=tk.W, padx=(0, 5), pady=5)
        
        val_plan = EstilosFormulario.crear_label(
            plan_grid, plan_info, 0, 1,
            font=('Arial', 10),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        )
        val_plan.grid(row=0, column=1, sticky=tk.W, pady=5)
        
        lbl_precio = EstilosFormulario.crear_label(
            plan_grid, "Precio del Plan:", 1, 0,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.FONDO_CLARO
        )
        lbl_precio.grid(row=1, column=0, sticky=tk.W, padx=(0, 5), pady=5)
        
        val_precio = EstilosFormulario.crear_label(
            plan_grid, f"${precio_plan:,.2f}", 1, 1,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.DORADO_PRINCIPAL
        )
        val_precio.grid(row=1, column=1, sticky=tk.W, pady=5)
        
        plan_grid.columnconfigure(1, weight=1)
        
        # Productos Adicionales
        productos_outer, productos_frame = EstilosFormulario.crear_label_frame(
            scrollable_frame,
            "Productos Adicionales",
            padx=20,
            pady=15
        )
        productos_outer.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 15))
        
        if productos_adicionales:
            # Frame para la tabla
            tabla_frame = tk.Frame(productos_frame, bg=ColoresBranding.FONDO_CLARO)
            tabla_frame.pack(fill=tk.BOTH, expand=True)
            
            # Treeview para productos
            prod_tree = ttk.Treeview(tabla_frame, columns=('Producto', 'Cantidad', 'Precio Unit.', 'Subtotal'),
                                    show='headings', height=min(len(productos_adicionales), 8))
            prod_tree.heading('Producto', text='Producto')
            prod_tree.heading('Cantidad', text='Cantidad')
            prod_tree.heading('Precio Unit.', text='Precio Unit.')
            prod_tree.heading('Subtotal', text='Subtotal')
            
            prod_tree.column('Producto', width=300)
            prod_tree.column('Cantidad', width=100, anchor=tk.CENTER)
            prod_tree.column('Precio Unit.', width=150, anchor=tk.E)
            prod_tree.column('Subtotal', width=150, anchor=tk.E)
            
            for prod in productos_adicionales:
                prod_tree.insert('', tk.END, values=(
                    prod.get('nombre_producto', 'N/A'),
                    prod.get('cantidad', 0),
                    f"${float(prod.get('precio_unitario', 0)):,.2f}",
                    f"${float(prod.get('subtotal', 0)):,.2f}"
                ))
            
            # Scrollbar para tabla
            scrollbar_prod = ttk.Scrollbar(tabla_frame, orient="vertical", command=prod_tree.yview)
            prod_tree.configure(yscrollcommand=scrollbar_prod.set)
            
            prod_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            scrollbar_prod.pack(side=tk.RIGHT, fill=tk.Y)
            
            # Total productos
            total_frame = tk.Frame(productos_frame, bg=ColoresBranding.FONDO_CLARO)
            total_frame.pack(fill=tk.X, pady=(10, 0))
            
            tk.Label(
                total_frame,
                text=f"Total Productos: ${total_productos:,.2f}",
                bg=ColoresBranding.FONDO_CLARO,
                font=('Arial', 11, 'bold'),
                fg=ColoresBranding.DORADO_PRINCIPAL
            ).pack(anchor=tk.E)
        else:
            tk.Label(
                productos_frame,
                text="No hay productos adicionales",
                bg=ColoresBranding.FONDO_CLARO,
                font=('Arial', 10),
                fg=ColoresBranding.TEXTO_GRIS
            ).pack(pady=20)
        
        # Resumen Financiero
        resumen_outer, resumen_frame = EstilosFormulario.crear_label_frame(
            scrollable_frame,
            "Resumen Financiero",
            padx=20,
            pady=15
        )
        resumen_outer.pack(fill=tk.X, padx=20, pady=(0, 15))
        
        precio_total = float(evento.get('total', evento.get('precio_total', 0)) or 0)
        total_pagado = float(evento.get('total_pagado', 0) or 0)
        saldo_pendiente = float(evento.get('saldo', evento.get('saldo_pendiente', 0)) or 0)
        
        resumen_grid = tk.Frame(resumen_frame, bg=ColoresBranding.FONDO_CLARO)
        resumen_grid.pack(fill=tk.X)
        
        # Itemizados
        lbl_plan_precio = EstilosFormulario.crear_label(
            resumen_grid, "Precio del Plan:", 0, 0,
            font=('Arial', 10),
            bg=ColoresBranding.FONDO_CLARO
        )
        lbl_plan_precio.grid(row=0, column=0, sticky=tk.W, pady=5)
        
        val_plan_precio = EstilosFormulario.crear_label(
            resumen_grid, f"${precio_plan:,.2f}", 0, 1,
            font=('Arial', 10),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        )
        val_plan_precio.grid(row=0, column=1, sticky=tk.E, pady=5)
        
        lbl_prod_total = EstilosFormulario.crear_label(
            resumen_grid, "Total Productos Adicionales:", 1, 0,
            font=('Arial', 10),
            bg=ColoresBranding.FONDO_CLARO
        )
        lbl_prod_total.grid(row=1, column=0, sticky=tk.W, pady=5)
        
        val_prod_total = EstilosFormulario.crear_label(
            resumen_grid, f"${total_productos:,.2f}", 1, 1,
            font=('Arial', 10),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        )
        val_prod_total.grid(row=1, column=1, sticky=tk.E, pady=5)
        
        # Separador
        separador = tk.Frame(resumen_grid, bg=ColoresBranding.ENTRY_BORDER, height=1)
        separador.grid(row=2, column=0, columnspan=2, sticky=tk.EW, pady=10)
        
        # Totales
        lbl_total = EstilosFormulario.crear_label(
            resumen_grid, "Precio Total:", 3, 0,
            font=('Arial', 11, 'bold'),
            bg=ColoresBranding.FONDO_CLARO
        )
        lbl_total.grid(row=3, column=0, sticky=tk.W, pady=5)
        
        val_total = EstilosFormulario.crear_label(
            resumen_grid, f"${precio_total:,.2f}", 3, 1,
            font=('Arial', 11, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.DORADO_PRINCIPAL
        )
        val_total.grid(row=3, column=1, sticky=tk.E, pady=5)
        
        lbl_pagado = EstilosFormulario.crear_label(
            resumen_grid, "Total Pagado:", 4, 0,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.FONDO_CLARO
        )
        lbl_pagado.grid(row=4, column=0, sticky=tk.W, pady=5)
        
        val_pagado = EstilosFormulario.crear_label(
            resumen_grid, f"${total_pagado:,.2f}", 4, 1,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.DORADO_MEDIO
        )
        val_pagado.grid(row=4, column=1, sticky=tk.E, pady=5)
        
        lbl_saldo = EstilosFormulario.crear_label(
            resumen_grid, "Saldo Pendiente:", 5, 0,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.FONDO_CLARO
        )
        lbl_saldo.grid(row=5, column=0, sticky=tk.W, pady=5)
        
        color_saldo = '#dc3545' if saldo_pendiente > 0 else ColoresBranding.DORADO_PRINCIPAL
        val_saldo = EstilosFormulario.crear_label(
            resumen_grid, f"${saldo_pendiente:,.2f}", 5, 1,
            font=('Arial', 10, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=color_saldo
        )
        val_saldo.grid(row=5, column=1, sticky=tk.E, pady=5)
        
        resumen_grid.columnconfigure(1, weight=1)
        
        # Observaciones
        if evento.get('observaciones'):
            obs_outer, obs_frame = EstilosFormulario.crear_label_frame(
                scrollable_frame,
                "Observaciones",
                padx=20,
                pady=15
            )
            obs_outer.pack(fill=tk.X, padx=20, pady=(0, 15))
            
            obs_text = EstilosFormulario.crear_text(obs_frame, width=60, height=4)
            obs_text.insert('1.0', evento.get('observaciones', ''))
            obs_text.config(state=tk.DISABLED)
            obs_text.pack(fill=tk.X, padx=10, pady=10)
        
        # Botón Cerrar
        button_frame = tk.Frame(scrollable_frame, bg=ColoresBranding.FONDO_CLARO)
        button_frame.pack(fill=tk.X, padx=20, pady=(10, 20))
        
        btn_cerrar = EstilosFormulario.crear_button(
            button_frame,
            "Cerrar",
            ventana.destroy,
            tipo='secundario',
            width=20
        )
        btn_cerrar.pack(side=tk.RIGHT)
    
    def actualizar_estado(self):
        """Actualiza el estado del evento seleccionado"""
        selection = self.tree.selection()
        if not selection:
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un evento para actualizar su estado")
            return
        
        item = self.tree.item(selection[0])
        # Obtener el ID del evento desde los tags
        tags = item.get('tags', [])
        if not tags:
            mostrar_error(self.parent, "Error", "No se pudo identificar el evento")
            return
        
        try:
            evento_id = int(tags[0])
        except (ValueError, IndexError):
            mostrar_error(self.parent, "Error", "ID de evento inválido")
            return
        
        ventana = tk.Toplevel(self.parent)
        ventana.title("Actualizar Estado")
        ventana.geometry("500x500")
        ventana.configure(bg='#ecf0f1')
        centrar_ventana(ventana, 500, 500)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        main_frame = tk.Frame(ventana, bg='#ecf0f1', padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(main_frame, text="Nuevo Estado:", bg='#ecf0f1', font=('Arial', 10)).pack(pady=10)
        
        estado_var = tk.StringVar()
        estados = ['cotizacion', 'confirmado', 'en_proceso', 'completado', 'cancelado']
        estado_combo = ttk.Combobox(main_frame, textvariable=estado_var, values=estados, state='readonly', width=20)
        estado_combo.pack(pady=10)

       

        tk.Label(main_frame, text="Observaciones:", bg='#ecf0f1', font=('Arial', 10)).pack(pady=10)
        observaciones_text = tk.Text(main_frame, height=4, width=60, wrap=tk.WORD, font=('Arial', 9))
        observaciones_text.pack(pady=10)
        
        
        def guardar():
            nuevo_estado = estado_var.get()
            if not nuevo_estado:
                mostrar_error(ventana, "Error", "Seleccione un estado")
                return
            
            if self.modelo.actualizar_estado(evento_id, nuevo_estado):
                self.autenticacion.registrar_log("Actualizar estado evento", "Eventos", f"Estado actualizado a: {nuevo_estado}")
                mostrar_info(ventana, "Éxito", "Estado actualizado exitosamente")
                ventana.destroy()
                self.cargar_datos()
            else:
                mostrar_error(ventana, "Error", "Error al actualizar el estado")
        
        button_frame = tk.Frame(main_frame, bg='#ecf0f1')
        button_frame.pack(pady=20)
        
        tk.Button(
            button_frame,
            text="Guardar",
            command=guardar,
            bg='#27ae60',
            fg='white',
            font=('Arial', 10, 'bold'),
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            button_frame,
            text="Cancelar",
            command=ventana.destroy,
            bg='#95a5a6',
            fg='white',
            font=('Arial', 10, 'bold'),
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
