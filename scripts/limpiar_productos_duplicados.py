"""
Script para eliminar productos duplicados de la base de datos
Mantiene el producto con el ID más bajo de cada grupo de duplicados
"""
import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.base_datos import BaseDatos

def limpiar_duplicados():
    db = BaseDatos()
    
    print("=" * 60)
    print("LIMPIEZA DE PRODUCTOS DUPLICADOS")
    print("=" * 60)
    
    # 1. Mostrar duplicados encontrados
    print("\n1. Buscando productos duplicados...")
    duplicados = db.obtener_todos("""
        SELECT nombre, COUNT(*) as cantidad, GROUP_CONCAT(id ORDER BY id) as ids
        FROM productos
        GROUP BY nombre
        HAVING COUNT(*) > 1
    """)
    
    if not duplicados:
        print("   No se encontraron productos duplicados.")
        return
    
    print(f"   Encontrados {len(duplicados)} grupos de productos duplicados:\n")
    for dup in duplicados:
        print(f"   - {dup['nombre']}: IDs {dup['ids']} ({dup['cantidad']} registros)")
    
    # 2. Crear backup
    print("\n2. Creando backup de la tabla productos...")
    db.ejecutar_consulta("DROP TABLE IF EXISTS productos_backup_temp")
    db.ejecutar_consulta("CREATE TABLE productos_backup_temp AS SELECT * FROM productos")
    print("   Backup creado: productos_backup_temp")
    
    # 3. Obtener IDs a mantener (el menor de cada grupo)
    ids_mantener = db.obtener_todos("""
        SELECT MIN(id) as id_mantener, nombre
        FROM productos
        GROUP BY nombre
    """)
    ids_mantener_list = [r['id_mantener'] for r in ids_mantener]
    print(f"\n3. Se mantendrán {len(ids_mantener_list)} productos únicos")
    
    # 4. Obtener IDs a eliminar
    ids_eliminar = db.obtener_todos(f"""
        SELECT id, nombre FROM productos 
        WHERE id NOT IN ({','.join(map(str, ids_mantener_list))})
    """)
    
    if not ids_eliminar:
        print("   No hay productos para eliminar.")
        return
    
    print(f"\n4. Se eliminarán {len(ids_eliminar)} productos duplicados:")
    for prod in ids_eliminar:
        print(f"   - ID {prod['id']}: {prod['nombre']}")
    
    # 5. Actualizar referencias en eventos_productos
    print("\n5. Actualizando referencias en eventos_productos...")
    for prod in ids_eliminar:
        # Obtener el ID que se va a mantener para este nombre
        id_mantener = db.obtener_uno("""
            SELECT MIN(id) as id_mantener FROM productos WHERE nombre = %s
        """, (prod['nombre'],))
        
        if id_mantener:
            resultado = db.ejecutar_consulta("""
                UPDATE eventos_productos SET producto_id = %s WHERE producto_id = %s
            """, (id_mantener['id_mantener'], prod['id']))
            print(f"   Actualizadas referencias de ID {prod['id']} -> {id_mantener['id_mantener']}")
    
    # 6. Actualizar referencias en movimientos_inventario
    print("\n6. Actualizando referencias en movimientos_inventario...")
    for prod in ids_eliminar:
        id_mantener = db.obtener_uno("""
            SELECT MIN(id) as id_mantener FROM productos WHERE nombre = %s
        """, (prod['nombre'],))
        
        if id_mantener:
            db.ejecutar_consulta("""
                UPDATE movimientos_inventario SET producto_id = %s WHERE producto_id = %s
            """, (id_mantener['id_mantener'], prod['id']))
    print("   Referencias actualizadas")
    
    # 7. Actualizar referencias en plan_productos (si existe)
    print("\n7. Verificando tabla plan_productos...")
    try:
        for prod in ids_eliminar:
            id_mantener = db.obtener_uno("""
                SELECT MIN(id) as id_mantener FROM productos WHERE nombre = %s
            """, (prod['nombre'],))
            
            if id_mantener:
                db.ejecutar_consulta("""
                    UPDATE plan_productos SET producto_id = %s WHERE producto_id = %s
                """, (id_mantener['id_mantener'], prod['id']))
        print("   Referencias en plan_productos actualizadas")
    except Exception as e:
        print(f"   Tabla plan_productos no existe o no tiene referencias: {e}")
    
    # 7b. Actualizar referencias en inventario
    print("\n7b. Actualizando referencias en inventario...")
    try:
        for prod in ids_eliminar:
            id_mantener = db.obtener_uno("""
                SELECT MIN(id) as id_mantener FROM productos WHERE nombre = %s
            """, (prod['nombre'],))
            
            if id_mantener:
                db.ejecutar_consulta("""
                    UPDATE inventario SET producto_id = %s WHERE producto_id = %s
                """, (id_mantener['id_mantener'], prod['id']))
        print("   Referencias en inventario actualizadas")
    except Exception as e:
        print(f"   Error actualizando inventario: {e}")
    
    # 8. Eliminar productos duplicados
    print("\n8. Eliminando productos duplicados...")
    ids_a_eliminar = [prod['id'] for prod in ids_eliminar]
    
    if ids_a_eliminar:
        placeholders = ','.join(['%s'] * len(ids_a_eliminar))
        resultado = db.ejecutar_consulta(f"""
            DELETE FROM productos WHERE id IN ({placeholders})
        """, tuple(ids_a_eliminar))
        print(f"   Eliminados {len(ids_a_eliminar)} productos duplicados")
    
    # 9. Verificar resultado
    print("\n9. Verificando resultado...")
    verificacion = db.obtener_todos("""
        SELECT nombre, COUNT(*) as cantidad
        FROM productos
        GROUP BY nombre
        HAVING COUNT(*) > 1
    """)
    
    if not verificacion:
        print("   [OK] No quedan productos duplicados")
    else:
        print(f"   [ERROR] Aun quedan {len(verificacion)} grupos de duplicados")
    
    # 10. Contar productos finales
    total = db.obtener_uno("SELECT COUNT(*) as total FROM productos")
    print(f"\n10. Total de productos después de limpieza: {total['total']}")
    
    print("\n" + "=" * 60)
    print("LIMPIEZA COMPLETADA")
    print("=" * 60)
    print("\nNota: Se creó un backup en 'productos_backup_temp'")
    print("Para restaurar: CREATE TABLE productos AS SELECT * FROM productos_backup_temp")

if __name__ == "__main__":
    limpiar_duplicados()
