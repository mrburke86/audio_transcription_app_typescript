// src/components/chat/LogBox.tsx
import React from "react";
import { LogEntry } from "@/modules/Logger";

interface LogBoxProps {
    logs: LogEntry[];
}

const LogBox: React.FC<LogBoxProps> = ({ logs }) => {
    return (
        <div className="flex flex-col h-full bg-transcription-box rounded-lg p-4">
            {/* <h2 className="text-lg font-semibold mb-2 text-white">
                Activity Log
            </h2> */}
            <div className="flex-1 overflow-y-auto">
                {logs.map((log, index) => (
                    <div
                        key={index}
                        className={`log-entry ${log.level} mb-1`}
                        style={{ color: getColorForLogLevel(log.level) }}
                    >
                        [{log.timestamp}] [{log.level.toUpperCase()}]{" "}
                        {log.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

function getColorForLogLevel(level: string): string {
    switch (level) {
        case "debug":
            return "#7F7F7F";
        case "info":
            return "#387fc7";
        case "warning":
            return "#FFA500";
        case "error":
            return "#FF0000";
        case "performance":
            return "#00FF00";
        default:
            return "#FFFFFF";
    }
}

export default LogBox;
