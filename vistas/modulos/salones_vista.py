"""
Vista para gestión de salones
"""
import tkinter as tk
from tkinter import ttk
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import centrar_ventana, mostrar_error, mostrar_advertencia, mostrar_info, confirmar
from utilidades.colores import ColoresBranding
from utilidades.estilos_formularios import EstilosFormulario
from modelos.salon_modelo import SalonModelo


class VistaSalones:
    """Interfaz para gestión de salones"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = SalonModelo()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Gestión de Salones",
            font=('Arial', 18, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Tabla
        table_outer, table_frame = EstilosFormulario.crear_label_frame(
            main_frame,
            "Lista de Salones",
            padx=15,
            pady=15
        )
        table_outer.pack(fill=tk.BOTH, expand=True)
        
        columns = ('ID', 'Nombre', 'Capacidad', 'Ubicación', 'Precio Base', 'Estado')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=15)
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120)
        
        scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Botones organizados en dos filas
        button_container = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        button_container.pack(fill=tk.X, pady=(15, 10))
        
        # Primera fila
        button_frame_1 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_1.pack(fill=tk.X, pady=(0, 8))
        
        if self.usuario['rol'] in ['administrador', 'coordinador']:
            btn_nuevo = EstilosFormulario.crear_button(
                button_frame_1,
                "Nuevo Salón",
                self.nuevo_salon,
                tipo='principal',
                width=18
            )
            btn_nuevo.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
            
            btn_editar = EstilosFormulario.crear_button(
                button_frame_1,
                "Editar Salón",
                self.editar_salon,
                tipo='secundario',
                width=18
            )
            btn_editar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        # Segunda fila
        button_frame_2 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_2.pack(fill=tk.X)
        
        if self.usuario['rol'] in ['administrador', 'coordinador']:
            btn_eliminar = EstilosFormulario.crear_button(
                button_frame_2,
                "Eliminar Salón",
                self.eliminar_salon,
                tipo='peligro',
                width=18
            )
            btn_eliminar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_refrescar = EstilosFormulario.crear_button(
            button_frame_2,
            "Refrescar",
            self.cargar_datos,
            tipo='info',
            width=18
        )
        btn_refrescar.pack(side=tk.LEFT, fill=tk.X, expand=True)
    
    def cargar_datos(self):
        """Carga los salones en la tabla"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        salones = self.modelo.obtener_todos_salones()
        for salon in salones:
            estado = "Activo" if salon.get('activo') else "Inactivo"
            self.tree.insert('', tk.END, values=(
                salon['id_salon'],
                salon['nombre'],
                salon['capacidad'],
                salon.get('ubicacion', 'N/A'),
                f"${salon.get('precio_base', 0):.2f}",
                estado
            ))
    
    def nuevo_salon(self):
        """Abre ventana para crear un nuevo salón"""
        self.abrir_formulario_salon()
    
    def editar_salon(self):
        """Abre ventana para editar un salón"""
        selection = self.tree.selection()
        if not selection:
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un salón para editar")
            return
        
        item = self.tree.item(selection[0])
        salon_id = item['values'][0]
        salon = self.modelo.obtener_salon_por_id(salon_id)
        
        if salon:
            self.abrir_formulario_salon(salon)
        else:
            mostrar_error(self.parent, "Error", "No se pudo obtener la información del salón")
    
    def eliminar_salon(self):
        """Elimina un salón (físicamente si no tiene eventos, o lo desactiva si tiene eventos)"""
        selection = self.tree.selection()
        if not selection:
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un salón para eliminar")
            return
        
        item = self.tree.item(selection[0])
        salon_id = item['values'][0]
        nombre = item['values'][1]
        
        # Contar eventos asociados
        from modelos.base_datos import BaseDatos
        base_datos = BaseDatos()
        consulta_count = "SELECT COUNT(*) as total FROM eventos WHERE id_salon = %s"
        resultado = base_datos.obtener_uno(consulta_count, (salon_id,))
        num_eventos = resultado['total'] if resultado else 0
        
        mensaje = f"¿Está seguro de eliminar el salón '{nombre}'?"
        if num_eventos > 0:
            mensaje += f"\n\nAdvertencia: Este salón tiene {num_eventos} evento(s) asociado(s)."
            mensaje += f"\nEl salón será desactivado (no se eliminará físicamente)."
        else:
            mensaje += f"\n\nEl salón será eliminado permanentemente de la base de datos."
        
        if confirmar(self.parent, "Confirmar Eliminación", mensaje):
            if self.modelo.eliminar_salon(salon_id):
                if num_eventos > 0:
                    mensaje_exito = f"Salón desactivado exitosamente (tiene {num_eventos} evento(s) asociado(s))"
                else:
                    mensaje_exito = "Salón eliminado permanentemente de la base de datos"
                
                self.autenticacion.registrar_log("Eliminar salón", "Salones", f"Salón eliminado: {nombre}")
                mostrar_info(self.parent, "Éxito", mensaje_exito)
                self.cargar_datos()
            else:
                mostrar_error(self.parent, "Error", "Error al eliminar el salón. Verifique los logs para más detalles.")
    
    def abrir_formulario_salon(self, salon=None):
        """Abre el formulario para crear/editar un salón"""
        ventana = tk.Toplevel(self.parent)
        ventana.title("Nuevo Salón" if not salon else "Editar Salón")
        ventana.geometry("550x550")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 550, 550)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        # Variables
        nombre_var = tk.StringVar(value=salon.get('nombre', '') if salon else '')
        capacidad_var = tk.StringVar(value=str(salon.get('capacidad', '')) if salon else '')
        ubicacion_var = tk.StringVar(value=salon.get('ubicacion', '') if salon else '')
        precio_var = tk.StringVar(value=str(salon.get('precio_base', 0)) if salon else '0')
        activo_var = tk.BooleanVar(value=salon.get('activo', True) if salon else True)
        descripcion_text = None
        
        # Frame principal con estilo
        main_frame = EstilosFormulario.configurar_ventana_formulario(ventana, "Nuevo Salón" if not salon else "Editar Salón", 550, 550)
        
        # Crear frame scrollable
        scroll_container, scrollable_frame = EstilosFormulario.crear_frame_scrollable(
            main_frame,
            bg=ColoresBranding.FONDO_CLARO
        )
        scroll_container.pack(fill=tk.BOTH, expand=True)
        
        # Frame interno con padding
        form_padding = tk.Frame(scrollable_frame, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        form_padding.pack(fill=tk.BOTH, expand=True)
        
        # Configurar columnas
        form_padding.columnconfigure(1, weight=1)
        
        row = 0
        # Nombre
        label = EstilosFormulario.crear_label(form_padding, "Nombre *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=nombre_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Capacidad
        label = EstilosFormulario.crear_label(form_padding, "Capacidad *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=capacidad_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Ubicación
        label = EstilosFormulario.crear_label(form_padding, "Ubicación:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=ubicacion_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Precio Base
        label = EstilosFormulario.crear_label(form_padding, "Precio Base:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=precio_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Descripción
        label = EstilosFormulario.crear_label(form_padding, "Descripción:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        descripcion_text = EstilosFormulario.crear_text(form_padding, width=35, height=4)
        descripcion_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        if salon and salon.get('descripcion'):
            descripcion_text.insert('1.0', salon['descripcion'])
        
        row += 1
        # Checkbutton Activo
        checkbutton = tk.Checkbutton(
            form_padding,
            text="Activo",
            variable=activo_var,
            bg=ColoresBranding.FONDO_CLARO,
            font=('Arial', 10),
            fg=ColoresBranding.TEXTO_OSCURO,
            selectcolor=ColoresBranding.FONDO_CLARO,
            activebackground=ColoresBranding.FONDO_CLARO,
            activeforeground=ColoresBranding.TEXTO_OSCURO
        )
        checkbutton.grid(row=row, column=1, sticky=tk.W, pady=(0, 15))
        
        def guardar():
            if not nombre_var.get() or not capacidad_var.get():
                mostrar_error(ventana, "Error", "Complete los campos requeridos (*)")
                return
            
            try:
                capacidad = int(capacidad_var.get())
                precio_base = float(precio_var.get() or 0)
            except ValueError:
                mostrar_error(ventana, "Error", "Capacidad y precio deben ser números válidos")
                return
            
            datos = {
                'nombre': nombre_var.get().strip(),
                'capacidad': capacidad,
                'ubicacion': ubicacion_var.get().strip() or None,
                'descripcion': descripcion_text.get('1.0', tk.END).strip() or None,
                'precio_base': precio_base,
                'activo': activo_var.get()
            }
            
            if salon:
                # Actualizar
                if self.modelo.actualizar_salon(salon['id_salon'], datos):
                    self.autenticacion.registrar_log("Editar salón", "Salones", f"Salón actualizado: {datos['nombre']}")
                    mostrar_info(ventana, "Éxito", "Salón actualizado exitosamente")
                    ventana.destroy()
                    self.cargar_datos()
                else:
                    mostrar_error(ventana, "Error", "Error al actualizar el salón")
            else:
                # Crear
                salon_id = self.modelo.crear_salon(datos)
                if salon_id:
                    self.autenticacion.registrar_log("Crear salón", "Salones", f"Salón creado: {datos['nombre']}")
                    mostrar_info(ventana, "Éxito", "Salón creado exitosamente")
                    ventana.destroy()
                    self.cargar_datos()
                else:
                    mostrar_error(ventana, "Error", "Error al crear el salón")
        
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

