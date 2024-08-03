// src/modules/Logger.ts
import { debounce } from "lodash";

export type LogLevel = "debug" | "info" | "warning" | "error" | "performance";

interface LogLevelConfig {
    name: string;
    color: string;
}

const LogLevels: Record<LogLevel, LogLevelConfig> = {
    debug: { name: "DEBUG", color: "#7F7F7F" },
    info: { name: "INFO", color: "#387fc7" },
    warning: { name: "WARNING", color: "#FFA500" },
    error: { name: "ERROR", color: "#FF0000" },
    performance: { name: "PERFORMANCE", color: "#00FF00" }, // Added performance log level
};

export interface LogEntry {
    message: string;
    level: LogLevel;
    timestamp: string;
    color: string;
}

export class Logger {
    private logEntries: LogEntry[] = [];

    private formatTimestamp(date: Date): string {
        return date.toISOString().replace("T", " ").substr(0, 19);
    }

    private createLogMessage(message: string, level: LogLevel): LogEntry {
        const timestamp = this.formatTimestamp(new Date());
        const logConfig = LogLevels[level];
        return { message, level, timestamp, color: logConfig.color };
    }

    private debouncedLog = debounce((message: string, level: LogLevel) => {
        const logEntry = this.createLogMessage(message, level);
        this.logEntries.push(logEntry);
        console.log(
            `%c[${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`,
            `color: ${logEntry.color}`,
        );
    }, 500); // Adjust the debounce time as needed

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
                `%c[${logEntry.timestamp}] [${LogLevels[level].name}] ${message}`,
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
