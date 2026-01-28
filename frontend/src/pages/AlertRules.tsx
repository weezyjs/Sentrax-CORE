import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { AlertRule } from "../api/types";

export const AlertRules: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);

  useEffect(() => {
    apiClient.listAlertRules().then(setRules);
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Alert Rules</h2>
        <button className="bg-accent text-slate-950 px-4 py-2 rounded-lg font-semibold">Create Rule</button>
      </div>
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border border-slate-800 rounded-lg p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{rule.name}</div>
                <div className="text-xs text-slate-400">Schedule: {rule.schedule}</div>
              </div>
              <button className="text-accent">Test Alert</button>
            </div>
            <div className="text-xs text-slate-400 mt-2">Recipients: {JSON.stringify(rule.recipients)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
