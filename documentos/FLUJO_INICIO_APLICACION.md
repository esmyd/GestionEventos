# 🔄 Flujo Completo de Inicio de la Aplicación - Lirios Eventos

## 📋 Resumen Ejecutivo

Este documento describe el flujo completo desde que se ejecuta la aplicación hasta que se muestra el menú principal después del login exitoso.

---

## 🚀 Flujo Paso a Paso

### **FASE 1: Inicio de la Aplicación**

#### 1.1. Punto de Entrada: `main.py`

**Archivo**: `main.py`  
**Línea**: 40-46

```python
if __name__ == "__main__":
    print("Iniciando aplicación...")
    app = Aplicacion()          # ← Crea instancia de Aplicacion
    print("Aplicación iniciada")
    print("Ejecutando aplicación...")
    app.ejecutar()               # ← Inicia el loop principal de Tkinter
    print("Aplicación ejecutada")
```

**Variables**:
- `app`: Instancia de la clase `Aplicacion`

**Acciones**:
1. Imprime mensaje de inicio
2. Crea instancia de `Aplicacion`
3. Llama a `app.ejecutar()` que inicia `root.mainloop()`

---

#### 1.2. Constructor de Aplicacion: `main.py`

**Archivo**: `main.py`  
**Clase**: `Aplicacion`  
**Método**: `__init__()`  
**Línea**: 12-15

```python
def __init__(self):
    self.root = tk.Tk()                    # ← Crea ventana raíz de Tkinter
    self.ventana_principal = None          # ← Inicializa como None
    self.mostrar_login()                   # ← Llama a mostrar_login()
```

**Variables de Instancia**:
- `self.root`: Ventana raíz de Tkinter (tk.Tk)
- `self.ventana_principal`: Referencia a VentanaPrincipal (inicialmente None)

**Acciones**:
1. Crea la ventana raíz de Tkinter
2. Inicializa `ventana_principal` como None
3. Llama a `mostrar_login()`

---

#### 1.3. Mostrar Ventana de Login: `main.py`

**Archivo**: `main.py`  
**Clase**: `Aplicacion`  
**Método**: `mostrar_login()`  
**Línea**: 17-25

```python
def mostrar_login(self):
    print("Mostrando ventana de login...")
    for widget in self.root.winfo_children():
        widget.destroy()                   # ← Limpia widgets existentes
    print("Ventana de login destruida")
    VentanaLogin(self.root, self.on_login_exitoso)  # ← Crea VentanaLogin
    print("Ventana de login creada")
```

**Parámetros**:
- `self.root`: Ventana raíz de Tkinter
- `self.on_login_exitoso`: Callback que se ejecuta cuando el login es exitoso

**Acciones**:
1. Limpia todos los widgets existentes en `self.root`
2. Crea instancia de `VentanaLogin` pasando:
   - `self.root`: Ventana raíz
   - `self.on_login_exitoso`: Función callback

---

### **FASE 2: Ventana de Login**

#### 2.1. Constructor de VentanaLogin: `vistas/login.py`

**Archivo**: `vistas/login.py`  
**Clase**: `VentanaLogin`  
**Método**: `__init__()`  
**Línea**: 17-30

```python
def __init__(self, root, callback_login_exitoso):
    self.root = root
    self.root.title("Lirios Eventos - Inicio de Sesión")
    self.root.geometry("500x500")
    self.root.configure(bg='#f0f0f0')
    self.root.resizable(False, False)
    
    self.centrar_ventana()                 # ← Centra la ventana
    
    self.callback_login_exitoso = callback_login_exitoso
    self.autenticacion = Autenticacion()  # ← Crea instancia de Autenticacion
    
    self.crear_widgets()                   # ← Crea los widgets de la UI
```

**Parámetros**:
- `root`: Ventana raíz de Tkinter (tk.Tk)
- `callback_login_exitoso`: Función callback para cuando el login es exitoso

**Variables de Instancia**:
- `self.root`: Referencia a la ventana raíz
- `self.callback_login_exitoso`: Función callback
- `self.autenticacion`: Instancia de `Autenticacion`
- `self.entry_usuario`: Campo de entrada para usuario (creado en `crear_widgets()`)
- `self.entry_contrasena`: Campo de entrada para contraseña (creado en `crear_widgets()`)

**Acciones**:
1. Configura título, tamaño y estilo de la ventana
2. Centra la ventana en la pantalla
3. Guarda el callback
4. Crea instancia de `Autenticacion`
5. Crea los widgets de la interfaz

---

#### 2.2. Crear Widgets de Login: `vistas/login.py`

