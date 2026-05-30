export default function StatCard({ title, value, icon: Icon, accent, helper }) {
  return (
    <article className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={21} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500">{helper}</p>
    </article>
  );
}
