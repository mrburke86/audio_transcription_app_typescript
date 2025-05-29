// // src/app/assistants/page.tsx
// import { AssistantTabs } from "./AssistantTabs";
// import { fetchAssistants } from "../actions/fetch-assistants";

// export default async function AssistantsPage() {
//     const assistants = await fetchAssistants();

// return (
//     <div className="container mx-auto p-4 space-y-6">
//         <div className="flex justify-between items-center mb-6">
//             <h1 className="text-3xl font-bold">Choose an Assistant</h1>
//             <p className="text-muted-foreground">
//                 Manage assistants in OpenAI Playground
//             </p>
//         </div>
//         <AssistantTabs assistants={assistants} />
//     </div>
//     );
// }
