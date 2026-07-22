"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Banknote, Loader2, X } from "lucide-react";
import { registerPaymentAction } from "@/app/(app)/invoices/actions";
import { initialRegisterPaymentState } from "@/app/(app)/invoices/constants";
import { paymentMethodLabels, paymentMethodOrder } from "@/lib/paymentMethods";
import { PaymentMethod } from "@/generated/prisma/enums";
import { formatCurrency } from "@/lib/utils";

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

type RegisterPaymentButtonProps = {
  invoiceSlug: string;
  // Solo para mostrar contexto en el modal y deshabilitar el botón cuando
  // ya no queda nada por cobrar (dato ya resuelto por
  // src/lib/data/invoices.ts) — nunca viaja al servidor como parte del
  // <form>. El servidor vuelve a calcular el saldo desde cero dentro de la
  // transacción de registerPayment.
  saldoPendiente: number;
};

export function RegisterPaymentButton({ invoiceSlug, saldoPendiente }: RegisterPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // El modal se cierra apenas confirma éxito (criterio del sprint), así que
  // el mensaje de éxito se muestra acá, en el elemento que sigue montado.
  // Se limpia solo a los pocos segundos — no requiere acción del usuario.
  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={saldoPendiente <= 0}
        title={saldoPendiente <= 0 ? "Esta factura ya está saldada" : undefined}
        className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        <Banknote className="h-4 w-4" />
        Registrar pago
      </button>

      {successMessage && <p className="text-xs font-medium text-emerald-600">{successMessage}</p>}

      {/* Montado solo mientras isOpen: igual criterio que NewInvoiceModal —
          cerrar y reabrir descarta el estado del formulario por completo, así
          que un intento anterior (con o sin error) nunca se filtra al
          siguiente. */}
      {isOpen && (
        <RegisterPaymentModal
          invoiceSlug={invoiceSlug}
          saldoPendiente={saldoPendiente}
          onClose={() => setIsOpen(false)}
          onSuccess={() => setSuccessMessage("Pago registrado correctamente.")}
        />
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? "Registrando..." : "Registrar pago"}
    </button>
  );
}

function RegisterPaymentModal({
  invoiceSlug,
  saldoPendiente,
  onClose,
  onSuccess,
}: {
  invoiceSlug: string;
  saldoPendiente: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(registerPaymentAction, initialRegisterPaymentState);
  const router = useRouter();

  // React resetea los <form> no controlados apenas la Server Action
  // resuelve — incluso en error (mismo comportamiento que un <form> nativo
  // al enviarse). Estos cuatro campos son controlados a propósito para que
  // un error nunca borre lo que el usuario ya cargó (requisito explícito
  // del sprint); NewInvoiceButton no lo necesita porque sus campos
  // relevantes (cliente, horas) ya eran controlados por otra razón.
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(todayDateString());
  const [medioPago, setMedioPago] = useState<PaymentMethod>(PaymentMethod.TRANSFERENCIA);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onSuccess();
      onClose();
    }
  }, [state.status, router, onClose, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Registrar pago</h2>
            <p className="mt-0.5 text-xs text-slate-500">Saldo pendiente actual: {formatCurrency(saldoPendiente)}</p>
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
          <input type="hidden" name="invoiceSlug" value={invoiceSlug} />

          <label className="mt-4 block text-xs font-medium text-slate-600">
            Importe
            <input
              type="number"
              name="monto"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={monto}
              onChange={(event) => setMonto(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
            />
          </label>

          <label className="mt-4 block text-xs font-medium text-slate-600">
            Fecha de pago
            <input
              type="date"
              name="fecha"
              required
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
            />
          </label>

          <label className="mt-4 block text-xs font-medium text-slate-600">
            Medio de pago
            <select
              name="medioPago"
              required
              value={medioPago}
              onChange={(event) => setMedioPago(event.target.value as PaymentMethod)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
            >
              {paymentMethodOrder.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabels[method]}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-xs font-medium text-slate-600">
            Notas (opcional)
            <textarea
              name="notas"
              rows={2}
              placeholder="Ej: transferencia recibida desde cuenta terminada en 4521"
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
            />
          </label>

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
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
