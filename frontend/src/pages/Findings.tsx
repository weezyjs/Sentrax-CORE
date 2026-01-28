import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Finding } from "../api/types";

export const Findings: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);

  useEffect(() => {
    apiClient.listFindings().then(setFindings);
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Findings</h2>
        <button className="bg-slate-800 text-slate-100 px-4 py-2 rounded-lg">Export CSV</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-2">Entity</th>
            <th>Source</th>
            <th>Severity</th>
            <th>Exposure</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding) => (
            <tr key={finding.id} className="border-b border-slate-900">
              <td className="py-3">{finding.matched_entity}</td>
              <td>{finding.source}</td>
              <td className="text-accent font-semibold">{finding.severity}</td>
              <td className="text-slate-400">{finding.exposure_types.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
