// src/hooks/chat/useInitialization.ts
'use client';

import { useCleanup } from '@/hooks/useCleanup';
import { logger } from '@/lib/Logger';
import { useBoundStore } from '@/stores/chatStore';
import { useEffect, useRef, useState } from 'react';

export interface InitializationStatus {
    isInitializing: boolean;
    isRehydrated: boolean;
    isContextValid: boolean;
    isLLMReady: boolean;
    isKnowledgeBaseReady: boolean;
    error: string | null;
}

export interface UseInitializationOptions {
    apiKey?: string;
    autoRedirect?: boolean;
    skipKnowledgeBase?: boolean;
}

export const useInitialization = (options: UseInitializationOptions = {}) => {
    const { apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY, autoRedirect = true, skipKnowledgeBase = false } = options;

    const {
        isContextValid,
        navigateToContextCapture,
        initializeLLMService,
        initializeKnowledgeBase,
        llmService,
        knowledgeError,
        indexedDocumentsCount,
    } = useBoundStore();

    const [status, setStatus] = useState<InitializationStatus>({
        isInitializing: true,
        isRehydrated: false,
        isContextValid: false,
        isLLMReady: false,
        isKnowledgeBaseReady: false,
        error: null,
    });

    const initializationStarted = useRef(false);
    const cleanup = useCleanup('useInitialization');

    // ✅ REGISTER CLEANUP FOR ANY TIMERS OR RESOURCES
    useEffect(() => {
        // Register any cleanup needed for initialization
        const handleCleanup = () => {
            logger.info('🧹 Cleaning up initialization resources');
            setStatus(prev => ({ ...prev, isInitializing: false }));
        };

        cleanup.addCleanup(handleCleanup, 'initialization-state');
    }, [cleanup]);

    // ✅ STEP 1: Handle store rehydration
    useEffect(() => {
        if (status.isRehydrated) return;

        const handleRehydration = async () => {
            try {
                logger.info('🔄 Starting store rehydration...');

                const result = useBoundStore.persist.rehydrate();

                if (result instanceof Promise) {
                    await result.catch(error => {
                        logger.warning('⚠️ Store rehydration failed, clearing session storage', error);
                        sessionStorage.removeItem('interview_context');
                    });
                } else {
                    logger.info('✅ Store rehydration completed synchronously');
                }

                setStatus(prev => ({ ...prev, isRehydrated: true }));
                logger.info('✅ Store rehydration successful');
            } catch (error) {
                logger.error('❌ Store rehydration failed', error);
                sessionStorage.removeItem('interview_context');
                setStatus(prev => ({
                    ...prev,
                    isRehydrated: true,
                    error: 'Failed to restore previous session',
                }));
            }
        };

        handleRehydration();
    }, [status.isRehydrated]);

    // ✅ STEP 2: Validate context and initialize services
    useEffect(() => {
        if (!status.isRehydrated || initializationStarted.current) return;

        const initializeServices = async () => {
            initializationStarted.current = true;

            try {
                logger.info('🚀 Starting service initialization...');

                // Check context validity
                const contextValid = isContextValid();
                logger.info(`📋 Context validation: ${contextValid ? 'VALID' : 'INVALID'}`);

                setStatus(prev => ({ ...prev, isContextValid: contextValid }));

                // If context is invalid and auto-redirect is enabled, navigate away
                if (!contextValid && autoRedirect) {
                    logger.info('🔄 Invalid context detected, redirecting to context capture...');
                    navigateToContextCapture();
                    return;
                }

                // Initialize LLM service
                if (apiKey && !llmService) {
                    logger.info('🤖 Initializing LLM service...');
                    await initializeLLMService(apiKey);
                    setStatus(prev => ({ ...prev, isLLMReady: true }));
                    logger.info('✅ LLM service initialized');
                } else if (llmService) {
                    setStatus(prev => ({ ...prev, isLLMReady: true }));
                    logger.info('✅ LLM service already initialized');
                } else {
                    logger.warning('⚠️ No API key provided, LLM service not initialized');
                }

                // Initialize knowledge base
                if (!skipKnowledgeBase) {
                    logger.info('📚 Initializing knowledge base...');
                    await initializeKnowledgeBase();
                    setStatus(prev => ({ ...prev, isKnowledgeBaseReady: true }));
                    logger.info('✅ Knowledge base initialized');
                } else {
                    logger.info('⏭️ Knowledge base initialization skipped');
                    setStatus(prev => ({ ...prev, isKnowledgeBaseReady: true }));
                }

                setStatus(prev => ({ ...prev, isInitializing: false }));
                logger.info('🎉 All services initialized successfully');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
                logger.error('❌ Service initialization failed:', errorMessage);

                setStatus(prev => ({
                    ...prev,
                    isInitializing: false,
                    error: errorMessage,
                }));
            }
        };

        initializeServices();
    }, [
        status.isRehydrated,
        isContextValid,
        navigateToContextCapture,
        initializeLLMService,
        initializeKnowledgeBase,
        apiKey,
        autoRedirect,
        skipKnowledgeBase,
        llmService,
    ]);

    // ✅ STEP 3: Update status based on store changes
    useEffect(() => {
        setStatus(prev => ({
            ...prev,
            isLLMReady: !!llmService,
            isKnowledgeBaseReady: !knowledgeError && indexedDocumentsCount >= 0,
        }));
    }, [llmService, knowledgeError, indexedDocumentsCount]);

    // ✅ COMPUTED VALUES
    const isFullyInitialized =
        status.isRehydrated &&
        !status.isInitializing &&
        status.isContextValid &&
        status.isLLMReady &&
        status.isKnowledgeBaseReady;

    const hasErrors = !!status.error || !!knowledgeError;

    return {
        ...status,
        isFullyInitialized,
        hasErrors,
        knowledgeBaseError: knowledgeError,

        // Helper methods
        retry: () => {
            initializationStarted.current = false;
            setStatus(prev => ({
                ...prev,
                isInitializing: true,
                error: null,
            }));
        },

        clearError: () => {
            setStatus(prev => ({ ...prev, error: null }));
        },
    };
};
