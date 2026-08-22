### DICCIONARIO DE DATOS

# 1. `tbprivileges`

**Descripción de la tabla:**
Almacena los privilegios o perfiles de acceso disponibles dentro del sistema. Permite diferenciar los permisos de usuarios pertenecientes al GAMC de los usuarios pertenecientes a instituciones de respuesta.

| Campo           | Tipo     | PK/FK | Descripción                                                           | Ejemplo                             |
| --------------- | -------- | ----- | --------------------------------------------------------------------- | ----------------------------------- |
| `PK_privilege`  | Int      | PK    | Identificador único del privilegio. Se genera automáticamente.        | `1`                                 |
| `privilege`     | String   | —     | Nombre descriptivo del privilegio o perfil de acceso.                 | `Administrador Central`             |
| `privilegeCode` | String   | —     | Código único utilizado por el sistema para identificar el privilegio. | `ADMIN_GAMC`                        |
| `privilegeType` | String   | —     | Define el ámbito al que pertenece el privilegio: GAMC o institución.  | `GAMC`                              |
| `description`   | String?  | —     | Explicación de las funciones y permisos asociados al privilegio.      | `Administra todo el sistema SOS-24` |
| `createdAt`     | DateTime | —     | Fecha y hora en que se creó el privilegio.                            | `2026-08-22 08:30:00`               |

**Relación:**

- `tbprivileges` → `tbusers`: un privilegio puede estar asignado a varios usuarios.

---

# 2. `tbcitizens`

**Descripción de la tabla:**
Registra a los ciudadanos que utilizan SOS-24 para reportar emergencias, participar en canales de crisis, enviar evidencias y recibir notificaciones.

| Campo           | Tipo     | PK/FK | Descripción                                                                      | Ejemplo                    |
| --------------- | -------- | ----- | -------------------------------------------------------------------------------- | -------------------------- |
| `PK_citizen`    | Int      | PK    | Identificador único del ciudadano.                                               | `15`                       |
| `firstName`     | String   | —     | Nombre o nombres del ciudadano.                                                  | `Juan`                     |
| `lastName`      | String   | —     | Apellido o apellidos del ciudadano.                                              | `Pérez Gómez`              |
| `CI`            | String?  | —     | Número de cédula de identidad del ciudadano. Es opcional y único.                | `7894561`                  |
| `phoneNumber`   | String   | —     | Número telefónico utilizado para identificar o contactar al ciudadano.           | `70712345`                 |
| `email`         | String?  | —     | Correo electrónico del ciudadano, si fue registrado.                             | `juan@gmail.com`           |
| `password`      | String?  | —     | Contraseña almacenada de forma segura para autenticación del ciudadano.          | `hash_password`            |
| `profileImage`  | String?  | —     | URL o ruta de la fotografía de perfil.                                           | `/uploads/profiles/15.jpg` |
| `status`        | Boolean  | —     | Indica si la cuenta del ciudadano está activa.                                   | `true`                     |
| `createdAt`     | DateTime | —     | Fecha y hora de creación de la cuenta.                                           | `2026-08-22 09:00:00`      |
| `updatedAt`     | DateTime | —     | Fecha y hora de la última modificación del registro.                             | `2026-08-22 10:15:00`      |
| `actionHistory` | Json?    | —     | Almacena información histórica adicional relacionada con acciones del ciudadano. | `{"action":"LOGIN"}`       |

**Relaciones principales:**

- Puede registrar varias emergencias.
- Puede realizar varios reportes sobre emergencias.
- Puede enviar mensajes.
- Puede participar en salas de crisis.
- Puede enviar evidencias.
- Puede recibir notificaciones.
- Puede tener sesiones con la IA.

---

# 3. `tbinstitutiontypes`

**Descripción de la tabla:**
Catálogo de tipos de instituciones que pueden participar en la atención de emergencias.

| Campo                | Tipo     | PK/FK | Descripción                                                     | Ejemplo                                           |
| -------------------- | -------- | ----- | --------------------------------------------------------------- | ------------------------------------------------- |
| `PK_institutionType` | Int      | PK    | Identificador único del tipo de institución.                    | `1`                                               |
| `name`               | String   | —     | Nombre del tipo de institución.                                 | `Policía`                                         |
| `code`               | String   | —     | Código único para identificar el tipo.                          | `POLICE`                                          |
| `description`        | String?  | —     | Descripción de las funciones generales del tipo de institución. | `Instituciones encargadas de seguridad ciudadana` |
| `status`             | Boolean  | —     | Indica si el tipo de institución está habilitado.               | `true`                                            |
| `createdAt`          | DateTime | —     | Fecha y hora de creación.                                       | `2026-08-22 08:00:00`                             |
| `actionHistory`      | Json?    | —     | Historial adicional de acciones realizadas sobre el registro.   | `{"action":"CREATE"}`                             |

**Relación:**

- Un tipo de institución puede tener muchas instituciones.

Ejemplo:

```text
POLICE
   ├── Policía Boliviana
   └── GEOS

FIRE
   └── Bomberos

SAR
   └── SAR Bolivia
```

---

# 4. `tbinstitutions`

**Descripción de la tabla:**
Registra las instituciones que participan en la atención de emergencias dentro de SOS-24.

| Campo                | Tipo     | PK/FK | Descripción                                                            | Ejemplo               |
| -------------------- | -------- | ----- | ---------------------------------------------------------------------- | --------------------- |
| `PK_institution`     | Int      | PK    | Identificador único de la institución.                                 | `3`                   |
| `FK_institutionType` | Int      | FK    | Referencia al tipo de institución al que pertenece.                    | `1`                   |
| `name`               | String   | —     | Nombre oficial de la institución.                                      | `Policía Boliviana`   |
| `acronym`            | String?  | —     | Sigla o abreviación de la institución.                                 | `PB`                  |
| `phoneNumber`        | String?  | —     | Número telefónico institucional.                                       | `110`                 |
| `email`              | String?  | —     | Correo electrónico institucional.                                      | `contacto@policia.bo` |
| `address`            | String?  | —     | Dirección física de la institución.                                    | `Av. Principal #123`  |
| `latitude`           | Float?   | —     | Latitud geográfica de la institución.                                  | `-17.3935`            |
| `longitude`          | Float?   | —     | Longitud geográfica de la institución.                                 | `-66.1570`            |
| `status`             | Boolean  | —     | Indica si la institución está habilitada en el sistema.                | `true`                |
| `createdAt`          | DateTime | —     | Fecha y hora de creación del registro.                                 | `2026-08-22 08:00:00` |
| `updatedAt`          | DateTime | —     | Fecha y hora de última modificación.                                   | `2026-08-22 09:30:00` |
| `actionHistory`      | Json?    | —     | Historial de acciones administrativas realizadas sobre la institución. | `{"action":"UPDATE"}` |

**FK:**

```text
FK_institutionType → tbinstitutiontypes.PK_institutionType
```

**Relaciones:**

Una institución puede tener:

- Subinstituciones.
- Usuarios.
- Unidades.
- Servicios.
- Asignaciones.
- Destinos.
- Reportes de progreso.
- Mensajes.
- Miembros de salas.

---

# 5. `tbsubinstitutions`

**Descripción de la tabla:**
Registra dependencias, módulos, bases, estaciones o unidades administrativas pertenecientes a una institución principal.

| Campo               | Tipo     | PK/FK | Descripción                               | Ejemplo                    |
| ------------------- | -------- | ----- | ----------------------------------------- | -------------------------- |
| `PK_subinstitution` | Int      | PK    | Identificador único de la subinstitución. | `12`                       |
| `FK_institution`    | Int      | FK    | Institución principal a la que pertenece. | `3`                        |
| `name`              | String   | —     | Nombre de la dependencia.                 | `EPI Norte`                |
| `code`              | String?  | —     | Código interno de la dependencia.         | `EPI-NORTE`                |
| `phoneNumber`       | String?  | —     | Número telefónico de la dependencia.      | `42512345`                 |
| `email`             | String?  | —     | Correo electrónico de la dependencia.     | `epi.norte@institucion.bo` |
| `address`           | String?  | —     | Dirección física.                         | `Zona Norte, Cochabamba`   |
| `latitude`          | Float?   | —     | Latitud de ubicación.                     | `-17.3701`                 |
| `longitude`         | Float?   | —     | Longitud de ubicación.                    | `-66.1502`                 |
| `status`            | Boolean  | —     | Indica si la dependencia está activa.     | `true`                     |
| `createdAt`         | DateTime | —     | Fecha y hora de creación.                 | `2026-08-22 08:00:00`      |
| `updatedAt`         | DateTime | —     | Fecha y hora de modificación.             | `2026-08-22 09:00:00`      |
| `actionHistory`     | Json?    | —     | Historial adicional de acciones.          | `{"action":"CREATE"}`      |

