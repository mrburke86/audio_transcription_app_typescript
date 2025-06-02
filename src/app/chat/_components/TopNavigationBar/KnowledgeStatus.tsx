// src\app\chat\_components\KnowledgeStatus.tsx

import { Icons } from '@/components/icons/icons'; // Corrected import path
import { useKnowledge } from '@/contexts/KnowledgeProvider'; // To get refresh and potentially other live states
import { cn } from '@/lib/utils';

export interface KnowledgeStatusProps {
    knowledgeBaseName: string;
    indexedDocumentsCount: number;
}
// Knowledge Loading Component
export const KnowledgeStatus: React.FC<KnowledgeStatusProps> = ({ knowledgeBaseName, indexedDocumentsCount: countFromProps }) => {
    // if (isLoading) {
    //     return (
    //         <Badge variant="outline" className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700">
    //             <strong>❌ Loading knowledge base...</strong>
    //         </Badge>
    //     );
    // }

    // if (error) {
    //     return (
    //         <Badge variant="outline" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700">
    //             <strong>🕐 Knowledge Base Error:</strong> {error}
    //         </Badge>
    //     );
    // }

    // if (totalFiles > 0) {
    //     return (
    //         <Badge variant="outline" className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700">
    //             ✅ Knowledge Base: {totalFiles} files, {totalWords.toLocaleString()} words
    //         </Badge>
    //     );
    // }
    // You can still use useKnowledge here if you need live updates for `isLoading` or `error`
    // related to ongoing operations like `searchRelevantKnowledge` or `refreshIndexedDocumentsCount`
    // For simplicity, this example primarily uses the props passed down.
    const {
        isLoading: contextIsLoading, // Loading state from context (e.g. during refresh)
        error: contextError, // Error state from context
        refreshIndexedDocumentsCount,
    } = useKnowledge();

    // Determine overall status based on props and context for display
    // For this component, we might just display the name and count directly,
    // as ChatPage handles the critical initial loading/error state.

    let statusText = knowledgeBaseName || 'Knowledge Base';
    let statusColor = 'text-gray-500'; // Default
    let icon = <Icons.Library className="h-4 w-4" />;

    if (contextError) {
        statusText = `KB Error: ${contextError.substring(0, 20)}...`;
        statusColor = 'text-red-500';
        icon = <Icons.AlertTriangle className="h-4 w-4" />;
    } else if (contextIsLoading) {
        statusText = 'KB Syncing...';
        statusColor = 'text-yellow-500 animate-pulse';
        icon = <Icons.LoaderCircle className="h-4 w-4 animate-spin" />;
    } else if (countFromProps > 0) {
        statusText = `${knowledgeBaseName} (${countFromProps} items)`;
        statusColor = 'text-green-500';
        icon = <Icons.CheckCircle className="h-4 w-4" />;
    } else {
        statusText = `${knowledgeBaseName} (0 items)`;
        statusColor = 'text-yellow-500';
        icon = <Icons.Library className="h-4 w-4" />;
    }

    return (
        <div
            className={cn(
                'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md bg-background border cursor-pointer',
                statusColor
            )}
            title={contextError || `${knowledgeBaseName} - ${countFromProps} indexed items. Click to refresh count.`}
            onClick={refreshIndexedDocumentsCount}
        >
            {icon}
            <span>{statusText}</span>
        </div>
    );
};
