import axios from "axios";
import type { ApiClient, MetricsSummary, Finding, Target, AlertRule, Connector, Integration, AuditLogEntry, Organization } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dwg_token");
  const org = localStorage.getItem("dwg_org");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (org) {
    config.headers["X-Org-Id"] = org;
  }
  return config;
});

export const realClient: ApiClient = {
  async getSummary(): Promise<MetricsSummary> {
    const { data } = await api.get("/metrics/summary");
    return data;
  },
  async listFindings(): Promise<Finding[]> {
    const { data } = await api.get("/findings");
    return data;
  },
  async listTargets(): Promise<Target[]> {
    const { data } = await api.get("/targets");
    return data;
  },
  async listAlertRules(): Promise<AlertRule[]> {
    const { data } = await api.get("/alert-rules");
    return data;
  },
  async listConnectors(): Promise<Connector[]> {
    const { data } = await api.get("/connectors");
    return data;
  },
  async listIntegrations(): Promise<Integration[]> {
    const { data } = await api.get("/integrations");
    return data;
  },
  async listAuditLog(): Promise<AuditLogEntry[]> {
    const { data } = await api.get("/audit-log");
    return data;
  },
  async listOrganizations(): Promise<Organization[]> {
    const { data } = await api.get("/orgs");
    return data;
  },
};
