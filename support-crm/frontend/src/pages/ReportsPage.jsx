import { Download } from "lucide-react";

import MessageState from "../components/MessageState.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import Skeleton from "../components/Skeleton.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import useTickets from "../hooks/useTickets.js";
import { countTickets, groupCustomers, toCsv } from "../utils/ticketUtils.js";

export default function ReportsPage() {
  const { tickets, loading, error } = useTickets();
  const counts = countTickets(tickets);
  const customers = groupCustomers(tickets);

  function exportCsv() {
    const blob = new Blob([toCsv(tickets)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "support-crm-tickets.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Header title="Reports" description="Export and review ticket performance from live CRM data." />
        <button type="button" className="gradient-button" onClick={exportCsv} disabled={tickets.length === 0}>
          <Download size={18} /> Export CSV
        </button>
      </div>
      {loading && <Skeleton rows={5} />}
      {error && !loading && <MessageState title="Unable to load reports" message={error} variant="error" />}
      {!loading && !error && tickets.length === 0 && <MessageState title="No report data" message="Create tickets to generate reports." />}
      {!loading && !error && tickets.length > 0 && (
        <section className="grid gap-6 xl:grid-cols-2">
          <ReportCard title="Ticket Summary">
            <ReportRow label="Total Tickets" value={counts.total} />
            <ReportRow label="Open Tickets" value={counts.Open} />
            <ReportRow label="In Progress" value={counts["In Progress"]} />
            <ReportRow label="Closed Tickets" value={counts.Closed} />
          </ReportCard>
          <ReportCard title="Status-wise Report">
            {["Open", "In Progress", "Closed"].map((status) => <ReportRow key={status} label={<StatusBadge status={status} />} value={counts[status]} />)}
          </ReportCard>
          <ReportCard title="Priority-wise Report">
            {["Low", "Medium", "High", "Critical"].map((priority) => <ReportRow key={priority} label={<PriorityBadge priority={priority} />} value={counts.priorities[priority]} />)}
          </ReportCard>
          <ReportCard title="Customer-wise Report">
            {customers.slice(0, 8).map((customer) => <ReportRow key={customer.email} label={`${customer.name} (${customer.email})`} value={customer.total} />)}
          </ReportCard>
        </section>
      )}
    </div>
  );
}

function Header({ title, description }) {
  return <div><p className="text-sm font-semibold uppercase tracking-wide text-violet-300">Exports</p><h1 className="mt-2 text-3xl font-bold text-white">{title}</h1><p className="mt-2 text-sm text-slate-400">{description}</p></div>;
}

function ReportCard({ title, children }) {
  return <article className="glass-card p-5"><h2 className="text-lg font-bold text-white">{title}</h2><div className="mt-5 divide-y divide-white/10">{children}</div></article>;
}

function ReportRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-slate-300">{label}</span><span className="font-bold text-white">{value}</span></div>;
}
