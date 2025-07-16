// src\utils\createUserPrompt.ts
import { logger } from '@/lib/Logger';

/**
 * Constructs the user message for the Completions API with intelligent section handling.
 *
 * @param userMessage - The user's current question or statement.
 * @param conversationSummary - A brief summary of the conversation so far.
 * @param knowledgeContext - Knowledge from the uploaded Markdown files (intelligently selected)
 * @returns A formatted string that consolidates all the input into a coherent message.
 */
export async function createUserPrompt(
    userMessage: string,
    conversationSummary: string,
    knowledgeContext: string
): Promise<string> {
    logger.debug(`🎭 Creating user message for question: "${userMessage}"`);

    const sections: string[] = [];

    // Only include sections with meaningful content
    if (knowledgeContext?.trim() && !knowledgeContext.includes('No specific knowledge context found')) {
        sections.push(`**Deep Knowledge Base:**\n${knowledgeContext.trim()}`);
    }

    if (conversationSummary?.trim()) {
        sections.push(`**Conversation Context:**\n${conversationSummary.trim()}`);
    }

    sections.push(`**Question/Statement to Respond To:**\n${userMessage}`);

    sections.push(`
**Generate a world-class first-person response that:**
- Provides a unique angle they haven't considered
- Includes specific examples or data points from the knowledge base
- Demonstrates deep industry expertise
- Offers strategic insights beyond the obvious
- Positions you as a thought leader in this space`);

    const result = sections.join('\n\n');

    // Enhanced logging
    logger.debug(`✅ User message created: ${result.length} chars across ${sections.length} sections`);
    logger.debug(
        `📊 Content breakdown: Knowledge=${knowledgeContext.length}chars, Summary=${conversationSummary.length}chars`
    );

    return result;
}
