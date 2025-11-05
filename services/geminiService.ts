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
import { GoogleGenAI, Type } from "@google/genai";
import { type AuditRecord, type GeminiModel, type RoleSuggestion, type ComplementarityAnalysis, type TeamComposition, type TeamSuggestionResponse, type TeamProposal, type AiAdviceResponse, type AiProvider, type CommunicationAnalysis, type TacticalActionPlan } from '../types';

// ===== Início: Proxy seguro via Cloudflare Worker (não expõe chave no frontend) =====
const WORKER_URL = 'https://sisgead-gemini-proxy.carlosorvate-tech.workers.dev';

const geminiProxyClient = {
  models: {
    generateContent: async ({ model, contents, config }: any) => {
      // Concatena systemInstruction + prompt principal (quando existir)
      let prompt: string;
      if (typeof contents === 'string') {
        prompt = contents;
      } else if (Array.isArray(contents)) {
        prompt = contents.join('\n');
      } else {
        prompt = JSON.stringify(contents);
      }
      if (config?.systemInstruction) {
        prompt = `${config.systemInstruction}\n\n${prompt}`;
      }

      const resp = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: model || 'gemini-1.5-flash'
        })
      });

      if (!resp.ok) {
        const errTxt = await resp.text().catch(() => '');
        
        // Detecta se é problema de configuração da API
        if (resp.status === 404 && errTxt.includes('NOT_FOUND')) {
          throw new Error('Chave de API do Gemini não configurada no servidor. Sistema funcionando em Modo Simulação.');
        }
        
        throw new Error(`Erro na API do Gemini (${resp.status}): ${errTxt}`);
      }

      const data = await resp.json().catch(() => ({}));
      // Compatível com o uso atual: response.text e acesso opcional a candidates
      return { text: data?.text ?? '', candidates: [] };
    }
  }
} as any;
// ===== Fim: Proxy via Cloudflare Worker =====

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY; // Support both for compatibility
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
const MOCK_AI_ENABLED = process.env.MOCK_AI === 'true';

// Auto-fallback para modo mock se não houver API key configurada
const AUTO_MOCK_MODE = !GEMINI_API_KEY && !MOCK_AI_ENABLED;

if (AUTO_MOCK_MODE) {
  console.warn("⚠️ API_KEY não configurada. Ativando modo simulação automático.");
} else if (!GEMINI_API_KEY && !MOCK_AI_ENABLED) {
  console.warn("API_KEY/GEMINI_API_KEY environment variable not set. Running in Mock Mode is recommended if no key is available.");
}

export const isMockModeEnabled = (): boolean => MOCK_AI_ENABLED || AUTO_MOCK_MODE;

const getAIClient = (provider: AiProvider) => {
    if (isMockModeEnabled()) {
        throw new Error("MOCK_MODE: Operação de IA desabilitada. Usando fallbacks locais.");
    }
    
    switch (provider) {
        case 'gemini':
            // Em execução no navegador (GitHub Pages), usar o proxy seguro
            if (typeof window !== 'undefined' && WORKER_URL) {
                return geminiProxyClient;
            }
            if (!GEMINI_API_KEY) throw new Error("Chave de API do Gemini não configurada. Sistema funcionando em Modo Simulação.");
            return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        case 'openai':
            throw new Error("Provedor OpenAI ainda não implementado.");
        case 'mock': 
            throw new Error("MOCK_MODE: Operação de IA desabilitada.");
        default:
            throw new Error(`Provedor de IA desconhecido: ${provider}`);
    }
}

