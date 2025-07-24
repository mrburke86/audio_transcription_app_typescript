// src/lib/DiagnosticLogger.ts - SMART DIAGNOSTIC SYSTEM

export type DiagnosticLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type DiagnosticCategory = 'render' | 'state' | 'api' | 'nav' | 'init' | 'error' | 'perf' | 'user';

interface DiagnosticEntry {
    timestamp: number;
    level: DiagnosticLevel;
    category: DiagnosticCategory;
    component: string;
    message: string;
    data?: any;
    stackTrace?: string;
    renderCount?: number;
    timeSinceMount?: number;
}

interface ComponentLifecycle {
    mountTime: number;
    renderCount: number;
    lastRender: number;
    errors: DiagnosticEntry[];
}

class DiagnosticLogger {
    private entries: DiagnosticEntry[] = [];
    private componentLifecycles = new Map<string, ComponentLifecycle>();
    private sessionStart = Date.now();
    private perfMarks = new Map<string, number>();

    // 🎯 INTELLIGENT PATTERN DETECTION
    private patterns = {
        infiniteRender: new Map<string, number[]>(), // Track render timestamps by component
        stateFlapping: new Map<string, any[]>(), // Track rapid state changes
        errorCascades: [] as DiagnosticEntry[], // Track cascading errors
        slowOperations: [] as { operation: string; duration: number; timestamp: number }[],
    };

    // 🚀 SMART COMPONENT TRACKING
    trackComponent(componentName: string): ComponentTracker {
        if (!this.componentLifecycles.has(componentName)) {
            this.componentLifecycles.set(componentName, {
                mountTime: Date.now(),
                renderCount: 0,
                lastRender: Date.now(),
                errors: [],
            });
            this.log('debug', 'init', componentName, `🏗️ Component mounted`);
        }

        const lifecycle = this.componentLifecycles.get(componentName)!;
        lifecycle.renderCount++;
        lifecycle.lastRender = Date.now();

        // 🔍 DETECT INFINITE RENDER LOOPS
        this.detectInfiniteRenders(componentName, lifecycle);

        return new ComponentTracker(componentName, this);
    }

    // 🔬 INFINITE RENDER DETECTION
    private detectInfiniteRenders(componentName: string, lifecycle: ComponentLifecycle) {
        const now = Date.now();
        const renderHistory = this.patterns.infiniteRender.get(componentName) || [];

        // Keep only renders from last 2 seconds
        const recentRenders = [...renderHistory, now].filter(time => now - time < 2000);
        this.patterns.infiniteRender.set(componentName, recentRenders);

        // 🚨 ALERT: More than 20 renders in 2 seconds
        if (recentRenders.length > 20) {
            this.log(
                'critical',
                'render',
                componentName,
                `🚨 INFINITE RENDER DETECTED: ${recentRenders.length} renders in 2s`,
                {
                    renderCount: lifecycle.renderCount,
                    avgTimeBetweenRenders:
                        recentRenders.length > 1 ? (now - recentRenders[0]) / (recentRenders.length - 1) : 0,
                    suspectedCauses: this.analyzeSuspectedCauses(componentName),
                }
            );
        }
    }

    // 🕵️ ANALYZE SUSPECTED CAUSES
    private analyzeSuspectedCauses(componentName: string): string[] {
        const causes: string[] = [];
        const recentEntries = this.entries.filter(
            e => Date.now() - e.timestamp < 5000 && e.component === componentName
        );

        // Check for rapid state changes
        const stateChanges = recentEntries.filter(e => e.message.includes('state') || e.message.includes('update'));
        if (stateChanges.length > 10) {
            causes.push('Rapid state changes detected');
        }

        // Check for useEffect dependencies
        const effectLogs = recentEntries.filter(
            e => e.message.includes('useEffect') || e.message.includes('dependency')
        );
        if (effectLogs.length > 5) {
            causes.push('useEffect dependency issues');
        }

        // Check for selector instability
        const selectorLogs = recentEntries.filter(e => e.message.includes('selector') || e.message.includes('Zustand'));
        if (selectorLogs.length > 10) {
            causes.push('Unstable Zustand selectors');
        }

        return causes;
    }

    // 📊 STATE CHANGE TRACKING
    trackStateChange(component: string, stateName: string, oldValue: any, newValue: any, source?: string) {
        const key = `${component}.${stateName}`;
        const history = this.patterns.stateFlapping.get(key) || [];

        // Keep last 10 values
        const newHistory = [...history, { value: newValue, timestamp: Date.now() }].slice(-10);
        this.patterns.stateFlapping.set(key, newHistory);

        // 🔍 DETECT STATE FLAPPING
        if (newHistory.length >= 5) {
            const values = newHistory.map(h => h.value);
            const uniqueValues = new Set(values);
            const timeSpan = newHistory[newHistory.length - 1].timestamp - newHistory[0].timestamp;

            if (uniqueValues.size <= 2 && timeSpan < 1000) {
                this.log(
                    'warn',
                    'state',
                    component,
                    `🔄 STATE FLAPPING DETECTED: ${stateName} oscillating between values`,
                    {
                        values: Array.from(uniqueValues),
                        changes: newHistory.length,
                        timeSpan,
                        source,
                    }
                );
            }
        }

        this.log('trace', 'state', component, `📝 State change: ${stateName}`, {
            from: oldValue,
            to: newValue,
            source,
        });
    }

