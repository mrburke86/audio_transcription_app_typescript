// src/lib/generatePrompt.ts
import { CallContext, Participant, CallObjective } from '@/types/callContext';
import { PROMPT_TEMPLATES } from '@/lib/promptTemplates';

interface PromptGenerationOptions {
    knowledgeContext?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
    currentMessage?: string;
    includeAnalytics?: boolean;
}

interface GeneratedPrompts {
    systemPrompt: string;
    userPrompt: string;
    metadata: {
        callType: string;
        callContext: string;
        privacyLevel: string;
        knowledgeEnabled: boolean;
        timestamp: Date;
    };
}

export function generatePrompt(callContext: CallContext, options: PromptGenerationOptions = {}): GeneratedPrompts {
    const { knowledgeContext, conversationHistory, currentMessage, includeAnalytics = false } = options;

    // Build system prompt
    const systemPrompt = buildSystemPrompt(callContext, knowledgeContext);

    // Build user prompt
    const userPrompt = buildUserPrompt(callContext, conversationHistory, currentMessage);

    return {
        systemPrompt,
        userPrompt,
        metadata: {
            callType: callContext.call_type,
            callContext: callContext.call_context,
            privacyLevel: callContext.sensitivity_level,
            knowledgeEnabled: callContext.knowledge_search_enabled,
            timestamp: new Date(),
        },
    };
}

function buildSystemPrompt(callContext: CallContext, knowledgeContext?: string): string {
    const sections: string[] = [];

    // 1. Core role definition
    sections.push(buildRoleDefinition(callContext));

    // 2. Context-specific instructions
    sections.push(buildContextInstructions(callContext));

    // 3. Communication guidelines
    sections.push(buildCommunicationGuidelines(callContext));

    // 4. Knowledge integration (if enabled)
    if (callContext.knowledge_search_enabled && knowledgeContext) {
        sections.push(buildKnowledgeInstructions(callContext, knowledgeContext));
    }

    // 5. Response formatting instructions
    sections.push(buildResponseFormatting(callContext));

    // 6. Privacy and safety guidelines
    sections.push(buildPrivacyGuidelines(callContext));

    // 7. Call-specific objectives and strategy
    sections.push(buildObjectiveGuidance(callContext));

    return sections.join('\n\n');
}

function buildRoleDefinition(callContext: CallContext): string {
    const baseTemplate = PROMPT_TEMPLATES.SYSTEM_PROMPTS.BASE_ROLE;

    const roleDescriptions = {
        professional:
            'You are an expert AI communication assistant specializing in professional business interactions.',
        personal: 'You are a supportive AI communication guide focused on personal relationships and conversations.',
        service: 'You are a specialized AI assistant for service-oriented communications and support interactions.',
        emergency: 'You are an AI communication assistant designed to help with crisis and emergency situations.',
    };

    const callTypeDescriptions = {
        'sales-call': 'sales conversations, business development, and revenue generation',
        'job-interview': 'job interviews, career discussions, and professional evaluations',
        'customer-support': 'customer service, technical support, and issue resolution',
        'relationship-talk': 'personal relationships, emotional conversations, and interpersonal dynamics',
        'family-call': 'family communications, planning, and relationship management',
        'emergency-call': 'crisis situations requiring immediate, clear, and effective communication',
        negotiation: 'business negotiations, deal-making, and agreement discussions',
        'team-meeting': 'team collaboration, project coordination, and group dynamics',
    };

    const roleDescription = roleDescriptions[callContext.call_context];
    const specialization = callTypeDescriptions[callContext.call_type] || 'general communication scenarios';

    return `${roleDescription} You specialize in ${specialization}.

Your primary function is to provide real-time guidance, suggestions, and strategic insights to help the user navigate their conversation effectively while maintaining appropriate professional and ethical boundaries.

**Core Competencies:**
- Strategic communication planning and execution
- Real-time conversation guidance and response suggestions
- Emotional intelligence and interpersonal dynamics
- Context-aware advice tailored to specific scenarios
- Privacy-conscious and ethically responsible assistance`;
}

