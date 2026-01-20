"""
Script para verificar y corregir la tabla productos
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar encoding UTF-8 para Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from modelos.base_datos import BaseDatos

def verificar_y_corregir():
    """Verifica y corrige la estructura de la tabla productos"""
    bd = BaseDatos()
    
    try:
        # Obtener estructura actual
        consulta = "DESCRIBE productos"
        columnas = bd.obtener_todos(consulta)
        nombres_columnas = [col['Field'] for col in columnas]
        
        print("Verificando columnas en 'productos'...")
        
        # Verificar columna activo
        if 'activo' not in nombres_columnas:
            print("Agregando columna 'activo'...")
            consulta = "ALTER TABLE productos ADD COLUMN activo BOOLEAN DEFAULT TRUE"
            if bd.ejecutar_consulta(consulta):
                print("[OK] Columna 'activo' agregada")
            else:
                print("[ERROR] No se pudo agregar la columna 'activo'")
        else:
            print("[OK] Columna 'activo' ya existe")
        
        # Verificar que id_categoria existe
        if 'id_categoria' not in nombres_columnas:
            print("[ADVERTENCIA] La columna 'id_categoria' no existe. Ejecute crear_tabla_categorias.py primero.")
        else:
            print("[OK] Columna 'id_categoria' existe")
        
        print("\n[OK] Verificación completada")
        
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        bd.desconectar()

if __name__ == "__main__":
    verificar_y_corregir()

