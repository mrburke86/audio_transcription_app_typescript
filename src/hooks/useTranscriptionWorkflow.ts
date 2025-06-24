// // hooks/useTranscriptionWorkflow.ts
// import { useAppStore } from '@/stores/store';
// import { TranscriptionWorkflow } from '@/types/store';

// /**
//  * 🎣 Custom hook for transcription workflow state management
//  *
//  * Provides easy access to workflow state and convenient helper methods
//  * Similar to the GitHub example pattern
//  */
// export const useTranscriptionWorkflow = () => {
//   const workflow = useAppStore(state => state.transcriptionWorkflow);
//   const setWorkflow = useAppStore(state => state.setTranscriptionWorkflow);
//   const resetWorkflow = useAppStore(state => state.resetTranscriptionWorkflow);

//   // ✅ Convenience methods for common workflow checks
//   const isInProgress = workflow.recorded ||
//                       workflow.uploadStarted ||
//                       workflow.transcriptStarted ||
//                       workflow.processingStarted ||
//                       workflow.streamingStarted;

//   const hasError = !!workflow.error;

//   const isComplete = workflow.streamingFinished && !hasError;

//   const canStartNew = !isInProgress && !workflow.recorded;

//   // ✅ Helper methods for specific workflow updates
//   const setRecorded = () => setWorkflow(w => ({ ...w, recorded: true }));

//   const setUploadStarted = (url?: string) => setWorkflow(w => ({
//     ...w,
//     uploadStarted: true,
//     uploadedURL: url || null
//   }));

//   const setTranscriptStarted = () => setWorkflow(w => ({
//     ...w,
//     transcriptStarted: true
//   }));

//   const setProcessingStarted = () => setWorkflow(w => ({
//     ...w,
//     processingStarted: true
//   }));

//   const setStreamingStarted = () => setWorkflow(w => ({
//     ...w,
//     streamingStarted: true
//   }));

//   const setTranscriptComplete = (transcript: string) => setWorkflow(w => ({
//     ...w,
//     transcript,
//     streamingFinished: true
//   }));

//   const setError = (error: string) => setWorkflow(w => ({
//     ...w,
//     error
//   }));

//   return {
//     // ✅ Core state
//     workflow,
//     setWorkflow,
//     resetWorkflow,

//     // ✅ Convenience flags
//     isInProgress,
//     hasError,
//     isComplete,
//     canStartNew,

//     // ✅ Helper methods
//     setRecorded,
//     setUploadStarted,
//     setTranscriptStarted,
//     setProcessingStarted,
//     setStreamingStarted,
//     setTranscriptComplete,
//     setError,

//     // ✅ Current workflow state for easy access
//     currentStep: workflow.recorded ? 'recorded' :
//                 workflow.uploadStarted ? 'uploading' :
//                 workflow.transcriptStarted ? 'transcribing' :
//                 workflow.processingStarted ? 'processing' :
//                 workflow.streamingStarted ? 'streaming' :
//                 workflow.streamingFinished ? 'complete' :
//                 'idle',
//   };
// };
