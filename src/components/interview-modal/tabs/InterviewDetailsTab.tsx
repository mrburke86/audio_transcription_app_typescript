// src/components/interview-modal/tabs/InterviewDetailsTab.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBoundStore } from '@/stores/chatStore'; // Use composed store for slice access
import { InitialInterviewContext } from '@/types';
import { useEffect } from 'react';
import { FormField } from '../components/FormField';

export function InterviewDetailsTab() {
    const { initialContext, updateContextWithDefaults, resetToDefaultContext } = useBoundStore(); // FIXED: Destructure 'initialContext' (matches contextSlice; no 'context')

    // ✅ Initialize with defaults if needed
    useEffect(() => {
        if (!initialContext.targetRole) {
            // Check for empty/default state
            resetToDefaultContext();
        }
    }, [initialContext, resetToDefaultContext]);

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
                                value={initialContext.interviewType}
                                onValueChange={value =>
                                    updateContextWithDefaults({
                                        interviewType: value as InitialInterviewContext['interviewType'],
                                    })
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
                                value={initialContext.seniorityLevel}
                                onValueChange={value =>
                                    updateContextWithDefaults({
                                        seniorityLevel: value as InitialInterviewContext['seniorityLevel'],
                                    })
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
                            value={initialContext.targetRole}
                            onChange={e => updateContextWithDefaults({ targetRole: e.target.value })}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Target Company">
                            <Input
                                value={initialContext.targetCompany}
                                onChange={e => updateContextWithDefaults({ targetCompany: e.target.value })}
                            />
                        </FormField>

                        <FormField label="Company Size">
                            <Select
                                value={initialContext.companySizeType}
                                onValueChange={value =>
                                    updateContextWithDefaults({
                                        companySizeType: value as InitialInterviewContext['companySizeType'],
                                    })
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
