"""
Script para verificar la estructura de la tabla productos
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar encoding UTF-8 para Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from modelos.base_datos import BaseDatos

def verificar_productos():
    """Verifica la estructura de la tabla productos"""
    bd = BaseDatos()
    
    try:
        # Verificar si la tabla existe
        consulta = "SHOW TABLES LIKE 'productos'"
        resultado = bd.obtener_todos(consulta)
        
        if not resultado:
            print("[X] La tabla 'productos' no existe")
            return
        
        print("[OK] La tabla 'productos' existe")
        
        # Obtener estructura
        consulta = "DESCRIBE productos"
        columnas = bd.obtener_todos(consulta)
        
        print("\nEstructura de la tabla 'productos':")
        print("-" * 60)
        for col in columnas:
            print(f"  Campo: {col['Field']:<20} Tipo: {col['Type']:<20} Null: {col['Null']:<5} Key: {col['Key']}")
        
        # Verificar si existe columna categoria
        tiene_categoria = any(col['Field'] == 'categoria' for col in columnas)
        if tiene_categoria:
            print("\n[OK] La columna 'categoria' existe")
        else:
            print("\n[X] La columna 'categoria' NO existe")
            
    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        bd.desconectar()

if __name__ == "__main__":
    verificar_productos()

