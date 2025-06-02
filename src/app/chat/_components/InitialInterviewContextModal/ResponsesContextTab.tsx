// //
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { TabsContent } from '@/components/ui/tabs';
// import { InitialInterviewContext } from '@/types';
// import React from 'react';

// interface ResponsesContextTabProps {
//     context: InitialInterviewContext;
//     setContext: React.Dispatch<React.SetStateAction<InitialInterviewContext>>;
// }

// export function ResponsesContextTab({ context, setContext }: ResponsesContextTabProps) {
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
//                             onValueChange={(value: 'conservative' | 'balanced' | 'confident') =>
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
//                             {context.responseConfidence === 'conservative' &&
//                                 'Generates safe, proven responses that emphasize your strengths without risk'}
//                             {context.responseConfidence === 'balanced' &&
//                                 'Balanced responses that show authenticity and learning from challenges'}
//                             {context.responseConfidence === 'confident' &&
//                                 'Confident responses that challenge assumptions and demonstrate executive presence'}
//                         </p>
//                     </div>

//                     <div>
//                         <label className="text-sm font-medium">Response Structure</label>
//                         <Select
//                             value={context.responseStructure}
//                             onValueChange={(value: 'story-driven' | 'data-driven' | 'hybrid') =>
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
//                                 'Rich narrative examples using STAR method with situational context and outcomes'}
//                             {context.responseStructure === 'data-driven' &&
//                                 'Responses focused on specific metrics, KPIs, percentages, and quantified achievements'}
//                             {context.responseStructure === 'hybrid' &&
//                                 'Compelling stories enhanced with specific data points and measurable results'}
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
