// 🔐 SISGEAD 2.0 - Security & Compliance Types
// Definições TypeScript para sistema de segurança avançado e conformidade LGPD

import type { AuditLog } from './institutional';

// 🛡️ Multi-Factor Authentication
export interface MFAChallenge {
  id: string;
  userId: string;
  tenantId: string;
  method: 'totp' | 'sms' | 'email' | 'backup_code';
  challenge: string;
  expiresAt: Date;
  attemptsRemaining: number;
  createdAt: Date;
}

export interface MFADevice {
  id: string;
  userId: string;
  name: string;
  type: 'authenticator' | 'sms' | 'email';
  isActive: boolean;
  isPrimary: boolean;
  secret?: string; // For TOTP
  phoneNumber?: string; // For SMS
  email?: string; // For Email
  backupCodes?: string[];
  createdAt: Date;
  lastUsedAt?: Date;
}

// 🔒 Session Security
export interface SecureSession {
  id: string;
  userId: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: [number, number];
  };
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  riskScore: number;
  securityFlags: SecurityFlag[];
}

export interface SecurityFlag {
  type: 'suspicious_location' | 'unusual_time' | 'multiple_sessions' | 'failed_attempts' | 'device_change';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
}

// 🚨 Threat Detection
export interface ThreatAssessment {
  riskScore: number; // 0-100
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  factors: ThreatFactor[];
  recommendations: SecurityRecommendation[];
  shouldBlock: boolean;
  shouldAlert: boolean;
}

export interface ThreatFactor {
  type: 'geolocation' | 'velocity' | 'device_fingerprint' | 'behavioral' | 'time_based';
  weight: number;
  description: string;
  value: number;
}

export interface SecurityRecommendation {
  action: 'allow' | 'challenge_mfa' | 'force_logout' | 'block_ip' | 'alert_admin';
  priority: 'low' | 'medium' | 'high';
  reason: string;
  autoApply: boolean;
}

// 🌐 IP & Access Control
export interface IPAccessRule {
  id: string;
  tenantId?: string; // null = global rule
  ipPattern: string; // CIDR notation or single IP
  type: 'whitelist' | 'blacklist';
  description: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  expiresAt?: Date;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  matchedRule?: IPAccessRule;
  riskFactors: string[];
  recommendations: SecurityRecommendation[];
}

// 📊 Security Monitoring
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  tenantId: string;
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'mfa_challenge'
  | 'mfa_success'
  | 'mfa_failure'
  | 'session_created'
  | 'session_expired'
  | 'suspicious_activity'
  | 'brute_force_attempt'
  | 'geolocation_anomaly'
  | 'device_change'
  | 'privilege_escalation'
  | 'data_export'
  | 'configuration_change'
  | 'security_breach';

// 🇧🇷 LGPD Compliance
export interface PersonalDataMap {
  categories: PersonalDataCategory[];
  processors: DataProcessor[];
  legalBases: LegalBasis[];
  retentionPolicies: RetentionPolicy[];
  transfers: DataTransfer[];
}

export interface PersonalDataCategory {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  purposes: ProcessingPurpose[];
  legalBasis: LegalBasisType[];
  retentionPeriod: number; // days
  isActive: boolean;
}

export interface DataProcessor {
  id: string;
  name: string;
  type: 'controller' | 'processor' | 'joint_controller';
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  dpoContact?: {
    name: string;
    email: string;
    phone: string;
  };
  location: string;
  isEUBased: boolean;
  certifications: string[];
  contractDate?: Date;
}

export interface LegalBasis {
  id: string;
  type: LegalBasisType;
  description: string;
  article: string; // LGPD Article reference
  consentRequired: boolean;
  isActive: boolean;
}

export type LegalBasisType = 
  | 'consent'
  | 'legitimate_interest'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task';

export interface ProcessingPurpose {
  id: string;
  name: string;
  description: string;
  legalBasis: LegalBasisType;
  dataCategories: string[];
  retention: number; // days
  isActive: boolean;
}

export interface RetentionPolicy {
  id: string;
  tenantId: string;
  category: string;
  purpose: string;
  period: number; // days
  action: 'delete' | 'anonymize' | 'archive';
  isActive: boolean;
  createdAt: Date;
  lastApplied?: Date;
}

export interface DataTransfer {
  id: string;
  from: string;
  to: string;
  country: string;
  adequacyDecision: boolean;
  safeguards: string[];
  purpose: string;
  dataCategories: string[];
  frequency: 'one_time' | 'regular' | 'continuous';
  isActive: boolean;
}

