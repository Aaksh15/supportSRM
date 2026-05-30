const rows = [
  { label: "Open", color: "bg-emerald-400", key: "Open" },
  { label: "In Progress", color: "bg-sky-400", key: "In Progress" },
  { label: "Closed", color: "bg-slate-400", key: "Closed" },
];

export default function TicketOverview({ counts }) {
  const total = Math.max(counts.total, 1);

  return (
    <section className="glass-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Tickets Overview</h2>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-400">Live</span>
      </div>
      <div className="mt-6 flex justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#34d399_0_35%,#38bdf8_35%_70%,#94a3b8_70%_100%)]">
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-slate-950">
            <span className="text-3xl font-bold text-white">{counts.total}</span>
            <span className="text-xs text-slate-500">tickets</span>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {rows.map((row) => {
          const value = counts[row.key] || 0;
          return (
            <div key={row.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                  {row.label}
                </span>
                <span className="font-semibold text-white">{value}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
                <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${Math.round((value / total) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
