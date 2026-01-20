"""
Utilidades para ventanas y mensajes
"""
import tkinter as tk
from tkinter import messagebox


def centrar_ventana(ventana, ancho=None, alto=None):
    """Centra una ventana en la pantalla"""
    ventana.update_idletasks()
    
    if ancho is None:
        ancho = ventana.winfo_width()
    if alto is None:
        alto = ventana.winfo_height()
    
    # Obtener dimensiones de la pantalla
    ancho_pantalla = ventana.winfo_screenwidth()
    alto_pantalla = ventana.winfo_screenheight()
    
    # Calcular posición para centrar
    x = (ancho_pantalla // 2) - (ancho // 2)
    y = (alto_pantalla // 2) - (alto // 2)
    
    # Aplicar geometría
    ventana.geometry(f'{ancho}x{alto}+{x}+{y}')


def mostrar_error(ventana, titulo, mensaje):
    """Muestra un mensaje de error"""
    messagebox.showerror(titulo, mensaje, parent=ventana)


def mostrar_advertencia(ventana, titulo, mensaje):
    """Muestra un mensaje de advertencia"""
    messagebox.showwarning(titulo, mensaje, parent=ventana)


def mostrar_info(ventana, titulo, mensaje):
    """Muestra un mensaje informativo"""
    messagebox.showinfo(titulo, mensaje, parent=ventana)


def confirmar(ventana, titulo, mensaje):
    """Muestra un diálogo de confirmación"""
    return messagebox.askyesno(titulo, mensaje, parent=ventana)

