import { StatusBadge } from "@/components/ui/StatusBadge";
import { invoiceStatusLabels, type InvoiceStatus } from "@/lib/mock/invoices";

const statusVariants: Record<InvoiceStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  borrador: "neutral",
  emitida: "info",
  parcial: "warning",
  pagada: "success",
  vencida: "danger",
  anulada: "neutral",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <StatusBadge label={invoiceStatusLabels[status]} variant={statusVariants[status]} />;
}
