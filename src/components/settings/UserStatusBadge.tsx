import { StatusBadge } from "@/components/ui/StatusBadge";
import { userStatusLabels, type UserStatus } from "@/lib/mock/settings";

const statusVariants: Record<UserStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  activo: "success",
  invitacion_pendiente: "warning",
  inactivo: "neutral",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <StatusBadge label={userStatusLabels[status]} variant={statusVariants[status]} />;
}
