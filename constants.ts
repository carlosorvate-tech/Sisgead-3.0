import { type Question, type DISCProfile, type ProfessionalArea, type Motivator, type LearningStyle, type WorkEnvironment, ConflictStyle, PressureResponse, FeedbackPreference } from './types';

export const QUESTIONS: Question[] = [
  { id: 1, items: ['Direto', 'Persuasivo', 'Calmo', 'Detalhista'] },
  { id: 2, items: ['Competitivo', 'Enérgico', 'Paciente', 'Perfeccionista'] },
  { id: 3, items: ['Decidido', 'Sociável', 'Cooperativo', 'Preciso'] },
  { id: 4, items: ['Desafiante', 'Expressivo', 'Estável', 'Analítico'] },
  { id: 5, items: ['Focado em resultados', 'Otimista', 'Constante', 'Cauteloso'] },
  { id: 6, items: ['Determinante', 'Inspirador', 'Apoiador', 'Organizado'] },
  { id: 7, items: ['Rápido ao agir', 'Comunicativo', 'Paciente', 'Rigoroso'] },
  { id: 8, items: ['Inovador', 'Entusiasta', 'Previsível', 'Metódico'] },
];

export const WORD_TO_PROFILE_MAP: Record<string, DISCProfile> = {
  'Direto': 'D', 'Competitivo': 'D', 'Decidido': 'D', 'Desafiante': 'D', 'Focado em resultados': 'D', 'Determinante': 'D', 'Rápido ao agir': 'D', 'Inovador': 'D',
  'Persuasivo': 'I', 'Enérgico': 'I', 'Sociável': 'I', 'Expressivo': 'I', 'Otimista': 'I', 'Inspirador': 'I', 'Comunicativo': 'I', 'Entusiasta': 'I',
  'Calmo': 'S', 'Paciente': 'S', 'Cooperativo': 'S', 'Estável': 'S', 'Constante': 'S', 'Apoiador': 'S', 'Previsível': 'S',
  'Detalhista': 'C', 'Perfeccionista': 'C', 'Preciso': 'C', 'Analítico': 'C', 'Cauteloso': 'C', 'Organizado': 'C', 'Rigoroso': 'C', 'Metódico': 'C',
};

export const PROFILE_COLORS: Record<DISCProfile, string> = {
  D: '#EF4444', // red-500
  I: '#F59E0B', // amber-500
  S: '#10B981', // emerald-500
  C: '#3B82F6', // blue-500
};

