// src/utils/createGenerationUserPrompt.ts
import { AnalysisPreview, InitialInterviewContext, StrategicAnalysis } from '@/types';

export async function createGenerationUserPrompt(
    analysis: StrategicAnalysis,
    initialInterviewContext: InitialInterviewContext | null,
    knowledgeContext?: string,
    previousAnalysisHistory?: AnalysisPreview[]
): Promise<string> {
    const contextSection = initialInterviewContext
        ? `
## Strategic Interview Context:
- **Target Role**: ${initialInterviewContext.targetRole} at ${initialInterviewContext.targetCompany}
- **Company Profile**: ${initialInterviewContext.companySizeType} ${initialInterviewContext.industry} company
- **Interview Type**: ${initialInterviewContext.interviewType}
- **Seniority Level**: ${initialInterviewContext.seniorityLevel}
- **Experience Assets**: ${initialInterviewContext.emphasizedExperiences.join(', ') || 'General experience'}
- **Strategic Challenges**: ${initialInterviewContext.specificChallenges.join(', ') || 'None specified'}
- **Company Intelligence**: ${initialInterviewContext.companyContext.join(', ') || 'Limited company context'}
- **Response Style**: ${initialInterviewContext.responseConfidence} confidence, ${initialInterviewContext.responseStructure} structure
- **Metrics Focus**: ${
              initialInterviewContext.includeMetrics
                  ? 'Include quantified achievements and data points'
                  : 'Focus on qualitative strategic impact'
          }
`
        : '## Strategic Context: General high-level interview intelligence needed';

    const knowledgeSection = knowledgeContext
        ? `
## Strategic Knowledge Base:
${knowledgeContext.substring(0, 2500)}${
              knowledgeContext.length > 2500 ? '\n\n[... additional strategic intelligence available for deeper insights ...]' : ''
          }
`
        : '## Knowledge Base: Limited specific intelligence - rely on broader strategic knowledge';

    // Enhanced previous context for generation
    const previousContextSection =
        previousAnalysisHistory && previousAnalysisHistory.length > 0
            ? `
## Previous Strategic Intelligence Context:
**IMPORTANT**: Ensure this generation provides FRESH insights and avoids repeating previous content:

${previousAnalysisHistory
    .map(
        (prev, index) => `
### Previous Intelligence #${index + 1}:
- **Type**: ${prev.strategic_opportunity}
- **Focus**: ${prev.focus_area}  
- **Insights Covered**: ${prev.insight_summary}
`
    )
    .join('')}

**Generation Mandate**: 
- Create completely DIFFERENT strategic insights from previous generations
- Explore NEW angles within your chosen ${analysis.strategic_opportunity} approach
- Provide FRESH data, examples, and perspectives not previously covered
- Ensure this intelligence offers genuinely different value from past outputs`
            : `
## Previous Strategic Intelligence: None - Fresh start
**Generation Opportunity**: This is the first strategic intelligence - make it exceptional and comprehensive.`;

    return `**STRATEGIC INTELLIGENCE GENERATION REQUEST**

Create genuinely impressive strategic intelligence that will blow the interviewer's mind and position me as an exceptional thought leader.

## Strategic Analysis Results:
- **Primary Opportunity**: ${analysis.strategic_opportunity}
- **Specific Focus Area**: ${analysis.focus_area}
- **Insight Potential**: ${analysis.insight_potential}
- **Knowledge Leverage Strategy**: ${analysis.knowledge_leverage}
- **Differentiation Angle**: ${analysis.differentiation_angle}
- **Research Enhancement**: ${analysis.research_suggestions}

${contextSection}${knowledgeSection}${previousContextSection}

## Strategic Intelligence Mission:
Create **multiple different types** of genuinely impressive insights that:

1. **Go Beyond the Obvious** - Provide insights that aren't readily available elsewhere
2. **Demonstrate Strategic Thinking** - Show I think at a higher level than typical candidates
3. **Leverage Multiple Sources** - Combine your knowledge + knowledge base + research insights
4. **Create Wow Moments** - Include information that makes the interviewer think "I hadn't considered that"
5. **Position as Thought Leader** - Show I understand industry dynamics at an advanced level
6. **Provide Real Evidence** - Include specific examples, data points, case studies where relevant
7. **Ensure Freshness** - Deliver completely different insights from any previous intelligence

## Intelligence Generation Focus:
**Primary Direction**: ${analysis.strategic_opportunity} with focus on ${analysis.focus_area}

### Specific Requirements for ${analysis.strategic_opportunity}:
${
    analysis.strategic_opportunity === 'thought_leadership'
        ? '- Industry evolution predictions with evidence\n- Contrarian insights backed by data\n- Strategic frameworks that demonstrate advanced thinking\n- Vision for how trends will reshape the landscape'
        : analysis.strategic_opportunity === 'competitive_intelligence'
        ? "- Market positioning opportunities others miss\n- Competitive advantage analysis with specific examples\n- Industry dynamics that create strategic openings\n- Partnership/synergy opportunities that aren't obvious"
        : analysis.strategic_opportunity === 'data_storytelling'
        ? '- Research-backed insights with compelling narratives\n- Market evidence that supports strategic decisions\n- Performance benchmarks with strategic implications\n- ROI analysis with real-world proof points'
        : analysis.strategic_opportunity === 'hidden_connections'
        ? '- Cross-industry insights that apply to current situation\n- Non-obvious strategic parallels from other domains\n- Unexpected applications of successful strategies\n- Systems thinking that reveals deeper patterns'
        : analysis.strategic_opportunity === 'future_vision'
        ? '- Technology evolution implications for business strategy\n- Regulatory/market changes that create opportunities\n- Consumer behavior shifts with strategic implications\n- Innovation opportunities ahead of the curve'
        : '- Case studies that illustrate strategic principles\n- Success/failure stories with actionable lessons\n- Market examples that prove theoretical concepts\n- Quantified results from similar strategic initiatives'
}

## Quality Requirements:
- **Multiple Independent Elements** - Provide 3-4 different types of valuable insights within the ${analysis.strategic_opportunity} theme
- **Research-Backed** - Include specific examples, data, real-world evidence where possible
- **Strategic Depth** - Go beyond surface-level to reveal deeper patterns
- **Impressive Factor** - Every element should genuinely impress a sophisticated interviewer
- **Actionable Intelligence** - Information I can actually use to demonstrate expertise
- **Freshness Guarantee** - Completely different from any previous strategic intelligence generated

**Output the complete markdown strategic intelligence** - create content that makes the interviewer think "This person is operating on a completely different level than other candidates."

Focus on delivering genuine strategic intelligence that showcases exceptional thinking within the ${
        analysis.strategic_opportunity
    } domain, specifically targeting ${analysis.focus_area}, while ensuring complete freshness from previous generations.`;
}
