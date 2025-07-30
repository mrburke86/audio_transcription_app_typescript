// src/components/error-boundary/index.tsx - FIXED EXPORTS AND TYPES
'use client';

import React from 'react';

// ✅ PROPER TYPE IMPORTS
export type { ErrorBoundaryProps, ErrorFallbackProps } from '@/types';

// ✅ COMPONENT EXPORTS
export { ErrorBoundary, useErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { ErrorFallback, InlineErrorFallback } from './ErrorFallback';

// ✅ IMPORT FIXED COMPONENTS
import { ErrorBoundary } from './ErrorBoundary';
import { InlineErrorFallback } from './ErrorFallback';

// ✅ PRESET ERROR BOUNDARIES WITH PROPER TYPES
export const SpeechErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary
        context="Speech"
        onError={(error: Error) => {
            console.log('🎤 Speech error:', error.message);
        }}
    >
        {children}
    </ErrorBoundary>
);

export const AIErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary
        context="AI"
        onError={(error: Error) => {
            console.log('🤖 AI error:', error.message);
        }}
    >
        {children}
    </ErrorBoundary>
);

export const InlineErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary fallback={InlineErrorFallback}>{children}</ErrorBoundary>
);

export const GlobalErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorBoundary
        context="Global"
        showDetails={process.env.NODE_ENV === 'development'}
        onError={(error: Error, errorInfo: React.ErrorInfo) => {
            if (process.env.NODE_ENV === 'production') {
                console.error('🔥 Global error:', error, errorInfo);
            }
        }}
    >
        {children}
    </ErrorBoundary>
);
