import React from "react";
import { useOrg } from "../context/OrgContext";
import { useNavigate } from "react-router-dom";

export const TenantSelector: React.FC = () => {
  const { organizations, activeOrg, setActiveOrg } = useOrg();
  const navigate = useNavigate();

  const handleSelect = (org: typeof organizations[0]) => {
    setActiveOrg(org);
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-300/10 border border-cyber-400/30 mb-4">
          <svg className="w-8 h-8 text-cyber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Select Organization</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Choose an organization to scope all data views. In production deployments, this is derived from the authenticated session.
        </p>
      </div>

      <div className="space-y-3">
        {organizations.map((org) => (
          <button
            key={org.id}
            className={`w-full text-left px-6 py-4 rounded-xl border transition-all duration-200 ${
              activeOrg?.id === org.id
                ? "border-cyber-400/40 bg-cyber-300/5 shadow-glow"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
            }`}
            onClick={() => handleSelect(org)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  activeOrg?.id === org.id ? "bg-cyber-300/15 text-cyber-300" : "bg-slate-800 text-slate-400"
                }`}>
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{org.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{org.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  org.is_active ? "text-success-400" : "text-slate-500"
                }`}>
                  <span className={org.is_active ? "status-online" : "status-offline"} />
                  {org.is_active ? "Active" : "Disabled"}
                </span>
                {activeOrg?.id === org.id && (
                  <span className="badge-low text-[10px]">SELECTED</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-slate-500 text-sm">No organizations available</div>
          <div className="text-xs text-slate-600 mt-1">Organizations will appear after authentication</div>
        </div>
      )}
    </div>
  );
};
