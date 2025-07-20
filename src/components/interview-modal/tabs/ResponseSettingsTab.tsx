// src/components/interview-modal/tabs/ResponseSettingsTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBoundStore } from '@/stores/chatStore'; // FIXED: Use composed store for slice access (replaces old context/hook)
import { InitialInterviewContext } from '@/types';
import { FormField } from '../components/FormField';

export function ResponseSettingsTab() {
    const { initialContext, updateContextWithDefaults } = useBoundStore(); // FIXED: Destructure from store (initialContext from contextSlice, updateContextWithDefaults for field updates); removed useInterviewModal import

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>⚙️ Response Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Response Confidence">
                            <Select
                                value={initialContext.responseConfidence}
                                onValueChange={
                                    value =>
                                        updateContextWithDefaults({
                                            responseConfidence: value as InitialInterviewContext['responseConfidence'],
                                        }) // FIXED: Use updateContextWithDefaults for partial update (replaces updateField)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="conservative">Conservative</SelectItem>
                                    <SelectItem value="balanced">Balanced</SelectItem>
                                    <SelectItem value="confident">Confident</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Response Structure">
                            <Select
                                value={initialContext.responseStructure}
                                onValueChange={value =>
                                    updateContextWithDefaults({
                                        responseStructure: value as InitialInterviewContext['responseStructure'],
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="story-driven">Story-Driven</SelectItem>
                                    <SelectItem value="data-driven">Data-Driven</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded">
                        <div>
                            <label className="text-sm font-medium">Include Metrics</label>
                            <p className="text-xs text-gray-500">Add quantified achievements to responses</p>
                        </div>
                        <Switch
                            checked={initialContext.includeMetrics}
                            onCheckedChange={checked => updateContextWithDefaults({ includeMetrics: checked })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
