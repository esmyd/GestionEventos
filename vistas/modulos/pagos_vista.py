"""
Vista para gestión de pagos y abonos
"""
import tkinter as tk
from tkinter import ttk
from datetime import datetime
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from utilidades.ventanas import centrar_ventana, mostrar_error, mostrar_advertencia, mostrar_info, confirmar
from utilidades.widgets_fecha import SelectorFecha
from utilidades.logger import obtener_logger
from utilidades.colores import ColoresBranding
from utilidades.estilos_formularios import EstilosFormulario
from modelos.pago_modelo import PagoModelo
from modelos.evento_modelo import EventoModelo


class VistaPagos:
    """Interfaz para gestión de pagos"""
    
    def __init__(self, parent, usuario, autenticacion):
        self.parent = parent
        self.usuario = usuario
        self.autenticacion = autenticacion
        self.modelo = PagoModelo()
        self.evento_modelo = EventoModelo()
        self.logger = obtener_logger()
        
        self.logger.debug("Inicializando vista de pagos")
        self.crear_widgets()
        self.cargar_datos()
    
    def crear_widgets(self):
        """Crea los widgets de la interfaz"""
        main_frame = tk.Frame(self.parent, bg=ColoresBranding.FONDO_CLARO, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(
            main_frame,
            text="Gestión de Pagos y Abonos",
            font=('Arial', 18, 'bold'),
            bg=ColoresBranding.FONDO_CLARO,
            fg=ColoresBranding.TEXTO_OSCURO
        ).pack(anchor=tk.W, pady=(0, 20))
        
        # Tabla
        table_outer, table_frame = EstilosFormulario.crear_label_frame(
            main_frame,
            "Lista de Pagos",
            padx=15,
            pady=15
        )
        table_outer.pack(fill=tk.BOTH, expand=True)
        
        columns = ('ID', 'Evento', 'Monto', 'Tipo', 'Método', 'Fecha', 'Referencia', 'Origen')
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=15)
        
        for col in columns:
            self.tree.heading(col, text=col)
            if col == 'Origen':
                self.tree.column(col, width=80)
            else:
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
        
        btn_registrar = EstilosFormulario.crear_button(
            button_frame_1,
            "Registrar Pago",
            self.registrar_pago,
            tipo='principal',
            width=18
        )
        btn_registrar.pack(side=tk.LEFT, padx=(0, 8), fill=tk.X, expand=True)
        
        btn_eliminar = EstilosFormulario.crear_button(
            button_frame_1,
            "Eliminar Pago",
            self.eliminar_pago,
            tipo='peligro',
            width=18
        )
        btn_eliminar.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Segunda fila
        button_frame_2 = tk.Frame(button_container, bg=ColoresBranding.FONDO_CLARO)
        button_frame_2.pack(fill=tk.X)
        
        btn_refrescar = EstilosFormulario.crear_button(
            button_frame_2,
            "Refrescar",
            self.cargar_datos,
            tipo='info',
            width=18
        )
        btn_refrescar.pack(side=tk.LEFT, fill=tk.X, expand=True)
    
    def cargar_datos(self):
        """Carga los pagos en la tabla"""
        self.logger.debug("Cargando datos de pagos en la tabla")
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        try:
            # Obtener todos los eventos para mostrar pagos
            eventos = self.evento_modelo.obtener_todos_eventos()
            total_pagos = 0
            for evento in eventos:
                pagos = self.modelo.obtener_pagos_por_evento(evento['id'])
                for pago in pagos:
                    origen = pago.get('origen', 'desktop')  # Por defecto 'desktop' para compatibilidad
                    origen_texto = 'Web' if origen == 'web' else 'Escritorio'
                    self.tree.insert('', tk.END, values=(
                        pago.get('id', pago.get('id_pago')),
                        evento.get('salon', evento.get('nombre_evento', 'Evento')),
                        f"${pago['monto']:.2f}",
                        pago['tipo_pago'].replace('_', ' ').title(),
                        pago['metodo_pago'].title(),
                        pago['fecha_pago'],
                        pago.get('numero_referencia', ''),
                        origen_texto
                    ))
                    total_pagos += 1
            self.logger.debug(f"Datos cargados exitosamente - Total de pagos mostrados: {total_pagos}")
        except Exception as e:
            self.logger.error(f"Error al cargar datos de pagos: {str(e)}")
            mostrar_error(self.parent, "Error", f"Error al cargar los pagos: {str(e)}")
    
    def registrar_pago(self):
        """Abre ventana para registrar un pago"""
        ventana = tk.Toplevel(self.parent)
        ventana.title("Registrar Pago")
        ventana.geometry("650x700")
        ventana.configure(bg=ColoresBranding.FONDO_CLARO)
        centrar_ventana(ventana, 650, 700)
        ventana.transient(self.parent)
        ventana.grab_set()
        
        # Variables
        evento_id_var = tk.StringVar()
        monto_var = tk.StringVar()
        tipo_var = tk.StringVar(value='abono')
        metodo_var = tk.StringVar()
        referencia_var = tk.StringVar()
        observaciones_text = None
        selector_fecha = None
        
        # Variables para información del evento
        info_frame = None
        saldo_label = None
        total_label = None
        pagado_label = None
        ultimo_pago_label = None
        
        # Obtener eventos
        eventos = self.evento_modelo.obtener_todos_eventos()
        
        # Frame principal con estilo
        main_frame = EstilosFormulario.configurar_ventana_formulario(ventana, "Registrar Pago", 650, 700)
        
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
        
        def actualizar_info_evento(*args):
            """Actualiza la información del evento seleccionado"""
            if not evento_id_var.get():
                return
            
            try:
                evento_id = int(evento_id_var.get().split(' - ')[0])
                evento = self.evento_modelo.obtener_evento_por_id(evento_id)
                
                if evento:
                    precio_total = float(evento.get('total', 0) or 0)
                    total_pagado = float(evento.get('total_pagado', 0) or 0)
                    saldo_pendiente = float(evento.get('saldo', 0) or 0)
                    
                    # Actualizar labels
                    total_label.config(text=f"Monto Total: ${precio_total:.2f}")
                    pagado_label.config(text=f"Total Pagado: ${total_pagado:.2f}")
                    saldo_label.config(text=f"Saldo Pendiente: ${saldo_pendiente:.2f}", 
                                       fg='#dc3545' if saldo_pendiente > 0 else ColoresBranding.DORADO_PRINCIPAL)
                    
                    # Obtener último pago
                    pagos = self.modelo.obtener_pagos_por_evento(evento_id)
                    if pagos:
                        ultimo_pago = pagos[0]  # Ya están ordenados por fecha DESC
                        ultimo_pago_label.config(
                            text=f"Último Pago: ${ultimo_pago['monto']:.2f} ({ultimo_pago['tipo_pago'].replace('_', ' ').title()}) - {ultimo_pago['fecha_pago']}"
                        )
                    else:
                        ultimo_pago_label.config(text="Último Pago: Sin pagos registrados")
                    
                    # Actualizar tipo de pago según el monto
                    actualizar_tipo_pago()
            except Exception as e:
                self.logger.error(f"Error al actualizar información del evento: {str(e)}")
        
        def actualizar_tipo_pago(*args):
            """Actualiza el tipo de pago según el monto ingresado"""
            if not evento_id_var.get() or not monto_var.get():
                return
            
            try:
                evento_id = int(evento_id_var.get().split(' - ')[0])
                evento = self.evento_modelo.obtener_evento_por_id(evento_id)
                
                if evento:
                    saldo_pendiente = float(evento.get('saldo', 0) or 0)
                    monto = float(monto_var.get() or 0)
                    
                    # Si el monto es igual al saldo pendiente, sugerir pago_completo
                    # Si es menor, sugerir abono
                    # Permitir reembolso siempre
                    if abs(monto - saldo_pendiente) < 0.01 and saldo_pendiente > 0:
                        # Monto igual al saldo pendiente
                        tipo_var.set('pago_completo')
                    elif monto < saldo_pendiente and saldo_pendiente > 0:
                        # Monto menor al saldo pendiente
                        tipo_var.set('abono')
                    # Si monto > saldo, se validará al guardar
            except (ValueError, TypeError):
                pass
        
        row = 0
        # Evento
        label = EstilosFormulario.crear_label(form_padding, "Evento *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        evento_combo = EstilosFormulario.crear_combobox(form_padding, textvariable=evento_id_var, values=[], width=35)
        evento_combo['values'] = [f"{e['id']} - {e.get('salon', e.get('nombre_evento', 'Evento'))}" for e in eventos]
        evento_combo.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12))
        evento_id_var.trace('w', actualizar_info_evento)
        
        # Frame de información del evento
        row += 1
        info_outer, info_frame = EstilosFormulario.crear_label_frame(
            form_padding,
            "Información del Evento",
            padx=10,
            pady=10
        )
        info_outer.grid(row=row, column=0, columnspan=2, sticky=tk.W+tk.E, pady=(0, 12))
        
        total_label = tk.Label(info_frame, text="Monto Total: $0.00", bg=ColoresBranding.FONDO_CLARO, 
                               font=('Arial', 9), anchor=tk.W, fg=ColoresBranding.TEXTO_OSCURO)
        total_label.pack(fill=tk.X, pady=2)
        
        pagado_label = tk.Label(info_frame, text="Total Pagado: $0.00", bg=ColoresBranding.FONDO_CLARO, 
                                font=('Arial', 9), anchor=tk.W, fg=ColoresBranding.TEXTO_OSCURO)
        pagado_label.pack(fill=tk.X, pady=2)
        
        saldo_label = tk.Label(info_frame, text="Saldo Pendiente: $0.00", bg=ColoresBranding.FONDO_CLARO, 
                              font=('Arial', 9, 'bold'), anchor=tk.W, fg=ColoresBranding.TEXTO_OSCURO)
        saldo_label.pack(fill=tk.X, pady=2)
        
        ultimo_pago_label = tk.Label(info_frame, text="Último Pago: Sin pagos registrados", 
                                     bg=ColoresBranding.FONDO_CLARO, font=('Arial', 9), anchor=tk.W, fg=ColoresBranding.TEXTO_GRIS)
        ultimo_pago_label.pack(fill=tk.X, pady=2)
        
        row += 1
        # Monto
        label = EstilosFormulario.crear_label(form_padding, "Monto *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        monto_entry = EstilosFormulario.crear_entry(form_padding, textvariable=monto_var, width=35)
        monto_entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        monto_var.trace('w', actualizar_tipo_pago)
        
        row += 1
        # Tipo de Pago
        label = EstilosFormulario.crear_label(form_padding, "Tipo de Pago *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        tipo_combo = EstilosFormulario.crear_combobox(form_padding, textvariable=tipo_var, 
                                  values=['abono', 'pago_completo', 'reembolso'], width=35)
        tipo_combo.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 8))
        
        # Label informativo para el tipo de pago
        row += 1
        tipo_info_label = tk.Label(form_padding, text="", bg=ColoresBranding.FONDO_CLARO, font=('Arial', 8), 
                                   fg=ColoresBranding.TEXTO_GRIS, anchor=tk.W)
        tipo_info_label.grid(row=row, column=1, sticky=tk.W, padx=(0, 0), pady=(0, 12))
        
        def actualizar_info_tipo_pago(*args):
            """Actualiza el mensaje informativo del tipo de pago"""
            tipo = tipo_var.get()
            if tipo == 'pago_completo':
                tipo_info_label.config(text="Este pago completará el saldo pendiente del evento", fg=ColoresBranding.DORADO_PRINCIPAL)
            elif tipo == 'abono':
                tipo_info_label.config(text="Este es un pago parcial del saldo pendiente", fg=ColoresBranding.DORADO_MEDIO)
            elif tipo == 'reembolso':
                tipo_info_label.config(text="Este es un reembolso al cliente", fg='#e67e22')
            else:
                tipo_info_label.config(text="")
        
        tipo_var.trace('w', actualizar_info_tipo_pago)
        
        row += 1
        # Método de Pago
        label = EstilosFormulario.crear_label(form_padding, "Método de Pago *:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        metodo_combo = EstilosFormulario.crear_combobox(form_padding, textvariable=metodo_var, 
                                                        values=['efectivo', 'transferencia', 'tarjeta', 'cheque'], width=35)
        metodo_combo.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12))
        
        row += 1
        # Número Referencia
        label = EstilosFormulario.crear_label(form_padding, "Número Referencia:", row, 0)
        label.grid(row=row, column=0, sticky=tk.W, pady=(0, 8), padx=(0, 15))
        entry = EstilosFormulario.crear_entry(form_padding, textvariable=referencia_var, width=35)
        entry.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 12), ipady=6)
        
        row += 1
        selector_fecha = SelectorFecha(form_padding, texto_label="Fecha *:", bg=ColoresBranding.FONDO_CLARO)
        selector_fecha.grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(0, 12), padx=(0, 0))
        
        row += 1
        # Observaciones
        label = EstilosFormulario.crear_label(form_padding, "Observaciones:", row, 0)
        label.grid(row=row, column=0, sticky=tk.NW, pady=(0, 8), padx=(0, 15))
        observaciones_text = EstilosFormulario.crear_text(form_padding, width=35, height=3)
        observaciones_text.grid(row=row, column=1, sticky=tk.W+tk.E, pady=(0, 15), ipady=6)
        
        def guardar():
            fecha = selector_fecha.obtener_fecha()
            
            if not evento_id_var.get() or not monto_var.get() or not metodo_var.get() or not fecha:
                self.logger.warning("Intento de guardar pago sin completar campos requeridos")
                mostrar_error(ventana, "Error", "Complete los campos requeridos (*)")
                return
            
            try:
                monto = float(monto_var.get())
            except ValueError:
                self.logger.warning(f"Intento de guardar pago con monto inválido: {monto_var.get()}")
                mostrar_error(ventana, "Error", "El monto debe ser un número válido")
                return
            
            evento_id = int(evento_id_var.get().split(' - ')[0])
            
            datos = {
                'evento_id': evento_id,
                'monto': monto,
                'tipo_pago': tipo_var.get(),
                'metodo_pago': metodo_var.get(),
                'numero_referencia': referencia_var.get().strip() or None,
                'fecha_pago': fecha,
                'observaciones': observaciones_text.get('1.0', tk.END).strip() or None,
                'usuario_registro_id': self.usuario['id'],
                'origen': 'desktop'  # Identificar que el pago viene de la aplicación de escritorio
            }
            
            nombre_usuario = self.usuario.get('nombre_usuario', 'desconocido')
            self.logger.info(f"Usuario {nombre_usuario} (ID: {self.usuario['id']}) intentando registrar pago - Evento: {evento_id}, Monto: ${monto:.2f}")
            
            try:
                pago_id = self.modelo.crear_pago(datos)
                if pago_id:
                    self.autenticacion.registrar_log("Registrar pago", "Pagos", f"Pago registrado: ${monto:.2f}")
                    self.logger.info(f"Pago registrado exitosamente desde la vista - ID: {pago_id}, Usuario: {nombre_usuario}")
                    mostrar_info(ventana, "Éxito", "Pago registrado exitosamente")
                    ventana.destroy()
                    self.cargar_datos()
                else:
                    self.logger.error(f"Error al registrar pago - El modelo retornó None para Evento: {evento_id}, Monto: ${monto:.2f}")
                    mostrar_error(ventana, "Error", "Error al registrar el pago")
            except ValueError as e:
                # Error de validación (excede monto total, etc.)
                self.logger.warning(f"Error de validación al registrar pago: {str(e)}")
                mostrar_error(ventana, "Error de Validación", str(e))
            except Exception as e:
                # Otros errores
                import traceback
                self.logger.error(f"Error al registrar el pago: {str(e)}")
                self.logger.debug(f"Traceback registro pago: {traceback.format_exc()}")
                mostrar_error(ventana, "Error", f"Error al registrar el pago: {str(e)}")
        
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
    
    def eliminar_pago(self):
        """Elimina un pago"""
        selection = self.tree.selection()
        if not selection:
            self.logger.debug("Intento de eliminar pago sin selección")
            mostrar_advertencia(self.parent, "Advertencia", "Seleccione un pago para eliminar")
            return
        
        item = self.tree.item(selection[0])
        pago_id = item['values'][0]
        nombre_usuario = self.usuario.get('nombre_usuario', 'desconocido')
        self.logger.info(f"Usuario {nombre_usuario} (ID: {self.usuario['id']}) solicitando eliminar pago ID: {pago_id}")
        
        if confirmar(self.parent, "Confirmar Eliminación", "¿Está seguro de eliminar este pago?"):
            if self.modelo.eliminar_pago(pago_id):
                self.autenticacion.registrar_log("Eliminar pago", "Pagos", f"Pago eliminado: ID {pago_id}")
                self.logger.info(f"Pago eliminado exitosamente desde la vista - ID: {pago_id}, Usuario: {nombre_usuario}")
                mostrar_info(self.parent, "Éxito", "Pago eliminado exitosamente")
                self.cargar_datos()
            else:
                self.logger.error(f"Error al eliminar pago desde la vista - ID: {pago_id}, Usuario: {nombre_usuario}")
                mostrar_error(self.parent, "Error", "Error al eliminar el pago")
        else:
            self.logger.debug(f"Usuario {nombre_usuario} canceló la eliminación del pago ID: {pago_id}")
