import { Activity, Boxes, LayoutDashboard, Plus, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { DiagnosticsPanel } from "./diagnostics-panel";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark"><Boxes size={22} /></span>
          <span><strong>OrderFlow</strong><small>Event-driven demo</small></span>
        </NavLink>

        <nav>
          <NavLink to="/" end><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/orders"><ShoppingBag size={18} /> Orders</NavLink>
          <NavLink to="/orders/new"><Plus size={18} /> Create order</NavLink>
        </nav>

        <div className="sidebar-tech">
          <Activity size={16} />
          <span>React → Gateway → Kafka</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><Boxes size={20} /><strong>OrderFlow</strong></div>
          <div className="system-status"><span className="status-dot" /> API Gateway integration</div>
          <DiagnosticsPanel />
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
