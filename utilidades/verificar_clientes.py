"""
Verificar estructura de la tabla clientes
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.base_datos import BaseDatos


base_datos = BaseDatos()

# Verificar si existe la tabla clientes
consulta = "SHOW TABLES LIKE 'clientes'"
resultado = base_datos.obtener_uno(consulta)
print(f"Tabla clientes existe: {resultado is not None}")

if resultado:
    # Ver estructura de la tabla
    consulta = "DESCRIBE clientes"
    columnas = base_datos.obtener_todos(consulta)
    print("\nColumnas de la tabla clientes:")
    for col in columnas:
        print(f"  - {col['Field']} ({col['Type']})")
    
    # Verificar si tiene usuario_id
    tiene_usuario_id = any(col['Field'] == 'usuario_id' for col in columnas)
    print(f"\nTiene columna usuario_id: {tiene_usuario_id}")
else:
    print("\n[ERROR] La tabla clientes no existe!")

base_datos.desconectar()