**FK:**

```text
FK_institution → tbinstitutions.PK_institution
```

---

# 6. `tbusers`

**Descripción de la tabla:**
Almacena los usuarios internos que operan SOS-24 desde el GAMC o desde las instituciones participantes.

| Campo               | Tipo     | PK/FK | Descripción                                                | Ejemplo                 |
| ------------------- | -------- | ----- | ---------------------------------------------------------- | ----------------------- |
| `PK_user`           | Int      | PK    | Identificador único del usuario.                           | `25`                    |
| `FK_privilege`      | Int      | FK    | Privilegio o perfil de acceso asignado al usuario.         | `1`                     |
| `FK_institution`    | Int?     | FK    | Institución a la que pertenece el usuario, si corresponde. | `3`                     |
| `FK_subinstitution` | Int?     | FK    | Dependencia específica a la que pertenece.                 | `12`                    |
| `firstName`         | String   | —     | Nombre del usuario.                                        | `Carlos`                |
| `lastName`          | String   | —     | Apellido del usuario.                                      | `Fernández`             |
| `phoneNumber`       | String?  | —     | Teléfono de contacto.                                      | `76543210`              |
| `email`             | String   | —     | Correo utilizado para iniciar sesión.                      | `carlos@institucion.bo` |
| `password`          | String   | —     | Contraseña almacenada de forma segura.                     | `hash_password`         |
| `status`            | Boolean  | —     | Indica si el usuario puede acceder al sistema.             | `true`                  |
| `createdAt`         | DateTime | —     | Fecha de creación.                                         | `2026-08-22 08:00:00`   |
| `updatedAt`         | DateTime | —     | Fecha de última modificación.                              | `2026-08-22 10:00:00`   |
| `actionHistory`     | Json?    | —     | Historial adicional de acciones del usuario.               | `{"action":"LOGIN"}`    |

**FK:**

```text
FK_privilege → tbprivileges.PK_privilege
FK_institution → tbinstitutions.PK_institution
FK_subinstitution → tbsubinstitutions.PK_subinstitution
```

---

# 7. `tbdevices`

**Descripción de la tabla:**
Registra el dispositivo móvil utilizado por un ciudadano para permitir el envío de notificaciones push.

| Campo        | Tipo     | PK/FK | Descripción                                             | Ejemplo                                  |
| ------------ | -------- | ----- | ------------------------------------------------------- | ---------------------------------------- |
| `PK_device`  | Int      | PK    | Identificador único del dispositivo registrado.         | `8`                                      |
| `FK_citizen` | Int      | FK    | Ciudadano propietario del dispositivo.                  | `15`                                     |
| `pushToken`  | String?  | —     | Token utilizado por el servicio de notificaciones push. | `ExponentPushToken[...]`                 |
| `device`     | Json     | —     | Información técnica del dispositivo.                    | `{"model":"Samsung A54","os":"Android"}` |
| `createdAt`  | DateTime | —     | Fecha de registro del dispositivo.                      | `2026-08-22 09:00:00`                    |
| `updatedAt`  | DateTime | —     | Fecha de actualización del registro.                    | `2026-08-22 12:00:00`                    |

**FK:**

```text
FK_citizen → tbcitizens.PK_citizen
```

**Restricción:** un ciudadano solamente puede tener un registro en esta tabla debido a `@unique`.

---

# 8. `tbusersdevices`

**Descripción de la tabla:**
Registra el dispositivo utilizado por un usuario interno del sistema para recibir notificaciones.

| Campo       | Tipo     | PK/FK | Descripción                            | Ejemplo                            |
| ----------- | -------- | ----- | -------------------------------------- | ---------------------------------- |
| `PK_device` | Int      | PK    | Identificador único del dispositivo.   | `4`                                |
| `FK_user`   | Int      | FK    | Usuario propietario del dispositivo.   | `25`                               |
| `pushToken` | String?  | —     | Token para enviar notificaciones push. | `push_token_123`                   |
| `device`    | Json     | —     | Información técnica del dispositivo.   | `{"model":"iPhone 15","os":"iOS"}` |
| `createdAt` | DateTime | —     | Fecha de registro.                     | `2026-08-22 08:30:00`              |
| `updatedAt` | DateTime | —     | Fecha de actualización.                | `2026-08-22 10:00:00`              |

**FK:**

```text
FK_user → tbusers.PK_user
```

---

# 9. `tbresourcetypes`

**Descripción de la tabla:**
Catálogo de los tipos de recursos que pueden ser requeridos o enviados para atender una emergencia.

| Campo             | Tipo     | PK/FK | Descripción                                          | Ejemplo                                  |
| ----------------- | -------- | ----- | ---------------------------------------------------- | ---------------------------------------- |
| `PK_resourceType` | Int      | PK    | Identificador único del tipo de recurso.             | `1`                                      |
| `name`            | String   | —     | Nombre del recurso.                                  | `Ambulancia`                             |
| `code`            | String   | —     | Código único del recurso.                            | `AMBULANCE`                              |
| `description`     | String?  | —     | Descripción del recurso y su finalidad.              | `Unidad médica para traslado y atención` |
| `status`          | Boolean  | —     | Indica si el recurso puede utilizarse en el sistema. | `true`                                   |
| `createdAt`       | DateTime | —     | Fecha de creación.                                   | `2026-08-22 08:00:00`                    |
| `actionHistory`   | Json?    | —     | Historial de modificaciones o acciones.              | `{"action":"CREATE"}`                    |

**Ejemplos de recursos:**

```text
AMBULANCE
POLICE_UNIT
FIRE_TRUCK
SAR_UNIT
RESCUE_UNIT
```

---

# 10. `tbinstitutionservices`

**Descripción de la tabla:**
Relaciona las instituciones con los tipos de recursos que tienen capacidad de proporcionar.

| Campo                   | Tipo     | PK/FK | Descripción                                               | Ejemplo               |
| ----------------------- | -------- | ----- | --------------------------------------------------------- | --------------------- |
| `PK_institutionService` | Int      | PK    | Identificador de la relación entre institución y recurso. | `10`                  |
| `FK_institution`        | Int      | FK    | Institución que proporciona el recurso.                   | `3`                   |
| `FK_resourceType`       | Int      | FK    | Tipo de recurso que la institución puede proporcionar.    | `1`                   |
| `status`                | Boolean  | —     | Indica si actualmente la institución ofrece ese recurso.  | `true`                |
| `createdAt`             | DateTime | —     | Fecha de creación de la relación.                         | `2026-08-22 08:00:00` |
| `actionHistory`         | Json?    | —     | Historial de cambios realizados sobre la capacidad.       | `{"action":"ENABLE"}` |

**FK:**

```text
FK_institution → tbinstitutions.PK_institution
FK_resourceType → tbresourcetypes.PK_resourceType
```

**Restricción importante:**

```text
@@unique([FK_institution, FK_resourceType])
```

Esto evita registrar dos veces el mismo recurso para una institución.

---

# 11. `tbunits`

**Descripción de la tabla:**
Registra las unidades operativas que pueden ser despachadas físicamente hacia una emergencia.

Ejemplos: ambulancias, patrullas, carros bomberos, unidades SAR, vehículos de rescate, etc.

