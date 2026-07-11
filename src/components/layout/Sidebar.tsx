"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Lock, X } from "lucide-react";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useActiveSession } from "@/components/layout/active-session-context";

function initialsFrom(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const session = useActiveSession();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Calculator className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          Gestión Contable
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menú principal
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="group flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-400"
                title="Próximamente"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </span>
                <Lock className="h-3.5 w-3.5 text-slate-300" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {initialsFrom(session.nombre)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-900">{session.nombre}</p>
            <p className="truncate text-[11px] text-slate-400">{session.organizationNombre}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const { isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isMobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-slate-900/40 transition-opacity",
            isMobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobile}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl transition-transform duration-200",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Cerrar menú"
            className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
          <SidebarContent onNavigate={closeMobile} />
        </aside>
      </div>
    </>
  );
}
