/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/call-modal/tabs/ContentStrategyTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCallModal } from '../CallModalContext';
import { CallObjective } from '@/types/callContext';
import { Plus, Trash2, Target, MessageCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { FormField } from '../components/FormField';
import { DynamicList } from '@/components/call-modal/components/DynamicList';

export function ContentStrategyTab() {
    const { context, updateField, addObjective, updateObjective, removeObjective, updateObjectiveArray } =
        useCallModal();

    return (
        <div className="space-y-6">
            {/* Call Objectives */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Call Objectives
                    </CardTitle>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Define what you want to achieve from this call</p>
                        <Button onClick={addObjective} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Objective
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {context.objectives?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No objectives defined yet</p>
                            <p className="text-sm">Click &quot;Add Objective&quot; to set your goals</p>
                        </div>
                    ) : (
                        context.objectives?.map((objective, index) => (
                            <Card key={index} className="border border-gray-200">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Objective {index + 1}</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeObjective(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField label="Primary Goal" required>
                                        <Textarea
                                            value={objective.primary_goal}
                                            onChange={e => updateObjective(index, 'primary_goal', e.target.value)}
                                            placeholder="Describe the main goal for this objective..."
                                            rows={2}
                                        />
                                    </FormField>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <FormField label="Success Metrics">
                                                <DynamicList
                                                    items={objective.success_metrics || []}
                                                    onItemsChange={items =>
                                                        updateObjectiveArray(index, 'success_metrics', items)
                                                    }
                                                    placeholder="How will you measure success?"
                                                    addButtonText="Add Metric"
                                                />
                                            </FormField>
                                        </div>

                                        <div>
                                            <FormField label="Potential Obstacles">
                                                <DynamicList
                                                    items={objective.potential_obstacles || []}
                                                    onItemsChange={items =>
                                                        updateObjectiveArray(index, 'potential_obstacles', items)
                                                    }
                                                    placeholder="What might get in the way?"
                                                    addButtonText="Add Obstacle"
                                                />
                                            </FormField>
                                        </div>
                                    </div>

                                    <FormField label="Fallback Strategies">
                                        <DynamicList
                                            items={objective.fallback_strategies || []}
                                            onItemsChange={items =>
                                                updateObjectiveArray(index, 'fallback_strategies', items)
                                            }
                                            placeholder="What's your plan B if this doesn't work?"
                                            addButtonText="Add Strategy"
                                        />
                                    </FormField>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Key Points to Cover */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Content Planning
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField label="Key Points to Cover" required>
                        <p className="text-sm text-gray-600 mb-2">Main topics you need to discuss during the call</p>
                        <DynamicList
                            items={context.key_points || []}
                            onItemsChange={items => updateField('key_points', items)}
                            placeholder="Add a key point or topic to cover..."
                            addButtonText="Add Point"
                        />
                    </FormField>

                    <FormField label="Sensitive Topics">
                        <p className="text-sm text-gray-600 mb-2">Topics to handle carefully or avoid entirely</p>
                        <DynamicList
                            items={context.sensitive_topics || []}
                            onItemsChange={items => updateField('sensitive_topics', items)}
                            placeholder="Add a sensitive topic to be mindful of..."
                            addButtonText="Add Topic"
                        />
                    </FormField>

                    <FormField label="Questions to Ask">
                        <p className="text-sm text-gray-600 mb-2">
                            Strategic questions you want to pose during the call
                        </p>
                        <DynamicList
                            items={context.questions_to_ask || []}
                            onItemsChange={items => updateField('questions_to_ask', items)}
                            placeholder="Add a question you want to ask..."
                            addButtonText="Add Question"
                        />
                    </FormField>
                </CardContent>
            </Card>

            {/* Quick Templates by Call Type */}
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">🎯 Quick Templates</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <p className="font-medium">Sales Call:</p>
                            <ul className="text-xs space-y-1">
                                <li>• Discover current challenges</li>
                                <li>• Present value proposition</li>
                                <li>• Handle objections</li>
                                <li>• Secure next steps</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Difficult Conversation:</p>
                            <ul className="text-xs space-y-1">
                                <li>• Acknowledge their perspective</li>
                                <li>• Share your concerns</li>
                                <li>• Find common ground</li>
                                <li>• Agree on next steps</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Support Call:</p>
                            <ul className="text-xs space-y-1">
                                <li>• Listen actively</li>
                                <li>• Validate their feelings</li>
                                <li>• Offer practical help</li>
                                <li>• Check in regularly</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tips */}
            <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">💡 Content Strategy Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-purple-700 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p>
                                <strong>Prioritize objectives:</strong> Focus on 1-3 main goals per call
                            </p>
                            <p>
                                <strong>Prepare questions:</strong> Quality questions drive meaningful conversations
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p>
                                <strong>Know your sensitive areas:</strong> Plan how to navigate difficult topics
                            </p>
                            <p>
                                <strong>Have fallbacks ready:</strong> Always have a plan B for important conversations
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
