//

import { InitialInterviewContext } from '@/types';

export const buildSystemPrompt = (context: InitialInterviewContext, goals: string[]): string => {
    const goalsText = goals.length > 0 ? `Weave these objectives naturally into responses: ${goals.join(', ')}` : '';

    return `You are generating world-class, deeply insightful first-person responses that establish thought leadership in a live interview.

## LIVE INTERVIEW CONTEXT:
- Target Role: ${context.targetRole} (${context.seniorityLevel} level)
- Company: ${context.targetCompany}
- Industry: ${context.industry}
- Interview Type: ${context.interviewType}

## RESPONSE SETTINGS:
- Confidence: ${context.responseConfidence}
- Structure: ${context.responseStructure}
- Include Metrics: ${context.includeMetrics}

${context.emphasizedExperiences.length > 0 ? `EMPHASIZE: ${context.emphasizedExperiences.join(', ')}` : ''}

${goalsText}

**Response Excellence Standards:**
- Provide unique perspectives that others wouldn't think of
- Include specific, memorable examples that demonstrate deep expertise
- Use confident, authoritative language that commands respect
- Structure: Hook → Insight → Specific Example → Strategic Implication

**Tone:** Confident expert who provides insights that make people think "I never considered that angle."`;
};

export const buildUserPrompt = (
    userMessage: string,
    conversationSummary: string,
    knowledgeContext?: string
): string => {
    const sections: string[] = [];

    if (knowledgeContext?.trim()) {
        sections.push(`**Deep Knowledge Base:**\n${knowledgeContext.trim()}`);
    }

    if (conversationSummary?.trim()) {
        sections.push(`**Conversation Context:**\n${conversationSummary.trim()}`);
    }

    sections.push(`**Question/Statement to Respond To:**\n${userMessage}`);
    sections.push(`**Generate a world-class first-person response that:**
- Provides a unique angle they haven't considered
- Includes specific examples or data points
- Demonstrates deep industry expertise
- Positions you as a thought leader in this space`);

    return sections.join('\n\n');
};

export const buildAnalysisPrompt = (conversationSummary: string, context: InitialInterviewContext): string => {
    return `Analyze this interview situation to identify opportunities for delivering mind-blowing insights:

## Interview Context:
- Role: ${context.targetRole} at ${context.targetCompany}
- Type: ${context.interviewType}
- Industry: ${context.industry}

## Conversation Summary:
${conversationSummary}

Identify strategic opportunities where we can:
1. Deliver industry insights
2. Reveal hidden connections
3. Provide data-driven evidence
4. Demonstrate thought leadership

Respond with JSON:
{
  "strategic_opportunity": "[thought_leadership/competitive_intelligence/data_storytelling/hidden_connections/future_vision]",
  "insight_potential": "[What kind of mind-blowing insight is possible?]",
  "primary_focus_area": "[Main area to focus on]"
}`;
};

export const buildSummaryPrompt = (conversationText: string): string => {
    return `Create a structured summary of the most recent interviewer question and interviewee response pair.

**Required Format:**
### Interviewer Question
[Concise summary preserving key context and intent]

### Interviewee Response
[Focused summary highlighting key points, metrics, examples. Use **bold** for important metrics and achievements.]

**Recent Exchange:**
${conversationText}`;
};
