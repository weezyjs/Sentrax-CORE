import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Finding, MetricsSummary } from "../api/types";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

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
  { name: "Hashes", count: 3 },
];

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const cls = severity === "high" ? "badge-high" : severity === "medium" ? "badge-medium" : "badge-low";
  return <span className={cls}>{severity.toUpperCase()}</span>;
};

const ThreatLevel: React.FC<{ high: number; medium: number; low: number }> = ({ high, medium, low }) => {
  const total = high + medium + low;
  const score = total > 0 ? Math.round(((high * 3 + medium * 2 + low) / (total * 3)) * 100) : 0;
  const label = score >= 70 ? "CRITICAL" : score >= 40 ? "ELEVATED" : "LOW";
  const color = score >= 70 ? "#f43f5e" : score >= 40 ? "#f59e0b" : "#4de1c1";
  const circumference = 2 * Math.PI * 42;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="threat-ring">
        <svg width="120" height="120">
          <circle cx="60" cy="60" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashoffset}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)`, transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-slate-400">/ 100</span>
        </div>
      </div>
      <div className="mt-3 text-xs font-bold tracking-wider" style={{ color }}>{label}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">Threat Score</div>
    </div>
  );
};

const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => {
  const color = value >= 80 ? "bg-danger-400" : value >= 50 ? "bg-warning-400" : "bg-cyber-300";
  return (
    <div className="confidence-bar w-16">
      <div className={`confidence-fill ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
};

const timeAgo = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);

  useEffect(() => {
    apiClient.getSummary().then(setSummary);
    apiClient.listFindings().then(setFindings);
  }, []);

  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;

  const pieData = [
    { name: "High", value: highCount, color: "#f43f5e" },
    { name: "Medium", value: mediumCount, color: "#f59e0b" },
    { name: "Low", value: lowCount, color: "#4de1c1" },
  ];

  return (
    <div className="space-y-8">
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-hover border-l-2 border-l-danger-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Critical Findings</div>
              <div className="text-3xl font-bold text-danger-400 mt-1">{highCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-danger-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Credentials & hashes exposed</div>
        </div>

        <div className="card-hover border-l-2 border-l-warning-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Medium Findings</div>
              <div className="text-3xl font-bold text-warning-400 mt-1">{mediumCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">PII leaks detected</div>
        </div>

        <div className="card-hover border-l-2 border-l-cyber-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active Connectors</div>
              <div className="text-3xl font-bold text-cyber-300 mt-1">{summary?.connectors ?? 0}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyber-300/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Data sources active</div>
        </div>

        <div className="card-hover border-l-2 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Alert Rules</div>
              <div className="text-3xl font-bold text-blue-400 mt-1">{summary?.alert_rules ?? 0}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Automated response rules</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center justify-center py-8">
          <ThreatLevel high={highCount} medium={mediumCount} low={lowCount} />
          <div className="grid grid-cols-3 gap-6 mt-6 w-full px-4">
            <div className="text-center"><div className="text-lg font-bold text-danger-400">{highCount}</div><div className="text-[10px] text-slate-500 uppercase">High</div></div>
            <div className="text-center"><div className="text-lg font-bold text-warning-400">{mediumCount}</div><div className="text-[10px] text-slate-500 uppercase">Medium</div></div>
            <div className="text-center"><div className="text-lg font-bold text-cyber-300">{lowCount}</div><div className="text-[10px] text-slate-500 uppercase">Low</div></div>
          </div>
        </div>

        <div className="card h-72">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">Findings Trend (7 days)</div>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trendData}>
              <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#94a3b8" }} />
              <Line type="monotone" dataKey="findings" stroke="#4de1c1" strokeWidth={2.5} dot={{ r: 4, fill: "#0a0e1a", stroke: "#4de1c1", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#4de1c1" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-72">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">Exposure Breakdown</div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={exposureData} barSize={32}>
              <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }} cursor={{ fill: "rgba(77,225,193,0.05)" }} />
              <Bar dataKey="count" fill="#4de1c1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity pie + recent findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">Severity Distribution</div>
          <div className="flex justify-center">
            <PieChart width={200} height={200}>
              <Pie data={pieData} cx={100} cy={100} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </div>
          <div className="flex justify-center gap-5 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                <span className="text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Recent Findings</div>
            <Link to="/findings" className="text-xs text-cyber-300 hover:text-cyber-200 transition-colors">View all &rarr;</Link>
          </div>
          <div className="space-y-2">
            {findings.slice(0, 6).map((finding) => (
              <div key={finding.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className="shrink-0"><SeverityBadge severity={finding.severity} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{finding.matched_entity}</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{finding.source}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{finding.raw_snippet}</div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <ConfidenceBar value={finding.confidence} />
                  <span className="text-[10px] text-slate-500 w-12 text-right">{timeAgo(finding.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
