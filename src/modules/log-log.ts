// src/modules/log-log.ts

export interface LogLogEntry {
    level: "debug" | "info" | "warning" | "error" | "performance";
    message: string;
    timestamp: string;
    queryId?: string; // Optional field for associating logs with specific queries
}

type LogListener = (log: LogLogEntry) => void;

class LogLog {
    private listeners: LogListener[] = [];

    subscribe(listener: LogListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    log(level: LogLogEntry["level"], message: string, queryId?: string) {
        const logEntry: LogLogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            queryId,
        };
        this.listeners.forEach((listener) => listener(logEntry));
        // Structured logging to console
        console.log(
            JSON.stringify({
                level: logEntry.level.toUpperCase(),
                message: logEntry.message,
                timestamp: logEntry.timestamp,
                queryId: logEntry.queryId || "general",
            }),
        );
    }

    debug(message: string, queryId?: string) {
        this.log("debug", message, queryId);
    }

    info(message: string, queryId?: string) {
        this.log("info", message, queryId);
    }

    warning(message: string, queryId?: string) {
        this.log("warning", message, queryId);
    }

    error(message: string, queryId?: string) {
        this.log("error", message, queryId);
    }

    performance(message: string, queryId?: string) {
        this.log("performance", message, queryId);
    }

    clearLogs() {
        // Implement if needed
    }
}

export const loglog = new LogLog();
