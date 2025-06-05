// src/modules/Logger.ts

export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'performance';

interface LogLevelConfig {
    name: string;
    color: string;
    emoji: string;
}

const LogLevels: Record<LogLevel, LogLevelConfig> = {
    trace: { name: 'TRACE', color: '#808080', emoji: '🔬' },
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
    // sessionId?: string; // Optional: if you want to store it with each entry
}

const APP_NAME = 'InterviewEdgeAI';
const STORAGE_KEY = `${APP_NAME}_LOG_SESSION`;
const MAX_LOG_ENTRIES = 1000;

export class Logger {
    private logEntries: LogEntry[] = [];
    private sessionId: string;
    private isClient: boolean;

    constructor() {
        this.isClient = typeof window !== 'undefined';
        this.sessionId = this.getOrCreateSessionId();
    }

    private generateSessionId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    private getOrCreateSessionId(): string {
        if (this.isClient) {
            try {
                const storedSession = localStorage.getItem(STORAGE_KEY);
                if (storedSession) {
                    const sessionData = JSON.parse(storedSession);
                    return sessionData.sessionId;
                }
            } catch (error) {
                console.error('Error reading session ID from localStorage:', error);
            }
        }
        const newId = this.generateSessionId();
        if (this.isClient) {
            this.createAndStoreNewSession(newId, false);
        }
        return newId;
    }

    private createAndStoreNewSession(newId: string, _initializeWithServer = true): void {
        this.sessionId = newId;
        if (this.isClient) {
            const sessionData = {
                sessionId: this.sessionId,
                timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        }
        const timestamp = new Date().toLocaleTimeString();
        const logConfig = LogLevels['info'];
        console.log(
            `%c${logConfig.emoji} [${timestamp}] [${APP_NAME}] [SESSION] New session created: ${this.sessionId}`,
            `color: ${logConfig.color}`
        );
    }

    public log(level: LogLevel, message: string, ...optionalParams: unknown[]): void {
        const logConfig = LogLevels[level];
        const timestamp = new Date().toLocaleTimeString();

        const logEntry: LogEntry = {
            message: optionalParams.length > 0 ? `${message} ${JSON.stringify(optionalParams)}` : message,
            level,
            timestamp,
            color: logConfig.color,
            emoji: logConfig.emoji,
        };

        if (this.isClient) {
            this.logEntries.push(logEntry);
            if (this.logEntries.length > MAX_LOG_ENTRIES) {
                this.logEntries.shift();
            }
        }

        const consoleMessage = `%c${logEntry.emoji} [${logEntry.timestamp}] [${APP_NAME}] [${this.sessionId.substring(
            0,
            8
        )}] [${logConfig.name}] ${message}`;
        if (optionalParams.length > 0) {
            console.log(consoleMessage, `color: ${logEntry.color}`, ...optionalParams);
        } else {
            console.log(consoleMessage, `color: ${logEntry.color}`);
        }
    }

    public trace(message: string, ...optionalParams: unknown[]): void {
        this.log('trace', message, ...optionalParams);
    }

    public debug(message: string, ...optionalParams: unknown[]): void {
        this.log('debug', message, ...optionalParams);
    }

    public info(message: string, ...optionalParams: unknown[]): void {
        this.log('info', message, ...optionalParams);
    }

    public warning(message: string, ...optionalParams: unknown[]): void {
        this.log('warning', message, ...optionalParams);
    }

    public error(message: string, ...optionalParams: unknown[]): void {
        this.log('error', message, ...optionalParams);
    }

    public performance(message: string, ...optionalParams: unknown[]): void {
        this.log('performance', message, ...optionalParams);
    }

    async downloadLogs(): Promise<void> {
        if (!this.isClient) {
            this.warning('Log download is only available on the client-side.');
            return;
        }
        if (this.logEntries.length === 0) {
            this.info('No logs to download.');
            return;
        }

        try {
            const text = this.logEntries
                .map(
                    entry =>
                        `${entry.emoji} [${entry.timestamp}] [${APP_NAME}] [${this.sessionId.substring(0, 8)}] [${
                            LogLevels[entry.level].name
                        }] ${entry.message}`
                )
                .join('\n');

            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${APP_NAME}-logs-${this.sessionId}.log`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            this.info(`Logs downloaded successfully as ${a.download}.`);
        } catch (error) {
            this.error('Failed to download logs.', error);
        }
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public clearSessionLogs(): void {
        if (this.isClient) {
            this.logEntries = [];
            localStorage.removeItem(STORAGE_KEY);
            const newId = this.generateSessionId();
            this.createAndStoreNewSession(newId, false);
            this.info('Session logs cleared and new session started.');
        } else {
            this.warning('Cannot clear session logs on the server-side.');
        }
    }
}

export const logger = new Logger();
