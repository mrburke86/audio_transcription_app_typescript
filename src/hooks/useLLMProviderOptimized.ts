// src/hooks/useLLMProviderOptimized.ts
"use client";

import { useState, useCallback, useReducer, useEffect, useRef } from "react";
import { logger } from "@/modules/Logger";
import type OpenAI from "openai";
import { Message } from "@/types/Message";
import { OpenAIModelName } from "@/types/openai-models";
import {
    usePerformance,
    ExtendedPerformanceEntry,
} from "@/contexts/PerformanceContext";
import { v4 as uuidv4 } from "uuid";
import { loglog } from "@/modules/log-log";
import { performanceTracker } from "@/modules/PerformanceTracker";
import { EnhancedPerformanceOperations } from "@/global";
import { useKnowledge } from "@/contexts/KnowledgeProvider";

const COMPONENT_ID = "useLLMProviderOptimized";

// Helper function to access enhanced performance tracker
const getEnhancedPerf = (): EnhancedPerformanceOperations | null => {
    if (typeof window !== "undefined" && !window.enhancedPerf) {
        // Initialize mock enhancedPerf if not present
        window.enhancedPerf = {
            trackMoveButtonClicked: () => console.log("🕵️ MOVE_BUTTON_CLICKED"),
            trackContextPreparationStart: () =>
                console.log("🕵️ CTX_PREP_START"),
            trackContextPreparationEnd: () => console.log("🕵️ CTX_PREP_END"),
            trackThreadOperationsStart: () =>
                console.log("🕵️ THREAD_OPS_START"),
            trackThreadCreated: () => console.log("🕵️ THREAD_CREATED"),
            trackMessageAdditionStart: () => console.log("🕵️ MSG_ADD_START"),
            trackMessageAdditionEnd: () => console.log("🕵️ MSG_ADD_END"),
            trackThreadOperationsEnd: () => console.log("🕵️ THREAD_OPS_END"),
            trackAssistantProcessingStart: () =>
                console.log("🕵️ ASSISTANT_PROCESSING_START"),
            trackFileSearchStart: () => console.log("🕵️ FILE_SEARCH_START"),
            trackFileSearchEnd: () => console.log("🕵️ FILE_SEARCH_END"),
            trackResponseGenerationStart: () =>
                console.log("🕵️ RESPONSE_GEN_START"),
            trackFirstChunkReceived: () =>
                console.log("🕵️ FIRST_CHUNK_RECEIVED"),
            trackAssistantProcessingEnd: () =>
                console.log("🕵️ ASSISTANT_PROCESSING_END"),
        };
        console.warn(
            "[useLLMProviderOptimized] Mocked window.enhancedPerf as it was not found.",
        );
    }
    return typeof window !== "undefined" ? window.enhancedPerf ?? null : null;
};

interface ConversationSuggestions {
    questions: string[];
    statements: string[];
}

interface LLMProviderHook {
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions;
}

interface LLMState {
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions;
}

type LLMAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "APPEND_STREAMED_CONTENT"; payload: string }
    | { type: "RESET_STREAMED_CONTENT" }
    | { type: "SET_STREAMING_COMPLETE"; payload: boolean }
    | { type: "SET_CONVERSATION_SUMMARY"; payload: string }
    | {
          type: "SET_CONVERSATION_SUGGESTIONS";
          payload: ConversationSuggestions;
      };

const initialState: LLMState = {
    isLoading: false,
    error: null,
    streamedContent: "",
    isStreamingComplete: false,
    conversationSummary: "",
    conversationSuggestions: {
        questions: [],
        statements: [],
    },
};

const reducer = (state: LLMState, action: LLMAction): LLMState => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "APPEND_STREAMED_CONTENT":
            return {
                ...state,
                streamedContent: state.streamedContent + action.payload,
            };
        case "RESET_STREAMED_CONTENT":
            return {
                ...state,
                streamedContent: "",
                isStreamingComplete: false,
            };
        case "SET_STREAMING_COMPLETE":
            return {
                ...state,
                isStreamingComplete: action.payload,
            };
        case "SET_CONVERSATION_SUMMARY":
            return {
                ...state,
                conversationSummary: action.payload,
            };
        case "SET_CONVERSATION_SUGGESTIONS":
            return {
                ...state,
                conversationSuggestions: action.payload,
            };
        default:
            return state;
    }
};

