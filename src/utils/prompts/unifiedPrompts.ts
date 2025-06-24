// src/utils/prompts/unifiedPrompts.ts
import { PromptTemplateManager, PromptContext } from './PromptTemplateManager';
import { AnalysisPreview, CallContext } from '@/types';

/**
 * Creates all prompt functions using the unified PromptTemplateManager
 * This replaces the 8 separate prompt files with 2 adaptive prompts
 */

// ===== MAIN RESPONSE PROMPTS =====

export async function createSystemPrompt(callContext: CallContext, _goals: string): Promise<string> {
    // Note: _goals parameter kept for backward compatibility but not used
    // Goals are now derived from callContext.objectives
    const context: PromptContext = {
        callContext,
        taskType: 'response',
    };

    return PromptTemplateManager.buildSystemPrompt(context);
}

export async function createUserPrompt(
    userMessage: string,
    conversationSummary: string,
    knowledgeContext: string,
    callContext?: CallContext
): Promise<string> {
    if (!callContext) {
        throw new Error('CallContext is required');
    }

    const context: PromptContext = {
        callContext,
        taskType: 'response',
        userMessage,
        conversationSummary,
        knowledgeContext,
    };

    return PromptTemplateManager.buildUserPrompt(context);
}

// ===== ANALYSIS PROMPTS =====

export function createAnalysisSystemPrompt(): string {
    // Use a minimal call context for analysis
    const context: PromptContext = {
        callContext: {} as CallContext, // Analysis doesn't need full context
        taskType: 'analysis',
    };

    return PromptTemplateManager.buildSystemPrompt(context);
}

export async function createAnalysisUserPrompt(
    conversationSummary: string,
    callContext: CallContext,
    knowledgeContext: string,
    previousAnalysisHistory: AnalysisPreview[]
): Promise<string> {
    const context: PromptContext = {
        callContext,
        taskType: 'analysis',
        conversationSummary,
        knowledgeContext,
        previousAnalysis: previousAnalysisHistory,
    };

    return PromptTemplateManager.buildUserPrompt(context);
}

// ===== GENERATION PROMPTS =====

export function createGenerationSystemPrompt(): string {
    const context: PromptContext = {
        callContext: {} as CallContext,
        taskType: 'generation',
    };

    return PromptTemplateManager.buildSystemPrompt(context);
}

export async function createGenerationUserPrompt(
    strategicAnalysis: Record<string, unknown>,
    callContext: CallContext,
    knowledgeContext: string,
    previousAnalysisHistory: AnalysisPreview[]
): Promise<string> {
    const context: PromptContext = {
        callContext,
        taskType: 'generation',
        userMessage: JSON.stringify(strategicAnalysis, null, 2),
        knowledgeContext,
        previousAnalysis: previousAnalysisHistory,
    };

    return PromptTemplateManager.buildUserPrompt(context);
}

// ===== SUMMARIZATION PROMPTS =====

export function createSummarisationSystemPrompt(): string {
    const context: PromptContext = {
        callContext: {} as CallContext,
        taskType: 'summary',
    };

    return PromptTemplateManager.buildSystemPrompt(context);
}

export function createSummarisationUserPrompt(
    conversationText: string,
    callContext: CallContext,
    existingSummary?: string
): string {
    const context: PromptContext = {
        callContext,
        taskType: 'summary',
        userMessage: conversationText,
        conversationSummary: existingSummary,
    };

    return PromptTemplateManager.buildUserPrompt(context);
}
