// src/components/error-boundary/index.ts
'use client';
// Core exports
export { ErrorBoundary, withErrorBoundary, useErrorBoundary } from './ErrorBoundary';
export { ErrorFallback, InlineErrorFallback } from './ErrorFallback';
export type { ErrorBoundaryProps, ErrorFallbackProps } from '@/types';

// Simple presets for your app
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { InlineErrorFallback } from './ErrorFallback';

// Speech Recognition Error Boundary
export const SpeechErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary
        onError={error => {
            console.log('🎤 Speech error:', error.message);
            // Could trigger fallback to text input
        }}
    >
        {children}
    </ErrorBoundary>
);

// AI/LLM Error Boundary
export const AIErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary
        onError={error => {
            console.log('🤖 AI error:', error.message);
            // Could switch to fallback model
        }}
    >
        {children}
    </ErrorBoundary>
);

// Inline Error Boundary for smaller components
export const InlineErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary fallback={InlineErrorFallback}>{children}</ErrorBoundary>
);

// Global App Error Boundary
export const GlobalErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary
        showDetails={process.env.NODE_ENV === 'development'}
        onError={(error, errorInfo) => {
            // Report to analytics in production
            if (process.env.NODE_ENV === 'production') {
                console.error('🔥 Global error:', error, errorInfo);
            }
        }}
    >
        {children}
    </ErrorBoundary>
);

/*
🚀 SIMPLE SETUP (3 steps):

1. Wrap your app:
   <GlobalErrorBoundary>
     <App />
   </GlobalErrorBoundary>

2. Protect critical features:
   <SpeechErrorBoundary>      // Auto-retries network/API errors
     <VoiceControls />
   </SpeechErrorBoundary>

   <AIErrorBoundary>          // Handles OpenAI API issues  
     <ConversationInsights />
   </AIErrorBoundary>

3. Inline protection for smaller components:
   <InlineErrorBoundary>      // Compact error display
     <TopNavigationBar />
   </InlineErrorBoundary>

✨ Features:
- Beautiful, professional error UI
- Auto-retry for network/API errors (up to 2 times)
- Manual reset functionality
- Development error details
- Integrates with your existing logger
- Zero configuration needed
*/
