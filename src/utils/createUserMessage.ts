// src/utils/createUserMessage.ts
import { logger } from "@/modules/Logger";

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
${roleDescription}

Conversation Summary:
${conversationSummary}

Goals/Milestones:
${goalsText}

User: ${question}

`;

    logger.debug("✅ User message created successfully");
    return message;
}
