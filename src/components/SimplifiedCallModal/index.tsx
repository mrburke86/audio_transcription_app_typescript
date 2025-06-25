// src/components/SimplifiedCallModal.tsx
'use client';
import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui';
import { CallContext, CallObjective, Participant } from '@/types';
import { Database, Phone, Settings, Target } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DynamicList } from './DynamicList';
import { KnowledgeManagementTab } from './KnowledgeManagementTab'; // ✅ NEW IMPORT
import { getSuggestions } from './getSuggestions ';
import { useRouter } from 'next/navigation';

export interface SimplifiedCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (context: CallContext) => void;
}

console.log('🔍 SimplifiedCallModal: Component loading...');

export function SimplifiedCallModal({ isOpen, onClose, onSubmit }: SimplifiedCallModalProps) {
    // ✅ Updated to include knowledge tab
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'basics' | 'strategy' | 'knowledge' | 'settings'>('basics');

    const [context, setContext] = useState<CallContext>({
        call_type: 'job-interview',
        call_context: 'professional',
        urgency_level: 'medium',
        sensitivity_level: 'confidential',
        participants: [],
        objectives: [{ primary_goal: '', success_metrics: [] }],
        key_points: [],
        desired_tone: 'professional',
        response_style: 'structured',
        verbosity: 'moderate',
        communication_approach: 'professional',
        knowledge_search_enabled: true,
        include_emotional_guidance: false,
        include_professional_tips: true,
        target_organization: '',
        target_role: '',
    });

    const suggestions = useMemo(() => {
        const result = getSuggestions(context.call_type);
        console.log('🔍 SimplifiedCallModal: Generated suggestions for', context.call_type, ':', result);
        return result;
    }, [context.call_type]);

    // ✅ Improved updateField with better debugging and memoization
    const updateField = useCallback((field: keyof CallContext, value: CallContext[keyof CallContext]) => {
        console.log('🔥 SimplifiedCallModal: updateField called:', { field, value });

        setContext(prev => {
            const newContext = { ...prev, [field]: value };
            console.log('✅ SimplifiedCallModal: Context updated:', {
                field,
                oldValue: prev[field],
                newValue: value,
                newContextLength: {
                    participants: newContext.participants?.length || 0,
                    key_points: newContext.key_points?.length || 0,
                    objectives: newContext.objectives?.length || 0,
                },
            });
            return newContext;
        });
    }, []);

    // ✅ Improved handlers with better error handling
    const handleAddParticipant = useCallback(
        (value: string) => {
            console.log('🔥 SimplifiedCallModal: handleAddParticipant called with:', value);

            try {
                const validRelationships = [
                    'colleague',
                    'manager',
                    'direct-report',
                    'client',
                    'prospect',
                    'customer',
                    'partner',
                    'friend',
                    'family',
                    'romantic-interest',
                    'spouse',
                    'stranger',
                    'authority',
                ] as const;

                // ✅ Validate and cast the relationship value
                const relationship = validRelationships.includes(value as any)
                    ? (value as Participant['relationship'])
                    : 'colleague'; // Default fallback

                const newParticipant: Participant = { relationship };
                const currentParticipants = context.participants || [];
                const updatedParticipants = [...currentParticipants, newParticipant];

                console.log('📝 Adding participant:', {
                    originalValue: value,
                    usedRelationship: relationship,
                    currentCount: currentParticipants.length,
                    newCount: updatedParticipants.length,
                });

                updateField('participants', updatedParticipants);
            } catch (error) {
                console.error('❌ Error adding participant:', error);
            }
        },
        [context.participants, updateField]
    );

    const handleRemoveParticipant = useCallback(
        (index: number) => {
            console.log('🔥 SimplifiedCallModal: handleRemoveParticipant called with index:', index);

            try {
                const currentParticipants = context.participants || [];

                if (index < 0 || index >= currentParticipants.length) {
                    console.warn('⚠️ Invalid participant index:', index);
                    return;
                }

                const updatedParticipants = currentParticipants.filter((_, i) => i !== index);

                console.log('🗑️ Removing participant:', {
                    index,
                    currentCount: currentParticipants.length,
                    newCount: updatedParticipants.length,
                });

                updateField('participants', updatedParticipants);
            } catch (error) {
                console.error('❌ Error removing participant:', error);
            }
        },
        [context.participants, updateField]
    );

    const handleAddKeyPoint = useCallback(
        (value: string) => {
            console.log('🔥 SimplifiedCallModal: handleAddKeyPoint called with:', value);

            try {
                const currentKeyPoints = context.key_points || [];
                const updatedKeyPoints = [...currentKeyPoints, value];

                console.log('📝 Adding key point:', {
                    value,
                    currentCount: currentKeyPoints.length,
                    newCount: updatedKeyPoints.length,
                });

                updateField('key_points', updatedKeyPoints);
            } catch (error) {
                console.error('❌ Error adding key point:', error);
            }
        },
        [context.key_points, updateField]
    );

    const handleRemoveKeyPoint = useCallback(
        (index: number) => {
            console.log('🔥 SimplifiedCallModal: handleRemoveKeyPoint called with index:', index);

            try {
                const currentKeyPoints = context.key_points || [];

                if (index < 0 || index >= currentKeyPoints.length) {
                    console.warn('⚠️ Invalid key point index:', index);
                    return;
                }

                const updatedKeyPoints = currentKeyPoints.filter((_, i) => i !== index);

                console.log('🗑️ Removing key point:', {
                    index,
                    currentCount: currentKeyPoints.length,
                    newCount: updatedKeyPoints.length,
                });

                updateField('key_points', updatedKeyPoints);
            } catch (error) {
                console.error('❌ Error removing key point:', error);
            }
        },
        [context.key_points, updateField]
    );

    const handleAddObjective = useCallback(
        (value: string) => {
            console.log('🔥 SimplifiedCallModal: handleAddObjective called with:', value);

            try {
                const newObjective: CallObjective = { primary_goal: value, success_metrics: [] };
                const currentObjectives = context.objectives || [];
                const updatedObjectives = [...currentObjectives, newObjective];

                console.log('📝 Adding objective:', {
                    value,
                    currentCount: currentObjectives.length,
                    newCount: updatedObjectives.length,
                });

                updateField('objectives', updatedObjectives);
            } catch (error) {
                console.error('❌ Error adding objective:', error);
            }
        },
        [context.objectives, updateField]
    );

    const handleRemoveObjective = useCallback(
        (index: number) => {
            console.log('🔥 SimplifiedCallModal: handleRemoveObjective called with index:', index);

            try {
                const currentObjectives = context.objectives || [];

                if (index < 0 || index >= currentObjectives.length) {
                    console.warn('⚠️ Invalid objective index:', index);
                    return;
                }

                const updatedObjectives = currentObjectives.filter((_, i) => i !== index);

                console.log('🗑️ Removing objective:', {
                    index,
                    currentCount: currentObjectives.length,
                    newCount: updatedObjectives.length,
                });

                updateField('objectives', updatedObjectives);
            } catch (error) {
                console.error('❌ Error removing objective:', error);
            }
        },
        [context.objectives, updateField]
    );

    // ✅ Debug current state
    console.log('🔍 SimplifiedCallModal: Current context state:', {
        call_type: context.call_type,
        participants: context.participants?.length || 0,
        key_points: context.key_points?.length || 0,
        objectives: context.objectives?.length || 0,
        isOpen,
    });

    // const addParticipant = () => {
    //     const newPart: Participant = { relationship: 'colleague' };
    //     updateField('participants', [...(context.participants || []), newPart]);
    // };

    // const addObjective = () => {
    //     const newObj: CallObjective = { primary_goal: '', success_metrics: [] };
    //     updateField('objectives', [...(context.objectives || []), newObj]);
    // };

    const isValid = () => {
        return (
            !!context.call_type &&
            context.key_points.length > 0 &&
            !!(
                context.objectives &&
                context.objectives.length > 0 &&
                context.objectives.some(o => o.primary_goal.trim().length > 0)
            )
        );
    };

    const handleSubmit = () => {
        console.log('🔍 SimplifiedCallModal: handleSubmit called with context:', {
            call_type: context.call_type,
            participants: context.participants?.length || 0,
            key_points: context.key_points?.length || 0,
            objectives: context.objectives?.length || 0,
            isValid: isValid(),
        });

        if (isValid()) {
            try {
                onSubmit(context);
                onClose();

                console.log('✅ SimplifiedCallModal: Context submitted successfully');
            } catch (error) {
                console.error('❌ SimplifiedCallModal: Context submission failed:', error);

                // ✅ Show user-friendly error message
                alert('Failed to save call context. Please try again or check your inputs.');
            }
        } else {
            console.warn('⚠️ SimplifiedCallModal: Validation failed, cannot submit');
        }
    };

    const handleCancel = () => {
        // As requested, this now navigates to an explanatory page.
        // You should create this page in your application.
        router.push('/explanation');
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'basics', label: '📞 Basics', icon: Phone },
        { id: 'strategy', label: '🎯 Strategy', icon: Target },
        { id: 'knowledge', label: '📚 Knowledge', icon: Database },
        { id: 'settings', label: '⚙️ Settings', icon: Settings },
    ];

    const callTypes = {
        professional: [
            { value: 'job-interview', label: '💼 Job Interview' },
            { value: 'sales-call', label: '💰 Sales Call' },
            { value: 'client-meeting', label: '🤝 Client Meeting' },
            { value: 'team-meeting', label: '👥 Team Meeting' },
            { value: 'hiring-call', label: '📝 Hiring Call' },
            { value: 'termination-call', label: '❌ Termination Call' },
            { value: 'performance-review', label: '📈 Performance Review' },
        ],
        personal: [
            { value: 'relationship-talk', label: '❤️ Relationship Talk' },
            { value: 'family-call', label: '👨‍👩‍👧‍👦 Family Call' },
            { value: 'friend-checkin', label: '👋 Friend Check-in' },
            { value: 'breakup-call', label: '💔 Breakup Call' },
            { value: 'dating-ask', label: '💕 Dating Ask' },
            { value: 'conflict-resolution', label: '⚖️ Conflict Resolution' },
        ],
        service: [
            { value: 'technical-support', label: '🔧 Technical Support' },
            { value: 'customer-support', label: '🎧 Customer Support' },
            { value: 'legal-consultation', label: '⚖️ Legal Consultation' },
            { value: 'financial-advice', label: '💰 Financial Advice' },
        ],
        emergency: [{ value: 'emergency-call', label: '🚨 Emergency Call' }],
    };

    return (
        <Dialog open={isOpen} modal={true}>
            <DialogContent
                className="max-w-4xl lg:max-w-5xl h-[90vh] flex flex-col"
                onPointerDownOutside={e => e.preventDefault()}
                onEscapeKeyDown={e => e.preventDefault()}
            >
                <DialogHeader className="flex items-center justify-between">
                    <DialogTitle>Call Setup</DialogTitle>
                    <DialogDescription>
                        Configure your call context, participants, objectives, and settings before starting your
                        conversation.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-grow flex flex-col min-h-0">
                    <Tabs
                        value={activeTab}
                        onValueChange={val => setActiveTab(val as 'basics' | 'strategy' | 'knowledge' | 'settings')}
                        className="mt-2 flex flex-col h-full"
                    >
                        <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
                            {tabs.map(tab => (
                                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="flex-grow overflow-hidden mt-4">
                            {/* BASICS TAB */}
                            <TabsContent value="basics" className="mt-0 h-full overflow-y-auto pr-2">
                                <div className="space-y-6 pb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Call Context */}
                                        <div className="space-y-1">
                                            <Label htmlFor="call-context">Call Context</Label>
                                            <Select
                                                onValueChange={v => updateField('call_context', v)}
                                                value={context.call_context || ''}
                                            >
                                                <SelectTrigger id="call-context">
                                                    <SelectValue placeholder="Select context..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="professional">🏢 Professional</SelectItem>
                                                    <SelectItem value="personal">👥 Personal</SelectItem>
                                                    <SelectItem value="service">🛠️ Service</SelectItem>
                                                    <SelectItem value="emergency">🚨 Emergency</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Call Type */}
                                        <div className="space-y-1">
                                            <Label htmlFor="call-type">Call Type</Label>
                                            <Select
                                                onValueChange={v => updateField('call_type', v)}
                                                value={context.call_type || ''}
                                            >
                                                <SelectTrigger id="call-type">
                                                    <SelectValue placeholder="Select type..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(
                                                        callTypes[context.call_context as keyof typeof callTypes] || []
                                                    ).map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Urgency */}
                                        <div className="space-y-1">
                                            <Label htmlFor="urgency-level">Urgency</Label>
                                            <Select
                                                onValueChange={v => updateField('urgency_level', v)}
                                                value={context.urgency_level || ''}
                                            >
                                                <SelectTrigger id="urgency-level">
                                                    <SelectValue placeholder="Optional..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">🟢 Low</SelectItem>
                                                    <SelectItem value="medium">🟡 Medium</SelectItem>
                                                    <SelectItem value="high">🟠 High</SelectItem>
                                                    <SelectItem value="critical">🔴 Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Sensitivity */}
                                        <div className="space-y-1">
                                            <Label htmlFor="sensitivity-level">Sensitivity</Label>
                                            <Select
                                                onValueChange={v => updateField('sensitivity_level', v)}
                                                value={context.sensitivity_level || ''}
                                            >
                                                <SelectTrigger id="sensitivity-level">
                                                    <SelectValue placeholder="Optional..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="public">📢 Public</SelectItem>
                                                    <SelectItem value="confidential">🔒 Confidential</SelectItem>
                                                    <SelectItem value="personal">👤 Personal</SelectItem>
                                                    <SelectItem value="highly-sensitive">
                                                        🔐 Highly Sensitive
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Test Button */}
                                        <Button
                                            onClick={() => {
                                                const testSuggestions = getSuggestions('job-interview');
                                                console.log('Test suggestions for job-interview:', testSuggestions);
                                            }}
                                            variant="outline"
                                        >
                                            Test Suggestions
                                        </Button>
                                    </div>

                                    {/* Interview Fields */}
                                    {(context.call_type === 'job-interview' || context.call_type === 'hiring-call') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label htmlFor="target-organization">Target Organization</Label>
                                                <Input
                                                    id="target-organization"
                                                    value={context.target_organization || ''}
                                                    onChange={e => updateField('target_organization', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="target-role">Target Role</Label>
                                                <Input
                                                    id="target-role"
                                                    value={context.target_role || ''}
                                                    onChange={e => updateField('target_role', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Participants Section (keeping existing implementation) */}
                                    <DynamicList<Participant>
                                        label="Participants"
                                        items={context.participants || []}
                                        suggestions={suggestions.participants}
                                        onAddItem={handleAddParticipant}
                                        onRemoveItem={handleRemoveParticipant}
                                        displayField="relationship"
                                        placeholder="Add a participant..."
                                    />

                                    {/* <div className="mt-6 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Participants</Label>
                                <Button
                                    size="sm"
                                    variant="link"
                                    onClick={addParticipant}
                                    className="flex items-center gap-1"
                                >
                                    <Plus className="h-4 w-4" /> Add
                                </Button>
                            </div>
                        </div> */}
                                </div>
                            </TabsContent>

                            {/* STRATEGY TAB */}
                            <TabsContent value="strategy" className="mt-0 h-full overflow-y-auto pr-2">
                                <div className="space-y-6 pb-4">
                                    {/* Key Points */}
                                    <DynamicList<string>
                                        label="Key Points to Cover"
                                        items={context.key_points || []}
                                        suggestions={suggestions.keyPoints}
                                        onAddItem={handleAddKeyPoint}
                                        onRemoveItem={handleRemoveKeyPoint}
                                        placeholder="Add a key point..."
                                    />

                                    {/* Objectives */}

                                    <DynamicList<CallObjective>
                                        label="Objectives"
                                        items={context.objectives || []}
                                        suggestions={suggestions.objectives}
                                        onAddItem={handleAddObjective}
                                        onRemoveItem={handleRemoveObjective}
                                        displayField="primary_goal"
                                        placeholder="Add an objective..."
                                    />

                                    {/* <div className="space-y-2">
                            <Label>
                                Key Points to Cover <span className="text-red-500">*</span>
                            </Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a key discussion point..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const newPoint = (e.target as HTMLInputElement).value.trim();
                                                if (newPoint) {
                                                    updateField('key_points', [
                                                        ...(context.key_points || []),
                                                        newPoint,
                                                    ]);
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button className="border">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(context.key_points || []).map((pt, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
                                        >
                                            <span>{pt}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    const filtered = (context.key_points || []).filter(
                                                        (_, idx2) => idx2 !== i
                                                    );
                                                    updateField('key_points', filtered);
                                                }}
                                                aria-label="Remove key point"
                                            >
                                                <X className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div> */}

                                    {/* <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Objectives</Label>
                                <Button
                                    size="sm"
                                    variant="link"
                                    onClick={addObjective}
                                    className="flex items-center gap-1"
                                >
                                    <Plus className="h-4 w-4" /> Add
                                </Button>
                            </div>
                        </div> */}
                                </div>
                            </TabsContent>

                            {/* KNOWLEDGE TAB */}
                            <TabsContent value="knowledge" className="mt-0 h-full">
                                <KnowledgeManagementTab
                                    callContext={context}
                                    onKnowledgeSearchToggle={enabled =>
                                        updateField('knowledge_search_enabled', enabled)
                                    }
                                />
                            </TabsContent>

                            {/* SETTINGS TAB */}
                            <TabsContent value="settings" className="mt-0 h-full overflow-y-auto pr-2">
                                <div className="space-y-6 pb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Desired Tone */}
                                        <div className="space-y-1">
                                            <Label htmlFor="desired-tone">Tone</Label>
                                            <Select
                                                onValueChange={v => updateField('desired_tone', v)}
                                                value={context.desired_tone || ''}
                                            >
                                                <SelectTrigger id="desired-tone">
                                                    <SelectValue placeholder="Choose tone..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="professional">💼 Professional</SelectItem>
                                                    <SelectItem value="friendly">😊 Friendly</SelectItem>
                                                    <SelectItem value="empathetic">❤️ Empathetic</SelectItem>
                                                    <SelectItem value="assertive">💪 Assertive</SelectItem>
                                                    <SelectItem value="casual">😎 Casual</SelectItem>
                                                    <SelectItem value="formal">🎩 Formal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Response Style */}
                                        <div className="space-y-1">
                                            <Label htmlFor="response-style">Response Style</Label>
                                            <Select
                                                onValueChange={v => updateField('response_style', v)}
                                                value={context.response_style || ''}
                                            >
                                                <SelectTrigger id="response-style">
                                                    <SelectValue placeholder="Choose style..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="structured">📋 Structured</SelectItem>
                                                    <SelectItem value="conversational">💬 Conversational</SelectItem>
                                                    <SelectItem value="bullet-points">• Bullet Points</SelectItem>
                                                    <SelectItem value="script-like">🎭 Script-Like</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Verbosity */}
                                    <div className="space-y-1">
                                        <Label htmlFor="verbosity">Verbosity</Label>
                                        <Select
                                            onValueChange={v => updateField('verbosity', v)}
                                            value={context.verbosity || ''}
                                        >
                                            <SelectTrigger id="verbosity">
                                                <SelectValue placeholder="Choose verbosity..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="brief">⚡ Brief</SelectItem>
                                                <SelectItem value="moderate">📄 Moderate</SelectItem>
                                                <SelectItem value="detailed">📚 Detailed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="emotional-guidance"
                                                checked={context.include_emotional_guidance}
                                                onCheckedChange={checked =>
                                                    updateField('include_emotional_guidance', checked as boolean)
                                                }
                                            />
                                            <div>
                                                <Label htmlFor="emotional-guidance">Emotional Guidance</Label>
                                                <p className="text-sm text-gray-600">Help with tone and empathy</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="professional-tips"
                                                checked={context.include_professional_tips}
                                                onCheckedChange={checked =>
                                                    updateField('include_professional_tips', checked as boolean)
                                                }
                                            />
                                            <div>
                                                <Label htmlFor="professional-tips">Professional Tips</Label>
                                                <p className="text-sm text-gray-600">
                                                    Business etiquette and best practices
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* FOOTER */}
                <div className="flex-shrink-0 mt-auto flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-red-600">
                        {!isValid() && <span>Please provide at least one Participant, Key Point, and Objective.</span>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!isValid()} className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            Start Call
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
