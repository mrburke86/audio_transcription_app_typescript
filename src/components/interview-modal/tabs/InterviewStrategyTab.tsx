// // src/components/interview-modal/tabs/InterviewStrategyTab.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { FormField } from '../components/FormField';
// import { DynamicList } from '../components/DynamicList';
// import { useInterviewModal } from '../InterviewModalContext';
// import { InitialInterviewContext, InterviewerProfile } from '@/types';
// import { Plus, Trash2 } from 'lucide-react';
// import { PREDEFINED_DIFFERENTIATORS, PREDEFINED_RISK_MITIGATIONS, PREDEFINED_QUESTIONS } from '@/lib/predefinedFields';
// import { CreativePredefinedSelector } from '../components/CreativePredefinedSelector';

// export function InterviewStrategyTab() {
//     const { context, updateField } = useInterviewModal();

//     // Ensure interviewStrategy exists with default values
//     const interviewStrategy = context.interviewStrategy || {
//         primaryPositioning: undefined,
//         keyDifferentiators: [],
//         riskMitigation: [],
//         questionsToAsk: [],
//         followUpStrategy: undefined,
//     };

//     const interviewerProfiles = context.interviewerProfiles || [];

//     // Helper functions for nested interviewer profiles
//     const addInterviewerProfile = () => {
//         const newProfile: InterviewerProfile = {
//             role: 'hiring-manager',
//             name: '',
//             background: '',
//             priorities: [],
//             communicationStyle: 'collaborative',
//         };
//         const updatedProfiles = [...interviewerProfiles, newProfile];
//         updateField('interviewerProfiles', updatedProfiles);
//     };

//     const updateInterviewerProfile = (index: number, field: keyof InterviewerProfile, value: any) => {
//         const updatedProfiles = [...interviewerProfiles];
//         updatedProfiles[index] = { ...updatedProfiles[index], [field]: value };
//         updateField('interviewerProfiles', updatedProfiles);
//     };

//     const removeInterviewerProfile = (index: number) => {
//         const updatedProfiles = interviewerProfiles.filter((_, i) => i !== index);
//         updateField('interviewerProfiles', updatedProfiles);
//     };

//     const updateInterviewerPriorities = (index: number, priorities: string[]) => {
//         updateInterviewerProfile(index, 'priorities', priorities);
//     };

//     // Helper functions for strategy fields
//     const updateStrategyField = (field: keyof InitialInterviewContext['interviewStrategy'], value: any) => {
//         const updatedStrategy = { ...interviewStrategy, [field]: value };
//         updateField('interviewStrategy', updatedStrategy);
//     };

//     return (
//         <div className="space-y-6">
//             {/* Strategic Positioning */}
//             <div className="space-y-4">
//                 <div className="border-l-4 border-orange-500 pl-4">
//                     <h3 className="text-lg font-semibold text-gray-900">Strategic Positioning</h3>
//                     <p className="text-sm text-gray-600">Define how you want to position yourself competitively</p>
//                 </div>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">🎯 Primary Positioning</CardTitle>
//                         <p className="text-sm text-gray-600">Choose your primary value proposition for this role</p>
//                     </CardHeader>
//                     <CardContent>
//                         <FormField label="Primary Positioning">
//                             <Select
//                                 value={interviewStrategy.primaryPositioning || ''}
//                                 onValueChange={value =>
//                                     updateStrategyField(
//                                         'primaryPositioning',
//                                         value as InitialInterviewContext['interviewStrategy']['primaryPositioning']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select positioning" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="problem-solver">Problem Solver</SelectItem>
//                                     <SelectItem value="growth-driver">Growth Driver</SelectItem>
//                                     <SelectItem value="efficiency-expert">Efficiency Expert</SelectItem>
//                                     <SelectItem value="transformation-leader">Transformation Leader</SelectItem>
//                                     <SelectItem value="innovation-catalyst">Innovation Catalyst</SelectItem>
//                                     <SelectItem value="customer-champion">Customer Champion</SelectItem>
//                                     <SelectItem value="technical-expert">Technical Expert</SelectItem>
//                                     <SelectItem value="strategic-advisor">Strategic Advisor</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </CardContent>
//                 </Card>

