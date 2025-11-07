// 📋 DISC QUESTIONNAIRE - Definições das 24 Perguntas
// Extraído e otimizado do SISGEAD 2.0

export interface DISCQuestion {
  id: number;
  text: string;
  category: 'behavior' | 'communication' | 'work' | 'leadership';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  weight: number; // Importância da questão (1-5)
}

// ────────────────────────────────────────────────────────────
// QUESTIONÁRIO COMPLETO - 24 QUESTÕES
// ────────────────────────────────────────────────────────────

export const DISC_QUESTIONS: DISCQuestion[] = [
  
  // COMPORTAMENTO GERAL (Questões 1-6)
  {
    id: 1,
    text: 'Em situações de trabalho, eu costumo:',
    category: 'behavior',
    weight: 4,
    options: {
      A: 'Tomar decisões rápidas e assumir o controle',
      B: 'Interagir e motivar as pessoas ao meu redor',
      C: 'Manter a calma e apoiar a equipe',
      D: 'Analisar cuidadosamente antes de agir'
    }
  },
  
  {
    id: 2,
    text: 'Quando enfrento um problema, minha primeira reação é:',
    category: 'behavior',
    weight: 5,
    options: {
      A: 'Enfrentá-lo diretamente e buscar solução imediata',
      B: 'Discutir com outras pessoas para gerar ideias',
      C: 'Pensar nas implicações para todos os envolvidos',
      D: 'Pesquisar dados e fatos antes de decidir'
    }
  },
  
  {
    id: 3,
    text: 'Meus colegas me descrevem como alguém:',
    category: 'behavior',
    weight: 3,
    options: {
      A: 'Determinado e orientado para resultados',
      B: 'Entusiasmado e comunicativo',
      C: 'Paciente e confiável',
      D: 'Preciso e meticuloso'
    }
  },
  
  {
    id: 4,
    text: 'Em uma reunião de equipe, eu geralmente:',
    category: 'behavior',
    weight: 4,
    options: {
      A: 'Lidero a discussão e defino a agenda',
      B: 'Contribuo com ideias criativas e energizo o grupo',
      C: 'Ouço atentamente e apoio as ideias dos outros',
      D: 'Faço perguntas e verifico detalhes'
    }
  },
  
  {
    id: 5,
    text: 'Sob pressão, eu tendo a:',
    category: 'behavior',
    weight: 5,
    options: {
      A: 'Me tornar mais assertivo e focado no objetivo',
      B: 'Buscar apoio e colaboração dos outros',
      C: 'Me manter estável e evitar conflitos',
      D: 'Me concentrar ainda mais nos detalhes'
    }
  },
  
  {
    id: 6,
    text: 'Minha maior motivação no trabalho é:',
    category: 'behavior',
    weight: 4,
    options: {
      A: 'Alcançar metas e vencer desafios',
      B: 'Reconhecimento e interação social',
      C: 'Estabilidade e harmonia no ambiente',
      D: 'Qualidade e precisão no trabalho'
    }
  },
  
  // COMUNICAÇÃO (Questões 7-12)
  {
    id: 7,
    text: 'Meu estilo de comunicação é:',
    category: 'communication',
    weight: 4,
    options: {
      A: 'Direto e objetivo',
      B: 'Expressivo e amigável',
      C: 'Calmo e paciente',
      D: 'Formal e detalhado'
    }
  },
  
  {
    id: 8,
    text: 'Quando discordo de alguém, eu:',
    category: 'communication',
    weight: 5,
    options: {
      A: 'Expresso minha opinião claramente e defendo meu ponto',
      B: 'Tento persuadir de forma entusiástica',
      C: 'Evito confronto e busco consenso',
      D: 'Apresento fatos e argumentos lógicos'
    }
  },
  
  {
    id: 9,
    text: 'Ao dar feedback, eu prefiro ser:',
    category: 'communication',
    weight: 3,
    options: {
      A: 'Franco e direto ao ponto',
      B: 'Positivo e encorajador',
      C: 'Gentil e construtivo',
      D: 'Específico e baseado em fatos'
    }
  },
  
  {
    id: 10,
    text: 'Em conversas casuais, eu geralmente:',
    category: 'communication',
    weight: 3,
    options: {
      A: 'Vou direto ao assunto principal',
      B: 'Falo sobre vários tópicos com entusiasmo',
      C: 'Ouço mais do que falo',
      D: 'Prefiro conversas com propósito específico'
    }
  },
  
  {
    id: 11,
    text: 'Ao apresentar ideias, eu:',
    category: 'communication',
    weight: 4,
    options: {
      A: 'Foco nos resultados e impactos',
      B: 'Uso storytelling e exemplos inspiradores',
      C: 'Considero o impacto nas pessoas',
      D: 'Apresento dados e análises detalhadas'
    }
  },
  
  {
    id: 12,
    text: 'Prefiro receber instruções que sejam:',
    category: 'communication',
    weight: 3,
    options: {
      A: 'Rápidas e focadas no resultado esperado',
      B: 'Interativas e com espaço para criatividade',
      C: 'Claras, com tempo para assimilar',
      D: 'Detalhadas e com documentação'
    }
  },
  
  // TRABALHO EM EQUIPE (Questões 13-18)
  {
    id: 13,
    text: 'Em um projeto de equipe, meu papel natural é:',
    category: 'work',
    weight: 5,
    options: {
      A: 'Liderar e tomar decisões',
      B: 'Inspirar e motivar o grupo',
      C: 'Apoiar e manter a harmonia',
      D: 'Garantir qualidade e precisão'
    }
  },
  
  {
    id: 14,
    text: 'Prefiro trabalhar em ambientes que sejam:',
    category: 'work',
    weight: 4,
    options: {
      A: 'Dinâmicos e competitivos',
      B: 'Colaborativos e sociais',
      C: 'Estáveis e previsíveis',
      D: 'Organizados e estruturados'
    }
  },
  
  {
    id: 15,
    text: 'Ao delegar tarefas, eu:',
    category: 'work',
    weight: 4,
    options: {
      A: 'Dou autonomia e espero resultados',
      B: 'Delego com entusiasmo e confiança',
      C: 'Me certifico de que a pessoa está confortável',
      D: 'Forneço instruções detalhadas'
    }
  },
  
  {
    id: 16,
    text: 'Minha contribuição mais valorizada pela equipe é:',
    category: 'work',
    weight: 4,
    options: {
      A: 'Capacidade de tomar decisões difíceis',
      B: 'Positividade e energia contagiante',
      C: 'Estabilidade e confiabilidade',
      D: 'Atenção aos detalhes e precisão'
    }
  },
  
  {
    id: 17,
    text: 'Lido com mudanças:',
    category: 'work',
    weight: 5,
    options: {
      A: 'Abraçando rapidamente e buscando oportunidades',
      B: 'Com otimismo e adaptabilidade',
      C: 'Com cautela, preferindo transições graduais',
      D: 'Analisando impactos e planejando cuidadosamente'
    }
  },
  
  {
    id: 18,
    text: 'Para mim, um projeto bem-sucedido é aquele que:',
    category: 'work',
    weight: 4,
    options: {
      A: 'Atinge ou supera as metas estabelecidas',
      B: 'É realizado com entusiasmo e colaboração',
      C: 'Mantém todos satisfeitos e engajados',
      D: 'É executado com excelência e sem erros'
    }
  },
  
  // LIDERANÇA E TOMADA DE DECISÃO (Questões 19-24)
  {
    id: 19,
    text: 'Meu estilo de liderança é:',
    category: 'leadership',
    weight: 5,
    options: {
      A: 'Autoritário e focado em resultados',
      B: 'Inspirador e visionário',
      C: 'Participativo e apoiador',
      D: 'Analítico e baseado em dados'
    }
  },
  
  {
    id: 20,
    text: 'Ao tomar decisões importantes, eu:',
    category: 'leadership',
    weight: 5,
    options: {
      A: 'Decido rapidamente baseado na intuição',
      B: 'Busco input da equipe antes de decidir',
      C: 'Considero o impacto em todas as pessoas',
      D: 'Analiso todas as opções sistematicamente'
    }
  },
  
  {
    id: 21,
    text: 'Enfrento conflitos na equipe:',
    category: 'leadership',
    weight: 5,
    options: {
      A: 'Intervindo diretamente para resolver',
      B: 'Facilitando o diálogo entre as partes',
      C: 'Buscando compromissos que agradem a todos',
      D: 'Analisando os fatos antes de mediar'
    }
  },
  
  {
    id: 22,
    text: 'Para motivar minha equipe, eu:',
    category: 'leadership',
    weight: 4,
    options: {
      A: 'Estabeleço metas desafiadoras',
      B: 'Celebro conquistas e reconheço contribuições',
      C: 'Crio ambiente seguro e acolhedor',
      D: 'Valorizo qualidade e desenvolvimento profissional'
    }
  },
  
  {
    id: 23,
    text: 'Minha abordagem ao risco é:',
    category: 'leadership',
    weight: 4,
    options: {
      A: 'Aceito riscos calculados para grandes resultados',
      B: 'Sou otimista sobre novas oportunidades',
      C: 'Prefiro evitar riscos desnecessários',
      D: 'Avalio cuidadosamente antes de assumir riscos'
    }
  },
  
  {
    id: 24,
    text: 'Avalio o desempenho da equipe baseado em:',
    category: 'leadership',
    weight: 4,
    options: {
      A: 'Resultados alcançados e metas cumpridas',
      B: 'Engajamento e colaboração da equipe',
      C: 'Bem-estar e satisfação dos membros',
      D: 'Qualidade e precisão do trabalho entregue'
    }
  }
];

