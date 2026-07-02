"use client";

import { useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";

export function NewClientButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo cliente
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Alta de cliente</h2>
                <p className="mt-0.5 text-xs text-slate-500">Formulario de ejemplo — módulo con datos mock</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-600">
                Razón social
                <input
                  type="text"
                  disabled
                  placeholder="Ej: Nueva Empresa SRL"
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 placeholder:text-slate-300"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                CUIT
                <input
                  type="text"
                  disabled
                  placeholder="30-00000000-0"
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 placeholder:text-slate-300"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Responsable interno
                <input
                  type="text"
                  disabled
                  placeholder="Ej: Marina López"
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 placeholder:text-slate-300"
                />
              </label>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-100">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Este formulario es una vista previa visual. La creación de clientes se habilitará cuando el módulo se conecte a datos reales.
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Crear cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