**Archivo**: `vistas/login.py`  
**Clase**: `VentanaLogin`  
**Método**: `crear_widgets()`  
**Línea**: 39-119

```python
def crear_widgets(self):
    # Frame principal
    main_frame = tk.Frame(self.root, bg='#f0f0f0', padx=30, pady=30)
    main_frame.pack(fill=tk.BOTH, expand=True)
    
    # Título y subtítulo
    # ... (código de labels)
    
    # Campo Usuario
    self.entry_usuario = tk.Entry(form_frame, font=('Arial', 11), width=25)
    self.entry_usuario.insert(0, "admin")      # ← Valor por defecto
    self.entry_usuario.focus()                 # ← Enfoca el campo
    
    # Campo Contraseña
    self.entry_contrasena = tk.Entry(form_frame, show='*', ...)
    self.entry_contrasena.insert(0, "admin123")  # ← Valor por defecto
    
    # Botón Iniciar Sesión
    btn_login = tk.Button(..., command=self.iniciar_sesion)
```

**Variables Creadas**:
- `main_frame`: Frame principal
- `form_frame`: Frame del formulario
- `self.entry_usuario`: Entry para nombre de usuario
- `self.entry_contrasena`: Entry para contraseña (con show='*')
- `btn_login`: Botón para iniciar sesión

**Acciones**:
1. Crea frames y labels
2. Crea campos de entrada con valores por defecto
3. Crea botón de login que llama a `iniciar_sesion()`
4. Configura eventos (Enter key)

---

#### 2.3. Iniciar Sesión: `vistas/login.py`

**Archivo**: `vistas/login.py`  
**Clase**: `VentanaLogin`  
**Método**: `iniciar_sesion()`  
**Línea**: 121-140

```python
def iniciar_sesion(self):
    usuario = self.entry_usuario.get().strip()      # ← Obtiene usuario
    contrasena = self.entry_contrasena.get()         # ← Obtiene contraseña
    
    if not usuario or not contrasena:
        mostrar_error(...)                           # ← Validación
        return
    
    usuario_autenticado = self.autenticacion.iniciar_sesion(usuario, contrasena)
    
    if usuario_autenticado:
        self.autenticacion.registrar_log(...)       # ← Registra en log
        self.callback_login_exitoso(usuario_autenticado, self.autenticacion)
    else:
        mostrar_error(...)                           # ← Error de autenticación
```

**Variables Locales**:
- `usuario`: String con el nombre de usuario
- `contrasena`: String con la contraseña
- `usuario_autenticado`: Diccionario con datos del usuario o None

**Acciones**:
1. Obtiene credenciales de los campos
2. Valida que no estén vacíos
3. Llama a `autenticacion.iniciar_sesion()`
4. Si es exitoso: registra log y llama al callback
5. Si falla: muestra error

---

### **FASE 3: Autenticación**

#### 3.1. Constructor de Autenticacion: `modelos/autenticacion.py`

**Archivo**: `modelos/autenticacion.py`  
**Clase**: `Autenticacion`  
**Método**: `__init__()`  
**Línea**: 11-13

```python
def __init__(self):
    self.base_datos = BaseDatos()           # ← Crea conexión a MySQL
    self.usuario_actual = None              # ← Inicializa como None
```

**Variables de Instancia**:
- `self.base_datos`: Instancia de `BaseDatos` (conexión MySQL)
- `self.usuario_actual`: Diccionario con datos del usuario autenticado o None

**Acciones**:
1. Crea conexión a la base de datos MySQL
2. Inicializa `usuario_actual` como None

---

#### 3.2. Iniciar Sesión: `modelos/autenticacion.py`

**Archivo**: `modelos/autenticacion.py`  
**Clase**: `Autenticacion`  
**Método**: `iniciar_sesion()`  
**Línea**: 23-36

```python
def iniciar_sesion(self, nombre_usuario, contrasena):
    consulta = "SELECT * FROM usuarios WHERE nombre_usuario = %s AND activo = TRUE"
    usuario = self.base_datos.obtener_uno(consulta, (nombre_usuario,))
    
    if usuario:
        contrasena_hash = self.hash_contrasena(contrasena)
        if usuario['contrasena'] == contrasena_hash or self.verificar_contrasena(contrasena, usuario['contrasena']):
            self.actualizar_ultimo_acceso(usuario['id'])
            self.usuario_actual = usuario
            return usuario
    return None
```

**Parámetros**:
- `nombre_usuario`: String con el nombre de usuario
- `contrasena`: String con la contraseña en texto plano

