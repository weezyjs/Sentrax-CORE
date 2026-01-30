import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Targets } from "./pages/Targets";
import { Findings } from "./pages/Findings";
import { AlertRules } from "./pages/AlertRules";
import { Connectors } from "./pages/Connectors";
import { Integrations } from "./pages/Integrations";
import { AuditLog } from "./pages/AuditLog";
import { Admin } from "./pages/Admin";
import { TenantSelector } from "./pages/TenantSelector";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/alert-rules" element={<AlertRules />} />
          <Route path="/connectors" element={<Connectors />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tenant" element={<TenantSelector />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
