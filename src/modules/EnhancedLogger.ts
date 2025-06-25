// src/modules/EnhancedLogger.ts

export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'performance';
export type LogContext = 'hook' | 'slice' | 'api' | 'component' | 'middleware' | 'error-boundary';

interface LogConfig {
    enabledLevels: LogLevel[];
    enabledContexts: LogContext[];
    enableInProduction: boolean;
    maxLogEntries: number;
    enableStackTrace: boolean;
}

interface EnhancedLogEntry {
    message: string;
    level: LogLevel;
    context: LogContext;
    timestamp: string;
    color: string;
    emoji: string;
    stackTrace?: string;
    metadata?: Record<string, unknown>;
}

const DEFAULT_CONFIG: LogConfig = {
    enabledLevels:
        process.env.NODE_ENV === 'development'
            ? ['error', 'warning', 'info'] // Reduced default levels
            : ['error'], // Production: errors only
    enabledContexts:
        process.env.NODE_ENV === 'development'
            ? ['slice', 'api', 'component', 'error-boundary'] // Exclude noisy 'hook', 'middleware' by default
            : ['error-boundary'],
    enableInProduction: false,
    maxLogEntries: 500, // Reduced from 1000
    enableStackTrace: true,
};

const LogLevels: Record<LogLevel, { name: string; color: string; emoji: string; priority: number }> = {
    trace: { name: 'TRACE', color: '#808080', emoji: '🔬', priority: 0 },
    debug: { name: 'DEBUG', color: '#7F7F7F', emoji: '🔍', priority: 1 },
    info: { name: 'INFO', color: '#387fc7', emoji: 'ℹ️', priority: 2 },
    warning: { name: 'WARNING', color: '#FFA500', emoji: '⚠️', priority: 3 },
    error: { name: 'ERROR', color: '#FF0000', emoji: '❌', priority: 4 },
    performance: { name: 'PERFORMANCE', color: '#00FF00', emoji: '⏱️', priority: 2 },
};

export class EnhancedLogger {
    private logEntries: EnhancedLogEntry[] = [];
    private sessionId: string;
    private isClient: boolean;
    private config: LogConfig;

    // Rate limiting for noisy logs
    private rateLimitMap = new Map<string, { count: number; lastReset: number }>();
    private readonly RATE_LIMIT_WINDOW = 5000; // 5 seconds
    private readonly RATE_LIMIT_MAX = 10; // Max 10 logs per key per window

