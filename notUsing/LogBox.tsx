// src/components/chat/LogBox.tsx

"use client"; // Ensure it's a client component

import React, { useState } from "react";
import { usePerformance } from "@/contexts/PerformanceContext"; // Import usePerformance
import { LogLogEntry } from "@/modules/log-log";

interface LogBoxProps {
    logs: LogLogEntry[];
}

const LogBox: React.FC<LogBoxProps> = ({ logs }) => {
    const { entries: performanceEntries } = usePerformance();
    const [showPerformance, setShowPerformance] = useState(true);
    const [showLogs, setShowLogs] = useState(true);

    return (
        <div className="flex flex-col h-full bg-transcription-box rounded-lg p-4">
            <div className="flex justify-between mb-2">
                <button
                    className="text-lg font-semibold text-white"
                    onClick={() => setShowLogs(!showLogs)}
                >
                    Activity Logs
                </button>
                <button
                    className="text-lg font-semibold text-white"
                    onClick={() => setShowPerformance(!showPerformance)}
                >
                    Performance Logs
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {/* Regular Logs Section */}
                {showLogs && (
                    <div className="mb-4">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className={`log-entry ${log.level} mb-1`}
                                style={{
                                    color: getColorForLogLevel(log.level),
                                }}
                            >
                                [{new Date(log.timestamp).toLocaleTimeString()}]
                                [{log.level.toUpperCase()}] {log.message}
                            </div>
                        ))}
                    </div>
                )}

                {/* Performance Logs Section */}
                {showPerformance && (
                    <div>
                        {performanceEntries.map((entry, index) => (
                            <div
                                key={`perf-${index}`}
                                className={`log-entry performance mb-1 text-sm font-normal`}
                                style={{
                                    color: getColorForLogLevel("performance"),
                                }}
                            >
                                [
                                {new Date(entry.startTime).toLocaleTimeString()}
                                ] [PERFORMANCE] {entry.name} took{" "}
                                {entry.duration.toFixed(2)}ms
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

function getColorForLogLevel(level: string): string {
    switch (level) {
        case "debug":
            return "#7F7F7F"; // Gray
        case "info":
            return "#387fc7"; // Blue
        case "warning":
            return "#FFA500"; // Orange
        case "error":
            return "#FF0000"; // Red
        case "performance":
            return "#00FF00"; // Green
        default:
            return "#FFFFFF"; // White
    }
}

export default LogBox;
