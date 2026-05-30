import { BrainCircuit } from "lucide-react";

export default function AIInsightCard({ title, value, detail }) {
  return (
    <article className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4">
      <div className="flex items-center gap-2 text-violet-100">
        <BrainCircuit size={16} aria-hidden="true" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
    </article>
  );
}
