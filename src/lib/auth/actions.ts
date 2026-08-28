"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";

export type LoginState = { error?: string };

export async function institutionLoginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("institution", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const message = error.cause?.message;
      return {
        error:
          typeof message === "string"
            ? message
            : "No se pudo iniciar sesión. Verifique sus credenciales.",
      };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function citizenLoginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("citizen", {
      phoneNumber: formData.get("phoneNumber"),
      password: formData.get("password"),
      redirectTo: "/citizen",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const message = error.cause?.message;
      return {
        error:
          typeof message === "string"
            ? message
            : "No se pudo iniciar sesión. Verifique sus credenciales.",
      };
    }
    throw error;
  }

  redirect("/citizen");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
