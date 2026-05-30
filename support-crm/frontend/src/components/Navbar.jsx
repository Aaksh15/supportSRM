import { Bell, Menu, Search, ShieldCheck, UserCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getTickets } from "../services/api.js";

export default function Navbar({ onMenuClick }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  function updateSearch(value) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set("q", value);
    else nextParams.delete("q");
    setSearchParams(nextParams);
    setOpen(Boolean(value));
  }

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const data = await getTickets({ search: query, signal: controller.signal });
        setResults(data.slice(0, 6));
      } catch {
        setResults([]);
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function goToTicket(ticketId) {
    setOpen(false);
    navigate(`/tickets/${ticketId}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button className="focus-ring rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden" type="button" aria-label="Open menu" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="relative min-w-0 flex-1">
          <label>
          <span className="sr-only">Search tickets</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            className="focus-ring w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500"
            placeholder="Search tickets, customers, subjects..."
            value={query}
            onChange={(event) => updateSearch(event.target.value)}
            onFocus={() => setOpen(Boolean(query))}
          />
          </label>
          {open && query && (
            <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/50">
              {results.length === 0 ? (
                <p className="px-4 py-4 text-sm text-slate-400">No matching tickets or customers.</p>
              ) : (
                results.map((ticket) => (
                  <button
                    key={ticket.ticket_id}
                    type="button"
                    className="block w-full border-b border-white/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.06]"
                    onClick={() => goToTicket(ticket.ticket_id)}
                  >
                    <span className="block text-sm font-semibold text-white">{ticket.ticket_id} - {ticket.subject}</span>
                    <span className="block text-xs text-slate-500">{ticket.customer_name} · {ticket.customer_email}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <Link
          to="/tickets/new"
          className="focus-ring hidden rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-400 hover:to-sky-400 sm:inline-flex"
        >
          New Ticket
        </Link>
        <button className="focus-ring rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-slate-300" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="focus-ring hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-slate-300 sm:inline-flex" type="button" aria-label="Security alerts">
          <ShieldCheck size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
          <UserCircle className="text-sky-200" size={28} />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-white">Akash</span>
            <span className="block text-xs text-slate-500">Admin</span>
          </span>
        </div>
      </div>
    </header>
  );
}
