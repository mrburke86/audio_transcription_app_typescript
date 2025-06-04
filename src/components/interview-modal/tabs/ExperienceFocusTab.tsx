// // src/components/interview-modal/tabs/ExperienceFocusTab.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { useInterviewModal } from '../InterviewModalContext';
// import { Plus } from 'lucide-react';
// import { useState } from 'react';
// import {
//     PREDEFINED_CHALLENGES,
//     PREDEFINED_EXPERIENCES,
//     PREDEFINED_INTERVIEW_GOALS,
//     ACHIEVEMENT_CATEGORIES,
//     SKILL_CATEGORIES,
// } from '@/lib/predefinedFields';
// import { DynamicList } from '../components/DynamicList';

// interface CheckboxWithCustomInputProps {
//     title: string;
//     description?: string;
//     icon: string;
//     predefinedOptions: readonly string[];
//     selectedItems: string[];
//     onToggleItem: (item: string) => void;
//     onAddCustomItem: (item: string) => void;
//     customPlaceholder: string;
// }

// function CheckboxWithCustomInput({
//     title,
//     description,
//     icon,
//     predefinedOptions,
//     selectedItems,
//     onToggleItem,
//     onAddCustomItem,
//     customPlaceholder,
// }: CheckboxWithCustomInputProps) {
//     const [customInput, setCustomInput] = useState('');

//     const handleAddCustom = () => {
//         if (customInput.trim() && !selectedItems.includes(customInput.trim())) {
//             onAddCustomItem(customInput.trim());
//             setCustomInput('');
//         }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter') {
//             e.preventDefault();
//             handleAddCustom();
//         }
//     };

//     // Separate custom items for display
//     const customSelected = selectedItems.filter(item => !predefinedOptions.includes(item));

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                     {icon} {title}
//                 </CardTitle>
//                 {description && <p className="text-sm text-gray-600">{description}</p>}
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 {/* Predefined Options */}
//                 <div>
//                     <label className="text-sm font-medium mb-3 block">Select from common options:</label>
//                     <div className="grid grid-cols-1 gap-3">
//                         {predefinedOptions.map((option, index) => (
//                             <div key={index} className="flex items-center space-x-2">
//                                 <Checkbox
//                                     id={`${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
//                                     checked={selectedItems.includes(option)}
//                                     onCheckedChange={_checked => {
//                                         onToggleItem(option);
//                                     }}
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
//                 </div>

//                 {/* Custom Input */}
//                 <div>
//                     <label className="text-sm font-medium mb-2 block">Add custom option:</label>
//                     <div className="flex gap-2">
//                         <Input
//                             value={customInput}
//                             onChange={e => setCustomInput(e.target.value)}
//                             placeholder={customPlaceholder}
//                             onKeyDown={handleKeyDown}
//                         />
//                         <Button
//                             onClick={handleAddCustom}
//                             size="sm"
//                             disabled={!customInput.trim() || selectedItems.includes(customInput.trim())}
//                         >
//                             <Plus className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Show custom selections if any */}
//                 {customSelected.length > 0 && (
//                     <div>
//                         <label className="text-sm font-medium mb-2 block">Your custom additions:</label>
//                         <div className="space-y-2">
//                             {customSelected.map((item, index) => (
//                                 <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
//                                     <span className="text-sm">{item}</span>
//                                     <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         onClick={() => onToggleItem(item)}
//                                         className="text-red-500 hover:text-red-700"
//                                     >
//                                         Remove
//                                     </Button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

// export function ExperienceFocusTab() {
//     const { context, toggleInArray, updateField } = useInterviewModal();

//     const handleAddCustomGoal = (goal: string) => {
//         toggleInArray('goals', goal);
//     };

//     const handleAddCustomExperience = (experience: string) => {
//         toggleInArray('emphasizedExperiences', experience);
//     };

//     const handleAddCustomChallenge = (challenge: string) => {
//         toggleInArray('specificChallenges', challenge);
//     };

//     const handleAddCustomAchievement = (achievement: string) => {
//         toggleInArray('keyAchievements', achievement);
//     };

//     const handleAddCustomSkill = (skill: string) => {
//         toggleInArray('coreSkills', skill);
//     };

