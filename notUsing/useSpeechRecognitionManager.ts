// // src\hooks\useSpeechRecognitionManager.ts
// import { useCallback, useRef, useState } from 'react';
// import { CustomSpeechError, useSpeechRecognition } from './useSpeechRecognition';
// import { logger } from '@/modules';

// interface UseSpeechRecognitionManagerProps {
//     onResult: (finalTranscript: string, interimTranscript: string) => void;
// }

// export const useSpeechRecognitionManager = ({ onResult }: UseSpeechRecognitionManagerProps) => {
//     const [status, setStatus] = useState<'inactive' | 'active' | 'error'>('inactive');
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const visualizationStartedRef = useRef(false);

//     const getUserFriendlyError = useCallback((errorCode: string): string => {
//         switch (errorCode) {
//             case 'network':
//                 return 'Network error. Please check your internet connection.';
//             case 'not-allowed':
//                 return 'Microphone access denied. Please allow microphone access in your browser settings.';
//             case 'service-not-allowed':
//                 return 'Speech recognition service not allowed. Please check your browser settings.';
//             case 'no-speech':
//                 return 'No speech detected. Please try speaking again.';
//             case 'audio-capture':
//                 return 'Audio capture failed. Please check your microphone.';
//             case 'aborted':
//                 return 'Speech recognition was aborted.';
//             case 'language-not-supported':
//                 return 'Language not supported. Please try a different language.';
//             case 'bad-grammar':
//                 return 'Grammar configuration issue. Please contact support.';
//             default:
//                 return 'An unexpected error occurred with speech recognition.';
//         }
//     }, []);

//     // Handle speech recognition start
//     const handleRecognitionStart = useCallback(() => {
//         logger.info('🎙️✅ Speech recognition started');
//         setStatus('active');
//     }, []);

//     // Handle speech recognition end
//     const handleRecognitionEnd = useCallback(() => {
//         logger.info('🎙️⏹️ Speech recognition ended');
//         setStatus('inactive');
//     }, []);

//     // Handle speech recognition error
//     const handleRecognitionError = useCallback(
//         (error: SpeechRecognitionErrorEvent | CustomSpeechError) => {
//             let errorCode: string;
//             let errorMsg: string;

//             if ('error' in error) {
//                 errorCode = error.error;
//                 errorMsg = getUserFriendlyError(error.error);
//             } else {
//                 errorCode = error.code;
//                 errorMsg = error.message;
//             }

//             logger.error(`🎙️❌ Speech recognition error: ${errorCode}`);
//             setStatus('error');
//             setErrorMessage(errorMsg);
//         },
//         [getUserFriendlyError]
//     );

//     // Initialize speech recognition
//     const { start, stop, startAudioVisualization } = useSpeechRecognition({
//         onStart: handleRecognitionStart,
//         onEnd: handleRecognitionEnd,
//         onError: handleRecognitionError,
//         onResult,
//     });

//     const handleStart = useCallback(() => {
//         logger.info('🎙️ Starting speech recognition');
//         start()
//             .then(() => {
//                 if (canvasRef.current && !visualizationStartedRef.current) {
//                     logger.info('🎨 Starting audio visualization');
//                     startAudioVisualization(canvasRef.current);
//                     visualizationStartedRef.current = true;
//                 } else if (!canvasRef.current) {
//                     logger.warning("⚠️ Canvas reference is null, can't start visualization");
//                 }
//             })
//             .catch(error => {
//                 logger.error(`🎙️❌ Failed to start speech recognition: ${error.message}`);
//             });
//     }, [start, startAudioVisualization]);

//     const handleStop = useCallback(() => {
//         logger.info('🎙️ Stopping speech recognition');
//         stop();
//         visualizationStartedRef.current = false;
//     }, [stop]);

//     return {
//         status,
//         errorMessage,
//         canvasRef,
//         handleStart,
//         handleStop,
//     };
// };
