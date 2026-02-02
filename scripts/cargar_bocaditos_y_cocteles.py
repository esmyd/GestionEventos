"""
Script para cargar productos BOCADITOS DE SAL, BOCADITOS DE DULCE y COCTELES
con sus variaciones/opciones.

Secuencia: primero se crea el producto, luego se agregan las variaciones (producto_opciones).

Ejecutar desde la raíz del proyecto:
  python scripts/cargar_bocaditos_y_cocteles.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.producto_modelo import ProductoModelo
from modelos.producto_opcion_modelo import ProductoOpcionModelo
from utilidades.logger import obtener_logger

logger = obtener_logger()


def producto_existe(nombre):
    """Verifica si un producto ya existe por nombre"""
    modelo = ProductoModelo()
    todos = modelo.obtener_todos_productos(solo_activos=False)
    return any((p.get('nombre') or '').strip().upper() == nombre.strip().upper() for p in todos)


def crear_producto_con_opciones(nombre, descripcion, opciones_grupos, precio=0):
    """
    Crea un producto y sus grupos de opciones.
    opciones_grupos: lista de dicts con nombre_grupo y opciones (lista de strings)
    """
    producto_modelo = ProductoModelo()
    opcion_modelo = ProductoOpcionModelo()

    if producto_existe(nombre):
        print(f"  Producto '{nombre}' ya existe. Agregando opciones...")
        todos = producto_modelo.obtener_todos_productos(solo_activos=False)
        prod = next((p for p in todos if (p.get('nombre') or '').strip().upper() == nombre.strip().upper()), None)
        if prod:
            producto_id = prod.get('id')
            print(f"    Usando producto existente ID {producto_id}")
        else:
            logger.error(f"No se pudo encontrar el producto '{nombre}'")
            return None
    else:
        datos = {
            'nombre': nombre,
            'descripcion': descripcion or f'Opciones tradicionales de {nombre}',
            'precio': precio,
            'stock': 0,
            'unidad_medida': 'unidad',
            'tipo_servicio': 'producto',
        }
        producto_id = producto_modelo.crear_producto(datos)
        if not producto_id:
            logger.error(f"Error al crear producto '{nombre}'")
            return None
        print(f"  Producto '{nombre}' creado con ID {producto_id}")

    for i, grupo in enumerate(opciones_grupos):
        opciones_str = '|'.join(grupo['opciones'])
        datos_opcion = {
            'producto_id': producto_id,
            'nombre_grupo': grupo['nombre_grupo'],
            'opciones': opciones_str,
            'permite_multiple': grupo.get('permite_multiple', False),
            'requerido': grupo.get('requerido', True),
            'orden': i,
        }
        try:
            opcion_id = opcion_modelo.crear_opcion(datos_opcion)
            if opcion_id:
                print(f"    - Opción '{grupo['nombre_grupo']}' creada (ID {opcion_id})")
            else:
                logger.warning(f"  - No se pudo crear opción '{grupo['nombre_grupo']}'")
        except Exception as e:
            logger.error(f"  - Error creando opción '{grupo['nombre_grupo']}': {e}")

    return producto_id


def main():
    print("=" * 60)
    print("Cargando BOCADITOS DE SAL, BOCADITOS DE DULCE y COCTELES")
    print("=" * 60)

    # 1. BOCADITOS DE SAL 100 UNIDADES
    crear_producto_con_opciones(
        nombre="BOCADITOS DE SAL 100 UNIDADES",
        descripcion="Bocaditos de sal tradicionales. Opciones tradicionales.",
        precio=0,
        opciones_grupos=[
            {'nombre_grupo': 'Tartaletas', 'opciones': ['pollo', 'pizza', 'tocino', 'carne']},
            {'nombre_grupo': 'Caracoles', 'opciones': ['pollo', 'queso crema y tocino', 'de ensalada rusa']},
            {'nombre_grupo': 'Empanaditas', 'opciones': ['de queso y orégano', 'de pollo', 'de carne', 'de pizza']},
            {'nombre_grupo': 'Bolitas de carne', 'opciones': ['Bolitas de carne']},
            {'nombre_grupo': 'Sanduchitos', 'opciones': ['de pollo', 'de atún', 'de queso y jamón', 'de queso crema y tocino']},
            {'nombre_grupo': 'Rollitos de jamón y queso', 'opciones': ['Rollitos de jamón y queso']},
            {'nombre_grupo': 'Mini pinchos', 'opciones': ['de pollo / carne', 'de queso, aceitunas y jamón', 'de chorizo y piña']},
        ],
    )

    # 2. BOCADITOS DE DULCE 100 UNIDADES
    crear_producto_con_opciones(
        nombre="BOCADITOS DE DULCE 100 UNIDADES",
        descripcion="Bocaditos de dulce tradicionales. Opciones tradicionales.",
        precio=0,
        opciones_grupos=[
            {
                'nombre_grupo': 'Opciones tradicionales',
                'opciones': [
                    'Tartaletas hawaianas',
                    'Tartaletas frutos rojos',
                    'Tartaletas de manjar y nuez',
                    'Tartaletas de chocolate y maní',
                    'Caracoles masa pastelera',
                    'Caracoles manjar',
                    'Caracoles chocolate',
                    'Trufas de coco',
                    'Trufas de nuez',
                    'Trufas de chocolate y licor',
                    'Mazapán',
                    'Huevitos',
                    'Borrachitos de piña',
                    'Mini brownie',
                    'Alfajores',
                    'Empanaditas hawaianas',
                    'Suspiros',
                ],
            },
        ],
    )

    # 3. COCTELES
    crear_producto_con_opciones(
        nombre="COCTELES",
        descripcion="Menú de cócteles. Festeja a lo grande.",
        precio=0,
        opciones_grupos=[
            {
                'nombre_grupo': 'Menú',
                'opciones': [
                    'Piña Colada',
                    'Saltamontes',
                    'Medias de Seda',
                    'Alexander',
                    'Chicle',
                    'Baileys',
                    'Margarita',
                    'Mojito',
                ],
            },
        ],
    )

    print("=" * 60)
    print("Carga completada. Los productos están listos con sus variaciones.")
    print("=" * 60)


if __name__ == '__main__':
    main()