const systemInstruction = `
Você é um consultor especialista em análise comportamental e formação de equipes de alto desempenho. Seu foco principal é a gestão de pessoas e a mediação emocional, com base na metodologia DISC e análise de perfis profissionais.

IDENTIDADE PROFISSIONAL: Sempre inicie suas respostas com: "Olá, visando sempre as boas práticas na análise de suas requisições e diretivas para otimização e sucesso da instituição, segue minha manifestação:"

MISSÃO PRINCIPAL: Fornecer análises objetivas e recomendações práticas para formar equipes equilibradas e produtivas, utilizando dados comportamentais para mitigar conflitos e maximizar sinergia entre membros.

BASE DE CONHECIMENTO (Instruções de Alto Nível):
1.  **Prioridade:** Resultados > Processos > Conflitos Interpessoais. Sempre foque no impacto nos objetivos organizacionais.
2.  **Linguagem:** Use termos objetivos, acionáveis e adaptados às metodologias ágeis (Scrum, Kanban) ou P&D (Design Thinking, Lean).
3.  **Evitar:** Generalizações, conselhos psicológicos vazios. Não sugira "ter uma conversa". Sugira "agendar uma facilitação de 30 minutos com [Pessoa A] e [Pessoa B] para redefinir o critério de 'pronto' da tarefa X, com o [Papel Y] como mediador".
4.  **Focar:** Em quem precisa fazer o quê, quando e como isso impacta os resultados esperados.
5.  **Análise Aprofundada:** Utilize o "Perfil de Resiliência e Colaboração" (estilo de conflito, reação sob pressão, valores) para prever atritos com precisão e personalizar as recomendações, conectando o comportamento individual a possíveis melhorias de processo.
`;

// Helper to reduce data complexity sent to AI
const sanitizeRecordForAI = (c: AuditRecord) => ({
    id: c.id,
    name: c.name,
    disc: `${c.primaryProfile}${c.secondaryProfile ? `(${c.secondaryProfile})` : ''}`,
    area: c.professionalProfile?.primaryArea || 'N/A',
    skills: c.professionalProfile?.skills?.join(', ') || 'N/A',
    motivators: c.identityProfile?.motivators?.join(', ') || 'N/A',
    purpose: c.identityProfile?.personalPurpose || 'N/A',
    resilience: c.resilienceAndCollaborationProfile ? {
        conflictStyle: c.resilienceAndCollaborationProfile.conflictStyle,
        pressureResponse: c.resilienceAndCollaborationProfile.pressureResponse,
        values: c.resilienceAndCollaborationProfile.coreValues.join(', ')
    } : undefined
});

