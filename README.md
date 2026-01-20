# Sistema de Gestión de Eventos - Lirios Eventos

Sistema integral de gestión para empresas de locales de eventos, desarrollado en Python con Tkinter y MySQL.

---

## 📋 Tabla de Contenidos

1. [Objetivo](#objetivo)
2. [Antecedentes](#antecedentes)
3. [Requerimientos Funcionales](#requerimientos-funcionales)
4. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
5. [Características Principales](#características-principales)
6. [Mejoras Implementadas](#mejoras-implementadas)
7. [Arquitectura del Sistema](#arquitectura-del-sistema)
8. [Instalación y Configuración](#instalación-y-configuración)
9. [Estructura del Proyecto](#estructura-del-proyecto)
10. [Roles y Permisos](#roles-y-permisos)
11. [Metodología de Desarrollo](#metodología-de-desarrollo)
12. [Base de Datos](#base-de-datos)
13. [Integraciones](#integraciones)
14. [Seguridad](#seguridad)
15. [Mantenimiento y Soporte](#mantenimiento-y-soporte)

---

## 🎯 Objetivo

Desarrollar un sistema integral de gestión para **Lirios Eventos** que permita:

- **Centralizar** toda la información de eventos, clientes, productos y servicios
- **Automatizar** procesos de cotización, reserva y seguimiento de eventos
- **Optimizar** la gestión de inventario y recursos disponibles
- **Controlar** pagos, abonos y saldos pendientes de manera eficiente
- **Facilitar** la toma de decisiones mediante reportes y métricas en tiempo real
- **Mejorar** la comunicación con clientes mediante notificaciones automáticas
- **Digitalizar** el catálogo de productos, servicios y paquetes de eventos

El sistema busca reemplazar procesos manuales y hojas de cálculo por una solución integrada que mejore la productividad, reduzca errores y proporcione visibilidad completa del negocio.

---

## 📖 Antecedentes

### Contexto del Negocio

**Lirios Eventos** es una empresa dedicada a la organización y gestión de eventos sociales (bodas, quinceañeros, cumpleaños, etc.) que cuenta con:

- **Múltiples salones** con diferentes capacidades (Brisas de Lirio, Pétalo)
- **Amplio catálogo de servicios**: productos, paquetes predefinidos, shows temáticos, servicios de catering, decoración, entretenimiento
- **Equipo multidisciplinario**: coordinadores, gerentes, personal de servicio
- **Procesos complejos**: desde la cotización inicial hasta la ejecución del evento

### Problemas Identificados

Antes de la implementación del sistema, la empresa enfrentaba:

1. **Gestión manual** de información en hojas de cálculo y documentos físicos
2. **Falta de centralización** de datos de eventos, clientes y productos
3. **Dificultad para rastrear** pagos, abonos y saldos pendientes
4. **Control limitado** de inventario y disponibilidad de recursos
5. **Procesos repetitivos** en cotizaciones y seguimiento de eventos
6. **Catálogo desactualizado** sin integración con el sistema de gestión
7. **Comunicación manual** con clientes sin automatización

### Solución Propuesta

Desarrollo de un sistema de escritorio que integre todas las áreas del negocio en una plataforma única, con:

- Interfaz gráfica intuitiva para usuarios no técnicos
- Base de datos relacional para almacenamiento estructurado
- Sistema de roles y permisos para control de acceso
- Módulos especializados por área funcional
- Integración con servicios externos (WhatsApp, Email, Google Sheets)

---

## ✅ Requerimientos Funcionales

### RF-01: Gestión de Usuarios y Autenticación
- **RF-01.1**: Sistema de autenticación con usuario y contraseña
- **RF-01.2**: Gestión de usuarios con roles (Administrador, Coordinador, Gerente General, Cliente)
- **RF-01.3**: Control de acceso basado en roles
- **RF-01.4**: Registro de acciones en logs del sistema
- **RF-01.5**: Gestión de clientes con información adicional

### RF-02: Gestión de Productos y Servicios
- **RF-02.1**: CRUD completo de productos/servicios
- **RF-02.2**: Categorización de productos (18 categorías)
- **RF-02.3**: Gestión de precios con soporte para variantes y rangos
- **RF-02.4**: Control de stock e inventario
- **RF-02.5**: Campos avanzados: variantes, precio mínimo/máximo, duración, detalles adicionales
- **RF-02.6**: Importación masiva desde catálogo oficial (PDF)

### RF-03: Gestión de Planes y Paquetes
- **RF-03.1**: Creación y gestión de paquetes de eventos
- **RF-03.2**: Configuración de capacidad (mínima y máxima)
- **RF-03.3**: Definición de duración y precios base
- **RF-03.4**: Asociación de productos a planes
- **RF-03.5**: Gestión de 57+ paquetes para diferentes capacidades (20-150 personas)
- **RF-03.6**: Importación desde catálogos PDF oficiales

### RF-04: Gestión de Eventos
- **RF-04.1**: Creación y edición de eventos
- **RF-04.2**: Asignación de planes y productos adicionales
- **RF-04.3**: Seguimiento de estados (cotización, confirmado, en proceso, completado, cancelado)
- **RF-04.4**: Asignación de coordinadores y salones
- **RF-04.5**: Control de fechas, horarios y número de invitados
- **RF-04.6**: Cálculo automático de totales (plan + productos adicionales)
- **RF-04.7**: Gestión de observaciones y notas

### RF-05: Gestión de Pagos
- **RF-05.1**: Registro de abonos y pagos completos
- **RF-05.2**: Múltiples métodos de pago (efectivo, transferencia, tarjeta, cheque)
- **RF-05.3**: Cálculo automático de saldos pendientes
- **RF-05.4**: Registro de reembolsos
- **RF-05.5**: Seguimiento histórico de pagos por evento
- **RF-05.6**: Cálculo automático de total pagado

### RF-06: Gestión de Inventario
- **RF-06.1**: Control de productos solicitados por evento
- **RF-06.2**: Seguimiento de disponibilidad
- **RF-06.3**: Estados: disponible, reservado, en uso, devuelto
- **RF-06.4**: Verificación de disponibilidad por fecha
- **RF-06.5**: Asociación de inventario a eventos

### RF-07: Sistema de Promociones
- **RF-07.1**: Creación de promociones con descuentos (porcentaje o monto fijo)
- **RF-07.2**: Asignación a planes o productos específicos
- **RF-07.3**: Control de vigencia (fechas de inicio y fin)
- **RF-07.4**: Promociones aplicables a todos los productos/planes

### RF-08: Gestión de Salones
- **RF-08.1**: CRUD de salones disponibles
- **RF-08.2**: Configuración de capacidad y ubicación
- **RF-08.3**: Asociación de salones a eventos

### RF-09: Reportes y Métricas
- **RF-09.1**: Resumen de eventos por estado
- **RF-09.2**: Resumen financiero (ingresos, pendientes, cobrado)
- **RF-09.3**: Estadísticas de eventos
- **RF-09.4**: Métricas para toma de decisiones gerenciales

### RF-10: Integraciones Externas
- **RF-10.1**: Integración con WhatsApp para notificaciones
- **RF-10.2**: Integración con Email para comunicaciones
- **RF-10.3**: Integración con Google Sheets/AppSheet para sincronización
- **RF-10.4**: Sistema de notificaciones automáticas

### RF-11: Catálogo Oficial
- **RF-11.1**: Importación de productos desde catálogo PDF
- **RF-11.2**: Importación de paquetes desde catálogos PDF
- **RF-11.3**: Consolidación de datos del catálogo oficial
- **RF-11.4**: Eliminación de datos de prueba/ejemplo

---

## 🔧 Requerimientos No Funcionales

### RNF-01: Rendimiento
- **RNF-01.1**: Tiempo de respuesta de consultas < 2 segundos
- **RNF-01.2**: Soporte para 1000+ eventos simultáneos en base de datos
- **RNF-01.3**: Interfaz gráfica responsiva sin bloqueos

### RNF-02: Escalabilidad
- **RNF-02.1**: Arquitectura modular que permite agregar funcionalidades sin afectar el sistema existente
- **RNF-02.2**: Base de datos diseñada para crecimiento futuro
- **RNF-02.3**: Soporte para múltiples usuarios concurrentes

### RNF-03: Usabilidad
- **RNF-03.1**: Interfaz intuitiva para usuarios no técnicos
- **RNF-03.2**: Navegación clara entre módulos
- **RNF-03.3**: Mensajes de error descriptivos
- **RNF-03.4**: Validación de datos en tiempo real

### RNF-04: Seguridad
- **RNF-04.1**: Autenticación segura con contraseñas hasheadas (SHA256)
- **RNF-04.2**: Control de acceso basado en roles
- **RNF-04.3**: Registro de todas las acciones importantes (auditoría)
- **RNF-04.4**: Protección contra inyección SQL mediante consultas parametrizadas
- **RNF-04.5**: Validación de entrada de datos

### RNF-05: Mantenibilidad
- **RNF-05.1**: Código modular y bien documentado
- **RNF-05.2**: Separación de responsabilidades (Modelo-Vista)
- **RNF-05.3**: Scripts SQL organizados y versionados
- **RNF-05.4**: Logs detallados para debugging

### RNF-06: Portabilidad
- **RNF-06.1**: Compatible con Windows, Linux y macOS
- **RNF-06.2**: Dependencias mínimas y bien documentadas
- **RNF-06.3**: Configuración centralizada

### RNF-07: Confiabilidad
- **RNF-07.1**: Manejo robusto de errores
- **RNF-07.2**: Validación de integridad referencial
- **RNF-07.3**: Transacciones para operaciones críticas
- **RNF-07.4**: Sistema de respaldo de base de datos

### RNF-08: Compatibilidad
- **RNF-08.1**: Python 3.7 o superior
- **RNF-08.2**: MySQL Server 5.7 o superior
- **RNF-08.3**: Compatible con MySQL 8.0+

---

## 🎯 Características Principales

### Módulos Implementados

- ✅ **Gestión de Usuarios** con roles diferenciados (Administrador, Coordinador, Gerente General, Cliente)
- ✅ **Gestión de Eventos** completa (creación, configuración, seguimiento de estado)
- ✅ **Gestión de Productos** con control de inventario y campos avanzados
- ✅ **Gestión de Planes y Paquetes** para eventos (57+ paquetes)
- ✅ **Sistema de Promociones** con descuentos configurables
- ✅ **Control de Pagos y Abonos** con seguimiento de saldos
- ✅ **Gestión de Inventario** asociado a eventos
- ✅ **Gestión de Salones** con capacidades y ubicaciones
- ✅ **Sistema de Reportes** y métricas para gerencia
- ✅ **Integraciones preparadas** para WhatsApp, Google Sheets y Email
- ✅ **Interfaz de escritorio** intuitiva desarrollada en Tkinter
- ✅ **Catálogo oficial** integrado con productos y paquetes reales

---

## 🚀 Mejoras Implementadas

### Versión Actual - Mejoras Recientes

#### 1. Estructura Mejorada de Productos
- **Campos adicionales** para mejor almacenamiento de información:
  - `variantes`: Opciones del producto (ej: "3x3: $350, 4x3: $400")
  - `precio_minimo` y `precio_maximo`: Rangos de precio
  - `duracion_horas`: Duración del servicio
  - `detalles_adicionales`: Información extra sobre qué incluye
  - `tipo_servicio`: Categorización (servicio, equipo, producto, paquete)
- **Migración disponible**: `05_migracion_mejorar_productos.sql`

#### 2. Catálogo Oficial Consolidado
- **57 paquetes** extraídos de catálogos PDF oficiales
- **16 productos/servicios** del catálogo oficial
- **2 salones** oficiales (Brisas de Lirio, Pétalo)
- **18 categorías** organizadas
- **Archivo consolidado**: `03_datos_catalogo.sql`
- **Script de procesamiento**: `utilidades/procesar_todos_catalogos.py`

#### 3. Eliminación de Datos de Prueba
- Removidos productos, planes y salones de ejemplo
- Solo datos oficiales del catálogo
- Archivo `03_datos_ejemplo.sql` contiene solo usuarios de prueba

#### 4. Scripts de Importación
- Script Python para procesar PDFs del catálogo
- Extracción automática de precios, capacidades y descripciones
- Generación automática de SQL consolidado

---

## 🏗️ Arquitectura del Sistema

### Patrón de Diseño

El sistema utiliza una **arquitectura en capas (Layered Architecture)** con separación de responsabilidades:

```
┌─────────────────────────────────────┐
│      CAPA DE PRESENTACIÓN          │
│   (Vistas - Tkinter Interfaces)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      CAPA DE LÓGICA DE NEGOCIO      │
│   (Modelos - Business Logic)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      CAPA DE ACCESO A DATOS         │
│   (Base de Datos - MySQL)           │
└─────────────────────────────────────┘
```

### Componentes Principales

1. **Modelos** (`modelos/`): Lógica de negocio y acceso a datos
2. **Vistas** (`vistas/`): Interfaces gráficas con Tkinter
3. **Utilidades** (`utilidades/`): Scripts y herramientas auxiliares
4. **Integraciones** (`integraciones/`): Módulos para servicios externos
5. **Base de Datos**: MySQL con estructura relacional normalizada

### Principios de Diseño

- **Separación de Responsabilidades**: Cada módulo tiene una función específica
- **Reutilización de Código**: Componentes comunes en utilidades
- **Extensibilidad**: Fácil agregar nuevos módulos sin afectar existentes
- **Mantenibilidad**: Código modular y bien documentado

---

## 📦 Instalación y Configuración

### Requisitos del Sistema

- **Python**: 3.7 o superior
- **MySQL Server**: 5.7 o superior (recomendado 8.0+)
- **Sistema Operativo**: Windows, Linux o macOS
- **Memoria RAM**: Mínimo 4GB recomendado
- **Espacio en disco**: 500MB para aplicación + espacio para base de datos

### Dependencias

Las dependencias se encuentran en `requirements.txt`:

```
mysql-connector-python==8.2.0
python-dotenv==1.0.0
Flask==3.0.0
Flask-CORS==4.0.0
pypdf==6.5.0
```

### Pasos de Instalación

#### 1. Clonar o Descargar el Proyecto

```bash
# Si usas Git
git clone <repository-url>
cd EvolucionLiriosEventos

# O descargar y extraer el proyecto
```

#### 2. Crear Entorno Virtual (Recomendado)

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/macOS
python3 -m venv .venv
source .venv/bin/activate
```

#### 3. Instalar Dependencias

```bash
pip install -r requirements.txt
```

#### 4. Configurar Base de Datos

**4.1. Crear la base de datos MySQL:**

```sql
CREATE DATABASE lirios_eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**4.2. Ejecutar scripts SQL en orden:**

```bash
# Opción A: Usando script Python (Recomendado)
python utilidades/ejecutar_sql.py

# Opción B: Manualmente en MySQL Workbench o cliente MySQL
# Ejecutar en este orden:
# 1. 01_estructura_tablas.sql
# 2. 05_migracion_mejorar_productos.sql (si la BD ya existía)
# 3. 02_triggers_funciones_procedimientos.sql
# 4. 03_datos_ejemplo.sql (usuarios de prueba)
# 5. 03_datos_catalogo.sql (datos oficiales del catálogo)
```

**4.3. Configurar conexión en `config.py`:**

```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'tu_usuario',
    'password': 'tu_contraseña',
    'database': 'lirios_eventos',
    'port': 3306
}
```

#### 5. Ejecutar la Aplicación

```bash
python main.py
```

### Usuarios por Defecto

El sistema incluye usuarios de prueba (en `03_datos_ejemplo.sql`):

- **Administrador**: 
  - Usuario: `admin`
  - Contraseña: `admin123`
- **Gerente General**: 
  - Usuario: `gerente`
  - Contraseña: `gerente123`
- **Coordinadores**: 
  - Usuario: `coordinador1` / `coordinador2`
  - Contraseña: `coordinador123`

> **⚠️ IMPORTANTE**: Para producción, cambia todas las contraseñas por defecto. Las contraseñas están hasheadas con SHA256 en la base de datos.

---

## 📁 Estructura del Proyecto

```
EvolucionLiriosEventos/
│
├── main.py                          # Punto de entrada de la aplicación
├── config.py                        # Configuración de base de datos
├── requirements.txt                 # Dependencias del proyecto
│
├── 01_estructura_tablas.sql        # Estructura de tablas de la BD
├── 02_triggers_funciones_procedimientos.sql  # Triggers y procedimientos
├── 03_datos_ejemplo.sql            # Usuarios de ejemplo
├── 03_datos_catalogo.sql            # Datos oficiales del catálogo
├── 05_migracion_mejorar_productos.sql  # Migración de campos de productos
│
├── modelos/                          # Capa de lógica de negocio
│   ├── __init__.py
│   ├── base_datos.py                # Conexión y operaciones MySQL
│   ├── autenticacion.py             # Sistema de autenticación
│   ├── usuario_modelo.py           # Gestión de usuarios
│   ├── cliente_modelo.py            # Gestión de clientes
│   ├── producto_modelo.py           # Gestión de productos
│   ├── categoria_modelo.py          # Gestión de categorías
│   ├── evento_modelo.py             # Gestión de eventos
│   ├── plan_modelo.py               # Gestión de planes/paquetes
│   ├── promocion_modelo.py          # Gestión de promociones
│   ├── pago_modelo.py               # Gestión de pagos
│   ├── inventario_modelo.py         # Gestión de inventario
│   ├── salon_modelo.py              # Gestión de salones
│   └── tipo_evento_modelo.py        # Gestión de tipos de evento
│
├── vistas/                           # Capa de presentación
│   ├── __init__.py
│   ├── login.py                     # Ventana de inicio de sesión
│   ├── ventana_principal.py         # Ventana principal con menú
│   └── modulos/                     # Módulos de interfaz
│       ├── productos_vista.py       # Gestión de productos
│       ├── eventos_vista.py         # Gestión de eventos
│       ├── planes_vista.py           # Gestión de planes
│       ├── promociones_vista.py     # Gestión de promociones
│       ├── pagos_vista.py           # Gestión de pagos
│       ├── inventario_vista.py      # Gestión de inventario
│       ├── usuarios_vista.py        # Gestión de usuarios
│       ├── clientes_vista.py        # Gestión de clientes
│       ├── categorias_vista.py      # Gestión de categorías
│       ├── salones_vista.py         # Gestión de salones
│       └── reportes_vista.py        # Reportes y métricas
│
├── utilidades/                       # Utilidades y scripts
│   ├── __init__.py
│   ├── logger.py                    # Sistema de logging
│   ├── ventanas.py                  # Utilidades de ventanas
│   ├── widgets_fecha.py            # Widgets de fecha
│   ├── ejecutar_sql.py              # Ejecutor de scripts SQL
│   ├── crear_usuario.py             # Script para crear usuarios
│   ├── configurar_email.py          # Configuración de email
│   ├── procesar_todos_catalogos.py  # Procesador de catálogos PDF
│   ├── importar_productos_catalogo.py  # Importador de productos
│   ├── importar_paquetes_catalogo.py   # Importador de paquetes
│   └── PLANES Y PRODUCTOS/          # Catálogos PDF oficiales
│       ├── PRODUCTOS Y SERVICIOS.pdf
│       ├── PAQUETES 20 personas.pdf
│       ├── PAQUETES 30 personas.pdf
│       └── ... (más PDFs)
│
├── integraciones/                    # Módulos de integración externa
│   ├── __init__.py
│   ├── whatsapp.py                  # Integración WhatsApp
│   ├── email.py                     # Integración Email
│   ├── google_sheets.py             # Integración Google Sheets
│   └── notificaciones_automaticas.py # Sistema de notificaciones
│
├── api/                              # API REST (opcional)
│   ├── __init__.py
│   ├── app.py                       # Aplicación Flask
│   ├── eventos_api.py               # Endpoints de eventos
│   └── README.md                    # Documentación de API
│
└── logs/                            # Archivos de log
    └── YYYY-MM-DD.txt               # Logs diarios
```

---

## 👥 Roles y Permisos

### Administrador
**Acceso completo al sistema**

- ✅ Gestión completa de productos, planes y promociones
- ✅ Gestión de inventario
- ✅ Gestión de usuarios y clientes
- ✅ Configuración de eventos
- ✅ Visualización de pagos y abonos
- ✅ Acceso a reportes completos
- ✅ Gestión de categorías y salones
- ✅ Configuración del sistema

### Coordinador
**Enfoque en operaciones de eventos**

- ✅ Visualización de eventos asignados
- ✅ Asignación de recursos (mesoneros, DJs, decoración, catering)
- ✅ Confirmación de disponibilidad logística
- ✅ Actualización de estado de tareas del evento
- ✅ Gestión de inventario para eventos asignados
- ✅ Registro de observaciones y notas

### Gerente General
**Enfoque en supervisión y reportes**

- ✅ Visualización de reportes generales
- ✅ Consulta de métricas de eventos y pagos
- ✅ Supervisión del estado global de la plataforma
- ✅ Análisis de ingresos y pendientes
- ✅ Visualización de todos los eventos

### Cliente
**Acceso limitado a su información**

- ✅ Consulta de información de su evento
- ✅ Visualización del estado del evento
- ✅ Realización de abonos
- ✅ Consulta de saldo pendiente
- ✅ Revisión y confirmación de pendientes (decoración, colores, menú)

---

## 🔧 Funcionalidades por Módulo

### Gestión de Productos
- **CRUD completo** de productos/servicios
- **Control de stock** disponible
- **Categorización** en 18 categorías
- **Gestión de precios** con soporte para:
  - Precio único
  - Rangos de precio (mínimo/máximo)
  - Variantes y opciones
- **Campos avanzados**:
  - Duración en horas
  - Detalles adicionales
  - Tipo de servicio (servicio, equipo, producto, paquete)
- **Importación** desde catálogo oficial PDF

### Gestión de Eventos
- **Creación y configuración** de eventos
- **Asignación de planes** y productos adicionales
- **Seguimiento de estado**: cotización → confirmado → en proceso → completado/cancelado
- **Asignación de coordinadores** y salones
- **Control de fechas** y horarios
- **Cálculo automático** de totales
- **Gestión de observaciones** y notas

### Gestión de Planes
- **Creación de paquetes** de eventos
- **Configuración de capacidad** (mínima y máxima)
- **Asociación de productos** a planes
- **Definición de duración** y precios base
- **57+ paquetes** para diferentes capacidades (20-150 personas)
- **Importación** desde catálogos PDF oficiales

### Gestión de Promociones
- **Creación de promociones** con descuentos:
  - Por porcentaje
  - Por monto fijo
- **Asignación** a planes o productos específicos
- **Control de vigencia** (fechas de inicio y fin)
- **Promociones aplicables** a todos

### Gestión de Pagos
- **Registro de abonos** y pagos completos
- **Múltiples métodos de pago**:
  - Efectivo
  - Transferencia bancaria
  - Tarjeta de crédito/débito
  - Cheque
- **Cálculo automático** de saldos pendientes
- **Registro de reembolsos**
- **Seguimiento histórico** de pagos por evento
- **Cálculo automático** de total pagado

### Gestión de Inventario
- **Control de productos** solicitados por evento
- **Seguimiento de disponibilidad**
- **Estados**: disponible, reservado, en uso, devuelto
- **Verificación de disponibilidad** por fecha
- **Asociación** de inventario a eventos

### Reportes y Métricas
- **Resumen de eventos** por estado
- **Resumen financiero**:
  - Ingresos totales
  - Pendientes por cobrar
  - Total cobrado
- **Estadísticas de eventos**
- **Métricas** para toma de decisiones gerenciales

---

## 🛠️ Metodología de Desarrollo

### Enfoque Metodológico

El proyecto utiliza una **metodología ágil adaptada** con las siguientes características:

#### Fases del Desarrollo

1. **Análisis y Diseño**
   - Identificación de requerimientos funcionales y no funcionales
   - Diseño de base de datos (modelo relacional)
   - Diseño de arquitectura del sistema
   - Definición de casos de uso por rol

2. **Desarrollo Iterativo**
   - Desarrollo por módulos funcionales
   - Implementación incremental de funcionalidades
   - Pruebas continuas durante el desarrollo
   - Refactorización cuando es necesario

3. **Integración y Pruebas**
   - Integración de módulos
   - Pruebas de funcionalidad
   - Pruebas de integración
   - Validación con usuarios

4. **Despliegue y Mantenimiento**
   - Despliegue en ambiente de producción
   - Documentación técnica y de usuario
   - Soporte y mantenimiento continuo

### Estándares de Código

- **Nomenclatura**: 
  - Clases: PascalCase (`VentanaPrincipal`)
  - Funciones/Métodos: snake_case (`crear_evento`)
  - Variables: snake_case (`nombre_usuario`)
  - Constantes: UPPER_CASE (`DB_CONFIG`)

- **Documentación**:
  - Docstrings en todas las clases y métodos
  - Comentarios en código complejo
  - Documentación de funciones públicas

- **Estructura**:
  - Un archivo por clase principal
  - Separación de responsabilidades
  - Código modular y reutilizable

### Control de Versiones

- Uso de Git para control de versiones
- Commits descriptivos
- Branching strategy: main/develop/feature

### Gestión de Base de Datos

- **Scripts SQL organizados**:
  - `01_estructura_tablas.sql`: Estructura base
  - `02_triggers_funciones_procedimientos.sql`: Lógica de BD
  - `03_datos_ejemplo.sql`: Datos de prueba
  - `03_datos_catalogo.sql`: Datos oficiales
  - `05_migracion_mejorar_productos.sql`: Migraciones

- **Versionado de esquema**: Migraciones numeradas
- **Backups**: Scripts de respaldo disponibles

### Testing

- **Pruebas manuales** por módulo
- **Validación de datos** en formularios
- **Pruebas de integración** entre módulos
- **Verificación de permisos** por rol

### Documentación

- **README.md**: Documentación principal
- **Documentación técnica**: En archivos `.md` específicos
- **Comentarios en código**: Explicación de lógica compleja
- **Logs del sistema**: Para debugging y auditoría

---

## 🗄️ Base de Datos

### Estructura Principal

#### Tablas Core

- **usuarios**: Usuarios del sistema con roles
- **clientes**: Información adicional de clientes
- **categorias**: Categorías de productos
- **productos**: Productos/servicios con campos avanzados
- **salones**: Salones disponibles
- **planes**: Paquetes de eventos
- **plan_productos**: Relación muchos a muchos (planes ↔ productos)
- **eventos**: Eventos registrados
- **evento_productos**: Productos adicionales por evento
- **pagos**: Registro de pagos y abonos
- **inventario**: Control de inventario por evento
- **promociones**: Promociones y descuentos

#### Características de la Base de Datos

- **Motor**: MySQL InnoDB
- **Charset**: utf8mb4 (soporte completo de caracteres especiales)
- **Integridad Referencial**: Foreign keys con acciones ON DELETE/UPDATE
- **Índices**: Optimizados para consultas frecuentes
- **Triggers**: Para cálculos automáticos y validaciones
- **Procedimientos Almacenados**: Para operaciones complejas

### Datos del Catálogo

El sistema incluye datos oficiales del catálogo:

- **18 categorías** de productos
- **16 productos/servicios** del catálogo oficial
- **57 paquetes** para diferentes capacidades (20-150 personas)
- **2 salones** oficiales (Brisas de Lirio, Pétalo)

### Migraciones

- **05_migracion_mejorar_productos.sql**: Agrega campos avanzados a productos
  - `variantes`, `precio_minimo`, `precio_maximo`
  - `duracion_horas`, `detalles_adicionales`, `tipo_servicio`

---

## 🔌 Integraciones

### WhatsApp
- Envío de notificaciones automáticas
- Confirmaciones de eventos
- Recordatorios de pagos pendientes
- **Estado**: Preparado, requiere configuración de API

### Email
- Notificaciones por correo electrónico
- Confirmaciones de eventos
- Recordatorios y alertas
- **Estado**: Configurable mediante `utilidades/configurar_email.py`

### Google Sheets / AppSheet
- Sincronización de datos de eventos
- Sincronización de pagos
- Visualización en tiempo real
- **Estado**: Preparado, requiere configuración de API

### Sistema de Notificaciones
- Notificaciones automáticas por eventos
- Alertas de pagos pendientes
- Recordatorios programados
- **Estado**: Implementado

> **Nota**: Las integraciones requieren configuración adicional. Consulta la documentación específica de cada módulo.

---

## 🔒 Seguridad

### Autenticación
- **Contraseñas hasheadas** con SHA256
- **Sesiones** controladas por usuario
- **Timeout** de sesión (configurable)

### Autorización
- **Control de acceso** basado en roles
- **Permisos granulares** por módulo
- **Validación** de permisos en cada operación

### Protección de Datos
- **Consultas parametrizadas** (protección contra SQL Injection)
- **Validación de entrada** de datos
- **Sanitización** de datos antes de almacenar

### Auditoría
- **Registro de acciones** importantes en logs
- **Trazabilidad** de cambios en datos críticos
- **Logs diarios** en archivos separados

---

## 📊 Mejoras Implementadas

### Versión Actual

#### 1. Estructura Mejorada de Productos
- Campos adicionales para almacenar información completa del catálogo
- Soporte para variantes, rangos de precio y duración
- Mejor categorización con tipo de servicio

#### 2. Catálogo Oficial Integrado
- 57 paquetes extraídos de PDFs oficiales
- 16 productos/servicios del catálogo
- Eliminación de datos de prueba
- Script automatizado para procesar catálogos

#### 3. Consolidación de Datos
- Un solo archivo SQL con todos los datos oficiales
- INSERTs unificados por tipo de dato
- Organización clara y mantenible

---

## 🚀 Uso del Sistema

### Iniciar la Aplicación

```bash
python main.py
```

### Flujo Principal

1. **Login**: Ingresar con usuario y contraseña
2. **Menú Principal**: Seleccionar módulo según rol
3. **Operaciones**: Realizar operaciones según permisos
4. **Reportes**: Consultar métricas y reportes

### Operaciones Comunes

#### Crear un Evento
1. Ir a módulo "Eventos"
2. Click en "Nuevo Evento"
3. Seleccionar cliente, salón y plan
4. Agregar productos adicionales si es necesario
5. Guardar evento

#### Registrar un Pago
1. Ir a módulo "Pagos"
2. Seleccionar evento
3. Ingresar monto y método de pago
4. Registrar pago

#### Consultar Reportes
1. Ir a módulo "Reportes" (solo Gerente/Administrador)
2. Seleccionar tipo de reporte
3. Ver métricas y estadísticas

---

## 📝 Notas Importantes

- ⚠️ **MySQL debe estar ejecutándose** antes de iniciar la aplicación
- ⚠️ **Configurar `config.py`** con credenciales correctas de MySQL
- ⚠️ **Ejecutar scripts SQL en orden** para crear la base de datos correctamente
- ⚠️ **Cambiar contraseñas por defecto** en producción
- ✅ El sistema registra todas las acciones importantes en logs
- ✅ Los campos marcados con * son obligatorios en formularios

---

## 🔄 Mantenimiento y Soporte

### Actualización del Catálogo

Para actualizar productos o paquetes desde PDFs:

```bash
python utilidades/procesar_todos_catalogos.py
```

Esto regenera el archivo `03_datos_catalogo.sql` con los datos más recientes.

### Backup de Base de Datos

Scripts disponibles:
- `backup_base_datos.bat` (Windows)
- `backup_base_datos.ps1` (PowerShell)

### Logs del Sistema

Los logs se guardan en `logs/YYYY-MM-DD.txt` con:
- Acciones de usuarios
- Errores del sistema
- Operaciones importantes

### Verificación del Sistema

Scripts de verificación disponibles en `utilidades/`:
- `verificar_bd.py`: Verifica estructura de BD
- `verificar_productos.py`: Verifica productos
- `verificar_eventos.py`: Verifica eventos
- `verificar_pagos.py`: Verifica pagos

---

## 📞 Soporte y Contacto

Para más información o soporte técnico:

- **Documentación técnica**: Revisar archivos `.md` en el proyecto
- **Logs del sistema**: Revisar archivos en `logs/`
- **Contacto**: Consultar al equipo de desarrollo

---

## 📄 Licencia

Este proyecto es de **uso interno** para Lirios Eventos.

---

## 🔐 Credenciales de Acceso

### Usuarios de Prueba

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Gerente General:**
- Usuario: `gerente`
- Contraseña: `gerente123`

> **⚠️ IMPORTANTE**: Cambiar todas las contraseñas en producción.

---

## 📚 Documentación Adicional

- `FLUJO_INICIO_APLICACION.md`: Flujo detallado de inicio
- `DIAGRAMA_FLUJO_INICIO.md`: Diagramas de flujo
- `DOCUMENTACION_TOTAL_PAGADO.md`: Documentación de cálculos
- `INSTRUCCIONES_IMPORTAR_PRODUCTOS.md`: Guía de importación
- `README_ARCHIVOS_SQL.md`: Documentación de scripts SQL

---

**Versión del Sistema**: 2.0  
**Última Actualización**: Enero 2025  
**Desarrollado para**: Lirios Eventos
