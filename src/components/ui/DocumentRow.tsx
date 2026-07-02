import { FileText } from "lucide-react";

export type DocumentItem = {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
};

export function DocumentRow({ document }: { document: DocumentItem }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{document.name}</p>
        <p className="truncate text-xs text-slate-500">
          {document.type} · {document.size} · {document.date}
        </p>
      </div>
      <span className="shrink-0 cursor-not-allowed text-xs font-semibold text-slate-300" title="Próximamente">
        Ver
      </span>
    </div>
  );
}
