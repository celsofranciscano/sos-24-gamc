Sí. Tomando **exactamente tu estructura `(citizen)`**, la PWA debe estar pensada primero para teléfono y el ciudadano debe tener un flujo muy simple: **Mapa/SOS → Historial → Números → Cuenta**.

Además, por tu modelo Prisma, no conviene llenar el menú con demasiadas opciones. Muchas funcionalidades deben estar **dentro del detalle de una emergencia**, especialmente estado, institución asignada, ubicación de la unidad, chat, evidencias, IA y seguimiento.

---

# 1. Estructura general de rutas del ciudadano

Tu carpeta puede quedar así:

```text
src/app/
│
├── (citizen)/
│   │
│   └── citizen/
│       │
│       ├── login/
│       │   └── page.tsx
│       │
│       ├── register/
│       │   └── page.tsx
│       │
│       ├── forgot-password/
│       │   └── page.tsx
│       │
│       ├── verify/
│       │   └── page.tsx
│       │
│       ├── page.tsx
│       │
│       ├── emergency/
│       │   ├── page.tsx
│       │   │
│       │   ├── new/
│       │   │   └── page.tsx
│       │   │
│       │   └── [emergencyCode]/
│       │       ├── page.tsx
│       │       ├── chat/
│       │       │   └── page.tsx
│       │       ├── evidence/
│       │       │   └── page.tsx
│       │       └── tracking/
│       │           └── page.tsx
│       │
│       ├── history/
│       │   ├── page.tsx
│       │   └── [emergencyCode]/
│       │       └── page.tsx
│       │
│       ├── emergency-numbers/
│       │   ├── page.tsx
│       │   └── [institutionId]/
│       │       └── page.tsx
│       │
│       └── account/
│           ├── page.tsx
│           ├── profile/
│           │   └── page.tsx
│           ├── notifications/
│           │   └── page.tsx
│           ├── devices/
│           │   └── page.tsx
│           ├── privacy/
│           │   └── page.tsx
│           └── about/
│               └── page.tsx
```

### URLs reales

Recuerda que `(citizen)` **no aparece en la URL**, porque es un Route Group de Next.js.

Por tanto:

```text
/citizen/login
/citizen/register
/citizen/forgot-password
/citizen/verify

/citizen

/citizen/emergency
/citizen/emergency/new
/citizen/emergency/[emergencyCode]
/citizen/emergency/[emergencyCode]/chat
/citizen/emergency/[emergencyCode]/evidence
/citizen/emergency/[emergencyCode]/tracking

/citizen/history
/citizen/history/[emergencyCode]

/citizen/emergency-numbers
/citizen/emergency-numbers/[institutionId]

/citizen/account
/citizen/account/profile
/citizen/account/notifications
/citizen/account/devices
/citizen/account/privacy
/citizen/account/about
```

---

# 2. Pantallas de autenticación

## `/citizen/login`

```text
src/app/(citizen)/citizen/login/page.tsx
```

### Funciones

- Iniciar sesión con:
  - número telefónico
  - contraseña

- Mostrar/ocultar contraseña
- Recordar sesión
- Validación de datos
- Recuperar contraseña
- Ir a registro
- Mantener sesión mediante cookie/token
- Redireccionar automáticamente a `/citizen` si ya está autenticado.

Relacionado principalmente con:

```text
tbcitizens
```

---

# 3. Registro

## `/citizen/register`

```text
src/app/(citizen)/citizen/register/page.tsx
```

### Datos

```text
Nombres
Apellidos
CI
Número telefónico
Correo electrónico
Contraseña
Confirmar contraseña
```

Tu tabla soporta:

```text
tbcitizens
├── firstName
├── lastName
├── CI
├── phoneNumber
├── email
├── password
├── profileImage
└── status
```

### Después del registro

Podrías hacer:

```text
Registro
   ↓
Verificación
   ↓
Inicio de sesión
   ↓
Permiso de ubicación
   ↓
Permiso de notificaciones
   ↓
/citizen
```

---

# 4. Recuperación de contraseña

## `/citizen/forgot-password`

```text
src/app/(citizen)/citizen/forgot-password/page.tsx
```

El ciudadano introduce:

```text
Número telefónico o correo
```

Luego:

```text
Enviar código
↓
Verificar código
↓
Nueva contraseña
```

---

# 5. Verificación

## `/citizen/verify`

```text
src/app/(citizen)/citizen/verify/page.tsx
```

Puede utilizarse para:

- verificar teléfono
- verificar correo
- verificar código temporal.

---

