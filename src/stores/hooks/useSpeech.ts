import { useAppStore } from '../store';
import { useShallow } from 'zustand/react/shallow';

// Dedicated hook for speech recognition operations
// Replaces your speech recognition useState patterns
export const useSpeech = () => {
    return useAppStore(
        useShallow(state => ({
            // State selectors
            isRecording: state.isRecording,
            isProcessing: state.isProcessing,
            recognitionStatus: state.recognitionStatus,
            error: state.error,
            currentTranscript: state.currentTranscript,
            interimTranscripts: state.interimTranscripts,
            audioSessions: state.audioSessions,

            // Action selectors
            startRecording: state.startRecording,
            stopRecording: state.stopRecording,
            processAudioSession: state.processAudioSession,
            clearTranscripts: state.clearTranscripts,
            handleRecognitionResult: state.handleRecognitionResult,
            clearError: state.clearError,
        }))
    );
};

// Selective hook for recording status
export const useRecordingStatus = () => {
    return useAppStore(
        useShallow(state => ({
            isRecording: state.isRecording,
            isProcessing: state.isProcessing,
            recognitionStatus: state.recognitionStatus,
            error: state.error,
        }))
    );
};

// Selective hook for transcription management
export const useTranscriptionManager = () => {
    return useAppStore(
        useShallow(state => ({
            currentTranscript: state.currentTranscript,
            interimTranscripts: state.interimTranscripts,
            audioSessions: state.audioSessions,
            clearTranscripts: state.clearTranscripts,
            processAudioSession: state.processAudioSession,
        }))
    );
};
