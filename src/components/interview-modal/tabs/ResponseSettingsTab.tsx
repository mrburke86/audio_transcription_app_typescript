// // src/components/interview-modal/tabs/ResponseSettingsTab.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Slider } from '@/components/ui/slider';
// import { FormField } from '../components/FormField';
// import { useInterviewModal } from '../InterviewModalContext';
// import { InitialInterviewContext } from '@/types';

// export function ResponseSettingsTab() {
//     const { context, updateField } = useInterviewModal();

//     return (
//         <div className="space-y-6">
//             {/* Core Response Parameters */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">⚙️ Core Response Parameters</CardTitle>
//                     <p className="text-sm text-gray-600">Basic settings that control how responses are generated</p>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                     <div className="grid grid-cols-3 gap-4">
//                         {/* Response Confidence */}
//                         <FormField label="Response Confidence">
//                             <Select
//                                 value={context.responseConfidence}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'responseConfidence',
//                                         value as InitialInterviewContext['responseConfidence']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="conservative">Conservative</SelectItem>
//                                     <SelectItem value="balanced">Balanced</SelectItem>
//                                     <SelectItem value="confident">Confident</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         {/* Response Structure */}
//                         <FormField label="Response Structure">
//                             <Select
//                                 value={context.responseStructure}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'responseStructure',
//                                         value as InitialInterviewContext['responseStructure']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="STAR-method">STAR Method</SelectItem>
//                                     <SelectItem value="problem-solution-impact">Problem-Solution-Impact</SelectItem>
//                                     <SelectItem value="context-action-result">Context-Action-Result</SelectItem>
//                                     <SelectItem value="situation-challenge-solution">
//                                         Situation-Challenge-Solution
//                                     </SelectItem>
//                                     <SelectItem value="data-story-insight">Data-Story-Insight</SelectItem>
//                                     <SelectItem value="flexible-adaptive">Flexible-Adaptive</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         {/* Response Verbosity */}
//                         <FormField label="Response Verbosity">
//                             <Select
//                                 value={context.responseVerbosity}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'responseVerbosity',
//                                         value as InitialInterviewContext['responseVerbosity']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="concise">Concise</SelectItem>
//                                     <SelectItem value="detailed">Detailed</SelectItem>
//                                     <SelectItem value="auto">Auto</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>

//                     <div className="grid grid-cols-2 gap-6">
//                         {/* Context Depth */}
//                         <div className="space-y-3">
//                             <FormField label={`Context Depth: ${context.contextDepth}`}>
//                                 <Slider
//                                     value={[context.contextDepth]}
//                                     onValueChange={([value]) => updateField('contextDepth', value)}
//                                     max={20}
//                                     min={1}
//                                     step={1}
//                                     className="w-full"
//                                 />
//                             </FormField>
//                             <p className="text-xs text-gray-500">How much background context to include (1-20)</p>
//                         </div>

//                         {/* Include Metrics Toggle */}
//                         <div className="flex items-center justify-between p-4 border rounded-lg">
//                             <div>
//                                 <label className="text-sm font-medium">Include Metrics</label>
//                                 <p className="text-xs text-gray-500">Add quantified achievements to responses</p>
//                             </div>
//                             <Switch
//                                 checked={context.includeMetrics}
//                                 onCheckedChange={checked => updateField('includeMetrics', checked)}
//                             />
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Advanced Response Personalization */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">🎨 Advanced Response Personalization</CardTitle>
//                     <p className="text-sm text-gray-600">Fine-tune response style and communication approach</p>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         {/* Response Personality */}
//                         <FormField label="Response Personality">
//                             <Select
//                                 value={context.responsePersonality}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'responsePersonality',
//                                         value as InitialInterviewContext['responsePersonality']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select personality" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="executive">Executive</SelectItem>
//                                     <SelectItem value="collaborative">Collaborative</SelectItem>
//                                     <SelectItem value="analytical">Analytical</SelectItem>
//                                     <SelectItem value="consultative">Consultative</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         {/* Industry Language */}
//                         <FormField label="Industry Language">
//                             <Select
//                                 value={context.industryLanguage}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'industryLanguage',
//                                         value as InitialInterviewContext['industryLanguage']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select language style" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="technical">Technical</SelectItem>
//                                     <SelectItem value="business">Business</SelectItem>
//                                     <SelectItem value="balanced">Balanced</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         {/* Story Format */}
//                         <FormField label="Story Format">
//                             <Select
//                                 value={context.storyFormat}
//                                 onValueChange={value =>
//                                     updateField('storyFormat', value as InitialInterviewContext['storyFormat'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select story format" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="STAR">STAR</SelectItem>
//                                     <SelectItem value="CAR">CAR (Context-Action-Result)</SelectItem>
//                                     <SelectItem value="problem-solution-result">Problem-Solution-Result</SelectItem>
//                                     <SelectItem value="flexible">Flexible</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         {/* Metrics Emphasis */}
//                         <FormField label="Metrics Emphasis">
//                             <Select
//                                 value={context.metricsEmphasis}
//                                 onValueChange={value =>
//                                     updateField('metricsEmphasis', value as InitialInterviewContext['metricsEmphasis'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select metrics focus" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="percentage-focus">Percentage Focus</SelectItem>
//                                     <SelectItem value="dollar-focus">Dollar Focus</SelectItem>
//                                     <SelectItem value="scale-focus">Scale Focus</SelectItem>
//                                     <SelectItem value="balanced">Balanced</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Quick Tips */}
//             <Card className="bg-blue-50 border-blue-200">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-blue-800">💡 Quick Tips</CardTitle>
//                 </CardHeader>
//                 <CardContent className="text-sm text-blue-700 space-y-2">
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <p>
//                                 <strong>For Technical Roles:</strong> Use analytical personality with technical language
//                             </p>
//                             <p>
//                                 <strong>For Sales Roles:</strong> Use collaborative personality with business language
//                             </p>
//                         </div>
//                         <div>
//                             <p>
//                                 <strong>For Leadership Roles:</strong> Use executive personality with balanced language
//                             </p>
//                             <p>
//                                 <strong>For Consulting:</strong> Use consultative personality with problem-solution
//                                 format
//                             </p>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
