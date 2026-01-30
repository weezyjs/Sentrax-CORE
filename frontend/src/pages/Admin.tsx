import React, { useEffect, useState } from "react";
import { apiClient } from "../api";
import type { Organization } from "../api/types";

type Tab = "organizations" | "users";

interface DemoUser {
  email: string;
  role: "SUPER_ADMIN" | "ORG_ADMIN" | "ANALYST" | "VIEWER";
  status: string;
  lastLogin: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@sentrax.io",
    role: "SUPER_ADMIN",
    status: "Active",
    lastLogin: "2026-01-30 08:14 UTC",
  },
  {
    email: "analyst@sentrax.io",
    role: "ANALYST",
    status: "Active",
    lastLogin: "2026-01-29 17:42 UTC",
  },
  {
    email: "viewer@sentrax.io",
    role: "VIEWER",
    status: "Active",
    lastLogin: "2026-01-28 09:05 UTC",
  },
];

const ROLE_COLORS: Record<DemoUser["role"], string> = {
  SUPER_ADMIN: "bg-red-500/20 text-red-400 border border-red-500/30",
  ORG_ADMIN: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  ANALYST: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  VIEWER: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
};

const RBAC_ROLES = [
  {
    role: "SUPER_ADMIN",
    description: "Full platform control",
    permissions: [
      "Manage all organizations",
      "Create and delete users",
      "Access all threat data",
      "Modify system configuration",
    ],
  },
  {
    role: "ORG_ADMIN",
    description: "Organization-level management",
    permissions: [
      "Manage own organization",
      "Invite and remove org members",
      "View all org threat data",
      "Configure org-level settings",
    ],
  },
  {
    role: "ANALYST",
    description: "Threat analysis and investigation",
    permissions: [
      "View assigned threat feeds",
      "Create and update reports",
      "Run threat queries",
      "Export analysis data",
    ],
  },
  {
    role: "VIEWER",
    description: "Read-only dashboard access",
    permissions: [
      "View dashboards and reports",
      "View threat summaries",
      "Access public indicators",
      "Download published reports",
    ],
  },
];

export const Admin: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("organizations");

  useEffect(() => {
    apiClient.listOrganizations().then(setOrgs);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Administration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage organizations, users, and role-based access controls
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg w-fit border border-slate-800">
        <button
          onClick={() => setActiveTab("organizations")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "organizations"
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Organizations
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "users"
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Users
        </button>
      </div>

      {/* Organizations Tab */}
      {activeTab === "organizations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Organizations ({orgs.length})
            </h2>
            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-slate-950 hover:brightness-110 transition-all">
              Create Org
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="card bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-base">
                      {org.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {org.id}
                    </p>
                  </div>
                  {org.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/25">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-500/25">
                      Disabled
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>-- members</span>
                  </div>
                </div>

                <button className="w-full mt-auto py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all">
                  Manage
                </button>
              </div>
            ))}

            {orgs.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                No organizations found. Create one to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Users ({DEMO_USERS.length})
            </h2>
            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-slate-950 hover:brightness-110 transition-all">
              Add User
            </button>
          </div>

          <div className="card bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {DEMO_USERS.map((user) => (
                  <tr
                    key={user.email}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-white font-medium">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role]}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                      {user.lastLogin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RBAC Explanation */}
      <div className="card bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">
          Role-Based Access Control
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          SentraX-CORE enforces four hierarchical roles across the platform.
          Each role inherits permissions from the level below it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {RBAC_ROLES.map((item) => (
            <div
              key={item.role}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-3"
            >
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    ROLE_COLORS[item.role as DemoUser["role"]]
                  }`}
                >
                  {item.role}
                </span>
                <p className="text-xs text-slate-400 mt-2">
                  {item.description}
                </p>
              </div>
              <ul className="space-y-1.5">
                {item.permissions.map((perm) => (
                  <li
                    key={perm}
                    className="flex items-start gap-2 text-xs text-slate-300"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
