export const statuses = ["All", "Open", "In Progress", "Closed"];
export const priorities = ["All", "Low", "Medium", "High", "Critical"];

export function formatDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function countTickets(tickets) {
  return tickets.reduce(
    (summary, ticket) => {
      summary.total += 1;
      summary[ticket.status] = (summary[ticket.status] || 0) + 1;
      summary.priorities[ticket.priority || "Medium"] = (summary.priorities[ticket.priority || "Medium"] || 0) + 1;
      summary.sentiments[ticket.sentiment || "Neutral"] = (summary.sentiments[ticket.sentiment || "Neutral"] || 0) + 1;
      if (isSlaBreached(ticket)) summary.slaBreached += 1;
      return summary;
    },
    {
      total: 0,
      Open: 0,
      "In Progress": 0,
      Closed: 0,
      slaBreached: 0,
      priorities: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      sentiments: { Positive: 0, Neutral: 0, Angry: 0 },
    }
  );
}

export function groupCustomers(tickets) {
  const customers = new Map();
  tickets.forEach((ticket) => {
    const key = ticket.customer_email.toLowerCase();
    const current = customers.get(key) || {
      name: ticket.customer_name,
      email: ticket.customer_email,
      tickets: [],
      total: 0,
      open: 0,
      closed: 0,
      lastTicketDate: ticket.created_at,
    };
    current.tickets.push(ticket);
    current.total += 1;
    if (ticket.status === "Open") current.open += 1;
    if (ticket.status === "Closed") current.closed += 1;
    if (new Date(ticket.created_at) > new Date(current.lastTicketDate)) current.lastTicketDate = ticket.created_at;
    customers.set(key, current);
  });
  return Array.from(customers.values()).sort((a, b) => new Date(b.lastTicketDate) - new Date(a.lastTicketDate));
}

export function predictPriority(subject = "", description = "") {
  const text = `${subject} ${description}`.toLowerCase();
  if (["urgent", "legal", "outage", "breach", "critical", "angry", "payment failed", "not working"].some((word) => text.includes(word))) return "Critical";
  if (["refund", "complaint", "failed", "cannot access", "blocked", "third time", "frustrated"].some((word) => text.includes(word))) return "High";
  if (["minor", "question", "how to", "feature request", "slow"].some((word) => text.includes(word))) return "Low";
  return "Medium";
}

export function isSlaBreached(ticket) {
  if (!ticket.sla_due_at || ticket.status === "Closed") return false;
  return new Date() > new Date(ticket.sla_due_at);
}

export function getSlaLabel(ticket) {
  if (!ticket.sla_due_at) return "SLA pending";
  if (ticket.status === "Closed") {
    if (ticket.resolved_at && new Date(ticket.resolved_at) <= new Date(ticket.sla_due_at)) return "Resolved within SLA";
    return "Resolved after SLA";
  }
  const diffMs = new Date(ticket.sla_due_at) - new Date();
  if (diffMs <= 0) return "SLA Breached";
  const hours = Math.floor(diffMs / 36e5);
  const minutes = Math.floor((diffMs % 36e5) / 6e4);
  return `${hours}h ${minutes}m remaining`;
}

export function riskTone(score = 0) {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

export function toCsv(tickets) {
  const headers = ["Ticket ID", "Customer Name", "Customer Email", "Subject", "Priority", "Sentiment", "Category", "SLA Due At", "Status", "Created At", "Updated At"];
  const rows = tickets.map((ticket) => [
    ticket.ticket_id,
    ticket.customer_name,
    ticket.customer_email,
    ticket.subject,
    ticket.priority || "Medium",
    ticket.sentiment || "Neutral",
    ticket.category || "General",
    ticket.sla_due_at || "",
    ticket.status,
    ticket.created_at,
    ticket.updated_at,
  ]);
  return [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}