**Variables Locales**:
- `consulta`: String SQL para buscar usuario
- `usuario`: Diccionario con datos del usuario o None
- `contrasena_hash`: String con hash SHA256 de la contraseña

**Acciones**:
1. Consulta la base de datos por nombre de usuario activo
2. Si encuentra usuario:
   - Genera hash de la contraseña ingresada
   - Compara con la contraseña almacenada
   - Si coincide: actualiza último acceso, guarda usuario y retorna
3. Si no encuentra o no coincide: retorna None

---

#### 3.3. Hash de Contraseña: `modelos/autenticacion.py`

**Archivo**: `modelos/autenticacion.py`  
**Clase**: `Autenticacion`  
**Método**: `hash_contrasena()`  
**Línea**: 15-17

```python
def hash_contrasena(self, contrasena):
    return hashlib.sha256(contrasena.encode()).hexdigest()
```

**Parámetros**:
- `contrasena`: String con contraseña en texto plano

**Retorna**:
- String con hash SHA256 hexadecimal

---

#### 3.4. Actualizar Último Acceso: `modelos/autenticacion.py`

**Archivo**: `modelos/autenticacion.py`  
**Clase**: `Autenticacion`  
**Método**: `actualizar_ultimo_acceso()`  
**Línea**: 61-64

```python
def actualizar_ultimo_acceso(self, usuario_id):
    consulta = "UPDATE usuarios SET fecha_ultimo_acceso = CURRENT_TIMESTAMP WHERE id = %s"
    self.base_datos.ejecutar_consulta(consulta, (usuario_id,))
```

**Parámetros**:
- `usuario_id`: Integer con el ID del usuario

**Acciones**:
1. Actualiza `fecha_ultimo_acceso` en la tabla `usuarios`

---

### **FASE 4: Callback de Login Exitoso**

#### 4.1. Callback en Aplicacion: `main.py`

**Archivo**: `main.py`  
**Clase**: `Aplicacion`  
**Método**: `on_login_exitoso()`  
**Línea**: 26-33

```python
def on_login_exitoso(self, usuario, autenticacion):
    # Limpiar ventana
    for widget in self.root.winfo_children():
        widget.destroy()                    # ← Limpia widgets del login
    
    # Mostrar ventana principal
    self.ventana_principal = VentanaPrincipal(self.root, usuario, autenticacion)
```

**Parámetros**:
- `usuario`: Diccionario con datos del usuario autenticado
- `autenticacion`: Instancia de `Autenticacion`

**Variables de Instancia**:
- `self.ventana_principal`: Instancia de `VentanaPrincipal`

**Acciones**:
1. Limpia todos los widgets de la ventana (login)
2. Crea instancia de `VentanaPrincipal` pasando:
   - `self.root`: Ventana raíz
   - `usuario`: Datos del usuario
   - `autenticacion`: Instancia de autenticación

---

### **FASE 5: Ventana Principal**

#### 5.1. Constructor de VentanaPrincipal: `vistas/ventana_principal.py`

**Archivo**: `vistas/ventana_principal.py`  
**Clase**: `VentanaPrincipal`  
**Método**: `__init__()`  
**Línea**: 41-64

```python
def __init__(self, root, usuario, autenticacion):
    self.root = root
    self.usuario = usuario
    self.autenticacion = autenticacion
    
    self.root.title(f"Lirios Eventos - {usuario['nombre_completo']}")
    
    # Obtener dimensiones de la pantalla
    ancho_pantalla = self.root.winfo_screenwidth()
    alto_pantalla = self.root.winfo_screenheight()
    
    # Configurar ventana para ocupar toda la pantalla
    self.root.geometry(f"{ancho_pantalla}x{alto_pantalla}+0+0")
    self.root.configure(bg='#ecf0f1')
    
    # Maximizar en Windows
    try:
        self.root.state('zoomed')
    except:
        pass
    
    self.vista_actual = None
    self.crear_widgets()
```

**Parámetros**:
- `root`: Ventana raíz de Tkinter
- `usuario`: Diccionario con datos del usuario
- `autenticacion`: Instancia de `Autenticacion`

**Variables de Instancia**:
- `self.root`: Referencia a la ventana raíz
- `self.usuario`: Diccionario con datos del usuario
- `self.autenticacion`: Instancia de `Autenticacion`
- `self.vista_actual`: Referencia a la vista actual (None inicialmente)
- `self.botones_menu`: Diccionario con botones del menú
- `self.contenido_frame`: Frame donde se muestran los módulos

**Variables Locales**:
- `ancho_pantalla`: Ancho de la pantalla en píxeles
- `alto_pantalla`: Alto de la pantalla en píxeles

