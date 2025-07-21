// src/app/chat/page.tsx - FIXED: Layout and transcription display issues

'use client';

import { MemoizedChatMessagesBox } from '@/components/chat/ChatMessagesBox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useConsolidatedSpeech } from '@/hooks/useConsolidatedSpeech';
import { useBoundStore } from '@/stores/chatStore';
import {
    AlertCircle,
    Bot,
    CheckCircle,
    Loader2,
    MessageSquare,
    Mic,
    Send,
    Settings,
    Square,
    User,
    Volume2,
    VolumeX,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ChatPage() {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState('5C');
    const [mode, setMode] = useState<'manual' | 'speech' | 'consolidated'>('consolidated');
    const [manualInput, setManualInput] = useState('');
    const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error' | 'unconfigured'>('checking');

    // CONSOLIDATED ZUSTAND STATE - Single source of truth
    const {
        // Chat state
        conversationHistory,
        addUserMessage,
        addAssistantMessage,
        clearHistory,
        getMessageCount,

        // LLM state
        llmService,
        streamedContent,
        isStreamingComplete,
        llmLoading,
        llmError,
        initializeLLMService,
        generateResponse,
        resetStreamedContent,

        // Context state
        initialContext,
        isContextValid,
    } = useBoundStore();

    // CONSOLIDATED SPEECH HOOK - Replaces 3 previous hooks
    const {
        // State
        recognitionStatus,
        speechErrorMessage,
        isVisualizationActive,
        isRecording,
        hasTranscriptions,
        transcriptionText,

        // Actions
        startRecording,
        stopRecording,
        submitTranscriptionToChat,
        clearTranscriptions,
        clearAll,

        // Canvas ref
        canvasRef,
    } = useConsolidatedSpeech();

    // Initialize LLM Service on mount
    useEffect(() => {
        const initializeLLM = async () => {
            const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
            if (apiKey) {
                try {
                    initializeLLMService(apiKey);
                    setApiStatus('connected');
                } catch (error) {
                    console.error('Failed to initialize LLM:', error);
                    setApiStatus('error');
                }
            } else {
                setApiStatus('unconfigured');
            }
        };

        initializeLLM();
        setMounted(true);
    }, [initializeLLMService]);

    // ✅ SEND MESSAGE - Using consolidated chat actions
    const sendMessage = async (content: string) => {
        if (!content.trim() || !llmService) return;

        // Clear input
        setManualInput('');

        // Reset streamed content for new response
        resetStreamedContent();

        // Add user message using typed creator
        addUserMessage(content.trim());

        // Generate AI response using existing service
        await generateResponse(content.trim());
    };

    // ✅ Convert conversation history to message format for display
    const displayMessages = conversationHistory.map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.type as 'user' | 'assistant',
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
    }));

    // ✅ Add current streaming content as temporary message
    const messagesWithStreaming =
        streamedContent && !isStreamingComplete
            ? [
                  ...displayMessages,
                  {
                      id: 'streaming',
                      content: streamedContent,
                      type: 'assistant' as const,
                      timestamp: new Date().toLocaleTimeString(),
                  },
              ]
            : displayMessages;

    useEffect(() => {
        console.log('✅ Step 5C: Consolidated architecture - No more duplicates!');
    }, []);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Step 5C: Consolidated Architecture (Zero Duplicates)</h1>

                {/* Progress Indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-2">🚀 Build Progress - FINAL ARCHITECTURE</h2>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                ✓
                            </span>
                            <span>Nuclear option (no components)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                ✓
                            </span>
                            <span>Add Zustand store back</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                ✓
                            </span>
                            <span>Add basic chat interface (no ScrollArea)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                ✓
                            </span>
                            <span>Add real ChatMessagesBox component</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                ✓
                            </span>
                            <span>Add speech recognition</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                ✓
                            </span>
                            <span>Full LLM integration</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                                5C
                            </span>
                            <span>
                                <strong>Consolidated architecture (zero duplicates)</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Architecture Consolidation Status */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-purple-600" />
                        Consolidation Status - Eliminated Duplicates
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p>
                                <strong>❌ Removed:</strong> useSpeechManager.ts
                            </p>
                            <p>
                                <strong>❌ Removed:</strong> useAudioVisualization.ts
                            </p>
                            <p>
                                <strong>❌ Removed:</strong> useTranscriptions.ts
                            </p>
                            <p>
                                <strong>❌ Removed:</strong> useInterviewContext.ts
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>✅ Created:</strong> useConsolidatedSpeech.ts
                            </p>
                            <p>
                                <strong>✅ Enhanced:</strong> speechSlice.ts (all speech state)
                            </p>
                            <p>
                                <strong>✅ Enhanced:</strong> chatSlice.ts (typed creators)
                            </p>
                            <p>
                                <strong>✅ Enhanced:</strong> contextSlice.ts (centralized validation)
                            </p>
                        </div>
                    </div>
                </div>

                {/* LLM Service Status */}
                <div
                    className={`border rounded-lg p-4 ${
                        llmService && !llmError
                            ? 'bg-green-50 border-green-200'
                            : llmError
                              ? 'bg-red-50 border-red-200'
                              : 'bg-yellow-50 border-yellow-200'
                    }`}
                >
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        {llmService && !llmError && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {llmError && <XCircle className="h-5 w-5 text-red-600" />}
                        {!llmService && !llmError && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                        OpenAI Service Status (Your OpenAIClientService)
                    </h3>
                    <div className="text-sm">
                        {llmService && !llmError && (
                            <p className="text-green-700">
                                ✅ OpenAIClientService ready - Using your existing architecture!
                            </p>
                        )}
                        {llmError && <p className="text-red-700">❌ {llmError}</p>}
                        {!llmService && !llmError && (
                            <div className="text-yellow-700">
                                <p>⚠️ OpenAI service initializing...</p>
                                <p className="mt-1">Add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">🧪 Test Mode Selection</h3>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setMode('manual')}
                            variant={mode === 'manual' ? 'default' : 'outline'}
                            className="flex items-center gap-2"
                        >
                            <User className="h-4 w-4" />
                            Manual Test
                        </Button>
                        <Button
                            onClick={() => setMode('speech')}
                            variant={mode === 'speech' ? 'default' : 'outline'}
                            className="flex items-center gap-2"
                        >
                            <Mic className="h-4 w-4" />
                            Speech Test
                        </Button>
                        <Button
                            onClick={() => setMode('consolidated')}
                            variant={mode === 'consolidated' ? 'default' : 'outline'}
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            <Bot className="h-4 w-4" />
                            Consolidated (Single Hook)
                        </Button>
                    </div>
                </div>

                {/* ✅ FIXED: Main Chat Interface with proper height constraints */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold">
                            {mode === 'consolidated'
                                ? '🏗️ Consolidated Architecture (1 Speech Hook)'
                                : mode === 'speech'
                                  ? '🎤 Speech Recognition Test'
                                  : '🧪 Manual Component Test'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {mode === 'consolidated'
                                ? 'Single useConsolidatedSpeech hook replaces 3 previous hooks'
                                : mode === 'speech'
                                  ? 'Speech-to-text with audio visualization'
                                  : 'Manual message testing without AI'}
                        </p>
                    </div>

                    {/* ✅ FIXED: Grid with proper height and overflow constraints */}
                    <div className="grid grid-cols-12 gap-6 p-6" style={{ height: '600px' }}>
                        {/* Messages Area - FIXED: Proper height containment */}
                        <div className="col-span-8 flex flex-col h-full">
                            <Card className="flex-1 flex flex-col min-h-0">
                                <CardHeader className="pb-3 flex-shrink-0">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Chat Messages {llmLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        <span className="text-sm font-normal text-gray-500">
                                            ({getMessageCount()} messages)
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden p-4">
                                    <div className="h-full overflow-hidden">
                                        <MemoizedChatMessagesBox
                                            id="consolidatedChatTest"
                                            messages={messagesWithStreaming}
                                            streamedContent={streamedContent}
                                            isStreamingComplete={isStreamingComplete}
                                            className="h-full overflow-y-auto"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Controls - FIXED: Proper height containment */}
                        <div className="col-span-4 flex flex-col h-full">
                            <Card className="flex-1 flex flex-col min-h-0">
                                <CardHeader className="pb-3 flex-shrink-0">
                                    <CardTitle className="text-lg">
                                        {mode === 'consolidated'
                                            ? 'Consolidated Controls'
                                            : mode === 'speech'
                                              ? 'Speech Controls'
                                              : 'Manual Controls'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto space-y-3">
                                    {/* Consolidated Mode Controls */}
                                    {mode === 'consolidated' && (
                                        <>
                                            <div className="space-y-2">
                                                <Textarea
                                                    placeholder="Type your message here..."
                                                    value={manualInput}
                                                    onChange={e => setManualInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            sendMessage(manualInput);
                                                        }
                                                    }}
                                                    disabled={llmLoading || !llmService}
                                                    className="min-h-[60px] resize-none"
                                                />
                                                <Button
                                                    onClick={() => sendMessage(manualInput)}
                                                    disabled={!manualInput.trim() || llmLoading || !llmService}
                                                    className="w-full"
                                                >
                                                    {llmLoading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Send Message
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Consolidated Speech Controls */}
                                            <div className="border-t pt-3 space-y-2">
                                                <Button
                                                    onClick={startRecording}
                                                    disabled={isRecording || !llmService}
                                                    className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                                                >
                                                    <Mic className="h-4 w-4 mr-2" />
                                                    {isRecording ? 'Recording...' : 'Voice Input'}
                                                </Button>

                                                {isRecording && (
                                                    <Button
                                                        onClick={stopRecording}
                                                        className="w-full bg-gray-500 hover:bg-gray-600"
                                                    >
                                                        <Square className="h-4 w-4 mr-2" />
                                                        Stop Recording
                                                    </Button>
                                                )}

                                                {hasTranscriptions && (
                                                    <Button
                                                        onClick={submitTranscriptionToChat}
                                                        className="w-full bg-green-500 hover:bg-green-600"
                                                    >
                                                        Send Voice Message
                                                    </Button>
                                                )}

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={clearTranscriptions}
                                                        variant="outline"
                                                        className="flex-1"
                                                        disabled={!hasTranscriptions}
                                                    >
                                                        Clear Transcription
                                                    </Button>
                                                    <Button
                                                        onClick={clearHistory}
                                                        variant="outline"
                                                        className="flex-1"
                                                        disabled={llmLoading}
                                                    >
                                                        Clear Chat
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Audio Visualization */}
                                            <div className="border rounded p-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-500">Audio Visualization</span>
                                                    {isVisualizationActive ? (
                                                        <Volume2 className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <VolumeX className="h-3 w-3 text-gray-400" />
                                                    )}
                                                </div>
                                                <canvas
                                                    ref={canvasRef}
                                                    width="200"
                                                    height="60"
                                                    className="w-full h-12 bg-gray-900 rounded"
                                                />
                                            </div>

                                            {/* ✅ FIXED: Transcription Display - Now visible */}
                                            {hasTranscriptions && (
                                                <div className="border rounded p-3 bg-blue-50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <strong className="text-sm text-blue-800">
                                                            🎤 Voice Transcription
                                                        </strong>
                                                        <span className="text-xs text-blue-600">
                                                            {transcriptionText.length} chars
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-blue-700 max-h-20 overflow-y-auto bg-white p-2 rounded border">
                                                        {transcriptionText}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Speech Error Display */}
                                            {speechErrorMessage && (
                                                <div className="border rounded p-3 bg-red-50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                        <strong className="text-sm text-red-800">Speech Error</strong>
                                                    </div>
                                                    <div className="text-xs text-red-700">{speechErrorMessage}</div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Manual/Speech Mode Controls (simplified for comparison) */}
                                    {mode !== 'consolidated' && (
                                        <div className="text-center text-gray-500 py-4">
                                            <p>Switch to "Consolidated" mode to see</p>
                                            <p>the new single-hook architecture</p>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                                        <div>
                                            <strong>Messages:</strong> {getMessageCount()}
                                        </div>
                                        <div>
                                            <strong>Recording:</strong> {recognitionStatus}
                                        </div>
                                        <div>
                                            <strong>Transcriptions:</strong> {hasTranscriptions ? 'Yes' : 'None'}
                                        </div>
                                        <div>
                                            <strong>Streaming:</strong>{' '}
                                            {streamedContent ? streamedContent.length + ' chars' : 'None'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Consolidation Success Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                        ✅ Step 5C Complete - Zero Duplicates Architecture
                    </h3>
                    <div className="text-green-700 space-y-1 text-sm">
                        <p>
                            <strong>Hooks Reduced:</strong> ✅ 4 → 1 (75% reduction)
                        </p>
                        <p>
                            <strong>Speech State:</strong> ✅ Consolidated in speechSlice
                        </p>
                        <p>
                            <strong>Message Creation:</strong> ✅ Typed creators in chatSlice
                        </p>
                        <p>
                            <strong>Context Validation:</strong> ✅ Single source in contextSlice
                        </p>
                        <p>
                            <strong>Your Architecture:</strong> ✅ OpenAIClientService + Zustand working perfectly
                        </p>
                        <p>
                            <strong>Layout & Transcription:</strong> ✅ Fixed height constraints and visible
                            transcription
                        </p>
                    </div>
                </div>

                {/* Debug Info */}
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                    <strong>Debug:</strong> Step {step} |<strong> Mode: {mode}</strong> |
                    <strong> LLM Service: {llmService ? 'Ready' : 'Not Ready'}</strong> |
                    <strong> Messages: {getMessageCount()}</strong> |
                    <strong> Speech Status: {recognitionStatus}</strong> |
                    <strong> Context Valid: {isContextValid() ? 'Yes' : 'No'}</strong>
                </div>
            </div>
        </div>
    );
}
