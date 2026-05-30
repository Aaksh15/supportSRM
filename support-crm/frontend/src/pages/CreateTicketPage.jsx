import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createTicket } from "../services/api.js";
import Toast from "../components/Toast.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import { predictPriority } from "../utils/ticketUtils.js";

const initialForm = {
  customer_name: "",
  customer_email: "",
  subject: "",
  description: "",
  priority: "Medium",
};

const priorities = ["Low", "Medium", "High", "Critical"];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [manualPriority, setManualPriority] = useState(false);
  const aiPriority = predictPriority(form.subject, form.description);

  useEffect(() => {
    if (!manualPriority && (form.subject || form.description)) {
      setForm((current) => ({ ...current, priority: aiPriority }));
    }
  }, [aiPriority, manualPriority, form.subject, form.description]);

  function validate() {
    const nextErrors = {};
    if (form.customer_name.trim().length < 2) nextErrors.customer_name = "Customer name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) nextErrors.customer_email = "Enter a valid email.";
    if (form.subject.trim().length < 3) nextErrors.subject = "Subject must be at least 3 characters.";
    if (form.description.trim().length < 5) nextErrors.description = "Description must be at least 5 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "priority") setManualPriority(true);
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setMessage("");
      const created = await createTicket(form);
      setMessage(`Ticket ${created.ticket_id} created successfully.`);
      setTimeout(() => navigate(`/tickets/${created.ticket_id}`), 700);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Toast message={message} type={message.includes("successfully") ? "success" : "error"} />
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to dashboard
      </Link>

      <section className="glass-card p-6">
        <div className="border-b border-white/10 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-300">New Ticket</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Create support ticket</h1>
          <p className="mt-2 text-sm text-slate-400">Capture customer context and route it into the CRM queue.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <Field label="Customer Name" error={errors.customer_name}>
            <input className="input-dark" name="customer_name" value={form.customer_name} onChange={updateField} placeholder="Jane Cooper" />
          </Field>
          <Field label="Customer Email" error={errors.customer_email}>
            <input className="input-dark" name="customer_email" type="email" value={form.customer_email} onChange={updateField} placeholder="jane@example.com" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
            <Field label="Subject" error={errors.subject}>
              <input className="input-dark" name="subject" value={form.subject} onChange={updateField} placeholder="Unable to access billing page" />
            </Field>
            <Field label="Priority">
              <select className="input-dark" name="priority" value={form.priority} onChange={updateField}>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {(form.subject || form.description) && (
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-200">AI Suggested Priority</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <PriorityBadge priority={aiPriority} />
                <button
                  type="button"
                  className="text-sm font-semibold text-sky-200 hover:text-white"
                  onClick={() => {
                    setManualPriority(true);
                    setForm((current) => ({ ...current, priority: aiPriority }));
                  }}
                >
                  Use suggestion
                </button>
                <span className="text-xs text-slate-500">You can override it before creating the ticket.</span>
              </div>
            </div>
          )}
          <Field label="Description" error={errors.description}>
            <textarea
              className="input-dark min-h-40"
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Describe the issue, context, and customer impact."
            />
          </Field>
          <div className="flex justify-end">
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:from-violet-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
              type="submit"
            >
              <Save size={18} aria-hidden="true" />
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-sm text-red-300">{error}</span>}
    </label>
  );
}