**Acciones**:
1. Guarda referencias a root, usuario y autenticación
2. Configura título de la ventana
3. Obtiene dimensiones de la pantalla
4. Configura ventana para ocupar toda la pantalla
5. Intenta maximizar (Windows)
6. Inicializa `vista_actual` como None
7. Llama a `crear_widgets()`

---

#### 5.2. Crear Widgets de Ventana Principal: `vistas/ventana_principal.py`

**Archivo**: `vistas/ventana_principal.py`  
**Clase**: `VentanaPrincipal`  
**Método**: `crear_widgets()`  
**Línea**: 66-159

```python
def crear_widgets(self):
    # Barra superior
    barra_superior = tk.Frame(self.root, bg='#2c3e50', height=60)
    barra_superior.pack(fill=tk.X)
    
    # Logo y título
    titulo_frame = tk.Frame(barra_superior, bg='#2c3e50')
    # ... (código de labels)
    
    # Información del usuario
    usuario_frame = tk.Frame(barra_superior, bg='#2c3e50')
    # ... (código de labels y botón cerrar sesión)
    
    # Frame principal con menú y contenido
    main_frame = tk.Frame(self.root, bg='#ecf0f1')
    main_frame.pack(fill=tk.BOTH, expand=True)
    
    # Panel lateral de menú
    menu_frame = tk.Frame(main_frame, bg='#34495e', width=200)
    menu_frame.pack(side=tk.LEFT, fill=tk.Y)
    
    # Botones del menú
    self.botones_menu = {}
    modulos = self.obtener_modulos_disponibles()  # ← Obtiene módulos según rol
    
    for modulo in modulos:
        btn = tk.Button(menu_frame, text=modulo['nombre'], 
                       command=lambda m=modulo: self.mostrar_modulo(m['vista']))
        btn.pack(fill=tk.X, padx=5, pady=2)
        self.botones_menu[modulo['nombre']] = btn
    
    # Frame de contenido
    self.contenido_frame = tk.Frame(main_frame, bg='#ecf0f1')
    self.contenido_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
    
    # Mostrar módulo inicial
    if modulos:
        self.mostrar_modulo(modulos[0]['vista'])  # ← Muestra primer módulo
```

**Variables Creadas**:
- `barra_superior`: Frame de la barra superior
- `titulo_frame`: Frame del título
- `usuario_frame`: Frame de información del usuario
- `main_frame`: Frame principal
- `menu_frame`: Frame del menú lateral
- `self.botones_menu`: Diccionario {nombre: boton}
- `self.contenido_frame`: Frame donde se muestran los módulos
- `modulos`: Lista de diccionarios con módulos disponibles

**Acciones**:
1. Crea barra superior con título y usuario
2. Crea frame principal
3. Crea panel lateral de menú
4. Obtiene módulos disponibles según rol
5. Crea botones para cada módulo
6. Crea frame de contenido
7. Muestra el primer módulo disponible

---

#### 5.3. Obtener Módulos Disponibles: `vistas/ventana_principal.py`

**Archivo**: `vistas/ventana_principal.py`  
**Clase**: `VentanaPrincipal`  
**Método**: `obtener_modulos_disponibles()`  
**Línea**: 161-188

```python
def obtener_modulos_disponibles(self):
    rol = self.usuario['rol']
    modulos = []
    
    # Módulos comunes (todos los roles)
    modulos.append({'nombre': 'Eventos', 'vista': VistaEventos})
    modulos.append({'nombre': 'Pagos', 'vista': VistaPagos})
    
    # Módulos según rol
    if rol == 'administrador':
        modulos.append({'nombre': 'Productos', 'vista': VistaProductos})
        modulos.append({'nombre': 'Categorías', 'vista': VistaCategorias})
        modulos.append({'nombre': 'Salones', 'vista': VistaSalones})
        # ... más módulos
    elif rol == 'coordinador':
        modulos.append({'nombre': 'Clientes', 'vista': VistaClientes})
        # ... más módulos
    elif rol == 'gerente_general':
        modulos.append({'nombre': 'Clientes', 'vista': VistaClientes})
        modulos.append({'nombre': 'Reportes', 'vista': VistaReportes})
    
    return modulos
```

**Variables Locales**:
- `rol`: String con el rol del usuario
- `modulos`: Lista de diccionarios con formato `{'nombre': str, 'vista': clase}`

**Retorna**:
- Lista de diccionarios con módulos disponibles según el rol

**Acciones**:
1. Obtiene el rol del usuario
2. Agrega módulos comunes (Eventos, Pagos)
3. Agrega módulos según el rol específico
4. Retorna la lista de módulos

