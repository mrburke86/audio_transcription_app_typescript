// src/components/chat/ConversationSummary.tsx - Debug Mode Alternative
'use client';
import React, { useEffect } from 'react';
import { logger } from '@/modules/Logger';

interface ConversationSummaryProps {
    summary: string;
    goals: string[];
}

// Only enable detailed logging in development
const DEBUG_CONVERSATION_SUMMARY = process.env.NODE_ENV === 'development' && process.env.DEBUG_CONVERSATION === 'true';

const ConversationSummary: React.FC<ConversationSummaryProps> = ({ summary, goals }) => {
    // Optional debug logging only in development with specific flag
    useEffect(() => {
        if (DEBUG_CONVERSATION_SUMMARY) {
            logger.debug(`ConversationSummary: ${goals.length} goals, summary: ${summary ? 'present' : 'empty'}`);
        }
    }, [summary, goals.length]);

    if (!summary && goals.length === 0) {
        return null;
    }

    try {
        return (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded" role="alert">
                {goals.length > 0 && (
                    <>
                        <p className="font-bold">Conversation Goals/Milestones</p>
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
        logger.error(`ConversationSummary render error: ${error instanceof Error ? error.message : 'Unknown error'}`);

        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <p className="font-bold">Display Error</p>
                <p>Unable to show conversation summary</p>
            </div>
        );
    }
};

export default ConversationSummary;
