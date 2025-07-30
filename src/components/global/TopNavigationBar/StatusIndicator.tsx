// src/components/chat/StatusIndicator.tsx
import { Badge } from '@/components/ui';
import React from 'react';

interface StatusIndicatorProps {
    status: 'active' | 'inactive' | 'error';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    if (status === 'active') {
        return (
            <Badge variant="default" className="flex items-center gap-2 bg-white text-gray-700">
                🟢 Active
            </Badge>
        );
    }

    if (status === 'error') {
        return (
            <Badge variant="default" className="flex items-center gap-2 bg-white text-gray-700">
                🔴 Error
            </Badge>
        );
    }

    // Default to inactive
    return (
        <Badge variant="default" className="flex items-center gap-2 bg-white text-gray-700">
            ⚫ Inactive
        </Badge>
    );
};
