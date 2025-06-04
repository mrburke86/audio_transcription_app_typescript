/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/call-modal/tabs/AdvancedSettingsTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/call-modal/components/FormField';
import { useCallModal } from '@/components/call-modal/CallModalContext';
import { CallContext } from '@/types/callContext';
import { Clock, FileText, Database, Shield, Settings2, AlertTriangle } from 'lucide-react';

export function AdvancedSettingsTab() {
    const { context, updateField } = useCallModal();

    const getPrivacyRecommendation = () => {
        if (context.sensitivity_level === 'highly-sensitive' || context.call_context === 'personal') {
            return {
                knowledge_search_enabled: false,
                knowledge_search_scope: 'professional-only',
                message: 'Privacy-first settings recommended for sensitive conversations',
                color: 'red',
            };
        } else if (context.call_context === 'professional') {
            return {
                knowledge_search_enabled: true,
                knowledge_search_scope: 'all',
                message: 'Full knowledge access recommended for professional calls',
                color: 'green',
            };
        } else {
            return {
                knowledge_search_enabled: true,
                knowledge_search_scope: 'professional-only',
                message: 'Balanced privacy settings recommended',
                color: 'blue',
            };
        }
    };

    const privacyRec = getPrivacyRecommendation();

    return (
        <div className="space-y-6">
            {/* Session Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Session Planning
                    </CardTitle>
                    <p className="text-sm text-gray-600">Set expectations and planning details for this call</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Estimated Duration">
                            <Input
                                value={context.estimated_duration || ''}
                                onChange={e => updateField('estimated_duration', e.target.value)}
                                placeholder="e.g., 30 minutes, 1 hour"
                            />
                        </FormField>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <label className="text-sm font-medium">Follow-up Required</label>
                                    <p className="text-xs text-gray-500">Plan for post-call actions</p>
                                </div>
                                <Switch
                                    checked={context.follow_up_required || false}
                                    onCheckedChange={checked => updateField('follow_up_required', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <label className="text-sm font-medium">Documentation Needed</label>
                                    <p className="text-xs text-gray-500">Save conversation notes</p>
                                </div>
                                <Switch
                                    checked={context.documentation_needed || false}
                                    onCheckedChange={checked => updateField('documentation_needed', checked)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Knowledge Integration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Knowledge Base Integration
                    </CardTitle>
                    <p className="text-sm text-gray-600">Control how your knowledge base is used during this call</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <label className="text-sm font-medium">Enable Knowledge Search</label>
                            <p className="text-xs text-gray-500">
                                Allow AI to search your uploaded documents and notes
                            </p>
                        </div>
                        <Switch
                            checked={context.knowledge_search_enabled}
                            onCheckedChange={checked => updateField('knowledge_search_enabled', checked)}
                        />
                    </div>

                    {context.knowledge_search_enabled && (
                        <FormField label="Knowledge Search Scope">
                            <Select
                                value={context.knowledge_search_scope || 'all'}
                                onValueChange={value =>
                                    updateField(
                                        'knowledge_search_scope',
                                        value as CallContext['knowledge_search_scope']
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">🌐 All Knowledge (Professional + Personal)</SelectItem>
                                    <SelectItem value="professional-only">💼 Professional Only</SelectItem>
                                    <SelectItem value="personal-only">👤 Personal Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    )}

                    {/* Privacy Recommendation */}
                    <div
                        className={`p-4 rounded-lg border-2 ${
                            privacyRec.color === 'red'
                                ? 'bg-red-50 border-red-200'
                                : privacyRec.color === 'green'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-blue-50 border-blue-200'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Shield
                                className={`h-4 w-4 ${
                                    privacyRec.color === 'red'
                                        ? 'text-red-600'
                                        : privacyRec.color === 'green'
                                        ? 'text-green-600'
                                        : 'text-blue-600'
                                }`}
                            />
                            <span
                                className={`text-sm font-medium ${
                                    privacyRec.color === 'red'
                                        ? 'text-red-800'
                                        : privacyRec.color === 'green'
                                        ? 'text-green-800'
                                        : 'text-blue-800'
                                }`}
                            >
                                Privacy Recommendation
                            </span>
                        </div>
                        <p
                            className={`text-xs ${
                                privacyRec.color === 'red'
                                    ? 'text-red-700'
                                    : privacyRec.color === 'green'
                                    ? 'text-green-700'
                                    : 'text-blue-700'
                            }`}
                        >
                            {privacyRec.message}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Safety & Privacy Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Safety & Privacy Controls
                    </CardTitle>
                    <p className="text-sm text-gray-600">Additional safety measures based on call sensitivity</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Sensitivity-based warnings */}
                    {context.sensitivity_level === 'highly-sensitive' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">High Sensitivity Mode</span>
                            </div>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• Consider disabling live AI suggestions</li>
                                <li>• Limit knowledge base access to essential information only</li>
                                <li>• Review all AI guidance before using</li>
                                <li>• Ensure conversation privacy after the call</li>
                            </ul>
                        </div>
                    )}

                    {/* Emergency call warnings */}
                    {context.call_type === 'emergency-call' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Emergency Call Protocol</span>
                            </div>
                            <ul className="text-xs text-red-700 space-y-1">
                                <li>• AI suggestions are automatically disabled for safety</li>
                                <li>• Focus on clear, direct communication</li>
                                <li>• Follow established emergency protocols</li>
                                <li>• Document critical information immediately</li>
                            </ul>
                        </div>
                    )}

                    {/* Personal call privacy */}
                    {context.call_context === 'personal' && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">Personal Privacy Mode</span>
                            </div>
                            <ul className="text-xs text-purple-700 space-y-1">
                                <li>• Conversation insights may be limited</li>
                                <li>• Consider what information you&apos;re comfortable sharing with AI</li>
                                <li>• Professional boundaries maintained in all guidance</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Technical Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Technical Preferences
                    </CardTitle>
                    <p className="text-sm text-gray-600">Fine-tune technical aspects of AI assistance</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                            <label className="text-sm font-medium block mb-1">Knowledge Relevance Threshold</label>
                            <p className="text-xs text-gray-500 mb-2">How closely must content match to be included</p>
                            <Select defaultValue="medium">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low (Include more context)</SelectItem>
                                    <SelectItem value="medium">Medium (Balanced relevance)</SelectItem>
                                    <SelectItem value="high">High (Only highly relevant)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-3 border rounded-lg">
                            <label className="text-sm font-medium block mb-1">Response Timing</label>
                            <p className="text-xs text-gray-500 mb-2">When to provide AI suggestions</p>
                            <Select defaultValue="balanced">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="proactive">Proactive (Anticipate needs)</SelectItem>
                                    <SelectItem value="balanced">Balanced (Natural timing)</SelectItem>
                                    <SelectItem value="reactive">Reactive (Only when asked)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Summary */}
            <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                    <CardTitle className="text-gray-800">📋 Advanced Settings Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p>
                                <strong>Duration:</strong> {context.estimated_duration || 'Not specified'}
                            </p>
                            <p>
                                <strong>Follow-up:</strong>{' '}
                                {context.follow_up_required ? '✅ Required' : '❌ Not needed'}
                            </p>
                            <p>
                                <strong>Documentation:</strong>{' '}
                                {context.documentation_needed ? '✅ Required' : '❌ Not needed'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p>
                                <strong>Knowledge Search:</strong>{' '}
                                {context.knowledge_search_enabled ? '✅ Enabled' : '❌ Disabled'}
                            </p>
                            <p>
                                <strong>Search Scope:</strong> {context.knowledge_search_scope || 'All'}
                            </p>
                            <p>
                                <strong>Privacy Level:</strong> {context.sensitivity_level}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
