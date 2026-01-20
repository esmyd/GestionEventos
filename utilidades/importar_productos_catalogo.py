"""
Script para importar los productos del catálogo de servicios a la base de datos
"""
from modelos.producto_modelo import ProductoModelo
from modelos.categoria_modelo import CategoriaModelo
from utilidades.logger import obtener_logger

logger = obtener_logger()


def obtener_o_crear_categoria(nombre, descripcion):
    """Obtiene una categoría por nombre o la crea si no existe"""
    categoria_modelo = CategoriaModelo()
    categorias = categoria_modelo.obtener_todas_categorias()
    categoria = next((c for c in categorias if c['nombre'] == nombre), None)
    
    if categoria:
        return categoria['id']
    
    # Crear la categoría
    datos_categoria = {
        'nombre': nombre,
        'descripcion': descripcion,
        'activo': True
    }
    categoria_id = categoria_modelo.crear_categoria(datos_categoria)
    if categoria_id:
        logger.info(f"Categoría '{nombre}' creada con ID: {categoria_id}")
        return categoria_id
    return None


def importar_productos():
    """Importa todos los productos del catálogo de servicios"""
    producto_modelo = ProductoModelo()
    
    # Obtener IDs de categorías
    cat_animacion = obtener_o_crear_categoria('Animación', 'Servicios de animación y entretenimiento')
    cat_dj = obtener_o_crear_categoria('DJ', 'Servicios de DJ y música')
    cat_iluminacion = obtener_o_crear_categoria('Iluminación', 'Equipos de iluminación')
    cat_multimedia = obtener_o_crear_categoria('Multimedia', 'Servicios de video, fotografía y multimedia')
    cat_shows = obtener_o_crear_categoria('Shows Temáticos', 'Shows y presentaciones temáticas')
    cat_efectos = obtener_o_crear_categoria('Efectos Especiales', 'Efectos de luces, humo y ambiente')
    cat_fotografia = obtener_o_crear_categoria('Fotografía', 'Servicios de fotografía y video')
    
    productos = [
        {
            'nombre': 'Animador / Maestro de Ceremonia',
            'descripcion': 'Asegura el éxito de tu celebración con nuestro Presentador Profesional, quien llevará el control del evento con estilo, energía y una excelente interacción con los asistentes.',
            'detalles_adicionales': 'Presentador profesional que coordina y anima el evento completo',
            'precio': 150.00,
            'id_categoria': cat_animacion,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Servicio DJ Todo el Evento',
            'descripcion': 'Ponle ritmo a tu celebración con nuestro servicio profesional de DJ. Creamos la atmósfera perfecta con música personalizada que hará bailar a todos tus invitados.',
            'detalles_adicionales': 'Servicio de DJ profesional durante todo el evento',
            'precio': 150.00,
            'id_categoria': cat_dj,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Música - Mariachis / Violinista / Banda Musical / Cantante',
            'descripcion': 'Servicios musicales variados para tu evento. Consulta por interno los paquetes de cada uno de los segmentos.',
            'detalles_adicionales': 'Opciones disponibles: Mariachis, Violinista, Banda musical, Cantante. Consultar precios y disponibilidad.',
            'precio': None,
            'id_categoria': cat_dj,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Pista LED',
            'descripcion': 'Pista de baile LED para crear ambiente único en tu evento',
            'variantes': '3x3: $350, 4x3: $400, 5x4: $550',
            'precio': 400.00,
            'precio_minimo': 350.00,
            'precio_maximo': 550.00,
            'id_categoria': cat_iluminacion,
            'unidad_medida': 'unidad',
            'tipo_servicio': 'equipo'
        },
        {
            'nombre': 'Photobooth Mirror',
            'descripcion': 'Cabina de fotos con espejo para momentos divertidos en tu evento',
            'variantes': '2 Horas: $440, 3 Horas: $530',
            'precio': 485.00,
            'precio_minimo': 440.00,
            'precio_maximo': 530.00,
            'duracion_horas': 2,
            'id_categoria': cat_multimedia,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Hora Loca',
            'descripcion': 'Lleva la fiesta al máximo nivel con nuestra Hora Loca acompañada de Robot LED + Tambolero + Coneja o Bola Disco',
            'detalles_adicionales': 'Incluye: Robot LED, Tambolero, Coneja o Bola Disco',
            'precio': 230.00,
            'id_categoria': cat_animacion,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Show de Cabezones',
            'descripcion': 'Show con cabezones temáticos: Ferxxo, Bad Bunny, Daddy Yankee, Wisin y Yandel',
            'variantes': '2 Cabezones: $200, 2 Cabezones + Bailarina + Tambolero: $250',
            'precio': 225.00,
            'precio_minimo': 200.00,
            'precio_maximo': 250.00,
            'id_categoria': cat_shows,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Video 360',
            'descripcion': 'Servicio de video 360 grados para capturar momentos únicos',
            'variantes': '2 Horas con celular del cliente: $150, 2 Horas con código QR: $180',
            'precio': 165.00,
            'precio_minimo': 150.00,
            'precio_maximo': 180.00,
            'duracion_horas': 2,
            'detalles_adicionales': 'Incluyen gafas y sombreros. Se descarga un código QR con los videos editados (opción $180)',
            'id_categoria': cat_multimedia,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Túnel LED',
            'descripcion': 'Túnel LED para crear un efecto visual impactante en la entrada o área principal',
            'precio': 250.00,
            'id_categoria': cat_iluminacion,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'equipo'
        },
        {
            'nombre': 'Show Disney: La Bella y La Bestia',
            'descripcion': 'Show temático de Disney con personajes de La Bella y La Bestia',
            'variantes': 'Show 50 minutos (6 personajes): $450, Cobertura 4 horas (7 personajes): $800',
            'precio': 625.00,
            'precio_minimo': 450.00,
            'precio_maximo': 800.00,
            'detalles_adicionales': 'Personajes: Lumiere, Din don, Chip (Taza), Sra Pots (tetera), Rosa, Plumet, Armario. Incluye: Recepción de invitados + Opening + Hora Loca + Animador + ensayo con la quinceañera (opción $800)',
            'id_categoria': cat_shows,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Show Alicia en el País de las Maravillas',
            'descripcion': 'Show temático con personajes de Alicia en el País de las Maravillas',
            'detalles_adicionales': '7 personajes: Reina roja, Conejo, Rey Tiempo, Gato, 2 gorditos. Incluye: 24 globos, Opening - Hora Loca',
            'precio': 450.00,
            'id_categoria': cat_shows,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Show ¿Dónde están las rubias?',
            'descripcion': 'Show temático con personajes de la película',
            'detalles_adicionales': 'Incluye: 2 rubias, 1 bailarina, Animador, Bufón, 24 globos neón, Integración',
            'precio': 250.00,
            'id_categoria': cat_shows,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Servicio de Fotografía',
            'descripcion': 'Cobertura fotográfica profesional para tu evento',
            'variantes': '2 Horas: $185, 4 Horas: $315, 6 Horas: $470',
            'precio': 323.33,
            'precio_minimo': 185.00,
            'precio_maximo': 470.00,
            'duracion_horas': 2,
            'detalles_adicionales': '2 Horas: 30 fotos editadas (enlace descargable) + 30 fotos impresas en papel fotográfico + Cajita decorativa de regalo. 4 Horas: 50 fotos editadas (enlace descargable) + Video reel express + 50 fotos impresas + Cajita decorativa. 6 Horas: 80 fotos editadas (enlace descargable) + Video reel 30 segundos + 80 fotos impresas + Cajita decorativa',
            'id_categoria': cat_fotografia,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        },
        {
            'nombre': 'Luces Frías',
            'descripcion': 'Efecto de iluminación con luces frías para ambiente especial',
            'precio': 130.00,
            'id_categoria': cat_efectos,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'equipo'
        },
        {
            'nombre': 'Humo Bajo',
            'descripcion': 'Efecto de humo bajo para crear ambiente y efectos visuales',
            'precio': 25.00,
            'id_categoria': cat_efectos,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'equipo'
        },
        {
            'nombre': 'Show Rosa Viviente',
            'descripcion': 'Show con personaje de rosa viviente para eventos especiales',
            'variantes': '1 Hora: $125, 2 Horas: $170',
            'precio': 147.50,
            'precio_minimo': 125.00,
            'precio_maximo': 170.00,
            'duracion_horas': 1,
            'detalles_adicionales': 'Incluye: Recepción de invitados, Show, Fotos con el personaje',
            'id_categoria': cat_shows,
            'unidad_medida': 'servicio',
            'tipo_servicio': 'servicio'
        }
    ]
    
    logger.info("Iniciando importación de productos del catálogo de servicios...")
    
    productos_creados = 0
    productos_actualizados = 0
    
    for producto_data in productos:
        # Verificar si ya existe
        productos_existentes = producto_modelo.obtener_todos_productos(solo_activos=False)
        producto_existente = next((p for p in productos_existentes if p['nombre'] == producto_data['nombre']), None)
        
        if producto_existente:
            logger.info(f"Producto '{producto_data['nombre']}' ya existe con ID: {producto_existente['id']}")
            # Actualizar si es necesario
            if producto_modelo.actualizar_producto(producto_existente['id'], producto_data):
                productos_actualizados += 1
                logger.info(f"Producto '{producto_data['nombre']}' actualizado")
            else:
                logger.error(f"Error al actualizar el producto '{producto_data['nombre']}'")
        else:
            producto_id = producto_modelo.crear_producto(producto_data)
            if producto_id:
                productos_creados += 1
                logger.info(f"Producto '{producto_data['nombre']}' creado con ID: {producto_id}")
            else:
                logger.error(f"Error al crear el producto '{producto_data['nombre']}'")
    
    logger.info(f"Importación completada: {productos_creados} productos creados, {productos_actualizados} productos actualizados")
    return productos_creados, productos_actualizados


if __name__ == "__main__":
    try:
        creados, actualizados = importar_productos()
        print("\n✅ Importación completada exitosamente")
        print(f"\n📊 Resumen:")
        print(f"  - Productos creados: {creados}")
        print(f"  - Productos actualizados: {actualizados}")
        print(f"\n📦 Total de productos en el catálogo: {creados + actualizados}")
        print("\nLos productos ya están disponibles en la aplicación.")
    except Exception as e:
        logger.error(f"Error durante la importación: {str(e)}")
        print(f"\n❌ Error durante la importación: {str(e)}")
        raise

