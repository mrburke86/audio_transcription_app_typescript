// /* eslint-disable @typescript-eslint/no-unused-vars */
// // src/components/call-modal/tabs/CallDetailsTab.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { useCallModal } from '../CallModalContext';
// import { CallContext, Participant } from '@/types/callContext';
// import { Plus, Trash2, Users, Phone, Target } from 'lucide-react';
// import { FormField } from '@/components/call-modal/components/FormField';

// export function CallDetailsTab() {
//     const { context, updateField, addParticipant, updateParticipant, removeParticipant } = useCallModal();

//     const getCallTypesByContext = (callContext: string) => {
//         const allCallTypes = {
//             professional: [
//                 { value: 'job-interview', label: '💼 Job Interview' },
//                 { value: 'performance-review', label: '📊 Performance Review' },
//                 { value: 'sales-call', label: '💰 Sales Call' },
//                 { value: 'customer-support', label: '🎧 Customer Support' },
//                 { value: 'client-meeting', label: '🤝 Client Meeting' },
//                 { value: 'team-meeting', label: '👥 Team Meeting' },
//                 { value: 'negotiation', label: '⚖️ Negotiation' },
//                 { value: 'project-discussion', label: '📋 Project Discussion' },
//                 { value: 'hiring-call', label: '🎯 Hiring Call' },
//                 { value: 'termination-call', label: '⚠️ Termination Call' },
//                 { value: 'discipline-call', label: '📢 Discipline Call' },
//             ],
//             personal: [
//                 { value: 'dating-ask', label: '💕 Dating Ask' },
//                 { value: 'relationship-talk', label: '❤️ Relationship Talk' },
//                 { value: 'breakup-call', label: '💔 Breakup Call' },
//                 { value: 'family-call', label: '👨‍👩‍👧‍👦 Family Call' },
//                 { value: 'friend-checkin', label: '👋 Friend Check-in' },
//                 { value: 'conflict-resolution', label: '🤝 Conflict Resolution' },
//                 { value: 'support-call', label: '🤗 Support Call' },
//                 { value: 'celebration-call', label: '🎉 Celebration Call' },
//             ],
//             service: [
//                 { value: 'technical-support', label: '🔧 Technical Support' },
//                 { value: 'medical-consultation', label: '🏥 Medical Consultation' },
//                 { value: 'legal-consultation', label: '⚖️ Legal Consultation' },
//                 { value: 'financial-advice', label: '💳 Financial Advice' },
//                 { value: 'dispute-resolution', label: '🤝 Dispute Resolution' },
//             ],
//             emergency: [{ value: 'emergency-call', label: '🚨 Emergency Call' }],
//         };

//         return allCallTypes[callContext as keyof typeof allCallTypes] || [];
//     };

//     return (
//         <div className="space-y-6">
//             {/* Core Call Identification */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Phone className="h-5 w-5" />
//                         Core Call Information
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <FormField label="Call Context" required>
//                             <Select
//                                 value={context.call_context}
//                                 onValueChange={value =>
//                                     updateField('call_context', value as CallContext['call_context'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select context" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="professional">🏢 Professional</SelectItem>
//                                     <SelectItem value="personal">👥 Personal</SelectItem>
//                                     <SelectItem value="service">🛠️ Service</SelectItem>
//                                     <SelectItem value="emergency">🚨 Emergency</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         <FormField label="Call Type" required>
//                             <Select
//                                 value={context.call_type}
//                                 onValueChange={value => updateField('call_type', value as CallContext['call_type'])}
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select call type" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {getCallTypesByContext(context.call_context).map(type => (
//                                         <SelectItem key={type.value} value={type.value}>
//                                             {type.label}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <FormField label="Urgency Level">
//                             <Select
//                                 value={context.urgency_level}
//                                 onValueChange={value =>
//                                     updateField('urgency_level', value as CallContext['urgency_level'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="low">🟢 Low</SelectItem>
//                                     <SelectItem value="medium">🟡 Medium</SelectItem>
//                                     <SelectItem value="high">🟠 High</SelectItem>
//                                     <SelectItem value="critical">🔴 Critical</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         <FormField label="Sensitivity Level">
//                             <Select
//                                 value={context.sensitivity_level}
//                                 onValueChange={value =>
//                                     updateField('sensitivity_level', value as CallContext['sensitivity_level'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="public">📢 Public</SelectItem>
//                                     <SelectItem value="confidential">🔒 Confidential</SelectItem>
//                                     <SelectItem value="personal">👤 Personal</SelectItem>
//                                     <SelectItem value="highly-sensitive">🔐 Highly Sensitive</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Participants */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Users className="h-5 w-5" />
//                         Participants & Relationships
//                     </CardTitle>
//                     <div className="flex items-center justify-between">
//                         <p className="text-sm text-gray-600">Add details about who you&apos;ll be speaking with</p>
//                         <Button onClick={addParticipant} size="sm" variant="outline">
//                             <Plus className="h-4 w-4 mr-1" />
//                             Add Participant
//                         </Button>
//                     </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     {context.participants?.length === 0 ? (
//                         <div className="text-center py-8 text-gray-500">
//                             <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
//                             <p>No participants added yet</p>
//                             <p className="text-sm">Click &quot;Add Participant&quot; to start</p>
//                         </div>
//                     ) : (
//                         context.participants?.map((participant, index) => (
//                             <Card key={index} className="border border-gray-200">
//                                 <CardHeader className="pb-4">
//                                     <div className="flex items-center justify-between">
//                                         <h4 className="font-medium">Participant {index + 1}</h4>
//                                         <Button
//                                             variant="ghost"
//                                             size="sm"
//                                             onClick={() => removeParticipant(index)}
//                                             className="text-red-500 hover:text-red-700"
//                                         >
//                                             <Trash2 className="h-4 w-4" />
//                                         </Button>
//                                     </div>
//                                 </CardHeader>
//                                 <CardContent className="space-y-4">
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <FormField label="Name (Optional)">
//                                             <Input
//                                                 value={participant.name || ''}
//                                                 onChange={e => updateParticipant(index, 'name', e.target.value)}
//                                                 placeholder="Enter participant's name"
//                                             />
//                                         </FormField>

