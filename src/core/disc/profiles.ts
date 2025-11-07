// 🎯 DISC PROFILES - Características Detalhadas dos 8 Perfis
// Baseado em metodologia DISC consolidada + experiência SISGEAD 2.0

export interface ProfileCharacteristics {
  code: string;
  name: string;
  description: string;
  
  // Características comportamentais
  strengths: string[];
  challenges: string[];
  motivations: string[];
  fears: string[];
  
  // Estilo de trabalho
  workStyle: {
    pace: 'rápido' | 'moderado' | 'lento';
    focus: 'tarefa' | 'pessoa' | 'balanceado';
    approach: 'ativo' | 'reflexivo';
    decisionMaking: 'rápido' | 'ponderado' | 'consultivo';
  };
  
  // Comunicação
  communication: {
    style: string;
    preferences: string[];
    avoid: string[];
  };
  
  // Liderança
  leadership: {
    style: string;
    strengths: string[];
    developmentAreas: string[];
  };
  
  // Ambiente ideal
  idealEnvironment: string[];
  
  // Desenvolvimento
  growthTips: string[];
  
  // Famosos com este perfil (referência)
  examples: string[];
}

// ════════════════════════════════════════════════════════════
// PERFIS PUROS (D, I, S, C)
// ════════════════════════════════════════════════════════════

export const PROFILE_DOMINANCE: ProfileCharacteristics = {
  code: 'D',
  name: 'Dominância',
  description: 'Direto, assertivo e orientado para resultados. Gosta de desafios e assume riscos calculados.',
  
  strengths: [
    'Toma decisões rápidas e firmes',
    'Focado em objetivos e resultados',
    'Confiante e assertivo',
    'Enfrenta desafios de frente',
    'Capacidade de liderança natural',
    'Aceita responsabilidades facilmente',
    'Busca constantemente inovação',
    'Competitivo e determinado'
  ],
  
  challenges: [
    'Pode ser percebido como agressivo',
    'Impaciência com processos lentos',
    'Pouca atenção a detalhes',
    'Dificuldade em delegar controle',
    'Pode ignorar aspectos emocionais',
    'Tendência a ser muito direto',
    'Resistência a autoridade',
    'Pode intimidar pessoas mais sensíveis'
  ],
  
  motivations: [
    'Alcançar metas desafiadoras',
    'Ter autonomia e controle',
    'Vencer competições',
    'Resolver problemas complexos',
    'Liderar e influenciar',
    'Resultados tangíveis',
    'Reconhecimento por conquistas'
  ],
  
  fears: [
    'Perder controle',
    'Ser visto como fraco',
    'Fracassar publicamente',
    'Rotina e estagnação',
    'Dependência excessiva de outros'
  ],
  
  workStyle: {
    pace: 'rápido',
    focus: 'tarefa',
    approach: 'ativo',
    decisionMaking: 'rápido'
  },
  
  communication: {
    style: 'Direto, objetivo e focado em resultados',
    preferences: [
      'Conversas breves e ao ponto',
      'Foco no "o quê" e "quando"',
      'Comunicação escrita concisa',
      'Discussões orientadas à ação'
    ],
    avoid: [
      'Excesso de detalhes',
      'Conversas sociais longas',
      'Indecisão prolongada',
      'Formalidades excessivas'
    ]
  },
  
  leadership: {
    style: 'Autoritário e orientado para resultados',
    strengths: [
      'Define direção clara',
      'Toma decisões difíceis',
      'Mantém foco nos objetivos',
      'Inspira ação e movimento'
    ],
    developmentAreas: [
      'Desenvolver empatia',
      'Ouvir mais a equipe',
      'Delegar com confiança',
      'Valorizar processos'
    ]
  },
  
  idealEnvironment: [
    'Metas claras e desafiadoras',
    'Autonomia para decidir',
    'Recompensas por resultados',
    'Ambiente competitivo',
    'Oportunidades de liderança',
    'Desafios constantes'
  ],
  
  growthTips: [
    'Pratique paciência e escuta ativa',
    'Considere impacto emocional das decisões',
    'Delegue mais e confie na equipe',
    'Desenvolva atenção a detalhes',
    'Equilibre resultados com relacionamentos',
    'Aceite feedback sem defensividade'
  ],
  
  examples: [
    'Steve Jobs',
    'Margaret Thatcher',
    'Donald Trump',
    'Gordon Ramsay'
  ]
};

