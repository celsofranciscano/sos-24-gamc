Sí. Con este esquema de BD y los requisitos de **SOS-24**, la estructura debe separarse conceptualmente en **Central/GAMC** e **Institución**, pero ambos pueden vivir dentro de:

```text
/home/celso/Desktop/dev/app-sos-24/src/app/(dashboard)
```

No se coloca `ui`, `dashboard`, `tb` ni `login` delante de las rutas.

La regla principal será:

> **Las rutas representan módulos funcionales, no necesariamente tablas.**
> Una tabla solo tendrá CRUD cuando realmente corresponda. Las tablas históricas, de rastreo, mensajes, análisis, etc. se consultan o gestionan desde el módulo padre y **no se convierten automáticamente en CRUD independiente**.

---

# 1. Estructura general del Dashboard

```text
src/app/(dashboard)/
│
├── page.tsx
│
├── emergencies/
│   ├── page.tsx
│   └── [PK_emergency]/
│       └── page.tsx
│
├── emergency-map/
│   └── page.tsx
│
├── dispatch/
│   ├── page.tsx
│   └── [PK_assignment]/
│       └── page.tsx
│
├── emergency-rooms/
│   └── [PK_room]/
│       └── page.tsx
│
├── institutions/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_institution]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── subinstitutions/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_subinstitution]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── institution-types/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_institutionType]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── users/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_user]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── privileges/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_privilege]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── resource-types/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_resourceType]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── units/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_unit]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── emergency-types/
│   ├── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── [PK_emergencyType]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── citizens/
│   ├── page.tsx
│   └── [PK_citizen]/
│       └── page.tsx
│
├── ai/
│   ├── page.tsx
│   └── sessions/
│       └── page.tsx
│
├── notifications/
│   └── page.tsx
│
└── reports/
    ├── page.tsx
    ├── emergencies/
    │   └── page.tsx
    ├── institutions/
    │   └── page.tsx
    ├── response-times/
    │   └── page.tsx
    └── units/
        └── page.tsx
```

---

# 2. Dashboard principal

```text
/dashboard
```

En tu caso **no necesitas crear una carpeta `dashboard`**, porque `(dashboard)` ya es el grupo de rutas.

Por eso:

```text
src/app/(dashboard)/page.tsx
```

corresponde a:

```text
/
```

después del login.

Este dashboard debe cambiar según el usuario autenticado.

### Central / GAMC

Debe mostrar principalmente:

```text
Emergencias activas
Emergencias críticas
Emergencias pendientes
Unidades disponibles
Unidades en camino
Unidades en sitio
Instituciones activas
Emergencias atendidas
Tiempo promedio de respuesta
Mapa operativo
Alertas
```

### Institución

Debe mostrar:

```text
Emergencias asignadas
Asignaciones pendientes
Asignaciones aceptadas
Unidades disponibles
Unidades ocupadas
Emergencias en atención
Emergencias en camino
Mensajes
Notificaciones
```

---

# 3. Módulo principal: Emergencias

Esta es la **entidad central del sistema**.

```text
emergencies/
├── page.tsx
└── [PK_emergency]/
    └── page.tsx
```

No necesitas:

```text
create/
edit/
delete/
```

porque una emergencia **no debe tratarse como un CRUD convencional**.

Una emergencia nace mediante el flujo de reporte y luego evoluciona.

La página:

```text
emergencies/page.tsx
```

será el centro de monitoreo.

Y:

```text
emergencies/[PK_emergency]/page.tsx
```

será el expediente completo de la emergencia.

Dentro de esa vista se muestran:

```text
Información general
Reportes ciudadanos
Ubicaciones
Llamadas
Análisis IA
Requerimientos
Asignaciones
GPS
Historial de estados
Reportes de avance
Evidencias
Destinos
Sala de emergencia
Mensajes
```

---

# 4. Mapa operativo

```text
emergency-map/
└── page.tsx
```

No corresponde directamente a una tabla.

Es un módulo funcional que utiliza:

```text
tbemergencies
tbemergencylocations
tbunits
tbunitlocations
tbemergencyassignments
tbassignmenttracking
```

Debe mostrar:

```text
Emergencias
Unidades
Instituciones
Rutas
Ubicación de recursos
Estados
Prioridades
```

---

# 5. Despacho / asignaciones

```text
dispatch/
├── page.tsx
└── [PK_assignment]/
    └── page.tsx
```

No recomiendo CRUD tradicional.

El módulo controla:

```text
SOLICITADA
ACEPTADA
EN_CAMINO
EN_SITIO
FINALIZADA
RECHAZADA
CANCELADA
```

El detalle:

```text
dispatch/[PK_assignment]/page.tsx
```

muestra:

```text
Emergencia
Institución
Subinstitución
Unidad
Estado
Hora de asignación
Hora de aceptación
Hora de llegada
Hora de finalización
Rastreo GPS
```

---

# 6. Sala de emergencia

```text
emergency-rooms/
└── [PK_room]/
    └── page.tsx
```

No es CRUD.

Es el **canal operativo de la emergencia**.

