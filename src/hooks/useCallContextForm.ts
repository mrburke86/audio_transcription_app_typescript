/* eslint-disable prefer-const */
// src/hooks/useCallContextForm.ts
import { useState, useCallback } from 'react';
import { CallContext } from '@/types/callContext';

// Default initial state for CallContext
const getInitialCallContext = (): CallContext => ({
    // Core identification
    call_type: 'sales-call',
    call_context: 'professional',
    urgency_level: 'medium',
    sensitivity_level: 'confidential',

    // Participants & relationships
    participants: [],
    power_dynamic: 'equal',

    // Objectives & strategy
    objectives: [],
    desired_tone: 'professional',
    communication_approach: 'collaborative',

    // Content focus
    key_points: [],
    sensitive_topics: [],
    questions_to_ask: [],

    // Response preferences
    response_style: 'structured',
    verbosity: 'moderate',
    include_emotional_guidance: false,
    include_professional_tips: true,

    // Session metadata
    estimated_duration: '',
    follow_up_required: false,
    documentation_needed: false,

    // Knowledge integration
    knowledge_search_enabled: true,
    knowledge_search_scope: 'all',
});

export function useCallContextForm() {
    const [context, setContext] = useState<CallContext>(getInitialCallContext());
    const [activeTab, setActiveTab] = useState('details');

    // Update a field in the context
    const updateField = useCallback(<K extends keyof CallContext>(field: K, value: CallContext[K]) => {
        setContext(prev => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Add item to array field
    const addToArray = useCallback(<K extends keyof CallContext>(field: K, value: string) => {
        setContext(prev => {
            const currentValue = prev[field];
            if (Array.isArray(currentValue)) {
                return {
                    ...prev,
                    [field]: [...currentValue, value],
                };
            }
            return prev;
        });
    }, []);

    // Remove item from array field by index
    const removeFromArray = useCallback(<K extends keyof CallContext>(field: K, index: number) => {
        setContext(prev => {
            const currentValue = prev[field];
            if (Array.isArray(currentValue)) {
                return {
                    ...prev,
                    [field]: currentValue.filter((_, i) => i !== index),
                };
            }
            return prev;
        });
    }, []);

    // Toggle item in array (add if not present, remove if present)
    const toggleInArray = useCallback(<K extends keyof CallContext>(field: K, value: string) => {
        setContext(prev => {
            const currentValue = prev[field];
            if (Array.isArray(currentValue)) {
                const exists = currentValue.includes(value);
                return {
                    ...prev,
                    [field]: exists ? currentValue.filter(item => item !== value) : [...currentValue, value],
                };
            }
            return prev;
        });
    }, []);

    // Validation logic
    const isValid = useCallback(() => {
        // Required fields
        if (!context.call_type || !context.call_context) return false;

        // Must have at least one key point
        if (!context.key_points || context.key_points.length === 0) return false;

        // Must have at least one objective
        if (!context.objectives || context.objectives.length === 0) return false;

        // All objectives must have a primary goal
        const hasIncompleteObjectives = context.objectives.some(
            obj => !obj.primary_goal || obj.primary_goal.trim() === ''
        );
        if (hasIncompleteObjectives) return false;

        // Emergency calls should have minimal required fields only
        if (context.call_type === 'emergency-call') {
            return context.key_points.length > 0;
        }

        return true;
    }, [context]);

    // Auto-adjust settings based on call type and context
    const autoAdjustSettings = useCallback((callType: string, callContext: string) => {
        setContext(prev => {
            let updates: Partial<CallContext> = {};

            // Emergency calls - safety first
            if (callType === 'emergency-call') {
                updates = {
                    response_style: 'bullet-points',
                    verbosity: 'brief',
                    include_emotional_guidance: false,
                    include_professional_tips: true,
                    knowledge_search_enabled: false,
                    sensitivity_level: 'highly-sensitive',
                };
            }
            // Personal calls - privacy and emotional support
            else if (callContext === 'personal') {
                updates = {
                    response_style: 'conversational',
                    include_emotional_guidance: true,
                    include_professional_tips: false,
                    knowledge_search_scope: 'personal-only',
                    sensitivity_level: 'personal',
                };
            }
            // Professional calls - full features
            else if (callContext === 'professional') {
                updates = {
                    include_professional_tips: true,
                    knowledge_search_enabled: true,
                    knowledge_search_scope: 'all',
                    sensitivity_level: 'confidential',
                };
            }

            // Call type specific adjustments
            if (callType === 'sales-call') {
                updates = {
                    ...updates,
                    response_style: 'bullet-points',
                    verbosity: 'detailed',
                    include_professional_tips: true,
                };
            } else if (callType === 'relationship-talk' || callType === 'breakup-call') {
                updates = {
                    ...updates,
                    desired_tone: 'empathetic',
                    communication_approach: 'supportive',
                    include_emotional_guidance: true,
                };
            } else if (callType === 'customer-support') {
                updates = {
                    ...updates,
                    desired_tone: 'friendly',
                    communication_approach: 'collaborative',
                    include_emotional_guidance: true,
                    include_professional_tips: true,
                };
            }

            return { ...prev, ...updates };
        });
    }, []);

    // Watch for call type/context changes and auto-adjust
    const updateCallType = useCallback(
        (callType: string) => {
            updateField('call_type', callType as CallContext['call_type']);
            autoAdjustSettings(callType, context.call_context);
        },
        [updateField, autoAdjustSettings, context.call_context]
    );

    const updateCallContext = useCallback(
        (callContext: string) => {
            updateField('call_context', callContext as CallContext['call_context']);
            autoAdjustSettings(context.call_type, callContext);
        },
        [updateField, autoAdjustSettings, context.call_type]
    );

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setContext(getInitialCallContext());
        setActiveTab('details');
    }, []);

    // Get current form completion percentage
    const getCompletionPercentage = useCallback(() => {
        let completed = 0;
        let total = 8; // Total required sections

        if (context.call_type && context.call_context) completed++;
        if (context.participants && context.participants.length > 0) completed++;
        if (context.objectives && context.objectives.length > 0) completed++;
        if (context.key_points && context.key_points.length > 0) completed++;
        if (context.desired_tone && context.communication_approach) completed++;
        if (context.response_style && context.verbosity) completed++;
        if (context.knowledge_search_enabled !== undefined) completed++;
        if (context.estimated_duration) completed++;

        return Math.round((completed / total) * 100);
    }, [context]);

    return {
        context,
        activeTab,
        setActiveTab,
        updateField,
        addToArray,
        removeFromArray,
        toggleInArray,
        updateCallType,
        updateCallContext,
        isValid: isValid(),
        resetForm,
        completionPercentage: getCompletionPercentage(),
    };
}
