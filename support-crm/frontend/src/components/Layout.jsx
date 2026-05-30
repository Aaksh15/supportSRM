import { Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080d1d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_30%)]" />
      <div className="relative flex min-h-screen">
        <Sidebar />
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button className="absolute inset-0 bg-slate-950/70" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full">
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Navbar onMenuClick={() => setMobileOpen(true)} />
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
