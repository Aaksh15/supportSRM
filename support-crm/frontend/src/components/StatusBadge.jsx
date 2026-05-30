const badgeStyles = {
  Open: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30",
  "In Progress": "bg-sky-400/10 text-sky-200 ring-sky-400/30",
  Closed: "bg-slate-400/10 text-slate-200 ring-slate-400/30",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex min-w-24 justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        badgeStyles[status] || "bg-slate-400/10 text-slate-200 ring-slate-400/30"
      }`}
    >
      {status}
    </span>
  );
}
