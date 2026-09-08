import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando siembra de datos de prueba para SOS-24...");

  const hash = (pass: string) => bcrypt.hashSync(pass, 10);

  // 1. PRIVILEGIOS
  console.log("-> Creando privilegios...");
  const privilegesData = [
    { privilege: "Administrador Central", privilegeCode: "CENTRAL_ADMIN", privilegeType: "GAMC", description: "Control total y configuración de SOS-24 GAMC." },
    { privilege: "Operador Central", privilegeCode: "CENTRAL_OPERATOR", privilegeType: "GAMC", description: "Monitoreo, recepción y coordinación en tiempo real." },
    { privilege: "Despachador", privilegeCode: "DISPATCHER", privilegeType: "GAMC", description: "Despacho y asignación directa a instituciones y unidades." },
    { privilege: "Administrador Institucional", privilegeCode: "INSTITUTION_ADMIN", privilegeType: "INSTITUTION", description: "Gestión institucional, unidades y recursos." },
    { privilege: "Operador Institucional", privilegeCode: "INSTITUTION_OPERATOR", privilegeType: "INSTITUTION", description: "Recepción de despachos y respuesta operativa." },
  ];

  const privMap = new Map<string, number>();
  for (const p of privilegesData) {
    const record = await prisma.tbprivileges.upsert({
      where: { privilegeCode: p.privilegeCode },
      update: { privilege: p.privilege, description: p.description, privilegeType: p.privilegeType },
      create: p,
    });
    privMap.set(p.privilegeCode, record.PK_privilege);
  }

  // 2. TIPOS DE INSTITUCIÓN
  console.log("-> Creando tipos de institución...");
  const instTypesData = [
    { name: "Policía", code: "POLICIA", description: "Policía Boliviana - Seguridad y Orden Público" },
    { name: "Bomberos", code: "BOMBEROS", description: "Cuerpo de Bomberos y Rescate" },
    { name: "Ambulancia y Salud", code: "AMBULANCIA", description: "Servicios de Emergencia Médica Prehospitalaria" },
    { name: "SAR", code: "SAR", description: "Sistema de Búsqueda y Salvamento SAR-Bolivia" },
    { name: "Seguridad Ciudadana", code: "SEGURIDAD_CIUDADANA", description: "Guardia Municipal GAMC Cochabamba" },
    { name: "Centro Hospitalario", code: "HOSPITAL", description: "Hospitales y Centros de Trauma" },
  ];

  const instTypeMap = new Map<string, number>();
  for (const it of instTypesData) {
    const record = await prisma.tbinstitutiontypes.upsert({
      where: { code: it.code },
      update: { name: it.name, description: it.description },
      create: it,
    });
    instTypeMap.set(it.code, record.PK_institutionType);
  }

  // 3. TIPOS DE RECURSOS
  console.log("-> Creando tipos de recursos...");
  const resourceTypesData = [
    { name: "Patrulla Policial", code: "PATRULLA", description: "Vehículo patrullero 4x4 equipado" },
    { name: "Carro Bomba", code: "CAMION_BOMBEROS", description: "Camión cisterna contra incendios" },
    { name: "Ambulancia de Terapia Intensiva", code: "AMBULANCIA_UTI", description: "Ambulancia con soporte vital avanzado" },
    { name: "Unidad de Rescate SAR", code: "RESCATE_SAR", description: "Vehículo con equipo de rescate urbano y agreste" },
    { name: "Moto Patrulla Rápida", code: "MOTO_PATRULLA", description: "Motocicleta de primera respuesta" },
  ];

  const resTypeMap = new Map<string, number>();
  for (const rt of resourceTypesData) {
    const record = await prisma.tbresourcetypes.upsert({
      where: { code: rt.code },
      update: { name: rt.name, description: rt.description },
      create: rt,
    });
    resTypeMap.set(rt.code, record.PK_resourceType);
  }

  // 4. TIPOS DE EMERGENCIA
  console.log("-> Creando tipos de emergencia...");
  const emergencyTypesData = [
    { name: "Accidente de Tránsito", code: "ACCIDENTE_TRANSITO", description: "Colisiones vehiculares, atropellos con o sin heridos" },
    { name: "Incendio Estructural", code: "INCENDIO_ESTRUCTURAL", description: "Fuego en viviendas, comercios o fábricas" },
    { name: "Emergencia Médica", code: "EMERGENCIA_MEDICA", description: "Paro cardíaco, convulsiones, traumatismos graves" },
    { name: "Robo / Atraco en Curso", code: "ROBO_ASALTO", description: "Delito flagrante contra la propiedad o personas" },
    { name: "Rescate de Personas", code: "RESCATE_PERSONA", description: "Personas atrapadas en altura, canal o derrumbe" },
    { name: "Violencia Familiar / Género", code: "VIOLENCIA_FAMILIAR", description: "Agresiones intrafamiliares activas" },
  ];

  const emTypeMap = new Map<string, number>();
  for (const et of emergencyTypesData) {
    const record = await prisma.tbemergencytypes.upsert({
      where: { code: et.code },
      update: { name: et.name, description: et.description },
      create: et,
    });
    emTypeMap.set(et.code, record.PK_emergencyType);
  }

  // 5. INSTITUCIONES
  console.log("-> Creando instituciones...");
  const institutionsData = [
    {
      typeCode: "POLICIA",
      name: "Policía Departamental Cochabamba",
      acronym: "POL-CBBA",
      phone: "110",
      email: "comandocbba@policia.bo",
      address: "Plaza 14 de Septiembre y Calle Baptista",
      lat: -17.3938,
      lng: -66.1572,
    },
    {
      typeCode: "BOMBEROS",
      name: "Dirección Departamental de Bomberos Nataniel Aguirre",
      acronym: "BOMBEROS",
      phone: "119",
      email: "bomberos.cbba@policia.bo",
      address: "Av. Heroínas y Calle 25 de Mayo",
      lat: -17.3912,
      lng: -66.1534,
    },
    {
      typeCode: "AMBULANCIA",
      name: "Servicio Médico de Emergencia (SME GAMC)",
      acronym: "SME-GAMC",
      phone: "168",
      email: "sme@cochabamba.bo",
      address: "Av. Ayacucho y Esteban Arze",
      lat: -17.3995,
      lng: -66.1558,
    },
    {
      typeCode: "SAR",
      name: "SAR Bolivia Filial Cochabamba",
      acronym: "SAR-CBBA",
      phone: "111",
      email: "base@sarbolivia.org",
      address: "Av. Libertador Bolívar, Sarco",
      lat: -17.3752,
      lng: -66.1685,
    },
    {
      typeCode: "SEGURIDAD_CIUDADANA",
      name: "Dirección de Seguridad Ciudadana GAMC",
      acronym: "SC-GAMC",
      phone: "151",
      email: "seguridad@cochabamba.bo",
      address: "Plaza Colón, Acera Este",
      lat: -17.3882,
      lng: -66.1543,
    },
  ];

  const instMap = new Map<string, number>();
  for (const inst of institutionsData) {
    const existing = await prisma.tbinstitutions.findFirst({ where: { name: inst.name } });
    if (existing) {
      instMap.set(inst.acronym, existing.PK_institution);
    } else {
      const created = await prisma.tbinstitutions.create({
        data: {
          FK_institutionType: instTypeMap.get(inst.typeCode)!,
          name: inst.name,
          acronym: inst.acronym,
          phoneNumber: inst.phone,
          email: inst.email,
          address: inst.address,
          latitude: inst.lat,
          longitude: inst.lng,
        },
      });
      instMap.set(inst.acronym, created.PK_institution);
    }
  }

  // 6. DEPENDENCIAS / SUBINSTITUCIONES
  console.log("-> Creando subinstituciones...");
  const subInstData = [
    {
      instAcronym: "POL-CBBA",
      name: "EPI 6 Sud (Estación Policial Integral)",
      code: "EPI-6",
      phone: "44721110",
      address: "Av. Panamericana y Av. 6 de Agosto",
      lat: -17.4185,
      lng: -66.1522,
    },
    {
      instAcronym: "POL-CBBA",
      name: "EPI 3 Norte (Estación Policial Integral)",
      code: "EPI-3",
      phone: "44721113",
      address: "Av. América y Calle Pando",
      lat: -17.3725,
      lng: -66.1598,
    },
    {
      instAcronym: "BOMBEROS",
      name: "Estación Bomberos Sarco",
      code: "BOMB-SARCO",
      phone: "44241119",
      address: "Av. Juan de la Rosa y Gabriel René Moreno",
      lat: -17.3792,
      lng: -66.1725,
    },
  ];

  const subInstMap = new Map<string, number>();
  for (const s of subInstData) {
    const existing = await prisma.tbsubinstitutions.findFirst({ where: { code: s.code } });
    if (existing) {
      subInstMap.set(s.code, existing.PK_subinstitution);
    } else {
      const created = await prisma.tbsubinstitutions.create({
        data: {
          FK_institution: instMap.get(s.instAcronym)!,
          name: s.name,
          code: s.code,
          phoneNumber: s.phone,
          address: s.address,
          latitude: s.lat,
          longitude: s.lng,
        },
      });
      subInstMap.set(s.code, created.PK_subinstitution);
    }
  }

  // 7. UNIDADES DE RESPUESTA
  console.log("-> Creando unidades con rastreo GPS...");
  const unitsData = [
    {
      instAcronym: "POL-CBBA",
      subCode: "EPI-3",
      resCode: "PATRULLA",
      unitCode: "PAT-301",
      unitName: "Patrullero Delta 301 (Norte)",
      phone: "71700101",
      status: "DISPONIBLE",
    },
    {
      instAcronym: "POL-CBBA",
      subCode: "EPI-6",
      resCode: "PATRULLA",
      unitCode: "PAT-602",
      unitName: "Patrullero Bravo 602 (Sud)",
      phone: "71700102",
      status: "EN_CAMINO",
    },
    {
      instAcronym: "BOMBEROS",
      subCode: "BOMB-SARCO",
      resCode: "CAMION_BOMBEROS",
      unitCode: "B-01",
      unitName: "Carro Cisterna Alfa-1",
      phone: "71700201",
      status: "DISPONIBLE",
    },
    {
      instAcronym: "SME-GAMC",
      resCode: "AMBULANCIA_UTI",
      unitCode: "AMB-03",
      unitName: "Ambulancia UTI Móvil 3",
      phone: "71700301",
      status: "EN_SITIO",
    },
    {
      instAcronym: "SAR-CBBA",
      resCode: "RESCATE_SAR",
      unitCode: "SAR-10",
      unitName: "Rescate Urbano Halcón 10",
      phone: "71700401",
      status: "DISPONIBLE",
    },
  ];

  const unitMap = new Map<string, number>();
  for (const u of unitsData) {
    const existing = await prisma.tbunits.findUnique({ where: { unitCode: u.unitCode } });
    if (existing) {
      unitMap.set(u.unitCode, existing.PK_unit);
    } else {
      const created = await prisma.tbunits.create({
        data: {
          FK_institution: instMap.get(u.instAcronym)!,
          FK_subinstitution: u.subCode ? subInstMap.get(u.subCode) : null,
          FK_resourceType: resTypeMap.get(u.resCode)!,
          unitCode: u.unitCode,
          unitName: u.unitName,
          phoneNumber: u.phone,
          status: u.status,
          isAvailable: u.status === "DISPONIBLE",
          isActive: true,
        },
      });
      unitMap.set(u.unitCode, created.PK_unit);
    }
  }

  // 8. USUARIOS DEL SISTEMA (DASHBOARD GAMC / INSTITUCIONAL)
  console.log("-> Creando usuarios administrativos y operadores...");
  const usersData = [
    {
      email: "admin@gamc.bo",
      privCode: "CENTRAL_ADMIN",
      firstName: "Celso",
      lastName: "Franciscano",
      phone: "70000001",
      password: "Admin1234",
    },
    {
      email: "operador@gamc.bo",
      privCode: "CENTRAL_OPERATOR",
      firstName: "Maria",
      lastName: "Delgado",
      phone: "70000002",
      password: "Oper12345",
    },
    {
      email: "despacho@gamc.bo",
      privCode: "DISPATCHER",
      firstName: "Roberto",
      lastName: "Salazar",
      phone: "70000003",
      password: "Despacho123",
    },
    {
      email: "admin@bomberos.bo",
      privCode: "INSTITUTION_ADMIN",
      instAcronym: "BOMBEROS",
      firstName: "Cap. Javier",
      lastName: "Montaño",
      phone: "70000004",
      password: "Inst12345",
    },
    {
      email: "admin@policia.bo",
      privCode: "INSTITUTION_ADMIN",
      instAcronym: "POL-CBBA",
      firstName: "Mayor Juan",
      lastName: "Flores",
      phone: "70000005",
      password: "Inst12345",
    },
    {
      email: "admin@sme.bo",
      privCode: "INSTITUTION_ADMIN",
      instAcronym: "SME-GAMC",
      firstName: "Dra. Carmen",
      lastName: "Torrico",
      phone: "70000006",
      password: "Inst12345",
    },
  ];

  const userMap = new Map<string, number>();
  for (const u of usersData) {
    const existing = await prisma.tbusers.findUnique({ where: { email: u.email } });
    if (existing) {
      userMap.set(u.email, existing.PK_user);
    } else {
      const created = await prisma.tbusers.create({
        data: {
          FK_privilege: privMap.get(u.privCode)!,
          FK_institution: u.instAcronym ? instMap.get(u.instAcronym) : null,
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: u.phone,
          email: u.email,
          password: hash(u.password),
          status: true,
        },
      });
      userMap.set(u.email, created.PK_user);
    }
  }

  // 9. CIUDADANOS DE PRUEBA (PWA)
  console.log("-> Creando ciudadanos de prueba...");
  const citizensData = [
    {
      firstName: "Pedro",
      lastName: "Gómez Vargas",
      CI: "7891234",
      phone: "70000010",
      email: "pedro.gomez@gmail.com",
      password: "Ciudadano123",
    },
    {
      firstName: "Andrea",
      lastName: "Ríos Morales",
      CI: "6543210",
      phone: "70000020",
      email: "andrea.rios@gmail.com",
      password: "Ciudadano123",
    },
  ];

  const citizenMap = new Map<string, number>();
  for (const c of citizensData) {
    const existing = await prisma.tbcitizens.findUnique({ where: { phoneNumber: c.phone } });
    if (existing) {
      citizenMap.set(c.phone, existing.PK_citizen);
    } else {
      const created = await prisma.tbcitizens.create({
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          CI: c.CI,
          phoneNumber: c.phone,
          email: c.email,
          password: hash(c.password),
          status: true,
        },
      });
      citizenMap.set(c.phone, created.PK_citizen);
    }
  }

  // 10. EMERGENCIAS CON ESCENARIOS REALES
  console.log("-> Creando casos de emergencia activos y resueltos...");

  // CASO 1: Accidente de tránsito en atención con Sala, Despacho, Chat y GPS
  const code1 = "SOS-260829-0001";
  let em1 = await prisma.tbemergencies.findUnique({ where: { emergencyCode: code1 } });
  if (!em1) {
    em1 = await prisma.tbemergencies.create({
      data: {
        emergencyCode: code1,
        FK_citizen: citizenMap.get("70000010"),
        FK_emergencyType: emTypeMap.get("ACCIDENTE_TRANSITO"),
        priority: "CRITICA",
        status: "EN_ATENCION",
        description: "Choque múltiple con personas atrapadas y heridos en Av. Blanco Galindo km 4.",
        affectedPersons: 3,
        trappedPersons: 1,
        reportedAt: new Date(Date.now() - 25 * 60 * 1000),
      },
    });

    // Ubicación
    await prisma.tbemergencylocations.create({
      data: {
        FK_emergency: em1.PK_emergency,
        latitude: -17.3882,
        longitude: -66.1954,
        accuracy: 5.5,
        address: "Av. Blanco Galindo Km 4, frente a Hipermaxi",
      },
    });

    // Despacho a Ambulancia
    const asg1 = await prisma.tbemergencyassignments.create({
      data: {
        FK_emergency: em1.PK_emergency,
        FK_institution: instMap.get("SME-GAMC")!,
        FK_unit: unitMap.get("AMB-03"),
        status: "EN_SITIO",
        assignedAt: new Date(Date.now() - 20 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 18 * 60 * 1000),
        arrivedAt: new Date(Date.now() - 8 * 60 * 1000),
      },
    });

    // Tracking GPS de la ruta recorrida
    await prisma.tbassignmenttracking.createMany({
      data: [
        { FK_assignment: asg1.PK_assignment, FK_unit: unitMap.get("AMB-03")!, latitude: -17.3995, longitude: -66.1558, speed: 45, heading: 280, createdAt: new Date(Date.now() - 16 * 60 * 1000) },
        { FK_assignment: asg1.PK_assignment, FK_unit: unitMap.get("AMB-03")!, latitude: -17.3940, longitude: -66.1750, speed: 52, heading: 285, createdAt: new Date(Date.now() - 12 * 60 * 1000) },
        { FK_assignment: asg1.PK_assignment, FK_unit: unitMap.get("AMB-03")!, latitude: -17.3882, longitude: -66.1954, speed: 0, heading: 290, createdAt: new Date(Date.now() - 8 * 60 * 1000) },
      ],
    });

    // Sala de crisis y chat
    const room1 = await prisma.tbemergencyrooms.create({
      data: {
        FK_emergency: em1.PK_emergency,
        roomCode: `SALA-${code1}`,
        isOpen: true,
      },
    });

    // Miembros
    await prisma.tbemergencyroommembers.createMany({
      data: [
        { FK_room: room1.PK_room, FK_citizen: citizenMap.get("70000010"), memberRole: "FIRST_REPORTING_CITIZEN" },
        { FK_room: room1.PK_room, FK_user: userMap.get("operador@gamc.bo"), memberRole: "CENTRAL_GAMC" },
        { FK_room: room1.PK_room, FK_institution: instMap.get("SME-GAMC"), FK_unit: unitMap.get("AMB-03"), memberRole: "ASSIGNED_UNIT" },
      ],
    });

    // Mensajes
    await prisma.tbchatmessages.createMany({
      data: [
        { FK_room: room1.PK_room, FK_citizen: citizenMap.get("70000010"), senderRole: "CITIZEN", senderName: "Pedro Gómez", messageType: "TEXT", message: "¡Por favor ayuda! Hay un auto volcado con personas heridas.", createdAt: new Date(Date.now() - 24 * 60 * 1000) },
        { FK_room: room1.PK_room, senderRole: "IA", senderName: "Asistente IA SOS-24", messageType: "TEXT", message: "Emergencia recibida. Mantenga la calma, la Central GAMC ha sido notificada y se localizó su ubicación.", createdAt: new Date(Date.now() - 23 * 60 * 1000) },
        { FK_room: room1.PK_room, FK_user: userMap.get("operador@gamc.bo"), senderRole: "CENTRAL_GAMC", senderName: "Central GAMC", messageType: "TEXT", message: "Unidad SME AMB-03 despachada en código rojo.", createdAt: new Date(Date.now() - 19 * 60 * 1000) },
        { FK_room: room1.PK_room, FK_unit: unitMap.get("AMB-03"), senderRole: "AMBULANCE_UNIT", senderName: "SME AMB-03", messageType: "TEXT", message: "En el lugar. Iniciando triage y atención prehospitalaria.", createdAt: new Date(Date.now() - 7 * 60 * 1000) },
      ],
    });
  }

  // CASO 2: Incendio Estructural en La Cancha (Asignada a Bomberos)
  const code2 = "SOS-260829-0002";
  let em2 = await prisma.tbemergencies.findUnique({ where: { emergencyCode: code2 } });
  if (!em2) {
    em2 = await prisma.tbemergencies.create({
      data: {
        emergencyCode: code2,
        FK_citizen: citizenMap.get("70000020"),
        FK_emergencyType: emTypeMap.get("INCENDIO_ESTRUCTURAL"),
        priority: "ALTA",
        status: "ASIGNADA",
        description: "Humo denso y llamas saliendo del 2do piso de un depósito comercial en Mercado La Cancha.",
        affectedPersons: 0,
        reportedAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    });

    await prisma.tbemergencylocations.create({
      data: {
        FK_emergency: em2.PK_emergency,
        latitude: -17.4045,
        longitude: -66.1565,
        address: "Calle San Martín y Tarata, Mercado La Cancha",
      },
    });

    await prisma.tbemergencyassignments.create({
      data: {
        FK_emergency: em2.PK_emergency,
        FK_institution: instMap.get("BOMBEROS")!,
        FK_unit: unitMap.get("B-01"),
        status: "ACEPTADA",
        assignedAt: new Date(Date.now() - 8 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    });
  }

  // CASO 3: Emergencia Médica en Plaza 14 de Septiembre (Recién reportada)
  const code3 = "SOS-260829-0003";
  let em3 = await prisma.tbemergencies.findUnique({ where: { emergencyCode: code3 } });
  if (!em3) {
    em3 = await prisma.tbemergencies.create({
      data: {
        emergencyCode: code3,
        FK_citizen: citizenMap.get("70000010"),
        FK_emergencyType: emTypeMap.get("EMERGENCIA_MEDICA"),
        priority: "MEDIA",
        status: "REPORTADA",
        description: "Persona de la tercera edad con desvanecimiento en banca de la plaza.",
        affectedPersons: 1,
        reportedAt: new Date(Date.now() - 2 * 60 * 1000),
      },
    });

    await prisma.tbemergencylocations.create({
      data: {
        FK_emergency: em3.PK_emergency,
        latitude: -17.3935,
        longitude: -66.1570,
        address: "Plaza 14 de Septiembre, acera norte",
      },
    });
  }

  // CASO 4: Emergencia Resuelta (Histórico)
  const code4 = "SOS-260829-0004";
  let em4 = await prisma.tbemergencies.findUnique({ where: { emergencyCode: code4 } });
  if (!em4) {
    em4 = await prisma.tbemergencies.create({
      data: {
        emergencyCode: code4,
        FK_citizen: citizenMap.get("70000020"),
        FK_emergencyType: emTypeMap.get("ROBO_ASALTO"),
        priority: "MEDIA",
        status: "RESUELTA",
        description: "Intento de robo frustrado por patrulla preventiva en Av. América.",
        reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    });

    await prisma.tbemergencylocations.create({
      data: {
        FK_emergency: em4.PK_emergency,
        latitude: -17.3730,
        longitude: -66.1580,
        address: "Av. América y Calle Santa Cruz",
      },
    });
  }

  // 11. NOTIFICACIONES
  console.log("-> Creando notificaciones iniciales...");
  await prisma.tbnotifications.createMany({
    data: [
      {
        FK_user: userMap.get("admin@gamc.bo"),
        title: "Nueva emergencia crítica",
        message: "Accidente múltiple en Av. Blanco Galindo reportado.",
        notificationType: "SYSTEM_ALERT",
        isRead: false,
      },
      {
        FK_citizen: citizenMap.get("70000010"),
        title: "Ayuda en camino",
        message: "La unidad SME AMB-03 ha llegado al lugar del incidente.",
        notificationType: "PUSH",
        isRead: true,
      },
    ],
  });

  console.log("\n========================================================");
  console.log("✅ SEED COMPLETADO EXITOSAMENTE");
  console.log("========================================================");
  console.log("\n🔑 CREDENCIALES DISPONIBLES PARA PRUEBAS:");
  console.log("--------------------------------------------------------");
  console.log("1. Central GAMC Administrador:");
  console.log("   Email:    admin@gamc.bo");
  console.log("   Password: Admin1234");
  console.log("\n2. Central GAMC Operador:");
  console.log("   Email:    operador@gamc.bo");
  console.log("   Password: Oper12345");
  console.log("\n3. Central Despacho:");
  console.log("   Email:    despacho@gamc.bo");
  console.log("   Password: Despacho123");
  console.log("\n4. Institución Bomberos:");
  console.log("   Email:    admin@bomberos.bo");
  console.log("   Password: Inst12345");
  console.log("\n5. Institución Policía:");
  console.log("   Email:    admin@policia.bo");
  console.log("   Password: Inst12345");
  console.log("\n6. Institución Ambulancia (SME):");
  console.log("   Email:    admin@sme.bo");
  console.log("   Password: Inst12345");
  console.log("\n📱 CIUDADANO (PWA / Mobile):");
  console.log("   Teléfono: 70000010");
  console.log("   Password: Ciudadano123");
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error durante la siembra de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
