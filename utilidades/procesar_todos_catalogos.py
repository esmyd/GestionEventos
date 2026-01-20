"""
Script para procesar TODOS los PDFs del catálogo y generar SQL consolidado
"""
from pypdf import PdfReader
import re
import os

def limpiar_texto(texto):
    """Limpia el texto extraído del PDF"""
    # El PDF tiene espacios entre cada carácter, necesitamos colapsarlos
    # Primero, remover caracteres extraños que aparecen en la extracción
    texto = re.sub(r'ÑñÑ[úéáíó]ÑñÑ[úéáíó]', '', texto)  # Eliminar artefactos
    texto = re.sub(r'ÑñÑ[úéáíó]', '', texto)  # Eliminar artefactos simples
    # Remover espacios múltiples pero mantener estructura básica
    texto = re.sub(r' +', ' ', texto)
    # Corregir caracteres especiales comunes
    texto = texto.replace('', 'ó').replace('', 'í').replace('', 'á').replace('', 'é').replace('', 'ú')
    texto = texto.replace('', 'ñ').replace('', 'Ñ')
    return texto.strip()

def extraer_precio_total(texto):
    """Extrae el precio total del evento"""
    # El PDF tiene formato con espacios entre cada carácter: "$ 1 . 2 1 0 , 0 0"
    # Patrón que captura: $ seguido de dígitos/espacios/puntos, luego coma, luego 2 dígitos
    todos_precios = re.findall(r'\$\s*([0-9\s\.]+?)\s*,\s*([0-9])\s*([0-9])', texto)
    precios_encontrados = []
    
    for precio in todos_precios:
        parte_entera = precio[0].replace(' ', '').replace('.', '')
        parte_decimal = precio[1] + precio[2]  # Unir los dos dígitos decimales
        precio_str = f"{parte_entera}.{parte_decimal}"
        try:
            valor = float(precio_str)
            precios_encontrados.append(valor)
        except:
            pass
    
    if precios_encontrados:
        # Filtrar precios pequeños (garantía $60, precios por persona pequeños)
        precios_grandes = [p for p in precios_encontrados if p > 200]
        if precios_grandes:
            # Tomar el precio más grande (generalmente es el total del evento)
            return max(precios_grandes)
        # Si no hay grandes, tomar el más grande de todos
        return max(precios_encontrados)
    
    return None

def extraer_precio_por_persona(texto):
    """Extrae el precio por persona"""
    patron = r'(\d+)\s+Personas?\s*:\s*\$\s*(\d+(?:,\d{2})?)'
    match = re.search(patron, texto, re.IGNORECASE)
    if match:
        try:
            return float(match.group(2).replace(',', '.'))
        except:
            pass
    return None

def extraer_nombre_paquete(texto):
    """Extrae el nombre base del paquete (sin 'Paquete' ni información adicional)"""
    # Buscar nombres conocidos (pueden tener espacios entre caracteres en el PDF)
    nombres = ['Cristal', 'Destello', 'Luz', 'Resplandor', 'Brillo', 'Esplendor', 'Diamante', 'Oro', 'Plata']
    for nombre in nombres:
        # Crear patrón que permita espacios opcionales entre caracteres
        patron = r'\s*'.join(list(nombre))
        if re.search(patron, texto, re.IGNORECASE):
            return nombre  # Devolver solo el nombre base
    
    # Buscar "Paquete" seguido de un nombre (puede tener espacios entre caracteres)
    # Patrón más flexible
    match = re.search(r'P\s*a\s*q\s*u\s*e\s*t\s*e\s+([A-Z])\s*([a-z\s]+?)(?:\s|$)', texto, re.IGNORECASE)
    if match:
        nombre_completo = (match.group(1) + match.group(2)).replace(' ', '').strip()
        if len(nombre_completo) > 2:  # Solo si tiene más de 2 caracteres
            return nombre_completo  # Devolver solo el nombre base
    
    return None