| Campo               | Tipo     | PK/FK | Descripción                                             | Ejemplo                      |
| ------------------- | -------- | ----- | ------------------------------------------------------- | ---------------------------- |
| `PK_unit`           | Int      | PK    | Identificador único de la unidad.                       | `35`                         |
| `FK_institution`    | Int      | FK    | Institución propietaria de la unidad.                   | `3`                          |
| `FK_subinstitution` | Int?     | FK    | Dependencia donde está registrada la unidad.            | `12`                         |
| `FK_resourceType`   | Int      | FK    | Tipo de recurso que representa la unidad.               | `1`                          |
| `unitCode`          | String   | —     | Código único operativo de la unidad.                    | `AMB-12`                     |
| `unitName`          | String   | —     | Nombre descriptivo de la unidad.                        | `Ambulancia 12`              |
| `phoneNumber`       | String?  | —     | Número telefónico o de comunicación de la unidad.       | `76543210`                   |
| `status`            | String   | —     | Estado operativo actual de la unidad.                   | `DISPONIBLE`                 |
| `isAvailable`       | Boolean  | —     | Indica si la unidad puede ser asignada inmediatamente.  | `true`                       |
| `isActive`          | Boolean  | —     | Indica si la unidad está habilitada dentro del sistema. | `true`                       |
| `createdAt`         | DateTime | —     | Fecha de registro.                                      | `2026-08-22 08:00:00`        |
| `updatedAt`         | DateTime | —     | Fecha de última actualización.                          | `2026-08-22 10:20:00`        |
| `actionHistory`     | Json?    | —     | Historial adicional de operaciones sobre la unidad.     | `{"action":"STATUS_CHANGE"}` |

### Estados posibles

```text
DISPONIBLE
EN_CAMINO
EN_SITIO
OCUPADA
FUERA_DE_SERVICIO
```

**FK:**

```text
FK_institution → tbinstitutions.PK_institution
FK_subinstitution → tbsubinstitutions.PK_subinstitution
FK_resourceType → tbresourcetypes.PK_resourceType
```

---

# 12. `tbemergencytypes`

**Descripción de la tabla:**
Catálogo utilizado para clasificar el tipo de emergencia identificada por el sistema o por la IA.

| Campo              | Tipo     | PK/FK | Descripción                                 | Ejemplo                                         |
| ------------------ | -------- | ----- | ------------------------------------------- | ----------------------------------------------- |
| `PK_emergencyType` | Int      | PK    | Identificador único del tipo de emergencia. | `4`                                             |
| `name`             | String   | —     | Nombre del tipo de emergencia.              | `Incendio`                                      |
| `code`             | String   | —     | Código único del tipo de emergencia.        | `FIRE`                                          |
| `description`      | String?  | —     | Explicación del tipo de emergencia.         | `Emergencia relacionada con fuego o combustión` |
| `status`           | Boolean  | —     | Indica si el tipo está habilitado.          | `true`                                          |
| `createdAt`        | DateTime | —     | Fecha de creación.                          | `2026-08-22 08:00:00`                           |
| `actionHistory`    | Json?    | —     | Historial administrativo del registro.      | `{"action":"CREATE"}`                           |

**Ejemplos:**

```text
FIRE
ACCIDENT
MEDICAL
ROBBERY
FLOOD
MISSING_PERSON
ANIMAL
RESCUE
```

---

# 13. `tbemergencies`

**Descripción de la tabla:**
Es la **entidad central del sistema SOS-24**. Representa un caso de emergencia unificado, independientemente de cuántos ciudadanos lo reporten.

Por ejemplo, cinco ciudadanos pueden reportar el mismo incendio. El sistema puede mantener **una emergencia principal** y relacionar los cinco reportes con ella.

| Campo                | Tipo      | PK/FK | Descripción                                                                                     | Ejemplo                               |
| -------------------- | --------- | ----- | ----------------------------------------------------------------------------------------------- | ------------------------------------- |
| `PK_emergency`       | Int       | PK    | Identificador interno único de la emergencia.                                                   | `1001`                                |
| `FK_citizen`         | Int?      | FK    | Ciudadano que realizó el primer reporte o reportante principal.                                 | `15`                                  |
| `FK_emergencyType`   | Int?      | FK    | Tipo de emergencia identificado.                                                                | `4`                                   |
| `FK_parentEmergency` | Int?      | FK    | Emergencia principal a la que pertenece este caso cuando se trata de un duplicado o agrupación. | `1001`                                |
| `emergencyCode`      | String    | —     | Código público único de la emergencia.                                                          | `EM-20260822-0001`                    |
| `priority`           | String    | —     | Nivel de prioridad determinado por reglas o IA.                                                 | `CRITICA`                             |
| `status`             | String    | —     | Estado actual del caso.                                                                         | `EN_ATENCION`                         |
| `isMainEmergency`    | Boolean   | —     | Indica si la emergencia representa el caso principal.                                           | `true`                                |
| `reportCount`        | Int       | —     | Cantidad de reportes ciudadanos asociados al mismo caso.                                        | `5`                                   |
| `description`        | String?   | —     | Descripción general del incidente.                                                              | `Incendio de vivienda de dos plantas` |
| `affectedPersons`    | Int?      | —     | Cantidad estimada de personas afectadas.                                                        | `6`                                   |
| `affectedAnimals`    | Int?      | —     | Cantidad estimada de animales afectados.                                                        | `2`                                   |
| `trappedPersons`     | Int?      | —     | Cantidad estimada de personas atrapadas.                                                        | `2`                                   |
| `missingPersons`     | Int?      | —     | Cantidad de personas reportadas como desaparecidas.                                             | `0`                                   |
| `reportedAt`         | DateTime  | —     | Fecha y hora en que fue reportada la emergencia.                                                | `2026-08-22 14:32:10`                 |
| `acceptedAt`         | DateTime? | —     | Momento en que la emergencia fue aceptada para atención.                                        | `2026-08-22 14:33:00`                 |
| `resolvedAt`         | DateTime? | —     | Momento en que la emergencia fue marcada como resuelta.                                         | `2026-08-22 15:20:00`                 |
| `createdAt`          | DateTime  | —     | Fecha y hora de creación del registro.                                                          | `2026-08-22 14:32:10`                 |
| `updatedAt`          | DateTime  | —     | Fecha y hora de la última modificación.                                                         | `2026-08-22 15:20:00`                 |
| `actionHistory`      | Json?     | —     | Información histórica adicional de acciones realizadas sobre la emergencia.                     | `{"action":"ASSIGN_UNIT"}`            |

### Estados posibles

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

### Prioridades

```text
BAJA
MEDIA
ALTA
CRITICA
```

**FK:**

```text
FK_citizen → tbcitizens.PK_citizen

FK_emergencyType → tbemergencytypes.PK_emergencyType

FK_parentEmergency → tbemergencies.PK_emergency
```

### Concepto fundamental

La tabla **no representa necesariamente cada llamada o reporte ciudadano**.

Representa el **caso de emergencia unificado**.

```text
Ciudadano A ─┐
Ciudadano B ─┤
Ciudadano C ─┼──> EM-20260822-0001
Ciudadano D ─┤
Ciudadano E ─┘
                  ↓
            Una emergencia
                  ↓
       Policía + Bomberos + SAR
```

---

# 14. `tbaisessions`

**Descripción de la tabla:**
Registra las sesiones de interacción entre un ciudadano y la inteligencia artificial antes de crear, identificar o vincular una emergencia.

| Campo           | Tipo      | PK/FK | Descripción                                                                         | Ejemplo                         |
| --------------- | --------- | ----- | ----------------------------------------------------------------------------------- | ------------------------------- |
| `PK_aiSession`  | Int       | PK    | Identificador único de la sesión con la IA.                                         | `501`                           |
| `FK_citizen`    | Int       | FK    | Ciudadano que interactúa con la IA.                                                 | `15`                            |
| `FK_emergency`  | Int?      | FK    | Emergencia a la que se vincula la sesión cuando la IA identifica un caso existente. | `1001`                          |
| `sessionStatus` | String    | —     | Estado actual de la interacción con la IA.                                          | `REDIRIGIDO_A_CANAL`            |
| `initialIntent` | String?   | —     | Descripción inicial de lo expresado por el ciudadano.                               | `Hay humo y personas atrapadas` |
| `latitude`      | Float?    | —     | Latitud proporcionada durante la interacción.                                       | `-17.3935`                      |
| `longitude`     | Float?    | —     | Longitud proporcionada durante la interacción.                                      | `-66.1570`                      |
| `startedAt`     | DateTime  | —     | Momento en que inició la sesión.                                                    | `2026-08-22 14:30:00`           |
| `endedAt`       | DateTime? | —     | Momento en que terminó la sesión.                                                   | `2026-08-22 14:33:00`           |