function buildContextInstructions(callContext: CallContext): string {
    const contextTemplates = {
        professional: PROMPT_TEMPLATES.SYSTEM_PROMPTS.PROFESSIONAL_CONTEXT,
        personal: PROMPT_TEMPLATES.SYSTEM_PROMPTS.PERSONAL_CONTEXT,
        service: PROMPT_TEMPLATES.SYSTEM_PROMPTS.SERVICE_CONTEXT,
        emergency: PROMPT_TEMPLATES.SYSTEM_PROMPTS.EMERGENCY_CONTEXT,
    };

    let instructions = contextTemplates[callContext.call_context];

    // Add urgency considerations
    if (callContext.urgency_level === 'critical') {
        instructions +=
            '\n\n**CRITICAL URGENCY**: Prioritize immediate, actionable guidance. Keep responses concise and focused on essential points only.';
    } else if (callContext.urgency_level === 'high') {
        instructions += '\n\n**HIGH URGENCY**: Focus on efficient, time-sensitive guidance while maintaining quality.';
    }

    // Add call-type specific considerations
    const callTypeAdditions = {
        'sales-call':
            '\n\nFocus on: Value demonstration, objection handling, relationship building, and advancing the sales process.',
        'job-interview':
            '\n\nFocus on: Showcasing qualifications, cultural fit assessment, strategic questioning, and mutual evaluation.',
        'customer-support':
            '\n\nFocus on: Issue resolution, customer satisfaction, relationship preservation, and process improvement.',
        'relationship-talk':
            '\n\nFocus on: Emotional understanding, communication improvement, conflict resolution, and relationship strengthening.',
        'emergency-call':
            '\n\nFocus on: Safety first, clear action steps, resource identification, and crisis de-escalation.',
        negotiation: '\n\nFocus on: Value creation, mutual benefit, strategic positioning, and agreement achievement.',
    };

    if (callTypeAdditions[callContext.call_type]) {
        instructions += callTypeAdditions[callContext.call_type];
    }

    return instructions;
}

function buildCommunicationGuidelines(callContext: CallContext): string {
    const toneGuidelines = {
        professional: 'Maintain a business-appropriate, confident, and respectful tone.',
        friendly: 'Use a warm, approachable, and personable communication style.',
        empathetic: 'Demonstrate understanding, compassion, and emotional sensitivity.',
        assertive: 'Be direct, confident, and clear while remaining respectful.',
        casual: 'Adopt a relaxed, informal, and conversational approach.',
        formal: 'Use structured, traditional, and highly respectful language.',
    };

    const approachGuidelines = {
        direct: 'Provide straightforward, clear, and unambiguous guidance.',
        diplomatic: 'Suggest tactful, considerate, and politically aware responses.',
        collaborative: 'Emphasize partnership, teamwork, and inclusive approaches.',
        supportive: 'Focus on encouragement, assistance, and solution-oriented guidance.',
        persuasive: 'Help craft influential, compelling, and results-driven communication.',
    };

    return `**COMMUNICATION STYLE GUIDELINES:**

**Tone**: ${toneGuidelines[callContext.desired_tone]}

**Approach**: ${approachGuidelines[callContext.communication_approach]}

**Verbosity**: ${
        callContext.verbosity === 'brief'
            ? 'Keep responses concise and to the point.'
            : callContext.verbosity === 'detailed'
            ? 'Provide comprehensive and thorough guidance.'
            : 'Balance detail with efficiency - provide necessary context without overwhelming.'
    }

**Power Dynamic Consideration**: ${
        callContext.power_dynamic === 'you-higher'
            ? 'User has authority in this relationship - suggest confident, leadership-oriented approaches.'
            : callContext.power_dynamic === 'them-higher'
            ? 'Other party has authority - recommend respectful, strategic approaches that demonstrate value.'
            : 'Equal power dynamic - focus on collaborative and mutually beneficial strategies.'
    }`;
}

function buildKnowledgeInstructions(callContext: CallContext, knowledgeContext: string): string {
    let instructions = `**KNOWLEDGE BASE INTEGRATION:**

You have access to the user's knowledge base containing relevant information for this call. Use this information to:
- Provide personalized and contextually relevant suggestions
- Reference specific experiences, achievements, or background information
- Ensure consistency with the user's established approach and methodology
- Draw upon relevant case studies, templates, or proven strategies

**Available Knowledge Context:**
${knowledgeContext}

**Knowledge Usage Guidelines:**`;

    if (callContext.knowledge_search_scope === 'professional-only') {
        instructions +=
            '\n- SCOPE LIMITATION: Only reference professional/business-related information from the knowledge base.';
    } else if (callContext.knowledge_search_scope === 'personal-only') {
        instructions +=
            '\n- SCOPE LIMITATION: Only reference personal/relationship-related information from the knowledge base.';
    }

    instructions += `
- Always cite specific examples when available
- Maintain accuracy - don't embellish or assume details not provided
- Respect the privacy level set for this call (${callContext.sensitivity_level})
- Integrate knowledge naturally without overwhelming the user`;

    return instructions;
}

