import type { NextAuthConfig } from "next-auth";

export const CITIZEN_PUBLIC_ROUTES = [
  "/citizen/login",
  "/citizen/register",
  "/citizen/forgot-password",
  "/citizen/verify",
];

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email ?? null,
          phoneNumber: user.phoneNumber ?? null,
          role: user.role,
          privilegeCode: user.privilegeCode ?? null,
          privilegeName: user.privilegeName ?? null,
          institutionId: user.institutionId ?? null,
          subinstitutionId: user.subinstitutionId ?? null,
        };
      }
      return token;
    },
    session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
        } as typeof session.user;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
