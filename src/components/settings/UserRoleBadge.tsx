import { StatusBadge } from "@/components/ui/StatusBadge";
import { userRoleLabels, type UserRole } from "@/lib/mock/settings";

const roleVariants: Record<UserRole, "success" | "warning" | "danger" | "info" | "neutral"> = {
  administrador: "info",
  supervisor: "warning",
  contador: "success",
  colaborador: "neutral",
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <StatusBadge label={userRoleLabels[role]} variant={roleVariants[role]} />;
}
