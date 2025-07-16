// src/app/capture-context/page.tsx
'use client';

import { InterviewModalProvider, useInterviewModal } from '@/components/interview-modal/InterviewModalContext'; // ✅ Fixed import
import { InterviewModalTabs } from '@/components/interview-modal/InterviewModalTabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterviewContext } from '@/hooks/useInterviewContext';
import { logger } from '@/lib/Logger';
import { InitialInterviewContext } from '@/types';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function CaptureContextPage() {
    const { context, hasValidContext, setContext } = useInterviewContext(); // ✅ Removed navigateToChat from here
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        logger.info('📝 Context capture page loaded');

        if (hasValidContext && context) {
            logger.info(`🔄 Existing context loaded: ${context.targetRole} at ${context.targetCompany}`);
        }
    }, [hasValidContext, context]);

    const handleInterviewStart = useCallback(
        async (newContext: InitialInterviewContext) => {
            setIsSubmitting(true);
            logger.info('🚀 Starting interview with captured context:', {
                role: newContext.targetRole,
                company: newContext.targetCompany,
                type: newContext.interviewType,
            });

            try {
                // Store the context using our hook
                setContext(newContext);

                // ✅ Wait a bit longer for context to be properly stored
                await new Promise(resolve => setTimeout(resolve, 1000));

                // ✅ Navigate directly using window.location instead of the hook to avoid validation race condition
                logger.info('✅ Context saved, navigating to chat');
                window.location.href = '/chat';
            } catch (error) {
                logger.error('❌ Failed to save context:', error);
                setIsSubmitting(false);
            }
        },
        [setContext]
    );

    const handleBackToHome = () => {
        logger.info('🏠 Navigating back to home');
        goHome();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={handleBackToHome}
                            className="flex items-center gap-2"
                            disabled={isSubmitting} // ✅ Disable during submission
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </div>

                    {hasValidContext && !isSubmitting && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Context Ready</span>
                        </div>
                    )}
                </div>

                {/* Page Title and Description */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Interview Setup</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Configure your interview session for optimal AI assistance and strategic intelligence generation
                    </p>
                </div>

                {/* Main Configuration Card */}
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">🎯 Interview Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Interview Modal Provider - Reusing existing components */}
                        <InterviewModalProvider onSubmit={handleInterviewStart}>
                            <div className="space-y-6">
                                {/* Tab Interface for Configuration */}
                                <InterviewModalTabs />

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center pt-6 border-t">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        All fields with asterisks (*) are required
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={handleBackToHome} disabled={isSubmitting}>
                                            Cancel
                                        </Button>

                                        {/* ✅ Fixed footer component */}
                                        <CustomInterviewFooter isSubmitting={isSubmitting} />
                                    </div>
                                </div>
                            </div>
                        </InterviewModalProvider>
                    </CardContent>
                </Card>

                {/* Progress Indicator */}
                {isSubmitting && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <Card className="w-96">
                            <CardContent className="p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <h3 className="font-semibold mb-2">Preparing Your Interview Session</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Saving your configuration and preparing the chat interface...
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Information Footer */}
                <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>
                        Your interview configuration will be saved for this session and used to provide personalized AI
                        assistance and strategic intelligence.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ✅ Properly fixed footer component that uses the hook correctly
const CustomInterviewFooter = ({ isSubmitting }: { isSubmitting: boolean }) => {
    const { isValid, handleSubmit } = useInterviewModal(); // ✅ Proper hook usage inside provider

    return (
        <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
            {isSubmitting ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting Up...
                </>
            ) : (
                <>🚀 Start Interview Session</>
            )}
        </Button>
    );
};