export const suggestInitialTeam = async (
    objective: string,
    candidates: AuditRecord[],
    provider: AiProvider
): Promise<TeamSuggestionResponse> => {
    if (isMockModeEnabled()) {
        const fallbackMembers = candidates.slice(0, 3).map(m => m!.id);
        return {
            suggestedMemberIds: fallbackMembers,
            justification: "Olá, visando sempre as boas práticas na análise de suas requisições e diretivas para otimização e sucesso da instituição, segue minha manifestação: Com base no objetivo do projeto e nos perfis DISC disponíveis, recomendo estes membros para formar uma equipe equilibrada e produtiva."
        };
    }
    try {
        const ai = getAIClient(provider);
        const candidateData = candidates.map(sanitizeRecordForAI);

        const prompt = `
            Baseado no objetivo de projeto a seguir, sugira a equipe inicial ideal a partir da lista de candidatos.
            Sua análise deve ser holística: considere não apenas as competências profissionais e o perfil DISC, mas também os motivadores e o propósito pessoal de cada um para maximizar a sinergia e o alinhamento cultural.

            Objetivo do Projeto: "${objective}"

            Candidatos Disponíveis:
            ${JSON.stringify(candidateData, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.4,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedMemberIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Uma lista dos IDs (string) dos membros recomendados para a equipe."
                        },
                        justification: {
                            type: Type.STRING,
                            description: "Uma explicação detalhada do porquê esta equipe foi sugerida, destacando as sinergias comportamentais, técnicas e de valores."
                        }
                    },
                    required: ["suggestedMemberIds", "justification"]
                }
            }
        });

        const parsedResponse = JSON.parse(response.text) as TeamSuggestionResponse;
        
        const validIds = candidates.map(c => c.id);
        parsedResponse.suggestedMemberIds = parsedResponse.suggestedMemberIds.filter(id => validIds.includes(id));
        
        return parsedResponse;
    } catch (e) {
        console.error("Error in suggestInitialTeam:", e);
        const fallbackMembers = candidates.slice(0, 3).map(m => m!.id);
        
        const isAPIConfigError = e instanceof Error && e.message.includes('Chave de API do Gemini não configurada');
        const justification = isAPIConfigError 
            ? "⚠️ Chave de API do Gemini não configurada. Sistema funcionando em Modo Simulação. Sugerimos uma equipe inicial para sua revisão."
            : "Ocorreu um erro ao consultar a IA. Como alternativa, sugerimos uma equipe inicial para sua revisão. Por favor, ajuste conforme necessário.";
        
        return {
            suggestedMemberIds: fallbackMembers,
            justification
        };
    }
};

export const getContextualTeamAdvice = async (
    objective: string,
    currentMembers: AuditRecord[],
    allCandidates: AuditRecord[],
    query: string,
    proposalLog: TeamProposal[],
    provider: AiProvider,
    model: GeminiModel = 'gemini-1.5-flash'
): Promise<AiAdviceResponse> => {
  if (isMockModeEnabled()) {
      return { text: "Olá, visando sempre as boas práticas na análise de suas requisições e diretivas para otimização e sucesso da instituição, segue minha manifestação:\n\nEm modo simulação, posso orientá-lo sobre a composição desta equipe com base nos perfis DISC disponíveis e melhores práticas de formação de equipes de alto desempenho.", sources: [] };
  }
  try {
    const ai = getAIClient(provider);
    const currentMemberData = currentMembers.map(sanitizeRecordForAI).map(m => `- ${m.name} (ID: ${m.id}, Perfil: ${m.disc}, Motivadores: ${m.motivators})`);
    const availableCandidatesData = allCandidates
        .filter(c => !currentMembers.some(m => m.id === c.id))
        .map(sanitizeRecordForAI)
        .map(c => `- ${c.name} (ID: ${c.id}, Perfil: ${c.disc}, Área: ${c.area})`);

    const knowledgeSilo = proposalLog.length > 0
        ? `
        Histórico de Decisões Anteriores (Silo de Conhecimento):
        ${proposalLog.slice(-5).map(p => `- Consulta: "${p.query}"`).join('\n')}
        Use este histórico como referência para manter a consistência e aprender com decisões passadas.
        `
        : '';

    const context = `
        Contexto Atual:
        - Objetivo do Projeto: "${objective}"
        - Membros Atualmente na Equipe:
        ${currentMemberData.join('\n') || 'Nenhum'}
        - Outros Candidatos Disponíveis para Adicionar:
        ${availableCandidatesData.join('\n') || 'Nenhum'}
    `;

    const fullPrompt = `
        ${knowledgeSilo}
        ${context}
        Com base neste contexto holístico, e utilizando pesquisa na web para obter as melhores práticas atuais, responda à seguinte pergunta do administrador: "${query}"
        Sintetize a informação interna (perfis, silo de conhecimento) com a informação externa (pesquisa web) para fornecer a melhor resposta possível, sempre considerando o fator humano.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: fullPrompt,
        config: { 
            systemInstruction, 
            temperature: 0.5,
            tools: [{googleSearch: {}}]
        }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks
        .map(chunk => chunk.web)
        .filter((web): web is { uri: string; title: string; } => !!web && !!web.uri && !!web.title)
        .filter((web, index, self) => index === self.findIndex(t => t.uri === web.uri)); // Unique URIs


    return {
        text: response.text,
        sources: sources,
    };
  } catch (error) {
    console.error("Error calling AI API for contextual advice:", error);
    
    const isAPIConfigError = error instanceof Error && error.message.includes('Chave de API do Gemini não configurada');
    const errorMessage = isAPIConfigError 
        ? "⚠️ Chave de API do Gemini não configurada no servidor. O sistema está funcionando em Modo Simulação. Para usar IA real, configure a chave da API no Cloudflare Worker."
        : "Ocorreu um erro ao contatar o assistente de IA. Verifique se você tem conexão com a internet e tente novamente.";
    
    return {
        text: errorMessage,
        sources: []
    };
  }
};