export const PROFILE_INFLUENCE: ProfileCharacteristics = {
  code: 'I',
  name: 'Influência',
  description: 'Comunicativo, entusiástico e persuasivo. Gosta de interagir e inspirar pessoas.',
  
  strengths: [
    'Excelente comunicador',
    'Entusiástico e motivador',
    'Cria conexões facilmente',
    'Otimista e positivo',
    'Criativo e inovador',
    'Inspira e energiza equipes',
    'Flexível e adaptável',
    'Habilidade natural de persuasão'
  ],
  
  challenges: [
    'Pode ser desorganizado',
    'Dificuldade com follow-through',
    'Evita confrontos',
    'Toma decisões emocionais',
    'Pode ser superficial em detalhes',
    'Busca aprovação excessivamente',
    'Dificuldade em dizer "não"',
    'Pode prometer além do possível'
  ],
  
  motivations: [
    'Reconhecimento social',
    'Interação com pessoas',
    'Ambiente divertido',
    'Aprovação e elogios',
    'Liberdade de expressão',
    'Oportunidades criativas',
    'Popularidade'
  ],
  
  fears: [
    'Rejeição social',
    'Ser ignorado',
    'Ambientes frios e impessoais',
    'Perder popularidade',
    'Trabalho isolado'
  ],
  
  workStyle: {
    pace: 'rápido',
    focus: 'pessoa',
    approach: 'ativo',
    decisionMaking: 'consultivo'
  },
  
  communication: {
    style: 'Expressivo, amigável e inspirador',
    preferences: [
      'Conversas face-a-face',
      'Storytelling e exemplos',
      'Discussões criativas',
      'Feedback positivo frequente'
    ],
    avoid: [
      'Comunicação fria e formal',
      'Excesso de dados técnicos',
      'Críticas públicas',
      'Ambiente silencioso'
    ]
  },
  
  leadership: {
    style: 'Inspirador e visionário',
    strengths: [
      'Motiva e energiza equipe',
      'Cria ambiente positivo',
      'Promove colaboração',
      'Comunica visão com paixão'
    ],
    developmentAreas: [
      'Melhorar organização',
      'Focar em detalhes',
      'Dar feedbacks difíceis',
      'Estabelecer limites claros'
    ]
  },
  
  idealEnvironment: [
    'Trabalho em equipe',
    'Interação social frequente',
    'Reconhecimento público',
    'Variedade de tarefas',
    'Ambiente descontraído',
    'Liberdade criativa'
  ],
  
  growthTips: [
    'Desenvolva disciplina e organização',
    'Pratique escuta ativa',
    'Faça follow-up consistente',
    'Aprenda a dizer "não"',
    'Foque em profundidade, não só amplitude',
    'Aceite críticas construtivas'
  ],
  
  examples: [
    'Oprah Winfrey',
    'Ellen DeGeneres',
    'Robin Williams',
    'Tony Robbins'
  ]
};

