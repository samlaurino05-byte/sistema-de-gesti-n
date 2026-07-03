"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { clients } from "@/lib/mock/clients";
import { getHourEntryMetrics, getHoursForClient } from "@/lib/mock/hours";
import { calculateInvoiceAmounts } from "@/lib/mock/invoices";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export function NewInvoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [selectedHourIds, setSelectedHourIds] = useState<string[]>([]);

  const availableHours = useMemo(
    () => getHoursForClient(clientId).filter((entry) => entry.estado === "aprobada"),
    [clientId]
  );

  function handleClientChange(nextClientId: string) {
    setClientId(nextClientId);
    setSelectedHourIds([]);
  }

  function toggleHour(entryId: string) {
    setSelectedHourIds((current) =>
      current.includes(entryId) ? current.filter((id) => id !== entryId) : [...current, entryId]
    );
  }

  const { subtotal, margen } = useMemo(() => {
    const selectedEntries = availableHours.filter((entry) => selectedHourIds.includes(entry.id));
    return selectedEntries.reduce(
      (acc, entry) => {
        const metrics = getHourEntryMetrics(entry);
        acc.subtotal += metrics.facturacion;
        acc.margen += metrics.margen;
        return acc;
      },
      { subtotal: 0, margen: 0 }
    );
  }, [availableHours, selectedHourIds]);

  const { iva, total } = calculateInvoiceAmounts(subtotal);
  const margenPct = subtotal > 0 ? (margen / subtotal) * 100 : 0;

  function handleClose() {
    setIsOpen(false);
    setSelectedHourIds([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Nueva factura
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={handleClose} />
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Nueva factura</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Seleccioná un cliente y las horas aprobadas a incluir — cálculo en vivo
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-medium text-slate-600">
              Cliente
              <select
                value={clientId}
                onChange={(event) => handleClientChange(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nombreComercial}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-600">Horas aprobadas disponibles</p>
              {availableHours.length > 0 ? (
                <div className="mt-2 max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                  {availableHours.map((entry) => (
                    <label
                      key={entry.id}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHourIds.includes(entry.id)}
                        onChange={() => toggleHour(entry.id)}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">{entry.proyecto}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(entry.fecha)} · {entry.horas} h
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-600">
                        {formatCurrency(entry.horas * entry.valorHoraCliente)}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  No hay horas aprobadas pendientes de facturar para este cliente.
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-indigo-50 p-3 ring-1 ring-inset ring-indigo-100 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-medium text-indigo-400">Subtotal</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-900">{formatCurrency(subtotal)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-indigo-400">IVA (21%)</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-900">{formatCurrency(iva)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-indigo-400">Total</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-900">{formatCurrency(total)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-indigo-400">Margen estimado</p>
                <p className={cn("mt-0.5 text-sm font-semibold", margen >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {formatCurrency(margen)} ({margenPct.toFixed(0)}%)
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 ring-1 ring-inset ring-slate-100">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
              Vista previa mock — la emisión real de comprobantes se habilitará cuando el módulo se conecte a datos reales.
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedHourIds.length === 0}
                onClick={handleClose}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                Crear factura
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
