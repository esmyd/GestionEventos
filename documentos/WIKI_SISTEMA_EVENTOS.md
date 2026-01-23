# Wiki del Sistema de Eventos

Esta wiki documenta el funcionamiento general de la plataforma, los módulos disponibles, la configuración inicial y los flujos de trabajo principales.

## 1) Visión general

La plataforma gestiona eventos con clientes, planes, salones, productos adicionales, pagos y notificaciones. Incluye:

- Gestión de eventos, pagos, clientes, planes, salones y productos.
- Notificaciones nativas (Email y WhatsApp).
- Integración WhatsApp (API Meta Cloud).
- Chat WhatsApp con bot asistente.
- Métricas y control de costos de WhatsApp y Email.
- Configuraciones generales (nombre de plataforma y login).
- Limpieza de datos de prueba.

## 2) Roles y permisos

Roles principales:

- Administrador
- Gerente general
- Coordinador
- Cliente

Los permisos se controlan por rol o por permisos explícitos en el usuario.  
Ejemplos comunes:
- Crear/editar eventos
- Registrar pagos
- Gestionar productos
- Cambiar estado de eventos
- Acceso a configuraciones

## 3) Módulos principales

### 3.1 Eventos
- Lista y detalle de eventos.
- Creación de eventos con cliente, fecha, horas, invitados, plan y salón.
- Estado del evento (cotización, confirmado, en proceso, completado, cancelado).
- Asignación de coordinador.
- Productos adicionales y servicios del plan.

### 3.2 Clientes
- Registro y mantenimiento de clientes.
- Datos de contacto (email/teléfono).
- Historial de eventos.

### 3.3 Planes
- Paquetes con precio base, capacidades y duración.
- Servicios incluidos.
- Reglas de capacidad mínima/máxima.

### 3.4 Salones
- Salones con capacidad, ubicación y precio base.
- Control de disponibilidad por fecha y horario.

### 3.5 Productos
- Servicios o productos adicionales al plan.
- Se agregan a eventos con cantidad y precio.

### 3.6 Pagos
- Registro de abonos o pagos completos.
- Métodos de pago y observaciones.
- Actualización de saldo pendiente.

### 3.7 Notificaciones nativas
- Gestión de notificaciones (Email/WhatsApp) por tipo.
- Activar/desactivar y editar contenido.
- Vista de ejecución y métricas de envíos.
- Recordatorios automáticos (7 días y 1 día).
- Recordatorio manual “Recordatorio del evento”.

### 3.8 Integración WhatsApp
- Credenciales de Meta Cloud API.
- Webhook de validación y recepción.
- Envío de mensajes y plantillas.

### 3.9 WhatsApp Chat (Inbox)
- Conversaciones en tiempo real.
- Bot asistente con flujos guiados.
- Soporte de media (imágenes, audio, documentos).
- Estado de envío (sent/delivered/read).

### 3.10 Panel WhatsApp (Métricas y control)
- Totales globales (WhatsApp/Email).
- Costos por canal.
- Bloqueo por cliente (WhatsApp/Email).
- Bloqueo global de WhatsApp.

### 3.11 Plantillas WhatsApp
- CRUD de plantillas.
- Parámetros de header y body.
- Envío con validación de parámetros.

### 3.12 Configuraciones generales
- Nombre de la plataforma.
- Configuración de la pantalla de login.
- Plantilla de re‑engagement WhatsApp (24h).

### 3.13 Limpieza de datos
- Borra datos de prueba de eventos, pagos, notificaciones y chat.
- No elimina configuraciones ni usuarios.

## 4) Configuración inicial (paso a paso)

### 4.1 Configuración general
1. Ir a `Configuraciones > Generales`.
2. Definir:
   - Nombre de la plataforma.
   - Textos del login.
   - Imagen y colores del login.
   - Plantilla WhatsApp de re‑engagement.
3. Guardar.

