"""
Vista para gestión de planes y paquetes
"""
import tkinter as tk
from tkinter import ttk
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import centrar_ventana, mostrar_error, mostrar_advertencia, mostrar_info, confirmar
from utilidades.colores import ColoresBranding
from utilidades.estilos_formularios import EstilosFormulario
from modelos.plan_modelo import PlanModelo
from modelos.producto_modelo import ProductoModelo


class VistaPlanes:
    """Interfaz para gestión de planes"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = PlanModelo()
        self.producto_modelo = ProductoModelo()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Gestión de Planes y Paquetes",
            font=('Arial', 18, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Frame de contenido
        content_frame = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Frame izquierdo - Formulario con scroll
        form_outer, form_container = EstilosFormulario.crear_label_frame(
            content_frame,
            "Formulario de Plan",
            padx=15,
            pady=15
        )
        form_outer.pack(side=tk.LEFT, fill=tk.BOTH, padx=(0, 10), expand=False)
        
        # Crear frame scrollable
        scroll_container, scrollable_frame = EstilosFormulario.crear_frame_scrollable(
            form_container,
            bg=ColoresBranding.FONDO_CLARO
        )
        scroll_container.pack(fill=tk.BOTH, expand=True)
        
        # Frame interno con padding
        form_padding = tk.Frame(scrollable_frame, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        form_padding.pack(fill=tk.BOTH, expand=True)
        
        # Variables
        self.id_var = tk.StringVar()
        self.nombre_var = tk.StringVar()
        self.descripcion_text = None
        self.precio_var = tk.StringVar()
        self.capacidad_min_var = tk.StringVar()
        self.capacidad_max_var = tk.StringVar()
        self.duracion_var = tk.StringVar()
        self.incluye_text = None
        
        # Configurar columnas
        form_padding.columnconfigure(1, weight=1)
        
        # Campos
        row = 0
        # ID
        label = EstilosFormulario.crear_label(form_padding, "ID:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.id_var, state='readonly', width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Nombre
        label = EstilosFormulario.crear_label(form_padding, "Nombre *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.nombre_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Descripción
        label = EstilosFormulario.crear_label(form_padding, "Descripción:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        self.descripcion_text = EstilosFormulario.crear_text(form_padding, width=28, height=3)
        self.descripcion_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Precio Base
        label = EstilosFormulario.crear_label(form_padding, "Precio Base *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.precio_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Capacidad Mín
        label = EstilosFormulario.crear_label(form_padding, "Capacidad Mín:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.capacidad_min_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Capacidad Máx
        label = EstilosFormulario.crear_label(form_padding, "Capacidad Máx:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.capacidad_max_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Duración
        label = EstilosFormulario.crear_label(form_padding, "Duración (hrs):", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.duracion_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Incluye
        label = EstilosFormulario.crear_label(form_padding, "Incluye:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        self.incluye_text = EstilosFormulario.crear_text(form_padding, width=28, height=3)
        self.incluye_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=6)
        
        # Botones organizados en dos filas
        button_container = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        button_container.grid(row=row+1, column=0, columnspan=2, pady=(15, 10), sticky=tk.W+tk.E)
        
        # Primera fila
        button_frame_1 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_1.pack(fill=tk.X, pady=(0, 8))
        
        btn_crear = EstilosFormulario.crear_button(
            button_frame_1,
            "Crear",
            self.crear_plan,
            tipo='principal',
            width=18
        )
        btn_crear.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_actualizar = EstilosFormulario.crear_button(
            button_frame_1,
            "Actualizar",
            self.actualizar_plan,
            tipo='secundario',
            width=18
        )
        btn_actualizar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Segunda fila
        button_frame_2 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_2.pack(fill=tk.X)
        
        btn_eliminar = EstilosFormulario.crear_button(
            button_frame_2,
            "Eliminar",
            self.eliminar_plan,
            tipo='peligro',
            width=18
        )
        btn_eliminar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_limpiar = EstilosFormulario.crear_button(
            button_frame_2,
            "Limpiar",
            self.limpiar_formulario,
            tipo='info',
            width=18
        )
        btn_limpiar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Frame derecho - Tabla
        table_outer, table_frame = EstilosFormulario.crear_label_frame(
            content_frame,
            "Lista de Planes",
            padx=15,
            pady=15
        )
        table_outer.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        columns = ('ID', 'Nombre', 'Precio Base', 'Capacidad', 'Duración', 'Estado')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=20)
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120)
        
        scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree.bind('<<TreeviewSelect>>', self.on_select)
    
    def cargar_datos(self):
        """Carga los planes en la tabla"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        planes = self.modelo.obtener_todos_planes()
        for plan in planes:
            capacidad = f"{plan.get('capacidad_minima', '')}-{plan.get('capacidad_maxima', '')}"
            self.tree.insert('', tk.END, values=(
                plan['id'],
                plan['nombre'],
                f"${plan['precio_base']:.2f}",
                capacidad,
                f"{plan.get('duracion_horas', '')} hrs",
                'Activo' if plan['activo'] else 'Inactivo'
            ))
    
    def on_select(self, event):
        """Cuando se selecciona un plan"""
        selection = self.tree.selection()
        if selection:
            item = self.tree.item(selection[0])
            plan_id = item['values'][0]
            plan = self.modelo.obtener_plan_por_id(plan_id)
            
            if plan:
                self.id_var.set(plan['id'])
                self.nombre_var.set(plan['nombre'])
                self.descripcion_text.delete('1.0', tk.END)
                self.descripcion_text.insert('1.0', plan.get('descripcion', ''))
                self.precio_var.set(str(plan['precio_base']))
                self.capacidad_min_var.set(str(plan.get('capacidad_minima', '')))
                self.capacidad_max_var.set(str(plan.get('capacidad_maxima', '')))
                self.duracion_var.set(str(plan.get('duracion_horas', '')))
                self.incluye_text.delete('1.0', tk.END)
                self.incluye_text.insert('1.0', plan.get('incluye', ''))
    
    def limpiar_formulario(self):
        """Limpia el formulario"""
        self.id_var.set('')
        self.nombre_var.set('')
        self.descripcion_text.delete('1.0', tk.END)
        self.precio_var.set('')
        self.capacidad_min_var.set('')
        self.capacidad_max_var.set('')
        self.duracion_var.set('')
        self.incluye_text.delete('1.0', tk.END)
    
    def validar_campos(self):
        """Valida los campos requeridos"""
        if not self.nombre_var.get().strip():
            mostrar_error(self.parent, "Error de Validación", "El nombre es requerido")
            return False
        if not self.precio_var.get().strip():
            mostrar_error(self.parent, "Error de Validación", "El precio base es requerido")
            return False
        try:
            float(self.precio_var.get())
        except ValueError:
            mostrar_error(self.parent, "Error de Validación", "El precio debe ser un número válido")
            return False
        return True
    
    def crear_plan(self):
        """Crea un nuevo plan"""
        if not self.validar_campos():
            return
        
        datos = {
            'nombre': self.nombre_var.get().strip(),
            'descripcion': self.descripcion_text.get('1.0', tk.END).strip(),
            'precio_base': float(self.precio_var.get()),
            'capacidad_minima': int(self.capacidad_min_var.get() or 0) or None,
            'capacidad_maxima': int(self.capacidad_max_var.get() or 0) or None,
            'duracion_horas': int(self.duracion_var.get() or 0) or None,
            'incluye': self.incluye_text.get('1.0', tk.END).strip() or None
        }
        
        if self.modelo.crear_plan(datos):
            self.autenticacion.registrar_log("Crear plan", "Planes", f"Plan creado: {datos['nombre']}")
            mostrar_info(self.parent, "Éxito", "Plan creado exitosamente")
            self.limpiar_formulario()
            self.cargar_datos()
        else:
            mostrar_error(self.parent, "Error", "Error al crear el plan")
    
    def actualizar_plan(self):
        """Actualiza un plan"""
        if not self.id_var.get():
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un plan para actualizar")
            return
        
        if not self.validar_campos():
            return
        
        datos = {
            'nombre': self.nombre_var.get().strip(),
            'descripcion': self.descripcion_text.get('1.0', tk.END).strip(),
            'precio_base': float(self.precio_var.get()),
            'capacidad_minima': int(self.capacidad_min_var.get() or 0) or None,
            'capacidad_maxima': int(self.capacidad_max_var.get() or 0) or None,
            'duracion_horas': int(self.duracion_var.get() or 0) or None,
            'incluye': self.incluye_text.get('1.0', tk.END).strip() or None,
            'activo': True
        }
        
        if self.modelo.actualizar_plan(int(self.id_var.get()), datos):
            self.autenticacion.registrar_log("Actualizar plan", "Planes", f"Plan actualizado: {datos['nombre']}")
            mostrar_info(self.parent, "Éxito", "Plan actualizado exitosamente")
            self.limpiar_formulario()
            self.cargar_datos()
        else:
            mostrar_error(self.parent, "Error", "Error al actualizar el plan")
    
    def eliminar_plan(self):
        """Elimina un plan"""
        if not self.id_var.get():
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un plan para eliminar")
            return
        
        if confirmar(self.parent, "Confirmar Eliminación", "¿Está seguro de eliminar este plan?"):
            if self.modelo.eliminar_plan(int(self.id_var.get())):
                self.autenticacion.registrar_log("Eliminar plan", "Planes", f"Plan eliminado: ID {self.id_var.get()}")
                mostrar_info(self.parent, "Éxito", "Plan eliminado exitosamente")
                self.limpiar_formulario()
                self.cargar_datos()
            else:
                mostrar_error(self.parent, "Error", "Error al eliminar el plan")
