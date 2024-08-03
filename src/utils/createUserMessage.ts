// src/utils/createUserMessage.ts
import { logger } from "@/modules/Logger";

export async function createUserMessage(question: string): Promise<string> {
    logger.debug(`🎭 Creating user message for question: "${question}"`);
    const message = `
    As a world-class Enterprise Account Executive interviewing for a prestigious position, please respond to the following interview question:

    ${question}

    Provide your response in Markdown format. Your answer should showcase your expertise, confidence, and ability to engage effectively while maintaining a professional and thoughtful tone.
  `;
    logger.debug("✅ User message created successfully");
    return message;
}
