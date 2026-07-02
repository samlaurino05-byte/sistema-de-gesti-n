import { StatusBadge } from "@/components/ui/StatusBadge";
import { statusLabels, type ClientStatus } from "@/lib/mock/clients";

const statusVariants: Record<ClientStatus, "success" | "warning" | "danger" | "neutral"> = {
  activo: "success",
  mora: "danger",
  pausado: "warning",
  inactivo: "neutral",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return <StatusBadge label={statusLabels[status]} variant={statusVariants[status]} />;
}
