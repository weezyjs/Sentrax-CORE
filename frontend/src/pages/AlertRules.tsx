import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { AlertRule } from "../api/types";

/* ------------------------------------------------------------------ */
/*  Helper utilities                                                   */
/* ------------------------------------------------------------------ */

/** Map severity labels to badge colour classes. */
const severityColor = (sev: string): string => {
  switch (sev.toLowerCase()) {
    case "critical":
      return "bg-red-600 text-red-100";
    case "high":
      return "bg-orange-600 text-orange-100";
    case "medium":
      return "bg-yellow-600 text-yellow-100";
    case "low":
      return "bg-blue-600 text-blue-100";
    case "info":
      return "bg-slate-600 text-slate-200";
    default:
      return "bg-slate-700 text-slate-300";
  }
};

/** Produce a human-readable recipients summary such as "2 emails, 1 webhook". */
const summarizeRecipients = (
  recipients: Record<string, unknown>,
): string => {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(recipients)) {
    const count = Array.isArray(value) ? value.length : 1;
    const label = key.toLowerCase();

    if (label.includes("email")) {
      parts.push(`${count} email${count !== 1 ? "s" : ""}`);
    } else if (label.includes("webhook")) {
      parts.push(`${count} webhook${count !== 1 ? "s" : ""}`);
    } else if (label.includes("slack")) {
      parts.push(`${count} Slack channel${count !== 1 ? "s" : ""}`);
    } else if (label.includes("pagerduty") || label.includes("pager_duty")) {
      parts.push(`${count} PagerDuty target${count !== 1 ? "s" : ""}`);
    } else {
      parts.push(`${count} ${label}`);
    }
  }

  return parts.length > 0 ? parts.join(", ") : "No recipients";
};

/** Count the total number of individual recipients across all channels. */
const countRecipients = (recipients: Record<string, unknown>): number => {
  let total = 0;
  for (const value of Object.values(recipients)) {
    total += Array.isArray(value) ? value.length : 1;
  }
  return total;
};

/** Check whether a redaction policy has any configured fields. */
const hasRedactionFields = (policy: Record<string, unknown>): boolean => {
  if (!policy || typeof policy !== "object") return false;
  const fields = policy.fields ?? policy.redact_fields ?? policy.patterns;
  if (Array.isArray(fields) && fields.length > 0) return true;
  return Object.keys(policy).length > 0;
};

/** Collect filter entries into a flat list of { category, value } pairs. */
const flattenFilters = (
  filters: Record<string, unknown>,
): { category: string; value: string }[] => {
  const result: { category: string; value: string }[] = [];

  for (const [key, val] of Object.entries(filters)) {
    if (Array.isArray(val)) {
      val.forEach((v) => result.push({ category: key, value: String(v) }));
    } else if (val !== null && val !== undefined) {
      result.push({ category: key, value: String(val) });
    }
  }

  return result;
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Small inline SVG shield icon for the redaction indicator. */
const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className ?? "w-4 h-4"}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-1.078 0-2.578.587-3.924 1.208C6.704 4.094 5.39 4.875 4.875 5.25a.75.75
         0 00-.375.65v5.35c0 4.108 2.943 7.582 7.125 9.488a.75.75 0 00.75 0C16.557
         18.832 19.5 15.358 19.5 11.25V5.9a.75.75 0 00-.375-.65c-.515-.375-1.829-1.156-3.201-1.792C14.578
         2.837 13.078 2.25 12 2.25zm0 1.5c.72 0 1.995.48 3.264 1.076 1.098.516
         2.153 1.13 2.736 1.493v5.931c0 3.398-2.427 6.378-6 8.093-3.573-1.715-6-4.695-6-8.093V6.32c.583-.364
         1.638-.977 2.736-1.493C9.995 4.23 11.28 3.75 12 3.75z"
      clipRule="evenodd"
    />
    <path d="M12 8.25a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5H12.75V15a.75.75 0 01-1.5 0v-2.25H9a.75.75 0 010-1.5h2.25V9a.75.75 0 01.75-.75z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export const AlertRules: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiClient
      .listAlertRules()
      .then(setRules)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      {/* ---- Header ---- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Alert Rules
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure automated alerts for dark-web findings and exposure events.
          </p>
        </div>
        <button className="btn-primary">+ Create Rule</button>
      </div>

      {/* ---- Loading state ---- */}
      {loading && (
        <p className="text-slate-500 text-sm py-12 text-center">
          Loading alert rules&hellip;
        </p>
      )}

      {/* ---- Empty state ---- */}
      {!loading && rules.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">
            No alert rules configured yet. Create your first rule to start
            receiving notifications.
          </p>
        </div>
      )}

      {/* ---- Rule cards ---- */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const active = rule.is_active;
          const filters = flattenFilters(rule.filters);
          const recipientCount = countRecipients(rule.recipients);
          const recipientSummary = summarizeRecipients(rule.recipients);
          const redacted = hasRedactionFields(rule.redaction_policy);

          return (
            <div
              key={rule.id}
              className={`card border-l-4 ${
                active
                  ? "border-l-green-500"
                  : "border-l-slate-600"
              } bg-slate-900/60 hover:bg-slate-800/70 transition-colors`}
            >
              {/* Row 1 -- name, status dot, schedule, actions */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Active / Inactive dot */}
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      active ? "bg-green-400" : "bg-slate-500"
                    }`}
                    title={active ? "Active" : "Inactive"}
                  />
                  <h3 className="text-base font-semibold text-slate-100 truncate">
                    {rule.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Schedule pill */}
                  <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-0.5 text-xs font-mono text-slate-300 border border-slate-700">
                    {rule.schedule}
                  </span>

                  {/* Test Alert button -- only for active rules */}
                  {active && (
                    <button className="btn-secondary btn-sm">
                      Test Alert
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2 -- filters, recipients, redaction */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                {/* Filter badges */}
                {filters.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                      Filters
                    </span>
                    {filters.map((f, idx) => {
                      const isSeverity =
                        f.category.toLowerCase() === "severity";
                      const colorClass = isSeverity
                        ? severityColor(f.value)
                        : "bg-slate-700 text-slate-300";
                      return (
                        <span
                          key={`${f.category}-${f.value}-${idx}`}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
                        >
                          {f.value}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Recipients summary */}
                <div className="flex items-center gap-2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-slate-500"
                    aria-hidden="true"
                  >
                    <path d="M3 4a2 2 0 00-2 2v1.106l8.514 4.484a1.5 1.5 0 001.472 0L19.5 7.106V6a2 2 0 00-2-2H3z" />
                    <path d="M19.5 8.894l-8.026 4.23a3 3 0 01-2.948 0L.5 8.894V14a2 2 0 002 2h15a2 2 0 002-2V8.894z" />
                  </svg>
                  <span className="text-xs text-slate-400">
                    {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                    <span className="text-slate-600 mx-1">&middot;</span>
                    {recipientSummary}
                  </span>
                </div>

                {/* Redaction policy indicator */}
                {redacted && (
                  <div
                    className="flex items-center gap-1.5 text-emerald-400"
                    title="Redaction policy active"
                  >
                    <ShieldIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Redaction</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
