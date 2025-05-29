//

import { Badge } from '@/components/ui';
import { StatusIndicator } from './StatusIndicator';
import { KnowledgeStatus } from './KnowledgeStatus';

interface TopNavigationBarProps {
    status: 'inactive' | 'active' | 'error';
    isLoading: boolean;
    error: string | null;
    errorMessage?: string | null; // Added for speech recognition errors
    totalFiles: number;
    totalWords: number;
}

// Top Navigation Bar with Title, StatusIndicator and KnowledgeStats
export function TopNavigationBar({ status, isLoading, error, errorMessage, totalFiles, totalWords }: TopNavigationBarProps) {
    // Determine which error to display (prioritize speech recognition errors)
    const displayError = errorMessage || error;
    const errorType = errorMessage ? 'Speech Recognition' : 'Knowledge';

    return (
        // <nav className="bg-white border-b border-slate-200 px-6 py-3">
        <nav className="grid grid-cols-12 gap-2 h-[100px] overflow-hidden">
            {/* Title and Sutitle section */}
            <div className="col-span-3 flex flex-col">
                <h1 className="text-2xl font-bold text-slate-900">Audio Transcription Studio</h1>
                <p className="text-slate-600 text-sm mt-1">Real-time conversation analysis and insights</p>
            </div>

            {/* Error Message */}
            <div className="col-span-5 flex flex-col">
                <div className="mt-2 flex justify-center">
                    {displayError && (
                        <Badge variant="destructive" className="text-xs px-3 py-1 max-w-md truncate">
                            {errorType} Error: {displayError}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Knowledge Stats and Status Indicator */}
            <div className="col-span-4 flex flex-col">
                <div className="flex items-center gap-4">
                    {/* Knowledge Status */}
                    <KnowledgeStatus isLoading={isLoading} error={error} totalFiles={totalFiles} totalWords={totalWords} />

                    {/* Status Indicator */}
                    <StatusIndicator status={status} />
                </div>
            </div>
        </nav>
    );
}
