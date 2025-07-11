// src/app/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterviewContext } from '@/hooks/useInterviewContext';
import { logger } from '@/modules';
import { ArrowRight, BarChart3, Brain, MessageSquare, Settings } from 'lucide-react';
import { useEffect } from 'react';

export default function HomePage() {
    const { context, hasValidContext, navigateToChat, navigateToContextCapture } = useInterviewContext();

    useEffect(() => {
        logger.info('🏠 Home page loaded');
    }, []);

    const handleStartChat = () => {
        if (hasValidContext) {
            logger.info('✅ Valid context found, navigating directly to chat');
            navigateToChat();
        } else {
            logger.info('📝 No valid context, navigating to context capture');
            navigateToContextCapture();
        }
    };

    const handleNewSession = () => {
        logger.info('🆕 Starting new interview session');
        navigateToContextCapture();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Interview Edge AI</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Real-time conversation analysis and strategic intelligence for interview excellence
                    </p>
                </div>

                {/* Current Session Card (if context exists) */}
                {hasValidContext && context && (
                    <div className="mb-8">
                        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                    <Settings className="h-5 w-5" />
                                    Active Interview Session
                                </CardTitle>
                                <CardDescription className="text-green-700 dark:text-green-300">
                                    You have an interview session ready to continue
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        <strong>Role:</strong> {context.targetRole}
                                    </p>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        <strong>Company:</strong> {context.targetCompany}
                                    </p>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        <strong>Type:</strong> {context.interviewType} interview
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={navigateToChat}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Continue Session
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleNewSession}
                                        className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                                    >
                                        Start New Session
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-blue-600" />
                                AI-Powered Insights
                            </CardTitle>
                            <CardDescription>
                                Get strategic intelligence and thought leadership positioning in real-time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Advanced analysis of conversation flow with personalized suggestions for demonstrating
                                expertise and industry knowledge.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                                Live Transcription
                            </CardTitle>
                            <CardDescription>
                                Real-time speech recognition with intelligent conversation management
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Seamless voice-to-text conversion with smart conversation tracking and context-aware
                                response generation.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                                Knowledge Integration
                            </CardTitle>
                            <CardDescription>Leverage your career history and industry expertise</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Integration with personal knowledge base including achievements, methodologies, and
                                company-specific intelligence.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Action Section */}
                <div className="text-center">
                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Ready to Start?</CardTitle>
                            <CardDescription>
                                Begin your interview preparation session with AI-powered assistance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleStartChat}
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <MessageSquare className="mr-2 h-5 w-5" />
                                {hasValidContext ? 'Continue Chat' : 'Start Chat'}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            {!hasValidContext && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                                    You'll be guided through interview setup first
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Information */}
                <div className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>Powered by advanced AI and vector search technology for strategic interview intelligence</p>
                </div>
            </div>
        </div>
    );
}
