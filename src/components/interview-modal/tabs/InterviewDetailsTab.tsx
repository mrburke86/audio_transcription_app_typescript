// // src/components/interview-modal/tabs/InterviewDetailsTab.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { FormField } from '../components/FormField';
// import { useInterviewModal } from '../InterviewModalContext';
// import { InitialInterviewContext } from '@/types';

// export function InterviewDetailsTab() {
//     const { context, updateField } = useInterviewModal();

//     return (
//         <div className="space-y-6">
//             {/* Core Interview Information */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">🎯 Core Interview Information</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <FormField label="Interview Type" required>
//                             <Select
//                                 value={context.interviewType}
//                                 onValueChange={value =>
//                                     updateField('interviewType', value as InitialInterviewContext['interviewType'])
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
//                         </FormField>

//                         <FormField label="Target Company">
//                             <Input
//                                 value={context.targetCompany}
//                                 onChange={e => updateField('targetCompany', e.target.value)}
//                                 placeholder="e.g., Salesforce, Microsoft, Apple"
//                             />
//                         </FormField>
//                     </div>

//                     <FormField label="Target Role" required>
//                         <Input
//                             value={context.targetRole}
//                             onChange={e => updateField('targetRole', e.target.value)}
//                             placeholder="e.g., VP of Sales - Enterprise, Senior Sales Director, Product Manager"
//                         />
//                     </FormField>

//                     <FormField label="Role Description">
//                         <Textarea
//                             value={context.roleDescription}
//                             onChange={e => updateField('roleDescription', e.target.value)}
//                             placeholder="Brief description of the role, key responsibilities, or any specific requirements mentioned..."
//                             rows={3}
//                         />
//                     </FormField>
//                 </CardContent>
//             </Card>

//             {/* Company & Industry Context */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">🏢 Company & Industry Context</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <FormField label="Company Size">
//                             <Select
//                                 value={context.companySizeType}
//                                 onValueChange={value =>
//                                     updateField('companySizeType', value as InitialInterviewContext['companySizeType'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="startup">Startup (&lt;100)</SelectItem>
//                                     <SelectItem value="scaleup">Scale-up (100-1K)</SelectItem>
//                                     <SelectItem value="mid-market">Mid-market (1K-10K)</SelectItem>
//                                     <SelectItem value="large-enterprise">Large Enterprise (10K-50K)</SelectItem>
//                                     <SelectItem value="mega-corp">Mega Corp (50K+)</SelectItem>
//                                     <SelectItem value="public-company">Public Company</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         <FormField label="Industry Vertical">
//                             <Select
//                                 value={context.industryVertical}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'industryVertical',
//                                         value as InitialInterviewContext['industryVertical']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select industry" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="saas-software">SaaS/Software</SelectItem>
//                                     <SelectItem value="enterprise-technology">Enterprise Technology</SelectItem>
//                                     <SelectItem value="financial-services">Financial Services</SelectItem>
//                                     <SelectItem value="healthcare-biotech">Healthcare/Biotech</SelectItem>
//                                     <SelectItem value="manufacturing">Manufacturing</SelectItem>
//                                     <SelectItem value="consulting">Consulting</SelectItem>
//                                     <SelectItem value="media-entertainment">Media/Entertainment</SelectItem>
//                                     <SelectItem value="retail-ecommerce">Retail/E-commerce</SelectItem>
//                                     <SelectItem value="energy">Energy</SelectItem>
//                                     <SelectItem value="real-estate">Real Estate</SelectItem>
//                                     <SelectItem value="education">Education</SelectItem>
//                                     <SelectItem value="government-public-sector">Government/Public Sector</SelectItem>
//                                     <SelectItem value="other">Other</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <FormField label="Seniority Level">
//                             <Select
//                                 value={context.seniorityLevel}
//                                 onValueChange={value =>
//                                     updateField('seniorityLevel', value as InitialInterviewContext['seniorityLevel'])
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
//                         </FormField>
//                         <div></div> {/* Empty div for grid alignment */}
//                     </div>

//                     <FormField label="Additional Industry Context">
//                         <Textarea
//                             value={context.industry}
//                             onChange={e => updateField('industry', e.target.value)}
//                             placeholder="Any additional context about the industry, market conditions, or company specifics..."
//                             rows={2}
//                         />
//                     </FormField>
//                 </CardContent>
//             </Card>

//             {/* Interview Logistics */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">📅 Interview Logistics</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-3 gap-4">
//                         <FormField label="Interview Round">
//                             <Select
//                                 value={context.interviewRound}
//                                 onValueChange={value =>
//                                     updateField('interviewRound', value as InitialInterviewContext['interviewRound'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select round" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="initial">Initial Screen</SelectItem>
//                                     <SelectItem value="second">Second Round</SelectItem>
//                                     <SelectItem value="final">Final Round</SelectItem>
//                                     <SelectItem value="panel">Panel Interview</SelectItem>
//                                     <SelectItem value="technical-deep-dive">Technical Deep-dive</SelectItem>
//                                     <SelectItem value="presentation">Presentation</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         <FormField label="Duration">
//                             <Select
//                                 value={context.interviewDuration}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'interviewDuration',
//                                         value as InitialInterviewContext['interviewDuration']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select duration" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="30min">30 minutes</SelectItem>
//                                     <SelectItem value="45min">45 minutes</SelectItem>
//                                     <SelectItem value="60min">60 minutes</SelectItem>
//                                     <SelectItem value="90min">90 minutes</SelectItem>
//                                     <SelectItem value="half-day">Half day</SelectItem>
//                                     <SelectItem value="full-day">Full day</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         <FormField label="Format">
//                             <Select
//                                 value={context.interviewFormat}
//                                 onValueChange={value =>
//                                     updateField('interviewFormat', value as InitialInterviewContext['interviewFormat'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select format" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="video-call">Video Call</SelectItem>
//                                     <SelectItem value="phone">Phone</SelectItem>
//                                     <SelectItem value="in-person">In-Person</SelectItem>
//                                     <SelectItem value="presentation">Presentation</SelectItem>
//                                     <SelectItem value="case-study">Case Study</SelectItem>
//                                     <SelectItem value="working-session">Working Session</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Strategic Context */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">🎭 Strategic Context</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <FormField label="Competitive Context">
//                             <Select
//                                 value={context.competitiveContext}
//                                 onValueChange={value =>
//                                     updateField(
//                                         'competitiveContext',
//                                         value as InitialInterviewContext['competitiveContext']
//                                     )
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select context" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="direct-competitor">Direct Competitor</SelectItem>
//                                     <SelectItem value="adjacent-industry">Adjacent Industry</SelectItem>
//                                     <SelectItem value="career-pivot">Career Pivot</SelectItem>
//                                     <SelectItem value="internal-transfer">Internal Transfer</SelectItem>
//                                     <SelectItem value="first-role">First Role in Field</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>

//                         <FormField label="Opportunity Priority">
//                             <Select
//                                 value={context.urgencyLevel}
//                                 onValueChange={value =>
//                                     updateField('urgencyLevel', value as InitialInterviewContext['urgencyLevel'])
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select priority" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="exploratory">Exploratory</SelectItem>
//                                     <SelectItem value="active">Active Interest</SelectItem>
//                                     <SelectItem value="urgent">Urgent Need</SelectItem>
//                                     <SelectItem value="dream-opportunity">Dream Opportunity</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
