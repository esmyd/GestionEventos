"""
Vista para gestión de usuarios
"""
import tkinter as tk
from tkinter import ttk
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import centrar_ventana, mostrar_error, mostrar_advertencia, mostrar_info, confirmar
from utilidades.colores import ColoresBranding
from utilidades.estilos_formularios import EstilosFormulario
from modelos.usuario_modelo import UsuarioModelo
from modelos.autenticacion import Autenticacion


class VistaUsuarios:
    """Interfaz para gestión de usuarios"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = UsuarioModelo()
        self.auth = Autenticacion()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Gestión de Usuarios",
            font=('Arial', 18, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Tabla
        table_outer, table_frame = EstilosFormulario.crear_label_frame(
            main_frame,
            "Lista de Usuarios",
            padx=15,
            pady=15
        )
        table_outer.pack(fill=tk.BOTH, expand=True)
        
        columns = ('ID', 'Usuario', 'Nombre Completo', 'Email', 'Rol', 'Estado')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=15)
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150)
        
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
        
        btn_nuevo = EstilosFormulario.crear_button(
            button_frame_1,
            "Nuevo Usuario",
            self.nuevo_usuario,
            tipo='principal',
            width=18
        )
        btn_nuevo.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_editar = EstilosFormulario.crear_button(
            button_frame_1,
            "Editar Usuario",
            self.editar_usuario,
            tipo='secundario',
            width=18
        )
        btn_editar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        # Segunda fila
        button_frame_2 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_2.pack(fill=tk.X)
        
        btn_cambiar = EstilosFormulario.crear_button(
            button_frame_2,
            "Cambiar Contraseña",
            self.cambiar_contrasena,
            tipo='info',
            width=18
        )
        btn_cambiar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_refrescar = EstilosFormulario.crear_button(
            button_frame_2,
            "Refrescar",
            self.cargar_datos,
            tipo='info',
            width=18
        )
        btn_refrescar.pack(side=tk.LEFT, fill=tk.X, expand=True)
    
    def cargar_datos(self):
        """Carga los usuarios en la tabla"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        usuarios = self.modelo.obtener_todos_usuarios()
        for usuario in usuarios:
            self.tree.insert('', tk.END, values=(
                usuario['id'],
                usuario['nombre_usuario'],
                usuario['nombre_completo'],
                usuario.get('email', ''),
                usuario['rol'].replace('_', ' ').title(),
                'Activo' if usuario['activo'] else 'Inactivo'
            ))
    
    def nuevo_usuario(self):
        """Abre ventana para crear nuevo usuario"""
        ventana = tk.Toplevel(self.parent)
        ventana.title("Nuevo Usuario")
        ventana.geometry("550x500")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 550, 500)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        # Variables
        nombre_usuario_var = tk.StringVar()
        contrasena_var = tk.StringVar()
        nombre_completo_var = tk.StringVar()
        email_var = tk.StringVar()
        telefono_var = tk.StringVar()
        rol_var = tk.StringVar()
        
        # Frame principal con estilo
        main_frame = EstilosFormulario.configurar_ventana_formulario(ventana, "Nuevo Usuario", 550, 500)
        
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
        # Nombre Usuario
        label = EstilosFormulario.crear_label(form_padding, "Nombre Usuario *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=nombre_usuario_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Contraseña
        label = EstilosFormulario.crear_label(form_padding, "Contraseña *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=contrasena_var, show='*', width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Nombre Completo
        label = EstilosFormulario.crear_label(form_padding, "Nombre Completo *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=nombre_completo_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Email
        label = EstilosFormulario.crear_label(form_padding, "Email:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=email_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Teléfono
        label = EstilosFormulario.crear_label(form_padding, "Teléfono:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=telefono_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Rol
        label = EstilosFormulario.crear_label(form_padding, "Rol *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        rol_combo = EstilosFormulario.crear_combobox(
            form_padding,
            textvariable=rol_var,
            values=['administrador', 'coordinador', 'gerente_general', 'cliente'],
            width=35
        )
        rol_combo.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15))
        
        def guardar():
            if not nombre_usuario_var.get() or not contrasena_var.get() or not nombre_completo_var.get() or not rol_var.get():
                mostrar_error(ventana, "Error", "Complete los campos requeridos (*)")
                return
            
            contrasena_hash = self.auth.hash_contrasena(contrasena_var.get())
            datos = {
                'nombre_usuario': nombre_usuario_var.get().strip(),
                'contrasena': contrasena_hash,
                'nombre_completo': nombre_completo_var.get().strip(),
                'email': email_var.get().strip() or None,
                'telefono': telefono_var.get().strip() or None,
                'rol': rol_var.get()
            }
            
            if self.modelo.crear_usuario(datos):
                self.autenticacion.registrar_log("Crear usuario", "Usuarios", f"Usuario creado: {datos['nombre_usuario']}")
                mostrar_info(ventana, "Éxito", "Usuario creado exitosamente")
                ventana.destroy()
                self.cargar_datos()
            else:
                mostrar_error(ventana, "Error", "Error al crear el usuario")
        
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
    
    def editar_usuario(self):
        """Edita un usuario seleccionado"""
        selection = self.tree.selection()
        if not selection:
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un usuario para editar")
            return
        
        item = self.tree.item(selection[0])
        usuario_id = item['values'][0]
        usuario = self.modelo.obtener_usuario_por_id(usuario_id)
        
        if not usuario:
            mostrar_error(self.parent, "Error", "No se pudo cargar la información del usuario")
            return
        
        ventana = tk.Toplevel(self.parent)
        ventana.title("Editar Usuario")
        ventana.geometry("550x450")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 550, 450)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        # Variables
        nombre_completo_var = tk.StringVar(value=usuario['nombre_completo'])
        email_var = tk.StringVar(value=usuario.get('email', ''))
        telefono_var = tk.StringVar(value=usuario.get('telefono', ''))
        rol_var = tk.StringVar(value=usuario['rol'])
        activo_var = tk.BooleanVar(value=usuario['activo'])
        
        # Frame principal con estilo
        main_frame = EstilosFormulario.configurar_ventana_formulario(ventana, "Editar Usuario", 550, 450)
        
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
        # Usuario (label informativo)
        label = tk.Label(
            form_padding,
            text=f"Usuario: {usuario['nombre_usuario']}",
            bg=ColoresBranding.FONDO_CLARO,
            font=('Arial', 10, 'bold'),
            fg=ColoresBranding.DORADO_PRINCIPAL
        )
        label.grid(row=row, column=0, columnspan=2, pady=(0, 15), sticky=tk.W)
        
        row += 1
        # Nombre Completo
        label = EstilosFormulario.crear_label(form_padding, "Nombre Completo *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=nombre_completo_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Email
        label = EstilosFormulario.crear_label(form_padding, "Email:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=email_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Teléfono
        label = EstilosFormulario.crear_label(form_padding, "Teléfono:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=telefono_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        # Rol
        label = EstilosFormulario.crear_label(form_padding, "Rol *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        rol_combo = EstilosFormulario.crear_combobox(
            form_padding,
            textvariable=rol_var,
            values=['administrador', 'coordinador', 'gerente_general', 'cliente'],
            width=35
        )
        rol_combo.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12))
        
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
            datos = {
                'nombre_completo': nombre_completo_var.get().strip(),
                'email': email_var.get().strip() or None,
                'telefono': telefono_var.get().strip() or None,
                'rol': rol_var.get(),
                'activo': activo_var.get()
            }
            
            if self.modelo.actualizar_usuario(usuario_id, datos):
                self.autenticacion.registrar_log("Actualizar usuario", "Usuarios", f"Usuario actualizado: ID {usuario_id}")
                mostrar_info(ventana, "Éxito", "Usuario actualizado exitosamente")
                ventana.destroy()
                self.cargar_datos()
            else:
                mostrar_error(ventana, "Error", "Error al actualizar el usuario")
        
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
    
    def cambiar_contrasena(self):
        """Cambia la contraseña de un usuario"""
        selection = self.tree.selection()
        if not selection:
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un usuario para cambiar su contraseña")
            return
        
        item = self.tree.item(selection[0])
        usuario_id = item['values'][0]
        
        ventana = tk.Toplevel(self.parent)
        ventana.title("Cambiar Contraseña")
        ventana.geometry("450x300")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 450, 300)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        # Frame principal con estilo
        main_frame = EstilosFormulario.configurar_ventana_formulario(ventana, "Cambiar Contraseña", 450, 300)
        
        nueva_contrasena_var = tk.StringVar()
        confirmar_contrasena_var = tk.StringVar()
        
        # Configurar columnas
        main_frame.columnconfigure(1, weight=1)
        
        row = 0
        # Nueva Contraseña
        label = EstilosFormulario.crear_label(main_frame, "Nueva Contraseña *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(main_frame, textvariable=nueva_contrasena_var, show='*', width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=6)
        
        row += 1
        # Confirmar Contraseña
        label = EstilosFormulario.crear_label(main_frame, "Confirmar Contraseña *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(main_frame, textvariable=confirmar_contrasena_var, show='*', width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=6)
        
        def guardar():
            nueva = nueva_contrasena_var.get()
            confirmar = confirmar_contrasena_var.get()
            
            if not nueva or not confirmar:
                mostrar_error(ventana, "Error", "Complete todos los campos")
                return
            
            if nueva != confirmar:
                mostrar_error(ventana, "Error", "Las contraseñas no coinciden")
                return
            
            if self.modelo.cambiar_contrasena(usuario_id, nueva):
                self.autenticacion.registrar_log("Cambiar contraseña", "Usuarios", f"Contraseña cambiada: ID {usuario_id}")
                mostrar_info(ventana, "Éxito", "Contraseña cambiada exitosamente")
                ventana.destroy()
            else:
                mostrar_error(ventana, "Error", "Error al cambiar la contraseña")
        
        # Botones
        button_container = tk.Frame(main_frame, bg=ColoresBranding.FONDO_CLARO)
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
