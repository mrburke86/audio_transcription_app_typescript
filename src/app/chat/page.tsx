// src/app/chat/page.tsx - WORKING VERSION (BEFORE FIXES)
'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { useConsolidatedSpeech } from '@/hooks/useConsolidatedSpeech';
import { diagnosticLogger } from '@/lib/DiagnosticLogger';
import { useBoundStore } from '@/stores/chatStore';
import { useCallback, useEffect, useRef } from 'react';

export default function ChatPage() {
    // 🎯 SIMPLE DIAGNOSTIC TRACKING (no hook violations)
    const renderCount = useRef(0);
    const mountTime = useRef(Date.now());

    renderCount.current++;

    // 🚨 BASIC RENDER ANALYSIS
    if (renderCount.current === 1) {
        diagnosticLogger.log('info', 'init', 'ChatPage', '🏗️ ChatPage component mounted');
    } else if (renderCount.current % 10 === 0) {
        const timeSinceMount = Date.now() - mountTime.current;
        const renderRate = renderCount.current / (timeSinceMount / 1000);
        diagnosticLogger.log(
            'warn',
            'render',
            'ChatPage',
            `📊 High render count: ${renderCount.current} renders in ${timeSinceMount}ms`,
            { renderRate: renderRate.toFixed(2) }
        );
    }

    // 📊 DIRECT STORE ACCESS (your original pattern)
    const {
        // Context
        initialContext,
        isContextValid,
        navigateToContextCapture,

        // Knowledge
        initializeKnowledgeBase,
        knowledgeBaseName,
        indexedDocumentsCount,

        // LLM
        initializeLLMService,
        generateResponse,
        generateSuggestions,
        streamedContent,
        isStreamingComplete,
        llmLoading,

        // Chat
        conversationHistory,

        // Speech Data (for transcription)
        interimTranscriptMessages,
        currentInterimTranscript,

        // UI
        conversationSummary,
        strategicSuggestions,
    } = useBoundStore();

    // 🎤 SPEECH HOOK
    const {
        recognitionStatus,
        speechErrorMessage,
        canvasRef,
        startRecording,
        stopRecording,
        clearTranscriptions,
        submitTranscriptionToChat,
    } = useConsolidatedSpeech();

    // 🏗️ MANUAL HYDRATION WITH ERROR HANDLING
    useEffect(() => {
        try {
            diagnosticLogger.log('info', 'init', 'ChatPage', '🔄 Starting manual hydration');

            // Try to rehydrate with error handling
            const result = useBoundStore.persist.rehydrate();

            if (result instanceof Promise) {
                result
                    .then(() => {
                        diagnosticLogger.log('info', 'init', 'ChatPage', '✅ Manual hydration completed successfully');
                    })
                    .catch(error => {
                        diagnosticLogger.log('error', 'init', 'ChatPage', '❌ Manual hydration failed', {
                            error: error.message,
                        });

                        // Clear corrupted storage and use defaults
                        sessionStorage.removeItem('interview_context');
                        diagnosticLogger.log('info', 'init', 'ChatPage', '🧹 Cleared corrupted sessionStorage');
                    });
            } else {
                diagnosticLogger.log('info', 'init', 'ChatPage', '✅ Manual hydration completed (sync)');
            }
        } catch (error) {
            diagnosticLogger.log('error', 'init', 'ChatPage', '❌ Manual hydration threw error', {
                error: error instanceof Error ? error.message : String(error),
            });

            // Clear corrupted storage
            sessionStorage.removeItem('interview_context');
        }
    }, []);

    useEffect(() => {
        // 🔍 CONTEXT VALIDATION
        if (!isContextValid()) {
            diagnosticLogger.log('warn', 'nav', 'ChatPage', '🚨 Invalid context detected - redirecting to capture');
            navigateToContextCapture();
            return;
        }

        // 🤖 LLM INITIALIZATION
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        if (apiKey) {
            diagnosticLogger.log('info', 'init', 'ChatPage', '🤖 Initializing LLM service', {
                keyLength: apiKey.length,
            });
            initializeLLMService(apiKey);
        } else {
            diagnosticLogger.log('error', 'init', 'ChatPage', '❌ OpenAI API key not found');
        }

        // 📚 KNOWLEDGE BASE INITIALIZATION
        diagnosticLogger.log('info', 'init', 'ChatPage', '📚 Starting knowledge base initialization');
        initializeKnowledgeBase().catch(error => {
            diagnosticLogger.log('error', 'init', 'ChatPage', '❌ Knowledge base initialization failed', error);
        });
    }, [isContextValid, navigateToContextCapture, initializeLLMService, initializeKnowledgeBase]);

    // 🎯 HANDLERS WITH BASIC TRACKING
    const handleStart = useCallback(async () => {
        diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked start recording');
        await startRecording();
    }, [startRecording]);

    const handleStop = useCallback(() => {
        diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked stop recording');
        stopRecording();
    }, [stopRecording]);

    const handleClear = useCallback(() => {
        diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked clear transcriptions');
        clearTranscriptions();
    }, [clearTranscriptions]);

    const handleMove = useCallback(async () => {
        diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked submit transcription');

        await submitTranscriptionToChat();

        const messages = conversationHistory;
        const lastUserMessage = messages.filter(m => m.type === 'user').pop();

        if (lastUserMessage) {
            diagnosticLogger.log('info', 'api', 'ChatPage', '🤖 Generating AI response', {
                messageLength: lastUserMessage.content.length,
            });
            await generateResponse(lastUserMessage.content);
        }
    }, [submitTranscriptionToChat, conversationHistory, generateResponse]);

    const handleSuggest = useCallback(async () => {
        diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked generate suggestions');
        await generateSuggestions();
    }, [generateSuggestions]);

    const handleContextInfo = useCallback(() => {
        diagnosticLogger.log('info', 'user', 'ChatPage', '👤 User clicked context info', {
            role: initialContext?.targetRole,
            company: initialContext?.targetCompany,
        });
    }, [initialContext]);

    // Filter user messages
    const userMessages = conversationHistory.filter(msg => msg.type === 'user' || msg.type === 'assistant');

    diagnosticLogger.log('trace', 'render', 'ChatPage', `🎨 Render #${renderCount.current} complete`);

    return (
        <ChatInterface
            initialInterviewContext={initialContext}
            knowledgeBaseName={knowledgeBaseName}
            indexedDocumentsCount={indexedDocumentsCount}
            recognitionStatus={recognitionStatus}
            speechErrorMessage={speechErrorMessage}
            canvasRef={canvasRef}
            interimTranscriptMessages={interimTranscriptMessages || []}
            currentInterimTranscript={currentInterimTranscript || ''}
            userMessages={userMessages}
            streamedContent={streamedContent}
            isStreamingComplete={isStreamingComplete}
            conversationSummary={conversationSummary}
            conversationSuggestions={strategicSuggestions}
            isLoading={llmLoading}
            handleStart={handleStart}
            handleStop={handleStop}
            handleClear={handleClear}
            handleMove={handleMove}
            handleSuggest={handleSuggest}
            handleContextInfo={handleContextInfo}
        />
    );
}