export const PROFILE_STEADINESS: ProfileCharacteristics = {
  code: 'S',
  name: 'Estabilidade',
  description: 'Paciente, leal e cooperativo. Valoriza harmonia e relacionamentos duradouros.',
  
  strengths: [
    'Extremamente confiável',
    'Paciente e calmo',
    'Bom ouvinte',
    'Leal à equipe',
    'Mantém harmonia',
    'Consistente e previsível',
    'Empático e compreensivo',
    'Excelente trabalho em equipe'
  ],
  
  challenges: [
    'Resiste a mudanças',
    'Evita conflitos',
    'Dificuldade em dizer "não"',
    'Pode ser indeciso',
    'Lentidão para agir',
    'Guarda ressentimentos',
    'Pode se acomodar',
    'Dificuldade em priorizar próprias necessidades'
  ],
  
  motivations: [
    'Estabilidade e segurança',
    'Harmonia no ambiente',
    'Relacionamentos duradouros',
    'Ajudar os outros',
    'Reconhecimento pessoal',
    'Ambiente previsível',
    'Trabalho significativo'
  ],
  
  fears: [
    'Mudanças bruscas',
    'Conflitos e confrontos',
    'Perder segurança',
    'Decepcionar pessoas queridas',
    'Ambientes caóticos'
  ],
  
  workStyle: {
    pace: 'lento',
    focus: 'pessoa',
    approach: 'reflexivo',
    decisionMaking: 'ponderado'
  },
  
  communication: {
    style: 'Calmo, gentil e paciente',
    preferences: [
      'Conversas one-on-one',
      'Tom respeitoso e amigável',
      'Tempo para processar informações',
      'Ambiente seguro para expressar'
    ],
    avoid: [
      'Pressão para decisão rápida',
      'Confrontações agressivas',
      'Mudanças sem aviso',
      'Ambiente competitivo hostil'
    ]
  },
  
  leadership: {
    style: 'Participativo e apoiador',
    strengths: [
      'Cria ambiente acolhedor',
      'Desenvolve lealdade',
      'Escuta genuína',
      'Mediação de conflitos'
    ],
    developmentAreas: [
      'Tomar decisões mais rápidas',
      'Lidar com confrontos',
      'Impulsionar mudanças',
      'Estabelecer limites firmes'
    ]
  },
  
  idealEnvironment: [
    'Rotina estabelecida',
    'Equipe colaborativa',
    'Ambiente sem conflitos',
    'Reconhecimento sincero',
    'Tempo adequado para tarefas',
    'Relacionamentos de longo prazo'
  ],
  
  growthTips: [
    'Pratique assertividade',
    'Abrace mudanças gradualmente',
    'Expresse opiniões mais abertamente',
    'Estabeleça limites saudáveis',
    'Desenvolva tolerância a conflitos',
    'Aceite que nem sempre pode agradar todos'
  ],
  
  examples: [
    'Mother Teresa',
    'Jimmy Carter',
    'Fred Rogers',
    'Keanu Reeves'
  ]
};

export const PROFILE_CONSCIENTIOUSNESS: ProfileCharacteristics = {
  code: 'C',
  name: 'Conformidade',
  description: 'Analítico, preciso e meticuloso. Valoriza qualidade e excelência.',
  
  strengths: [
    'Atenção excepcional a detalhes',
    'Analítico e lógico',
    'Alto padrão de qualidade',
    'Organizado e sistemático',
    'Segue regras e procedimentos',
    'Pesquisa antes de agir',
    'Precisão e acurácia',
    'Pensamento crítico'
  ],
  
  challenges: [
    'Perfeccionismo excessivo',
    'Paralisia por análise',
    'Crítico demais',
    'Dificuldade com ambiguidade',
    'Resistência a mudanças não planejadas',
    'Pode ser inflexível',
    'Evita riscos',
    'Dificuldade em expressar emoções'
  ],
  
  motivations: [
    'Qualidade e excelência',
    'Precisão e acurácia',
    'Compreensão profunda',
    'Ordem e organização',
    'Trabalho bem feito',
    'Reconhecimento por expertise',
    'Ambiente estruturado'
  ],
  
  fears: [
    'Cometer erros',
    'Críticas ao trabalho',
    'Falta de padrões',
    'Caos e desorganização',
    'Ser visto como incompetente'
  ],
  
  workStyle: {
    pace: 'lento',
    focus: 'tarefa',
    approach: 'reflexivo',
    decisionMaking: 'ponderado'
  },
  
  communication: {
    style: 'Formal, preciso e baseado em fatos',
    preferences: [
      'Comunicação escrita detalhada',
      'Dados e evidências',
      'Tempo para análise',
      'Formalidade adequada'
    ],
    avoid: [
      'Decisões precipitadas',
      'Informações vagas',
      'Emotividade excessiva',
      'Falta de documentação'
    ]
  },
  
  leadership: {
    style: 'Analítico e baseado em dados',
    strengths: [
      'Garante qualidade',
      'Toma decisões fundamentadas',
      'Cria processos eficientes',
      'Mantém altos padrões'
    ],
    developmentAreas: [
      'Aceitar imperfeições',
      'Tomar decisões mais rápidas',
      'Desenvolver flexibilidade',
      'Expressar emoções'
    ]
  },
  
  idealEnvironment: [
    'Processos claros e definidos',
    'Tempo para pesquisa',
    'Padrões de qualidade',
    'Ambiente organizado',
    'Reconhecimento por precisão',
    'Trabalho especializado'
  ],
  
  growthTips: [
    'Pratique "good enough" vs perfeito',
    'Desenvolva tolerância a erros',
    'Acelere tomada de decisão',
    'Aceite ambiguidade',
    'Expresse mais emoções',
    'Delegue detalhes ocasionalmente'
  ],
  
  examples: [
    'Bill Gates',
    'Elon Musk (aspecto analítico)',
    'Albert Einstein',
    'Marie Curie'
  ]
};

// ════════════════════════════════════════════════════════════
// PERFIS COMBINADOS (D-I, D-C, I-S, S-C)
// ════════════════════════════════════════════════════════════

export const PROFILE_D_I: ProfileCharacteristics = {
  code: 'D-I',
  name: 'Dominância-Influência',
  description: 'Líder carismático e orientado para resultados. Combina assertividade com habilidades sociais.',
  
  strengths: [
    'Liderança carismática',
    'Comunica visão com paixão',
    'Toma decisões e mobiliza pessoas',
    'Enfrenta desafios com otimismo',
    'Persuasivo e assertivo',
    'Inspira ação imediata'
  ],
  
  challenges: [
    'Pode ser dominador em grupos',
    'Impaciência com detalhes',
    'Decisões impulsivas',
    'Pode ignorar aspectos técnicos'
  ],
  
  motivations: [
    'Liderar e inspirar',
    'Alcançar metas com equipe',
    'Reconhecimento público',
    'Desafios sociais'
  ],
  
  fears: [
    'Perder influência',
    'Fracasso público',
    'Rejeição social'
  ],
  
  workStyle: {
    pace: 'rápido',
    focus: 'balanceado',
    approach: 'ativo',
    decisionMaking: 'rápido'
  },
  
  communication: {
    style: 'Direto, entusiástico e persuasivo',
    preferences: [
      'Apresentações impactantes',
      'Discussões dinâmicas',
      'Reuniões energizadas'
    ],
    avoid: [
      'Excesso de burocracia',
      'Ambientes apáticos'
    ]
  },
  
  leadership: {
    style: 'Visionário e mobilizador',
    strengths: [
      'Comunica visão claramente',
      'Inspira e energiza',
      'Toma decisões rápidas'
    ],
    developmentAreas: [
      'Ouvir mais a equipe',
      'Atenção a detalhes',
      'Paciência com processos'
    ]
  },
  
  idealEnvironment: [
    'Desafios de liderança',
    'Interação com stakeholders',
    'Autonomia para decidir',
    'Reconhecimento visível'
  ],
  
  growthTips: [
    'Desenvolva escuta ativa',
    'Valorize expertise técnica',
    'Pratique follow-through',
    'Equilibre ação com reflexão'
  ],
  
  examples: [
    'Richard Branson',
    'Gary Vaynerchuk',
    'Tony Robbins'
  ]
};