const useLLMProviderOptimized = (
    apiKey: string,
    roleDescription: string,
    conversationHistory: Message[],
    goals: string[],
): LLMProviderHook => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [openai, setOpenai] = useState<OpenAI | null>(null);

    // Use knowledge context for file access
    const {
        searchRelevantFiles,
        isLoading: knowledgeLoading,
        error: knowledgeError,
    } = useKnowledge();

    const streamedContentRef = useRef<string>("");
    const firstChunkReceivedRef = useRef<boolean>(false);
    const { addEntry } = usePerformance();

    const {
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    } = state;

    // Handle errors
    const handleError = useCallback(
        (
            errorInstance: unknown,
            queryId: string = "general",
            context: string = "generateResponse",
        ) => {
            let errorMessage = "An unexpected error occurred.";
            if (errorInstance instanceof Error) {
                const errorText = errorInstance.message.toLowerCase();
                if (errorText.includes("invalid_api_key"))
                    errorMessage = "Invalid API key.";
                else if (errorText.includes("rate_limit_exceeded"))
                    errorMessage = "Rate limit exceeded.";
                else if (errorText.includes("network"))
                    errorMessage = "Network error.";
                else errorMessage = errorInstance.message;

                logger.error(
                    `[${COMPONENT_ID}][${queryId}] ❌ Error in ${context}: ${errorMessage}`,
                );
                loglog.error(`Error in ${context}: ${errorMessage}`, queryId);
            } else {
                logger.error(
                    `[${COMPONENT_ID}][${queryId}] ❌ Unknown error in ${context}`,
                );
                loglog.error("Unknown error occurred.", queryId);
            }
            dispatch({ type: "SET_ERROR", payload: errorMessage });
            dispatch({ type: "SET_LOADING", payload: false });
        },
        [],
    );

    // Initialize OpenAI client
    const initializeOpenAI = useCallback(async () => {
        if (!apiKey) {
            logger.error(`[${COMPONENT_ID}] ❌ API key is missing...`);
            return;
        }

        try {
            performanceTracker.startTimer("openai_initialization", "system");
            const { default: OpenAIModule } = await import("openai");
            const client = new OpenAIModule({
                apiKey,
                dangerouslyAllowBrowser: true,
            });
            setOpenai(client);
            performanceTracker.endTimer("openai_initialization");
            logger.info(
                `[${COMPONENT_ID}] ✅ OpenAI client initialized successfully.`,
            );
        } catch (error) {
            performanceTracker.endTimer("openai_initialization");
            logger.error(
                `[${COMPONENT_ID}] ❌ Error initializing OpenAI client: ${
                    (error as Error).message
                }`,
            );
        }
    }, [apiKey]);

    useEffect(() => {
        initializeOpenAI();
    }, [initializeOpenAI]);

    // Build context from relevant knowledge files
    const buildKnowledgeContext = useCallback(
        (userMessage: string): string => {
            const enhancedPerf = getEnhancedPerf();
            enhancedPerf?.trackFileSearchStart();

            const startTime = performance.now();

            // Get relevant files based on user query
            const relevantFiles = searchRelevantFiles(userMessage, 5);

            if (relevantFiles.length === 0) {
                enhancedPerf?.trackFileSearchEnd();
                return "No specific knowledge context found for this query.";
            }

            // Build context string from relevant files
            const context = relevantFiles
                .map(
                    (file) =>
                        `**${file.name}**\n${file.content.substring(0, 2000)}${
                            file.content.length > 2000 ? "..." : ""
                        }`,
                )
                .join("\n\n---\n\n");

            const endTime = performance.now();
            enhancedPerf?.trackFileSearchEnd();

            logger.debug(
                `[${COMPONENT_ID}] 🔍 Built context from ${
                    relevantFiles.length
                } files in ${(endTime - startTime).toFixed(1)}ms`,
            );

            return context;
        },
        [searchRelevantFiles],
    );

    // Build the complete prompt for Chat Completions
    const buildPrompt = useCallback(
        (
            userMessage: string,
            knowledgeContext: string,
        ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
            const systemPrompt = `You are ${roleDescription}.

${
    goals.length > 0
        ? `Your current goals/objectives:\n${goals
              .map((goal) => `- ${goal}`)
              .join("\n")}\n\n`
        : ""
}

${
    conversationSummary
        ? `Previous conversation summary:\n${conversationSummary}\n\n`
        : ""
}

You have access to the following knowledge base about ETQ products and solutions:

${knowledgeContext}

Please provide helpful, accurate responses based on this knowledge while maintaining your role. Be specific and reference relevant ETQ products/features when appropriate.`;

            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
                [{ role: "system", content: systemPrompt }];

            // Add recent conversation history (last 5 exchanges to keep context manageable)
            const recentHistory = conversationHistory.slice(-10);
            recentHistory.forEach((msg) => {
                messages.push({
                    role: msg.type === "user" ? "user" : "assistant",
                    content: msg.content,
                });
            });

            // Add current user message
            messages.push({ role: "user", content: userMessage });

            return messages;
        },
        [roleDescription, goals, conversationSummary, conversationHistory],
    );

    // Main response generation function using Chat Completions API
    const generateResponse = useCallback(
        async (userMessage: string): Promise<void> => {
            if (knowledgeLoading) {
                dispatch({
                    type: "SET_ERROR",
                    payload: "Knowledge base is still loading. Please wait...",
                });
                return;
            }

            if (knowledgeError) {
                dispatch({
                    type: "SET_ERROR",
                    payload: `Knowledge base error: ${knowledgeError}`,
                });
                return;
            }

            const enhancedPerf = getEnhancedPerf();
            enhancedPerf?.trackMoveButtonClicked();

            const queryId = uuidv4();
            performanceTracker.logMilestone(
                `🚀 NEW OPTIMIZED REQUEST STARTED: ${queryId}`,
                "api",
            );
            performanceTracker.startTimer(`total_request_${queryId}`, "api");
            performanceTracker.startTimer(
                `request_preparation_${queryId}`,
                "api",
            );

            performance.mark("generateResponse_start");
            firstChunkReceivedRef.current = false;

            dispatch({ type: "SET_LOADING", payload: true });
            dispatch({ type: "SET_ERROR", payload: null });
            dispatch({ type: "RESET_STREAMED_CONTENT" });

            logger.info(
                `[${COMPONENT_ID}][${queryId}] 🚀 Starting optimized response generation`,
            );
            loglog.info("🚀 Starting optimized response generation", queryId);

            try {
                enhancedPerf?.trackContextPreparationStart();

                // Build knowledge context (this replaces the file search)
                const knowledgeContext = buildKnowledgeContext(userMessage);

                // Build complete prompt with context
                const messages = buildPrompt(userMessage, knowledgeContext);

                performanceTracker.endTimer(`request_preparation_${queryId}`);
                enhancedPerf?.trackContextPreparationEnd();

                if (!openai) throw new Error("OpenAI client not initialized");

                enhancedPerf?.trackAssistantProcessingStart();
                enhancedPerf?.trackResponseGenerationStart();
                performanceTracker.startTimer(
                    `chat_completion_${queryId}`,
                    "api",
                );

                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🎯 Starting Chat Completions stream`,
                );

                // Use Chat Completions API with streaming
                const stream = await openai.chat.completions.create({
                    model: "gpt-4o" as OpenAIModelName,
                    messages: messages,
                    stream: true,
                    max_tokens: 2000,
                    temperature: 0.7,
                });

                performanceTracker.logMilestone(
                    `Chat Completions stream started for ${queryId}`,
                    "api",
                );

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";

                    if (content) {
                        dispatch({
                            type: "APPEND_STREAMED_CONTENT",
                            payload: content,
                        });
                        streamedContentRef.current += content;

                        // Track first chunk
                        if (!firstChunkReceivedRef.current) {
                            enhancedPerf?.trackFirstChunkReceived();
                            performance.mark("generateResponse_firstChunk");
                            performance.measure(
                                `MoveToFirstChunk_duration_${queryId}`,
                                "generateResponse_start",
                                "generateResponse_firstChunk",
                            );

                            const measures = performance.getEntriesByName(
                                `MoveToFirstChunk_duration_${queryId}`,
                            );
                            if (measures.length > 0) {
                                const measure = measures[0];
                                const duration = measure.duration;

                                performanceTracker.logMilestone(
                                    `🎯 FIRST CHUNK RECEIVED in ${duration.toFixed(
                                        2,
                                    )}ms for ${queryId}`,
                                    "api",
                                );

                                logger.performance(
                                    `[${COMPONENT_ID}][${queryId}] Move to first chunk took ${duration.toFixed(
                                        2,
                                    )}ms`,
                                );
                                loglog.performance(
                                    `Move to first chunk took ${duration.toFixed(
                                        2,
                                    )}ms`,
                                    queryId,
                                );

                                const entry: ExtendedPerformanceEntry = {
                                    name: "MoveToFirstChunk",
                                    duration: duration,
                                    startTime: measure.startTime,
                                    endTime:
                                        measure.startTime + measure.duration,
                                    queryId,
                                };
                                addEntry(entry);
                            }
                            firstChunkReceivedRef.current = true;
                        }
                    }
                }

                // Stream completed
                enhancedPerf?.trackAssistantProcessingEnd();
                performanceTracker.endTimer(`chat_completion_${queryId}`);
                performanceTracker.endTimer(`total_request_${queryId}`);

                performance.mark("generateResponse_end");
                performance.measure(
                    `generateResponse_duration_${queryId}`,
                    "generateResponse_start",
                    "generateResponse_end",
                );

                const measures = performance.getEntriesByName(
                    `generateResponse_duration_${queryId}`,
                );
                if (measures.length > 0) {
                    const measure = measures[0];
                    const entry: ExtendedPerformanceEntry = {
                        name: "generateResponse",
                        duration: measure.duration,
                        startTime: measure.startTime,
                        endTime: measure.startTime + measure.duration,
                        queryId,
                    };
                    addEntry(entry);

                    performanceTracker.logFlowSummary(
                        `Optimized Request ${queryId}`,
                        [
                            `request_preparation_${queryId}`,
                            `chat_completion_${queryId}`,
                            `total_request_${queryId}`,
                        ],
                    );

                    logger.performance(
                        `[${COMPONENT_ID}][${queryId}] 🎉 generateResponse took ${measure.duration.toFixed(
                            2,
                        )}ms`,
                    );
                    loglog.performance(
                        `generateResponse took ${measure.duration.toFixed(
                            2,
                        )}ms`,
                        queryId,
                    );
                }

                dispatch({ type: "SET_STREAMING_COMPLETE", payload: true });
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🏁 Optimized response completed`,
                );
                loglog.info("Optimized response completed", queryId);
            } catch (err) {
                performanceTracker.endTimer(`total_request_${queryId}`);
                handleError(err, queryId);
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        },
        [
            openai,
            knowledgeLoading,
            knowledgeError,
            buildKnowledgeContext,
            buildPrompt,
            addEntry,
            handleError,
        ],
    );

    // Simplified suggestions generation (same pattern as main response)
    const generateSuggestions = useCallback(async (): Promise<void> => {
        if (!openai || knowledgeLoading) return;

        try {
            dispatch({ type: "SET_LOADING", payload: true });

            const conversationText = conversationHistory
                .map(
                    (msg) =>
                        `${msg.type === "user" ? "User" : "Assistant"}: ${
                            msg.content
                        }`,
                )
                .join("\n");

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini" as OpenAIModelName,
                messages: [
                    {
                        role: "system",
                        content: `Generate 3 relevant questions and 3 relevant statements based on the conversation. 
                        Return as JSON: {"questions": ["..."], "statements": ["..."]}`,
                    },
                    {
                        role: "user",
                        content: `Conversation:\n${conversationText}\n\nGoals: ${goals.join(
                            ", ",
                        )}`,
                    },
                ],
                max_tokens: 300,
                temperature: 0.7,
            });

            const content = response.choices[0]?.message.content?.trim() || "";

            try {
                const parsed = JSON.parse(content);
                dispatch({
                    type: "SET_CONVERSATION_SUGGESTIONS",
                    payload: {
                        questions: parsed.questions || [],
                        statements: parsed.statements || [],
                    },
                });
            } catch {
                // Fallback if JSON parsing fails
                dispatch({
                    type: "SET_CONVERSATION_SUGGESTIONS",
                    payload: { questions: [], statements: [] },
                });
            }
        } catch (err) {
            handleError(err, "suggestions", "generateSuggestions");
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, [openai, conversationHistory, goals, knowledgeLoading, handleError]);

    // Auto-summarization (simplified)
    const summarizeConversation = useCallback(
        async (history: Message[]): Promise<void> => {
            if (!openai || history.length < 5) return;

            try {
                const conversationText = history
                    .map(
                        (msg) =>
                            `${msg.type === "user" ? "User" : "Assistant"}: ${
                                msg.content
                            }`,
                    )
                    .join("\n");

                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini" as OpenAIModelName,
                    messages: [
                        {
                            role: "system",
                            content:
                                "Provide a concise summary of this conversation focusing on key points and decisions.",
                        },
                        { role: "user", content: conversationText },
                    ],
                    max_tokens: 150,
                    temperature: 0.5,
                });

                const summary =
                    response.choices[0]?.message.content?.trim() || "";
                dispatch({
                    type: "SET_CONVERSATION_SUMMARY",
                    payload: summary,
                });
            } catch (err) {
                logger.error(
                    `[${COMPONENT_ID}] ❌ Error summarizing: ${
                        (err as Error).message
                    }`,
                );
            }
        },
        [openai],
    );

    // Auto-summarization effect
    useEffect(() => {
        if (conversationHistory.length >= 10 && isStreamingComplete) {
            summarizeConversation(conversationHistory);
        }
    }, [conversationHistory, isStreamingComplete, summarizeConversation]);

    return {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    };
};

export default useLLMProviderOptimized;
