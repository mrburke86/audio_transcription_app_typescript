// // //
// // src/components/SimplifiedCallModal.tsx
// import React, { useState, useCallback } from 'react';
// import { X, Phone, Target, Settings, Plus, Trash2 } from 'lucide-react';
// import { CallContext } from '@/types/callContext';

// interface CallModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSubmit: (context: CallContext) => void;
// }

// // interface Participant {
// //     name?: string;
// //     relationship: string;
// //     current_sentiment?: string;
// // }

// // interface CallObjective {
// //     primary_goal: string;
// //     success_metrics: string[];
// // }

// // Quick input component
// interface Option {
//     value: string;
//     label: string;
// }

// interface QuickInputProps {
//     label: string;
//     value: string;
//     onChange: (field: keyof CallContext, value: unknown) => void;
//     required: boolean;
//     type: string;
//     options: Option[] | null;
// }

// const QuickInput = ({ label, value, onChange, required, type = 'text', options = null }: QuickInputProps) => (
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
//                 {options.map((opt: any) => (
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
// const DynamicList = ({ items, onAdd, onRemove, placeholder }: any) => {
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
//                 {items.map((item: string, idx: number) => (
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

// export function SimplifiedCallModal({ isOpen, onClose, onSubmit }: CallModalProps) {
//     const [activeTab, setActiveTab] = useState('basics');
//     const [context, setContext] = useState<CallContext>({
//         call_type: 'job-interview',
//         call_context: 'professional',
//         urgency_level: 'medium',
//         sensitivity_level: 'confidential',
//         participants: [],
//         objectives: [{ primary_goal: '', success_metrics: [] }],
//         key_points: [],
//         desired_tone: 'professional',
//         // communication_approach: 'collaborative',
//         response_style: 'structured',
//         verbosity: 'moderate',
//         knowledge_search_enabled: true,
//         include_emotional_guidance: false,
//         include_professional_tips: true,
//     });

//     const updateField = useCallback((field: keyof CallContext, value: any) => {
//         setContext(prev => ({ ...prev, [field]: value }));
//     }, []);

//     const addParticipant = () => {
//         updateField('participants', [
//             ...(context.participants || []),
//             { relationship: 'colleague', current_sentiment: 'neutral' },
//         ]);
//     };

//     const addObjective = () => {
//         updateField('objectives', [...(context.objectives || []), { primary_goal: '', success_metrics: [] }]);
//     };

//     const isValid = () => {
//         return context.call_type && context.key_points.length > 0 && context.objectives?.some(o => o.primary_goal);
//     };

//     const handleSubmit = () => {
//         if (isValid()) {
//             onSubmit(context);
//             onClose();
//         }
//     };

//     if (!isOpen) return null;

//     const tabs = [
//         { id: 'basics', label: '📞 Basics', icon: Phone },
//         { id: 'strategy', label: '🎯 Strategy', icon: Target },
//         { id: 'settings', label: '⚙️ Settings', icon: Settings },
//     ];

//     const callTypes = {
//         professional: [
//             { value: 'job-interview', label: '💼 Job Interview' },
//             { value: 'sales-call', label: '💰 Sales Call' },
//             { value: 'client-meeting', label: '🤝 Client Meeting' },
//             { value: 'team-meeting', label: '👥 Team Meeting' },
//         ],
//         personal: [
//             { value: 'relationship-talk', label: '❤️ Relationship Talk' },
//             { value: 'family-call', label: '👨‍👩‍👧‍👦 Family Call' },
//             { value: 'friend-checkin', label: '👋 Friend Check-in' },
//         ],
//         service: [
//             { value: 'technical-support', label: '🔧 Technical Support' },
//             { value: 'customer-support', label: '🎧 Customer Support' },
//         ],
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/50" onClick={onClose} />

//             <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b">
//                     <h2 className="text-xl font-semibold">Call Setup</h2>
//                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>

