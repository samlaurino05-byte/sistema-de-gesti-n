import type { PaymentListItem } from "@/lib/data/payments";
import { paymentMethodLabels } from "@/lib/paymentMethods";
import { formatCurrency, formatDate } from "@/lib/utils";

// Presentación pura: recibe el historial ya resuelto por
// getPaymentsForInvoice (src/lib/data/payments.ts) y solo lo muestra. No
// recalcula saldo ni estado — esos valores siguen viniendo únicamente de
// src/lib/data/invoices.ts.
export function PaymentHistoryTable({ payments }: { payments: PaymentListItem[] }) {
  if (payments.length === 0) {
    return (
      <p className="p-5 pt-0 text-sm text-slate-500 sm:p-6 sm:pt-0">
        Todavía no se registraron pagos para esta factura.
      </p>
    );
  }

  // getPaymentsForInvoice ordena por fecha ascendente (criterio
  // cronológico de la capa de datos, ver el comentario en ese archivo);
  // acá se invierte solo para la presentación (más reciente primero), sin
  // tocar ni recalcular ningún valor.
  const mostRecentFirst = [...payments].reverse();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="px-5 py-2.5 sm:px-6">Fecha</th>
            <th className="px-5 py-2.5 sm:px-6">Importe</th>
            <th className="px-5 py-2.5 sm:px-6">Medio de pago</th>
            <th className="px-5 py-2.5 sm:px-6">Notas</th>
          </tr>
        </thead>
        <tbody>
          {mostRecentFirst.map((payment) => (
            <tr key={payment.id} className="border-b border-slate-100 last:border-0">
              <td className="px-5 py-3 text-slate-700 sm:px-6">{formatDate(payment.fecha)}</td>
              <td className="px-5 py-3 font-medium text-slate-900 sm:px-6">{formatCurrency(payment.monto)}</td>
              <td className="px-5 py-3 text-slate-700 sm:px-6">{paymentMethodLabels[payment.medioPago]}</td>
              <td className="px-5 py-3 text-slate-500 sm:px-6">{payment.notas ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
