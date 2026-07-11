import { redirect } from "next/navigation";
import { Calculator, Building2 } from "lucide-react";
import { getSessionState } from "@/lib/auth/session";
import { selectOrganization } from "@/app/select-organization/actions";

export default async function SelectOrganizationPage() {
  const state = await getSessionState();

  if (state.status === "active") redirect("/dashboard");
  if (state.status === "unauthenticated") redirect("/login");
  if (state.status === "noOrganization") redirect("/login?error=no-organization");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600">
            <Calculator className="h-5.5 w-5.5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold tracking-tight text-slate-900">Gestión Contable</p>
            <p className="text-sm text-slate-500">Elegí con qué organización querés trabajar</p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {state.organizations.map((org) => (
            <form key={org.id} action={selectOrganization.bind(null, org.id)}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                <Building2 className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                {org.nombre}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
