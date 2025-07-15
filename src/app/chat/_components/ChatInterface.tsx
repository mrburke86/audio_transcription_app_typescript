// src/app/chat/_components/ChatInterface.tsx
import {
    ConversationContext,
    ConversationInsights,
    LiveTranscriptionBox,
    TopNavigationBar,
    VoiceControls,
} from '@/app/chat/_components';
import { MemoizedChatMessagesBox } from '@/app/chat/_components/ChatMessagesBox';
import { AIErrorBoundary, InlineErrorBoundary, SpeechErrorBoundary } from '@/components/error-boundary';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { useChatStore } from '@/stores/chatStore';
import {
    useConversationMemoryMetrics,
    useRenderMetrics,
    useStateConsistencyTracker,
} from '@/utils/performance/measurementHooks';
import { ArrowRight, MessageSquare } from 'lucide-react';
import React, { memo, useEffect, useMemo, useRef } from 'react';

const MOVE_BUTTON_STYLES =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-8 px-2 py-1 mt-2 gap-1.5 self-end';

interface ChatInterfaceProps {
    initialInterviewContext: any;
    knowledgeBaseName: string;
    indexedDocumentsCount: number;

    recognitionStatus: 'inactive' | 'active' | 'error';
    speechErrorMessage: string | null;
    canvasRef: React.RefObject<HTMLCanvasElement>;

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
        // CORE PERFORMANCE TRACKING
        const { trackRender } = useRenderMetrics('ChatInterface');
        const { trackStateUpdate, checkStateConsistency } = useStateConsistencyTracker('ChatInterface');
        const { trackConversationGrowth, getConversationStats, clearOldMessages } =
            useConversationMemoryMetrics('ChatInterface');

        // NEW: Store for interim/current
        const interimTranscriptMessages = useChatStore(state => state.interimTranscriptMessages);
        const currentInterimTranscript = useChatStore(state => state.currentInterimTranscript);

        // ENHANCED: Performance tracking refs
        const lastRenderTime = useRef<number>(0);
        const renderCount = useRef<number>(0);
        const lastPropsRef = useRef<any>(null);
        const performanceWarningsRef = useRef<Set<string>>(new Set());

        // ENHANCED: Track renders with change detection
        useEffect(() => {
            const renderStart = performance.now();
            renderCount.current++;

            const currentProps = {
                recognitionStatus,
                speechErrorMessage,
                userMessagesLength: userMessages.length,
                streamedContentLength: streamedContent.length,
                isStreamingComplete,
                currentInterimTranscriptLength: currentInterimTranscript.length, // FIXED: From store
                conversationSummaryLength: conversationSummary.length,
                isLoading,
                indexedDocumentsCount,
            };

            const wasNecessary =
                lastPropsRef.current === null || JSON.stringify(lastPropsRef.current) !== JSON.stringify(currentProps);

            trackRender({
                renderCount: renderCount.current,
                wasNecessary,
                changedProps: wasNecessary
                    ? Object.keys(currentProps).filter(
                          key =>
                              lastPropsRef.current &&
                              currentProps[key as keyof typeof currentProps] !== lastPropsRef.current[key]
                      )
                    : [],
                propsSnapshot: currentProps,
                renderDuration: performance.now() - renderStart,
            });

            trackStateUpdate('userMessages', userMessages);
            trackStateUpdate('streamedContent', streamedContent);
            trackStateUpdate('isStreamingComplete', isStreamingComplete);
            trackStateUpdate('recognitionStatus', recognitionStatus);

            const renderTime = performance.now() - renderStart;
            if (renderTime > 50 && !performanceWarningsRef.current.has('slow-render')) {
                console.warn(
                    `🐌 ChatInterface slow render: ${renderTime.toFixed(1)}ms (render #${renderCount.current})`
                );
                performanceWarningsRef.current.add('slow-render');
            }

            if (renderCount.current > 100 && !performanceWarningsRef.current.has('high-render-count')) {
                console.warn(`🔄 ChatInterface high render count: ${renderCount.current} renders in session`);
                performanceWarningsRef.current.add('high-render-count');
            }

            lastPropsRef.current = currentProps;
            lastRenderTime.current = renderStart;
        }, [
            recognitionStatus,
            speechErrorMessage,
            userMessages,
            streamedContent,
            isStreamingComplete,
            conversationSummary,
            isLoading,
            indexedDocumentsCount,
            trackRender,
            trackStateUpdate,
            checkStateConsistency,
        ]);

