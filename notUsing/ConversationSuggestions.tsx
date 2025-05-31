// // src/components/chat/ConversationSuggestions.tsx

// import { Sparkles } from "lucide-react";
// import { useState } from "react";
// import { Button } from "../ui";
// import Skeleton from "../ui/skeleton";

// interface ConversationSuggestionsProps {
//     suggestions: {
//         questions: string[];
//         statements: string[];
//     };
//     onSuggest: () => void;
//     isLoading: boolean;
// }

// interface Feedback {
//     [key: string]: string; // e.g., "questions-0": "good"
// }

// const ConversationSuggestions: React.FC<ConversationSuggestionsProps> = ({
//     suggestions,
//     onSuggest,
//     isLoading,
// }) => {
//     const [feedback, setFeedback] = useState<Feedback>({});

//     const handleFeedback = (
//         category: "questions" | "statements",
//         index: number,
//         rating: string,
//     ) => {
//         setFeedback((prev) => ({ ...prev, [`${category}-${index}`]: rating }));
//         // Optionally, send feedback to your backend for analysis
//     };

//     // ...existing rendering logic

//     return (
//         <div
//             className="flex flex-col h-full p-4 rounded shadow"
//             role="region"
//             aria-labelledby="suggestions-heading"
//         >
//             {/* Header with Title and Suggest Button */}
//             <div className="flex justify-between items-center mb-4">
//                 <p id="suggestions-heading" className="font-bold text-xl ">
//                     Suggestions
//                 </p>
//                 <Button
//                     variant="outline"
//                     onClick={onSuggest}
//                     disabled={isLoading}
//                     className="flex items-center"
//                     aria-label="Generate new suggestions"
//                 >
//                     <Sparkles className="mr-2 h-4 w-4" />
//                     {isLoading ? "Generating..." : "Suggest"}
//                 </Button>
//             </div>

//             {/* Loading State */}
//             {isLoading ? (
//                 <Skeleton count={6} className="h-6 bg-gray-200 rounded mb-2" />
//             ) : (
//                 // Suggestions List
//                 <div className="flex flex-col space-y-6">
//                     {/* Questions Section */}
//                     {suggestions.questions.length > 0 && (
//                         <div>
//                             <h3 className="font-semibold text-lg text-blue-500  mb-2">
//                                 Questions
//                             </h3>
//                             <ul className="list-disc list-inside space-y-2 ">
//                                 {suggestions.questions.map(
//                                     (question, index) => (
//                                         <li
//                                             key={index}
//                                             className="p-1 rounded text-ring"
//                                         >
//                                             {question}
//                                             {/* Feedback Dropdown */}
//                                             <select
//                                                 value={
//                                                     feedback[
//                                                         `questions-${index}`
//                                                     ] || ""
//                                                 }
//                                                 onChange={(e) =>
//                                                     handleFeedback(
//                                                         "questions",
//                                                         index,
//                                                         e.target.value,
//                                                     )
//                                                 }
//                                                 className="ml-4 border border-gray-300 rounded p-1"
//                                                 aria-label={`Feedback for question ${
//                                                     index + 1
//                                                 }`}
//                                             >
//                                                 <option value="">Rate</option>
//                                                 <option value="good">
//                                                     Good
//                                                 </option>
//                                                 <option value="neutral">
//                                                     Neutral
//                                                 </option>
//                                                 <option value="bad">Bad</option>
//                                             </select>
//                                         </li>
//                                     ),
//                                 )}
//                             </ul>
//                         </div>
//                     )}

//                     {/* Statements Section */}
//                     {suggestions.statements.length > 0 && (
//                         <div>
//                             <h3 className="font-semibold text-lg text-blue-500  mb-2">
//                                 Statements
//                             </h3>
//                             <ul className="list-disc list-inside space-y-2">
//                                 {suggestions.statements.map(
//                                     (statement, index) => (
//                                         <li
//                                             key={index}
//                                             className="p-1 rounded text-ring"
//                                         >
//                                             {statement}
//                                             {/* Feedback Dropdown */}
//                                             <select
//                                                 value={
//                                                     feedback[
//                                                         `statements-${index}`
//                                                     ] || ""
//                                                 }
//                                                 onChange={(e) =>
//                                                     handleFeedback(
//                                                         "statements",
//                                                         index,
//                                                         e.target.value,
//                                                     )
//                                                 }
//                                                 className="ml-4 border border-gray-300 rounded p-1"
//                                                 aria-label={`Feedback for statement ${
//                                                     index + 1
//                                                 }`}
//                                             >
//                                                 <option value="">Rate</option>
//                                                 <option value="good">
//                                                     Good
//                                                 </option>
//                                                 <option value="neutral">
//                                                     Neutral
//                                                 </option>
//                                                 <option value="bad">Bad</option>
//                                             </select>
//                                         </li>
//                                     ),
//                                 )}
//                             </ul>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ConversationSuggestions;
