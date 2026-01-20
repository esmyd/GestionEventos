"""
Ventana principal del sistema con navegación por módulos
"""
import tkinter as tk
from tkinter import ttk, messagebox
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utilidades.ventanas import centrar_ventana, confirmar
try:
    from vistas.modulos.productos_vista import VistaProductos
    from vistas.modulos.eventos_vista import VistaEventos
    from vistas.modulos.planes_vista import VistaPlanes
    from vistas.modulos.pagos_vista import VistaPagos
    from vistas.modulos.inventario_vista import VistaInventario
    from vistas.modulos.usuarios_vista import VistaUsuarios
    from vistas.modulos.clientes_vista import VistaClientes
    from vistas.modulos.reportes_vista import VistaReportes
    from vistas.modulos.categorias_vista import VistaCategorias
    from vistas.modulos.salones_vista import VistaSalones
except ImportError as e:
    print(f"Error al importar módulos: {e}")
    # Crear clases dummy para evitar errores
    class VistaProductos: pass
    class VistaEventos: pass
    class VistaPlanes: pass
    class VistaPagos: pass
    class VistaInventario: pass
    class VistaUsuarios: pass
    class VistaClientes: pass
    class VistaReportes: pass
    class VistaCategorias: pass
    class VistaSalones: pass


class VentanaPrincipal:
    """Ventana principal con menú de navegación"""
    
    def __init__(self, root, usuario, autenticacion):
        self.root = root
        self.usuario = usuario
        self.autenticacion = autenticacion
        
        # Paleta de colores del branding Lirios Eventos
        self.color_fondo_oscuro = '#000000'  # Negro
        self.color_fondo_medio = '#1a1a1a'  # Negro claro
        self.color_dorado_principal = '#d4af37'  # Dorado principal
        self.color_dorado_medio = '#c9a961'  # Dorado medio
        self.color_dorado_oscuro = '#b8860b'  # Dorado oscuro
        self.color_dorado_claro = '#f0d98e'  # Dorado claro
        self.color_fondo_claro = '#f5f5f5'  # Gris muy claro
        self.color_card = '#ffffff'  # Blanco
        self.color_texto_claro = '#ffffff'
        self.color_texto_oscuro = '#1a1a1a'
        self.color_texto_gris = '#757575'
        
        self.root.title(f"Lirios Eventos - {usuario['nombre_completo']}")
        
        # Obtener dimensiones de la pantalla
        ancho_pantalla = self.root.winfo_screenwidth()
        alto_pantalla = self.root.winfo_screenheight()
        
        # Configurar ventana para ocupar toda la pantalla
        self.root.geometry(f"{ancho_pantalla}x{alto_pantalla}+0+0")
        self.root.configure(bg=self.color_fondo_claro)
        
        # En Windows, también podemos usar state('zoomed') para maximizar
        try:
            self.root.state('zoomed')  # Maximiza la ventana en Windows
        except:
            # Si no funciona, usar el tamaño completo calculado
            pass
        
        self.vista_actual = None
        self.boton_activo = None
        self.crear_widgets()
    
    def on_menu_button_enter(self, event, button):
        """Efecto hover para botones del menú"""
        if button != self.boton_activo:
            button.config(bg=self.color_dorado_medio, fg=self.color_fondo_oscuro)
    
    def on_menu_button_leave(self, event, button):
        """Efecto hover para botones del menú"""
        if button != self.boton_activo:
            button.config(bg=self.color_fondo_medio, fg=self.color_texto_claro)
    
    def activar_boton_menu(self, button):
        """Marca un botón del menú como activo"""
        # Desactivar botón anterior
        if self.boton_activo:
            self.boton_activo.config(bg=self.color_fondo_medio, fg=self.color_texto_claro)
        
        # Activar nuevo botón
        button.config(bg=self.color_dorado_principal, fg=self.color_fondo_oscuro, font=('Arial', 11, 'bold'))
        self.boton_activo = button
    
    def crear_widgets(self):
        """Crea los widgets de la ventana principal"""
        # Barra superior con diseño moderno
        barra_superior = tk.Frame(self.root, bg=self.color_fondo_oscuro, height=70)
        barra_superior.pack(fill=tk.X)
        barra_superior.pack_propagate(False)
        
        # Barra decorativa dorada superior
        barra_dorada = tk.Frame(barra_superior, bg=self.color_dorado_principal, height=4)
        barra_dorada.pack(fill=tk.X)
        
        # Contenido de la barra superior
        barra_content = tk.Frame(barra_superior, bg=self.color_fondo_oscuro)
        barra_content.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Logo y título
        titulo_frame = tk.Frame(barra_content, bg=self.color_fondo_oscuro)
        titulo_frame.pack(side=tk.LEFT)
        
        # Icono
        tk.Label(
            titulo_frame,
            text="🌸",
            font=('Arial', 24),
            bg=self.color_fondo_oscuro,
            fg=self.color_dorado_principal
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        tk.Label(
            titulo_frame,
            text="LIRIOS EVENTOS",
            font=('Arial', 20, 'bold'),
            bg=self.color_fondo_oscuro,
            fg=self.color_dorado_principal
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        tk.Label(
            titulo_frame,
            text="& BANQUETES",
            font=('Arial', 16, 'bold'),
            bg=self.color_fondo_oscuro,
            fg=self.color_dorado_claro
        ).pack(side=tk.LEFT)
        
        # Información del usuario
        usuario_frame = tk.Frame(barra_content, bg=self.color_fondo_oscuro)
        usuario_frame.pack(side=tk.RIGHT)
        
        tk.Label(
            usuario_frame,
            text=f"👤 {self.usuario['nombre_completo']}",
            font=('Arial', 11, 'bold'),
            bg=self.color_fondo_oscuro,
            fg=self.color_texto_claro
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        tk.Label(
            usuario_frame,
            text=f"({self.usuario['rol'].replace('_', ' ').title()})",
            font=('Arial', 10),
            bg=self.color_fondo_oscuro,
            fg=self.color_dorado_claro
        ).pack(side=tk.LEFT, padx=(0, 15))
        
        btn_cerrar = tk.Button(
            usuario_frame,
            text="Cerrar Sesión",
            command=self.cerrar_sesion,
            bg=self.color_dorado_principal,
            fg=self.color_fondo_oscuro,
            font=('Arial', 10, 'bold'),
            padx=15,
            pady=6,
            cursor='hand2',
            relief=tk.FLAT,
            activebackground=self.color_dorado_oscuro,
            activeforeground=self.color_fondo_oscuro
        )
        btn_cerrar.pack(side=tk.LEFT)
        btn_cerrar.bind('<Enter>', lambda e: btn_cerrar.config(bg=self.color_dorado_oscuro))
        btn_cerrar.bind('<Leave>', lambda e: btn_cerrar.config(bg=self.color_dorado_principal))
        
        # Frame principal con menú y contenido
        main_frame = tk.Frame(self.root, bg=self.color_fondo_claro)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Panel lateral de menú con diseño moderno
        menu_frame = tk.Frame(main_frame, bg=self.color_fondo_medio, width=250)
        menu_frame.pack(side=tk.LEFT, fill=tk.Y)
        menu_frame.pack_propagate(False)
        
        # Barra dorada lateral
        barra_dorada_lateral = tk.Frame(menu_frame, bg=self.color_dorado_principal, width=4)
        barra_dorada_lateral.pack(side=tk.LEFT, fill=tk.Y)
        
        # Contenido del menú
        menu_content = tk.Frame(menu_frame, bg=self.color_fondo_medio)
        menu_content.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)
        
        # Título del menú
        titulo_menu_frame = tk.Frame(menu_content, bg=self.color_fondo_medio)
        titulo_menu_frame.pack(fill=tk.X, pady=(20, 10))
        
        tk.Label(
            titulo_menu_frame,
            text="Menú Principal",
            font=('Arial', 14, 'bold'),
            bg=self.color_fondo_medio,
            fg=self.color_dorado_principal,
            pady=10
        ).pack()
        
        # Separador dorado
        tk.Frame(menu_content, bg=self.color_dorado_principal, height=2).pack(fill=tk.X, padx=15, pady=10)
        
        # Botones del menú
        self.botones_menu = {}
        modulos = self.obtener_modulos_disponibles()
        
        for modulo in modulos:
            def crear_comando(m, nombre_modulo):
                def comando():
                    btn = self.botones_menu[nombre_modulo]
                    self.activar_boton_menu(btn)
                    self.mostrar_modulo(m['vista'])
                return comando
            
            btn = tk.Button(
                menu_content,
                text=f"  {modulo['nombre']}",
                command=crear_comando(modulo, modulo['nombre']),
                bg=self.color_fondo_medio,
                fg=self.color_texto_claro,
                font=('Arial', 11),
                anchor=tk.W,
                padx=20,
                pady=12,
                cursor='hand2',
                relief=tk.FLAT,
                activebackground=self.color_dorado_medio,
                activeforeground=self.color_fondo_oscuro
            )
            btn.pack(fill=tk.X, padx=10, pady=3)
            self.botones_menu[modulo['nombre']] = btn
            btn.bind('<Enter>', lambda e, b=btn: self.on_menu_button_enter(e, b))
            btn.bind('<Leave>', lambda e, b=btn: self.on_menu_button_leave(e, b))
        
        # Frame de contenido
        self.contenido_frame = tk.Frame(main_frame, bg=self.color_fondo_claro)
        self.contenido_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Mostrar módulo inicial y activar su botón
        if modulos:
            primer_modulo = modulos[0]
            if primer_modulo['nombre'] in self.botones_menu:
                self.activar_boton_menu(self.botones_menu[primer_modulo['nombre']])
            self.mostrar_modulo(primer_modulo['vista'])
    
    def obtener_modulos_disponibles(self):
        """Retorna los módulos disponibles según el rol del usuario"""
        rol = self.usuario['rol']
        modulos = []
        
        # Módulos comunes
        modulos.append({'nombre': 'Eventos', 'vista': VistaEventos})
        modulos.append({'nombre': 'Pagos', 'vista': VistaPagos})
        
        # Módulos según rol
        if rol == 'administrador':
            modulos.append({'nombre': 'Productos', 'vista': VistaProductos})
            modulos.append({'nombre': 'Categorías', 'vista': VistaCategorias})
            modulos.append({'nombre': 'Salones', 'vista': VistaSalones})
            modulos.append({'nombre': 'Planes', 'vista': VistaPlanes})
            modulos.append({'nombre': 'Clientes', 'vista': VistaClientes})
            # modulos.append({'nombre': 'Inventario', 'vista': VistaInventario})  # Oculto temporalmente
            modulos.append({'nombre': 'Usuarios', 'vista': VistaUsuarios})
            modulos.append({'nombre': 'Reportes', 'vista': VistaReportes})
        elif rol == 'coordinador':
            modulos.append({'nombre': 'Clientes', 'vista': VistaClientes})
            # modulos.append({'nombre': 'Inventario', 'vista': VistaInventario})  # Oculto temporalmente
        elif rol == 'gerente_general':
            modulos.append({'nombre': 'Clientes', 'vista': VistaClientes})
            modulos.append({'nombre': 'Reportes', 'vista': VistaReportes})
        
        return modulos
    
    def mostrar_modulo(self, clase_vista):
        """Muestra un módulo en el área de contenido"""
        # Limpiar contenido actual
        for widget in self.contenido_frame.winfo_children():
            widget.destroy()
        
        # Crear nueva vista
        try:
            self.vista_actual = clase_vista(self.contenido_frame, self.usuario, self.autenticacion)
        except Exception as e:
            from utilidades.ventanas import mostrar_error
            mostrar_error(self.root, "Error", f"Error al cargar el módulo: {str(e)}")
    
    def cerrar_sesion(self):
        """Cierra la sesión del usuario"""
        if confirmar(self.root, "Confirmar Cierre de Sesión", "¿Desea cerrar sesión?"):
            self.autenticacion.registrar_log(
                "Cierre de sesión",
                "Autenticación",
                f"Usuario {self.usuario['nombre_usuario']} cerró sesión"
            )
            self.autenticacion.cerrar_sesion()
            self.root.quit()

