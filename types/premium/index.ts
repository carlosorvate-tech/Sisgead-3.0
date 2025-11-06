/**
 * SISGEAD Premium 3.0 - Premium Types Index
 * Exporta todos os tipos do sistema Premium
 * 
 * ATUALIZADO (05/11/2025): Adicionado tipos de Assessment, TeamMember, AuditLog e KPI
 */

// Import all types for internal use
import type {
  User,
  CreateUserData,
  UserPrivilegesSet
} from './user';

import type {
  Institution,
  CreateInstitutionData
} from './institution';

import type {
  Organization,
  CreateOrganizationData
} from './organization';

import type {
  AuditEntry
} from './audit';

import { UserRole } from './user';

// User types
export type {
  UserProfile,
  UserSecurity,
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserListResult,
  InstitutionalPrivileges,
  OrganizationalPrivileges,
  UserPrivileges,
  UserPrivilegesSet
} from './user';

export {
  UserRole,
  DEFAULT_PRIVILEGES
} from './user';

// Assessment types (NOVO - Sprint 1)
export type {
  Assessment,
  AssessmentResults,
  AssessmentSettings,
  AssessmentSummary,
  AssessmentFilters,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  ApprovalRequest
} from './assessment';

export {
  AssessmentStatus,
  AssessmentType,
  ASSESSMENT_RETENTION_DAYS,
  DEFAULT_ASSESSMENT_SETTINGS
} from './assessment';

// Team Member types (NOVO - Sprint 1)
export type {
  TeamMember,
  TransferEvent,
  MemberStats,
  TeamMemberSummary,
  TeamMemberFilters,
  AddMemberRequest,
  RemoveMemberRequest,
  TransferMemberRequest,
  UpdateMemberRequest
} from './teamMember';

export {
  MemberStatus,
  MemberRole,
  RemovalReason,
  MEMBER_RETENTION_DAYS,
  DEFAULT_MEMBER_PERMISSIONS
} from './teamMember';

// Audit Log types (NOVO - Sprint 1)
export type {
  TeamAuditLog,
  AuditEventDetails,
  ChangeDetail,
  AuditLogSummary,
  AuditLogFilters,
  CreateAuditLogRequest,
  AuditReport
} from './auditLog';

export {
  AuditEventType,
  AuditSeverity,
  KPICategory,
  createMemberAddedLog,
  createMemberRemovedLog,
  createMemberTransferredLog
} from './auditLog';

// KPI types (NOVO - Sprint 1)
export type {
  OrganizationKPIs,
  KPIFilters,
  KPICalculationRequest,
  KPIComparison,
  KPIDashboard,
  KPIAlert,
  KPIRecommendation
} from './kpi';

export {
  KPIMetric,
  KPIPeriod,
  KPITrend,
  KPI_THRESHOLDS,
  DEFAULT_KPI_PERIOD,
  calculateTurnoverRate,
  calculateRetentionRate,
  calculateTransferRate
} from './kpi';

// Institution types
export type {
  InstitutionAddress,
  InstitutionSettings,
  InstitutionContact,
  InstitutionStats,
  InstitutionBilling,
  Institution,
  CreateInstitutionData,
  UpdateInstitutionData
} from './institution';

export {
  InstitutionType,
  DEFAULT_INSTITUTION_SETTINGS,
  INITIAL_INSTITUTION_STATS
} from './institution';

// Organization types
export type {
  OrganizationSettings,
  OrganizationStats,
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
  OrganizationFilters,
  OrganizationListResult,
  OrganizationTreeNode
} from './organization';

export {
  OrganizationStatus,
  DEFAULT_ORGANIZATION_SETTINGS,
  INITIAL_ORGANIZATION_STATS,
  ORGANIZATION_COLORS,
  ORGANIZATION_ICONS
} from './organization';
// Audit types (original - manter para compatibilidade)
export type {
  AuditContext,
  AuditChange,
  AuditEntry,
  CreateAuditEntryData,
  AuditFilters,
  AuditListResult,
  AuditStats,
  AuditRetentionPolicy
} from './audit';

export {
  AuditActionType,
  AuditSeverity as OriginalAuditSeverity, // Renomear para evitar conflito
  DEFAULT_RETENTION_POLICY,
  AuditActionDescriptions
} from './audit';

// Session and Auth types
export interface AuthSession {
  user: User;
  institution: Institution;
  organizations: Organization[];
  token: string;
  expiresAt: number;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  requiresPasswordChange?: boolean;
  requires2FA?: boolean;
}

export interface LoginCredentials {
  cpf: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordChangeData {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Version and Migration types
export type Version = 'standard' | 'premium';

export interface VersionPreference {
  userId: string;
  version: Version;
  lastChanged: string;
}

export interface MigrationData {
  fromVersion: Version;
  toVersion: Version;
  userId: string;
  timestamp: string;
  completed: boolean;
}

// Setup Wizard types
export interface SetupWizardState {
  currentStep: number;
  totalSteps: number;
  masterUser?: CreateUserData;
  institution?: CreateInstitutionData;
  organizations?: CreateOrganizationData[];
  users?: CreateUserData[];
  completed: boolean;
}

export interface SetupWizardStep {
  id: number;
  title: string;
  description: string;
  component: string;
  isComplete: boolean;
  isValid: boolean;
  data?: any;
}

// Permission check result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
  requiredPrivilege?: string;
}

// Tenant context
export interface TenantContext {
  institutionId: string;
  organizationIds: string[];
  userId: string;
  userRole: UserRole;
  privileges: UserPrivilegesSet;
}

// Database structure for Premium
export interface PremiumDatabase {
  version: string;
  institutions: Record<string, Institution>;
  organizations: Record<string, Organization>;
  users: Record<string, User>;
  auditLogs: Record<string, AuditEntry>;
  sessions: Record<string, AuthSession>;
  metadata: {
    createdAt: string;
    lastUpdated: string;
    totalInstitutions: number;
    totalOrganizations: number;
    totalUsers: number;
  };
}