// ────────────────────────────────────────────────────────────
// HELPERS E VALIDAÇÕES
// ────────────────────────────────────────────────────────────

/**
 * Retorna uma questão específica por ID
 */
export function getQuestionById(id: number): DISCQuestion | undefined {
  return DISC_QUESTIONS.find(q => q.id === id);
}

/**
 * Retorna questões por categoria
 */
export function getQuestionsByCategory(
  category: DISCQuestion['category']
): DISCQuestion[] {
  return DISC_QUESTIONS.filter(q => q.category === category);
}

/**
 * Estatísticas do questionário
 */
export function getQuestionnaireStats() {
  const byCategory = DISC_QUESTIONS.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgWeight = DISC_QUESTIONS.reduce((sum, q) => sum + q.weight, 0) / DISC_QUESTIONS.length;
  
  return {
    totalQuestions: DISC_QUESTIONS.length,
    byCategory,
    averageWeight: avgWeight,
    categories: Object.keys(byCategory),
    weightRange: {
      min: Math.min(...DISC_QUESTIONS.map(q => q.weight)),
      max: Math.max(...DISC_QUESTIONS.map(q => q.weight))
    }
  };
}

/**
 * Valida se um conjunto de respostas está completo
 */
export function validateAnswerCompleteness(
  answers: Record<number, string>
): { valid: boolean; missing: number[] } {
  const missing: number[] = [];
  
  for (let i = 1; i <= 24; i++) {
    if (!answers[i]) {
      missing.push(i);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Gera questionário embaralhado (para evitar padrões)
 */
export function getShuffledQuestionnaire(): DISCQuestion[] {
  const shuffled = [...DISC_QUESTIONS];
  
  // Shuffle usando algoritmo Fisher-Yates
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Renumerar IDs para manter sequência
  return shuffled.map((q, index) => ({
    ...q,
    id: index + 1
  }));
}

/**
 * Retorna progresso de resposta
 */
export function getAnswerProgress(
  answers: Record<number, string>
): {
  answered: number;
  total: number;
  percentage: number;
  byCategory: Record<string, { answered: number; total: number }>;
} {
  const answered = Object.keys(answers).length;
  const total = DISC_QUESTIONS.length;
  
  const byCategory = DISC_QUESTIONS.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = { answered: 0, total: 0 };
    }
    acc[q.category].total++;
    if (answers[q.id]) {
      acc[q.category].answered++;
    }
    return acc;
  }, {} as Record<string, { answered: number; total: number }>);
  
  return {
    answered,
    total,
    percentage: Math.round((answered / total) * 100),
    byCategory
  };
}

