"""
Vista para gestión de categorías
"""
import tkinter as tk
from tkinter import ttk
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import mostrar_error, mostrar_advertencia, mostrar_info, confirmar, centrar_ventana
from utilidades.colores import ColoresBranding
from utilidades.estilos_formularios import EstilosFormulario
from modelos.categoria_modelo import CategoriaModelo


class VistaCategorias:
    """Interfaz para gestión de categorías"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = CategoriaModelo()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        # Frame principal
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Título
        tk.Label(
            main_frame,
            text="Gestión de Categorías",
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
            "Formulario de Categoría",
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
        self.activo_var = tk.BooleanVar(value=True)
        
        # Configurar columnas
        form_padding.columnconfigure(1, weight=1)
        
        # Campos del formulario
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
        self.descripcion_text = EstilosFormulario.crear_text(form_padding, width=28, height=4)
        self.descripcion_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Checkbutton Activa
        checkbutton = tk.Checkbutton(
            form_padding,
            text="Activa",
            variable=self.activo_var,
            bg=ColoresBranding.FONDO_CLARO,
            font=('Arial', 10),
            fg=ColoresBranding.TEXTO_OSCURO,
            selectcolor=ColoresBranding.FONDO_CLARO,
            activebackground=ColoresBranding.FONDO_CLARO,
            activeforeground=ColoresBranding.TEXTO_OSCURO
        )
        checkbutton.grid(row=row, column=1, sticky=tk.W, pady=(0, 15))
        
        # Botones organizados en dos filas
        button_container = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        button_container.grid(row=row+1, column=0, columnspan=2, pady=(15, 10), sticky=tk.W+tk.E)
        
        # Primera fila
        button_frame_1 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_1.pack(fill=tk.X, pady=(0, 8))
        
        btn_crear = EstilosFormulario.crear_button(
            button_frame_1,
            "Crear",
            self.crear_categoria,
            tipo='principal',
            width=18
        )
        btn_crear.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_actualizar = EstilosFormulario.crear_button(
            button_frame_1,
            "Actualizar",
            self.actualizar_categoria,
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
            self.eliminar_categoria,
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
            "Lista de Categorías",
            padx=15,
            pady=15
        )
        table_outer.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Treeview
        columns = ('ID', 'Nombre', 'Descripción', 'Estado', 'Productos')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=20)
        
        for col in columns:
            self.tree.heading(col, text=col)
            if col == 'Descripción':
                self.tree.column(col, width=200)
            elif col == 'ID':
                self.tree.column(col, width=50)
            else:
                self.tree.column(col, width=120)
        
        scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree.bind('<<TreeviewSelect>>', self.on_select)
    
    def cargar_datos(self):
        """Carga las categorías en la tabla"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        categorias = self.modelo.obtener_todas_categorias(solo_activas=False)
        for categoria in categorias:
            num_productos = self.modelo.contar_productos_por_categoria(categoria['id'])
            estado = 'Activa' if categoria.get('activo', True) else 'Inactiva'
            descripcion = categoria.get('descripcion', '')[:50] + '...' if categoria.get('descripcion') and len(categoria.get('descripcion', '')) > 50 else categoria.get('descripcion', '')
            
            self.tree.insert('', tk.END, values=(
                categoria['id'],
                categoria['nombre'],
                descripcion or 'Sin descripción',
                estado,
                num_productos
            ))
    
    def on_select(self, event):
        """Cuando se selecciona una categoría"""
        selection = self.tree.selection()
        if selection:
            item = self.tree.item(selection[0])
            categoria_id = item['values'][0]
            categoria = self.modelo.obtener_categoria_por_id(categoria_id)
            
            if categoria:
                self.id_var.set(categoria['id'])
                self.nombre_var.set(categoria['nombre'])
                self.descripcion_text.delete('1.0', tk.END)
                self.descripcion_text.insert('1.0', categoria.get('descripcion', ''))
                self.activo_var.set(categoria.get('activo', True))
    
    def limpiar_formulario(self):
        """Limpia el formulario"""
        self.id_var.set('')
        self.nombre_var.set('')
        self.descripcion_text.delete('1.0', tk.END)
        self.activo_var.set(True)
    
    def validar_campos(self):
        """Valida los campos requeridos"""
        if not self.nombre_var.get().strip():
            mostrar_error(self.parent, "Error de Validación", "El nombre es requerido")
            return False
        return True
    
    def crear_categoria(self):
        """Crea una nueva categoría"""
        if not self.validar_campos():
            return
        
        # Verificar si ya existe
        categoria_existente = self.modelo.obtener_categoria_por_nombre(self.nombre_var.get().strip())
        if categoria_existente:
            mostrar_error(self.parent, "Error", "Ya existe una categoría con ese nombre")
            return
        
        datos = {
            'nombre': self.nombre_var.get().strip(),
            'descripcion': self.descripcion_text.get('1.0', tk.END).strip(),
            'activo': self.activo_var.get()
        }
        
        if self.modelo.crear_categoria(datos):
            self.autenticacion.registrar_log("Crear categoría", "Categorías", f"Categoría creada: {datos['nombre']}")
            mostrar_info(self.parent, "Éxito", "Categoría creada exitosamente")
            self.limpiar_formulario()
            self.cargar_datos()
        else:
            mostrar_error(self.parent, "Error", "Error al crear la categoría")
    
    def actualizar_categoria(self):
        """Actualiza una categoría"""
        if not self.id_var.get():
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione una categoría para actualizar")
            return
        
        if not self.validar_campos():
            return
        
        # Verificar si el nombre ya existe en otra categoría
        categoria_existente = self.modelo.obtener_categoria_por_nombre(self.nombre_var.get().strip())
        if categoria_existente and categoria_existente['id'] != int(self.id_var.get()):
            mostrar_error(self.parent, "Error", "Ya existe otra categoría con ese nombre")
            return
        
        datos = {
            'nombre': self.nombre_var.get().strip(),
            'descripcion': self.descripcion_text.get('1.0', tk.END).strip(),
            'activo': self.activo_var.get()
        }
        
        if self.modelo.actualizar_categoria(int(self.id_var.get()), datos):
            self.autenticacion.registrar_log("Actualizar categoría", "Categorías", f"Categoría actualizada: {datos['nombre']}")
            mostrar_info(self.parent, "Éxito", "Categoría actualizada exitosamente")
            self.limpiar_formulario()
            self.cargar_datos()
        else:
            mostrar_error(self.parent, "Error", "Error al actualizar la categoría")
    
    def eliminar_categoria(self):
        """Elimina una categoría (físicamente si no tiene productos, o la desactiva si tiene productos)"""
        if not self.id_var.get():
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione una categoría para eliminar")
            return
        
        categoria_id = int(self.id_var.get())
        num_productos = self.modelo.contar_productos_por_categoria(categoria_id)
        
        # Contar también productos inactivos
        from modelos.base_datos import BaseDatos
        base_datos = BaseDatos()
        consulta_total = "SELECT COUNT(*) as total FROM productos WHERE id_categoria = %s"
        resultado_total = base_datos.obtener_uno(consulta_total, (categoria_id,))
        num_productos_total = resultado_total['total'] if resultado_total else 0
        
        mensaje = f"¿Está seguro de eliminar esta categoría?"
        if num_productos_total > 0:
            mensaje += f"\n\nAdvertencia: Esta categoría tiene {num_productos_total} producto(s) asociado(s)."
            mensaje += f"\nLa categoría será desactivada (no se eliminará físicamente)."
        else:
            mensaje += f"\n\nLa categoría será eliminada permanentemente de la base de datos."
        
        if confirmar(self.parent, "Confirmar Eliminación", mensaje):
            if self.modelo.eliminar_categoria(categoria_id):
                if num_productos_total > 0:
                    mensaje_exito = f"Categoría desactivada exitosamente (tiene {num_productos_total} producto(s) asociado(s))"
                else:
                    mensaje_exito = "Categoría eliminada permanentemente de la base de datos"
                
                self.autenticacion.registrar_log("Eliminar categoría", "Categorías", f"Categoría eliminada: ID {categoria_id}")
                mostrar_info(self.parent, "Éxito", mensaje_exito)
                self.limpiar_formulario()
                self.cargar_datos()
            else:
                mostrar_error(self.parent, "Error", "Error al eliminar la categoría. Verifique los logs para más detalles.")