//                 {/* Tabs */}
//                 <div className="flex border-b">
//                     {tabs.map(tab => (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveTab(tab.id)}
//                             className={`flex-1 py-3 px-4 font-medium transition-colors
//                 ${
//                     activeTab === tab.id
//                         ? 'text-blue-600 border-b-2 border-blue-600'
//                         : 'text-gray-600 hover:text-gray-900'
//                 }`}
//                         >
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Content */}
//                 <div className="p-6 overflow-y-auto max-h-[60vh]">
//                     {activeTab === 'basics' && (
//                         <div className="space-y-6">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <QuickInput
//                                     label="Call Context"
//                                     value={context.call_context}
//                                     onChange={(v: string) => updateField('call_context', v)}
//                                     required
//                                     options={[
//                                         { value: 'professional', label: '🏢 Professional' },
//                                         { value: 'personal', label: '👥 Personal' },
//                                         { value: 'service', label: '🛠️ Service' },
//                                     ]}
//                                 />

//                                 <QuickInput
//                                     label="Call Type"
//                                     value={context.call_type}
//                                     onChange={(v: string) => updateField('call_type', v)}
//                                     required
//                                     options={callTypes[context.call_context as keyof typeof callTypes] || []}
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <QuickInput
//                                     label="Urgency"
//                                     value={context.urgency_level}
//                                     onChange={(v: string) => updateField('urgency_level', v)}
//                                     options={[
//                                         { value: 'low', label: '🟢 Low' },
//                                         { value: 'medium', label: '🟡 Medium' },
//                                         { value: 'high', label: '🟠 High' },
//                                         { value: 'critical', label: '🔴 Critical' },
//                                     ]}
//                                 />

//                                 <QuickInput
//                                     label="Sensitivity"
//                                     value={context.sensitivity_level}
//                                     onChange={(v: string) => updateField('sensitivity_level', v)}
//                                     options={[
//                                         { value: 'public', label: '📢 Public' },
//                                         { value: 'confidential', label: '🔒 Confidential' },
//                                         { value: 'personal', label: '👤 Personal' },
//                                         { value: 'highly-sensitive', label: '🔐 Highly Sensitive' },
//                                     ]}
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <div className="flex justify-between items-center">
//                                     <label className="text-sm font-medium">Participants</label>
//                                     <button
//                                         onClick={addParticipant}
//                                         className="text-blue-600 hover:text-blue-700 text-sm"
//                                     >
//                                         + Add Participant
//                                     </button>
//                                 </div>
//                                 {context.participants?.map((p, idx) => (
//                                     <div key={idx} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
//                                         <input
//                                             placeholder="Name (optional)"
//                                             value={p.name || ''}
//                                             onChange={e => {
//                                                 const updated = [...(context.participants || [])];
//                                                 updated[idx].name = e.target.value;
//                                                 updateField('participants', updated);
//                                             }}
//                                             className="flex-1 px-3 py-2 border rounded"
//                                         />
//                                         <select
//                                             value={p.relationship}
//                                             onChange={e => {
//                                                 const updated = [...(context.participants || [])];
//                                                 updated[idx].relationship = e.target.value;
//                                                 updateField('participants', updated);
//                                             }}
//                                             className="px-3 py-2 border rounded"
//                                         >
//                                             <option value="colleague">Colleague</option>
//                                             <option value="manager">Manager</option>
//                                             <option value="client">Client</option>
//                                             <option value="friend">Friend</option>
//                                             <option value="family">Family</option>
//                                         </select>
//                                         <button
//                                             onClick={() => {
//                                                 const updated = context.participants?.filter((_, i) => i !== idx);
//                                                 updateField('participants', updated);
//                                             }}
//                                             className="p-2 text-red-500 hover:bg-red-50 rounded"
//                                         >
//                                             <Trash2 className="h-4 w-4" />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'strategy' && (
//                         <div className="space-y-6">
//                             <div>
//                                 <label className="text-sm font-medium mb-2 block">
//                                     Key Points to Cover <span className="text-red-500">*</span>
//                                 </label>
//                                 <DynamicList
//                                     items={context.key_points}
//                                     onAdd={(item: string) => updateField('key_points', [...context.key_points, item])}
//                                     onRemove={(idx: number) =>
//                                         updateField(
//                                             'key_points',
//                                             context.key_points.filter((_, i) => i !== idx)
//                                         )
//                                     }
//                                     placeholder="Add a key discussion point..."
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <div className="flex justify-between items-center">
//                                     <label className="text-sm font-medium">Objectives</label>
//                                     <button
//                                         onClick={addObjective}
//                                         className="text-blue-600 hover:text-blue-700 text-sm"
//                                     >
//                                         + Add Objective
//                                     </button>
//                                 </div>
//                                 {context.objectives?.map((obj, idx) => (
//                                     <div key={idx} className="p-4 border rounded-lg space-y-3">
//                                         <div className="flex gap-2">
//                                             <input
//                                                 placeholder="Primary goal..."
//                                                 value={obj.primary_goal}
//                                                 onChange={e => {
//                                                     const updated = [...(context.objectives || [])];
//                                                     updated[idx].primary_goal = e.target.value;
//                                                     updateField('objectives', updated);
//                                                 }}
//                                                 className="flex-1 px-3 py-2 border rounded"
//                                             />
//                                             <button
//                                                 onClick={() => {
//                                                     const updated = context.objectives?.filter((_, i) => i !== idx);
//                                                     updateField('objectives', updated);
//                                                 }}
//                                                 className="p-2 text-red-500 hover:bg-red-50 rounded"
//                                             >
//                                                 <Trash2 className="h-4 w-4" />
//                                             </button>
//                                         </div>
//                                         <DynamicList
//                                             items={obj.success_metrics}
//                                             onAdd={(item: string) => {
//                                                 const updated = [...(context.objectives || [])];
//                                                 updated[idx].success_metrics = [...updated[idx].success_metrics, item];
//                                                 updateField('objectives', updated);
//                                             }}
//                                             onRemove={(metricIdx: number) => {
//                                                 const updated = [...(context.objectives || [])];
//                                                 updated[idx].success_metrics = updated[idx].success_metrics.filter(
//                                                     (_, i) => i !== metricIdx
//                                                 );
//                                                 updateField('objectives', updated);
//                                             }}
//                                             placeholder="Success metric..."
//                                         />
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'settings' && (
//                         <div className="space-y-6">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <QuickInput
//                                     label="Tone"
//                                     value={context.desired_tone}
//                                     onChange={(v: string) => updateField('desired_tone', v)}
//                                     options={[
//                                         { value: 'professional', label: '💼 Professional' },
//                                         { value: 'friendly', label: '😊 Friendly' },
//                                         { value: 'empathetic', label: '❤️ Empathetic' },
//                                         { value: 'assertive', label: '💪 Assertive' },
//                                     ]}
//                                 />

//                                 <QuickInput
//                                     label="Response Style"
//                                     value={context.response_style}
//                                     onChange={(v: string) => updateField('response_style', v)}
//                                     options={[
//                                         { value: 'structured', label: '📋 Structured' },
//                                         { value: 'conversational', label: '💬 Conversational' },
//                                         { value: 'bullet-points', label: '• Bullet Points' },
//                                     ]}
//                                 />
//                             </div>

//                             <QuickInput
//                                 label="Verbosity"
//                                 value={context.verbosity}
//                                 onChange={(v: string) => updateField('verbosity', v)}
//                                 options={[
//                                     { value: 'brief', label: '⚡ Brief' },
//                                     { value: 'moderate', label: '📄 Moderate' },
//                                     { value: 'detailed', label: '📚 Detailed' },
//                                 ]}
//                             />

//                             <div className="space-y-3">
//                                 <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
//                                     <input
//                                         type="checkbox"
//                                         checked={context.knowledge_search_enabled}
//                                         onChange={e => updateField('knowledge_search_enabled', e.target.checked)}
//                                         className="h-4 w-4"
//                                     />
//                                     <div>
//                                         <div className="font-medium">Enable Knowledge Search</div>
//                                         <div className="text-sm text-gray-600">
//                                             Search your documents during the call
//                                         </div>
//                                     </div>
//                                 </label>

//                                 <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
//                                     <input
//                                         type="checkbox"
//                                         checked={context.include_emotional_guidance}
//                                         onChange={e => updateField('include_emotional_guidance', e.target.checked)}
//                                         className="h-4 w-4"
//                                     />
//                                     <div>
//                                         <div className="font-medium">Emotional Guidance</div>
//                                         <div className="text-sm text-gray-600">Help with tone and empathy</div>
//                                     </div>
//                                 </label>

//                                 <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
//                                     <input
//                                         type="checkbox"
//                                         checked={context.include_professional_tips}
//                                         onChange={e => updateField('include_professional_tips', e.target.checked)}
//                                         className="h-4 w-4"
//                                     />
//                                     <div>
//                                         <div className="font-medium">Professional Tips</div>
//                                         <div className="text-sm text-gray-600">
//                                             Business etiquette and best practices
//                                         </div>
//                                     </div>
//                                 </label>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-between items-center p-6 border-t bg-gray-50">
//                     <div className="text-sm text-gray-600">
//                         {!isValid() && (
//                             <span className="text-red-600">
//                                 Please complete required fields: call type, key points, and at least one objective
//                             </span>
//                         )}
//                     </div>

//                     <div className="flex gap-3">
//                         <button
//                             onClick={onClose}
//                             className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             onClick={handleSubmit}
//                             disabled={!isValid()}
//                             className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
//                 ${
//                     isValid()
//                         ? 'bg-blue-600 text-white hover:bg-blue-700'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 }`}
//                         >
//                             <Phone className="h-4 w-4" />
//                             Start Call
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
// // import React, { useState, useCallback } from 'react';
// // import { X, Phone, Target, Brain, Settings, ChevronRight, Plus, Trash2 } from 'lucide-react';

// // // Types (simplified from your CallContext)
// // interface CallModalProps {
// //     isOpen: boolean;
// //     onClose: () => void;
// //     onSubmit: (context: CallContext) => void;
// // }

// // interface Participant {
// //     name?: string;
// //     relationship: string;
// //     current_sentiment?: string;
// // }

// // interface CallObjective {
// //     primary_goal: string;
// //     success_metrics: string[];
// // }

// // interface CallContext {
// //     call_type: string;
// //     call_context: 'professional' | 'personal' | 'service' | 'emergency';
// //     urgency_level: 'low' | 'medium' | 'high' | 'critical';
// //     sensitivity_level: 'public' | 'confidential' | 'personal' | 'highly-sensitive';

// //     participants?: Participant[];
// //     objectives?: CallObjective[];
// //     key_points: string[];

// //     desired_tone: string;
// //     response_style: string;
// //     verbosity: 'brief' | 'moderate' | 'detailed';

// //     knowledge_search_enabled: boolean;
// //     include_emotional_guidance: boolean;
// //     include_professional_tips: boolean;
// // }

// // // Quick input component
// // const QuickInput = ({ label, value, onChange, required, type = 'text', options = null }) => (
// //     <div className="space-y-1">
// //         <label className="text-sm font-medium">
// //             {label} {required && <span className="text-red-500">*</span>}
// //         </label>
// //         {options ? (
// //             <select
// //                 value={value}
// //                 onChange={e => onChange(e.target.value)}
// //                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
// //             >
// //                 <option value="">Select...</option>
// //                 {options.map(opt => (
// //                     <option key={opt.value} value={opt.value}>
// //                         {opt.label}
// //                     </option>
// //                 ))}
// //             </select>
// //         ) : (
// //             <input
// //                 type={type}
// //                 value={value}
// //                 onChange={e => onChange(e.target.value)}
// //                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
// //             />
// //         )}
// //     </div>
// // );

// // // Dynamic list component
// // const DynamicList = ({ items, onAdd, onRemove, placeholder }) => {
// //     const [newItem, setNewItem] = useState('');

// //     const handleAdd = () => {
// //         if (newItem.trim()) {
// //             onAdd(newItem.trim());
// //             setNewItem('');
// //         }
// //     };

// //     return (
// //         <div className="space-y-2">
// //             <div className="flex gap-2">
// //                 <input
// //                     value={newItem}
// //                     onChange={e => setNewItem(e.target.value)}
// //                     onKeyPress={e => e.key === 'Enter' && handleAdd()}
// //                     placeholder={placeholder}
// //                     className="flex-1 px-3 py-2 border rounded-lg"
// //                 />
// //                 <button onClick={handleAdd} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
// //                     <Plus className="h-4 w-4" />
// //                 </button>
// //             </div>
// //             <div className="flex flex-wrap gap-2">
// //                 {items.map((item, idx) => (
// //                     <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
// //                         {item}
// //                         <button onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700">
// //                             <X className="h-3 w-3" />
// //                         </button>
// //                     </span>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // };

// // export default function SimplifiedCallModal({ isOpen, onClose, onSubmit }: CallModalProps) {
// //     const [activeTab, setActiveTab] = useState('basics');
// //     const [context, setContext] = useState<CallContext>({
// //         call_type: '',
// //         call_context: 'professional',
// //         urgency_level: 'medium',
// //         sensitivity_level: 'confidential',
// //         participants: [],
// //         objectives: [{ primary_goal: '', success_metrics: [] }],
// //         key_points: [],
// //         desired_tone: 'professional',
// //         response_style: 'structured',
// //         verbosity: 'moderate',
// //         knowledge_search_enabled: true,
// //         include_emotional_guidance: false,
// //         include_professional_tips: true,
// //     });

// //     const updateField = useCallback((field: keyof CallContext, value: any) => {
// //         setContext(prev => ({ ...prev, [field]: value }));
// //     }, []);

// //     const addParticipant = () => {
// //         updateField('participants', [
// //             ...(context.participants || []),
// //             { relationship: 'colleague', current_sentiment: 'neutral' },
// //         ]);
// //     };

// //     const addObjective = () => {
// //         updateField('objectives', [...(context.objectives || []), { primary_goal: '', success_metrics: [] }]);
// //     };

// //     const isValid = () => {
// //         return context.call_type && context.key_points.length > 0 && context.objectives?.some(o => o.primary_goal);
// //     };

// //     const handleSubmit = () => {
// //         if (isValid()) {
// //             onSubmit(context);
// //             onClose();
// //         }
// //     };

// //     if (!isOpen) return null;

// //     const tabs = [
// //         { id: 'basics', label: '📞 Basics', icon: Phone },
// //         { id: 'strategy', label: '🎯 Strategy', icon: Target },
// //         { id: 'settings', label: '⚙️ Settings', icon: Settings },
// //     ];

// //     const callTypes = {
// //         professional: [
// //             { value: 'job-interview', label: '💼 Job Interview' },
// //             { value: 'sales-call', label: '💰 Sales Call' },
// //             { value: 'client-meeting', label: '🤝 Client Meeting' },
// //             { value: 'team-meeting', label: '👥 Team Meeting' },
// //         ],
// //         personal: [
// //             { value: 'relationship-talk', label: '❤️ Relationship Talk' },
// //             { value: 'family-call', label: '👨‍👩‍👧‍👦 Family Call' },
// //             { value: 'friend-checkin', label: '👋 Friend Check-in' },
// //         ],
// //         service: [
// //             { value: 'technical-support', label: '🔧 Technical Support' },
// //             { value: 'customer-support', label: '🎧 Customer Support' },
// //         ],
// //     };

// //     return (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
// //             <div className="absolute inset-0 bg-black/50" onClick={onClose} />

// //             <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
// //                 {/* Header */}
// //                 <div className="flex items-center justify-between p-6 border-b">
// //                     <h2 className="text-xl font-semibold">Call Setup</h2>
// //                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
// //                         <X className="h-5 w-5" />
// //                     </button>
// //                 </div>

// //                 {/* Tabs */}
// //                 <div className="flex border-b">
// //                     {tabs.map(tab => (
// //                         <button
// //                             key={tab.id}
// //                             onClick={() => setActiveTab(tab.id)}
// //                             className={`flex-1 py-3 px-4 font-medium transition-colors
// //                 ${
// //                     activeTab === tab.id
// //                         ? 'text-blue-600 border-b-2 border-blue-600'
// //                         : 'text-gray-600 hover:text-gray-900'
// //                 }`}
// //                         >
// //                             {tab.label}
// //                         </button>
// //                     ))}
// //                 </div>

// //                 {/* Content */}
// //                 <div className="p-6 overflow-y-auto max-h-[60vh]">
// //                     {activeTab === 'basics' && (
// //                         <div className="space-y-6">
// //                             <div className="grid grid-cols-2 gap-4">
// //                                 <QuickInput
// //                                     label="Call Context"
// //                                     value={context.call_context}
// //                                     onChange={v => updateField('call_context', v)}
// //                                     required
// //                                     options={[
// //                                         { value: 'professional', label: '🏢 Professional' },
// //                                         { value: 'personal', label: '👥 Personal' },
// //                                         { value: 'service', label: '🛠️ Service' },
// //                                     ]}
// //                                 />

// //                                 <QuickInput
// //                                     label="Call Type"
// //                                     value={context.call_type}
// //                                     onChange={v => updateField('call_type', v)}
// //                                     required
// //                                     options={callTypes[context.call_context] || []}
// //                                 />
// //                             </div>

// //                             <div className="grid grid-cols-2 gap-4">
// //                                 <QuickInput
// //                                     label="Urgency"
// //                                     value={context.urgency_level}
// //                                     onChange={v => updateField('urgency_level', v)}
// //                                     options={[
// //                                         { value: 'low', label: '🟢 Low' },
// //                                         { value: 'medium', label: '🟡 Medium' },
// //                                         { value: 'high', label: '🟠 High' },
// //                                         { value: 'critical', label: '🔴 Critical' },
// //                                     ]}
// //                                 />

// //                                 <QuickInput
// //                                     label="Sensitivity"
// //                                     value={context.sensitivity_level}
// //                                     onChange={v => updateField('sensitivity_level', v)}
// //                                     options={[
// //                                         { value: 'public', label: '📢 Public' },
// //                                         { value: 'confidential', label: '🔒 Confidential' },
// //                                         { value: 'personal', label: '👤 Personal' },
// //                                         { value: 'highly-sensitive', label: '🔐 Highly Sensitive' },
// //                                     ]}
// //                                 />
// //                             </div>

// //                             <div className="space-y-2">
// //                                 <div className="flex justify-between items-center">
// //                                     <label className="text-sm font-medium">Participants</label>
// //                                     <button
// //                                         onClick={addParticipant}
// //                                         className="text-blue-600 hover:text-blue-700 text-sm"
// //                                     >
// //                                         + Add Participant
// //                                     </button>
// //                                 </div>
// //                                 {context.participants?.map((p, idx) => (
// //                                     <div key={idx} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
// //                                         <input
// //                                             placeholder="Name (optional)"
// //                                             value={p.name || ''}
// //                                             onChange={e => {
// //                                                 const updated = [...(context.participants || [])];
// //                                                 updated[idx].name = e.target.value;
// //                                                 updateField('participants', updated);
// //                                             }}
// //                                             className="flex-1 px-3 py-2 border rounded"
// //                                         />
// //                                         <select
// //                                             value={p.relationship}
// //                                             onChange={e => {
// //                                                 const updated = [...(context.participants || [])];
// //                                                 updated[idx].relationship = e.target.value;
// //                                                 updateField('participants', updated);
// //                                             }}
// //                                             className="px-3 py-2 border rounded"
// //                                         >
// //                                             <option value="colleague">Colleague</option>
// //                                             <option value="manager">Manager</option>
// //                                             <option value="client">Client</option>
// //                                             <option value="friend">Friend</option>
// //                                             <option value="family">Family</option>
// //                                         </select>
// //                                         <button
// //                                             onClick={() => {
// //                                                 const updated = context.participants?.filter((_, i) => i !== idx);
// //                                                 updateField('participants', updated);
// //                                             }}
// //                                             className="p-2 text-red-500 hover:bg-red-50 rounded"
// //                                         >
// //                                             <Trash2 className="h-4 w-4" />
// //                                         </button>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </div>
// //                     )}

// //                     {activeTab === 'strategy' && (
// //                         <div className="space-y-6">
// //                             <div>
// //                                 <label className="text-sm font-medium mb-2 block">
// //                                     Key Points to Cover <span className="text-red-500">*</span>
// //                                 </label>
// //                                 <DynamicList
// //                                     items={context.key_points}
// //                                     onAdd={item => updateField('key_points', [...context.key_points, item])}
// //                                     onRemove={idx =>
// //                                         updateField(
// //                                             'key_points',
// //                                             context.key_points.filter((_, i) => i !== idx)
// //                                         )
// //                                     }
// //                                     placeholder="Add a key discussion point..."
// //                                 />
// //                             </div>

// //                             <div className="space-y-2">
// //                                 <div className="flex justify-between items-center">
// //                                     <label className="text-sm font-medium">Objectives</label>
// //                                     <button
// //                                         onClick={addObjective}
// //                                         className="text-blue-600 hover:text-blue-700 text-sm"
// //                                     >
// //                                         + Add Objective
// //                                     </button>
// //                                 </div>
// //                                 {context.objectives?.map((obj, idx) => (
// //                                     <div key={idx} className="p-4 border rounded-lg space-y-3">
// //                                         <div className="flex gap-2">
// //                                             <input
// //                                                 placeholder="Primary goal..."
// //                                                 value={obj.primary_goal}
// //                                                 onChange={e => {
// //                                                     const updated = [...(context.objectives || [])];
// //                                                     updated[idx].primary_goal = e.target.value;
// //                                                     updateField('objectives', updated);
// //                                                 }}
// //                                                 className="flex-1 px-3 py-2 border rounded"
// //                                             />
// //                                             <button
// //                                                 onClick={() => {
// //                                                     const updated = context.objectives?.filter((_, i) => i !== idx);
// //                                                     updateField('objectives', updated);
// //                                                 }}
// //                                                 className="p-2 text-red-500 hover:bg-red-50 rounded"
// //                                             >
// //                                                 <Trash2 className="h-4 w-4" />
// //                                             </button>
// //                                         </div>
// //                                         <DynamicList
// //                                             items={obj.success_metrics}
// //                                             onAdd={item => {
// //                                                 const updated = [...(context.objectives || [])];
// //                                                 updated[idx].success_metrics = [...updated[idx].success_metrics, item];
// //                                                 updateField('objectives', updated);
// //                                             }}
// //                                             onRemove={metricIdx => {
// //                                                 const updated = [...(context.objectives || [])];
// //                                                 updated[idx].success_metrics = updated[idx].success_metrics.filter(
// //                                                     (_, i) => i !== metricIdx
// //                                                 );
// //                                                 updateField('objectives', updated);
// //                                             }}
// //                                             placeholder="Success metric..."
// //                                         />
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </div>
// //                     )}

// //                     {activeTab === 'settings' && (
// //                         <div className="space-y-6">
// //                             <div className="grid grid-cols-2 gap-4">
// //                                 <QuickInput
// //                                     label="Tone"
// //                                     value={context.desired_tone}
// //                                     onChange={v => updateField('desired_tone', v)}
// //                                     options={[
// //                                         { value: 'professional', label: '💼 Professional' },
// //                                         { value: 'friendly', label: '😊 Friendly' },
// //                                         { value: 'empathetic', label: '❤️ Empathetic' },
// //                                         { value: 'assertive', label: '💪 Assertive' },
// //                                     ]}
// //                                 />

// //                                 <QuickInput
// //                                     label="Response Style"
// //                                     value={context.response_style}
// //                                     onChange={v => updateField('response_style', v)}
// //                                     options={[
// //                                         { value: 'structured', label: '📋 Structured' },
// //                                         { value: 'conversational', label: '💬 Conversational' },
// //                                         { value: 'bullet-points', label: '• Bullet Points' },
// //                                     ]}
// //                                 />
// //                             </div>

// //                             <QuickInput
// //                                 label="Verbosity"
// //                                 value={context.verbosity}
// //                                 onChange={v => updateField('verbosity', v)}
// //                                 options={[
// //                                     { value: 'brief', label: '⚡ Brief' },
// //                                     { value: 'moderate', label: '📄 Moderate' },
// //                                     { value: 'detailed', label: '📚 Detailed' },
// //                                 ]}
// //                             />

// //                             <div className="space-y-3">
// //                                 <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
// //                                     <input
// //                                         type="checkbox"
// //                                         checked={context.knowledge_search_enabled}
// //                                         onChange={e => updateField('knowledge_search_enabled', e.target.checked)}
// //                                         className="h-4 w-4"
// //                                     />
// //                                     <div>
// //                                         <div className="font-medium">Enable Knowledge Search</div>
// //                                         <div className="text-sm text-gray-600">
// //                                             Search your documents during the call
// //                                         </div>
// //                                     </div>
// //                                 </label>

// //                                 <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
// //                                     <input
// //                                         type="checkbox"
// //                                         checked={context.include_emotional_guidance}
// //                                         onChange={e => updateField('include_emotional_guidance', e.target.checked)}
// //                                         className="h-4 w-4"
// //                                     />
// //                                     <div>
// //                                         <div className="font-medium">Emotional Guidance</div>
// //                                         <div className="text-sm text-gray-600">Help with tone and empathy</div>
// //                                     </div>
// //                                 </label>

// //                                 <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
// //                                     <input
// //                                         type="checkbox"
// //                                         checked={context.include_professional_tips}
// //                                         onChange={e => updateField('include_professional_tips', e.target.checked)}
// //                                         className="h-4 w-4"
// //                                     />
// //                                     <div>
// //                                         <div className="font-medium">Professional Tips</div>
// //                                         <div className="text-sm text-gray-600">
// //                                             Business etiquette and best practices
// //                                         </div>
// //                                     </div>
// //                                 </label>
// //                             </div>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Footer */}
// //                 <div className="flex justify-between items-center p-6 border-t bg-gray-50">
// //                     <div className="text-sm text-gray-600">
// //                         {!isValid() && (
// //                             <span className="text-red-600">
// //                                 Please complete required fields: call type, key points, and at least one objective
// //                             </span>
// //                         )}
// //                     </div>

// //                     <div className="flex gap-3">
// //                         <button
// //                             onClick={onClose}
// //                             className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
// //                         >
// //                             Cancel
// //                         </button>
// //                         <button
// //                             onClick={handleSubmit}
// //                             disabled={!isValid()}
// //                             className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
// //                 ${
// //                     isValid()
// //                         ? 'bg-blue-600 text-white hover:bg-blue-700'
// //                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
// //                 }`}
// //                         >
// //                             <Phone className="h-4 w-4" />
// //                             Start Call
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }
