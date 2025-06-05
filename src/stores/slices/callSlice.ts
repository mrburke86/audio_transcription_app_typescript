// src\stores\slices\callSlice.ts
import { StateCreator } from 'zustand';
import { AppState, CallContextSlice } from '@/types/store';
import { CallContext, validateContext } from '@/types';
import { logger } from '@/modules';

/**
 * 📞 Call Slice — Zustand store segment for managing call setup flow
 *
 * ✅ Responsibilities:
 * - Stores the call context (target role, company, type of call, etc.)
 * - Controls the modal open/close state and current step in setup flow
 * - Validates user input (required fields)
 * - Handles field updates with error clearing
 * - Sends user notifications on context updates or validation issues
 */

// ✅ Define available setup steps
const SETUP_STEPS = [
    'basic', // Basic call info (type, context)
    'details', // Detailed configuration
    'objectives', // Goals and objectives
    'review', // Final review
] as const;

export const createCallSlice: StateCreator<AppState, [], [], CallContextSlice> = (set, get) => ({
    // 🧠 Holds the current call context (null if not yet set)
    context: null,

    // 🎛 Controls visibility of the setup modal
    isModalOpen: false,

    // 🔄 Tracks the current step in modal (default is "basic")
    currentSetupStep: 'basic',

    // ⚠️ Holds field-specific validation errors
    validationErrors: {},

    /**
     * 🎯 Sets the call context and clears any existing errors.
     * Also logs the action and sends a success notification.
     */
    setCallContext: (context: CallContext) => {
        logger.info('🎯 Setting call context:', {
            role: context.target_role,
            company: context.target_organization,
            type: context.call_type,
        });

        set({
            context,
            validationErrors: {},
        });

        // ✅ Use generalized messaging
        const contextLabel =
            context.target_role && context.target_organization
                ? `${context.target_role} at ${context.target_organization}`
                : `${context.call_type} call`;

        // Check if addNotification exists before calling
        const state = get();
        if (state.addNotification && typeof state.addNotification === 'function') {
            state.addNotification({
                type: 'success',
                message: `Call context set: ${contextLabel}`,
                duration: 5000,
            });
        }
    },

    /**
     * 📝 Opens the setup modal and resets the current step to 'basic'
     */
    openSetupModal: () => {
        set({ isModalOpen: true, currentSetupStep: 'basic' });
        logger.info('📝 Opened call setup modal');
    },

    /**
     * ❌ Closes the setup modal
     */
    closeSetupModal: () => {
        set({ isModalOpen: false });
        logger.info('❌ Closed call setup modal');
    },

    /**
     * ➡️ Advances to the next step in the setup flow
     */
    nextSetupStep: () => {
        const currentStep = get().currentSetupStep;
        const currentIndex = SETUP_STEPS.indexOf(currentStep as (typeof SETUP_STEPS)[number]);

        if (currentIndex < SETUP_STEPS.length - 1) {
            const nextStep = SETUP_STEPS[currentIndex + 1];
            set({ currentSetupStep: nextStep });
            logger.info(`➡️ Advanced to setup step: ${nextStep}`);
        } else {
            logger.info('➡️ Already at final setup step');
        }
    },

    /**
     * ⬅️ Goes back to the previous step in the setup flow
     */
    previousSetupStep: () => {
        const currentStep = get().currentSetupStep;
        const currentIndex = SETUP_STEPS.indexOf(currentStep as (typeof SETUP_STEPS)[number]);

        if (currentIndex > 0) {
            const prevStep = SETUP_STEPS[currentIndex - 1];
            set({ currentSetupStep: prevStep });
            logger.info(`⬅️ Went back to setup step: ${prevStep}`);
        } else {
            logger.info('⬅️ Already at first setup step');
        }
    },

    /**
     * 🔄 Resets the setup flow to the beginning
     */
    resetSetupFlow: () => {
        set({
            currentSetupStep: 'basic',
            validationErrors: {},
        });
        logger.info('🔄 Reset setup flow to beginning');
    },

    /**
     * ✏️ Updates a single field in the call context.
     * Clears any existing error for that field.
     */
    updateContextField: <K extends keyof CallContext>(field: K, value: CallContext[K]) => {
        const currentContext = get().context;
        if (!currentContext) {
            logger.warning('⚠️ No call context to update');
            return;
        }

        const updatedContext = {
            ...currentContext,
            [field]: value,
        };

        // 🧹 Remove the validation error for the updated field, if any
        const currentErrors = get().validationErrors;
        // ✅ Fixed: Use underscore prefix for unused variable
        const remainingErrors = { ...currentErrors };
        delete remainingErrors[field as string];

        set({
            context: updatedContext,
            validationErrors: remainingErrors,
        });

        logger.debug(`📝 Updated call context field: ${field}`);
    },

    /**
     * ✅ Validates required fields in the context.
     * Shows an error notification if validation fails.
     */
    validateContext: () => {
        const context = get().context;
        const errors = validateContext(context || {}); // Use validation helper

        const isValid = errors.length === 0;

        // Convert errors array to object for display
        const errorObject = errors.reduce(
            (acc, error) => ({
                ...acc,
                [error.toLowerCase().replace(/ /g, '_')]: error,
            }),
            {}
        );

        set({ validationErrors: errorObject });

        if (!isValid) {
            // Check if addNotification exists before calling
            const state = get();
            if (state.addNotification && typeof state.addNotification === 'function') {
                state.addNotification({
                    type: 'error',
                    message: 'Please complete all required fields',
                    duration: 5000,
                });
            }
        }

        return isValid;
    },
});
