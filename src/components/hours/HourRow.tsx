import Link from "next/link";
import { HourStatusBadge } from "@/components/hours/HourStatusBadge";
import { getClientById } from "@/lib/mock/clients";
import { getEmployeeById } from "@/lib/mock/employees";
import { getHourEntryMetrics, type HourEntry } from "@/lib/mock/hours";
import { getInvoiceById } from "@/lib/mock/invoices";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type HourRowProps = {
  entry: HourEntry;
  showEmployee?: boolean;
  showClient?: boolean;
};

export function HourRow({ entry, showEmployee = true, showClient = true }: HourRowProps) {
  const employee = getEmployeeById(entry.employeeId);
  const client = getClientById(entry.clientId);
  const invoice = entry.invoiceId ? getInvoiceById(entry.invoiceId) : undefined;
  const { costo, facturacion, margen } = getHourEntryMetrics(entry);

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatDate(entry.fecha)}</td>
      {showEmployee && (
        <td className="whitespace-nowrap px-4 py-3 text-sm">
          {employee ? (
            <Link href={`/employees/${employee.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
              {employee.nombre}
            </Link>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
      )}
      {showClient && (
        <td className="whitespace-nowrap px-4 py-3 text-sm">
          {client ? (
            <Link href={`/clients/${client.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
              {client.nombreComercial}
            </Link>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
      )}
      <td className="px-4 py-3 text-sm text-slate-600">{entry.proyecto}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{entry.horas} h</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatCurrency(entry.valorHoraInterno)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatCurrency(entry.valorHoraCliente)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatCurrency(costo)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatCurrency(facturacion)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <span className={cn("font-medium", margen >= 0 ? "text-emerald-600" : "text-rose-600")}>
          {formatCurrency(margen)}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <HourStatusBadge status={entry.estado} />
        {invoice && (
          <Link
            href={`/invoices/${invoice.id}`}
            className="mt-1 block text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
          >
            {invoice.numero}
          </Link>
        )}
      </td>
    </tr>
  );
}
