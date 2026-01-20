# Guion de Presentación Scrum
## Sistema de Gestión de Eventos Lirios

---

## 🎯 INTRODUCCIÓN (2 minutos)

### Saludo y Contexto
- **Buenos días/tardes**, equipo y stakeholders
- Presentación del proyecto: **Sistema de Gestión de Eventos Lirios**
- Objetivo: Digitalizar y optimizar la gestión de eventos, clientes, productos y pagos

### Agenda
1. Sprint 1: Infraestructura Base y Base de Datos
2. Sprint 6: Levantamiento y Documentación de Requerimientos
3. Próximos pasos

---

## 📊 PARTE 1: SPRINT 1 - INFRAESTRUCTURA BASE Y BASE DE DATOS (5 minutos)

### Contexto del Sprint
- **Duración**: 17/10/2025 - 31/10/2025 (2 semanas)
- **Puntos estimados**: 42 puntos
- **Objetivo**: Establecer la base de datos completa y el sistema de autenticación

### Lo que se logró

#### 1. Base de Datos MySQL Completa ✅
**Story 1.1: Diseño e Implementación de Base de Datos**

- ✅ **Tablas principales creadas**:
  - Usuarios, Clientes, Categorías, Productos
  - Salones, Planes, Eventos
  - Pagos, Inventario, Promociones

- ✅ **Relaciones y restricciones**:
  - Foreign Keys implementadas
  - Integridad referencial garantizada
  - Índices optimizados para consultas frecuentes

- ✅ **Automatización**:
  - Triggers para actualización automática de saldos
  - Procedimientos almacenados para cálculos complejos

**Demostración visual**: Diagrama ERD o estructura de tablas

#### 2. Sistema de Conexión ✅
**Story 1.2: Sistema de Conexión y Gestión de Base de Datos**

- ✅ Clase BaseDatos implementada
- ✅ Métodos CRUD básicos funcionando
- ✅ Manejo de errores y reconexión automática
- ✅ Consultas parametrizadas (seguridad SQL)

**Demostración**: Código de ejemplo o diagrama de arquitectura

#### 3. Sistema de Autenticación ✅
**Story 2.1: Sistema de Autenticación**

- ✅ Login funcional con validación de credenciales
- ✅ Hash de contraseñas con SHA256
- ✅ Control de acceso por roles (Administrador, Coordinador, Gerente)
- ✅ Interfaz de login con Tkinter

**Demostración**: Captura de pantalla del login o demo en vivo

#### 4. Infraestructura Adicional ✅
- ✅ Ventana principal con navegación por módulos
- ✅ Sistema de logging implementado
- ✅ Archivos de log diarios funcionando

### Métricas del Sprint 1
- **Puntos completados**: 42/42 (100%)
- **Tiempo estimado vs real**: Dentro del tiempo planificado
- **Bloqueadores**: Ninguno significativo

### Lecciones Aprendidas
- ✅ La estructura de BD fue clave para el desarrollo posterior
- ✅ El sistema de logging facilitó la depuración
- ⚠️ Ajustes menores en la estructura de tablas durante el desarrollo

---

## 📋 PARTE 2: SPRINT 6 - LEVANTAMIENTO Y DOCUMENTACIÓN (5 minutos)

### Contexto del Sprint
- **Duración**: 26/12/2025 - 2/1/2026 (1 semana)
- **Puntos estimados**: 39 puntos
- **Objetivo**: Documentar requerimientos y crear plan de pruebas

### Lo que se logró

#### 1. Levantamiento de Requerimientos Funcionales ✅
**Story 19.1: Levantamiento de Requerimientos Funcionales**

- ✅ **Entrevistas con stakeholders** realizadas
- ✅ **Contexto del negocio** documentado
- ✅ **11 Requerimientos Funcionales** identificados y documentados:
  - RF-01 a RF-06: Gestión de usuarios, productos, planes, eventos, pagos, inventario
  - RF-07 a RF-11: Promociones, salones, reportes, integraciones, catálogo

**Demostración**: Documento de requerimientos o matriz

#### 2. Requerimientos No Funcionales ✅
**Story 19.2: Levantamiento de Requerimientos No Funcionales**

- ✅ **8 Requerimientos No Funcionales** documentados:
  - Rendimiento, Escalabilidad, Usabilidad, Seguridad
  - Mantenibilidad, Portabilidad, Confiabilidad, Compatibilidad

**Demostración**: Lista de RNF o criterios de calidad

#### 3. Casos de Uso y Diagramas ✅
**Story 19.3: Documentación de Casos de Uso**

- ✅ Casos de uso por rol documentados
- ✅ **3 Diagramas de flujo principales** creados:
  - Flujo de creación de eventos
  - Flujo de registro de pagos
  - Flujo de autenticación y navegación

**Demostración**: Diagramas de flujo (PlantUML o imágenes)

#### 4. Arquitectura y Diseño ✅
**Story 19.4: Documentación de Arquitectura y Diseño**

- ✅ Diagrama de arquitectura en capas
- ✅ Separación Modelo-Vista documentada
- ✅ Diagrama ERD (Entidad-Relación) completo

**Demostración**: Diagrama de arquitectura y ERD

#### 5. Plan de Pruebas ✅
**Story 20.1: Plan de Pruebas**

