import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  // En producción, crea una nueva instancia de PrismaClient
  prisma = new PrismaClient();
} else {
  // En desarrollo, verifica si ya hay una instancia de PrismaClient en el objeto global
  if (!global.prisma) {
    // Si no hay una instancia, crea una nueva y asígnala al objeto global
    global.prisma = new PrismaClient();
  }
  // Usa la instancia existente del objeto global
  prisma = global.prisma;
}

export default prisma;
