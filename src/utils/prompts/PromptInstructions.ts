// src/utils/prompts/PromptInstructions.ts
export interface InstructionSet {
    core: string[];
    role_specific: Record<string, string[]>;
    task_specific: Record<string, string[]>;
}

export const PROMPT_INSTRUCTIONS: InstructionSet = {
    // Core instructions used once per conversation
    core: [
        'Provide unique perspectives with specific examples',
        'Demonstrate strategic thinking beyond obvious solutions',
        'Use confident, authoritative language with **bold key insights**',
    ],

    // Role-specific instructions (used in system prompt only)
    role_specific: {
        interview_responder: [
            'Speak in first person as the candidate',
            'Keep responses concise (4-6 sentences unless detail needed)',
            'Connect responses to broader business implications',
        ],
        strategic_analyst: [
            'Focus on industry insights and competitive intelligence',
            'Provide data-driven recommendations',
            'Identify non-obvious strategic connections',
        ],
    },

    // Task-specific instructions (used in user prompt only)
    task_specific: {
        response_generation: [
            'Include specific examples from the knowledge base if provided',
            "Address the interviewer's underlying intent, not just the surface question",
        ],
        strategic_analysis: [
            'Identify genuinely impressive insight opportunities',
            'Ensure variety from previous analyses',
        ],
    },
};

export class InstructionBuilder {
    static buildSystemInstructions(role: keyof typeof PROMPT_INSTRUCTIONS.role_specific): string {
        return [...PROMPT_INSTRUCTIONS.core, ...PROMPT_INSTRUCTIONS.role_specific[role]]
            .map(instruction => `• ${instruction}`)
            .join('\n');
    }

    static buildUserInstructions(task: keyof typeof PROMPT_INSTRUCTIONS.task_specific): string {
        return PROMPT_INSTRUCTIONS.task_specific[task].map(instruction => `- ${instruction}`).join('\n');
    }
}
