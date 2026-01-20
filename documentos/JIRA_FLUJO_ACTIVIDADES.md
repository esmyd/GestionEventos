# Flujo de Actividades para Jira - Sistema de Gestión de Eventos Lirios

## Estructura de Jerarquía Jira
- **Epic** → **Story (User Story)** → **Task** → **Sub-task**

---

## 📋 EPIC 1: INFRAESTRUCTURA Y BASE DE DATOS

### Story 1.1: Diseño e Implementación de Base de Datos

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 13 puntos  
**Componentes**: Base de Datos, Backend  
**Labels**: database, infrastructure, core

**Descripción**:  
Como desarrollador, necesito diseñar e implementar la estructura completa de la base de datos MySQL para soportar todas las funcionalidades del sistema.

**Criterios de Aceptación**:
- Tablas principales creadas con relaciones correctas
- Foreign keys y restricciones de integridad implementadas
- Índices optimizados para consultas frecuentes
- Scripts de migración organizados

#### Task 1.1.1: Crear Estructura de Tablas Principales
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 1.1.1.1**: Crear tabla usuarios (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 1.1.1.2**: Crear tabla clientes (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 1.1.1.3**: Crear tabla categorias (Prioridad: High, Estimación: 1 punto)
- **Sub-task 1.1.1.4**: Crear tabla productos (Prioridad: Highest, Estimación: 2 puntos)

#### Task 1.1.2: Crear Tablas de Eventos y Relacionadas
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 1.1.2.1**: Crear tabla salones (Prioridad: High, Estimación: 1 punto)
- **Sub-task 1.1.2.2**: Crear tabla planes (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 1.1.2.3**: Crear tabla eventos (Prioridad: Highest, Estimación: 2 puntos)

#### Task 1.1.3: Crear Tablas de Transacciones
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 1.1.3.1**: Crear tabla pagos (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 1.1.3.2**: Crear tabla inventario (Prioridad: High, Estimación: 1 punto)
- **Sub-task 1.1.3.3**: Crear tabla promociones (Prioridad: Medium, Estimación: 1 punto)

#### Task 1.1.4: Implementar Triggers y Procedimientos Almacenados
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 1.1.4.1**: Crear trigger para actualizar saldo de eventos al insertar pago (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 1.1.4.2**: Crear trigger para actualizar saldo al eliminar pago (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 1.1.4.3**: Crear procedimientos almacenados para cálculos complejos (Prioridad: Medium, Estimación: 1 punto)

---

### Story 1.2: Sistema de Conexión y Gestión de Base de Datos

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 5 puntos  
**Componentes**: Backend, Infrastructure  
**Labels**: database, connection, core

**Descripción**:  
Como desarrollador, necesito una clase base para gestionar conexiones y operaciones con MySQL.

**Criterios de Aceptación**:
- Clase BaseDatos con métodos para CRUD
- Manejo de errores y reconexión automática
- Consultas parametrizadas para seguridad

#### Task 1.2.1: Implementar Clase BaseDatos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 1.2.1.1**: Implementar método conectar() (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 1.2.1.2**: Implementar método ejecutar_consulta() (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 1.2.1.3**: Implementar método obtener_todos() (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 1.2.1.4**: Implementar método obtener_uno() (Prioridad: Highest, Estimación: 1 punto)

---

## 📋 EPIC 2: AUTENTICACIÓN Y SEGURIDAD

### Story 2.1: Sistema de Autenticación

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 8 puntos  
**Componentes**: Security, Authentication  
**Labels**: security, authentication, core

**Descripción**:  
Como usuario, necesito autenticarme en el sistema con usuario y contraseña para acceder a las funcionalidades según mi rol.

**Criterios de Aceptación**:
- Login con validación de credenciales
- Hash de contraseñas con SHA256
- Gestión de sesión de usuario
- Control de acceso por roles

#### Task 2.1.1: Implementar Modelo de Autenticación
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 2.1.1.1**: Implementar método validar_credenciales() (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 2.1.1.2**: Implementar hash de contraseñas (Prioridad: Highest, Estimación: 1 punto)

#### Task 2.1.2: Implementar Vista de Login
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 2.1.2.1**: Crear interfaz de login con Tkinter (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 2.1.2.2**: Implementar validación de campos (Prioridad: High, Estimación: 1 punto)

#### Task 2.1.3: Sistema de Roles y Permisos
**Tipo**: Task  
**Estimación**: 2 puntos

**Subtareas**:
- **Sub-task 2.1.3.1**: Implementar control de acceso por roles (Prioridad: Highest, Estimación: 2 puntos)

---

## 📋 EPIC 3: GESTIÓN DE USUARIOS

### Story 3.1: CRUD de Usuarios

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 8 puntos  
**Componentes**: Users Management  
**Labels**: users, crud, admin

**Descripción**:  
Como administrador, necesito gestionar usuarios del sistema (crear, editar, eliminar, listar) con diferentes roles.

**Criterios de Aceptación**:
- Crear usuarios con rol asignado
- Editar información de usuarios
- Listar usuarios con filtros
- Desactivar usuarios (no eliminar físicamente)

#### Task 3.1.1: Implementar Modelo de Usuarios
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 3.1.1.1**: Implementar crear_usuario() (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 3.1.1.2**: Implementar obtener_usuario_por_id() (Prioridad: High, Estimación: 1 punto)
- **Sub-task 3.1.1.3**: Implementar actualizar_usuario() (Prioridad: High, Estimación: 1 punto)
- **Sub-task 3.1.1.4**: Implementar eliminar_usuario() (Prioridad: High, Estimación: 1 punto)

#### Task 3.1.2: Implementar Vista de Usuarios
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 3.1.2.1**: Crear interfaz de listado de usuarios (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 3.1.2.2**: Crear formulario de creación/edición (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 3.1.2.3**: Implementar validaciones de formulario (Prioridad: High, Estimación: 1 punto)

---

## 📋 EPIC 4: GESTIÓN DE CLIENTES

### Story 4.1: CRUD de Clientes

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 5 puntos  
**Componentes**: Clients Management  
**Labels**: clients, crud

**Descripción**:  
Como usuario del sistema, necesito gestionar la información de clientes (crear, editar, eliminar, buscar).

**Criterios de Aceptación**:
- Crear clientes con información completa
- Editar datos de clientes
- Buscar clientes por nombre, teléfono, email
- Listar todos los clientes

#### Task 4.1.1: Implementar Modelo de Clientes
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 4.1.1.1**: Implementar crear_cliente() (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 4.1.1.2**: Implementar obtener_cliente_por_id() (Prioridad: High, Estimación: 1 punto)
- **Sub-task 4.1.1.3**: Implementar buscar_clientes() (Prioridad: High, Estimación: 1 punto)

#### Task 4.1.2: Implementar Vista de Clientes
**Tipo**: Task  
**Estimación**: 2 puntos

**Subtareas**:
- **Sub-task 4.1.2.1**: Crear interfaz de gestión de clientes (Prioridad: Highest, Estimación: 2 puntos)

---

## 📋 EPIC 5: GESTIÓN DE PRODUCTOS Y SERVICIOS

### Story 5.1: CRUD de Productos

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 13 puntos  
**Componentes**: Products Management  
**Labels**: products, crud, inventory

**Descripción**:  
Como administrador, necesito gestionar productos y servicios del catálogo con información completa (precios, variantes, categorías).

**Criterios de Aceptación**:
- Crear productos con campos avanzados (variantes, precio min/max, duración)
- Editar productos existentes
- Listar productos por categoría
- Control de stock

#### Task 5.1.1: Implementar Modelo de Productos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 5.1.1.1**: Implementar crear_producto() con campos avanzados (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 5.1.1.2**: Implementar obtener_producto_por_id() (Prioridad: High, Estimación: 1 punto)
- **Sub-task 5.1.1.3**: Implementar actualizar_producto() (Prioridad: High, Estimación: 2 puntos)

#### Task 5.1.2: Implementar Vista de Productos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 5.1.2.1**: Crear interfaz de listado de productos (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 5.1.2.2**: Crear formulario de creación/edición con campos avanzados (Prioridad: Highest, Estimación: 3 puntos)

#### Task 5.1.3: Importación desde Catálogo PDF
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 5.1.3.1**: Crear script para procesar PDF de productos (Prioridad: Medium, Estimación: 3 puntos)

---

### Story 5.2: Gestión de Categorías

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 5 puntos  
**Componentes**: Products Management  
**Labels**: categories, crud

**Descripción**:  
Como administrador, necesito gestionar categorías de productos (crear, editar, eliminar).

**Criterios de Aceptación**:
- Crear categorías
- Editar categorías
- Eliminar categorías (físicamente si no hay productos, desactivar si hay productos)
- Listar categorías

#### Task 5.2.1: Implementar Modelo de Categorías
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 5.2.1.1**: Implementar CRUD de categorías (Prioridad: High, Estimación: 3 puntos)

#### Task 5.2.2: Implementar Vista de Categorías
**Tipo**: Task  
**Estimación**: 2 puntos

**Subtareas**:
- **Sub-task 5.2.2.1**: Crear interfaz de gestión de categorías (Prioridad: High, Estimación: 2 puntos)

---

## 📋 EPIC 6: GESTIÓN DE SALONES

### Story 6.1: CRUD de Salones

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 5 puntos  
**Componentes**: Venues Management  
**Labels**: salons, venues, crud

**Descripción**:  
Como administrador, necesito gestionar los salones disponibles (crear, editar, eliminar, ver disponibilidad).

**Criterios de Aceptación**:
- Crear salones con capacidad y ubicación
- Editar información de salones
- Eliminar salones (físicamente si no hay eventos, desactivar si hay eventos)
- Verificar disponibilidad por fecha

#### Task 6.1.1: Implementar Modelo de Salones
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 6.1.1.1**: Implementar CRUD de salones (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 6.1.1.2**: Implementar verificar_disponibilidad() (Prioridad: High, Estimación: 1 punto)

#### Task 6.1.2: Implementar Vista de Salones
**Tipo**: Task  
**Estimación**: 2 puntos

**Subtareas**:
- **Sub-task 6.1.2.1**: Crear interfaz de gestión de salones (Prioridad: High, Estimación: 2 puntos)

---

## 📋 EPIC 7: GESTIÓN DE PLANES Y PAQUETES

### Story 7.1: CRUD de Planes/Paquetes

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 13 puntos  
**Componentes**: Packages Management  
**Labels**: plans, packages, crud

**Descripción**:  
Como administrador, necesito gestionar los paquetes de eventos con diferentes capacidades y precios.

**Criterios de Aceptación**:
- Crear paquetes con capacidad, precio y descripción
- Asociar productos a paquetes
- Editar paquetes existentes
- Listar paquetes por capacidad o salón

#### Task 7.1.1: Implementar Modelo de Planes
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 7.1.1.1**: Implementar crear_plan() (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 7.1.1.2**: Implementar asociar_producto_a_plan() (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 7.1.1.3**: Implementar obtener_plan_por_id() (Prioridad: High, Estimación: 1 punto)

#### Task 7.1.2: Implementar Vista de Planes
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 7.1.2.1**: Crear interfaz de listado de planes (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 7.1.2.2**: Crear formulario de creación/edición (Prioridad: Highest, Estimación: 3 puntos)

#### Task 7.1.3: Importación desde Catálogos PDF
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 7.1.3.1**: Crear script para procesar PDFs de paquetes (Prioridad: Medium, Estimación: 3 puntos)
- **Sub-task 7.1.3.2**: Generar nombres descriptivos con capacidad y salón (Prioridad: High, Estimación: 1 punto)

---

## 📋 EPIC 8: GESTIÓN DE EVENTOS

### Story 8.1: CRUD de Eventos

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 21 puntos  
**Componentes**: Events Management  
**Labels**: events, crud, core

**Descripción**:  
Como coordinador/administrador, necesito gestionar eventos completos (crear, editar, cambiar estado, asignar recursos).

**Criterios de Aceptación**:
- Crear eventos con cliente, salón, plan y productos adicionales
- Editar eventos existentes
- Cambiar estado del evento (cotización → confirmado → en proceso → completado/cancelado)
- Asignar coordinador y salón
- Calcular total automáticamente

#### Task 8.1.1: Implementar Modelo de Eventos
**Tipo**: Task  
**Estimación**: 8 puntos

**Subtareas**:
- **Sub-task 8.1.1.1**: Implementar crear_evento() (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 8.1.1.2**: Implementar asignar_productos_adicionales() (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 8.1.1.3**: Implementar actualizar_estado_evento() (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 8.1.1.4**: Implementar calcular_total_evento() (Prioridad: Highest, Estimación: 1 punto)

#### Task 8.1.2: Implementar Vista de Eventos
**Tipo**: Task  
**Estimación**: 8 puntos

**Subtareas**:
- **Sub-task 8.1.2.1**: Crear interfaz de listado de eventos (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 8.1.2.2**: Crear formulario de creación/edición completo (Prioridad: Highest, Estimación: 5 puntos)

#### Task 8.1.3: Filtros y Búsqueda de Eventos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 8.1.3.1**: Implementar filtros por estado, fecha, coordinador (Prioridad: High, Estimación: 3 puntos)
- **Sub-task 8.1.3.2**: Implementar búsqueda de eventos (Prioridad: Medium, Estimación: 2 puntos)

---

## 📋 EPIC 9: GESTIÓN DE PAGOS

### Story 9.1: Registro y Gestión de Pagos

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 13 puntos  
**Componentes**: Payments Management  
**Labels**: payments, financial, core

**Descripción**:  
Como usuario del sistema, necesito registrar pagos, abonos y reembolsos de eventos con diferentes métodos de pago.

**Criterios de Aceptación**:
- Registrar abonos y pagos completos
- Múltiples métodos de pago (efectivo, transferencia, tarjeta, cheque)
- Calcular saldo pendiente automáticamente
- Ver historial de pagos por evento
- Registrar reembolsos

#### Task 9.1.1: Implementar Modelo de Pagos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 9.1.1.1**: Implementar crear_pago() con validaciones (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 9.1.1.2**: Implementar obtener_pagos_por_evento() (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 9.1.1.3**: Implementar eliminar_pago() (Prioridad: High, Estimación: 1 punto)
- **Sub-task 9.1.1.4**: Implementar obtener_total_pagado_evento() (Prioridad: Highest, Estimación: 1 punto)

#### Task 9.1.2: Implementar Vista de Pagos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 9.1.2.1**: Crear interfaz de registro de pagos (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 9.1.2.2**: Crear listado de pagos por evento (Prioridad: Highest, Estimación: 2 puntos)

#### Task 9.1.3: Triggers para Cálculo Automático de Saldos
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 9.1.3.1**: Crear trigger para actualizar saldo al insertar pago (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 9.1.3.2**: Crear trigger para actualizar saldo al eliminar pago (Prioridad: Highest, Estimación: 1 punto)

---

## 📋 EPIC 10: GESTIÓN DE INVENTARIO

### Story 10.1: Control de Inventario por Evento

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 8 puntos  
**Componentes**: Inventory Management  
**Labels**: inventory, logistics

**Descripción**:  
Como coordinador, necesito gestionar el inventario de productos asignados a eventos con control de estados.

**Criterios de Aceptación**:
- Asignar productos a eventos
- Control de estados (disponible, reservado, en uso, devuelto)
- Verificar disponibilidad por fecha
- Listar inventario por evento

#### Task 10.1.1: Implementar Modelo de Inventario
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 10.1.1.1**: Implementar asignar_producto_a_evento() (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 10.1.1.2**: Implementar actualizar_estado_inventario() (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 10.1.1.3**: Implementar verificar_disponibilidad() (Prioridad: High, Estimación: 1 punto)

#### Task 10.1.2: Implementar Vista de Inventario
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 10.1.2.1**: Crear interfaz de gestión de inventario (Prioridad: High, Estimación: 3 puntos)

---

## 📋 EPIC 11: GESTIÓN DE PROMOCIONES

### Story 11.1: Sistema de Promociones y Descuentos

**Tipo**: Story  
**Prioridad**: Medium  
**Estimación**: 8 puntos  
**Componentes**: Promotions Management  
**Labels**: promotions, discounts

**Descripción**:  
Como administrador, necesito crear y gestionar promociones con descuentos aplicables a planes o productos.

**Criterios de Aceptación**:
- Crear promociones con descuento por porcentaje o monto fijo
- Asignar promociones a planes o productos específicos
- Control de vigencia (fechas de inicio y fin)
- Promociones aplicables a todos

#### Task 11.1.1: Implementar Modelo de Promociones
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 11.1.1.1**: Implementar CRUD de promociones (Prioridad: Medium, Estimación: 3 puntos)
- **Sub-task 11.1.1.2**: Implementar validación de vigencia (Prioridad: Medium, Estimación: 2 puntos)

#### Task 11.1.2: Implementar Vista de Promociones
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 11.1.2.1**: Crear interfaz de gestión de promociones (Prioridad: Medium, Estimación: 3 puntos)

---

## 📋 EPIC 12: REPORTES Y MÉTRICAS

### Story 12.1: Sistema de Reportes Gerenciales

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 8 puntos  
**Componentes**: Reports, Analytics  
**Labels**: reports, analytics, management

**Descripción**:  
Como gerente/administrador, necesito visualizar reportes y métricas del negocio para la toma de decisiones.

**Criterios de Aceptación**:
- Resumen de eventos por estado
- Resumen financiero (ingresos, pendientes, cobrado)
- Estadísticas de eventos
- Métricas por período

#### Task 12.1.1: Implementar Modelo de Reportes
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 12.1.1.1**: Implementar obtener_resumen_eventos_por_estado() (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 12.1.1.2**: Implementar obtener_resumen_financiero() (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 12.1.1.3**: Implementar obtener_estadisticas_eventos() (Prioridad: Medium, Estimación: 1 punto)

#### Task 12.1.2: Implementar Vista de Reportes
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 12.1.2.1**: Crear interfaz de reportes con gráficos/tablas (Prioridad: High, Estimación: 3 puntos)

---

## 📋 EPIC 13: NOTIFICACIONES Y COMUNICACIONES

### Story 13.1: Sistema de Notificaciones Automáticas

**Tipo**: Story  
**Prioridad**: Medium  
**Estimación**: 8 puntos  
**Componentes**: Notifications  
**Labels**: notifications, communications

**Descripción**:  
Como sistema, necesito enviar notificaciones automáticas para eventos importantes (pagos, cambios de estado, recordatorios).

**Criterios de Aceptación**:
- Notificaciones por creación de eventos
- Notificaciones por registro de pagos
- Notificaciones por cambio de estado
- Registro de notificaciones enviadas

#### Task 13.1.1: Implementar Sistema de Notificaciones
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 13.1.1.1**: Crear modelo de notificaciones (Prioridad: Medium, Estimación: 2 puntos)
- **Sub-task 13.1.1.2**: Implementar enviar_notificacion_pago() (Prioridad: Medium, Estimación: 2 puntos)
- **Sub-task 13.1.1.3**: Implementar enviar_notificacion_evento() (Prioridad: Medium, Estimación: 1 punto)

#### Task 13.1.2: Implementar Vista de Notificaciones
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 13.1.2.1**: Crear interfaz de notificaciones (Prioridad: Medium, Estimación: 3 puntos)

---

## 📋 EPIC 14: INTEGRACIONES EXTERNAS

### Story 14.1: Integración con WhatsApp

**Tipo**: Story  
**Prioridad**: Low  
**Estimación**: 5 puntos  
**Componentes**: Integrations  
**Labels**: integrations, whatsapp, future

**Descripción**:  
Como sistema, necesito enviar notificaciones automáticas vía WhatsApp a clientes.

**Criterios de Aceptación**:
- Enviar mensajes vía API de WhatsApp
- Notificaciones de eventos y pagos
- Configuración de credenciales

#### Task 14.1.1: Implementar Módulo de WhatsApp
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 14.1.1.1**: Crear módulo de integración WhatsApp (Prioridad: Low, Estimación: 5 puntos)

---

### Story 14.2: Integración con Email

**Tipo**: Story  
**Prioridad**: Medium  
**Estimación**: 5 puntos  
**Componentes**: Integrations  
**Labels**: integrations, email

**Descripción**:  
Como sistema, necesito enviar correos electrónicos automáticos a clientes.

**Criterios de Aceptación**:
- Configuración de servidor SMTP
- Envío de correos automáticos
- Templates de correo

#### Task 14.2.1: Implementar Módulo de Email
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 14.2.1.1**: Crear módulo de integración Email (Prioridad: Medium, Estimación: 3 puntos)
- **Sub-task 14.2.1.2**: Crear script de configuración de email (Prioridad: Medium, Estimación: 2 puntos)

---

### Story 14.3: Integración con Google Sheets

**Tipo**: Story  
**Prioridad**: Low  
**Estimación**: 5 puntos  
**Componentes**: Integrations  
**Labels**: integrations, google-sheets, future

**Descripción**:  
Como sistema, necesito sincronizar datos con Google Sheets para visualización externa.

**Criterios de Aceptación**:
- Conexión con API de Google Sheets
- Sincronización de eventos y pagos
- Actualización en tiempo real

#### Task 14.3.1: Implementar Módulo de Google Sheets
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 14.3.1.1**: Crear módulo de integración Google Sheets (Prioridad: Low, Estimación: 5 puntos)

---

## 📋 EPIC 15: INTERFAZ DE USUARIO Y UX

### Story 15.1: Ventana Principal y Navegación

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 5 puntos  
**Componentes**: UI/UX  
**Labels**: ui, ux, navigation

**Descripción**:  
Como usuario, necesito una interfaz principal con navegación clara entre módulos según mi rol.

**Criterios de Aceptación**:
- Menú principal con módulos disponibles
- Navegación por roles
- Diseño intuitivo y responsive

#### Task 15.1.1: Implementar Ventana Principal
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 15.1.1.1**: Crear ventana principal con menú lateral (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 15.1.1.2**: Implementar navegación por módulos (Prioridad: Highest, Estimación: 2 puntos)

---

### Story 15.2: Mejoras de UX y Validaciones

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 8 puntos  
**Componentes**: UI/UX  
**Labels**: ui, ux, validation

**Descripción**:  
Como usuario, necesito mensajes claros, validaciones en tiempo real y una experiencia fluida.

**Criterios de Aceptación**:
- Validación de formularios en tiempo real
- Mensajes de error descriptivos
- Confirmaciones de acciones críticas
- Loading indicators

#### Task 15.2.1: Implementar Validaciones de Formularios
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 15.2.1.1**: Implementar validaciones en todos los formularios (Prioridad: High, Estimación: 5 puntos)

#### Task 15.2.2: Mejorar Mensajes y Alertas
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 15.2.2.1**: Implementar mensajes informativos, de error y confirmación (Prioridad: High, Estimación: 3 puntos)

---

## 📋 EPIC 16: UTILIDADES Y HERRAMIENTAS

### Story 16.1: Scripts de Utilidades

**Tipo**: Story  
**Prioridad**: Medium  
**Estimación**: 5 puntos  
**Componentes**: Utilities  
**Labels**: utilities, scripts, tools

**Descripción**:  
Como desarrollador/administrador, necesito scripts de utilidades para tareas comunes (backup, importación, verificación).

**Criterios de Aceptación**:
- Scripts de backup de base de datos
- Scripts de importación de datos
- Scripts de verificación y mantenimiento

#### Task 16.1.1: Crear Scripts de Utilidades
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 16.1.1.1**: Crear script de backup de BD (Prioridad: Medium, Estimación: 2 puntos)
- **Sub-task 16.1.1.2**: Crear scripts de verificación (Prioridad: Medium, Estimación: 2 puntos)
- **Sub-task 16.1.1.3**: Crear script de procesamiento de catálogos (Prioridad: Medium, Estimación: 1 punto)

---

### Story 16.2: Sistema de Logging

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 3 puntos  
**Componentes**: Utilities, Logging  
**Labels**: logging, monitoring

**Descripción**:  
Como desarrollador, necesito un sistema de logging para rastrear errores y operaciones importantes.

**Criterios de Aceptación**:
- Logging de todas las operaciones importantes
- Archivos de log diarios
- Niveles de log (INFO, ERROR, DEBUG)

#### Task 16.2.1: Implementar Sistema de Logging
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 16.2.1.1**: Crear módulo de logging (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 16.2.1.2**: Integrar logging en todos los módulos (Prioridad: High, Estimación: 1 punto)

---

## 📋 EPIC 17: MEJORAS Y OPTIMIZACIONES

### Story 17.1: Mejoras de Base de Datos

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 5 puntos  
**Componentes**: Database, Optimization  
**Labels**: database, optimization, improvement

**Descripción**:  
Como desarrollador, necesito mejorar la estructura de la base de datos con campos adicionales para productos.

**Criterios de Aceptación**:
- Agregar campos avanzados a productos (variantes, precio min/max, duración)
- Migración de datos existentes
- Scripts de migración versionados

#### Task 17.1.1: Implementar Migración de Productos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 17.1.1.1**: Crear script de migración para campos avanzados (Prioridad: High, Estimación: 3 puntos)
- **Sub-task 17.1.1.2**: Actualizar modelo de productos (Prioridad: High, Estimación: 2 puntos)

---

### Story 17.2: Consolidación de Datos del Catálogo

**Tipo**: Story  
**Prioridad**: Medium  
**Estimación**: 5 puntos  
**Componentes**: Data Management  
**Labels**: data, catalog, improvement

**Descripción**:  
Como administrador, necesito consolidar todos los datos del catálogo oficial en un solo archivo SQL.

**Criterios de Aceptación**:
- Script para procesar todos los PDFs del catálogo
- Generación de SQL consolidado
- Nombres descriptivos de planes (capacidad + salón)

#### Task 17.2.1: Crear Script de Consolidación
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 17.2.1.1**: Crear script para procesar todos los PDFs (Prioridad: Medium, Estimación: 3 puntos)
- **Sub-task 17.2.1.2**: Generar SQL consolidado con nombres descriptivos (Prioridad: Medium, Estimación: 2 puntos)

---

### Story 17.3: Mejoras de Eliminación (Categorías y Salones)

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 3 puntos  
**Componentes**: CRUD Improvements  
**Labels**: improvement, crud, data-integrity

**Descripción**:  
Como usuario, necesito que al eliminar categorías y salones se manejen correctamente las dependencias.

**Criterios de Aceptación**:
- Eliminación física si no hay dependencias
- Desactivación si hay dependencias
- Mensajes claros al usuario

#### Task 17.3.1: Mejorar Eliminación de Categorías
**Tipo**: Task  
**Estimación**: 2 puntos

**Subtareas**:
- **Sub-task 17.3.1.1**: Mejorar método de eliminación con validación de dependencias (Prioridad: High, Estimación: 2 puntos)

#### Task 17.3.2: Mejorar Eliminación de Salones
**Tipo**: Task  
**Estimación**: 1 punto

**Subtareas**:
- **Sub-task 17.3.2.1**: Mejorar método de eliminación con validación de dependencias (Prioridad: High, Estimación: 1 punto)

---

## 📋 EPIC 18: DOCUMENTACIÓN

### Story 18.1: Documentación Técnica

**Tipo**: Story  
**Prioridad**: Medium  
**Estimación**: 5 puntos  
**Componentes**: Documentation  
**Labels**: documentation, technical

**Descripción**:  
Como desarrollador, necesito documentación completa del sistema (README, arquitectura, APIs).

**Criterios de Aceptación**:
- README completo con instalación y uso
- Documentación de arquitectura
- Documentación de APIs y módulos

#### Task 18.1.1: Crear Documentación Completa
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 18.1.1.1**: Actualizar README con objetivo, antecedentes, requerimientos (Prioridad: Medium, Estimación: 3 puntos)
- **Sub-task 18.1.1.2**: Documentar arquitectura y módulos (Prioridad: Medium, Estimación: 2 puntos)

---

## 📋 EPIC 19: LEVANTAMIENTO Y DOCUMENTACIÓN DE REQUERIMIENTOS

### Story 19.1: Levantamiento de Requerimientos Funcionales

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 8 puntos  
**Componentes**: Requirements, Documentation  
**Labels**: requirements, documentation, analysis

**Descripción**:  
Como analista de sistemas, necesito realizar el levantamiento completo de requerimientos funcionales del sistema basado en las necesidades del negocio.

**Criterios de Aceptación**:
- Documentar todos los requerimientos funcionales (RF-01 a RF-11)
- Identificar casos de uso por módulo
- Priorizar requerimientos según importancia del negocio
- Validar requerimientos con stakeholders

#### Task 19.1.1: Análisis del Negocio y Contexto
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 19.1.1.1**: Realizar entrevistas con stakeholders (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 19.1.1.2**: Documentar contexto del negocio y problemas identificados (Prioridad: Highest, Estimación: 1 punto)

#### Task 19.1.2: Documentación de Requerimientos Funcionales
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 19.1.2.1**: Documentar RF-01 a RF-06 (Gestión de usuarios, productos, planes, eventos, pagos, inventario) (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 19.1.2.2**: Documentar RF-07 a RF-11 (Promociones, salones, reportes, integraciones, catálogo) (Prioridad: Highest, Estimación: 2 puntos)

---

### Story 19.2: Levantamiento de Requerimientos No Funcionales

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 5 puntos  
**Componentes**: Requirements, Documentation  
**Labels**: requirements, documentation, non-functional

**Descripción**:  
Como analista de sistemas, necesito documentar los requerimientos no funcionales del sistema (rendimiento, seguridad, usabilidad, etc.).

**Criterios de Aceptación**:
- Documentar requerimientos de rendimiento
- Documentar requerimientos de seguridad
- Documentar requerimientos de usabilidad
- Documentar requerimientos de mantenibilidad

#### Task 19.2.1: Documentar Requerimientos No Funcionales
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 19.2.1.1**: Documentar RNF-01 a RNF-04 (Rendimiento, escalabilidad, usabilidad, seguridad) (Prioridad: High, Estimación: 3 puntos)
- **Sub-task 19.2.1.2**: Documentar RNF-05 a RNF-08 (Mantenibilidad, portabilidad, confiabilidad, compatibilidad) (Prioridad: High, Estimación: 2 puntos)

---

### Story 19.3: Documentación de Casos de Uso

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 8 puntos  
**Componentes**: Documentation, Analysis  
**Labels**: documentation, use-cases, analysis

**Descripción**:  
Como analista, necesito documentar casos de uso detallados para cada módulo del sistema.

**Criterios de Aceptación**:
- Casos de uso por rol (Administrador, Coordinador, Gerente, Cliente)
- Diagramas de flujo de procesos principales
- Escenarios alternativos y de error
- Validación con usuarios finales

#### Task 19.3.1: Documentar Casos de Uso por Módulo
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 19.3.1.1**: Documentar casos de uso de módulos core (Eventos, Pagos, Productos) (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 19.3.1.2**: Documentar casos de uso de módulos secundarios (Inventario, Promociones, Reportes) (Prioridad: High, Estimación: 2 puntos)

#### Task 19.3.2: Crear Diagramas de Flujo
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 19.3.2.1**: Crear diagrama de flujo de creación de eventos (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 19.3.2.2**: Crear diagrama de flujo de registro de pagos (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 19.3.2.3**: Crear diagrama de flujo de autenticación y navegación (Prioridad: High, Estimación: 1 punto)

---

### Story 19.4: Documentación de Arquitectura y Diseño

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 5 puntos  
**Componentes**: Documentation, Architecture  
**Labels**: documentation, architecture, design

**Descripción**:  
Como arquitecto de software, necesito documentar la arquitectura del sistema, diseño de base de datos y patrones utilizados.

**Criterios de Aceptación**:
- Diagrama de arquitectura del sistema
- Modelo de datos (ERD)
- Documentación de patrones de diseño
- Documentación de decisiones técnicas

#### Task 19.4.1: Documentar Arquitectura del Sistema
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 19.4.1.1**: Crear diagrama de arquitectura en capas (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 19.4.1.2**: Documentar separación de responsabilidades (Modelo-Vista) (Prioridad: High, Estimación: 1 punto)

#### Task 19.4.2: Documentar Diseño de Base de Datos
**Tipo**: Task  
**Estimación**: 2 puntos

**Subtareas**:
- **Sub-task 19.4.2.1**: Crear diagrama ERD (Entidad-Relación) (Prioridad: High, Estimación: 2 puntos)

---

## 📋 EPIC 20: PRUEBAS Y CERTIFICACIÓN

### Story 20.1: Plan de Pruebas

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 5 puntos  
**Componentes**: Testing, Quality Assurance  
**Labels**: testing, qa, planning

**Descripción**:  
Como tester, necesito crear un plan de pruebas completo que cubra todos los módulos y funcionalidades del sistema.

**Criterios de Aceptación**:
- Plan de pruebas por módulo
- Casos de prueba documentados
- Estrategia de pruebas (unitarias, integración, sistema, aceptación)
- Criterios de entrada y salida de pruebas

#### Task 20.1.1: Crear Plan de Pruebas
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.1.1.1**: Definir estrategia de pruebas (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.1.1.2**: Crear matriz de trazabilidad requerimientos-pruebas (Prioridad: Highest, Estimación: 3 puntos)

---

### Story 20.2: Pruebas Unitarias

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 13 puntos  
**Componentes**: Testing, Unit Tests  
**Labels**: testing, unit-tests, quality

**Descripción**:  
Como desarrollador, necesito crear pruebas unitarias para validar la funcionalidad de cada método y clase del sistema.

**Criterios de Aceptación**:
- Pruebas unitarias para todos los modelos
- Cobertura de código > 70%
- Pruebas de casos límite y errores
- Ejecución automática de pruebas

#### Task 20.2.1: Pruebas Unitarias de Modelos Core
**Tipo**: Task  
**Estimación**: 8 puntos

**Subtareas**:
- **Sub-task 20.2.1.1**: Pruebas unitarias de BaseDatos (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.2.1.2**: Pruebas unitarias de Autenticación (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.2.1.3**: Pruebas unitarias de EventoModelo (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.2.1.4**: Pruebas unitarias de PagoModelo (Prioridad: Highest, Estimación: 2 puntos)

#### Task 20.2.2: Pruebas Unitarias de Modelos Secundarios
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.2.2.1**: Pruebas unitarias de ProductoModelo, PlanModelo, ClienteModelo (Prioridad: High, Estimación: 3 puntos)
- **Sub-task 20.2.2.2**: Pruebas unitarias de CategoriaModelo, SalonModelo, InventarioModelo (Prioridad: High, Estimación: 2 puntos)

---

### Story 20.3: Pruebas de Integración

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 13 puntos  
**Componentes**: Testing, Integration Tests  
**Labels**: testing, integration-tests, quality

**Descripción**:  
Como tester, necesito realizar pruebas de integración para validar la comunicación entre módulos y componentes.

**Criterios de Aceptación**:
- Pruebas de integración Modelo-Vista
- Pruebas de integración con Base de Datos
- Pruebas de flujos completos de negocio
- Validación de triggers y procedimientos almacenados

#### Task 20.3.1: Pruebas de Integración de Flujos Principales
**Tipo**: Task  
**Estimación**: 8 puntos

**Subtareas**:
- **Sub-task 20.3.1.1**: Prueba de flujo completo: Login → Crear Evento → Registrar Pago (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 20.3.1.2**: Prueba de flujo: Crear Producto → Asociar a Plan → Crear Evento con Plan (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 20.3.1.3**: Prueba de flujo: Cambiar Estado de Evento → Actualizar Inventario (Prioridad: High, Estimación: 2 puntos)

#### Task 20.3.2: Pruebas de Integración con Base de Datos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.3.2.1**: Validar triggers de actualización de saldo (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.3.2.2**: Validar integridad referencial (Foreign Keys) (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.3.2.3**: Validar procedimientos almacenados (Prioridad: High, Estimación: 1 punto)

---

### Story 20.4: Pruebas de Sistema

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 21 puntos  
**Componentes**: Testing, System Tests  
**Labels**: testing, system-tests, quality

**Descripción**:  
Como tester, necesito realizar pruebas de sistema completas para validar que el sistema cumple con todos los requerimientos funcionales y no funcionales.

**Criterios de Aceptación**:
- Pruebas de todos los módulos del sistema
- Pruebas de rendimiento y carga
- Pruebas de seguridad
- Pruebas de usabilidad

#### Task 20.4.1: Pruebas Funcionales por Módulo
**Tipo**: Task  
**Estimación**: 13 puntos

**Subtareas**:
- **Sub-task 20.4.1.1**: Pruebas de módulo de Autenticación y Usuarios (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.4.1.2**: Pruebas de módulo de Clientes (Prioridad: Highest, Estimación: 1 punto)
- **Sub-task 20.4.1.3**: Pruebas de módulo de Productos y Categorías (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.4.1.4**: Pruebas de módulo de Salones (Prioridad: High, Estimación: 1 punto)
- **Sub-task 20.4.1.5**: Pruebas de módulo de Planes y Paquetes (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.4.1.6**: Pruebas de módulo de Eventos (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 20.4.1.7**: Pruebas de módulo de Pagos (Prioridad: Highest, Estimación: 2 puntos)

#### Task 20.4.2: Pruebas de Módulos Secundarios
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.4.2.1**: Pruebas de módulo de Inventario (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 20.4.2.2**: Pruebas de módulo de Promociones (Prioridad: Medium, Estimación: 1 punto)
- **Sub-task 20.4.2.3**: Pruebas de módulo de Reportes (Prioridad: High, Estimación: 2 puntos)

#### Task 20.4.3: Pruebas No Funcionales
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 20.4.3.1**: Pruebas de rendimiento (tiempo de respuesta < 2 segundos) (Prioridad: High, Estimación: 1 punto)
- **Sub-task 20.4.3.2**: Pruebas de seguridad (autenticación, autorización, SQL injection) (Prioridad: Highest, Estimación: 2 puntos)

---

### Story 20.5: Pruebas de Aceptación de Usuario (UAT)

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 13 puntos  
**Componentes**: Testing, UAT  
**Labels**: testing, uat, acceptance

**Descripción**:  
Como usuario final, necesito validar que el sistema cumple con mis necesidades de negocio y es fácil de usar.

**Criterios de Aceptación**:
- Pruebas de aceptación por rol
- Validación de casos de uso de negocio
- Retroalimentación de usuarios
- Corrección de issues encontrados

#### Task 20.5.1: UAT con Administradores
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.5.1.1**: Sesión de pruebas con administradores (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 20.5.1.2**: Documentar feedback y issues (Prioridad: Highest, Estimación: 2 puntos)

#### Task 20.5.2: UAT con Coordinadores
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.5.2.1**: Sesión de pruebas con coordinadores (Prioridad: Highest, Estimación: 3 puntos)
- **Sub-task 20.5.2.2**: Validar flujos de gestión de eventos e inventario (Prioridad: Highest, Estimación: 2 puntos)

#### Task 20.5.3: UAT con Gerentes
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 20.5.3.1**: Sesión de pruebas con gerentes (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 20.5.3.2**: Validar reportes y métricas (Prioridad: High, Estimación: 1 punto)

---

### Story 20.6: Scripts de Verificación y Validación

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 8 puntos  
**Componentes**: Testing, Utilities  
**Labels**: testing, verification, scripts

**Descripción**:  
Como desarrollador, necesito scripts automatizados para verificar la integridad de la base de datos y validar la configuración del sistema.

**Criterios de Aceptación**:
- Scripts de verificación de estructura de BD
- Scripts de verificación de datos
- Scripts de verificación de configuración
- Reportes de verificación

#### Task 20.6.1: Crear Scripts de Verificación de Base de Datos
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.6.1.1**: Crear script verificar_bd.py (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 20.6.1.2**: Crear scripts de verificación por tabla (productos, pagos, eventos, etc.) (Prioridad: High, Estimación: 3 puntos)

#### Task 20.6.2: Crear Scripts de Verificación de Configuración
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 20.6.2.1**: Crear script verificar_configuracion_email.py (Prioridad: Medium, Estimación: 2 puntos)
- **Sub-task 20.6.2.2**: Crear script verificar_foreign_keys.py (Prioridad: High, Estimación: 1 punto)

---

### Story 20.7: Certificación y Validación Final

**Tipo**: Story  
**Prioridad**: Highest  
**Estimación**: 8 puntos  
**Componentes**: Testing, Certification  
**Labels**: testing, certification, quality-assurance

**Descripción**:  
Como líder de proyecto, necesito certificar que el sistema cumple con todos los requerimientos y está listo para producción.

**Criterios de Aceptación**:
- Todas las pruebas pasadas exitosamente
- Documentación completa y actualizada
- Issues críticos resueltos
- Aprobación de stakeholders

#### Task 20.7.1: Revisión Final de Pruebas
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 20.7.1.1**: Revisar resultados de todas las pruebas (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.7.1.2**: Validar cobertura de pruebas (Prioridad: Highest, Estimación: 1 punto)

#### Task 20.7.2: Documentación de Certificación
**Tipo**: Task  
**Estimación**: 3 puntos

**Subtareas**:
- **Sub-task 20.7.2.1**: Crear informe de certificación (Prioridad: Highest, Estimación: 2 puntos)
- **Sub-task 20.7.2.2**: Documentar issues conocidos y limitaciones (Prioridad: High, Estimación: 1 punto)

#### Task 20.7.3: Aprobación Final
**Tipo**: Task  
**Estimación**: 2 puntos

**Subtareas**:
- **Sub-task 20.7.3.1**: Presentar sistema a stakeholders para aprobación (Prioridad: Highest, Estimación: 2 puntos)

---

### Story 20.8: Pruebas de Regresión

**Tipo**: Story  
**Prioridad**: High  
**Estimación**: 5 puntos  
**Componentes**: Testing, Regression Tests  
**Labels**: testing, regression, quality

**Descripción**:  
Como tester, necesito realizar pruebas de regresión después de cada cambio importante para asegurar que no se rompió funcionalidad existente.

**Criterios de Aceptación**:
- Suite de pruebas de regresión
- Ejecución automática de pruebas críticas
- Reporte de resultados
- Validación de no regresión

#### Task 20.8.1: Crear Suite de Pruebas de Regresión
**Tipo**: Task  
**Estimación**: 5 puntos

**Subtareas**:
- **Sub-task 20.8.1.1**: Identificar casos de prueba críticos para regresión (Prioridad: High, Estimación: 2 puntos)
- **Sub-task 20.8.1.2**: Automatizar pruebas de regresión (Prioridad: High, Estimación: 3 puntos)

---

## 📊 RESUMEN DE ESTIMACIONES POR EPIC

| Epic | Puntos Totales | Prioridad |
|------|---------------|-----------|
| EPIC 1: Infraestructura y Base de Datos | 18 | Highest |
| EPIC 2: Autenticación y Seguridad | 8 | Highest |
| EPIC 3: Gestión de Usuarios | 8 | Highest |
| EPIC 4: Gestión de Clientes | 5 | Highest |
| EPIC 5: Gestión de Productos y Servicios | 18 | Highest |
| EPIC 6: Gestión de Salones | 5 | High |
| EPIC 7: Gestión de Planes y Paquetes | 13 | Highest |
| EPIC 8: Gestión de Eventos | 21 | Highest |
| EPIC 9: Gestión de Pagos | 13 | Highest |
| EPIC 10: Gestión de Inventario | 8 | High |
| EPIC 11: Gestión de Promociones | 8 | Medium |
| EPIC 12: Reportes y Métricas | 8 | High |
| EPIC 13: Notificaciones y Comunicaciones | 8 | Medium |
| EPIC 14: Integraciones Externas | 15 | Low/Medium |
| EPIC 15: Interfaz de Usuario y UX | 13 | Highest/High |
| EPIC 16: Utilidades y Herramientas | 8 | Medium/High |
| EPIC 17: Mejoras y Optimizaciones | 13 | High/Medium |
| EPIC 18: Documentación | 5 | Medium |
| EPIC 19: Levantamiento y Documentación de Requerimientos | 26 | Highest/High |
| EPIC 20: Pruebas y Certificación | 78 | Highest/High |

**TOTAL ESTIMADO**: 291 puntos

---

## 📝 INSTRUCCIONES PARA JIRA

### Campos Requeridos para cada Tarea/Story:

1. **Summary (Título)**: Nombre descriptivo y conciso
2. **Issue Type**: Epic, Story, Task, Sub-task
3. **Description**: Descripción completa con contexto
4. **Acceptance Criteria**: Criterios de aceptación (para Stories)
5. **Priority**: Highest, High, Medium, Low
6. **Story Points / Time Estimate**: Estimación en puntos o horas
7. **Components**: Módulo/componente afectado
8. **Labels**: Etiquetas para filtrado
9. **Sprint**: Sprint asignado
10. **Assignee**: Desarrollador asignado
11. **Reporter**: Persona que reporta
12. **Epic Link**: Vincular a Epic correspondiente
13. **Parent Link**: Para Sub-tasks, vincular a Task padre

### Flujo de Trabajo Sugerido:

1. **To Do** → Tarea creada
2. **In Progress** → Desarrollo iniciado
3. **Code Review** → Revisión de código (si aplica)
4. **Testing** → Pruebas
5. **Done** → Completado

### Labels Sugeridos:

- core: Funcionalidades core del sistema
- crud: Operaciones CRUD
- database: Base de datos
- ui: Interfaz de usuario
- ux: Experiencia de usuario
- security: Seguridad
- integration: Integraciones
- improvement: Mejoras
- bug: Bugs
- documentation: Documentación
- future: Funcionalidades futuras
- testing: Pruebas y testing
- qa: Quality Assurance
- unit-tests: Pruebas unitarias
- integration-tests: Pruebas de integración
- system-tests: Pruebas de sistema
- uat: User Acceptance Testing
- regression: Pruebas de regresión
- requirements: Requerimientos
- analysis: Análisis
- certification: Certificación

### Componentes Sugeridos:

- Authentication
- Users Management
- Clients Management
- Products Management
- Categories Management
- Venues Management
- Packages Management
- Events Management
- Payments Management
- Inventory Management
- Promotions Management
- Reports
- Notifications
- Integrations
- Database
- UI/UX
- Utilities
- Documentation
- Requirements
- Testing
- Quality Assurance
- Unit Tests
- Integration Tests
- System Tests
- UAT
- Certification

---

**Nota**: Este documento puede ser importado a Jira o usado como referencia para crear las tareas manualmente. Ajusta las estimaciones y prioridades según la realidad del proyecto y el equipo.

---

## 🚀 PLANIFICACIÓN DE SPRINTS

### Configuración de Sprints
- **Duración total**: 17/10/2025 - 5/1/2026 (80 días, ~11.4 semanas)
- **Número de sprints**: 7
- **Duración promedio por sprint**: ~11.4 días (~1.6 semanas)

---

## 📅 SPRINT 1: Infraestructura Base y Autenticación
**Fecha de inicio**: 17/10/2025  
**Fecha de fin**: 31/10/2025  
**Duración**: 2 semanas  
**Puntos estimados**: ~42 puntos

### Objetivo del Sprint
Establecer la base de datos completa y el sistema de autenticación para habilitar el desarrollo de los demás módulos.

### Actividades del Sprint

#### EPIC 1: INFRAESTRUCTURA Y BASE DE DATOS
- **Story 1.1**: Diseño e Implementación de Base de Datos (13 puntos)
  - Task 1.1.1: Crear Estructura de Tablas Principales (5 puntos)
    - Sub-task 1.1.1.1: Crear tabla usuarios
    - Sub-task 1.1.1.2: Crear tabla clientes
    - Sub-task 1.1.1.3: Crear tabla categorias
    - Sub-task 1.1.1.4: Crear tabla productos
  - Task 1.1.2: Crear Tablas de Eventos y Relacionadas (5 puntos)
    - Sub-task 1.1.2.1: Crear tabla salones
    - Sub-task 1.1.2.2: Crear tabla planes
    - Sub-task 1.1.2.3: Crear tabla eventos
  - Task 1.1.3: Crear Tablas de Transacciones (3 puntos)
    - Sub-task 1.1.3.1: Crear tabla pagos
    - Sub-task 1.1.3.2: Crear tabla inventario
    - Sub-task 1.1.3.3: Crear tabla promociones

- **Story 1.2**: Sistema de Conexión y Gestión de Base de Datos (5 puntos)
  - Task 1.2.1: Implementar Clase BaseDatos (5 puntos)
    - Sub-task 1.2.1.1: Implementar método conectar()
    - Sub-task 1.2.1.2: Implementar método ejecutar_consulta()
    - Sub-task 1.2.1.3: Implementar método obtener_todos()
    - Sub-task 1.2.1.4: Implementar método obtener_uno()

#### EPIC 2: AUTENTICACIÓN Y SEGURIDAD
- **Story 2.1**: Sistema de Autenticación (8 puntos)
  - Task 2.1.1: Implementar Modelo de Autenticación (3 puntos)
    - Sub-task 2.1.1.1: Implementar método validar_credenciales()
    - Sub-task 2.1.1.2: Implementar hash de contraseñas
  - Task 2.1.2: Implementar Vista de Login (3 puntos)
    - Sub-task 2.1.2.1: Crear interfaz de login con Tkinter
    - Sub-task 2.1.2.2: Implementar validación de campos
  - Task 2.1.3: Sistema de Roles y Permisos (2 puntos)
    - Sub-task 2.1.3.1: Implementar control de acceso por roles

#### EPIC 15: INTERFAZ DE USUARIO Y UX
- **Story 15.1**: Ventana Principal y Navegación (5 puntos)
  - Task 15.1.1: Implementar Ventana Principal (5 puntos)
    - Sub-task 15.1.1.1: Crear ventana principal con menú lateral
    - Sub-task 15.1.1.2: Implementar navegación por módulos

#### EPIC 16: UTILIDADES Y HERRAMIENTAS
- **Story 16.2**: Sistema de Logging (3 puntos)
  - Task 16.2.1: Implementar Sistema de Logging (3 puntos)
    - Sub-task 16.2.1.1: Crear módulo de logging
    - Sub-task 16.2.1.2: Integrar logging en todos los módulos

#### EPIC 1: INFRAESTRUCTURA Y BASE DE DATOS (Continuación)
- **Story 1.1**: (Continuación)
  - Task 1.1.4: Implementar Triggers y Procedimientos Almacenados (5 puntos)
    - Sub-task 1.1.4.1: Crear trigger para actualizar saldo de eventos al insertar pago
    - Sub-task 1.1.4.2: Crear trigger para actualizar saldo al eliminar pago
    - Sub-task 1.1.4.3: Crear procedimientos almacenados para cálculos complejos

---

## 📅 SPRINT 2: Gestión de Usuarios, Clientes y Productos Base
**Fecha de inicio**: 31/10/2025  
**Fecha de fin**: 14/11/2025  
**Duración**: 2 semanas  
**Puntos estimados**: ~40 puntos

### Objetivo del Sprint
Implementar los módulos fundamentales de gestión de usuarios, clientes y productos básicos.

### Actividades del Sprint

#### EPIC 3: GESTIÓN DE USUARIOS
- **Story 3.1**: CRUD de Usuarios (8 puntos)
  - Task 3.1.1: Implementar Modelo de Usuarios (3 puntos)
    - Sub-task 3.1.1.1: Implementar crear_usuario()
    - Sub-task 3.1.1.2: Implementar obtener_usuario_por_id()
    - Sub-task 3.1.1.3: Implementar actualizar_usuario()
    - Sub-task 3.1.1.4: Implementar eliminar_usuario()
  - Task 3.1.2: Implementar Vista de Usuarios (5 puntos)
    - Sub-task 3.1.2.1: Crear interfaz de listado de usuarios
    - Sub-task 3.1.2.2: Crear formulario de creación/edición
    - Sub-task 3.1.2.3: Implementar validaciones de formulario

#### EPIC 4: GESTIÓN DE CLIENTES
- **Story 4.1**: CRUD de Clientes (5 puntos)
  - Task 4.1.1: Implementar Modelo de Clientes (3 puntos)
    - Sub-task 4.1.1.1: Implementar crear_cliente()
    - Sub-task 4.1.1.2: Implementar obtener_cliente_por_id()
    - Sub-task 4.1.1.3: Implementar buscar_clientes()
  - Task 4.1.2: Implementar Vista de Clientes (2 puntos)
    - Sub-task 4.1.2.1: Crear interfaz de gestión de clientes

#### EPIC 5: GESTIÓN DE PRODUCTOS Y SERVICIOS
- **Story 5.1**: CRUD de Productos (13 puntos)
  - Task 5.1.1: Implementar Modelo de Productos (5 puntos)
    - Sub-task 5.1.1.1: Implementar crear_producto() con campos avanzados
    - Sub-task 5.1.1.2: Implementar obtener_producto_por_id()
    - Sub-task 5.1.1.3: Implementar actualizar_producto()
  - Task 5.1.2: Implementar Vista de Productos (5 puntos)
    - Sub-task 5.1.2.1: Crear interfaz de listado de productos
    - Sub-task 5.1.2.2: Crear formulario de creación/edición con campos avanzados

- **Story 5.2**: Gestión de Categorías (5 puntos)
  - Task 5.2.1: Implementar Modelo de Categorías (3 puntos)
    - Sub-task 5.2.1.1: Implementar CRUD de categorías
  - Task 5.2.2: Implementar Vista de Categorías (2 puntos)
    - Sub-task 5.2.2.1: Crear interfaz de gestión de categorías

#### EPIC 6: GESTIÓN DE SALONES
- **Story 6.1**: CRUD de Salones (5 puntos)
  - Task 6.1.1: Implementar Modelo de Salones (3 puntos)
    - Sub-task 6.1.1.1: Implementar CRUD de salones
    - Sub-task 6.1.1.2: Implementar verificar_disponibilidad()
  - Task 6.1.2: Implementar Vista de Salones (2 puntos)
    - Sub-task 6.1.2.1: Crear interfaz de gestión de salones

#### EPIC 17: MEJORAS Y OPTIMIZACIONES
- **Story 17.1**: Mejoras de Base de Datos (5 puntos)
  - Task 17.1.1: Implementar Migración de Productos (5 puntos)
    - Sub-task 17.1.1.1: Crear script de migración para campos avanzados
    - Sub-task 17.1.1.2: Actualizar modelo de productos

---

## 📅 SPRINT 3: Planes, Eventos y Pagos Core
**Fecha de inicio**: 14/11/2025  
**Fecha de fin**: 28/11/2025  
**Duración**: 2 semanas  
**Puntos estimados**: ~47 puntos

### Objetivo del Sprint
Implementar los módulos core del negocio: planes, eventos y pagos.

### Actividades del Sprint

#### EPIC 7: GESTIÓN DE PLANES Y PAQUETES
- **Story 7.1**: CRUD de Planes/Paquetes (13 puntos)
  - Task 7.1.1: Implementar Modelo de Planes (5 puntos)
    - Sub-task 7.1.1.1: Implementar crear_plan()
    - Sub-task 7.1.1.2: Implementar asociar_producto_a_plan()
    - Sub-task 7.1.1.3: Implementar obtener_plan_por_id()
  - Task 7.1.2: Implementar Vista de Planes (5 puntos)
    - Sub-task 7.1.2.1: Crear interfaz de listado de planes
    - Sub-task 7.1.2.2: Crear formulario de creación/edición

#### EPIC 8: GESTIÓN DE EVENTOS
- **Story 8.1**: CRUD de Eventos (21 puntos)
  - Task 8.1.1: Implementar Modelo de Eventos (8 puntos)
    - Sub-task 8.1.1.1: Implementar crear_evento()
    - Sub-task 8.1.1.2: Implementar asignar_productos_adicionales()
    - Sub-task 8.1.1.3: Implementar actualizar_estado_evento()
    - Sub-task 8.1.1.4: Implementar calcular_total_evento()
  - Task 8.1.2: Implementar Vista de Eventos (8 puntos)
    - Sub-task 8.1.2.1: Crear interfaz de listado de eventos
    - Sub-task 8.1.2.2: Crear formulario de creación/edición completo
  - Task 8.1.3: Filtros y Búsqueda de Eventos (5 puntos)
    - Sub-task 8.1.3.1: Implementar filtros por estado, fecha, coordinador
    - Sub-task 8.1.3.2: Implementar búsqueda de eventos

#### EPIC 9: GESTIÓN DE PAGOS
- **Story 9.1**: Registro y Gestión de Pagos (13 puntos)
  - Task 9.1.1: Implementar Modelo de Pagos (5 puntos)
    - Sub-task 9.1.1.1: Implementar crear_pago() con validaciones
    - Sub-task 9.1.1.2: Implementar obtener_pagos_por_evento()
    - Sub-task 9.1.1.3: Implementar eliminar_pago()
    - Sub-task 9.1.1.4: Implementar obtener_total_pagado_evento()
  - Task 9.1.2: Implementar Vista de Pagos (5 puntos)
    - Sub-task 9.1.2.1: Crear interfaz de registro de pagos
    - Sub-task 9.1.2.2: Crear listado de pagos por evento
  - Task 9.1.3: Triggers para Cálculo Automático de Saldos (3 puntos)
    - Sub-task 9.1.3.1: Crear trigger para actualizar saldo al insertar pago
    - Sub-task 9.1.3.2: Crear trigger para actualizar saldo al eliminar pago

---

## 📅 SPRINT 4: Inventario, Reportes y Mejoras
**Fecha de inicio**: 28/11/2025  
**Fecha de fin**: 12/12/2025  
**Duración**: 2 semanas  
**Puntos estimados**: ~42 puntos

### Objetivo del Sprint
Completar módulos secundarios importantes: inventario, reportes y mejoras del sistema.

### Actividades del Sprint

#### EPIC 10: GESTIÓN DE INVENTARIO
- **Story 10.1**: Control de Inventario por Evento (8 puntos)
  - Task 10.1.1: Implementar Modelo de Inventario (5 puntos)
    - Sub-task 10.1.1.1: Implementar asignar_producto_a_evento()
    - Sub-task 10.1.1.2: Implementar actualizar_estado_inventario()
    - Sub-task 10.1.1.3: Implementar verificar_disponibilidad()
  - Task 10.1.2: Implementar Vista de Inventario (3 puntos)
    - Sub-task 10.1.2.1: Crear interfaz de gestión de inventario

#### EPIC 12: REPORTES Y MÉTRICAS
- **Story 12.1**: Sistema de Reportes Gerenciales (8 puntos)
  - Task 12.1.1: Implementar Modelo de Reportes (5 puntos)
    - Sub-task 12.1.1.1: Implementar obtener_resumen_eventos_por_estado()
    - Sub-task 12.1.1.2: Implementar obtener_resumen_financiero()
    - Sub-task 12.1.1.3: Implementar obtener_estadisticas_eventos()
  - Task 12.1.2: Implementar Vista de Reportes (3 puntos)
    - Sub-task 12.1.2.1: Crear interfaz de reportes con gráficos/tablas

#### EPIC 15: INTERFAZ DE USUARIO Y UX
- **Story 15.2**: Mejoras de UX y Validaciones (8 puntos)
  - Task 15.2.1: Implementar Validaciones de Formularios (5 puntos)
    - Sub-task 15.2.1.1: Implementar validaciones en todos los formularios
  - Task 15.2.2: Mejorar Mensajes y Alertas (3 puntos)
    - Sub-task 15.2.2.1: Implementar mensajes informativos, de error y confirmación

#### EPIC 17: MEJORAS Y OPTIMIZACIONES
- **Story 17.3**: Mejoras de Eliminación (Categorías y Salones) (3 puntos)
  - Task 17.3.1: Mejorar Eliminación de Categorías (2 puntos)
    - Sub-task 17.3.1.1: Mejorar método de eliminación con validación de dependencias
  - Task 17.3.2: Mejorar Eliminación de Salones (1 punto)
    - Sub-task 17.3.2.1: Mejorar método de eliminación con validación de dependencias

#### EPIC 5: GESTIÓN DE PRODUCTOS Y SERVICIOS
- **Story 5.1**: (Continuación)
  - Task 5.1.3: Importación desde Catálogo PDF (3 puntos)
    - Sub-task 5.1.3.1: Crear script para procesar PDF de productos

#### EPIC 7: GESTIÓN DE PLANES Y PAQUETES
- **Story 7.1**: (Continuación)
  - Task 7.1.3: Importación desde Catálogos PDF (3 puntos)
    - Sub-task 7.1.3.1: Crear script para procesar PDFs de paquetes
    - Sub-task 7.1.3.2: Generar nombres descriptivos con capacidad y salón

#### EPIC 16: UTILIDADES Y HERRAMIENTAS
- **Story 16.1**: Scripts de Utilidades (5 puntos)
  - Task 16.1.1: Crear Scripts de Utilidades (5 puntos)
    - Sub-task 16.1.1.1: Crear script de backup de BD
    - Sub-task 16.1.1.2: Crear scripts de verificación
    - Sub-task 16.1.1.3: Crear script de procesamiento de catálogos

#### EPIC 17: MEJORAS Y OPTIMIZACIONES
- **Story 17.2**: Consolidación de Datos del Catálogo (5 puntos)
  - Task 17.2.1: Crear Script de Consolidación (5 puntos)
    - Sub-task 17.2.1.1: Crear script para procesar todos los PDFs
    - Sub-task 17.2.1.2: Generar SQL consolidado con nombres descriptivos

---

## 📅 SPRINT 5: Promociones, Notificaciones e Integraciones
**Fecha de inicio**: 12/12/2025  
**Fecha de fin**: 26/12/2025  
**Duración**: 2 semanas  
**Puntos estimados**: ~36 puntos

### Objetivo del Sprint
Implementar funcionalidades adicionales: promociones, notificaciones e integraciones básicas.

### Actividades del Sprint

#### EPIC 11: GESTIÓN DE PROMOCIONES
- **Story 11.1**: Sistema de Promociones y Descuentos (8 puntos)
  - Task 11.1.1: Implementar Modelo de Promociones (5 puntos)
    - Sub-task 11.1.1.1: Implementar CRUD de promociones
    - Sub-task 11.1.1.2: Implementar validación de vigencia
  - Task 11.1.2: Implementar Vista de Promociones (3 puntos)
    - Sub-task 11.1.2.1: Crear interfaz de gestión de promociones

#### EPIC 13: NOTIFICACIONES Y COMUNICACIONES
- **Story 13.1**: Sistema de Notificaciones Automáticas (8 puntos)
  - Task 13.1.1: Implementar Sistema de Notificaciones (5 puntos)
    - Sub-task 13.1.1.1: Crear modelo de notificaciones
    - Sub-task 13.1.1.2: Implementar enviar_notificacion_pago()
    - Sub-task 13.1.1.3: Implementar enviar_notificacion_evento()
  - Task 13.1.2: Implementar Vista de Notificaciones (3 puntos)
    - Sub-task 13.1.2.1: Crear interfaz de notificaciones

#### EPIC 14: INTEGRACIONES EXTERNAS
- **Story 14.2**: Integración con Email (5 puntos)
  - Task 14.2.1: Implementar Módulo de Email (5 puntos)
    - Sub-task 14.2.1.1: Crear módulo de integración Email
    - Sub-task 14.2.1.2: Crear script de configuración de email

- **Story 14.1**: Integración con WhatsApp (5 puntos)
  - Task 14.1.1: Implementar Módulo de WhatsApp (5 puntos)
    - Sub-task 14.1.1.1: Crear módulo de integración WhatsApp

- **Story 14.3**: Integración con Google Sheets (5 puntos)
  - Task 14.3.1: Implementar Módulo de Google Sheets (5 puntos)
    - Sub-task 14.3.1.1: Crear módulo de integración Google Sheets

#### EPIC 18: DOCUMENTACIÓN
- **Story 18.1**: Documentación Técnica (5 puntos)
  - Task 18.1.1: Crear Documentación Completa (5 puntos)
    - Sub-task 18.1.1.1: Actualizar README con objetivo, antecedentes, requerimientos
    - Sub-task 18.1.1.2: Documentar arquitectura y módulos

---

## 📅 SPRINT 6: Documentación de Requerimientos y Plan de Pruebas
**Fecha de inicio**: 26/12/2025  
**Fecha de fin**: 2/1/2026  
**Duración**: 1 semana  
**Puntos estimados**: ~39 puntos

### Objetivo del Sprint
Completar la documentación de requerimientos y establecer el plan de pruebas.

### Actividades del Sprint

#### EPIC 19: LEVANTAMIENTO Y DOCUMENTACIÓN DE REQUERIMIENTOS
- **Story 19.1**: Levantamiento de Requerimientos Funcionales (8 puntos)
  - Task 19.1.1: Análisis del Negocio y Contexto (3 puntos)
    - Sub-task 19.1.1.1: Realizar entrevistas con stakeholders
    - Sub-task 19.1.1.2: Documentar contexto del negocio y problemas identificados
  - Task 19.1.2: Documentación de Requerimientos Funcionales (5 puntos)
    - Sub-task 19.1.2.1: Documentar RF-01 a RF-06
    - Sub-task 19.1.2.2: Documentar RF-07 a RF-11

- **Story 19.2**: Levantamiento de Requerimientos No Funcionales (5 puntos)
  - Task 19.2.1: Documentar Requerimientos No Funcionales (5 puntos)
    - Sub-task 19.2.1.1: Documentar RNF-01 a RNF-04
    - Sub-task 19.2.1.2: Documentar RNF-05 a RNF-08

- **Story 19.3**: Documentación de Casos de Uso (8 puntos)
  - Task 19.3.1: Documentar Casos de Uso por Módulo (5 puntos)
    - Sub-task 19.3.1.1: Documentar casos de uso de módulos core
    - Sub-task 19.3.1.2: Documentar casos de uso de módulos secundarios
  - Task 19.3.2: Crear Diagramas de Flujo (3 puntos)
    - Sub-task 19.3.2.1: Crear diagrama de flujo de creación de eventos
    - Sub-task 19.3.2.2: Crear diagrama de flujo de registro de pagos
    - Sub-task 19.3.2.3: Crear diagrama de flujo de autenticación y navegación

- **Story 19.4**: Documentación de Arquitectura y Diseño (5 puntos)
  - Task 19.4.1: Documentar Arquitectura del Sistema (3 puntos)
    - Sub-task 19.4.1.1: Crear diagrama de arquitectura en capas
    - Sub-task 19.4.1.2: Documentar separación de responsabilidades (Modelo-Vista)
  - Task 19.4.2: Documentar Diseño de Base de Datos (2 puntos)
    - Sub-task 19.4.2.1: Crear diagrama ERD (Entidad-Relación)

#### EPIC 20: PRUEBAS Y CERTIFICACIÓN
- **Story 20.1**: Plan de Pruebas (5 puntos)
  - Task 20.1.1: Crear Plan de Pruebas (5 puntos)
    - Sub-task 20.1.1.1: Definir estrategia de pruebas
    - Sub-task 20.1.1.2: Crear matriz de trazabilidad requerimientos-pruebas

- **Story 20.6**: Scripts de Verificación y Validación (8 puntos)
  - Task 20.6.1: Crear Scripts de Verificación de Base de Datos (5 puntos)
    - Sub-task 20.6.1.1: Crear script verificar_bd.py
    - Sub-task 20.6.1.2: Crear scripts de verificación por tabla
  - Task 20.6.2: Crear Scripts de Verificación de Configuración (3 puntos)
    - Sub-task 20.6.2.1: Crear script verificar_configuracion_email.py
    - Sub-task 20.6.2.2: Crear script verificar_foreign_keys.py

---

## 📅 SPRINT 7: Pruebas y Certificación Final
**Fecha de inicio**: 2/1/2026  
**Fecha de fin**: 5/1/2026  
**Duración**: 3 días (sprint corto para cierre)  
**Puntos estimados**: ~45 puntos

### Objetivo del Sprint
Ejecutar pruebas completas y certificar el sistema para producción.

### Actividades del Sprint

#### EPIC 20: PRUEBAS Y CERTIFICACIÓN
- **Story 20.2**: Pruebas Unitarias (13 puntos)
  - Task 20.2.1: Pruebas Unitarias de Modelos Core (8 puntos)
    - Sub-task 20.2.1.1: Pruebas unitarias de BaseDatos
    - Sub-task 20.2.1.2: Pruebas unitarias de Autenticación
    - Sub-task 20.2.1.3: Pruebas unitarias de EventoModelo
    - Sub-task 20.2.1.4: Pruebas unitarias de PagoModelo
  - Task 20.2.2: Pruebas Unitarias de Modelos Secundarios (5 puntos)
    - Sub-task 20.2.2.1: Pruebas unitarias de ProductoModelo, PlanModelo, ClienteModelo
    - Sub-task 20.2.2.2: Pruebas unitarias de CategoriaModelo, SalonModelo, InventarioModelo

- **Story 20.3**: Pruebas de Integración (13 puntos)
  - Task 20.3.1: Pruebas de Integración de Flujos Principales (8 puntos)
    - Sub-task 20.3.1.1: Prueba de flujo completo: Login → Crear Evento → Registrar Pago
    - Sub-task 20.3.1.2: Prueba de flujo: Crear Producto → Asociar a Plan → Crear Evento con Plan
    - Sub-task 20.3.1.3: Prueba de flujo: Cambiar Estado de Evento → Actualizar Inventario
  - Task 20.3.2: Pruebas de Integración con Base de Datos (5 puntos)
    - Sub-task 20.3.2.1: Validar triggers de actualización de saldo
    - Sub-task 20.3.2.2: Validar integridad referencial (Foreign Keys)
    - Sub-task 20.3.2.3: Validar procedimientos almacenados

- **Story 20.4**: Pruebas de Sistema (21 puntos)
  - Task 20.4.1: Pruebas Funcionales por Módulo (13 puntos)
    - Sub-task 20.4.1.1: Pruebas de módulo de Autenticación y Usuarios
    - Sub-task 20.4.1.2: Pruebas de módulo de Clientes
    - Sub-task 20.4.1.3: Pruebas de módulo de Productos y Categorías
    - Sub-task 20.4.1.4: Pruebas de módulo de Salones
    - Sub-task 20.4.1.5: Pruebas de módulo de Planes y Paquetes
    - Sub-task 20.4.1.6: Pruebas de módulo de Eventos
    - Sub-task 20.4.1.7: Pruebas de módulo de Pagos
  - Task 20.4.2: Pruebas de Módulos Secundarios (5 puntos)
    - Sub-task 20.4.2.1: Pruebas de módulo de Inventario
    - Sub-task 20.4.2.2: Pruebas de módulo de Promociones
    - Sub-task 20.4.2.3: Pruebas de módulo de Reportes
  - Task 20.4.3: Pruebas No Funcionales (3 puntos)
    - Sub-task 20.4.3.1: Pruebas de rendimiento
    - Sub-task 20.4.3.2: Pruebas de seguridad

- **Story 20.5**: Pruebas de Aceptación de Usuario (UAT) (13 puntos)
  - Task 20.5.1: UAT con Administradores (5 puntos)
    - Sub-task 20.5.1.1: Sesión de pruebas con administradores
    - Sub-task 20.5.1.2: Documentar feedback y issues
  - Task 20.5.2: UAT con Coordinadores (5 puntos)
    - Sub-task 20.5.2.1: Sesión de pruebas con coordinadores
    - Sub-task 20.5.2.2: Validar flujos de gestión de eventos e inventario
  - Task 20.5.3: UAT con Gerentes (3 puntos)
    - Sub-task 20.5.3.1: Sesión de pruebas con gerentes
    - Sub-task 20.5.3.2: Validar reportes y métricas

- **Story 20.7**: Certificación y Validación Final (8 puntos)
  - Task 20.7.1: Revisión Final de Pruebas (3 puntos)
    - Sub-task 20.7.1.1: Revisar resultados de todas las pruebas
    - Sub-task 20.7.1.2: Validar cobertura de pruebas
  - Task 20.7.2: Documentación de Certificación (3 puntos)
    - Sub-task 20.7.2.1: Crear informe de certificación
    - Sub-task 20.7.2.2: Documentar issues conocidos y limitaciones
  - Task 20.7.3: Aprobación Final (2 puntos)
    - Sub-task 20.7.3.1: Presentar sistema a stakeholders para aprobación

- **Story 20.8**: Pruebas de Regresión (5 puntos)
  - Task 20.8.1: Crear Suite de Pruebas de Regresión (5 puntos)
    - Sub-task 20.8.1.1: Identificar casos de prueba críticos para regresión
    - Sub-task 20.8.1.2: Automatizar pruebas de regresión

---

## 📊 RESUMEN DE SPRINTS

| Sprint | Fechas | Duración | Puntos Estimados | Enfoque Principal |
|--------|--------|----------|------------------|-------------------|
| **Sprint 1** | 17/10/2025 - 31/10/2025 | 2 semanas | ~42 puntos | Infraestructura Base y Autenticación |
| **Sprint 2** | 31/10/2025 - 14/11/2025 | 2 semanas | ~40 puntos | Gestión de Usuarios, Clientes y Productos |
| **Sprint 3** | 14/11/2025 - 28/11/2025 | 2 semanas | ~47 puntos | Planes, Eventos y Pagos Core |
| **Sprint 4** | 28/11/2025 - 12/12/2025 | 2 semanas | ~42 puntos | Inventario, Reportes y Mejoras |
| **Sprint 5** | 12/12/2025 - 26/12/2025 | 2 semanas | ~36 puntos | Promociones, Notificaciones e Integraciones |
| **Sprint 6** | 26/12/2025 - 2/1/2026 | 1 semana | ~39 puntos | Documentación y Plan de Pruebas |
| **Sprint 7** | 2/1/2026 - 5/1/2026 | 3 días | ~45 puntos | Pruebas y Certificación Final |
| **TOTAL** | 17/10/2025 - 5/1/2026 | ~11.4 semanas | **~291 puntos** | Sistema Completo |

### Notas Importantes:
- **Sprint 7** es un sprint corto (3 días) enfocado en pruebas finales y certificación
- Las estimaciones pueden ajustarse según la velocidad real del equipo
- Se recomienda realizar retrospectivas al final de cada sprint
- Los sprints están diseñados para permitir entregas incrementales y funcionales

