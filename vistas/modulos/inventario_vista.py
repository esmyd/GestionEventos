"""
Vista para gestión de inventario
"""
import tkinter as tk
from tkinter import ttk
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import mostrar_info
from modelos.inventario_modelo import InventarioModelo
from modelos.evento_modelo import EventoModelo


class VistaInventario:
    """Interfaz para gestión de inventario"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = InventarioModelo()
        self.evento_modelo = EventoModelo()
        
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        main_frame = tk.Frame(self.parent, bg='#ecf0f1', padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Gestión de Inventario",
            font=('Arial', 18, 'bold'),
            bg='#ecf0f1',
            fg='#2c3e50'
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Tabla
        table_frame = tk.LabelFrame(
            main_frame,
            text="Inventario por Evento",
            font=('Arial', 11, 'bold'),
            bg='#ecf0f1',
            padx=15,
            pady=15
        )
        table_frame.pack(fill=tk.BOTH, expand=True)
        
        columns = ('ID', 'Producto', 'Evento', 'Solicitado', 'Disponible', 'Utilizado', 'Estado')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=15)
        
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120)
        
        scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Botones
        button_frame = tk.Frame(main_frame, bg='#ecf0f1')
        button_frame.pack(fill=tk.X, pady=10)
        
        tk.Button(
            button_frame,
            text="Refrescar",
            command=self.cargar_datos,
            bg='#95a5a6',
            fg='white',
            font=('Arial', 10, 'bold'),
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
    
    def cargar_datos(self):
        """Carga el inventario en la tabla"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Obtener inventario de todos los eventos
        eventos = self.evento_modelo.obtener_todos_eventos()
        for evento in eventos:
            inventario = self.modelo.obtener_inventario_por_evento(evento['id'])
            for inv in inventario:
                self.tree.insert('', tk.END, values=(
                    inv['id'],
                    inv.get('nombre_producto', 'N/A'),
                    evento['nombre_evento'],
                    inv['cantidad_solicitada'],
                    inv.get('cantidad_disponible', 'N/A'),
                    inv.get('cantidad_utilizada', 0),
                    inv['estado']
                ))

