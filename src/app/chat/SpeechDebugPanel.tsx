// src/components/chat/SpeechDebugPanel.tsx - Temporary Debug Component

'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/modules/Logger';

interface SpeechDebugPanelProps {
    isRecognitionActive: boolean;
    currentInterimTranscript: string;
    recognitionStatus: 'inactive' | 'active' | 'error';
}

export const SpeechDebugPanel: React.FC<SpeechDebugPanelProps> = ({ isRecognitionActive, currentInterimTranscript, recognitionStatus }) => {
    const [browserSupport, setBrowserSupport] = useState<{
        hasWebkit: boolean;
        hasNative: boolean;
        userAgent: string;
    } | null>(null);

    const [microphoneStatus, setMicrophoneStatus] = useState<'unknown' | 'granted' | 'denied' | 'checking'>('unknown');
    const [logs, setLogs] = useState<string[]>([]);

    // Check browser support on mount
    useEffect(() => {
        const hasWebkit = 'webkitSpeechRecognition' in window;
        const hasNative = 'SpeechRecognition' in window;
        const userAgent = navigator.userAgent;

        setBrowserSupport({
            hasWebkit,
            hasNative,
            userAgent: userAgent.substring(0, 50) + '...',
        });

        logger.info(`🔍 Debug Panel - Browser Support: webkit=${hasWebkit}, native=${hasNative}`);
    }, []);

    // Check microphone permissions
    const checkMicrophone = async () => {
        setMicrophoneStatus('checking');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicrophoneStatus('granted');
            stream.getTracks().forEach(track => track.stop());
            logger.info('✅ Debug Panel - Microphone access granted');
        } catch (error) {
            setMicrophoneStatus('denied');
            logger.error(`❌ Debug Panel - Microphone access denied: ${(error as Error).message}`);
        }
    };

    // Listen for log updates (simplified approach)
    useEffect(() => {
        const logEntries = logger.getLogs().slice(-5); // Last 5 logs
        const logMessages = logEntries.map(
            entry => `[${entry.level.toUpperCase()}] ${entry.message.substring(0, 80)}${entry.message.length > 80 ? '...' : ''}`
        );
        setLogs(logMessages);
    }, [isRecognitionActive, recognitionStatus, currentInterimTranscript]);

    return (
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-yellow-400 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-3">🐛 Speech Recognition Debug Panel</h3>

            {/* Browser Support */}
            <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1">Browser Support:</h4>
                {browserSupport ? (
                    <div className="text-xs space-y-1">
                        <div className={`${browserSupport.hasWebkit ? 'text-green-600' : 'text-red-600'}`}>
                            • webkitSpeechRecognition: {browserSupport.hasWebkit ? '✅' : '❌'}
                        </div>
                        <div className={`${browserSupport.hasNative ? 'text-green-600' : 'text-red-600'}`}>
                            • SpeechRecognition: {browserSupport.hasNative ? '✅' : '❌'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">• User Agent: {browserSupport.userAgent}</div>
                    </div>
                ) : (
                    <div className="text-gray-500">Checking...</div>
                )}
            </div>

            {/* Microphone Status */}
            <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1">Microphone:</h4>
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs px-2 py-1 rounded ${
                            microphoneStatus === 'granted'
                                ? 'bg-green-100 text-green-800'
                                : microphoneStatus === 'denied'
                                ? 'bg-red-100 text-red-800'
                                : microphoneStatus === 'checking'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {microphoneStatus.toUpperCase()}
                    </span>
                    {microphoneStatus === 'unknown' && (
                        <button onClick={checkMicrophone} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                            Test Mic
                        </button>
                    )}
                </div>
            </div>

            {/* Current Status */}
            <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1">Current Status:</h4>
                <div className="text-xs space-y-1">
                    <div>
                        • Recognition Active:{' '}
                        <span className={isRecognitionActive ? 'text-green-600' : 'text-red-600'}>
                            {isRecognitionActive ? '✅ YES' : '❌ NO'}
                        </span>
                    </div>
                    <div>
                        • Status:{' '}
                        <span
                            className={`px-1 rounded ${
                                recognitionStatus === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : recognitionStatus === 'error'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {recognitionStatus.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        • Current Interim:
                        <span className="ml-1 font-mono bg-blue-50 dark:bg-blue-900 px-1 rounded">
                            &quot;{currentInterimTranscript || '(none)'}&quot;
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Logs */}
            <div className="mb-3">
                <h4 className="font-semibold text-sm mb-1">Recent Logs:</h4>
                <div className="bg-black text-green-400 text-xs p-2 rounded font-mono max-h-24 overflow-y-auto">
                    {logs.length > 0 ? (
                        logs.map((log, index) => <div key={index}>{log}</div>)
                    ) : (
                        <div className="text-gray-500">No recent logs...</div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h4 className="font-semibold text-sm mb-1">Quick Actions:</h4>
                <div className="flex gap-2 text-xs">
                    <button
                        onClick={() => logger.downloadLogs()}
                        className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                    >
                        Download Full Logs
                    </button>
                    <button onClick={() => logger.clearLogs()} className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">
                        Clear Logs
                    </button>
                </div>
            </div>
        </div>
    );
};
