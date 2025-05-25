// // src/utils/promptLogger.ts
// import { logger } from "@/modules/Logger";

// interface PromptComponents {
//     roleDescription: string;
//     goals: string[];
//     conversationSummary: string;
//     knowledgeContext: string;
//     conversationHistory: unknown[];
//     userMessage: string;
// }

// export class PromptLogger {
//     static logPromptComponents(components: PromptComponents, queryId: string) {
//         logger.info(
//             `[PromptLogger][${queryId}] 📋 PROMPT COMPONENTS BREAKDOWN:`,
//         );

//         // Role Description
//         logger.info(
//             `[PromptLogger][${queryId}] 🎭 ROLE DESCRIPTION (${components.roleDescription.length} chars):`,
//         );
//         logger.info(`"${components.roleDescription}"`);

//         // Goals
//         if (components.goals.length > 0) {
//             logger.info(
//                 `[PromptLogger][${queryId}] 🎯 GOALS (${components.goals.length} items):`,
//             );
//             components.goals.forEach((goal, i) => {
//                 logger.info(`  ${i + 1}. ${goal}`);
//             });
//         } else {
//             logger.info(`[PromptLogger][${queryId}] 🎯 GOALS: None set`);
//         }

//         // Conversation Summary
//         if (components.conversationSummary) {
//             logger.info(
//                 `[PromptLogger][${queryId}] 📝 CONVERSATION SUMMARY (${components.conversationSummary.length} chars):`,
//             );
//             logger.info(`"${components.conversationSummary}"`);
//         } else {
//             logger.info(
//                 `[PromptLogger][${queryId}] 📝 CONVERSATION SUMMARY: None available`,
//             );
//         }

//         // Knowledge Context
//         if (components.knowledgeContext) {
//             const wordCount = components.knowledgeContext.split(" ").length;
//             logger.info(
//                 `[PromptLogger][${queryId}] 🧠 KNOWLEDGE CONTEXT (${components.knowledgeContext.length} chars, ~${wordCount} words):`,
//             );
//             // Log first 200 chars to avoid spam
//             const preview =
//                 components.knowledgeContext.length > 200
//                     ? components.knowledgeContext.substring(0, 200) +
//                       "...[truncated]"
//                     : components.knowledgeContext;
//             logger.info(`"${preview}"`);
//         } else {
//             logger.info(
//                 `[PromptLogger][${queryId}] 🧠 KNOWLEDGE CONTEXT: None available`,
//             );
//         }

//         // Conversation History
//         logger.info(
//             `[PromptLogger][${queryId}] 💬 CONVERSATION HISTORY (${components.conversationHistory.length} messages):`,
//         );
//         components.conversationHistory.forEach((msg, i) => {
//             const preview =
//                 msg.content.length > 100
//                     ? msg.content.substring(0, 100) + "..."
//                     : msg.content;
//             logger.info(`  ${i + 1}. [${msg.role}]: "${preview}"`);
//         });

//         // Current User Message
//         logger.info(
//             `[PromptLogger][${queryId}] 🗣️ USER MESSAGE (${components.userMessage.length} chars):`,
//         );
//         logger.info(`"${components.userMessage}"`);
//     }

//     static logFinalPrompt(messages: any[], queryId: string) {
//         logger.info(`[PromptLogger][${queryId}] 🚀 FINAL PROMPT TO OPENAI:`);
//         logger.info(
//             `[PromptLogger][${queryId}] Total messages: ${messages.length}`,
//         );

//         messages.forEach((msg, i) => {
//             const contentPreview =
//                 typeof msg.content === "string"
//                     ? msg.content.length > 300
//                         ? msg.content.substring(0, 300) + "...[truncated]"
//                         : msg.content
//                     : "[Non-string content]";

//             logger.info(
//                 `[PromptLogger][${queryId}] Message ${i + 1} [${msg.role}] (${
//                     msg.content?.length || 0
//                 } chars):`,
//             );
//             logger.info(`"${contentPreview}"`);
//         });

//         // Calculate total token estimate (rough)
//         const totalChars = messages.reduce(
//             (sum, msg) => sum + (msg.content?.length || 0),
//             0,
//         );
//         const estimatedTokens = Math.ceil(totalChars / 4); // Rough estimate: 4 chars per token
//         logger.info(
//             `[PromptLogger][${queryId}] 📊 ESTIMATED TOKENS: ~${estimatedTokens}`,
//         );
//     }

//     static logSuggestionPrompt(
//         summary: string,
//         goals: string[],
//         queryId: string,
//     ) {
//         logger.info(
//             `[PromptLogger][${queryId}] 💡 SUGGESTION PROMPT COMPONENTS:`,
//         );
//         logger.info(`[PromptLogger][${queryId}] Summary: "${summary}"`);
//         logger.info(`[PromptLogger][${queryId}] Goals: [${goals.join(", ")}]`);
//     }
// }
