// src\lib\createUserPrompt.ts

import { logger } from '@/modules/Logger';

// createUserPrompt.ts – Build the user prompt with latest question and candidate profile (dynamic verbosity)
export async function createUserPrompt(latestTranscriptChunk: string, userProfile: string): Promise<string> {
    const sections: string[] = [];

    // Include candidate profile context if provided
    if (userProfile && userProfile.trim()) {
        sections.push(`**Candidate Profile:**\n${userProfile.trim()}`);
    }
    // Latest interviewer question or statement
    sections.push(`**Interviewer Question:**\n${latestTranscriptChunk.trim()}`);

    // Instructions for generating the answer
    const directives: string[] = [
        "- Provide a unique angle or insight that hasn't been mentioned",
        '- Include specific examples or **data points** (especially from personal knowledge) to support your answer',
        '- Demonstrate deep **industry expertise** and understanding',
        '- Offer strategic insight that goes beyond basic answers',
        '- Position **yourself (the candidate)** as a thought leader addressing the question',
    ];
    // Adjust verbosity directives based on preference
    if (userProfile && userProfile.toLowerCase().includes('verbosity: concise')) {
        directives.push('- **Be concise**: keep the response brief and focused');
    } else if (userProfile && userProfile.toLowerCase().includes('verbosity: detailed')) {
        directives.push('- **Be detailed**: provide comprehensive insights and elaboration');
    }
    sections.push('**Generate a first-person response that:**\n' + directives.join('\n'));

    const result = sections.join('\n\n');
    logger.debug(`✅ User message created: ${result.length} chars across ${sections.length} sections`);
    // logger.debug(`📊 Content breakdown: Knowledge=${knowledgeContext.length}chars, Summary=${conversationSummary.length}chars`);

    return result;
}
