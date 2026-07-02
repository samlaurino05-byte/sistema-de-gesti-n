import { StatusBadge } from "@/components/ui/StatusBadge";
import { hourEntryStatusLabels, type HourEntryStatus } from "@/lib/mock/hours";

const statusVariants: Record<HourEntryStatus, "success" | "warning" | "danger" | "info"> = {
  pendiente: "warning",
  aprobada: "success",
  rechazada: "danger",
  facturada: "info",
};

export function HourStatusBadge({ status }: { status: HourEntryStatus }) {
  return <StatusBadge label={hourEntryStatusLabels[status]} variant={statusVariants[status]} />;
}
