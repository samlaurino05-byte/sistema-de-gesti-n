import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { collectionStatusLabels, type CollectionStatus } from "@/lib/mock/collections";

const statusVariants: Record<CollectionStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  "al-dia": "success",
  "por-vencer": "warning",
  vencida: "danger",
  critica: "danger",
  "en-seguimiento": "info",
};

export function CollectionStatusBadge({ status }: { status: CollectionStatus }) {
  if (status === "critica") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-semibold text-white">
        <AlertTriangle className="h-3 w-3" />
        {collectionStatusLabels[status]}
      </span>
    );
  }

  return <StatusBadge label={collectionStatusLabels[status]} variant={statusVariants[status]} />;
}
