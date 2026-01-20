# 📦 Instrucciones para Importar Paquetes del Catálogo "50 Personas"

## ✅ ¿Se pueden adaptar los paquetes a la aplicación?

**¡Sí!** Los paquetes del catálogo PDF se pueden adaptar perfectamente a tu aplicación. La aplicación ya tiene toda la estructura necesaria:

- ✅ Tabla `planes` para almacenar paquetes
- ✅ Modelo `PlanModelo` con métodos CRUD
- ✅ Vista `VistaPlanes` para gestionar planes
- ✅ Los planes se pueden asociar a eventos
- ✅ Los planes pueden tener productos asociados

## 📋 Paquetes Disponibles

Del catálogo PDF se han extraído 4 paquetes:

1. **Paquete Cristal** - $1,210.00
   - Precio por persona: $23.00
   - Incluye: Salón, decoración básica, buffet, bebidas, personal de servicio

2. **Paquete Destello** - $1,310.00
   - Precio por persona: $25.00
   - Incluye: Todo lo anterior + 5 arreglos florales + 250 bocaditos de dulce + cortesías

3. **Paquete Luz** - $1,660.00
   - Precio por persona: $32.00
   - Incluye: Todo lo anterior + 2 proteínas + 600 bocaditos (300 dulce + 300 sal)

4. **Paquete Resplandor** - $2,010.00
   - Precio por persona: $39.00
   - Incluye: Todo lo anterior + coctel, degustación, animador, torta, hora loca

## 🚀 Formas de Importar los Paquetes

Hay dos formas de importar los paquetes a tu base de datos:

### Opción 1: Usando el Script SQL (Recomendado)

1. Abre tu cliente MySQL (MySQL Workbench, phpMyAdmin, etc.)
2. Ejecuta el archivo: `04_importar_paquetes_catalogo_50_personas.sql`
3. El script:
   - Creará el salón "Brisas de Lirio" si no existe
   - Insertará los 4 paquetes con toda su información

**Ventajas:**
- Más rápido
- Puedes revisar y modificar el SQL antes de ejecutarlo
- Útil para migraciones o backups

### Opción 2: Usando el Script Python

1. Abre una terminal en la raíz del proyecto
2. Ejecuta:
   ```bash
   python utilidades/importar_paquetes_catalogo.py
   ```

**Ventajas:**
- Usa los modelos de la aplicación (más seguro)
- Verifica si los paquetes ya existen antes de crearlos
- Actualiza paquetes existentes si es necesario
- Muestra logs detallados del proceso

## 📝 Detalles de los Paquetes

Cada paquete incluye:

- **Nombre**: Identificador del paquete
- **Descripción**: Resumen del paquete
- **Precio Base**: Precio total del evento
- **Capacidad**: Mínima y máxima (50 personas para todos)
- **Duración**: 6 horas
- **Incluye**: Descripción detallada de todos los servicios incluidos

## 🎯 Después de Importar

Una vez importados, los paquetes estarán disponibles en:

1. **Gestión de Planes**: Ve a la sección "Planes" en la aplicación para ver, editar o gestionar los paquetes
2. **Crear Eventos**: Al crear un evento, podrás seleccionar uno de estos paquetes
3. **Cotizaciones**: Los paquetes aparecerán en las opciones de cotización

## ⚠️ Nota Importante

El script también crea el salón **"Brisas de Lirio"** si no existe, ya que todos los paquetes están diseñados para este salón específico.

## 🔄 Actualizar Paquetes

Si necesitas actualizar los paquetes en el futuro:

- **Opción SQL**: Modifica el archivo SQL y vuelve a ejecutarlo (usará `ON DUPLICATE KEY UPDATE`)
- **Opción Python**: El script Python verifica si existen y los actualiza automáticamente

## 📞 Información de Contacto (del Catálogo)

- **Teléfonos**: 096 995 3690 / 098 170 9875
- **Dirección**: Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1
- **Email**: lirios.saloneventos@ec

---

**¿Necesitas ayuda?** Revisa los logs en la aplicación o ejecuta el script Python para ver mensajes detallados del proceso.

