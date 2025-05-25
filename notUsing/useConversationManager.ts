// // src/hooks/useConversationManager.ts
// "use client";

// import { useState, useCallback, useRef } from "react";
// import type OpenAI from "openai";
// import { Message } from "@/types/Message";
// import { OpenAIModelName } from "@/types/openai-models";
// import { logger } from "@/modules/Logger";

// interface ConversationSuggestions {
//     questions: string[];
//     statements: string[];
// }

// interface UseConversationManagerReturn {
//     conversationSummary: string;
//     conversationSuggestions: ConversationSuggestions;
//     isGeneratingSuggestions: boolean;
//     isSummarizing: boolean;
//     summarizeConversation: (history: Message[]) => Promise<void>;
//     generateSuggestions: () => Promise<void>;
// }

// export const useConversationManager = (
//     openaiClient: OpenAI | null,
//     conversationHistory: Message[],
//     goals: string[],
// ): UseConversationManagerReturn => {
//     const [conversationSummary, setConversationSummary] = useState("");
//     const [conversationSuggestions, setConversationSuggestions] =
//         useState<ConversationSuggestions>({
//             questions: [],
//             statements: [],
//         });
//     const [isGeneratingSuggestions, setIsGeneratingSuggestions] =
//         useState(false);
//     const [isSummarizing, setIsSummarizing] = useState(false);

//     const summarizationInProgressRef = useRef(false);
//     const suggestionsInProgressRef = useRef(false);

//     const summarizeConversation = useCallback(
//         async (history: Message[]): Promise<void> => {
//             if (
//                 summarizationInProgressRef.current ||
//                 !openaiClient ||
//                 history.length < 5
//             ) {
//                 return;
//             }

//             summarizationInProgressRef.current = true;
//             setIsSummarizing(true);

//             try {
//                 const conversationText = history
//                     .map(
//                         (msg) =>
//                             `${msg.type === "user" ? "User" : "Assistant"}: ${
//                                 msg.content
//                             }`,
//                     )
//                     .join("\n");

//                 const goalsText =
//                     goals.length > 0
//                         ? goals.join("; ")
//                         : "No specific goals set.";

//                 const summaryPrompt = `
// You are an AI assistant trained to follow user-defined goals and milestones during conversations.

// Goals/Milestones:
// ${goalsText}

// Please provide a concise summary of the following conversation. Focus on key points, decisions, and topics discussed that align with the above goals/milestones.

// Conversation:
// ${conversationText}

// Summary:`;

//                 const modelName: OpenAIModelName = "gpt-4o-mini";
//                 const response = await openaiClient.chat.completions.create({
//                     model: modelName,
//                     messages: [
//                         { role: "system", content: summaryPrompt },
//                         { role: "user", content: conversationText },
//                     ],
//                     max_tokens: 150,
//                     temperature: 0.5,
//                 });

//                 const summary =
//                     response.choices[0]?.message.content?.trim() || "";
//                 setConversationSummary(summary);

//                 logger.info(
//                     "[useConversationManager] 📝 Conversation summarized successfully",
//                 );
//                 logger.debug(`[useConversationManager] Summary: ${summary}`);
//             } catch (error) {
//                 const errorMessage =
//                     error instanceof Error ? error.message : "Unknown error";
//                 logger.error(
//                     `[useConversationManager] ❌ Error summarizing: ${errorMessage}`,
//                 );
//             } finally {
//                 summarizationInProgressRef.current = false;
//                 setIsSummarizing(false);
//             }
//         },
//         [openaiClient, goals],
//     );

//     const generateSuggestions = useCallback(async (): Promise<void> => {
//         if (suggestionsInProgressRef.current || !openaiClient) {
//             return;
//         }

//         suggestionsInProgressRef.current = true;
//         setIsGeneratingSuggestions(true);

//         try {
//             const conversationText = conversationHistory
//                 .map(
//                     (msg) =>
//                         `${msg.type === "user" ? "User" : "Assistant"}: ${
//                             msg.content
//                         }`,
//                 )
//                 .join("\n");

