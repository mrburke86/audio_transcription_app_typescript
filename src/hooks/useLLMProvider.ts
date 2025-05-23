// src/hooks/useLLMProvider.ts

"use client";
import { useState, useCallback, useReducer, useEffect, useRef } from "react";
import { logger } from "@/modules/Logger";
import { createUserMessage } from "@/utils/createUserMessage";
import type OpenAI from "openai";
import { Message } from "@/types/Message";
import { OpenAIModelName } from "@/types/openai-models";
import {
    usePerformance,
    ExtendedPerformanceEntry,
} from "@/contexts/PerformanceContext";
import { v4 as uuidv4 } from "uuid";
import { loglog } from "@/modules/log-log";
import { performanceTracker, measureAPI } from "@/modules/PerformanceTracker";
import { EnhancedPerformanceOperations } from "@/global";

const COMPONENT_ID = "useLLMProvider";

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
            "[useLLMProvider] Mocked window.enhancedPerf as it was not found. Ensure it's properly initialized for real tracking.",
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

const useLLMProvider = (
    apiKey: string,
    assistantId: string,
    roleDescription: string,
    conversationHistory: Message[],
    goals: string[],
): LLMProviderHook => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [openai, setOpenai] = useState<OpenAI | null>(null);

    const {
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    } = state;

    const streamedContentRef = useRef<string>("");
    const firstChunkReceivedRef = useRef<boolean>(false);

    const { addEntry } = usePerformance();

    // handleError needs to be defined or properly scoped if used within Callbacks.
    // If it's a method of the hook, it doesn't need to be in dependency arrays of useCallbacks
    // unless its own definition changes.
    const handleError = useCallback(
        (
            errorInstance: unknown, // Renamed for clarity
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
            // It's often good practice to also ensure loading is false here
            dispatch({ type: "SET_LOADING", payload: false });
        },
        [
            /* dispatch, logger, loglog should be stable */
        ],
    );

    // Add handleError to dependency arrays of generateResponse and runThread if they use it
    // And if handleError itself is memoized with useCallback and has its own dependencies.
    // For runThread, since it's defined inside the hook, it implicitly captures handleError
    // from the hook's scope. If handleError was passed as a prop, it would be different.

    const openaiInitializationStateRef = useRef<"idle" | "pending" | "done">(
        "idle",
    );

    const initializeOpenAI = useCallback(async () => {
        if (!apiKey) {
            logger.error("[useLLMProvider] ❌ API key is missing...");
            return;
        }
        if (openaiInitializationStateRef.current !== "idle") {
            logger.info(
                `[useLLMProvider] OpenAI initialization already ${openaiInitializationStateRef.current}. Skipping.`,
            );
            return;
        }

        openaiInitializationStateRef.current = "pending";
        let timerStarted = false; // Flag to ensure endTimer is only called if startTimer was.
        try {
            performanceTracker.startTimer("openai_initialization", "system");
            timerStarted = true;
            const { default: OpenAIModule } = await import("openai");
            const client = new OpenAIModule({
                apiKey,
                dangerouslyAllowBrowser: true,
            });
            setOpenai(client);
            performanceTracker.endTimer("openai_initialization");
            openaiInitializationStateRef.current = "done";
            logger.info(
                `[${COMPONENT_ID}] ✅ OpenAI client initialized successfully.`,
            );
        } catch (error) {
            if (timerStarted) {
                performanceTracker.endTimer("openai_initialization");
            }
            openaiInitializationStateRef.current = "idle"; // Allow retry on error
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

    const runThread = useCallback(
        async (
            openaiClient: OpenAI, // Renamed to avoid conflict with state `openai`
            formattedMessage: string,
            currentAssistantId: string, // Renamed to avoid conflict
            queryId: string,
        ): Promise<void> => {
            const enhancedPerf = getEnhancedPerf();
            enhancedPerf?.trackThreadOperationsStart();

            performanceTracker.logMilestone(
                `Starting thread run for query ${queryId}`,
                "api",
            );
            performanceTracker.startTimer(`thread_creation_${queryId}`, "api");

            logger.info(
                `[${COMPONENT_ID}][${queryId}] 🏃‍♂️ Starting thread run with streaming...`,
            );

            const thread = await openaiClient.beta.threads.create();
            performanceTracker.endTimer(`thread_creation_${queryId}`, {
                threadId: thread.id,
            });
            enhancedPerf?.trackThreadCreated();
            logger.debug(
                `[${COMPONENT_ID}][${queryId}] 🧵 Thread created with ID: ${thread.id}`,
            );

            enhancedPerf?.trackMessageAdditionStart();
            performanceTracker.startTimer(`message_addition_${queryId}`, "api");
            await openaiClient.beta.threads.messages.create(thread.id, {
                role: "user",
                content: formattedMessage,
            });
            performanceTracker.endTimer(`message_addition_${queryId}`);
            enhancedPerf?.trackMessageAdditionEnd();

            // **NEW**: Explicitly mark end of thread operations
            enhancedPerf?.trackThreadOperationsEnd();

            logger.debug(
                `[${COMPONENT_ID}][${queryId}] 💬 User message added to thread`,
            );

            enhancedPerf?.trackAssistantProcessingStart();
            performanceTracker.startTimer(
                `assistant_streaming_${queryId}`,
                "api",
            );
            const run = openaiClient.beta.threads.runs.stream(thread.id, {
                assistant_id: currentAssistantId,
            });

            run.on("textCreated", () => {
                // **NEW**: Track when the assistant starts generating response structure
                enhancedPerf?.trackResponseGenerationStart();

                performanceTracker.logMilestone(
                    `Assistant started responding to ${queryId}`,
                    "api",
                );
                logger.info(`[${COMPONENT_ID}][${queryId}] assistant >`);
            })
                .on("textDelta", (textDelta) => {
                    const content = textDelta.value ?? "";
                    dispatch({
                        type: "APPEND_STREAMED_CONTENT",
                        payload: content,
                    });
                    streamedContentRef.current += content;

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
                            measureAPI.firstChunk();
                            performanceTracker.logMilestone(
                                `🎯 FIRST CHUNK RECEIVED in ${duration.toFixed(
                                    2,
                                )}ms for ${queryId}`,
                                "api",
                            );
                            console.log(
                                `[${COMPONENT_ID}][${queryId}] Move to first chunk took ${duration.toFixed(
                                    2,
                                )}ms`,
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
                                endTime: measure.startTime + measure.duration,
                                queryId,
                            };
                            addEntry(entry);
                        }
                        firstChunkReceivedRef.current = true;
                    }
                })
                .on("toolCallCreated", (toolCall) => {
                    if (toolCall.type === "file_search") {
                        const currentEnhancedPerf = getEnhancedPerf(); // get fresh instance in case of async context
                        currentEnhancedPerf?.trackFileSearchStart();
                    }
                    logger.info(
                        `[${COMPONENT_ID}][${queryId}] assistant > ${toolCall.type}\n\n`,
                    );
                })
                .on("toolCallDelta", (toolCallDelta) => {
                    if (
                        toolCallDelta.type === "code_interpreter" &&
                        toolCallDelta.code_interpreter
                    ) {
                        if (toolCallDelta.code_interpreter.input) {
                            logger.info(
                                `[${COMPONENT_ID}][${queryId}] Code input: ${toolCallDelta.code_interpreter.input}`,
                            );
                            loglog.info(
                                `Code input: ${toolCallDelta.code_interpreter.input}`,
                                queryId,
                            );
                        }
                        if (toolCallDelta.code_interpreter.outputs) {
                            logger.info(
                                `[${COMPONENT_ID}][${queryId}] Code output:`,
                            );
                            loglog.info(`Code output:`, queryId);
                            toolCallDelta.code_interpreter.outputs.forEach(
                                (output) => {
                                    if (output.type === "logs") {
                                        logger.info(
                                            `[${COMPONENT_ID}][${queryId}] ${output.logs}`,
                                        );
                                        loglog.info(`${output.logs}`, queryId);
                                    }
                                },
                            );
                        }
                    }
                })
                .on("toolCallDone", (toolCall) => {
                    if (toolCall.type === "file_search") {
                        const currentEnhancedPerf = getEnhancedPerf(); // get fresh instance
                        currentEnhancedPerf?.trackFileSearchEnd();
                    }
                });

            run.on("messageDone", () => {
                const currentEnhancedPerf = getEnhancedPerf();
                currentEnhancedPerf?.trackAssistantProcessingEnd();
                performanceTracker.endTimer(`assistant_streaming_${queryId}`);
                performanceTracker.logMilestone(
                    `Streaming completed for ${queryId}`,
                    "api",
                );
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🏁 Response streaming completed.`,
                );
                loglog.info("Response streaming completed.", queryId);
                dispatch({
                    type: "SET_STREAMING_COMPLETE",
                    payload: true,
                });
                console.log(
                    `[${queryId}] Complete Response:`,
                    streamedContentRef.current,
                );
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] Complete Response: ${streamedContentRef.current}`,
                );
                loglog.info(
                    `Complete Response: ${streamedContentRef.current}`,
                    queryId,
                );
            }).on("error", (err) => {
                // Renamed 'error' to 'err' to avoid conflict
                performanceTracker.endTimer(`assistant_streaming_${queryId}`);
                handleError(err, queryId);
            });

            await new Promise<void>((resolve, reject) => {
                run.on("end", resolve);
                run.on("error", reject); // Ensure this reject is also handled
            });
        },
        [addEntry, handleError],
    );

    const generateResponse = useCallback(
        async (userMessage: string): Promise<void> => {
            const enhancedPerf = getEnhancedPerf();
            // **NEW**: Track the "Move" button click equivalent
            enhancedPerf?.trackMoveButtonClicked();

            const queryId = uuidv4();
            performanceTracker.logMilestone(
                `🚀 NEW REQUEST STARTED: ${queryId}`,
                "api",
            );
            performanceTracker.startTimer(`total_request_${queryId}`, "api");
            performanceTracker.startTimer(
                `request_preparation_${queryId}`,
                "api",
            );
            measureAPI.startRequest();
            performance.mark("generateResponse_start");
            firstChunkReceivedRef.current = false;

            dispatch({ type: "SET_LOADING", payload: true });
            dispatch({ type: "SET_ERROR", payload: null });
            dispatch({ type: "RESET_STREAMED_CONTENT" });

            logger.info(
                `[${COMPONENT_ID}][${queryId}] 🚀 Starting response generation process`,
            );
            loglog.info("🚀 Starting response generation process", queryId);

            try {
                enhancedPerf?.trackContextPreparationStart();
                performanceTracker.startTimer(
                    `message_formatting_${queryId}`,
                    "system",
                );
                const formattedMessage = await createUserMessage(
                    userMessage,
                    roleDescription,
                    state.conversationSummary,
                    goals,
                );
                performanceTracker.endTimer(`message_formatting_${queryId}`);
                performanceTracker.endTimer(`request_preparation_${queryId}`);
                enhancedPerf?.trackContextPreparationEnd();

                console.log(`[${queryId}] Created User Message:`, userMessage);
                loglog.debug(`Created User Message: ${userMessage}`, queryId);
                logger.debug(
                    `[${COMPONENT_ID}][${queryId}] 📝 Formatted user message: "${formattedMessage.substring(
                        0,
                        50,
                    )}..."`, // substring for brevity
                );
                loglog.debug(
                    `Formatted user message: "${formattedMessage.substring(
                        0,
                        50,
                    )}..."`,
                    queryId,
                );

                if (!openai) throw new Error("OpenAI client not initialized");

                await runThread(openai, formattedMessage, assistantId, queryId);

                performanceTracker.endTimer(`total_request_${queryId}`);
                measureAPI.endStreaming();
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
                    performanceTracker.logFlowSummary(`Request ${queryId}`, [
                        `request_preparation_${queryId}`,
                        `message_formatting_${queryId}`,
                        `thread_creation_${queryId}`,
                        `message_addition_${queryId}`,
                        `assistant_streaming_${queryId}`,
                        `total_request_${queryId}`,
                    ]);
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
            } catch (err) {
                // Renamed 'error' to 'err' to avoid conflict
                performanceTracker.endTimer(`total_request_${queryId}`);
                measureAPI.endStreaming();
                handleError(err, queryId); // handleError should be defined or passed if not in scope
                dispatch({ type: "SET_LOADING", payload: false });
                // Do not re-throw here if handleError already manages the error state for the UI
                // throw err; // Re-throwing might be needed if calling code expects to catch it
            } finally {
                // Ensure loading is set to false if not handled by error path specifically
                // This might be redundant if all paths (success/error) set it.
                // dispatch({ type: "SET_LOADING", payload: false }); // Consider if this is needed
            }
        },
        [
            roleDescription,
            openai,
            runThread,
            assistantId,
            state.conversationSummary,
            goals,
            addEntry,
            handleError,
        ],
    );

    const summarizationInProgressRef = useRef(false);
    const summarizeConversation = useCallback(
        async (history: Message[]): Promise<void> => {
            if (summarizationInProgressRef.current) return;
            if (!openai) {
                logger.error(
                    `[${COMPONENT_ID}] ❌ OpenAI client not initialized. Cannot summarize.`,
                );
                return;
            }
            summarizationInProgressRef.current = true;
            const conversationText = history
                .map(
                    (msg) =>
                        `${msg.type === "user" ? "User" : "Assistant"}: ${
                            msg.content
                        }`,
                )
                .join("\n");
            const goalsText =
                goals.length > 0 ? goals.join("; ") : "No specific goals set.";
            const summaryPrompt = `
                    You are an AI assistant trained to follow user-defined goals and milestones during conversations.
                    
                    Goals/Milestones:
                    ${goalsText}
                    
                    Please provide a concise summary of the following conversation. Focus on key points, decisions, and topics discussed that align with the above goals/milestones.
                    
                    Conversation:
                    ${conversationText}
                    
                    Summary:
                `;
            try {
                dispatch({ type: "SET_LOADING", payload: true }); // Consider separate loading state for summary
                const modelName: OpenAIModelName = "gpt-4o-mini";
                const response = await openai.chat.completions.create({
                    model: modelName,
                    messages: [
                        { role: "system", content: summaryPrompt },
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
                logger.info(
                    `[${COMPONENT_ID}] 📝 Conversation summarized successfully.`,
                );
            } catch (err) {
                logger.error(
                    `[${COMPONENT_ID}] ❌ Error summarizing: ${
                        (err as Error).message
                    }`,
                );
                dispatch({
                    type: "SET_ERROR",
                    payload: "Failed to summarize.",
                });
            } finally {
                summarizationInProgressRef.current = false;
                dispatch({ type: "SET_LOADING", payload: false }); // Reset main loading state
            }
        },
        [
            openai,
            goals /* dispatch, logger should be stable if defined outside */,
        ],
    );

    const suggestionsInProgressRef = useRef(false);
    const generateSuggestions = useCallback(async (): Promise<void> => {
        if (suggestionsInProgressRef.current) return;
        if (!openai) {
            logger.error(
                `[${COMPONENT_ID}] ❌ OpenAI client not initialized. Cannot gen suggestions.`,
            );
            return;
        }
        suggestionsInProgressRef.current = true;
        // ... (rest of generateSuggestions implementation remains the same)
        // Ensure to handle loading and error states appropriately, potentially with dedicated state flags
        // if you don't want it to affect the main isLoading/error states.
        const conversationText = conversationHistory
            .map(
                (msg) =>
                    `${msg.type === "user" ? "User" : "Assistant"}: ${
                        msg.content
                    }`,
            )
            .join("\n");
        const goalsText =
            goals.length > 0 ? goals.join("; ") : "No specific goals set.";
        const suggestionsPrompt = `You are an AI Call Assistant...Goals:\n${goalsText}\nConversation Summary:\n${state.conversationSummary}\nConversation:\n${conversationText}\nSuggestions: ... Format Example: ...`; // Abridged

        try {
            dispatch({ type: "SET_LOADING", payload: true }); // Consider separate loading state
            const modelName: OpenAIModelName = "o1-mini"; // Note: "o1-mini" may not be a standard OpenAI model name. Verify.

            const response = await openai.chat.completions.create({
                model: modelName,
                messages: [{ role: "user", content: suggestionsPrompt }],
            });
            const suggestionsContent =
                response.choices[0]?.message.content?.trim() || "";
            let questions: string[] = [];
            let statements: string[] = [];

            // ... (parsing logic remains the same)
            try {
                const parsedSuggestions = JSON.parse(suggestionsContent);
                if (
                    /* validation logic */
                    typeof parsedSuggestions === "object" &&
                    Array.isArray(parsedSuggestions.questions) &&
                    Array.isArray(parsedSuggestions.statements) &&
                    parsedSuggestions.questions.length <= 3 && // Allow fewer than 3
                    parsedSuggestions.statements.length <= 3 // Allow fewer than 3
                ) {
                    questions = parsedSuggestions.questions;
                    statements = parsedSuggestions.statements;
                } else {
                    throw new Error("Parsed suggestions structure mismatch.");
                }
            } catch (parseError) {
                logger.error(
                    `[${COMPONENT_ID}] ❌ Error parsing suggestions JSON: ${
                        (parseError as Error).message
                    }`,
                );
                // Fallback parsing logic...
                const lines = suggestionsContent.split(/\n+/);
                questions = [];
                statements = [];
                lines.forEach((line) => {
                    const trimmedLine = line.replace(/^[\-\*]\s*/, "").trim();
                    if (
                        trimmedLine.endsWith("?") ||
                        [
                            "Can",
                            "Could",
                            "How",
                            "What",
                            "Why",
                            "When",
                            "Who",
                        ].some((q) => trimmedLine.startsWith(q))
                    ) {
                        if (questions.length < 3) questions.push(trimmedLine);
                    } else if (trimmedLine) {
                        if (statements.length < 3) statements.push(trimmedLine);
                    }
                });
            }

            dispatch({
                type: "SET_CONVERSATION_SUGGESTIONS",
                payload: { questions, statements },
            });
            logger.info(
                `[${COMPONENT_ID}] 💡 Suggestions generated successfully.`,
            );
        } catch (err) {
            logger.error(
                `[${COMPONENT_ID}] ❌ Error generating suggestions: ${
                    (err as Error).message
                }`,
            );
            dispatch({
                type: "SET_ERROR",
                payload: "Failed to generate suggestions.",
            });
        } finally {
            suggestionsInProgressRef.current = false;
            dispatch({ type: "SET_LOADING", payload: false }); // Reset main loading state
        }
    }, [
        openai,
        goals,
        state.conversationSummary,
        conversationHistory /* dispatch, logger */,
    ]);

    useEffect(() => {
        const shouldSummarize =
            conversationHistory.length >= 10 ||
            (conversationHistory.length > 0 && isStreamingComplete);
        if (shouldSummarize && openai) {
            // Added openai check
            (async () => {
                await summarizeConversation(conversationHistory);
            })();
        }
    }, [
        conversationHistory,
        isStreamingComplete,
        summarizeConversation,
        openai,
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (conversationHistory.length > 0 && openai) {
                // Added openai check
                summarizeConversation(conversationHistory);
            }
        }, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [
        conversationHistory,
        summarizeConversation,
        openai /* generateSuggestions - removed as it's not called here */,
    ]);

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

export default useLLMProvider;
