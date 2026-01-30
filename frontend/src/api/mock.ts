import type { ApiClient, MetricsSummary, Finding, Target, AlertRule, Connector, Integration, AuditLogEntry, Organization } from "./types";

const demoOrg: Organization = { id: "org-demo", name: "Sentrax Labs", is_active: true };
const demoOrg2: Organization = { id: "org-acme", name: "Acme Corp", is_active: true };

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

const demoFindings: Finding[] = [
  {
    id: "f-1",
    source: "hibp",
    confidence: 95,
    matched_entity: "admin@sentrax.io",
    exposure_types: ["email", "password", "hash"],
    raw_snippet: "Credential pair found in BreachCompilation-2024. bcrypt hash and plaintext password included.",
    severity: "high",
    created_at: ago(2),
  },
  {
    id: "f-2",
    source: "dehashed",
    confidence: 88,
    matched_entity: "john.doe@sentrax.io",
    exposure_types: ["email", "password"],
    raw_snippet: "Email and password combo exposed in LinkedIn-style breach dataset.",
    severity: "high",
    created_at: ago(5),
  },
  {
    id: "f-3",
    source: "hibp",
    confidence: 72,
    matched_entity: "hr@sentrax.io",
    exposure_types: ["email", "phone", "address"],
    raw_snippet: "PII exposure including phone number and physical address. No credentials.",
    severity: "medium",
    created_at: ago(12),
  },
  {
    id: "f-4",
    source: "rss",
    confidence: 60,
    matched_entity: "dev-ops@sentrax.io",
    exposure_types: ["email", "username"],
    raw_snippet: "Username and email found in misconfigured S3 bucket dump RSS feed.",
    severity: "medium",
    created_at: ago(18),
  },
  {
    id: "f-5",
    source: "public_paste",
    confidence: 45,
    matched_entity: "Sentrax Labs",
    exposure_types: ["mention"],
    raw_snippet: "Company name mentioned alongside other tech firms in paste-like public forum.",
    severity: "low",
    created_at: ago(24),
  },
  {
    id: "f-6",
    source: "rss",
    confidence: 38,
    matched_entity: "Sentrax",
    exposure_types: ["mention"],
    raw_snippet: "Company reference found in OSINT aggregator feed discussion thread.",
    severity: "low",
    created_at: ago(36),
  },
  {
    id: "f-7",
    source: "generic_rest",
    confidence: 82,
    matched_entity: "cto@sentrax.io",
    exposure_types: ["email", "hash"],
    raw_snippet: "SHA-256 hash found in credential dump via REST API collector.",
    severity: "high",
    created_at: ago(48),
  },
  {
    id: "f-8",
    source: "hibp",
    confidence: 55,
    matched_entity: "marketing@sentrax.io",
    exposure_types: ["email"],
    raw_snippet: "Email address listed in known breach dataset without credentials.",
    severity: "low",
    created_at: ago(72),
  },
  {
    id: "f-9",
    source: "dehashed",
    confidence: 91,
    matched_entity: "sysadmin@sentrax.io",
    exposure_types: ["email", "password", "username"],
    raw_snippet: "Full credential set including username, email, and cleartext password.",
    severity: "high",
    created_at: ago(8),
  },
  {
    id: "f-10",
    source: "rss",
    confidence: 65,
    matched_entity: "finance@sentrax.io",
    exposure_types: ["email", "phone"],
    raw_snippet: "Email and phone number found in data broker leak notification.",
    severity: "medium",
    created_at: ago(40),
  },
];

const demoTargets: Target[] = [
  { id: "t-1", target_type: "email", value: "admin@sentrax.io", metadata: { department: "IT", priority: "critical" } },
  { id: "t-2", target_type: "email", value: "john.doe@sentrax.io", metadata: { department: "Engineering" } },
  { id: "t-3", target_type: "email", value: "hr@sentrax.io", metadata: { department: "Human Resources" } },
  { id: "t-4", target_type: "email", value: "cto@sentrax.io", metadata: { department: "Executive", priority: "critical" } },
  { id: "t-5", target_type: "email", value: "sysadmin@sentrax.io", metadata: { department: "IT", priority: "high" } },
  { id: "t-6", target_type: "domain", value: "sentrax.io", metadata: { type: "primary_domain" } },
  { id: "t-7", target_type: "company", value: "Sentrax Labs", metadata: { aliases: ["Sentrax", "SentraX"] } },
  { id: "t-8", target_type: "email", value: "finance@sentrax.io", metadata: { department: "Finance" } },
];

