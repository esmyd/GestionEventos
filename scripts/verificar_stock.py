"""Script para verificar problema de stock"""
import sys
sys.path.insert(0, '.')
from modelos.base_datos import BaseDatos

db = BaseDatos()

# Ver tablas que contengan 'evento' o 'producto'
print("=" * 50)
print("TABLAS RELACIONADAS:")
tablas = db.obtener_todos("SHOW TABLES")
for t in tablas:
    tabla_nombre = list(t.values())[0]
    if 'evento' in tabla_nombre.lower() or 'producto' in tabla_nombre.lower() or 'adicional' in tabla_nombre.lower():
        print(f"  - {tabla_nombre}")

# Ver estructura de la tabla productos_eventos si existe
print("\n" + "=" * 50)
print("BUSCANDO TABLA DE PRODUCTOS EN EVENTOS:")
for t in tablas:
    tabla_nombre = list(t.values())[0]
    if 'producto' in tabla_nombre.lower() and 'evento' in tabla_nombre.lower():
        print(f"\nEstructura de {tabla_nombre}:")
        cols = db.obtener_todos(f"DESCRIBE {tabla_nombre}")
        for c in cols:
            print(f"  {c}")

# Ver si hay productos reservados
print("\n" + "=" * 50)
print("PRODUCTOS RESERVADOS EN EVENTOS (producto_id=35):")
try:
    # Intentar con diferentes nombres de tabla
    for tabla in ['productos_eventos', 'evento_productos', 'eventos_productos']:
        try:
            reservas = db.obtener_todos(f"SELECT * FROM {tabla} WHERE producto_id = 35")
            if reservas:
                print(f"Reservas en {tabla}:")
                for r in reservas:
                    print(f"  {r}")
        except:
            pass
except Exception as e:
    print(f"Error: {e}")

# Ver tabla inventario
print("\n" + "=" * 50)
print("TABLA INVENTARIO (producto_id=35):")
try:
    inventario = db.obtener_todos("SELECT * FROM inventario WHERE producto_id = 35")
    for i in inventario:
        print(f"  {i}")
except Exception as e:
    print(f"  No existe o error: {e}")