### Estados

```text
INICIADA
VINCULANDO_CASO
REDIRIGIDO_A_CANAL
FINALIZADA
```

**FK:**

```text
FK_citizen → tbcitizens.PK_citizen
FK_emergency → tbemergencies.PK_emergency
```

---

# 15. `tbemergencyreports`

**Descripción de la tabla:**
Registra **cada reporte individual** realizado por un ciudadano sobre una emergencia. Esta tabla es fundamental para la deduplicación y para conservar el historial de quién reportó el incidente.

Una emergencia puede tener múltiples registros aquí.

| Campo                    | Tipo     | PK/FK | Descripción                                                                         | Ejemplo                               |
| ------------------------ | -------- | ----- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| `PK_report`              | Int      | PK    | Identificador único del reporte individual.                                         | `3001`                                |
| `FK_emergency`           | Int      | FK    | Emergencia unificada a la que pertenece el reporte.                                 | `1001`                                |
| `FK_citizen`             | Int?     | FK    | Ciudadano que realizó el reporte.                                                   | `20`                                  |
| `reportChannel`          | String   | —     | Canal mediante el cual se recibió el reporte.                                       | `APP_CHAT`                            |
| `description`            | String?  | —     | Información proporcionada por el ciudadano.                                         | `El incendio está en el segundo piso` |
| `latitude`               | Float    | —     | Latitud donde el ciudadano reportó el incidente.                                    | `-17.3938`                            |
| `longitude`              | Float    | —     | Longitud donde el ciudadano reportó el incidente.                                   | `-66.1574`                            |
| `isLinkedByAI`           | Boolean  | —     | Indica si la IA determinó que el reporte corresponde a una emergencia existente.    | `true`                                |
| `linkingConfidence`      | Float?   | —     | Nivel de confianza de la IA al vincular el reporte.                                 | `0.95`                                |
| `distanceMetersFromMain` | Float?   | —     | Distancia entre la ubicación del reporte y la ubicación principal de la emergencia. | `38.5`                                |
| `reportedAt`             | DateTime | —     | Fecha y hora en que se realizó el reporte.                                          | `2026-08-22 14:31:20`                 |

**FK:**

```text
FK_emergency → tbemergencies.PK_emergency

FK_citizen → tbcitizens.PK_citizen
```

### Ejemplo de deduplicación

```text
REPORTE 1
Juan → incendio → coordenadas A
              ↓
       EM-0001

REPORTE 2
Pedro → incendio → coordenadas cercanas
              ↓
       IA analiza
              ↓
       95% confianza
              ↓
       EM-0001

REPORTE 3
María → incendio → coordenadas cercanas
              ↓
       EM-0001
```

Resultado:

```text
1 emergencia
3 reportes ciudadanos
```

Esto evita crear tres emergencias diferentes para el mismo incidente.

---

---

## 11. `tbemergencyreports`

**Descripción de la tabla:** Almacena cada reporte individual realizado por un ciudadano, operador u otro canal respecto a una emergencia. Permite conservar el historial de reportes y determinar cuándo varios ciudadanos están informando sobre el mismo incidente.

| Tabla              | Campo                    | Tipo     | PK/FK | Descripción                                                                                                                | Ejemplo                                  |
| ------------------ | ------------------------ | -------- | ----- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| tbemergencyreports | `PK_report`              | Int      | PK    | Identificador único del reporte individual.                                                                                | `125`                                    |
| tbemergencyreports | `FK_emergency`           | Int      | FK    | Identificador de la emergencia a la que pertenece el reporte. Permite relacionar varios reportes con una misma emergencia. | `48`                                     |
| tbemergencyreports | `FK_citizen`             | Int      | FK    | Identificador del ciudadano que realizó el reporte. Puede ser nulo cuando el reporte proviene de un operador.              | `15`                                     |
| tbemergencyreports | `reportChannel`          | String   | —     | Canal mediante el cual se recibió el reporte.                                                                              | `APP_CHAT`                               |
| tbemergencyreports | `description`            | String   | —     | Descripción proporcionada por el reportante sobre la situación observada.                                                  | `"Se observa humo y personas atrapadas"` |
| tbemergencyreports | `latitude`               | Float    | —     | Latitud geográfica del lugar desde donde se registra el reporte.                                                           | `-17.3935`                               |
| tbemergencyreports | `longitude`              | Float    | —     | Longitud geográfica del lugar donde se registra el reporte.                                                                | `-66.1570`                               |
| tbemergencyreports | `isLinkedByAI`           | Boolean  | —     | Indica si la IA determinó que el reporte corresponde a una emergencia existente.                                           | `true`                                   |
| tbemergencyreports | `linkingConfidence`      | Float    | —     | Nivel de confianza de la IA al vincular el reporte con una emergencia existente.                                           | `0.95`                                   |
| tbemergencyreports | `distanceMetersFromMain` | Float    | —     | Distancia aproximada entre la ubicación del nuevo reporte y la ubicación principal de la emergencia.                       | `85.40`                                  |
| tbemergencyreports | `reportedAt`             | DateTime | —     | Fecha y hora exacta en que se recibió el reporte.                                                                          | `2026-08-22T09:15:30`                    |

### Valores de `reportChannel`

- `APP_CALL` → reporte mediante llamada desde la aplicación.
- `APP_CHAT` → reporte mediante conversación/chat.
- `MANUAL_OPERATOR` → reporte registrado manualmente por un operador.

---

# 12. `tbemergencylocations`

**Descripción de la tabla:** Guarda las ubicaciones asociadas a una emergencia. Permite conservar diferentes posiciones registradas durante la atención del incidente.

| Tabla                | Campo          | Tipo     | PK/FK | Descripción                                                                 | Ejemplo                            |
| -------------------- | -------------- | -------- | ----- | --------------------------------------------------------------------------- | ---------------------------------- |
| tbemergencylocations | `PK_location`  | Int      | PK    | Identificador único de la ubicación registrada.                             | `321`                              |
| tbemergencylocations | `FK_emergency` | Int      | FK    | Identificador de la emergencia a la que corresponde la ubicación.           | `48`                               |
| tbemergencylocations | `latitude`     | Float    | —     | Latitud geográfica de la ubicación registrada.                              | `-17.3935`                         |
| tbemergencylocations | `longitude`    | Float    | —     | Longitud geográfica de la ubicación registrada.                             | `-66.1570`                         |
| tbemergencylocations | `accuracy`     | Float    | —     | Precisión aproximada de la ubicación obtenida por GPS, expresada en metros. | `8.5`                              |
| tbemergencylocations | `address`      | String   | —     | Dirección o referencia textual asociada a las coordenadas.                  | `"Av. Blanco Galindo, Cochabamba"` |
| tbemergencylocations | `createdAt`    | DateTime | —     | Fecha y hora en que se registró la ubicación.                               | `2026-08-22T09:16:00`              |

---

# 13. `tbcalls`

**Descripción de la tabla:** Registra las llamadas relacionadas con una emergencia, incluyendo llamadas entrantes, realizadas por operadores y llamadas salientes a instituciones o involucrados.

