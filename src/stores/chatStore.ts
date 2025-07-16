// src/stores/chatStore.ts
import { logger } from '@/lib/Logger'; // Moved from modules
import { OpenAILLMService } from '@/services/OpenAILLMService';
import { ChatMessageParam, ChatState, InitialInterviewContext, Message } from '@/types';
import { create } from 'zustand';

interface ChatStoreState extends ChatState {
    // Actions
    initializeLLMService: (apiKey: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    addMessage: (message: Message) => void;
    clearHistory: () => void;
    appendStreamedContent: (content: string) => void;
    resetStreamedContent: () => void;
    setStreamingComplete: (isComplete: boolean) => void;
    addInterimTranscriptMessage: (message: Message) => void;
    updateCurrentInterimTranscript: (transcript: string) => void;
    clearInterimTranscripts: () => void;
    clearAllTranscripts: () => void;
    setInitialContext: (context: InitialInterviewContext) => void;
    resetToDefaultContext: () => void;
    createNewContext: () => InitialInterviewContext;
    updateContextWithDefaults: (updates: Partial<InitialInterviewContext>) => void;
    setActiveTab: (tab: string) => void;
    setProtectionState: (update: Partial<ChatState['protectionState']>) => void;
    generateResponse: (text: string, knowledgeContext?: string) => Promise<void>;
    generateSuggestions: (knowledgeContext?: string) => Promise<void>;
    summarizeConversation: () => Promise<void>;
}

// ===== INLINE PROMPT BUILDERS =====
// Replaces all the utility files
const buildSystemPrompt = (context: InitialInterviewContext, goals: string[]): string => {
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

const buildUserPrompt = (userMessage: string, conversationSummary: string, knowledgeContext?: string): string => {
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

const buildAnalysisPrompt = (conversationSummary: string, context: InitialInterviewContext): string => {
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
  "insight_potential": "[What kind of mind-blowing insight is possible?]"
}`;
};

const buildSummaryPrompt = (conversationText: string): string => {
    return `Create a structured summary of the most recent interviewer question and interviewee response pair.

**Required Format:**
### Interviewer Question
[Concise summary preserving key context and intent]

### Interviewee Response
[Focused summary highlighting key points, metrics, examples. Use **bold** for important metrics and achievements.]

**Recent Exchange:**
${conversationText}`;
};

// ✅ DEFINE DEFAULT CONTEXT AT TOP OF STORE FILE
const DEFAULT_INTERVIEW_CONTEXT: InitialInterviewContext = {
    // Core Interview Details
    interviewType: 'sales',
    targetRole: 'Mid-market Account Executive',
    targetCompany: 'ETQ',
    companySizeType: 'enterprise',
    industry: 'Manufacturing QMS Software',
    seniorityLevel: 'manager',

    // Response Settings
    responseConfidence: 'balanced',
    responseStructure: 'story-driven',
    contextDepth: 10,
    includeMetrics: true,

    // Content Focus
    goals: ['Demonstrate my expertise and value'], // At least 1 goal by default
    emphasizedExperiences: ['Sales achievements and revenue growth'],
    specificChallenges: ['Difficult client or stakeholder situations'],
    companyContext: ['sales_methodology', 'career_achievements'],

    // Generated field
    roleDescription: '',
};

// ===== STORE IMPLEMENTATION =====
export const useChatStore = create<ChatStoreState>()((set, get) => ({
    // ===== INITIAL STATE =====
    isLoading: false,
    error: null,
    llmService: null,

    conversationHistory: [],
    streamedContent: '',
    isStreamingComplete: false,
    conversationSummary: '',
    strategicSuggestions: {
        strategicIntelligenceContent: '',
        currentAnalysis: undefined,
        previousAnalyses: [],
    },

    interimTranscriptMessages: [],
    currentInterimTranscript: '',

    initialContext: DEFAULT_INTERVIEW_CONTEXT,

    activeTab: 'interview',
    protectionState: {
        isAccessAllowed: false,
        isValidating: false,
        isRedirecting: false,
    },

    // ===== SERVICE MANAGEMENT =====
    initializeLLMService: (apiKey: string) => {
        try {
            const service = new OpenAILLMService(apiKey);
            set({ llmService: service });
            logger.info('LLM Service initialized successfully');
        } catch (error) {
            logger.error(`Failed to initialize LLM service: ${(error as Error).message}`);
            set({ error: 'Failed to initialize AI service' });
        }
    },

    // ===== BASIC STATE MANAGEMENT =====
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),

    addMessage: (message: Message) =>
        set(state => ({
            conversationHistory: [...state.conversationHistory, message],
        })),
    clearHistory: () => set({ conversationHistory: [] }),

    appendStreamedContent: (content: string) =>
        set(state => ({
            streamedContent: state.streamedContent + content,
        })),
    resetStreamedContent: () =>
        set({
            streamedContent: '',
            isStreamingComplete: false,
        }),
    setStreamingComplete: (isComplete: boolean) =>
        set({
            isStreamingComplete: isComplete,
        }),

    addInterimTranscriptMessage: (message: Message) =>
        set(state => ({
            interimTranscriptMessages: [...state.interimTranscriptMessages, message],
        })),
    updateCurrentInterimTranscript: (transcript: string) =>
        set({
            currentInterimTranscript: transcript,
        }),
    clearInterimTranscripts: () =>
        set({
            interimTranscriptMessages: [],
            currentInterimTranscript: '',
        }),
    clearAllTranscripts: () =>
        set({
            interimTranscriptMessages: [],
            currentInterimTranscript: '',
            conversationHistory: [],
        }),

    // ✅ ADD: Reset to default context
    resetToDefaultContext: () => {
        set({ initialContext: { ...DEFAULT_INTERVIEW_CONTEXT } });
    },

    // ✅ ADD: Create new context with defaults
    createNewContext: () => {
        const newContext = { ...DEFAULT_INTERVIEW_CONTEXT };
        set({ initialContext: newContext });
        return newContext;
    },

    // ✅ UPDATE: setInitialContext to handle partial updates
    setInitialContext: (context: InitialInterviewContext) => {
        set({ initialContext: context });
    },

    // ✅ ADD: Update context with defaults fallback
    updateContextWithDefaults: (updates: Partial<InitialInterviewContext>) => {
        const current = get().initialContext || DEFAULT_INTERVIEW_CONTEXT;
        const updated = { ...current, ...updates };
        set({ initialContext: updated });
    },

    setActiveTab: (tab: string) => set({ activeTab: tab }),
    setProtectionState: (update: Partial<ChatState['protectionState']>) =>
        set(state => ({
            protectionState: { ...state.protectionState, ...update },
        })),

    // ===== BUSINESS LOGIC ACTIONS =====
    // Replaces: useResponseGenerator + llmUtils + all prompt utilities
    generateResponse: async (text: string, knowledgeContext = '') => {
        const state = get();
        const { llmService, initialContext, conversationSummary } = state;

        if (!llmService) {
            set({ error: 'AI service not initialized' });
            return;
        }

        if (!initialContext) {
            set({ error: 'Interview context not set' });
            return;
        }

        set({ isLoading: true, error: null });
        state.resetStreamedContent();

        try {
            logger.info(`Generating response for: "${text.substring(0, 50)}..."`);

            const systemPrompt = buildSystemPrompt(initialContext, initialContext.goals || []);
            const userPrompt = buildUserPrompt(text, conversationSummary, knowledgeContext);

            const messages: ChatMessageParam[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ];

            // Check if streaming is available
            if (llmService.generateStreamedResponseChunks) {
                let fullResponse = '';
                for await (const chunk of llmService.generateStreamedResponseChunks(messages, {
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                })) {
                    fullResponse += chunk;
                    get().appendStreamedContent(chunk);
                }
                set({ isStreamingComplete: true });
                logger.info(`Streaming response completed: ${fullResponse.length} characters`);
            } else {
                // Fallback to complete response
                const response = await llmService.generateCompleteResponse(messages, {
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                });
                set({
                    streamedContent: response,
                    isStreamingComplete: true,
                });
                logger.info(`Complete response generated: ${response.length} characters`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            logger.error(`Response generation failed: ${errorMessage}`);
            set({ error: errorMessage });
        } finally {
            set({ isLoading: false });
        }
    },

    // Replaces: useStrategicSuggestionsGenerator + analysis utilities
    generateSuggestions: async (knowledgeContext = '') => {
        const { llmService, initialContext, conversationSummary } = get();

        if (!llmService || !initialContext) {
            set({ error: 'Service or context not available for suggestions' });
            return;
        }

        set({ isLoading: true });

        try {
            logger.info('Generating strategic suggestions');

            // Step 1: Analyze conversation for opportunities
            const analysisPrompt = buildAnalysisPrompt(conversationSummary, initialContext);

            const analysisResponse = await llmService.generateCompleteResponse(
                [
                    { role: 'system', content: 'You are a strategic intelligence analyst.' },
                    { role: 'user', content: analysisPrompt },
                ],
                {
                    model: 'gpt-4o-mini',
                    temperature: 0.3,
                }
            );

            let analysis;
            try {
                analysis = JSON.parse(analysisResponse.match(/\{[\s\S]*\}/)?.[0] || '{}');
            } catch {
                logger.warning('Failed to parse analysis response, using fallback');
                analysis = {
                    strategic_opportunity: 'thought_leadership',
                    insight_potential: 'Industry expertise demonstration',
                };
            }

            // Step 2: Generate strategic intelligence content
            const generationPrompt = `Based on this analysis: ${JSON.stringify(analysis)}

Create strategic intelligence for ${initialContext.targetRole} at ${initialContext.targetCompany}:

${knowledgeContext ? `Knowledge Context:\n${knowledgeContext}\n` : ''}

Generate markdown content with:
# 🧠 Strategic Intelligence - ${analysis.strategic_opportunity}

## 🎯 Strategic Context
[Why this intelligence is valuable]

## 💡 Key Strategic Insights
[Multiple valuable insights with evidence]

## 🚀 Competitive Differentiation
[How this positions you uniquely]

Focus on genuinely impressive insights that demonstrate exceptional thinking.`;

            const strategicContent = await llmService.generateCompleteResponse(
                [
                    { role: 'system', content: 'You are a master strategic intelligence generator.' },
                    { role: 'user', content: generationPrompt },
                ],
                {
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                }
            );

            // Update suggestions state
            const currentSuggestions = get().strategicSuggestions;
            set({
                strategicSuggestions: {
                    strategicIntelligenceContent: strategicContent,
                    currentAnalysis: analysis,
                    previousAnalyses: [
                        ...currentSuggestions.previousAnalyses,
                        {
                            strategic_opportunity: analysis.strategic_opportunity,
                            primary_focus_area: analysis.strategic_opportunity,
                            insight_summary: analysis.insight_potential,
                            timestamp: Date.now(),
                        },
                    ].slice(-3), // Keep only last 3
                },
            });

            logger.info('Strategic suggestions generated successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
            logger.error(`Suggestions generation failed: ${errorMessage}`);
            set({ error: errorMessage });
        } finally {
            set({ isLoading: false });
        }
    },

    // Replaces: useConversationSummarizer + summarization utilities
    summarizeConversation: async () => {
        const { llmService, conversationHistory, initialContext } = get();

        if (!llmService || conversationHistory.length === 0 || !initialContext) {
            return;
        }

        try {
            logger.info('Summarizing conversation');

            const conversationText = conversationHistory
                .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                .join('\n');

            const summaryPrompt = buildSummaryPrompt(conversationText);

            const summary = await llmService.generateCompleteResponse(
                [
                    { role: 'system', content: 'You are an expert conversation summarizer.' },
                    { role: 'user', content: summaryPrompt },
                ],
                {
                    model: 'gpt-4o-mini',
                    temperature: 0.5,
                }
            );

            set({ conversationSummary: summary });
            logger.info('Conversation summarized successfully');
        } catch (error) {
            logger.error(`Summary generation failed: ${(error as Error).message}`);
        }
    },
}));

export { DEFAULT_INTERVIEW_CONTEXT };
