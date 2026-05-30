import { CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";

export default function ActivityCard({ tickets }) {
  const activeTickets = tickets.filter((ticket) => ticket.status !== "Closed").slice(0, 3);
  const hasTickets = activeTickets.length > 0;
  const items = hasTickets ? activeTickets : [{ ticket_id: "No active tickets", subject: "Create a ticket to start tracking work.", status: "Open" }];

  return (
    <section className="glass-card p-5">
      <div className="flex items-center gap-2">
        <CalendarClock className="text-violet-200" size={20} aria-hidden="true" />
        <h2 className="text-lg font-bold text-white">Upcoming Activities</h2>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const card = (
            <>
              <p className="text-sm font-semibold text-white">{item.ticket_id}</p>
              <p className="mt-1 text-sm text-slate-400">{item.subject}</p>
              <p className="mt-3 text-xs font-semibold text-violet-200">Follow-up queue</p>
            </>
          );

          if (!hasTickets) {
            return (
              <div key={`${item.ticket_id}-${item.subject}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                {card}
              </div>
            );
          }

          return (
            <Link
              key={`${item.ticket_id}-${item.subject}`}
              to={`/tickets/${item.ticket_id}`}
              className="focus-ring block rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-violet-300/40 hover:bg-white/[0.08]"
              aria-label={`Open ${item.ticket_id}`}
            >
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