---

#### 5.4. Mostrar Módulo: `vistas/ventana_principal.py`

**Archivo**: `vistas/ventana_principal.py`  
**Clase**: `VentanaPrincipal`  
**Método**: `mostrar_modulo()`  
**Línea**: 190-201

```python
def mostrar_modulo(self, clase_vista):
    # Limpiar contenido actual
    for widget in self.contenido_frame.winfo_children():
        widget.destroy()                    # ← Limpia widgets del módulo anterior
    
    # Crear nueva vista
    try:
        self.vista_actual = clase_vista(self.contenido_frame, self.usuario, self.autenticacion)
    except Exception as e:
        mostrar_error(self.root, "Error", f"Error al cargar el módulo: {str(e)}")
```

**Parámetros**:
- `clase_vista`: Clase de la vista a mostrar (ej: VistaEventos, VistaPagos)

**Variables de Instancia**:
- `self.vista_actual`: Instancia de la vista actual

**Acciones**:
1. Limpia todos los widgets del frame de contenido
2. Crea instancia de la clase de vista pasando:
   - `self.contenido_frame`: Frame donde se mostrará
   - `self.usuario`: Datos del usuario
   - `self.autenticacion`: Instancia de autenticación
3. Maneja errores si falla la carga

---

### **FASE 6: Ejecución del Loop Principal**

#### 6.1. Ejecutar Aplicación: `main.py`

**Archivo**: `main.py`  
**Clase**: `Aplicacion`  
**Método**: `ejecutar()`  
**Línea**: 35-37

```python
def ejecutar(self):
    self.root.mainloop()                    # ← Inicia el loop de eventos de Tkinter
```

**Acciones**:
1. Inicia el loop principal de Tkinter
2. La aplicación queda esperando eventos del usuario
3. El loop se mantiene activo hasta que se cierra la ventana

---

## 📊 Diagrama de Secuencia

