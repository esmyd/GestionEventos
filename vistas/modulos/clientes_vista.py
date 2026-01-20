"""
Vista para gestión de clientes
"""
import tkinter as tk
from tkinter import ttk
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import centrar_ventana, mostrar_error, mostrar_advertencia, mostrar_info, confirmar
from modelos.cliente_modelo import ClienteModelo
from modelos.usuario_modelo import UsuarioModelo
from modelos.autenticacion import Autenticacion


class VistaClientes:
    """Interfaz para gestión de clientes"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = ClienteModelo()
        self.usuario_modelo = UsuarioModelo()
        self.auth = Autenticacion()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        from utilidades.estilos_formularios import EstilosFormulario
        from utilidades.colores import ColoresBranding
        
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Gestión de Clientes",
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
            "Formulario de Cliente",
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
        self.usuario_id_var = tk.StringVar()
        self.nombre_completo_var = tk.StringVar()
        self.email_var = tk.StringVar()
        self.telefono_var = tk.StringVar()
        self.documento_var = tk.StringVar()
        self.direccion_text = None
        
        # Campos
        row = 0
        
        # ID Cliente
        label = EstilosFormulario.crear_label(form_padding, "ID Cliente:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.id_var, state='readonly', width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # ID Usuario
        label = EstilosFormulario.crear_label(form_padding, "ID Usuario:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.usuario_id_var, state='readonly', width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Nombre Completo
        label = EstilosFormulario.crear_label(form_padding, "Nombre Completo:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.nombre_completo_var, state='readonly', width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Email
        label = EstilosFormulario.crear_label(form_padding, "Email:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.email_var, state='readonly', width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Teléfono
        label = EstilosFormulario.crear_label(form_padding, "Teléfono:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.telefono_var, state='readonly', width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Documento
        label = EstilosFormulario.crear_label(form_padding, "Documento:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=self.documento_var, width=28)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        
        # Dirección
        label = EstilosFormulario.crear_label(form_padding, "Dirección:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        self.direccion_text = EstilosFormulario.crear_text(form_padding, width=28, height=3)
        self.direccion_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=6)
        
        # Configurar columnas
        form_padding.columnconfigure(1, weight=1)
        
        # Botones organizados en dos filas para mejor visibilidad
        button_container = tk.Frame(form_padding, bg=ColoresBranding.FONDO_CLARO)
        button_container.grid(row=row+1, column=0, columnspan=2, pady=(15, 10), sticky=tk.W+tk.E)
        
        # Primera fila
        button_frame_1 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_1.pack(fill=tk.X, pady=(0, 8))
        
        btn_nuevo = EstilosFormulario.crear_button(
            button_frame_1,
            "Nuevo Cliente",
            self.nuevo_cliente,
            tipo='principal',
            width=18
        )
        btn_nuevo.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_actualizar = EstilosFormulario.crear_button(
            button_frame_1,
            "Actualizar",
            self.actualizar_cliente,
            tipo='secundario',
            width=18
        )
        btn_actualizar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Segunda fila
        button_frame_2 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_2.pack(fill=tk.X)
        
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
            "Lista de Clientes",
            padx=15,
            pady=15
        )
        table_outer.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        columns = ('ID', 'Nombre Completo', 'Email', 'Teléfono', 'Documento')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=20)
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150)
        
        scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree.bind('<<TreeviewSelect>>', self.on_select)
    
    def cargar_datos(self):
        """Carga los clientes en la tabla"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        clientes = self.modelo.obtener_todos_clientes()
        for cliente in clientes:
            self.tree.insert('', tk.END, values=(
                cliente['id'],
                cliente.get('nombre_completo', 'N/A'),
                cliente.get('email', ''),
                cliente.get('telefono', ''),
                cliente.get('documento_identidad', '')
            ))
    
    def on_select(self, event):
        """Cuando se selecciona un cliente"""
        selection = self.tree.selection()
        if selection:
            item = self.tree.item(selection[0])
            cliente_id = item['values'][0]
            cliente = self.modelo.obtener_cliente_por_id(cliente_id)
            
            if cliente:
                self.id_var.set(cliente['id'])
                self.usuario_id_var.set(cliente.get('usuario_id', ''))
                self.nombre_completo_var.set(cliente.get('nombre_completo', ''))
                self.email_var.set(cliente.get('email', ''))
                self.telefono_var.set(cliente.get('telefono', ''))
                self.documento_var.set(cliente.get('documento_identidad', ''))
                self.direccion_text.delete('1.0', tk.END)
                self.direccion_text.insert('1.0', cliente.get('direccion', ''))
    
    def limpiar_formulario(self):
        """Limpia el formulario"""
        self.id_var.set('')
        self.usuario_id_var.set('')
        self.nombre_completo_var.set('')
        self.email_var.set('')
        self.telefono_var.set('')
        self.documento_var.set('')
        self.direccion_text.delete('1.0', tk.END)
    
    def nuevo_cliente(self):
        """Abre ventana para crear nuevo cliente"""
        from utilidades.estilos_formularios import EstilosFormulario
        from utilidades.colores import ColoresBranding
        
        ventana = tk.Toplevel(self.parent)
        ventana.title("Nuevo Cliente")
        ventana.geometry("600x650")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 600, 650)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        # Variables
        nombre_usuario_var = tk.StringVar()
        contrasena_var = tk.StringVar()
        nombre_completo_var = tk.StringVar()
        email_var = tk.StringVar()
        telefono_var = tk.StringVar()
        documento_var = tk.StringVar()
        direccion_text = None
        
        # Frame principal con estilo
        main_frame = EstilosFormulario.configurar_ventana_formulario(ventana, "Nuevo Cliente", 600, 650)
        
        # Título del formulario
        titulo_frame = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        titulo_frame.pack(fill=tk.X, pady=(0, 25))
        
        tk.Label(
            titulo_frame,
            text="Crear Nuevo Cliente",
            font=('Arial', 20, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.DORADO_PRINCIPAL
        ).pack(anchor=tk.W)
        
        tk.Label(
            titulo_frame,
            text="Complete los campos requeridos (*) para crear un nuevo cliente",
            font=('Arial', 10),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_GRIS
        ).pack(anchor=tk.W, pady=(5, 0))
        
        # Frame del formulario
        form_container = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        form_container.pack(fill=tk.BOTH, expand=True)
        
        row = 0
        
        # Nombre Usuario
        label = EstilosFormulario.crear_label(form_container, "Nombre Usuario *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_container, textvariable=nombre_usuario_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=8)
        
        row += 1
        
        # Contraseña
        label = EstilosFormulario.crear_label(form_container, "Contraseña *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_container, textvariable=contrasena_var, show='*', width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=8)
        
        row += 1
        
        # Nombre Completo
        label = EstilosFormulario.crear_label(form_container, "Nombre Completo *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_container, textvariable=nombre_completo_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=8)
        
        row += 1
        
        # Email
        label = EstilosFormulario.crear_label(form_container, "Email:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_container, textvariable=email_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=8)
        
        row += 1
        
        # Teléfono
        label = EstilosFormulario.crear_label(form_container, "Teléfono:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_container, textvariable=telefono_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=8)
        
        row += 1
        
        # Documento
        label = EstilosFormulario.crear_label(form_container, "Documento Identidad:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_container, textvariable=documento_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=8)
        
        row += 1
        
        # Dirección
        label = EstilosFormulario.crear_label(form_container, "Dirección:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        direccion_text = EstilosFormulario.crear_text(form_container, width=35, height=3)
        direccion_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 20), ipady=8)
        
        # Configurar columnas para que se expandan
        form_container.columnconfigure(1, weight=1)
        
        def guardar():
            if not nombre_usuario_var.get() or not contrasena_var.get() or not nombre_completo_var.get():
                mostrar_error(ventana, "Error", "Complete los campos requeridos (*)")
                return
            
            # Crear usuario primero
            contrasena_hash = self.auth.hash_contrasena(contrasena_var.get())
            datos_usuario = {
                'nombre_usuario': nombre_usuario_var.get().strip(),
                'contrasena': contrasena_hash,
                'nombre_completo': nombre_completo_var.get().strip(),
                'email': email_var.get().strip() or None,
                'telefono': telefono_var.get().strip() or None,
                'rol': 'cliente'
            }
            
            usuario_id = self.usuario_modelo.crear_usuario(datos_usuario)
            if not usuario_id:
                mostrar_error(ventana, "Error", "Error al crear el usuario. El nombre de usuario puede estar en uso.")
                return
            
            # Crear cliente
            datos_cliente = {
                'usuario_id': usuario_id,
                'documento_identidad': documento_var.get().strip() or None,
                'direccion': direccion_text.get('1.0', tk.END).strip() or None
            }
            
            if self.modelo.crear_cliente(datos_cliente):
                self.autenticacion.registrar_log("Crear cliente", "Clientes", f"Cliente creado: {datos_usuario['nombre_completo']}")
                mostrar_info(ventana, "Éxito", "Cliente creado exitosamente")
                ventana.destroy()
                self.limpiar_formulario()
                self.cargar_datos()
            else:
                mostrar_error(ventana, "Error", "Error al crear el cliente")
        
        # Botones
        button_frame = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
        button_frame.pack(fill=tk.X, pady=(20, 0))
        
        btn_guardar = EstilosFormulario.crear_button(
            button_frame,
            "Guardar",
            guardar,
            tipo='principal',
            width=18
        )
        btn_guardar.pack(side=tk.LEFT, padx=(0, 10))
        
        btn_cancelar = EstilosFormulario.crear_button(
            button_frame,
            "Cancelar",
            ventana.destroy,
            tipo='secundario',
            width=18
        )
        btn_cancelar.pack(side=tk.LEFT)
    
    def actualizar_cliente(self):
        """Actualiza los datos del cliente"""
        if not self.id_var.get():
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un cliente para actualizar")
            return
        
        datos = {
            'documento_identidad': self.documento_var.get().strip() or None,
            'direccion': self.direccion_text.get('1.0', tk.END).strip() or None
        }
        
        if self.modelo.actualizar_cliente(int(self.id_var.get()), datos):
            self.autenticacion.registrar_log("Actualizar cliente", "Clientes", f"Cliente actualizado: ID {self.id_var.get()}")
            mostrar_info(self.parent, "Éxito", "Cliente actualizado exitosamente")
            self.limpiar_formulario()
            self.cargar_datos()
        else:
            mostrar_error(self.parent, "Error", "Error al actualizar el cliente")

