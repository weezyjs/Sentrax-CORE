import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Target } from "../api/types";

export const Targets: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    apiClient.listTargets().then(setTargets);
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Monitor Targets</h2>
        <button className="bg-accent text-slate-950 px-4 py-2 rounded-lg font-semibold">Add Target</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-2">Type</th>
            <th>Value</th>
            <th>Metadata</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((target) => (
            <tr key={target.id} className="border-b border-slate-900">
              <td className="py-3">{target.target_type}</td>
              <td>{target.value}</td>
              <td className="text-slate-400">{target.metadata ? JSON.stringify(target.metadata) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