| Tabla   | Campo             | Tipo     | PK/FK | Descripción                                                                        | Ejemplo                                          |
| ------- | ----------------- | -------- | ----- | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| tbcalls | `PK_call`         | Int      | PK    | Identificador único de la llamada.                                                 | `87`                                             |
| tbcalls | `FK_emergency`    | Int      | FK    | Emergencia asociada con la llamada.                                                | `48`                                             |
| tbcalls | `callType`        | String   | —     | Tipo de llamada realizada o recibida.                                              | `ENTRANTE_IA`                                    |
| tbcalls | `status`          | String   | —     | Estado actual de la llamada.                                                       | `FINALIZADA`                                     |
| tbcalls | `startedAt`       | DateTime | —     | Fecha y hora en que comenzó la llamada.                                            | `2026-08-22T09:17:00`                            |
| tbcalls | `answeredAt`      | DateTime | —     | Fecha y hora en que la llamada fue contestada.                                     | `2026-08-22T09:17:05`                            |
| tbcalls | `endedAt`         | DateTime | —     | Fecha y hora en que finalizó la llamada.                                           | `2026-08-22T09:20:30`                            |
| tbcalls | `durationSeconds` | Int      | —     | Duración total de la llamada expresada en segundos.                                | `205`                                            |
| tbcalls | `transcription`   | String   | —     | Transcripción textual de la conversación, cuando se encuentre disponible.          | `"Hay un accidente con varias personas heridas"` |
| tbcalls | `audioUrl`        | String   | —     | Dirección donde se encuentra almacenada la grabación de audio.                     | `"https://storage.sos24/audio/call-87.mp3"`      |
| tbcalls | `createdAt`       | DateTime | —     | Fecha y hora de creación del registro de llamada.                                  | `2026-08-22T09:17:00`                            |
| tbcalls | `actionHistory`   | Json     | —     | Información adicional o historial técnico de acciones relacionadas con la llamada. | `{"operator":"IA","attempts":1}`                 |

### Valores de `callType`

- `ENTRANTE_IA`
- `OPERADOR`
- `SALIENTE`

### Valores de `status`

- `EN_PROCESO`
- `FINALIZADA`
- `CORTADA`

---

# 14. `tbemergencyrooms`

**Descripción de la tabla:** Representa el canal o sala de crisis de una emergencia. Cada emergencia puede disponer de una única sala donde participan ciudadanos, operadores, IA e instituciones.

| Tabla            | Campo          | Tipo     | PK/FK      | Descripción                                                                      | Ejemplo               |
| ---------------- | -------------- | -------- | ---------- | -------------------------------------------------------------------------------- | --------------------- |
| tbemergencyrooms | `PK_room`      | Int      | PK         | Identificador único de la sala de emergencia.                                    | `32`                  |
| tbemergencyrooms | `FK_emergency` | Int      | FK, UNIQUE | Emergencia asociada a la sala. Una emergencia solamente puede tener una sala.    | `48`                  |
| tbemergencyrooms | `roomCode`     | String   | UNIQUE     | Código único utilizado para identificar la sala de crisis.                       | `ROOM-20260822-0048`  |
| tbemergencyrooms | `isOpen`       | Boolean  | —          | Indica si el canal de comunicación continúa abierto.                             | `true`                |
| tbemergencyrooms | `createdAt`    | DateTime | —          | Fecha y hora de creación de la sala.                                             | `2026-08-22T09:20:00` |
| tbemergencyrooms | `closedAt`     | DateTime | —          | Fecha y hora de cierre de la sala. Permanece nulo mientras la sala esté abierta. | `2026-08-22T11:45:00` |

---

# 15. `tbemergencyroommembers`

**Descripción de la tabla:** Registra las personas, instituciones y unidades que participan dentro del canal de crisis de una emergencia.

| Tabla                  | Campo            | Tipo     | PK/FK | Descripción                                                        | Ejemplo               |
| ---------------------- | ---------------- | -------- | ----- | ------------------------------------------------------------------ | --------------------- |
| tbemergencyroommembers | `PK_roomMember`  | Int      | PK    | Identificador único del miembro dentro de la sala.                 | `150`                 |
| tbemergencyroommembers | `FK_room`        | Int      | FK    | Identificador de la sala de emergencia.                            | `32`                  |
| tbemergencyroommembers | `FK_citizen`     | Int      | FK    | Ciudadano que participa en la sala, cuando corresponde.            | `15`                  |
| tbemergencyroommembers | `FK_user`        | Int      | FK    | Usuario institucional o del GAMC que participa en la sala.         | `7`                   |
| tbemergencyroommembers | `FK_institution` | Int      | FK    | Institución que participa directamente en la sala.                 | `3`                   |
| tbemergencyroommembers | `FK_unit`        | Int      | FK    | Unidad operativa que participa en la emergencia.                   | `25`                  |
| tbemergencyroommembers | `memberRole`     | String   | —     | Rol que desempeña el miembro dentro del canal de crisis.           | `ASSIGNED_UNIT`       |
| tbemergencyroommembers | `joinedAt`       | DateTime | —     | Fecha y hora en que el miembro ingresó a la sala.                  | `2026-08-22T09:25:00` |
| tbemergencyroommembers | `leftAt`         | DateTime | —     | Fecha y hora en que el miembro abandonó la sala.                   | `2026-08-22T11:30:00` |
| tbemergencyroommembers | `isActive`       | Boolean  | —     | Indica si actualmente el miembro continúa participando en la sala. | `true`                |

### Valores de `memberRole`

- `FIRST_REPORTING_CITIZEN`
- `ADDITIONAL_CITIZEN`
- `IA_BOT`
- `CENTRAL_GAMC`
- `INSTITUTION_DISPATCHER`
- `ASSIGNED_UNIT`

---

# 16. `tbchatmessages`

**Descripción de la tabla:** Almacena todos los mensajes enviados dentro del canal de crisis de una emergencia.

| Tabla          | Campo            | Tipo     | PK/FK | Descripción                                                                                    | Ejemplo                                          |
| -------------- | ---------------- | -------- | ----- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| tbchatmessages | `PK_chatMessage` | Int      | PK    | Identificador único del mensaje.                                                               | `845`                                            |
| tbchatmessages | `FK_room`        | Int      | FK    | Sala donde fue enviado el mensaje.                                                             | `32`                                             |
| tbchatmessages | `FK_citizen`     | Int      | FK    | Ciudadano que envió el mensaje, si corresponde.                                                | `15`                                             |
| tbchatmessages | `FK_user`        | Int      | FK    | Usuario del sistema que envió el mensaje, si corresponde.                                      | `7`                                              |
| tbchatmessages | `FK_institution` | Int      | FK    | Institución asociada al envío del mensaje, si corresponde.                                     | `3`                                              |
| tbchatmessages | `FK_unit`        | Int      | FK    | Unidad operativa desde la cual se envió el mensaje, si corresponde.                            | `25`                                             |
| tbchatmessages | `senderRole`     | String   | —     | Rol del emisor del mensaje.                                                                    | `POLICE_UNIT`                                    |
| tbchatmessages | `senderName`     | String   | —     | Nombre visible del emisor dentro del canal.                                                    | `"Patrulla P-12"`                                |
| tbchatmessages | `messageType`    | String   | —     | Tipo de contenido enviado.                                                                     | `TEXT`                                           |
| tbchatmessages | `message`        | String   | —     | Contenido textual del mensaje. Puede ser nulo cuando el mensaje contiene solamente un archivo. | `"Llegamos al lugar"`                            |
| tbchatmessages | `fileUrl`        | String   | —     | URL del archivo multimedia asociado al mensaje.                                                | `"https://storage.sos24/images/evidence-45.jpg"` |
| tbchatmessages | `createdAt`      | DateTime | —     | Fecha y hora de envío del mensaje.                                                             | `2026-08-22T09:32:15`                            |

### Valores de `senderRole`

- `CITIZEN`
- `IA`
- `CENTRAL_GAMC`
- `POLICE_UNIT`
- `FIRE_UNIT`
- `AMBULANCE_UNIT`
- `SAR_UNIT`

### Valores de `messageType`

- `TEXT`
- `LOCATION`
- `AUDIO`
- `IMAGE`
- `CRITICAL_ALERT`
- `SYSTEM_EVENT`

---

# 17. `tbevidences`

**Descripción de la tabla:** Registra fotografías, videos, audios y documentos relacionados con una emergencia. Sirve como respaldo documental del incidente.

