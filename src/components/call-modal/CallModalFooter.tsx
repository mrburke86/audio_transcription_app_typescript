// src/components/call-modal/CallModalFooter.tsx
import { Button } from '@/components/ui/button';
import { useCallModal } from './CallModalContext';
import { AlertCircle, Phone } from 'lucide-react';

export function CallModalFooter() {
    const { isValid, handleSubmit, context } = useCallModal();

    const getButtonText = () => {
        const callTypeLabels: Record<string, string> = {
            'job-interview': '🚀 Start Interview Prep',
            'sales-call': '💰 Start Sales Call',
            'customer-support': '🎧 Start Support Call',
            'relationship-talk': '❤️ Start Conversation',
            'family-call': '👨‍👩‍👧‍👦 Start Family Call',
            'emergency-call': '🚨 Emergency Prep',
            'technical-support': '🔧 Start Tech Support',
            'conflict-resolution': '🤝 Start Resolution',
            'dating-ask': '💕 Prep for Ask',
            'breakup-call': '💔 Prep Conversation',
        };

        return callTypeLabels[context.call_type] || '📞 Start Call Preparation';
    };

    const getValidationErrors = () => {
        const errors: string[] = [];

        if (!context.call_type) errors.push('Call type is required');
        if (!context.call_context) errors.push('Call context is required');
        if (!context.key_points || context.key_points.length === 0) errors.push('At least one key point is required');
        if (!context.objectives || context.objectives.length === 0) errors.push('At least one objective is required');

        // Check if objectives have primary goals
        if (context.objectives) {
            const incompleteObjectives = context.objectives.filter(
                obj => !obj.primary_goal || obj.primary_goal.trim() === ''
            );
            if (incompleteObjectives.length > 0) {
                errors.push(`${incompleteObjectives.length} objective(s) missing primary goal`);
            }
        }

        return errors;
    };

    const validationErrors = getValidationErrors();
    const hasErrors = validationErrors.length > 0;

    return (
        <div className="space-y-3">
            {/* Validation Errors */}
            {hasErrors && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Please complete required fields:</span>
                    </div>
                    <ul className="text-xs text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Context-specific tips */}
            {context.call_type && !hasErrors && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-700">
                        {context.call_type === 'emergency-call' && (
                            <p>⚠️ Remember: For true emergencies, contact emergency services first (911, etc.)</p>
                        )}
                        {context.sensitivity_level === 'highly-sensitive' && (
                            <p>🔒 High sensitivity mode enabled - AI suggestions will be limited for privacy</p>
                        )}
                        {context.call_context === 'personal' && (
                            <p>
                                👥 Personal call mode - Emotional guidance enabled, professional boundaries maintained
                            </p>
                        )}
                        {context.call_context === 'professional' && (
                            <p>💼 Professional mode - Full AI assistance and analytics enabled</p>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!isValid || hasErrors}
                    variant="default"
                    className="min-w-[200px]"
                >
                    <Phone className="h-4 w-4 mr-2" />
                    {getButtonText()}
                </Button>
            </div>
        </div>
    );
}
