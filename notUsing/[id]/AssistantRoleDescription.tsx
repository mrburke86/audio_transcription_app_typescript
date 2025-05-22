// // src/app/assistants/[category]/[id]/AssistantRoleDescription.tsx
// "use client";
// import React, { useState } from "react";
// import { updateAssistantRoleDescription } from "@/utils/assistantUtils";

// interface AssistantRoleDescriptionProps {
//     assistantId: string;
//     initialRoleDescription: string;
// }

// const AssistantRoleDescription: React.FC<AssistantRoleDescriptionProps> = ({
//     assistantId,
//     initialRoleDescription,
// }) => {
//     const [roleDescription, setRoleDescription] = useState(
//         initialRoleDescription,
//     );
//     const [isEditing, setIsEditing] = useState(false);

//     const handleSave = async () => {
//         try {
//             await updateAssistantRoleDescription(assistantId, roleDescription);
//             setIsEditing(false);
//         } catch (error) {
//             console.error("Failed to update role description:", error);
//         }
//     };

//     return (
//         <div className="bg-white shadow rounded-lg p-4">
//             <h2 className="text-xl font-bold mb-4">Role Description</h2>
//             {isEditing ? (
//                 <>
//                     <textarea
//                         value={roleDescription}
//                         onChange={(e) => setRoleDescription(e.target.value)}
//                         className="w-full h-32 p-2 border rounded"
//                     />
//                     <div className="mt-2">
//                         <button
//                             onClick={handleSave}
//                             className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
//                         >
//                             Save
//                         </button>
//                         <button
//                             onClick={() => setIsEditing(false)}
//                             className="bg-gray-300 px-4 py-2 rounded"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </>
//             ) : (
//                 <>
//                     <p className="mb-2">{roleDescription}</p>
//                     <button
//                         onClick={() => setIsEditing(true)}
//                         className="bg-gray-200 px-4 py-2 rounded"
//                     >
//                         Edit
//                     </button>
//                 </>
//             )}
//         </div>
//     );
// };

// export default AssistantRoleDescription;