| Tabla       | Campo            | Tipo     | PK/FK | Descripción                                                   | Ejemplo                                    |
| ----------- | ---------------- | -------- | ----- | ------------------------------------------------------------- | ------------------------------------------ |
| tbevidences | `PK_evidence`    | Int      | PK    | Identificador único de la evidencia.                          | `450`                                      |
| tbevidences | `FK_emergency`   | Int      | FK    | Emergencia a la que pertenece la evidencia.                   | `48`                                       |
| tbevidences | `FK_citizen`     | Int      | FK    | Ciudadano que cargó la evidencia, si corresponde.             | `15`                                       |
| tbevidences | `FK_user`        | Int      | FK    | Usuario institucional que cargó la evidencia, si corresponde. | `7`                                        |
| tbevidences | `evidenceType`   | String   | —     | Tipo de evidencia almacenada.                                 | `PHOTO`                                    |
| tbevidences | `fileUrl`        | String   | —     | URL o ubicación del archivo almacenado.                       | `"https://storage.sos24/evidence/450.jpg"` |
| tbevidences | `fileName`       | String   | —     | Nombre original o asignado al archivo.                        | `"accidente-01.jpg"`                       |
| tbevidences | `mimeType`       | String   | —     | Tipo MIME del archivo.                                        | `"image/jpeg"`                             |
| tbevidences | `fileSize`       | Int      | —     | Tamaño del archivo expresado en bytes.                        | `2456800`                                  |
| tbevidences | `uploadedByType` | String   | —     | Tipo de usuario que cargó la evidencia.                       | `CITIZEN`                                  |
| tbevidences | `createdAt`      | DateTime | —     | Fecha y hora de carga de la evidencia.                        | `2026-08-22T09:35:00`                      |

### Valores de `evidenceType`

- `PHOTO`
- `VIDEO`
- `AUDIO`
- `DOCUMENT`

---

# 18. `tbaianalyses`

**Descripción de la tabla:** Guarda los resultados generados por la inteligencia artificial durante el análisis de una emergencia. Permite conservar la evolución del análisis a medida que se reciben nuevos reportes.

| Tabla        | Campo                     | Tipo     | PK/FK | Descripción                                                         | Ejemplo                                    |
| ------------ | ------------------------- | -------- | ----- | ------------------------------------------------------------------- | ------------------------------------------ |
| tbaianalyses | `PK_aiAnalysis`           | Int      | PK    | Identificador único del análisis realizado por la IA.               | `92`                                       |
| tbaianalyses | `FK_emergency`            | Int      | FK    | Emergencia analizada por la IA.                                     | `48`                                       |
| tbaianalyses | `analysisType`            | String   | —     | Etapa o motivo del análisis realizado.                              | `INITIAL`                                  |
| tbaianalyses | `priority`                | String   | —     | Prioridad determinada o recomendada por la IA.                      | `CRITICA`                                  |
| tbaianalyses | `affectedPersons`         | Int      | —     | Cantidad estimada de personas afectadas según el análisis.          | `5`                                        |
| tbaianalyses | `affectedAnimals`         | Int      | —     | Cantidad estimada de animales afectados.                            | `2`                                        |
| tbaianalyses | `trappedPersons`          | Int      | —     | Cantidad estimada de personas atrapadas.                            | `2`                                        |
| tbaianalyses | `requiredResources`       | Json     | —     | Recursos que la IA considera necesarios para atender la emergencia. | `[{"resource":"AMBULANCIA","quantity":2}]` |
| tbaianalyses | `recommendedActions`      | Json     | —     | Acciones recomendadas por la IA para la atención del incidente.     | `["Enviar ambulancia","Asegurar zona"]`    |
| tbaianalyses | `recommendedInstitutions` | Json     | —     | Instituciones que la IA recomienda movilizar.                       | `["POLICIA","BOMBEROS","SALUD"]`           |
| tbaianalyses | `confidence`              | Float    | —     | Nivel de confianza del análisis generado por el modelo.             | `0.91`                                     |
| tbaianalyses | `model`                   | String   | —     | Modelo de IA utilizado para generar el análisis.                    | `"SOS24-AI-v1"`                            |
| tbaianalyses | `createdAt`               | DateTime | —     | Fecha y hora en que se generó el análisis.                          | `2026-08-22T09:40:00`                      |

### Valores de `analysisType`

- `INITIAL`
- `UPDATED_BY_ADDITIONAL_REPORTS`
- `FINAL`

---

# 19. `tbemergencyrequirements`

**Descripción de la tabla:** Define los recursos necesarios para atender una emergencia y permite controlar cuántos recursos han sido solicitados y cuántos ya fueron asignados.

| Tabla                   | Campo              | Tipo     | PK/FK | Descripción                                               | Ejemplo                                     |
| ----------------------- | ------------------ | -------- | ----- | --------------------------------------------------------- | ------------------------------------------- |
| tbemergencyrequirements | `PK_requirement`   | Int      | PK    | Identificador único del requerimiento.                    | `73`                                        |
| tbemergencyrequirements | `FK_emergency`     | Int      | FK    | Emergencia que necesita el recurso.                       | `48`                                        |
| tbemergencyrequirements | `FK_resourceType`  | Int      | FK    | Tipo de recurso requerido.                                | `2`                                         |
| tbemergencyrequirements | `quantityRequired` | Int      | —     | Cantidad total de recursos necesarios.                    | `3`                                         |
| tbemergencyrequirements | `quantityAssigned` | Int      | —     | Cantidad de recursos que ya fueron asignados.             | `2`                                         |
| tbemergencyrequirements | `priority`         | String   | —     | Prioridad del requerimiento.                              | `CRITICA`                                   |
| tbemergencyrequirements | `status`           | String   | —     | Estado del requerimiento.                                 | `PARCIAL`                                   |
| tbemergencyrequirements | `reason`           | String   | —     | Motivo por el cual se necesita el recurso.                | `"Se requieren ambulancias para 3 heridos"` |
| tbemergencyrequirements | `createdAt`        | DateTime | —     | Fecha y hora de creación del requerimiento.               | `2026-08-22T09:42:00`                       |
| tbemergencyrequirements | `updatedAt`        | DateTime | —     | Fecha y hora de la última modificación del requerimiento. | `2026-08-22T09:50:00`                       |

### Valores de `status`

- `PENDIENTE`
- `PARCIAL`
- `CUBIERTO`
- `REQUERIMIENTO_INCREMENTADO`
- `CANCELADO`

---

# 20. `tbemergencyassignments`

**Descripción de la tabla:** Registra las asignaciones de instituciones, subinstituciones y unidades para responder a una emergencia.

| Tabla                  | Campo               | Tipo     | PK/FK | Descripción                                                         | Ejemplo               |
| ---------------------- | ------------------- | -------- | ----- | ------------------------------------------------------------------- | --------------------- |
| tbemergencyassignments | `PK_assignment`     | Int      | PK    | Identificador único de la asignación.                               | `105`                 |
| tbemergencyassignments | `FK_emergency`      | Int      | FK    | Emergencia que requiere atención.                                   | `48`                  |
| tbemergencyassignments | `FK_requirement`    | Int      | FK    | Requerimiento de recurso que origina la asignación. Puede ser nulo. | `73`                  |
| tbemergencyassignments | `FK_institution`    | Int      | FK    | Institución responsable de atender la asignación.                   | `3`                   |
| tbemergencyassignments | `FK_subinstitution` | Int      | FK    | Dependencia o base específica que recibe la asignación.             | `8`                   |
| tbemergencyassignments | `FK_unit`           | Int      | FK    | Unidad específica enviada a atender la emergencia.                  | `25`                  |
| tbemergencyassignments | `status`            | String   | —     | Estado actual de la asignación.                                     | `EN_CAMINO`           |
| tbemergencyassignments | `assignedAt`        | DateTime | —     | Fecha y hora en que se creó la asignación.                          | `2026-08-22T09:45:00` |
| tbemergencyassignments | `acceptedAt`        | DateTime | —     | Momento en que la institución o unidad aceptó la asignación.        | `2026-08-22T09:46:00` |
| tbemergencyassignments | `dispatchedAt`      | DateTime | —     | Momento en que la unidad fue despachada.                            | `2026-08-22T09:47:00` |
| tbemergencyassignments | `arrivedAt`         | DateTime | —     | Momento en que la unidad llegó al lugar.                            | `2026-08-22T09:58:00` |
| tbemergencyassignments | `completedAt`       | DateTime | —     | Momento en que finalizó la atención de la asignación.               | `2026-08-22T10:30:00` |
| tbemergencyassignments | `rejectionReason`   | String   | —     | Motivo por el cual una asignación fue rechazada.                    | `NO_UNIT_AVAILABLE`   |
| tbemergencyassignments | `createdAt`         | DateTime | —     | Fecha y hora de creación del registro.                              | `2026-08-22T09:45:00` |
| tbemergencyassignments | `updatedAt`         | DateTime | —     | Fecha y hora de la última actualización.                            | `2026-08-22T09:58:00` |

