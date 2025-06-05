// src/hooks/index.ts

// export * from './useLLMProviderOptimized';
// export * from './useSpeechRecognition';
// export * from './useTranscriptions';
export * from './useDynamicList';
// export * from './useInterviewContextForm';
// export * from './useCallContextForm';

// ✅ NEW: Export Zustand-based hooks as primary
export * from '@/stores/hooks/useSelectors';

// ✅ LEGACY: Keep existing hooks for backward compatibility during transition
// export * from './useLLMProviderOptimized';
// export * from './useSpeechRecognition';
// export * from './useTranscriptions';
export * from './useDynamicList';
// export * from './useInterviewContextForm';
// export * from './useCallContextForm';

// ✅ NEW: Re-export store-based hooks with clear naming
export { useKnowledge as useKnowledgeStore } from '@/stores/hooks/useSelectors';
export { useLLM as useLLMStore } from '@/stores/hooks/useSelectors';
export { useSpeech as useSpeechStore } from '@/stores/hooks/useSelectors';
export { useInterview as useInterviewStore } from '@/stores/hooks/useSelectors';
export { useUI as useUIStore } from '@/stores/hooks/useSelectors';
