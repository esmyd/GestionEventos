# Instrucciones para Iniciar el Proyecto Lirios Eventos

## 🚀 Pasos para Iniciar el Sistema Completo

### 1. Iniciar el Servidor API (Backend)

Abre una terminal y ejecuta:

```bash
# Navegar a la raíz del proyecto
cd C:\Users\User\Documents\EvolucionLiriosEventos

# Iniciar el servidor API
python api_server.py
```

**Verificación:** Deberías ver un mensaje como:
```
Servidor API iniciado en http://0.0.0.0:5000
```

**Probar que funciona:**
- Abre tu navegador en: `http://localhost:5000/api/health`
- Deberías ver: `{"status":"ok","message":"API Lirios Eventos funcionando correctamente"}`

### 2. Iniciar el Frontend (React)

Abre **otra terminal** (deja la del servidor corriendo) y ejecuta:

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

**Verificación:** Deberías ver un mensaje como:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### 3. Acceder a la Aplicación

1. Abre tu navegador en: `http://localhost:3000`
2. Verás la página de login
3. Si el servidor API no está corriendo, verás una advertencia amarilla
4. Usa las credenciales de prueba:
   - **Usuario:** `admin`
   - **Contraseña:** `admin123`

## 🔧 Solución de Problemas

### Error: "No se puede conectar con el servidor"

**Causa:** El servidor API no está corriendo o no está en el puerto 5000.

**Solución:**
1. Verifica que el servidor API esté corriendo:
   ```bash
   python api_server.py
   ```
2. Verifica que el puerto 5000 esté libre:
   ```bash
   # En Windows PowerShell
   netstat -ano | findstr :5000
   ```
3. Prueba manualmente la API:
   - Abre: `http://localhost:5000/api/health`
   - Deberías ver una respuesta JSON

### Error: "CORS" o "Network Error"

**Causa:** Problema de configuración CORS o el proxy no funciona.

**Solución:**
1. Verifica que `api/app.py` tenga CORS configurado (debería estar configurado)
2. Reinicia ambos servidores (API y Frontend)
3. Limpia la caché del navegador (Ctrl+Shift+Delete)

### El Frontend no carga

**Solución:**
1. Verifica que Node.js esté instalado:
   ```bash
   node --version
   ```
2. Reinstala las dependencias:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

### El servidor API no inicia

**Solución:**
1. Verifica que Python esté instalado:
   ```bash
   python --version
   ```
2. Instala las dependencias de Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Verifica que la base de datos esté configurada correctamente en `config.py`

## 📋 Verificación Rápida

Ejecuta estos comandos para verificar que todo esté bien:

```bash
# Terminal 1: Verificar API
curl http://localhost:5000/api/health

# Terminal 2: Verificar Frontend
curl http://localhost:3000
```

## 🎯 Orden Correcto de Inicio

1. ✅ **Primero:** Iniciar el servidor API (puerto 5000)
2. ✅ **Segundo:** Iniciar el frontend (puerto 3000)
3. ✅ **Tercero:** Abrir el navegador en http://localhost:3000

## 📝 Notas Importantes

- **NO cierres** la terminal del servidor API mientras uses la aplicación
- El frontend usa un **proxy** para conectarse al API, por lo que las peticiones van a `/api` y se redirigen automáticamente a `http://localhost:5000/api`
- Si cambias el puerto del API, actualiza `frontend/vite.config.js` y `frontend/src/services/api.js`

## 🔐 Credenciales de Prueba

- **Administrador:**
  - Usuario: `admin`
  - Contraseña: `admin123`

- **Gerente:**
  - Usuario: `gerente`
  - Contraseña: `gerente123`

- **Coordinador:**
  - Usuario: `coordinador1`
  - Contraseña: `coordinador123`
