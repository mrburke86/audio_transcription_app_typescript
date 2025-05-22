// // src/app/assistants/[category]/[id]/page.tsx

// import { AssistantFileManagement } from "./AssistantFileManagement";
// import AssistantInstructions from "./AssistantInstructions";
// import AssistantRoleDescription from "./AssistantRoleDescription";
// import AssistantDetails from "./AssistantDetails";
// import { getAssistantById } from "@/lib/openai";

// export default async function AssistantPage({
//     params,
// }: {
//     params: { category: string; id: string };
// }) {
//     const result = await getAssistantById(params.id);

//     if (!result) {
//         return (
//             <div className="text-center text-red-500">
//                 Error loading assistant details. Please try again later.
//             </div>
//         );
//     }

//     const { assistant, vectorStoreId, files } = result;

//     const roleDescription = "";

//     return (
//         <div className="container mx-auto p-4 space-y-8">
//             <AssistantDetails initialAssistant={assistant} />
//             <AssistantFileManagement
//                 assistant={assistant}
//                 vectorStoreId={vectorStoreId}
//                 files={files}
//             />
//             <AssistantInstructions
//                 assistantId={params.id}
//                 initialInstructions={assistant.instructions || ""}
//             />
//             <AssistantRoleDescription
//                 assistantId={params.id}
//                 initialRoleDescription={roleDescription}
//             />
//         </div>
//     );
// }
