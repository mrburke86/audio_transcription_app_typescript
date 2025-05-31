// // src\app\chat\_components\EnhancedInterviewSetupModal.tsx
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { InitialInterviewContext, LiveInterviewModalProps } from '@/types';
// import { Mic, Plus, Target, User, X } from 'lucide-react';
// import React, { useState } from 'react';

// // Hard-coded profile based on your knowledge files
// const YOUR_PROFILE = {
//     currentRole: 'Mid-Market Account Executive',
//     yearsExperience: 15,
//     industryBackground: 'B2B SaaS, RegTech, Manufacturing',
//     coreStrengths: [
//         'Complex B2B Sales (£1M+ deals)',
//         'MEDDPICC Methodology',
//         'Stakeholder Orchestration',
//         'Procurement Navigation',
//         'Cross-functional Alignment',
//         'Regulatory Sales Environments',
//     ],
//     keyAchievements: [
//         '£3.2M German MedTech deal (25% cycle compression)',
//         '£1.1M German manufacturer (Quality champion strategy)',
//         'Multi-threaded sales approach',
//         'C-level engagement expertise',
//     ],
//     knowledgeAreas: [
//         'Manufacturing & Quality Management',
//         'EHS & Regulatory Compliance',
//         'ETQ Platform & Solutions',
//         'Hexagon AB Ecosystem',
//         'Mid-market Enterprise Sales',
//     ],
// };

// export function LiveInterviewModal({ onSubmit }: LiveInterviewModalProps) {
//     const [context, setContext] = useState<InitialInterviewContext>({
//         interviewType: 'sales',
//         targetRole: '',
//         targetCompany: '',
//         companySizeType: 'mid-market',
//         industry: '',
//         seniorityLevel: 'manager',
//         responseConfidence: 'balanced',
//         responseStructure: 'story-driven',
//         contextDepth: 10,
//         includeMetrics: true,
//         goals: [],
//         emphasizedExperiences: [],
//         specificChallenges: [],
//         companyContext: ['sales_methodology', 'career_achievements'],
//         roleDescription: '',
//     });

//     const [activeTab, setActiveTab] = useState('interview');
//     const [newExperience, setNewExperience] = useState('');
//     const [newChallenge, setNewChallenge] = useState('');
//     const [newGoal, setNewGoal] = useState('');

//     // Available experiences from your knowledge files
//     const availableExperiences = [
//         'German MedTech £3.2M deal',
//         'German manufacturer £1.1M win',
//         'Quality champion development',
//         'C-level stakeholder management',
//         'Procurement cycle compression',
//         'Regulatory environment navigation',
//         'Multi-threaded sales approach',
//         'Cross-functional buying committees',
//         'MEDDPICC implementation',
//         'Manufacturing industry expertise',
//     ];

//     // Common interview goals
//     const commonGoals = [
//         'Demonstrate executive presence',
//         'Show quantifiable business impact',
//         'Highlight stakeholder management skills',
//         'Emphasize process improvement expertise',
//         'Showcase industry knowledge depth',
//         'Display complex deal navigation',
//         'Present strategic thinking capability',
//         'Reveal cross-functional leadership',
//         'Highlight regulatory expertise',
//         'Show cultural fit and adaptability',
//     ];

//     // Available knowledge contexts from your files (mapped to generic categories)
//     const availableKnowledgeContexts = [
//         { id: 'sales_methodology', files: ['meddpicc_sales_methodology'], name: 'Sales Methodology & Process' },
//         {
//             id: 'industry_expertise',
//             files: ['manufacturing_industry_trends', 'quality_management_ehs_principles'],
//             name: 'Industry Knowledge & Trends',
//         },
//         { id: 'company_knowledge', files: ['etq_company_profile', 'hexagon_ab_company_profile'], name: 'Previous Company Experience' },
//         { id: 'executive_engagement', files: ['C_Level_Engagement_Strategies_Manufacturing'], name: 'C-Level & Executive Engagement' },
//         {
//             id: 'career_achievements',
//             files: ['My_Career_Summary_Achievements', 'My_Career_Summary_Sales_Achievements'],
//             name: 'Career Achievements & Metrics',
//         },
//         {
//             id: 'success_stories',
//             files: ['My_MEDDPICC_Success_Stories', 'ETQ_Role_Specific_Scenarios_Questions'],
//             name: 'Success Stories & Case Studies',
//         },
//     ];

//     const addItem = (type: 'experience' | 'challenge' | 'goal', value: string) => {
//         if (!value.trim()) return;