// 📝 Consent Management
export interface ConsentRecord {
  id: string;
  userId: string;
  tenantId: string;
  purposes: ProcessingPurpose[];
  granularChoices: Record<string, boolean>;
  consentText: string;
  version: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  withdrawnAt?: Date;
  withdrawalReason?: string;
}

export interface ConsentHistory {
  userId: string;
  records: ConsentRecord[];
  currentConsent?: ConsentRecord;
  lastUpdated: Date;
}

// 📊 Data Subject Rights (LGPD Art. 18)
export interface DataSubjectRequest {
  id: string;
  userId: string;
  tenantId: string;
  type: DataSubjectRequestType;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: Date;
  completionDate?: Date;
  description?: string;
  response?: string;
  processedBy?: string;
  documents: RequestDocument[];
}

export type DataSubjectRequestType = 
  | 'access' // Art. 18, I
  | 'rectification' // Art. 18, II
  | 'anonymization' // Art. 18, III
  | 'blocking' // Art. 18, IV
  | 'deletion' // Art. 18, VI
  | 'portability' // Art. 18, V
  | 'information' // Art. 18, VII
  | 'consent_withdrawal'; // Art. 18, IX

export interface RequestDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// 📊 Data Export & Portability
export interface UserDataExport {
  userId: string;
  tenantId: string;
  exportDate: Date;
  format: 'json' | 'csv' | 'xml' | 'pdf';
  categories: ExportCategory[];
  metadata: {
    totalRecords: number;
    fileSize: number;
    retentionUntil: Date;
  };
}

export interface ExportCategory {
  name: string;
  description: string;
  recordCount: number;
  data: Record<string, any>[];
}

// 🗑️ Data Anonymization
export interface AnonymizationResult {
  userId: string;
  tenantId: string;
  processedAt: Date;
  strategy: 'pseudonymization' | 'generalization' | 'suppression' | 'randomization';
  affectedTables: string[];
  recordsProcessed: number;
  isReversible: boolean;
  retentionId?: string; // For pseudonymization
}

// 📋 Compliance Reporting
export interface ComplianceReport {
  id: string;
  tenantId: string;
  type: 'lgpd_audit' | 'data_inventory' | 'consent_status' | 'security_assessment';
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  status: 'draft' | 'final' | 'submitted';
  sections: ReportSection[];
  recommendations: ComplianceRecommendation[];
  score?: number;
}

export interface ReportSection {
  title: string;
  content: string;
  metrics: Record<string, number>;
  charts?: ChartData[];
  status: 'compliant' | 'partial' | 'non_compliant';
}

export interface ComplianceRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  action: string;
  deadline?: Date;
  implemented: boolean;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'donut';
  data: Record<string, number>;
  labels: Record<string, string>;
}

// 🔍 Audit Trail Enhancement
export interface AuditTrailQuery {
  tenantId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  actions?: string[];
  resources?: string[];
  severity?: ('low' | 'medium' | 'high')[];
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

export interface AuditTrailResult {
  logs: AuditLog[];
  total: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    totalPages: number;
  };
  aggregations: AuditAggregation[];
}

export interface AuditAggregation {
  field: string;
  buckets: Array<{
    key: string;
    count: number;
    percentage: number;
  }>;
}

// 🔒 Advanced Security Settings
export interface SecuritySettings {
  tenantId: string;
  mfa: {
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
    gracePeriod: number; // days before enforcement
    backupCodes: boolean;
  };
  session: {
    timeout: number; // minutes
    maxConcurrent: number;
    requireDeviceRegistration: boolean;
    trackLocation: boolean;
  };
  ipControl: {
    enabled: boolean;
    mode: 'whitelist' | 'blacklist' | 'monitoring';
    rules: IPAccessRule[];
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number; // days
    preventReuse: number; // last N passwords
  };
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      failedLogins: number;
      suspiciousActivities: number;
      dataExports: number;
    };
    notificationChannels: string[];
  };
}

// 🎯 Risk Assessment
export interface RiskAssessment {
  tenantId: string;
  assessmentDate: Date;
  overallRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  score: number; // 0-100
  categories: RiskCategory[];
  mitigationPlan: MitigationAction[];
  nextAssessment: Date;
}

export interface RiskCategory {
  name: string;
  risk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  score: number;
  factors: RiskFactor[];
  controls: SecurityControl[];
}

export interface RiskFactor {
  description: string;
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain';
  impact: 'insignificant' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  inherentRisk: number;
  residualRisk: number;
}

export interface SecurityControl {
  name: string;
  type: 'preventive' | 'detective' | 'corrective';
  effectiveness: 'low' | 'medium' | 'high';
  implemented: boolean;
  lastReview?: Date;
}

export interface MitigationAction {
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  owner: string;
  deadline: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  estimatedEffort: number; // hours
}