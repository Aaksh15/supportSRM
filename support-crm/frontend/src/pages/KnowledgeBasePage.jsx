import { BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";

const articles = [
  { id: 1, category: "Billing", title: "How to troubleshoot failed invoices", body: "Check payment method validity, billing address, gateway status, and recent invoice events before escalating." },
  { id: 2, category: "Login Issues", title: "Customer cannot sign in", body: "Verify email spelling, password reset attempts, account lock status, and SSO provider availability." },
  { id: 3, category: "Refunds", title: "Refund request checklist", body: "Confirm purchase date, refund policy window, payment provider transaction ID, and customer confirmation." },
  { id: 4, category: "Technical Support", title: "Collecting browser diagnostics", body: "Ask for browser version, console errors, network logs, screenshots, and exact reproduction steps." },
  { id: 5, category: "General", title: "Writing high-signal internal notes", body: "Summarize customer impact, steps tried, current owner, and the next action with a due date." },
];

const categories = ["All", "Billing", "Login Issues", "Refunds", "Technical Support", "General"];

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(articles[0]);

  const visible = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = category === "All" || article.category === category;
      const matchesQuery = `${article.title} ${article.body}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      <Header title="Knowledge Base" description="Frontend help center for common support workflows." />
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="glass-card p-5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input className="input-dark pl-11" placeholder="Search articles..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${category === item ? "bg-violet-500 text-white" : "bg-white/[0.06] text-slate-400 hover:text-white"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {visible.map((article) => (
              <button key={article.id} type="button" onClick={() => setSelected(article)} className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]">
                <span className="text-xs font-semibold text-violet-300">{article.category}</span>
                <span className="mt-1 block text-sm font-bold text-white">{article.title}</span>
              </button>
            ))}
          </div>
        </aside>
        <article className="glass-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200"><BookOpen /></span>
            <div>
              <p className="text-sm font-semibold text-violet-300">{selected.category}</p>
              <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
            </div>
          </div>
          <p className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-5 leading-7 text-slate-300">{selected.body}</p>
        </article>
      </section>
    </div>
  );
}

function Header({ title, description }) {
  return <div><p className="text-sm font-semibold uppercase tracking-wide text-violet-300">Help Center</p><h1 className="mt-2 text-3xl font-bold text-white">{title}</h1><p className="mt-2 text-sm text-slate-400">{description}</p></div>;
}
