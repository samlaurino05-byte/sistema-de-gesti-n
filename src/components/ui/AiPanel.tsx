import { Sparkles, Send } from "lucide-react";

type AiSuggestion = {
  text: string;
};

export function AiPanel({ suggestions }: { suggestions: AiSuggestion[] }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Asistente IA</h2>
          <p className="text-xs text-slate-500">Sugerencias basadas en la actividad reciente</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="flex items-start gap-2 rounded-lg bg-white/70 p-3 text-sm text-slate-700 ring-1 ring-inset ring-indigo-100"
          >
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
            {suggestion.text}
          </li>
        ))}
      </ul>

      <div
        className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-indigo-200 bg-white/60 px-3 py-2.5 text-sm text-slate-400"
        title="Próximamente"
      >
        <span className="flex-1 truncate">Preguntale algo a tu asistente contable...</span>
        <button
          type="button"
          disabled
          className="flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-md bg-slate-100 text-slate-300"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] font-medium text-indigo-400">Próximamente</p>
    </div>
  );
}
