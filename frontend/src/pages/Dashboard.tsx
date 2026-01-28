import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Finding, MetricsSummary } from "../api/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const trendData = [
  { name: "Mon", findings: 2 },
  { name: "Tue", findings: 5 },
  { name: "Wed", findings: 3 },
  { name: "Thu", findings: 8 },
  { name: "Fri", findings: 4 },
  { name: "Sat", findings: 6 },
  { name: "Sun", findings: 1 },
];

const exposureData = [
  { name: "Credentials", count: 6 },
  { name: "PII", count: 4 },
  { name: "Mentions", count: 8 },
];

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);

  useEffect(() => {
    apiClient.getSummary().then(setSummary);
    apiClient.listFindings().then(setFindings);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-sm text-slate-400">Findings</div>
          <div className="text-3xl font-bold text-accent mt-2">{summary?.findings ?? 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">Connectors</div>
          <div className="text-3xl font-bold text-accent mt-2">{summary?.connectors ?? 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">Alert Rules</div>
          <div className="text-3xl font-bold text-accent mt-2">{summary?.alert_rules ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card h-72">
          <div className="text-sm text-slate-400 mb-4">Findings Over Time</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="findings" stroke="#4de1c1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card h-72">
          <div className="text-sm text-slate-400 mb-4">Top Exposure Types</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={exposureData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#4de1c1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-slate-400 mb-4">Latest Findings</div>
        <div className="space-y-3">
          {findings.slice(0, 5).map((finding) => (
            <div key={finding.id} className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <div className="font-semibold">{finding.matched_entity}</div>
                <div className="text-xs text-slate-400">{finding.source}</div>
              </div>
              <span className="badge">{finding.severity.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
