import type { SmartHint, UserContext } from '../components/SmartHints';

// Smart Hints Database - Contextuais e Inteligentes
export const smartHintsDatabase: SmartHint[] = [
    
    // ===== ADMIN DASHBOARD HINTS =====
    {
        id: 'admin_welcome_first_time',
        trigger: 'first_time',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'admin-dashboard' && 
            ctx.isFirstVisit && 
            ctx.timeOnPage > 3000,
        title: '🎯 Bem-vindo ao SISGEAD 2.0!',
        message: 'Este é seu painel administrativo. Comece criando seu primeiro registro DISC clicando em "+ Adicionar Registro".',
        icon: '🚀',
        priority: 'high',
        showOnce: true,
        position: 'center',
        duration: 8000,
        actionButton: {
            text: 'Entendi!',
            action: () => console.log('Welcome acknowledged')
        }
    },

    {
        id: 'admin_idle_add_record',
        trigger: 'idle',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'admin-dashboard' && 
            ctx.idleTime > 15000 && 
            ctx.sessionActions.filter(a => a.includes('hover:') || a.includes('click:')).length < 3,
        title: '💡 Dica de Produtividade',
        message: 'Que tal começar adicionando um novo registro? Use o botão "+ Adicionar Registro" ou pressione Ctrl+N.',
        icon: '⚡',
        priority: 'medium',
        position: 'top-right',
        duration: 6000,
        actionButton: {
            text: 'Adicionar Registro',
            action: () => {
                const addButton = document.querySelector('[data-action="add-record"]') as HTMLElement;
                addButton?.click();
            }
        }
    },

    {
        id: 'admin_discover_tabs',
        trigger: 'hover',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'admin-dashboard' && 
            ctx.timeOnPage > 20000 &&
            !ctx.sessionActions.some(a => a.includes('navigate:') && a !== 'navigate:admin-dashboard'),
        title: '🔍 Explore as Abas',
        message: 'Descubra mais funcionalidades nas abas "Relatório", "Construtor de equipes" e "Portfólio". Cada uma oferece análises diferentes.',
        icon: '📊',
        priority: 'low',
        position: 'top-right',
        duration: 7000
    },

    {
        id: 'admin_backup_reminder',
        trigger: 'pattern',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'admin-dashboard' &&
            ctx.sessionActions.filter(a => a.includes('add') || a.includes('create')).length >= 3 &&
            !ctx.completedHints.includes('backup_created'),
        title: '🛡️ Proteção de Dados',
        message: 'Você tem dados importantes! Considere fazer um backup clicando em "Exportar Backup" para proteger seu trabalho.',
        icon: '💾',
        priority: 'medium',
        position: 'bottom-right',
        duration: 8000,
        actionButton: {
            text: 'Fazer Backup',
            action: () => {
                const backupBtn = document.querySelector('[data-action="export-backup"]') as HTMLElement;
                backupBtn?.click();
            }
        }
    },

    // ===== USER PORTAL HINTS =====
    {
        id: 'user_welcome',
        trigger: 'first_time',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'user-portal' && 
            ctx.isFirstVisit,
        title: '👋 Olá! Vamos começar',
        message: 'Você está no portal do entrevistado. Preencha seu CPF para iniciar ou retomar uma avaliação DISC.',
        icon: '🎯',
        priority: 'high',
        showOnce: true,
        position: 'center',
        duration: 6000
    },

    {
        id: 'user_cpf_validation_help',
        trigger: 'error',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'user-portal' && 
            ctx.lastError?.includes('CPF'),
        title: '📋 Formato do CPF',
        message: 'Digite apenas os números do CPF (11 dígitos). Exemplo: 12345678901. O sistema formatará automaticamente.',
        icon: '✏️',
        priority: 'high',
        position: 'top-right',
        duration: 8000
    },

    // ===== RESULTS SCREEN HINTS =====
    {
        id: 'results_first_view',
        trigger: 'first_time',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'results-screen' && 
            ctx.timeOnPage > 2000,
        title: '🎉 Parabéns! Avaliação Concluída',
        message: 'Seus resultados estão prontos! Use os botões para imprimir PDF, copiar o ID do relatório ou visualizar análises detalhadas.',
        icon: '📈',
        priority: 'high',
        showOnce: true,
        position: 'top-right',
        duration: 10000
    },

    {
        id: 'results_save_reminder',
        trigger: 'idle',
        condition: (ctx: UserContext) => 
            ctx.currentPage === 'results-screen' && 
            ctx.idleTime > 30000 &&
            !ctx.sessionActions.some(a => a.includes('print') || a.includes('copy')),
        title: '💾 Salve Seus Resultados',
        message: 'Não se esqueça de salvar seus resultados! Imprima o PDF ou copie o ID do relatório para futuras consultas.',
        icon: '⚠️',
        priority: 'medium',
        position: 'bottom-right',
        duration: 8000,
        actionButton: {
            text: 'Imprimir PDF',
            action: () => {
                const printBtn = document.querySelector('[data-action="print-pdf"]') as HTMLElement;
                printBtn?.click();
            }
        }
    },

    // ===== CROSS-PLATFORM HINTS =====
    {
        id: 'keyboard_shortcuts_discovery',
        trigger: 'pattern',
        condition: (ctx: UserContext) => 
            ctx.sessionActions.length > 15 &&
            !ctx.sessionActions.some(a => a.includes('keyboard')) &&
            ctx.timeOnPage > 60000,
        title: '⌨️ Atalhos do Teclado',
        message: 'Acelere seu trabalho! Ctrl+N (novo registro), Ctrl+S (salvar), Ctrl+P (imprimir), Ctrl+E (exportar). Experimente!',
        icon: '🚀',
        priority: 'low',
        position: 'bottom-left',
        duration: 10000
    },

    {
        id: 'mobile_optimization_tip',
        trigger: 'manual',
        condition: (ctx: UserContext) => {
            const isMobile = window.innerWidth < 768;
            return isMobile && ctx.timeOnPage > 10000;
        },
        title: '📱 Dica Mobile',
        message: 'Para melhor experiência no celular, gire para modo paisagem ou use um tablet quando possível.',
        icon: '🔄',
        priority: 'low',
        position: 'top-right',
        duration: 6000
    },

    {
        id: 'ai_feature_highlight',
        trigger: 'hover',
        condition: (ctx: UserContext) => 
            ctx.hoverTarget?.includes('ai') || 
            ctx.hoverTarget?.includes('gemini') ||
            ctx.currentPage === 'admin-dashboard' && ctx.timeOnPage > 45000,
        title: '🤖 Inteligência Artificial',
        message: 'Este sistema usa IA Google Gemini para análises avançadas de personalidade e formação de equipes. Explore as sugestões!',
        icon: '✨',
        priority: 'medium',
        position: 'top-right',
        duration: 8000
    },

    // ===== ERROR RECOVERY HINTS =====
    {
        id: 'connection_error_help',
        trigger: 'error',
        condition: (ctx: UserContext) => 
            ctx.lastError?.includes('network') || 
            ctx.lastError?.includes('fetch') ||
            ctx.lastError?.includes('connection'),
        title: '🌐 Problema de Conexão',
        message: 'Parece que há um problema de conexão. Verifique sua internet e tente novamente. Os dados locais estão protegidos.',
        icon: '📡',
        priority: 'high',
        position: 'center',
        duration: 10000,
        actionButton: {
            text: 'Tentar Novamente',
            action: () => window.location.reload()
        }
    },

    {
        id: 'browser_compatibility',
        trigger: 'error',
        condition: (ctx: UserContext) => 
            ctx.lastError?.includes('not supported') ||
            navigator.userAgent.includes('IE'),
        title: '🌐 Navegador Antigo',
        message: 'Para melhor experiência, recomendamos usar Chrome, Firefox, Safari ou Edge atualizados. Algumas funcionalidades podem não funcionar.',
        icon: '⚠️',
        priority: 'high',
        position: 'center',
        duration: 12000
    },

    // ===== PRODUCTIVITY HINTS =====
    {
        id: 'batch_operations_tip',
        trigger: 'pattern',
        condition: (ctx: UserContext) => 
            ctx.sessionActions.filter(a => a.includes('add') || a.includes('create')).length >= 5,
        title: '⚡ Dica de Eficiência',
        message: 'Trabalhando com muitos registros? Use a função de importar CSV ou Excel para adicionar múltiplos registros de uma vez!',
        icon: '📋',
        priority: 'medium',
        position: 'bottom-right',
        duration: 8000
    },

    {
        id: 'team_building_suggestion',
        trigger: 'pattern',
        condition: (ctx: UserContext) => 
            ctx.sessionActions.filter(a => a.includes('profile') || a.includes('result')).length >= 3 &&
            !ctx.sessionActions.some(a => a.includes('team')),
        title: '👥 Construção de Equipes',
        message: 'Com múltiplos perfis DISC, você pode usar o "Construtor de Equipes" para formar equipes balanceadas automaticamente!',
        icon: '🎯',
        priority: 'medium',
        position: 'top-right',
        duration: 9000,
        actionButton: {
            text: 'Explorar Teams',
            action: () => {
                window.location.hash = '#team-builder';
            }
        }
    }
];

