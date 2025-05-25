// src/hooks/useSpeechRecognitionCore.ts - FIXED TypeScript Errors

import { useCallback, useRef } from 'react';
import { logger } from '@/modules/Logger';

export interface SpeechRecognitionCoreProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (error: SpeechRecognitionErrorEvent) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

export const useSpeechRecognitionCore = ({ onStart, onEnd, onError, onResult }: SpeechRecognitionCoreProps) => {
    const recognition = useRef<SpeechRecognition | null>(null);
    const isActiveRef = useRef(false);
    const isInitializingRef = useRef(false);
    const shouldRestartRef = useRef(false);

    const checkBrowserSupport = useCallback(() => {
        logger.info('🔍 Checking browser support for speech recognition...');

        const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
        const hasNativeSpeechRecognition = 'SpeechRecognition' in window;

        logger.info(`📱 Browser support check:
            - webkitSpeechRecognition: ${hasWebkitSpeechRecognition}
            - SpeechRecognition: ${hasNativeSpeechRecognition}
            - User Agent: ${navigator.userAgent.substring(0, 100)}...`);

        return hasWebkitSpeechRecognition || hasNativeSpeechRecognition;
    }, []);

    const initializeRecognition = useCallback(() => {
        logger.info('🔧 Initializing speech recognition...');

        if (recognition.current) {
            logger.info('✅ Recognition already exists, returning existing instance');
            return recognition.current;
        }

        if (isInitializingRef.current) {
            logger.warning('⚠️ Recognition initialization already in progress');
            return recognition.current;
        }

        isInitializingRef.current = true;

        try {
            logger.info('🏗️ Creating SpeechRecognition instance...');

            // ✅ FIXED: Proper type casting
            const SpeechRecognitionConstructor =
                (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
                    .SpeechRecognition ||
                (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
                    .webkitSpeechRecognition;

            if (!SpeechRecognitionConstructor) {
                throw new Error('SpeechRecognition constructor not found');
            }

            recognition.current = new SpeechRecognitionConstructor();
            logger.info('✅ SpeechRecognition instance created successfully');

            // ✅ FIXED: Add null check before accessing properties
            if (!recognition.current) {
                throw new Error('Failed to create recognition instance');
            }

            // Configure recognition for continuous listening
            logger.info('⚙️ Configuring speech recognition settings...');
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.lang = 'en-US';
            recognition.current.maxAlternatives = 1;

            logger.info(`📋 Configuration applied:
                - continuous: ${recognition.current.continuous}
                - interimResults: ${recognition.current.interimResults}
                - lang: ${recognition.current.lang}
                - maxAlternatives: ${recognition.current.maxAlternatives}`);

            // Set up event handlers with extensive logging
            recognition.current.onstart = event => {
                logger.info('🎙️ Speech recognition STARTED');
                logger.debug(`🔍 onstart event: ${JSON.stringify(event)}`);
                onStart();
            };

            recognition.current.onend = event => {
                logger.info('🛑 Speech recognition ENDED');
                logger.debug(`🔍 onend event: ${JSON.stringify(event)}`);
                logger.info(`📊 Current state: isActive=${isActiveRef.current}, shouldRestart=${shouldRestartRef.current}`);

                onEnd();

                // Auto-restart logic with detailed logging
                if (isActiveRef.current && shouldRestartRef.current) {
                    logger.info('🔄 Auto-restart triggered - scheduling restart in 100ms');
                    setTimeout(() => {
                        if (isActiveRef.current && recognition.current) {
                            logger.info('🚀 Executing auto-restart...');
                            try {
                                recognition.current.start();
                                logger.info('✅ Auto-restart successful');
                            } catch (error) {
                                logger.error(`❌ Auto-restart failed: ${(error as Error).message}`);
                            }
                        } else {
                            logger.info('🚫 Auto-restart cancelled - conditions no longer met');
                        }
                    }, 100);
                } else {
                    logger.info('🚫 Auto-restart not triggered');
                }
            };

            recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                logger.error(`🎙️ Speech recognition ERROR: ${event.error}`);
                logger.error(`🔍 Error details:
                    - error: ${event.error}
                    - message: ${event.message || 'No message'}
                    - type: ${event.type}
                    - timeStamp: ${event.timeStamp}`);

                // Log common error explanations
                const errorExplanations: Record<string, string> = {
                    'not-allowed': 'Microphone permission denied by user',
                    'no-speech': 'No speech was detected (normal, will auto-restart)',
                    'audio-capture': 'Audio capture failed (microphone issue)',
                    network: 'Network error occurred',
                    'service-not-allowed': 'Speech service not allowed',
                    'bad-grammar': 'Grammar issue',
                    'language-not-supported': 'Language not supported',
                    aborted: 'Speech recognition was aborted',
                };

                const explanation = errorExplanations[event.error] || 'Unknown error';
                logger.info(`💡 Error explanation: ${explanation}`);

                // // Handle specific errors that should trigger restart
                // if (event.error === 'no-speech' || event.error === 'audio-capture') {
                //     logger.info('🔄 Recoverable error - will continue operation');
                // } else {
                //     logger.warning('⚠️ Non-recoverable error - notifying error handler');
                //     onError(event);
                // }
                onError(event);
            };

            recognition.current.onresult = (event: SpeechRecognitionEvent) => {
                logger.debug(`🎯 Speech recognition RESULT received (resultIndex: ${event.resultIndex})`);

                let interimTranscript = '';
                let finalTranscript = '';
                let resultCount = 0;

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i][0];
                    const transcript = result.transcript;
                    const confidence = result.confidence || 0;
                    resultCount++;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                        logger.info(`✅ FINAL transcript: "${transcript}" (confidence: ${(confidence * 100).toFixed(0)}%)`);
                    } else {
                        interimTranscript += transcript;
                        logger.debug(`📝 INTERIM transcript: "${transcript}" (confidence: ${(confidence * 100).toFixed(0)}%)`);
                    }
                }

                logger.debug(
                    `📊 Result summary: ${resultCount} results processed, final="${finalTranscript}", interim="${interimTranscript}"`
                );
                onResult(finalTranscript, interimTranscript);
            };

            // Additional event handlers for debugging
            recognition.current.onsoundstart = () => {
                logger.debug('🔊 Sound detection started');
            };

            recognition.current.onsoundend = () => {
                logger.debug('🔇 Sound detection ended');
            };

            recognition.current.onspeechstart = () => {
                logger.debug('🗣️ Speech detection started');
            };

            recognition.current.onspeechend = () => {
                logger.debug('🤐 Speech detection ended');
            };

            recognition.current.onaudiostart = () => {
                logger.debug('🎤 Audio input started');
            };

            recognition.current.onaudioend = () => {
                logger.debug('🎤 Audio input ended');
            };

            logger.info('🔧 Speech recognition initialized successfully with all event handlers');
        } catch (error) {
            logger.error(`❌ Speech recognition initialization failed: ${(error as Error).message}`);
            logger.error(`🔍 Error stack: ${(error as Error).stack}`);
            throw error;
        } finally {
            isInitializingRef.current = false;
            logger.info('🏁 Initialization process completed');
        }

        return recognition.current;
    }, [onStart, onEnd, onError, onResult]);

    const start = useCallback(async () => {
        logger.info('🚀 Starting speech recognition...');

        // Browser support check
        if (!checkBrowserSupport()) {
            const error = new Error('Speech recognition not supported in this browser');
            logger.error(`❌ ${error.message}`);
            throw error;
        }

        // Check if already active
        if (isActiveRef.current) {
            logger.warning('⚠️ Speech recognition already active, skipping start');
            return;
        }

        // Check microphone permissions
        try {
            logger.info('🎤 Checking microphone permissions...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            logger.info('✅ Microphone access granted');

            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
        } catch (permissionError) {
            logger.error(`❌ Microphone permission error: ${(permissionError as Error).message}`);
            throw new Error('Microphone access denied. Please allow microphone access and try again.');
        }

        // Set state flags
        isActiveRef.current = true;
        shouldRestartRef.current = true;
        logger.info(`📊 State updated: isActive=${isActiveRef.current}, shouldRestart=${shouldRestartRef.current}`);

        try {
            logger.info('🔧 Initializing recognition instance...');
            const recognitionInstance = initializeRecognition();

            if (!recognitionInstance) {
                throw new Error('Failed to create recognition instance');
            }

            logger.info('▶️ Starting speech recognition...');
            recognitionInstance.start();
            logger.info('✅ Speech recognition start command sent');
        } catch (error) {
            logger.error(`❌ Failed to start speech recognition: ${(error as Error).message}`);

            // Reset state on failure
            isActiveRef.current = false;
            shouldRestartRef.current = false;
            logger.info('🔄 State reset due to error');

            throw error;
        }
    }, [checkBrowserSupport, initializeRecognition]);

    const stop = useCallback(() => {
        logger.info('🛑 Stopping speech recognition...');

        // Update state flags
        const wasActive = isActiveRef.current;
        isActiveRef.current = false;
        shouldRestartRef.current = false;
        logger.info(
            `📊 State updated: isActive=${isActiveRef.current}, shouldRestart=${shouldRestartRef.current} (was active: ${wasActive})`
        );

        if (recognition.current) {
            try {
                logger.info('⏹️ Sending stop command to recognition...');
                recognition.current.stop();
                logger.info('✅ Speech recognition stop command sent');
            } catch (error) {
                logger.error(`❌ Error stopping recognition: ${(error as Error).message}`);
                throw error;
            }
        } else {
            logger.warning('⚠️ No recognition instance to stop');
        }
    }, []);

    return {
        start,
        stop,
        isActive: isActiveRef.current,
        isSupported: checkBrowserSupport(),
    };
};
