// src\components\SimplifiedCallModal.tsx
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
import { Phone, Plus, Settings, Target, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';

// -----------------------------------------------------------------------------
// Props interface for the new modal
// -----------------------------------------------------------------------------
export interface SimplifiedCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (context: CallContext) => void;
}

// // Quick input component
// const QuickInput = ({ label, value, onChange, required, type = 'text', options = null }) => (
//     <div className="space-y-1">
//         <label className="text-sm font-medium">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         {options ? (
//             <select
//                 value={value}
//                 onChange={e => onChange(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             >
//                 <option value="">Select...</option>
//                 {options.map(opt => (
//                     <option key={opt.value} value={opt.value}>
//                         {opt.label}
//                     </option>
//                 ))}
//             </select>
//         ) : (
//             <input
//                 type={type}
//                 value={value}
//                 onChange={e => onChange(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//         )}
//     </div>
// );

// // Dynamic list component
// const DynamicList = ({ items, onAdd, onRemove, placeholder }) => {
//     const [newItem, setNewItem] = useState('');

//     const handleAdd = () => {
//         if (newItem.trim()) {
//             onAdd(newItem.trim());
//             setNewItem('');
//         }
//     };

//     return (
//         <div className="space-y-2">
//             <div className="flex gap-2">
//                 <input
//                     value={newItem}
//                     onChange={e => setNewItem(e.target.value)}
//                     onKeyPress={e => e.key === 'Enter' && handleAdd()}
//                     placeholder={placeholder}
//                     className="flex-1 px-3 py-2 border rounded-lg"
//                 />
//                 <button onClick={handleAdd} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
//                     <Plus className="h-4 w-4" />
//                 </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//                 {items.map((item, idx) => (
//                     <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
//                         {item}
//                         <button onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700">
//                             <X className="h-3 w-3" />
//                         </button>
//                     </span>
//                 ))}
//             </div>
//         </div>
//     );
// };

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------
export default function SimplifiedCallModal({ isOpen, onClose, onSubmit }: SimplifiedCallModalProps) {
    const [activeTab, setActiveTab] = useState<'basics' | 'strategy' | 'settings'>('basics');

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

    const updateField = useCallback((field: keyof CallContext, value: unknown) => {
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

    const tabs = [
        { id: 'basics', label: '📞 Basics', icon: Phone },
        { id: 'strategy', label: '🎯 Strategy', icon: Target },
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
            <DialogContent className="max-w-3xl lg:max-w-4xl">
                <DialogHeader className="flex items-center justify-between">
                    <DialogTitle>Call Setup</DialogTitle>
                    <DialogClose asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Close">
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={val => setActiveTab(val as 'basics' | 'strategy' | 'settings')}
                    className="mt-2"
                >
                    {' '}
                    <TabsList>
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {/* ------------------------------ */}
                    {/* BASICS TAB */}
                    {/* ------------------------------ */}
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
                                        {(callTypes[context.call_context] || []).map(opt => (
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

                        {/* Participants */}
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
                            {(context.participants || []).map((p, idx) => (
                                <div key={idx} className="flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-md">
                                    <Input
                                        placeholder="Name (optional)"
                                        value={p.name || ''}
                                        onChange={e => {
                                            const updated = [...(context.participants || [])];
                                            updated[idx] = { ...updated[idx], name: e.target.value };
                                            updateField('participants', updated);
                                        }}
                                        className="flex-1"
                                    />

                                    <Select
                                        onValueChange={v => {
                                            const updated = [...(context.participants || [])];
                                            updated[idx] = {
                                                ...updated[idx],
                                                relationship: v as Participant['relationship'],
                                            };
                                            updateField('participants', updated);
                                        }}
                                        value={p.relationship || 'colleague'}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Relation..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="colleague">Colleague</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="direct-report">Direct-Report</SelectItem>
                                            <SelectItem value="client">Client</SelectItem>
                                            <SelectItem value="prospect">Prospect</SelectItem>
                                            <SelectItem value="customer">Customer</SelectItem>
                                            <SelectItem value="partner">Partner</SelectItem>
                                            <SelectItem value="friend">Friend</SelectItem>
                                            <SelectItem value="family">Family</SelectItem>
                                            <SelectItem value="romantic-interest">Romantic-Interest</SelectItem>
                                            <SelectItem value="spouse">Spouse</SelectItem>
                                            <SelectItem value="stranger">Stranger</SelectItem>
                                            <SelectItem value="authority">Authority</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const updated = (context.participants || []).filter((_, i) => i !== idx);
                                            updateField('participants', updated);
                                        }}
                                        aria-label="Remove participant"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    {/* ------------------------------ */}
                    {/* STRATEGY TAB */}
                    {/* ------------------------------ */}
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
                                    <Button
                                        onClick={() => {
                                            // Optionally wire up a ref to add outside of Enter key
                                        }}
                                        className="border"
                                    >
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

                        {/* Objectives */}
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
                            {(context.objectives || []).map((obj, objIdx) => (
                                <div key={objIdx} className="space-y-3 rounded-md border p-4">
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Primary goal..."
                                            value={obj.primary_goal}
                                            onChange={e => {
                                                const updated = [...(context.objectives || [])];
                                                updated[objIdx] = {
                                                    ...updated[objIdx],
                                                    primary_goal: e.target.value,
                                                };
                                                updateField('objectives', updated);
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                const filtered = (context.objectives || []).filter(
                                                    (_, i) => i !== objIdx
                                                );
                                                updateField('objectives', filtered);
                                            }}
                                            aria-label="Remove objective"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>

                                    {/* Success Metrics */}
                                    <div className="space-y-1">
                                        <Label>Success Metrics</Label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Success metric..."
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const metric = (e.target as HTMLInputElement).value.trim();
                                                            if (metric) {
                                                                const updated = [...(context.objectives || [])];
                                                                updated[objIdx] = {
                                                                    ...updated[objIdx],
                                                                    success_metrics: [
                                                                        ...(updated[objIdx].success_metrics || []),
                                                                        metric,
                                                                    ],
                                                                };
                                                                updateField('objectives', updated);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    //// Optionally wire up additional add logic
                                                    className="border"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(obj.success_metrics || []).map((sm, smIdx) => (
                                                    <div
                                                        key={smIdx}
                                                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
                                                    >
                                                        <span>{sm}</span>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                const updated = [...(context.objectives || [])];
                                                                updated[objIdx] = {
                                                                    ...updated[objIdx],
                                                                    success_metrics: updated[
                                                                        objIdx
                                                                    ].success_metrics.filter((_, i) => i !== smIdx),
                                                                };
                                                                updateField('objectives', updated);
                                                            }}
                                                            aria-label="Remove metric"
                                                        >
                                                            <X className="h-3 w-3 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    {/* ------------------------------ */}
                    {/* SETTINGS TAB */}
                    {/* ------------------------------ */}
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
                                    id="knowledge-search"
                                    checked={context.knowledge_search_enabled}
                                    onCheckedChange={checked =>
                                        updateField('knowledge_search_enabled', checked as boolean)
                                    }
                                />
                                <div>
                                    <Label htmlFor="knowledge-search">Enable Knowledge Search</Label>
                                    <p className="text-sm text-gray-600">Search your documents during the call</p>
                                </div>
                            </div>
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

                {/* ------------------------------ */}
                {/* FOOTER */}
                {/* ------------------------------ */}
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
