// // src/components/interview-modal/tabs/ExperienceFocusTab.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Textarea } from '@/components/ui/textarea';
// import { FormField } from '../components/FormField';
// import { useInterviewModal } from '../InterviewModalContext';
// import { DynamicList } from '../components/DynamicList';

// interface CheckboxSectionProps {
//     title: string;
//     description?: string;
//     icon: string;
//     predefinedOptions: string[];
//     selectedItems: string[];
//     onItemsChange: (items: string[]) => void;
//     dynamicListPlaceholder: string;
// }

// function CheckboxSection({
//     title,
//     description,
//     icon,
//     predefinedOptions,
//     selectedItems,
//     onItemsChange,
//     dynamicListPlaceholder,
// }: CheckboxSectionProps) {
//     const togglePredefinedOption = (option: string) => {
//         if (selectedItems.includes(option)) {
//             onItemsChange(selectedItems.filter(item => item !== option));
//         } else {
//             onItemsChange([...selectedItems, option]);
//         }
//     };

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                     {icon} {title}
//                 </CardTitle>
//                 {description && <p className="text-sm text-gray-600">{description}</p>}
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 {/* Predefined Checkboxes */}
//                 <FormField label="Select from common options:">
//                     <div className="grid grid-cols-1 gap-3">
//                         {predefinedOptions.map((option, index) => (
//                             <div key={index} className="flex items-center space-x-2">
//                                 <Checkbox
//                                     id={`${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
//                                     checked={selectedItems.includes(option)}
//                                     onCheckedChange={() => togglePredefinedOption(option)}
//                                 />
//                                 <label
//                                     htmlFor={`${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
//                                     className="text-sm cursor-pointer leading-relaxed"
//                                 >
//                                     {option}
//                                 </label>
//                             </div>
//                         ))}
//                     </div>
//                 </FormField>

//                 {/* Your existing DynamicList for custom additions */}
//                 <FormField label="Add your own:">
//                     <DynamicList
//                         items={selectedItems.filter(item => !predefinedOptions.includes(item))}
//                         onItemsChange={customItems => {
//                             // Combine predefined selections with custom items
//                             const predefinedSelected = selectedItems.filter(item => predefinedOptions.includes(item));
//                             onItemsChange([...predefinedSelected, ...customItems]);
//                         }}
//                         placeholder={dynamicListPlaceholder}
//                         addButtonText="Add"
//                     />
//                 </FormField>
//             </CardContent>
//         </Card>
//     );
// }

// export function ExperienceFocusTab() {
//     const { context, updateField } = useInterviewModal();

//     return (
//         <div className="space-y-4">
//             {/* Interview Goals */}
//             <CheckboxSection
//                 title="Interview Goals"
//                 description="What do you want to achieve or learn from this interview?"
//                 icon="🎯"
//                 predefinedOptions={PREDEFINED_INTERVIEW_GOALS}
//                 selectedItems={context.goals}
//                 onItemsChange={items => updateField('goals', items)}
//                 dynamicListPlaceholder="Add a specific interview goal..."
//             />

//             {/* Key Experiences */}
//             <CheckboxSection
//                 title="Key Experiences to Emphasize"
//                 description="Which experiences should be highlighted in your responses?"
//                 icon="💼"
//                 predefinedOptions={PREDEFINED_EXPERIENCES}
//                 selectedItems={context.emphasizedExperiences}
//                 onItemsChange={items => updateField('emphasizedExperiences', items)}
//                 dynamicListPlaceholder="Add a specific experience to highlight..."
//             />

//             {/* Specific Challenges */}
//             <CheckboxSection
//                 title="Challenges to Address"
//                 description="What types of challenges can you speak to confidently?"
//                 icon="⚡"
//                 predefinedOptions={PREDEFINED_CHALLENGES}
//                 selectedItems={context.specificChallenges}
//                 onItemsChange={items => updateField('specificChallenges', items)}
//                 dynamicListPlaceholder="Add a specific challenge you've overcome..."
//             />

//             {/* Additional Context */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle>📝 Additional Context</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <FormField label="Additional Context">
//                         <Textarea
//                             value={context.industry}
//                             onChange={e => updateField('industry', e.target.value)}
//                             placeholder="Any additional context about the role, company, or industry..."
//                             rows={3}
//                         />
//                     </FormField>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
