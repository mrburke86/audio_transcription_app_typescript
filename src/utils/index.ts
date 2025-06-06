// src/utils/index.ts

// Export all prompt-related functions from the prompts directory
export {
    // Main response prompts
    createSystemPrompt,
    createUserPrompt,
    // Analysis prompts
    createAnalysisSystemPrompt,
    createAnalysisUserPrompt,
    // Generation prompts
    createGenerationSystemPrompt,
    createGenerationUserPrompt,
    // Summarization prompts
    createSummarisationSystemPrompt,
    createSummarisationUserPrompt,
    // Template manager and utilities
    PromptTemplateManager,
    PROMPT_INSTRUCTIONS,
    InstructionBuilder,
} from './prompts';

// Export types
export type { PromptContext, PromptOptions, InstructionSet } from './prompts';

// ... other utils exports ...