// Cache para otimização de performance
const hintEvaluationCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 5000; // 5 segundos

// Função para filtrar hints baseado no contexto atual
export const getRelevantHints = (context: UserContext): SmartHint[] => {
    const now = Date.now();
    
    return smartHintsDatabase.filter(hint => {
        // Verificar se já foi completado (para hints que devem aparecer apenas uma vez)
        if (hint.showOnce && context.completedHints.includes(hint.id)) {
            return false;
        }

        // Verificar cache primeiro
        const cacheKey = `${hint.id}_${context.currentPage}_${Math.floor(context.timeOnPage / 1000)}`;
        const cached = hintEvaluationCache.get(cacheKey);
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
            return cached.result;
        }

        // Verificar condição específica
        try {
            const result = hint.condition(context);
            
            // Cache o resultado
            hintEvaluationCache.set(cacheKey, { result, timestamp: now });
            
            // Limpar cache antigo
            if (hintEvaluationCache.size > 100) {
                const entries = Array.from(hintEvaluationCache.entries());
                entries.forEach(([key, value]) => {
                    if ((now - value.timestamp) > CACHE_TTL * 2) {
                        hintEvaluationCache.delete(key);
                    }
                });
            }
            
            return result;
        } catch (error) {
            console.warn(`Error evaluating hint condition for ${hint.id}:`, error);
            return false;
        }
    });
};

// Função para obter hint por ID
export const getHintById = (id: string): SmartHint | undefined => {
    return smartHintsDatabase.find(hint => hint.id === id);
};

// Função para categorizar hints
export const categorizeHints = () => {
    return {
        welcome: smartHintsDatabase.filter(h => h.id.includes('welcome') || h.id.includes('first')),
        productivity: smartHintsDatabase.filter(h => h.id.includes('efficiency') || h.id.includes('shortcut') || h.id.includes('batch')),
        error_recovery: smartHintsDatabase.filter(h => h.trigger === 'error'),
        discovery: smartHintsDatabase.filter(h => h.id.includes('discover') || h.id.includes('explore')),
        reminders: smartHintsDatabase.filter(h => h.id.includes('reminder') || h.id.includes('save'))
    };
};

export default smartHintsDatabase;