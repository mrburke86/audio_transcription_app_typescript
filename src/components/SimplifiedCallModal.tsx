// src/components/SimplifiedCallModal.tsx
import {
    Button,
    Checkbox,
    Dialog,
    DialogClose,
    DialogContent,
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
import { Database, Phone, Plus, Settings, Target, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { KnowledgeManagementTab } from './KnowledgeManagementTab'; // ✅ NEW IMPORT

export interface SimplifiedCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (context: CallContext) => void;
}

export default function SimplifiedCallModal({ isOpen, onClose, onSubmit }: SimplifiedCallModalProps) {
    // ✅ Updated to include knowledge tab
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

    const updateField = useCallback((field: keyof CallContext, value: CallContext[keyof CallContext]) => {
        setContext(prev => ({ ...prev, [field]: value }));
    }, []);

    const addParticipant = () => {
        const newPart: Participant = { relationship: 'colleague' };
        updateField('participants', [...(context.participants || []), newPart]);
    };

    const addObjective = () => {
        const newObj: CallObjective = { primary_goal: '', success_metrics: [] };
        updateField('objectives', [...(context.objectives || []), newObj]);
    };

    const isValid = () => {
        return (
            !!context.call_type &&
            context.key_points.length > 0 &&
            !!(context.objectives && context.objectives.some(o => o.primary_goal.trim().length > 0))
        );
    };

    const handleSubmit = () => {
        if (isValid()) {
            onSubmit(context);
            onClose();
        }
    };

    if (!isOpen) return null;

    // ✅ Updated tabs array to include knowledge tab
    const tabs = [
        { id: 'basics', label: '📞 Basics', icon: Phone },
        { id: 'strategy', label: '🎯 Strategy', icon: Target },
        { id: 'knowledge', label: '📚 Knowledge', icon: Database }, // ✅ NEW TAB
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
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex items-center justify-between">
                    <DialogTitle>Call Setup</DialogTitle>
                    <DialogClose asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Close">
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                {/* ✅ Updated Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={val => setActiveTab(val as 'basics' | 'strategy' | 'knowledge' | 'settings')}
                    className="mt-2"
                >
                    <TabsList className="grid w-full grid-cols-4">
                        {' '}
                        {/* ✅ Updated to 4 columns */}
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* BASICS TAB */}
                    <TabsContent value="basics" className="mt-6 space-y-6">
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
                                        {(callTypes[context.call_context as keyof typeof callTypes] || []).map(opt => (
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
                                        <SelectItem value="highly-sensitive">🔐 Highly Sensitive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                        <div className="mt-6 space-y-2">
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
                            {/* Participants implementation remains the same */}
                        </div>
                    </TabsContent>

                    {/* STRATEGY TAB */}
                    <TabsContent value="strategy" className="mt-6 space-y-6">
                        {/* Key Points */}
                        <div className="space-y-2">
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
                        </div>

                        {/* Objectives section (keeping existing implementation) */}
                        <div className="space-y-2">
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
                            {/* Objectives implementation remains the same */}
                        </div>
                    </TabsContent>

                    {/* ✅ NEW KNOWLEDGE TAB */}
                    <TabsContent value="knowledge" className="mt-6">
                        <KnowledgeManagementTab
                            callContext={context}
                            onKnowledgeSearchToggle={enabled => updateField('knowledge_search_enabled', enabled)}
                        />
                    </TabsContent>

                    {/* SETTINGS TAB */}
                    <TabsContent value="settings" className="mt-6 space-y-6">
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
                            <Select onValueChange={v => updateField('verbosity', v)} value={context.verbosity || ''}>
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
                                    <p className="text-sm text-gray-600">Business etiquette and best practices</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* FOOTER */}
                <div className="mt-6 flex items-center justify-between border-t px-4 py-3 bg-gray-50">
                    <div className="text-sm text-red-600">
                        {!isValid() && (
                            <span>
                                Please complete required fields: call type, key points, and at least one objective
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
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