function buildResponseFormatting(callContext: CallContext): string {
    const formatGuidelines = {
        structured: `**RESPONSE FORMAT: Structured**
- Use clear sections with headers
- Organize information logically
- Include bullet points for key items
- Provide step-by-step guidance when appropriate`,

        conversational: `**RESPONSE FORMAT: Conversational**
- Use natural, flowing language
- Integrate guidance seamlessly into advice
- Avoid rigid formatting unless necessary
- Focus on readability and ease of understanding`,

        'bullet-points': `**RESPONSE FORMAT: Bullet Points**
- Present information as concise bullet points
- Prioritize scannable, quick-reference format
- Use sub-bullets for detailed breakdowns
- Lead with the most important points`,

        'script-like': `**RESPONSE FORMAT: Script-like**
- Provide detailed, word-for-word suggestions when helpful
- Include both "what to say" and "why to say it"
- Offer alternative phrasings for different scenarios
- Structure as actionable talking points`,
    };

    let formatting = formatGuidelines[callContext.response_style];

    // Add guidance type preferences
    if (callContext.include_emotional_guidance) {
        formatting +=
            '\n\n**EMOTIONAL GUIDANCE**: Include insights about emotional dynamics, empathy strategies, and interpersonal sensitivity.';
    }

    if (callContext.include_professional_tips) {
        formatting +=
            '\n\n**PROFESSIONAL TIPS**: Provide business etiquette, best practices, and strategic considerations.';
    }

    return formatting;
}

function buildPrivacyGuidelines(callContext: CallContext): string {
    const privacyLevels = {
        public: 'Standard privacy considerations apply.',
        confidential:
            'Treat all information as business confidential. Avoid suggesting disclosure of sensitive business information.',
        personal:
            'Respect personal privacy boundaries. Be mindful of emotional sensitivity and personal information sharing.',
        'highly-sensitive':
            'MAXIMUM PRIVACY: Extremely careful handling required. Limit suggestions that might expose sensitive information. Prioritize safety and privacy over optimization.',
    };

    let guidelines = `**PRIVACY AND SAFETY GUIDELINES:**

**Sensitivity Level**: ${callContext.sensitivity_level.toUpperCase()}
${privacyLevels[callContext.sensitivity_level]}

**General Privacy Principles:**
- Never suggest sharing information that could compromise privacy or safety
- Respect all participants' confidentiality
- Consider legal and ethical implications of suggested communications
- Prioritize user safety and well-being above all else`;

    // Emergency call specific safety
    if (callContext.call_type === 'emergency-call') {
        guidelines += `

**EMERGENCY PROTOCOL:**
- Safety is the absolute priority
- Encourage contacting appropriate emergency services when necessary
- Provide clear, actionable steps
- Avoid complex strategies - focus on immediate safety and resolution
- Document important information for follow-up`;
    }

    // Personal context specific privacy
    if (callContext.call_context === 'personal') {
        guidelines += `

**PERSONAL CONTEXT PRIVACY:**
- Respect emotional boundaries and comfort levels
- Consider long-term relationship impacts
- Be sensitive to family dynamics and personal history
- Avoid pushing for disclosure of deeply personal information`;
    }

    return guidelines;
}

function buildObjectiveGuidance(callContext: CallContext): string {
    if (!callContext.objectives || callContext.objectives.length === 0) {
        return '**OBJECTIVES**: No specific objectives defined. Focus on general best practices for effective communication.';
    }

    let guidance = '**CALL OBJECTIVES AND STRATEGY:**\n\n';

    callContext.objectives.forEach((objective, index) => {
        guidance += `**Objective ${index + 1}**: ${objective.primary_goal}\n`;

        if (objective.success_metrics && objective.success_metrics.length > 0) {
            guidance += `Success Metrics: ${objective.success_metrics.join(', ')}\n`;
        }

        if (objective.potential_obstacles && objective.potential_obstacles.length > 0) {
            guidance += `Potential Obstacles: ${objective.potential_obstacles.join(', ')}\n`;
        }

        if (objective.fallback_strategies && objective.fallback_strategies.length > 0) {
            guidance += `Fallback Strategies: ${objective.fallback_strategies.join(', ')}\n`;
        }

        guidance += '\n';
    });

    // Add key points to cover
    if (callContext.key_points && callContext.key_points.length > 0) {
        guidance += `**Key Points to Address**: ${callContext.key_points.join(', ')}\n\n`;
    }

    // Add sensitive topics awareness
    if (callContext.sensitive_topics && callContext.sensitive_topics.length > 0) {
        guidance += `**Sensitive Topics (Handle Carefully)**: ${callContext.sensitive_topics.join(', ')}\n\n`;
    }

    // Add strategic questions
    if (callContext.questions_to_ask && callContext.questions_to_ask.length > 0) {
        guidance += `**Strategic Questions to Consider**: \n${callContext.questions_to_ask
            .map(q => `- ${q}`)
            .join('\n')}\n\n`;
    }

    guidance += `**Strategic Guidance**: Help the user navigate toward these objectives while maintaining authentic and appropriate communication for the ${callContext.call_type.replace(
        '-',
        ' '
    )} context.`;

    return guidance;
}

