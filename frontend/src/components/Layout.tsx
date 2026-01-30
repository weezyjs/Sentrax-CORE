import React from "react";
import { NavLink } from "react-router-dom";
import { demoMode } from "../api";
import { useOrg } from "../context/OrgContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/targets", label: "Monitor Targets" },
  { to: "/findings", label: "Findings" },
  { to: "/alert-rules", label: "Alert Rules" },
  { to: "/connectors", label: "Connectors" },
  { to: "/integrations", label: "Integrations" },
  { to: "/audit-log", label: "Audit Log" },
  { to: "/admin", label: "Org & Users" },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organizations, activeOrg, setActiveOrg } = useOrg();

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-800 p-6">
        <div className="text-xl font-bold text-accent">DarkWeb Guard</div>
        <div className="text-xs uppercase tracking-widest text-slate-400 mt-2">Security Console</div>
        <div className="mt-6">
          <label className="text-xs text-slate-400">Tenant</label>
          <select
            className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
            value={activeOrg?.id ?? ""}
            onChange={(event) => setActiveOrg(organizations.find((org) => org.id === event.target.value))}
            disabled={!organizations.length}
          >
            {organizations.length ? (
              organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))
            ) : (
              <option value="">Authenticated Tenant</option>
            )}
          </select>
        </div>
        <nav className="mt-8 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg ${isActive ? "bg-slate-800 text-accent" : "text-slate-300 hover:bg-slate-900"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        {demoMode && (
          <div className="bg-amber-500 text-slate-950 text-center text-sm py-2 font-semibold">Demo Mode - Data is simulated</div>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
