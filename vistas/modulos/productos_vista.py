"""
Vista para gestión de productos
"""
import tkinter as tk
from tkinter import ttk
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import mostrar_error, mostrar_advertencia, mostrar_info, confirmar
from modelos.producto_modelo import ProductoModelo
from modelos.categoria_modelo import CategoriaModelo


class VistaProductos:
    """Interfaz para gestión de productos"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = ProductoModelo()
        self.modelo_categoria = CategoriaModelo()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        from utilidades.estilos_formularios import EstilosFormulario
        from utilidades.colores import ColoresBranding
        
        # Frame principal
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)# ¿Frame? es un contenedor para los widgets
        main_frame.pack(fill=tk.BOTH, expand=True)# ¿pack? es un metodo para agregar el widget al main_frame
        
        # Título
        tk.Label(
            main_frame,
            text="Gestión de Productos",
            font=('Arial', 20, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.DORADO_PRINCIPAL
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Frame de contenido
        content_frame = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Frame izquierdo - Formulario con estilo mejorado y scroll
        form_outer, form_container = EstilosFormulario.crear_label_frame(
            content_frame,
            "Formulario de Producto",
            padx=0,
            pady=0
        )
        form_outer.pack(side=tk.LEFT, fill=tk.BOTH, padx=(0, 10), expand=False)
        
        # Crear frame scrollable
        scroll_container, scrollable_frame = EstilosFormulario.crear_frame_scrollable(
            form_container,
            bg=ColoresBranding.FONDO_CLARO
        )
        scroll_container.pack(fill=tk.BOTH, expand=True)
        
        # Frame interno con padding para los campos
        form_padding = tk.Frame(scrollable_frame, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        form_padding.pack(fill=tk.BOTH, expand=True)
        
        # Variables
        self.id_var = tk.StringVar()
        self.nombre_var = tk.StringVar()
        self.descripcion_text = None
        self.detalles_adicionales_text = None
        self.variantes_text = None
        self.precio_var = tk.StringVar()
        self.precio_minimo_var = tk.StringVar()
        self.precio_maximo_var = tk.StringVar()
        self.duracion_horas_var = tk.StringVar()
        self.tipo_servicio_var = tk.StringVar()
        self.categoria_id_var = tk.StringVar()
        self.categoria_combo = None
        self.stock_var = tk.StringVar()
        self.unidad_medida_var = tk.StringVar(value='unidad')
        
        # Campos del formulario - usar form_padding en lugar de form_padding
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
        
        # Detalles Adicionales
        label = EstilosFormulario.crear_label(form_padding, "Detalles Adicionales:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        self.detalles_adicionales_text = EstilosFormulario.crear_text(form_padding, width=28, height=2)
        self.detalles_adicionales_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Variantes/Opciones
        label = EstilosFormulario.crear_label(form_padding, "Variantes/Opciones:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        self.variantes_text = EstilosFormulario.crear_text(form_padding, width=28, height=2)
        self.variantes_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 5), ipady=6)
        tk.Label(form_padding, text="(ej: 3x3: $350, 4x3: $400)", bg=ColoresBranding.FONDO_CLARO, 
                 font=('Arial', 8), fg=ColoresBranding.TEXTO_GRIS).grid(row=row, column=1, sticky=tk.W, padx=8, pady=(0, 12))
        
        row += 1
        
        # Precio Base
        label = EstilosFormulario.crear_label(form_padding, "Precio Base *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.precio_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Precio Mínimo
        label = EstilosFormulario.crear_label(form_padding, "Precio Mínimo:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.precio_minimo_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Precio Máximo
        label = EstilosFormulario.crear_label(form_padding, "Precio Máximo:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.precio_maximo_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Duración
        label = EstilosFormulario.crear_label(form_padding, "Duración (horas):", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.duracion_horas_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Tipo de Servicio
        label = EstilosFormulario.crear_label(form_padding, "Tipo de Servicio:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        tipo_combo = EstilosFormulario.crear_combobox(
            form_padding,
            textvariable=self.tipo_servicio_var,
            values=['servicio', 'equipo', 'producto', 'paquete', 'otro'],
            state='readonly',
            width=25
        )
        tipo_combo.set('servicio')
        tipo_combo.grid(row=row, column=1, sticky=tk.W, pady=(0, 12))
        
        row += 1
        
        # Unidad de Medida
        label = EstilosFormulario.crear_label(form_padding, "Unidad de Medida:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.unidad_medida_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Categoría
        label = EstilosFormulario.crear_label(form_padding, "Categoría:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        categorias = self.modelo_categoria.obtener_todas_categorias(solo_activas=True)
        categorias_list = [''] + [f"{cat['id']}:{cat['nombre']}" for cat in categorias]
        self.categoria_combo = EstilosFormulario.crear_combobox(
            form_padding, 
            textvariable=self.categoria_id_var,
            values=categorias_list,
            state='readonly',
            width=25
        )
        self.categoria_combo.grid(row=row, column=1, sticky=tk.W, pady=(0, 12))
        
        row += 1
        
        # Stock
        label = EstilosFormulario.crear_label(form_padding, "Stock:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.stock_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=6)
        
        # Configurar columnas
        form_padding.columnconfigure(1, weight=1)
        
        # Botones organizados en dos filas
        button_container = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        button_container.grid(row=row+1, column=0, columnspan=2, pady=(15, 10), sticky=tk.W+tk.E)
        
        # Primera fila de botones
        button_frame_1 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_1.pack(fill=tk.X, pady=(0, 8))
        
        btn_crear = EstilosFormulario.crear_button(
            button_frame_1,
            "Crear",
            self.crear_producto,
            tipo='principal',
            width=18
        )
        btn_crear.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_actualizar = EstilosFormulario.crear_button(
            button_frame_1,
            "Actualizar",
            self.actualizar_producto,
            tipo='secundario',
            width=18
        )
        btn_actualizar.pack(side=tk.LEFT, padx=(0, 0), fill=tk.X, expand=True)
        
        # Segunda fila de botones
        button_frame_2 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_2.pack(fill=tk.X)
        
        btn_eliminar = EstilosFormulario.crear_button(
            button_frame_2,
            "Eliminar",
            self.eliminar_producto,
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
            "Lista de Productos",
            padx=15,
            pady=15
        )
        table_outer.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Treeview
        columns = ('ID', 'Nombre', 'Categoría', 'Precio', 'Stock')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=20)
        
        for col in columns:
            self.tree.heading(col, text=col)
            if col == 'Nombre':
                self.tree.column(col, width=200)
            elif col == 'Categoría':
                self.tree.column(col, width=150)
            else:
                self.tree.column(col, width=100)
        
        scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree.bind('<<TreeviewSelect>>', self.on_select)
    
    def cargar_datos(self):
        """Carga los productos en la tabla"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        productos = self.modelo.obtener_todos_productos()
        for producto in productos:
            self.tree.insert('', tk.END, values=(
                producto['id'],
                producto['nombre'],
                producto.get('nombre_categoria', 'Sin categoría'),
                f"${producto['precio']:.2f}",
                producto.get('stock', 0)
            ))
    
    def on_select(self, event):
        """Cuando se selecciona un producto"""
        selection = self.tree.selection()
        if selection:
            item = self.tree.item(selection[0])
            producto_id = item['values'][0]
            producto = self.modelo.obtener_producto_por_id(producto_id)
            
            if producto:
                self.id_var.set(producto['id'])
                self.nombre_var.set(producto['nombre'])
                self.descripcion_text.delete('1.0', tk.END)
                self.descripcion_text.insert('1.0', producto.get('descripcion', ''))
                
                self.detalles_adicionales_text.delete('1.0', tk.END)
                self.detalles_adicionales_text.insert('1.0', producto.get('detalles_adicionales', ''))
                
                self.variantes_text.delete('1.0', tk.END)
                self.variantes_text.insert('1.0', producto.get('variantes', ''))
                
                self.precio_var.set(str(producto.get('precio', 0)))
                self.precio_minimo_var.set(str(producto.get('precio_minimo', '') or ''))
                self.precio_maximo_var.set(str(producto.get('precio_maximo', '') or ''))
                self.duracion_horas_var.set(str(producto.get('duracion_horas', '') or ''))
                self.tipo_servicio_var.set(producto.get('tipo_servicio', 'servicio'))
                self.unidad_medida_var.set(producto.get('unidad_medida', 'unidad'))
                
                # Establecer categoría en el combobox
                categoria_id = producto.get('id_categoria') or producto.get('categoria_id')
                if categoria_id:
                    # Recargar categorías para asegurar que estén actualizadas
                    categorias = self.modelo_categoria.obtener_todas_categorias(solo_activas=True)
                    categorias_list = [''] + [f"{cat['id']}:{cat['nombre']}" for cat in categorias]
                    self.categoria_combo['values'] = categorias_list
                    self.categoria_id_var.set(f"{categoria_id}:{producto.get('nombre_categoria', '')}")
                else:
                    self.categoria_id_var.set('')
                
                self.stock_var.set(str(producto.get('stock', 0)))
    
    def limpiar_formulario(self):
        """Limpia el formulario"""
        self.id_var.set('')
        self.nombre_var.set('')
        self.descripcion_text.delete('1.0', tk.END)
        self.detalles_adicionales_text.delete('1.0', tk.END)
        self.variantes_text.delete('1.0', tk.END)
        self.precio_var.set('')
        self.precio_minimo_var.set('')
        self.precio_maximo_var.set('')
        self.duracion_horas_var.set('')
        self.tipo_servicio_var.set('servicio')
        self.unidad_medida_var.set('unidad')
        self.categoria_id_var.set('')
        self.stock_var.set('')
        # Recargar categorías en el combobox
        categorias = self.modelo_categoria.obtener_todas_categorias(solo_activas=True)
        categorias_list = [''] + [f"{cat['id']}:{cat['nombre']}" for cat in categorias]
        self.categoria_combo['values'] = categorias_list
    
    def validar_campos(self):
        """Valida los campos requeridos"""
        if not self.nombre_var.get().strip():
            mostrar_error(self.parent, "Error de Validación", "El nombre es requerido")
            return False
        
        # Validar que al menos precio o precio_minimo esté presente
        precio = self.precio_var.get().strip()
        precio_min = self.precio_minimo_var.get().strip()
        if not precio and not precio_min:
            mostrar_error(self.parent, "Error de Validación", "Debe proporcionar al menos un precio base o precio mínimo")
            return False
        
        # Validar números
        if precio:
            try:
                float(precio)
            except ValueError:
                mostrar_error(self.parent, "Error de Validación", "El precio debe ser un número válido")
                return False
        
        if precio_min:
            try:
                float(precio_min)
            except ValueError:
                mostrar_error(self.parent, "Error de Validación", "El precio mínimo debe ser un número válido")
                return False
        
        precio_max = self.precio_maximo_var.get().strip()
        if precio_max:
            try:
                float(precio_max)
            except ValueError:
                mostrar_error(self.parent, "Error de Validación", "El precio máximo debe ser un número válido")
                return False
        
        duracion = self.duracion_horas_var.get().strip()
        if duracion:
            try:
                int(duracion)
            except ValueError:
                mostrar_error(self.parent, "Error de Validación", "La duración debe ser un número entero")
                return False
        
        return True
    
    def crear_producto(self):
        """Crea un nuevo producto"""
        if not self.validar_campos():
            return
        
        # Extraer ID de categoría del formato "id:nombre"
        categoria_seleccionada = self.categoria_id_var.get()
        id_categoria = None
        if categoria_seleccionada:
            try:
                id_categoria = int(categoria_seleccionada.split(':')[0])
            except (ValueError, IndexError):
                id_categoria = None
        
        precio = self.precio_var.get().strip()
        precio_min = self.precio_minimo_var.get().strip()
        precio_max = self.precio_maximo_var.get().strip()
        duracion = self.duracion_horas_var.get().strip()
        
        datos = {
            'nombre': self.nombre_var.get().strip(),
            'descripcion': self.descripcion_text.get('1.0', tk.END).strip(),
            'detalles_adicionales': self.detalles_adicionales_text.get('1.0', tk.END).strip(),
            'variantes': self.variantes_text.get('1.0', tk.END).strip(),
            'precio': float(precio) if precio else None,
            'precio_minimo': float(precio_min) if precio_min else None,
            'precio_maximo': float(precio_max) if precio_max else None,
            'duracion_horas': int(duracion) if duracion else None,
            'tipo_servicio': self.tipo_servicio_var.get(),
            'unidad_medida': self.unidad_medida_var.get().strip() or 'unidad',
            'id_categoria': id_categoria,
            'stock': int(self.stock_var.get() or 0)
        }
        
        if self.modelo.crear_producto(datos):
            self.autenticacion.registrar_log("Crear producto", "Productos", f"Producto creado: {datos['nombre']}")
            mostrar_info(self.parent, "Éxito", "Producto creado exitosamente")
            self.limpiar_formulario()
            self.cargar_datos()
        else:
            mostrar_error(self.parent, "Error", "Error al crear el producto")
    
    def actualizar_producto(self):
        """Actualiza un producto"""
        if not self.id_var.get():
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un producto para actualizar")
            return
        
        if not self.validar_campos():
            return
        
        # Extraer ID de categoría del formato "id:nombre"
        categoria_seleccionada = self.categoria_id_var.get()
        id_categoria = None
        if categoria_seleccionada:
            try:
                id_categoria = int(categoria_seleccionada.split(':')[0])
            except (ValueError, IndexError):
                id_categoria = None
        
        precio = self.precio_var.get().strip()
        precio_min = self.precio_minimo_var.get().strip()
        precio_max = self.precio_maximo_var.get().strip()
        duracion = self.duracion_horas_var.get().strip()
        
        datos = {
            'nombre': self.nombre_var.get().strip(),
            'descripcion': self.descripcion_text.get('1.0', tk.END).strip(),
            'detalles_adicionales': self.detalles_adicionales_text.get('1.0', tk.END).strip(),
            'variantes': self.variantes_text.get('1.0', tk.END).strip(),
            'precio': float(precio) if precio else None,
            'precio_minimo': float(precio_min) if precio_min else None,
            'precio_maximo': float(precio_max) if precio_max else None,
            'duracion_horas': int(duracion) if duracion else None,
            'tipo_servicio': self.tipo_servicio_var.get(),
            'unidad_medida': self.unidad_medida_var.get().strip() or 'unidad',
            'id_categoria': id_categoria,
            'stock': int(self.stock_var.get() or 0)
        }
        
        if self.modelo.actualizar_producto(int(self.id_var.get()), datos):
            self.autenticacion.registrar_log("Actualizar producto", "Productos", f"Producto actualizado: {datos['nombre']}")
            mostrar_info(self.parent, "Éxito", "Producto actualizado exitosamente")
            self.limpiar_formulario()
            self.cargar_datos()
        else:
            mostrar_error(self.parent, "Error", "Error al actualizar el producto")
    
    def eliminar_producto(self):
        """Elimina un producto"""
        if not self.id_var.get():
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un producto para eliminar")
            return
        
        if confirmar(self.parent, "Confirmar Eliminación", "¿Está seguro de eliminar este producto?"):
            if self.modelo.eliminar_producto(int(self.id_var.get())):
                self.autenticacion.registrar_log("Eliminar producto", "Productos", f"Producto eliminado: ID {self.id_var.get()}")
                mostrar_info(self.parent, "Éxito", "Producto eliminado exitosamente")
                self.limpiar_formulario()
                self.cargar_datos()
            else:
                mostrar_error(self.parent, "Error", "Error al eliminar el producto")