# 6. HOME PRINCIPAL DEL CIUDADANO

## `/citizen`

```text
src/app/(citizen)/citizen/page.tsx
```

Esta es la **pantalla principal de la PWA**.

Yo la diseñaría específicamente para teléfono.

### Parte superior

```text
Hola, Celso

¿Necesitas ayuda?
```

### Centro

Mapa:

```text
┌──────────────────────────┐
│                          │
│          📍 TÚ           │
│                          │
│     mapa de ubicación    │
│                          │
│                          │
└──────────────────────────┘
```

Y sobre el mapa:

### Botón SOS

```text
       SOS
   EMERGENCIA
```

Este botón debe ser el elemento más importante de toda la aplicación.

---

# 7. Menú inferior de 4 opciones

Exactamente como planteaste:

```text
┌─────────────────────────────────┐
│                                 │
│          CONTENIDO              │
│                                 │
├────────┬────────┬───────┬───────┤
│  MAPA  │HISTORIAL│ NÚMEROS│CUENTA│
└────────┴────────┴───────┴───────┘
```

Rutas:

```text
MAPA
/citizen

HISTORIAL
/citizen/history

NÚMEROS
/citizen/emergency-numbers

CUENTA
/citizen/account
```

---

# 8. MAPA / SOS

## `/citizen/emergency`

```text
src/app/(citizen)/citizen/emergency/page.tsx
```

Esta pantalla puede ser la interfaz de preparación de una emergencia.

Pero incluso podría estar integrada directamente en `/citizen`.

---

# 9. Crear emergencia

## `/citizen/emergency/new`

```text
src/app/(citizen)/citizen/emergency/new/page.tsx
```

Aquí empieza el flujo real.

### Flujo

```text
Ciudadano presiona SOS
        ↓
Solicitar ubicación GPS
        ↓
Obtener coordenadas
        ↓
Iniciar sesión IA
        ↓
IA realiza preguntas
        ↓
Determinar información inicial
        ↓
Crear emergencia
        ↓
Asignar prioridad
        ↓
Buscar institución/recurso
        ↓
Crear asignación
        ↓
Abrir sala de emergencia
        ↓
Mostrar seguimiento
```

---

# 10. Interacción con IA

Tu tabla:

```text
tbaisessions
```

sirve específicamente para esto.

La IA podría preguntar:

```text
¿Qué está sucediendo?

¿Dónde ocurrió?

¿Hay personas heridas?

¿Cuántas personas están afectadas?

¿Hay personas atrapadas?

¿Hay fuego?

¿Existe algún peligro adicional?
```

Pero hay una consideración importante:

## El SOS no debe depender de que el ciudadano termine toda la conversación

Por ejemplo:

```text
SOS
 ↓
GPS
 ↓
"Hay un accidente"
 ↓
Crear emergencia inmediatamente
 ↓
IA continúa recopilando información
```

Así tienes:

**respuesta inmediata + IA como apoyo**, no IA como bloqueo.

---

# 11. Ubicación GPS

Tu base ya tiene:

```text
tbemergencylocations
```

Ahí guardarías:

```text
latitude
longitude
accuracy
address
createdAt
```

Por ejemplo:

```text
Emergencia SOS-260822-0001

Latitud:     -17.3935
Longitud:    -66.1570
Precisión:   8 metros
Dirección:   Cochabamba...
```

---

# 12. Evidencias

El ciudadano debe poder enviar:

```text
📷 Imagen
🎥 Video
🎙️ Audio
```

Ruta:

```text
/citizen/emergency/[emergencyCode]/evidence
```

Relacionada con:

```text
tbevidences
```

Por ejemplo:

```text
SOS-260822-0001
│
├── imagen_01.jpg
├── imagen_02.jpg
├── video_01.mp4
└── audio_01.webm
```

---

# 13. Detalle de emergencia

## `/citizen/emergency/[emergencyCode]`

Esta debería ser **la pantalla más completa del ciudadano después del SOS**.

Por ejemplo:

```text
EMERGENCIA #SOS-260822-0001

🔴 EN ATENCIÓN

Accidente de tránsito

Prioridad:
CRÍTICA

Institución:
SAR

Unidad:
SAR-03

Estado:
EN CAMINO
```

Y debajo:

```text
📍 Tu ubicación

🚑 Unidad en camino

⏱ Tiempo estimado

💬 Chat

📷 Evidencias

📋 Información de emergencia
```

---

# 14. Estado de emergencia

Tu tabla:

```text
tbemergencies
```

maneja:

```text
REPORTADA
EN_ANALISIS
CLASIFICADA
ASIGNADA
EN_ATENCION
RESUELTA
FALSA_ALARMA
CANCELADA
AGRUPADA_DUPLICADA
```

El ciudadano **no debería modificar estos estados**.

Solo puede visualizarlos.

Por ejemplo:

```text
✓ Emergencia reportada
✓ Emergencia analizada
✓ Institución asignada
✓ Unidad aceptó
● Unidad en camino
○ Unidad en sitio
○ Emergencia resuelta
```

---

# 15. Historial de estados

Tu tabla:

```text
tbemergencystatushistory
```

permite mostrar:

```text
08:32
Emergencia reportada

08:33
IA clasificó la emergencia

08:34
SAR asignado

08:35
Unidad SAR-03 aceptó

08:37
Unidad en camino

08:43
Unidad llegó al lugar
```

Esto debería aparecer dentro del detalle.

---

# 16. Seguimiento GPS de la unidad

## `/citizen/emergency/[emergencyCode]/tracking`

```text
src/app/(citizen)/citizen/emergency/[emergencyCode]/tracking/page.tsx
```

Aquí puedes mostrar:

```text
       🚑
        ↓
       📍
      TÚ
```

La información proviene de:

```text
tbassignmenttracking
```

y:

```text
tbunitlocations
```

El ciudadano podría ver:

```text
Unidad: SAR-03
Estado: EN CAMINO

Distancia aproximada: 1.8 km
ETA: 6 minutos
```

---

# 17. Chat de emergencia

## `/citizen/emergency/[emergencyCode]/chat`

```text
src/app/(citizen)/citizen/emergency/[emergencyCode]/chat/page.tsx
```

Aquí está una de las partes más importantes de tu sistema.

La conversación puede involucrar:

```text
CIUDADANO
       ↕
      IA
       ↕
CENTRAL GAMC
       ↕
INSTITUCIÓN
       ↕
UNIDAD
```

Todo está centralizado mediante:

```text
tbemergencyrooms
tbemergencyroommembers
tbchatmessages
```

---

# 18. Ejemplo del chat

```text
┌───────────────────────────────┐
│ Emergencia SOS-260822-0001    │
├───────────────────────────────┤
│                               │
│ IA                            │
│ ¿Hay personas heridas?        │
│                               │
│ Tú                            │
│ Sí, hay dos personas.         │
│                               │
│ CENTRAL GAMC                  │
│ La unidad ya está en camino.  │
│                               │
│ SAR - Unidad 03               │
│ Estamos a 3 minutos.          │
│                               │
├───────────────────────────────┤
│ Escribe un mensaje...    ➤    │
└───────────────────────────────┘
```

---

# 19. Historial

## `/citizen/history`

```text
src/app/(citizen)/citizen/history/page.tsx
```

Aquí muestras las emergencias:

```text
ÚLTIMOS REPORTES

┌─────────────────────────┐
│ 🔴 Accidente            │
│ SOS-260822-0001         │
│ Hoy · 08:32             │
│ EN ATENCIÓN             │
└─────────────────────────┘

┌─────────────────────────┐
│ 🟢 Incendio             │
│ SOS-260819-0004         │
│ 19 Ago · 21:15          │
│ RESUELTA                │
└─────────────────────────┘
```

Orden:

```text
reportedAt DESC
```

Es decir:

**último → más antiguo.**

---

# 20. Detalle desde historial

## `/citizen/history/[emergencyCode]`

Realmente puedes reutilizar el mismo componente:

```text
/citizen/emergency/[emergencyCode]
```

No necesitas duplicar toda la lógica.

Lo ideal sería que:

```text
/citizen/history/[emergencyCode]
```

redirija o reutilice:

```text
/citizen/emergency/[emergencyCode]
```

Así evitas duplicación.

---

# 21. ¿Qué debe aparecer dentro de cada reporte?

Yo pondría **todo esto**:

```text
INFORMACIÓN DEL REPORTE
│
├── Código de emergencia
├── Fecha y hora
├── Tipo de emergencia
├── Descripción
├── Prioridad
├── Estado actual
│
├── UBICACIÓN
│   ├── mapa
│   ├── dirección
│   └── coordenadas
│
├── INSTITUCIONES
│   ├── institución asignada
│   ├── subinstitución
│   └── unidad
│
├── SEGUIMIENTO
│   ├── solicitada
│   ├── aceptada
│   ├── en camino
│   ├── en sitio
│   └── finalizada
│
├── MAPA EN TIEMPO REAL
│
├── CHAT
│
├── EVIDENCIAS
│   ├── imágenes
│   ├── videos
│   └── audios
│
├── HISTORIAL DE ESTADOS
│
├── REPORTES DE AVANCE
│
└── DESTINO
    ├── hospital
    ├── refugio
    └── ETA
```