export const getPortfolioAdvice = async (
    teams: TeamComposition[],
    allCandidates: AuditRecord[],
    query: string,
    proposalLog: TeamProposal[],
    provider: AiProvider,
    model: GeminiModel = 'gemini-1.5-flash'
): Promise<AiAdviceResponse> => {
    if (isMockModeEnabled()) {
      return { text: "Olá, visando sempre as boas práticas na análise de suas requisições e diretivas para otimização e sucesso da instituição, segue minha manifestação:\n\nEm modo simulação, posso analisar seu portfólio de equipes e sugerir otimizações baseadas nos perfis comportamentais e melhores práticas organizacionais.", sources: [] };
    }
    try {
        const ai = getAIClient(provider);
        const allocatedMemberIds = new Set(teams.flatMap(t => t.members.map(m => m.id)));
        
        const teamsData = teams.map(team => ({
            name: team.name,
            objective: team.objective,
            members: team.members.map(m => `${m.name} (Perfil: ${m.primaryProfile})`).join(', ')
        }));

        const unassignedCandidatesData = allCandidates
            .filter(c => !allocatedMemberIds.has(c.id))
            .map(sanitizeRecordForAI)
            .map(c => `- ${c.name} (Perfil: ${c.disc}, Área: ${c.area}, Propósito: ${c.purpose})`);

        const knowledgeSilo = proposalLog.length > 0
            ? `
        Histórico de Decisões Anteriores (Silo de Conhecimento):
        ${proposalLog.slice(-5).map(p => `- Consulta: "${p.query}"`).join('\n')}
        Use este histórico como referência para manter a consistência e aprender com decisões passadas.
        `
            : '';

        const context = `
            Contexto Atual do Portfólio de Equipes:
            - Equipes Formadas:
            ${JSON.stringify(teamsData, null, 2)}
            
            - Talentos Não Alocados:
            ${unassignedCandidatesData.join('\n') || 'Nenhum'}
        `;

        const fullPrompt = `
            ${knowledgeSilo}
            ${context}
            Com base no portfólio de equipes e nos talentos disponíveis, e utilizando pesquisa na web para obter as melhores práticas atuais, responda à seguinte pergunta estratégica do administrador: "${query}"
            Sua resposta deve focar em realocações, otimizações, e na criação de sinergia de propósito entre equipes e talentos subutilizados.
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: { 
                systemInstruction, 
                temperature: 0.5,
                tools: [{googleSearch: {}}]
            }
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources = groundingChunks
            .map(chunk => chunk.web)
            .filter((web): web is { uri: string; title: string; } => !!web && !!web.uri && !!web.title)
            .filter((web, index, self) => index === self.findIndex(t => t.uri === web.uri));


        return {
            text: response.text,
            sources: sources,
        };

    } catch (error) {
        console.error("Error calling AI API for portfolio advice:", error);
        
        const isAPIConfigError = error instanceof Error && error.message.includes('Chave de API do Gemini não configurada');
        const errorMessage = isAPIConfigError 
            ? "⚠️ Chave de API do Gemini não configurada no servidor. O sistema está funcionando em Modo Simulação."
            : `⚠️ Erro na API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        
        return {
            text: errorMessage,
            sources: []
        };
    }
};


