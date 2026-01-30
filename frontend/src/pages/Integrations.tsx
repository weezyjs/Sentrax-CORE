import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Integration } from "../api/types";

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    apiClient.listIntegrations().then(setIntegrations);
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Integrations</h2>
        <button className="bg-accent text-slate-950 px-4 py-2 rounded-lg font-semibold">Add Integration</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-2">Name</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {integrations.map((integration) => (
            <tr key={integration.id} className="border-b border-slate-900">
              <td className="py-3">{integration.name}</td>
              <td>{integration.integration_type}</td>
              <td className="text-slate-400">{integration.last_test_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
