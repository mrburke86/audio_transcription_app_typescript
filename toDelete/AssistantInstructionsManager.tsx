// // src/app/assistants/[id]/AssistantInstructionsManager.tsx
// "use client";

// import { useState } from "react";
// import { AssistantInstructionsEdit } from "./AssistantInstructionsEdit";
// import { AssistantInstructionsDisplay } from "./AssistantInstructionsDisplay";

// export default function AssistantInstructionsManager({
//     assistantId,
//     initialInstructions,
// }: {
//     assistantId: string;
//     initialInstructions: string;
// }) {
//     const [instructions, setInstructions] = useState(initialInstructions);
//     const [isEditing, setIsEditing] = useState(false);

//     return isEditing ? (
//         <AssistantInstructionsEdit
//             assistantId={assistantId}
//             instructions={instructions}
//             setInstructions={setInstructions}
//             setIsEditing={setIsEditing}
//         />
//     ) : (
//         <AssistantInstructionsDisplay
//             instructions={instructions}
//             setIsEditing={setIsEditing}
//         />
//     );
// }