Aquí estarán:

```text
Ciudadano
Central GAMC
Instituciones
Unidades
IA
Mensajes
Alertas
Evidencias
Estado de emergencia
```

Utiliza principalmente:

```text
tbemergencyrooms
tbemergencyroommembers
tbchatmessages
```

---

# 7. Instituciones

Sí corresponde CRUD:

```text
institutions/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_institution]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

Detalle de institución:

```text
/institutions/[PK_institution]
```

debe mostrar además:

```text
Información institucional
Subinstituciones
Usuarios
Unidades
Servicios
Emergencias asignadas
Destinos
Reportes de avance
```

No crear rutas independientes innecesarias para cada relación.

---

# 8. Subinstituciones

```text
subinstitutions/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_subinstitution]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

Ejemplos:

```text
Policía
 ├── EPI Norte
 ├── EPI Sud
 └── EPI Central
```

---

# 9. Usuarios

```text
users/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_user]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

**Importante:** los usuarios de instituciones **NO se registran solos**.

Los crea un usuario autorizado desde el dashboard.

El usuario se relaciona con:

```text
privilege
institution
subinstitution
```

---

# 10. Privilegios

```text
privileges/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_privilege]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

Aquí se administran los permisos/roles.

Ejemplos:

```text
CENTRAL_ADMIN
CENTRAL_OPERATOR
INSTITUTION_ADMIN
INSTITUTION_OPERATOR
DISPATCHER
```

Los nombres definitivos dependen de los privilegios que definan.

---

# 11. Tipos de institución

```text
institution-types/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_institutionType]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

Ejemplos:

```text
POLICIA
BOMBEROS
AMBULANCIA
SAR
SEGURIDAD_CIUDADANA
HOSPITAL
```

---

# 12. Tipos de recursos

```text
resource-types/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_resourceType]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

Ejemplos:

```text
AMBULANCIA
PATRULLA
CAMION_BOMBEROS
RESCATE
PERSONAL_MEDICO
```

---

# 13. Unidades

```text
units/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_unit]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

La unidad tendrá:

```text
Institución
Subinstitución
Tipo de recurso
Código
Nombre
Teléfono
Estado
Disponibilidad
Ubicación
```

El GPS no se edita manualmente desde `edit`.

Se alimenta mediante el sistema de rastreo.

---

# 14. Tipos de emergencia

```text
emergency-types/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_emergencyType]/
    ├── page.tsx
    └── edit/
        └── page.tsx
```

Ejemplos:

```text
INCENDIO
ACCIDENTE
ROBO
VIOLENCIA
DESASTRE
EMERGENCIA_MEDICA
RESCATE
```

---

# 15. Ciudadanos dentro del Dashboard

Aunque todavía no hacemos el módulo ciudadano, **Central sí debe poder consultar ciudadanos**.

```text
citizens/
├── page.tsx
└── [PK_citizen]/
    └── page.tsx
```

No recomiendo:

```text
citizens/create
citizens/edit
```

para Central.

El ciudadano crea su propia cuenta desde el sistema ciudadano.

Central solamente administra/consulta su información según permisos.

---

# 16. IA

```text
ai/
├── page.tsx
└── sessions/
    └── page.tsx
```

Aquí se puede monitorear:

```text
Sesiones IA
Intención detectada
Emergencia vinculada
Nivel de confianza
Redirecciones
Análisis realizados
```

Las tablas:

```text
tbaianalyses
tbaisessions
```

son principalmente **registros del funcionamiento de IA**, no CRUD manual.

---

# 17. Notificaciones

```text
notifications/
└── page.tsx
```

No necesita CRUD.

Las notificaciones se generan por eventos:

```text
Nueva emergencia
Asignación
Aceptación
Rechazo
Cambio de estado
Llegada de unidad
Nueva evidencia
Mensaje crítico
```

---

# 18. Reportes

```text
reports/
├── page.tsx
├── emergencies/
│   └── page.tsx
├── institutions/
│   └── page.tsx
├── response-times/
│   └── page.tsx
└── units/
    └── page.tsx
