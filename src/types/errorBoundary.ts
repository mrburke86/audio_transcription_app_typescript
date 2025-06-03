// src\types\errorBoundary.ts

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
