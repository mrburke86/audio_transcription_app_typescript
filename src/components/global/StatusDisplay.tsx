// src/components/StatusDisplay.tsx
import { AlertTriangle, LucideIcon, RefreshCw } from 'lucide-react';

interface StatusDisplayProps {
    type: 'loading' | 'error';
    title: string;
    message: string;
    subMessage?: string;
    icon?: LucideIcon;
    onRetry?: () => void;
    showTroubleshooting?: boolean;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
    type,
    title,
    message,
    subMessage,
    icon: Icon,
    onRetry,
    showTroubleshooting = false,
}) => {
    const isError = type === 'error';

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-background text-foreground">
            <div
                className={`text-center max-w-md w-full p-6 rounded-lg shadow-lg bg-card ${
                    isError ? 'border border-destructive/50' : ''
                }`}
            >
                {/* Icon */}
                {isError ? (
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
                ) : (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6" />
                )}

                {/* Title */}
                <h2 className={`text-xl font-semibold mb-3 ${isError ? 'text-destructive' : 'text-card-foreground'}`}>
                    {title}
                </h2>

                {/* Message */}
                <p className={`mb-6 ${isError ? 'text-destructive-foreground/80' : 'text-muted-foreground'}`}>
                    {message}
                </p>

                {/* Sub-message for loading */}
                {!isError && subMessage && <p className="text-muted-foreground">{subMessage}</p>}

                {/* Troubleshooting for errors */}
                {isError && showTroubleshooting && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 text-left text-sm mb-6">
                        <h3 className="font-semibold text-card-foreground mb-2">Possible Steps:</h3>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>• Check your internet connection.</li>
                            <li>• Ensure all required services are running.</li>
                            <li>• If the problem persists, try again later or contact support.</li>
                        </ul>
                    </div>
                )}

                {/* Retry button for errors */}
                {isError && onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-4 inline-flex items-center px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background transition-colors duration-150"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

// Usage examples:
export const LoadingState = (props: Pick<StatusDisplayProps, 'message' | 'subMessage'>) => (
    <StatusDisplay type="loading" title="Loading..." {...props} />
);

export const ErrorState = (
    props: Pick<StatusDisplayProps, 'title' | 'message' | 'onRetry' | 'showTroubleshooting'>
) => <StatusDisplay type="error" {...props} />;
