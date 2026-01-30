import React from "react";
import { useOrg } from "../context/OrgContext";

export const TenantSelector: React.FC = () => {
  const { organizations, activeOrg, setActiveOrg } = useOrg();

  return (
    <div className="card max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Select Tenant</h2>
      <p className="text-sm text-slate-400 mb-6">
        Choose an organization to scope data. In full deployments this is derived from the authenticated session.
      </p>
      <div className="space-y-3">
        {organizations.map((org) => (
          <button
            key={org.id}
            className={`w-full text-left px-4 py-3 rounded-lg border ${
              activeOrg?.id === org.id ? "border-accent bg-slate-900" : "border-slate-800"
            }`}
            onClick={() => setActiveOrg(org)}
          >
            <div className="font-semibold">{org.name}</div>
            <div className="text-xs text-slate-400">{org.is_active ? "Active" : "Disabled"}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