//                 <CreativePredefinedSelector
//                     title="Key Differentiators"
//                     description="What sets you apart from other candidates"
//                     icon="⭐"
//                     predefinedOptions={PREDEFINED_DIFFERENTIATORS}
//                     selectedItems={interviewStrategy.keyDifferentiators}
//                     onItemsChange={items => updateStrategyField('keyDifferentiators', items)}
//                     placeholder="Add a custom differentiator..."
//                 />

//                 <CreativePredefinedSelector
//                     title="Risk Mitigation"
//                     description="Address potential concerns or weaknesses proactively"
//                     icon="🛡️"
//                     predefinedOptions={PREDEFINED_RISK_MITIGATIONS}
//                     selectedItems={interviewStrategy.riskMitigation}
//                     onItemsChange={items => updateStrategyField('riskMitigation', items)}
//                     placeholder="Add a custom risk to address..."
//                 />
//             </div>

//             {/* Interviewer Context */}
//             <div className="space-y-4">
//                 <div className="border-l-4 border-blue-500 pl-4">
//                     <h3 className="text-lg font-semibold text-gray-900">Interviewer Intelligence</h3>
//                     <p className="text-sm text-gray-600">Research and prepare for specific interviewers</p>
//                 </div>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">👥 Interviewer Profiles</CardTitle>
//                         <div className="flex items-center justify-between">
//                             <p className="text-sm text-gray-600">
//                                 Add details about each interviewer to tailor your approach
//                             </p>
//                             <Button onClick={addInterviewerProfile} size="sm">
//                                 <Plus className="h-4 w-4 mr-1" />
//                                 Add Interviewer
//                             </Button>
//                         </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         {interviewerProfiles.length === 0 ? (
//                             <div className="text-center py-8 text-gray-500">
//                                 <p>No interviewers added yet</p>
//                                 <p className="text-sm">
//                                     Click &quot;Add Interviewer&quot; to start building interviewer profiles
//                                 </p>
//                             </div>
//                         ) : (
//                             interviewerProfiles.map((interviewer, index) => (
//                                 <Card key={index} className="border border-gray-200">
//                                     <CardHeader className="pb-4">
//                                         <div className="flex items-center justify-between">
//                                             <h4 className="font-medium">Interviewer {index + 1}</h4>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 onClick={() => removeInterviewerProfile(index)}
//                                                 className="text-red-500 hover:text-red-700"
//                                             >
//                                                 <Trash2 className="h-4 w-4" />
//                                             </Button>
//                                         </div>
//                                     </CardHeader>
//                                     <CardContent className="space-y-4">
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <FormField label="Role">
//                                                 <Select
//                                                     value={interviewer.role}
//                                                     onValueChange={value =>
//                                                         updateInterviewerProfile(index, 'role', value)
//                                                     }
//                                                 >
//                                                     <SelectTrigger>
//                                                         <SelectValue />
//                                                     </SelectTrigger>
//                                                     <SelectContent>
//                                                         <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
//                                                         <SelectItem value="peer">Peer/Colleague</SelectItem>
//                                                         <SelectItem value="senior-executive">
//                                                             Senior Executive
//                                                         </SelectItem>
//                                                         <SelectItem value="hr">HR Representative</SelectItem>
//                                                         <SelectItem value="technical-lead">Technical Lead</SelectItem>
//                                                         <SelectItem value="panel-member">Panel Member</SelectItem>
//                                                     </SelectContent>
//                                                 </Select>
//                                             </FormField>

