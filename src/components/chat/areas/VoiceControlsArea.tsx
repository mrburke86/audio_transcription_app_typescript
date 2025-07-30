// src/components/chat/areas/VoiceControlsArea.tsx
'use client';

import { VoiceControls } from '@/components/chat';
import { SpeechErrorBoundary } from '@/components/error-boundary';
import { useSpeechSession } from '@/hooks/speech';
import React from 'react';

export const VoiceControlsArea: React.FC = () => {
    const { recognitionStatus, canvasRef, startSession, stopSession, clearSession } = useSpeechSession();

    return (
        <SpeechErrorBoundary>
            <VoiceControls
                onStart={startSession}
                onStop={stopSession}
                onClear={clearSession}
                isRecognitionActive={recognitionStatus === 'active'}
                canvasRef={canvasRef}
            />
        </SpeechErrorBoundary>
    );
};
