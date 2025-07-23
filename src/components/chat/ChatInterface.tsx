// src/components/chat/ChatInterface.tsx - FIXED VERSION
import {
    ConversationContext,
    ConversationInsights,
    LiveTranscriptionBox,
    TopNavigationBar,
    VoiceControls,
} from '@/components/chat';
import { MemoizedChatMessagesBox } from '@/components/chat/ChatMessagesBox';
import { AIErrorBoundary, InlineErrorBoundary, SpeechErrorBoundary } from '@/components/error-boundary';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { useBoundStore } from '@/stores/chatStore';
import { InitialInterviewContext } from '@/types';
import { ArrowRight, MessageSquare } from 'lucide-react';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { KnowledgeIndicatorMini } from './KnowledgeIndicator';

const MOVE_BUTTON_STYLES =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end';

interface ChatInterfaceProps {
    initialInterviewContext?: InitialInterviewContext;
    knowledgeBaseName?: string;
    indexedDocumentsCount?: number;

    recognitionStatus: 'inactive' | 'active' | 'error';
    speechErrorMessage: string | null;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;

    userMessages: any[];
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: any;
    isLoading: boolean;

    handleStart: () => void;
    handleStop: () => void;
    handleClear: () => void;
    handleMove: () => void;
    handleSuggest: () => void;
    handleContextInfo: () => void;
}

// Memoized sub-components
const MemoizedTopNavigationBar = memo(TopNavigationBar);
const MemoizedVoiceControls = memo(VoiceControls);
const MemoizedConversationContext = memo(ConversationContext);
const MemoizedConversationInsights = memo(ConversationInsights);

