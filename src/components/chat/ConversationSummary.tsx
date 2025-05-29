// // src/components/chat/ConversationSummary.tsx
// "use client";
// import React from "react";

// interface ConversationSummaryProps {
//     summary: string;
//     goals: string[]; // New prop
// }

// const ConversationSummary: React.FC<ConversationSummaryProps> = ({
//     summary,
//     goals,
// }) => {
//     if (!summary && goals.length === 0) return null;

//     return (
//         <div
//             className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
//             role="alert"
//         >
//             {goals.length > 0 && (
//                 <>
//                     <p className="font-bold">Conversation Goals/Milestones</p>
//                     <ul className="list-disc list-inside mb-2">
//                         {goals.map((goal, index) => (
//                             <li key={index}>{goal}</li>
//                         ))}
//                     </ul>
//                 </>
//             )}
//             {summary && (
//                 <>
//                     <p className="font-bold">Conversation Summary</p>
//                     <p>{summary}</p>
//                 </>
//             )}
//         </div>
//     );
// };

// export default ConversationSummary;
