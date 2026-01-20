"""
Widgets personalizados para selección de fecha y hora
"""
import tkinter as tk
from tkinter import ttk
from datetime import datetime, date
import calendar


class SelectorFecha(tk.Frame):
    """Widget para seleccionar fecha"""
    
    def __init__(self, parent, texto_label="Fecha:", **kwargs):
        super().__init__(parent, **kwargs)
        self.fecha_seleccionada = tk.StringVar()
        self.crear_widgets(texto_label)
    
    def crear_widgets(self, texto_label):
        """Crea los widgets del selector"""
        tk.Label(self, text=texto_label, font=('Arial', 10)).pack(side=tk.LEFT, padx=(0, 5))
        
        # Frame para los campos de fecha
        fecha_frame = tk.Frame(self)
        fecha_frame.pack(side=tk.LEFT)
        
        # Día
        self.dia_var = tk.StringVar(value=str(date.today().day))
        dia_spin = tk.Spinbox(fecha_frame, from_=1, to=31, width=3, textvariable=self.dia_var, 
                              font=('Arial', 10), command=self.actualizar_fecha)
        dia_spin.pack(side=tk.LEFT, padx=2)
        
        tk.Label(fecha_frame, text="/", font=('Arial', 10)).pack(side=tk.LEFT)
        
        # Mes
        self.mes_var = tk.StringVar(value=str(date.today().month))
        mes_spin = tk.Spinbox(fecha_frame, from_=1, to=12, width=3, textvariable=self.mes_var,
                              font=('Arial', 10), command=self.actualizar_fecha)
        mes_spin.pack(side=tk.LEFT, padx=2)
        
        tk.Label(fecha_frame, text="/", font=('Arial', 10)).pack(side=tk.LEFT)
        
        # Año
        año_actual = date.today().year
        self.año_var = tk.StringVar(value=str(año_actual))
        año_spin = tk.Spinbox(fecha_frame, from_=año_actual, to=año_actual+10, width=5,
                              textvariable=self.año_var, font=('Arial', 10), command=self.actualizar_fecha)
        año_spin.pack(side=tk.LEFT, padx=2)
        
        # Campo de texto para mostrar formato MySQL
        self.entry_fecha = tk.Entry(self, textvariable=self.fecha_seleccionada, width=12,
                                    font=('Arial', 10), state='readonly')
        self.entry_fecha.pack(side=tk.LEFT, padx=5)
        
        # Botón de calendario
        btn_cal = tk.Button(self, text="📅", command=self.mostrar_calendario,
                           font=('Arial', 10), width=3, cursor='hand2')
        btn_cal.pack(side=tk.LEFT, padx=2)
        
        self.actualizar_fecha()
        
        # Bind para actualizar cuando cambian los valores
        self.dia_var.trace('w', lambda *args: self.actualizar_fecha())
        self.mes_var.trace('w', lambda *args: self.actualizar_fecha())
        self.año_var.trace('w', lambda *args: self.actualizar_fecha())
    
    def actualizar_fecha(self):
        """Actualiza la fecha en formato MySQL"""
        try:
            dia = int(self.dia_var.get())
            mes = int(self.mes_var.get())
            año = int(self.año_var.get())
            
            # Validar fecha
            if 1 <= mes <= 12 and 1 <= dia <= 31:
                # Verificar si el día es válido para el mes
                try:
                    fecha = date(año, mes, dia)
                    self.fecha_seleccionada.set(fecha.strftime('%Y-%m-%d'))
                except ValueError:
                    # Día inválido para el mes (ej: 31 de febrero)
                    pass
        except ValueError:
            pass
    
    def mostrar_calendario(self):
        """Muestra un calendario para seleccionar fecha"""
        ventana_cal = tk.Toplevel(self)
        ventana_cal.title("Seleccionar Fecha")
        ventana_cal.geometry("300x300")
        ventana_cal.transient(self.winfo_toplevel())
        ventana_cal.grab_set()
        
        # Obtener fecha actual o seleccionada
        try:
            fecha_actual = datetime.strptime(self.fecha_seleccionada.get(), '%Y-%m-%d').date()
        except:
            fecha_actual = date.today()
        
        año = fecha_actual.year
        mes = fecha_actual.month
        
        # Frame para controles
        control_frame = tk.Frame(ventana_cal)
        control_frame.pack(pady=10)
        
        def cambiar_mes(delta):
            nonlocal mes, año
            mes += delta
            if mes > 12:
                mes = 1
                año += 1
            elif mes < 1:
                mes = 12
                año -= 1
            actualizar_calendario()
        
        tk.Button(control_frame, text="◀", command=lambda: cambiar_mes(-1)).pack(side=tk.LEFT, padx=5)
        
        mes_label = tk.Label(control_frame, text="", font=('Arial', 12, 'bold'), width=20)
        mes_label.pack(side=tk.LEFT)
        
        tk.Button(control_frame, text="▶", command=lambda: cambiar_mes(1)).pack(side=tk.LEFT, padx=5)
        
        # Frame para el calendario
        cal_frame = tk.Frame(ventana_cal)
        cal_frame.pack(pady=10, padx=10)
        
        def actualizar_calendario():
            # Limpiar frame
            for widget in cal_frame.winfo_children():
                widget.destroy()
            
            # Títulos de días
            dias_semana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
            for i, dia in enumerate(dias_semana):
                tk.Label(cal_frame, text=dia, font=('Arial', 9, 'bold'), width=4).grid(row=0, column=i)
            
            # Obtener calendario del mes
            cal = calendar.monthcalendar(año, mes)
            nombres_meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
            mes_label.config(text=f"{nombres_meses[mes]} {año}")
            
            # Crear botones para cada día
            for semana in cal:
                for i, dia in enumerate(semana):
                    if dia == 0:
                        tk.Label(cal_frame, text="", width=4).grid(row=cal.index(semana)+1, column=i)
                    else:
                        btn = tk.Button(cal_frame, text=str(dia), width=4, font=('Arial', 9),
                                       command=lambda d=dia: seleccionar_fecha(d))
                        if dia == fecha_actual.day and mes == fecha_actual.month and año == fecha_actual.year:
                            btn.config(bg='#3498db', fg='white')
                        btn.grid(row=cal.index(semana)+1, column=i, padx=1, pady=1)
        
        def seleccionar_fecha(dia):
            self.dia_var.set(str(dia))
            self.mes_var.set(str(mes))
            self.año_var.set(str(año))
            self.actualizar_fecha()
            ventana_cal.destroy()
        
        actualizar_calendario()
    
    def obtener_fecha(self):
        """Retorna la fecha en formato MySQL (YYYY-MM-DD)"""
        return self.fecha_seleccionada.get()
    
    def establecer_fecha(self, fecha_str):
        """Establece la fecha desde un string en formato YYYY-MM-DD"""
        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
            self.dia_var.set(str(fecha.day))
            self.mes_var.set(str(fecha.month))
            self.año_var.set(str(fecha.year))
            self.actualizar_fecha()
        except:
            pass


