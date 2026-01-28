import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Connector } from "../api/types";

export const Connectors: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    apiClient.listConnectors().then(setConnectors);
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Connectors</h2>
        <button className="bg-accent text-slate-950 px-4 py-2 rounded-lg font-semibold">Add Connector</button>
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
          {connectors.map((connector) => (
            <tr key={connector.id} className="border-b border-slate-900">
              <td className="py-3">{connector.name}</td>
              <td>{connector.connector_type}</td>
              <td className="text-slate-400">{connector.last_run_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
