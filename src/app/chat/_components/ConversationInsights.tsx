//
'use client';

import { Sparkles } from 'lucide-react';
import type React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';

interface ConversationInsightsProps {
    suggestions: {
        questions: string[];
        statements: string[];
    };
    onSuggest: () => void;
    isLoading: boolean;
}

export const ConversationInsights: React.FC<ConversationInsightsProps> = ({ suggestions, onSuggest, isLoading }) => {
    return (
        <Card className="h-full flex flex-col overscroll-contain">
            {/* Header */}
            <CardHeader className="p-4 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 p-0">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                        </div>

                        <h3 className="text-sm font-medium text-gray-900">AI Insights</h3>
                    </CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onSuggest}
                        disabled={isLoading}
                        className="border-slate-300 text-slate-600"
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {isLoading ? 'Generating...' : 'Suggest'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto hide-scrollbar p-4 pt-0">
                {isLoading ? (
                    <Skeleton count={6} className="h-6 bg-gray-200 rounded mb-2" />
                ) : (
                    // Suggestions List
                    <div className="flex flex-col space-y-6">
                        {/* Questions Section */}
                        {suggestions.questions.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg text-blue-500  mb-2">Questions</h3>
                                <ul className="list-disc list-inside space-y-2 ">
                                    {suggestions.questions.map((question, index) => (
                                        <li key={index} className="p-1 rounded text-ring">
                                            {question}
                                            {/* Feedback Dropdown */}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Statements Section */}
                        {suggestions.statements.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg text-blue-500  mb-2">Statements</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {suggestions.statements.map((statement, index) => (
                                        <li key={index} className="p-1 rounded text-ring">
                                            {statement}
                                            {/* Feedback Dropdown */}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
