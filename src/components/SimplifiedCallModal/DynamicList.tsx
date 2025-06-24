// src/components/DynamicList.tsx
'use client';
import {
    Button,
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui';
import { ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState, useCallback } from 'react';

interface DynamicListProps<T> {
    label: string;
    items: T[];
    suggestions: string[];
    onAddItem: (value: string) => void;
    onRemoveItem: (index: number) => void;
    displayField?: keyof T;
    placeholder: string;
}

export function DynamicList<T>({
    label,
    items,
    suggestions,
    onAddItem,
    onRemoveItem,
    displayField,
    placeholder,
}: DynamicListProps<T>) {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);

    // ✅ Memoized handlers to prevent re-renders
    const handleAdd = useCallback(() => {
        const valueToAdd = inputValue.trim();
        console.log('🔥 DynamicList: handleAdd called with value:', valueToAdd);

        if (valueToAdd) {
            try {
                onAddItem(valueToAdd);
                setInputValue('');
                setOpen(false);
                console.log('✅ DynamicList: Successfully added item:', valueToAdd);
            } catch (error) {
                console.error('❌ DynamicList: Error adding item:', error);
            }
        } else {
            console.warn('⚠️ DynamicList: Cannot add empty value');
        }
    }, [inputValue, onAddItem]);

    const handleSelect = useCallback(
        (selectedValue: string) => {
            console.log('🔥 DynamicList: handleSelect called with value:', selectedValue);

            try {
                // Update input value for visual feedback
                setInputValue(selectedValue);
                // Add the item immediately
                onAddItem(selectedValue);
                // Close the popover
                setOpen(false);
                console.log('✅ DynamicList: Successfully selected and added:', selectedValue);
            } catch (error) {
                console.error('❌ DynamicList: Error selecting item:', error);
            }
        },
        [onAddItem]
    );

    const handleRemove = useCallback(
        (index: number) => {
            console.log('🔥 DynamicList: handleRemove called with index:', index);

            try {
                onRemoveItem(index);
                console.log('✅ DynamicList: Successfully removed item at index:', index);
            } catch (error) {
                console.error('❌ DynamicList: Error removing item:', error);
            }
        },
        [onRemoveItem]
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                handleAdd();
            }
        },
        [handleAdd]
    );

    const handleInputChange = useCallback((value: string) => {
        console.log('🔍 DynamicList: Input changed to:', value);
        setInputValue(value);
    }, []);

    return (
        <div className="space-y-2">
            <Label>
                {label} <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                            type="button"
                        >
                            {inputValue || placeholder}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[--radix-popover-trigger-width] p-0 z-[9999] dynamic-list-popover"
                        style={{ zIndex: 9999 }}
                        sideOffset={4}
                    >
                        <Command shouldFilter={false} className="dynamic-list-command command-overlay-fix">
                            <CommandInput
                                placeholder="Type or select an option..."
                                value={inputValue}
                                onValueChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="pointer-events-auto"
                            />
                            <CommandEmpty className="pointer-events-auto">
                                {inputValue.trim() ? (
                                    <div className="p-2 pointer-events-auto">
                                        <Button
                                            variant="ghost"
                                            className="w-full text-left justify-start h-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-800 pointer-events-auto"
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('🔥 Add button clicked for:', inputValue.trim());
                                                handleSelect(inputValue.trim());
                                            }}
                                            onMouseDown={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            type="button"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add &quot;{inputValue.trim()}&quot;
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 text-sm text-muted-foreground pointer-events-none">
                                        No results found.
                                    </div>
                                )}
                            </CommandEmpty>
                            <CommandList className="pointer-events-auto">
                                {suggestions.map((suggestion, index) => (
                                    <CommandItem
                                        key={`${suggestion}-${index}`}
                                        value={suggestion}
                                        onSelect={value => {
                                            console.log(
                                                '🔥 CommandItem onSelect triggered with:',
                                                value,
                                                'original:',
                                                suggestion
                                            );
                                            handleSelect(suggestion);
                                        }}
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('🔥 CommandItem onClick triggered for:', suggestion);
                                            handleSelect(suggestion);
                                        }}
                                        onMouseDown={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onMouseEnter={() => {
                                            console.log('🔍 Mouse entered item:', suggestion);
                                        }}
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 pointer-events-auto data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-gray-800 transition-colors duration-200"
                                        style={{ pointerEvents: 'auto' }}
                                    >
                                        {suggestion}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <Button
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAdd();
                    }}
                    className="border"
                    disabled={!inputValue.trim()}
                    title="Add item"
                    type="button"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Display current items */}
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => {
                    const displayValue = displayField ? String(item[displayField]) : String(item);
                    return (
                        <div
                            key={`item-${index}-${displayValue}`}
                            className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1"
                        >
                            <span className="text-sm">{displayValue}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemove(index);
                                }}
                                aria-label={`Remove ${displayValue}`}
                                className="h-4 w-4 hover:bg-red-100"
                                type="button"
                            >
                                <X className="h-3 w-3 text-red-500" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <details className="text-xs text-gray-500">
                    <summary>Debug Info</summary>
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs">
                        {JSON.stringify(
                            {
                                inputValue,
                                itemCount: items.length,
                                suggestionsCount: suggestions.length,
                                isOpen: open,
                            },
                            null,
                            2
                        )}
                    </pre>
                </details>
            )}
        </div>
    );
}
