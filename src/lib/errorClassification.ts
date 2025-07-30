// src/lib/errorClassification.ts - ADD MISSING ENUM VALUES
'use client';

import { logger } from '@/lib/Logger';

export enum ErrorCategory {
    NETWORK = 'network',
    API = 'api',
    SPEECH = 'speech',
    PERMISSION = 'permission',
    STORAGE = 'storage', // ✅ ADD MISSING
    RENDERING = 'rendering',
    UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum RecoveryStrategy {
    RETRY = 'retry',
    RESET_COMPONENT = 'reset_component',
    RESET_SESSION = 'reset_session', // ✅ ADD MISSING
    FALLBACK_MODE = 'fallback_mode', // ✅ ADD MISSING
    NAVIGATE_HOME = 'navigate_home',
    RELOAD_PAGE = 'reload_page',
    CONTACT_SUPPORT = 'contact_support', // ✅ ADD MISSING
}

export interface ClassifiedError {
    originalError: Error;
    category: ErrorCategory;
    severity: ErrorSeverity;
    isRetryable: boolean;
    userMessage: string;
    technicalMessage: string;
    suggestedActions: string[];
    recoveryStrategies: RecoveryStrategy[];
}

// ✅ ENHANCED ERROR CLASSIFICATION
export const classifyError = (error: Error): ClassifiedError => {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
        return {
            originalError: error,
            category: ErrorCategory.NETWORK,
            severity: ErrorSeverity.MEDIUM,
            isRetryable: true,
            userMessage: 'Connection issue detected',
            technicalMessage: `Network error: ${error.message}`,
            suggestedActions: ['Check your connection', 'Try again'],
            recoveryStrategies: [RecoveryStrategy.RETRY, RecoveryStrategy.RELOAD_PAGE],
        };
    }

    // API errors
    if (message.includes('api') || message.includes('429') || message.includes('500')) {
        return {
            originalError: error,
            category: ErrorCategory.API,
            severity: ErrorSeverity.MEDIUM,
            isRetryable: true,
            userMessage: 'Service temporarily unavailable',
            technicalMessage: `API error: ${error.message}`,
            suggestedActions: ['Wait a moment and try again'],
            recoveryStrategies: [RecoveryStrategy.RETRY, RecoveryStrategy.FALLBACK_MODE],
        };
    }

    // Speech errors
    if (message.includes('speech') || message.includes('microphone')) {
        return {
            originalError: error,
            category: ErrorCategory.SPEECH,
            severity: ErrorSeverity.LOW,
            isRetryable: true,
            userMessage: 'Voice recognition issue',
            technicalMessage: `Speech error: ${error.message}`,
            suggestedActions: ['Check microphone permissions'],
            recoveryStrategies: [RecoveryStrategy.RETRY, RecoveryStrategy.FALLBACK_MODE],
        };
    }

    // Storage errors
    if (message.includes('storage') || message.includes('quota')) {
        return {
            originalError: error,
            category: ErrorCategory.STORAGE,
            severity: ErrorSeverity.MEDIUM,
            isRetryable: false,
            userMessage: 'Storage limit reached',
            technicalMessage: `Storage error: ${error.message}`,
            suggestedActions: ['Clear browser data', 'Free up storage space'],
            recoveryStrategies: [RecoveryStrategy.RESET_SESSION, RecoveryStrategy.FALLBACK_MODE],
        };
    }

    // Permission errors
    if (message.includes('permission') || message.includes('denied')) {
        return {
            originalError: error,
            category: ErrorCategory.PERMISSION,
            severity: ErrorSeverity.HIGH,
            isRetryable: false,
            userMessage: 'Permission required',
            technicalMessage: `Permission error: ${error.message}`,
            suggestedActions: ['Grant required permissions'],
            recoveryStrategies: [RecoveryStrategy.RESET_SESSION, RecoveryStrategy.RELOAD_PAGE],
        };
    }

    // Default unknown error
    return {
        originalError: error,
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        isRetryable: false,
        userMessage: 'An unexpected error occurred',
        technicalMessage: error.message,
        suggestedActions: ['Try refreshing the page'],
        recoveryStrategies: [
            RecoveryStrategy.RESET_COMPONENT,
            RecoveryStrategy.RELOAD_PAGE,
            RecoveryStrategy.CONTACT_SUPPORT,
        ],
    };
};

// ✅ SIMPLE ERROR REPORTING
export const reportError = (classifiedError: ClassifiedError, context?: any) => {
    logger.error(`[${classifiedError.category.toUpperCase()}] ${classifiedError.technicalMessage}`, {
        category: classifiedError.category,
        severity: classifiedError.severity,
        context,
    });
};
