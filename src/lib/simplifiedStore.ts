// src/stores/simplifiedStore.ts
'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CallContext, Message } from '@/types';

// ===== SIMPLIFIED STATE INTERFACE =====
interface AppState {
    // ===== CORE APP STATE (CONSOLIDATED) =====

    // Theme & UI (minimal)
    theme: 'light' | 'dark';
    globalLoading: boolean;
    globalError: string | null;

    // Call Context (essential only)
    callContext: CallContext | null;
    isSetupModalOpen: boolean;

    // Current Session (volatile - no persistence)
    currentMessages: Message[]; // Replace conversations Map
    currentTranscript: string;
    isRecording: boolean;
    isGenerating: boolean;

    // Knowledge (minimal state)
    indexedDocsCount: number;
    knowledgeError: string | null;

    // ===== SIMPLIFIED ACTIONS =====

    // UI Actions
    setTheme: (theme: 'light' | 'dark') => void;
    setGlobalLoading: (loading: boolean) => void;
    setGlobalError: (error: string | null) => void;

    // Call Setup
    setCallContext: (context: CallContext | null) => void;
    toggleSetupModal: (open?: boolean) => void;

    // Session Actions (replace complex slice actions)
    addMessage: (message: Message) => void;
    clearMessages: () => void;
    setTranscript: (transcript: string) => void;
    setRecording: (recording: boolean) => void;
    setGenerating: (generating: boolean) => void;

    // Knowledge Actions (simplified)
    setIndexedDocsCount: (count: number) => void;
    setKnowledgeError: (error: string | null) => void;

    // Cleanup Action (CRITICAL for memory)
    cleanup: () => void;
}

// ===== STORE IMPLEMENTATION =====
export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set, get) => ({
                // ===== INITIAL STATE =====
                theme: 'dark',
                globalLoading: false,
                globalError: null,

                callContext: null,
                isSetupModalOpen: false,

                // Volatile session state (not persisted)
                currentMessages: [],
                currentTranscript: '',
                isRecording: false,
                isGenerating: false,

                indexedDocsCount: 0,
                knowledgeError: null,

                // ===== ACTIONS =====

                setTheme: theme => set({ theme }),
                setGlobalLoading: globalLoading => set({ globalLoading }),
                setGlobalError: globalError => set({ globalError }),

                setCallContext: callContext => set({ callContext }),
                toggleSetupModal: open =>
                    set({
                        isSetupModalOpen: open ?? !get().isSetupModalOpen,
                    }),

                // Session management with size limits
                addMessage: message =>
                    set(state => {
                        const newMessages = [...state.currentMessages, message];
                        // MEMORY PROTECTION: Keep only last 50 messages
                        if (newMessages.length > 50) {
                            newMessages.splice(0, newMessages.length - 50);
                        }
                        return { currentMessages: newMessages };
                    }),

                clearMessages: () => set({ currentMessages: [] }),
                setTranscript: currentTranscript => set({ currentTranscript }),
                setRecording: isRecording => set({ isRecording }),
                setGenerating: isGenerating => set({ isGenerating }),

                setIndexedDocsCount: indexedDocsCount => set({ indexedDocsCount }),
                setKnowledgeError: knowledgeError => set({ knowledgeError }),

                // CRITICAL: Cleanup function to prevent memory leaks
                cleanup: () =>
                    set({
                        currentMessages: [],
                        currentTranscript: '',
                        isRecording: false,
                        isGenerating: false,
                        globalError: null,
                        knowledgeError: null,
                    }),
            }),
            {
                name: 'app-store',
                // ONLY persist essential user preferences
                partialize: state => ({
                    theme: state.theme,
                    callContext: state.callContext,
                    indexedDocsCount: state.indexedDocsCount,
                }),
            }
        ),
        { name: 'AudioTranscriptionApp' }
    )
);

// ===== CLEANUP UTILITIES =====

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        useAppStore.getState().cleanup();
    });

    // Periodic cleanup every 5 minutes
    setInterval(() => {
        const state = useAppStore.getState();
        if (state.currentMessages.length > 30) {
            console.log('Auto-cleanup: Trimming messages');
            state.cleanup();
        }
    }, 5 * 60 * 1000);
}

// ===== SIMPLE HOOKS =====

// Replace complex useSelectors with simple hooks
export const useTheme = () =>
    useAppStore(state => ({
        theme: state.theme,
        setTheme: state.setTheme,
    }));

export const useSession = () =>
    useAppStore(state => ({
        messages: state.currentMessages,
        transcript: state.currentTranscript,
        isRecording: state.isRecording,
        isGenerating: state.isGenerating,
        addMessage: state.addMessage,
        setTranscript: state.setTranscript,
        setRecording: state.setRecording,
        setGenerating: state.setGenerating,
        clearMessages: state.clearMessages,
    }));

export const useCallSetup = () =>
    useAppStore(state => ({
        context: state.callContext,
        isModalOpen: state.isSetupModalOpen,
        setContext: state.setCallContext,
        toggleModal: state.toggleSetupModal,
    }));

export const useAppStatus = () =>
    useAppStore(state => ({
        loading: state.globalLoading,
        error: state.globalError,
        setLoading: state.setGlobalLoading,
        setError: state.setGlobalError,
    }));