- ✅ Estrategia de pruebas definida
- ✅ Matriz de trazabilidad requerimientos-pruebas creada
- ✅ Plan de pruebas por módulo documentado

**Demostración**: Matriz de trazabilidad o plan de pruebas

#### 6. Scripts de Verificación ✅
**Story 20.6: Scripts de Verificación y Validación**

- ✅ Scripts de verificación de BD creados
- ✅ Scripts de verificación de configuración implementados
- ✅ Validación de Foreign Keys automatizada

**Demostración**: Ejecución de scripts o resultados

### Métricas del Sprint 6
- **Puntos completados**: 39/39 (100%)
- **Documentos generados**: 8+ documentos
- **Diagramas creados**: 5+ diagramas

### Lecciones Aprendidas
- ✅ La documentación temprana facilitó el desarrollo
- ✅ Los diagramas ayudaron a clarificar procesos
- ✅ La matriz de trazabilidad será útil para las pruebas

---

## 🔗 CONEXIÓN ENTRE LOS SPRINTS (2 minutos)

### ¿Por qué estos dos sprints son importantes?

1. **Sprint 1 (Base de Datos)** = **Fundamento técnico**
   - Sin base de datos, no hay sistema
   - La estructura sólida permite desarrollo rápido
   - Autenticación es la puerta de entrada

2. **Sprint 6 (Levantamiento)** = **Fundamento funcional**
   - Define QUÉ se debe construir
   - Establece CÓMO se probará
   - Documenta POR QUÉ se necesita

### Relación
- La base de datos implementada en Sprint 1 soporta todos los requerimientos documentados en Sprint 6
- Los diagramas de Sprint 6 validan que la estructura de BD es correcta
- El plan de pruebas de Sprint 6 asegura la calidad de lo construido en Sprint 1

---

## 📈 PRÓXIMOS PASOS (2 minutos)

### Sprints siguientes
- **Sprint 2**: Gestión de Usuarios, Clientes y Productos
- **Sprint 3**: Planes, Eventos y Pagos (Core del negocio)
- **Sprint 4**: Inventario, Reportes y Mejoras
- **Sprint 5**: Promociones, Notificaciones e Integraciones
- **Sprint 7**: Pruebas y Certificación Final

### Roadmap
- **Q4 2025**: Sprints 1-4 (Infraestructura y módulos core)
- **Q1 2026**: Sprints 5-7 (Integraciones, pruebas y certificación)

---

## ❓ PREGUNTAS Y RESPUESTAS (3 minutos)

### Preguntas frecuentes esperadas

**P: ¿Por qué empezar con la base de datos?**
R: Es el fundamento de todo el sistema. Sin una estructura sólida, el desarrollo posterior sería más lento y propenso a errores.

**P: ¿Por qué documentar en Sprint 6 y no al inicio?**
R: La documentación se hizo después de tener experiencia con el sistema. Esto permitió documentar mejor los procesos reales.

**P: ¿Qué tan compleja es la base de datos?**
R: 10 tablas principales con relaciones bien definidas. Está optimizada para las consultas más frecuentes del negocio.

**P: ¿Cuándo estará listo el sistema completo?**
R: Según el plan, el 5 de enero de 2026, después del Sprint 7 de certificación.

---

## 🎬 CIERRE (1 minuto)

### Resumen
- ✅ **Sprint 1**: Base de datos y autenticación funcionando
- ✅ **Sprint 6**: Requerimientos y plan de pruebas documentados
- ✅ **Próximos pasos**: Continuar con módulos de negocio

### Agradecimiento
- Gracias por su atención
- Estamos abiertos a feedback y sugerencias
- Próxima revisión: Al finalizar Sprint 2

---

## 📝 NOTAS PARA EL PRESENTADOR

### Tips de presentación
1. **Mantén el ritmo**: 15 minutos total, no más
2. **Usa visuales**: Diagramas, capturas, demos en vivo
3. **Sé específico**: Menciona números y métricas concretas
4. **Conecta con el negocio**: Explica el valor, no solo la técnica

### Materiales necesarios
- ✅ Diagrama ERD
- ✅ Diagramas de flujo
- ✅ Capturas de pantalla del sistema
- ✅ Documento de requerimientos
- ✅ Matriz de trazabilidad

### Puntos clave a enfatizar
- La base de datos está completa y funcionando
- Los requerimientos están documentados y validados
- El plan de pruebas asegura la calidad
- El proyecto va según lo planificado

---

## 📊 SLIDES SUGERIDAS (Opcional)

1. **Slide 1**: Portada - Título del proyecto
2. **Slide 2**: Agenda
3. **Slide 3**: Sprint 1 - Objetivo y métricas
4. **Slide 4**: Sprint 1 - Base de datos (diagrama ERD)
5. **Slide 5**: Sprint 1 - Autenticación (captura)
6. **Slide 6**: Sprint 6 - Objetivo y métricas
7. **Slide 7**: Sprint 6 - Requerimientos (matriz)
8. **Slide 8**: Sprint 6 - Diagramas de flujo
9. **Slide 9**: Conexión entre sprints
10. **Slide 10**: Próximos pasos
11. **Slide 11**: Preguntas

---

**Duración total estimada**: 15 minutos
**Formato**: Presentación informal, enfocada en resultados y valor de negocio



