import { Building2, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { studioProfile } from "@/lib/mock/settings";
import { formatDate } from "@/lib/utils";

export function StudioProfileCard() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-semibold text-white">
            {studioProfile.logoInitials}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">{studioProfile.nombre}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              {studioProfile.razonSocial} · CUIT {studioProfile.cuit}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          title="Próximamente"
          className="flex shrink-0 cursor-not-allowed items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-400 sm:self-center"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Mail className="h-3.5 w-3.5" /> Email
          </dt>
          <dd className="mt-0.5 truncate text-sm text-slate-800">{studioProfile.email}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Phone className="h-3.5 w-3.5" /> Teléfono
          </dt>
          <dd className="mt-0.5 text-sm text-slate-800">{studioProfile.telefono}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> Dirección
          </dt>
          <dd className="mt-0.5 text-sm text-slate-800">{studioProfile.direccion}</dd>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-slate-400">Localidad</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{studioProfile.localidad}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-400">Provincia</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{studioProfile.provincia}</dd>
          </div>
        </div>
      </dl>

      <p className="mt-5 text-[11px] text-slate-400">
        Última actualización de estos datos: {formatDate("2026-01-05")}. Los cambios se habilitarán cuando el módulo
        se conecte a datos reales.
      </p>
    </section>
  );
}