const demoAlertRules: AlertRule[] = [
  {
    id: "ar-1",
    name: "Critical Credential Exposure",
    recipients: { emails: ["soc@sentrax.io", "ciso@sentrax.io"], webhooks: ["https://hooks.slack.com/sentinel"] },
    filters: { severity: ["high"], exposure_types: ["password", "hash"] },
    redaction_policy: { remove_fields: ["raw_snippet"] },
    schedule: "0 */6 * * *",
    is_active: true,
  },
  {
    id: "ar-2",
    name: "PII Leak Detection",
    recipients: { emails: ["privacy@sentrax.io"], phones: ["+1555123456"] },
    filters: { severity: ["medium", "high"], exposure_types: ["phone", "address"] },
    redaction_policy: { mask_fields: ["matched_entity"] },
    schedule: "0 */12 * * *",
    is_active: true,
  },
  {
    id: "ar-3",
    name: "Executive VIP Monitor",
    recipients: { emails: ["ciso@sentrax.io"], webhooks: ["https://hooks.teams.ms/sentrax-vip"] },
    filters: { matched_entities: ["cto@sentrax.io", "admin@sentrax.io"] },
    redaction_policy: {},
    schedule: "0 * * * *",
    is_active: true,
  },
  {
    id: "ar-4",
    name: "Brand Mention Tracker",
    recipients: { emails: ["marketing@sentrax.io"] },
    filters: { severity: ["low"], exposure_types: ["mention"] },
    redaction_policy: {},
    schedule: "0 0 * * *",
    is_active: false,
  },
];

const demoConnectors: Connector[] = [
  { id: "c-1", name: "Have I Been Pwned", connector_type: "hibp", is_active: true, last_run_status: "stored:4" },
  { id: "c-2", name: "DeHashed API", connector_type: "dehashed", is_active: true, last_run_status: "stored:2" },
  { id: "c-3", name: "Threat Intel RSS", connector_type: "rss", is_active: true, last_run_status: "stored:1" },
  { id: "c-4", name: "Custom REST API", connector_type: "generic_rest", is_active: true, last_run_status: "stored:1" },
  { id: "c-5", name: "Public Paste Monitor", connector_type: "public_paste", is_active: true, last_run_status: "stored:0" },
  { id: "c-6", name: "Demo Data Feed", connector_type: "demo", is_active: false, last_run_status: "disabled" },
];

const demoIntegrations: Integration[] = [
  { id: "i-1", name: "Jira Service Desk", integration_type: "jira", is_active: true, last_test_status: "success" },
  { id: "i-2", name: "Microsoft Teams SOC Channel", integration_type: "o365", is_active: true, last_test_status: "success" },
  { id: "i-3", name: "Trellix ePO", integration_type: "trellix", is_active: true, last_test_status: "success" },
  { id: "i-4", name: "PagerDuty Webhook", integration_type: "webhook", is_active: true, last_test_status: "success" },
  { id: "i-5", name: "Slack SOC Alerts", integration_type: "webhook", is_active: false, last_test_status: "failed" },
];

const demoAudit: AuditLogEntry[] = [
  { id: "a-1", action: "login", actor_id: "admin@sentrax.io", payload: { ip: "10.0.1.42", user_agent: "Chrome/120" }, created_at: ago(0.5) },
  { id: "a-2", action: "run_connector", actor_id: "system", payload: { connector: "Have I Been Pwned", findings_stored: 4 }, created_at: ago(1) },
  { id: "a-3", action: "create_finding", actor_id: "system", payload: { severity: "high", entity: "admin@sentrax.io" }, created_at: ago(2) },
  { id: "a-4", action: "send_alert", actor_id: "system", payload: { rule: "Critical Credential Exposure", recipients: 2 }, created_at: ago(2.1) },
  { id: "a-5", action: "create_target", actor_id: "admin@sentrax.io", payload: { target: "finance@sentrax.io", type: "email" }, created_at: ago(4) },
  { id: "a-6", action: "update_connector", actor_id: "admin@sentrax.io", payload: { connector: "DeHashed API", field: "config" }, created_at: ago(6) },
  { id: "a-7", action: "test_integration", actor_id: "admin@sentrax.io", payload: { integration: "Jira Service Desk", result: "success" }, created_at: ago(8) },
  { id: "a-8", action: "create_alert_rule", actor_id: "admin@sentrax.io", payload: { rule: "Executive VIP Monitor" }, created_at: ago(12) },
  { id: "a-9", action: "run_connector", actor_id: "system", payload: { connector: "Threat Intel RSS", findings_stored: 1 }, created_at: ago(7) },
  { id: "a-10", action: "create_user", actor_id: "admin@sentrax.io", payload: { email: "analyst@sentrax.io", role: "ANALYST" }, created_at: ago(24) },
  { id: "a-11", action: "bootstrap_super_admin", actor_id: "system", payload: { email: "admin@sentrax.io" }, created_at: ago(168) },
  { id: "a-12", action: "update_alert_rule", actor_id: "admin@sentrax.io", payload: { rule: "Brand Mention Tracker", is_active: false }, created_at: ago(10) },
];

export const mockClient: ApiClient = {
  async getSummary(): Promise<MetricsSummary> {
    return {
      findings: demoFindings.length,
      connectors: demoConnectors.filter((c) => c.is_active).length,
      alert_rules: demoAlertRules.filter((r) => r.is_active).length,
    };
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
    return [demoOrg, demoOrg2];
  },
};