//         switch (type) {
//             case 'experience':
//                 setContext(prev => ({ ...prev, emphasizedExperiences: [...prev.emphasizedExperiences, value.trim()] }));
//                 setNewExperience('');
//                 break;
//             case 'challenge':
//                 setContext(prev => ({ ...prev, specificChallenges: [...prev.specificChallenges, value.trim()] }));
//                 setNewChallenge('');
//                 break;
//             case 'goal':
//                 setContext(prev => ({ ...prev, goals: [...prev.goals, value.trim()] }));
//                 setNewGoal('');
//                 break;
//         }
//     };

//     const removeItem = (type: 'experience' | 'challenge' | 'goal', index: number) => {
//         switch (type) {
//             case 'experience':
//                 setContext(prev => ({ ...prev, emphasizedExperiences: prev.emphasizedExperiences.filter((_, i) => i !== index) }));
//                 break;
//             case 'challenge':
//                 setContext(prev => ({ ...prev, specificChallenges: prev.specificChallenges.filter((_, i) => i !== index) }));
//                 break;
//             case 'goal':
//                 setContext(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }));
//                 break;
//         }
//     };

//     const toggleKnowledgeContext = (contextId: string) => {
//         setContext(prev => ({
//             ...prev,
//             companyContext: prev.companyContext.includes(contextId)
//                 ? prev.companyContext.filter(id => id !== contextId)
//                 : [...prev.companyContext, contextId],
//         }));
//     };

//     const isValid = context.targetRole.trim().length > 0;

//     const handleSubmit = () => {
//         if (isValid) {
//             // Auto-generate role description based on context
//             const autoRoleDescription = `
// You are a live interview response generator for an experienced B2B sales professional interviewing for ${context.targetRole} at ${
//                 context.targetCompany || 'target companies'
//             }.

// LIVE INTERVIEW CONTEXT:
// - Target Role: ${context.targetRole} (${context.seniorityLevel} level)
// - Company: ${context.targetCompany || 'Various target companies'}
// - Industry: ${context.industry}
// - Company Size: ${context.companySizeType}
// - Interview Type: ${context.interviewType}

// INTERVIEW GOALS:
// ${context.goals.length > 0 ? context.goals.map(goal => `- ${goal}`).join('\n') : '- General interview success'}

// RESPONSE GENERATION SETTINGS:
// - Confidence Level: ${context.responseConfidence}
// - Structure: ${context.responseStructure}
// - Include Metrics: ${context.includeMetrics ? 'Yes' : 'No'}
// - Context Depth: Last ${context.contextDepth} conversation exchanges

// CANDIDATE PROFILE (From Knowledge Files):
// - 15+ years B2B sales experience in regulated environments
// - Proven expertise: Manufacturing, RegTech, Quality Management
// - Key achievements: £3.2M+ deals, MEDDPICC methodology, C-level engagement
// - Core strengths: Stakeholder orchestration, procurement navigation, complex sales

// ${context.emphasizedExperiences.length > 0 ? `EMPHASIZE THESE EXPERIENCES: ${context.emphasizedExperiences.join(', ')}` : ''}
// ${context.specificChallenges.length > 0 ? `FOCUS ON THESE CHALLENGES: ${context.specificChallenges.join(', ')}` : ''}

// PRIORITY KNOWLEDGE AREAS: ${context.companyContext.map(id => availableKnowledgeContexts.find(ctx => ctx.id === id)?.name || id).join(', ')}

// INSTRUCTIONS:
// When the user provides an interviewer's question or statement, generate a complete, word-perfect response that:
// 1. Sounds natural when spoken aloud
// 2. Leverages relevant experience from the knowledge files
// 3. Matches the ${context.responseConfidence} confidence level
// 4. Uses ${context.responseStructure} structure
// 5. Is appropriate for ${context.targetRole} interviews
// 6. Can be delivered confidently without sounding rehearsed

// The response should be the exact words the candidate will speak during the live interview.`;

//             onSubmit({
//                 ...context,
//                 roleDescription: autoRoleDescription,
//             });
//         }
//     };

//     return (
//         <Dialog open={true}>
//             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader>
//                     <DialogTitle className="flex items-center gap-2">
//                         <Mic className="h-5 w-5" />
//                         🎯 Setup Live Interview Assistant
//                     </DialogTitle>
//                     <p className="text-sm text-gray-600">Configure your real-time interview response generator</p>
//                 </DialogHeader>

//                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                     <TabsList className="grid w-full grid-cols-3">
//                         <TabsTrigger value="interview" className="flex items-center gap-2">
//                             <Target className="h-4 w-4" />
//                             Interview Context
//                         </TabsTrigger>
//                         <TabsTrigger value="responses" className="flex items-center gap-2">
//                             <Mic className="h-4 w-4" />
//                             Response Settings
//                         </TabsTrigger>
//                         <TabsTrigger value="focus" className="flex items-center gap-2">
//                             <User className="h-4 w-4" />
//                             Experience Focus
//                         </TabsTrigger>
//                     </TabsList>

