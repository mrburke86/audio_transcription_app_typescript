// // src\components\interview-modal\components\CreativePredefinedSelector.tsx
// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { ChevronDown, ChevronRight, Search, Plus, X } from 'lucide-react';

// interface CreativePredefinedSelectorProps {
//     title: string;
//     description: string;
//     icon: string;
//     predefinedOptions: Record<string, string[]>;
//     selectedItems: string[];
//     onItemsChange: (items: string[]) => void;
//     placeholder: string;
// }

// export function CreativePredefinedSelector({
//     title,
//     description,
//     icon,
//     predefinedOptions,
//     selectedItems,
//     onItemsChange,
//     placeholder,
// }: CreativePredefinedSelectorProps) {
//     const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
//     const [searchTerm, setSearchTerm] = useState('');
//     const [customInput, setCustomInput] = useState('');

//     const toggleCategory = (category: string) => {
//         const newExpanded = new Set(expandedCategories);
//         if (newExpanded.has(category)) {
//             newExpanded.delete(category);
//         } else {
//             newExpanded.add(category);
//         }
//         setExpandedCategories(newExpanded);
//     };

//     const addItem = (item: string) => {
//         if (!selectedItems.includes(item)) {
//             onItemsChange([...selectedItems, item]);
//         }
//     };

//     const removeItem = (item: string) => {
//         onItemsChange(selectedItems.filter(i => i !== item));
//     };

//     const addCustomItem = () => {
//         if (customInput.trim() && !selectedItems.includes(customInput.trim())) {
//             onItemsChange([...selectedItems, customInput.trim()]);
//             setCustomInput('');
//         }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter') {
//             e.preventDefault();
//             addCustomItem();
//         }
//     };

//     // Filter options based on search
//     const filteredOptions = Object.entries(predefinedOptions).reduce((acc, [category, options]) => {
//         const filteredCategoryOptions = options.filter(option =>
//             option.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//         if (filteredCategoryOptions.length > 0) {
//             acc[category] = filteredCategoryOptions;
//         }
//         return acc;
//     }, {} as Record<string, string[]>);

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                     {icon} {title}
//                 </CardTitle>
//                 <p className="text-sm text-gray-600">{description}</p>
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 {/* Search Bar */}
//                 <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                     <Input
//                         value={searchTerm}
//                         onChange={e => setSearchTerm(e.target.value)}
//                         placeholder="Search predefined options..."
//                         className="pl-10"
//                     />
//                 </div>

//                 {/* Selected Items */}
//                 {selectedItems.length > 0 && (
//                     <div className="space-y-2">
//                         <h4 className="text-sm font-medium text-gray-700">Selected ({selectedItems.length}):</h4>
//                         <div className="flex flex-wrap gap-2">
//                             {selectedItems.map((item, index) => (
//                                 <Badge
//                                     key={index}
//                                     variant="default"
//                                     className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer group"
//                                     onClick={() => removeItem(item)}
//                                 >
//                                     <span className="max-w-[200px] truncate">{item}</span>
//                                     <X className="ml-2 h-3 w-3 opacity-60 group-hover:opacity-100" />
//                                 </Badge>
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 {/* Predefined Categories */}
//                 <div className="space-y-3">
//                     <h4 className="text-sm font-medium text-gray-700">Browse by Category:</h4>
//                     {Object.entries(filteredOptions).map(([category, options]) => (
//                         <Card key={category} className="border border-gray-200">
//                             <CardHeader
//                                 className="py-3 cursor-pointer hover:bg-gray-50 transition-colors"
//                                 onClick={() => toggleCategory(category)}
//                             >
//                                 <div className="flex items-center justify-between">
//                                     <h5 className="text-sm font-medium text-gray-800">{category}</h5>
//                                     <div className="flex items-center gap-2">
//                                         <Badge variant="outline" className="text-xs">
//                                             {options.length} options
//                                         </Badge>
//                                         {expandedCategories.has(category) ? (
//                                             <ChevronDown className="h-4 w-4" />
//                                         ) : (
//                                             <ChevronRight className="h-4 w-4" />
//                                         )}
//                                     </div>
//                                 </div>
//                             </CardHeader>

//                             {expandedCategories.has(category) && (
//                                 <CardContent className="pt-0 pb-3">
//                                     <div className="grid gap-2">
//                                         {options.map((option, index) => {
//                                             const isSelected = selectedItems.includes(option);
//                                             return (
//                                                 <div
//                                                     key={index}
//                                                     className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group ${
//                                                         isSelected
//                                                             ? 'border-blue-300 bg-blue-50 shadow-sm'
//                                                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                                                     }`}
//                                                     onClick={() => (isSelected ? removeItem(option) : addItem(option))}
//                                                 >
//                                                     <div className="flex items-center justify-between">
//                                                         <span
//                                                             className={`text-sm ${
//                                                                 isSelected
//                                                                     ? 'text-blue-800 font-medium'
//                                                                     : 'text-gray-700'
//                                                             }`}
//                                                         >
//                                                             {option}
//                                                         </span>
//                                                         <Button
//                                                             size="sm"
//                                                             variant={isSelected ? 'default' : 'outline'}
//                                                             className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ${
//                                                                 isSelected
//                                                                     ? 'opacity-100 bg-blue-600 hover:bg-blue-700'
//                                                                     : ''
//                                                             }`}
//                                                         >
//                                                             {isSelected ? (
//                                                                 <X className="h-3 w-3" />
//                                                             ) : (
//                                                                 <Plus className="h-3 w-3" />
//                                                             )}
//                                                         </Button>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 </CardContent>
//                             )}
//                         </Card>
//                     ))}
//                 </div>

//                 {/* Custom Input */}
//                 <div className="border-t pt-4">
//                     <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Option:</h4>
//                     <div className="flex gap-2">
//                         <Input
//                             value={customInput}
//                             onChange={e => setCustomInput(e.target.value)}
//                             placeholder={placeholder}
//                             onKeyDown={handleKeyDown}
//                         />
//                         <Button
//                             onClick={addCustomItem}
//                             size="sm"
//                             disabled={!customInput.trim() || selectedItems.includes(customInput.trim())}
//                         >
//                             <Plus className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Quick Stats */}
//                 <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
//                     <span>{selectedItems.length} items selected</span>
//                     <span>{Object.values(filteredOptions).flat().length} options available</span>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }
