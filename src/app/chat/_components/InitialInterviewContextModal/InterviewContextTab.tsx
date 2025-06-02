// //
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { TabsContent } from '@/components/ui/tabs';
// import { InitialInterviewContext } from '@/types';
// import React from 'react';
// import { YOUR_PROFILE } from './data';

// interface InterviewContextTabProps {
//     context: InitialInterviewContext;
//     setContext: React.Dispatch<React.SetStateAction<InitialInterviewContext>>;
// }

// export function InterviewContextTab({ context, setContext }: InterviewContextTabProps) {
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
//                                 onValueChange={(value: 'scaleup' | 'mid-market' | 'enterprise' | 'public') =>
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
