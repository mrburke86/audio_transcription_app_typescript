// src/utils/promptBuilder.ts (Enhanced)
import { logger } from '@/modules/Logger';
// 👇 Import the correct types.
// ChatMessageParam is for individual messages in the request.
// CustomAppMessage (if you have it) for your internal representation with timestamp.
import { ChatMessageParam, Message, OpenAIChatMessageRole } from '@/types/openai';
// ChatCompletion is the API response, not what you use for conversationHistory elements directly
// if history elements are just messages.

export class PromptBuilder {
    static buildCompletePrompt(
        roleDescription: string,
        goals: string[],
        conversationSummary: string,
        knowledgeContext: string,
        // 👇 This should be an array of message-like objects, not full ChatCompletion responses.
        // Using CustomAppMessage if it holds your {role, content, timestamp} structure.
        // If your history doesn't have timestamps or is already ChatMessageParam, adjust accordingly.
        conversationHistory: Message[],
        userMessage: string
    ): ChatMessageParam[] {
        //  👈 Return type is an array of messages for the API
        logger.debug(`[PromptBuilder] Building prompt with ${conversationHistory.length} history messages`);

        // 👇 This is an array of individual messages
        const messages: ChatMessageParam[] = [];

        // 1. System Role
        let systemPrompt = `You are an AI assistant with the following role: ${roleDescription}`;

        // 2. Add Goals Context
        if (goals.length > 0) {
            systemPrompt += `\n\nCurrent conversation goals:\n${goals.map(goal => `- ${goal}`).join('\n')}`;
            logger.debug(`[PromptBuilder] Added ${goals.length} goals to system prompt`);
        }

        // 3. Add Conversation Summary (if available)
        if (conversationSummary && conversationSummary.trim()) {
            systemPrompt += `\n\nConversation summary so far:\n${conversationSummary}`;
            logger.debug(`[PromptBuilder] Added conversation summary (${conversationSummary.length} chars)`);
        }

        // 4. Add Knowledge Context
        if (knowledgeContext && knowledgeContext.trim()) {
            systemPrompt += `\n\nRelevant knowledge context:\n${knowledgeContext}`;
            logger.debug(`[PromptBuilder] Added knowledge context (${knowledgeContext.length} chars)`);
        }

        systemPrompt += `\n\nProvide helpful, accurate, and contextually relevant responses based on the conversation history and available knowledge.`;

        messages.push({
            role: 'system',
            content: systemPrompt,
            // timestamp: Date.now().toString(), // OpenAI API doesn't use timestamp. Add if ChatMessageParam is custom.
        });

        // 5. Add Recent Conversation History
        const maxHistoryMessages = conversationSummary ? 6 : 10;
        const recentHistory = conversationHistory.slice(-maxHistoryMessages);

        recentHistory.forEach(msg => {
            // Ensure the role is a valid ChatMessageRole for the API
            let apiRole: OpenAIChatMessageRole = 'user'; // Default
            if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system' || msg.role === 'tool') {
                apiRole = msg.role;
            } else if (msg.role === 'interim' && msg.content?.startsWith('Assistant thought:')) {
                // Example: map 'interim' if it implies assistant
                apiRole = 'assistant'; // Or handle 'interim' differently if it's not for the API
            } else {
                // If 'interim' or other custom roles aren't meant for the API, filter them out or map them.
                // For now, let's assume we try to map or use a default.
                logger.warning(`[PromptBuilder] Unknown role in history: ${msg.role}. Using 'user' as fallback.`);
            }

            messages.push({
                role: apiRole, // Use the mapped/validated role
                content: msg.content || '', // Ensure content is not null if API expects string
                // timestamp: msg.timestamp, // OpenAI API doesn't use timestamp.
            });
        });

        // 6. Add Current User Message
        messages.push({
            role: 'user',
            content: userMessage,
            // timestamp: Date.now().toString(), // OpenAI API doesn't use timestamp.
        });

        logger.debug(`[PromptBuilder] Final prompt: ${messages.length} messages, estimated ${this.estimateTokens(messages)} tokens`);

