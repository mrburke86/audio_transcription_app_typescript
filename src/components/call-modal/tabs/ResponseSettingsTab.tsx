// src/components/call-modal/tabs/ResponseSettingsTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/call-modal/components/FormField';
import { useCallModal } from '@/components/call-modal/CallModalContext';
import { CallContext } from '@/types/callContext';
import { Settings, MessageSquare, Heart, Briefcase } from 'lucide-react';

export function ResponseSettingsTab() {
    const { context, updateField } = useCallModal();

    return (
        <div className="space-y-6">
            {/* Core Response Style */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Response Style & Format
                    </CardTitle>
                    <p className="text-sm text-gray-600">Control how AI responses are formatted and delivered</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Response Style">
                            <Select
                                value={context.response_style}
                                onValueChange={value =>
                                    updateField('response_style', value as CallContext['response_style'])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="structured">📋 Structured (Clear sections)</SelectItem>
                                    <SelectItem value="conversational">💬 Conversational (Natural flow)</SelectItem>
                                    <SelectItem value="bullet-points">• Bullet Points (Quick scan)</SelectItem>
                                    <SelectItem value="script-like">📝 Script-like (Detailed prompts)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Verbosity Level">
                            <Select
                                value={context.verbosity}
                                onValueChange={value => updateField('verbosity', value as CallContext['verbosity'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="brief">⚡ Brief (Key points only)</SelectItem>
                                    <SelectItem value="moderate">📄 Moderate (Balanced detail)</SelectItem>
                                    <SelectItem value="detailed">📚 Detailed (Comprehensive)</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                </CardContent>
            </Card>

            {/* AI Guidance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        AI Guidance Types
                    </CardTitle>
                    <p className="text-sm text-gray-600">Choose what type of guidance you want from the AI assistant</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Heart className="h-5 w-5 text-pink-500" />
                                <div>
                                    <label className="text-sm font-medium">Emotional Guidance</label>
                                    <p className="text-xs text-gray-500">
                                        Help with emotional tone, empathy, and sensitivity
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={context.include_emotional_guidance}
                                onCheckedChange={checked => updateField('include_emotional_guidance', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-blue-500" />
                                <div>
                                    <label className="text-sm font-medium">Professional Tips</label>
                                    <p className="text-xs text-gray-500">
                                        Business etiquette, legal considerations, best practices
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={context.include_professional_tips}
                                onCheckedChange={checked => updateField('include_professional_tips', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Response Recommendations by Call Type */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">🎯 Recommended Settings</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium mb-1">Professional Calls:</p>
                                <ul className="text-xs space-y-1">
                                    <li>• Structured or conversational style</li>
                                    <li>• Professional tips enabled</li>
                                    <li>• Moderate to detailed verbosity</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Sales/Negotiation:</p>
                                <ul className="text-xs space-y-1">
                                    <li>• Bullet points for quick reference</li>
                                    <li>• Both guidance types enabled</li>
                                    <li>• Detailed verbosity for preparation</li>
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium mb-1">Personal/Emotional:</p>
                                <ul className="text-xs space-y-1">
                                    <li>• Conversational style</li>
                                    <li>• Emotional guidance enabled</li>
                                    <li>• Brief to moderate verbosity</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Emergency/Critical:</p>
                                <ul className="text-xs space-y-1">
                                    <li>• Bullet points for clarity</li>
                                    <li>• Professional tips only</li>
                                    <li>• Brief verbosity for speed</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Context-Aware Recommendations */}
            {context.call_type && (
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            💡 Suggestions for{' '}
                            {context.call_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-green-700">
                        {context.call_type === 'sales-call' && (
                            <div className="space-y-2">
                                <p>
                                    <strong>Recommended:</strong> Bullet points + Professional tips + Detailed verbosity
                                </p>
                                <p>
                                    Sales calls benefit from quick-reference formatting and comprehensive business
                                    guidance.
                                </p>
                            </div>
                        )}
                        {context.call_type === 'relationship-talk' && (
                            <div className="space-y-2">
                                <p>
                                    <strong>Recommended:</strong> Conversational + Emotional guidance + Moderate
                                    verbosity
                                </p>
                                <p>Personal conversations need natural flow and emotional intelligence support.</p>
                            </div>
                        )}
                        {context.call_type === 'customer-support' && (
                            <div className="space-y-2">
                                <p>
                                    <strong>Recommended:</strong> Structured + Both guidance types + Moderate verbosity
                                </p>
                                <p>Support calls need clear structure with both professional and emotional support.</p>
                            </div>
                        )}
                        {context.call_type === 'emergency-call' && (
                            <div className="space-y-2">
                                <p>
                                    <strong>Recommended:</strong> Bullet points + Professional tips only + Brief
                                    verbosity
                                </p>
                                <p>Emergency situations require clear, concise, action-oriented guidance.</p>
                            </div>
                        )}
                        {!['sales-call', 'relationship-talk', 'customer-support', 'emergency-call'].includes(
                            context.call_type
                        ) && (
                            <div className="space-y-2">
                                <p>
                                    <strong>Recommended:</strong> Start with conversational style and moderate
                                    verbosity.
                                </p>
                                <p>Adjust based on your comfort level and the specific needs of this call type.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Settings Summary */}
            <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                    <CardTitle className="text-gray-800">📋 Current Settings Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p>
                                <strong>Style:</strong> {context.response_style?.replace('-', ' ') || 'Not set'}
                            </p>
                            <p>
                                <strong>Verbosity:</strong> {context.verbosity || 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>Emotional Guidance:</strong>{' '}
                                {context.include_emotional_guidance ? '✅ Enabled' : '❌ Disabled'}
                            </p>
                            <p>
                                <strong>Professional Tips:</strong>{' '}
                                {context.include_professional_tips ? '✅ Enabled' : '❌ Disabled'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
