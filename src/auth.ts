import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { authConfig } from "@/lib/auth/config";
import prisma from "@/lib/db/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "institution",
      name: "Institución / GAMC",
      credentials: {
        email: { label: "Correo institucional", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          throw new Error("Debe proporcionar correo y contraseña.");
        }

        const user = await prisma.tbusers.findUnique({
          where: { email },
          include: {
            tbprivileges: true,
            tbinstitutions: { select: { PK_institution: true, name: true } },
            tbsubinstitutions: { select: { PK_subinstitution: true } },
          },
        });

        if (!user || !user.status) {
          throw new Error("El usuario no existe o se encuentra inactivo.");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Contraseña incorrecta.");
        }

        return {
          id: user.PK_user.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: "INSTITUTION",
          privilegeCode: user.tbprivileges.privilegeCode,
          privilegeName: user.tbprivileges.privilege,
          institutionId: user.FK_institution ?? null,
          subinstitutionId: user.FK_subinstitution ?? null,
        };
      },
    }),
    Credentials({
      id: "citizen",
      name: "Ciudadano",
      credentials: {
        phoneNumber: { label: "Número de teléfono", type: "tel" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const phoneNumber = credentials?.phoneNumber;
        const password = credentials?.password;

        if (
          typeof phoneNumber !== "string" ||
          typeof password !== "string"
        ) {
          throw new Error("Debe proporcionar teléfono y contraseña.");
        }

        const citizen = await prisma.tbcitizens.findUnique({
          where: { phoneNumber },
        });

        if (!citizen || !citizen.status || !citizen.password) {
          throw new Error("La cuenta no existe o se encuentra inactiva.");
        }

        const isValid = await bcrypt.compare(password, citizen.password);

        if (!isValid) {
          throw new Error("Contraseña incorrecta.");
        }

        return {
          id: citizen.PK_citizen.toString(),
          firstName: citizen.firstName,
          lastName: citizen.lastName,
          email: citizen.email ?? null,
          phoneNumber: citizen.phoneNumber,
          role: "CITIZEN",
        };
      },
    }),
  ],
});