export const suggestRoles = async (record: AuditRecord, provider: AiProvider): Promise<RoleSuggestion[]> => {
    if (isMockModeEnabled()) return getDefaultRoleSuggestions(record);
    if (!record.professionalProfile) return getDefaultRoleSuggestions(record);
    try {
        const ai = getAIClient(provider);
        const sanitizedData = sanitizeRecordForAI(record);
        const prompt = `
            Analisando o seguinte perfil holístico de colaborador:
            - Perfil DISC: ${sanitizedData.disc}
            - Área de Atuação: ${sanitizedData.area}
            - Nível de Experiência: ${record.professionalProfile.experienceLevel}/5
            - Habilidades: ${sanitizedData.skills}
            - Metodologias Conhecidas: ${record.methodologicalProfile?.methodologies.join(', ') || 'N/A'}
            - Motivadores: ${sanitizedData.motivators}
            - Propósito Pessoal: "${sanitizedData.purpose}"
            - Perfil de Resiliência: ${JSON.stringify(sanitizedData.resilience, null, 2)}

            Sugira 3 papéis ideais para esta pessoa em uma equipe. A justificativa deve conectar o papel sugerido a todos os aspectos do perfil (comportamental, profissional, de identidade e resiliência).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            role: { type: Type.STRING },
                            confidence: { type: Type.NUMBER, description: "Confiança de 0.0 a 1.0" },
                            justification: { type: Type.STRING }
                        },
                        required: ["role", "confidence", "justification"]
                    }
                }
            }
        });
        return JSON.parse(response.text) as RoleSuggestion[];
    } catch (e) {
        console.error("Error in suggestRoles:", e);
        return getDefaultRoleSuggestions(record);
    }
};

export const analyzeTeamComplementarity = async (team: TeamComposition, provider: AiProvider): Promise<ComplementarityAnalysis> => {
     if (isMockModeEnabled()) return getDefaultComplementarityAnalysis(team);
     try {
        const ai = getAIClient(provider);
        const teamData = team.members.map(sanitizeRecordForAI);

        const prompt = `
            Analise a seguinte composição de equipe para um projeto com o objetivo: "${team.objective}".
            Considere a complementaridade DISC, de competências, o alinhamento de motivadores e os perfis de resiliência individuais.

            Membros:
            ${JSON.stringify(teamData, null, 2)}

            Forneça uma análise de complementaridade.
        `;
        
        const generate = async (model: 'gemini-1.5-pro' | 'gemini-1.5-flash') => {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction,
                    temperature: model === 'gemini-1.5-pro' ? 0.4 : 0.5,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            synergies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sinergias comportamentais, técnicas e de valores." },
                            potentialConflicts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Conflitos baseados em DISC, comunicação e motivadores divergentes." },
                            overallAssessment: { type: Type.STRING, description: "Uma avaliação geral do potencial humano e de desempenho da equipe." },
                            methodologicalMaturity: { type: Type.NUMBER, description: "Score de 0 a 100" }
                        },
                        required: ["synergies", "potentialConflicts", "overallAssessment", "methodologicalMaturity"]
                    }
                }
            });
            return JSON.parse(response.text) as ComplementarityAnalysis;
        }

        try {
            return await generate('gemini-1.5-pro');
        } catch (proError) {
            console.warn("Gemini-Pro indisponível ou falhou. Tentando com Gemini-Flash.", proError);
            return await generate('gemini-1.5-flash');
        }
    } catch(e) {
        console.error("Erro final em analyzeTeamComplementarity:", e);
        return getDefaultComplementarityAnalysis(team);
    }
};


export const generateTeamProposal = async (team: TeamComposition, provider: AiProvider): Promise<string> => {
    if (isMockModeEnabled()) {
        return "Olá, visando sempre as boas práticas na análise de suas requisições e diretivas para otimização e sucesso da instituição, segue minha manifestação:\n\n**PROPOSTA DE ESCALA DE PESSOAS E FUNÇÕES**\n\nEm modo simulação, esta equipe foi estruturada considerando os perfis comportamentais DISC e as melhores práticas de formação de equipes de alto desempenho. A proposta inclui definição de papéis, responsabilidades e recomendações para maximizar a sinergia entre os membros.";
    }
    try {
        const ai = getAIClient(provider);
        const memberDetails = team.members.map(sanitizeRecordForAI).map(member => `
- **Nome:** ${member.name}
  - **Perfil DISC:** ${member.disc}
  - **Área de Atuação:** ${member.area}
  - **Habilidades:** ${member.skills}
  - **Motivadores:** ${member.motivators}
        `).join('');

        const prompt = `
Como seu assistente em gestão de pessoas, sua tarefa é criar uma "Proposta de Escala de Pessoas e Funções" para a equipe recém-formada, com foco no potencial humano e coletivo.

**Nome da Equipe:** "${team.name}"
**Objetivo Principal:** "${team.objective}"

**Membros da Equipe:**
${memberDetails}

**Sua Tarefa:**
1.  **Atribuição de Papéis e Propósito:** Para cada membro, atribua um papel específico (ex: Líder Técnico, Facilitador Ágil). Justifique CADA atribuição conectando o papel às características DISC, profissionais e aos motivadores da pessoa.
2.  **Dinâmica da Equipe e Alinhamento de Valores:** Descreva como os diferentes perfis e motivadores podem interagir para criar um ambiente de trabalho sustentável. Dê conselhos práticos para maximizar a sinergia e mitigar conflitos de valores.
3.  **Plano de Ação Inicial Focado no Humano:** Sugira os primeiros passos para a equipe que fortaleçam a confiança e o propósito compartilhado, além das metas técnicas.
4.  **Conclusão:** Forneça um parágrafo final resumindo o potencial da equipe em termos de desempenho e bem-estar.

Formate sua resposta usando markdown para clareza (títulos, listas, negrito).
        `;
        
        const generate = async (model: 'gemini-1.5-pro' | 'gemini-1.5-flash') => {
             const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: { systemInstruction, temperature: 0.6 }
            });
            return response.text;
        };
        
        try {
            return await generate('gemini-1.5-pro');
        } catch (proError) {
            console.warn("Gemini-Pro indisponível ou falhou. Tentando com Gemini-Flash.", proError);
            return await generate('gemini-1.5-flash');
        }

    } catch (error) {
        console.error("Error in generateTeamProposal:", error);
        
        const isAPIConfigError = error instanceof Error && error.message.includes('Chave de API do Gemini não configurada');
        const errorMessage = isAPIConfigError 
            ? "⚠️ Chave de API do Gemini não configurada. A equipe foi salva, mas a proposta detalhada não pôde ser gerada."
            : `⚠️ Erro ao gerar proposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}. A equipe foi salva com sucesso.`;
        
        return errorMessage;
    }
};

export const analyzeTeamCommunication = async (team: TeamComposition, provider: AiProvider): Promise<CommunicationAnalysis> => {
    if (isMockModeEnabled()) return getDefaultCommunicationAnalysis(team);
    try {
        const ai = getAIClient(provider);
        const teamData = team.members.map(m => ({
            name: m.name,
            disc: `${m.primaryProfile}${m.secondaryProfile ? `(${m.secondaryProfile})` : ''}`,
            motivators: m.identityProfile?.motivators?.join(', ') || 'N/A'
        }));

        const prompt = `
            Aja como um psicólogo organizacional especialista em comunicação e metodologia DISC. Analise a dinâmica de comunicação da equipe abaixo, considerando seu objetivo.

            Objetivo da Equipe: "${team.objective}"

            Membros:
            ${JSON.stringify(teamData, null, 2)}

            Sua tarefa é fornecer uma análise estruturada contendo:
            1.  O estilo de comunicação geral da equipe.
            2.  Os pontos fortes da comunicação da equipe.
            3.  Os riscos de comunicação e "pontos cegos" potenciais.
            4.  Recomendações acionáveis para o gestor mediar conflitos e otimizar a comunicação.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        communicationStyle: { type: Type.STRING, description: "Descrição do estilo de comunicação dominante da equipe." },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de pontos fortes da comunicação." },
                        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de riscos e pontos de atenção na comunicação." },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de recomendações acionáveis para o gestor." }
                    },
                    required: ["communicationStyle", "strengths", "risks", "recommendations"]
                }
            }
        });
        return JSON.parse(response.text) as CommunicationAnalysis;
    } catch (e) {
        console.error("Error in analyzeTeamCommunication:", e);
        return getDefaultCommunicationAnalysis(team);
    }
};

