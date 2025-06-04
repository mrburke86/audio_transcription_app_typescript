import { StateCreator } from 'zustand';
import { AppState, InterviewSlice } from '@/types/store';
import { InitialInterviewContext } from '@/types';
import { logger } from '@/modules';

export const createInterviewSlice: StateCreator<AppState, [], [], InterviewSlice> = (set, get) => ({
    // Initialize state - replaces interview modal state management
    context: null,
    isModalOpen: false,
    currentStep: 'interview',
    validationErrors: {},

    // Set interview context - replaces your interview setup logic
    setInterviewContext: (context: InitialInterviewContext) => {
        logger.info('🎯 Setting interview context:', {
            role: context.targetRole,
            company: context.targetCompany,
            type: context.interviewType,
        });

        set({
            context,
            validationErrors: {},
        });

        get().addNotification({
            type: 'success',
            message: `Interview profile set: ${context.targetRole} at ${context.targetCompany}`,
            duration: 5000,
        });
    },

    openInterviewModal: () => {
        set({ isModalOpen: true, currentStep: 'interview' });
        logger.info('📝 Opened interview setup modal');
    },

    closeInterviewModal: () => {
        set({ isModalOpen: false });
        logger.info('❌ Closed interview setup modal');
    },

    // Update interview field - replaces your form management
    updateInterviewField: <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => {
        const currentContext = get().context;
        if (!currentContext) {
            logger.warning('⚠️ No interview context to update');
            return;
        }

        const updatedContext = {
            ...currentContext,
            [field]: value,
        };

        set({
            context: updatedContext,
            // Clear validation errors for this field
            validationErrors: {
                ...get().validationErrors,
                [field as string]: undefined,
            },
        });

        logger.debug(`📝 Updated interview field: ${field}`);
    },

    // Validate context - replaces your validation logic
    validateContext: () => {
        const context = get().context;
        const errors: Record<string, string> = {};

        if (!context) {
            errors.general = 'Interview context is required';
            set({ validationErrors: errors });
            return false;
        }

        if (!context.targetRole?.trim()) {
            errors.targetRole = 'Target role is required';
        }

        if (!context.targetCompany?.trim()) {
            errors.targetCompany = 'Target company is required';
        }

        if (!context.interviewType) {
            errors.interviewType = 'Interview type is required';
        }

        const isValid = Object.keys(errors).length === 0;

        set({ validationErrors: errors });

        if (!isValid) {
            get().addNotification({
                type: 'error',
                message: 'Please complete all required fields',
                duration: 5000,
            });
        }

        return isValid;
    },
});
