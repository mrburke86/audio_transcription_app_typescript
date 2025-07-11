// src/components/error-boundary/index.ts
'use client';
// Core exports
export type { ErrorBoundaryProps, ErrorFallbackProps } from '@/types';
export { ErrorBoundary, useErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { ErrorFallback, InlineErrorFallback } from './ErrorFallback';

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
