// // src/modules/log-log.ts
// export interface LogLogEntry {
//     level: "debug" | "info" | "warning" | "error" | "performance";
//     message: string;
//     timestamp: string;
//     queryId?: string;
// }

// type LogListener = (log: LogLogEntry) => void;

// class LogLog {
//     private listeners: LogListener[] = [];
//     private sessionId: string;
//     private isClient: boolean;

//     constructor() {
//         this.isClient = typeof window !== "undefined";
//         this.sessionId = this.getOrCreateSessionId();
//     }

//     private getOrCreateSessionId(): string {
//         if (!this.isClient) {
//             return this.generateSessionId();
//         }

//         const STORAGE_KEY = "app_logger_session";

//         try {
//             const storedSession = localStorage.getItem(STORAGE_KEY);
//             if (storedSession) {
//                 const sessionData = JSON.parse(storedSession);
//                 return sessionData.sessionId;
//             }
//         } catch (error) {
//             console.warn("Failed to get session from localStorage:", error);
//         }

//         // Fallback to generating new session ID
//         return this.generateSessionId();
//     }

//     private generateSessionId(): string {
//         const now = new Date();
//         const dateStr = now.toISOString().split("T")[0];
//         const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
//         return `${dateStr}_${timeStr}`;
//     }

//     private async writeToFile(logEntry: LogLogEntry): Promise<void> {
//         if (!this.isClient) return;

//         try {
//             await fetch("/api/logger/write", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     sessionId: this.sessionId,
//                     logEntry: {
//                         message: `[LOGLOG${
//                             logEntry.queryId ? `][${logEntry.queryId}` : ""
//                         }] ${logEntry.message}`,
//                         level: logEntry.level,
//                         timestamp: logEntry.timestamp,
//                         emoji: this.getEmojiForLevel(logEntry.level),
//                     },
//                 }),
//             });
//         } catch (error) {
//             console.error("Failed to write loglog to file:", error);
//         }
//     }

//     private getEmojiForLevel(level: string): string {
//         const emojis: Record<string, string> = {
//             debug: "🔍",
//             info: "ℹ️",
//             warning: "⚠️",
//             error: "❌",
//             performance: "⏱️",
//         };
//         return emojis[level] || "📝";
//     }

//     subscribe(listener: LogListener) {
//         this.listeners.push(listener);
//         return () => {
//             this.listeners = this.listeners.filter((l) => l !== listener);
//         };
//     }

//     log(level: LogLogEntry["level"], message: string, queryId?: string) {
//         const logEntry: LogLogEntry = {
//             level,
//             message,
//             timestamp: new Date().toISOString(),
//             queryId,
//         };

//         // Notify listeners
//         this.listeners.forEach((listener) => listener(logEntry));

//         // Console output with structured logging
//         console.log(
//             JSON.stringify({
//                 level: logEntry.level.toUpperCase(),
//                 message: logEntry.message,
//                 timestamp: logEntry.timestamp,
//                 queryId: logEntry.queryId || "general",
//             }),
//         );

//         // File output
//         this.writeToFile(logEntry);
//     }

//     debug(message: string, queryId?: string) {
//         this.log("debug", message, queryId);
//     }

//     info(message: string, queryId?: string) {
//         this.log("info", message, queryId);
//     }

//     warning(message: string, queryId?: string) {
//         this.log("warning", message, queryId);
//     }

//     error(message: string, queryId?: string) {
//         this.log("error", message, queryId);
//     }

//     performance(message: string, queryId?: string) {
//         this.log("performance", message, queryId);
//     }

//     clearLogs() {
//         // Implement if needed
//     }

//     getSessionId(): string {
//         return this.sessionId;
//     }
// }

// export const loglog = new LogLog();
