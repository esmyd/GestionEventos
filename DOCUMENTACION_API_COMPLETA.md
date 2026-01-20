# Documentación Completa API REST - Lirios Eventos

**Versión:** 1.0  
**Base URL:** `http://localhost:5000/api`  
**Formato:** JSON  
**Autenticación:** JWT (JSON Web Tokens)

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Inicio Rápido](#inicio-rápido)
3. [Autenticación con JWT](#autenticación-con-jwt)
4. [Endpoints - Autenticación](#endpoints---autenticación)
5. [Endpoints - Usuarios](#endpoints---usuarios)
6. [Endpoints - Clientes](#endpoints---clientes)
7. [Endpoints - Productos](#endpoints---productos)
8. [Endpoints - Categorías](#endpoints---categorías)
9. [Endpoints - Eventos](#endpoints---eventos)
10. [Endpoints - Planes](#endpoints---planes)
11. [Endpoints - Pagos](#endpoints---pagos)
12. [Endpoints - Inventario](#endpoints---inventario)
13. [Endpoints - Salones](#endpoints---salones)
14. [Endpoints - Reportes](#endpoints---reportes)
15. [Ejemplos de Uso](#ejemplos-de-uso)
16. [Probar en Postman](#probar-en-postman)
17. [Códigos de Estado HTTP](#códigos-de-estado-http)
18. [Errores Comunes](#errores-comunes)
19. [Roles y Permisos](#roles-y-permisos)
20. [Configuración y Despliegue](#configuración-y-despliegue)

---

## Introducción

Esta es la documentación completa de la API REST para el sistema de gestión de eventos **Lirios Eventos**. La API permite acceder a todas las funcionalidades del sistema desde aplicaciones web y móviles.

### Características Principales

- ✅ Autenticación segura con JWT (JSON Web Tokens)
- ✅ RESTful API con formato JSON
- ✅ CORS habilitado para acceso desde cualquier origen
- ✅ Sistema de roles y permisos
- ✅ Validación de datos
- ✅ Manejo de errores estandarizado

---

## Inicio Rápido

### Instalación

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Configurar base de datos (ver config.py)
# 3. Ejecutar el servidor
python api_server.py
```

### Verificar que Funciona

```bash
curl http://localhost:5000/api/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "message": "API Lirios Eventos funcionando correctamente"
}
```

---

## Autenticación con JWT

La API utiliza **JWT (JSON Web Tokens)** para autenticación, proporcionando mayor seguridad y flexibilidad.

### ¿Qué es JWT?

JWT es un estándar que permite transmitir información de forma segura entre partes como un objeto JSON. Los tokens son:
- **Stateless**: No necesitan almacenarse en el servidor
- **Seguros**: Firmados digitalmente
- **Portables**: Funcionan en cualquier entorno
- **Eficientes**: Compactos y rápidos de verificar

### Flujo de Autenticación

1. **Hacer Login** → Obtener token JWT
2. **Usar el Token** → Incluir en header `Authorization: Bearer <token>`
3. **Token Válido** → Acceso a endpoints protegidos

### Duración de Tokens

Los tokens JWT expiran después de **24 horas**. Cuando un token expira, debes hacer login nuevamente.

### Configuración

La configuración de JWT se encuentra en `config.py`:

```python
JWT_SECRET_KEY = 'tu-clave-secreta'  # ⚠️ Cambiar en producción
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24
```

**⚠️ IMPORTANTE:** En producción, cambia la `JWT_SECRET_KEY` por una clave segura.

---

## Endpoints - Autenticación

### POST /api/auth/login

Inicia sesión en el sistema y obtiene un token JWT.

**No requiere autenticación previa.**

**Request:**
```
POST /api/auth/login
Content-Type: application/json

{
    "nombre_usuario": "admin",
    "contrasena": "admin123"
}
```

**Response 200 OK:**
```json
{
    "success": true,
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJuYW1lX3VzdWFyaW8iOiJhZG1pbiIsInJvbCI6ImFkbWluaXN0cmFkb3IiLCJleHAiOjE3MDQ4NzY0MDB9.xxxxx",
    "usuario": {
        "id": 1,
        "nombre_usuario": "admin",
        "nombre_completo": "Administrador",
        "email": "admin@lirioseventos.com",
        "telefono": "123456789",
        "rol": "administrador",
        "activo": true
    }
}
```

**Response 400 Bad Request:**
```json
{
    "error": "Usuario y contraseña requeridos"
}
```

**Response 401 Unauthorized:**
```json
{
    "error": "Credenciales inválidas"
}
```

**⚠️ IMPORTANTE:** Guarda el campo `token` de la respuesta. Lo necesitarás para todos los requests autenticados.

---

### POST /api/auth/logout

Cierra la sesión (el cliente descarta el token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
    "success": true,
    "message": "Sesión cerrada exitosamente"
}
```

---

### GET /api/auth/verificar

Verifica si un token es válido y obtiene información del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200 OK (Token válido):**
```json
{
    "authenticated": true,
    "usuario": {
        "id": 1,
        "nombre_usuario": "admin",
        "nombre_completo": "Administrador",
        "email": "admin@lirioseventos.com",
        "telefono": "123456789",
        "rol": "administrador"
    }
}
```

**Response 401 Unauthorized (Token inválido/expirado):**
```json
{
    "authenticated": false,
    "error": "Token inválido o expirado"
}
```

---

## Endpoints - Usuarios

**Base Path:** `/api/usuarios`  
**Autenticación:** Requerida

### GET /api/usuarios

Lista todos los usuarios del sistema.

**Roles permitidos:** `administrador`, `gerente_general`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `rol` (opcional): Filtrar por rol (ej: `?rol=coordinador`)

**Response 200 OK:**
```json
{
    "usuarios": [
        {
            "id": 1,
            "nombre_usuario": "admin",
            "nombre_completo": "Administrador",
            "email": "admin@lirioseventos.com",
            "telefono": "123456789",
            "rol": "administrador",
            "activo": true,
            "fecha_creacion": "2024-01-01 00:00:00",
            "fecha_ultimo_acceso": "2024-01-15 10:30:00"
        }
    ]
}
```

---

### GET /api/usuarios/{id}

Obtiene un usuario específico por ID.

**Roles permitidos:** Todos (los usuarios solo pueden ver su propio perfil, excepto admin/gerente)

**Response 200 OK:**
```json
{
    "usuario": {
        "id": 1,
        "nombre_usuario": "admin",
        "nombre_completo": "Administrador",
        "email": "admin@lirioseventos.com",
        "telefono": "123456789",
        "rol": "administrador",
        "activo": true
    }
}
```

---

### POST /api/usuarios

Crea un nuevo usuario.

**Roles permitidos:** `administrador`

**Request Body:**
```json
{
    "nombre_usuario": "nuevo_usuario",
    "contrasena": "password123",
    "nombre_completo": "Nombre Completo",
    "email": "email@example.com",
    "telefono": "123456789",
    "rol": "coordinador"
}
```

**Campos requeridos:** `nombre_usuario`, `contrasena`, `nombre_completo`, `rol`

**Response 201 Created:**
```json
{
    "message": "Usuario creado exitosamente",
    "usuario": {
        "id": 5,
        "nombre_usuario": "nuevo_usuario",
        "nombre_completo": "Nombre Completo",
        "email": "email@example.com",
        "rol": "coordinador"
    }
}
```

---

### PUT /api/usuarios/{id}

Actualiza un usuario existente.

**Roles permitidos:** Todos (los usuarios solo pueden actualizar su propio perfil, excepto admin/gerente)

**Request Body:**
```json
{
    "nombre_completo": "Nombre Actualizado",
    "email": "nuevo_email@example.com",
    "telefono": "987654321",
    "rol": "coordinador",
    "activo": true
}
```

**Nota:** Solo administradores/gerentes pueden cambiar el rol.

---

### DELETE /api/usuarios/{id}

Elimina (desactiva) un usuario.

**Roles permitidos:** `administrador`

**Response 200 OK:**
```json
{
    "message": "Usuario eliminado exitosamente"
}
```

---

### POST /api/usuarios/{id}/cambiar-contrasena

Cambia la contraseña de un usuario.

**Roles permitidos:** Todos (los usuarios solo pueden cambiar su propia contraseña, excepto admin)

**Request Body:**
```json
{
    "nueva_contrasena": "nueva_password123"
}
```

---

## Endpoints - Clientes

**Base Path:** `/api/clientes`  
**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

### GET /api/clientes

Lista todos los clientes.

**Response 200 OK:**
```json
{
    "clientes": [
        {
            "id": 1,
            "usuario_id": 2,
            "documento_identidad": "12345678",
            "direccion": "Calle Principal 123",
            "nombre_completo": "Cliente Ejemplo",
            "email": "cliente@example.com",
            "telefono": "123456789"
        }
    ]
}
```

---

### GET /api/clientes/{id}

Obtiene un cliente específico por ID.

---

### POST /api/clientes

Crea un nuevo cliente.

**Request Body:**
```json
{
    "usuario_id": 2,
    "documento_identidad": "12345678",
    "direccion": "Calle Principal 123"
}
```

**Campos requeridos:** `usuario_id`

---

### PUT /api/clientes/{id}

Actualiza un cliente existente.

---

## Endpoints - Productos

**Base Path:** `/api/productos`

### GET /api/productos

Lista todos los productos.

**Query Parameters:**
- `solo_activos` (opcional): `true` o `false` (default: `true`)
- `categoria_id` (opcional): Filtrar por categoría (ej: `?categoria_id=1`)

**Response 200 OK:**
```json
{
    "productos": [
        {
            "id": 1,
            "nombre": "Servicio de Catering",
            "descripcion": "Servicio completo de catering",
            "precio": 500000.00,
            "precio_minimo": 400000.00,
            "precio_maximo": 800000.00,
            "categoria_id": 1,
            "nombre_categoria": "Catering",
            "stock": 100,
            "activo": true
        }
    ]
}
```

---

### GET /api/productos/{id}

Obtiene un producto específico por ID.

---

### POST /api/productos

Crea un nuevo producto.

**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

**Request Body:**
```json
{
    "nombre": "Nuevo Producto",
    "descripcion": "Descripción del producto",
    "precio": 100000.00,
    "precio_minimo": 80000.00,
    "precio_maximo": 150000.00,
    "id_categoria": 1,
    "stock": 50,
    "unidad_medida": "unidad",
    "tipo_servicio": "servicio"
}
```

**Campos requeridos:** `nombre`

---

### PUT /api/productos/{id}

Actualiza un producto existente.

---

### DELETE /api/productos/{id}

Elimina (desactiva) un producto.

**Roles permitidos:** `administrador`, `gerente_general`

---

### PUT /api/productos/{id}/stock

Actualiza el stock de un producto.

**Request Body:**
```json
{
    "cantidad": 10
}
```

**Nota:** La cantidad se suma al stock actual (puede ser negativa para restar).

---

## Endpoints - Categorías

**Base Path:** `/api/categorias`

### GET /api/categorias

Lista todas las categorías.

**Query Parameters:**
- `solo_activas` (opcional): `true` o `false` (default: `true`)

---

### GET /api/categorias/{id}

Obtiene una categoría específica por ID.

---

### POST /api/categorias

Crea una nueva categoría.

**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

**Request Body:**
```json
{
    "nombre": "Nueva Categoría",
    "descripcion": "Descripción de la categoría",
    "activo": true
}
```

---

### PUT /api/categorias/{id}

Actualiza una categoría existente.

---

### DELETE /api/categorias/{id}

Elimina una categoría.

**Roles permitidos:** `administrador`, `gerente_general`

---

## Endpoints - Eventos

**Base Path:** `/api/eventos`

### GET /api/eventos

Lista todos los eventos.

**Query Parameters:**
- `estado` (opcional): Filtrar por estado (ej: `?estado=confirmado`)
- `fecha` (opcional): Filtrar por fecha (ej: `?fecha=2024-01-15`)
- `cliente_id` (opcional): Filtrar por cliente
- `coordinador_id` (opcional): Filtrar por coordinador

**Response 200 OK:**
```json
{
    "eventos": [
        {
            "id_evento": 1,
            "id_cliente": 1,
            "nombre_evento": "Boda Juan y María",
            "tipo_evento": "Boda",
            "fecha_evento": "2024-06-15",
            "hora_inicio": "14:00:00",
            "hora_fin": "22:00:00",
            "numero_invitados": 150,
            "estado": "confirmado",
            "total": 5000000.00,
            "saldo": 2500000.00,
            "nombre_cliente": "Cliente Ejemplo"
        }
    ]
}
```

---

### GET /api/eventos/{id}

Obtiene un evento específico por ID (incluye productos).

---

### POST /api/eventos

Crea un nuevo evento.

**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

**Request Body:**
```json
{
    "cliente_id": 1,
    "id_salon": 1,
    "plan_id": 1,
    "nombre_evento": "Boda Juan y María",
    "tipo_evento": "Boda",
    "fecha_evento": "2024-06-15",
    "hora_inicio": "14:00:00",
    "hora_fin": "22:00:00",
    "numero_invitados": 150,
    "estado": "cotizacion",
    "total": 5000000.00,
    "saldo": 5000000.00,
    "observaciones": "Notas adicionales",
    "coordinador_id": 2
}
```

**Campos requeridos:** `cliente_id`

---

### PUT /api/eventos/{id}

Actualiza un evento existente.

---

### PUT /api/eventos/{id}/estado

Actualiza el estado de un evento.

**Request Body:**
```json
{
    "estado": "confirmado"
}
```

**Estados válidos:** `cotizacion`, `confirmado`, `en_proceso`, `completado`, `cancelado`

---

### POST /api/eventos/{id}/productos

Agrega un producto a un evento.

**Request Body:**
```json
{
    "producto_id": 1,
    "cantidad": 2,
    "precio_unitario": 500000.00
}
```

---

### DELETE /api/eventos/{id}/productos/{producto_id}

Elimina un producto de un evento.

---

### GET /api/eventos/{id}/productos

Lista los productos de un evento.

---

### POST /api/eventos/{id}/calcular-total

Calcula y actualiza el total de un evento (precio plan + productos).

---

## Endpoints - Planes

**Base Path:** `/api/planes`

### GET /api/planes

Lista todos los planes.

**Query Parameters:**
- `solo_activos` (opcional): `true` o `false` (default: `true`)

---

### GET /api/planes/{id}

Obtiene un plan específico por ID (incluye productos).

---

### POST /api/planes

Crea un nuevo plan.

**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

**Request Body:**
```json
{
    "nombre": "Plan Premium",
    "descripcion": "Plan completo premium",
    "precio_base": 5000000.00,
    "capacidad_minima": 100,
    "capacidad_maxima": 200,
    "duracion_horas": 8,
    "incluye": "Servicios completos"
}
```

**Campos requeridos:** `nombre`, `precio_base`

---

### PUT /api/planes/{id}

Actualiza un plan existente.

---

### DELETE /api/planes/{id}

Elimina (desactiva) un plan.

**Roles permitidos:** `administrador`, `gerente_general`

---

### POST /api/planes/{id}/productos

Agrega un producto a un plan.

**Request Body:**
```json
{
    "producto_id": 1,
    "cantidad": 2
}
```

---

### DELETE /api/planes/{id}/productos/{producto_id}

Elimina un producto de un plan.

---

### GET /api/planes/{id}/productos

Lista los productos de un plan.

---

## Endpoints - Pagos

**Base Path:** `/api/pagos`

### GET /api/pagos?evento_id={id}

Lista los pagos de un evento específico.

**Query Parameters:**
- `evento_id` (required): ID del evento

**Response 200 OK:**
```json
{
    "pagos": [
        {
            "id": 1,
            "id_evento": 1,
            "monto": 2500000.00,
            "tipo_pago": "abono",
            "metodo_pago": "transferencia",
            "fecha_pago": "2024-01-15",
            "observaciones": "Primer abono",
            "nombre_registro": "Coordinador Ejemplo"
        }
    ],
    "total_pagado": 2500000.00
}
```

---

### GET /api/pagos/{id}

Obtiene un pago específico por ID.

---

### POST /api/pagos

Registra un nuevo pago/abono/reembolso.

**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

**Request Body:**
```json
{
    "evento_id": 1,
    "monto": 2500000.00,
    "tipo_pago": "abono",
    "metodo_pago": "transferencia",
    "numero_referencia": "TRX123456",
    "fecha_pago": "2024-01-15",
    "observaciones": "Primer abono"
}
```

**Campos requeridos:** `evento_id`, `monto`, `metodo_pago`, `fecha_pago`

**Tipos de pago válidos:** `abono`, `pago_completo`, `reembolso`

**Métodos de pago válidos:** `efectivo`, `transferencia`, `tarjeta`, `cheque`, `otro`

**Response 400 Bad Request (si excede el monto total):**
```json
{
    "error": "No se puede registrar el pago. Total pagado actual: $2500000.00, Monto a agregar: $3000000.00, Total sería: $5500000.00, pero el monto total del evento es: $5000000.00"
}
```

---

### DELETE /api/pagos/{id}

Elimina un pago.

**Roles permitidos:** `administrador`, `gerente_general`

---

### GET /api/pagos/evento/{id}/total

Obtiene el total pagado de un evento.

**Response 200 OK:**
```json
{
    "total_pagado": 2500000.00,
    "total_reembolsos": 0.00
}
```

---

## Endpoints - Inventario

**Base Path:** `/api/inventario`

### GET /api/inventario?evento_id={id}

Lista el inventario de un evento o producto.

**Query Parameters:**
- `evento_id` (required): ID del evento
- O `producto_id` (required): ID del producto

---

### POST /api/inventario

Crea un registro de inventario.

**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

**Request Body:**
```json
{
    "producto_id": 1,
    "evento_id": 1,
    "cantidad_solicitada": 10,
    "cantidad_disponible": 10,
    "estado": "reservado",
    "fecha_reserva": "2024-06-15",
    "observaciones": "Reserva para evento"
}
```

**Campos requeridos:** `producto_id`, `cantidad_solicitada`

**Estados válidos:** `disponible`, `reservado`, `en_uso`, `devuelto`

---

### PUT /api/inventario/{id}/estado

Actualiza el estado de un registro de inventario.

**Request Body:**
```json
{
    "estado": "en_uso",
    "cantidad_utilizada": 8
}
```

---

### POST /api/inventario/{id}/devolucion

Registra la devolución de un producto.

**Request Body:**
```json
{
    "fecha_devolucion": "2024-06-16"
}
```

---

### POST /api/inventario/verificar-disponibilidad

Verifica la disponibilidad de un producto para una fecha.

**Request Body:**
```json
{
    "producto_id": 1,
    "cantidad": 10,
    "fecha_evento": "2024-06-15"
}
```

**Response 200 OK:**
```json
{
    "disponible": true
}
```

---

## Endpoints - Salones

**Base Path:** `/api/salones`

### GET /api/salones

Lista todos los salones.

**Query Parameters:**
- `solo_activos` (opcional): `true` o `false` (default: `false`)

---

### GET /api/salones/{id}

Obtiene un salón específico por ID.

---

### POST /api/salones

Crea un nuevo salón.

**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

**Request Body:**
```json
{
    "nombre": "Salón VIP",
    "capacidad": 50,
    "ubicacion": "Piso 3",
    "descripcion": "Salón exclusivo",
    "precio_base": 1500000.00,
    "activo": true
}
```

**Campos requeridos:** `nombre`, `capacidad`

---

### PUT /api/salones/{id}

Actualiza un salón existente.

---

### DELETE /api/salones/{id}

Elimina (desactiva) un salón.

**Roles permitidos:** `administrador`, `gerente_general`

---

### POST /api/salones/{id}/verificar-disponibilidad

Verifica si un salón está disponible en una fecha.

**Request Body:**
```json
{
    "fecha_evento": "2024-06-15"
}
```

---

## Endpoints - Reportes

**Base Path:** `/api/reportes`  
**Roles permitidos:** `administrador`, `gerente_general`, `coordinador`

### GET /api/reportes/metricas

Obtiene todas las métricas del sistema.

**Response 200 OK:**
```json
{
    "metricas": {
        "eventos": {
            "total": 50,
            "confirmados": 30,
            "completados": 20,
            "en_proceso": 5,
            "cotizacion": 10,
            "cancelados": 5
        },
        "financiero": {
            "total_ingresos": 250000000.00,
            "total_pendiente": 50000000.00,
            "total_cobrado": 200000000.00,
            "porcentaje_cobrado": 80.00,
            "ticket_promedio": 5000000.00,
            "total_pagos": 150
        },
        "clientes": {
            "total": 100,
            "promedio_eventos_cliente": 0.50
        },
        "recursos": {
            "productos": {
                "total": 50,
                "activos": 45
            },
            "planes": {
                "total": 10,
                "activos": 8
            },
            "salones": {
                "total": 5,
                "activos": 4
            }
        },
        "estadisticas": {
            "promedio_invitados": 120.50
        }
    }
}
```

---

### GET /api/reportes/eventos-por-estado

Obtiene un resumen de eventos agrupados por estado.

---

### GET /api/reportes/resumen-financiero

Obtiene el resumen financiero completo del sistema.

**Roles permitidos:** `administrador`, `gerente_general`

---

## Ejemplos de Uso

### cURL

```bash
# 1. Login y guardar token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre_usuario":"admin","contrasena":"admin123"}' \
  | jq -r '.token')

# 2. Usar el token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/usuarios
```

---

### JavaScript (fetch)

```javascript
// 1. Login
async function login(username, password) {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre_usuario: username,
            contrasena: password
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        localStorage.setItem('token', data.token);
        return data;
    } else {
        throw new Error(data.error);
    }
}

// 2. Hacer requests autenticados
async function obtenerUsuarios() {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/usuarios', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    return await response.json();
}

// Uso
login('admin', 'admin123')
    .then(() => obtenerUsuarios())
    .then(usuarios => console.log(usuarios));
```

---

### Python (requests)

```python
import requests

# 1. Login
def login(username, password):
    response = requests.post(
        'http://localhost:5000/api/auth/login',
        json={
            'nombre_usuario': username,
            'contrasena': password
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        return data['token']
    else:
        raise Exception('Login fallido')

# 2. Usar el token
def obtener_usuarios(token):
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.get(
        'http://localhost:5000/api/usuarios',
        headers=headers
    )
    
    return response.json()

# Uso
token = login('admin', 'admin123')
usuarios = obtener_usuarios(token)
print(usuarios)
```

---

### Axios (React/Vue/etc)

```javascript
import axios from 'axios';

// Configurar interceptor para agregar token automáticamente
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Login
async function login(username, password) {
    const response = await axios.post('/api/auth/login', {
        nombre_usuario: username,
        contrasena: password
    });
    
    if (response.data.success) {
        localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
}

// Requests autenticados (el token se agrega automáticamente)
async function obtenerUsuarios() {
    const response = await axios.get('/api/usuarios');
    return response.data;
}
```

---

## Probar en Postman

### Paso 1: Hacer Login

1. **Método:** `POST`
2. **URL:** `http://localhost:5000/api/auth/login`
3. **Body (raw JSON):**
   ```json
   {
       "nombre_usuario": "admin",
       "contrasena": "admin123"
   }
   ```
4. **Headers:** `Content-Type: application/json`
5. **Enviar** y copiar el `token` de la respuesta

### Paso 2: Usar el Token

1. Crear un nuevo request (ej: `GET /api/usuarios`)
2. **Pestaña Authorization:**
   - Type: **Bearer Token**
   - Token: Pegar el token copiado
3. O manualmente en **Headers:**
   - Key: `Authorization`
   - Value: `Bearer <tu_token>`

### Paso 3: Enviar Request

El request debería funcionar con el token.

---

## Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Request exitoso |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | No autenticado o token inválido/expirado |
| 403 | Forbidden | No autorizado (permisos insuficientes) |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error interno del servidor |

---

## Errores Comunes

### Error 400: Datos requeridos
```json
{
    "error": "Campo requerido: nombre_usuario"
}
```
**Solución:** Verifica que todos los campos requeridos estén presentes en el request body.

---

### Error 401: Token inválido o expirado
```json
{
    "error": "Token inválido o expirado",
    "message": "Por favor, inicie sesión nuevamente"
}
```
**Solución:** 
- Verifica que el token esté en el formato correcto: `Authorization: Bearer <token>`
- Si el token expiró (después de 24 horas), haz login nuevamente

---

### Error 403: Permisos insuficientes
```json
{
    "error": "Permisos insuficientes"
}
```
**Solución:** Verifica que el usuario tenga el rol necesario para realizar la acción.

---

### Error 404: Recurso no encontrado
```json
{
    "error": "Usuario no encontrado"
}
```
**Solución:** Verifica que el ID del recurso sea correcto y que exista en la base de datos.

---

### Error 500: Error interno
```json
{
    "error": "Error interno del servidor"
}
```
**Solución:** Revisa los logs del servidor para más detalles.

---

## Roles y Permisos

### Jerarquía de Roles

1. **administrador** - Acceso completo a todas las funcionalidades
2. **gerente_general** - Acceso completo excepto algunas eliminaciones
3. **coordinador** - Puede gestionar eventos, productos, clientes, pagos
4. **cliente** - Acceso limitado (principalmente consulta)

### Permisos por Endpoint

| Endpoint | Administrador | Gerente | Coordinador | Cliente |
|----------|--------------|---------|-------------|---------|
| GET /usuarios | ✅ | ✅ | ❌ | ❌ |
| POST /usuarios | ✅ | ❌ | ❌ | ❌ |
| GET /clientes | ✅ | ✅ | ✅ | ❌ |
| GET /productos | ✅ | ✅ | ✅ | ✅ |
| POST /productos | ✅ | ✅ | ✅ | ❌ |
| GET /eventos | ✅ | ✅ | ✅ | ✅* |
| POST /eventos | ✅ | ✅ | ✅ | ❌ |
| GET /reportes/metricas | ✅ | ✅ | ✅ | ❌ |

*Los clientes solo pueden ver sus propios eventos

---

## Configuración y Despliegue

### Configuración de JWT

En `config.py`:

```python
JWT_SECRET_KEY = 'tu-clave-secreta-muy-segura'  # ⚠️ Cambiar en producción
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24
```

**⚠️ IMPORTANTE PARA PRODUCCIÓN:**
- Usa una clave secreta fuerte y única
- Guárdala en variables de entorno (no en el código)
- Usa HTTPS para transmitir tokens de forma segura

### CORS

La API está configurada para permitir requests desde cualquier origen. Para producción, configura orígenes específicos en `api/app.py`:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://tudominio.com", "https://app.tudominio.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### Variables de Entorno (Recomendado)

Crea un archivo `.env`:

```env
JWT_SECRET_KEY=tu-clave-secreta-muy-segura-aqui
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=lirios_eventos
```

Y actualiza `config.py` para leerlas:

```python
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-key')
```

---

## Formatos de Datos

### Fechas y Horas

- **Fechas:** Formato `YYYY-MM-DD` (ej: `2024-01-15`)
- **Hora:** Formato `HH:MM:SS` (ej: `14:30:00`)
- **Timestamp:** Formato `YYYY-MM-DD HH:MM:SS` (ej: `2024-01-15 14:30:00`)

### Números

- **Decimales:** Usar punto (`.`) como separador decimal
- **Moneda:** Valores en formato decimal (ej: `5000000.00` para $5,000,000.00)
- **Enteros:** Sin decimales (ej: `150`)

---

## Usuarios de Prueba

El sistema incluye usuarios de prueba:

- **Administrador:** 
  - Usuario: `admin`
  - Contraseña: `admin123`
- **Gerente General:** 
  - Usuario: `gerente`
  - Contraseña: `gerente123`
- **Coordinadores:** 
  - Usuario: `coordinador1` / `coordinador2`
  - Contraseña: `coordinador123`

**⚠️ IMPORTANTE:** Para producción, cambia todas las contraseñas por defecto.

---

## Soporte

Para más información sobre el sistema, consulta:
- `README.md` - Documentación general del proyecto
- Código fuente en `/api` - Implementación de la API

---

**Última actualización:** 2024-01-10  
**Versión de la API:** 1.0
