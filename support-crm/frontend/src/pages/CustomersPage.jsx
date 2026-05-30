import { useEffect, useState } from "react";

import Customer360 from "../components/Customer360.jsx";
import MessageState from "../components/MessageState.jsx";
import RiskScoreBadge from "../components/RiskScoreBadge.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { getCustomer, getCustomers } from "../services/api.js";
import { formatDate } from "../utils/ticketUtils.js";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setCustomers(await getCustomers());
      } catch {
        setError("Unable to load customers from the backend.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function openCustomer(email) {
    setSelected(await getCustomer(email));
  }

  return (
    <div className="space-y-6">
      <Header title="Customers" description="Risk-scored Customer 360 profiles generated from real tickets." />
      {loading && <Skeleton rows={5} />}
      {error && !loading && <MessageState title="Unable to load customers" message={error} variant="error" />}
      {!loading && !error && customers.length === 0 && <MessageState title="No customers yet" message="Customers appear after tickets are created." />}
      {!loading && !error && customers.length > 0 && (
        <section className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                  {["Customer", "Total", "Open", "Critical", "Closed", "Risk Score", "Last Ticket"].map((heading) => (
                    <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {customers.map((customer) => (
                  <tr key={customer.customer_email} className="cursor-pointer text-sm text-slate-300 hover:bg-white/[0.04]" onClick={() => openCustomer(customer.customer_email)}>
                    <td className="px-5 py-4">
                      <span className="block font-bold text-white">{customer.customer_name}</span>
                      <span className="text-xs text-slate-500">{customer.customer_email}</span>
                    </td>
                    <td className="px-5 py-4">{customer.total_tickets}</td>
                    <td className="px-5 py-4">{customer.open_tickets}</td>
                    <td className="px-5 py-4">{customer.critical_tickets}</td>
                    <td className="px-5 py-4">{customer.closed_tickets}</td>
                    <td className="px-5 py-4"><RiskScoreBadge score={customer.risk_score} /></td>
                    <td className="whitespace-nowrap px-5 py-4">{formatDate(customer.last_ticket_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <Customer360 customer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Header({ title, description }) {
  return <div><p className="text-sm font-semibold uppercase tracking-wide text-violet-300">CRM</p><h1 className="mt-2 text-3xl font-bold text-white">{title}</h1><p className="mt-2 text-sm text-slate-400">{description}</p></div>;
}
