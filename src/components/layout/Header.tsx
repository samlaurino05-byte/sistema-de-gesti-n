"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useActiveSession } from "@/components/layout/active-session-context";

function initialsFrom(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  SUPERVISOR: "Supervisor",
  CONTADOR: "Contador",
  COLABORADOR: "Colaborador",
};

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { openMobile } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, startSignOutTransition] = useTransition();
  const session = useActiveSession();

  function handleSignOut() {
    startSignOutTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={openMobile}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="hidden flex-1 justify-center px-4 md:flex">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition-colors focus-within:border-indigo-300 focus-within:bg-white">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Buscar clientes, comprobantes...</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Notificaciones"
          title="Próximamente"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </button>

        <div className="h-6 w-px bg-slate-200 max-sm:hidden" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {initialsFrom(session.nombre)}
            </div>
            <div className="hidden text-left text-sm sm:block">
              <p className="font-medium leading-tight text-slate-900">{session.nombre}</p>
              <p className="text-xs leading-tight text-slate-400">
                {ROLE_LABELS[session.roleNombre] ?? session.roleNombre} · {session.organizationNombre}
              </p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
              >
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-medium text-slate-900">{session.nombre}</p>
                  <p className="truncate text-xs text-slate-400">{session.email}</p>
                </div>
                <div className="my-1 h-px bg-slate-100" />
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Configuración
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4 text-slate-400" />
                  {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
