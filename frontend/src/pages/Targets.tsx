import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Target } from "../api/types";

type FilterType = "all" | "email" | "domain" | "company";

const EnvelopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13L2 4" />
  </svg>
);

const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
  </svg>
);

const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22V12h6v10" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const typeConfig: Record<string, { color: string; bg: string; border: string; icon: React.FC<{ className?: string }> }> = {
  email: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: EnvelopeIcon,
  },
  domain: {
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: GlobeIcon,
  },
  company: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: BuildingIcon,
  },
};

function getTypeConfig(targetType: string) {
  const key = targetType.toLowerCase();
  return typeConfig[key] ?? {
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    icon: GlobeIcon,
  };
}

export const Targets: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTargetType, setNewTargetType] = useState<string>("email");
  const [newTargetValue, setNewTargetValue] = useState("");

  useEffect(() => {
    apiClient.listTargets().then(setTargets);
  }, []);

  const filteredTargets =
    filter === "all"
      ? targets
      : targets.filter((t) => t.target_type.toLowerCase() === filter);

  const counts: Record<string, number> = {
    all: targets.length,
    email: targets.filter((t) => t.target_type.toLowerCase() === "email").length,
    domain: targets.filter((t) => t.target_type.toLowerCase() === "domain").length,
    company: targets.filter((t) => t.target_type.toLowerCase() === "company").length,
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Email", value: "email" },
    { label: "Domain", value: "domain" },
    { label: "Company", value: "company" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Monitor Targets</h2>
          <p className="text-sm text-slate-400 mt-1">
            {targets.length} target{targets.length !== 1 ? "s" : ""} under surveillance
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm"
          onClick={() => setShowAddForm(true)}
        >
          <PlusIcon className="w-4 h-4" />
          Add Target
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-accent text-slate-950"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
            }`}
          >
            {f.label}
            <span
              className={`ml-2 text-xs ${
                filter === f.value ? "text-slate-950/60" : "text-slate-500"
              }`}
            >
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Add Target Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-100">Add New Target</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Type
                </label>
                <div className="flex gap-2">
                  {(["email", "domain", "company"] as const).map((type) => {
                    const cfg = getTypeConfig(type);
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewTargetType(type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          newTargetType === type
                            ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                            : "bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={newTargetValue}
                  onChange={(e) => setNewTargetValue(e.target.value)}
                  placeholder={
                    newTargetType === "email"
                      ? "user@example.com"
                      : newTargetType === "domain"
                      ? "example.com"
                      : "Acme Corp"
                  }
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTargetValue("");
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTargetValue("");
                  }}
                >
                  Add Target
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Cards Grid */}
      {filteredTargets.length === 0 ? (
        <div className="card text-center py-16">
          <GlobeIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">No targets found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTargets.map((target) => {
            const cfg = getTypeConfig(target.target_type);
            const Icon = cfg.icon;
            const metaEntries = target.metadata
              ? Object.entries(target.metadata)
              : [];

            return (
              <div
                key={target.id}
                className="card card-hover group relative overflow-hidden"
              >
                {/* Accent top border */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.bg.replace("/10", "/40")}`}
                />

                {/* Card header: icon + type badge */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${cfg.bg} ${cfg.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                  >
                    {target.target_type.toLowerCase()}
                  </span>
                </div>

                {/* Value */}
                <p className="text-slate-100 font-semibold text-base truncate mb-1" title={target.value}>
                  {target.value}
                </p>

                {/* Target ID */}
                <p className="text-slate-500 text-xs font-mono mb-3 truncate">
                  ID: {target.id}
                </p>

                {/* Metadata pills */}
                {metaEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/60">
                    {metaEntries.map(([key, val]) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 bg-slate-800/60 text-slate-300 text-xs px-2 py-1 rounded-md"
                      >
                        <span className="text-slate-500 font-medium">{key}:</span>
                        <span>{String(val)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
