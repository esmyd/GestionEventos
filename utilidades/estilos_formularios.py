"""
Utilidades para estilizar formularios con el branding de Lirios Eventos
"""
import tkinter as tk
from tkinter import ttk
from utilidades.colores import ColoresBranding

class EstilosFormulario:
    """Clase helper para crear formularios con estilo consistente"""
    
    @staticmethod
    def crear_label(container, texto, row=0, column=0, **kwargs):
        """Crea un label estilizado para formularios"""
        bg = kwargs.pop('bg', ColoresBranding.FONDO_CLARO)
        font = kwargs.pop('font', ('Arial', 11, 'bold'))
        fg = kwargs.pop('fg', ColoresBranding.TEXTO_OSCURO)
        
        label = tk.Label(
            container,
            text=texto,
            bg=bg,
            font=font,
            fg=fg,
            **kwargs
        )
        return label
    
    @staticmethod
    def crear_entry(container, textvariable=None, width=30, state='normal', **kwargs):
        """Crea un campo de entrada estilizado"""
        bg = kwargs.pop('bg', ColoresBranding.ENTRY_BG)
        font = kwargs.pop('font', ('Arial', 11))
        fg = kwargs.pop('fg', ColoresBranding.TEXTO_OSCURO)
        relief = kwargs.pop('relief', tk.FLAT)
        bd = kwargs.pop('bd', 0)
        highlightthickness = kwargs.pop('highlightthickness', 1)
        highlightbackground = kwargs.pop('highlightbackground', ColoresBranding.ENTRY_BORDER)
        highlightcolor = kwargs.pop('highlightcolor', ColoresBranding.DORADO_PRINCIPAL)
        insertbackground = kwargs.pop('insertbackground', ColoresBranding.DORADO_PRINCIPAL)
        
        entry = tk.Entry(
            container,
            textvariable=textvariable,
            width=width,
            state=state,
            bg=bg,
            font=font,
            fg=fg,
            relief=relief,
            bd=bd,
            highlightthickness=highlightthickness,
            highlightbackground=highlightbackground,
            highlightcolor=highlightcolor,
            insertbackground=insertbackground,
            **kwargs
        )
        
        # Efectos de foco
        def on_focus_in(event):
            entry.config(bg=ColoresBranding.BLANCO, highlightthickness=2)
        
        def on_focus_out(event):
            entry.config(bg=ColoresBranding.ENTRY_BG, highlightthickness=1)
        
        entry.bind('<FocusIn>', on_focus_in)
        entry.bind('<FocusOut>', on_focus_out)
        
        return entry
    
    @staticmethod
    def crear_text(container, width=30, height=3, **kwargs):
        """Crea un campo de texto multi-línea estilizado"""
        bg = kwargs.pop('bg', ColoresBranding.ENTRY_BG)
        font = kwargs.pop('font', ('Arial', 11))
        fg = kwargs.pop('fg', ColoresBranding.TEXTO_OSCURO)
        relief = kwargs.pop('relief', tk.FLAT)
        bd = kwargs.pop('bd', 0)
        highlightthickness = kwargs.pop('highlightthickness', 1)
        highlightbackground = kwargs.pop('highlightbackground', ColoresBranding.ENTRY_BORDER)
        highlightcolor = kwargs.pop('highlightcolor', ColoresBranding.DORADO_PRINCIPAL)
        insertbackground = kwargs.pop('insertbackground', ColoresBranding.DORADO_PRINCIPAL)
        
        text_widget = tk.Text(
            container,
            width=width,
            height=height,
            bg=bg,
            font=font,
            fg=fg,
            relief=relief,
            bd=bd,
            highlightthickness=highlightthickness,
            highlightbackground=highlightbackground,
            highlightcolor=highlightcolor,
            insertbackground=insertbackground,
            wrap=tk.WORD,
            **kwargs
        )
        
        # Efectos de foco
        def on_focus_in(event):
            text_widget.config(bg=ColoresBranding.BLANCO, highlightthickness=2)
        
        def on_focus_out(event):
            text_widget.config(bg=ColoresBranding.ENTRY_BG, highlightthickness=1)
        
        text_widget.bind('<FocusIn>', on_focus_in)
        text_widget.bind('<FocusOut>', on_focus_out)
        
        return text_widget
    
    @staticmethod
    def crear_combobox(container, textvariable=None, values=None, width=27, state='readonly', **kwargs):
        """Crea un combobox estilizado"""
        combo = ttk.Combobox(
            container,
            textvariable=textvariable,
            values=values or [],
            width=width,
            state=state,
            font=('Arial', 11),
            **kwargs
        )
        
        # Estilo para el combobox
        style = ttk.Style()
        style.configure('TCombobox', fieldbackground=ColoresBranding.ENTRY_BG)
        
        return combo
    
    @staticmethod
    def crear_button(container, texto, command, tipo='principal', **kwargs):
        """
        Crea un botón estilizado
        tipos: 'principal', 'secundario', 'peligro', 'info'
        """
        width = kwargs.pop('width', 15)
        font = kwargs.pop('font', ('Arial', 10, 'bold'))
        padx = kwargs.pop('padx', 15)
        pady = kwargs.pop('pady', 8)
        cursor = kwargs.pop('cursor', 'hand2')
        relief = kwargs.pop('relief', tk.FLAT)
        
        # Colores según tipo
        colores = {
            'principal': {
                'bg': ColoresBranding.DORADO_PRINCIPAL,
                'fg': ColoresBranding.FONDO_OSCURO,
                'activebg': ColoresBranding.DORADO_OSCURO,
                'activefg': ColoresBranding.FONDO_OSCURO,
                'hover': ColoresBranding.DORADO_MEDIO
            },
            'secundario': {
                'bg': ColoresBranding.DORADO_MEDIO,
                'fg': ColoresBranding.FONDO_OSCURO,
                'activebg': ColoresBranding.DORADO_OSCURO,
                'activefg': ColoresBranding.FONDO_OSCURO,
                'hover': ColoresBranding.DORADO_OSCURO
            },
            'peligro': {
                'bg': '#dc3545',
                'fg': ColoresBranding.BLANCO,
                'activebg': '#c82333',
                'activefg': ColoresBranding.BLANCO,
                'hover': '#c82333'
            },
            'info': {
                'bg': '#17a2b8',
                'fg': ColoresBranding.BLANCO,
                'activebg': '#138496',
                'activefg': ColoresBranding.BLANCO,
                'hover': '#138496'
            }
        }
        
        color_config = colores.get(tipo, colores['principal'])
        
        btn = tk.Button(
            container,
            text=texto,
            command=command,
            bg=color_config['bg'],
            fg=color_config['fg'],
            font=font,
            width=width,
            padx=padx,
            pady=pady,
            cursor=cursor,
            relief=relief,
            bd=0,
            activebackground=color_config['activebg'],
            activeforeground=color_config['activefg'],
            **kwargs
        )
        
        # Efecto hover
        hover_color = color_config['hover']
        def on_enter(event):
            btn.config(bg=hover_color)
        
        def on_leave(event):
            btn.config(bg=color_config['bg'])
        
        btn.bind('<Enter>', on_enter)
        btn.bind('<Leave>', on_leave)
        
        return btn
    
    @staticmethod
    def crear_label_frame(container, texto, **kwargs):
        """Crea un LabelFrame estilizado"""
        bg = kwargs.pop('bg', ColoresBranding.FONDO_CLARO)
        font = kwargs.pop('font', ('Arial', 12, 'bold'))
        fg = kwargs.pop('fg', ColoresBranding.DORADO_PRINCIPAL)
        padx = kwargs.pop('padx', 20)
        pady = kwargs.pop('pady', 20)
        relief = kwargs.pop('relief', tk.FLAT)
        bd = kwargs.pop('bd', 0)
        
        # Frame exterior para el borde dorado
        outer_frame = tk.Frame(container, bg=ColoresBranding.DORADO_PRINCIPAL, bd=1)
        
        # Frame interior
        inner_frame = tk.Frame(outer_frame, bg=bg)
        inner_frame.pack(fill=tk.BOTH, expand=True, padx=1, pady=1)
        
        # Label del título
        title_label = tk.Label(
            inner_frame,
            text=texto,
            bg=bg,
            font=font,
            fg=fg,
            padx=10
        )
        title_label.pack(anchor=tk.W, pady=(10, 0))
        
        # Frame de contenido
        content_frame = tk.Frame(inner_frame, bg=bg)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=padx, pady=(5, pady))
        
        return outer_frame, content_frame
    
    @staticmethod
    def crear_frame_scrollable(container, bg=None):
        """
        Crea un frame scrollable con scroll horizontal y vertical
        Retorna: (container_frame, scrollable_frame)
        """
        if bg is None:
            bg = ColoresBranding.FONDO_CLARO
        
        # Frame contenedor para canvas y scrollbars - usar grid
        container_frame = tk.Frame(container, bg=bg)
        
        # Canvas para el scroll
        canvas = tk.Canvas(container_frame, bg=bg, highlightthickness=0)
        
        # Scrollbars
        scrollbar_v = ttk.Scrollbar(container_frame, orient="vertical", command=canvas.yview)
        scrollbar_h = ttk.Scrollbar(container_frame, orient="horizontal", command=canvas.xview)
        
        # Frame scrollable
        scrollable_frame = tk.Frame(canvas, bg=bg)
        
        canvas_window = canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        
        def update_scrollregion(event=None):
            canvas.configure(scrollregion=canvas.bbox("all"))
        
        def on_canvas_configure(event):
            canvas_width = event.width
            canvas.itemconfig(canvas_window, width=canvas_width)
        
        scrollable_frame.bind("<Configure>", update_scrollregion)
        canvas.bind('<Configure>', on_canvas_configure)
        
        # Configurar scrollbars
        canvas.configure(yscrollcommand=scrollbar_v.set, xscrollcommand=scrollbar_h.set)
        
        # Usar grid para layout correcto
        canvas.grid(row=0, column=0, sticky="nsew")
        scrollbar_v.grid(row=0, column=1, sticky="ns")
        scrollbar_h.grid(row=1, column=0, sticky="ew")
        
        # Configurar pesos para que se expandan
        container_frame.grid_rowconfigure(0, weight=1)
        container_frame.grid_columnconfigure(0, weight=1)
        
        return container_frame, scrollable_frame
    
    @staticmethod
    def configurar_ventana_formulario(ventana, titulo, ancho=600, alto=700):
        """Configura una ventana de formulario con el estilo del branding"""
        ventana.title(titulo)
        ventana.geometry(f"{ancho}x{alto}")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        
        # Frame principal con padding
        main_frame = tk.Frame(ventana, bg=ColoresBranding.FONDO_CLARO, padx=30, pady=30)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        return main_frame
