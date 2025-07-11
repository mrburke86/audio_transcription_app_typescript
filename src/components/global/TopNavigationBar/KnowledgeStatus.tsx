// src\app\chat\_components\KnowledgeStatus.tsx

import { Icons } from '@/components/icons/icons';
import { useKnowledge } from '@/contexts/KnowledgeProvider';
import { cn } from '@/lib/utils';

export interface KnowledgeStatusProps {
    knowledgeBaseName: string;
    indexedDocumentsCount: number;
}
// Knowledge Loading Component
export const KnowledgeStatus: React.FC<KnowledgeStatusProps> = ({
    knowledgeBaseName,
    indexedDocumentsCount: countFromProps,
}) => {
    const { isLoading: contextIsLoading, error: contextError, refreshIndexedDocumentsCount } = useKnowledge();

    let statusText = knowledgeBaseName || 'Knowledge Base';
    let statusColor = 'text-gray-500';
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
