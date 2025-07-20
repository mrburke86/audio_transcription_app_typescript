// src\types\components.ts
import React from 'react';
import { InitialInterviewContext } from './core';

// Error Boundary
export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    showDetails?: boolean;
}

export interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
    retry?: () => void;
}

// Form Components
export interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

export interface InterviewModalProps {
    onSubmit: (context: InitialInterviewContext) => void;
}
