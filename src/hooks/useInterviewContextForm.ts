// src\hooks\useInterviewContextForm.ts
"use client";
import { useState, useCallback } from 'react';
import { InitialInterviewContext } from '@/types';

const defaultContext: InitialInterviewContext = {
    interviewType: 'sales',
    targetRole: 'Mid-market Account Executive',
    targetCompany: 'ETQ',
    companySizeType: 'enterprise',
    industry: 'Manufacturing QMS Software',
    seniorityLevel: 'manager',
    responseConfidence: 'balanced',
    responseStructure: 'story-driven',
    contextDepth: 10,
    includeMetrics: true,
    goals: [],
    emphasizedExperiences: [],
    specificChallenges: [],
    companyContext: ['sales_methodology', 'career_achievements'],
    roleDescription: '',
};

export function useInterviewContextForm(initialContext?: InitialInterviewContext) {
    const [context, setContext] = useState<InitialInterviewContext>(
        initialContext || defaultContext
    );
    const [activeTab, setActiveTab] = useState('interview');

    // Individual field updaters
    const updateField = useCallback(
        <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => {
            setContext(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    // Array operations
    const addToArray = useCallback(
        <K extends keyof InitialInterviewContext>(field: K, value: string) => {
            setContext(prev => {
                const currentArray = prev[field] as string[];
                return {
                    ...prev,
                    [field]: [...currentArray, value],
                };
            });
        },
        []
    );

    const removeFromArray = useCallback(
        <K extends keyof InitialInterviewContext>(field: K, index: number) => {
            setContext(prev => {
                const currentArray = prev[field] as string[];
                return {
                    ...prev,
                    [field]: currentArray.filter((_, i) => i !== index),
                };
            });
        },
        []
    );

    const toggleInArray = useCallback(
        <K extends keyof InitialInterviewContext>(field: K, value: string) => {
            setContext(prev => {
                const array = prev[field] as string[];
                return {
                    ...prev,
                    [field]: array.includes(value)
                        ? array.filter(item => item !== value)
                        : [...array, value],
                };
            });
        },
        []
    );

    // Validation
    const isValid = context.targetRole.trim().length > 0;

    return {
        context,
        activeTab,
        setActiveTab,
        updateField,
        addToArray,
        removeFromArray,
        toggleInArray,
        isValid,
    };
}
