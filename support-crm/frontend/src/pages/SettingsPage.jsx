import { useState } from "react";
import { Server, UserCircle } from "lucide-react";

import { API_BASE_URL, healthCheck } from "../services/api.js";

export default function SettingsPage() {
  const [status, setStatus] = useState("Not tested");

  async function testConnection() {
    try {
      setStatus("Testing...");
      const result = await healthCheck();
      setStatus(result.status === "healthy" ? "Connected" : "Unexpected response");
    } catch {
      setStatus("Connection failed");
    }
  }

  return (
    <div className="space-y-6">
      <Header title="Settings" description="Profile, theme, API connection, and application details." />
      <section className="grid gap-6 xl:grid-cols-2">
        <article className="glass-card p-6">
          <div className="flex items-center gap-4">
            <UserCircle className="text-sky-200" size={48} />
            <div>
              <h2 className="text-xl font-bold text-white">Akash</h2>
              <p className="text-sm text-slate-400">Support CRM Administrator</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info label="Theme preference" value="Dark navy CRM" />
            <Info label="Workspace" value="Internship Submission" />
          </div>
        </article>
        <article className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Server className="text-violet-200" />
            <h2 className="text-xl font-bold text-white">API Status</h2>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Backend URL</p>
            <p className="mt-2 break-all text-sm font-semibold text-white">{API_BASE_URL}</p>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-300">Status: <span className="font-bold text-white">{status}</span></p>
            <button type="button" className="gradient-button" onClick={testConnection}>Test API Connection</button>
          </div>
        </article>
        <article className="glass-card p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-white">App Info</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Info label="Frontend" value="React + Vite + Tailwind CSS" />
            <Info label="Backend" value="FastAPI + SQLAlchemy + SQLite" />
            <Info label="Deployment" value="Railway ready" />
          </div>
        </article>
      </section>
    </div>
  );
}

function Header({ title, description }) {
  return <div><p className="text-sm font-semibold uppercase tracking-wide text-violet-300">Configuration</p><h1 className="mt-2 text-3xl font-bold text-white">{title}</h1><p className="mt-2 text-sm text-slate-400">{description}</p></div>;
}

function Info({ label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}
