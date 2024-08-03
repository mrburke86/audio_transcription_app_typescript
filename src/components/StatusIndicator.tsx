// src/components/StatusIndicator.tsx
import React from "react";

interface StatusIndicatorProps {
    status: "active" | "inactive" | "error";
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const getStatusColor = () => {
        switch (status) {
            case "active":
                return "bg-green-500";
            case "inactive":
                return "bg-gray-500";
            case "error":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="flex items-center justify-center">
            <span className="text-sm mr-2">Status:</span>
            <span
                className={`inline-block w-3 h-3 rounded-full ${getStatusColor()}`}
            ></span>
            <span className="ml-2 text-sm capitalize">{status}</span>
        </div>
    );
};

export default StatusIndicator;
