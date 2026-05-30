export default function MessageState({ title, message, variant = "empty" }) {
  const styles =
    variant === "error"
      ? "border-red-400/30 bg-red-500/10 text-red-100"
      : "border-white/10 bg-white/[0.06] text-slate-200";

  return (
    <div className={`rounded-2xl border px-6 py-12 text-center shadow-2xl shadow-slate-950/20 ${styles}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm opacity-80">{message}</p>
    </div>
  );
}
