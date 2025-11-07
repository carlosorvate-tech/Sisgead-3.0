/**
 * SISGEAD 3.0 - Core DISC Module
 * Lógica central de cálculo de perfil DISC
 * Extraída e isolada para reutilização em múltiplos contextos
 * 
 * Baseado na metodologia DISC científica:
 * D - Dominância (Decisão, Controle)
 * I - Influência (Interação, Persuasão)
 * S - Estabilidade (Apoio, Constância)
 * C - Conformidade (Precisão, Padrões)
 */

export interface DISCAnswers {
  [questionId: string]: 'A' | 'B' | 'C' | 'D';
}

export interface DISCScores {
  D: number;  // Dominância (0-100)
  I: number;  // Influência (0-100)
  S: number;  // Estabilidade (0-100)
  C: number;  // Conformidade (0-100)
}

export type DISCIntensity = 'baixa' | 'média' | 'alta';

export type DISCGraph = [number, number, number, number];

export interface DISCProfile {
  // Pontuações
  scores: DISCScores;
  
  // Perfil primário (maior pontuação)
  primaryProfile: 'D' | 'I' | 'S' | 'C';
  
  // Perfil secundário (segunda maior)
  secondaryProfile?: 'D' | 'I' | 'S' | 'C';
  
  // Código combinado (ex: "D-I", "S-C")
  profileCode: string;
  
  // Gráfico normalizado (0-10)
  graph: DISCGraph;
  
  // Intensidade do perfil primário
  intensity: DISCIntensity;
  
  // Características principais
  traits: {
    strengths: string[];
    challenges: string[];
    communication: string;
    motivation: string;
  };
}

/**
 * Mapa de pontuação por resposta
 * Cada resposta contribui para uma ou mais dimensões DISC
 */
const SCORING_MAP: Record<number, Record<'A' | 'B' | 'C' | 'D', Partial<DISCScores>>> = {
  1: { A: { D: 4 }, B: { I: 4 }, C: { S: 4 }, D: { C: 4 } },
  2: { A: { I: 4 }, B: { D: 4 }, C: { C: 4 }, D: { S: 4 } },
  3: { A: { S: 4 }, B: { C: 4 }, C: { D: 4 }, D: { I: 4 } },
  4: { A: { C: 4 }, B: { S: 4 }, C: { I: 4 }, D: { D: 4 } },
  5: { A: { D: 4 }, B: { I: 4 }, C: { S: 4 }, D: { C: 4 } },
  6: { A: { I: 4 }, B: { D: 4 }, C: { C: 4 }, D: { S: 4 } },
  7: { A: { S: 4 }, B: { C: 4 }, C: { D: 4 }, D: { I: 4 } },
  8: { A: { C: 4 }, B: { S: 4 }, C: { I: 4 }, D: { D: 4 } },
  9: { A: { D: 4 }, B: { I: 4 }, C: { S: 4 }, D: { C: 4 } },
  10: { A: { I: 4 }, B: { D: 4 }, C: { C: 4 }, D: { S: 4 } },
  11: { A: { S: 4 }, B: { C: 4 }, C: { D: 4 }, D: { I: 4 } },
  12: { A: { C: 4 }, B: { S: 4 }, C: { I: 4 }, D: { D: 4 } },
  13: { A: { D: 4 }, B: { I: 4 }, C: { S: 4 }, D: { C: 4 } },
  14: { A: { I: 4 }, B: { D: 4 }, C: { C: 4 }, D: { S: 4 } },
  15: { A: { S: 4 }, B: { C: 4 }, C: { D: 4 }, D: { I: 4 } },
  16: { A: { C: 4 }, B: { S: 4 }, C: { I: 4 }, D: { D: 4 } },
  17: { A: { D: 4 }, B: { I: 4 }, C: { S: 4 }, D: { C: 4 } },
  18: { A: { I: 4 }, B: { D: 4 }, C: { C: 4 }, D: { S: 4 } },
  19: { A: { S: 4 }, B: { C: 4 }, C: { D: 4 }, D: { I: 4 } },
  20: { A: { C: 4 }, B: { S: 4 }, C: { I: 4 }, D: { D: 4 } },
  21: { A: { D: 4 }, B: { I: 4 }, C: { S: 4 }, D: { C: 4 } },
  22: { A: { I: 4 }, B: { D: 4 }, C: { C: 4 }, D: { S: 4 } },
  23: { A: { S: 4 }, B: { C: 4 }, C: { D: 4 }, D: { I: 4 } },
  24: { A: { C: 4 }, B: { S: 4 }, C: { I: 4 }, D: { D: 4 } }
};