//                     <InterviewContextTab context={context} setContext={setContext} />

//                     <ResponsesContextTab context={context} setContext={setContext} />

//                     <FocusContextTab
//                         availableExperiences={availableExperiences}
//                         context={context}
//                         setContext={setContext}
//                         newExperience={newExperience}
//                         setNewExperience={setNewExperience}
//                         addItem={addItem}
//                         newChallenge={newChallenge}
//                         setNewChallenge={setNewChallenge}
//                         removeItem={removeItem}
//                         availableKnowledgeContexts={availableKnowledgeContexts}
//                         toggleKnowledgeContext={toggleKnowledgeContext}
//                         commonGoals={commonGoals}
//                         newGoal={newGoal}
//                         setNewGoal={setNewGoal}
//                     />
//                 </Tabs>

//                 <DialogFooter className="flex justify-between">
//                     <div className="text-sm text-gray-500">{isValid ? '✅ Ready for live interview' : '❌ Please enter target role'}</div>
//                     <Button onClick={handleSubmit} disabled={!isValid}>
//                         🚀 Start Live Interview Assistant
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }

// // Focus Context Tab
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

// function FocusContextTab({
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

// // Response Context Tab
// interface ResponsesContextTabProps {
//     context: InitialInterviewContext;
//     setContext: React.Dispatch<React.SetStateAction<InitialInterviewContext>>;
// }

// function ResponsesContextTab({ context, setContext }: ResponsesContextTabProps) {
//     return (
//         <TabsContent value="responses" className="space-y-4">
//             <Card>
//                 <CardHeader>
//                     <CardTitle>🎙️ Live Response Generation Settings</CardTitle>
//                     <p className="text-sm text-gray-600">Configure how responses are generated when you hit &quot;Move&quot;</p>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div>
//                         <label className="text-sm font-medium">Response Confidence Level</label>
//                         <Select
//                             value={context.responseConfidence}
//                             onValueChange={(value: 'safe' | 'balanced' | 'bold') =>
//                                 setContext(prev => ({ ...prev, responseConfidence: value }))
//                             }
//                         >
//                             <SelectTrigger>
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="safe">Safe & Professional (Conservative responses)</SelectItem>
//                                 <SelectItem value="balanced">Balanced & Authentic (Realistic responses)</SelectItem>
//                                 <SelectItem value="bold">Bold & Assertive (Confident, pushback responses)</SelectItem>
//                             </SelectContent>
//                         </Select>
//                         <p className="text-xs text-gray-500 mt-1">
//                             {context.responseConfidence === 'safe' &&
//                                 'Generates safe, proven responses that emphasize your strengths without risk'}
//                             {context.responseConfidence === 'balanced' &&
//                                 'Balanced responses that show authenticity and learning from challenges'}
//                             {context.responseConfidence === 'bold' &&
//                                 'Confident responses that challenge assumptions and demonstrate executive presence'}
//                         </p>
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium">Response Structure</label>
//                         <Select
//                             value={context.responseStructure}
//                             onValueChange={(value: 'story-driven' | 'framework-based' | 'conversational') =>
//                                 setContext(prev => ({ ...prev, responseStructure: value }))
//                             }
//                         >
//                             <SelectTrigger>
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="story-driven">Story-Driven (Rich examples with metrics)</SelectItem>
//                                 <SelectItem value="framework-based">Framework-Based (Structured methodology responses)</SelectItem>
//                                 <SelectItem value="conversational">Conversational (Natural, easy-to-deliver responses)</SelectItem>
//                             </SelectContent>
//                         </Select>
//                         <p className="text-xs text-gray-500 mt-1">
//                             {context.responseStructure === 'story-driven' &&
//                                 'Detailed stories with specific examples, numbers, and outcomes'}
//                             {context.responseStructure === 'framework-based' &&
//                                 'Structured responses using proven methodologies (MEDDPICC, etc.)'}
//                             {context.responseStructure === 'conversational' && 'Natural-sounding responses that are easy to speak aloud'}
//                         </p>
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium">Context Memory Depth</label>
//                         <Input
//                             type="number"
//                             value={context.contextDepth}
//                             onChange={e => setContext(prev => ({ ...prev, contextDepth: parseInt(e.target.value) || 10 }))}
//                             min="5"
//                             max="50"
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                             Number of previous conversation exchanges to consider when generating responses
//                         </p>
//                     </div>

