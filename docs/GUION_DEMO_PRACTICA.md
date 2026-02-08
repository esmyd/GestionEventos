# Guion práctico: Demostración paso a paso del sistema

## Guía detallada para preparar y ejecutar la demo en vivo

---

## Índice

0. [Presentación inicial: Visión completa de la plataforma](#0-presentación-inicial-visión-completa-de-la-plataforma)
   - [Diagrama general de la plataforma](#diagrama-visual-para-mostrar-dibuja-en-pizarra-o-muestra-en-slide)
   - [Diagramas de comunicación: WhatsApp (Bot) y Email](#diagramas-de-comunicación-whatsapp-bot-y-email)
1. [Preparación previa (antes de la reunión)](#1-preparación-previa-antes-de-la-reunión)
2. [Orden de la demostración en vivo](#2-orden-de-la-demostración-en-vivo)
3. [Script detallado por pantalla](#3-script-detallado-por-pantalla)
4. [Consideraciones importantes](#4-consideraciones-importantes)
5. [Checklist final](#5-checklist-final)

---

## 0. Presentación inicial: Visión completa de la plataforma

### ⚡ ANTES de tocar el sistema, impacta con la visión general (3-5 min)

Este es el momento de "vender el todo" antes de mostrar las partes.

---

### Discurso de apertura

> *"Antes de entrar al sistema, quiero mostrarles qué es lo que van a tener en las manos. No es solo un programa para hacer eventos. Es una plataforma completa que conecta TODAS las áreas de su negocio."*

---

### Diagrama visual para mostrar (dibuja en pizarra o muestra en slide)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PLATAFORMA DE GESTIÓN DE EVENTOS                       │
│                           ━━━━━━━━━━━━━━━━━━━━━                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│    │   CLIENTES   │────────▶│   EVENTOS    │────────▶│    PAGOS     │       │
│    │              │         │              │         │              │       │
│    │ • Registro   │         │ • Cotización │         │ • Abonos     │       │
│    │ • Historial  │         │ • Confirmado │         │ • Saldos     │       │
│    │ • Contacto   │         │ • En proceso │         │ • Historial  │       │
│    │ • Portal web │         │ • Completado │         │ • Alertas    │       │
│    └──────────────┘         └──────────────┘         └──────────────┘       │
│           │                        │                        │               │
│           │                        │                        │               │
│           ▼                        ▼                        ▼               │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │                        CATÁLOGO BASE                            │      │
│    ├─────────────┬─────────────┬─────────────┬───────────────────────┤      │
│    │   SALONES   │  PRODUCTOS  │   PLANES    │    CONFIRMACIONES     │      │
│    │             │             │             │                       │      │
│    │ • Capacidad │ • Precios   │ • Paquetes  │ • Color mantelería    │      │
│    │ • Ubicación │ • Stock     │ • Incluidos │ • Menú / Decoración   │      │
│    │ • Disponib. │ • Variantes │ • Duración  │ • Requerimientos      │      │
│    └─────────────┴─────────────┴─────────────┴───────────────────────┘      │
│                                    │                                        │
│           ┌────────────────────────┼────────────────────────┐               │
│           ▼                        ▼                        ▼               │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│    │  INVENTARIO  │         │  REPORTES    │         │ COMUNICACIÓN │       │
│    │              │         │              │         │              │       │
│    │ • Stock      │         │ • Ingresos   │         │ • WhatsApp   │       │
│    │ • Reservas   │         │ • Pendientes │         │ • Email      │       │
│    │ • Por fecha  │         │ • Por mes    │         │ • Plantillas │       │
│    │ • Asignación │         │ • Exportar   │         │ • Automático │       │
│    └──────────────┘         └──────────────┘         └──────────────┘       │
│                                    │                                        │
│                                    ▼                                        │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │                      CONTROL DE ACCESO                          │      │
│    ├──────────────┬──────────────┬──────────────┬────────────────────┤      │
│    │    ADMIN     │ COORDINADOR  │   GERENTE    │      CLIENTE       │      │
│    │              │              │              │                    │      │
│    │ Todo acceso  │ Sus eventos  │ Reportes     │ Su evento y saldo  │      │
│    │ Config. gral │ Coordinar    │ Métricas     │ Confirmar detalles │      │
│    │ Usuarios     │ Notas        │ Supervisar   │ Ver pagos          │      │
│    └──────────────┴──────────────┴──────────────┴────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Script para explicar el diagrama

**Bloque 1: El flujo principal**

> *"El flujo principal es simple: entra un CLIENTE, se crea un EVENTO y se gestionan los PAGOS. Todo conectado. El cliente que registran hoy queda vinculado a todos sus eventos futuros. Y cada evento tiene su historial de pagos."*

**Bloque 2: El catálogo base**

> *"Pero para crear un evento, necesitan tener configurado su catálogo. Eso incluye:"*
>
> - *"SALONES: sus espacios disponibles con capacidad y ubicación"*
> - *"PRODUCTOS: todo lo que ofrecen (DJ, decoración, bocaditos, mobiliario)"*
> - *"PLANES: sus paquetes predefinidos que combinan productos y servicios"*
> - *"CONFIRMACIONES: qué debe confirmar el cliente antes del evento (color, menú, lista de invitados)"*
>
> *"Esto lo configuran UNA VEZ y después solo seleccionan."*

**Bloque 3: Módulos de soporte**

> *"Además tienen:"*
>
> - *"INVENTARIO: si manejan sillas, mesas, equipos... saben qué está disponible y qué está reservado"*
> - *"REPORTES: ingresos, pendientes por cobrar, eventos del mes. En tiempo real, no sumando en Excel"*
> - *"COMUNICACIÓN: WhatsApp y email integrados. Envían recordatorios de pago con un clic"*

**Bloque 4: Control de acceso**

> *"Y lo más importante: cada persona ve solo lo que le corresponde."*
>
> - *"El ADMINISTRADOR tiene acceso total"*
> - *"El COORDINADOR ve solo sus eventos asignados"*
> - *"El GERENTE ve reportes y métricas para supervisar"*
> - *"El CLIENTE ve su evento, su saldo y confirma detalles desde su celular"*
>
> *"Nadie se pisa. Todos trabajan en la misma plataforma pero cada uno en su espacio."*

---

### Lista rápida de TODO lo que incluye la plataforma

Usa esta lista para impactar con la cantidad de funciones:

> *"En resumen, con esta plataforma van a tener:"*

| Área | Funciones |
|------|-----------|
| **Clientes** | Registro, historial, contacto, portal web propio |
| **Eventos** | Cotización, confirmación, seguimiento de estado, asignación de coordinador |
| **Pagos** | Abonos, múltiples métodos, saldos automáticos, historial, alertas de vencimiento |
| **Catálogo** | Salones, productos, planes/paquetes, categorías, precios, variantes |
| **Inventario** | Stock, disponibilidad por fecha, reservas, asignación a eventos |
| **Reportes** | Ingresos, pendientes, eventos por estado, exportar a Excel/PDF |
| **Comunicación** | WhatsApp chat, plantillas, email, notificaciones automáticas |
| **Documentos** | Cotización PDF, contrato PDF, generación automática |
| **Usuarios** | Roles (admin, coordinador, gerente, cliente), permisos por módulo |
| **Portal cliente** | Ver evento, saldo, confirmar detalles, historial de pagos |
| **Calendario** | Vista de eventos por mes, disponibilidad de salones |
| **Configuración** | Planes de suscripción, módulos activos, límites |

> *"Son más de 50 funciones integradas en una sola plataforma. Todo lo que hoy hacen en Excel, Word, WhatsApp y cuadernos... aquí está en un solo lugar."*

---

### Diagramas de comunicación: WhatsApp (Bot) y Email

Cuando llegues al bloque de **COMUNICACIÓN**, puedes mostrar estos diagramas para impactar con el detalle.

---

#### Diagrama 1: WhatsApp - Chat + Bot + Plantillas

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     WHATSAPP INTEGRADO - FLUJO COMPLETO                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                         CLIENTE (envía mensaje)                             │   │
│   │                    "Hola", "Consultar mi evento", "1", etc.                  │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│                                        ▼                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                         WEBHOOK (API de Meta)                               │   │
│   │              Recibe cada mensaje que llega al número de WhatsApp            │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│                                        ▼                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                         BOT DE RESPUESTA AUTOMÁTICA                         │   │
│   ├─────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                             │   │
│   │   MENÚ PRINCIPAL (el cliente elige con botones o texto):                    │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │   │
│   │   │ Consultar       │  │ Consultar       │  │ Registrar       │             │   │
│   │   │ mi evento       │  │ mis pagos       │  │ un pago         │             │   │
│   │   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │   │
│   │            │                    │                    │                       │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │   │
│   │   │ Direcciones     │  │ Horarios        │  │ Crear evento    │             │   │
│   │   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │   │
│   │            │                    │                    │                       │   │
│   │   ┌─────────────────┐                                                       │   │
│   │   │ Contactos       │                                                       │   │
│   │   └─────────────────┘                                                       │   │
│   │                                                                             │   │
│   │   EL BOT RESPONDE AUTOMÁTICAMENTE:                                          │   │
│   │   • Consultar evento  → Lista sus eventos, fecha, total, saldo              │   │
│   │   • Consultar pagos   → Historial de abonos y saldo pendiente               │   │
│   │   • Registrar pago    → Guía para registrar abono (monto, método, ref)      │   │
│   │   • Crear evento      → Conversación guiada (tipo, fecha, invitados)        │   │
│   │   • Direcciones       → Ubicación de salones                                │   │
│   │   • Horarios          → Horarios de atención                                │   │
│   │   • Contactos         → Teléfonos de contacto                               │   │
│   │                                                                             │   │
│   │   VENTANA 24H: Si el cliente no escribe hace 24h, el bot usa                │   │
│   │   PLANTILLAS de Meta para reabrir la conversación (re-engagement)           │   │
│   │                                                                             │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│           ┌────────────────────────────┼────────────────────────────┐               │
│           ▼                            ▼                            ▼               │
│   ┌───────────────┐          ┌──────────────────┐          ┌──────────────────┐    │
│   │ INBOX CHAT    │          │ PLANTILLAS       │          │ NOTIFICACIONES   │    │
│   │               │          │ (Templates)      │          │ AUTOMÁTICAS      │    │
│   │ • Ver hilos   │          │                  │          │                  │    │
│   │ • Responder   │          │ • Recordatorio   │          │ • Evento creado  │    │
│   │   manualmente │          │   de pago        │          │ • Recordatorio   │    │
│   │ • Asignar a   │          │ • Confirmación   │          │   evento         │    │
│   │   coordinador │          │ • Re-apertura    │          │ • Saldo          │    │
│   │ • Historial   │          │   de chat (24h)  │          │   pendiente      │    │
│   └───────────────┘          └──────────────────┘          └──────────────────┘    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Script para explicar:**
> *"El WhatsApp está totalmente integrado. Cuando un cliente les escribe, entra por webhook al sistema. Un BOT les responde automáticamente: puede consultar su evento, sus pagos, registrar un abono, pedir direcciones u horarios, o incluso iniciar la creación de un evento. Ustedes también pueden entrar al inbox y responder manualmente si hace falta. Y las plantillas sirven para recordatorios de pago, confirmaciones y para reabrir la conversación si pasaron más de 24 horas sin mensajes."*

---

#### Diagrama 2: Email integrado

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           EMAIL INTEGRADO - NOTIFICACIONES                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                    SISTEMA DE NOTIFICACIONES                                │   │
│   │              (configurable por tipo: email, WhatsApp o ambos)               │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│          ┌─────────────────────────────┼─────────────────────────────┐              │
│          ▼                             ▼                             ▼              │
│   ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐     │
│   │ EVENTO CREADO    │        │ RECORDATORIO     │        │ RECORDATORIO     │     │
│   │                  │        │ DEL EVENTO       │        │ VALORES          │     │
│   │ Cuando se crea   │        │                  │        │ PENDIENTES       │     │
│   │ una cotización   │        │ Días antes del   │        │                  │     │
│   │ o se confirma    │        │ evento (ej: 7d)  │        │ Cliente con      │     │
│   │ el evento        │        │                  │        │ saldo pendiente  │     │
│   │                  │        │ "Tu evento X     │        │                  │     │
│   │ "Hemos recibido  │        │  es el día Y"    │        │ "Recuerda tu     │     │
│   │  tu reserva..."  │        │                  │        │  saldo de $Z"    │     │
│   └──────────────────┘        └──────────────────┘        └──────────────────┘     │
│          │                             │                             │              │
│          └─────────────────────────────┼─────────────────────────────┘              │
│                                        │                                            │
│                                        ▼                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                    INTEGRACIÓN EMAIL (SMTP)                                 │   │
│   ├─────────────────────────────────────────────────────────────────────────────┤   │
│   │  • Servidor SMTP configurable (Gmail, Outlook, propio)                      │   │
│   │  • Plantillas HTML con variables: {nombre_cliente}, {fecha_evento},         │   │
│   │    {total}, {saldo}, {nombre_evento}, etc.                                  │   │
│   │  • Destinatarios adicionales: gerencia, coordinador, copia                  │   │
│   │  • Registro de envíos (historial, costos)                                   │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                            │
│                                        ▼                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                         CLIENTE recibe email                                │   │
│   │  "Hola María, tu evento Boda de María y Juan está confirmado para..."       │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Script para explicar:**
> *"El email también está integrado. Configuran una vez el servidor (Gmail, Outlook o el que usen) y el sistema envía automáticamente: cuando crean un evento, cuando confirman, recordatorios X días antes del evento, y recordatorios de saldo pendiente. Cada tipo de notificación se puede activar o desactivar, y elegir si va por email, WhatsApp o ambos."*

---

#### Diagrama 3: Flujo unificado WhatsApp + Email

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│              FLUJO UNIFICADO: UN EVENTO → MÚLTIPLES CANALES                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ACCIÓN EN EL SISTEMA                    CANAL(ES)           DESTINATARIO          │
│   ─────────────────────────────────────────────────────────────────────────────     │
│                                                                                     │
│   Se crea evento (cotización)      ──▶   Email + WhatsApp  ──▶  Cliente             │
│   Se confirma evento               ──▶   Email + WhatsApp  ──▶  Cliente             │
│   Se registra un pago              ──▶   (opcional)         ──▶  Cliente             │
│   7 días antes del evento          ──▶   Email + WhatsApp  ──▶  Cliente             │
│   Recordatorio saldo pendiente     ──▶   Email + WhatsApp  ──▶  Cliente             │
│   Cliente escribe por WhatsApp     ──▶   BOT responde       ──▶  Cliente             │
│   Operador responde manual         ──▶   Chat WhatsApp      ──▶  Cliente             │
│   Envío de plantilla (campaña)     ──▶   WhatsApp Template   ──▶  Cliente/Lista      │
│                                                                                     │
│   ─────────────────────────────────────────────────────────────────────────────     │
│   TODO configurably por tipo de notificación. Pueden elegir email, WhatsApp o ambos.│
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Script para explicar:**
> *"En resumen: un solo evento dispara notificaciones por email y WhatsApp según cómo lo configuren. Y el cliente puede escribirles por WhatsApp y el bot les responde solo. Ustedes solo intervienen cuando hace falta."*

---

### Frase de cierre antes de la demo

> *"Ahora les voy a mostrar cómo funciona en la práctica. Vamos a crear un evento desde cero: registro de cliente, selección de paquete, cotización automática, registro de pagos y cómo lo ve el cliente. ¿Listos?"*

---

### Tiempo total de esta sección: 3-5 minutos (sin diagramas de comunicación) / 5-7 min (con diagramas)

**Tip:** Si tienes proyector, muestra el diagrama. Si no, dibújalo en pizarra mientras hablas. El impacto visual refuerza el mensaje. Los diagramas de WhatsApp y Email son opcionales pero muy impactantes si el cliente pregunta por la comunicación.

---

## 1. Preparación previa (antes de la reunión)

### ⚠️ IMPORTANTE: Todo esto se hace ANTES de la demo con el cliente

El cliente NO debe verte configurando el sistema. Debe ver un sistema ya funcionando.

---

### Paso 1.1: Limpiar datos de prueba antiguos

**Dónde:** Panel de administrador → Configuraciones → Limpieza de datos

**Qué hacer:**
- Eliminar eventos de prueba viejos
- Eliminar clientes de ejemplo que no vas a usar
- Dejar solo datos limpios y coherentes

**Tiempo:** 5 minutos

---

### Paso 1.2: Configurar usuarios y roles

**Dónde:** Usuarios → Crear usuarios

**Usuarios que debes tener listos:**

| Usuario | Rol | Contraseña | Para qué |
|---------|-----|------------|----------|
| `admin` | Administrador | `admin123` | Tu usuario principal para la demo |
| `coordinador1` | Coordinador | `coord123` | Mostrar vista de coordinador |
| `gerente` | Gerente General | `gerente123` | Mostrar reportes gerenciales |
| `cliente_demo` | Cliente | `cliente123` | Mostrar portal del cliente |

**Dónde:** Permisos → Roles y permisos

**Qué verificar:**
- Coordinador puede ver solo sus eventos asignados
- Gerente puede ver reportes
- Cliente puede ver solo su evento

**Tiempo:** 10 minutos

---

### Paso 1.3: Configurar catálogo base

#### A) Crear categorías de productos

**Dónde:** Categorías

**Categorías mínimas para la demo:**
1. Paquetes y planes
2. Bebidas y cocteles
3. Bocaditos
4. Decoración
5. Entretenimiento
6. Mobiliario

**Tiempo:** 3 minutos

---

#### B) Crear salones

**Dónde:** Salones

**Salones para la demo:**

| Nombre | Capacidad | Ubicación | Descripción |
|--------|-----------|-----------|-------------|
| Salón Brisas de Lirio | 150 personas | Planta baja | Salón principal con jardín |
| Salón Pétalo | 80 personas | Segundo piso | Salón íntimo con terraza |

**Tiempo:** 3 minutos

---

#### C) Crear productos básicos

**Dónde:** Productos

**Productos mínimos para la demo:**

| Nombre | Categoría | Precio | Stock | Descripción |
|--------|-----------|--------|-------|-------------|
| Bocaditos variados (50 pzas) | Bocaditos | $250 | 100 | Surtido de bocaditos de sal |
| Coctel de frutas (jarra 2L) | Bebidas | $180 | 50 | Coctel natural de frutas |
| Arreglo floral mesa | Decoración | $350 | 30 | Arreglo de flores naturales |
| DJ profesional (4 horas) | Entretenimiento | $2,500 | - | DJ con equipo de sonido |
| Sillas tiffany (c/u) | Mobiliario | $45 | 200 | Silla tiffany blanca |

**Tiempo:** 10 minutos

---

#### D) Crear planes/paquetes

**Dónde:** Planes

**Planes para la demo:**

| Nombre | Capacidad | Precio base | Duración | Qué incluye |
|--------|-----------|-------------|----------|-------------|
| Paquete Boda 100 personas | 80-120 | $45,000 | 6 horas | Salón, mesas, sillas, mantelería, decoración básica |
| Paquete XV Años 80 personas | 60-100 | $32,000 | 5 horas | Salón, mobiliario, DJ, decoración temática |
| Paquete Cumpleaños 50 personas | 30-70 | $18,000 | 4 horas | Salón pequeño, mesas, sillas, bocadillos |

**Asociar productos a cada plan:**
- Ir a cada plan → Productos incluidos → Agregar productos base
- Ejemplo: Paquete Boda incluye 100 sillas, 10 mesas, mantelería, etc.

**Tiempo:** 15 minutos

---

#### E) Crear ítems de confirmación (opcionales)

**Dónde:** Configuración de planes → Ítems de confirmación

**Para cada plan, definir qué debe confirmar el cliente:**

Ejemplo para Paquete Boda:
- [ ] Color de mantelería (blanco, marfil, rosa)
- [ ] Tipo de centro de mesa (flores, velas, mixto)
- [ ] Menú de bocaditos (clásico, gourmet, vegetariano)
- [ ] Horario de montaje
- [ ] Lista de invitados final

**Tiempo:** 10 minutos

---

### Paso 1.4: Crear clientes de ejemplo

**Dónde:** Clientes

**Clientes para la demo:**

| Nombre | Teléfono | Email | Tipo de evento |
|--------|----------|-------|----------------|
| María González | 555-1234 | maria@email.com | Boda |
| Carlos Ramírez | 555-5678 | carlos@email.com | XV Años |
| Ana Martínez | 555-9012 | ana@email.com | Cumpleaños |

**Tiempo:** 5 minutos

---

### Paso 1.5: Crear UN evento completo de ejemplo

**Dónde:** Eventos → Nuevo evento

**Evento para mostrar flujo completo:**

- **Cliente:** María González
- **Tipo:** Boda
- **Nombre:** Boda de María y Juan
- **Fecha:** [Fecha futura, ej: 3 meses adelante]
- **Salón:** Brisas de Lirio
- **Plan:** Paquete Boda 100 personas
- **Invitados:** 100
- **Productos adicionales:**
  - DJ profesional (4 horas) - $2,500
  - 10 Arreglos florales - $3,500
  - Coctel de bienvenida - $1,800
- **Total:** $52,800
- **Estado:** Confirmado
- **Coordinador asignado:** coordinador1

**Registrar pagos:**
- Abono 1: $20,000 (transferencia) - Fecha: hace 1 mes
- Abono 2: $15,000 (efectivo) - Fecha: hace 2 semanas
- **Saldo pendiente:** $17,800

**Tiempo:** 10 minutos

---

### Resumen de tiempo de preparación

| Actividad | Tiempo |
|-----------|--------|
| Limpiar datos | 5 min |
| Usuarios y roles | 10 min |
| Categorías | 3 min |
| Salones | 3 min |
| Productos | 10 min |
| Planes | 15 min |
| Ítems confirmación | 10 min |
| Clientes | 5 min |
| Evento completo | 10 min |
| **TOTAL** | **71 min (~1h 15min)** |

---

## 2. Orden de la demostración en vivo

### Estructura de la demo (30-35 minutos)

```
[SECCIÓN 0] IMPACTO INICIAL - Visión de la plataforma (3-5 min)
    │
    │   "Esto es TODO lo que van a tener"
    │   Diagrama + lista de funciones
    │
    ↓
[PARTE 1] Login y Dashboard (2 min)
    │
    │   Entrar al sistema, mostrar panel principal
    │
    ↓
[PARTE 2] Flujo completo: Cliente → Evento → Cotización (8 min)
    │
    │   Crear cliente → Crear evento → Agregar plan y productos
    │   → Generar cotización PDF → Confirmar evento
    │
    ↓
[PARTE 3] Gestión de pagos (3 min)
    │
    │   Registrar abono → Ver saldo → Alertas de pendientes
    │
    ↓
[PARTE 4] Vista del coordinador (2 min)
    │
    │   Login como coordinador → Ver solo sus eventos
    │   → Marcar confirmaciones → Agregar notas
    │
    ↓
[PARTE 5] Reportes gerenciales (3 min)
    │
    │   Ingresos del mes → Pendientes → Eventos por estado
    │   → Exportar a Excel/PDF
    │
    ↓
[PARTE 6] Portal del cliente (2 min)
    │
    │   Login como cliente → Ver su evento → Ver saldo
    │   → Confirmar detalles (color, menú, etc.)
    │
    ↓
[PARTE 7] Módulos adicionales (2 min)
    │
    │   WhatsApp → Inventario → Calendario
    │
    ↓
[CIERRE] Resumen, preguntas y siguiente paso (5 min)
```

### Flujo visual resumido

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   [0] IMPACTO     [1] LOGIN      [2] CREAR       [3] PAGOS             │
│       INICIAL  ─▶    PANEL   ─▶    EVENTO    ─▶   ABONOS              │
│                                                                         │
│       3-5 min       2 min         8 min          3 min                  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [4] COORDINADOR  [5] REPORTES   [6] PORTAL     [7] EXTRAS            │
│       SUS EVENTOS ─▶   GERENTE  ─▶   CLIENTE  ─▶   WhatsApp            │
│                                                                         │
│       2 min           3 min         2 min         2 min                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [CIERRE] Resumen + Preguntas + Siguiente paso                        │
│                                                                         │
│       5 min                                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

                    TIEMPO TOTAL: 30-35 minutos
```

---

## 3. Script detallado por pantalla

---

### SECCIÓN 0: Impacto inicial - Visión de la plataforma (3-5 min)

**⚠️ ESTO ES LO PRIMERO. Antes de tocar el sistema.**

**Qué hacer:**
1. Mostrar el diagrama de la plataforma (en slide, pizarra o impreso)
2. Explicar cada bloque mientras señalas
3. Mencionar la cantidad de funciones (+50)
4. Cerrar con la transición a la demo

**Script completo:**

> *"Antes de entrar al sistema, quiero que vean qué es lo que van a tener en las manos. No es solo un programa para hacer eventos. Es una plataforma completa que conecta TODAS las áreas de su negocio."*

**[Señalar el flujo principal: Cliente → Evento → Pagos]**

> *"El flujo principal es simple: entra un cliente, se crea un evento y se gestionan los pagos. Todo conectado. El cliente que registran hoy queda vinculado a todos sus eventos futuros."*

**[Señalar el catálogo base]**

> *"Pero para crear un evento, necesitan tener configurado su catálogo: salones con capacidad, productos con precios, planes o paquetes predefinidos. Esto lo configuran UNA VEZ y después solo seleccionan."*

**[Señalar los módulos de soporte]**

> *"Además tienen: inventario para controlar stock, reportes en tiempo real (no sumando en Excel) y comunicación integrada con WhatsApp y email."*

**[Señalar el control de acceso]**

> *"Y lo más importante: cada persona ve solo lo que le corresponde. El administrador tiene todo, el coordinador solo sus eventos, el gerente ve reportes, y el cliente ve su evento desde su celular."*

**[Cierre]**

> *"En total son más de 50 funciones integradas. Todo lo que hoy hacen en Excel, Word, WhatsApp y cuadernos... aquí está en un solo lugar."*
>
> *"Ahora les muestro cómo funciona. Vamos a crear un evento desde cero. ¿Listos?"*

**Tiempo:** 3-5 minutos

---

### PARTE 1: Login y Dashboard (2 min)

#### Pantalla 1.1: Login

**Dónde:** Pantalla de login

**Qué hacer:**
1. Mostrar la pantalla de login
2. Ingresar usuario: `admin` / contraseña: `admin123`
3. Click en "Iniciar sesión"

**Qué decir:**
> *"Cada persona del equipo tiene su usuario y contraseña. Aquí entro como administrador, que tiene acceso completo. Más adelante les muestro cómo ve un coordinador o un gerente."*

**Tiempo:** 30 segundos

---

#### Pantalla 1.2: Dashboard / Panel principal

**Dónde:** Panel principal (primera pantalla después de login)

**Qué mostrar:**
- Resumen de eventos del mes
- Ingresos totales
- Saldo pendiente
- Eventos próximos

**Qué decir:**
> *"Esta es la pantalla principal. Al entrar veo un resumen: cuántos eventos tengo este mes, cuánto he vendido, cuánto me deben y qué eventos vienen pronto. Todo actualizado en tiempo real."*

**Acción:** Señalar cada métrica en pantalla.

**Tiempo:** 1 minuto

---

#### Pantalla 1.3: Menú lateral

**Dónde:** Barra lateral izquierda

**Qué mostrar:**
- Eventos
- Clientes
- Productos
- Planes
- Pagos
- Reportes
- Usuarios
- Configuración

**Qué decir:**
> *"Desde este menú accedo a todo: clientes, eventos, productos, pagos, reportes. Cada módulo está separado pero conectado. Empecemos con el flujo más común."*

**Tiempo:** 30 segundos

---

### PARTE 2: Flujo completo - Cliente nuevo → Evento → Cotización (8 min)

#### Pantalla 2.1: Crear cliente

**Dónde:** Clientes → Nuevo cliente

**Qué hacer:**
1. Click en "Clientes" en el menú
2. Click en "Nuevo cliente"
3. Llenar formulario:
   - Nombre: Pedro López
   - Teléfono: 555-3344
   - Email: pedro@email.com
   - Documento: 12345678
4. Click en "Guardar"

**Qué decir:**
> *"Llega un cliente nuevo. Lo primero es registrarlo. Nombre, teléfono, email, documento. Guardamos y ya está en la base de datos. Ahora vamos a crear su evento."*

**Tiempo:** 1 minuto

---

#### Pantalla 2.2: Crear evento - Paso 1 (Datos básicos)

**Dónde:** Eventos → Nuevo evento

**Qué hacer:**
1. Click en "Eventos" en el menú
2. Click en "Nuevo evento"
3. Llenar datos básicos:
   - Cliente: Buscar "Pedro López" (recién creado)
   - Tipo de evento: Cumpleaños
   - Nombre del evento: Cumpleaños de Pedro
   - Fecha: [Elegir fecha futura, ej: 2 meses adelante]
   - Hora: 18:00
   - Número de invitados: 50

**Qué decir:**
> *"Creo el evento. Selecciono al cliente, tipo de evento, fecha y número de invitados. El sistema me muestra solo los clientes registrados, así no hay duplicados."*

**Tiempo:** 1.5 minutos

---

#### Pantalla 2.3: Crear evento - Paso 2 (Salón y plan)

**Qué hacer:**
1. Salón: Seleccionar "Salón Pétalo" (capacidad 80, suficiente para 50)
2. Plan: Seleccionar "Paquete Cumpleaños 50 personas"
3. El sistema muestra el precio del plan: $18,000

**Qué decir:**
> *"Elijo el salón según la capacidad. El sistema me muestra solo los salones disponibles para esa fecha. Luego selecciono el paquete. Este incluye salón, mesas, sillas y bocadillos básicos por $18,000."*

**Acción:** Señalar el precio que aparece automáticamente.

**Tiempo:** 1 minuto

---

#### Pantalla 2.4: Crear evento - Paso 3 (Productos adicionales)

**Qué hacer:**
1. Click en "Agregar productos adicionales"
2. Buscar y agregar:
   - DJ profesional (4 horas) - $2,500
   - 5 Arreglos florales - $1,750
3. El sistema calcula el total automáticamente:
   - Plan: $18,000
   - Productos adicionales: $4,250
   - **Total: $22,250**

**Qué decir:**
> *"El cliente quiere DJ y decoración extra. Los agrego desde el catálogo. El sistema suma todo automáticamente. Total: $22,250. Esto es lo que le voy a cotizar."*

**Acción:** Mostrar cómo el total se actualiza solo.

**Tiempo:** 1.5 minutos

---

#### Pantalla 2.5: Guardar evento y generar cotización

**Qué hacer:**
1. Click en "Guardar evento"
2. El sistema guarda y muestra el evento creado
3. Click en "Generar cotización PDF"
4. Se descarga un PDF con:
   - Datos del cliente
   - Detalles del evento
   - Plan y productos
   - Total a pagar
   - Términos y condiciones

**Qué decir:**
> *"Guardo el evento. Ahora genero la cotización en PDF. Este documento se lo envío al cliente por email o WhatsApp. Tiene todo: qué incluye, cuánto cuesta, fecha, términos. Esto que antes tomaba 20 minutos en Excel, aquí son 3 clics."*

**Acción:** Abrir el PDF y mostrar brevemente el contenido.

**Tiempo:** 2 minutos

---

#### Pantalla 2.6: Confirmar evento

**Qué hacer:**
1. Volver a la vista del evento
2. Cambiar estado de "Cotización" a "Confirmado"
3. El sistema pide confirmar la acción
4. Click en "Confirmar"

**Qué decir:**
> *"El cliente acepta. Cambio el estado a 'Confirmado'. Ahora el evento está activo y puedo empezar a recibir pagos."*

**Tiempo:** 1 minuto

---

### PARTE 3: Gestión de pagos (3 min)

#### Pantalla 3.1: Registrar primer abono

**Dónde:** Evento → Pagos → Registrar pago

**Qué hacer:**
1. Dentro del evento de Pedro, ir a la pestaña "Pagos"
2. Click en "Registrar pago"
3. Llenar:
   - Monto: $10,000
   - Método: Transferencia
   - Referencia: TRF-001-2024
   - Fecha: [Hoy]
4. Click en "Guardar"
5. El sistema actualiza:
   - Total: $22,250
   - Pagado: $10,000
   - **Saldo: $12,250**

**Qué decir:**
> *"El cliente hace un abono de $10,000 por transferencia. Lo registro aquí. El sistema calcula automáticamente el saldo pendiente: quedan $12,250. Si el cliente llama preguntando cuánto debe, lo veo en 5 segundos."*

**Tiempo:** 1.5 minutos

---

#### Pantalla 3.2: Ver historial de pagos

**Qué hacer:**
1. Mostrar la tabla de pagos del evento:
   - Fecha, monto, método, referencia, saldo restante

**Qué decir:**
> *"Aquí está el historial completo. Cada abono queda registrado con fecha, método y referencia. Si hay algún reclamo, tengo el respaldo."*

**Tiempo:** 30 segundos

---

#### Pantalla 3.3: Alertas de saldo pendiente

**Qué hacer:**
1. Ir a la vista general de eventos
2. Mostrar el indicador de saldo pendiente en el evento de Pedro
3. Mostrar filtro de "Eventos con saldo pendiente"

**Qué decir:**
> *"El sistema me alerta cuáles eventos tienen saldo pendiente. Puedo filtrar y ver solo esos. Así no se me pasa cobrar."*

**Tiempo:** 1 minuto

---

### PARTE 4: Coordinación del evento (2 min)

#### Pantalla 4.1: Asignar coordinador

**Dónde:** Evento → Asignación

**Qué hacer:**
1. En el evento de Pedro, ir a "Asignación"
2. Asignar coordinador: `coordinador1`
3. Guardar

**Qué decir:**
> *"Asigno un coordinador al evento. Esa persona va a ver este evento en su lista y puede actualizar el estado, agregar notas, confirmar detalles con el cliente."*

**Tiempo:** 30 segundos

---

#### Pantalla 4.2: Vista de coordinador

**Qué hacer:**
1. Cerrar sesión de admin
2. Iniciar sesión como `coordinador1` / `coord123`
3. Mostrar que el coordinador ve solo sus eventos asignados
4. Abrir el evento de Pedro
5. Mostrar que puede:
   - Ver detalles
   - Agregar observaciones
   - Marcar ítems de confirmación
   - Actualizar estado

**Qué decir:**
> *"Así ve el coordinador. Solo sus eventos asignados. No ve todo el sistema, solo lo que le corresponde. Puede agregar notas, marcar qué ya confirmó con el cliente (menú, decoración, etc.) y actualizar el estado."*

**Tiempo:** 1.5 minutos

---

### PARTE 5: Reportes gerenciales (3 min)

#### Pantalla 5.1: Volver a admin y abrir reportes

**Qué hacer:**
1. Cerrar sesión de coordinador
2. Iniciar sesión como `admin`
3. Ir a "Reportes"

**Qué decir:**
> *"Volvemos a la vista de administrador. Ahora les muestro los reportes."*

**Tiempo:** 30 segundos

---

#### Pantalla 5.2: Reporte financiero

**Dónde:** Reportes → Financiero

**Qué mostrar:**
- Ingresos totales del mes
- Total cobrado
- Saldo pendiente por cobrar
- Gráfica de ingresos por mes

**Qué decir:**
> *"Aquí veo el resumen financiero. Cuánto vendí este mes, cuánto cobré y cuánto me deben. Esto antes lo hacían en Excel sumando manualmente. Aquí es automático."*

**Tiempo:** 1 minuto

---

#### Pantalla 5.3: Reporte de eventos

**Dónde:** Reportes → Eventos

**Qué mostrar:**
- Eventos por estado (cotización, confirmado, en proceso, completado)
- Eventos del mes
- Próximos eventos

**Qué decir:**
> *"Veo cuántos eventos tengo en cada estado. Cuántos confirmados, cuántos en proceso, cuántos completados. Así sé si voy bien o si tengo cuellos de botella."*

**Tiempo:** 1 minuto

---

#### Pantalla 5.4: Exportar reporte

**Qué hacer:**
1. Click en "Exportar a Excel" o "Exportar a PDF"
2. Se descarga el reporte

**Qué decir:**
> *"Si necesito enviar el reporte a un socio o contador, lo exporto a Excel o PDF en un clic."*

**Tiempo:** 30 segundos

---

### PARTE 6: Portal del cliente (2 min)

#### Pantalla 6.1: Acceso del cliente

**Qué hacer:**
1. Cerrar sesión de admin
2. Iniciar sesión como `cliente_demo` / `cliente123`
3. Mostrar la vista del cliente

**Qué mostrar:**
- Su evento
- Fecha y detalles
- Plan y productos
- Total a pagar
- Saldo pendiente
- Historial de pagos

**Qué decir:**
> *"Así ve el cliente. Entra con su usuario y ve su evento. Cuánto pagó, cuánto debe, qué incluye su paquete. Puede confirmar detalles (color de mantelería, menú, etc.) desde aquí. Menos llamadas preguntando lo mismo."*

**Tiempo:** 1.5 minutos

---

#### Pantalla 6.2: Confirmación de detalles

**Qué hacer:**
1. Mostrar los ítems de confirmación del evento
2. El cliente puede marcar:
   - [x] Color de mantelería: Blanco
   - [x] Menú: Clásico
   - [ ] Lista de invitados (pendiente)

**Qué decir:**
> *"El cliente confirma aquí los detalles. Cuando marca algo, ustedes lo ven actualizado. No hay que andar persiguiendo por WhatsApp."*

**Tiempo:** 30 segundos

---

### PARTE 7: Módulos adicionales (2 min)

#### Pantalla 7.1: WhatsApp (si aplica)

**Dónde:** WhatsApp → Chat o Plantillas

**Qué mostrar:**
- Chat integrado con clientes
- Plantillas de mensajes (recordatorios de pago, confirmaciones)
- Envío masivo

**Qué decir:**
> *"Tienen WhatsApp integrado. Pueden enviar recordatorios de pago, confirmaciones, todo desde aquí. Con plantillas predefinidas para no escribir lo mismo 20 veces."*

**Tiempo:** 1 minuto

---

#### Pantalla 7.2: Inventario (opcional)

**Dónde:** Inventario

**Qué mostrar:**
- Control de stock de productos
- Disponibilidad por fecha
- Productos asignados a eventos

**Qué decir:**
> *"Si manejan inventario físico (sillas, mesas, equipos), el sistema controla qué está disponible y qué está reservado para cada evento."*

**Tiempo:** 1 minuto

---

### CIERRE: Preguntas y siguiente paso (5 min)

**Qué decir:**
> *"Eso es el sistema. Resumiendo: registran clientes, crean eventos, generan cotizaciones en minutos, controlan pagos automáticamente, coordinan con su equipo, ven reportes en tiempo real y el cliente puede ver su información desde su celular."*
>  
> *"¿Qué les pareció? ¿Tienen alguna pregunta sobre algo que vieron?"*

**Escuchar preguntas y responder.**

**Proponer siguiente paso:**
> *"Si les interesa, el siguiente paso sería activarles una cuenta de prueba con sus propios datos: sus salones, sus paquetes, sus precios. Así lo prueban con casos reales y ven si encaja con su forma de trabajar. ¿Les parece?"*

---

## 4. Consideraciones importantes

### ✅ Qué SÍ hacer

1. **Hablar en presente:** *"Aquí creo el evento"* (no "aquí crearía").
2. **Usar datos realistas:** Nombres de personas, fechas futuras, precios coherentes.
3. **Ir despacio:** No correr. Dar tiempo a que vean cada pantalla.
4. **Señalar con el cursor:** Resaltar lo importante en pantalla.
5. **Anticipar preguntas:** *"Seguro se preguntan cómo…"* y responder.
6. **Mostrar el valor:** *"Esto que antes tomaba 20 minutos, aquí son 3 clics."*
7. **Conectar con su realidad:** *"Cuando un cliente les llama preguntando cuánto debe…"*

---

### ❌ Qué NO hacer

1. **No improvisar:** Sigue el guion. Si te pierdes, se nota.
2. **No mostrar errores:** Si algo falla, di *"Esto ya está configurado"* y salta.
3. **No usar datos falsos obvios:** Nada de "Cliente 1", "Evento de prueba", "asdf".
4. **No explicar código:** No hables de tecnología, habla de beneficios.
5. **No mostrar configuración:** El cliente no debe verte configurando usuarios o permisos.
6. **No extenderte:** Si una sección toma más de lo planeado, resume.
7. **No menospreciar Excel:** Di *"Excel funciona, pero tiene límites"*, no *"Excel es malo"*.

---

### 🎯 Frases clave para usar

| Momento | Frase |
|---------|-------|
| Al crear evento | *"El total se calcula solo. No hay que hacer fórmulas."* |
| Al registrar pago | *"El saldo se actualiza automáticamente. Siempre saben quién debe."* |
| Al mostrar reportes | *"Esto antes lo hacían sumando en Excel. Aquí es en tiempo real."* |
| Al mostrar portal cliente | *"El cliente ve su información sin tener que llamar."* |
| Al mostrar coordinador | *"Cada persona ve solo lo que le corresponde. Sin pisarse."* |

---

## 5. Checklist final

### Antes de la reunión

- [ ] Sistema funcionando (servidor corriendo)
- [ ] Internet estable
- [ ] Usuarios creados (admin, coordinador, gerente, cliente)
- [ ] Salones creados (mínimo 2)
- [ ] Productos creados (mínimo 5)
- [ ] Planes creados (mínimo 3)
- [ ] Clientes de ejemplo (mínimo 3)
- [ ] 1 evento completo con pagos
- [ ] Navegador en pantalla completa
- [ ] Cerrar pestañas innecesarias
- [ ] Laptop cargada
- [ ] Cable HDMI/proyector probado

---

### Durante la demo

- [ ] Seguir el orden: Cliente → Evento → Cotización → Pagos → Reportes → Portal
- [ ] Hablar en presente
- [ ] Señalar con el cursor
- [ ] Ir despacio
- [ ] Conectar con su realidad
- [ ] Anticipar preguntas

---

### Después de la demo

- [ ] Preguntar: *"¿Qué les pareció?"*
- [ ] Responder dudas
- [ ] Proponer siguiente paso (prueba, reunión, envío de info)
- [ ] Agendar fecha concreta
- [ ] Enviar resumen por email

---

## Resumen del flujo

```
PREPARACIÓN (1 hora antes)
├── Limpiar datos de prueba
├── Crear usuarios (admin, coordinador, gerente, cliente)
├── Crear catálogo (categorías, salones, productos, planes)
├── Crear clientes de ejemplo
└── Crear 1 evento completo con pagos

DEMO EN VIVO (30-35 min)
│
├── [0] IMPACTO INICIAL (3-5 min) ← EMPEZAR AQUÍ
│       "Esto es TODO lo que van a tener"
│       Diagrama + lista de 50+ funciones
│
├── [1] Login y dashboard (2 min)
├── [2] Crear cliente + evento + cotización (8 min)
├── [3] Registrar pagos y ver saldos (3 min)
├── [4] Vista del coordinador (2 min)
├── [5] Reportes gerenciales (3 min)
├── [6] Portal del cliente (2 min)
├── [7] Módulos adicionales (2 min)
└── [8] Cierre y preguntas (5 min)

CIERRE
├── Resumir valor vs Excel
├── Responder dudas
└── Proponer siguiente paso (prueba con sus datos)
```

### El orden importa

```
   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │  PRIMERO: Impactar con la VISIÓN COMPLETA              │
   │           (todo lo que incluye)                         │
   │                                                         │
   │  SEGUNDO: Mostrar el FLUJO PRINCIPAL en vivo           │
   │           (cliente → evento → pagos)                    │
   │                                                         │
   │  TERCERO: Mostrar los ROLES                            │
   │           (coordinador, gerente, cliente)               │
   │                                                         │
   │  CUARTO: Cerrar con VALOR y SIGUIENTE PASO             │
   │                                                         │
   └─────────────────────────────────────────────────────────┘
```

---

*Guion práctico para demostración – Sistema de Gestión de Eventos*  
*Última actualización: Enero 2025*
