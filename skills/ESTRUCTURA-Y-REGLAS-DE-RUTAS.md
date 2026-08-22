# SKILL — ESTRUCTURA Y REGLAS DE RUTAS SOS-24

## 1. Ubicaciones obligatorias

### Interfaz / Dashboard

Todas las rutas de interfaz deben estar dentro de:

```text
/home/celso/Desktop/dev/app-sos-24/src/app/(dashboard)/
```

### API

Todas las rutas API deben estar dentro de:

```text
/home/celso/Desktop/dev/app-sos-24/src/app/api/
```

---

## 2. Nombre de las carpetas

El nombre de la carpeta debe ser **exactamente el nombre de la tabla sin el prefijo `tb`**.

Ejemplos:

```text
tbcitizens              → citizens
tbinstitutions          → institutions
tbemergencies           → emergencies
tbunits                 → units
tbnotifications         → notifications
tbusers                 → users
```

**PROHIBIDO:**

```text
tbcitizens/
tb-citizens/
citizen/
ui-citizens/
```

---

## 3. Estructura CRUD de Dashboard

Cada tabla debe utilizar esta estructura:

```text
tabla/
├── page.jsx
├── create/
│   └── page.jsx
└── [PK_tabla]/
    ├── page.jsx
    └── edit/
        └── page.jsx
```

Ejemplo para `tbcitizens`:

```text
citizens/
├── page.jsx
├── create/
│   └── page.jsx
└── [PK_citizen]/
    ├── page.jsx
    └── edit/
        └── page.jsx
```

### Significado

```text
/citizens                    → listar registros
/citizens/create             → crear registro
/citizens/[PK_citizen]       → visualizar registro
/citizens/[PK_citizen]/edit  → editar registro
```

**El `edit` SIEMPRE debe estar dentro de `[PK_tabla]`.**

---

## 4. Parámetros dinámicos

El parámetro dinámico debe llamarse **exactamente igual que la PK de la tabla**.

Si:

```prisma
PK_citizen Int
```

usar:

```text
[PK_citizen]
```

Si:

```prisma
PK_institution Int
```

usar:

```text
[PK_institution]
```

Si:

```prisma
PK_emergency Int
```

usar:

```text
[PK_emergency]
```

**Nunca cambiar el nombre de la PK.**

---

# 5. Estructura de API

Cada tabla debe tener:

```text
tabla/
├── route.js
└── [PK_tabla]/
    └── route.js
```

Ejemplo:

```text
api/
└── citizens/
    ├── route.js
    └── [PK_citizen]/
        └── route.js
```

---

## 6. Métodos HTTP

### `/api/citizens`

```text
GET    → listar / buscar
POST   → crear
```

### `/api/citizens/[PK_citizen]`

```text
GET    → obtener un registro
PUT    → actualizar un registro
DELETE → eliminar un registro
```

No crear rutas separadas como:

```text
/api/citizens/create
/api/citizens/update
/api/citizens/delete
```

**PROHIBIDO.**

---

# 7. Regla de correspondencia

La interfaz y la API deben utilizar **el mismo nombre base**.

```text
Dashboard:
(carpeta)/citizens/

API:
api/citizens/
```

Ejemplo:

```text
(dashboard)/emergencies/
api/emergencies/
```

---

# 8. Regla para todas las tablas

Para cualquier tabla:

```text
tbNOMBRE
PK_NOMBRE
```

se genera:

```text
(dashboard)/
└── NOMBRE/
    ├── page.jsx
    ├── create/
    │   └── page.jsx
    └── [PK_NOMBRE]/
        ├── page.jsx
        └── edit/
            └── page.jsx
```

y:

```text
api/
└── NOMBRE/
    ├── route.js
    └── [PK_NOMBRE]/
        └── route.js
```

---

## 9. Regla de oro

**NO inventar nombres. NO cambiar PKs. NO agregar `tb`. NO agregar `ui`. NO sacar `edit` fuera del ID.**

La estructura debe ser siempre:

```text
TABLA SIN tb
    ↓
CRUD
    ↓
[PK EXACTA]
    ↓
edit dentro del [PK]
```

Esta estructura se aplica **sin excepciones a todas las tablas de SOS-24**.