class SelectorHora(tk.Frame):
    """Widget para seleccionar hora"""
    
    def __init__(self, parent, texto_label="Hora:", **kwargs):
        super().__init__(parent, **kwargs)
        self.hora_seleccionada = tk.StringVar()
        self.crear_widgets(texto_label)
    
    def crear_widgets(self, texto_label):
        """Crea los widgets del selector"""
        tk.Label(self, text=texto_label, font=('Arial', 10)).pack(side=tk.LEFT, padx=(0, 5))
        
        # Frame para los campos de hora
        hora_frame = tk.Frame(self)
        hora_frame.pack(side=tk.LEFT)
        
        # Hora
        self.hora_var = tk.StringVar(value=str(datetime.now().hour))
        hora_spin = tk.Spinbox(hora_frame, from_=0, to=23, width=3, textvariable=self.hora_var,
                               font=('Arial', 10), format="%02.0f", command=self.actualizar_hora)
        hora_spin.pack(side=tk.LEFT, padx=2)
        
        tk.Label(hora_frame, text=":", font=('Arial', 10)).pack(side=tk.LEFT)
        
        # Minutos
        self.minuto_var = tk.StringVar(value=str(datetime.now().minute))
        minuto_spin = tk.Spinbox(hora_frame, from_=0, to=59, width=3, textvariable=self.minuto_var,
                                 font=('Arial', 10), format="%02.0f", command=self.actualizar_hora)
        minuto_spin.pack(side=tk.LEFT, padx=2)
        
        # Campo de texto para mostrar formato MySQL
        self.entry_hora = tk.Entry(self, textvariable=self.hora_seleccionada, width=8,
                                   font=('Arial', 10), state='readonly')
        self.entry_hora.pack(side=tk.LEFT, padx=5)
        
        self.actualizar_hora()
        
        # Bind para actualizar cuando cambian los valores
        self.hora_var.trace('w', lambda *args: self.actualizar_hora())
        self.minuto_var.trace('w', lambda *args: self.actualizar_hora())
    
    def actualizar_hora(self):
        """Actualiza la hora en formato MySQL"""
        try:
            hora = int(self.hora_var.get())
            minuto = int(self.minuto_var.get())
            
            if 0 <= hora <= 23 and 0 <= minuto <= 59:
                self.hora_seleccionada.set(f"{hora:02d}:{minuto:02d}")
        except ValueError:
            pass
    
    def obtener_hora(self):
        """Retorna la hora en formato MySQL (HH:MM)"""
        return self.hora_seleccionada.get()
    
    def establecer_hora(self, hora_str):
        """Establece la hora desde un string en formato HH:MM"""
        try:
            partes = hora_str.split(':')
            if len(partes) == 2:
                self.hora_var.set(str(int(partes[0])))
                self.minuto_var.set(str(int(partes[1])))
                self.actualizar_hora()
        except:
            pass

