# Frontend - Lirios Eventos

Frontend web desarrollado en React para el sistema de gestión de eventos Lirios Eventos.

## 🚀 Características

- ✅ Interfaz moderna y responsive
- ✅ Autenticación con JWT
- ✅ Gestión completa de eventos, clientes, productos, pagos, etc.
- ✅ Dashboard con métricas en tiempo real
- ✅ Sistema de roles y permisos
- ✅ Navegación intuitiva con sidebar

## 📋 Requisitos Previos

- Node.js 16+ y npm o yarn
- El servidor API debe estar corriendo en `http://localhost:5000`

## 🛠️ Instalación

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

## ▶️ Ejecutar en Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 🏗️ Construir para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   └── Layout.jsx   # Layout principal con sidebar
│   ├── context/         # Contextos de React
│   │   └── AuthContext.jsx  # Contexto de autenticación
│   ├── pages/          # Páginas principales
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Eventos.jsx
│   │   ├── Clientes.jsx
│   │   ├── Productos.jsx
│   │   └── ...
│   ├── services/       # Servicios API
│   │   └── api.js      # Cliente API con todos los servicios
│   ├── App.jsx         # Componente principal con rutas
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── package.json
├── vite.config.js
└── README.md
```

## 🔐 Usuarios de Prueba

- **Administrador:**
  - Usuario: `admin`
  - Contraseña: `admin123`

- **Gerente:**
  - Usuario: `gerente`
  - Contraseña: `gerente123`

- **Coordinador:**
  - Usuario: `coordinador1`
  - Contraseña: `coordinador123`

## 🔧 Configuración

### Cambiar la URL de la API

Edita `vite.config.js` para cambiar el proxy o modifica `src/services/api.js` para cambiar `API_BASE_URL`.

## 📝 Notas

- El frontend usa Vite como bundler para desarrollo rápido
- React Router para navegación
- Axios para peticiones HTTP
- Lucide React para iconos
- Los tokens JWT se almacenan en localStorage
- El sistema detecta automáticamente si el usuario está autenticado

## 🐛 Solución de Problemas

### Error de conexión con la API

Asegúrate de que el servidor API esté corriendo en `http://localhost:5000`

### Error de CORS

Verifica que el servidor API tenga CORS habilitado para `http://localhost:3000`

### Token expirado

Si el token expira, serás redirigido automáticamente al login
