// // src/components/call-modal/CallModalContext.tsx
// import { createContext, useContext } from 'react';
// import { CallContext, Participant, CallObjective } from '@/types/callContext';
// import { useCallContextForm } from '@/hooks';

// interface CallModalContextType {
//     context: CallContext;
//     activeTab: string;
//     setActiveTab: (tab: string) => void;
//     updateField: <K extends keyof CallContext>(field: K, value: CallContext[K]) => void;
//     addToArray: <K extends keyof CallContext>(field: K, value: string) => void;
//     removeFromArray: <K extends keyof CallContext>(field: K, index: number) => void;
//     toggleInArray: <K extends keyof CallContext>(field: K, value: string) => void;

//     // Participant management
//     addParticipant: () => void;
//     updateParticipant: (index: number, field: keyof Participant, value: any) => void;
//     removeParticipant: (index: number) => void;

//     // Objective management
//     addObjective: () => void;
//     updateObjective: (index: number, field: keyof CallObjective, value: any) => void;
//     removeObjective: (index: number) => void;
//     updateObjectiveArray: (
//         objectiveIndex: number,
//         field: 'success_metrics' | 'potential_obstacles' | 'fallback_strategies',
//         items: string[]
//     ) => void;

//     isValid: boolean;
//     handleSubmit: () => void;
// }

// const CallModalContext = createContext<CallModalContextType | null>(null);

// export function useCallModal() {
//     const context = useContext(CallModalContext);
//     if (!context) {
//         throw new Error('useCallModal must be used within CallModalProvider');
//     }
//     return context;
// }

// interface CallModalProviderProps {
//     children: React.ReactNode;
//     onSubmit: (context: CallContext) => void;
// }

// export function CallModalProvider({ children, onSubmit }: CallModalProviderProps) {
//     const formMethods = useCallContextForm();

//     // Participant management functions
//     const addParticipant = () => {
//         const newParticipant: Participant = {
//             relationship: 'colleague',
//             current_sentiment: 'neutral',
//         };
//         const updatedParticipants = [...(formMethods.context.participants || []), newParticipant];
//         formMethods.updateField('participants', updatedParticipants);
//     };

//     const updateParticipant = (index: number, field: keyof Participant, value: any) => {
//         const updatedParticipants = [...(formMethods.context.participants || [])];
//         updatedParticipants[index] = { ...updatedParticipants[index], [field]: value };
//         formMethods.updateField('participants', updatedParticipants);
//     };

//     const removeParticipant = (index: number) => {
//         const updatedParticipants = (formMethods.context.participants || []).filter((_, i) => i !== index);
//         formMethods.updateField('participants', updatedParticipants);
//     };

//     // Objective management functions
//     const addObjective = () => {
//         const newObjective: CallObjective = {
//             primary_goal: '',
//             success_metrics: [],
//             potential_obstacles: [],
//             fallback_strategies: [],
//         };
//         const updatedObjectives = [...(formMethods.context.objectives || []), newObjective];
//         formMethods.updateField('objectives', updatedObjectives);
//     };

//     const updateObjective = (index: number, field: keyof CallObjective, value: any) => {
//         const updatedObjectives = [...(formMethods.context.objectives || [])];
//         updatedObjectives[index] = { ...updatedObjectives[index], [field]: value };
//         formMethods.updateField('objectives', updatedObjectives);
//     };

//     const removeObjective = (index: number) => {
//         const updatedObjectives = (formMethods.context.objectives || []).filter((_, i) => i !== index);
//         formMethods.updateField('objectives', updatedObjectives);
//     };

//     const updateObjectiveArray = (
//         objectiveIndex: number,
//         field: 'success_metrics' | 'potential_obstacles' | 'fallback_strategies',
//         items: string[]
//     ) => {
//         const updatedObjectives = [...(formMethods.context.objectives || [])];
//         updatedObjectives[objectiveIndex] = { ...updatedObjectives[objectiveIndex], [field]: items };
//         formMethods.updateField('objectives', updatedObjectives);
//     };

//     const handleSubmit = () => {
//         if (formMethods.isValid) {
//             onSubmit(formMethods.context);
//         }
//     };

//     const value: CallModalContextType = {
//         ...formMethods,
//         addParticipant,
//         updateParticipant,
//         removeParticipant,
//         addObjective,
//         updateObjective,
//         removeObjective,
//         updateObjectiveArray,
//         handleSubmit,
//     };

//     return <CallModalContext.Provider value={value}>{children}</CallModalContext.Provider>;
// }
