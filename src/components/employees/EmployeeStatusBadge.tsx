import { StatusBadge } from "@/components/ui/StatusBadge";
import { employeeStatusLabels, type EmployeeStatus } from "@/lib/mock/employees";

const statusVariants: Record<EmployeeStatus, "success" | "warning" | "danger" | "neutral"> = {
  activo: "success",
  vacaciones: "warning",
  licencia: "warning",
  inactivo: "neutral",
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <StatusBadge label={employeeStatusLabels[status]} variant={statusVariants[status]} />;
}
