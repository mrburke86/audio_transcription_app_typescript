// src/lib/validateInterviewContext.ts
import { logger } from '@/lib/Logger';
import { InitialInterviewContext } from '@/types';

/**
 * Validates the minimal required structure of an interview context.
 * Returns true if both `targetRole` and `targetCompany` are present and non-empty.
 */
export const validateInterviewContext = (context: Partial<InitialInterviewContext> | null | undefined): boolean => {
    if (!context) {
        logger.warning('⚠️ Validation failed: No context provided');
        return false;
    }

    const hasRole = typeof context.targetRole === 'string' && context.targetRole.trim().length > 0;
    const hasCompany = typeof context.targetCompany === 'string' && context.targetCompany.trim().length > 0;

    const isValid = hasRole && hasCompany;

    logger.info('🔍 Context validation:', {
        hasRole,
        hasCompany,
        valid: isValid,
    });

    if (!isValid) {
        logger.warning('⚠️ Invalid interview context:', {
            missingRole: !hasRole,
            missingCompany: !hasCompany,
        });
    }

    return isValid;
};
