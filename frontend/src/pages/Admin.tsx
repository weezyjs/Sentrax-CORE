import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Organization } from "../api/types";

export const Admin: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);

  useEffect(() => {
    apiClient.listOrganizations().then(setOrgs);
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Organizations</h2>
        <button className="bg-accent text-slate-950 px-4 py-2 rounded-lg font-semibold">Create Org</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-2">Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr key={org.id} className="border-b border-slate-900">
              <td className="py-3">{org.name}</td>
              <td className="text-slate-400">{org.is_active ? "Active" : "Disabled"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