```
┌─────────────┐
│   main.py   │
│ Aplicacion  │
└──────┬──────┘
       │
       │ 1. __init__()
       ├─────────────────────────────────────────────┐
       │                                             │
       │ 2. mostrar_login()                         │
       ├─────────────────────────────────────────────┐
       │                                             │
       │ 3. VentanaLogin(root, callback)             │
       ├─────────────────────────────────────────────┐
       │                                             │
       │                                             ▼
       │                                    ┌──────────────────┐
       │                                    │ vistas/login.py  │
       │                                    │  VentanaLogin    │
       │                                    └────────┬─────────┘
       │                                             │
       │                                             │ 4. __init__()
       │                                             ├─────────────────┐
       │                                             │                 │
       │                                             │ 5. Autenticacion()│
       │                                             ├─────────────────┐│
       │                                             │                 ││
       │                                             │                 ▼│
       │                                             │        ┌──────────────────┐
       │                                             │        │ modelos/         │
       │                                             │        │ autenticacion.py  │
       │                                             │        │ Autenticacion    │
       │                                             │        └────────┬─────────┘
       │                                             │                 │
       │                                             │                 │ 6. BaseDatos()
       │                                             │                 ├──────────────┐
       │                                             │                 │              │
       │                                             │                 │              ▼
       │                                             │                 │    ┌──────────────────┐
       │                                             │                 │    │ modelos/         │
       │                                             │                 │    │ base_datos.py   │
       │                                             │                 │    │ BaseDatos       │
       │                                             │                 │    └─────────────────┘
       │                                             │                 │
       │                                             │ 6. crear_widgets()│
       │                                             ├─────────────────┘
       │                                             │
       │                                             │ [Usuario ingresa credenciales]
       │                                             │
       │                                             │ 7. iniciar_sesion()
       │                                             ├─────────────────────────────────┐
       │                                             │                                 │
       │                                             │ 8. autenticacion.iniciar_sesion()│
       │                                             ├─────────────────────────────────┐│
       │                                             │                                 ││
       │                                             │                                 ▼│
       │                                             │                    ┌──────────────────┐
       │                                             │                    │ Autenticacion    │
       │                                             │                    │ iniciar_sesion() │
       │                                             │                    └────────┬─────────┘
       │                                             │                             │
       │                                             │                             │ 9. BaseDatos.obtener_uno()
       │                                             │                             │    (Consulta MySQL)
       │                                             │                             │
       │                                             │                             │ 10. hash_contrasena()
       │                                             │                             │
       │                                             │                             │ 11. actualizar_ultimo_acceso()
       │                                             │                             │
       │                                             │                             │ [Retorna usuario]
       │                                             │                             │
       │                                             │ [Retorna usuario]           │
       │                                             │                             │
       │                                             │ 12. callback_login_exitoso()│
       │                                             ├─────────────────────────────┘
       │                                             │
       │ 13. on_login_exitoso(usuario, auth)         │
       ├─────────────────────────────────────────────┘
       │
       │ 14. VentanaPrincipal(root, usuario, auth)
       ├─────────────────────────────────────────────┐
       │                                             │
       │                                             ▼
       │                                    ┌──────────────────┐
       │                                    │ vistas/          │
       │                                    │ ventana_principal│
       │                                    │ VentanaPrincipal │
       │                                    └────────┬─────────┘
       │                                             │
       │                                             │ 15. __init__()
       │                                             ├─────────────────┐
       │                                             │                 │
       │                                             │ 16. crear_widgets()│
       │                                             ├─────────────────┐│
       │                                             │                 ││
       │                                             │ 17. obtener_modulos_disponibles()│
       │                                             ├─────────────────┐││
       │                                             │                 │││
       │                                             │ 18. mostrar_modulo()│
       │                                             ├─────────────────┐│││
       │                                             │                 ││││
       │                                             │                 ││││
       │                                             │ 19. VistaEventos()││││
       │                                             ├─────────────────┐││││
       │                                             │                 │││││
       │                                             │                 ▼│││││
       │                                             │    ┌──────────────────┐││││
       │                                             │    │ vistas/modulos/  │││││
       │                                             │    │ eventos_vista.py │││││
       │                                             │    │ VistaEventos     │││││
       │                                             │    └──────────────────┘││││
       │                                             │                        ││││
       │                                             │                        ││││
       │ 20. ejecutar()                             │                        ││││
       ├─────────────────────────────────────────────┘                        ││││
       │                                                                       ││││
       │ 21. root.mainloop()                                                  ││││
       │    [Aplicación en ejecución, esperando eventos]                     ││││
       │                                                                       ││││
       └───────────────────────────────────────────────────────────────────────┘│││
                                                                                 │││
                                                                                 │││
[Usuario interactúa con la aplicación]                                         │││
                                                                                 │││
└───────────────────────────────────────────────────────────────────────────────┘││
                                                                                  ││
                                                                                  ││
└─────────────────────────────────────────────────────────────────────────────────┘│
                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos y Clases

### **1. main.py**
```
Aplicacion
├── __init__(self)
│   ├── self.root: tk.Tk
│   ├── self.ventana_principal: None
│   └── mostrar_login()
│
├── mostrar_login(self)
│   └── VentanaLogin(root, callback)
│
├── on_login_exitoso(self, usuario, autenticacion)
│   └── VentanaPrincipal(root, usuario, autenticacion)
│
└── ejecutar(self)
    └── root.mainloop()
```

### **2. vistas/login.py**
```
VentanaLogin
├── __init__(self, root, callback_login_exitoso)
│   ├── self.root: tk.Tk
│   ├── self.callback_login_exitoso: function
│   ├── self.autenticacion: Autenticacion
│   ├── centrar_ventana()
│   └── crear_widgets()
│
├── centrar_ventana(self)
│   └── centrar_ventana(root, 500, 500)
│
├── crear_widgets(self)
│   ├── self.entry_usuario: tk.Entry
│   ├── self.entry_contrasena: tk.Entry
│   └── btn_login: tk.Button
│
└── iniciar_sesion(self)
    ├── usuario: str
    ├── contrasena: str
    ├── autenticacion.iniciar_sesion()
    ├── autenticacion.registrar_log()
    └── callback_login_exitoso(usuario, autenticacion)
```

### **3. modelos/autenticacion.py**
```
Autenticacion
├── __init__(self)
│   ├── self.base_datos: BaseDatos
│   └── self.usuario_actual: None
│
├── hash_contrasena(self, contrasena)
│   └── hashlib.sha256().hexdigest()
│
├── verificar_contrasena(self, contrasena_plana, contrasena_hash)
│   └── hash_contrasena() == contrasena_hash
│
├── iniciar_sesion(self, nombre_usuario, contrasena)
│   ├── base_datos.obtener_uno() [SELECT usuarios]
│   ├── hash_contrasena()
│   ├── verificar_contrasena()
│   ├── actualizar_ultimo_acceso()
│   └── self.usuario_actual = usuario
│
├── actualizar_ultimo_acceso(self, usuario_id)
│   └── base_datos.ejecutar_consulta() [UPDATE usuarios]
│
└── registrar_log(self, accion, modulo, descripcion, ip_address)
    └── base_datos.ejecutar_consulta() [INSERT logs_sistema]
```

### **4. modelos/base_datos.py**
```
BaseDatos
├── __init__(self)
│   ├── self.conexion: None
│   └── conectar()
│
├── conectar(self)
│   └── mysql.connector.connect(**DB_CONFIG)
│
├── ejecutar_consulta(self, consulta, parametros)
│   └── cursor.execute() + conexion.commit()
│
└── obtener_uno(self, consulta, parametros)
    └── cursor.execute() + cursor.fetchone()
```

### **5. vistas/ventana_principal.py**
```
VentanaPrincipal
├── __init__(self, root, usuario, autenticacion)
│   ├── self.root: tk.Tk
│   ├── self.usuario: dict
│   ├── self.autenticacion: Autenticacion
│   ├── self.vista_actual: None
│   ├── ancho_pantalla: int
│   ├── alto_pantalla: int
│   └── crear_widgets()
│
├── crear_widgets(self)
│   ├── barra_superior: tk.Frame
│   ├── main_frame: tk.Frame
│   ├── menu_frame: tk.Frame
│   ├── self.botones_menu: dict
│   ├── self.contenido_frame: tk.Frame
│   ├── obtener_modulos_disponibles()
│   └── mostrar_modulo(modulos[0]['vista'])
│
├── obtener_modulos_disponibles(self)
│   ├── rol: str
│   ├── modulos: list
│   └── return modulos
│
├── mostrar_modulo(self, clase_vista)
│   └── self.vista_actual = clase_vista(...)
│
└── cerrar_sesion(self)
    ├── autenticacion.registrar_log()
    ├── autenticacion.cerrar_sesion()
    └── root.quit()
```

---

## 🔄 Flujo Completo Resumido

```
1. main.py (línea 40)
   └─> Aplicacion.__init__()
       └─> Aplicacion.mostrar_login()
           └─> VentanaLogin.__init__(root, callback)
               ├─> Autenticacion.__init__()
               │   └─> BaseDatos.__init__()
               │       └─> BaseDatos.conectar() [MySQL]
               └─> VentanaLogin.crear_widgets()
                   └─> [UI de login creada]

2. Usuario ingresa credenciales y presiona "Iniciar Sesión"
   └─> VentanaLogin.iniciar_sesion()
       └─> Autenticacion.iniciar_sesion(usuario, contrasena)
           ├─> BaseDatos.obtener_uno() [SELECT usuarios]
           ├─> Autenticacion.hash_contrasena()
           ├─> Autenticacion.verificar_contrasena()
           ├─> Autenticacion.actualizar_ultimo_acceso()
           └─> return usuario

3. Si login exitoso:
   └─> callback_login_exitoso(usuario, autenticacion)
       └─> Aplicacion.on_login_exitoso(usuario, autenticacion)
           └─> VentanaPrincipal.__init__(root, usuario, autenticacion)
               └─> VentanaPrincipal.crear_widgets()
                   ├─> VentanaPrincipal.obtener_modulos_disponibles()
                   └─> VentanaPrincipal.mostrar_modulo(VistaEventos)
                       └─> VistaEventos.__init__(contenido_frame, usuario, autenticacion)

4. Aplicacion.ejecutar()
   └─> root.mainloop() [Aplicación en ejecución]
```

---

## 📝 Variables Clave en Cada Fase

### **Fase 1: Inicio**
- `app` (main.py): Instancia de Aplicacion
- `self.root` (Aplicacion): Ventana raíz de Tkinter

### **Fase 2: Login**
- `self.entry_usuario` (VentanaLogin): Campo de entrada usuario
- `self.entry_contrasena` (VentanaLogin): Campo de entrada contraseña
- `self.autenticacion` (VentanaLogin): Instancia de Autenticacion
- `self.callback_login_exitoso` (VentanaLogin): Función callback

### **Fase 3: Autenticación**
- `self.base_datos` (Autenticacion): Conexión a MySQL
- `self.usuario_actual` (Autenticacion): Usuario autenticado
- `usuario` (iniciar_sesion): Diccionario con datos del usuario
- `contrasena_hash` (iniciar_sesion): Hash SHA256 de la contraseña

### **Fase 4: Callback**
- `usuario` (on_login_exitoso): Diccionario con datos del usuario
- `autenticacion` (on_login_exitoso): Instancia de Autenticacion

### **Fase 5: Ventana Principal**
- `self.usuario` (VentanaPrincipal): Diccionario con datos del usuario
- `self.autenticacion` (VentanaPrincipal): Instancia de Autenticacion
- `self.vista_actual` (VentanaPrincipal): Vista actualmente visible
- `self.botones_menu` (VentanaPrincipal): Diccionario de botones del menú
- `self.contenido_frame` (VentanaPrincipal): Frame donde se muestran módulos
- `modulos` (obtener_modulos_disponibles): Lista de módulos disponibles

---

## 🔐 Flujo de Autenticación Detallado

```
Usuario ingresa: "admin" / "admin123"
    │
    ▼
