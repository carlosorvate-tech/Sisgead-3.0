// 🎯 DISC MODULE - Public API
// Central export point for all DISC functionality

// ────────────────────────────────────────────────────────────
// CORE EXPORTS
// ────────────────────────────────────────────────────────────

// Calculator
export {
  DISCCalculator,
  type DISCAnswers,
  type DISCScores,
  type DISCProfile,
  type DISCIntensity,
  type DISCGraph
} from './calculator';

// Questionnaire
export {
  DISC_QUESTIONS,
  QUESTIONNAIRE_INSTRUCTIONS,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  getQuestionById,
  getQuestionsByCategory,
  getQuestionnaireStats,
  validateAnswerCompleteness,
  getShuffledQuestionnaire,
  getAnswerProgress,
  type DISCQuestion
} from './questionnaire';

// Profiles
export {
  ALL_PROFILES,
  PROFILE_DOMINANCE,
  PROFILE_INFLUENCE,
  PROFILE_STEADINESS,
  PROFILE_CONSCIENTIOUSNESS,
  PROFILE_D_I,
  PROFILE_D_C,
  PROFILE_I_S,
  PROFILE_S_C,
  getProfileByCode,
  getAllProfileCodes,
  getProfilesByFocus,
  getProfilesByPace,
  type ProfileCharacteristics
} from './profiles';

// Compatibility
export {
  calculatePairCompatibility,
  analyzeTeam,
  suggestIdealComposition,
  IDEAL_TEAM_COMPOSITIONS,
  type TeamMember,
  type CompatibilityScore,
  type TeamAnalysis
} from './compatibility';

// ────────────────────────────────────────────────────────────
// CONVENIENCE FUNCTIONS
// ────────────────────────────────────────────────────────────

import { DISCCalculator, type DISCAnswers, type DISCProfile } from './calculator';
import { DISC_QUESTIONS, validateAnswerCompleteness } from './questionnaire';
import { getProfileByCode } from './profiles';
import { analyzeTeam, type TeamMember } from './compatibility';

/**
 * Fluxo completo: responder → calcular → obter perfil detalhado
 */
export function completeDISCAssessment(answers: DISCAnswers): {
  profile: DISCProfile;
  characteristics: ReturnType<typeof getProfileByCode>;
  validation: ReturnType<typeof validateAnswerCompleteness>;
} {
  // Validar respostas
  const validation = validateAnswerCompleteness(answers);
  
  if (!validation.valid) {
    throw new Error(`Respostas incompletas. Faltam questões: ${validation.missing.join(', ')}`);
  }
  
  // Calcular perfil
  const profile = DISCCalculator.calculate(answers);
  
  // Obter características detalhadas
  const characteristics = getProfileByCode(profile.profileCode);
  
  return {
    profile,
    characteristics,
    validation
  };
}

/**
 * Criar membro de equipe a partir de respostas
 */
export function createTeamMemberFromAnswers(
  id: string,
  name: string,
  answers: DISCAnswers
): TeamMember {
  const { profile } = completeDISCAssessment(answers);
  
  return {
    id,
    name,
    profile
  };
}

/**
 * Análise rápida de equipe a partir de respostas
 */
export function quickTeamAnalysis(
  members: Array<{ id: string; name: string; answers: DISCAnswers }>
) {
  const teamMembers = members.map(m => 
    createTeamMemberFromAnswers(m.id, m.name, m.answers)
  );
  
  return analyzeTeam(teamMembers);
}

/**
 * Gerar relatório de perfil em texto
 */
