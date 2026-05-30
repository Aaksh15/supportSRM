import { riskTone } from "../utils/ticketUtils.js";

const styles = {
  Low: "bg-cyan-400/10 text-cyan-200 ring-cyan-400/30",
  Medium: "bg-amber-400/10 text-amber-200 ring-amber-400/30",
  High: "bg-orange-400/10 text-orange-200 ring-orange-400/30",
  Critical: "bg-rose-400/10 text-rose-200 ring-rose-400/30",
};

export default function RiskScoreBadge({ score = 0 }) {
  const tone = riskTone(score);
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${styles[tone]}`}>{score}/100 {tone}</span>;
}