//                     <div className="flex items-center space-x-2">
//                         <Checkbox
//                             id="metrics"
//                             checked={context.includeMetrics}
//                             onCheckedChange={checked => setContext(prev => ({ ...prev, includeMetrics: !!checked }))}
//                         />
//                         <label htmlFor="metrics" className="text-sm font-medium">
//                             Include specific metrics and quantifiable examples in responses
//                         </label>
//                     </div>
//                 </CardContent>
//             </Card>
//         </TabsContent>
//     );
// }

// // Interview Context Tab
// interface InterviewContextTabProps {
//     context: InitialInterviewContext;
//     setContext: React.Dispatch<React.SetStateAction<InitialInterviewContext>>;
// }

// function InterviewContextTab({ context, setContext }: InterviewContextTabProps) {
//     return (
//         <TabsContent value="interview" className="space-y-4">
//             <Card>
//                 <CardHeader>
//                     <CardTitle>🎪 Target Interview Details</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm font-medium">Interview Type</label>
//                             <Select
//                                 value={context.interviewType}
//                                 onValueChange={(value: 'behavioral' | 'technical' | 'case-study' | 'sales' | 'leadership' | 'mixed') =>
//                                     setContext(prev => ({ ...prev, interviewType: value }))
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="behavioral">Behavioral</SelectItem>
//                                     <SelectItem value="technical">Technical</SelectItem>
//                                     <SelectItem value="case-study">Case Study</SelectItem>
//                                     <SelectItem value="sales">Sales/Commercial</SelectItem>
//                                     <SelectItem value="leadership">Leadership</SelectItem>
//                                     <SelectItem value="mixed">Mixed</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>

//                         <div>
//                             <label className="text-sm font-medium">Seniority Level</label>
//                             <Select
//                                 value={context.seniorityLevel}
//                                 onValueChange={(value: 'senior-ic' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level') =>
//                                     setContext(prev => ({ ...prev, seniorityLevel: value }))
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="senior-ic">Senior IC</SelectItem>
//                                     <SelectItem value="lead">Team Lead</SelectItem>
//                                     <SelectItem value="manager">Manager</SelectItem>
//                                     <SelectItem value="director">Director</SelectItem>
//                                     <SelectItem value="vp">VP</SelectItem>
//                                     <SelectItem value="c-level">C-Level</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium">Target Role *</label>
//                         <Input
//                             value={context.targetRole}
//                             onChange={e => setContext(prev => ({ ...prev, targetRole: e.target.value }))}
//                             placeholder="e.g., VP of Sales - Enterprise, Senior Sales Director"
//                         />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm font-medium">Target Company</label>
//                             <Input
//                                 value={context.targetCompany}
//                                 onChange={e => setContext(prev => ({ ...prev, targetCompany: e.target.value }))}
//                                 placeholder="e.g., Salesforce, Microsoft, Siemens"
//                             />
//                         </div>

//                         <div>
//                             <label className="text-sm font-medium">Company Size</label>
//                             <Select
//                                 value={context.companySizeType}
//                                 onValueChange={(value: 'startup' | 'scaleup' | 'mid-market' | 'enterprise' | 'public') =>
//                                     setContext(prev => ({ ...prev, companySizeType: value }))
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="scaleup">Scale-up (100-1K)</SelectItem>
//                                     <SelectItem value="mid-market">Mid-market (1K-10K)</SelectItem>
//                                     <SelectItem value="enterprise">Enterprise (10K+)</SelectItem>
//                                     <SelectItem value="public">Public Company</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium">Industry/Sector</label>
//                         <Input
//                             value={context.industry}
//                             onChange={e => setContext(prev => ({ ...prev, industry: e.target.value }))}
//                             placeholder="e.g., Manufacturing Software, RegTech, Industrial IoT"
//                         />
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Your Profile Summary (Read-Only) */}
//             <Card className="bg-blue-50">
//                 <CardHeader>
//                     <CardTitle className="text-blue-800">📋 Your Profile (From Knowledge Files)</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                             <p>
//                                 <strong>Current Role:</strong> {YOUR_PROFILE.currentRole}
//                             </p>
//                             <p>
//                                 <strong>Experience:</strong> {YOUR_PROFILE.yearsExperience} years
//                             </p>
//                             <p>
//                                 <strong>Background:</strong> {YOUR_PROFILE.industryBackground}
//                             </p>
//                         </div>
//                         <div>
//                             <p>
//                                 <strong>Key Achievements:</strong>
//                             </p>
//                             <ul className="text-xs ml-4 list-disc">
//                                 {YOUR_PROFILE.keyAchievements.map((achievement, i) => (
//                                     <li key={i}>{achievement}</li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </TabsContent>
//     );
// }
