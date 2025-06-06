// src/utils/prompts/index.ts

// Export all unified prompt functions
export {
    createSystemPrompt,
    createUserPrompt,
    createAnalysisSystemPrompt,
    createAnalysisUserPrompt,
    createGenerationSystemPrompt,
    createGenerationUserPrompt,
    createSummarisationSystemPrompt,
    createSummarisationUserPrompt,
} from './unifiedPrompts';

// Export the template manager and related types
export { PromptTemplateManager } from './PromptTemplateManager';
export type { PromptContext, PromptOptions } from './PromptTemplateManager';

// Export instruction builder
export { PROMPT_INSTRUCTIONS, InstructionBuilder } from './PromptInstructions';
export type { InstructionSet } from './PromptInstructions';
