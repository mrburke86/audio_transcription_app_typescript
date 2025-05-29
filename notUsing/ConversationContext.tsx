// // src\components\chat\ConversationContext.tsx
// 'use client';

// import { Activity } from 'lucide-react';
// import type React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui';
// import { useEffect } from 'react';

// interface ConversationContextProps {
//     summary: string;
//     goals: string[]; // New prop
// }

// const ConversationContext: React.FC<ConversationContextProps> = ({ summary, goals }) => {
//     useEffect(() => {
//         console.log('ConversationContext received summary:', summary);
//         console.log('ConversationContext received goals:', goals);
//     }, [summary, goals]);

//     // const renderGoals = () => {
//     //     if (goals.length === 0) return null;

//     //     return (
//     //         <>
//     //             <p className="font-bold">Conversation Goals/Milestones</p>
//     //             <ul className="list-disc list-inside mb-2">
//     //                 {goals.map((goal, index) => (
//     //                     <li key={index}>{goal}</li>
//     //                 ))}
//     //             </ul>
//     //         </>
//     //     );
//     // };

//     const renderSummary = () => {
//         if (!summary) return null;

//         return (
//             <>
//                 <p className="font-bold">Conversation Summary</p>
//                 <p>{summary}</p>
//             </>
//         );
//     };

//     const hasContent = summary || goals.length > 0;

//     return (
//         <Card className="h-full flex flex-col p-4">
//             {/* Header */}
//             <CardHeader className="p-0">
//                 <CardTitle className="flex items-center gap-2 p-0">
//                     <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
//                         <Activity className="w-3 h-3 text-orange-600" />
//                     </div>

//                     <h3 className="text-sm font-medium text-gray-900">Context</h3>
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 {hasContent ? (
//                     <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded" role="alert">
//                         {goals.length > 0 && (
//                             <>
//                                 <p className="font-bold">Conversation Goals/Milestones</p>
//                                 <ul className="list-disc list-inside mb-2">
//                                     {goals.map((goal, index) => (
//                                         <li key={index}>{goal}</li>
//                                     ))}
//                                 </ul>
//                             </>
//                         )}
//                         {renderSummary()}
//                     </div>
//                 ) : (
//                     <div>
//                         <p className="text-gray-500 italic">No context available</p>
//                         {/* Debug info */}
//                         <p className="text-xs text-gray-400 mt-2">
//                             Debug: Summary length: {summary?.length || 0}, Goals: {goals.length}
//                         </p>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     );
// };

// export default ConversationContext;
