// src/app/chat/_components/TopNavigationBar/KnowledgeStatus.tsx
import { Icons } from '@/components/icons/icons';
import { useKnowledge } from '@/stores/hooks/useSelectors';
import { cn } from '@/lib/utils';

export interface KnowledgeStatusProps {
    knowledgeBaseName: string;
    indexedDocumentsCount: number;
}

// ✅ UPDATED: Knowledge Status using Zustand store
export const KnowledgeStatus: React.FC<KnowledgeStatusProps> = ({
    knowledgeBaseName,
    indexedDocumentsCount: countFromProps,
}) => {
    // ✅ NEW: Use Zustand hook instead of old context
    const {
        isLoading: contextIsLoading,
        error: contextError,
        refreshIndexedDocumentsCount,
        triggerIndexing,
    } = useKnowledge();

    // Determine overall status based on props and context for display
    let statusText = knowledgeBaseName || 'Knowledge Base';
    let statusColor = 'text-gray-500'; // Default
    let icon = <Icons.Library className="h-4 w-4" />;
    let clickAction = refreshIndexedDocumentsCount;

    if (contextError) {
        statusText = `KB Error: ${contextError.substring(0, 20)}...`;
        statusColor = 'text-red-500';
        icon = <Icons.AlertTriangle className="h-4 w-4" />;
        clickAction = () => window.location.reload(); // Reload on error
    } else if (contextIsLoading) {
        statusText = 'KB Syncing...';
        statusColor = 'text-yellow-500 animate-pulse';
        icon = <Icons.LoaderCircle className="h-4 w-4 animate-spin" />;
        clickAction = undefined; // No action while loading
    } else if (countFromProps > 0) {
        statusText = `${knowledgeBaseName} (${countFromProps} items)`;
        statusColor = 'text-green-500';
        icon = <Icons.CheckCircle className="h-4 w-4" />;
    } else {
        statusText = `${knowledgeBaseName} (0 items)`;
        statusColor = 'text-yellow-500';
        icon = <Icons.Library className="h-4 w-4" />;
        clickAction = triggerIndexing; // Trigger indexing if empty
    }

    const handleClick = () => {
        if (clickAction && !contextIsLoading) {
            clickAction();
        }
    };

    const getTooltipText = () => {
        if (contextError) {
            return `Error: ${contextError}. Click to reload.`;
        } else if (contextIsLoading) {
            return 'Knowledge base is syncing...';
        } else if (countFromProps === 0) {
            return 'Knowledge base is empty. Click to start indexing.';
        } else {
            return `${knowledgeBaseName} - ${countFromProps} indexed items. Click to refresh count.`;
        }
    };

    return (
        <div
            className={cn(
                'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md bg-background border transition-colors',
                statusColor,
                clickAction && !contextIsLoading ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'
            )}
            title={getTooltipText()}
            onClick={handleClick}
        >
            {icon}
            <span>{statusText}</span>
        </div>
    );
};
