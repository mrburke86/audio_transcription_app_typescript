// src/hooks/useLLMProvider.ts

"use client";
import { useState, useCallback, useReducer, useEffect } from "react";
import { logger } from "@/modules/Logger";
import { createUserMessage } from "@/utils/createUserMessage";
import type OpenAI from "openai";

interface LLMProviderHook {
    generateResponse: (userMessage: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean; // Ensure this is returned from the hook
}

interface LLMState {
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean; // New state property
}

type LLMAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "APPEND_STREAMED_CONTENT"; payload: string }
    | { type: "RESET_STREAMED_CONTENT" }
    | { type: "SET_STREAMING_COMPLETE"; payload: boolean }; // New action

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
        default:
            return state;
    }
};

export const useLLMProvider = (apiKey: string): LLMProviderHook => {
    const [state, dispatch] = useReducer(reducer, {
        isLoading: false,
        error: null,
        streamedContent: "",
        isStreamingComplete: false, // Add this property to the initial state
    });
    const { isLoading, error, streamedContent, isStreamingComplete } = state;

    const [openai, setOpenai] = useState<OpenAI | null>(null);

    const initializeOpenAI = useCallback(async () => {
        if (!apiKey) {
            logger.error(
                "❌ API key is missing. OpenAI client initialization skipped.",
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
        } catch (error) {
            logger.error(
                `❌ Error initializing OpenAI client: ${
                    (error as Error).message
                }`,
            );
        }
    }, [apiKey]);

    useEffect(() => {
        initializeOpenAI();
    }, [initializeOpenAI]);

    const generateResponse = useCallback(
        async (userMessage: string): Promise<void> => {
            const startTime = performance.now();
            dispatch({ type: "SET_LOADING", payload: true });
            dispatch({ type: "SET_ERROR", payload: null });
            dispatch({ type: "RESET_STREAMED_CONTENT" }); // Reset streamed content

            logger.info("🚀 Starting response generation process");

            try {
                const formattedMessage = await createUserMessage(userMessage);
                logger.debug(
                    `📝 Formatted user message: "${formattedMessage.substring(
                        0,
                        50,
                    )}..."`,
                );

                if (!openai) throw new Error("OpenAI client not initialized");

                await runThread(openai, formattedMessage);

                const endTime = performance.now();
                const totalTime = endTime - startTime;
                logger.performance(
                    `🎉 Total LLM response generation time: ${totalTime.toFixed(
                        2,
                    )}ms`,
                );
            } catch (error) {
                handleError(error);
                dispatch({ type: "SET_LOADING", payload: false });
                throw error;
            }
        },
        [openai],
    );

    const runThread = async (
        openai: OpenAI,
        formattedMessage: string,
    ): Promise<void> => {
        logger.info("🏃‍♂️ Starting thread run with streaming...");
        let fullResponse = "";

        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: formattedMessage,
        });

        const run = openai.beta.threads.runs.stream(thread.id, {
            assistant_id: "asst_sCRom8T3wuUNTYoUC6wBTDSD",
        });

        run.on("textCreated", () => logger.info("assistant >"))
            .on("textDelta", (textDelta) => {
                const content = textDelta.value ?? "";
                fullResponse += content;
                dispatch({ type: "APPEND_STREAMED_CONTENT", payload: content });
                logger.debug(
                    `📤 Streaming response chunk: "${content.substring(
                        0,
                        50,
                    )}..."`,
                );
            })
            .on("toolCallCreated", (toolCall) =>
                logger.info(`assistant > ${toolCall.type}\n\n`),
            )
            .on("toolCallDelta", (toolCallDelta) => {
                if (
                    toolCallDelta.type === "code_interpreter" &&
                    toolCallDelta.code_interpreter
                ) {
                    if (toolCallDelta.code_interpreter.input) {
                        logger.info(toolCallDelta.code_interpreter.input);
                    }
                    if (toolCallDelta.code_interpreter.outputs) {
                        logger.info("\noutput >\n");
                        toolCallDelta.code_interpreter.outputs.forEach(
                            (output) => {
                                if (output.type === "logs") {
                                    logger.info(`\n${output.logs}\n`);
                                }
                            },
                        );
                    }
                }
            });
        run.on("messageDone", () => {
            logger.info(`🏁 Response streaming completed.`);
            dispatch({
                type: "SET_STREAMING_COMPLETE",
                payload: true, // Mark streaming as complete
            });
        }).on("error", (error) => {
            handleError(error);
        });

        // Wait for the run to complete
        await new Promise<void>((resolve, reject) => {
            run.on("end", resolve);
            run.on("error", reject);
        });
    };

    const handleError = (error: unknown) => {
        if (error instanceof Error) {
            logger.error(`❌ Error in generateResponse: ${error.message}`);
            dispatch({
                type: "SET_ERROR",
                payload: error.message ?? "Unknown error",
            });
        } else {
            logger.error("❌ Unknown error in generateResponse");
            dispatch({ type: "SET_ERROR", payload: "Unknown error" });
        }
    };

    return {
        generateResponse,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
    }; // Return isStreamingComplete
};
