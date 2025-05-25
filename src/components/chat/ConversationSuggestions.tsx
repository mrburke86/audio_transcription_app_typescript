// src/components/chat/ConversationSuggestions.tsx - Analytics Version
import { Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '../ui';
import Skeleton from '../ui/skeleton';
import { logger } from '@/modules/Logger';

// If you need analytics, create a dedicated analytics service
interface AnalyticsEvent {
    action: string;
    category: string;
    label?: string;
    value?: number;
}

const analytics = {
    track: (event: AnalyticsEvent) => {
        // Only in production, send to your analytics service
        if (process.env.NODE_ENV === 'production') {
            // Send to analytics service (Google Analytics, Mixpanel, etc.)
            console.log('Analytics:', event);
        }
    },
};

interface ConversationSuggestionsProps {
    suggestions: {
        questions: string[];
        statements: string[];
    };
    onSuggest: () => void;
    isLoading: boolean;
}

interface Feedback {
    [key: string]: string;
}

const ConversationSuggestions: React.FC<ConversationSuggestionsProps> = ({ suggestions, onSuggest, isLoading }) => {
    const [feedback, setFeedback] = useState<Feedback>({});

    const handleFeedback = useCallback((category: 'questions' | 'statements', index: number, rating: string) => {
        const feedbackKey = `${category}-${index}`;
        setFeedback(prev => ({ ...prev, [feedbackKey]: rating }));

        // Track user feedback for analytics (not debugging)
        analytics.track({
            action: 'suggestion_feedback',
            category: 'conversation_suggestions',
            label: `${category}_${rating}`,
            value: index,
        });
    }, []);

    const handleSuggestClick = useCallback(() => {
        analytics.track({
            action: 'generate_suggestions',
            category: 'conversation_suggestions',
        });
        onSuggest();
    }, [onSuggest]);

    try {
        return (
            <div className="flex flex-col h-full p-4 rounded shadow" role="region" aria-labelledby="suggestions-heading">
                <div className="flex justify-between items-center mb-4">
                    <p id="suggestions-heading" className="font-bold text-xl">
                        Suggestions
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleSuggestClick}
                        disabled={isLoading}
                        className="flex items-center"
                        aria-label="Generate new suggestions"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? 'Generating...' : 'Suggest'}
                    </Button>
                </div>

                {isLoading ? (
                    <Skeleton count={6} className="h-6 bg-gray-200 rounded mb-2" />
                ) : (
                    <div className="flex flex-col space-y-6">
                        {/* Questions Section */}
                        {suggestions.questions.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg text-blue-500 mb-2">Questions</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {suggestions.questions.map((question, index) => (
                                        <li key={index} className="p-1 rounded text-ring">
                                            {question}
                                            <select
                                                value={feedback[`questions-${index}`] || ''}
                                                onChange={e => handleFeedback('questions', index, e.target.value)}
                                                className="ml-4 border border-gray-300 rounded p-1"
                                                aria-label={`Feedback for question ${index + 1}`}
                                            >
                                                <option value="">Rate</option>
                                                <option value="good">Good</option>
                                                <option value="neutral">Neutral</option>
                                                <option value="bad">Bad</option>
                                            </select>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Statements Section */}
                        {suggestions.statements.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg text-blue-500 mb-2">Statements</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {suggestions.statements.map((statement, index) => (
                                        <li key={index} className="p-1 rounded text-ring">
                                            {statement}
                                            <select
                                                value={feedback[`statements-${index}`] || ''}
                                                onChange={e => handleFeedback('statements', index, e.target.value)}
                                                className="ml-4 border border-gray-300 rounded p-1"
                                                aria-label={`Feedback for statement ${index + 1}`}
                                            >
                                                <option value="">Rate</option>
                                                <option value="good">Good</option>
                                                <option value="neutral">Neutral</option>
                                                <option value="bad">Bad</option>
                                            </select>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {suggestions.questions.length === 0 && suggestions.statements.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No suggestions available</p>
                                <p className="text-sm">Click &quot;Suggest&quot; to generate conversation ideas</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    } catch (error) {
        logger.error(`ConversationSuggestions render error: ${error instanceof Error ? error.message : 'Unknown error'}`);

        return (
            <div className="flex flex-col h-full p-4 rounded shadow bg-red-50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-red-600 text-center">
                        <p className="font-semibold">Suggestions error</p>
                        <p className="text-sm">Unable to display conversation suggestions</p>
                    </div>
                </div>
            </div>
        );
    }
};

export default ConversationSuggestions;
