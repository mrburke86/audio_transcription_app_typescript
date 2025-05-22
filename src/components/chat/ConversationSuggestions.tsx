// src/components/chat/ConversationSuggestions.tsx

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui";
import Skeleton from "../ui/skeleton";
import { logger } from "@/modules/Logger";

interface ConversationSuggestionsProps {
    suggestions: {
        questions: string[];
        statements: string[];
    };
    onSuggest: () => void;
    isLoading: boolean;
}

interface Feedback {
    [key: string]: string; // e.g., "questions-0": "good"
}

const ConversationSuggestions: React.FC<ConversationSuggestionsProps> = ({
    suggestions,
    onSuggest,
    isLoading,
}) => {
    const [feedback, setFeedback] = useState<Feedback>({});

    // Component initialization logging
    useEffect(() => {
        try {
            logger.info("💡 ConversationSuggestions component mounted");
            logger.debug(
                `📊 Initial suggestions count - Questions: ${suggestions.questions.length}, Statements: ${suggestions.statements.length}`,
            );
        } catch (error) {
            logger.error(
                `❌ Error during ConversationSuggestions mount: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }

        return () => {
            try {
                logger.info("🧹 ConversationSuggestions component unmounting");
            } catch (error) {
                logger.error(
                    `❌ Error during ConversationSuggestions cleanup: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
            }
        };
    }, [
        suggestions,
        suggestions.questions.length,
        suggestions.statements.length,
    ]);

    // Suggestions change logging
    useEffect(() => {
        try {
            const totalSuggestions =
                suggestions.questions.length + suggestions.statements.length;

            if (totalSuggestions > 0) {
                logger.info(
                    `📝 Suggestions updated - Questions: ${suggestions.questions.length}, Statements: ${suggestions.statements.length}`,
                );
                logger.debug(
                    `📋 Question suggestions: ${JSON.stringify(
                        suggestions.questions,
                    )}`,
                );
                logger.debug(
                    `📋 Statement suggestions: ${JSON.stringify(
                        suggestions.statements,
                    )}`,
                );
            } else {
                logger.debug("📭 No suggestions available");
            }
        } catch (error) {
            logger.error(
                `❌ Error logging suggestion changes: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [
        suggestions,
        suggestions.questions.length,
        suggestions.statements.length,
    ]);

    // Loading state logging
    useEffect(() => {
        if (isLoading) {
            logger.info("⏳ Suggestions generation started");
        } else {
            logger.info("✅ Suggestions generation completed");
        }
    }, [isLoading]);

    const handleFeedback = (
        category: "questions" | "statements",
        index: number,
        rating: string,
    ) => {
        try {
            const feedbackKey = `${category}-${index}`;
            const suggestionText =
                category === "questions"
                    ? suggestions.questions[index]
                    : suggestions.statements[index];

            logger.info(
                `👍 User feedback recorded: ${rating} for ${category} ${
                    index + 1
                }`,
            );
            logger.debug(
                `📝 Feedback details: "${suggestionText}" rated as "${rating}"`,
            );

            setFeedback((prev) => ({ ...prev, [feedbackKey]: rating }));

            // TODO: Send feedback to backend for analysis
            // This could be enhanced to actually send feedback to your analytics system
        } catch (error) {
            logger.error(
                `❌ Error handling feedback: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    const handleSuggestClick = () => {
        try {
            logger.info("🎯 User requested new suggestions");
            onSuggest();
        } catch (error) {
            logger.error(
                `❌ Error handling suggest click: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    try {
        return (
            <div
                className="flex flex-col h-full p-4 rounded shadow"
                role="region"
                aria-labelledby="suggestions-heading"
            >
                {/* Header with Title and Suggest Button */}
                <div className="flex justify-between items-center mb-4">
                    <p id="suggestions-heading" className="font-bold text-xl ">
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
                        {isLoading ? "Generating..." : "Suggest"}
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    (() => {
                        logger.debug(
                            "🔄 Rendering loading skeleton for suggestions",
                        );
                        return (
                            <Skeleton
                                count={6}
                                className="h-6 bg-gray-200 rounded mb-2"
                            />
                        );
                    })()
                ) : (
                    // Suggestions List
                    <div className="flex flex-col space-y-6">
                        {/* Questions Section */}
                        {suggestions.questions.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg text-blue-500 mb-2">
                                    Questions
                                </h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {suggestions.questions.map(
                                        (question, index) => {
                                            try {
                                                return (
                                                    <li
                                                        key={index}
                                                        className="p-1 rounded text-ring"
                                                    >
                                                        {question}
                                                        {/* Feedback Dropdown */}
                                                        <select
                                                            value={
                                                                feedback[
                                                                    `questions-${index}`
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                handleFeedback(
                                                                    "questions",
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="ml-4 border border-gray-300 rounded p-1"
                                                            aria-label={`Feedback for question ${
                                                                index + 1
                                                            }`}
                                                        >
                                                            <option value="">
                                                                Rate
                                                            </option>
                                                            <option value="good">
                                                                Good
                                                            </option>
                                                            <option value="neutral">
                                                                Neutral
                                                            </option>
                                                            <option value="bad">
                                                                Bad
                                                            </option>
                                                        </select>
                                                    </li>
                                                );
                                            } catch (error) {
                                                logger.error(
                                                    `❌ Error rendering question ${index}: ${
                                                        error instanceof Error
                                                            ? error.message
                                                            : "Unknown error"
                                                    }`,
                                                );
                                                return (
                                                    <li
                                                        key={index}
                                                        className="p-1 rounded text-red-500"
                                                    >
                                                        Error displaying
                                                        suggestion
                                                    </li>
                                                );
                                            }
                                        },
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Statements Section */}
                        {suggestions.statements.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg text-blue-500 mb-2">
                                    Statements
                                </h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {suggestions.statements.map(
                                        (statement, index) => {
                                            try {
                                                return (
                                                    <li
                                                        key={index}
                                                        className="p-1 rounded text-ring"
                                                    >
                                                        {statement}
                                                        {/* Feedback Dropdown */}
                                                        <select
                                                            value={
                                                                feedback[
                                                                    `statements-${index}`
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                handleFeedback(
                                                                    "statements",
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="ml-4 border border-gray-300 rounded p-1"
                                                            aria-label={`Feedback for statement ${
                                                                index + 1
                                                            }`}
                                                        >
                                                            <option value="">
                                                                Rate
                                                            </option>
                                                            <option value="good">
                                                                Good
                                                            </option>
                                                            <option value="neutral">
                                                                Neutral
                                                            </option>
                                                            <option value="bad">
                                                                Bad
                                                            </option>
                                                        </select>
                                                    </li>
                                                );
                                            } catch (error) {
                                                logger.error(
                                                    `❌ Error rendering statement ${index}: ${
                                                        error instanceof Error
                                                            ? error.message
                                                            : "Unknown error"
                                                    }`,
                                                );
                                                return (
                                                    <li
                                                        key={index}
                                                        className="p-1 rounded text-red-500"
                                                    >
                                                        Error displaying
                                                        suggestion
                                                    </li>
                                                );
                                            }
                                        },
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Empty state */}
                        {suggestions.questions.length === 0 &&
                            suggestions.statements.length === 0 &&
                            !isLoading && (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>No suggestions available</p>
                                    <p className="text-sm">
                                        Click &quot;Suggest&quot; to generate
                                        conversation ideas
                                    </p>
                                </div>
                            )}
                    </div>
                )}
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering ConversationSuggestions: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div className="flex flex-col h-full p-4 rounded shadow bg-red-50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-red-600 text-center">
                        <p className="font-semibold">Suggestions error</p>
                        <p className="text-sm">
                            Unable to display conversation suggestions
                        </p>
                    </div>
                </div>
            </div>
        );
    }
};

export default ConversationSuggestions;
