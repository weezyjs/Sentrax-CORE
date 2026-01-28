import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { AuditLogEntry } from "../api/types";

export const AuditLog: React.FC = () => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    apiClient.listAuditLog().then(setEntries);
  }, []);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-6">Audit Log</h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="border border-slate-800 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{entry.action}</span>
              <span className="text-slate-400">{new Date(entry.created_at).toLocaleString()}</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">{JSON.stringify(entry.payload)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
