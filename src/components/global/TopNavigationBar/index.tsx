// src\app\chat\_components\TopNavigationBar\index.tsx
import { ThemeToggle } from '@/components/global/theme-toggle';
import { Badge, Button } from '@/components/ui';
import { Settings } from 'lucide-react';
import React from 'react';
import { KnowledgeStatus } from './KnowledgeStatus';
import { StatusIndicator } from './StatusIndicator';

interface TopNavigationBarProps {
    status: 'inactive' | 'active' | 'error';
    errorMessage?: string | null;
    knowledgeBaseName: string;
    indexedDocumentsCount: number;
    contextButton?: {
        targetRole: string;
        targetCompany: string;
        onClick: () => void;
    };
}

// Top Navigation Bar with Title, StatusIndicator and KnowledgeStats
export const TopNavigationBar = React.memo(function TopNavigationBar({
    status,
    errorMessage,
    knowledgeBaseName,
    indexedDocumentsCount,
    contextButton,
}: TopNavigationBarProps) {
    // Determine which error to display (prioritize speech recognition errors)
    const displayError = errorMessage;
    const errorType = errorMessage ? 'Speech Recognition' : null;

    return (
        <nav className="grid grid-cols-12 gap-2 h-[100px] overflow-hidden">
            {/* Title and Sutitle section */}
            <div className="col-span-3 flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-900">Audio Transcription Studio</h1>
                <p className="text-slate-600 text-sm mt-1">Real-time conversation analysis and insights</p>
            </div>

            {/* Error Message */}
            <div className="col-span-3 flex flex-col justify-center items-center">
                {displayError && errorType && (
                    <Badge variant="destructive" className="text-xs px-3 py-1 max-w-md truncate">
                        {errorType} Error: {displayError}
                    </Badge>
                )}
            </div>

            {/* Knowledge Stats, Status Indicator, Context Button, and Theme Toggle */}
            <div className="col-span-6 flex flex-col justify-center">
                <div className="flex items-center justify-end gap-3">
                    {/* Knowledge Status */}
                    <KnowledgeStatus
                        knowledgeBaseName={knowledgeBaseName}
                        indexedDocumentsCount={indexedDocumentsCount}
                    />

                    {/* Status Indicator */}
                    <StatusIndicator status={status} />

                    {/* Context Button */}
                    {contextButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={contextButton.onClick}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                            title="View current interview context"
                        >
                            <Settings className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">{contextButton.targetRole}</span>
                            <span className="hidden md:inline"> @ {contextButton.targetCompany}</span>
                        </Button>
                    )}

                    {/* Theme Toggle */}
                    <ThemeToggle fixed={false} />
                </div>
            </div>
        </nav>
    );
});
