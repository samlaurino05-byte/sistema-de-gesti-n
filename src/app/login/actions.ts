"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import type { LoginState } from "@/app/login/constants";

export async function authenticate(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { status: "error", error: "Completá email y contraseña." };
  }

  try {
    // redirect: false porque queremos decidir el destino nosotros (la
    // capa de sesión resuelve si hace falta elegir organización) en vez de
    // depender del redirect automático de Auth.js.
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", error: "Email o contraseña incorrectos." };
    }
    throw error;
  }

  return { status: "success" };
}