//                                             <FormField label="Communication Style">
//                                                 <Select
//                                                     value={interviewer.communicationStyle}
//                                                     onValueChange={value =>
//                                                         updateInterviewerProfile(index, 'communicationStyle', value)
//                                                     }
//                                                 >
//                                                     <SelectTrigger>
//                                                         <SelectValue />
//                                                     </SelectTrigger>
//                                                     <SelectContent>
//                                                         <SelectItem value="direct">Direct</SelectItem>
//                                                         <SelectItem value="collaborative">Collaborative</SelectItem>
//                                                         <SelectItem value="analytical">Analytical</SelectItem>
//                                                         <SelectItem value="relationship-focused">
//                                                             Relationship-Focused
//                                                         </SelectItem>
//                                                     </SelectContent>
//                                                 </Select>
//                                             </FormField>
//                                         </div>

//                                         <FormField label="Name (Optional)">
//                                             <Input
//                                                 value={interviewer.name}
//                                                 onChange={e => updateInterviewerProfile(index, 'name', e.target.value)}
//                                                 placeholder="Enter interviewer's name"
//                                             />
//                                         </FormField>

//                                         <FormField label="Background (Optional)">
//                                             <Textarea
//                                                 value={interviewer.background}
//                                                 onChange={e =>
//                                                     updateInterviewerProfile(index, 'background', e.target.value)
//                                                 }
//                                                 placeholder="Any known background, experience, or interests..."
//                                                 rows={2}
//                                             />
//                                         </FormField>

//                                         <FormField label="Priorities & Interests">
//                                             <DynamicList
//                                                 items={interviewer.priorities}
//                                                 onItemsChange={items => updateInterviewerPriorities(index, items)}
//                                                 placeholder="Add priority or interest (e.g., Team culture, Technical skills)"
//                                                 addButtonText="Add Priority"
//                                             />
//                                         </FormField>
//                                     </CardContent>
//                                 </Card>
//                             ))
//                         )}
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Post-Interview Planning */}
//             <div className="space-y-4">
//                 <div className="border-l-4 border-green-500 pl-4">
//                     <h3 className="text-lg font-semibold text-gray-900">Post-Interview Planning</h3>
//                     <p className="text-sm text-gray-600">Prepare questions and follow-up strategy</p>
//                 </div>

//                 <CreativePredefinedSelector
//                     title="Questions to Ask"
//                     description="Thoughtful questions that demonstrate your interest and understanding"
//                     icon="❓"
//                     predefinedOptions={PREDEFINED_QUESTIONS}
//                     selectedItems={interviewStrategy.questionsToAsk}
//                     onItemsChange={items => updateStrategyField('questionsToAsk', items)}
//                     placeholder="Add a custom strategic question..."
//                 />

//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">📬 Follow-Up Strategy</CardTitle>
//                         <p className="text-sm text-gray-600">Plan your post-interview communication timeline</p>
//                     </CardHeader>
//                     <CardContent>
//                         <FormField label="Follow-Up Timeline">
//                             <Select
//                                 value={interviewStrategy.followUpStrategy || ''}
//                                 onValueChange={value => updateStrategyField('followUpStrategy', value)}
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="immediate">Immediate (Same Day)</SelectItem>
//                                     <SelectItem value="24-hour">24 Hours</SelectItem>
//                                     <SelectItem value="week">One Week</SelectItem>
//                                     <SelectItem value="custom">Custom Timeline</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Strategy Tips */}
//             <Card className="bg-purple-50 border-purple-200">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-purple-800">🧠 Strategy Tips</CardTitle>
//                 </CardHeader>
//                 <CardContent className="text-sm text-purple-700 space-y-2">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <p>
//                                 <strong>Research thoroughly:</strong> Use LinkedIn, company website, and news to
//                                 understand interviewers
//                             </p>
//                             <p>
//                                 <strong>Prepare 3-5 questions:</strong> Quality over quantity for meaningful dialogue
//                             </p>
//                         </div>
//                         <div className="space-y-2">
//                             <p>
//                                 <strong>Address weaknesses early:</strong> Proactive risk mitigation builds confidence
//                             </p>
//                             <p>
//                                 <strong>Match communication styles:</strong> Adapt your approach to each
//                                 interviewer&apos;s style
//                             </p>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
