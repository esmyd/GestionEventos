"""
Script para verificar la estructura de la tabla pagos
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar encoding UTF-8 para Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from modelos.base_datos import BaseDatos

def verificar_pagos():
    """Verifica la estructura de la tabla pagos"""
    bd = BaseDatos()
    
    try:
        # Verificar si la tabla existe
        consulta = "SHOW TABLES LIKE 'pagos'"
        resultado = bd.obtener_todos(consulta)
        
        if not resultado:
            print("[X] La tabla 'pagos' no existe")
            return
        
        print("[OK] La tabla 'pagos' existe")
        
        # Obtener estructura
        consulta = "DESCRIBE pagos"
        columnas = bd.obtener_todos(consulta)
        
        print("\nEstructura de la tabla 'pagos':")
        print("-" * 60)
        for col in columnas:
            print(f"  Campo: {col['Field']:<25} Tipo: {col['Type']:<20} Null: {col['Null']:<5} Key: {col['Key']}")
        
        # Verificar columnas específicas
        nombres_columnas = [col['Field'] for col in columnas]
        
        if 'evento_id' in nombres_columnas:
            print("\n[OK] La columna 'evento_id' existe")
        elif 'id_evento' in nombres_columnas:
            print("\n[INFO] La columna se llama 'id_evento' (no 'evento_id')")
        else:
            print("\n[X] No existe ni 'evento_id' ni 'id_evento'")
            
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        bd.desconectar()

if __name__ == "__main__":
    verificar_pagos()

