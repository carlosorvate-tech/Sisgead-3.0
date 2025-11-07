// 🤝 DISC COMPATIBILITY - Análise de Composição de Equipes
// Sistema de recomendação baseado em perfis comportamentais

import type { DISCProfile } from './calculator';
import { getProfileByCode } from './profiles';

// ────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  profile: DISCProfile;
}

export interface CompatibilityScore {
  member1: string;
  member2: string;
  score: number; // 0-100
  level: 'baixa' | 'média' | 'alta' | 'muito-alta';
  strengths: string[];
  challenges: string[];
  tips: string[];
}

export interface TeamAnalysis {
  teamId: string;
  members: TeamMember[];
  
  // Composição
  composition: {
    totalMembers: number;
    profileDistribution: Record<string, number>;
    dominantProfile: string;
    missingProfiles: string[];
  };
  
  // Compatibilidade
  compatibility: {
    averageScore: number;
    pairScores: CompatibilityScore[];
    bestPairs: CompatibilityScore[];
    challengingPairs: CompatibilityScore[];
  };
  
  // Equilíbrio
  balance: {
    taskFocus: number; // 0-100 (0=pessoa, 100=tarefa)
    pace: number; // 0-100 (0=lento, 100=rápido)
    approach: number; // 0-100 (0=reflexivo, 100=ativo)
    score: number; // 0-100 (equilíbrio geral)
    level: 'desequilibrada' | 'moderada' | 'equilibrada' | 'muito-equilibrada';
  };
  
  // Forças e Fraquezas
  teamStrengths: string[];
  teamChallenges: string[];
  
  // Recomendações
  recommendations: {
    hiring: string[]; // Perfis recomendados para contratar
    development: string[]; // Áreas de desenvolvimento
    leadership: string; // Melhor líder
    roles: Record<string, string>; // Sugestão de papéis
  };
}

// ────────────────────────────────────────────────────────────
// MATRIZ DE COMPATIBILIDADE (baseada em teoria DISC)
// ────────────────────────────────────────────────────────────

const COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
  // Dominância
  'D': {
    'D': 65,   // Dois dominantes podem competir
    'I': 85,   // D motiva, I energiza - boa dupla
    'S': 55,   // D pressiona, S resiste - precisa cuidado
    'C': 70,   // D decide, C analisa - complementares
    'D-I': 80,
    'D-C': 75,
    'I-S': 70,
    'S-C': 60
  },
  
  // Influência
  'I': {
    'D': 85,
    'I': 75,   // Dois influentes podem dispersar
    'S': 90,   // I anima, S estabiliza - excelente
    'C': 60,   // I é espontâneo, C é cauteloso - desafio
    'D-I': 88,
    'D-C': 65,
    'I-S': 92,
    'S-C': 70
  },
  
  // Estabilidade
  'S': {
    'D': 55,
    'I': 90,
    'S': 80,   // Dois estáveis são harmoniosos
    'C': 85,   // S apoia, C estrutura - muito bom
    'D-I': 70,
    'D-C': 60,
    'I-S': 95,
    'S-C': 88
  },
  
  // Conformidade
  'C': {
    'D': 70,
    'I': 60,
    'S': 85,
    'C': 70,   // Dois analíticos podem ser lentos
    'D-I': 65,
    'D-C': 82,
    'I-S': 75,
    'S-C': 90
  },
  
  // Combinados
  'D-I': {
    'D': 80, 'I': 88, 'S': 70, 'C': 65,
    'D-I': 78, 'D-C': 75, 'I-S': 82, 'S-C': 68
  },
  
  'D-C': {
    'D': 75, 'I': 65, 'S': 60, 'C': 82,
    'D-I': 75, 'D-C': 80, 'I-S': 68, 'S-C': 75
  },
  
  'I-S': {
    'D': 70, 'I': 92, 'S': 95, 'C': 75,
    'D-I': 82, 'D-C': 68, 'I-S': 90, 'S-C': 85
  },
  
  'S-C': {
    'D': 60, 'I': 70, 'S': 88, 'C': 90,
    'D-I': 68, 'D-C': 75, 'I-S': 85, 'S-C': 88
  }
};

