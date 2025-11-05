/**
 * Utility for generating standardized file names for SISGEAD 2.0 reports
 */

/**
 * Formats a date and time for use in file names
 */
export const formatDateTime = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} às ${hours}h${minutes}`;
};

/**
 * Sanitizes a string for use in file names
 */
export const sanitizeFileName = (text: string): string => {
  return text
    .replace(/[<>:"/\\|?*]/g, '') // Remove caracteres inválidos para nomes de arquivo
    .replace(/\s+/g, ' ') // Normalizar espaços múltiplos
    .trim()
    .substring(0, 100); // Limitar tamanho
};

/**
 * Extracts keywords from a query/prompt for file naming
 */
export const extractKeywords = (text: string, maxLength: number = 40): string => {
  // Remove palavras comuns e extrai palavras-chave
  const commonWords = [
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos',
    'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'que', 'qual', 'como',
    'onde', 'quando', 'porque', 'e', 'ou', 'mas', 'se', 'então', 'já', 'ainda',
    'mais', 'menos', 'muito', 'pouco', 'todo', 'toda', 'alguns', 'algumas', 'este',
    'esta', 'esse', 'essa', 'aquele', 'aquela', 'meu', 'minha', 'seu', 'sua',
    'nosso', 'nossa', 'pode', 'deve', 'tem', 'ter', 'ser', 'estar', 'fazer', 'vai',
    'vou', 'vamos', 'gostaria', 'preciso', 'quero', 'desejo', 'solicito'
  ];

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 4); // Pega até 4 palavras-chave

  return words.join(' ').substring(0, maxLength);
};

/**
 * Report name generators
 */

export interface ReportNameOptions {
  personName?: string;
  teamName?: string;
  projectName?: string;
  query?: string;
  problem?: string;
  date?: Date;
}

/**
 * Generate name for individual profile report
 */
export const generateProfileReportName = (options: ReportNameOptions): string => {
  const { personName, date } = options;
  const dateTime = formatDateTime(date);
  const name = sanitizeFileName(personName || 'Usuário');
  
  return `Perfil de ${name} em ${dateTime}`;
};

/**
 * Generate name for team proposal/scale report
 */
export const generateTeamProposalName = (options: ReportNameOptions): string => {
  const { teamName, projectName, date } = options;
  const dateTime = formatDateTime(date);
  const name = sanitizeFileName(teamName || projectName || 'Equipe');
  
  return `Proposta de escala do(a) ${name} em ${dateTime}`;
};

/**
 * Generate name for AI assistant consultation
 */
export const generateAIConsultationName = (options: ReportNameOptions): string => {
  const { query, date } = options;
  const dateTime = formatDateTime(date);
  const keywords = extractKeywords(query || 'consulta', 30);
  
  return `Consulta sobre "${keywords}" em ${dateTime}`;
};

/**
 * Generate name for conflict mediation / OKR optimization
 */
export const generateMediationActionPlanName = (options: ReportNameOptions): string => {
  const { problem, teamName, projectName, date } = options;
  const dateTime = formatDateTime(date);
  const problemKeywords = extractKeywords(problem || 'conflito', 25);
  const name = sanitizeFileName(teamName || projectName || 'Equipe');
  
  return `Plano de ação para mediar "${problemKeywords}" no(a) ${name} em ${dateTime}`;
};

/**
 * Generate name for communication analysis
 */
export const generateCommunicationAnalysisName = (options: ReportNameOptions): string => {
  const { teamName, projectName, date } = options;
  const dateTime = formatDateTime(date);
  const name = sanitizeFileName(teamName || projectName || 'Equipe');
  
  return `Perfil de comunicação do(a) ${name} em ${dateTime}`;
};

/**
 * Main function to generate appropriate file name based on report type
 */
export const generateReportFileName = (
  type: 'profile' | 'team-proposal' | 'ai-consultation' | 'mediation-plan' | 'communication-analysis',
  options: ReportNameOptions
): string => {
  switch (type) {
    case 'profile':
      return generateProfileReportName(options);
    case 'team-proposal':
      return generateTeamProposalName(options);
    case 'ai-consultation':
      return generateAIConsultationName(options);
    case 'mediation-plan':
      return generateMediationActionPlanName(options);
    case 'communication-analysis':
      return generateCommunicationAnalysisName(options);
    default:
      const dateTime = formatDateTime(options.date);
      return `Relatório SISGEAD em ${dateTime}`;
  }
};

/**
 * Generate file name for download (sanitized for file system)
 */
export const generateDownloadFileName = (
  type: 'profile' | 'team-proposal' | 'ai-consultation' | 'mediation-plan' | 'communication-analysis',
  options: ReportNameOptions,
  extension: string = 'pdf'
): string => {
  const baseName = generateReportFileName(type, options);
  const sanitized = baseName
    .replace(/[<>:"/\\|?*]/g, '_') // Substituir caracteres inválidos
    .replace(/\s+/g, '_') // Substituir espaços por underscores
    .replace(/_{2,}/g, '_') // Remover underscores duplos
    .replace(/^_|_$/g, ''); // Remover underscores no início/fim
  
  return `${sanitized}.${extension}`;
};