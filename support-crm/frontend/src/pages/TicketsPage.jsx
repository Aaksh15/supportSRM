import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import MessageState from "../components/MessageState.jsx";
import Skeleton from "../components/Skeleton.jsx";
import TicketTable from "../components/TicketTable.jsx";
import useTickets from "../hooks/useTickets.js";
import { priorities, statuses } from "../utils/ticketUtils.js";

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("newest");
  const { tickets, loading, error } = useTickets({ search, status });

  const visibleTickets = useMemo(() => {
    return tickets
      .filter((ticket) => priority === "All" || (ticket.priority || "Medium") === priority)
      .sort((a, b) => {
        const diff = new Date(a.created_at) - new Date(b.created_at);
        return sort === "oldest" ? diff : -diff;
      });
  }, [tickets, priority, sort]);

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description="Manage support work across every status and priority.">
        <Link to="/tickets/new" className="gradient-button">
          <Plus size={18} /> Create Ticket
        </Link>
      </PageHeader>

      <section className="glass-card p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input className="input-dark pl-11" placeholder="Search tickets..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <Select icon={SlidersHorizontal} value={status} onChange={setStatus} options={statuses} />
          <Select value={priority} onChange={setPriority} options={priorities} />
          <Select value={sort} onChange={setSort} options={["newest", "oldest"]} />
        </div>
      </section>

      {loading && <Skeleton rows={5} />}
      {error && !loading && <MessageState title="Unable to load tickets" message={error} variant="error" />}
      {!loading && !error && visibleTickets.length === 0 && <MessageState title="No tickets found" message="Create a ticket or adjust your filters." />}
      {!loading && !error && visibleTickets.length > 0 && (
        <section className="glass-card overflow-hidden">
          <TicketTable tickets={visibleTickets} />
        </section>
      )}
    </div>
  );
}

function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Select({ icon: Icon, value, onChange, options }) {
  return (
    <label className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />}
      <select className={`input-dark appearance-none ${Icon ? "pl-11" : ""}`} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "newest" ? "Newest first" : option === "oldest" ? "Oldest first" : option}
          </option>
        ))}
      </select>
    </label>
  );
}
