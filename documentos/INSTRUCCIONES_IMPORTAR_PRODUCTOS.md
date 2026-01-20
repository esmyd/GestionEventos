# 📦 Instrucciones para Importar Productos del Catálogo de Servicios

## ✅ Mejoras Realizadas en la Estructura de Productos

La estructura de productos ha sido mejorada para almacenar mejor la información del catálogo de servicios. Se han agregado los siguientes campos:

### Nuevos Campos

1. **`detalles_adicionales`** (TEXT)
   - Información adicional del producto
   - Ejemplo: "Incluye: Robot LED, Tambolero, Coneja o Bola Disco"

2. **`variantes`** (TEXT)
   - Variantes u opciones del producto
   - Ejemplo: "3x3: $350, 4x3: $400, 5x4: $550"

3. **`precio_minimo`** (DECIMAL)
   - Precio mínimo del producto/servicio
   - Útil para productos con rangos de precio

4. **`precio_maximo`** (DECIMAL)
   - Precio máximo del producto/servicio
   - Útil para productos con rangos de precio

5. **`duracion_horas`** (INT)
   - Duración del servicio en horas
   - Ejemplo: 2, 3, 4, 6 horas

6. **`tipo_servicio`** (ENUM)
   - Tipo de producto/servicio
   - Valores: 'servicio', 'equipo', 'producto', 'paquete', 'otro'

### Campos Mejorados

- **`descripcion`**: Ahora tiene comentario más descriptivo
- **`precio`**: Precio base (o precio único si no hay variantes)
- **`unidad_medida`**: Comentario mejorado con ejemplos

## 📋 Productos del Catálogo

Se han identificado y organizado los siguientes productos del catálogo:

### Animación
- **Animador / Maestro de Ceremonia** - $150.00
- **Hora Loca** - $230.00

### DJ y Música
- **Servicio DJ Todo el Evento** - $150.00
- **Música** (Mariachis, Violinista, Banda Musical, Cantante) - Consultar precios

### Iluminación
- **Pista LED** - $350-$550 (variantes: 3x3, 4x3, 5x4)
- **Túnel LED** - $250.00

### Multimedia
- **Photobooth Mirror** - $440-$530 (2-3 horas)
- **Video 360** - $150-$180 (2 horas)
- **Servicio de Fotografía** - $185-$470 (2-6 horas)

### Shows Temáticos
- **Show Disney: La Bella y La Bestia** - $450-$800
- **Show Alicia en el País de las Maravillas** - $450.00
- **Show ¿Dónde están las rubias?** - $250.00
- **Show Rosa Viviente** - $125-$170 (1-2 horas)
- **Show de Cabezones** - $200-$250

### Efectos Especiales
- **Luces Frías** - $130.00
- **Humo Bajo** - $25.00

## 🚀 Formas de Importar los Productos

### Opción 1: Usando el Script SQL (Recomendado)

**Paso 1:** Asegúrate de tener la estructura mejorada
```sql
-- Si ya tienes la base de datos creada, ejecuta primero:
-- 05_migracion_mejorar_productos.sql
```

**Paso 2:** Importa los productos
```sql
-- Ejecuta el archivo:
-- 06_importar_productos_catalogo_servicios.sql
```

**Ventajas:**
- Más rápido
- Puedes revisar y modificar el SQL antes de ejecutarlo
- Útil para migraciones o backups

### Opción 2: Usando el Script Python

1. Abre una terminal en la raíz del proyecto
2. Ejecuta:
   ```bash
   python utilidades/importar_productos_catalogo.py
   ```

**Ventajas:**
- Usa los modelos de la aplicación (más seguro)
- Verifica si los productos ya existen antes de crearlos
- Actualiza productos existentes si es necesario
- Muestra logs detallados del proceso
- Crea categorías automáticamente si no existen

## 📝 Estructura de la Base de Datos

### Si creas la base de datos desde cero:

La estructura base (`01_estructura_tablas.sql`) ya incluye todos los campos mejorados, así que no necesitas ejecutar la migración.

### Si ya tienes la base de datos:

Ejecuta primero la migración:
```sql
-- 05_migracion_mejorar_productos.sql
```

Esto agregará los nuevos campos a tu tabla existente sin perder datos.

## 🎯 Después de Importar

Una vez importados, los productos estarán disponibles en:

1. **Gestión de Productos**: Ve a la sección "Productos" en la aplicación para ver, editar o gestionar los productos
2. **Crear Eventos**: Al crear un evento, podrás agregar estos productos
3. **Cotizaciones**: Los productos aparecerán en las opciones de cotización

## 📊 Categorías Creadas

El script crea automáticamente las siguientes categorías si no existen:

- **Animación**: Servicios de animación y entretenimiento
- **Efectos Especiales**: Efectos de luces, humo y ambiente
- **Shows Temáticos**: Shows y presentaciones temáticas
- **Multimedia**: Servicios de video, fotografía y multimedia

Las categorías existentes (DJ, Iluminación, Fotografía) se reutilizan.

## 💡 Ejemplos de Uso de los Nuevos Campos

### Producto con Variantes (Pista LED)
```sql
variantes: "3x3: $350, 4x3: $400, 5x4: $550"
precio_minimo: 350.00
precio_maximo: 550.00
precio: 400.00 (promedio)
```

### Producto con Duración (Photobooth)
```sql
duracion_horas: 2
variantes: "2 Horas: $440, 3 Horas: $530"
precio_minimo: 440.00
precio_maximo: 530.00
```

### Producto con Detalles Adicionales (Hora Loca)
```sql
detalles_adicionales: "Incluye: Robot LED, Tambolero, Coneja o Bola Disco"
```

## ⚠️ Notas Importantes

1. **Precios**: Los precios en el catálogo están en formato ecuatoriano (usando coma como separador decimal). El script los convierte al formato estándar de base de datos.

2. **Productos sin Precio**: Algunos productos (como "Música") no tienen precio fijo y requieren consulta. Estos se importan con `precio = NULL`.

3. **Actualización**: Si ejecutas el script múltiples veces, los productos existentes se actualizarán en lugar de duplicarse.

4. **Categorías**: Las categorías se crean automáticamente si no existen, pero se reutilizan si ya están en la base de datos.

## 🔄 Actualizar Productos

Si necesitas actualizar los productos en el futuro:

- **Opción SQL**: Modifica el archivo SQL y vuelve a ejecutarlo (usará `ON DUPLICATE KEY UPDATE`)
- **Opción Python**: El script Python verifica si existen y los actualiza automáticamente

## 📞 Información de Contacto (del Catálogo)

- **Teléfonos**: 096 995 3690 / 098 170 9875
- **Dirección**: Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1

---

**¿Necesitas ayuda?** Revisa los logs en la aplicación o ejecuta el script Python para ver mensajes detallados del proceso.

