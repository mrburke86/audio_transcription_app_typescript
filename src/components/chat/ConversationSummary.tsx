"use client";
import React, { useEffect, useRef } from "react";
import { logger } from "@/modules/Logger";

interface ConversationSummaryProps {
    summary: string;
    goals: string[];
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({
    summary,
    goals,
}) => {
    const hasLoggedEmpty = useRef(false);
    const prevSummary = useRef(summary);
    const prevGoalsLength = useRef(goals.length);

    useEffect(() => {
        try {
            logger.info("📋 ConversationSummary component mounted");
        } catch (error) {
            logger.error(
                `❌ Error during ConversationSummary mount: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }

        return () => {
            logger.info("🧹 ConversationSummary component unmounting");
        };
    }, []); // Only on mount/unmount

    useEffect(() => {
        try {
            // Only log if summary actually changed
            if (prevSummary.current !== summary) {
                logger.debug(
                    `📝 Summary updated: ${
                        summary ? `"${summary.substring(0, 50)}..."` : "empty"
                    }`,
                );
                prevSummary.current = summary;
            }
        } catch (error) {
            logger.error(
                `❌ Error logging summary update: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [summary]);

    useEffect(() => {
        try {
            // Only log if goals count actually changed
            if (prevGoalsLength.current !== goals.length) {
                logger.debug(
                    `🎯 Goals updated: ${prevGoalsLength.current} → ${goals.length} goals`,
                );
                goals.forEach((goal, index) => {
                    logger.debug(`   Goal ${index + 1}: ${goal}`);
                });
                prevGoalsLength.current = goals.length;
            }
        } catch (error) {
            logger.error(
                `❌ Error logging goals update: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [goals, goals.length]);

    if (!summary && goals.length === 0) {
        // Only log "no summary" once to avoid spam
        if (!hasLoggedEmpty.current) {
            logger.debug("📭 No summary or goals to display");
            hasLoggedEmpty.current = true;
        }
        return null;
    }

    // Reset the empty log flag when we have content
    hasLoggedEmpty.current = false;

    try {
        return (
            <div
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
                role="alert"
            >
                {goals.length > 0 && (
                    <>
                        <p className="font-bold">
                            Conversation Goals/Milestones
                        </p>
                        <ul className="list-disc list-inside mb-2">
                            {goals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                            ))}
                        </ul>
                    </>
                )}
                {summary && (
                    <>
                        <p className="font-bold">Conversation Summary</p>
                        <p>{summary}</p>
                    </>
                )}
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering ConversationSummary: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <p className="font-bold">Display Error</p>
                <p>Unable to show conversation summary</p>
            </div>
        );
    }
};

export default ConversationSummary;
