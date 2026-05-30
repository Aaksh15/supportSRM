import { Link } from "react-router-dom";

import RiskScoreBadge from "./RiskScoreBadge.jsx";
import SentimentBadge from "./SentimentBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { formatDate } from "../utils/ticketUtils.js";

export default function Customer360({ customer, onClose }) {
  if (!customer) return null;
  const sentimentEntries = Object.entries(customer.sentiment_summary || {});

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">Customer 360</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{customer.customer_name}</h2>
          <p className="text-sm text-slate-400">{customer.customer_email}</p>
        </div>
        <button type="button" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total tickets" value={customer.total_tickets} />
        <Metric label="Open tickets" value={customer.open_tickets} />
        <Metric label="Closed tickets" value={customer.closed_tickets} />
        <Metric label="Last interaction" value={formatDate(customer.last_ticket_date)} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <RiskScoreBadge score={customer.risk_score} />
        {sentimentEntries.map(([sentiment, count]) => (
          <span key={sentiment} className="inline-flex items-center gap-2">
            <SentimentBadge sentiment={sentiment} />
            <span className="text-xs text-slate-500">{count}</span>
          </span>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-white">Ticket history timeline</h3>
        <div className="mt-4 space-y-3">
          {(customer.tickets || []).map((ticket) => (
            <Link key={ticket.ticket_id} to={`/tickets/${ticket.ticket_id}`} className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block font-semibold text-white">{ticket.ticket_id} - {ticket.subject}</span>
                  <span className="text-sm text-slate-500">{formatDate(ticket.created_at)} · {ticket.category}</span>
                </span>
                <StatusBadge status={ticket.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-white">{value}</p>
    </div>
  );
}
