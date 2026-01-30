import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Connector } from "../api/types";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  hibp:         { bg: "bg-red-500/15",    text: "text-red-400",    border: "border-red-500/30" },
  dehashed:     { bg: "bg-orange-500/15",  text: "text-orange-400", border: "border-orange-500/30" },
  rss:          { bg: "bg-blue-500/15",    text: "text-blue-400",   border: "border-blue-500/30" },
  generic_rest: { bg: "bg-purple-500/15",  text: "text-purple-400", border: "border-purple-500/30" },
  public_paste: { bg: "bg-cyan-500/15",    text: "text-cyan-400",   border: "border-cyan-500/30" },
  demo:         { bg: "bg-slate-500/15",   text: "text-slate-400",  border: "border-slate-500/30" },
};

function getTypePill(connectorType: string) {
  const colors = TYPE_COLORS[connectorType] ?? TYPE_COLORS.demo;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {connectorType.replace(/_/g, " ")}
    </span>
  );
}

function parseLastRunStatus(status: string): {
  label: string;
  colorClass: string;
  icon: React.ReactNode;
  findingsCount: number;
} {
  if (!status) {
    return { label: "No runs yet", colorClass: "text-slate-500", icon: null, findingsCount: 0 };
  }

  const storedMatch = status.match(/^stored:(\d+)$/);
  if (storedMatch) {
    const count = parseInt(storedMatch[1], 10);
    return {
      label: `${count} finding${count !== 1 ? "s" : ""} stored`,
      colorClass: "text-emerald-400",
      icon: (
        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      findingsCount: count,
    };
  }

  if (status === "disabled") {
    return { label: "Disabled", colorClass: "text-slate-500", icon: null, findingsCount: 0 };
  }

  if (status.toLowerCase().includes("error")) {
    return {
      label: status,
      colorClass: "text-red-400",
      icon: (
        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.16 21H3.84a1 1 0 01-.84-1.41L12 3z" />
        </svg>
      ),
      findingsCount: 0,
    };
  }

  return { label: status, colorClass: "text-slate-400", icon: null, findingsCount: 0 };
}

export const Connectors: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .listConnectors()
      .then(setConnectors)
      .finally(() => setLoading(false));
  }, []);

  const totalConnectors = connectors.length;
  const activeConnectors = connectors.filter((c) => c.is_active).length;
  const totalFindings = connectors.reduce((sum, c) => {
    const { findingsCount } = parseLastRunStatus(c.last_run_status);
    return sum + findingsCount;
  }, 0);

  const stats = [
    { label: "Total Connectors", value: totalConnectors, accent: "text-slate-100" },
    { label: "Active", value: activeConnectors, accent: "text-emerald-400" },
    { label: "Findings Stored", value: totalFindings, accent: "text-cyan-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Connectors</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage external data source integrations and collection pipelines
          </p>
        </div>
        <button className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Connector
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">Loading connectors...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && connectors.length === 0 && (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
          </svg>
          <p className="text-slate-400 text-sm">No connectors configured yet.</p>
          <p className="text-slate-500 text-xs mt-1">Click "Add Connector" to set up your first data source.</p>
        </div>
      )}

      {/* Connector Cards Grid */}
      {!loading && connectors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connectors.map((connector) => {
            const runStatus = parseLastRunStatus(connector.last_run_status);

            return (
              <div key={connector.id} className="card-hover flex flex-col justify-between">
                {/* Card Top */}
                <div>
                  {/* Name and Status Dot */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={connector.is_active ? "status-online" : "status-offline"}
                        title={connector.is_active ? "Active" : "Inactive"}
                      />
                      <h3 className="text-sm font-semibold text-slate-100 truncate">{connector.name}</h3>
                    </div>
                    {getTypePill(connector.connector_type)}
                  </div>

                  {/* Last Run Status */}
                  <div className="flex items-center gap-2 mt-4 mb-1">
                    {runStatus.icon}
                    <span className={`text-xs font-medium ${runStatus.colorClass}`}>{runStatus.label}</span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800">
                  {/* Toggle Area */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${connector.is_active ? "text-emerald-400" : "text-slate-500"}`}>
                      {connector.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Run Now Button */}
                  {connector.is_active && (
                    <button className="btn-secondary btn-sm">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Run Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