```

No corresponden directamente a tablas.

Son consultas y estadísticas.

---

# 19. Tablas que NO deben tener ruta propia

Estas tablas deben administrarse desde su entidad/módulo principal:

| Tabla                        | Se administra desde |
| ---------------------------- | ------------------- |
| `tbdevices`                  | Ciudadano           |
| `tbusersdevices`             | Usuario             |
| `tbunitlocations`            | Unidades / mapa     |
| `tbemergencyreports`         | Emergencia          |
| `tbemergencylocations`       | Emergencia / mapa   |
| `tbcalls`                    | Emergencia          |
| `tbemergencyroommembers`     | Sala                |
| `tbchatmessages`             | Sala                |
| `tbevidences`                | Emergencia          |
| `tbaianalyses`               | Emergencia / IA     |
| `tbemergencyrequirements`    | Emergencia          |
| `tbassignmenttracking`       | Asignación / mapa   |
| `tbemergencystatushistory`   | Emergencia          |
| `tbemergencyprogressreports` | Emergencia          |
| `tbnotifications`            | Notificaciones      |
| `tbemergencydestinations`    | Emergencia          |

**No convertir cada tabla en CRUD solo porque existe en Prisma.**

---

# 20. API

La misma lógica se aplica a:

```text
/home/celso/Desktop/dev/app-sos-24/src/app/api
```

Ejemplo:

```text
api/
├── emergencies/
│   ├── route.ts
│   └── [PK_emergency]/
│       └── route.ts
│
├── institutions/
│   ├── route.ts
│   └── [PK_institution]/
│       └── route.ts
│
├── users/
│   ├── route.ts
│   └── [PK_user]/
│       └── route.ts
│
├── units/
│   ├── route.ts
│   └── [PK_unit]/
│       └── route.ts
│
└── ...
```

Pero para operaciones específicas se agregan rutas funcionales:

```text
api/emergencies/[PK_emergency]/assignments/route.ts
api/emergencies/[PK_emergency]/reports/route.ts
api/emergencies/[PK_emergency]/evidence/route.ts
api/emergencies/[PK_emergency]/messages/route.ts
api/emergencies/[PK_emergency]/status/route.ts
api/emergencies/[PK_emergency]/locations/route.ts
```

Y:

```text
api/assignments/[PK_assignment]/tracking/route.ts
api/assignments/[PK_assignment]/accept/route.ts
api/assignments/[PK_assignment]/reject/route.ts
api/assignments/[PK_assignment]/arrive/route.ts
api/assignments/[PK_assignment]/complete/route.ts
```

Porque **aceptar una asignación no es un CRUD**, es una operación de negocio.

---

# 21. Regla definitiva para las carpetas

Para el agente de desarrollo, esta debe ser la regla:

```text
REGLA 1
No colocar "ui", "tb", "dashboard" ni "login" en los nombres de las rutas.

REGLA 2
Las páginas del dashboard están dentro de:
src/app/(dashboard)/

REGLA 3
Las API están dentro de:
src/app/api/

REGLA 4
Los nombres de las carpetas se basan en el nombre de la entidad
sin el prefijo "tb".

tbemergencies       → emergencies
tbinstitutions      → institutions
tbusers             → users
tbunits             → units

REGLA 5
Cuando exista CRUD:
entity/
├── page.tsx
├── create/
│   └── page.tsx
└── [PK_entity]/
    ├── page.tsx
    └── edit/
        └── page.tsx

REGLA 6
El parámetro dinámico DEBE utilizar exactamente el nombre
de la PK de Prisma.

tbemergencies → [PK_emergency]
tbinstitutions → [PK_institution]
tbusers → [PK_user]
tbunits → [PK_unit]

REGLA 7
EDIT siempre está dentro del registro:

[PK_entity]/
└── edit/
    └── page.tsx

Nunca crear:
entity/edit/[id]
entity/[id]/edit/[id]

REGLA 8
No todas las tablas son CRUD.

Las tablas de historial, rastreo, mensajes, análisis,
notificaciones y relaciones operativas se gestionan desde
el módulo funcional correspondiente.

REGLA 9
Las operaciones de negocio NO se modelan como CRUD.

Ejemplos:
accept
reject
arrive
complete
assign
cancel
classify
link
close

REGLA 10
Las operaciones de negocio deben estar debajo de la entidad
que las origina.

Ejemplo:

emergencies/[PK_emergency]/assignments
assignments/[PK_assignment]/accept

REGLA 11
No crear rutas para funcionalidades que no tengan una
necesidad real en el sistema.

REGLA 12
El dashboard debe ser RBAC:
el mismo sistema muestra diferentes módulos según
privilege, institution y subinstitution.

REGLA 13
Los usuarios de instituciones son creados desde el dashboard.
No existe registro público de usuarios institucionales.

REGLA 14
Los ciudadanos sí podrán registrarse desde el sistema ciudadano,
pero ese módulo se desarrollará posteriormente.

REGLA 15
La emergencia es la entidad central del sistema.
Reportes, IA, evidencias, llamadas, ubicaciones, requerimientos,
asignaciones, rastreo, estados, avances, destinos y sala
se consultan desde la emergencia.
```

### La arquitectura conceptual queda así:

```text
                         SOS-24
                           │
              ┌────────────┴────────────┐
              │                         │
          CENTRAL                    INSTITUCIÓN
              │                         │
       ┌──────┼──────┐             ┌────┼─────┐
       │      │      │             │    │     │
   Emergencias Mapa  Gestión     Emergencias Unidades
       │             │             │
       └──────┬──────┘             │
              │                    │
              └──────────┬─────────┘
                         │
                    EMERGENCIA
                         │
        ┌────────────────┼────────────────┐
        │                │                │
       IA            ASIGNACIÓN         SALA
        │                │                │
    Análisis         Institución       Chat
    Sesiones         Unidad            Miembros
                     GPS
```

Esta estructura es mucho más adecuada que hacer **una carpeta por cada una de las 30 tablas**, porque separa **datos**, **operaciones de negocio** y **módulos reales del sistema**.
