export default function Toast({ message, type = "success" }) {
  if (!message) return null;

  const styles = type === "error" ? "border-red-400/30 bg-red-500/15 text-red-100" : "border-emerald-400/30 bg-emerald-500/15 text-emerald-100";

  return (
    <div className={`fixed right-4 top-24 z-50 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl shadow-slate-950/30 ${styles}`}>
      {message}
    </div>
  );
}
