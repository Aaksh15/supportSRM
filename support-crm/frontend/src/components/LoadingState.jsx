export default function LoadingState({ label = "Loading tickets..." }) {
  return (
    <div className="glass-card flex items-center justify-center py-16 text-slate-300">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      <span className="ml-3 text-sm font-medium">{label}</span>
    </div>
  );
}
