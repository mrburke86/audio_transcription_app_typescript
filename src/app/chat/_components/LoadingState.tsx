// src/app/chat/_components/LoadingState.tsx

interface LoadingStateProps {
    message?: string;
    subMessage?: string;
}

export const LoadingState = ({ message = 'Loading...', subMessage = 'Please wait a moment.' }: LoadingStateProps) => (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-background text-foreground">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-card-foreground mb-2">{message}</h2>
            <p className="text-muted-foreground">{subMessage}</p>
        </div>
    </div>
);