Esto aprovecha prácticamente todas las tablas relacionadas con `tbemergencies`.

---

# 22. Números de emergencia

## `/citizen/emergency-numbers`

```text
src/app/(citizen)/citizen/emergency-numbers/page.tsx
```

Esta sección debe ser un **portal informativo**, no solamente una lista de teléfonos.

Por ejemplo:

```text
NÚMEROS DE EMERGENCIA

🚓 POLICÍA
Bol 110
[LLAMAR]

🚒 BOMBEROS
[Teléfono]
[LLAMAR]

🚑 AMBULANCIA
[Teléfono]
[LLAMAR]

🛡 SEGURIDAD CIUDADANA
[Teléfono]
[LLAMAR]

🚨 SAR
[Teléfono]
[LLAMAR]
```

Los datos vienen de:

```text
tbinstitutiontypes
tbinstitutions
tbsubinstitutions
```

---

# 23. Detalle de institución

## `/citizen/emergency-numbers/[institutionId]`

Por ejemplo:

```text
POLICÍA

Policía Boliviana

Teléfono:
110

Dirección:
...

Servicios:
- Emergencias policiales
- Seguridad
- Auxilio

[ LLAMAR ]
```

También puedes mostrar:

```text
Ubicación
Horarios
Servicios
Número
Dirección
```

---

# 24. Cuenta del ciudadano

## `/citizen/account`

Esta sería la cuarta opción del menú.

```text
CUENTA

👤 Mi perfil

🔔 Notificaciones

📱 Dispositivo

🔐 Privacidad y seguridad

ℹ️ Acerca de SOS-24

🚪 Cerrar sesión
```

---

# 25. Perfil

## `/citizen/account/profile`

Permitir:

```text
Foto
Nombres
Apellidos
CI
Teléfono
Correo
```

Pero recomiendo que el:

```text
CI
```

sea un dato que el usuario no pueda cambiar libremente después del registro, o que requiera verificación.

---

# 26. Notificaciones

## `/citizen/account/notifications`

Relacionada con:

```text
tbnotifications
```

Ejemplo:

```text
🔴 Emergencia actualizada

SAR aceptó tu emergencia.

Hace 2 minutos
```

o:

```text
🚑 Unidad en camino

La unidad SAR-03 se dirige al lugar.
```

---

# 27. Dispositivo

## `/citizen/account/devices`

Relacionada con:

```text
tbdevices
```

Puedes mostrar:

```text
DISPOSITIVO ACTUAL

Android
Chrome PWA

Notificaciones:
ACTIVADAS

Ubicación:
PERMITIDA
```

No hace falta hacer una pantalla demasiado compleja.

---

# 28. Privacidad

## `/citizen/account/privacy`

Aquí puedes poner:

```text
Privacidad

✓ Ubicación
✓ Notificaciones
✓ Cámara
✓ Micrófono

Historial de actividad

Cerrar sesión de todos los dispositivos
```

Y una opción importante:

```text
Eliminar cuenta
```

---

# 29. Acerca de SOS-24

## `/citizen/account/about`

Información:

```text
SOS-24

Sistema Inteligente de Coordinación
y Respuesta a Emergencias

Administrado por:
Gobierno Autónomo Municipal de Cochabamba

Versión:
1.0.0
```

---

# 30. Una mejora importante para tu menú

Yo **NO pondría "SOS" como una quinta opción del menú**.

Tu menú debe mantenerse en cuatro:

```text
┌───────────────────────────────────┐
│                                   │
│             MAPA                  │
│          + BOTÓN SOS              │
│                                   │
├────────┬─────────┬────────┬───────┤
│  MAPA  │HISTORIAL│NÚMEROS │CUENTA │
└────────┴─────────┴────────┴───────┘
```

Porque el SOS debe estar **siempre visible desde el mapa**.

---

# 31. Flujo completo del ciudadano

La arquitectura funcional quedaría:

