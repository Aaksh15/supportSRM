import { ArrowLeft, Mail, MessageSquarePlus, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import LoadingState from "../components/LoadingState.jsx";
import MessageState from "../components/MessageState.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import SentimentBadge from "../components/SentimentBadge.jsx";
import SlaBadge from "../components/SlaBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Toast from "../components/Toast.jsx";
import { getTicket, updateTicket } from "../services/api.js";

const statuses = ["Open", "In Progress", "Closed"];

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TicketDetailsPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadTicket() {
    try {
      setLoading(true);
      setError("");
      const data = await getTicket(ticketId);
      setTicket(data);
      setStatus(data.status);
    } catch (err) {
      setError("Unable to load this ticket. Confirm the backend is running and the ticket exists.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function handleUpdate(event) {
    event.preventDefault();
    const trimmedNote = noteText.trim();
    if (!trimmedNote && status === ticket.status) {
      setMessage("Change status or add a note before saving.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const updated = await updateTicket(ticketId, {
        status,
        note_text: trimmedNote || null,
      });
      setTicket(updated);
      setNoteText("");
      setMessage("Ticket updated successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading ticket details..." />;
  if (error) return <MessageState title="Unable to load ticket" message={error} variant="error" />;

  return (
    <div className="space-y-6">
      <Toast message={message} type={message.includes("successfully") ? "success" : "error"} />
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to dashboard
      </Link>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <article className="glass-card p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-300">{ticket.ticket_id}</p>
              <h1 className="mt-2 text-3xl font-bold text-white">{ticket.subject}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={ticket.priority} />
              <SentimentBadge sentiment={ticket.sentiment} />
              <SlaBadge ticket={ticket} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={UserRound} label="Customer Name" value={ticket.customer_name} />
            <Info icon={Mail} label="Customer Email" value={ticket.customer_email} />
            <Info label="Created Date" value={formatDate(ticket.created_at)} />
            <Info label="Updated Date" value={formatDate(ticket.updated_at)} />
            <Info label="Category" value={ticket.category} />
            <Info label="SLA Due" value={formatDate(ticket.sla_due_at)} />
          </dl>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-200">Description</h2>
            <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
              {ticket.description}
            </p>
          </div>
        </article>

        <aside className="glass-card p-6">
          <h2 className="text-lg font-bold text-white">Update ticket</h2>
          <form onSubmit={handleUpdate} className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Status</span>
              <select className="input-dark mt-2" value={status} onChange={(event) => setStatus(event.target.value)}>
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Internal Note</span>
              <textarea
                className="input-dark mt-2 min-h-32"
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Add troubleshooting steps, customer context, or next action."
              />
            </label>
            {message && <p className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-300">{message}</p>}
            <button
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:from-violet-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={saving}
              type="submit"
            >
              <Save size={18} aria-hidden="true" />
              {saving ? "Saving..." : "Save Update"}
            </button>
          </form>
        </aside>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="text-violet-200" size={20} aria-hidden="true" />
          <h2 className="text-lg font-bold text-white">Notes timeline</h2>
        </div>
        {ticket.notes.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">No internal notes have been added yet.</p>
        ) : (
          <ol className="mt-6 space-y-4 border-l border-white/10 pl-5">
            {ticket.notes.map((note) => (
              <li key={note.id} className="relative">
                <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-violet-400 ring-2 ring-violet-400/20" />
                <p className="text-sm font-semibold text-white">{formatDate(note.created_at)}</p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
                  {note.note_text}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Icon && <Icon size={14} aria-hidden="true" />}
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-medium text-slate-100">{value}</dd>
    </div>
  );
}