export const PROFILE_D_C: ProfileCharacteristics = {
  code: 'D-C',
  name: 'Dominância-Conformidade',
  description: 'Líder estratégico e analítico. Combina foco em resultados com atenção a detalhes.',
  
  strengths: [
    'Decisões baseadas em dados',
    'Planejamento estratégico',
    'Foco em resultados com qualidade',
    'Pensamento crítico',
    'Resolução sistemática de problemas'
  ],
  
  challenges: [
    'Pode ser muito crítico',
    'Dificuldade com aspectos emocionais',
    'Perfeccionismo autoritário',
    'Impaciência com imprecisão'
  ],
  
  motivations: [
    'Excelência e eficiência',
    'Controle e qualidade',
    'Resultados mensuráveis',
    'Expertise reconhecida'
  ],
  
  fears: [
    'Erros críticos',
    'Perder controle da qualidade',
    'Incompetência'
  ],
  
  workStyle: {
    pace: 'moderado',
    focus: 'tarefa',
    approach: 'reflexivo',
    decisionMaking: 'ponderado'
  },
  
  communication: {
    style: 'Direto, preciso e baseado em fatos',
    preferences: [
      'Dados e métricas',
      'Análises detalhadas',
      'Comunicação objetiva'
    ],
    avoid: [
      'Imprecisões',
      'Decisões sem fundamento',
      'Emotividade excessiva'
    ]
  },
  
  leadership: {
    style: 'Estratégico e analítico',
    strengths: [
      'Planejamento robusto',
      'Decisões fundamentadas',
      'Altos padrões'
    ],
    developmentAreas: [
      'Desenvolver empatia',
      'Flexibilidade',
      'Aceitar "good enough"'
    ]
  },
  
  idealEnvironment: [
    'Metas claras e mensuráveis',
    'Processos definidos',
    'Autonomia técnica',
    'Reconhecimento por expertise'
  ],
  
  growthTips: [
    'Valorize aspectos humanos',
    'Pratique delegação',
    'Desenvolva paciência',
    'Aceite imperfeições'
  ],
  
  examples: [
    'Jeff Bezos',
    'Larry Page',
    'Warren Buffett'
  ]
};

export const PROFILE_I_S: ProfileCharacteristics = {
  code: 'I-S',
  name: 'Influência-Estabilidade',
  description: 'Colaborador amigável e empático. Valoriza relacionamentos e harmonia.',
  
  strengths: [
    'Excelente em relações interpessoais',
    'Cria ambiente acolhedor',
    'Empático e compreensivo',
    'Lealdade genuína',
    'Mediação de conflitos'
  ],
  
  challenges: [
    'Dificuldade em dizer "não"',
    'Evita confrontos necessários',
    'Pode ser indeciso',
    'Busca aprovação excessiva'
  ],
  
  motivations: [
    'Harmonia e conexão',
    'Ajudar pessoas',
    'Reconhecimento afetivo',
    'Ambiente positivo'
  ],
  
  fears: [
    'Rejeição',
    'Conflitos',
    'Solidão',
    'Mudanças bruscas'
  ],
  
  workStyle: {
    pace: 'moderado',
    focus: 'pessoa',
    approach: 'ativo',
    decisionMaking: 'consultivo'
  },
  
  communication: {
    style: 'Amigável, caloroso e empático',
    preferences: [
      'Conversas pessoais',
      'Ambiente acolhedor',
      'Feedback positivo'
    ],
    avoid: [
      'Críticas duras',
      'Ambiente hostil',
      'Pressão excessiva'
    ]
  },
  
  leadership: {
    style: 'Colaborativo e acolhedor',
    strengths: [
      'Desenvolve lealdade',
      'Cria coesão',
      'Escuta genuína'
    ],
    developmentAreas: [
      'Tomar decisões difíceis',
      'Dar feedbacks diretos',
      'Estabelecer limites'
    ]
  },
  
  idealEnvironment: [
    'Trabalho em equipe',
    'Reconhecimento pessoal',
    'Estabilidade',
    'Ambiente amigável'
  ],
  
  growthTips: [
    'Desenvolva assertividade',
    'Pratique feedbacks diretos',
    'Estabeleça prioridades',
    'Aceite conflitos saudáveis'
  ],
  
  examples: [
    'Ellen DeGeneres',
    'Mr. Rogers',
    'Jennifer Aniston'
  ]
};

