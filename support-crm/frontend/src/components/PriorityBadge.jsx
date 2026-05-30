const styles = {
  Low: "bg-cyan-400/10 text-cyan-200 ring-cyan-400/30",
  Medium: "bg-violet-400/10 text-violet-200 ring-violet-400/30",
  High: "bg-amber-400/10 text-amber-200 ring-amber-400/30",
  Critical: "bg-rose-400/10 text-rose-200 ring-rose-400/30",
};

export default function PriorityBadge({ priority = "Medium" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[priority] || styles.Medium}`}>
      {priority}
    </span>
  );
}