### Valores de `status`

- `NOTIFICADA`
- `ACEPTADA`
- `DESPACHADA`
- `EN_CAMINO`
- `EN_SITIO`
- `COMPLETADA`
- `RECHAZADA`
- `TIMEOUT`
- `REASIGNADA`

---

# 21. `tbassignmentattempts`

**Descripción de la tabla:** Registra cada intento realizado para conseguir una respuesta de una institución o unidad. Es fundamental para controlar rechazos, falta de respuesta y escalamiento automático.

| Tabla                | Campo             | Tipo     | PK/FK | Descripción                                                         | Ejemplo                     |
| -------------------- | ----------------- | -------- | ----- | ------------------------------------------------------------------- | --------------------------- |
| tbassignmentattempts | `PK_attempt`      | Int      | PK    | Identificador único del intento.                                    | `205`                       |
| tbassignmentattempts | `FK_assignment`   | Int      | FK    | Asignación a la que pertenece el intento.                           | `105`                       |
| tbassignmentattempts | `attemptNumber`   | Int      | —     | Número secuencial del intento realizado.                            | `2`                         |
| tbassignmentattempts | `status`          | String   | —     | Resultado o estado del intento.                                     | `TIMEOUT_SIN_RESPUESTA`     |
| tbassignmentattempts | `notifiedAt`      | DateTime | —     | Fecha y hora en que se notificó a la institución o unidad.          | `2026-08-22T09:45:00`       |
| tbassignmentattempts | `respondedAt`     | DateTime | —     | Fecha y hora en que se recibió una respuesta.                       | `2026-08-22T09:46:20`       |
| tbassignmentattempts | `responseSeconds` | Int      | —     | Tiempo transcurrido hasta recibir respuesta, expresado en segundos. | `80`                        |
| tbassignmentattempts | `reason`          | String   | —     | Motivo o explicación del resultado del intento.                     | `"Sin personal disponible"` |
| tbassignmentattempts | `createdAt`       | DateTime | —     | Fecha y hora de creación del intento.                               | `2026-08-22T09:45:00`       |

### Valores de `status`

- `NOTIFICADO`
- `ACEPTADO`
- `RECHAZADO_SIN_PERSONAL`
- `RECHAZADO_MECANICO`
- `TIMEOUT_SIN_RESPUESTA`

---

# 22. `tbassignmenttracking`

**Descripción de la tabla:** Guarda las posiciones GPS de una unidad mientras se desplaza para atender una emergencia.

| Tabla                | Campo           | Tipo     | PK/FK | Descripción                                                    | Ejemplo               |
| -------------------- | --------------- | -------- | ----- | -------------------------------------------------------------- | --------------------- |
| tbassignmenttracking | `PK_tracking`   | Int      | PK    | Identificador único del registro de rastreo.                   | `15420`               |
| tbassignmenttracking | `FK_assignment` | Int      | FK    | Asignación que está siendo rastreada.                          | `105`                 |
| tbassignmenttracking | `FK_unit`       | Int      | FK    | Unidad que está enviando la posición GPS.                      | `25`                  |
| tbassignmenttracking | `latitude`      | Float    | —     | Latitud actual de la unidad.                                   | `-17.3912`            |
| tbassignmenttracking | `longitude`     | Float    | —     | Longitud actual de la unidad.                                  | `-66.1548`            |
| tbassignmenttracking | `speedKmH`      | Float    | —     | Velocidad aproximada de desplazamiento en kilómetros por hora. | `42.5`                |
| tbassignmenttracking | `heading`       | Float    | —     | Dirección de desplazamiento expresada en grados de 0 a 360.    | `135.0`               |
| tbassignmenttracking | `accuracy`      | Float    | —     | Precisión estimada de la posición GPS en metros.               | `5.2`                 |
| tbassignmenttracking | `timestamp`     | DateTime | —     | Fecha y hora exacta de la posición registrada.                 | `2026-08-22T09:52:10` |

---

# 23. `tbemergencyprogressreports`

**Descripción de la tabla:** Registra informes de avance enviados durante la atención de una emergencia. Permite documentar la evolución del incidente y detectar nuevos requerimientos.

| Tabla                      | Campo                   | Tipo     | PK/FK | Descripción                                                                                 | Ejemplo                                                    |
| -------------------------- | ----------------------- | -------- | ----- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| tbemergencyprogressreports | `PK_progressReport`     | Int      | PK    | Identificador único del reporte de progreso.                                                | `330`                                                      |
| tbemergencyprogressreports | `FK_emergency`          | Int      | FK    | Emergencia relacionada con el reporte.                                                      | `48`                                                       |
| tbemergencyprogressreports | `FK_assignment`         | Int      | FK    | Asignación relacionada con el reporte, cuando corresponde.                                  | `105`                                                      |
| tbemergencyprogressreports | `FK_institution`        | Int      | FK    | Institución que genera el reporte.                                                          | `3`                                                        |
| tbemergencyprogressreports | `FK_user`               | Int      | FK    | Usuario que registra el reporte. Puede ser nulo si el registro es generado automáticamente. | `7`                                                        |
| tbemergencyprogressreports | `reportType`            | String   | —     | Tipo de avance o evento reportado durante la emergencia.                                    | `EN_SITIO`                                                 |
| tbemergencyprogressreports | `title`                 | String   | —     | Título breve del reporte.                                                                   | `"Unidad en el lugar"`                                     |
| tbemergencyprogressreports | `description`           | String   | —     | Descripción detallada de la situación observada.                                            | `"La unidad llegó y comenzó la evaluación del accidente."` |
| tbemergencyprogressreports | `affectedPersonsCount`  | Int      | —     | Cantidad de personas afectadas reportadas en este momento.                                  | `5`                                                        |
| tbemergencyprogressreports | `affectedAnimalsCount`  | Int      | —     | Cantidad de animales afectados reportados.                                                  | `1`                                                        |
| tbemergencyprogressreports | `newRequirementsNeeded` | Boolean  | —     | Indica si el reporte determina que se necesitan nuevos recursos.                            | `true`                                                     |
| tbemergencyprogressreports | `createdAt`             | DateTime | —     | Fecha y hora en que se registró el reporte.                                                 | `2026-08-22T10:00:00`                                      |

### Valores de `reportType`

- `EN_DESPLAZAMIENTO`
- `EN_SITIO`
- `SITUACION_EVALUADA`
- `AGRAVAMIENTO`
- `SOLICITUD_REFUERZOS`
- `NUEVA_INFORMACION`
- `PERSONAS_AFECTADAS`
- `ANIMALES_AFECTADOS`
- `RESCATE_INICIADO`
- `TRASLADO_INICIADO`
- `TRASLADO_FINALIZADO`
- `EMERGENCIA_CONTROLADA`
- `FINALIZADO`

---

# 24. `tbemergencystatushistory`

**Descripción de la tabla:** Mantiene el historial de cambios de estado de cada emergencia. Permite conocer cómo evolucionó una emergencia desde su registro hasta su finalización.

| Tabla                    | Campo              | Tipo     | PK/FK | Descripción                                             | Ejemplo                               |
| ------------------------ | ------------------ | -------- | ----- | ------------------------------------------------------- | ------------------------------------- |
| tbemergencystatushistory | `PK_statusHistory` | Int      | PK    | Identificador único del registro histórico.             | `900`                                 |
| tbemergencystatushistory | `FK_emergency`     | Int      | FK    | Emergencia cuyo estado cambió.                          | `48`                                  |
| tbemergencystatushistory | `FK_user`          | Int      | FK    | Usuario responsable del cambio, cuando corresponde.     | `7`                                   |
| tbemergencystatushistory | `status`           | String   | —     | Nuevo estado asignado a la emergencia.                  | `EN_ATENCION`                         |
| tbemergencystatushistory | `description`      | String   | —     | Explicación del motivo o contexto del cambio de estado. | `"La primera unidad llegó al lugar."` |
| tbemergencystatushistory | `createdAt`        | DateTime | —     | Fecha y hora en que se produjo el cambio.               | `2026-08-22T10:02:00`                 |

---

# 25. `tbunitlocations`