// ────────────────────────────────────────────────────────────
// FUNÇÕES PRINCIPAIS
// ────────────────────────────────────────────────────────────

/**
 * Calcula compatibilidade entre dois membros
 */
export function calculatePairCompatibility(
  member1: TeamMember,
  member2: TeamMember
): CompatibilityScore {
  const profile1 = member1.profile.profileCode;
  const profile2 = member2.profile.profileCode;
  
  const score = COMPATIBILITY_MATRIX[profile1]?.[profile2] ?? 70;
  
  const level: CompatibilityScore['level'] = 
    score >= 85 ? 'muito-alta' :
    score >= 70 ? 'alta' :
    score >= 55 ? 'média' : 'baixa';
  
  return {
    member1: member1.id,
    member2: member2.id,
    score,
    level,
    strengths: getCompatibilityStrengths(profile1, profile2),
    challenges: getCompatibilityChallenges(profile1, profile2),
    tips: getCompatibilityTips(profile1, profile2)
  };
}

/**
 * Analisa composição completa da equipe
 */
export function analyzeTeam(members: TeamMember[]): TeamAnalysis {
  // Composição
  const profileDistribution = members.reduce((acc, m) => {
    const code = m.profile.profileCode;
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantProfile = Object.entries(profileDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'D';
  
  const allProfiles = ['D', 'I', 'S', 'C'];
  const presentProfiles = Object.keys(profileDistribution);
  const missingProfiles = allProfiles.filter(p => !presentProfiles.includes(p));
  
  // Compatibilidade entre pares
  const pairScores: CompatibilityScore[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      pairScores.push(calculatePairCompatibility(members[i], members[j]));
    }
  }
  
  const averageScore = pairScores.length > 0
    ? pairScores.reduce((sum, p) => sum + p.score, 0) / pairScores.length
    : 70;
  
  const bestPairs = pairScores
    .filter(p => p.score >= 85)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  const challengingPairs = pairScores
    .filter(p => p.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  
  // Equilíbrio
  const balance = calculateTeamBalance(members);
  
  // Forças e desafios
  const teamStrengths = getTeamStrengths(members);
  const teamChallenges = getTeamChallenges(members);
  
  // Recomendações
  const recommendations = generateRecommendations(members, missingProfiles);
  
  return {
    teamId: crypto.randomUUID(),
    members,
    composition: {
      totalMembers: members.length,
      profileDistribution,
      dominantProfile,
      missingProfiles
    },
    compatibility: {
      averageScore,
      pairScores,
      bestPairs,
      challengingPairs
    },
    balance,
    teamStrengths,
    teamChallenges,
    recommendations
  };
}

/**
 * Calcula equilíbrio da equipe
 */
function calculateTeamBalance(members: TeamMember[]): TeamAnalysis['balance'] {
  if (members.length === 0) {
    return {
      taskFocus: 50,
      pace: 50,
      approach: 50,
      score: 50,
      level: 'moderada'
    };
  }
  
  let taskFocus = 0;
  let pace = 0;
  let approach = 0;
  
  members.forEach(m => {
    const profileData = getProfileByCode(m.profile.profileCode);
    if (!profileData) return;
    
    // Task vs People (0=pessoa, 100=tarefa)
    taskFocus += profileData.workStyle.focus === 'tarefa' ? 100 :
                 profileData.workStyle.focus === 'pessoa' ? 0 : 50;
    
    // Pace (0=lento, 100=rápido)
    pace += profileData.workStyle.pace === 'rápido' ? 100 :
            profileData.workStyle.pace === 'lento' ? 0 : 50;
    
    // Approach (0=reflexivo, 100=ativo)
    approach += profileData.workStyle.approach === 'ativo' ? 100 : 0;
  });
  
  taskFocus = Math.round(taskFocus / members.length);
  pace = Math.round(pace / members.length);
  approach = Math.round(approach / members.length);
  
  // Score de equilíbrio (quanto mais perto de 50, mais equilibrado)
  const deviations = [
    Math.abs(50 - taskFocus),
    Math.abs(50 - pace),
    Math.abs(50 - approach)
  ];
  
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / 3;
  const score = Math.round(100 - (avgDeviation * 2));
  
  const level: TeamAnalysis['balance']['level'] =
    score >= 80 ? 'muito-equilibrada' :
    score >= 60 ? 'equilibrada' :
    score >= 40 ? 'moderada' : 'desequilibrada';
  
  return { taskFocus, pace, approach, score, level };
}

/**
 * Identifica forças da equipe
 */
function getTeamStrengths(members: TeamMember[]): string[] {
  const profileCounts = members.reduce((acc, m) => {
    const primary = m.profile.primaryProfile;
    acc[primary] = (acc[primary] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const strengths: string[] = [];
  
  if (profileCounts['D'] >= 1) {
    strengths.push('Capacidade de tomar decisões rápidas e enfrentar desafios');
  }
  
  if (profileCounts['I'] >= 1) {
    strengths.push('Excelente comunicação e habilidade de motivar a equipe');
  }
  
  if (profileCounts['S'] >= 1) {
    strengths.push('Ambiente harmonioso e apoio mútuo entre membros');
  }
  
  if (profileCounts['C'] >= 1) {
    strengths.push('Atenção a detalhes e trabalho de alta qualidade');
  }
  
  if (members.length >= 4 && Object.keys(profileCounts).length >= 3) {
    strengths.push('Diversidade de perspectivas e abordagens');
  }
  
  return strengths;
}

/**
 * Identifica desafios da equipe
 */
function getTeamChallenges(members: TeamMember[]): string[] {
  const profileCounts = members.reduce((acc, m) => {
    const primary = m.profile.primaryProfile;
    acc[primary] = (acc[primary] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const challenges: string[] = [];
  const total = members.length;
  
  // Dominância excessiva
  if (profileCounts['D'] && profileCounts['D'] / total > 0.5) {
    challenges.push('Excesso de líderes pode gerar conflitos de autoridade');
  }
  
  // Influência excessiva
  if (profileCounts['I'] && profileCounts['I'] / total > 0.5) {
    challenges.push('Risco de dispersão e falta de foco em execução');
  }
  
  // Estabilidade excessiva
  if (profileCounts['S'] && profileCounts['S'] / total > 0.5) {
    challenges.push('Pode haver resistência a mudanças necessárias');
  }
  
  // Conformidade excessiva
  if (profileCounts['C'] && profileCounts['C'] / total > 0.5) {
    challenges.push('Excesso de análise pode retardar decisões');
  }
  
  // Falta de diversidade
  if (Object.keys(profileCounts).length === 1) {
    challenges.push('Falta de diversidade de perspectivas e habilidades');
  }
  
  // Ausência de perfis específicos
  if (!profileCounts['D']) {
    challenges.push('Falta de liderança decisiva em momentos críticos');
  }
  
  if (!profileCounts['I']) {
    challenges.push('Comunicação e motivação podem ser desafiadoras');
  }
  
  if (!profileCounts['S']) {
    challenges.push('Ambiente pode se tornar tenso sem estabilizadores');
  }
  
  if (!profileCounts['C']) {
    challenges.push('Risco de negligenciar qualidade e detalhes importantes');
  }
  
  return challenges;
}

/**
 * Gera recomendações para a equipe
 */
function generateRecommendations(
  members: TeamMember[],
  missingProfiles: string[]
): TeamAnalysis['recommendations'] {
  const hiring: string[] = [];
  const development: string[] = [];
  
  // Recomendações de contratação
  if (missingProfiles.includes('D')) {
    hiring.push('Perfil D (Dominância) - para liderança e tomada de decisão');
  }
  if (missingProfiles.includes('I')) {
    hiring.push('Perfil I (Influência) - para comunicação e motivação');
  }
  if (missingProfiles.includes('S')) {
    hiring.push('Perfil S (Estabilidade) - para harmonia e apoio');
  }
  if (missingProfiles.includes('C')) {
    hiring.push('Perfil C (Conformidade) - para qualidade e precisão');
  }
  
  // Desenvolvimento da equipe
  const profileCounts = members.reduce((acc, m) => {
    acc[m.profile.primaryProfile] = (acc[m.profile.primaryProfile] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (profileCounts['D'] > 2) {
    development.push('Desenvolver empatia e habilidades de escuta ativa');
  }
  if (profileCounts['I'] > 2) {
    development.push('Melhorar disciplina e foco em execução');
  }
  if (profileCounts['S'] > 2) {
    development.push('Praticar assertividade e gestão de mudanças');
  }
  if (profileCounts['C'] > 2) {
    development.push('Desenvolver flexibilidade e tolerância a ambiguidade');
  }
  
  // Melhor líder
  const dMembers = members.filter(m => m.profile.primaryProfile === 'D');
  const leadership = dMembers.length > 0
    ? `${dMembers[0].name} (perfil ${dMembers[0].profile.profileCode}) - liderança natural orientada a resultados`
    : members.length > 0
    ? `${members[0].name} - desenvolver habilidades de liderança`
    : 'Contratar perfil de liderança (D ou D-I)';
  
  // Sugestão de papéis
  const roles: Record<string, string> = {};
  members.forEach(m => {
    const primary = m.profile.primaryProfile;
    roles[m.id] = 
      primary === 'D' ? 'Líder de projeto ou tomador de decisões' :
      primary === 'I' ? 'Comunicação externa e motivação da equipe' :
      primary === 'S' ? 'Suporte à equipe e mediação de conflitos' :
      primary === 'C' ? 'Controle de qualidade e análise técnica' :
      'Papel híbrido baseado em competências';
  });
  
  return { hiring, development, leadership, roles };
}

// ────────────────────────────────────────────────────────────
// HELPERS DETALHADOS
// ────────────────────────────────────────────────────────────

function getCompatibilityStrengths(profile1: string, profile2: string): string[] {
  const p1 = profile1.charAt(0);
  const p2 = profile2.charAt(0);
  
  const strengths: string[] = [];
  
  if (p1 === 'D' && p2 === 'I') {
    strengths.push('D lidera, I motiva - combinação poderosa');
    strengths.push('Complementam-se em ação (D) e pessoas (I)');
  }
  
  if (p1 === 'I' && p2 === 'S') {
    strengths.push('I energiza, S estabiliza - equilíbrio perfeito');
    strengths.push('Excelente para trabalho em equipe');
  }
  
  if (p1 === 'S' && p2 === 'C') {
    strengths.push('S apoia, C estrutura - sinergia natural');
    strengths.push('Confiabilidade e qualidade garantidas');
  }
  
  if (p1 === 'D' && p2 === 'C') {
    strengths.push('D decide, C analisa - decisões fundamentadas');
    strengths.push('Resultados com qualidade');
  }
  
  return strengths.length > 0 ? strengths : ['Potencial de complementaridade'];
}

function getCompatibilityChallenges(profile1: string, profile2: string): string[] {
  const p1 = profile1.charAt(0);
  const p2 = profile2.charAt(0);
  
  const challenges: string[] = [];
  
  if (p1 === 'D' && p2 === 'D') {
    challenges.push('Conflito de autoridade possível');
    challenges.push('Competição por controle');
  }
  
  if (p1 === 'D' && p2 === 'S') {
    challenges.push('D pode pressionar demais, S pode resistir');
    challenges.push('Ritmos diferentes de trabalho');
  }
  
  if (p1 === 'I' && p2 === 'C') {
    challenges.push('I é espontâneo, C é cauteloso');
    challenges.push('Diferentes prioridades (pessoas vs precisão)');
  }
  
  if (p1 === 'C' && p2 === 'C') {
    challenges.push('Excesso de análise pode retardar ação');
    challenges.push('Perfeccionismo duplo');
  }
  
  return challenges.length > 0 ? challenges : ['Requer adaptação mútua'];
}

function getCompatibilityTips(profile1: string, profile2: string): string[] {
  const p1 = profile1.charAt(0);
  const p2 = profile2.charAt(0);
  
  const tips: string[] = [];
  
  if (p1 === 'D' && p2 === 'S') {
    tips.push('D: dê tempo e explique mudanças gradualmente');
    tips.push('S: expresse suas preocupações abertamente');
  }
  
  if (p1 === 'I' && p2 === 'C') {
    tips.push('I: respeite a necessidade de dados e precisão');
    tips.push('C: aprecie a criatividade e entusiasmo');
  }
  
  if (p1 === 'D' && p2 === 'D') {
    tips.push('Definam claramente áreas de responsabilidade');
    tips.push('Foquem em objetivos compartilhados');
  }
  
  return tips.length > 0 ? tips : ['Mantenham comunicação aberta e respeito mútuo'];
}

// ────────────────────────────────────────────────────────────
// RECOMENDAÇÕES DE COMPOSIÇÃO IDEAL
// ────────────────────────────────────────────────────────────

export const IDEAL_TEAM_COMPOSITIONS = {
  small: {
    size: '3-5 pessoas',
    recommended: ['D ou D-I', 'I ou I-S', 'S ou S-C', 'C ou D-C'],
    rationale: 'Cobertura dos 4 perfis principais para equipes pequenas'
  },
  
  medium: {
    size: '6-10 pessoas',
    recommended: ['2 D/D-I', '2 I/I-S', '2-3 S/S-C', '2 C/D-C'],
    rationale: 'Redundância de perfis para resiliência e especialização'
  },
  
  large: {
    size: '11+ pessoas',
    recommended: ['3+ D/D-I', '3+ I/I-S', '4+ S/S-C', '3+ C/D-C'],
    rationale: 'Múltiplos perfis em cada categoria para sub-equipes'
  },
  
  leadership: {
    size: 'Equipe de liderança',
    recommended: ['D-I (CEO/Principal)', 'D-C (COO/Operações)', 'I (Marketing/RH)', 'C (Financeiro/Qualidade)'],
    rationale: 'Cobertura estratégica completa com líderes complementares'
  }
};

/**
 * Sugere composição ideal baseada no tamanho da equipe
 */
export function suggestIdealComposition(targetSize: number): {
  composition: string[];
  rationale: string;
  priorities: string[];
} {
  if (targetSize <= 5) {
    return {
      composition: IDEAL_TEAM_COMPOSITIONS.small.recommended,
      rationale: IDEAL_TEAM_COMPOSITIONS.small.rationale,
      priorities: [
        '1º - Perfil D ou D-I para liderança',
        '2º - Perfil I ou I-S para comunicação',
        '3º - Perfil S ou S-C para estabilidade',
        '4º - Perfil C ou D-C para qualidade'
      ]
    };
  }
  
  if (targetSize <= 10) {
    return {
      composition: IDEAL_TEAM_COMPOSITIONS.medium.recommended,
      rationale: IDEAL_TEAM_COMPOSITIONS.medium.rationale,
      priorities: [
        'Garantir pelo menos 1 de cada perfil puro (D, I, S, C)',
        'Adicionar perfis combinados conforme necessidade',
        'Manter equilíbrio entre foco em tarefa e pessoas'
      ]
    };
  }
  
  return {
    composition: IDEAL_TEAM_COMPOSITIONS.large.recommended,
    rationale: IDEAL_TEAM_COMPOSITIONS.large.rationale,
    priorities: [
      'Criar sub-equipes com diversidade de perfis',
      'Designar líderes de cada perfil para áreas específicas',
      'Manter comunicação entre sub-equipes'
    ]
  };
}
