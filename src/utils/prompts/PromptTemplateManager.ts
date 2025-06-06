// src/utils/prompts/PromptTemplateManager.ts
import { CallContext } from '@/types';
import { logger } from '@/modules';
import { PROMPT_INSTRUCTIONS } from './PromptInstructions';

export interface PromptContext {
    callContext: CallContext;
    taskType: 'response' | 'analysis' | 'generation' | 'summary';
    userMessage?: string;
    knowledgeContext?: string;
    conversationSummary?: string;
    previousAnalysis?: Record<string, unknown>[];
}

export interface PromptOptions {
    verbosity?: 'brief' | 'moderate' | 'detailed';
    includeExamples?: boolean;
}

/**
 * Simplified Prompt Template Manager
 * Generates only 2 prompts (system + user) that adapt based on context
 */
export class PromptTemplateManager {
    private static initialized = false;

    static initialize() {
        if (this.initialized) return;
        this.initialized = true;
        logger.debug('PromptTemplateManager initialized');
    }

    /**
     * Build system prompt that adapts based on task type
     */
    static buildSystemPrompt(context: PromptContext, options: PromptOptions = {}): string {
        this.initialize();

        const sections: string[] = [];

        // Base role definition based on task type
        sections.push(this.getSystemRole(context));

        // Core instructions (always included)
        sections.push('\n## Core Instructions:');
        PROMPT_INSTRUCTIONS.core.forEach(instruction => {
            sections.push(`• ${instruction}`);
        });

        // Context-specific instructions
        if (context.taskType === 'response') {
            sections.push('\n## Response Guidelines:');
            sections.push(this.getResponseGuidelines(context.callContext, options));
        }

        // Quality standards
        sections.push('\n## Quality Standards:');
        sections.push(this.getQualityStandards(context));

        // Output format requirements
        sections.push('\n## Output Requirements:');
        sections.push(this.getOutputRequirements(context, options));

        return sections.join('\n');
    }

    /**
     * Build user prompt that provides context and the specific request
     */
    static buildUserPrompt(context: PromptContext, options: PromptOptions = {}): string {
        this.initialize();

        const sections: string[] = [];

        // Add relevant context based on task type
        if (context.knowledgeContext?.trim()) {
            sections.push('**Relevant Knowledge:**');
            const maxLength = options.verbosity === 'brief' ? 1500 : 2500;
            sections.push(this.truncateContent(context.knowledgeContext, maxLength));
            sections.push('');
        }

        if (context.conversationSummary?.trim() && context.taskType !== 'summary') {
            sections.push('**Conversation Context:**');
            sections.push(context.conversationSummary);
            sections.push('');
        }

        if (context.previousAnalysis?.length) {
            sections.push('**Previous Analysis (avoid repetition):**');
            context.previousAnalysis.forEach((analysis, idx) => {
                sections.push(`${idx + 1}. ${analysis.strategic_opportunity}: ${analysis.focus_area}`);
            });
            sections.push('');
        }

        // Add the specific request
        sections.push(this.getUserRequest(context));

        return sections.join('\n');
    }

    /**
     * Get system role based on task type
     */
    private static getSystemRole(context: PromptContext): string {
        const { taskType, callContext } = context;

        switch (taskType) {
            case 'response':
                return this.getResponseSystemRole(callContext);
            case 'analysis':
                return 'You are an elite strategic analyst identifying opportunities for exceptional responses that position the speaker as a thought leader.';
            case 'generation':
                return 'You are a master strategic intelligence generator creating genuinely impressive insights that demonstrate exceptional thinking.';
            case 'summary':
                return 'You are an expert conversation summarizer specializing in extracting key strategic insights and business impact from dialogue.';
            default:
                return 'You are an expert communication assistant.';
        }
    }

