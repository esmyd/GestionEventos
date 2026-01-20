# 📊 Diagrama de Flujo - Inicio de Aplicación

## Diagrama de Secuencia Detallado

```mermaid
sequenceDiagram
    participant Main as main.py<br/>Aplicacion
    participant Login as vistas/login.py<br/>VentanaLogin
    participant Auth as modelos/autenticacion.py<br/>Autenticacion
    participant BD as modelos/base_datos.py<br/>BaseDatos
    participant MySQL as MySQL Database
    participant Principal as vistas/ventana_principal.py<br/>VentanaPrincipal
    participant Modulo as vistas/modulos/*<br/>VistaModulo

    Main->>Main: 1. if __name__ == "__main__"
    Main->>Main: 2. app = Aplicacion()
    Main->>Main: 3. __init__()
    Main->>Main: 4. self.root = tk.Tk()
    Main->>Main: 5. mostrar_login()
    Main->>Login: 6. VentanaLogin(root, callback)
    
    Login->>Login: 7. __init__(root, callback)
    Login->>Auth: 8. Autenticacion()
    Auth->>BD: 9. BaseDatos()
    BD->>MySQL: 10. mysql.connector.connect()
    MySQL-->>BD: 11. Conexión establecida
    BD-->>Auth: 12. Instancia BaseDatos
    Auth-->>Login: 13. Instancia Autenticacion
    Login->>Login: 14. crear_widgets()
    Login-->>Main: 15. VentanaLogin creada
    
    Note over Login: Usuario ingresa credenciales<br/>y presiona "Iniciar Sesión"
    
    Login->>Login: 16. iniciar_sesion()
    Login->>Auth: 17. iniciar_sesion(usuario, contrasena)
    Auth->>BD: 18. obtener_uno(SELECT usuarios)
    BD->>MySQL: 19. SELECT * FROM usuarios WHERE...
    MySQL-->>BD: 20. Datos del usuario
    BD-->>Auth: 21. usuario dict
    Auth->>Auth: 22. hash_contrasena(contrasena)
    Auth->>Auth: 23. verificar_contrasena()
    alt Contraseña correcta
        Auth->>BD: 24. ejecutar_consulta(UPDATE usuarios)
        BD->>MySQL: 25. UPDATE fecha_ultimo_acceso
        MySQL-->>BD: 26. Actualizado
        BD-->>Auth: 27. Éxito
        Auth->>Auth: 28. self.usuario_actual = usuario
        Auth-->>Login: 29. usuario dict
        Login->>Auth: 30. registrar_log()
        Auth->>BD: 31. ejecutar_consulta(INSERT logs)
        BD->>MySQL: 32. INSERT INTO logs_sistema
        MySQL-->>BD: 33. Insertado
        BD-->>Auth: 34. Éxito
        Auth-->>Login: 35. Log registrado
        Login->>Main: 36. callback_login_exitoso(usuario, auth)
    else Contraseña incorrecta
        Auth-->>Login: 37. None
        Login->>Login: 38. mostrar_error()
    end
    
    Main->>Main: 39. on_login_exitoso(usuario, auth)
    Main->>Main: 40. Limpiar widgets del login
    Main->>Principal: 41. VentanaPrincipal(root, usuario, auth)
    
    Principal->>Principal: 42. __init__(root, usuario, auth)
    Principal->>Principal: 43. Configurar ventana (maximizar)
    Principal->>Principal: 44. crear_widgets()
    Principal->>Principal: 45. obtener_modulos_disponibles()
    Principal->>Principal: 46. Crear botones del menú
    Principal->>Principal: 47. mostrar_modulo(VistaEventos)
    Principal->>Modulo: 48. VistaEventos(contenido_frame, usuario, auth)
    Modulo->>Modulo: 49. __init__()
    Modulo->>Modulo: 50. crear_widgets()
    Modulo->>Modulo: 51. cargar_datos()
    Modulo-->>Principal: 52. Vista creada
    Principal-->>Main: 53. VentanaPrincipal creada
    
    Main->>Main: 54. app.ejecutar()
    Main->>Main: 55. root.mainloop()
    
    Note over Main: Aplicación en ejecución<br/>Esperando eventos del usuario
```