function buildUserPrompt(
    callContext: CallContext,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
    currentMessage?: string
): string {
    let userPrompt = '';

    // Add participants context
    if (callContext.participants && callContext.participants.length > 0) {
        userPrompt += '**PARTICIPANTS IN THIS CALL:**\n';
        callContext.participants.forEach((participant, index) => {
            userPrompt += `${index + 1}. ${participant.name || 'Participant'} (${participant.relationship})`;
            if (participant.current_sentiment) {
                userPrompt += ` - Current sentiment: ${participant.current_sentiment}`;
            }
            if (participant.background) {
                userPrompt += ` - Background: ${participant.background}`;
            }
            userPrompt += '\n';
        });
        userPrompt += '\n';
    }

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
        userPrompt += '**CONVERSATION HISTORY:**\n';
        conversationHistory.slice(-5).forEach((msg, index) => {
            const timestamp = msg.timestamp.toLocaleTimeString();
            userPrompt += `[${timestamp}] ${msg.role === 'user' ? 'ME' : 'THEM'}: ${msg.content}\n`;
        });
        userPrompt += '\n';
    }

    // Add current situation/message
    if (currentMessage) {
        userPrompt += `**CURRENT SITUATION:**\n${currentMessage}\n\n`;
    }

    // Add request for guidance
    userPrompt += buildGuidanceRequest(callContext);

    return userPrompt;
}

function buildGuidanceRequest(callContext: CallContext): string {
    const requestTemplates = {
        'sales-call':
            'Please provide strategic guidance for advancing this sales conversation, including specific talking points, objection handling strategies, and next steps to move the opportunity forward.',

        'job-interview':
            'Please provide interview guidance including how to effectively answer questions, strategic questions I should ask, and ways to demonstrate my fit for this role.',

        'customer-support':
            'Please help me provide excellent customer service by suggesting the best approach to resolve their issue while maintaining a positive relationship.',

        'relationship-talk':
            'Please provide guidance on how to navigate this personal conversation with empathy, understanding, and effective communication.',

        negotiation:
            'Please suggest negotiation strategies that help achieve mutual benefit while protecting my interests and building long-term relationships.',

        'team-meeting':
            'Please provide guidance on facilitating effective team collaboration, addressing concerns, and driving productive outcomes.',

        'emergency-call':
            'Please provide clear, immediate guidance prioritizing safety and effective crisis communication.',

        'family-call':
            'Please help me navigate this family conversation with sensitivity, understanding, and focus on maintaining healthy relationships.',
    };

    let request =
        requestTemplates[callContext.call_type] ||
        'Please provide strategic communication guidance for this conversation.';

    // Add format-specific instructions
    if (callContext.response_style === 'bullet-points') {
        request += ' Please format your response as clear, scannable bullet points.';
    } else if (callContext.response_style === 'script-like') {
        request += ' Please include specific word-for-word suggestions where helpful.';
    }

    // Add urgency context
    if (callContext.urgency_level === 'critical') {
        request += ' This is time-critical - prioritize immediate, actionable guidance.';
    }

    return `**REQUEST FOR GUIDANCE:**\n${request}`;
}

// Helper function for real-time guidance during calls
export function generateRealTimeGuidance(
    callContext: CallContext,
    lastExchange: string,
    knowledgeContext?: string
): GeneratedPrompts {
    return generatePrompt(callContext, {
        currentMessage: `The other party just said: "${lastExchange}"\n\nI need immediate guidance on how to respond effectively.`,
        knowledgeContext,
        includeAnalytics: false,
    });
}

// Helper function for pre-call preparation
export function generatePreCallPreparation(callContext: CallContext, knowledgeContext?: string): GeneratedPrompts {
    return generatePrompt(callContext, {
        currentMessage: `I'm about to start this ${callContext.call_type.replace(
            '-',
            ' '
        )}. Please provide comprehensive preparation guidance including opening approaches, key talking points, potential challenges to watch for, and strategic considerations.`,
        knowledgeContext,
        includeAnalytics: true,
    });
}

// Helper function for post-call analysis
export function generatePostCallAnalysis(
    callContext: CallContext,
    callSummary: string,
    outcomes: string[]
): GeneratedPrompts {
    return generatePrompt(callContext, {
        currentMessage: `Call completed. Here's what happened: ${callSummary}\n\nOutcomes achieved: ${outcomes.join(
            ', '
        )}\n\nPlease provide analysis of what went well, areas for improvement, and recommended follow-up actions.`,
        includeAnalytics: true,
    });
}
