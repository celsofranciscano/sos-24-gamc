import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { CITIZEN_PUBLIC_ROUTES, authConfig } from "@/lib/auth/config";

const INSTITUTION_HOME = "/dashboard";
const CITIZEN_HOME = "/citizen";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const path = nextUrl.pathname;
  const role = session?.user?.role;

  const isCitizenPublic = CITIZEN_PUBLIC_ROUTES.some((route) =>
    path.startsWith(route),
  );

  const redirectTo = (pathname: string) =>
    NextResponse.redirect(new URL(pathname, nextUrl));

  if (path.startsWith("/dashboard")) {
    if (role === "INSTITUTION") return NextResponse.next();
    if (role === "CITIZEN") return redirectTo(CITIZEN_HOME);
    return redirectTo("/login");
  }

  if (path.startsWith("/citizen")) {
    if (isCitizenPublic) {
      if (role === "CITIZEN") return redirectTo(CITIZEN_HOME);
      if (role === "INSTITUTION") return redirectTo(INSTITUTION_HOME);
      return NextResponse.next();
    }
    if (role === "CITIZEN") return NextResponse.next();
    return redirectTo("/citizen/login");
  }

  if (path === "/login" && role) {
    return redirectTo(role === "INSTITUTION" ? INSTITUTION_HOME : CITIZEN_HOME);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/citizen/:path*"],
};
