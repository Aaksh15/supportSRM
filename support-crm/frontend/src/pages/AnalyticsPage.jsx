import { CheckCircle2, Inbox, Percent, Users } from "lucide-react";
import { useEffect, useState } from "react";

import AnalyticsCharts from "../components/AnalyticsCharts.jsx";
import MessageState from "../components/MessageState.jsx";
import Skeleton from "../components/Skeleton.jsx";
import StatCard from "../components/StatCard.jsx";
import useTickets from "../hooks/useTickets.js";
import { getAnalytics } from "../services/api.js";
import { groupCustomers } from "../utils/ticketUtils.js";

export default function AnalyticsPage() {
  const { tickets, loading, error } = useTickets();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  const customers = groupCustomers(tickets);
  const total = analytics?.total_tickets || tickets.length;
  const resolutionRate = analytics?.resolution_rate || 0;
  const openCount = analytics?.status_counts?.Open || 0;
  const openRatio = total ? Math.round((openCount / total) * 100) : 0;
  const averageTickets = customers.length ? (total / customers.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <Header title="Advanced Analytics" description="Recharts visualizations powered by real FastAPI ticket data." />
      {loading && <Skeleton rows={5} />}
      {error && !loading && <MessageState title="Unable to load analytics" message={error} variant="error" />}
      {!loading && !error && tickets.length === 0 && <MessageState title="No analytics yet" message="Create tickets to populate charts." />}
      {!loading && !error && tickets.length > 0 && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total tickets" value={total} icon={Inbox} accent="bg-violet-500/15 text-violet-200" helper="All-time ticket volume" />
            <StatCard title="Resolution rate" value={`${resolutionRate}%`} icon={CheckCircle2} accent="bg-emerald-500/15 text-emerald-200" helper="Closed / total" />
            <StatCard title="Open ratio" value={`${openRatio}%`} icon={Percent} accent="bg-sky-500/15 text-sky-200" helper="Open / total" />
            <StatCard title="Avg. per customer" value={averageTickets} icon={Users} accent="bg-amber-500/15 text-amber-200" helper="Tickets per customer" />
          </section>
          <AnalyticsCharts tickets={tickets} analytics={analytics} />
        </>
      )}
    </div>
  );
}

function Header({ title, description }) {
  return <div><p className="text-sm font-semibold uppercase tracking-wide text-violet-300">Insights</p><h1 className="mt-2 text-3xl font-bold text-white">{title}</h1><p className="mt-2 text-sm text-slate-400">{description}</p></div>;
}