export const PROFILE_DESCRIPTIONS: Record<DISCProfile, { title: string; description: string; strengths: string[]; weaknesses: string[]; motivators: string; communication: string; teamIntegration: string; }> = {
  D: {
    title: "Dominância (D)",
    description: "Indivíduos com perfil dominante são focados em resultados, competitivos e assertivos. Gostam de desafios e de tomar a frente das situações.",
    strengths: ["Orientado a metas", "Decidido", "Direto", "Assume riscos"],
    weaknesses: ["Pode ser impaciente", "Exigente", "Pouca atenção a detalhes", "Pode parecer insensível"],
    motivators: "Poder, autoridade, competição e sucesso.",
    communication: "Direta e objetiva. Prefere ir direto ao ponto, sem rodeios.",
    teamIntegration: "Excelente para liderar projetos, tomar decisões rápidas e impulsionar a equipe para a ação. Funciona bem com perfis 'C' que podem fornecer a análise de dados que eles podem ignorar."
  },
  I: {
    title: "Influência (I)",
    description: "Pessoas com perfil influente são comunicativas, otimistas e sociáveis. Elas prosperam em ambientes colaborativos e gostam de persuadir e motivar os outros.",
    strengths: ["Entusiasta", "Persuasivo", "Constrói relacionamentos", "Criativo"],
    weaknesses: ["Pode ser desorganizado", "Impulsivo", "Evita conflitos", "Fala mais do que ouve"],
    motivators: "Reconhecimento social, popularidade e trabalho em equipe.",
    communication: "Aberta, amigável e expressiva. Gosta de compartilhar ideias e histórias.",
    teamIntegration: "Ideal para papéis de porta-voz, motivador da equipe e para criar um ambiente de trabalho positivo. Complementa perfis 'S', que oferecem estabilidade e apoio às suas iniciativas."
  },
  S: {
    title: "Estabilidade (S)",
    description: "Aqueles com perfil de estabilidade são pacientes, calmos e leais. Valorizam a segurança e a consistência, sendo excelentes ouvintes e membros de equipe confiáveis.",
    strengths: ["Leal", "Bom ouvinte", "Paciente", "Trabalha bem em equipe"],
    weaknesses: ["Resistente a mudanças", "Indeciso", "Evita confrontos", "Pode guardar ressentimentos"],
    motivators: "Segurança, apreciação sincera e um ambiente de trabalho harmonioso.",
    communication: "Calma, ponderada e amigável. Prefere um a um e valoriza a sinceridade.",
    teamIntegration: "Fundamental para manter a coesão e a harmonia da equipe. Atua como um pilar de suporte e estabilidade, equilibrando a impulsividade dos perfis 'D' e 'I'."
  },
  C: {
    title: "Conformidade (C)",
    description: "Indivíduos com perfil de conformidade são precisos, analíticos e organizados. Eles se concentram em qualidade, precisão e seguem as regras e procedimentos.",
    strengths: ["Preciso", "Analítico", "Organizado", "Focado em qualidade"],
    weaknesses: ["Perfeccionista", "Crítico", "Pode se prender a detalhes", "Distante emocionalmente"],
    motivators: "Qualidade, precisão e lógica.",
    communication: "Formal, baseada em fatos e dados. Prefere comunicação escrita e detalhada.",
    teamIntegration: "Essencial para garantir a qualidade, a conformidade e a precisão dos projetos. Fornece a base analítica para as decisões, complementando a visão geral dos perfis 'D' e 'I'."
  }
};

export const PROFESSIONAL_AREAS: ProfessionalArea[] = ['Tecnologia da Informação', 'Recursos Humanos', 'Marketing e Vendas', 'Finanças e Contabilidade', 'Operações e Logística', 'Jurídico', 'Design de Produto', 'Administrativo', 'Outra'];

export const MOTIVATORS: Motivator[] = ['Impacto Social', 'Estabilidade', 'Reconhecimento', 'Inovação', 'Autonomia', 'Desenvolvimento Pessoal', 'Remuneração', 'Equilíbrio Vida-Trabalho'];
export const LEARNING_STYLES: LearningStyle[] = ['Visual', 'Auditivo', 'Cinestésico (Prático)', 'Leitura/Escrita'];
export const WORK_ENVIRONMENTS: WorkEnvironment[] = ['Colaborativo', 'Autônomo', 'Estruturado', 'Dinâmico'];

export const CONFLICT_STYLES: ConflictStyle[] = [ConflictStyle.Competition, ConflictStyle.Accommodation, ConflictStyle.Avoidance, ConflictStyle.Compromise, ConflictStyle.Collaboration];
export const PRESSURE_RESPONSES: PressureResponse[] = [PressureResponse.IntensifiedFocus, PressureResponse.CollaborationSeeking, PressureResponse.AnalyticalRetreat, PressureResponse.EmotionalExpression];
export const FEEDBACK_PREFERENCES: FeedbackPreference[] = [FeedbackPreference.Direct, FeedbackPreference.Gentle, FeedbackPreference.Written, FeedbackPreference.Private];
export const CORE_VALUES: string[] = ['Transparência', 'Rigor', 'Inovação', 'Respeito', 'Confiança', 'Lealdade', 'Colaboração', 'Autonomia'];


export const AUDIT_LOG_KEY = 'disc_audit_log_v3';
export const PROPOSAL_LOG_KEY = 'disc_proposal_log_v2';
export const TEAMS_KEY = 'disc_teams_log_v1';
export const APP_VERSION = '2.0';
// bycao (ogrorvatigão) 2025