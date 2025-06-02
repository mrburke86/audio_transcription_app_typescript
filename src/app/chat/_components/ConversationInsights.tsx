// src\app\chat\_components\ConversationInsights.tsx
'use client';

import { Brain, Lightbulb, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import type React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/components/markdownComponents';
import { useMemo } from 'react';

interface ConversationInsightsProps {
    suggestions: {
        powerUpContent: string;
        lastAnalysis?: {
            strategic_opportunity:
                | 'thought_leadership'
                | 'competitive_intelligence'
                | 'data_storytelling'
                | 'hidden_connections'
                | 'future_vision'
                | 'real_world_evidence';
            insight_potential: string;
        };
    };
    onSuggest: () => void;
    isLoading: boolean;
}

export const ConversationInsights: React.FC<ConversationInsightsProps> = ({ suggestions, onSuggest, isLoading }) => {
    const headerInfo = useMemo(() => {
        if (!suggestions.lastAnalysis) {
            return { title: 'Strategic Intelligence', icon: Brain, color: 'indigo' };
        }

        const { strategic_opportunity } = suggestions.lastAnalysis;

        const opportunityConfig = {
            thought_leadership: {
                title: '🧠 Thought Leadership Intel',
                icon: Brain,
                color: 'purple',
            },
            competitive_intelligence: {
                title: '🎯 Competitive Intel',
                icon: Target,
                color: 'blue',
            },
            data_storytelling: {
                title: '📊 Data-Driven Insights',
                icon: TrendingUp,
                color: 'green',
            },
            hidden_connections: {
                title: '🔗 Strategic Connections',
                icon: Lightbulb,
                color: 'yellow',
            },
            future_vision: {
                title: '🚀 Future Vision Intel',
                icon: Zap,
                color: 'orange',
            },
            real_world_evidence: {
                title: '🌍 Real-World Evidence',
                icon: Sparkles,
                color: 'teal',
            },
        };

        return opportunityConfig[strategic_opportunity] || { title: 'Strategic Intelligence', icon: Brain, color: 'indigo' };
    }, [suggestions.lastAnalysis]);

    // const headerInfo = getHeaderInfo();
    const IconComponent = headerInfo.icon;

    return (
        <Card className="h-full flex flex-col overscroll-contain">
            {/* Strategic Header */}
            <CardHeader className="p-4 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 p-0">
                        <div className={`w-6 h-6 bg-${headerInfo.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-3 h-3 text-${headerInfo.color}-600`} />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">{headerInfo.title}</h3>
                    </CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onSuggest}
                        disabled={isLoading}
                        className="border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        <Brain className="w-3 h-3 mr-1" />
                        {isLoading ? 'Analyzing...' : 'Strategic Intel'}
                    </Button>
                </div>

                {/* Analysis Preview */}
                {suggestions.lastAnalysis && !isLoading && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                        💡 {suggestions.lastAnalysis.insight_potential}
                    </div>
                )}
            </CardHeader>

            {/* Strategic Intelligence Content */}
            <CardContent className="flex-1 overflow-y-auto hide-scrollbar p-4 pt-0">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton count={1} className="h-8 bg-gray-200 rounded" />
                        <Skeleton count={1} className="h-4 bg-gray-100 rounded" />
                        <Skeleton count={3} className="h-4 bg-gray-200 rounded" />
                        <Skeleton count={2} className="h-4 bg-gray-100 rounded" />
                        <Skeleton count={4} className="h-4 bg-gray-200 rounded" />
                        <Skeleton count={2} className="h-4 bg-gray-100 rounded" />
                    </div>
                ) : suggestions.powerUpContent ? (
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown components={markdownComponents} skipHtml={true} unwrapDisallowed={true}>
                            {suggestions.powerUpContent}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium mb-1">Strategic Intelligence Ready</p>
                        <p className="text-xs">
                            Click &quot;Strategic Intel&quot; to generate mind-blowing insights that position you as an exceptional thought
                            leader
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
