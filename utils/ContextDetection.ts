import { useEffect, useRef, useState } from 'react';
import type { UserContext } from '../components/SmartHints';

export class ContextDetectionEngine {
    private static instance: ContextDetectionEngine;
    private listeners: ((context: UserContext) => void)[] = [];
    private context: UserContext = {
        currentPage: '',
        idleTime: 0,
        sessionActions: [],
        isFirstVisit: true,
        completedHints: [],
        timeOnPage: 0
    };
    
    private idleTimer: NodeJS.Timeout | null = null;
    private pageTimer: NodeJS.Timeout | null = null;
    private lastActivity: number = Date.now();

    public static getInstance(): ContextDetectionEngine {
        if (!ContextDetectionEngine.instance) {
            ContextDetectionEngine.instance = new ContextDetectionEngine();
        }
        return ContextDetectionEngine.instance;
    }

    public initialize() {
        this.setupActivityTracking();
        this.setupPageTracking();
        this.loadStoredContext();
        this.startTimers();
    }

    public subscribe(listener: (context: UserContext) => void) {
        this.listeners.push(listener);
        // Enviar contexto atual imediatamente
        listener(this.context);
        
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private setupActivityTracking() {
        const resetIdleTimer = () => {
            this.lastActivity = Date.now();
            this.context.idleTime = 0;
            this.notifyListeners();
        };

        // Eventos que resetam idle
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });

        // Tracking de hover patterns
        document.addEventListener('mouseover', (e) => {
            const target = e.target as HTMLElement;
            if (target.id || target.className.includes('btn') || target.tagName === 'BUTTON') {
                this.context.hoverTarget = target.id || target.className || target.tagName;
                this.addAction(`hover:${this.context.hoverTarget}`);
            }
        });

        // Error tracking
        window.addEventListener('error', (e) => {
            this.context.lastError = e.message;
            this.addAction(`error:${e.message}`);
            this.notifyListeners();
        });

        // Console error tracking para React errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const errorMessage = args.join(' ');
            if (errorMessage.includes('Warning') || errorMessage.includes('Error')) {
                this.context.lastError = errorMessage;
                this.addAction(`console_error:${errorMessage}`);
                this.notifyListeners();
            }
            originalConsoleError.apply(console, args);
        };
    }

    private setupPageTracking() {
        // Detectar mudança de página/hash
        const updatePage = () => {
            const newPage = this.getCurrentPage();
            if (newPage !== this.context.currentPage) {
                this.context.currentPage = newPage;
                this.context.timeOnPage = 0;
                this.addAction(`navigate:${newPage}`);
                this.restartPageTimer();
                this.notifyListeners();
            }
        };

        // Hash change (para SPAs)
        window.addEventListener('hashchange', updatePage);
        
        // Initial page
        updatePage();
    }

    private getCurrentPage(): string {
        const hash = window.location.hash;
        const pathname = window.location.pathname;
        
        if (hash.includes('admin')) return 'admin-dashboard';
        if (hash.includes('user')) return 'user-portal';
        if (hash.includes('results')) return 'results-screen';
        if (pathname.includes('admin')) return 'admin-dashboard';
        if (pathname === '/' || pathname === '/index.html') return 'landing';
        
        return pathname || 'unknown';
    }

    private startTimers() {
        // Timer para idle time
        this.idleTimer = setInterval(() => {
            const now = Date.now();
            this.context.idleTime = now - this.lastActivity;
            this.notifyListeners();
        }, 1000);

        // Timer para time on page
        this.restartPageTimer();
    }

    private restartPageTimer() {
        if (this.pageTimer) {
            clearInterval(this.pageTimer);
        }

        this.pageTimer = setInterval(() => {
            this.context.timeOnPage += 1000;
            this.notifyListeners();
        }, 1000);
    }

    private addAction(action: string) {
        this.context.sessionActions.push(action);
        
        // Manter apenas os últimos 50 actions
        if (this.context.sessionActions.length > 50) {
            this.context.sessionActions = this.context.sessionActions.slice(-50);
        }
        
        this.saveContext();
    }

    private loadStoredContext() {
        try {
            const stored = localStorage.getItem('sisgead_user_context');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.context = {
                    ...this.context,
                    completedHints: parsed.completedHints || [],
                    isFirstVisit: parsed.isFirstVisit ?? true
                };
            }
        } catch (error) {
            console.warn('Failed to load stored context:', error);
        }
    }

    private saveContext() {
        try {
            const toSave = {
                completedHints: this.context.completedHints,
                isFirstVisit: false // Após primeira ação, não é mais primeira visita
            };
            localStorage.setItem('sisgead_user_context', JSON.stringify(toSave));
            this.context.isFirstVisit = false;
        } catch (error) {
            console.warn('Failed to save context:', error);
        }
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener({ ...this.context }));
    }

    public markHintCompleted(hintId: string) {
        if (!this.context.completedHints.includes(hintId)) {
            this.context.completedHints.push(hintId);
            this.saveContext();
            this.notifyListeners();
        }
    }

    public resetUserData() {
        localStorage.removeItem('sisgead_user_context');
        this.context.completedHints = [];
        this.context.isFirstVisit = true;
        this.context.sessionActions = [];
        this.notifyListeners();
    }

    public getPatternAnalysis() {
        const actions = this.context.sessionActions;
        
        return {
            mostHoveredElements: this.getMostFrequent(actions.filter(a => a.startsWith('hover:'))),
            errorPatterns: this.getMostFrequent(actions.filter(a => a.startsWith('error:'))),
            navigationPatterns: this.getMostFrequent(actions.filter(a => a.startsWith('navigate:'))),
            totalActions: actions.length,
            sessionDuration: Date.now() - (this.lastActivity - this.context.idleTime)
        };
    }

    private getMostFrequent(items: string[]): { item: string; count: number }[] {
        const counts = items.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([item, count]) => ({ item, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    public destroy() {
        if (this.idleTimer) clearInterval(this.idleTimer);
        if (this.pageTimer) clearInterval(this.pageTimer);
        this.listeners = [];
    }
}

// React Hook para usar o Context Detection Engine
export const useContextDetection = () => {
    const [context, setContext] = useState<UserContext>({
        currentPage: '',
        idleTime: 0,
        sessionActions: [],
        isFirstVisit: true,
        completedHints: [],
        timeOnPage: 0
    });

    const engineRef = useRef<ContextDetectionEngine>();

    useEffect(() => {
        engineRef.current = ContextDetectionEngine.getInstance();
        engineRef.current.initialize();

        const unsubscribe = engineRef.current.subscribe((newContext) => {
            setContext(newContext);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const markHintCompleted = (hintId: string) => {
        engineRef.current?.markHintCompleted(hintId);
    };

    const resetUserData = () => {
        engineRef.current?.resetUserData();
    };

    const getPatternAnalysis = () => {
        return engineRef.current?.getPatternAnalysis();
    };

    return {
        context,
        markHintCompleted,
        resetUserData,
        getPatternAnalysis
    };
};

export default ContextDetectionEngine;