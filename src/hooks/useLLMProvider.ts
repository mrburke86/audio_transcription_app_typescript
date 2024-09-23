// src/hooks/useLLMProvider.ts

"use client";
import { useState, useCallback, useReducer, useEffect, useRef } from "react";
import { logger } from "@/modules/Logger";
import { createUserMessage } from "@/utils/createUserMessage";
import type OpenAI from "openai";
import { Message } from "@/types/Message";

const COMPONENT_ID = "useLLMProvider";

interface LLMProviderHook {
    generateResponse: (userMessage: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean; // Ensure this is returned from the hook
    conversationSummary: string; // New state variable for summary
}

interface LLMState {
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean; // New state property
    conversationSummary: string; // New state property
}

type LLMAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "APPEND_STREAMED_CONTENT"; payload: string }
    | { type: "RESET_STREAMED_CONTENT" }
    | { type: "SET_STREAMING_COMPLETE"; payload: boolean }
    | { type: "SET_CONVERSATION_SUMMARY"; payload: string }; // New action

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
                isStreamingComplete: false, // Reset when content is reset
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
        default:
            return state;
    }
};

const useLLMProvider = (
    apiKey: string,
    assistantId: string,
    roleDescription: string,
    conversationHistory: Message[], // New parameter
    goals: string[], // New parameter
): LLMProviderHook => {
    const [state, dispatch] = useReducer(reducer, {
        isLoading: false,
        error: null,
        streamedContent: "",
        isStreamingComplete: false,
        conversationSummary: "", // Initialize summary
    });
    const {
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
    } = state;

    const [openai, setOpenai] = useState<OpenAI | null>(null);

    const streamedContentRef = useRef<string>("");

    const initializeOpenAI = useCallback(async () => {
        if (!apiKey) {
            logger.error(
                `[${COMPONENT_ID}] ❌ API key is missing. OpenAI client initialization skipped.`,
            );
            return;
        }

        try {
            const { default: OpenAIModule } = await import("openai");
            const client = new OpenAIModule({
                apiKey,
                dangerouslyAllowBrowser: true,
            });
            setOpenai(client);
            logger.info(
                `[${COMPONENT_ID}] ✅ OpenAI client initialized successfully.`,
            );
        } catch (error) {
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
            openai: OpenAI,
            formattedMessage: string,
            assistantId: string,
        ): Promise<void> => {
            logger.info(
                `[${COMPONENT_ID}] 🏃‍♂️ Starting thread run with streaming...`,
            );

            const thread = await openai.beta.threads.create();
            logger.debug(
                `[${COMPONENT_ID}] 🧵 Thread created with ID: ${thread.id}`,
            );

            await openai.beta.threads.messages.create(thread.id, {
                role: "user",
                content: formattedMessage,
            });
            logger.debug(`[${COMPONENT_ID}] 💬 User message added to thread`);

            const run = openai.beta.threads.runs.stream(thread.id, {
                assistant_id: assistantId,
            });

            run.on("textCreated", () =>
                logger.info(`[${COMPONENT_ID}] assistant >`),
            )
                .on("textDelta", (textDelta) => {
                    const content = textDelta.value ?? "";
                    dispatch({
                        type: "APPEND_STREAMED_CONTENT",
                        payload: content,
                    });
                    streamedContentRef.current += content; // Also append to the ref
                })
                .on("toolCallCreated", (toolCall) =>
                    logger.info(
                        `[${COMPONENT_ID}] assistant > ${toolCall.type}\n\n`,
                    ),
                )
                .on("toolCallDelta", (toolCallDelta) => {
                    if (
                        toolCallDelta.type === "code_interpreter" &&
                        toolCallDelta.code_interpreter
                    ) {
                        if (toolCallDelta.code_interpreter.input) {
                            logger.info(
                                `[${COMPONENT_ID}] Code input: ${toolCallDelta.code_interpreter.input}`,
                            );
                        }
                        if (toolCallDelta.code_interpreter.outputs) {
                            logger.info(`[${COMPONENT_ID}] Code output:`);
                            toolCallDelta.code_interpreter.outputs.forEach(
                                (output) => {
                                    if (output.type === "logs") {
                                        logger.info(
                                            `[${COMPONENT_ID}] ${output.logs}`,
                                        );
                                    }
                                },
                            );
                        }
                    }
                });
            run.on("messageDone", () => {
                logger.info(
                    `[${COMPONENT_ID}] 🏁 Response streaming completed.`,
                );
                dispatch({
                    type: "SET_STREAMING_COMPLETE",
                    payload: true,
                });

                // Log the complete response from the ref
                console.log("Complete Response:", streamedContentRef.current);
                logger.info(
                    `[${COMPONENT_ID}] Complete Response: ${streamedContentRef.current}`,
                );
            }).on("error", (error) => {
                handleError(error);
            });

            await new Promise<void>((resolve, reject) => {
                run.on("end", resolve);
                run.on("error", reject);
            });
        },
        [],
    );

    const generateResponse = useCallback(
        async (userMessage: string): Promise<void> => {
            const startTime = performance.now();
            dispatch({ type: "SET_LOADING", payload: true });
            dispatch({ type: "SET_ERROR", payload: null });
            dispatch({ type: "RESET_STREAMED_CONTENT" });

            logger.info(
                `[${COMPONENT_ID}] 🚀 Starting response generation process`,
            );

            try {
                const formattedMessage = await createUserMessage(
                    userMessage,
                    roleDescription,
                    state.conversationSummary, // Pass the summary
                    goals,
                );
                console.log("Created User Message:", userMessage);

                logger.debug(
                    `[${COMPONENT_ID}] 📝 Formatted user message: "${formattedMessage.substring(
                        0,
                        50,
                    )}..."`,
                );

                if (!openai) throw new Error("OpenAI client not initialized");

                await runThread(openai, formattedMessage, assistantId);

                const endTime = performance.now();
                const totalTime = endTime - startTime;
                logger.performance(
                    `[${COMPONENT_ID}] 🎉 Total LLM response generation time: ${totalTime.toFixed(
                        2,
                    )}ms`,
                );
            } catch (error) {
                handleError(error);
                dispatch({ type: "SET_LOADING", payload: false });
                throw error;
            }
        },
        [
            roleDescription,
            openai,
            runThread,
            assistantId,
            state.conversationSummary,
            goals,
        ],
    );

    // Summarize Conversation History
    const summarizationInProgressRef = useRef(false);

    const summarizeConversation = useCallback(
        async (history: Message[]): Promise<void> => {
            if (summarizationInProgressRef.current) {
                logger.info(
                    `[${COMPONENT_ID}] 🔄 Summarization already in progress. Skipping this request.`,
                );
                return;
            }

            if (!openai) {
                logger.error(
                    `[${COMPONENT_ID}] ❌ OpenAI client not initialized. Cannot summarize conversation.`,
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
                dispatch({ type: "SET_LOADING", payload: true });
                const response = await openai.chat.completions.create({
                    model: "gpt-4", // Correct model name
                    messages: [
                        {
                            role: "system",
                            content: summaryPrompt,
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

                logger.info(
                    `[${COMPONENT_ID}] 📝 Conversation summarized successfully.`,
                );
            } catch (error) {
                logger.error(
                    `[${COMPONENT_ID}] ❌ Error summarizing conversation: ${
                        (error as Error).message
                    }`,
                );
            } finally {
                summarizationInProgressRef.current = false;
                dispatch({ type: "SET_LOADING", payload: false });
            }
        },
        [openai, goals],
    );

    // Trigger Summarization Based on Conditions
    useEffect(() => {
        const shouldSummarize =
            conversationHistory.length >= 10 || // Example: after 10 messages
            (conversationHistory.length > 0 && isStreamingComplete); // Or when streaming completes

        if (shouldSummarize) {
            summarizeConversation(conversationHistory);
        }
    }, [conversationHistory, isStreamingComplete, summarizeConversation]);

    // Periodic Summarization (Optional)
    useEffect(() => {
        const interval = setInterval(() => {
            if (conversationHistory.length > 0) {
                summarizeConversation(conversationHistory);
            }
        }, 1000 * 60 * 5); // Every 5 minutes

        return () => clearInterval(interval);
    }, [conversationHistory, summarizeConversation]);

    const handleError = (
        error: unknown,
        context: string = "generateResponse",
    ) => {
        if (error instanceof Error) {
            logger.error(
                `[${COMPONENT_ID}] ❌ Error in ${context}: ${error.message}`,
            );
            dispatch({
                type: "SET_ERROR",
                payload: error.message || "An unexpected error occurred.",
            });
        } else {
            logger.error(`[${COMPONENT_ID}] ❌ Unknown error in ${context}`);
            dispatch({
                type: "SET_ERROR",
                payload: "An unexpected error occurred.",
            });
        }
    };

    return {
        generateResponse,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary, // Return the summary
    };
};

export default useLLMProvider;