### 4.2 Integración WhatsApp
1. Ir a `Configuraciones > Integraciones > WhatsApp`.
2. Completar:
   - Access Token
   - Phone Number ID
   - Business ID
   - API Version
   - Verify Token
3. Usar el botón “Test Webhook”.
4. Confirmar que el webhook de Meta valide correctamente.

### 4.3 Plantillas WhatsApp
1. Ir a `Configuraciones > Plantillas WhatsApp`.
2. Crear plantilla con:
   - Nombre
   - Idioma (ej. `es`, `es_EC`, `en_US`)
   - Categoría y descripción
   - Parámetros (header/body)
3. Guardar y probar envío con parámetros correctos.

### 4.4 Notificaciones nativas
1. Ir a `Configuraciones > Notificaciones Nativas`.
2. Activar/desactivar notificaciones.
3. Editar plantillas (Email/WhatsApp).
4. Configurar header y footer del email.
5. Verificar preview en editor.

### 4.5 Panel de métricas WhatsApp/Email
1. Ir a `Configuraciones > Panel WhatsApp`.
2. Definir precios por mensaje.
3. (Opcional) Desactivar WhatsApp globalmente.
4. Bloquear o desbloquear clientes por canal.

## 5) Flujos principales

### 5.1 Crear evento (web)
1. Ir a `Eventos > Nuevo`.
2. Seleccionar cliente.
3. Definir tipo, fecha y horas.
4. Indicar número de invitados.
5. Seleccionar plan (según capacidad).
6. Seleccionar salón (según capacidad).
7. Agregar productos adicionales si aplica.
8. Guardar.

### 5.2 Editar evento
1. Ir a `Eventos`.
2. Usar botón “Editar”.
3. Ajustar datos necesarios.
4. Guardar cambios.

### 5.3 Registrar pagos
1. Ir a detalle del evento.
2. Registrar abono o pago total.
3. El saldo pendiente se actualiza automáticamente.
4. Si aplica, se dispara la notificación correspondiente.

### 5.4 Recordatorios y notificaciones
Tipos principales:
- Evento creado
- Recordatorio 7 días (automático)
- Recordatorio 1 día (automático)
- Recordatorio del evento (manual)
- Solicitud de calificación (solo si evento completado)

Puedes forzar recordatorios desde el detalle del evento:
- Forzar Email
- Forzar WhatsApp

### 5.5 WhatsApp Chat (bot)
El bot responde a:
- Consultar mi evento
- Consultar mis pagos
- Direcciones
- Horarios
- Contactos
- Crear evento

**Creación de evento guiada (bot):**
1. Nombre del evento
2. Tipo de evento
3. Fecha (YYYY-MM-DD)
4. Hora inicio y fin
5. Número de invitados
6. Selección de plan (botones/lista)
7. Selección de salón (botones/lista)
8. Adicionales (sí/no)
9. Productos adicionales con cantidad
10. Observaciones

## 6) Re‑engagement WhatsApp (24 horas)
Si el cliente no ha interactuado en 24h:
- Se bloquea el envío normal.
- Se envía primero una plantilla de re‑engagement configurada.
- Luego se reintenta el mensaje original.

## 7) Errores comunes y soluciones

- **WhatsApp “Template name does not exist”**: verificar idioma exacto (`es_EC`, `en_US`, etc.).
- **Parámetros incorrectos**: coincidir el número de `{{n}}` con la cantidad de parámetros enviados.
- **WhatsApp desactivado**: revisar el toggle global en Panel WhatsApp.
- **Eventos sin plan o salón**: en bot y web, ahora se solicitan y validan.

## 8) Recomendaciones operativas

- Mantener planes y salones actualizados antes de crear eventos.
- Definir precios en Panel WhatsApp para costos reales.
- Configurar plantilla de re‑engagement para mensajes fuera de ventana.
- Revisar logs si hay fallos de envío.

---

Si quieres, puedo convertir esta wiki en páginas separadas por módulo o agregar capturas/pasos más detallados por pantalla.