        // ENHANCED: Track conversation memory growth
        useEffect(() => {
            if (userMessages.length > 0) {
                const latestMessage = userMessages[userMessages.length - 1];
                trackConversationGrowth(`chat-msg-${userMessages.length}`, {
                    type: latestMessage.type || 'unknown',
                    contentLength: latestMessage.content?.length || 0,
                    totalMessages: userMessages.length,
                    timestamp: Date.now(),
                });

                const stats = getConversationStats();
                if (stats.messageCount > 200) {
                    console.warn(
                        `💾 Large conversation detected: ${stats.messageCount} messages, ${stats.totalSizeMB}MB`
                    );
                    if (stats.messageCount > 500) {
                        clearOldMessages(300);
                    }
                }
            }
        }, [userMessages, trackConversationGrowth, getConversationStats, clearOldMessages]);

        // ENHANCED: Track streaming completion performance
        useEffect(() => {
            if (isStreamingComplete && streamedContent.length > 0) {
                trackConversationGrowth(`streamed-response-${Date.now()}`, {
                    type: 'assistant-streamed',
                    contentLength: streamedContent.length,
                    isStreamingComplete,
                    timestamp: Date.now(),
                });

                console.log(`✅ Streaming completed: ${streamedContent.length} characters`);
            }
        }, [isStreamingComplete, streamedContent, trackConversationGrowth]);

        // ENHANCED: Memoized move button
        const moveButton = useMemo(() => {
            console.log('🔄 Move button re-rendered (memoization check)');
            return (
                <Button variant="move" onClick={handleMove} className={MOVE_BUTTON_STYLES}>
                    <ArrowRight className="mr-1 h-4 w-4" />
                    Move
                </Button>
            );
        }, [handleMove]);

        // NEW: Performance diagnostics
        const getPerformanceDiagnostics = () => {
            const stats = getConversationStats();
            return {
                renderCount: renderCount.current,
                lastRenderTime: lastRenderTime.current,
                conversationStats: stats,
                activeWarnings: Array.from(performanceWarningsRef.current),
                componentState: {
                    userMessagesCount: userMessages.length,
                    streamedContentLength: streamedContent.length,
                    recognitionStatus,
                    isLoading,
                },
            };
        };

        useEffect(() => {
            if (process.env.NODE_ENV === 'development') {
                (window as any).chatInterfaceDiagnostics = getPerformanceDiagnostics;
            }
        }, []);

        return (
            <>
                <div className="h-full w-full flex flex-col">
                    <div className="flex-shrink-0 bg-background border-b shadow-sm" style={{ minHeight: '110px' }}>
                        <InlineErrorBoundary>
                            <div className="px-4 py-2">
                                <MemoizedTopNavigationBar
                                    status={recognitionStatus}
                                    errorMessage={speechErrorMessage}
                                    knowledgeBaseName={knowledgeBaseName}
                                    indexedDocumentsCount={indexedDocumentsCount}
                                    contextButton={{
                                        targetRole: initialInterviewContext.targetRole,
                                        targetCompany: initialInterviewContext.targetCompany,
                                        onClick: handleContextInfo,
                                    }}
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
                                                {renderCount.current > 50 && (
                                                    <span
                                                        className="text-xs text-yellow-600"
                                                        title={`${renderCount.current} renders`}
                                                    >
                                                        ⚡
                                                    </span>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                                            <div className="flex-1 min-h-0 overflow-hidden">
                                                <MemoizedChatMessagesBox
                                                    id="postChat"
                                                    messages={userMessages}
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
                                                    interimTranscriptions={interimTranscriptMessages} // FIXED: From store
                                                    currentInterimTranscript={currentInterimTranscript} // FIXED: From store
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
                                                goals={initialInterviewContext?.goals || []}
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