// ────────────────────────────────────────────────────────────
// TEXTOS AUXILIARES (para UI)
// ────────────────────────────────────────────────────────────

export const QUESTIONNAIRE_INSTRUCTIONS = {
  title: 'Questionário de Perfil DISC',
  
  description: `O DISC é uma ferramenta de avaliação comportamental que identifica 
seu estilo predominante em quatro dimensões: Dominância, Influência, Estabilidade 
e Conformidade. Responda com honestidade, pensando em como você realmente age, 
não em como gostaria de agir.`,
  
  instructions: [
    'Leia cada afirmação cuidadosamente',
    'Escolha a opção que MELHOR descreve você',
    'Não há respostas certas ou erradas',
    'Responda pensando em situações do dia a dia',
    'Seja honesto e espontâneo',
    'Não pense demais - escolha sua primeira reação'
  ],
  
  timeEstimate: '10-15 minutos',
  
  privacyNote: `Suas respostas são confidenciais e usadas apenas para 
gerar seu perfil comportamental e recomendações de equipe.`
};

export const CATEGORY_LABELS = {
  behavior: 'Comportamento Geral',
  communication: 'Comunicação',
  work: 'Trabalho em Equipe',
  leadership: 'Liderança e Decisão'
};

export const CATEGORY_DESCRIPTIONS = {
  behavior: 'Como você age naturalmente no dia a dia',
  communication: 'Sua forma de se expressar e interagir',
  work: 'Suas preferências no ambiente de trabalho',
  leadership: 'Seu estilo de liderar e decidir'
};
