"""
Ventana de inicio de sesión - Diseño Innovador y Moderno
"""
import tkinter as tk
from tkinter import messagebox
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from modelos.autenticacion import Autenticacion
from utilidades.ventanas import mostrar_error

class VentanaLogin:
    """Ventana de autenticación de usuarios con diseño innovador"""
    
    def __init__(self, root, callback_login_exitoso):
        self.root = root
        self.root.title("Lirios Eventos - Inicio de Sesión")
        self.root.geometry("800x600")# define el tamaño de la ventana
        
        # Paleta de colores del branding Lirios Eventos (logo)
        # Colores: Muted Gold/Bronce, Blanco, Negro
        self.color_fondo_oscuro = '#000000'  # Negro del logo
        self.color_fondo_medio = '#1a1a1a'  # Negro ligeramente claro
        self.color_dorado_principal = '#d4af37'  # Dorado principal del logo
        self.color_dorado_medio = '#c9a961'  # Bronce/dorado medio
        self.color_dorado_oscuro = '#b8860b'  # Dorado oscuro para hover
        self.color_dorado_claro = '#f0d98e'  # Dorado claro para acentos
        self.color_primary = '#d4af37'  # Dorado como color primario
        self.color_card = '#ffffff'  # Blanco del logo
        self.color_entry_bg = '#f8f9fa'
        self.color_entry_border = '#e0e0e0'
        self.color_texto_oscuro = '#1a1a1a'
        self.color_texto_claro = '#ffffff'
        self.color_texto_dorado = '#d4af37'
        self.color_boton = '#d4af37'  # Dorado principal
        self.color_boton_hover = '#c9a961'  # Dorado medio
        self.color_boton_active = '#b8860b'  # Dorado oscuro
        
        self.root.configure(bg=self.color_fondo_oscuro)# configura el color de fondo de la ventana
        self.root.resizable(False, False)# no permite que la ventana se pueda redimensionar
        
        # Centrar ventana
        self.centrar_ventana()# centra la ventana en la pantalla  
        
        self.callback_login_exitoso = callback_login_exitoso# guarda la función callback
        self.autenticacion = Autenticacion()# crea una instancia de la autenticación
        self.animacion_activa = True# activa la animación
        
        self.crear_widgets()# crea los widgets de la ventana
        self.iniciar_animacion()# inicia la animación
    
    def centrar_ventana(self):
        """Centra la ventana en la pantalla"""
        sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))# inserta el directorio de la aplicación en el path
        from utilidades.ventanas import centrar_ventana# importa la función centrar_ventana
        centrar_ventana(self.root, 800, 600)# centra la ventana en la pantalla
    
    def iniciar_animacion(self):
        """Inicia animación sutil de elementos"""
        # Animación de pulso sutil para el icono
        self.animar_pulso()
    
    def animar_pulso(self):
        """Animación de pulso para elementos decorativos"""
        if hasattr(self, 'icon_label') and self.animacion_activa:
            try:
                current_size = int(self.icon_label.cget('font').split()[-1])
                # Efecto de pulso muy sutil
                self.root.after(3000, self.animar_pulso)# espera 3 segundos y llama a la función animar_pulso
            except:
                pass
    
    def on_entry_focus_in(self, event, entry_widget):
        """Efecto cuando el campo obtiene foco"""
        entry_widget.config(bg='#ffffff', relief=tk.SOLID, bd=2)
        entry_widget.config(highlightbackground=self.color_dorado_principal, highlightcolor=self.color_dorado_principal)
    
    def on_entry_focus_out(self, event, entry_widget):
        """Efecto cuando el campo pierde foco"""
        entry_widget.config(bg=self.color_entry_bg, relief=tk.FLAT, bd=0)
        entry_widget.config(highlightbackground='', highlightcolor='')
    
    def on_button_enter(self, event):
        """Efecto hover para el botón"""
        event.widget.config(bg=self.color_boton_hover, relief=tk.RAISED, bd=3)
    
    def on_button_leave(self, event):
        """Efecto hover para el botón"""
        event.widget.config(bg=self.color_boton, relief=tk.FLAT, bd=0)
    
    def crear_widgets(self):
        """Crea los widgets de la ventana de login con diseño innovador"""
        # Container principal con layout dividido
        main_container = tk.Frame(self.root, bg=self.color_fondo_oscuro)
        main_container.pack(fill=tk.BOTH, expand=True)
        
        # Panel lateral izquierdo con gradiente simulado
        left_panel = tk.Frame(main_container, bg=self.color_fondo_medio, width=400)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=False)
        left_panel.pack_propagate(False)
        
        # Gradiente simulado usando frames superpuestos
        gradient_frame = tk.Frame(left_panel, bg=self.color_fondo_medio)
        gradient_frame.pack(fill=tk.BOTH, expand=True)
        
        # Elementos decorativos del panel lateral - barra dorada superior
        decor_top = tk.Frame(gradient_frame, bg=self.color_dorado_principal, height=60)
        decor_top.pack(fill=tk.X)
        
        # Contenido del panel lateral
        left_content = tk.Frame(gradient_frame, bg=self.color_fondo_medio)
        left_content.pack(fill=tk.BOTH, expand=True, padx=50, pady=60)
        
        # Icono grande y destacado - en dorado
        icon_container = tk.Frame(left_content, bg=self.color_fondo_medio)
        icon_container.pack(pady=(40, 30))
        
        self.icon_label = tk.Label(
            icon_container,
            text="🌸",
            font=('Arial', 60),
            bg=self.color_fondo_medio,
            fg=self.color_dorado_principal
        )
        self.icon_label.pack()
        
        # Título principal - muy grande en dorado
        title_label = tk.Label(
            left_content,
            text="LIRIOS",
            font=('Arial', 36, 'bold'),
            bg=self.color_fondo_medio,
            fg=self.color_dorado_principal
        )
        title_label.pack(pady=(0, 5))
        
        title_sub = tk.Label(
            left_content,
            text="EVENTOS",
            font=('Arial', 36, 'bold'),
            bg=self.color_fondo_medio,
            fg=self.color_dorado_claro
        )
        title_sub.pack(pady=(0, 10))
        
        # Subtítulo adicional
        title_banquetes = tk.Label(
            left_content,
            text="& BANQUETES",
            font=('Arial', 18, 'bold'),
            bg=self.color_fondo_medio,
            fg=self.color_dorado_medio
        )
        title_banquetes.pack(pady=(0, 30))
        
        # Descripción con estilo
        desc_label = tk.Label(
            left_content,
            text="Sistema de Gestión Integral",
            font=('Arial', 14),
            bg=self.color_fondo_medio,
            fg='#b0bec5'
        )
        desc_label.pack(pady=(0, 30))
        
        # Línea decorativa en dorado
        line_frame = tk.Frame(left_content, bg=self.color_dorado_principal, height=4)
        line_frame.pack(fill=tk.X, pady=(0, 30))
        
        # Texto descriptivo
        info_label = tk.Label(
            left_content,
            text="Bienvenido al sistema de gestión\nde eventos más completo\ny moderno",
            font=('Arial', 14), # tamaño de la fuente
            bg=self.color_fondo_medio,
            fg='#90a4ae', # color del texto
            justify=tk.CENTER
        )
        info_label.pack()
        
        # Decoración inferior - barra dorada
        decor_bottom = tk.Frame(gradient_frame, bg=self.color_dorado_principal, height=40)
        decor_bottom.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Panel derecho - Formulario de login
        right_panel = tk.Frame(main_container, bg=self.color_entry_bg, width=400)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Container para centrar el formulario
        right_container = tk.Frame(right_panel, bg=self.color_entry_bg)
        right_container.pack(fill=tk.BOTH, expand=True, padx=40, pady=40)
        
        # Card del formulario con efecto de elevación (simulado con bordes)
        # Sombra simulada
        shadow_frame = tk.Frame(right_container, bg='#e0e0e0', height=2)
        shadow_frame.pack(fill=tk.X, pady=(0, 0))
        
        card_frame = tk.Frame(
            right_container,
            bg=self.color_card,
            relief=tk.FLAT,
            bd=0
        )
        card_frame.pack(fill=tk.BOTH, expand=True, ipadx=40, ipady=40)
        
        # Título del formulario
        form_title = tk.Label(
            card_frame,
            text="Iniciar Sesión",
            font=('Arial', 20, 'bold'),
            bg=self.color_card,
            fg=self.color_texto_oscuro
        )
        form_title.pack(pady=(20, 10))
        
        form_subtitle = tk.Label(
            card_frame,
            text="Ingresa tus credenciales para continuar",
            font=('Arial', 10),
            bg=self.color_card,
            fg='#757575'
        )
        form_subtitle.pack(pady=(0, 40))
        
        # Frame de formulario
        form_frame = tk.Frame(card_frame, bg=self.color_card)
        form_frame.pack(fill=tk.BOTH, expand=True, padx=40)
        
        # Campo Usuario
        usuario_container = tk.Frame(form_frame, bg=self.color_card)
        usuario_container.pack(fill=tk.X, pady=(0, 25))
        
        usuario_label_frame = tk.Frame(usuario_container, bg=self.color_card)
        usuario_label_frame.pack(fill=tk.X, pady=(0, 10))
        
        usuario_icon = tk.Label(
            usuario_label_frame,
            text="👤",
            font=('Arial', 20),
            bg=self.color_card,
            fg=self.color_dorado_principal
        )
        usuario_icon.pack(side=tk.LEFT, padx=(0, 12))
        
        tk.Label(
            usuario_label_frame,
            text="Usuario",
            font=('Arial', 14, 'bold'),
            bg=self.color_card,
            fg=self.color_texto_oscuro
        ).pack(side=tk.LEFT)
        
        self.entry_usuario = tk.Entry(
            usuario_container,
            font=('Arial', 15),
            width=32,
            bg=self.color_entry_bg,
            fg=self.color_texto_oscuro,
            relief=tk.FLAT,
            bd=0,
            insertbackground=self.color_dorado_principal,
            highlightthickness=1,
            highlightbackground=self.color_entry_border,
            highlightcolor=self.color_dorado_principal
        )
        self.entry_usuario.pack(fill=tk.X, ipady=14)
        self.entry_usuario.insert(0, "admin")
        self.entry_usuario.focus()
        self.entry_usuario.bind('<Return>', lambda e: self.entry_contrasena.focus())
        self.entry_usuario.bind('<FocusIn>', lambda e: self.on_entry_focus_in(e, self.entry_usuario))
        self.entry_usuario.bind('<FocusOut>', lambda e: self.on_entry_focus_out(e, self.entry_usuario))
        
        # Campo Contraseña
        contrasena_container = tk.Frame(form_frame, bg=self.color_card)
        contrasena_container.pack(fill=tk.X, pady=(0, 30))
        
        contrasena_label_frame = tk.Frame(contrasena_container, bg=self.color_card)
        contrasena_label_frame.pack(fill=tk.X, pady=(0, 10))
        
        contrasena_icon = tk.Label(
            contrasena_label_frame,
            text="🔒",
            font=('Arial', 20),
            bg=self.color_card,
            fg=self.color_dorado_principal
        )
        contrasena_icon.pack(side=tk.LEFT, padx=(0, 12))
        
        tk.Label(
            contrasena_label_frame,
            text="Contraseña",
            font=('Arial', 14, 'bold'),
            bg=self.color_card,
            fg=self.color_texto_oscuro
        ).pack(side=tk.LEFT)
        
        self.entry_contrasena = tk.Entry(
            contrasena_container,
            font=('Arial', 15),
            width=32,
            show='*',
            bg=self.color_entry_bg,
            fg=self.color_texto_oscuro,
            relief=tk.FLAT,
            bd=0,
            insertbackground=self.color_dorado_principal,
            highlightthickness=1,
            highlightbackground=self.color_entry_border,
            highlightcolor=self.color_dorado_principal
        )
        self.entry_contrasena.pack(fill=tk.X, ipady=14)
        self.entry_contrasena.insert(0, "admin123")
        self.entry_contrasena.bind('<Return>', lambda e: self.iniciar_sesion())
        self.entry_contrasena.bind('<FocusIn>', lambda e: self.on_entry_focus_in(e, self.entry_contrasena))
        self.entry_contrasena.bind('<FocusOut>', lambda e: self.on_entry_focus_out(e, self.entry_contrasena))
        
        # Botón de login - diseño innovador
        btn_container = tk.Frame(form_frame, bg=self.color_card)
        btn_container.pack(fill=tk.X, pady=(0, 25))
        
        btn_login = tk.Button(
            btn_container,
            text="➤ INICIAR SESIÓN",
            command=self.iniciar_sesion,
            bg=self.color_boton,
            fg=self.color_fondo_oscuro,
            font=('Arial', 16, 'bold'),
            width=20,
            height=2,
            cursor='hand2',
            relief=tk.FLAT,
            bd=0,
            activebackground=self.color_boton_active,
            activeforeground=self.color_fondo_oscuro,
            padx=0,
            pady=0
        )
        btn_login.pack(fill=tk.X, ipady=12)
        
        # Efectos hover para el botón
        btn_login.bind('<Enter>', self.on_button_enter)
        btn_login.bind('<Leave>', self.on_button_leave)
        
        # Panel de información con diseño moderno
        info_container = tk.Frame(card_frame, bg='#fff3e0', relief=tk.FLAT, bd=0)
        info_container.pack(fill=tk.X, padx=40, pady=(0, 20), ipady=12)
        
        info_text = "💡 Usuarios de prueba: admin/admin123 | gerente/gerente123"
        tk.Label(
            info_container,
            text=info_text,
            font=('Arial', 10, 'bold'),
            bg='#fff3e0',
            fg='#e65100'
        ).pack(pady=8)
    
    def iniciar_sesion(self):
        """Intenta iniciar sesión con las credenciales proporcionadas"""
        usuario = self.entry_usuario.get().strip()
        contrasena = self.entry_contrasena.get()
        
        if not usuario or not contrasena:
            mostrar_error(self.root, "Error de Validación", "Por favor ingrese usuario y contraseña")
            return
        
        usuario_autenticado = self.autenticacion.iniciar_sesion(usuario, contrasena)
        
        if usuario_autenticado:
            self.animacion_activa = False
            self.autenticacion.registrar_log(
                "Inicio de sesión",
                "Autenticación",
                f"Usuario {usuario} inició sesión"
            )
            self.callback_login_exitoso(usuario_autenticado, self.autenticacion)
        else:
            mostrar_error(self.root, "Error de Autenticación", "Usuario o contraseña incorrectos")
