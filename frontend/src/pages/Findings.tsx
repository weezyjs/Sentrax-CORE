import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Finding } from "../api/types";

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function exportCSV(findings: Finding[]): void {
  const headers = [
    "Entity",
    "Source",
    "Severity",
    "Exposure Types",
    "Confidence",
    "Date",
    "Raw Snippet",
  ];
  const rows = findings.map((f) => [
    f.matched_entity,
    f.source,
    f.severity,
    f.exposure_types.join("; "),
    String(f.confidence),
    f.created_at,
    f.raw_snippet.replace(/"/g, '""'),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `findings-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export const Findings: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .listFindings()
      .then(setFindings)
      .finally(() => setLoading(false));
  }, []);

  const sources = Array.from(new Set(findings.map((f) => f.source)));

  const filtered = findings.filter((f) => {
    if (severityFilter !== "All" && f.severity.toLowerCase() !== severityFilter.toLowerCase()) {
      return false;
    }
    if (sourceFilter !== "All" && f.source !== sourceFilter) {
      return false;
    }
    if (
      searchQuery &&
      !f.matched_entity.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const severityClass = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case "high":
        return "badge-high";
      case "medium":
        return "badge-medium";
      case "low":
        return "badge-low";
      default:
        return "badge-low";
    }
  };

  return (
    <div className="card" style={{ backgroundColor: "var(--color-slate-900, #0f172a)" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
            Findings
          </h2>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
        >
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-3 mb-6"
        style={{
          padding: "12px 16px",
          backgroundColor: "var(--color-slate-800, #1e293b)",
          borderRadius: "8px",
        }}
      >
        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>
            Severity
          </span>
          <div className="flex gap-1">
            {["All", "High", "Medium", "Low"].map((level) => (
              <button
                key={level}
                onClick={() => setSeverityFilter(level)}
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  backgroundColor:
                    severityFilter === level
                      ? "var(--color-accent, #38bdf8)"
                      : "var(--color-slate-700, #334155)",
                  color:
                    severityFilter === level ? "#0f172a" : "#cbd5e1",
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>
            Source
          </span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              borderRadius: "6px",
              border: "1px solid var(--color-slate-600, #475569)",
              backgroundColor: "var(--color-slate-700, #334155)",
              color: "#cbd5e1",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="All">All Sources</option>
            {sources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2" style={{ marginLeft: "auto" }}>
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "6px",
              border: "1px solid var(--color-slate-600, #475569)",
              backgroundColor: "var(--color-slate-700, #334155)",
              color: "#f1f5f9",
              outline: "none",
              minWidth: "200px",
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div
          className="flex justify-center items-center"
          style={{ padding: "48px 0", color: "#64748b" }}
        >
          Loading findings...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex justify-center items-center"
          style={{ padding: "48px 0", color: "#64748b" }}
        >
          No findings match the current filters.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          {/* Table Header */}
          <div
            className="table-header"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 100px 2fr 120px 100px",
              gap: "12px",
              padding: "10px 16px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#64748b",
              borderBottom: "1px solid var(--color-slate-800, #1e293b)",
            }}
          >
            <span>Entity</span>
            <span>Source</span>
            <span>Severity</span>
            <span>Exposure Types</span>
            <span>Confidence</span>
            <span>Date</span>
          </div>

          {/* Table Rows */}
          {filtered.map((finding) => (
            <React.Fragment key={finding.id}>
              <div
                className="table-row"
                onClick={() =>
                  setExpandedId(expandedId === finding.id ? null : finding.id)
                }
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 100px 2fr 120px 100px",
                  gap: "12px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                  borderBottom: "1px solid var(--color-slate-800, #1e293b)",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  backgroundColor:
                    expandedId === finding.id
                      ? "var(--color-slate-800, #1e293b)"
                      : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (expandedId !== finding.id) {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-slate-850, #172033)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (expandedId !== finding.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {/* Entity */}
                <span
                  style={{
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {finding.matched_entity}
                </span>

                {/* Source */}
                <span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderRadius: "9999px",
                      backgroundColor: "var(--color-slate-700, #334155)",
                      color: "#94a3b8",
                    }}
                  >
                    {finding.source}
                  </span>
                </span>

                {/* Severity */}
                <span>
                  <span className={severityClass(finding.severity)}>
                    {finding.severity}
                  </span>
                </span>

                {/* Exposure Types */}
                <span className="flex flex-wrap gap-1" style={{ alignItems: "center" }}>
                  {finding.exposure_types.map((type) => (
                    <span
                      key={type}
                      style={{
                        display: "inline-block",
                        padding: "1px 6px",
                        fontSize: "10px",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-slate-700, #334155)",
                        color: "#94a3b8",
                        border: "1px solid var(--color-slate-600, #475569)",
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </span>

                {/* Confidence */}
                <span className="flex items-center gap-2">
                  <div
                    style={{
                      flex: 1,
                      height: "6px",
                      borderRadius: "3px",
                      backgroundColor: "var(--color-slate-700, #334155)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round(finding.confidence * 100)}%`,
                        height: "100%",
                        borderRadius: "3px",
                        backgroundColor:
                          finding.confidence >= 0.8
                            ? "#ef4444"
                            : finding.confidence >= 0.5
                            ? "#f59e0b"
                            : "#22c55e",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      minWidth: "32px",
                      textAlign: "right",
                    }}
                  >
                    {Math.round(finding.confidence * 100)}%
                  </span>
                </span>

                {/* Date */}
                <span
                  style={{ fontSize: "12px", color: "#64748b" }}
                  title={new Date(finding.created_at).toLocaleString()}
                >
                  {timeAgo(finding.created_at)}
                </span>
              </div>

              {/* Expanded Row - Raw Snippet */}
              {expandedId === finding.id && (
                <div
                  style={{
                    padding: "16px 24px",
                    backgroundColor: "var(--color-slate-950, #020617)",
                    borderBottom: "1px solid var(--color-slate-800, #1e293b)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#64748b",
                      marginBottom: "8px",
                    }}
                  >
                    Raw Snippet
                  </div>
                  <pre
                    style={{
                      padding: "12px 16px",
                      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                      fontSize: "12px",
                      lineHeight: "1.6",
                      color: "#e2e8f0",
                      backgroundColor: "var(--color-slate-900, #0f172a)",
                      border: "1px solid var(--color-slate-700, #334155)",
                      borderRadius: "6px",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      margin: 0,
                    }}
                  >
                    <code>{finding.raw_snippet}</code>
                  </pre>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
