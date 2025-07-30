// src/components/chat/primitives/ConversationContext.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Activity } from 'lucide-react';
import type React from 'react';

interface ConversationContextProps {
    summary: string;
    goals: string[];
}

export const ConversationContext: React.FC<ConversationContextProps> = ({ summary, goals }) => {
    // const renderCount = useRef(0);
    // renderCount.current++;
    // console.log(`🧮 [DIAG] ConversationContext Component rendered ${renderCount.current} times`);

    const renderSummary = () => {
        if (!summary) return null;

        return (
            <>
                <p className="font-bold">Conversation Summary</p>
                <p>{summary}</p>
            </>
        );
    };

    const hasContent = summary || goals.length > 0;

    return (
        <Card className="h-full flex flex-col overscroll-contain">
            {/* Header */}
            <CardHeader className="p-4 pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 p-0">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="w-3 h-3 text-orange-600" />
                    </div>

                    <span className="text-sm font-medium text-gray-900">Context</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto hide-scrollbar p-4 pt-0">
                {hasContent ? (
                    <div
                        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
                        role="alert"
                    >
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
                        {renderSummary()}
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500 italic">No context available</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Debug: Summary length: {summary?.length || 0}, Goals: {goals.length}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