    /**
     * Get response system role based on call type
     */
    private static getResponseSystemRole(callContext: CallContext): string {
        const callTypeRoles: Record<string, string> = {
            'job-interview':
                'You are an expert interview response generator creating world-class, first-person responses that establish thought leadership and strategic positioning.',
            'performance-review':
                'You are a career development expert generating thoughtful, balanced responses that demonstrate growth mindset and professional maturity.',
            'sales-call':
                'You are a master sales strategist crafting compelling, value-driven responses that build trust and advance business relationships.',
            'customer-support':
                'You are a customer success expert providing helpful, empathetic responses that resolve issues and build customer satisfaction.',
            'client-meeting':
                'You are a strategic business advisor generating professional, insightful responses that demonstrate expertise and build client confidence.',
            'team-meeting':
                'You are a collaborative team leader crafting responses that foster engagement, clarity, and productive dialogue.',
            negotiation:
                'You are a skilled negotiation strategist crafting responses that balance assertiveness with collaboration to achieve optimal outcomes.',
            'project-discussion':
                'You are a project management expert generating clear, actionable responses that drive progress and alignment.',
            'hiring-call':
                'You are a talent acquisition specialist crafting responses that evaluate candidates effectively while representing the organization positively.',
            'termination-call':
                'You are an HR professional generating respectful, clear responses that handle difficult conversations with dignity and compliance.',
            'discipline-call':
                'You are an HR expert crafting firm but fair responses that address performance issues constructively.',
            'dating-ask':
                'You are a confident, authentic communicator helping express romantic interest respectfully and genuinely.',
            'relationship-talk':
                'You are a relationship communication expert helping navigate important conversations with empathy and clarity.',
            'breakup-call':
                'You are a compassionate communicator helping handle difficult relationship endings with respect and care.',
            'family-call':
                'You are a family communication specialist helping navigate family dynamics with understanding and warmth.',
            'friend-checkin':
                'You are a supportive friend helping maintain meaningful connections through genuine, caring dialogue.',
            'conflict-resolution':
                'You are a conflict resolution expert helping find common ground and restore positive relationships.',
            'support-call':
                'You are an empathetic support provider offering comfort, understanding, and helpful guidance.',
            'celebration-call':
                'You are an enthusiastic communicator helping share joy and celebrate achievements authentically.',
            'technical-support':
                'You are a technical expert providing clear, patient guidance to resolve technical issues effectively.',
            'medical-consultation':
                'You are a medical communication facilitator helping gather and convey health information clearly and accurately.',
            'legal-consultation':
                'You are a legal communication assistant helping articulate legal matters clearly and professionally.',
            'financial-advice':
                'You are a financial communication expert helping discuss financial matters with clarity and professionalism.',
            'dispute-resolution':
                'You are a dispute resolution specialist crafting balanced responses that work toward fair solutions.',
            'emergency-call':
                'You are a crisis communication expert providing clear, calm responses in urgent situations.',
        };

        return (
            callTypeRoles[callContext.call_type] ||
            'You are an expert communication specialist generating professional, thoughtful responses appropriate to the context.'
        );
    }

    /**
     * Get response guidelines based on call context
     */
    private static getResponseGuidelines(callContext: CallContext, options: PromptOptions = {}): string {
        const guidelines = [
            `- Call Type: ${this.formatCallType(callContext.call_type)}`,
            `- Context: ${callContext.call_context}`,
            `- Urgency: ${callContext.urgency_level}`,
            `- Tone: ${callContext.desired_tone}`,
            `- Style: ${callContext.response_style}`,
            `- Verbosity: ${options.verbosity || callContext.verbosity}`,
        ];

        if (callContext.target_role && callContext.target_organization) {
            guidelines.unshift(`- Target: ${callContext.target_role} at ${callContext.target_organization}`);
        }

        if (callContext.key_points?.length) {
            guidelines.push(`- Key Points: ${callContext.key_points.join(', ')}`);
        }

        return guidelines.join('\n');
    }

