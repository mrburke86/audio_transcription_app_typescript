// src/modules/Logger.ts
import { debounce } from 'lodash';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'performance';

interface LogLevelConfig {
    name: string;
    color: string;
    emoji: string;
}

const LogLevels: Record<LogLevel, LogLevelConfig> = {
    debug: { name: 'DEBUG', color: '#7F7F7F', emoji: '🔍' },
    info: { name: 'INFO', color: '#387fc7', emoji: 'ℹ️' },
    warning: { name: 'WARNING', color: '#FFA500', emoji: '⚠️' },
    error: { name: 'ERROR', color: '#FF0000', emoji: '❌' },
    performance: { name: 'PERFORMANCE', color: '#00FF00', emoji: '⏱️' },
};

export interface LogEntry {
    message: string;
    level: LogLevel;
    timestamp: string;
    color: string;
    emoji: string;
}

export class Logger {
    private logEntries: LogEntry[] = [];
    private sessionId: string;
    private isClient: boolean;
    private sessionInitialized: boolean = false;

    constructor() {
        this.isClient = typeof window !== 'undefined';
        this.sessionId = this.getOrCreateSessionId();
    }

    private generateSessionId(): string {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        return `${dateStr}_${timeStr}`;
    }

    private getOrCreateSessionId(): string {
        if (!this.isClient) {
            return this.generateSessionId();
        }

        const STORAGE_KEY = 'app_logger_session';
        const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

        try {
            const storedSession = localStorage.getItem(STORAGE_KEY);

            if (storedSession) {
                const sessionData = JSON.parse(storedSession);
                const sessionAge = Date.now() - sessionData.timestamp;
                if (sessionAge < SESSION_TIMEOUT) {
                    console.log(`📝 Reusing existing session: ${sessionData.sessionId}`);
                    this.sessionInitialized = true;
                    return sessionData.sessionId;
                }
            }
        } catch (error) {
            console.warn('Failed to parse stored session, creating new one:', error);
        }

        // Create new session
        const newSessionId = this.generateSessionId();
        const sessionData = {
            sessionId: newSessionId,
            timestamp: Date.now(),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
            console.log(`🚀 Created new session: ${newSessionId}`);
        } catch (error) {
            console.warn('Failed to store session in localStorage:', error);
        }

        return newSessionId;
    }

    private formatTimestamp(date: Date): string {
        return date.toISOString().replace('T', ' ').substr(0, 23); // Include milliseconds
    }

    private createLogMessage(message: string, level: LogLevel): LogEntry {
        const timestamp = this.formatTimestamp(new Date());
        const logConfig = LogLevels[level];
        return {
            message,
            level,
            timestamp,
            color: logConfig.color,
            emoji: logConfig.emoji,
        };
    }

    // No-op, kept for interface compatibility if needed
    private async initializeSession(): Promise<void> {
        // Removed API call
    }

    // No longer writes logs anywhere except local array/console
    private async writeToFile(_logEntry: LogEntry): Promise<void> {
        // No-op
    }

    private debouncedLog = debounce((message: string, level: LogLevel) => {
        const logEntry = this.createLogMessage(message, level);
        this.logEntries.push(logEntry);

        // Console output only
        console.log(`%c${logEntry.emoji} [${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`, `color: ${logEntry.color}`);
        // No file output
    }, 100);

    log(message: string, level: LogLevel = 'info'): void {
        if (level === 'debug' && message.startsWith('📤 Streaming response chunk:')) {
            this.debouncedLog(message, level);
        } else {
            const logEntry = this.createLogMessage(message, level);
            this.logEntries.push(logEntry);

            // Console output only
            console.log(`%c${logEntry.emoji} [${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`, `color: ${logEntry.color}`);
            // No file output
        }
    }

    debug(message: string): void {
        this.log(message, 'debug');
    }

    info(message: string): void {
        this.log(message, 'info');
    }

    warning(message: string): void {
        this.log(message, 'warning');
    }

    error(message: string): void {
        this.log(message, 'error');
    }

    performance(message: string): void {
        this.log(message, 'performance');
    }

    getLogs(): LogEntry[] {
        return this.logEntries;
    }

    clearLogs(): void {
        this.logEntries = [];
    }

    getSessionId(): string {
        return this.sessionId;
    }

    // Method to manually create a new session (for testing or manual reset)
    async createNewSession(): Promise<void> {
        const STORAGE_KEY = 'app_logger_session';

        // Clear existing session
        if (this.isClient) {
            localStorage.removeItem(STORAGE_KEY);
        }

        // Generate new session
        this.sessionId = this.generateSessionId();
        this.sessionInitialized = false;

        // Store new session
        if (this.isClient) {
            const sessionData = {
                sessionId: this.sessionId,
                timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        }

        // No remote initialization needed
        // await this.initializeSession();

        console.log(`🔄 New session created: ${this.sessionId}`);
    }

    // Removed download functionality as it depended on API
    async downloadLogs(): Promise<void> {
        // No-op or optionally, implement browser-based download if needed
        if (!this.isClient) return;

        // Example: Let’s offer client-side download for logs as a plain text file
        try {
            const text = this.logEntries
                .map(log => `${log.emoji} [${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
                .join('\n');

            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `app-logs-${this.sessionId}.log`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download logs:', error);
        }
    }
}

export const logger = new Logger();
