import type { DefaultSession } from "next-auth";

export type UserRole = "INSTITUTION" | "CITIZEN";

declare module "next-auth" {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phoneNumber?: string | null;
    role: UserRole;
    privilegeCode?: string | null;
    privilegeName?: string | null;
    institutionId?: number | null;
    subinstitutionId?: number | null;
  }

  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string | null;
      phoneNumber?: string | null;
      role: UserRole;
      privilegeCode?: string | null;
      privilegeName?: string | null;
      institutionId?: number | null;
      subinstitutionId?: number | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string | null;
      phoneNumber?: string | null;
      role: UserRole;
      privilegeCode?: string | null;
      privilegeName?: string | null;
      institutionId?: number | null;
      subinstitutionId?: number | null;
    };
  }
}