export const ChatInterface: React.FC<ChatInterfaceProps> = memo(
    ({
        initialInterviewContext,
        knowledgeBaseName,
        indexedDocumentsCount,
        recognitionStatus,
        speechErrorMessage,
        canvasRef,
        userMessages,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
        isLoading,
        handleStart,
        handleStop,
        handleClear,
        handleMove,
        handleSuggest,
        handleContextInfo,
    }) => {
        // Render Counter for diagnostics
        const renderCount = useRef(0);
        renderCount.current++;
        console.log(`🧮 [DIAG] ChatInterface rendered ${renderCount.current} times`);

        // Hydration Flag to defer store access
        const isHydrated = useRef(false);
        useEffect(() => {
            const rehydratePromise = useBoundStore.persist.rehydrate();
            if (rehydratePromise instanceof Promise) {
                rehydratePromise.then(() => {
                    isHydrated.current = true;
                    console.log('[DIAG-Hydrate] ChatInterface rehydrated');
                });
            } else {
                isHydrated.current = true;
                console.log('[DIAG-Hydrate] ChatInterface rehydrated (non-promise)');
            }
        }, []);

        // Get knowledge state from store
        const { knowledgeLoading, indexedDocumentsCount: storeDocCount } = useBoundStore(state => ({
            knowledgeLoading: state.knowledgeLoading,
            indexedDocumentsCount: state.indexedDocumentsCount,
        }));

        // Use store count if prop not provided
        const effectiveDocCount = indexedDocumentsCount ?? storeDocCount;

        // ✅ SAFETY CHECK: Provide defaults for undefined props
        const safeContext = useMemo(() => {
            return (
                initialInterviewContext || {
                    targetRole: 'Account Executive',
                    targetCompany: 'Demo Company',
                    interviewType: 'sales' as const,
                    goals: ['Demonstrate expertise'],
                    companySizeType: 'enterprise' as const,
                    industry: 'Technology',
                    seniorityLevel: 'manager' as const,
                    responseConfidence: 'balanced' as const,
                    responseStructure: 'story-driven' as const,
                    contextDepth: 7,
                    includeMetrics: true,
                    emphasizedExperiences: ['Sales achievements'],
                    specificChallenges: ['Complex negotiations'],
                    companyContext: ['Industry knowledge'],
                }
            );
        }, [initialInterviewContext]);

        const safeKnowledgeBaseName = knowledgeBaseName || 'Knowledge Base';
        // const safeIndexedDocumentsCount = indexedDocumentsCount || 0;

        // ✅ DEBUG: Log props on client side only
        useEffect(() => {
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                console.group('🎬 CHAT INTERFACE PROPS');
                console.log('📦 Props received:', {
                    hasInitialContext: !!initialInterviewContext,
                    contextRole: initialInterviewContext?.targetRole,
                    contextCompany: initialInterviewContext?.targetCompany,
                    knowledgeBaseName: safeKnowledgeBaseName,
                    indexedDocumentsCount: effectiveDocCount,
                    knowledgeLoading,
                    recognitionStatus,
                    messageCount: userMessages?.length || 0,
                });

                if (!initialInterviewContext) {
                    console.warn('⚠️ No initialInterviewContext provided to ChatInterface');
                }

                console.groupEnd();
            }
        }, [
            initialInterviewContext,
            safeKnowledgeBaseName,
            effectiveDocCount,
            knowledgeLoading,
            recognitionStatus,
            userMessages,
        ]);

        // Enhanced move button with error handling
        const moveButton = useMemo(() => {
            return (
                <Button variant="move" onClick={handleMove} className={MOVE_BUTTON_STYLES}>
                    <ArrowRight className="mr-1 h-4 w-4" />
                    Move
                </Button>
            );
        }, [handleMove]);

        // Store selectors with safety checks
        const interimTranscriptMessages = useBoundStore((state: any) => state.interimTranscriptMessages || []);
        const currentInterimTranscript = useBoundStore((state: any) => state.currentInterimTranscript || '');

        // ✅ SAFE CONTEXT BUTTON: Handle missing context gracefully
        const contextButton = useMemo(() => {
            if (!safeContext.targetRole || !safeContext.targetCompany) {
                return {
                    targetRole: 'Setup Required',
                    targetCompany: 'No Company',
                    onClick: () => {
                        console.warn('Context not properly configured');
                        handleContextInfo();
                    },
                };
            }

            return {
                targetRole: safeContext.targetRole,
                targetCompany: safeContext.targetCompany,
                onClick: handleContextInfo,
            };
        }, [safeContext.targetRole, safeContext.targetCompany, handleContextInfo]);

        return (
            <>
                <div className="h-full w-full flex flex-col">
                    <div className="flex-shrink-0 bg-background border-b shadow-sm" style={{ minHeight: '110px' }}>
                        <InlineErrorBoundary>
                            <div className="px-4 py-2">
                                <MemoizedTopNavigationBar
                                    status={recognitionStatus}
                                    errorMessage={speechErrorMessage}
                                    knowledgeBaseName={safeKnowledgeBaseName}
                                    indexedDocumentsCount={effectiveDocCount}
                                    contextButton={contextButton}
                                />
                            </div>
                        </InlineErrorBoundary>
                    </div>

                    <div className="flex-1 overflow-hidden" style={{ minHeight: 'calc(100vh - 110px)' }}>
                        <div className="p-4 h-full">
                            <div className="grid grid-cols-12 gap-6 h-full min-h-0 overflow-hidden">
                                <div className="col-span-6 flex-1 overflow-hidden">
                                    <Card className="h-full relative flex flex-col overflow-hidden">
                                        <CardHeader className="pb-3 flex-shrink-0">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5" />
                                                Conversation
                                                {effectiveDocCount > 0 && !knowledgeLoading && (
                                                    <KnowledgeIndicatorMini active={true} />
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                                            <div className="flex-1 min-h-0 overflow-hidden">
                                                <MemoizedChatMessagesBox
                                                    id="postChat"
                                                    messages={userMessages || []}
                                                    streamedContent={streamedContent}
                                                    isStreamingComplete={isStreamingComplete}
                                                    className="flex-1"
                                                />
                                            </div>

                                            <Separator className="flex-shrink-0" />

                                            <div
                                                id="chat-input"
                                                className="flex flex-col p-3 md:p-4 border-[1px] border-gray-800 rounded-lg shadow-none max-h-52 overflow-y-auto bg-background flex-shrink-0"
                                            >
                                                <LiveTranscriptionBox
                                                    id="preChat"
                                                    interimTranscriptions={interimTranscriptMessages}
                                                    currentInterimTranscript={currentInterimTranscript}
                                                    className="flex-1"
                                                />

                                                {moveButton}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="col-span-1">
                                    <SpeechErrorBoundary>
                                        <MemoizedVoiceControls
                                            onStart={handleStart}
                                            onStop={handleStop}
                                            onClear={handleClear}
                                            isRecognitionActive={recognitionStatus === 'active'}
                                            canvasRef={canvasRef}
                                        />
                                    </SpeechErrorBoundary>
                                </div>

                                <div className="flex w-full col-span-4 gap-y-4 h-full overflow-hidden">
                                    <div className="grid grid-rows-2 gap-2 w-full">
                                        <div className="overflow-hidden scroll-smooth">
                                            <MemoizedConversationContext
                                                summary={conversationSummary}
                                                goals={safeContext?.goals || []}
                                            />
                                        </div>

                                        <div className="overflow-hidden scroll-smooth">
                                            <AIErrorBoundary>
                                                <MemoizedConversationInsights
                                                    suggestions={conversationSuggestions}
                                                    onSuggest={handleSuggest}
                                                    isLoading={isLoading}
                                                />
                                            </AIErrorBoundary>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
);

ChatInterface.displayName = 'ChatInterface';
