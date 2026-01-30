import type { ApiClient, MetricsSummary, Finding, Target, AlertRule, Connector, Integration, AuditLogEntry, Organization } from "./types";

const demoOrg: Organization = { id: "org-demo", name: "Sentrax Labs", is_active: true };

const demoFindings: Finding[] = [
  {
    id: "f-1",
    source: "hibp",
    confidence: 90,
    matched_entity: "security@sentrax.io",
    exposure_types: ["email", "password"],
    raw_snippet: "Credential exposure in public breach index.",
    severity: "high",
    created_at: new Date().toISOString(),
  },
  {
    id: "f-2",
    source: "rss",
    confidence: 45,
    matched_entity: "Sentrax",
    exposure_types: ["mention"],
    raw_snippet: "Company name mentioned in paste-like feed.",
    severity: "low",
    created_at: new Date().toISOString(),
  },
];

const demoTargets: Target[] = [
  { id: "t-1", target_type: "email", value: "security@sentrax.io" },
  { id: "t-2", target_type: "company", value: "Sentrax" },
];

const demoAlertRules: AlertRule[] = [
  {
    id: "ar-1",
    name: "Critical credential exposure",
    recipients: { emails: ["soc@sentrax.io"] },
    filters: { severity: ["high"] },
    redaction_policy: { remove_fields: ["raw_snippet"] },
    schedule: "0 */6 * * *",
    is_active: true,
  },
];

const demoConnectors: Connector[] = [
  { id: "c-1", name: "HIBP", connector_type: "hibp", is_active: true, last_run_status: "ok" },
  { id: "c-2", name: "Demo Feed", connector_type: "demo", is_active: true, last_run_status: "ok" },
];

const demoIntegrations: Integration[] = [
  { id: "i-1", name: "Jira", integration_type: "jira", is_active: true, last_test_status: "success" },
  { id: "i-2", name: "Microsoft Teams", integration_type: "o365", is_active: true, last_test_status: "success" },
];

const demoAudit: AuditLogEntry[] = [
  {
    id: "a-1",
    action: "create_target",
    actor_id: "u-1",
    payload: { target: "security@sentrax.io" },
    created_at: new Date().toISOString(),
  },
  {
    id: "a-2",
    action: "run_connector",
    actor_id: "system",
    payload: { connector: "HIBP" },
    created_at: new Date().toISOString(),
  },
];

export const mockClient: ApiClient = {
  async getSummary(): Promise<MetricsSummary> {
    return { findings: demoFindings.length, connectors: demoConnectors.length, alert_rules: demoAlertRules.length };
  },
  async listFindings(): Promise<Finding[]> {
    return demoFindings;
  },
  async listTargets(): Promise<Target[]> {
    return demoTargets;
  },
  async listAlertRules(): Promise<AlertRule[]> {
    return demoAlertRules;
  },
  async listConnectors(): Promise<Connector[]> {
    return demoConnectors;
  },
  async listIntegrations(): Promise<Integration[]> {
    return demoIntegrations;
  },
  async listAuditLog(): Promise<AuditLogEntry[]> {
    return demoAudit;
  },
  async listOrganizations(): Promise<Organization[]> {
    return [demoOrg];
  },
};