    // ⚡ PERFORMANCE TRACKING
    startPerfMeasure(operationName: string): string {
        const markName = `${operationName}_${Date.now()}`;
        this.perfMarks.set(markName, performance.now());
        this.log('trace', 'perf', 'Performance', `⏱️ Started: ${operationName}`);
        return markName;
    }

    endPerfMeasure(markName: string, component: string = 'Performance'): number {
        const startTime = this.perfMarks.get(markName);
        if (!startTime) return 0;

        const duration = performance.now() - startTime;
        this.perfMarks.delete(markName);

        const operationName = markName.split('_')[0];

        // 🐌 DETECT SLOW OPERATIONS
        if (duration > 100) {
            this.patterns.slowOperations.push({
                operation: operationName,
                duration,
                timestamp: Date.now(),
            });

            this.log('warn', 'perf', component, `🐌 SLOW OPERATION: ${operationName} took ${duration.toFixed(2)}ms`, {
                duration,
                threshold: 100,
                recommendation: duration > 500 ? 'Consider optimization' : 'Monitor if recurring',
            });
        } else {
            this.log('trace', 'perf', component, `✅ Completed: ${operationName} in ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    // 🎯 CORE LOGGING METHOD
    log(level: DiagnosticLevel, category: DiagnosticCategory, component: string, message: string, data?: any) {
        const entry: DiagnosticEntry = {
            timestamp: Date.now(),
            level,
            category,
            component,
            message,
            data,
            timeSinceMount: Date.now() - this.sessionStart,
        };

        // Add stack trace for errors
        if (level === 'error' || level === 'critical') {
            entry.stackTrace = new Error().stack ?? '';
            this.patterns.errorCascades.push(entry);
        }

        // Add render count for render-related logs
        if (category === 'render') {
            const lifecycle = this.componentLifecycles.get(component);
            entry.renderCount = lifecycle?.renderCount || 0;
        }

        this.entries.push(entry);

        // 🎨 COLORFUL CONSOLE OUTPUT
        this.outputToConsole(entry);

        // 🔄 KEEP ONLY RECENT ENTRIES (last 1000)
        if (this.entries.length > 1000) {
            this.entries = this.entries.slice(-1000);
        }
    }

    // 🎨 SMART CONSOLE OUTPUT
    private outputToConsole(entry: DiagnosticEntry) {
        const icons = {
            trace: '🔍',
            debug: '🐛',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            critical: '🚨',
        };

        const categoryColors = {
            render: '#FF6B6B',
            state: '#4ECDC4',
            api: '#45B7D1',
            nav: '#96CEB4',
            init: '#FFEAA7',
            error: '#FF7675',
            perf: '#A29BFE',
            user: '#FD79A8',
        };

        const timeSince = `+${entry.timeSinceMount}ms`;
        const renderInfo = entry.renderCount ? ` (render #${entry.renderCount})` : '';

        const prefix = `${icons[entry.level]} [DIAG-${entry.category.toUpperCase()}]${renderInfo}`;
        const message = `${prefix} ${entry.component}: ${entry.message} ${timeSince}`;

        console.log(
            `%c${message}`,
            `color: ${categoryColors[entry.category]}; font-weight: ${entry.level === 'critical' ? 'bold' : 'normal'}`
        );

        if (entry.data) {
            console.log(`%c  📊 Data:`, 'color: #999; font-style: italic', entry.data);
        }

        if (entry.stackTrace && (entry.level === 'error' || entry.level === 'critical')) {
            console.log(`%c  🔍 Stack:`, 'color: #999; font-style: italic', entry.stackTrace);
        }
    }

    // 📈 GENERATE DIAGNOSTIC REPORT
    generateReport(): DiagnosticReport {
        const now = Date.now();
        const sessionDuration = now - this.sessionStart;

        // Top problematic components
        const componentIssues = Array.from(this.componentLifecycles.entries())
            .map(([name, lifecycle]) => ({
                name,
                renderCount: lifecycle.renderCount,
                renderRate: lifecycle.renderCount / (sessionDuration / 1000),
                errorCount: lifecycle.errors.length,
                avgTimeBetweenRenders:
                    lifecycle.renderCount > 1 ? (now - lifecycle.mountTime) / lifecycle.renderCount : 0,
            }))
            .sort((a, b) => b.renderCount - a.renderCount);

        // Recent critical issues
        const criticalIssues = this.entries.filter(e => e.level === 'critical' && now - e.timestamp < 30000).slice(-10);

        // Performance summary
        const slowOps = this.patterns.slowOperations
            .filter(op => now - op.timestamp < 60000)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);

        return {
            sessionDuration,
            totalLogEntries: this.entries.length,
            componentIssues: componentIssues.slice(0, 10),
            criticalIssues,
            slowOperations: slowOps,
            patterns: {
                infiniteRenders: Array.from(this.patterns.infiniteRender.keys()).length,
                stateFlapping: Array.from(this.patterns.stateFlapping.keys()).length,
                errorCascades: this.patterns.errorCascades.length,
            },
            recommendations: this.generateRecommendations(componentIssues, slowOps),
        };
    }

    // 💡 SMART RECOMMENDATIONS
    private generateRecommendations(componentIssues: any[], slowOps: any[]): string[] {
        const recommendations: string[] = [];

        // High render count recommendations
        const highRenderComponents = componentIssues.filter(c => c.renderCount > 50);
        if (highRenderComponents.length > 0) {
            recommendations.push(
                `🔄 High render count detected in: ${highRenderComponents.map(c => c.name).join(', ')}. Consider memoization or selector optimization.`
            );
        }

        // Performance recommendations
        if (slowOps.length > 0) {
            recommendations.push(
                `🐌 Slow operations detected: ${slowOps.map(op => op.operation).join(', ')}. Consider async/lazy loading.`
            );
        }

        // Pattern-based recommendations
        if (this.patterns.stateFlapping.size > 0) {
            recommendations.push(`🔄 State oscillation detected. Check useEffect dependencies and selector stability.`);
        }

        return recommendations;
    }

    // 🧹 CLEANUP
    cleanup() {
        this.entries = [];
        this.componentLifecycles.clear();
        this.patterns.infiniteRender.clear();
        this.patterns.stateFlapping.clear();
        this.patterns.errorCascades = [];
        this.patterns.slowOperations = [];
        console.log('🧹 Diagnostic logger cleaned up');
    }
}

// 🎯 COMPONENT TRACKER CLASS
class ComponentTracker {
    private startTime = performance.now();

    constructor(
        private componentName: string,
        private logger: DiagnosticLogger
    ) {}

    // Track useEffect
    useEffect(deps: any[], description: string = 'useEffect') {
        this.logger.log('trace', 'render', this.componentName, `🔄 ${description} triggered`, { dependencies: deps });
    }

    // Track state changes
    stateChange(stateName: string, oldValue: any, newValue: any, source?: string) {
        this.logger.trackStateChange(this.componentName, stateName, oldValue, newValue, source);
    }

    // Track API calls
    apiCall(endpoint: string, method: string = 'GET') {
        const markName = this.logger.startPerfMeasure(`API_${method}_${endpoint}`);
        return {
            success: (data?: any) => {
                this.logger.endPerfMeasure(markName, this.componentName);
                this.logger.log('info', 'api', this.componentName, `✅ API Success: ${method} ${endpoint}`, data);
            },
            error: (error: any) => {
                this.logger.endPerfMeasure(markName, this.componentName);
                this.logger.log('error', 'api', this.componentName, `❌ API Error: ${method} ${endpoint}`, error);
            },
        };
    }

    // Track navigation
    navigate(from: string, to: string, reason?: string) {
        this.logger.log('info', 'nav', this.componentName, `🧭 Navigation: ${from} → ${to}`, { reason });
    }

    // Track user interactions
    userAction(action: string, data?: any) {
        this.logger.log('info', 'user', this.componentName, `👤 User Action: ${action}`, data);
    }

    // Track errors
    error(message: string, error?: any) {
        this.logger.log('error', 'error', this.componentName, message, error);
    }

    // Mark render complete
    renderComplete() {
        const duration = performance.now() - this.startTime;
        this.logger.log('trace', 'render', this.componentName, `🎨 Render complete in ${duration.toFixed(2)}ms`);
    }
}

// 📊 REPORT INTERFACE
interface DiagnosticReport {
    sessionDuration: number;
    totalLogEntries: number;
    componentIssues: Array<{
        name: string;
        renderCount: number;
        renderRate: number;
        errorCount: number;
        avgTimeBetweenRenders: number;
    }>;
    criticalIssues: DiagnosticEntry[];
    slowOperations: Array<{
        operation: string;
        duration: number;
        timestamp: number;
    }>;
    patterns: {
        infiniteRenders: number;
        stateFlapping: number;
        errorCascades: number;
    };
    recommendations: string[];
}

// 🌟 GLOBAL INSTANCE
export const diagnosticLogger = new DiagnosticLogger();

// 🔧 GLOBAL ACCESS FOR DEBUGGING
if (typeof window !== 'undefined') {
    (window as any).diagnostics = {
        getReport: () => diagnosticLogger.generateReport(),
        cleanup: () => diagnosticLogger.cleanup(),
        logger: diagnosticLogger,
    };
    console.log('🐛 Debug: Access diagnostics via window.diagnostics');
}
