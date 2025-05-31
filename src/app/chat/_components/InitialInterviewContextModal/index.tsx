// src\app\chat\_components\InitialInterviewContextModal\index.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InitialInterviewContext, LiveInterviewModalProps } from '@/types';
import { Mic, Target, User } from 'lucide-react';
import { useState } from 'react';
import { InterviewContextTab } from './InterviewContextTab';
import { ResponsesContextTab } from './ResponsesContextTab';
import { FocusContextTab } from './FocusContextTab';
import { availableExperiences, availableKnowledgeContexts, commonGoals } from './data';

export function InitialInterviewContextModal({ onSubmit }: LiveInterviewModalProps) {
    const [context, setContext] = useState<InitialInterviewContext>({
        interviewType: 'sales',
        targetRole: '',
        targetCompany: '',
        companySizeType: 'mid-market',
        industry: '',
        seniorityLevel: 'manager',
        responseConfidence: 'balanced',
        responseStructure: 'story-driven',
        contextDepth: 10,
        includeMetrics: true,
        goals: [],
        emphasizedExperiences: [],
        specificChallenges: [],
        companyContext: ['sales_methodology', 'career_achievements'],
        roleDescription: '',
    });

    const [activeTab, setActiveTab] = useState('interview');
    const [newExperience, setNewExperience] = useState('');
    const [newChallenge, setNewChallenge] = useState('');
    const [newGoal, setNewGoal] = useState('');

    const addItem = (type: 'experience' | 'challenge' | 'goal', value: string) => {
        if (!value.trim()) return;

        switch (type) {
            case 'experience':
                setContext(prev => ({ ...prev, emphasizedExperiences: [...prev.emphasizedExperiences, value.trim()] }));
                setNewExperience('');
                break;
            case 'challenge':
                setContext(prev => ({ ...prev, specificChallenges: [...prev.specificChallenges, value.trim()] }));
                setNewChallenge('');
                break;
            case 'goal':
                setContext(prev => ({ ...prev, goals: [...prev.goals, value.trim()] }));
                setNewGoal('');
                break;
        }
    };

    const removeItem = (type: 'experience' | 'challenge' | 'goal', index: number) => {
        switch (type) {
            case 'experience':
                setContext(prev => ({ ...prev, emphasizedExperiences: prev.emphasizedExperiences.filter((_, i) => i !== index) }));
                break;
            case 'challenge':
                setContext(prev => ({ ...prev, specificChallenges: prev.specificChallenges.filter((_, i) => i !== index) }));
                break;
            case 'goal':
                setContext(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }));
                break;
        }
    };

    const toggleKnowledgeContext = (contextId: string) => {
        setContext(prev => ({
            ...prev,
            companyContext: prev.companyContext.includes(contextId)
                ? prev.companyContext.filter(id => id !== contextId)
                : [...prev.companyContext, contextId],
        }));
    };

    const isValid = context.targetRole.trim().length > 0;

    const handleSubmit = () => {
        if (isValid) {
            // Auto-generate role description based on context
            const autoRoleDescription = `
You are a live interview response generator for an experienced B2B sales professional interviewing for ${context.targetRole} at ${
                context.targetCompany || 'target companies'
            }.

LIVE INTERVIEW CONTEXT:
- Target Role: ${context.targetRole} (${context.seniorityLevel} level)
- Company: ${context.targetCompany || 'Various target companies'}
- Industry: ${context.industry}
- Company Size: ${context.companySizeType}
- Interview Type: ${context.interviewType}

INTERVIEW GOALS:
${context.goals.length > 0 ? context.goals.map(goal => `- ${goal}`).join('\n') : '- General interview success'}

RESPONSE GENERATION SETTINGS:
- Confidence Level: ${context.responseConfidence}
- Structure: ${context.responseStructure}
- Include Metrics: ${context.includeMetrics ? 'Yes' : 'No'}
- Context Depth: Last ${context.contextDepth} conversation exchanges

CANDIDATE PROFILE (From Knowledge Files):
- 15+ years B2B sales experience in regulated environments
- Proven expertise: Manufacturing, RegTech, Quality Management  
- Key achievements: £3.2M+ deals, MEDDPICC methodology, C-level engagement
- Core strengths: Stakeholder orchestration, procurement navigation, complex sales

${context.emphasizedExperiences.length > 0 ? `EMPHASIZE THESE EXPERIENCES: ${context.emphasizedExperiences.join(', ')}` : ''}
${context.specificChallenges.length > 0 ? `FOCUS ON THESE CHALLENGES: ${context.specificChallenges.join(', ')}` : ''}

PRIORITY KNOWLEDGE AREAS: ${context.companyContext.map(id => availableKnowledgeContexts.find(ctx => ctx.id === id)?.name || id).join(', ')}

INSTRUCTIONS:
When the user provides an interviewer's question or statement, generate a complete, word-perfect response that:
1. Sounds natural when spoken aloud
2. Leverages relevant experience from the knowledge files
3. Matches the ${context.responseConfidence} confidence level
4. Uses ${context.responseStructure} structure
5. Is appropriate for ${context.targetRole} interviews
6. Can be delivered confidently without sounding rehearsed

The response should be the exact words the candidate will speak during the live interview.`;

            onSubmit({
                ...context,
                roleDescription: autoRoleDescription,
            });
        }
    };

    return (
        <Dialog open={true}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5" />
                        🎯 Setup Live Interview Assistant
                    </DialogTitle>
                    <p className="text-sm text-gray-600">Configure your real-time interview response generator</p>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="interview" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Interview Context
                        </TabsTrigger>
                        <TabsTrigger value="responses" className="flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            Response Settings
                        </TabsTrigger>
                        <TabsTrigger value="focus" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Experience Focus
                        </TabsTrigger>
                    </TabsList>

                    <InterviewContextTab context={context} setContext={setContext} />

                    <ResponsesContextTab context={context} setContext={setContext} />

                    <FocusContextTab
                        availableExperiences={availableExperiences}
                        context={context}
                        setContext={setContext}
                        newExperience={newExperience}
                        setNewExperience={setNewExperience}
                        addItem={addItem}
                        newChallenge={newChallenge}
                        setNewChallenge={setNewChallenge}
                        removeItem={removeItem}
                        availableKnowledgeContexts={availableKnowledgeContexts}
                        toggleKnowledgeContext={toggleKnowledgeContext}
                        commonGoals={commonGoals}
                        newGoal={newGoal}
                        setNewGoal={setNewGoal}
                    />
                </Tabs>

                <DialogFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">{isValid ? '✅ Ready for live interview' : '❌ Please enter target role'}</div>
                    <Button onClick={handleSubmit} disabled={!isValid}>
                        🚀 Start Live Interview Assistant
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
