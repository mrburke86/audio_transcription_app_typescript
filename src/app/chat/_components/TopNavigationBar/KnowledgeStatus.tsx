// src\app\chat\_components\KnowledgeStatus.tsx

import { Badge } from '@/components/ui';

export interface KnowledgeStatusProps {
    isLoading: boolean;
    error: string | null;
    totalFiles: number;
    totalWords: number;
}
// Knowledge Loading Component
export const KnowledgeStatus: React.FC<KnowledgeStatusProps> = ({ isLoading, error, totalFiles, totalWords }) => {
    if (isLoading) {
        return (
            <Badge variant="outline" className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700">
                <strong>❌ Loading knowledge base...</strong>
            </Badge>
        );
    }

    if (error) {
        return (
            <Badge variant="outline" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700">
                <strong>🕐 Knowledge Base Error:</strong> {error}
            </Badge>
        );
    }

    if (totalFiles > 0) {
        return (
            <Badge variant="outline" className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700">
                ✅ Knowledge Base: {totalFiles} files, {totalWords.toLocaleString()} words
            </Badge>
        );
    }

    return null;
};