export const generateTacticalActionPlan = async (team: TeamComposition, problem: string, okr: string, provider: AiProvider): Promise<TacticalActionPlan> => {
    if (isMockModeEnabled()) return getDefaultTacticalActionPlan();
    try {
        const ai = getAIClient(provider);
        const teamData = team.members.map(sanitizeRecordForAI);
        const prompt = `
            **ANÁLISE DE CASO E GERAÇÃO DE PLANO DE AÇÃO TÁTICO**

            **EQUIPE:** ${team.name}
            **MEMBROS:**
            ${JSON.stringify(teamData, null, 2)}

            **SITUAÇÃO:**
            - **Problema / Sintoma Observado:** "${problem}"
            - **OKR / Métrica em Risco:** "${okr}"

            **SUA TAREFA:**
            Com base no seu conhecimento da equipe e na sua missão, gere um plano de ação tático para remediar o problema e proteger o OKR.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallStrategy: { type: Type.STRING, description: "Um resumo da estratégia geral para abordar o problema." },
                        steps: {
                            type: Type.ARRAY,
                            description: "Uma lista de 2 a 4 passos acionáveis, específicos e mensuráveis.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    action: { type: Type.STRING, description: "A ação concreta a ser tomada." },
                                    responsible: { type: Type.STRING, description: "O principal responsável pela ação (nome, papel ou 'Gestor')." },
                                    impactOnOkr: { type: Type.STRING, description: "Como esta ação específica ajuda a proteger ou recuperar o OKR." }
                                },
                                required: ["action", "responsible", "impactOnOkr"]
                            }
                        }
                    },
                    required: ["overallStrategy", "steps"]
                }
            }
        });
        return JSON.parse(response.text) as TacticalActionPlan;
    } catch (e) {
        console.error("Error in generateTacticalActionPlan:", e);
        return getDefaultTacticalActionPlan();
    }
};

// Fallback functions
const getDefaultRoleSuggestions = (record: AuditRecord): RoleSuggestion[] => {
    const suggestions: RoleSuggestion[] = [];
    if (record.primaryProfile === 'D') suggestions.push({ role: 'Líder de Projeto', confidence: 0.7, justification: 'Perfil dominante tende a assumir a liderança.' });
    if (record.primaryProfile === 'I') suggestions.push({ role: 'Evangelista/Comunicação', confidence: 0.7, justification: 'Perfil influente é ótimo em engajar stakeholders.' });
    if (record.primaryProfile === 'S') suggestions.push({ role: 'Membro de Suporte/Estabilizador', confidence: 0.7, justification: 'Perfil estável mantém a coesão da equipe.' });
    if (record.primaryProfile === 'C') suggestions.push({ role: 'Analista de Qualidade/Requisitos', confidence: 0.7, justification: 'Perfil conformista é excelente com detalhes e processos.' });
    suggestions.push({ role: 'Membro da Equipe', confidence: 0.6, justification: 'Função genérica baseada na área de atuação informada.' });
    return suggestions.slice(0, 3);
};

const getDefaultComplementarityAnalysis = (team: TeamComposition): ComplementarityAnalysis => {
    const hasD = team.members.some(m => m.primaryProfile === 'D');
    const hasC = team.members.some(m => m.primaryProfile === 'C');
    const synergies = [];
    if (hasD && hasC) {
        synergies.push("A visão de resultado (D) pode ser bem executada com a atenção a detalhes (C).");
    }
    return {
        synergies,
        potentialConflicts: ["Diversidade de perfis pode gerar atritos de comunicação iniciais."],
        overallAssessment: "Equipe com potencial, mas requer alinhamento de comunicação e processos claros.",
        methodologicalMaturity: 50,
    };
};

const getDefaultCommunicationAnalysis = (team: TeamComposition): CommunicationAnalysis => {
    return {
        communicationStyle: "Misto (Fallback)",
        strengths: ["Diversidade de perfis pode trazer múltiplas perspectivas."],
        risks: ["Diferentes estilos de comunicação podem levar a mal-entendidos se não forem gerenciados."],
        recommendations: [
            "Estabeleça regras claras de comunicação no início do projeto.",
            "Promova reuniões de alinhamento frequentes.",
            "Incentive o feedback construtivo entre os membros."
        ]
    };
};

const getDefaultTacticalActionPlan = (): TacticalActionPlan => {
    return {
        overallStrategy: "Fallback: Focar na clarificação de papéis e responsabilidades para realinhar a equipe com os objetivos.",
        steps: [
            {
                action: "Realizar uma reunião de realinhamento de 1 hora para revisar o OKR e os papéis de cada membro.",
                responsible: "Gestor",
                impactOnOkr: "Garante que todos entendam suas responsabilidades e como elas contribuem para o resultado final."
            },
            {
                action: "Implementar 'daily stand-ups' de 15 minutos para melhorar a comunicação e identificar bloqueios rapidamente.",
                responsible: "Equipe",
                impactOnOkr: "Aumenta a velocidade de comunicação e resolução de problemas, acelerando o progresso em direção ao OKR."
            }
        ]
    };
};
// bycao (ogrorvatigão) 2025