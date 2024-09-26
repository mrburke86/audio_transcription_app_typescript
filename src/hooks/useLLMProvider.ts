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
} from "@/contexts/PerformanceContext"; // Import usePerformance
import { v4 as uuidv4 } from "uuid";
import { loglog } from "@/modules/log-log";

const COMPONENT_ID = "useLLMProvider";

interface LLMProviderHook {
  generateResponse: (userMessage: string) => Promise<void>;
  generateSuggestions: () => Promise<void>; // Expose generateSuggestions
  isLoading: boolean;
  error: string | null;
  streamedContent: string;
  isStreamingComplete: boolean; // Ensure this is returned from the hook
  conversationSummary: string;
  conversationSuggestions: string[]; // New state variable for suggestions
}

interface LLMState {
  isLoading: boolean;
  error: string | null;
  streamedContent: string;
  isStreamingComplete: boolean; // New state property
  conversationSummary: string; // New state property for summary
  conversationSuggestions: string[]; // New state property for suggestions
}

type LLMAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "APPEND_STREAMED_CONTENT"; payload: string }
  | { type: "RESET_STREAMED_CONTENT" }
  | { type: "SET_STREAMING_COMPLETE"; payload: boolean }
  | { type: "SET_CONVERSATION_SUMMARY"; payload: string }
  | { type: "SET_CONVERSATION_SUGGESTIONS"; payload: string[] }; // New action for suggestions

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
  conversationHistory: Message[], // New parameter
  goals: string[] // New parameter
): LLMProviderHook => {
  const [state, dispatch] = useReducer(reducer, {
    isLoading: false,
    error: null,
    streamedContent: "",
    isStreamingComplete: false,
    conversationSummary: "",
    conversationSuggestions: [], // Initialize suggestions
  });
  const {
    isLoading,
    error,
    streamedContent,
    isStreamingComplete,
    conversationSummary,
    conversationSuggestions,
  } = state;

  const [openai, setOpenai] = useState<OpenAI | null>(null);

  const streamedContentRef = useRef<string>("");
  const firstChunkReceivedRef = useRef<boolean>(false);

  const { addEntry } = usePerformance(); // Use the performance context

  const initializeOpenAI = useCallback(async () => {
    if (!apiKey) {
      logger.error(
        `[${COMPONENT_ID}] ❌ API key is missing. OpenAI client initialization skipped.`
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
        `[${COMPONENT_ID}] ✅ OpenAI client initialized successfully.`
      );
    } catch (error) {
      logger.error(
        `[${COMPONENT_ID}] ❌ Error initializing OpenAI client: ${
          (error as Error).message
        }`
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
      queryId: string // Accept queryId as a parameter
    ): Promise<void> => {
      logger.info(
        `[${COMPONENT_ID}][${queryId}] 🏃‍♂️ Starting thread run with streaming...`
      );

      const thread = await openai.beta.threads.create();
      logger.debug(
        `[${COMPONENT_ID}][${queryId}] 🧵 Thread created with ID: ${thread.id}`
      );

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: formattedMessage,
      });
      logger.debug(
        `[${COMPONENT_ID}][${queryId}] 💬 User message added to thread`
      );

      const run = openai.beta.threads.runs.stream(thread.id, {
        assistant_id: assistantId,
      });

      run
        .on("textCreated", () =>
          logger.info(`[${COMPONENT_ID}][${queryId}] assistant >`)
        )
        .on("textDelta", (textDelta) => {
          const content = textDelta.value ?? "";
          dispatch({
            type: "APPEND_STREAMED_CONTENT",
            payload: content,
          });
          streamedContentRef.current += content;

          if (!firstChunkReceivedRef.current) {
            performance.mark("generateResponse_firstChunk");
            performance.measure(
              `MoveToFirstChunk_duration_${queryId}`, // Unique measure name
              "generateResponse_start",
              "generateResponse_firstChunk"
            );

            const measures = performance.getEntriesByName(
              `MoveToFirstChunk_duration_${queryId}`
            );
            if (measures.length > 0) {
              const measure = measures[0];
              const duration = measure.duration;

              console.log(
                `[${COMPONENT_ID}][${queryId}] Move to first chunk took ${duration.toFixed(
                  2
                )}ms`
              );

              logger.performance(
                `[${COMPONENT_ID}][${queryId}] Move to first chunk took ${duration.toFixed(
                  2
                )}ms`
              );
              loglog.performance(
                `Move to first chunk took ${duration.toFixed(2)}ms`,
                queryId
              );

              const entry: ExtendedPerformanceEntry = {
                name: "MoveToFirstChunk",
                duration: duration,
                startTime: measure.startTime,
                endTime: measure.startTime + measure.duration,
                queryId, // Include queryId
              };
              addEntry(entry);
            }

            firstChunkReceivedRef.current = true;
          }
        })
        .on("toolCallCreated", (toolCall) =>
          logger.info(
            `[${COMPONENT_ID}][${queryId}] assistant > ${toolCall.type}\n\n`
          )
        )
        .on("toolCallDelta", (toolCallDelta) => {
          if (
            toolCallDelta.type === "code_interpreter" &&
            toolCallDelta.code_interpreter
          ) {
            if (toolCallDelta.code_interpreter.input) {
              logger.info(
                `[${COMPONENT_ID}][${queryId}] Code input: ${toolCallDelta.code_interpreter.input}`
              );
              loglog.info(
                `Code input: ${toolCallDelta.code_interpreter.input}`,
                queryId
              );
            }
            if (toolCallDelta.code_interpreter.outputs) {
              logger.info(`[${COMPONENT_ID}][${queryId}] Code output:`);
              loglog.info(`Code output:`, queryId);
              toolCallDelta.code_interpreter.outputs.forEach((output) => {
                if (output.type === "logs") {
                  logger.info(`[${COMPONENT_ID}][${queryId}] ${output.logs}`);
                  loglog.info(`${output.logs}`, queryId);
                }
              });
            }
          }
        });
      run
        .on("messageDone", () => {
          logger.info(
            `[${COMPONENT_ID}][${queryId}] 🏁 Response streaming completed.`
          );
          loglog.info("Response streaming completed.", queryId);
          dispatch({
            type: "SET_STREAMING_COMPLETE",
            payload: true,
          });

          console.log(
            `[${queryId}] Complete Response:`,
            streamedContentRef.current
          );
          logger.info(
            `[${COMPONENT_ID}][${queryId}] Complete Response: ${streamedContentRef.current}`
          );
          loglog.info(
            `Complete Response: ${streamedContentRef.current}`,
            queryId
          );
        })
        .on("error", (error) => {
          handleError(error, queryId);
        });

      await new Promise<void>((resolve, reject) => {
        run.on("end", resolve);
        run.on("error", reject);
      });
    },
    [addEntry]
  );

  const generateResponse = useCallback(
    async (userMessage: string): Promise<void> => {
      // Start measuring generateResponse
      const queryId = uuidv4(); // Generate a unique ID for the query
      performance.mark("generateResponse_start");

      // Reset the firstChunkReceivedRef for each new query
      firstChunkReceivedRef.current = false;

      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      dispatch({ type: "RESET_STREAMED_CONTENT" });

      logger.info(
        `[${COMPONENT_ID}][${queryId}] 🚀 Starting response generation process`
      );
      loglog.info("🚀 Starting response generation process", queryId);

      try {
        const formattedMessage = await createUserMessage(
          userMessage,
          roleDescription,
          state.conversationSummary,
          goals
        );
        console.log(`[${queryId}] Created User Message:`, userMessage);
        loglog.debug(`Created User Message: ${userMessage}`, queryId);

        logger.debug(
          `[${COMPONENT_ID}][${queryId}] 📝 Formatted user message: "${formattedMessage.substring(
            0,
            50
          )}..."`
        );
        loglog.debug(
          `Formatted user message: "${formattedMessage.substring(0, 50)}..."`,
          queryId
        );

        if (!openai) throw new Error("OpenAI client not initialized");

        // Run the thread
        await runThread(openai, formattedMessage, assistantId, queryId);

        // End measuring generateResponse
        performance.mark("generateResponse_end");
        performance.measure(
          `generateResponse_duration_${queryId}`,
          "generateResponse_start",
          "generateResponse_end"
        );

        const measures = performance.getEntriesByName(
          `generateResponse_duration_${queryId}`
        );
        if (measures.length > 0) {
          const measure = measures[0];
          const entry: ExtendedPerformanceEntry = {
            name: "generateResponse",
            duration: measure.duration,
            startTime: measure.startTime,
            endTime: measure.startTime + measure.duration,
            queryId, // Include queryId
          };
          addEntry(entry);
          logger.performance(
            `[${COMPONENT_ID}][${queryId}] 🎉 generateResponse took ${measure.duration.toFixed(
              2
            )}ms`
          );
          loglog.performance(
            `generateResponse took ${measure.duration.toFixed(2)}ms`,
            queryId
          );
        }
      } catch (error) {
        handleError(error, queryId);
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
      addEntry,
    ]
  );

  // Summarize Conversation History
  const summarizationInProgressRef = useRef(false);

  const summarizeConversation = useCallback(
    async (history: Message[]): Promise<void> => {
      if (summarizationInProgressRef.current) {
        return;
      }

      if (!openai) {
        logger.error(
          `[${COMPONENT_ID}] ❌ OpenAI client not initialized. Cannot summarize conversation.`
        );
        return;
      }

      summarizationInProgressRef.current = true;

      const conversationText = history
        .map(
          (msg) =>
            `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
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
        const modelName: OpenAIModelName = "gpt-4o-mini";

        const response = await openai.chat.completions.create({
          model: modelName, // Correct model name
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

        const summary = response.choices[0]?.message.content?.trim() || "";
        dispatch({
          type: "SET_CONVERSATION_SUMMARY",
          payload: summary,
        });

        logger.info(
          `[${COMPONENT_ID}] 📝 Conversation summarized successfully.`
        );
      } catch (error) {
        logger.error(
          `[${COMPONENT_ID}] ❌ Error summarizing conversation: ${
            (error as Error).message
          }`
        );
      } finally {
        summarizationInProgressRef.current = false;
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [openai, goals]
  );

  // Generate Suggestions
  const suggestionsInProgressRef = useRef(false);

  const generateSuggestions = useCallback(async (): Promise<void> => {
    if (suggestionsInProgressRef.current) {
      return;
    }

    if (!openai) {
      logger.error(
        `[${COMPONENT_ID}] ❌ OpenAI client not initialized. Cannot generate suggestions.`
      );
      return;
    }

    suggestionsInProgressRef.current = true;

    const conversationText = conversationHistory
      .map(
        (msg) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const goalsText =
      goals.length > 0 ? goals.join("; ") : "No specific goals set.";

    const suggestionsPrompt = `
      Based on the following conversation and goals, suggest possible questions or statements the user could say next to advance the conversation or achieve the goals.

      Goals/Milestones:
      ${goalsText}

      Conversation Summary:
      ${state.conversationSummary}

      Conversation:
      ${conversationText}

      Please provide 3-5 suggestions in bullet points.

      Suggestions:
    `;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const modelName: OpenAIModelName = "o1-mini";

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "user",
            content: suggestionsPrompt,
          },
        ],
        // max_tokens: 150,
        // temperature: 0.7,
      });

      const suggestionsContent =
        response.choices[0]?.message.content?.trim() || "";
      const suggestionsArray = suggestionsContent
        .split(/\n+/)
        .map((line) => line.replace(/^[\-\*]\s*/, "").trim())
        .filter((line) => line.length > 0);

      dispatch({
        type: "SET_CONVERSATION_SUGGESTIONS",
        payload: suggestionsArray,
      });

      logger.info(`[${COMPONENT_ID}] 💡 Suggestions generated successfully.`);
    } catch (error) {
      logger.error(
        `[${COMPONENT_ID}] ❌ Error generating suggestions: ${
          (error as Error).message
        }`
      );
    } finally {
      suggestionsInProgressRef.current = false;
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [openai, goals, state.conversationSummary, conversationHistory]);

  // Trigger Summarization and Suggestions
  useEffect(() => {
    const shouldSummarize =
      conversationHistory.length >= 10 || // Example: after 10 messages
      (conversationHistory.length > 0 && isStreamingComplete); // Or when streaming completes

    if (shouldSummarize) {
      (async () => {
        await summarizeConversation(conversationHistory);
        // await generateSuggestions(conversationHistory);
      })();
    }
  }, [
    conversationHistory,
    isStreamingComplete,
    summarizeConversation,
    // generateSuggestions,
  ]);

  // Periodic Summarization and Suggestions (Optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (conversationHistory.length > 0) {
        summarizeConversation(conversationHistory);
        // generateSuggestions(conversationHistory);
      }
    }, 1000 * 60 * 5); // Every 5 minutes

    return () => clearInterval(interval);
  }, [conversationHistory, summarizeConversation, generateSuggestions]);

  const handleError = (
    error: unknown,
    queryId: string = "general", // Default to "general" if not provided
    context: string = "generateResponse"
  ) => {
    if (error instanceof Error) {
      logger.error(
        `[${COMPONENT_ID}][${queryId}] ❌ Error in ${context}: ${error.message}`
      );
      loglog.error(`Error in ${context}: ${error.message}`, queryId);
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "An unexpected error occurred.",
      });
    } else {
      logger.error(
        `[${COMPONENT_ID}][${queryId}] ❌ Unknown error in ${context}`
      );
      loglog.error("Unknown error occurred.", queryId);
      dispatch({
        type: "SET_ERROR",
        payload: "An unexpected error occurred.",
      });
    }
  };

  return {
    generateResponse,
    generateSuggestions, // Return generateSuggestions
    isLoading,
    error,
    streamedContent,
    isStreamingComplete,
    conversationSummary,
    conversationSuggestions, // Return suggestions
  };
};

export default useLLMProvider;
