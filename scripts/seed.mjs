import "dotenv/config";
import bcrypt from "bcrypt";
import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const hash = (password) => bcrypt.hashSync(password, 10);

const privileges = [
  ["Administrador Central", "CENTRAL_ADMIN", "GAMC", "Control total del sistema."],
  ["Operador Central", "CENTRAL_OPERATOR", "GAMC", "Monitoreo y coordinación de emergencias."],
  ["Despachador", "DISPATCHER", "GAMC", "Asignación de instituciones y unidades."],
  ["Administrador de Institución", "INSTITUTION_ADMIN", "INSTITUTION", "Administración de la institución."],
  ["Operador de Institución", "INSTITUTION_OPERATOR", "INSTITUTION", "Gestión de asignaciones de la institución."],
];

for (const p of privileges) {
  await client.query(
    `INSERT INTO "tbprivileges" ("privilege", "privilegeCode", "privilegeType", "description")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("privilegeCode") DO NOTHING`,
    p,
  );
}

const institutionTypes = [
  ["Policía", "POLICIA", "Policía Boliviana"],
  ["Bomberos", "BOMBEROS", "Cuerpo de Bomberos"],
  ["Ambulancia", "AMBULANCIA", "Servicios médicos de emergencia"],
  ["SAR", "SAR", "Sistema de Búsqueda y Rescate"],
  ["Seguridad Ciudadana", "SEGURIDAD_CIUDADANA", "Seguridad Ciudadana Municipal"],
];

for (const t of institutionTypes) {
  await client.query(
    `INSERT INTO "tbinstitutiontypes" ("name", "code", "description")
     VALUES ($1, $2, $3)
     ON CONFLICT ("code") DO NOTHING`,
    t,
  );
}

const institutions = [
  ["POLICIA", "Policía Boliviana", "POLICIA", "110"],
  ["BOMBEROS", "Cuerpo de Bomberos Cochabamba", "BOMBEROS", "119"],
  ["AMBULANCIA", "Servicio Médico de Emergencia", "SME", "118"],
  ["SAR", "Búsqueda y Rescate Bolivia", "SAR", "111"],
  ["SEGURIDAD_CIUDADANA", "Seguridad Ciudadana GAMC", "SCG", "112"],
];

for (const [typeCode, name, acronym, phoneNumber] of institutions) {
  const { rows: existingRows } = await client.query(`SELECT 1 FROM "tbinstitutions" WHERE "name" = $1`, [name]);
  if (existingRows.length > 0) continue;
  const { rows: typeRows } = await client.query(
    `SELECT "PK_institutionType" FROM "tbinstitutiontypes" WHERE "code" = $1`,
    [typeCode],
  );
  await client.query(
    `INSERT INTO "tbinstitutions" ("FK_institutionType", "name", "acronym", "phoneNumber", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, now(), now())`,
    [typeRows[0].PK_institutionType, name, acronym, phoneNumber],
  );
}

const users = [
  {
    privilegeCode: "CENTRAL_ADMIN",
    institution: null,
    firstName: "Celso",
    lastName: "Franciscano",
    phoneNumber: "70000001",
    email: "admin@gamc.bo",
    password: "Admin1234",
  },
  {
    privilegeCode: "CENTRAL_OPERATOR",
    institution: null,
    firstName: "Maria",
    lastName: "Operadora",
    phoneNumber: "70000002",
    email: "operador@gamc.bo",
    password: "Oper12345",
  },
  {
    privilegeCode: "INSTITUTION_ADMIN",
    institution: "Bomberos",
    firstName: "Juan",
    lastName: "Bombero",
    phoneNumber: "70000003",
    email: "admin@bomberos.bo",
    password: "Inst12345",
  },
];

for (const u of users) {
  const { rows: existingRows } = await client.query(`SELECT 1 FROM "tbusers" WHERE "email" = $1`, [u.email]);
  if (existingRows.length > 0) continue;
  const { rows: privilegeRows } = await client.query(
    `SELECT "PK_privilege" FROM "tbprivileges" WHERE "privilegeCode" = $1`,
    [u.privilegeCode],
  );
  let institutionId = null;
  if (u.institution) {
    const { rows: institutionRows } = await client.query(
      `SELECT "PK_institution" FROM "tbinstitutions" WHERE "name" ILIKE $1`,
      [`%${u.institution}%`],
    );
    institutionId = institutionRows[0]?.PK_institution ?? null;
  }
  await client.query(
    `INSERT INTO "tbusers" ("FK_privilege", "FK_institution", "firstName", "lastName", "phoneNumber", "email", "password", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())`,
    [privilegeRows[0].PK_privilege, institutionId, u.firstName, u.lastName, u.phoneNumber, u.email, hash(u.password)],
  );
}

// Names must match IncidentType.label / geminiReportCategories exactly on the
// Flutter side, since the report route resolves emergencyTypeName via a
// "contains" lookup against this table.
const emergencyTypes = [
  ["Robo", "ROBO", "Robo o hurto en curso o reciente."],
  ["Accidente", "ACCIDENTE", "Accidente de tránsito u otro accidente."],
  ["Persona sospechosa", "PERSONA_SOSPECHOSA", "Persona o actividad sospechosa."],
  ["Violencia", "VIOLENCIA", "Violencia física o agresión."],
  ["Incendio", "INCENDIO", "Incendio o riesgo de incendio."],
  ["Emergencia médica", "EMERGENCIA_MEDICA", "Emergencia médica o de salud."],
  ["Vandalismo", "VANDALISMO", "Vandalismo o daño a propiedad."],
  ["Otro", "OTRO", "Otro tipo de emergencia no listada."],
];

for (const [name, code, description] of emergencyTypes) {
  await client.query(
    `INSERT INTO "tbemergencytypes" ("name", "code", "description", "status", "createdAt")
     VALUES ($1, $2, $3, true, now())
     ON CONFLICT ("code") DO NOTHING`,
    [name, code, description],
  );
}

const citizen = {
  firstName: "Pedro",
  lastName: "Ciudadano",
  CI: "1234567",
  phoneNumber: "70000010",
  password: "Ciudadano123",
};

const { rows: existingCitizenRows } = await client.query(`SELECT 1 FROM "tbcitizens" WHERE "phoneNumber" = $1`, [
  citizen.phoneNumber,
]);
if (existingCitizenRows.length === 0) {
  await client.query(
    `INSERT INTO "tbcitizens" ("firstName", "lastName", "CI", "phoneNumber", "password", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, now(), now())`,
    [citizen.firstName, citizen.lastName, citizen.CI, citizen.phoneNumber, hash(citizen.password)],
  );
}

console.log("Seed completado:");
console.log("  Institucional: admin@gamc.bo / Admin1234");
console.log("  Operador:      operador@gamc.bo / Oper12345");
console.log("  Bomberos:      admin@bomberos.bo / Inst12345");
console.log("  Ciudadano:     70000010 / Ciudadano123");

await client.end();
