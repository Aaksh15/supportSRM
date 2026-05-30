export default function Skeleton({ rows = 4 }) {
  return (
    <div className="glass-card space-y-3 p-5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
      ))}
    </div>
  );
}
