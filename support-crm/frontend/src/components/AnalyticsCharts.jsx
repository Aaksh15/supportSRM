import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getSlaLabel } from "../utils/ticketUtils.js";

const colors = ["#8b5cf6", "#38bdf8", "#34d399", "#f59e0b", "#f43f5e", "#fb7185"];

export default function AnalyticsCharts({ tickets, analytics }) {
  const statusData = toSeries(analytics?.status_counts, ["Open", "In Progress", "Closed"]);
  const priorityData = toSeries(analytics?.priority_counts, ["Low", "Medium", "High", "Critical"]);
  const sentimentData = toSeries(analytics?.sentiment_counts, ["Positive", "Neutral", "Angry"]);
  const createdData = buildCreatedData(tickets);
  const slaData = buildSlaData(tickets);
  const topCustomerData = (analytics?.top_customers || []).map((customer) => ({ name: customer.customer_name, value: customer.total_tickets }));

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Tickets by Status"><Donut data={statusData} /></ChartCard>
      <ChartCard title="Tickets by Priority"><Bars data={priorityData} color="#8b5cf6" /></ChartCard>
      <ChartCard title="Tickets Created Over Time"><Lines data={createdData} /></ChartCard>
      <ChartCard title="SLA Breached vs Resolved"><Areas data={slaData} /></ChartCard>
      <ChartCard title="Sentiment Distribution"><Donut data={sentimentData} /></ChartCard>
      <ChartCard title="Top Customers by Ticket Count"><Bars data={topCustomerData} color="#38bdf8" /></ChartCard>
    </section>
  );
}

function toSeries(counts = {}, keys = []) {
  return keys.map((name) => ({ name, value: counts[name] || 0 }));
}

function buildCreatedData(tickets) {
  const byDate = new Map();
  tickets.forEach((ticket) => {
    const key = new Date(ticket.created_at).toLocaleDateString("en", { month: "short", day: "numeric" });
    const row = byDate.get(key) || { date: key, created: 0 };
    row.created += 1;
    byDate.set(key, row);
  });
  return Array.from(byDate.values()).slice(-14);
}

function buildSlaData(tickets) {
  const byDate = new Map();
  tickets.forEach((ticket) => {
    const key = new Date(ticket.created_at).toLocaleDateString("en", { month: "short", day: "numeric" });
    const row = byDate.get(key) || { date: key, breached: 0, resolved: 0 };
    const sla = getSlaLabel(ticket);
    if (sla.includes("Breached") || sla.includes("after")) row.breached += 1;
    if (sla.includes("Resolved within")) row.resolved += 1;
    byDate.set(key, row);
  });
  return Array.from(byDate.values()).slice(-14);
}

function ChartCard({ title, children }) {
  return <section className="glass-card min-h-80 p-5"><h2 className="text-lg font-bold text-white">{title}</h2><div className="mt-5 h-64">{children}</div></section>;
}

function Donut({ data }) {
  return <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>{data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>;
}

function Bars({ data, color }) {
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid stroke="#1f2937" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>;
}

function Lines({ data }) {
  return <ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid stroke="#1f2937" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" allowDecimals={false} /><Tooltip /><Line dataKey="created" stroke="#38bdf8" strokeWidth={3} /></LineChart></ResponsiveContainer>;
}

function Areas({ data }) {
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid stroke="#1f2937" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" allowDecimals={false} /><Tooltip /><Area dataKey="breached" stroke="#fb7185" fill="#fb718533" /><Area dataKey="resolved" stroke="#34d399" fill="#34d39933" /></AreaChart></ResponsiveContainer>;
}