```text
                    ┌──────────────┐
                    │    LOGIN     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   /citizen   │
                    │     MAPA     │
                    └──────┬───────┘
                           │
                  ┌────────┴─────────┐
                  │                  │
               PRESIONA SOS       NO SOS
                  │                  │
                  ▼                  ▼
          OBTENER UBICACIÓN      CONTINUAR
                  │
                  ▼
             IA / CONSULTA
                  │
                  ▼
          CREAR EMERGENCIA
                  │
                  ▼
          CLASIFICAR PRIORIDAD
                  │
                  ▼
        IDENTIFICAR RECURSOS
                  │
                  ▼
        ASIGNAR INSTITUCIÓN
                  │
                  ▼
          ASIGNAR UNIDAD
                  │
                  ▼
          ABRIR SALA DE CHAT
                  │
                  ▼
         SEGUIMIENTO EN TIEMPO REAL
                  │
          ┌───────┼────────┐
          ▼       ▼        ▼
        CHAT   EVIDENCIA  GPS
          │       │        │
          └───────┼────────┘
                  ▼
              RESUELTA
```

---

# 32. Relación entre las rutas y tu base de datos

| Funcionalidad ciudadano | Tablas principales                                             |
| ----------------------- | -------------------------------------------------------------- |
| Login                   | `tbcitizens`                                                   |
| Registro                | `tbcitizens`                                                   |
| Dispositivo             | `tbdevices`                                                    |
| Mapa                    | `tbemergencylocations`                                         |
| SOS                     | `tbemergencies`                                                |
| Reporte ciudadano       | `tbemergencyreports`                                           |
| IA                      | `tbaisessions`, `tbaianalyses`                                 |
| Tipo emergencia         | `tbemergencytypes`                                             |
| Evidencias              | `tbevidences`                                                  |
| Instituciones           | `tbinstitutions`                                               |
| Servicios               | `tbinstitutionservices`                                        |
| Unidades                | `tbunits`                                                      |
| Asignación              | `tbemergencyassignments`                                       |
| GPS unidad              | `tbassignmenttracking`, `tbunitlocations`                      |
| Chat                    | `tbemergencyrooms`, `tbemergencyroommembers`, `tbchatmessages` |
| Historial estado        | `tbemergencystatushistory`                                     |
| Avances                 | `tbemergencyprogressreports`                                   |
| Notificaciones          | `tbnotifications`                                              |
| Destino                 | `tbemergencydestinations`                                      |
| Historial ciudadano     | `tbemergencies` + relaciones                                   |
| Números emergencia      | `tbinstitutions`, `tbinstitutiontypes`                         |
| Cuenta                  | `tbcitizens`, `tbdevices`                                      |

---

# 33. Estructura que yo usaría finalmente

Para no sobrecomplicar tu frontend, **esta sería mi versión definitiva**:

```text
src/app/(citizen)/citizen/
│
├── login/
│   └── page.tsx
│
├── register/
│   └── page.tsx
│
├── forgot-password/
│   └── page.tsx
│
├── verify/
│   └── page.tsx
│
├── page.tsx                         ← MAPA + SOS
│
├── emergency/
│   ├── new/
│   │   └── page.tsx                ← Crear SOS
│   │
│   └── [emergencyCode]/
│       ├── page.tsx                 ← Detalle completo
│       ├── chat/
│       │   └── page.tsx             ← Chat
│       ├── evidence/
│       │   └── page.tsx             ← Fotos/videos/audio
│       └── tracking/
│           └── page.tsx             ← GPS unidad
│
├── history/
│   └── page.tsx                     ← Historial
│
├── emergency-numbers/
│   ├── page.tsx                     ← Instituciones/números
│   └── [institutionId]/
│       └── page.tsx                 ← Detalle institución
│
└── account/
    ├── page.tsx                     ← Cuenta
    ├── profile/
    │   └── page.tsx
    ├── notifications/
    │   └── page.tsx
    ├── devices/
    │   └── page.tsx
    ├── privacy/
    │   └── page.tsx
    └── about/
        └── page.tsx
```

### Y visualmente:

```text
                    SOS-24
                      │
              ┌───────┴───────┐
              │      MAPA      │
              │                │
              │      📍        │
              │                │
              │     [ SOS ]    │
              │                │
              └────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
     HISTORIAL     NÚMEROS        CUENTA
        │             │             │
        ▼             ▼             ▼
   Emergencias    Instituciones   Perfil
   anteriores     Teléfonos       Notificaciones
                  Servicios       Dispositivo
                                  Privacidad
```

La clave es que **`/citizen` sea extremadamente simple**, mientras que `/citizen/emergency/[emergencyCode]` concentra toda la complejidad operativa: **estado + institución + unidad + GPS + chat + evidencias + IA + historial + destino**. Eso encaja mucho mejor con tu esquema Prisma y con una PWA de uso real durante una emergencia.
