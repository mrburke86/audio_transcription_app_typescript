// // src/app/chat/[assistantId]/page.tsx

// import React from "react";
// import ChatComponent from "@/components/chat/ChatComponent";
// import { getAssistantById } from "@/app/actions/fetch-assistants";

// export default async function ChatPage({
//   params,
// }: {
//   params: { assistantId: string };
// }) {
//   const assistant = await getAssistantById(params.assistantId);

//   if (!assistant) {
//     return <div>Error loading assistant details.</div>;
//   }

//   return (
//     <ChatComponent
//       // assistantId={assistant.id}
//       // roleDescription={assistant.metadata.role_description || ""}
//     />
//   );
// }
