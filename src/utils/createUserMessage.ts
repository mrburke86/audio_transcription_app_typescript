// src/utils/createUserMessage.ts
import { logger } from "@/modules/Logger";

/**
 * Constructs the user message for the assistant.
 *
 * @param question - The user's question.
 * @returns A formatted user message.
 */
export async function createUserMessage(
    question: string,
    roleDescription: string,
    conversationSummary: string,
    goals: string[],
): Promise<string> {
    logger.debug(`🎭 Creating user message for question: "${question}"`);

    const goalsText =
        goals.length > 0 ? goals.join("; ") : "No specific goals set.";

    const message = `
**Role Description:**
${roleDescription}

**Conversation Summary:**
${conversationSummary}

**Goals/Milestones:**
${goalsText}

**User Question/Statement:**
${question}
`;

    logger.debug("✅ User message created successfully");
    return message;
}
