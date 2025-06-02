// src/components/interview-modal/components/DynamicList.tsx
'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDynamicList } from '@/hooks';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';

interface DynamicListProps {
    items: string[];
    onItemsChange: (items: string[]) => void;
    placeholder?: string;
    addButtonText?: string;
}

export function DynamicList({
    items,
    onItemsChange,
    placeholder,
    addButtonText = 'Add',
}: DynamicListProps) {
    const {
        items: localItems,
        newItem,
        setNewItem,
        addItemFromInput,
        removeItem,
    } = useDynamicList(items);

    // FIXED: Only call onItemsChange when localItems actually changes
    useEffect(() => {
        // Only update if the arrays are actually different
        if (JSON.stringify(localItems) !== JSON.stringify(items)) {
            onItemsChange(localItems);
        }
    }, [localItems, items, onItemsChange]);

    const handleAddClick = () => {
        addItemFromInput();
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={e => e.key === 'Enter' && addItemFromInput()}
                />
                <Button onClick={handleAddClick} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                    {addButtonText}
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {localItems.map((item, index) => (
                    <Badge key={index} variant="outline" className="flex gap-1 items-center">
                        {item}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(index)} />
                    </Badge>
                ))}
            </div>
        </div>
    );
}
