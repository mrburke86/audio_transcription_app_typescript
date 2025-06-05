// src/hooks/useCallContextForm.ts
import { useState, useMemo } from 'react';
import { CallContext, validateContext } from '@/types/callContext';

export function useCallContextForm(initialContext?: Partial<CallContext>) {
    const [activeTab, setActiveTab] = useState('details');
    const [context, setContext] = useState<CallContext>({
        call_type: 'job-interview',
        call_context: 'professional',
        urgency_level: 'medium',
        sensitivity_level: 'confidential',
        objectives: [],
        key_points: [],
        desired_tone: 'professional',
        communication_approach: 'collaborative',
        response_style: 'structured',
        verbosity: 'moderate',
        include_emotional_guidance: false,
        include_professional_tips: true,
        knowledge_search_enabled: true,
        ...initialContext,
    });

    const updateField = <K extends keyof CallContext>(field: K, value: CallContext[K]) => {
        setContext(prev => ({ ...prev, [field]: value }));
    };

    const validationErrors = useMemo(() => validateContext(context), [context]);
    const isValid = validationErrors.length === 0;

    const completionPercentage = useMemo(() => {
        let completed = 0;
        const total = 4; // Required fields
        if (context.call_type) completed++;
        if (context.call_context) completed++;
        if (context.key_points.length > 0) completed++;
        if (Array.isArray(context.objectives) && context.objectives.length > 0) completed++;
        return Math.round((completed / total) * 100);
    }, [context]);

    return {
        context,
        activeTab,
        setActiveTab,
        updateField,
        isValid,
        validationErrors,
        completionPercentage,
    };
}