/**
 * Classe principal para cálculo de perfil DISC
 */
export class DISCCalculator {
  /**
   * Calcula o perfil DISC completo a partir das respostas
   */
  static calculate(answers: DISCAnswers): DISCProfile {
    // 1. Calcular pontuações brutas
    const rawScores = this.calculateRawScores(answers);
    
    // 2. Normalizar pontuações (0-100)
    const scores = this.normalizeScores(rawScores);
    
    // 3. Determinar perfis primário e secundário
    const { primary, secondary } = this.determineProfiles(scores);
    
    // 4. Gerar código do perfil
    const profileCode = secondary ? `${primary}-${secondary}` : primary;
    
    // 5. Calcular intensidade
    const intensity = this.calculateIntensity(scores, primary);
    
    // 6. Gerar gráfico normalizado
    const graph = this.generateGraph(scores);
    
    // 7. Obter características
    const traits = this.getProfileTraits(profileCode);
    
    return {
      scores,
      primaryProfile: primary,
      secondaryProfile: secondary,
      profileCode,
      graph,
      intensity,
      traits
    };
  }
  
  /**
   * Calcula pontuações brutas
   */
  private static calculateRawScores(answers: DISCAnswers): DISCScores {
    const scores: DISCScores = { D: 0, I: 0, S: 0, C: 0 };
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const questionNum = parseInt(questionId);
      const questionScores = SCORING_MAP[questionNum]?.[answer];
      
      if (questionScores) {
        if (questionScores.D) scores.D += questionScores.D;
        if (questionScores.I) scores.I += questionScores.I;
        if (questionScores.S) scores.S += questionScores.S;
        if (questionScores.C) scores.C += questionScores.C;
      }
    });
    
    return scores;
  }
  
  /**
   * Normaliza pontuações para escala 0-100
   */
  private static normalizeScores(rawScores: DISCScores): DISCScores {
    // Máximo possível: 24 perguntas × 4 pontos = 96
    const MAX_SCORE = 96;
    
    return {
      D: Math.round((rawScores.D / MAX_SCORE) * 100),
      I: Math.round((rawScores.I / MAX_SCORE) * 100),
      S: Math.round((rawScores.S / MAX_SCORE) * 100),
      C: Math.round((rawScores.C / MAX_SCORE) * 100)
    };
  }
  
  /**
   * Determina perfis primário e secundário
   */
  private static determineProfiles(scores: DISCScores): {
    primary: 'D' | 'I' | 'S' | 'C';
    secondary?: 'D' | 'I' | 'S' | 'C';
  } {
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([key]) => key as 'D' | 'I' | 'S' | 'C');
    
    const primary = sorted[0];
    const secondary = scores[sorted[1]] > 20 ? sorted[1] : undefined;
    
    return { primary, secondary };
  }
  
  /**
   * Calcula intensidade do perfil
   */
  private static calculateIntensity(
    scores: DISCScores,
    primary: 'D' | 'I' | 'S' | 'C'
  ): 'baixa' | 'média' | 'alta' {
    const primaryScore = scores[primary];
    
    if (primaryScore >= 70) return 'alta';
    if (primaryScore >= 40) return 'média';
    return 'baixa';
  }
  
  /**
   * Gera gráfico normalizado (0-10)
   */
  private static generateGraph(scores: DISCScores): [number, number, number, number] {
    return [
      Math.round(scores.D / 10),
      Math.round(scores.I / 10),
      Math.round(scores.S / 10),
      Math.round(scores.C / 10)
    ];
  }
  
  /**
   * Obtém características do perfil
   */
  private static getProfileTraits(profileCode: string): DISCProfile['traits'] {
    // Base de conhecimento de características
    const TRAITS_DB: Record<string, DISCProfile['traits']> = {
      'D': {
        strengths: ['Decisivo', 'Orientado a resultados', 'Líder natural', 'Confiante'],
        challenges: ['Pode ser impaciente', 'Foco excessivo em tarefas', 'Direto demais'],
        communication: 'Direto, objetivo e focado em resultados',
        motivation: 'Desafios, controle e realização de objetivos'
      },
      'I': {
        strengths: ['Comunicativo', 'Entusiasta', 'Persuasivo', 'Otimista'],
        challenges: ['Pode ser desorganizado', 'Fala mais que escuta', 'Evita conflitos'],
        communication: 'Animado, expressivo e focado em pessoas',
        motivation: 'Reconhecimento, interação social e novidades'
      },
      'S': {
        strengths: ['Paciente', 'Leal', 'Colaborativo', 'Confiável'],
        challenges: ['Resistente a mudanças', 'Evita confrontos', 'Dificuldade em dizer não'],
        communication: 'Calmo, empático e focado em harmonia',
        motivation: 'Estabilidade, segurança e ajudar os outros'
      },
      'C': {
        strengths: ['Analítico', 'Preciso', 'Organizado', 'Criterioso'],
        challenges: ['Perfeccionista', 'Crítico demais', 'Lento para decidir'],
        communication: 'Formal, detalhado e focado em qualidade',
        motivation: 'Precisão, padrões elevados e conhecimento'
      },
      'D-I': {
        strengths: ['Líder inspirador', 'Orientado a resultados', 'Carismático', 'Empreendedor'],
        challenges: ['Impulsivo', 'Impaciente com detalhes', 'Dominante em grupos'],
        communication: 'Direto, persuasivo e focado em ação',
        motivation: 'Conquistas visíveis e reconhecimento público'
      },
      'D-C': {
        strengths: ['Estratégico', 'Analítico', 'Determinado', 'Competente'],
        challenges: ['Crítico', 'Perfeccionista', 'Distante emocionalmente'],
        communication: 'Direto, técnico e baseado em dados',
        motivation: 'Excelência, eficiência e domínio técnico'
      },
      'I-S': {
        strengths: ['Empático', 'Mediador', 'Comunicativo', 'Cooperativo'],
        challenges: ['Evita conflitos', 'Busca aprovação', 'Desorganizado'],
        communication: 'Amigável, caloroso e focado em relacionamentos',
        motivation: 'Harmonia, aceitação e conexões pessoais'
      },
      'S-C': {
        strengths: ['Metódico', 'Detalhista', 'Confiável', 'Paciente'],
        challenges: ['Resistente a mudanças', 'Lento para agir', 'Rígido'],
        communication: 'Calmo, preciso e focado em processos',
        motivation: 'Qualidade, estabilidade e previsibilidade'
      }
    };
    
    return TRAITS_DB[profileCode] || TRAITS_DB[profileCode[0]] || TRAITS_DB['D'];
  }
  
  /**
   * Valida respostas
   */
  static validateAnswers(answers: DISCAnswers): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Verificar número de questões
    const questionCount = Object.keys(answers).length;
    if (questionCount !== 24) {
      errors.push(`Esperado 24 questões, recebido ${questionCount}`);
    }
    
    // Verificar validade das respostas
    Object.entries(answers).forEach(([questionId, answer]) => {
      if (!['A', 'B', 'C', 'D'].includes(answer)) {
        errors.push(`Questão ${questionId}: resposta inválida "${answer}"`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
