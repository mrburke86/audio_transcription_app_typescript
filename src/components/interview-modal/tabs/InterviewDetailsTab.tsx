// src/components/interview-modal/tabs/InterviewDetailsTab.tsx (FIXED)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '../components/FormField';
import { useInterviewModal } from '../InterviewModalContext';
import { InitialInterviewContext } from '@/types';

export function InterviewDetailsTab() {
    const { context, updateField } = useInterviewModal();

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>🎪 Target Interview Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Interview Type">
                            <Select
                                value={context.interviewType}
                                onValueChange={value =>
                                    updateField('interviewType', value as InitialInterviewContext['interviewType'])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="behavioral">Behavioral</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="case-study">Case Study</SelectItem>
                                    <SelectItem value="sales">Sales/Commercial</SelectItem>
                                    <SelectItem value="leadership">Leadership</SelectItem>
                                    <SelectItem value="mixed">Mixed</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Seniority Level">
                            <Select
                                value={context.seniorityLevel}
                                onValueChange={value =>
                                    updateField('seniorityLevel', value as InitialInterviewContext['seniorityLevel'])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="senior-ic">Senior IC</SelectItem>
                                    <SelectItem value="lead">Team Lead</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="director">Director</SelectItem>
                                    <SelectItem value="vp">VP</SelectItem>
                                    <SelectItem value="c-level">C-Level</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Target Role" required>
                        <Input
                            value={context.targetRole}
                            onChange={e => updateField('targetRole', e.target.value)}
                            placeholder="e.g., VP of Sales - Enterprise, Senior Sales Director"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Target Company">
                            <Input
                                value={context.targetCompany}
                                onChange={e => updateField('targetCompany', e.target.value)}
                                placeholder="e.g., Salesforce, Microsoft, Siemens"
                            />
                        </FormField>

                        <FormField label="Company Size">
                            <Select
                                value={context.companySizeType}
                                onValueChange={value =>
                                    updateField('companySizeType', value as InitialInterviewContext['companySizeType'])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scaleup">Scale-up (100-1K)</SelectItem>
                                    <SelectItem value="mid-market">Mid-market (1K-10K)</SelectItem>
                                    <SelectItem value="enterprise">Enterprise (10K+)</SelectItem>
                                    <SelectItem value="public">Public Company</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