**Descripción de la tabla:** Almacena el historial de posiciones GPS de las unidades de respuesta, independientemente de una emergencia específica.

| Tabla           | Campo             | Tipo     | PK/FK | Descripción                                   | Ejemplo               |
| --------------- | ----------------- | -------- | ----- | --------------------------------------------- | --------------------- |
| tbunitlocations | `PK_unitLocation` | Int      | PK    | Identificador único de la posición histórica. | `50000`               |
| tbunitlocations | `FK_unit`         | Int      | FK    | Unidad que reportó la posición.               | `25`                  |
| tbunitlocations | `latitude`        | Float    | —     | Latitud de la posición de la unidad.          | `-17.3900`            |
| tbunitlocations | `longitude`       | Float    | —     | Longitud de la posición de la unidad.         | `-66.1550`            |
| tbunitlocations | `accuracy`        | Float    | —     | Precisión estimada del GPS en metros.         | `6.0`                 |
| tbunitlocations | `createdAt`       | DateTime | —     | Fecha y hora en que se registró la posición.  | `2026-08-22T10:05:00` |

---

# 26. `tbemergencydestinations`

**Descripción de la tabla:** Registra los destinos relacionados con una emergencia, por ejemplo hospitales, clínicas, centros de salud, refugios o estaciones policiales.

| Tabla                   | Campo             | Tipo     | PK/FK | Descripción                                                            | Ejemplo                              |
| ----------------------- | ----------------- | -------- | ----- | ---------------------------------------------------------------------- | ------------------------------------ |
| tbemergencydestinations | `PK_destination`  | Int      | PK    | Identificador único del destino.                                       | `40`                                 |
| tbemergencydestinations | `FK_emergency`    | Int      | FK    | Emergencia asociada con el destino.                                    | `48`                                 |
| tbemergencydestinations | `FK_institution`  | Int      | FK    | Institución responsable o asociada con el destino, cuando corresponde. | `12`                                 |
| tbemergencydestinations | `destinationType` | String   | —     | Tipo de destino seleccionado para la emergencia.                       | `HOSPITAL`                           |
| tbemergencydestinations | `name`            | String   | —     | Nombre del establecimiento o lugar de destino.                         | `"Hospital Viedma"`                  |
| tbemergencydestinations | `address`         | String   | —     | Dirección física del destino.                                          | `"Av. Venezuela, Cochabamba"`        |
| tbemergencydestinations | `latitude`        | Float    | —     | Latitud geográfica del destino.                                        | `-17.3938`                           |
| tbemergencydestinations | `longitude`       | Float    | —     | Longitud geográfica del destino.                                       | `-66.1592`                           |
| tbemergencydestinations | `selectedAt`      | DateTime | —     | Fecha y hora en que se seleccionó el destino.                          | `2026-08-22T10:10:00`                |
| tbemergencydestinations | `arrivedAt`       | DateTime | —     | Fecha y hora en que la persona o unidad llegó al destino.              | `2026-08-22T10:25:00`                |
| tbemergencydestinations | `status`          | String   | —     | Estado del traslado hacia el destino.                                  | `INGRESADO`                          |
| tbemergencydestinations | `notes`           | String   | —     | Observaciones adicionales relacionadas con el destino.                 | `"Paciente ingresado a emergencias"` |
| tbemergencydestinations | `createdAt`       | DateTime | —     | Fecha y hora de creación del registro.                                 | `2026-08-22T10:10:00`                |
| tbemergencydestinations | `updatedAt`       | DateTime | —     | Fecha y hora de la última modificación.                                | `2026-08-22T10:25:00`                |

### Valores de `destinationType`

- `HOSPITAL`
- `CLINICA`
- `CENTRO_SALUD`
- `REFUGIO_ANIMAL`
- `CENTRO_ZOONOSIS`
- `ESTACION_POLICIAL`
- `CENTRO_CONTENCION`
- `ZONA_SEGURA`
- `OTRO`

### Valores de `status`

- `ASIGNADO`
- `EN_TRASLADO`
- `INGRESADO`

---

# 27. `tbnotifications`

**Descripción de la tabla:** Almacena las notificaciones enviadas por el sistema a ciudadanos y usuarios institucionales relacionadas con emergencias, asignaciones, cambios de estado y mensajes.

| Tabla           | Campo              | Tipo     | PK/FK | Descripción                                     | Ejemplo                                          |
| --------------- | ------------------ | -------- | ----- | ----------------------------------------------- | ------------------------------------------------ |
| tbnotifications | `PK_notification`  | Int      | PK    | Identificador único de la notificación.         | `1500`                                           |
| tbnotifications | `FK_user`          | Int      | FK    | Usuario del sistema que recibe la notificación. | `7`                                              |
| tbnotifications | `FK_citizen`       | Int      | FK    | Ciudadano que recibe la notificación.           | `15`                                             |
| tbnotifications | `FK_emergency`     | Int      | FK    | Emergencia relacionada con la notificación.     | `48`                                             |
| tbnotifications | `title`            | String   | —     | Título que se muestra al receptor.              | `"Emergencia asignada"`                          |
| tbnotifications | `message`          | String   | —     | Contenido de la notificación.                   | `"Una unidad ha sido asignada a la emergencia."` |
| tbnotifications | `notificationType` | String   | —     | Tipo de evento que originó la notificación.     | `ASSIGNMENT_REQUEST`                             |
| tbnotifications | `priority`         | String   | —     | Nivel de prioridad de la notificación.          | `CRITICA`                                        |
| tbnotifications | `isRead`           | Boolean  | —     | Indica si el receptor ya leyó la notificación.  | `false`                                          |
| tbnotifications | `createdAt`        | DateTime | —     | Fecha y hora de creación de la notificación.    | `2026-08-22T10:15:00`                            |

### Valores de `notificationType`

- `ALERT_CRITICAL`
- `STATUS_UPDATE`
- `ASSIGNMENT_REQUEST`
- `CHAT_MESSAGE`

### Valores de `priority`

- `ALTA`
- `CRITICA`
- `NORMAL`

---

# RELACIONES PRINCIPALES DE ESTA PARTE

Para que otro desarrollador pueda comprender rápidamente cómo funciona esta segunda mitad, la estructura lógica es:

```text
tbemergencies
      │
      ├── tbemergencyreports
      │       └── Reportes de ciudadanos
      │
      ├── tbemergencylocations
      │       └── Ubicaciones del incidente
      │
      ├── tbcalls
      │       └── Llamadas
      │
      ├── tbemergencyrooms
      │       ├── tbemergencyroommembers
      │       └── tbchatmessages
      │
      ├── tbevidences
      │       └── Fotos / videos / audios / documentos
      │
      ├── tbaianalyses
      │       └── Análisis evolutivo de IA
      │
      ├── tbemergencyrequirements
      │       └── Recursos necesarios
      │
      ├── tbemergencyassignments
      │       ├── tbassignmentattempts
      │       ├── tbassignmenttracking
      │       └── tbemergencyprogressreports
      │
      ├── tbemergencystatushistory
      │       └── Historial de estados
      │
      ├── tbemergencydestinations
      │       └── Hospital / clínica / refugio / etc.
      │
      └── tbnotifications
              └── Avisos a ciudadanos y usuarios
```

## Flujo que representa la base de datos

```text
CIUDADANO
    │
    ▼
tbemergencyreports
    │
    ▼
tbemergencies
    │
    ├──────────────► tbaianalyses
    │                    │
    │                    ▼
    │             Recursos requeridos
    │                    │
    │                    ▼
    │          tbemergencyrequirements
    │                    │
    │                    ▼
    │         tbemergencyassignments
    │                    │
    │          ┌─────────┼─────────┐
    │          ▼         ▼         ▼
    │       attempts  tracking   progress
    │
    ├──────────────► tbemergencyrooms
    │                    │
    │             ┌──────┴──────┐
    │             ▼             ▼
    │       roommembers     chatmessages
    │
    ├──────────────► tbevidences
    │
    ├──────────────► tbemergencylocations
    │
    ├──────────────► tbcalls
    │
    ├──────────────► tbemergencystatushistory
    │
    ├──────────────► tbemergencydestinations
    │
    └──────────────► tbnotifications
```