//                                         <FormField label="Relationship">
//                                             <Select
//                                                 value={participant.relationship}
//                                                 onValueChange={value => updateParticipant(index, 'relationship', value)}
//                                             >
//                                                 <SelectTrigger>
//                                                     <SelectValue />
//                                                 </SelectTrigger>
//                                                 <SelectContent>
//                                                     <SelectItem value="colleague">👨‍💼 Colleague</SelectItem>
//                                                     <SelectItem value="manager">👔 Manager</SelectItem>
//                                                     <SelectItem value="direct-report">📊 Direct Report</SelectItem>
//                                                     <SelectItem value="client">🤝 Client</SelectItem>
//                                                     <SelectItem value="prospect">🎯 Prospect</SelectItem>
//                                                     <SelectItem value="customer">🛒 Customer</SelectItem>
//                                                     <SelectItem value="partner">🤝 Partner</SelectItem>
//                                                     <SelectItem value="friend">👫 Friend</SelectItem>
//                                                     <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
//                                                     <SelectItem value="romantic-interest">
//                                                         💕 Romantic Interest
//                                                     </SelectItem>
//                                                     <SelectItem value="spouse">💍 Spouse</SelectItem>
//                                                     <SelectItem value="stranger">🤷 Stranger</SelectItem>
//                                                     <SelectItem value="authority">⚖️ Authority</SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         </FormField>
//                                     </div>

//                                     <FormField label="Current Sentiment">
//                                         <Select
//                                             value={participant.current_sentiment || 'neutral'}
//                                             onValueChange={value =>
//                                                 updateParticipant(index, 'current_sentiment', value)
//                                             }
//                                         >
//                                             <SelectTrigger>
//                                                 <SelectValue />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="positive">😊 Positive</SelectItem>
//                                                 <SelectItem value="neutral">😐 Neutral</SelectItem>
//                                                 <SelectItem value="frustrated">😤 Frustrated</SelectItem>
//                                                 <SelectItem value="angry">😠 Angry</SelectItem>
//                                                 <SelectItem value="sad">😢 Sad</SelectItem>
//                                                 <SelectItem value="unknown">❓ Unknown</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                     </FormField>
//                                 </CardContent>
//                             </Card>
//                         ))
//                     )}

//                     {/* Power Dynamic */}
//                     {context.participants && context.participants.length > 0 && (
//                         <div className="pt-4 border-t">
//                             <FormField label="Power Dynamic">
//                                 <Select
//                                     value={context.power_dynamic}
//                                     onValueChange={value =>
//                                         updateField('power_dynamic', value as CallContext['power_dynamic'])
//                                     }
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="equal">⚖️ Equal</SelectItem>
//                                         <SelectItem value="you-higher">⬆️ You Higher</SelectItem>
//                                         <SelectItem value="them-higher">⬇️ Them Higher</SelectItem>
//                                         <SelectItem value="neutral">➡️ Neutral</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </FormField>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>

//             {/* Call Tone & Approach */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Target className="h-5 w-5" />
//                         Communication Style
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <FormField label="Desired Tone">
//                             <Select
//                                 value={context.desired_tone}
//                                 onValueChange={value =>
//                                     updateField('desired_tone', value as CallContext['desired_tone'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="professional">💼 Professional</SelectItem>
//                                     <SelectItem value="friendly">😊 Friendly</SelectItem>
//                                     <SelectItem value="empathetic">❤️ Empathetic</SelectItem>
//                                     <SelectItem value="assertive">💪 Assertive</SelectItem>
//                                     <SelectItem value="casual">😎 Casual</SelectItem>
//                                     <SelectItem value="formal">🎩 Formal</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         <FormField label="Communication Approach">
//                             <Select
//                                 value={context.communication_approach}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'communication_approach',
//                                         value as CallContext['communication_approach']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="direct">🎯 Direct</SelectItem>
//                                     <SelectItem value="diplomatic">🤝 Diplomatic</SelectItem>
//                                     <SelectItem value="collaborative">👥 Collaborative</SelectItem>
//                                     <SelectItem value="supportive">🤗 Supportive</SelectItem>
//                                     <SelectItem value="persuasive">💡 Persuasive</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Context Tips */}
//             <Card className="bg-blue-50 border-blue-200">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-blue-800">💡 Context Tips</CardTitle>
//                 </CardHeader>
//                 <CardContent className="text-sm text-blue-700 space-y-2">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <p>
//                                 <strong>Professional calls:</strong> Enable full AI assistance and analytics
//                             </p>
//                             <p>
//                                 <strong>Personal calls:</strong> Consider privacy mode and emotional guidance
//                             </p>
//                         </div>
//                         <div className="space-y-2">
//                             <p>
//                                 <strong>Sensitive topics:</strong> Use higher sensitivity levels for privacy protection
//                             </p>
//                             <p>
//                                 <strong>Emergency calls:</strong> Disable AI suggestions for critical safety situations
//                             </p>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