def extraer_capacidad(nombre_archivo):
    """Extrae la capacidad del nombre del archivo"""
    match = re.search(r'(\d+)\s*personas?', nombre_archivo, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None

def procesar_pdf_paquetes(ruta):
    """Procesa un PDF de paquetes y extrae todos los paquetes"""
    nombre_archivo = os.path.basename(ruta)
    capacidad = extraer_capacidad(nombre_archivo)
    
    print(f"Procesando: {nombre_archivo} (Capacidad: {capacidad})")
    
    reader = PdfReader(ruta)
    paquetes = []
    
    # Detectar salón - buscar en todas las páginas
    salon = 'Brisas de Lirio'  # Por defecto
    for page in reader.pages:
        texto_pagina = page.extract_text()
        # Buscar Pétalo con diferentes formatos (puede tener espacios entre caracteres)
        if re.search(r'P\s*[éeé]\s*t\s*a\s*l\s*o', texto_pagina, re.IGNORECASE) or 'Pétalo' in texto_pagina or 'Petalo' in texto_pagina:
            salon = 'Pétalo'
            break
    
    # Procesar cada página como un paquete
    for i, page in enumerate(reader.pages):
        texto_original = page.extract_text()  # Mantener texto original para extraer precios
        texto = limpiar_texto(texto_original)  # Texto limpio para buscar nombres
        
        # Buscar nombre base del paquete en el texto original (sin limpiar)
        nombre_base = extraer_nombre_paquete(texto_original)
        if not nombre_base:
            # Buscar en el texto limpio también
            nombre_base = extraer_nombre_paquete(texto)
        
        # Detectar salón específico para este paquete
        if 'Pétalo' in texto_original or 'Petalo' in texto_original or re.search(r'P\s*[éeé]\s*t\s*a\s*l\s*o', texto_original, re.IGNORECASE):
            salon_paquete = 'Pétalo'
        else:
            salon_paquete = salon
        
        # Construir nombre completo con capacidad y salón para fácil identificación
        if not nombre_base:
            # Asignar nombres según el orden típico de los paquetes
            nombres_por_orden = ['Cristal', 'Destello', 'Luz', 'Resplandor', 'Brillo']
            if i < len(nombres_por_orden):
                nombre_base = nombres_por_orden[i]
            else:
                nombre_base = f"Opción {i+1}"
        
        # Nombre completo: "Cristal - 50 personas - Brisas de Lirio"
        nombre = f"{nombre_base} - {capacidad} personas - {salon_paquete}"
        
        # Extraer precios del texto ORIGINAL (sin limpiar)
        precio_total = extraer_precio_total(texto_original)
        precio_por_persona = extraer_precio_por_persona(texto_original)
        
        # Si no encuentra precio total pero sí por persona, calcular total
        if not precio_total and precio_por_persona and capacidad:
            precio_total = precio_por_persona * capacidad
        
        if precio_total:
            # Construir descripción usando el salón correcto
            descripcion = f"Paquete para eventos de {capacidad} personas en el Salón {salon_paquete}"
            
            # Construir "incluye" - limpiar el texto pero mantener información útil
            # Primero eliminar caracteres extraños del texto original
            texto_sin_artefactos = re.sub(r'ÑñÑ[úéáíó]', '', texto_original)
            texto_sin_artefactos = re.sub(r'ÑñÑ[úéáíó]ÑñÑ[úéáíó]', '', texto_sin_artefactos)
            # Colapsar espacios entre caracteres (formato del PDF: "S a l ó n" -> "Salón")
            # Buscar patrones de letra-espacio-letra y colapsarlos
            texto_sin_artefactos = re.sub(r'([a-zA-ZáéíóúñÁÉÍÓÚÑ])\s+([a-zA-ZáéíóúñÁÉÍÓÚÑ])', r'\1\2', texto_sin_artefactos)
            # Limpiar espacios múltiples restantes
            texto_sin_artefactos = re.sub(r' +', ' ', texto_sin_artefactos)
            # Remover líneas muy cortas o sin sentido
            lineas = [l.strip() for l in texto_sin_artefactos.split('\n') if len(l.strip()) > 20 and 'ÑñÑ' not in l and not l.strip().isdigit()]
            incluye = '\n'.join(lineas[:25])  # Limitar a primeras 25 líneas útiles
            # Limitar longitud total
            if len(incluye) > 2000:
                incluye = incluye[:2000] + '...'
            
            paquetes.append({
                'nombre': nombre,
                'descripcion': descripcion,
                'precio_base': precio_total,
                'capacidad_minima': capacidad,
                'capacidad_maxima': capacidad,
                'duracion_horas': 6,
                'incluye': incluye,
                'salon': salon_paquete
            })
    
    print(f"  -> {len(paquetes)} paquetes encontrados")
    return paquetes

def main():
    """Función principal"""
    base_path = 'utilidades/PLANES Y PRODUCTOS'
    
    todos_paquetes = []
    archivos_paquetes = [
        'PAQUETES 20 personas.pdf',
        'PAQUETES 30 personas.pdf',
        'PAQUETES 40 personas.pdf',
        'PAQUETES 50 personas.pdf',
        'PAQUETES 60 personas.pdf',
        'PAQUETES 70 personas.pdf',
        'PAQUETES 80 personas.pdf',
        'PAQUETES 90 personas.pdf',
        'PAQUETES 100 personass.pdf',
        'PAQUETES 110 personas.pdf',
        'PAQUETES 120 personas.pdf',
        'PAQUETES 130 personas.pdf',
        'PAQUETES 140 personas.pdf',
        'PAQUETES 150 personas.pdf',
    ]
    
    print("="*60)
    print("PROCESANDO PAQUETES")
    print("="*60)
    
    for archivo in archivos_paquetes:
        ruta = os.path.join(base_path, archivo)
        if os.path.exists(ruta):
            paquetes = procesar_pdf_paquetes(ruta)
            todos_paquetes.extend(paquetes)
        else:
            print(f"  ⚠ No encontrado: {archivo}")
    
    print(f"\n{'='*60}")
    print(f"TOTAL: {len(todos_paquetes)} paquetes encontrados")
    print(f"{'='*60}\n")
    
    # Generar SQL
    generar_sql(todos_paquetes)

def generar_sql(paquetes):
    """Genera el archivo SQL consolidado"""
    
    # Obtener salones únicos
    salones_unicos = set(p['salon'] for p in paquetes)
    
    sql = """-- ============================================================================
-- DATOS DEL CATÁLOGO OFICIAL - LIRIOS EVENTOS
-- ============================================================================
-- Este archivo contiene TODOS los datos reales del catálogo oficial
-- Generado automáticamente desde los PDFs del catálogo
-- ============================================================================
-- IMPORTANTE: Ejecutar primero 01_estructura_tablas.sql y 05_migracion_mejorar_productos.sql
-- ============================================================================

USE lirios_eventos;

-- ============================================================================
-- CATEGORÍAS DE PRODUCTOS
-- ============================================================================

INSERT INTO categorias (nombre, descripcion, activo) VALUES
('Proteínas', 'Productos de proteína para eventos', TRUE),
('Arreglos', 'Arreglos florales y decorativos', TRUE),
('DJ', 'Servicios de DJ y música', TRUE),
('Iluminación', 'Equipos de iluminación', TRUE),
('Sonido', 'Equipos de sonido y audio', TRUE),
('Mobiliario', 'Mesas, sillas y mobiliario', TRUE),
('Mantelería', 'Manteles, servilletas y textiles', TRUE),
('Catering', 'Servicios de comida y bebida', TRUE),
('Fotografía', 'Servicios de fotografía y video', TRUE),
('Decoración', 'Elementos decorativos generales', TRUE),
('Entretenimiento', 'Show, animación y entretenimiento', TRUE),
('Animación', 'Servicios de animación y entretenimiento', TRUE),
('Efectos Especiales', 'Efectos de luces, humo y ambiente', TRUE),
('Shows Temáticos', 'Shows y presentaciones temáticas', TRUE),
('Multimedia', 'Servicios de video, fotografía y multimedia', TRUE),
('Transporte', 'Servicios de transporte', TRUE),
('Seguridad', 'Servicios de seguridad', TRUE),
('Otros', 'Otras categorías', TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- ============================================================================
-- SALONES
-- ============================================================================

"""
    
    # Agregar salones en un solo INSERT
    valores_salones = []
    for salon in sorted(salones_unicos):
        if salon == 'Brisas de Lirio':
            capacidad = 50
            ubicacion = 'Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1'
            descripcion = 'Salón Brisas de Lirio climatizado y aromatizado durante 6 horas de evento'
        elif salon == 'Pétalo':
            # Pétalo es para eventos más grandes (100+ personas)
            capacidad = 150
            ubicacion = 'Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1'
            descripcion = 'Salón Pétalo climatizado y aromatizado durante 6 horas de evento'
        else:
            capacidad = 100
            ubicacion = 'Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1'
            descripcion = f'Salón {salon} climatizado y aromatizado durante 6 horas de evento'
        
        valores_salones.append(f"('{salon}', {capacidad}, '{ubicacion}', '{descripcion}', 0.00, TRUE)")
    
    sql += "INSERT INTO salones (nombre, capacidad, ubicacion, descripcion, precio_base, activo) VALUES\n"
    sql += ',\n'.join(valores_salones)
    sql += "\nON DUPLICATE KEY UPDATE nombre=nombre;\n\n"
    
    # Agregar productos (mantener los del catálogo de servicios)
    sql += """-- ============================================================================
-- PRODUCTOS DEL CATÁLOGO DE SERVICIOS
-- ============================================================================

-- CATEGORÍA: ANIMACIÓN
INSERT INTO productos (
    nombre, descripcion, detalles_adicionales, precio, 
    duracion_horas, id_categoria, unidad_medida, tipo_servicio, activo
) VALUES 
('Animador / Maestro de Ceremonia',
    'Asegura el éxito de tu celebración con nuestro Presentador Profesional, quien llevará el control del evento con estilo, energía y una excelente interacción con los asistentes.',
    'Presentador profesional que coordina y anima el evento completo',
    150.00,
    NULL,
    (SELECT id FROM categorias WHERE nombre = 'Animación' LIMIT 1),
    'servicio',
    'servicio',
    TRUE),
('Hora Loca',
    'Lleva la fiesta al máximo nivel con nuestra Hora Loca acompañada de Robot LED + Tambolero + Coneja o Bola Disco',
    'Incluye: Robot LED, Tambolero, Coneja o Bola Disco',
    230.00,
    NULL,
    (SELECT id FROM categorias WHERE nombre = 'Animación' LIMIT 1),
    'servicio',
    'servicio',
    TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- CATEGORÍA: DJ
INSERT INTO productos (
    nombre, descripcion, detalles_adicionales, precio, 
    duracion_horas, id_categoria, unidad_medida, tipo_servicio, activo
) VALUES 
('Servicio DJ Todo el Evento',
    'Ponle ritmo a tu celebración con nuestro servicio profesional de DJ. Creamos la atmósfera perfecta con música personalizada que hará bailar a todos tus invitados.',
    'Servicio de DJ profesional durante todo el evento',
    150.00,
    NULL,
    (SELECT id FROM categorias WHERE nombre = 'DJ' LIMIT 1),
    'servicio',
    'servicio',
    TRUE),
('Música - Mariachis / Violinista / Banda Musical / Cantante',
    'Servicios musicales variados para tu evento. Consulta por interno los paquetes de cada uno de los segmentos.',
    'Opciones disponibles: Mariachis, Violinista, Banda musical, Cantante. Consultar precios y disponibilidad.',
    0.00,
    NULL,
    (SELECT id FROM categorias WHERE nombre = 'DJ' LIMIT 1),
    'servicio',
    'servicio',
    TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- CATEGORÍA: ILUMINACIÓN
INSERT INTO productos (
    nombre, descripcion, variantes, precio, precio_minimo, precio_maximo,
    id_categoria, unidad_medida, tipo_servicio, activo
) VALUES 
('Pista LED',
    'Pista de baile LED para crear ambiente único en tu evento',
    '3x3: $350, 4x3: $400, 5x4: $550',
    400.00,
    350.00,
    550.00,
    (SELECT id FROM categorias WHERE nombre = 'Iluminación' LIMIT 1),
    'unidad',
    'equipo',
    TRUE),
('Túnel LED',
    'Túnel LED para crear un efecto visual impactante en la entrada o área principal',
    NULL,
    250.00,
    NULL,
    NULL,
    (SELECT id FROM categorias WHERE nombre = 'Iluminación' LIMIT 1),
    'servicio',
    'equipo',
    TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- CATEGORÍA: MULTIMEDIA
INSERT INTO productos (
    nombre, descripcion, variantes, precio, precio_minimo, precio_maximo,
    duracion_horas, detalles_adicionales, id_categoria, unidad_medida, tipo_servicio, activo
) VALUES 
('Photobooth Mirror',
    'Cabina de fotos con espejo para momentos divertidos en tu evento',
    '2 Horas: $440, 3 Horas: $530',
    485.00,
    440.00,
    530.00,
    2,
    NULL,
    (SELECT id FROM categorias WHERE nombre = 'Multimedia' LIMIT 1),
    'servicio',
    'servicio',
    TRUE),
('Video 360',
    'Servicio de video 360 grados para capturar momentos únicos',
    '2 Horas con celular del cliente: $150, 2 Horas con código QR: $180',
    165.00,
    150.00,
    180.00,
    2,
    'Incluyen gafas y sombreros. Se descarga un código QR con los videos editados (opción $180)',
    (SELECT id FROM categorias WHERE nombre = 'Multimedia' LIMIT 1),
    'servicio',
    'servicio',
    TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- CATEGORÍA: SHOWS TEMÁTICOS
INSERT INTO productos (
    nombre, descripcion, variantes, precio, precio_minimo, precio_maximo,
    duracion_horas, detalles_adicionales, id_categoria, unidad_medida, tipo_servicio, activo
) VALUES 
('Show de Cabezones',
    'Show con cabezones temáticos: Ferxxo, Bad Bunny, Daddy Yankee, Wisin y Yandel',
    '2 Cabezones: $200, 2 Cabezones + Bailarina + Tambolero: $250',
    225.00,
    200.00,
    250.00,
    NULL,
    NULL,
    (SELECT id FROM categorias WHERE nombre = 'Shows Temáticos' LIMIT 1),
    'servicio',
    'servicio',
    TRUE),
('Show Disney: La Bella y La Bestia',
    'Show temático de Disney con personajes de La Bella y La Bestia',
    'Show 50 minutos (6 personajes): $450, Cobertura 4 horas (7 personajes): $800',
    625.00,
    450.00,
    800.00,
    NULL,
    'Personajes: Lumiere, Din don, Chip (Taza), Sra Pots (tetera), Rosa, Plumet, Armario. Incluye: Recepción de invitados + Opening + Hora Loca + Animador + ensayo con la quinceañera (opción $800)',
    (SELECT id FROM categorias WHERE nombre = 'Shows Temáticos' LIMIT 1),
    'servicio',
    'servicio',
    TRUE),
('Show Alicia en el País de las Maravillas',
    'Show temático con personajes de Alicia en el País de las Maravillas',
    NULL,
    450.00,
    NULL,
    NULL,
    NULL,
    '7 personajes: Reina roja, Conejo, Rey Tiempo, Gato, 2 gorditos. Incluye: 24 globos, Opening - Hora Loca',
    (SELECT id FROM categorias WHERE nombre = 'Shows Temáticos' LIMIT 1),
    'servicio',
    'servicio',
    TRUE),
('Show ¿Dónde están las rubias?',
    'Show temático con personajes de la película',
    NULL,
    250.00,
    NULL,
    NULL,
    NULL,
    'Incluye: 2 rubias, 1 bailarina, Animador, Bufón, 24 globos neón, Integración',
    (SELECT id FROM categorias WHERE nombre = 'Shows Temáticos' LIMIT 1),
    'servicio',
    'servicio',
    TRUE),
('Show Rosa Viviente',
    'Show con personaje de rosa viviente para eventos especiales',
    '1 Hora: $125, 2 Horas: $170',
    147.50,
    125.00,
    170.00,
    1,
    'Incluye: Recepción de invitados, Show, Fotos con el personaje',
    (SELECT id FROM categorias WHERE nombre = 'Shows Temáticos' LIMIT 1),
    'servicio',
    'servicio',
    TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- CATEGORÍA: FOTOGRAFÍA
INSERT INTO productos (
    nombre, descripcion, variantes, precio, precio_minimo, precio_maximo,
    duracion_horas, detalles_adicionales, id_categoria, unidad_medida, tipo_servicio, activo
) VALUES 
('Servicio de Fotografía',
    'Cobertura fotográfica profesional para tu evento',
    '2 Horas: $185, 4 Horas: $315, 6 Horas: $470',
    323.33,
    185.00,
    470.00,
    2,
    '2 Horas: 30 fotos editadas (enlace descargable) + 30 fotos impresas en papel fotográfico + Cajita decorativa de regalo. 4 Horas: 50 fotos editadas (enlace descargable) + Video reel express + 50 fotos impresas + Cajita decorativa. 6 Horas: 80 fotos editadas (enlace descargable) + Video reel 30 segundos + 80 fotos impresas + Cajita decorativa',
    (SELECT id FROM categorias WHERE nombre = 'Fotografía' LIMIT 1),
    'servicio',
    'servicio',
    TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- CATEGORÍA: EFECTOS ESPECIALES
INSERT INTO productos (
    nombre, descripcion, precio,
    id_categoria, unidad_medida, tipo_servicio, activo
) VALUES 
('Luces Frías',
    'Efecto de iluminación con luces frías para ambiente especial',
    130.00,
    (SELECT id FROM categorias WHERE nombre = 'Efectos Especiales' LIMIT 1),
    'servicio',
    'equipo',
    TRUE),
('Humo Bajo',
    'Efecto de humo bajo para crear ambiente y efectos visuales',
    25.00,
    (SELECT id FROM categorias WHERE nombre = 'Efectos Especiales' LIMIT 1),
    'servicio',
    'equipo',
    TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- ============================================================================
-- PAQUETES DEL CATÁLOGO OFICIAL
-- ============================================================================

INSERT INTO planes (nombre, descripcion, precio_base, capacidad_minima, capacidad_maxima, duracion_horas, incluye, activo) VALUES
"""
    
    # Agregar todos los paquetes
    valores_paquetes = []
    for p in paquetes:
        # Escapar comillas simples en el texto
        incluye_escaped = p['incluye'].replace("'", "''").replace('\n', ' ').replace('\r', ' ')
        descripcion_escaped = p['descripcion'].replace("'", "''")
        nombre_escaped = p['nombre'].replace("'", "''")
        
        valores_paquetes.append(f"""('{nombre_escaped}',
    '{descripcion_escaped}',
    {p['precio_base']:.2f},
    {p['capacidad_minima']},
    {p['capacidad_maxima']},
    {p['duracion_horas']},
    '{incluye_escaped[:2000]}',
    TRUE)""")
    
    sql += ',\n'.join(valores_paquetes)
    sql += """
ON DUPLICATE KEY UPDATE nombre=nombre;

-- ============================================================================
-- NOTAS
-- ============================================================================
-- Este archivo contiene todos los datos oficiales del catálogo de Lirios Eventos
-- - Categorías: 18 categorías organizadas
-- - Productos: 16 productos/servicios del catálogo oficial
-- - Paquetes: """ + str(len(paquetes)) + """ paquetes para diferentes capacidades
-- - Salones: Salones oficiales de Lirios Eventos
--
-- NOTA IMPORTANTE: Una vez reservado el evento, en caso de suspender por razones
-- ajenas a nosotros (cuarentena, PANDEMIA, inundaciones, apagones, paralizaciones
-- entre otras de carácter urgente u obligatorio), NO SE HACEN DEVOLUCIONES,
-- se puede reprogramar el evento según la agenda y disponibilidad del salón.
-- ============================================================================
"""
    
    # Guardar archivo
    with open('03_datos_catalogo.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"[OK] Archivo SQL generado: 03_datos_catalogo.sql")
    print(f"   - {len(paquetes)} paquetes")
    print(f"   - {len(salones_unicos)} salones")

if __name__ == "__main__":
    main()

