// src/components/chat/LogBox.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePerformance } from "@/contexts/PerformanceContext";
import { LogLogEntry } from "@/modules/log-log";
import { logger } from "@/modules/Logger";

interface LogBoxProps {
    logs: LogLogEntry[];
}

const LogBox: React.FC<LogBoxProps> = ({ logs }) => {
    const { entries: performanceEntries } = usePerformance();
    const [showPerformance, setShowPerformance] = useState(true);
    const [showLogs, setShowLogs] = useState(true);

    useEffect(() => {
        try {
            logger.info("📊 LogBox component mounted");
            logger.debug(
                `📈 Initial logs count: ${logs.length}, Performance entries: ${performanceEntries.length}`,
            );
        } catch (error) {
            logger.error(
                `❌ Error during LogBox mount: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }

        return () => {
            logger.info("🧹 LogBox component unmounting");
        };
    }, [logs.length, performanceEntries.length]);

    useEffect(() => {
        try {
            logger.debug(`📝 Logs updated: ${logs.length} entries`);
        } catch (error) {
            logger.error(
                `❌ Error logging logs update: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [logs]);

    const togglePerformance = () => {
        try {
            setShowPerformance(!showPerformance);
            logger.debug(
                `🔄 Performance logs visibility toggled: ${!showPerformance}`,
            );
        } catch (error) {
            logger.error(
                `❌ Error toggling performance logs: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    const toggleLogs = () => {
        try {
            setShowLogs(!showLogs);
            logger.debug(`🔄 Activity logs visibility toggled: ${!showLogs}`);
        } catch (error) {
            logger.error(
                `❌ Error toggling activity logs: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    function getColorForLogLevel(level: string): string {
        try {
            const colors = {
                debug: "#7F7F7F",
                info: "#387fc7",
                warning: "#FFA500",
                error: "#FF0000",
                performance: "#00FF00",
            };
            return colors[level as keyof typeof colors] || "#FFFFFF";
        } catch (error) {
            logger.error(
                `❌ Error getting color for log level ${level}: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
            return "#FFFFFF";
        }
    }

    try {
        return (
            <div className="flex flex-col h-full bg-transcription-box rounded-lg p-4">
                <div className="flex justify-between mb-2">
                    <button
                        className="text-lg font-semibold text-white"
                        onClick={toggleLogs}
                    >
                        Activity Logs {showLogs ? "▼" : "▶"}
                    </button>
                    <button
                        className="text-lg font-semibold text-white"
                        onClick={togglePerformance}
                    >
                        Performance Logs {showPerformance ? "▼" : "▶"}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Regular Logs Section */}
                    {showLogs && (
                        <div className="mb-4">
                            {logs.length === 0 ? (
                                <div className="text-gray-400 text-sm">
                                    No activity logs available
                                </div>
                            ) : (
                                logs.map((log, index) => {
                                    try {
                                        return (
                                            <div
                                                key={index}
                                                className={`log-entry ${log.level} mb-1 text-sm`}
                                                style={{
                                                    color: getColorForLogLevel(
                                                        log.level,
                                                    ),
                                                }}
                                            >
                                                [
                                                {new Date(
                                                    log.timestamp,
                                                ).toLocaleTimeString()}
                                                ] [{log.level.toUpperCase()}]{" "}
                                                {log.message}
                                            </div>
                                        );
                                    } catch (error) {
                                        logger.error(
                                            `❌ Error rendering log entry ${index}: ${
                                                error instanceof Error
                                                    ? error.message
                                                    : "Unknown error"
                                            }`,
                                        );
                                        return (
                                            <div
                                                key={index}
                                                className="log-entry error mb-1 text-sm text-red-500"
                                            >
                                                Error displaying log entry
                                            </div>
                                        );
                                    }
                                })
                            )}
                        </div>
                    )}

                    {/* Performance Logs Section */}
                    {showPerformance && (
                        <div>
                            {performanceEntries.length === 0 ? (
                                <div className="text-gray-400 text-sm">
                                    No performance logs available
                                </div>
                            ) : (
                                performanceEntries.map((entry, index) => {
                                    try {
                                        return (
                                            <div
                                                key={`perf-${index}`}
                                                className={`log-entry performance mb-1 text-sm font-normal`}
                                                style={{
                                                    color: getColorForLogLevel(
                                                        "performance",
                                                    ),
                                                }}
                                            >
                                                [
                                                {new Date(
                                                    entry.startTime,
                                                ).toLocaleTimeString()}
                                                ] [PERFORMANCE] {entry.name}{" "}
                                                took {entry.duration.toFixed(2)}
                                                ms
                                            </div>
                                        );
                                    } catch (error) {
                                        logger.error(
                                            `❌ Error rendering performance entry ${index}: ${
                                                error instanceof Error
                                                    ? error.message
                                                    : "Unknown error"
                                            }`,
                                        );
                                        return (
                                            <div
                                                key={`perf-${index}`}
                                                className="log-entry error mb-1 text-sm text-red-500"
                                            >
                                                Error displaying performance
                                                entry
                                            </div>
                                        );
                                    }
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering LogBox: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div className="flex flex-col h-full bg-red-50 rounded-lg p-4">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-red-600 text-center">
                        <p className="font-semibold">Log display error</p>
                        <p className="text-sm">Unable to render log entries</p>
                    </div>
                </div>
            </div>
        );
    }
};

export default LogBox;
