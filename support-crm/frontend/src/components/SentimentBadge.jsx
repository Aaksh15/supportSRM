const styles = {
  Positive: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30",
  Neutral: "bg-slate-400/10 text-slate-200 ring-slate-400/30",
  Angry: "bg-rose-400/10 text-rose-200 ring-rose-400/30",
};

export default function SentimentBadge({ sentiment = "Neutral" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[sentiment] || styles.Neutral}`}>
      {sentiment}
    </span>
  );
}
