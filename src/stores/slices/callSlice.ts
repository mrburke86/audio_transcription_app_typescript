// src/stores/slices/callSlice.ts
import { StateCreator } from 'zustand';
import { AppState, CallContextSlice } from '@/types/store';
import { CallContext, validateContext } from '@/types';
import { logger } from '@/modules';

/**
 * 📞 Call Slice — Zustand store segment for managing call setup flow
 *
 * ✅ UPDATED: Removed duplicate modal state, now uses global modal system
 * ✅ Responsibilities:
 * - Stores the call context (target role, company, type of call, etc.)
 * - Controls the setup flow steps and validation
 * - Handles field updates with error clearing
 * - Integrates with global modal system for setup modal
 */

const SETUP_STEPS = ['basic', 'details', 'objectives', 'review'] as const;

// ✅ ADDED: Modal ID for setup modal in global system
const SETUP_MODAL_ID = 'call-setup-modal';

export const createCallSlice: StateCreator<AppState, [], [], CallContextSlice> = (set, get) => ({
    // ===== CALL CONTEXT STATE =====
    context: null,

    // ❌ REMOVED: Duplicate modal state - now using global modal system
    // isModalOpen: false,

    currentSetupStep: 'basic',
    validationErrors: {},

    /**
     * 🎯 Sets the call context and clears any existing errors.
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

        const contextLabel =
            context.target_role && context.target_organization
                ? `${context.target_role} at ${context.target_organization}`
                : `${context.call_type} call`;

        // ✅ IMPROVED: Use consistent notification pattern
        const state = get();
        state.addNotification({
            type: 'success',
            message: `Call context set: ${contextLabel}`,
            duration: 5000,
        });
    },

    /**
     * 📝 Opens the setup modal using global modal system
     */
    openSetupModal: () => {
        const state = get();

        // ✅ MODIFIED: Use global modal system instead of local state
        state.openGlobalModal(SETUP_MODAL_ID, {
            currentStep: get().currentSetupStep,
            context: get().context,
        });

        // Reset to basic step when opening
        set({ currentSetupStep: 'basic' });

        logger.info('📝 Opened call setup modal using global modal system');
    },

    /**
     * ❌ Closes the setup modal using global modal system
     */
    closeSetupModal: () => {
        const state = get();

        // ✅ MODIFIED: Use global modal system instead of local state
        state.closeGlobalModal(SETUP_MODAL_ID);

        logger.info('❌ Closed call setup modal using global modal system');
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

            // ✅ IMPROVED: Update modal props to reflect step change
            const state = get();
            state.openGlobalModal(SETUP_MODAL_ID, {
                currentStep: nextStep,
                context: get().context,
            });

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

            // ✅ IMPROVED: Update modal props to reflect step change
            const state = get();
            state.openGlobalModal(SETUP_MODAL_ID, {
                currentStep: prevStep,
                context: get().context,
            });

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

        // ✅ IMPROVED: Update modal props if modal is open
        const state = get();
        const modalState = state.globalModals[SETUP_MODAL_ID];
        if (modalState?.isOpen) {
            state.openGlobalModal(SETUP_MODAL_ID, {
                currentStep: 'basic',
                context: get().context,
            });
        }

        logger.info('🔄 Reset setup flow to beginning');
    },

    /**
     * ✏️ Updates a single field in the call context.
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

        const currentErrors = get().validationErrors;
        const remainingErrors = { ...currentErrors };
        delete remainingErrors[field as string];

        set({
            context: updatedContext,
            validationErrors: remainingErrors,
        });

        // ✅ IMPROVED: Update modal props with new context
        const state = get();
        const modalState = state.globalModals[SETUP_MODAL_ID];
        if (modalState?.isOpen) {
            state.openGlobalModal(SETUP_MODAL_ID, {
                currentStep: get().currentSetupStep,
                context: updatedContext,
            });
        }

        logger.debug(`📝 Updated call context field: ${field}`);
    },

    /**
     * ✅ Validates required fields in the context.
     */
    validateContext: () => {
        const context = get().context;
        const errors = validateContext(context || {});

        const isValid = errors.length === 0;

        // ✅ Create more specific error mapping
        const errorObject = errors.reduce((acc, error) => {
            // Map validation errors to specific field names
            const fieldMappings: Record<string, string> = {
                'Call type is required': 'call_type',
                'Call context is required': 'call_context',
                'At least one key point is required': 'key_points',
                'At least one objective is required': 'objectives',
            };

            const fieldKey = fieldMappings[error] || error.toLowerCase().replace(/ /g, '_');
            return { ...acc, [fieldKey]: error };
        }, {});

        set({ validationErrors: errorObject });

        if (!isValid) {
            const state = get();
            // ✅ More specific error message based on missing fields
            const missingFields = errors.length;
            const message =
                missingFields === 1
                    ? `Please complete: ${errors[0].toLowerCase()}`
                    : `Please complete ${missingFields} required fields`;

            state.addNotification({
                type: 'error',
                message,
                duration: 5000,
            });
        }

        return isValid;
    },
});
