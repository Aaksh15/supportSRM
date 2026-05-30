import { getSlaLabel } from "../utils/ticketUtils.js";

export default function SlaBadge({ ticket }) {
  const label = getSlaLabel(ticket);
  const style = label.includes("Breached") || label.includes("after")
    ? "bg-rose-400/10 text-rose-200 ring-rose-400/30"
    : label.includes("Resolved")
      ? "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30"
      : "bg-amber-400/10 text-amber-200 ring-amber-400/30";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}>{label}</span>;
}
