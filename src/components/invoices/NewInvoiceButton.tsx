"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { emitInvoiceAction } from "@/app/(app)/invoices/actions";
import { initialEmitInvoiceState } from "@/app/(app)/invoices/constants";
import type { Client } from "@/lib/mock/clients";
import { getHourEntryMetrics, type HourEntry } from "@/lib/mock/hours";
import { calculateInvoiceAmounts } from "@/lib/mock/invoices";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type NewInvoiceButtonProps = {
  clients: Client[];
  // Ya vienen filtradas a estado "aprobada" por
  // getBillableHourEntriesForOrganization (src/lib/data/invoices.ts) — acá
  // solo se filtra por cliente seleccionado, una elección de presentación,
  // no una regla de negocio nueva.
  hourEntries: HourEntry[];
};

export function NewInvoiceButton({ clients, hourEntries }: NewInvoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Montada solo mientras isOpen: cerrar y reabrir el modal descarta
          por completo el estado del formulario (selección, useActionState),
          así que un intento anterior (con o sin error) nunca se filtra al
          siguiente. */}
      {isOpen && <NewInvoiceModal clients={clients} hourEntries={hourEntries} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? "Emitiendo..." : "Crear factura"}
    </button>
  );
}

function NewInvoiceModal({
  clients,
  hourEntries,
  onClose,
}: {
  clients: Client[];
  hourEntries: HourEntry[];
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(emitInvoiceAction, initialEmitInvoiceState);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [selectedHourIds, setSelectedHourIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onClose();
    }
  }, [state.status, router, onClose]);

  const availableHours = useMemo(
    () => hourEntries.filter((entry) => entry.clientId === clientId),
    [hourEntries, clientId]
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

  // Preview client-side, solo informativo — la factura real se calcula
  // server-side desde cero a partir de las HourEntry ya validadas
  // (ver emitInvoiceFromApprovedHours en src/lib/data/invoices.ts). Ningún
  // monto de acá viaja al servidor: el <form> solo manda clientSlug y
  // hourEntryIds.
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
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
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="contents">
          <label className="mt-4 block text-xs font-medium text-slate-600">
            Cliente
            <select
              name="clientSlug"
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
                      name="hourEntryIds"
                      value={entry.id}
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

          {state.status === "error" && (
            <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {state.error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <SubmitButton disabled={selectedHourIds.length === 0} />
          </div>
        </form>
      </div>
    </div>
  );
}
