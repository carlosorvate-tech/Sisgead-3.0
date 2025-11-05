/**
 * @license
 * Copyright 2024 INFINITUS Sistemas Inteligentes LTDA.
 * CNPJ: 09.371.580/0001-06
 *
 * Este código é propriedade da INFINITUS Sistemas Inteligentes LTDA.
 * A cópia, distribuição, modificação ou uso não autorizado deste código,
 * no todo ou em parte, é estritamente proibido.
 * Todos os direitos reservados.
 */

// 🏢 Multi-Tenant Integration (Backward Compatible)
export type { 
  Tenant, 
  TenantContext, 
  InstitutionalUser, 
  UserRole,
  AuditLog,
  TenantAnalytics 
} from './types/institutional';

// 📊 Core SISGEAD Types (Existing - Unchanged)
export type DISCProfile = 'D' | 'I' | 'S' | 'C';
export type UserPortalStep = 'welcome' | 'retest_validation' | 'questionnaire' | 'results' | 'expansion' | 'identity_context' | 'resilience_collaboration';
export type Answer = { more: string | null; less: string | null; };
export type Scores = Record<DISCProfile, number>;
export type RetestReason = 'Adaptação' | 'Treinamento' | 'Revisão Técnica';
export type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-pro';
export type AiProvider = 'gemini' | 'openai' | 'mock';
export type Question = { id: number; items: [string, string, string, string]; };

// Profile Expansion Types
export type ProfessionalArea = 'Tecnologia da Informação' | 'Recursos Humanos' | 'Marketing e Vendas' | 'Finanças e Contabilidade' | 'Operações e Logística' | 'Jurídico' | 'Design de Produto' | 'Administrativo' | 'Outra';
export type ExperienceLevel = 1 | 2 | 3 | 4 | 5; // 1: Iniciante, 5: Especialista
export type Methodologies = 'Scrum' | 'Kanban' | 'Holocracia' | 'SAFe' | 'Lean';
export type AgileRoles = 'Product Owner' | 'Scrum Master' | 'Team Member' | 'Agile Coach';

export interface ProfessionalProfile {
  primaryArea: ProfessionalArea;
  secondaryArea?: ProfessionalArea;
  experienceLevel: ExperienceLevel;
  skills: string[];
}

export interface MethodologicalProfile {
  methodologies: Methodologies[];
  roles: AgileRoles[];
}

export interface ContextualProfile {
  availability: number; // % de alocação
  location: 'Remoto' | 'Híbrido' | 'Presencial';
  concurrentProjects: number;
}

// Identity & Context Types
export type Motivator = 'Impacto Social' | 'Estabilidade' | 'Reconhecimento' | 'Inovação' | 'Autonomia' | 'Desenvolvimento Pessoal' | 'Remuneração' | 'Equilíbrio Vida-Trabalho';
export type LearningStyle = 'Visual' | 'Auditivo' | 'Cinestésico (Prático)' | 'Leitura/Escrita';
export type WorkEnvironment = 'Colaborativo' | 'Autônomo' | 'Estruturado' | 'Dinâmico';

export interface IdentityProfile {
  motivators: Motivator[];
  learningStyles: LearningStyle[];
  idealEnvironment: WorkEnvironment[];
  humanisticExperiences: string;
  personalPurpose: string;
}

// Resilience & Collaboration Profile Types
export enum ConflictStyle {
    Competition = 'Competição',
    Accommodation = 'Acomodação',
    Avoidance = 'Afastamento',
    Compromise = 'Acordo',
    Collaboration = 'Colaboração',
}

export enum PressureResponse {
    IntensifiedFocus = 'Foco Intensificado',
    CollaborationSeeking = 'Busca por Colaboração',
    AnalyticalRetreat = 'Recuo Analítico',
    EmotionalExpression = 'Expressão Emocional',
}

export enum FeedbackPreference {
    Direct = 'Direto e objetivo',
    Gentle = 'Contextualizado e suave',
    Written = 'Por escrito',
    Private = 'Em particular',
}

export interface ResilienceAndCollaborationProfile {
    conflictStyle: ConflictStyle;
    pressureResponse: PressureResponse;
    feedbackReception: FeedbackPreference;
    feedbackGiving: FeedbackPreference;
    coreValues: string[];
}


export interface AuditRecord {
  id: string;
  name: string;
  cpf: string;
  date: string;
  scores: Scores;
  primaryProfile: DISCProfile;
  secondaryProfile?: DISCProfile | null;
  retestReason?: RetestReason;
  previousReportId?: string;
  verificationHash: string;
  reportPdfBase64?: string; 
  // Optional Fields
  professionalProfile?: ProfessionalProfile;
  methodologicalProfile?: MethodologicalProfile;
  contextualProfile?: ContextualProfile;
  identityProfile?: IdentityProfile;
  resilienceAndCollaborationProfile?: ResilienceAndCollaborationProfile;
  roleSuggestions?: RoleSuggestion[];
}

export interface TeamProposal {
  id: string;
  date: string;
  query: string;
  response: string;
}

export interface CommunicationAnalysis {
    communicationStyle: string;
    strengths: string[];
    risks: string[];
    recommendations: string[];
}

export interface MediationRecord {
    id: string;
    createdAt: string;
    problemStatement: string;
    threatenedOkr: string;
    actionPlan: TacticalActionPlan;
}

export interface TeamComposition {
    id: string;
    name: string;
    objective: string;
    createdAt: string;
    members: AuditRecord[];
    complementarityAnalysis?: ComplementarityAnalysis;
    communicationAnalysis?: CommunicationAnalysis;
    mediationHistory?: MediationRecord[];
}

export interface RoleSuggestion {
    role: string;
    confidence: number; // 0-1
    justification: string;
}

export interface ComplementarityAnalysis {
    synergies: string[];
    potentialConflicts: string[];
    overallAssessment: string;
    methodologicalMaturity: number; // 0-100
}

export interface TacticalActionPlan {
    overallStrategy: string;
    steps: {
        action: string;
        responsible: string; // Can be a member's name or a role
        impactOnOkr: string;
    }[];
}

export interface TeamSuggestionResponse {
    suggestedMemberIds: string[];
    justification: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface AiAdviceResponse {
    text: string;
    sources: GroundingSource[];
}

export interface AiStatus {
  provider: AiProvider;
  isConnected: boolean;
  message: string;
}

// FIX: Added AllData type to be used for full data structures.
export interface AllData {
    auditLog: AuditRecord[];
    proposalLog: TeamProposal[];
    teams: TeamComposition[];
}
// bycao (ogrorvatigão) 2025