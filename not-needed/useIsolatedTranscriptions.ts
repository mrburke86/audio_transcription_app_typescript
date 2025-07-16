// // src\app\chat\_hooks\useIsolatedTranscriptions.ts
// import { Message } from '@/types';
// import { useCallback, useState } from 'react';

// export const useIsolatedTranscriptions = () => {
//     const [interimTranscriptions, setInterimTranscriptions] = useState<Message[]>([]);
//     const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');

//     const updateInterimTranscript = useCallback((transcript: string) => {
//         setCurrentInterimTranscript(transcript);
//     }, []);

//     const addInterimTranscription = useCallback((message: Message) => {
//         setInterimTranscriptions(prev => [...prev, message]);
//     }, []);

//     const clearInterimTranscriptions = useCallback(() => {
//         setInterimTranscriptions([]);
//         setCurrentInterimTranscript('');
//     }, []);

//     return {
//         interimTranscriptions,
//         currentInterimTranscript,
//         updateInterimTranscript,
//         addInterimTranscription,
//         clearInterimTranscriptions,
//     };
// };
