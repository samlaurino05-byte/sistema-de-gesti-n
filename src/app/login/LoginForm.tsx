"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Calculator, Loader2 } from "lucide-react";
import { authenticate } from "@/app/login/actions";
import { initialLoginState } from "@/app/login/constants";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? "Iniciando sesión..." : "Iniciar sesión"}
    </button>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useActionState(authenticate, initialLoginState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.replace("/dashboard");
      router.refresh();
    }
  }, [state.status, router]);

  const errorMessage = state.status === "error" ? state.error : initialError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600">
            <Calculator className="h-5.5 w-5.5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold tracking-tight text-slate-900">Gestión Contable</p>
            <p className="text-sm text-slate-500">Ingresá con tu cuenta para continuar</p>
          </div>
        </div>

        <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="nombre@estudio.com.ar"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {errorMessage}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
