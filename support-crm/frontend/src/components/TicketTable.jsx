import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

import PriorityBadge from "./PriorityBadge.jsx";
import SentimentBadge from "./SentimentBadge.jsx";
import SlaBadge from "./SlaBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TicketTable({ tickets }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
            {["Ticket ID", "Customer", "Subject", "Priority", "Sentiment", "SLA", "Status", "Created At", "Actions"].map((heading) => (
              <th key={heading} className="px-5 py-4 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id} className="text-sm text-slate-300 transition hover:bg-white/[0.04]">
              <td className="whitespace-nowrap px-5 py-4 font-bold text-white">{ticket.ticket_id}</td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="block font-semibold text-slate-100">{ticket.customer_name}</span>
                <span className="block text-xs text-slate-500">{ticket.customer_email}</span>
              </td>
              <td className="min-w-72 px-5 py-4">{ticket.subject}</td>
              <td className="whitespace-nowrap px-5 py-4">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <SentimentBadge sentiment={ticket.sentiment} />
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <SlaBadge ticket={ticket} />
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-400">{formatDate(ticket.created_at)}</td>
              <td className="whitespace-nowrap px-5 py-4">
                <Link
                  to={`/tickets/${ticket.ticket_id}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400/40 hover:text-white"
                >
                  <Eye size={16} aria-hidden="true" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
