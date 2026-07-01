import { Bell } from "lucide-react";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
            U
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-slate-900">Usuario</p>
            <p className="text-xs text-slate-500">Sin sesión iniciada</p>
          </div>
        </div>
      </div>
    </header>
  );
}
