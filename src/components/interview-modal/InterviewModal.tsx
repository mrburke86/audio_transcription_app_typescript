// src/components/interview-modal/InterviewModal.tsx
import { useInterviewContextForm } from '@/hooks/new/useInterviewContextForm';
import { InitialInterviewContext } from '@/types';
import { createContext, useContext } from 'react';

interface InterviewModalContextType {
    context: InitialInterviewContext;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    updateField: <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => void;
    addToArray: <K extends keyof InitialInterviewContext>(field: K, value: string) => void;
    removeFromArray: <K extends keyof InitialInterviewContext>(field: K, index: number) => void;
    toggleInArray: <K extends keyof InitialInterviewContext>(field: K, value: string) => void;
    isValid: boolean;
    handleSubmit: () => void;
}

const InterviewModalContext = createContext<InterviewModalContextType | null>(null);

export function useInterviewModal() {
    const context = useContext(InterviewModalContext);
    if (!context) {
        throw new Error('useInterviewModal must be used within InterviewModalProvider');
    }
    return context;
}

interface InterviewModalProviderProps {
    children: React.ReactNode;
    onSubmit: (context: InitialInterviewContext) => void;
}

export function InterviewModalProvider({ children, onSubmit }: InterviewModalProviderProps) {
    const formMethods = useInterviewContextForm();

    const handleSubmit = () => {
        if (formMethods.isValid) {
            const roleDescription = `You are generating responses for ${formMethods.context.targetRole} at ${formMethods.context.targetCompany}...`;

            onSubmit({
                ...formMethods.context,
                roleDescription,
            });
        }
    };

    const value: InterviewModalContextType = {
        ...formMethods,
        handleSubmit,
    };

    return <InterviewModalContext.Provider value={value}>{children}</InterviewModalContext.Provider>;
}