export const PROFILE_S_C: ProfileCharacteristics = {
  code: 'S-C',
  name: 'Estabilidade-Conformidade',
  description: 'Profissional confiável e meticuloso. Valoriza qualidade e consistência.',
  
  strengths: [
    'Extremamente confiável',
    'Trabalho de alta qualidade',
    'Consistência exemplar',
    'Atenção a detalhes',
    'Seguimento de processos'
  ],
  
  challenges: [
    'Resistência a mudanças',
    'Pode ser muito cauteloso',
    'Lentidão para decidir',
    'Evita riscos necessários'
  ],
  
  motivations: [
    'Estabilidade e qualidade',
    'Trabalho bem feito',
    'Reconhecimento pela consistência',
    'Ambiente estruturado'
  ],
  
  fears: [
    'Erros e falhas',
    'Mudanças repentinas',
    'Caos e desorganização',
    'Críticas ao trabalho'
  ],
  
  workStyle: {
    pace: 'lento',
    focus: 'tarefa',
    approach: 'reflexivo',
    decisionMaking: 'ponderado'
  },
  
  communication: {
    style: 'Calmo, preciso e respeitoso',
    preferences: [
      'Instruções claras',
      'Documentação detalhada',
      'Tempo para processar'
    ],
    avoid: [
      'Pressão por velocidade',
      'Mudanças sem aviso',
      'Ambiguidade'
    ]
  },
  
  leadership: {
    style: 'Apoiador e sistemático',
    strengths: [
      'Garante qualidade',
      'Cria processos estáveis',
      'Desenvolve confiança'
    ],
    developmentAreas: [
      'Acelerar decisões',
      'Abraçar mudanças',
      'Tomar riscos calculados'
    ]
  },
  
  idealEnvironment: [
    'Rotinas estabelecidas',
    'Padrões de qualidade',
    'Ambiente organizado',
    'Tempo adequado'
  ],
  
  growthTips: [
    'Pratique flexibilidade',
    'Aceite "good enough"',
    'Desenvolva tolerância a mudanças',
    'Tome decisões mais rápidas'
  ],
  
  examples: [
    'Tim Cook',
    'Angela Merkel',
    'Satya Nadella'
  ]
};

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

export const ALL_PROFILES: Record<string, ProfileCharacteristics> = {
  'D': PROFILE_DOMINANCE,
  'I': PROFILE_INFLUENCE,
  'S': PROFILE_STEADINESS,
  'C': PROFILE_CONSCIENTIOUSNESS,
  'D-I': PROFILE_D_I,
  'D-C': PROFILE_D_C,
  'I-S': PROFILE_I_S,
  'S-C': PROFILE_S_C
};

export function getProfileByCode(code: string): ProfileCharacteristics | undefined {
  return ALL_PROFILES[code];
}

export function getAllProfileCodes(): string[] {
  return Object.keys(ALL_PROFILES);
}

export function getProfilesByFocus(focus: 'tarefa' | 'pessoa' | 'balanceado'): ProfileCharacteristics[] {
  return Object.values(ALL_PROFILES).filter(p => p.workStyle.focus === focus);
}

export function getProfilesByPace(pace: 'rápido' | 'moderado' | 'lento'): ProfileCharacteristics[] {
  return Object.values(ALL_PROFILES).filter(p => p.workStyle.pace === pace);
}
