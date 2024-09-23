// src/modules/Logger.ts

import { debounce } from "lodash";

export type LogLevel = "debug" | "info" | "warning" | "error" | "performance";

interface LogLevelConfig {
    name: string;
    color: string;
    emoji: string; // Add emoji property for each log level
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

    private formatTimestamp(date: Date): string {
        return date.toISOString().replace("T", " ").substr(0, 19);
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

    private debouncedLog = debounce((message: string, level: LogLevel) => {
        const logEntry = this.createLogMessage(message, level);
        this.logEntries.push(logEntry);
        console.log(
            `%c${logEntry.emoji} [${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`,
            `color: ${logEntry.color}`,
        );
    }, 500);

    log(message: string, level: LogLevel = "info"): void {
        if (
            level === "debug" &&
            message.startsWith("📤 Streaming response chunk:")
        ) {
            this.debouncedLog(message, level);
        } else {
            const logEntry = this.createLogMessage(message, level);
            this.logEntries.push(logEntry);
            console.log(
                `%c${logEntry.emoji} [${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`,
                `color: ${logEntry.color}`,
            );
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
}

export const logger = new Logger();
