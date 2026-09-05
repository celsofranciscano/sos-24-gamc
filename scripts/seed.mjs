import bcrypt from "bcrypt";
import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_URL?.replace("file:", "") ?? "./dev.db";

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

const hash = (password) => bcrypt.hashSync(password, 10);

const insertPrivilege = db.prepare(`
  INSERT OR IGNORE INTO tbprivileges (privilege, privilegeCode, privilegeType, description)
  VALUES (?, ?, ?, ?)
`);

const privileges = [
  ["Administrador Central", "CENTRAL_ADMIN", "GAMC", "Control total del sistema."],
  ["Operador Central", "CENTRAL_OPERATOR", "GAMC", "Monitoreo y coordinación de emergencias."],
  ["Despachador", "DISPATCHER", "GAMC", "Asignación de instituciones y unidades."],
  ["Administrador de Institución", "INSTITUTION_ADMIN", "INSTITUTION", "Administración de la institución."],
  ["Operador de Institución", "INSTITUTION_OPERATOR", "INSTITUTION", "Gestión de asignaciones de la institución."],
];

for (const p of privileges) insertPrivilege.run(...p);

const getPrivilege = db.prepare("SELECT PK_privilege FROM tbprivileges WHERE privilegeCode = ?");

const insertInstitutionType = db.prepare(`
  INSERT OR IGNORE INTO tbinstitutiontypes (name, code, description)
  VALUES (?, ?, ?)
`);

const institutionTypes = [
  ["Policía", "POLICIA", "Policía Boliviana"],
  ["Bomberos", "BOMBEROS", "Cuerpo de Bomberos"],
  ["Ambulancia", "AMBULANCIA", "Servicios médicos de emergencia"],
  ["SAR", "SAR", "Sistema de Búsqueda y Rescate"],
  ["Seguridad Ciudadana", "SEGURIDAD_CIUDADANA", "Seguridad Ciudadana Municipal"],
];

for (const t of institutionTypes) insertInstitutionType.run(...t);

const getInstitutionType = db.prepare("SELECT PK_institutionType FROM tbinstitutiontypes WHERE code = ?");

const insertInstitution = db.prepare(`
  INSERT INTO tbinstitutions (FK_institutionType, name, acronym, phoneNumber, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getInstitutionByName = db.prepare("SELECT PK_institution FROM tbinstitutions WHERE name = ?");

const institutions = [
  ["POLICIA", "Policía Boliviana", "POLICIA", "110"],
  ["BOMBEROS", "Cuerpo de Bomberos Cochabamba", "BOMBEROS", "119"],
  ["AMBULANCIA", "Servicio Médico de Emergencia", "SME", "118"],
  ["SAR", "Búsqueda y Rescate Bolivia", "SAR", "111"],
  ["SEGURIDAD_CIUDADANA", "Seguridad Ciudadana GAMC", "SCG", "112"],
];

for (const [typeCode, name, acronym, phone] of institutions) {
  if (getInstitutionByName.get(name)) continue;
  const type = getInstitutionType.get(typeCode);
  insertInstitution.run(
    type.PK_institutionType,
    name,
    acronym,
    phone,
    new Date().toISOString(),
    new Date().toISOString(),
  );
}

const getInstitution = db.prepare("SELECT PK_institution FROM tbinstitutions WHERE name = ?");
const getUserByEmail = db.prepare("SELECT PK_user FROM tbusers WHERE email = ?");

const insertUser = db.prepare(`
  INSERT INTO tbusers (FK_privilege, FK_institution, firstName, lastName, phoneNumber, email, password, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

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
  if (getUserByEmail.get(u.email)) continue;
  const privilege = getPrivilege.get(u.privilegeCode);
  const institution = u.institution ? getInstitution.get(u.institution) : undefined;
  insertUser.run(
    privilege.PK_privilege,
    institution?.PK_institution ?? null,
    u.firstName,
    u.lastName,
    u.phoneNumber,
    u.email,
    hash(u.password),
    new Date().toISOString(),
    new Date().toISOString(),
  );
}

const insertEmergencyType = db.prepare(`
  INSERT OR IGNORE INTO tbemergencytypes (name, code, description, status, createdAt)
  VALUES (?, ?, ?, 1, ?)
`);

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
  insertEmergencyType.run(name, code, description, new Date().toISOString());
}

const getCitizenByPhone = db.prepare("SELECT PK_citizen FROM tbcitizens WHERE phoneNumber = ?");

const insertCitizen = db.prepare(`
  INSERT INTO tbcitizens (firstName, lastName, CI, phoneNumber, password, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

if (!getCitizenByPhone.get("70000010")) {
  insertCitizen.run(
    "Pedro",
    "Ciudadano",
    "1234567",
    "70000010",
    hash("Ciudadano123"),
    new Date().toISOString(),
    new Date().toISOString(),
  );
}

console.log("Seed completado:");
console.log("  Institucional: admin@gamc.bo / Admin1234");
console.log("  Operador:      operador@gamc.bo / Oper12345");
console.log("  Bomberos:      admin@bomberos.bo / Inst12345");
console.log("  Ciudadano:     70000010 / Ciudadano123");

db.close();
