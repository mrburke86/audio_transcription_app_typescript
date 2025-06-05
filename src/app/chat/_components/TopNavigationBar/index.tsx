// src\app\chat\_components\TopNavigationBar\index.tsx
import React from 'react';
import { Badge } from '@/components/ui';
import { StatusIndicator } from './StatusIndicator';
// import { KnowledgeStatus } from './KnowledgeStatus';
import { ThemeToggle } from '@/components/global/theme-toggle';

interface TopNavigationBarProps {
    status: 'inactive' | 'active' | 'error';
    // isLoading: boolean;
    // error: string | null;
    errorMessage?: string | null; // Added for speech recognition errors
    // totalFiles: number;
    // totalWords: number;
    knowledgeBaseName: string;
    indexedDocumentsCount: number;
}

// Top Navigation Bar with Title, StatusIndicator and KnowledgeStats
export const TopNavigationBar = React.memo(function TopNavigationBar({
    status,
    errorMessage,
}: // knowledgeBaseName,
// indexedDocumentsCount,
TopNavigationBarProps) {
    // Determine which error to display (prioritize speech recognition errors)
    // const displayError = errorMessage || error;
    // const errorType = errorMessage ? 'Speech Recognition' : 'Knowledge';
    const displayError = errorMessage;
    const errorType = errorMessage ? 'Speech Recognition' : null;

    // let displayStatus: 'listening' | 'processing' | 'error' | 'idle' = 'idle';
    // let statusText = 'Idle';
    // let statusColorClass = 'bg-gray-500'; // Default idle color

    // if (status === 'active') {
    //     displayStatus = 'listening';
    //     statusText = 'Listening...';
    //     statusColorClass = 'bg-green-500 animate-pulse';
    // } else if (status === 'error') {
    //     displayStatus = 'error';
    //     statusText = errorMessage || 'Error'; // Show specific speech error
    //     statusColorClass = 'bg-red-500';
    // }

    // The variables displayStatus, statusText, statusColorClass were for a general status indicator.
    // StatusIndicator component now receives the 'status' prop directly.
    // If those variables were used for something else, that logic needs to be re-evaluated.
    // For now, assuming they were for a general indicator that might be covered by StatusIndicator.

    return (
        // <nav className="bg-white border-b border-slate-200 px-6 py-3">
        <nav className="grid grid-cols-12 gap-2 h-[100px] overflow-hidden">
            {/* Title and Sutitle section */}
            <div className="col-span-3 flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-900">Audio Transcription Studio</h1>
                <p className="text-slate-600 text-sm mt-1">Real-time conversation analysis and insights</p>
            </div>

            {/* Error Message */}
            <div className="col-span-5 flex flex-col justify-center items-center">
                {/* <div className="mt-2 flex justify-center"> */}
                {displayError && errorType && (
                    <Badge variant="destructive" className="text-xs px-3 py-1 max-w-md truncate">
                        {errorType} Error: {displayError}
                    </Badge>
                )}
                {/* </div> */}
            </div>

            {/* Knowledge Stats and Status Indicator */}
            <div className="col-span-4 flex flex-col justify-center">
                <div className="flex items-center justify-end gap-4">
                    {/* Knowledge Status */}
                    {/* <KnowledgeStatus knowledgeBaseName={knowledgeBaseName} indexedDocumentsCount={indexedDocumentsCount} /> */}

                    {/* Status Indicator */}
                    <StatusIndicator status={status} />
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
});
