// src/modules/Logger.ts
import { debounce } from "lodash";

export type LogLevel = "debug" | "info" | "warning" | "error" | "performance";

interface LogLevelConfig {
    name: string;
    color: string;
    emoji: string;
}

const LogLevels: Record<LogLevel, LogLevelConfig> = {
    debug: { name: "DEBUG", color: "#7F7F7F", emoji: "🔍" },
    info: { name: "INFO", color: "#387fc7", emoji: "ℹ️" },
    warning: { name: "WARNING", color: "#FFA500", emoji: "⚠️" },
    error: { name: "ERROR", color: "#FF0000", emoji: "❌" },
    performance: { name: "PERFORMANCE", color: "#00FF00", emoji: "⏱️" },
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
        this.isClient = typeof window !== "undefined";
        this.sessionId = this.getOrCreateSessionId();

        // Initialize session on client side
        if (this.isClient && !this.sessionInitialized) {
            this.initializeSession();
        }
    }

    private generateSessionId(): string {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
        return `${dateStr}_${timeStr}`;
    }

    private getOrCreateSessionId(): string {
        if (!this.isClient) {
            return this.generateSessionId();
        }

        const STORAGE_KEY = "app_logger_session";
        const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

        try {
            // Try to get existing session from localStorage
            const storedSession = localStorage.getItem(STORAGE_KEY);

            if (storedSession) {
                const sessionData = JSON.parse(storedSession);
                const sessionAge = Date.now() - sessionData.timestamp;

                // If session is less than 30 minutes old, reuse it
                if (sessionAge < SESSION_TIMEOUT) {
                    console.log(
                        `📝 Reusing existing session: ${sessionData.sessionId}`,
                    );
                    this.sessionInitialized = true; // Don't re-initialize
                    return sessionData.sessionId;
                }
            }
        } catch (error) {
            console.warn(
                "Failed to parse stored session, creating new one:",
                error,
            );
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
            console.warn("Failed to store session in localStorage:", error);
        }

        return newSessionId;
    }

    private formatTimestamp(date: Date): string {
        return date.toISOString().replace("T", " ").substr(0, 23); // Include milliseconds
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

    private async initializeSession(): Promise<void> {
        if (this.sessionInitialized) {
            return; // Don't re-initialize existing sessions
        }

        try {
            await fetch("/api/logger/init", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sessionId: this.sessionId }),
            });
            console.log(
                `📝 Logger initialized with session: ${this.sessionId}`,
            );
            this.sessionInitialized = true;
        } catch (error) {
            console.error("Failed to initialize logger session:", error);
        }
    }

    private async writeToFile(logEntry: LogEntry): Promise<void> {
        if (!this.isClient) return;

        try {
            await fetch("/api/logger/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    logEntry,
                }),
            });
        } catch (error) {
            // Silently fail file writing to avoid infinite loops
            console.error("Failed to write log to file:", error);
        }
    }

    private debouncedLog = debounce((message: string, level: LogLevel) => {
        const logEntry = this.createLogMessage(message, level);
        this.logEntries.push(logEntry);

        // Console output
        console.log(
            `%c${logEntry.emoji} [${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`,
            `color: ${logEntry.color}`,
        );

        // File output (async, non-blocking)
        this.writeToFile(logEntry);
    }, 100); // Reduced debounce time for more responsive logging

    log(message: string, level: LogLevel = "info"): void {
        if (
            level === "debug" &&
            message.startsWith("📤 Streaming response chunk:")
        ) {
            this.debouncedLog(message, level);
        } else {
            const logEntry = this.createLogMessage(message, level);
            this.logEntries.push(logEntry);

            // Console output
            console.log(
                `%c${logEntry.emoji} [${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`,
                `color: ${logEntry.color}`,
            );

            // File output (async, non-blocking)
            this.writeToFile(logEntry);
        }
    }

    debug(message: string): void {
        this.log(message, "debug");
    }

    info(message: string): void {
        this.log(message, "info");
    }

    warning(message: string): void {
        this.log(message, "warning");
    }

    error(message: string): void {
        this.log(message, "error");
    }

    performance(message: string): void {
        this.log(message, "performance");
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
        const STORAGE_KEY = "app_logger_session";

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

        // Initialize new session
        await this.initializeSession();

        console.log(`🔄 New session created: ${this.sessionId}`);
    }

    // Method to download current session logs
    async downloadLogs(): Promise<void> {
        if (!this.isClient) return;

        try {
            const response = await fetch(
                `/api/logger/download?sessionId=${this.sessionId}`,
            );
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `app-logs-${this.sessionId}.log`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Failed to download logs:", error);
        }
    }
}

export const logger = new Logger();
