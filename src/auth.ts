import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "ejemplo@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Debe proporcionar un email y una contraseña.");
        }

        // Buscar usuario en la base de datos
        const existingUser = await prisma.tbusers.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) {
          throw new Error("El usuario no existe.");
        }

        // Comparar contraseñas
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          existingUser.password,
        );
        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta.");
        }

        // Obtener el privilegio
        const userPrivilege = await prisma.tbprivileges.findUnique({
          where: { PK_privilege: existingUser.FK_privilege },
        });

        return {
          id: existingUser.PK_user?.toString() || "",
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          privilege: userPrivilege?.privilege,
          privilegeCode: userPrivilege?.privilegeCode,
          line: existingUser.line,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          privilege: user.privilege,
          privilegeCode: user.privilegeCode, // <-- aquí guardamos el privilegeCode
          line: user.line,
        };
        token.privilege = user.privilege;
        token.privilegeCode = user.privilegeCode;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      session.privilege = token.privilege;
      session.privilegeCode = token.privilegeCode; // <-- disponible en session
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