export function generateProfileReport(profile: DISCProfile): string {
  const characteristics = getProfileByCode(profile.profileCode);
  
  if (!characteristics) {
    return 'Perfil não encontrado';
  }
  
  return `
╔════════════════════════════════════════════════════════════╗
║           RELATÓRIO DE PERFIL DISC                         ║
╚════════════════════════════════════════════════════════════╝

PERFIL: ${characteristics.name} (${profile.profileCode})
${characteristics.description}

PONTUAÇÕES:
• Dominância (D): ${profile.scores.D}%
• Influência (I): ${profile.scores.I}%
• Estabilidade (S): ${profile.scores.S}%
• Conformidade (C): ${profile.scores.C}%

PERFIL PRIMÁRIO: ${profile.primaryProfile}
INTENSIDADE: ${profile.intensity}

PRINCIPAIS FORÇAS:
${characteristics.strengths.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')}

DESAFIOS A TRABALHAR:
${characteristics.challenges.slice(0, 3).map((c, i) => `${i + 1}. ${c}`).join('\n')}

ESTILO DE TRABALHO:
• Ritmo: ${characteristics.workStyle.pace}
• Foco: ${characteristics.workStyle.focus}
• Abordagem: ${characteristics.workStyle.approach}
• Decisão: ${characteristics.workStyle.decisionMaking}

COMUNICAÇÃO:
${characteristics.communication.style}

DICAS DE DESENVOLVIMENTO:
${characteristics.growthTips.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n')}
`.trim();
}

/**
 * Gerar relatório de equipe em texto
 */
export function generateTeamReport(analysis: ReturnType<typeof analyzeTeam>): string {
  return `
╔════════════════════════════════════════════════════════════╗
║           RELATÓRIO DE ANÁLISE DE EQUIPE                   ║
╚════════════════════════════════════════════════════════════╝

COMPOSIÇÃO:
• Total de membros: ${analysis.composition.totalMembers}
• Perfil dominante: ${analysis.composition.dominantProfile}
• Distribuição: ${Object.entries(analysis.composition.profileDistribution)
    .map(([p, c]) => `${p}=${c}`)
    .join(', ')}

COMPATIBILIDADE:
• Score médio: ${analysis.compatibility.averageScore.toFixed(1)}/100
• Melhores duplas: ${analysis.compatibility.bestPairs.length}
• Duplas desafiadoras: ${analysis.compatibility.challengingPairs.length}

EQUILÍBRIO: ${analysis.balance.level.toUpperCase()}
• Foco tarefa/pessoa: ${analysis.balance.taskFocus}% tarefa
• Ritmo: ${analysis.balance.pace}% rápido
• Abordagem: ${analysis.balance.approach}% ativo
• Score geral: ${analysis.balance.score}/100

FORÇAS DA EQUIPE:
${analysis.teamStrengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

DESAFIOS DA EQUIPE:
${analysis.teamChallenges.map((c, i) => `${i + 1}. ${c}`).join('\n')}

RECOMENDAÇÕES:

Contratações sugeridas:
${analysis.recommendations.hiring.length > 0 
  ? analysis.recommendations.hiring.map((h, i) => `${i + 1}. ${h}`).join('\n')
  : '• Equipe completa'}

Desenvolvimento:
${analysis.recommendations.development.length > 0
  ? analysis.recommendations.development.map((d, i) => `${i + 1}. ${d}`).join('\n')
  : '• Manter práticas atuais'}

Líder recomendado:
${analysis.recommendations.leadership}
`.trim();
}

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────

export const DISC_VERSION = '3.0.0';
export const TOTAL_QUESTIONS = DISC_QUESTIONS.length;
export const PROFILE_CODES = ['D', 'I', 'S', 'C', 'D-I', 'D-C', 'I-S', 'S-C'] as const;

// ────────────────────────────────────────────────────────────
// TYPE GUARDS
// ────────────────────────────────────────────────────────────

export function isValidProfileCode(code: string): code is typeof PROFILE_CODES[number] {
  return PROFILE_CODES.includes(code as any);
}

export function isValidAnswer(answer: string): answer is 'A' | 'B' | 'C' | 'D' {
  return ['A', 'B', 'C', 'D'].includes(answer);
}

export function isCompleteAnswers(answers: Partial<DISCAnswers>): answers is DISCAnswers {
  const validation = validateAnswerCompleteness(answers as any);
  return validation.valid;
}