//             const goalsText =
//                 goals.length > 0 ? goals.join("; ") : "No specific goals set.";

//             const suggestionsPrompt = `
// You are an AI Call Assistant helping to facilitate productive conversations around ETQ quality management software.

// Goals:
// ${goalsText}

// Conversation Summary:
// ${conversationSummary}

// Conversation:
// ${conversationText}

// Based on the conversation above, generate exactly 3 relevant questions and 3 relevant statements that would help advance the conversation toward the stated goals. Focus on ETQ products, quality management best practices, and actionable next steps.

// Return your response as valid JSON in this exact format:
// {
//     "questions": ["Question 1?", "Question 2?", "Question 3?"],
//     "statements": ["Statement 1", "Statement 2", "Statement 3"]
// }

// Make sure each question ends with a question mark and each statement is actionable and relevant to the conversation context.`;

//             const modelName: OpenAIModelName = "gpt-4o-mini";
//             const response = await openaiClient.chat.completions.create({
//                 model: modelName,
//                 messages: [{ role: "user", content: suggestionsPrompt }],
//                 max_tokens: 300,
//                 temperature: 0.7,
//             });

//             const suggestionsContent =
//                 response.choices[0]?.message.content?.trim() || "";
//             let questions: string[] = [];
//             let statements: string[] = [];

//             try {
//                 const parsedSuggestions = JSON.parse(suggestionsContent);

//                 if (
//                     typeof parsedSuggestions === "object" &&
//                     Array.isArray(parsedSuggestions.questions) &&
//                     Array.isArray(parsedSuggestions.statements) &&
//                     parsedSuggestions.questions.length <= 3 &&
//                     parsedSuggestions.statements.length <= 3
//                 ) {
//                     questions = parsedSuggestions.questions;
//                     statements = parsedSuggestions.statements;
//                 } else {
//                     throw new Error("Parsed suggestions structure mismatch");
//                 }
//             } catch (parseError) {
//                 logger.error(
//                     `[useConversationManager] ❌ Error parsing suggestions JSON: ${
//                         parseError instanceof Error
//                             ? parseError.message
//                             : "Unknown error"
//                     }`,
//                 );

//                 // Fallback parsing logic
//                 const lines = suggestionsContent.split(/\n+/);
//                 questions = [];
//                 statements = [];

//                 lines.forEach((line) => {
//                     const trimmedLine = line.replace(/^[\-\*]\s*/, "").trim();
//                     if (
//                         trimmedLine.endsWith("?") ||
//                         [
//                             "Can",
//                             "Could",
//                             "How",
//                             "What",
//                             "Why",
//                             "When",
//                             "Who",
//                         ].some((q) => trimmedLine.startsWith(q))
//                     ) {
//                         if (questions.length < 3) questions.push(trimmedLine);
//                     } else if (trimmedLine) {
//                         if (statements.length < 3) statements.push(trimmedLine);
//                     }
//                 });
//             }

//             setConversationSuggestions({ questions, statements });

//             logger.info(
//                 "[useConversationManager] 💡 Suggestions generated successfully",
//             );
//             logger.debug(
//                 `[useConversationManager] Questions: ${JSON.stringify(
//                     questions,
//                 )}`,
//             );
//             logger.debug(
//                 `[useConversationManager] Statements: ${JSON.stringify(
//                     statements,
//                 )}`,
//             );
//         } catch (error) {
//             const errorMessage =
//                 error instanceof Error ? error.message : "Unknown error";
//             logger.error(
//                 `[useConversationManager] ❌ Error generating suggestions: ${errorMessage}`,
//             );

//             // Reset suggestions on error
//             setConversationSuggestions({ questions: [], statements: [] });
//         } finally {
//             suggestionsInProgressRef.current = false;
//             setIsGeneratingSuggestions(false);
//         }
//     }, [openaiClient, goals, conversationSummary, conversationHistory]);

//     return {
//         conversationSummary,
//         conversationSuggestions,
//         isGeneratingSuggestions,
//         isSummarizing,
//         summarizeConversation,
//         generateSuggestions,
//     };
// };
