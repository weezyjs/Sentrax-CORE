export type Role = "SUPER_ADMIN" | "ORG_ADMIN" | "ANALYST" | "VIEWER";

export interface MetricsSummary {
  findings: number;
  connectors: number;
  alert_rules: number;
}

export interface Finding {
  id: string;
  source: string;
  confidence: number;
  matched_entity: string;
  exposure_types: string[];
  raw_snippet: string;
  severity: string;
  created_at: string;
}

export interface Target {
  id: string;
  target_type: string;
  value: string;
  metadata?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  recipients: Record<string, unknown>;
  filters: Record<string, unknown>;
  redaction_policy: Record<string, unknown>;
  schedule: string;
  is_active: boolean;
}

export interface Connector {
  id: string;
  name: string;
  connector_type: string;
  is_active: boolean;
  last_run_status: string;
}

export interface Integration {
  id: string;
  name: string;
  integration_type: string;
  is_active: boolean;
  last_test_status: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor_id?: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  is_active: boolean;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  org_id?: string;
}

export interface ApiClient {
  getSummary(): Promise<MetricsSummary>;
  listFindings(): Promise<Finding[]>;
  listTargets(): Promise<Target[]>;
  listAlertRules(): Promise<AlertRule[]>;
  listConnectors(): Promise<Connector[]>;
  listIntegrations(): Promise<Integration[]>;
  listAuditLog(): Promise<AuditLogEntry[]>;
  listOrganizations(): Promise<Organization[]>;
}
