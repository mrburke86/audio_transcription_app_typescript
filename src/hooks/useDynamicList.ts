// src/hooks/useDynamicList.ts
import { useState, useCallback } from 'react';

export function useDynamicList<T = string>(initialItems: T[] = []) {
    const [items, setItems] = useState<T[]>(initialItems);
    const [newItem, setNewItem] = useState<string>('');

    const addItem = useCallback((item: T) => {
        setItems(prev => [...prev, item]);
        setNewItem('');
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addItemFromInput = useCallback(
        (transform?: (input: string) => T) => {
            if (newItem.trim()) {
                const itemToAdd = transform ? transform(newItem.trim()) : (newItem.trim() as T);
                addItem(itemToAdd);
            }
        },
        [newItem, addItem]
    );

    return {
        items,
        newItem,
        setNewItem,
        addItem,
        removeItem,
        addItemFromInput,
        setItems,
    };
}
