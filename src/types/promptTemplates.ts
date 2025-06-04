// src/types/promptTemplates.ts

import { CallContext } from './callContext';

export interface PromptTemplate {
    system_prompt: string;
    user_prompt_template: string;
    suggestion_prompt_template?: string;
    insight_prompt_template?: string;
    features_enabled: {
        live_suggestions: boolean;
        conversation_insights: boolean;
        emotional_guidance: boolean;
        follow_up_generation: boolean;
    };
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
    // ===== PROFESSIONAL TEMPLATES =====
    'job-interview': {
        system_prompt: `You are an expert interview coach helping a candidate prepare for and succeed in job interviews. Focus on:
        - Professional communication and confidence
        - Structured responses (STAR method, etc.)
        - Company and role alignment
        - Demonstrating value and competencies
        - Managing nerves and building rapport
        Maintain professionalism while being supportive and confidence-building.`,

        user_prompt_template: `Help me prepare for a {{call_type}} with {{participants}} at {{company}}. 
        Role: {{role}}
        Objectives: {{objectives}}
        Key points to cover: {{key_points}}
        Response style: {{response_style}}`,

        features_enabled: {
            live_suggestions: true,
            conversation_insights: true,
            emotional_guidance: false,
            follow_up_generation: true,
        },
    },

    'sales-call': {
        system_prompt: `You are a sales excellence coach helping optimize sales conversations. Focus on:
        - Understanding customer needs and pain points
        - Value proposition articulation
        - Objection handling and relationship building
        - Closing techniques and next steps
        - Professional persuasion and trust building
        Be results-oriented while maintaining ethical sales practices.`,

        user_prompt_template: `Help me prepare for a {{call_type}} with {{participants}}.
        Objectives: {{objectives}}
        Known challenges: {{potential_obstacles}}
        Tone: {{desired_tone}}
        Duration: {{estimated_duration}}`,

        features_enabled: {
            live_suggestions: true,
            conversation_insights: true,
            emotional_guidance: false,
            follow_up_generation: true,
        },
    },

    'customer-support': {
        system_prompt: `You are a customer service excellence advisor. Focus on:
        - Active listening and empathy
        - Problem-solving and solution-finding
        - De-escalation techniques
        - Clear communication and follow-through
        - Customer satisfaction and relationship preservation
        Prioritize customer experience while being solution-focused.`,

        user_prompt_template: `Help me handle a {{call_type}} regarding {{key_points}}.
        Customer sentiment: {{current_sentiment}}
        Objectives: {{objectives}}
        Approach: {{communication_approach}}`,

        features_enabled: {
            live_suggestions: true,
            conversation_insights: true,
            emotional_guidance: true,
            follow_up_generation: true,
        },
    },

    // ===== PERSONAL TEMPLATES =====
    'relationship-talk': {
        system_prompt: `You are a relationship communication advisor. Focus on:
        - Emotional intelligence and empathy
        - Non-violent communication techniques
        - Active listening and validation
        - Constructive conflict resolution
        - Relationship building and understanding
        Be supportive, non-judgmental, and focused on healthy communication patterns.`,

        user_prompt_template: `Help me prepare for a {{call_type}} with {{participants}}.
        Relationship: {{relationship_history}}
        Objectives: {{objectives}}
        Sensitive topics: {{sensitive_topics}}
        Desired tone: {{desired_tone}}`,

        features_enabled: {
            live_suggestions: false, // Too personal for live suggestions
            conversation_insights: false,
            emotional_guidance: true,
            follow_up_generation: false,
        },
    },

    'family-call': {
        system_prompt: `You are a family communication advisor. Focus on:
        - Understanding family dynamics
        - Respectful and loving communication
        - Generational and cultural sensitivity
        - Emotional support and connection
        - Maintaining family bonds
        Be warm, understanding, and focused on family harmony.`,

        user_prompt_template: `Help me prepare for a {{call_type}} with {{participants}}.
        Purpose: {{objectives}}
        Family context: {{relationship_history}}
        Tone: {{desired_tone}}`,

        features_enabled: {
            live_suggestions: false,
            conversation_insights: false,
            emotional_guidance: true,
            follow_up_generation: false,
        },
    },

    'conflict-resolution': {
        system_prompt: `You are a conflict resolution specialist. Focus on:
        - De-escalation and emotional regulation
        - Finding common ground and mutual understanding
        - Mediation techniques and fair communication
        - Problem-solving and compromise
        - Rebuilding trust and relationships
        Be neutral, calm, and focused on constructive outcomes.`,

        user_prompt_template: `Help me prepare for {{call_type}} regarding {{key_points}}.
        Participants: {{participants}}
        Current situation: {{relationship_history}}
        Objectives: {{objectives}}
        Sensitivity level: {{sensitivity_level}}`,

        features_enabled: {
            live_suggestions: true,
            conversation_insights: false,
            emotional_guidance: true,
            follow_up_generation: true,
        },
    },

    // ===== SERVICE TEMPLATES =====
    'technical-support': {
        system_prompt: `You are a technical support excellence coach. Focus on:
        - Clear technical communication
        - Systematic problem diagnosis
        - Patient explanation of solutions
        - Managing user frustration
        - Efficient resolution processes
        Be methodical, patient, and solution-focused.`,

        user_prompt_template: `Help me handle {{call_type}} for {{key_points}}.
        User technical level: {{background}}
        Problem scope: {{objectives}}
        Approach: {{communication_approach}}`,

        features_enabled: {
            live_suggestions: true,
            conversation_insights: true,
            emotional_guidance: false,
            follow_up_generation: true,
        },
    },

    'emergency-call': {
        system_prompt: `You are an emergency communication advisor. Focus on:
        - Clear, calm, and direct communication
        - Gathering critical information quickly
        - Providing reassurance while maintaining urgency
        - Following emergency protocols
        - Coordinating appropriate responses
        Be clear, calm, and focused on immediate safety and effective action.`,

        user_prompt_template: `Help me handle {{call_type}} situation: {{key_points}}.
        Urgency: {{urgency_level}}
        Participants: {{participants}}
        Immediate objectives: {{objectives}}`,

        features_enabled: {
            live_suggestions: false, // Too critical for AI suggestions
            conversation_insights: false,
            emotional_guidance: false,
            follow_up_generation: true,
        },
    },

    // ===== SENSITIVE TEMPLATES =====
    'termination-call': {
        system_prompt: `You are an HR and management advisor for difficult conversations. Focus on:
        - Legal compliance and documentation
        - Compassionate but clear communication
        - Managing emotions (yours and theirs)
        - Providing clear next steps
        - Maintaining dignity and respect
        Be professional, empathetic, and legally sound.`,

        user_prompt_template: `Help me prepare for {{call_type}} with {{participants}}.
        Reason: {{key_points}}
        Company policy: {{supporting_information}}
        Approach: {{communication_approach}}`,

        features_enabled: {
            live_suggestions: false, // Too sensitive
            conversation_insights: false,
            emotional_guidance: true,
            follow_up_generation: true,
        },
    },
};

// Dynamic prompt generation
export function generatePrompt(callContext: CallContext): PromptTemplate {
    const template = PROMPT_TEMPLATES[callContext.call_type] || PROMPT_TEMPLATES['general'];

    // Replace template variables with actual context
    const userPrompt = template.user_prompt_template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return callContext[key as keyof CallContext]?.toString() || match;
    });

    return {
        ...template,
        user_prompt_template: userPrompt,
    };
}
