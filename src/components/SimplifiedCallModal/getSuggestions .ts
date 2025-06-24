// src\components\SimplifiedCallModal\getSuggestions .ts

import { PREDEFINED_INTERVIEW_GOALS, PREDEFINED_QUESTIONS } from '@/lib/predefinedFields';
import { CallContext } from '@/types';

// --- Helper function to get suggestions based on Call Type ---
export const getSuggestions = (callType: CallContext['call_type']) => {
    const suggestions: {
        participants: string[];
        keyPoints: string[];
        objectives: string[];
    } = {
        participants: [],
        keyPoints: [],
        objectives: [],
    };

    switch (callType) {
        case 'job-interview':
            suggestions.participants = ['Hiring Manager', 'Recruiter', 'Team Member', 'Interviewer', 'Panelist'];
            suggestions.keyPoints = PREDEFINED_QUESTIONS['Role & Responsibilities'].slice(0, 5);
            suggestions.objectives = PREDEFINED_INTERVIEW_GOALS.slice(0, 5);
            break;
        case 'sales-call':
            suggestions.participants = ['Economic Buyer', 'Champion', 'Technical Evaluator', 'End User', 'Gatekeeper'];
            suggestions.keyPoints = [
                'Understand their key challenges',
                'Qualify the opportunity (BANT/MEDDPICC)',
                'Present the value proposition',
                'Discuss pricing and next steps',
            ];
            suggestions.objectives = [
                'Secure a follow-up meeting',
                'Get a commitment for a pilot',
                'Close the deal',
                'Identify key decision-makers',
            ];
            break;
        default:
            suggestions.participants = ['Colleague', 'Manager', 'Client', 'Partner'];
            suggestions.keyPoints = ['Review project status', 'Discuss upcoming deadlines', 'Brainstorm new ideas'];
            suggestions.objectives = ['Align on next steps', 'Resolve a specific issue', 'Get approval for a proposal'];
            break;
    }
    return suggestions;
};
