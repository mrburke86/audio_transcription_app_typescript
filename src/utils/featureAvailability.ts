// src/utils/featureAvailability.ts

export interface FeatureAvailability {
    live_suggestions: boolean;
    conversation_insights: boolean;
    emotional_guidance: boolean;
    follow_up_generation: boolean;
    conversation_analytics: boolean;
    ai_coaching: boolean;
    script_generation: boolean;
    objection_handling: boolean;
    privacy_mode: boolean;
    recording_recommendations: boolean;
}

export const FEATURE_MATRIX: Record<string, FeatureAvailability> = {
    // ===== PROFESSIONAL (Full Features) =====
    'job-interview': {
        live_suggestions: true,
        conversation_insights: true,
        emotional_guidance: false, // Keep professional
        follow_up_generation: true,
        conversation_analytics: true,
        ai_coaching: true,
        script_generation: true,
        objection_handling: true,
        privacy_mode: false,
        recording_recommendations: true,
    },

    'sales-call': {
        live_suggestions: true,
        conversation_insights: true,
        emotional_guidance: false,
        follow_up_generation: true,
        conversation_analytics: true,
        ai_coaching: true,
        script_generation: true,
        objection_handling: true,
        privacy_mode: false,
        recording_recommendations: true,
    },

    'customer-support': {
        live_suggestions: true,
        conversation_insights: true,
        emotional_guidance: true, // Important for de-escalation
        follow_up_generation: true,
        conversation_analytics: true,
        ai_coaching: true,
        script_generation: false, // More natural conversation needed
        objection_handling: false,
        privacy_mode: false,
        recording_recommendations: true,
    },

    // ===== PERSONAL (Limited Features for Privacy) =====
    'dating-ask': {
        live_suggestions: false, // Too personal for live AI input
        conversation_insights: false,
        emotional_guidance: true,
        follow_up_generation: false,
        conversation_analytics: false,
        ai_coaching: true, // Pre-call coaching only
        script_generation: false, // Should be authentic
        objection_handling: false,
        privacy_mode: true,
        recording_recommendations: false,
    },

    'relationship-talk': {
        live_suggestions: false,
        conversation_insights: false,
        emotional_guidance: true,
        follow_up_generation: false,
        conversation_analytics: false,
        ai_coaching: true,
        script_generation: false,
        objection_handling: false,
        privacy_mode: true,
        recording_recommendations: false,
    },

    'family-call': {
        live_suggestions: false,
        conversation_insights: false,
        emotional_guidance: true,
        follow_up_generation: false,
        conversation_analytics: false,
        ai_coaching: true,
        script_generation: false,
        objection_handling: false,
        privacy_mode: true,
        recording_recommendations: false,
    },

    // ===== SENSITIVE (Minimal AI Intervention) =====
    'breakup-call': {
        live_suggestions: false,
        conversation_insights: false,
        emotional_guidance: true,
        follow_up_generation: false,
        conversation_analytics: false,
        ai_coaching: true, // Pre-call emotional preparation
        script_generation: false,
        objection_handling: false,
        privacy_mode: true,
        recording_recommendations: false,
    },

    'termination-call': {
        live_suggestions: false, // Legal/HR sensitivity
        conversation_insights: false,
        emotional_guidance: true,
        follow_up_generation: true, // Documentation important
        conversation_analytics: false,
        ai_coaching: true,
        script_generation: true, // Legal compliance important
        objection_handling: false,
        privacy_mode: true,
        recording_recommendations: true, // Legal documentation
    },

    // ===== EMERGENCY (Safety First) =====
    'emergency-call': {
        live_suggestions: false, // Too critical for AI suggestions
        conversation_insights: false,
        emotional_guidance: false,
        follow_up_generation: true, // Documentation critical
        conversation_analytics: false,
        ai_coaching: false,
        script_generation: false,
        objection_handling: false,
        privacy_mode: false,
        recording_recommendations: true,
    },
};

// Safety and ethics checking
export interface SafetyCheck {
    requires_consent_warning: boolean;
    requires_privacy_notice: boolean;
    requires_professional_disclaimer: boolean;
    restricted_features: string[];
    ethical_guidelines: string[];
}

export const SAFETY_MATRIX: Record<string, SafetyCheck> = {
    'dating-ask': {
        requires_consent_warning: true,
        requires_privacy_notice: true,
        requires_professional_disclaimer: true,
        restricted_features: ['live_suggestions', 'recording'],
        ethical_guidelines: [
            "Respect the other person's autonomy and right to say no",
            'Be authentic rather than following scripts',
            'Consider the impact of your words on the other person',
        ],
    },

    'relationship-talk': {
        requires_consent_warning: true,
        requires_privacy_notice: true,
        requires_professional_disclaimer: true,
        restricted_features: ['live_suggestions', 'analytics', 'recording'],
        ethical_guidelines: [
            'Prioritize honest, authentic communication',
            "Respect your partner's feelings and perspective",
            'Seek professional counseling for serious relationship issues',
        ],
    },

    'termination-call': {
        requires_consent_warning: false,
        requires_privacy_notice: true,
        requires_professional_disclaimer: true,
        restricted_features: ['live_suggestions'],
        ethical_guidelines: [
            'Follow all applicable employment laws and company policies',
            'Consult with HR and legal before proceeding',
            'Treat the employee with dignity and respect',
        ],
    },
};

export function getFeatureAvailability(callType: string): FeatureAvailability {
    return FEATURE_MATRIX[callType] || FEATURE_MATRIX['general'];
}

export function getSafetyRequirements(callType: string): SafetyCheck | null {
    return SAFETY_MATRIX[callType] || null;
}
