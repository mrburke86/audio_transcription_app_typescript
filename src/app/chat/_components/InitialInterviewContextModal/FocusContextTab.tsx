// //
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { TabsContent } from '@/components/ui/tabs';
// import { InitialInterviewContext } from '@/types';
// import { Plus, X } from 'lucide-react';
// import React from 'react';

// interface FocusContextTabProps {
//     availableExperiences: string[];
//     context: InitialInterviewContext;
//     setContext: React.Dispatch<React.SetStateAction<InitialInterviewContext>>;
//     newExperience: string;
//     setNewExperience: React.Dispatch<React.SetStateAction<string>>;
//     addItem: (type: 'experience' | 'challenge' | 'goal', value: string) => void;
//     newChallenge: string;
//     setNewChallenge: React.Dispatch<React.SetStateAction<string>>;
//     removeItem: (type: 'experience' | 'challenge' | 'goal', index: number) => void;
//     availableKnowledgeContexts: { id: string; files: string[]; name: string }[];
//     toggleKnowledgeContext: (contextId: string) => void;
//     commonGoals: string[];
//     newGoal: string;
//     setNewGoal: React.Dispatch<React.SetStateAction<string>>;
// }

// export function FocusContextTab({
//     availableExperiences,
//     context,
//     setContext,
//     newExperience,
//     setNewExperience,
//     addItem,
//     newChallenge,
//     setNewChallenge,
//     removeItem,
//     availableKnowledgeContexts,
//     toggleKnowledgeContext,
//     commonGoals,
//     newGoal,
//     setNewGoal,
// }: FocusContextTabProps) {
//     return (
//         <TabsContent value="focus" className="space-y-4">
//             <Card>
//                 <CardHeader>
//                     <CardTitle>🎯 Interview Goals & Objectives</CardTitle>
//                     <p className="text-sm text-gray-600">What specific outcomes do you want to achieve in this interview?</p>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-2">
//                         {commonGoals.map((goal, index) => (
//                             <div key={index} className="flex items-center space-x-2">
//                                 <Checkbox
//                                     id={`goal-${index}`}
//                                     checked={context.goals.includes(goal)}
//                                     onCheckedChange={checked => {
//                                         if (checked) {
//                                             setContext(prev => ({ ...prev, goals: [...prev.goals, goal] }));
//                                         } else {
//                                             setContext(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
//                                         }
//                                     }}
//                                 />
//                                 <label htmlFor={`goal-${index}`} className="text-sm">
//                                     {goal}
//                                 </label>
//                             </div>
//                         ))}
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium">Custom Interview Goal</label>
//                         <div className="flex gap-2">
//                             <Input
//                                 value={newGoal}
//                                 onChange={e => setNewGoal(e.target.value)}
//                                 placeholder="e.g., Position myself for VP promotion, Show thought leadership..."
//                                 onKeyDown={e => e.key === 'Enter' && addItem('goal', newGoal)}
//                             />
//                             <Button onClick={() => addItem('goal', newGoal)} size="sm">
//                                 <Plus className="h-4 w-4" />
//                             </Button>
//                         </div>
//                         <div className="flex flex-wrap gap-2 mt-2">
//                             {context.goals
//                                 .filter(goal => !commonGoals.includes(goal))
//                                 .map((goal, index) => (
//                                     <Badge key={index} variant="outline" className="flex gap-1">
//                                         {goal}
//                                         <X
//                                             className="h-3 w-3 cursor-pointer"
//                                             onClick={() => {
//                                                 const goalIndex = context.goals.indexOf(goal);
//                                                 removeItem('goal', goalIndex);
//                                             }}
//                                         />
//                                     </Badge>
//                                 ))}
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             <Card>
//                 <CardHeader>
//                     <CardTitle>💡 Emphasized Experiences</CardTitle>
//                     <p className="text-sm text-gray-600">Which of your experiences should be prioritized in responses?</p>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-2">
//                         {availableExperiences.map((exp, index) => (
//                             <div key={index} className="flex items-center space-x-2">
//                                 <Checkbox
//                                     id={`exp-${index}`}
//                                     checked={context.emphasizedExperiences.includes(exp)}
//                                     onCheckedChange={checked => {
//                                         if (checked) {
//                                             setContext(prev => ({ ...prev, emphasizedExperiences: [...prev.emphasizedExperiences, exp] }));
//                                         } else {
//                                             setContext(prev => ({
//                                                 ...prev,
//                                                 emphasizedExperiences: prev.emphasizedExperiences.filter(e => e !== exp),
//                                             }));
//                                         }
//                                     }}
//                                 />
//                                 <label htmlFor={`exp-${index}`} className="text-sm">
//                                     {exp}
//                                 </label>
//                             </div>
//                         ))}
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium">Custom Experience to Emphasize</label>
//                         <div className="flex gap-2">
//                             <Input
//                                 value={newExperience}
//                                 onChange={e => setNewExperience(e.target.value)}
//                                 placeholder="Add specific experience..."
//                                 onKeyDown={e => e.key === 'Enter' && addItem('experience', newExperience)}
//                             />
//                             <Button onClick={() => addItem('experience', newExperience)} size="sm">
//                                 <Plus className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             <Card>
//                 <CardHeader>
//                     <CardTitle>🎯 Specific Areas of Focus</CardTitle>
//                     <p className="text-sm text-gray-600">What specific topics/challenges might come up in this interview?</p>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div>
//                         <div className="flex gap-2 mb-2">
//                             <Input
//                                 value={newChallenge}
//                                 onChange={e => setNewChallenge(e.target.value)}
//                                 placeholder="e.g., Handling procurement objections, C-level storytelling"
//                                 onKeyDown={e => e.key === 'Enter' && addItem('challenge', newChallenge)}
//                             />
//                             <Button onClick={() => addItem('challenge', newChallenge)} size="sm">
//                                 <Plus className="h-4 w-4" />
//                             </Button>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                             {context.specificChallenges.map((challenge, index) => (
//                                 <Badge key={index} variant="outline" className="flex gap-1">
//                                     {challenge}
//                                     <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('challenge', index)} />
//                                 </Badge>
//                             ))}
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             <Card>
//                 <CardHeader>
//                     <CardTitle>📚 Knowledge Context Priority</CardTitle>
//                     <p className="text-sm text-gray-600">Which knowledge areas should be prioritized for this interview?</p>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid grid-cols-1 gap-3">
//                         {availableKnowledgeContexts.map(ctx => (
//                             <div key={ctx.id} className="flex items-center space-x-2">
//                                 <Checkbox
//                                     id={ctx.id}
//                                     checked={context.companyContext.includes(ctx.id)}
//                                     onCheckedChange={() => toggleKnowledgeContext(ctx.id)}
//                                 />
//                                 <label htmlFor={ctx.id} className="text-sm font-medium">
//                                     {ctx.name}
//                                 </label>
//                                 <span className="text-xs text-gray-500 ml-2">
//                                     ({ctx.files.length} file{ctx.files.length > 1 ? 's' : ''})
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                     <div className="mt-3 p-3 bg-gray-50 rounded-lg">
//                         <p className="text-xs text-gray-600">
//                             <strong>Selected contexts will be prioritized</strong> when generating responses. The AI will pull relevant
//                             information from these knowledge areas to craft contextually appropriate answers.
//                         </p>
//                     </div>
//                 </CardContent>
//             </Card>
//         </TabsContent>
//     );
// }