## Diagrama de Flujo de Decisión

```mermaid
flowchart TD
    A[Inicio: main.py ejecutado] --> B[Crear Aplicacion]
    B --> C[Crear tk.Tk - Ventana raíz]
    C --> D[Llamar mostrar_login]
    D --> E[Limpiar widgets existentes]
    E --> F[Crear VentanaLogin]
    F --> G[Crear Autenticacion]
    G --> H[Crear BaseDatos]
    H --> I[Conectar a MySQL]
    I --> J{Conexión exitosa?}
    J -->|No| K[Error: No se puede conectar]
    J -->|Sí| L[Crear widgets de login]
    L --> M[Mostrar ventana de login]
    M --> N[Usuario ingresa credenciales]
    N --> O[Presiona Iniciar Sesión]
    O --> P[Validar campos no vacíos]
    P --> Q{Campos válidos?}
    Q -->|No| R[Mostrar error]
    R --> N
    Q -->|Sí| S[Autenticacion.iniciar_sesion]
    S --> T[Consultar usuario en BD]
    T --> U{Usuario encontrado?}
    U -->|No| V[Retornar None]
    V --> W[Mostrar error de autenticación]
    W --> N
    U -->|Sí| X[Hash de contraseña]
    X --> Y[Comparar contraseñas]
    Y --> Z{Contraseña correcta?}
    Z -->|No| V
    Z -->|Sí| AA[Actualizar último acceso]
    AA --> AB[Guardar usuario_actual]
    AB --> AC[Registrar log de inicio]
    AC --> AD[Callback: on_login_exitoso]
    AD --> AE[Limpiar widgets de login]
    AE --> AF[Crear VentanaPrincipal]
    AF --> AG[Configurar ventana maximizada]
    AG --> AH[Crear widgets principales]
    AH --> AI[Obtener módulos según rol]
    AI --> AJ[Crear botones del menú]
    AJ --> AK[Mostrar primer módulo]
    AK --> AL[Crear VistaEventos]
    AL --> AM[Ejecutar root.mainloop]
    AM --> AN[Aplicación en ejecución]
    AN --> AO{Usuario interactúa?}
    AO -->|Navega módulos| AP[Cambiar vista]
    AP --> AL
    AO -->|Cierra sesión| AQ[Registrar log]
    AQ --> AR[Cerrar sesión]
    AR --> AS[Terminar aplicación]
```

## Diagrama de Clases Simplificado

```mermaid
classDiagram
    class Aplicacion {
        -tk.Tk root
        -VentanaPrincipal ventana_principal
        +__init__()
        +mostrar_login()
        +on_login_exitoso(usuario, autenticacion)
        +ejecutar()
    }
    
    class VentanaLogin {
        -tk.Tk root
        -function callback_login_exitoso
        -Autenticacion autenticacion
        -tk.Entry entry_usuario
        -tk.Entry entry_contrasena
        +__init__(root, callback)
        +crear_widgets()
        +iniciar_sesion()
        +centrar_ventana()
    }
    
    class Autenticacion {
        -BaseDatos base_datos
        -dict usuario_actual
        +__init__()
        +iniciar_sesion(nombre_usuario, contrasena)
        +hash_contrasena(contrasena)
        +verificar_contrasena(plana, hash)
        +actualizar_ultimo_acceso(usuario_id)
        +registrar_log(accion, modulo, descripcion)
        +cerrar_sesion()
    }
    
    class BaseDatos {
        -mysql.connector.connection conexion
        +__init__()
        +conectar()
        +ejecutar_consulta(consulta, parametros)
        +obtener_uno(consulta, parametros)
        +obtener_todos(consulta, parametros)
        +desconectar()
    }
    
    class VentanaPrincipal {
        -tk.Tk root
        -dict usuario
        -Autenticacion autenticacion
        -object vista_actual
        -dict botones_menu
        -tk.Frame contenido_frame
        +__init__(root, usuario, autenticacion)
        +crear_widgets()
        +obtener_modulos_disponibles()
        +mostrar_modulo(clase_vista)
        +cerrar_sesion()
    }
    
    class VistaEventos {
        -tk.Frame parent
        -dict usuario
        -Autenticacion autenticacion
        -EventoModelo modelo
        +__init__(parent, usuario, autenticacion)
        +crear_widgets()
        +cargar_datos()
    }
    
    Aplicacion --> VentanaLogin : crea
    Aplicacion --> VentanaPrincipal : crea
    VentanaLogin --> Autenticacion : usa
    Autenticacion --> BaseDatos : usa
    VentanaPrincipal --> VistaEventos : crea
```

## Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> Iniciando: main.py ejecutado
    Iniciando --> Login: Aplicacion creada
    Login --> Validando: Usuario presiona login
    Validando --> ConsultandoBD: Credenciales válidas
    ConsultandoBD --> Verificando: Usuario encontrado
    Verificando --> Autenticado: Contraseña correcta
    Verificando --> Login: Contraseña incorrecta
    ConsultandoBD --> Login: Usuario no encontrado
    Autenticado --> Principal: Callback ejecutado
    Principal --> CargandoModulo: Widgets creados
    CargandoModulo --> Ejecutando: Módulo cargado
    Ejecutando --> Navegando: Usuario selecciona módulo
    Navegando --> CargandoModulo: Nuevo módulo
    Ejecutando --> Cerrando: Usuario cierra sesión
    Cerrando --> [*]: root.quit()
```

## Tabla de Métodos y Variables por Fase

| Fase | Archivo | Clase | Método | Variables Principales |
|------|---------|-------|--------|----------------------|
| **1. Inicio** | main.py | Aplicacion | `__init__()` | `self.root`, `self.ventana_principal` |
| | main.py | Aplicacion | `mostrar_login()` | - |
| | main.py | Aplicacion | `ejecutar()` | - |
| **2. Login** | vistas/login.py | VentanaLogin | `__init__()` | `self.root`, `self.callback_login_exitoso`, `self.autenticacion` |
| | vistas/login.py | VentanaLogin | `crear_widgets()` | `self.entry_usuario`, `self.entry_contrasena` |
| | vistas/login.py | VentanaLogin | `iniciar_sesion()` | `usuario`, `contrasena`, `usuario_autenticado` |
| **3. Autenticación** | modelos/autenticacion.py | Autenticacion | `__init__()` | `self.base_datos`, `self.usuario_actual` |
| | modelos/autenticacion.py | Autenticacion | `iniciar_sesion()` | `usuario`, `contrasena_hash` |
| | modelos/autenticacion.py | Autenticacion | `hash_contrasena()` | `contrasena` |
| | modelos/base_datos.py | BaseDatos | `__init__()` | `self.conexion` |
| | modelos/base_datos.py | BaseDatos | `conectar()` | - |
| | modelos/base_datos.py | BaseDatos | `obtener_uno()` | `consulta`, `parametros` |
| **4. Callback** | main.py | Aplicacion | `on_login_exitoso()` | `usuario`, `autenticacion` |
| **5. Principal** | vistas/ventana_principal.py | VentanaPrincipal | `__init__()` | `self.usuario`, `self.autenticacion`, `self.vista_actual` |
| | vistas/ventana_principal.py | VentanaPrincipal | `crear_widgets()` | `self.botones_menu`, `self.contenido_frame`, `modulos` |
| | vistas/ventana_principal.py | VentanaPrincipal | `obtener_modulos_disponibles()` | `rol`, `modulos` |
| | vistas/ventana_principal.py | VentanaPrincipal | `mostrar_modulo()` | `clase_vista` |

---

## 🔑 Puntos Clave del Flujo

1. **Separación de Responsabilidades**: Cada clase tiene una responsabilidad específica
2. **Callbacks**: Se usan para comunicación entre componentes
3. **Gestión de Estado**: El usuario autenticado se mantiene en `Autenticacion.usuario_actual`
4. **Limpieza de UI**: Los widgets se destruyen antes de crear nuevos
5. **Carga Dinámica**: Los módulos se cargan según el rol del usuario
6. **Conexión Persistente**: La conexión a MySQL se mantiene durante toda la sesión

---

Este documento complementa `FLUJO_INICIO_APLICACION.md` con diagramas visuales del flujo de inicio.

