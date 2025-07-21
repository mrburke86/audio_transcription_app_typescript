// src/components/DebugPanel.tsx - ADD THIS FOR TROUBLESHOOTING
'use client';

import { useBoundStore } from '@/stores/chatStore';
import { useState } from 'react';

export const DebugPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const initialContext = useBoundStore(state => state.initialContext);
    const contextLoading = useBoundStore(state => state.contextLoading);
    const isValid = useBoundStore(state => state.isContextValid());
    const llmService = useBoundStore(state => state.llmService);
    const conversationHistory = useBoundStore(state => state.conversationHistory);

    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-mono"
            >
                {isOpen ? 'Hide Debug' : 'Debug Info'}
            </button>

            {isOpen && (
                <div className="absolute bottom-12 right-0 bg-black text-green-400 p-4 rounded-lg max-w-lg max-h-96 overflow-auto text-xs font-mono">
                    <h3 className="text-yellow-400 font-bold mb-2">🐛 DEBUG INFO</h3>

                    <div className="space-y-2">
                        <div>
                            <span className="text-blue-400">Context Valid:</span>
                            <span className={isValid ? 'text-green-400' : 'text-red-400'}>
                                {isValid ? '✅ Yes' : '❌ No'}
                            </span>
                        </div>

                        <div>
                            <span className="text-blue-400">Context Loading:</span>
                            <span className={contextLoading ? 'text-yellow-400' : 'text-green-400'}>
                                {contextLoading ? '⏳ Loading' : '✅ Ready'}
                            </span>
                        </div>

                        <div>
                            <span className="text-blue-400">LLM Service:</span>
                            <span className={llmService ? 'text-green-400' : 'text-red-400'}>
                                {llmService ? '✅ Initialized' : '❌ Missing'}
                            </span>
                        </div>

                        <div>
                            <span className="text-blue-400">Messages:</span>
                            <span className="text-white">{conversationHistory.length}</span>
                        </div>

                        <div>
                            <span className="text-blue-400">Environment:</span>
                            <div className="ml-2">
                                <div>NODE_ENV: {process.env.NODE_ENV}</div>
                                <div>
                                    OpenAI Key:{' '}
                                    {process.env.NEXT_PUBLIC_OPENAI_API_KEY
                                        ? `${process.env.NEXT_PUBLIC_OPENAI_API_KEY.substring(0, 8)}...`
                                        : '❌ Missing'}
                                </div>
                            </div>
                        </div>

                        <details className="mt-4">
                            <summary className="text-yellow-400 cursor-pointer">Context Details</summary>
                            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(initialContext, null, 2)}</pre>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
};