        return messages;
    }

    static buildSuggestionPrompt(conversationSummary: string, goals: string[]): string {
        logger.debug(`[PromptBuilder] Building suggestion prompt`);
        // ... (rest of the method is fine, returns a string prompt) ...
        const goalsContext = goals.length > 0 ? `Current goals: ${goals.join(', ')}` : 'No specific goals set';

        const contextToUse =
            conversationSummary && conversationSummary.trim()
                ? `Conversation summary: ${conversationSummary}`
                : 'No conversation context available yet';

        const prompt = `Based on the conversation summary and goals, suggest 3 thoughtful follow-up questions and 2 relevant statements to continue the discussion.

                ${goalsContext}
                
                ${contextToUse}
                
                Return your response in this exact JSON format:
                {
                  "questions": ["question 1", "question 2", "question 3"],
                  "statements": ["statement 1", "statement 2"]
                }
                
                Make suggestions that:
                - Build on the conversation context naturally
                - Help achieve the stated goals
                - Encourage deeper exploration of topics
                - Are specific and actionable
                - Are relevant to what has been discussed so far`;

        logger.debug(`[PromptBuilder] Suggestion prompt built (${prompt.length} chars)`);
        return prompt;
    }

    static parseSuggestionsResponse(content: string): {
        questions: string[];
        statements: string[];
    } {
        // ... (this method seems logically fine) ...
        logger.debug(`[PromptBuilder] Parsing suggestions response`);
        try {
            const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim(); // Remove markdown JSON block
            const parsed = JSON.parse(cleanedContent);
            if (parsed.questions && parsed.statements) {
                logger.debug(
                    `[PromptBuilder] Successfully parsed JSON: ${parsed.questions.length} questions, ${parsed.statements.length} statements`
                );
                return {
                    questions: Array.isArray(parsed.questions) ? parsed.questions.map(String) : [],
                    statements: Array.isArray(parsed.statements) ? parsed.statements.map(String) : [],
                };
            }
        } catch (error) {
            logger.debug(`[PromptBuilder] JSON parse failed, attempting text parsing: ${(error as Error).message}`);
        }

        // Fallback text parsing
        const questions: string[] = [];
        const statements: string[] = [];
        const lines = content.split('\n').filter(line => line.trim());
        let currentSection = ''; // Can be 'questions', 'statements', or ''

        for (const line of lines) {
            const trimmedLower = line.trim().toLowerCase();

            if (trimmedLower.includes('"questions":')) currentSection = 'questions';
            else if (trimmedLower.includes('"statements":')) currentSection = 'statements';
            else if (trimmedLower.includes('}')) currentSection = ''; // End of a section or JSON

            if (currentSection === 'questions' || currentSection === 'statements') {
                // Try to extract from "value", "value", format
                const itemsMatch = line.match(/"(.*?)"/g);
                if (itemsMatch) {
                    itemsMatch.forEach(item => {
                        const cleanedItem = item.substring(1, item.length - 1).trim(); // Remove quotes
                        if (cleanedItem) {
                            if (currentSection === 'questions' && questions.length < 3) questions.push(cleanedItem);
                            else if (currentSection === 'statements' && statements.length < 2) statements.push(cleanedItem);
                        }
                    });
                } else {
                    // Fallback for lines that might be just the item itself after a label
                    const cleaned = line
                        .trim()
                        .replace(/^[\d\.\-\*\+]\s*"?|"?\s*,?$/g, '')
                        .trim();
                    if (cleaned && !cleaned.match(/^(questions|statements|{|})/i)) {
                        // Avoid adding labels
                        if (currentSection === 'questions' && questions.length < 3) {
                            questions.push(cleaned);
                        } else if (currentSection === 'statements' && statements.length < 2) {
                            statements.push(cleaned);
                        }
                    }
                }
            }
        }
        logger.debug(`[PromptBuilder] Text parsing result: ${questions.length} questions, ${statements.length} statements`);
        return { questions, statements };
    }

    static sanitizeUserInput(input: string): string {
        const sanitized = input.trim().replace(/\s+/g, ' ');
        if (sanitized !== input) {
            logger.debug(`[PromptBuilder] Sanitized user input`);
        }
        return sanitized;
    }

    // 👇 Use ChatMessageParam for the methods below as they operate on the messages array for API
    static validatePromptLength(messages: ChatMessageParam[]): boolean {
        const estimatedTokens = this.estimateTokens(messages);
        // GPT-4o context is 128k, GPT-4-turbo is 128k. Max output can be 4k.
        // A very conservative limit for *input* might be lower if you expect long outputs.
        // Let's use a more generous input limit, e.g., 32000 tokens, but this depends on the model.
        const maxInputTokens = 32000;
        const isValid = estimatedTokens <= maxInputTokens;

        if (!isValid) {
            logger.warning(`[PromptBuilder] Prompt may be too long: ${estimatedTokens} estimated tokens (limit: ${maxInputTokens})`);
        }
        return isValid;
    }

    private static estimateTokens(messages: ChatMessageParam[]): number {
        // Ensure content is not null before accessing length
        const totalLength = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
        return Math.ceil(totalLength / 4); // Common rough estimation
    }

    static getPromptStats(messages: ChatMessageParam[]): {
        messageCount: number;
        totalCharacters: number;
        estimatedTokens: number;
        systemPromptLength: number;
        historyLength: number;
    } {
        const systemPromptLength = messages.find(m => m.role === 'system')?.content?.length || 0;
        const historyMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
        const historyLength = historyMessages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
        const totalCharacters = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);

        return {
            messageCount: messages.length,
            totalCharacters,
            estimatedTokens: this.estimateTokens(messages),
            systemPromptLength,
            historyLength,
        };
    }
}
