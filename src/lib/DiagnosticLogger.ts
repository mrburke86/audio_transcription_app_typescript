// src/lib/DiagnosticLogger.ts - OPTIMIZED DIAGNOSTIC SYSTEM

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

    // 🎯 INTELLIGENT PATTERN DETECTION - Reduced: Higher thresholds (e.g., 30 renders/2s instead of 20)
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
            this.log('debug', 'init', componentName, `🏗️ Component mounted`); // Reduced: To debug
        }

        const lifecycle = this.componentLifecycles.get(componentName)!;
        lifecycle.renderCount++;
        lifecycle.lastRender = Date.now();

        // 🔍 DETECT INFINITE RENDER LOOPS
        this.detectInfiniteRenders(componentName, lifecycle);

        return new ComponentTracker(componentName, this);
    }

    // 🔬 INFINITE RENDER DETECTION - Reduced: Threshold to 30 renders/2s
    private detectInfiniteRenders(componentName: string, lifecycle: ComponentLifecycle) {
        const now = Date.now();
        const renderHistory = this.patterns.infiniteRender.get(componentName) || [];

        // Keep only renders from last 2 seconds
        const recentRenders = [...renderHistory, now].filter(time => now - time < 2000);
        this.patterns.infiniteRender.set(componentName, recentRenders);

        // 🚨 ALERT: More than 30 renders in 2s
        if (recentRenders.length > 30) {
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

    // 🕵️ ANALYZE SUSPECTED CAUSES - Reduced: Fewer checks
    private analyzeSuspectedCauses(componentName: string): string[] {
        const causes: string[] = [];
        const recentEntries = this.entries.filter(
            e => Date.now() - e.timestamp < 5000 && e.component === componentName
        );

        // Check for rapid state changes
        const stateChanges = recentEntries.filter(e => e.message.includes('state') || e.message.includes('update'));
        if (stateChanges.length > 15) {
            causes.push('Rapid state changes detected');
        }

        // Check for useEffect dependencies
        const effectLogs = recentEntries.filter(
            e => e.message.includes('useEffect') || e.message.includes('dependency')
        );
        if (effectLogs.length > 8) {
            // Increased threshold
            causes.push('useEffect dependency issues');
        }

        return causes; // Reduced: Removed selector check for simplicity
    }

    // 📊 STATE CHANGE TRACKING - Reduced: History to 8 values, timeSpan to 1500ms
    trackStateChange(component: string, stateName: string, oldValue: any, newValue: any, source?: string) {
        const key = `${component}.${stateName}`;
        const history = this.patterns.stateFlapping.get(key) || [];

        // Keep last 8 values
        const newHistory = [...history, { value: newValue, timestamp: Date.now() }].slice(-8);
        this.patterns.stateFlapping.set(key, newHistory);

        // 🔍 DETECT STATE FLAPPING
        if (newHistory.length >= 5) {
            const values = newHistory.map(h => h.value);
            const uniqueValues = new Set(values);
            const timeSpan = newHistory[newHistory.length - 1].timestamp - newHistory[0].timestamp;

            if (uniqueValues.size <= 2 && timeSpan < 1500) {
                this.log('warn', 'state', component, `🔄 STATE FLAPPING DETECTED: ${stateName} oscillating`, {
                    values: Array.from(uniqueValues),
                    changes: newHistory.length,
                    timeSpan,
                    source,
                });
            }
        }

        this.log('debug', 'state', component, `📝 State change: ${stateName}`, {
            // Reduced: To debug
            from: oldValue,
            to: newValue,
            source,
        });
    }

    // ⚡ PERFORMANCE TRACKING - Reduced: Threshold to 200ms
    startPerfMeasure(operationName: string): string {
        const markName = `${operationName}_${Date.now()}`;
        this.perfMarks.set(markName, performance.now());
        this.log('debug', 'perf', 'Performance', `⏱️ Started: ${operationName}`); // Reduced: To debug
        return markName;
    }

    endPerfMeasure(markName: string, component: string = 'Performance'): number {
        const startTime = this.perfMarks.get(markName);
        if (!startTime) return 0;

        const duration = performance.now() - startTime;
        this.perfMarks.delete(markName);

        const operationName = markName.split('_')[0];

        // 🐌 DETECT SLOW OPERATIONS
        if (duration > 200) {
            // Increased threshold
            this.patterns.slowOperations.push({
                operation: operationName,
                duration,
                timestamp: Date.now(),
            });

            this.log('warn', 'perf', component, `🐌 SLOW OPERATION: ${operationName} took ${duration.toFixed(2)}ms`, {
                duration,
                threshold: 200,
            }); // Reduced: Removed recommendation fluff
        } else {
            this.log('debug', 'perf', component, `✅ Completed: ${operationName} in ${duration.toFixed(2)}ms`); // Reduced: To debug
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

        // 🎨 COLORFUL CONSOLE OUTPUT - Reduced: Log only 'info+' unless dev mode
        if (level !== 'trace' && level !== 'debug') {
            // Reduced: Skip trace/debug in console by default; add toggle if needed
            this.outputToConsole(entry);
        }

        // 🔄 KEEP ONLY RECENT ENTRIES (last 500)
        if (this.entries.length > 500) {
            // Reduced: Smaller buffer
            this.entries = this.entries.slice(-500);
        }
    }

    // 🎨 SMART CONSOLE OUTPUT - Reduced: Simplified prefix
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

    // 📈 GENERATE DIAGNOSTIC REPORT - Reduced: Fewer details in report
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
            }))
            .sort((a, b) => b.renderCount - a.renderCount);

        // Recent critical issues
        const criticalIssues = this.entries.filter(e => e.level === 'critical' && now - e.timestamp < 30000).slice(-5); // Reduced: Top 5

        // Performance summary
        const slowOps = this.patterns.slowOperations
            .filter(op => now - op.timestamp < 60000)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5); // Reduced: Top 5

        return {
            sessionDuration,
            totalLogEntries: this.entries.length,
            componentIssues: componentIssues.slice(0, 5), // Reduced: Top 5
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

    // 💡 SMART RECOMMENDATIONS - Reduced: Simpler logic
    private generateRecommendations(componentIssues: any[], slowOps: any[]): string[] {
        const recommendations: string[] = [];

        // High render count recommendations
        const highRenderComponents = componentIssues.filter(c => c.renderCount > 100); // Increased threshold
        if (highRenderComponents.length > 0) {
            recommendations.push(
                `🔄 High render count in: ${highRenderComponents.map(c => c.name).join(', ')}. Consider memoization.`
            );
        }

        // Performance recommendations
        if (slowOps.length > 0) {
            recommendations.push(`🐌 Slow operations: ${slowOps.map(op => op.operation).join(', ')}. Optimize async.`);
        }

        return recommendations; // Reduced: Removed state flapping rec as it's now less frequent
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

// 🎯 COMPONENT TRACKER CLASS - Reduced: Some methods to debug
class ComponentTracker {
    private startTime = performance.now();

    constructor(
        private componentName: string,
        private logger: DiagnosticLogger
    ) {}

    // Track useEffect - Reduced: To debug
    useEffect(deps: any[], description: string = 'useEffect') {
        this.logger.log('debug', 'render', this.componentName, `🔄 ${description} triggered`, { dependencies: deps });
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

    // Track navigation - Reduced: To info, simplified message
    navigate(from: string, to: string, reason?: string) {
        this.logger.log('info', 'nav', this.componentName, `🧭 Nav: ${from} → ${to}`, { reason });
    }

    // Track user interactions - Reduced: To debug
    userAction(action: string, data?: any) {
        this.logger.log('debug', 'user', this.componentName, `👤 Action: ${action}`, data);
    }

    // Track errors
    error(message: string, error?: any) {
        this.logger.log('error', 'error', this.componentName, message, error);
    }

    // Mark render complete - Reduced: Log only if duration >10ms
    renderComplete() {
        const duration = performance.now() - this.startTime;
        if (duration > 10) {
            this.logger.log('debug', 'render', this.componentName, `🎨 Render complete in ${duration.toFixed(2)}ms`);
        }
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
        // Reduced: Removed avgTimeBetweenRenders
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
