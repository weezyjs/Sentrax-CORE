import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { AuditLogEntry } from "../api/types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 1000,
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

type ActionColor = {
  bg: string;
  text: string;
  dot: string;
  border: string;
};

function actionColor(action: string): ActionColor {
  if (action === "login")
    return {
      bg: "bg-blue-500/15",
      text: "text-blue-400",
      dot: "bg-blue-500",
      border: "border-blue-500/30",
    };
  if (action.startsWith("create_"))
    return {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      dot: "bg-emerald-500",
      border: "border-emerald-500/30",
    };
  if (action.startsWith("update_"))
    return {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      dot: "bg-amber-500",
      border: "border-amber-500/30",
    };
  if (action.startsWith("delete_"))
    return {
      bg: "bg-red-500/15",
      text: "text-red-400",
      dot: "bg-red-500",
      border: "border-red-500/30",
    };
  if (action === "run_connector")
    return {
      bg: "bg-purple-500/15",
      text: "text-purple-400",
      dot: "bg-purple-500",
      border: "border-purple-500/30",
    };
  if (action === "send_alert")
    return {
      bg: "bg-cyan-500/15",
      text: "text-cyan-400",
      dot: "bg-cyan-500",
      border: "border-cyan-500/30",
    };
  if (action === "test_integration")
    return {
      bg: "bg-blue-500/15",
      text: "text-blue-400",
      dot: "bg-blue-500",
      border: "border-blue-500/30",
    };
  if (action === "bootstrap_super_admin")
    return {
      bg: "bg-pink-500/15",
      text: "text-pink-400",
      dot: "bg-pink-500",
      border: "border-pink-500/30",
    };
  return {
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    dot: "bg-slate-500",
    border: "border-slate-500/30",
  };
}

/* SVG icon helpers (inline to avoid extra deps) */

const PersonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-3.5 h-3.5 text-slate-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

const ServerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-3.5 h-3.5 text-slate-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z"
      clipRule="evenodd"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-slate-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Unique action types for filter bar                                */
/* ------------------------------------------------------------------ */

function uniqueActions(entries: AuditLogEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.action))).sort();
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export const AuditLog: React.FC = () => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [actorSearch, setActorSearch] = useState("");

  useEffect(() => {
    apiClient
      .listAuditLog()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  /* Derived state */
  const actions = uniqueActions(entries);

  const filtered = entries.filter((e) => {
    if (actionFilter !== "all" && e.action !== actionFilter) return false;
    if (actorSearch) {
      const actor = (e.actor_id ?? "system").toLowerCase();
      if (!actor.includes(actorSearch.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Audit Log</h2>
        <span className="text-xs text-slate-500 font-mono">
          {filtered.length} / {entries.length} events
        </span>
      </div>

      {/* ---- Filter bar ---- */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Action type filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 appearance-none cursor-pointer"
        >
          <option value="all">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Actor search */}
        <div className="relative flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Filter by actor..."
            value={actorSearch}
            onChange={(e) => setActorSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* ---- Timeline ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
          Loading audit events...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
          No audit events match the current filters.
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Vertical timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-800" />

          <div className="space-y-6">
            {filtered.map((entry) => {
              const color = actionColor(entry.action);
              const isSystem =
                !entry.actor_id || entry.actor_id === "system";
              const payloadKeys = Object.keys(entry.payload ?? {});

              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-5 top-3 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${color.dot} z-10`}
                  />

                  {/* Entry card */}
                  <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    {/* Top row: badge + actor + time */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      {/* Action badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide uppercase border ${color.bg} ${color.text} ${color.border}`}
                      >
                        {entry.action}
                      </span>

                      {/* Actor */}
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        {isSystem ? <ServerIcon /> : <PersonIcon />}
                        {isSystem ? "system" : entry.actor_id}
                      </span>

                      {/* Spacer */}
                      <span className="flex-1" />

                      {/* Relative time */}
                      <span
                        className="text-xs text-slate-600 font-mono"
                        title={new Date(entry.created_at).toLocaleString()}
                      >
                        {timeAgo(entry.created_at)}
                      </span>
                    </div>

                    {/* Payload */}
                    {payloadKeys.length > 0 && (
                      <div className="mt-3 rounded-md bg-slate-950/60 border border-slate-800 p-3 font-mono text-xs leading-relaxed overflow-x-auto">
                        {payloadKeys.map((key) => (
                          <div key={key} className="flex gap-2">
                            <span className="text-slate-500 select-none shrink-0">
                              {key}:
                            </span>
                            <span className="text-slate-300 break-all">
                              {typeof entry.payload[key] === "object"
                                ? JSON.stringify(entry.payload[key])
                                : String(entry.payload[key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