    /**
     * Get quality standards based on context
     */
    private static getQualityStandards(context: PromptContext): string {
        const standards = {
            response: [
                '- Provide unique perspectives with specific examples',
                '- Demonstrate strategic thinking beyond obvious solutions',
                '- Use confident, authoritative language',
                '- Connect responses to broader implications',
                '- Match tone and style to the specified context',
            ],
            analysis: [
                '- Identify genuinely unique opportunities',
                '- Consider multiple strategic angles',
                '- Adapt insights to the specific context',
                '- Ensure variety from previous analyses',
                '- Focus on actionable intelligence',
            ],
            generation: [
                '- Create multi-dimensional strategic insights',
                '- Include specific examples and evidence',
                '- Generate genuine "wow factor" content',
                '- Ensure immediate applicability',
                '- Balance depth with clarity',
            ],
            summary: [
                '- Capture strategic substance and impact',
                '- Highlight quantifiable achievements',
                '- Preserve key methodologies and frameworks',
                '- Maintain narrative flow and context',
                '- Use bold formatting for emphasis',
            ],
        };

        return standards[context.taskType]?.join('\n') || '- Provide high-quality, contextually appropriate content';
    }

    /**
     * Get output requirements based on context
     */
    private static getOutputRequirements(context: PromptContext, options: PromptOptions = {}): string {
        const { taskType, callContext } = context;
        const verbosity = options.verbosity || callContext.verbosity || 'moderate';

        switch (taskType) {
            case 'response':
                return `Generate a first-person response that:
- Length: ${verbosity === 'brief' ? '3-4' : verbosity === 'detailed' ? '6-8' : '4-6'} sentences
- Style: ${callContext.response_style} format
- Tone: ${callContext.desired_tone} with ${callContext.communication_approach} approach
- Include 2-3 **bold** key insights for emphasis`;

            case 'analysis':
                return `Output your analysis in this JSON format:
{
  "strategic_opportunity": "[opportunity_type]",
  "focus_area": "[specific_focus]",
  "insight_potential": "[type_of_insight]",
  "differentiation_angle": "[unique_positioning]",
  "context_adaptation": "[how_to_adapt_for_context]"
}`;

            case 'generation':
                return `Structure your strategic intelligence as:
# 🧠 [Strategic Type] - [Specific Focus]

## 🎯 Strategic Context
[Why this intelligence is valuable]

## 💡 Key Insights
### [Insight 1]
[Specific insight with evidence]

### [Insight 2]
[Different valuable intelligence]

## 🗣️ Implementation
- **Opening**: [Natural introduction]
- **Evidence**: [Supporting examples]
- **Impact**: [Value demonstration]`;

            case 'summary':
                return `Format each Q&A exchange as:
### Question
[Concise summary of key intent]

### Response
[Strategic summary with **bold** metrics and insights]`;

            default:
                return 'Provide a clear, well-structured response.';
        }
    }

    /**
     * Get user request based on context
     */
    private static getUserRequest(context: PromptContext): string {
        const { taskType, userMessage, callContext } = context;

        switch (taskType) {
            case 'response':
                return `**Current Request:**
${userMessage}

Generate a first-person response demonstrating expertise and ${
                    callContext.communication_approach
                } communication appropriate to this ${this.formatCallType(callContext.call_type)} context.`;

            case 'analysis':
                return `**Analyze this situation** to identify the most valuable strategic opportunity for an exceptional response. Consider the conversation context and available knowledge to find unique angles that differentiate the speaker.`;

            case 'generation':
                return `**Generate strategic intelligence** based on the analysis above. Create genuinely impressive insights that demonstrate thought leadership and strategic thinking.`;

            case 'summary':
                return `**Summarize this conversation:**
${userMessage}

Focus on strategic content, business impact, and key insights while maintaining the flow of dialogue.`;

            default:
                return userMessage || 'Process this request according to the context provided.';
        }
    }

    /**
     * Helper: Format call type for display
     */
    private static formatCallType(callType: string): string {
        return callType
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Helper: Truncate content while preserving sentence boundaries
     */
    private static truncateContent(content: string, maxLength: number): string {
        if (content.length <= maxLength) return content;

        const truncated = content.substring(0, maxLength);
        const lastSentence = truncated.lastIndexOf('.');

        if (lastSentence > maxLength * 0.8) {
            return truncated.substring(0, lastSentence + 1) + '\n[...additional context available...]';
        }

        return truncated + '...\n[...additional context available...]';
    }
}

// Note: Export convenience functions are moved to unifiedPrompts.ts
// This keeps the PromptTemplateManager focused on template logic only