//     return (
//         <div className="space-y-6">
//             {/* Interview Goals & Strategy */}
//             <div className="space-y-4">
//                 <div className="border-l-4 border-blue-500 pl-4">
//                     <h3 className="text-lg font-semibold text-gray-900">Interview Goals & Strategy</h3>
//                     <p className="text-sm text-gray-600">
//                         Define what you want to achieve and learn from this interview
//                     </p>
//                 </div>

//                 <CheckboxWithCustomInput
//                     title="Interview Goals"
//                     description="What do you want to achieve or learn from this interview?"
//                     icon="🎯"
//                     predefinedOptions={PREDEFINED_INTERVIEW_GOALS}
//                     selectedItems={context.goals}
//                     onToggleItem={item => toggleInArray('goals', item)}
//                     onAddCustomItem={handleAddCustomGoal}
//                     customPlaceholder="Add a specific interview goal..."
//                 />
//             </div>

//             {/* Experience & Background */}
//             <div className="space-y-4">
//                 <div className="border-l-4 border-green-500 pl-4">
//                     <h3 className="text-lg font-semibold text-gray-900">Experience & Background</h3>
//                     <p className="text-sm text-gray-600">
//                         Select experiences and challenges to emphasize in your responses
//                     </p>
//                 </div>

//                 <CheckboxWithCustomInput
//                     title="Key Experiences to Emphasize"
//                     description="Which experiences should be highlighted in your responses?"
//                     icon="💼"
//                     predefinedOptions={PREDEFINED_EXPERIENCES}
//                     selectedItems={context.emphasizedExperiences}
//                     onToggleItem={item => toggleInArray('emphasizedExperiences', item)}
//                     onAddCustomItem={handleAddCustomExperience}
//                     customPlaceholder="Add a specific experience to highlight..."
//                 />

//                 <CheckboxWithCustomInput
//                     title="Challenges to Address"
//                     description="What types of challenges can you speak to confidently?"
//                     icon="⚡"
//                     predefinedOptions={PREDEFINED_CHALLENGES}
//                     selectedItems={context.specificChallenges}
//                     onToggleItem={item => toggleInArray('specificChallenges', item)}
//                     onAddCustomItem={handleAddCustomChallenge}
//                     customPlaceholder="Add a specific challenge you've overcome..."
//                 />

//                 {/* Company Context */}
//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">🏢 Company Context</CardTitle>
//                         <p className="text-sm text-gray-600">
//                             Key context areas from your background that should inform responses
//                         </p>
//                     </CardHeader>
//                     <CardContent>
//                         <DynamicList
//                             items={context.companyContext}
//                             onItemsChange={items => updateField('companyContext', items)}
//                             placeholder="Add company context (e.g., sales_methodology, startup_experience)"
//                             addButtonText="Add Context"
//                         />
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Achievements & Skills */}
//             <div className="space-y-4">
//                 <div className="border-l-4 border-purple-500 pl-4">
//                     <h3 className="text-lg font-semibold text-gray-900">Achievements & Skills</h3>
//                     <p className="text-sm text-gray-600">Highlight your key accomplishments and core competencies</p>
//                 </div>

//                 <CheckboxWithCustomInput
//                     title="Key Achievements"
//                     description="Notable accomplishments, awards, or metrics you want to highlight"
//                     icon="🏆"
//                     predefinedOptions={ACHIEVEMENT_CATEGORIES}
//                     selectedItems={context.keyAchievements}
//                     onToggleItem={item => toggleInArray('keyAchievements', item)}
//                     onAddCustomItem={handleAddCustomAchievement}
//                     customPlaceholder="Add a key achievement (e.g., Exceeded sales quota by 30%)"
//                 />

//                 <CheckboxWithCustomInput
//                     title="Core Skills"
//                     description="Core strengths or skills you want to emphasize"
//                     icon="💪"
//                     predefinedOptions={SKILL_CATEGORIES}
//                     selectedItems={context.coreSkills}
//                     onToggleItem={item => toggleInArray('coreSkills', item)}
//                     onAddCustomItem={handleAddCustomSkill}
//                     customPlaceholder="Add a skill or expertise (e.g., Negotiation, SaaS Sales)"
//                 />
//             </div>
//         </div>
//     );
// }
