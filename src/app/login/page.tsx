import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/auth/session";
import { LoginForm } from "@/app/login/LoginForm";

const ERROR_MESSAGES: Record<string, string> = {
  "no-organization": "Tu cuenta no tiene ninguna organización activa asignada. Contactá a un administrador.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const state = await getSessionState();

  if (state.status === "active") redirect("/dashboard");
  if (state.status === "needsOrganization") redirect("/select-organization");

  const { error } = await searchParams;
  const initialError = error ? ERROR_MESSAGES[error] : undefined;

  return <LoginForm initialError={initialError} />;
}
