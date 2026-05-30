import {
  BarChart3,
  BookOpen,
  Gauge,
  Headphones,
  LayoutDashboard,
  PieChart,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Tickets", icon: Ticket, to: "/tickets" },
  { label: "Customers", icon: Users, to: "/customers" },
  { label: "Analytics", icon: BarChart3, to: "/analytics" },
  { label: "Knowledge Base", icon: BookOpen, to: "/knowledge-base" },
  { label: "Reports", icon: PieChart, to: "/reports" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

export default function Sidebar({ onNavigate, mobile = false }) {
  return (
    <aside className={`${mobile ? "block min-h-full w-72" : "hidden min-h-screen w-72 shrink-0 lg:block"} border-r border-white/10 bg-slate-950/90 px-5 py-6 backdrop-blur-xl`}>
      <NavLink to="/dashboard" onClick={onNavigate} className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-lg shadow-violet-950/40">
          <Headphones size={24} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-bold text-white">Support CRM</span>
          <span className="text-sm text-slate-400">Service command</span>
        </span>
      </NavLink>

      <nav className="mt-10 space-y-2">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-violet-500/25 to-sky-500/20 text-white ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
        <Gauge className="text-violet-200" size={20} aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-white">SLA Health</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Monitor critical tickets and keep support response times tight.</p>
      </div>
    </aside>
  );
}