    constructor(config: Partial<LogConfig> = {}) {
        this.isClient = typeof window !== 'undefined';
        this.sessionId = this.generateSessionId();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    private generateSessionId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    private shouldLog(level: LogLevel, context: LogContext): boolean {
        // Check if logging is enabled for this environment
        if (!this.config.enableInProduction && process.env.NODE_ENV === 'production') {
            return level === 'error'; // Always allow errors
        }

        // Check level and context filters
        return this.config.enabledLevels.includes(level) && this.config.enabledContexts.includes(context);
    }

    private isRateLimited(key: string): boolean {
        const now = Date.now();
        const rateLimit = this.rateLimitMap.get(key);

        if (!rateLimit || now - rateLimit.lastReset > this.RATE_LIMIT_WINDOW) {
            this.rateLimitMap.set(key, { count: 1, lastReset: now });
            return false;
        }

        if (rateLimit.count >= this.RATE_LIMIT_MAX) {
            return true;
        }

        rateLimit.count++;
        return false;
    }

    public log(
        level: LogLevel,
        context: LogContext,
        message: string,
        metadata?: Record<string, unknown>,
        error?: Error
    ): void {
        if (!this.shouldLog(level, context)) {
            return;
        }

        // Rate limiting for noisy contexts
        if (['hook', 'middleware'].includes(context)) {
            const rateLimitKey = `${context}-${message.split(' ')[0]}`;
            if (this.isRateLimited(rateLimitKey)) {
                return;
            }
        }

        const logConfig = LogLevels[level];
        const timestamp = new Date().toLocaleTimeString();

        // Enhanced stack trace for errors
        let stackTrace: string | undefined;
        if (this.config.enableStackTrace && (level === 'error' || error)) {
            if (error?.stack) {
                stackTrace = error.stack;
            } else if (level === 'error') {
                stackTrace = new Error().stack;
            }
        }

        const logEntry: EnhancedLogEntry = {
            message,
            level,
            context,
            timestamp,
            color: logConfig.color,
            emoji: logConfig.emoji,
            stackTrace,
            metadata,
        };

        // Store entry
        if (this.isClient) {
            this.logEntries.push(logEntry);
            if (this.logEntries.length > this.config.maxLogEntries) {
                this.logEntries.shift();
            }
        }

        // Console output with enhanced formatting
        this.outputToConsole(logEntry, error);
    }

    private outputToConsole(entry: EnhancedLogEntry, error?: Error): void {
        const prefix = `%c${entry.emoji} [${entry.timestamp}] [${entry.context.toUpperCase()}] [${
            LogLevels[entry.level].name
        }]`;
        const style = `color: ${entry.color}; font-weight: ${entry.level === 'error' ? 'bold' : 'normal'}`;

        if (entry.level === 'error' && (error || entry.stackTrace)) {
            console.group(prefix + ' ' + entry.message, style);

            if (entry.metadata) {
                console.log('📊 Metadata:', entry.metadata);
            }

            if (error) {
                console.error('🔥 Original Error:', error);
            }

            if (entry.stackTrace) {
                console.log('📍 Stack Trace:');
                console.log(entry.stackTrace);
            }

            console.groupEnd();
        } else {
            if (entry.metadata) {
                console.log(prefix + ' ' + entry.message, style, entry.metadata);
            } else {
                console.log(prefix + ' ' + entry.message, style);
            }
        }
    }

    // Convenience methods with context
    public slice(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
        this.log(level, 'slice', message, metadata, error);
    }

    public api(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
        this.log(level, 'api', message, metadata, error);
    }

    public hook(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
        this.log(level, 'hook', message, metadata, error);
    }

    public component(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
        this.log(level, 'component', message, metadata, error);
    }

    public errorBoundary(message: string, error: Error, metadata?: Record<string, unknown>): void {
        this.log('error', 'error-boundary', message, metadata, error);
    }

    // Enhanced error logging with full context
    public logError(
        context: LogContext,
        message: string,
        error: Error | unknown,
        additionalContext?: Record<string, unknown>
    ): void {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        const enhancedMetadata = {
            errorName: errorObj.name,
            errorMessage: errorObj.message,
            timestamp: new Date().toISOString(),
            userAgent: this.isClient ? navigator.userAgent : 'server',
            url: this.isClient ? window.location.href : 'server',
            sessionId: this.sessionId,
            ...additionalContext,
        };

        this.log('error', context, message, enhancedMetadata, errorObj);
    }

    // Update configuration at runtime
    public updateConfig(newConfig: Partial<LogConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('📝 Logger configuration updated:', this.config);
    }

    // Development helpers
    public enableDebugMode(): void {
        this.updateConfig({
            enabledLevels: ['trace', 'debug', 'info', 'warning', 'error', 'performance'],
            enabledContexts: ['hook', 'slice', 'api', 'component', 'middleware', 'error-boundary'],
        });
    }

    public quietMode(): void {
        this.updateConfig({
            enabledLevels: ['error'],
            enabledContexts: ['error-boundary'],
        });
    }

    // Download logs for debugging
    public async downloadLogs(): Promise<void> {
        if (!this.isClient || this.logEntries.length === 0) {
            return;
        }

        const logData = this.logEntries.map(entry => ({
            timestamp: entry.timestamp,
            level: entry.level,
            context: entry.context,
            message: entry.message,
            metadata: entry.metadata,
            stackTrace: entry.stackTrace,
        }));

        const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-logs-${this.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    public getLogSummary(): { totalLogs: number; errorCount: number; warningCount: number } {
        return {
            totalLogs: this.logEntries.length,
            errorCount: this.logEntries.filter(e => e.level === 'error').length,
            warningCount: this.logEntries.filter(e => e.level === 'warning').length,
        };
    }
}

// Create singleton instance
export const enhancedLogger = new EnhancedLogger();

// Global access for debugging
if (typeof window !== 'undefined') {
    (window as any).__logger = enhancedLogger;
}
