import { AlertTriangle, BrainCircuit, CheckCircle2, Clock3, Inbox, Plus, SlidersHorizontal, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ActivityCard from "../components/ActivityCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import MessageState from "../components/MessageState.jsx";
import StatCard from "../components/StatCard.jsx";
import TicketOverview from "../components/TicketOverview.jsx";
import TicketTable from "../components/TicketTable.jsx";
import AIInsightCard from "../components/AIInsightCard.jsx";
import RiskScoreBadge from "../components/RiskScoreBadge.jsx";
import { getAnalytics, getTickets } from "../services/api.js";

const statuses = ["All", "Open", "In Progress", "Closed"];

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const [status, setStatus] = useState("All");
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const [filteredData, allData, analyticsData] = await Promise.all([
          getTickets({ search, status, signal: controller.signal }),
          getTickets({ signal: controller.signal }),
          getAnalytics(),
        ]);
        setTickets(filteredData);
        setAllTickets(allData);
        setAnalytics(analyticsData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Backend is not running or the API cannot be reached. Start FastAPI and try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, status]);

  const counts = useMemo(() => {
    return allTickets.reduce(
      (summary, ticket) => {
        summary.total += 1;
        summary[ticket.status] = (summary[ticket.status] || 0) + 1;
        return summary;
      },
      { total: 0, Open: 0, "In Progress": 0, Closed: 0 }
    );
  }, [allTickets]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Welcome back, Akash!</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Here is the current support workload, live from your FastAPI ticketing backend.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-400 hover:to-sky-400"
        >
          <Plus size={18} aria-hidden="true" />
          New Ticket
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Tickets" value={counts.total} icon={Ticket} accent="bg-violet-500/15 text-violet-200" helper="All tickets in the CRM" />
        <StatCard title="Open Tickets" value={counts.Open} icon={Inbox} accent="bg-emerald-500/15 text-emerald-200" helper="Waiting for first action" />
        <StatCard title="In Progress" value={counts["In Progress"]} icon={Clock3} accent="bg-sky-500/15 text-sky-200" helper="Currently being handled" />
        <StatCard title="Closed Tickets" value={counts.Closed} icon={CheckCircle2} accent="bg-slate-500/20 text-slate-200" helper="Resolved support cases" />
        <StatCard title="SLA Breached" value={analytics?.sla_breached_count || 0} icon={AlertTriangle} accent="bg-rose-500/15 text-rose-200" helper="Active tickets past deadline" />
      </section>

      <section className="glass-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Tickets</h2>
            <p className="mt-1 text-sm text-slate-400">Search and status filters use the live ticket API.</p>
          </div>
          <label className="relative block w-full lg:w-64">
            <span className="sr-only">Filter by status</span>
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              className="focus-ring w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-8 text-sm text-white"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <div className="p-5"><LoadingState /></div>}
        {error && !loading && (
          <div className="p-5">
            <MessageState title="Unable to load tickets" message={error} variant="error" />
          </div>
        )}
        {!loading && !error && tickets.length === 0 && (
          <div className="p-5">
            <MessageState title="No tickets found" message="Create a ticket or adjust the search and status filters." />
          </div>
        )}
        {!loading && !error && tickets.length > 0 && <TicketTable tickets={tickets} />}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="glass-card overflow-hidden bg-gradient-to-br from-violet-500/15 to-sky-500/10 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-100">
                <BrainCircuit size={14} aria-hidden="true" />
                AI-powered insights
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white">AI Insights Dashboard</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(analytics?.ai_insights || []).slice(0, 4).map((insight) => (
                  <AIInsightCard key={insight.title} {...insight} />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-center">
              <p className="text-3xl font-bold text-white">{counts.total ? Math.round((counts.Closed / counts.total) * 100) : 0}%</p>
              <p className="mt-1 text-xs text-slate-400">resolution ratio</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          <section className="glass-card p-5">
            <h2 className="text-lg font-bold text-white">Top Risk Customers</h2>
            <div className="mt-4 space-y-3">
              {(analytics?.risky_customers || []).slice(0, 4).map((customer) => (
                <div key={customer.customer_email} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <span>
                    <span className="block text-sm font-semibold text-white">{customer.customer_name}</span>
                    <span className="block text-xs text-slate-500">{customer.open_tickets} open tickets</span>
                  </span>
                  <RiskScoreBadge score={customer.risk_score} />
                </div>
              ))}
            </div>
          </section>
          <TicketOverview counts={counts} />
          <ActivityCard tickets={allTickets} />
        </div>
      </section>
    </div>
  );
}
