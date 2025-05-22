// src/components/chat/StatusIndicator.tsx
import React, { useEffect, useRef } from "react";
import { logger } from "@/modules/Logger";

interface StatusIndicatorProps {
    status: "active" | "inactive" | "error";
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const prevStatus = useRef(status);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) {
            try {
                logger.info(
                    `📊 StatusIndicator component mounted with status: ${status}`,
                );
                mountedRef.current = true;
            } catch (error) {
                logger.error(
                    `❌ Error during StatusIndicator mount: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
            }
        }

        return () => {
            logger.info("🧹 StatusIndicator component unmounting");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only on mount/unmount

    useEffect(() => {
        try {
            // Only log if status actually changed
            if (prevStatus.current !== status) {
                logger.debug(
                    `🔄 Status changed: ${prevStatus.current} → ${status}`,
                );
                prevStatus.current = status;
            }
        } catch (error) {
            logger.error(
                `❌ Error logging status change: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [status]);

    const getStatusColor = () => {
        try {
            const colors = {
                active: "bg-green-500",
                inactive: "bg-gray-500",
                error: "bg-red-500",
            };
            return colors[status] || "bg-gray-500";
        } catch (error) {
            logger.error(
                `❌ Error getting status color: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
            return "bg-gray-500";
        }
    };

    const getStatusLabel = () => {
        try {
            const labels = {
                active: "Active",
                inactive: "Inactive",
                error: "Error",
            };
            return labels[status] || "Unknown";
        } catch (error) {
            logger.error(
                `❌ Error getting status label: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
            return "Unknown";
        }
    };

    try {
        return (
            <div className="flex items-center justify-center">
                <span
                    className={`inline-block w-3 h-3 rounded-full ${getStatusColor()}`}
                    aria-label={`Status: ${getStatusLabel()}`}
                ></span>
                <span className="ml-2 text-sm capitalize">
                    {getStatusLabel()}
                </span>
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering StatusIndicator: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div className="flex items-center justify-center">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-500"></span>
                <span className="ml-2 text-sm">Status Error</span>
            </div>
        );
    }
};

export default React.memo(StatusIndicator); // Add memoization