VentanaLogin.iniciar_sesion()
    │
    ├─> usuario = "admin"
    ├─> contrasena = "admin123"
    │
    ▼
Autenticacion.iniciar_sesion("admin", "admin123")
    │
    ├─> Consulta SQL:
    │   SELECT * FROM usuarios 
    │   WHERE nombre_usuario = 'admin' AND activo = TRUE
    │
    ├─> BaseDatos.obtener_uno()
    │   └─> Retorna: {
    │       'id': 1,
    │       'nombre_usuario': 'admin',
    │       'contrasena': 'hash_sha256...',
    │       'nombre_completo': 'Administrador',
    │       'rol': 'administrador',
    │       ...
    │   }
    │
    ├─> hash_contrasena("admin123")
    │   └─> Retorna: "hash_sha256_de_admin123"
    │
    ├─> Comparación:
    │   usuario['contrasena'] == contrasena_hash
    │
    ├─> Si coincide:
    │   ├─> actualizar_ultimo_acceso(usuario['id'])
    │   │   └─> UPDATE usuarios SET fecha_ultimo_acceso = NOW() WHERE id = 1
    │   │
    │   ├─> self.usuario_actual = usuario
    │   │
    │   └─> return usuario
    │
    └─> Si no coincide:
        └─> return None
```

---

## 🎯 Puntos de Entrada y Salida

### **Punto de Entrada Principal**
- **Archivo**: `main.py`
- **Línea**: 40
- **Código**: `if __name__ == "__main__":`

### **Punto de Salida**
- **Método**: `VentanaPrincipal.cerrar_sesion()`
- **Acción**: `self.root.quit()` - Cierra el loop principal de Tkinter

---

## 🔍 Dependencias entre Módulos

```
main.py
├── vistas/login.py
│   ├── modelos/autenticacion.py
│   │   └── modelos/base_datos.py
│   │       └── config.py
│   └── utilidades/ventanas.py
│
└── vistas/ventana_principal.py
    ├── vistas/modulos/*.py (varios módulos)
    └── utilidades/ventanas.py
```

---

## 📌 Notas Importantes

1. **Conexión a Base de Datos**: Se crea automáticamente al instanciar `BaseDatos()` y se mantiene abierta durante toda la sesión.

2. **Gestión de Sesión**: El objeto `Autenticacion` mantiene `usuario_actual` durante toda la sesión.

3. **Callbacks**: El sistema usa callbacks para comunicar eventos entre componentes (login exitoso).

4. **Limpieza de Widgets**: Antes de mostrar una nueva vista, se destruyen todos los widgets anteriores.

5. **Módulos Dinámicos**: Los módulos disponibles se determinan según el rol del usuario en tiempo de ejecución.

6. **Manejo de Errores**: Se usa try-except para manejar errores de importación de módulos y carga de vistas.

---

## 🎨 Interfaz de Usuario - Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│  Lirios Eventos                    Usuario (Rol) [Cerrar]  │  ← Barra Superior
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Menú    │                                                  │
│  Principal│                                                  │
│          │                                                  │
│  Eventos │                                                  │
│  Pagos   │        Área de Contenido                        │
│  ...     │        (Vista del Módulo Seleccionado)          │
│          │                                                  │
│          │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de la Aplicación

```
[Inicio]
    │
    ▼
[main.py ejecutado]
    │
    ▼
[Aplicacion creada]
    │
    ▼
[VentanaLogin mostrada]
    │
    ▼
[Usuario ingresa credenciales]
    │
    ▼
[Autenticación verificada]
    │
    ├─> [Falla] ──> [Muestra error] ──> [Vuelve a login]
    │
    └─> [Éxito] ──> [VentanaPrincipal mostrada]
            │
            ▼
        [Módulo inicial cargado]
            │
            ▼
        [root.mainloop() - Aplicación activa]
            │
            ├─> [Usuario navega módulos]
            │   └─> [Vista actualizada]
            │
            └─> [Usuario cierra sesión]
                │
                └─> [root.quit() - Aplicación termina]
```

---

Este documento proporciona una visión completa del flujo de inicio de la aplicación desde el punto de entrada hasta la visualización del menú principal.

