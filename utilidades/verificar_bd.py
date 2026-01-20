"""
Script para verificar que la base de datos esté configurada correctamente
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.base_datos import BaseDatos


def verificar_tablas():
    """Verifica que todas las tablas necesarias existan"""
    base_datos = BaseDatos()
    
    tablas_requeridas = [
        'usuarios',
        'clientes',
        'productos',
        'planes',
        'promociones',
        'eventos',
        'evento_productos',
        'inventario',
        'pagos',
        'recursos_humanos',
        'evento_recursos',
        'tareas_evento',
        'confirmaciones_cliente',
        'logs_sistema',
        'configuracion_integraciones'
    ]
    
    print("=== Verificacion de Base de Datos ===\n")
    
    consulta = """
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE()
    """
    
    tablas_existentes = base_datos.obtener_todos(consulta)
    nombres_tablas = [t['TABLE_NAME'] for t in tablas_existentes]
    
    print(f"Tablas encontradas en la base de datos: {len(nombres_tablas)}\n")
    
    faltantes = []
    existentes = []
    
    for tabla in tablas_requeridas:
        if tabla in nombres_tablas:
            existentes.append(tabla)
            print(f"[OK] {tabla}")
        else:
            faltantes.append(tabla)
            print(f"[FALTA] {tabla}")
    
    print(f"\n--- Resumen ---")
    print(f"Tablas existentes: {len(existentes)}/{len(tablas_requeridas)}")
    
    if faltantes:
        print(f"\n[ADVERTENCIA] Faltan {len(faltantes)} tablas:")
        for tabla in faltantes:
            print(f"  - {tabla}")
        print("\nEjecuta: python utilidades/ejecutar_sql.py")
    else:
        print("\n[OK] Todas las tablas estan creadas correctamente!")
    
    # Verificar usuarios por defecto
    print("\n--- Usuarios por Defecto ---")
    usuarios = base_datos.obtener_todos("SELECT nombre_usuario, rol, activo FROM usuarios")
    if usuarios:
        for usuario in usuarios:
            estado = "Activo" if usuario['activo'] else "Inactivo"
            print(f"[OK] {usuario['nombre_usuario']} ({usuario['rol']}) - {estado}")
    else:
        print("[ADVERTENCIA] No se encontraron usuarios")
    
    base_datos.desconectar()


if __name__ == "__main__":
    verificar_tablas()

