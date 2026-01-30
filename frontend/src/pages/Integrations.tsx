import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Integration } from "../api/types";

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  jira: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  o365: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  trellix: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  webhook: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
};

const typeDescriptions: Record<string, string> = {
  jira: "Jira Service Desk - Issue tracking",
  o365: "Microsoft Teams - Webhook notifications",
  trellix: "Trellix ePO - Endpoint protection",
  webhook: "Generic Webhook - Custom integrations",
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const colors = typeColors[type] ?? { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
      {type.toUpperCase()}
    </span>
  );
};

const TestStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Success
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-danger-500/15 text-danger-400 border border-danger-500/30">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
      Untested
    </span>
  );
};

const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-center gap-2">
    <span className={active ? "status-online" : "status-offline"} />
    <span className={`text-xs font-medium ${active ? "text-emerald-400" : "text-slate-500"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  </div>
);

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    apiClient.listIntegrations().then(setIntegrations);
  }, []);

  const totalCount = integrations.length;
  const activeCount = integrations.filter((i) => i.is_active).length;
  const successCount = integrations.filter((i) => i.last_test_status === "success").length;

  const handleTestConnection = (id: string) => {
    setTesting(id);
    setTimeout(() => setTesting(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Integrations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage external service connections and notification channels</p>
        </div>
        <button className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Integration
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-hover border-l-2 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total Integrations</div>
              <div className="text-3xl font-bold text-blue-400 mt-1">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Configured service connections</div>
        </div>

        <div className="card-hover border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active</div>
              <div className="text-3xl font-bold text-emerald-400 mt-1">{activeCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Currently enabled integrations</div>
        </div>

        <div className="card-hover border-l-2 border-l-cyber-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Successful Tests</div>
              <div className="text-3xl font-bold text-cyber-300 mt-1">{successCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyber-300/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Connections verified healthy</div>
        </div>
      </div>

      {/* Integration Cards Grid */}
      {integrations.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          <p className="text-slate-400 font-medium">No integrations configured</p>
          <p className="text-sm text-slate-600 mt-1">Add your first integration to connect external services</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {integrations.map((integration) => (
            <div key={integration.id} className="card-hover flex flex-col">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-100 truncate">{integration.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {typeDescriptions[integration.integration_type] ?? "Custom integration"}
                  </p>
                </div>
                <StatusDot active={integration.is_active} />
              </div>

              {/* Type & Test Status */}
              <div className="flex items-center gap-3 mb-5">
                <TypeBadge type={integration.integration_type} />
                <TestStatusBadge status={integration.last_test_status} />
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800 my-auto" />

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 mt-auto">
                <span className="text-[11px] text-slate-600 font-mono uppercase tracking-wider">
                  ID: {integration.id.slice(0, 8)}
                </span>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleTestConnection(integration.id)}
                  disabled={testing === integration.id}
                >
                  {testing === integration.id ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Testing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
