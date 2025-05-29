// src\app\chat\_components\ErrorState.tsx
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
    error: string;
    onRetry?: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
    <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Knowledge Base Load Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Troubleshooting:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                    <li>
                        • Ensure ETQ markdown files are in <code>public/knowledge/</code>
                    </li>
                    <li>• Check that all 25 files are present and accessible</li>
                    <li>• Verify file permissions and server configuration</li>
                </ul>
            </div>
            {onRetry && (
                <button onClick={onRetry} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Retry
                </button>
            )}
        </div>
    </div>
);
