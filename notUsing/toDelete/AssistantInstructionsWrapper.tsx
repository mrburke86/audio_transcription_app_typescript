// // src/app/assistants/[id]/AssistantInstructionsWrapper.tsx
// import dynamic from "next/dynamic";

// const AssistantInstructionsContent = dynamic(
//     () => import("./AssistantInstructionsContent"),
//     { ssr: true, loading: () => <p>Loading instructions...</p> },
// );

// export function AssistantInstructionsWrapper({
//     instructions,
// }: {
//     instructions: string;
// }) {
//     return <AssistantInstructionsContent instructions={instructions} />;
// }
