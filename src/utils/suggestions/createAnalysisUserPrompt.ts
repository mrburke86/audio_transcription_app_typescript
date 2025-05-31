import { AnalysisPreview, InitialInterviewContext } from '@/types';

export async function createAnalysisUserPrompt(
    conversationSummary: string,
    initialInterviewContext: InitialInterviewContext | null,
    knowledgeContext?: string,
    previousAnalysisHistory?: AnalysisPreview[]
): Promise<string> {
    const currentDateTime = new Date().toISOString().split('T')[0];

    const interviewContext = initialInterviewContext
        ? `
## Interview Strategic Context:
- **Target Role**: ${initialInterviewContext.targetRole} at ${initialInterviewContext.targetCompany}
- **Interview Type**: ${initialInterviewContext.interviewType}
- **Company Profile**: ${initialInterviewContext.companySizeType} ${initialInterviewContext.industry} company
- **Seniority Level**: ${initialInterviewContext.seniorityLevel}
- **Key Experiences**: ${initialInterviewContext.emphasizedExperiences.join(', ') || 'General experience'}
- **Strategic Challenges**: ${initialInterviewContext.specificChallenges.join(', ') || 'None specified'}
- **Company Context**: ${initialInterviewContext.companyContext.join(', ') || 'Limited context'}
`
        : '## Interview Context: General interview assistance needed';

    const knowledgeSection = knowledgeContext
        ? `
## Available Knowledge Intelligence:
${knowledgeContext.substring(0, 2000)}${knowledgeContext.length > 2000 ? '\n[... additional strategic context available ...]' : ''}
`
        : '## Knowledge Base: Limited specific intelligence available';

    const conversationSection =
        conversationSummary && conversationSummary.trim()
            ? `## Conversation Arc Analysis:
${conversationSummary}

**Strategic Question**: Based on this conversation flow, where are the biggest opportunities to demonstrate exceptional expertise, provide industry insights, or reveal strategic thinking that would genuinely impress the interviewer?`
            : `## Conversation Status: Early stage interview - prime opportunity for strategic positioning`;

    // Enhanced previous analysis context
    const previousAnalysisSection =
        previousAnalysisHistory && previousAnalysisHistory.length > 0
            ? `
## Previous Strategic Intelligence Generated:
**IMPORTANT**: To ensure variety and freshness, avoid repeating these approaches:

${previousAnalysisHistory
    .map(
        (prev, index) => `
### Previous Analysis #${index + 1}:
- **Strategic Opportunity**: ${prev.strategic_opportunity}
- **Focus Area**: ${prev.focus_area}
- **Insight Summary**: ${prev.insight_summary}
`
    )
    .join('')}

**Mandate**: Choose a DIFFERENT strategic opportunity type or explore a significantly different angle within the same type. Avoid repetition and ensure fresh perspective.`
            : `
## Previous Strategic Intelligence: None - This is the first analysis
**Opportunity**: Fresh start - can choose any strategic opportunity type that best fits the situation.`;

    return `**STRATEGIC INTELLIGENCE ANALYSIS REQUEST**

Analyze this interview situation to identify the highest-value opportunities for delivering mind-blowing insights that position the candidate as exceptional.

${interviewContext}${conversationSection}${knowledgeSection}${previousAnalysisSection}

## Strategic Analysis Task:
Look beyond the immediate conversation and identify opportunities where we can:

1. **Deliver Industry Insights** - Cutting-edge trends, market intelligence, competitive landscape
2. **Reveal Hidden Connections** - Non-obvious links between concepts, industries, or strategies  
3. **Provide Data-Driven Evidence** - Research, case studies, real-world examples
4. **Demonstrate Thought Leadership** - Forward-thinking vision and strategic perspectives
5. **Showcase Unique Positioning** - How this candidate stands out from all others
6. **Create Wow Moments** - Insights that make the interviewer think "I hadn't considered that"

## Current Date: ${currentDateTime}

## Intelligence Opportunity Assessment:
Consider all available sources:
- **LLM Knowledge**: What industry/market/competitive insights can we leverage?
- **Knowledge Base**: What unique context from files can create competitive advantage?
- **Research Potential**: What real-world examples or data would be compelling?
- **Strategic Connections**: What non-obvious links can demonstrate strategic thinking?

## Variety Requirements:
${
    previousAnalysisHistory && previousAnalysisHistory.length > 0
        ? `- **AVOID REPETITION**: Do not repeat previous strategic opportunities: ${previousAnalysisHistory
              .map(p => p.strategic_opportunity)
              .join(', ')}
- **EXPLORE NEW ANGLES**: Choose different focus areas from previous: ${previousAnalysisHistory.map(p => p.focus_area).join(', ')}
- **FRESH PERSPECTIVE**: Provide genuinely different strategic intelligence direction`
        : '- **FRESH START**: Choose the most impactful strategic opportunity for this situation'
}

**Required JSON Response:**
    {
      "strategic_opportunity": "[thought_leadership/competitive_intelligence/data_storytelling/hidden_connections/future_vision/real_world_evidence]",
      "focus_area": "[Specific focus within the chosen opportunity type]",
      "insight_potential": "[Specific type of mind-blowing insight that's possible]",
      "knowledge_leverage": "[How to best combine LLM knowledge + knowledge base + research]", 
      "differentiation_angle": "[How this positions candidate as uniquely exceptional]",
      "research_suggestions": "[What additional intelligence would make this even more impressive]"
    }

Focus on strategic opportunities that go beyond reactive responses to create genuine "wow" moments that demonstrate the candidate's exceptional caliber, while ensuring variety from previous analyses.`;
}
