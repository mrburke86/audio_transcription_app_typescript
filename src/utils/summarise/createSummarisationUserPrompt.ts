// src\utils\createSummarisationUserPrompt.ts

import { InitialInterviewContext } from '@/types';

export const createSummarisationUserPrompt = (
    conversationText: string,
    initialInterviewContext: InitialInterviewContext,
    existingSummary: string
): string => {
    // Extract the most recent Q&A pair from conversation text
    const messages = conversationText.split('\n').filter(line => line.trim());

    // Find the last user message (question) and assistant message (response)
    let lastQuestion = '';
    let lastResponse = '';

    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message.startsWith('User:') && !lastQuestion) {
            lastQuestion = message.replace('User:', '').trim();
        } else if (message.startsWith('Assistant:') && !lastResponse) {
            lastResponse = message.replace('Assistant:', '').trim();
        }

        // Stop when we have both
        if (lastQuestion && lastResponse) break;
    }

    // Build context section
    const contextLines = [];
    if (initialInterviewContext.roleDescription) {
        contextLines.push(`Role: ${initialInterviewContext.roleDescription}`);
    }
    if (initialInterviewContext.targetCompany) {
        contextLines.push(`Company: ${initialInterviewContext.targetCompany}`);
    }
    if (initialInterviewContext.interviewType) {
        contextLines.push(`Interview Type: ${initialInterviewContext.interviewType}`);
    }

    const contextSection = contextLines.length > 0 ? `**Interview Context:**\n${contextLines.join('\n')}\n\n` : '';

    const existingSummarySection = existingSummary
        ? `**Existing Conversation Summary:**\n${existingSummary}\n\n`
        : `**Existing Conversation Summary:**\nThis is the first exchange in the conversation.\n\n`;

    return `${contextSection}${existingSummarySection}**Most Recent Exchange to Summarize:**

**Interviewer Question:**
${lastQuestion}

**Interviewee Response:**
${lastResponse}

**Instructions:**
Create a structured summary of this most recent question-answer pair using the exact format specified in the system prompt. Focus on:
- Key strategic insights and business impact
- Specific metrics, achievements, and quantifiable results  
- Strategic frameworks, methodologies, and approaches mentioned
- Company names, deal sizes, and geographic markets
- Competitive positioning and differentiation points
- Process improvements and operational benefits

Use **bold formatting** for all metrics, achievements, company names, and key strategic points. Keep the summary concise but comprehensive enough to capture the strategic substance of the exchange.`;
};
// const buildSummarizationUserPrompt = (
//     conversationText: string,
//     goals: string[],
//     previousSummary?: string
// ) => {
//     const goalsContext = goals.length > 0
//         ? `\n## Current Goals:\n${goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}`
//         : '';

//     const previousContext = previousSummary
//         ? `\n## Previous Context:\n${previousSummary}\n`
//         : '';

//     return `Create an intelligent summary of this conversation that will enable seamless, contextually-aware future interactions.

// ${previousContext}${goalsContext}

// ## Conversation to Summarize:
// ${conversationText}

// ## Instructions:
// Analyze the conversation above and provide a focused summary that captures:

// 1. **Core Themes**: What are the main topics and their significance?
// 2. **Progress & Decisions**: What has been accomplished or decided?
// 3. **User Intent & Sentiment**: What does the user really want to achieve? How do they feel?
// 4. **Knowledge Gaps**: What questions remain unanswered?
// 5. **Natural Next Steps**: Where is this conversation naturally heading?

// **Output Format**: 2-3 sentences that synthesize the most important context for continuing this conversation productively.

// **Focus on**: Insights over events, progress over process, context over chronology.

// Summary:`;
// };
