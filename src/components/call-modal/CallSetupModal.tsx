/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/call-modal/CallSetupModal.tsx
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CallModalProvider } from './CallModalContext';
import { CallModalTabs } from './components/CallModalTabs';
import { CallModalFooter } from './CallModalFooter';
import { CallContext } from '@/types/callContext';
import { Progress } from '@/components/ui/progress';
import { useCallContextForm } from '@/hooks/useCallContextForm';
import { Phone, Users, Target, Settings, Database } from 'lucide-react';

interface CallSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (context: CallContext) => void;
    initialContext?: Partial<CallContext>;
}

function CallSetupModalContent({ onSubmit }: { onSubmit: (context: CallContext) => void }) {
    const { completionPercentage, activeTab } = useCallContextForm();

    const getTabIcon = (tabId: string) => {
        const icons = {
            details: <Phone className="h-4 w-4" />,
            content: <Target className="h-4 w-4" />,
            knowledge: <Database className="h-4 w-4" />,
            settings: <Settings className="h-4 w-4" />,
            advanced: <Settings className="h-4 w-4" />,
        };
        return icons[tabId as keyof typeof icons] || <Phone className="h-4 w-4" />;
    };

    const getTabTitle = (tabId: string) => {
        const titles = {
            details: 'Call Details',
            content: 'Content & Strategy',
            knowledge: 'Knowledge Base',
            settings: 'Response Settings',
            advanced: 'Advanced Settings',
        };
        return titles[tabId as keyof typeof titles] || 'Setup';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with Progress */}
            <DialogHeader className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {getTabIcon(activeTab)}
                        Call Setup - {getTabTitle(activeTab)}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Progress:</span>
                        <div className="w-24">
                            <Progress value={completionPercentage} className="h-2" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
                    </div>
                </div>

                <div className="text-sm text-gray-600">
                    Configure your AI assistant for the upcoming call. Complete all required sections to enable full
                    assistance.
                </div>
            </DialogHeader>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <CallModalTabs />
            </div>

            {/* Footer */}
            <div className="border-t mt-4">
                <CallModalFooter />
            </div>
        </div>
    );
}

export function CallSetupModal({ isOpen, onClose, onSubmit, initialContext }: CallSetupModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-6">
                <CallModalProvider onSubmit={onSubmit}>
                    <CallSetupModalContent onSubmit={onSubmit} />
                </CallModalProvider>
            </DialogContent>
        </Dialog>
    );
}

// Export a simplified trigger component
interface CallSetupTriggerProps {
    onCallConfigured: (context: CallContext) => void;
    triggerText?: string;
    variant?: 'default' | 'outline' | 'ghost';
    className?: string;
}

export function CallSetupTrigger({
    onCallConfigured,
    triggerText = 'Setup Call',
    variant = 'default',
    className,
}: CallSetupTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (context: CallContext) => {
        onCallConfigured(context);
        setIsOpen(false);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant={variant} className={className}>
                <Phone className="h-4 w-4 mr-2" />
                {triggerText}
            </Button>

            <CallSetupModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={handleSubmit} />
        </>
    );
}
