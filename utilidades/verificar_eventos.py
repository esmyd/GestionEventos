"""
Verificar estructura de la tabla eventos
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.base_datos import BaseDatos


base_datos = BaseDatos()

# Verificar si existe la tabla eventos
consulta = "SHOW TABLES LIKE 'eventos'"
resultado = base_datos.obtener_uno(consulta)
print(f"Tabla eventos existe: {resultado is not None}")

if resultado:
    # Ver estructura de la tabla
    consulta = "DESCRIBE eventos"
    columnas = base_datos.obtener_todos(consulta)
    print("\nColumnas de la tabla eventos:")
    for col in columnas:
        print(f"  - {col['Field']} ({col['Type']})")
    
    # Verificar si tiene PRIMARY KEY
    consulta = """
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'eventos' 
    AND COLUMN_KEY = 'PRI'
    """
    pk = base_datos.obtener_todos(consulta)
    print(f"\nPrimary Key: {[c['COLUMN_NAME'] for c in pk]}")
else:
    print("\n[ERROR] La tabla eventos no existe!")

base_datos.desconectar()

