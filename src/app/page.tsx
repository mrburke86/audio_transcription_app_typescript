// // src/app/page.tsx
// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Link from "next/link";
// import { Plus, FileAudio, Mail, Bot, Clock } from "lucide-react";

// // Mock data
// const mockAssistants = [
//     {
//         id: "1",
//         name: "Audio Transcription Assistant",
//         description: "Transcribes audio files",
//     },
//     {
//         id: "2",
//         name: "Email Drafting Assistant",
//         description: "Helps draft professional emails",
//     },
//     {
//         id: "3",
//         name: "Data Analysis Assistant",
//         description: "Analyzes data and creates reports",
//     },
//     {
//         id: "4",
//         name: "Code Review Assistant",
//         description: "Reviews code and suggests improvements",
//     },
//     {
//         id: "5",
//         name: "Meeting Notes Assistant",
//         description: "Summarizes meeting notes",
//     },
// ];

// const mockRecentChats = [
//     {
//         id: "1",
//         assistantId: "1",
//         assistantName: "Audio Transcription Assistant",
//         lastMessage: "Transcription completed",
//         timestamp: "2 hours ago",
//     },
//     {
//         id: "2",
//         assistantId: "2",
//         assistantName: "Email Drafting Assistant",
//         lastMessage: "Email draft ready",
//         timestamp: "1 day ago",
//     },
//     {
//         id: "3",
//         assistantId: "3",
//         assistantName: "Data Analysis Assistant",
//         lastMessage: "Analysis report generated",
//         timestamp: "3 days ago",
//     },
// ];

// export default function Dashboard() {
//     const [searchTerm, setSearchTerm] = useState("");

//     const filteredAssistants = mockAssistants.filter((assistant) =>
//         assistant.name.toLowerCase().includes(searchTerm.toLowerCase()),
//     );

//     return (
//         <div className="container mx-auto p-4 space-y-6">
//             <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

//             <div className="flex justify-between items-center mb-6">
//                 <Input
//                     type="search"
//                     placeholder="Search assistants..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="max-w-sm"
//                 />
//                 <Button asChild>
//                     <Link href="/assistants/create">
//                         <Plus className="mr-2 h-4 w-4" /> Create Assistant
//                     </Link>
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <QuickActions />

//                 <RecentChats />

//                 <YourAssistants filteredAssistants={filteredAssistants} />
//             </div>
//         </div>
//     );
// }

// // YourAssistants
// interface YourAssistantsProps {
//     filteredAssistants: { id: string; name: string; description: string }[];
// }

// function YourAssistants({ filteredAssistants }: YourAssistantsProps) {
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Your Assistants</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <ul className="space-y-2">
//                     {filteredAssistants.slice(0, 5).map((assistant) => (
//                         <li key={assistant.id}>
//                             <Link
//                                 href={`/chat/${assistant.id}`}
//                                 className="flex items-center"
//                             >
//                                 <Bot className="mr-2 h-4 w-4" />
//                                 <span>{assistant.name}</span>
//                             </Link>
//                         </li>
//                     ))}
//                 </ul>
//                 {filteredAssistants.length > 5 && (
//                     <Button variant="link" asChild className="mt-2">
//                         <Link href="/assistants">View all assistants</Link>
//                     </Button>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

// // RecentChats
// function RecentChats() {
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Recent Chats</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <ul className="space-y-2">
//                     {mockRecentChats.map((chat) => (
//                         <li
//                             key={chat.id}
//                             className="flex items-center justify-between"
//                         >
//                             <Link
//                                 href={`/chat/${chat.assistantId}`}
//                                 className="flex items-center"
//                             >
//                                 <Clock className="mr-2 h-4 w-4" />
//                                 <span>{chat.assistantName}</span>
//                             </Link>
//                             <span className="text-sm text-muted-foreground">
//                                 {chat.timestamp}
//                             </span>
//                         </li>
//                     ))}
//                 </ul>
//             </CardContent>
//         </Card>
//     );
// }

// // QuickActions
// function QuickActions() {
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Quick Actions</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//                 <Button variant="outline" className="w-full justify-start">
//                     <FileAudio className="mr-2 h-4 w-4" /> New Audio
//                     Transcription
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start">
//                     <Mail className="mr-2 h-4 w-4" /> Draft Email
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start">
//                     <Bot className="mr-2 h-4 w-4" /> Chat with AI Assistant
//                 </Button>
//             </CardContent>
//         </Card>
//     );
// }

// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
    // Direct to chat instead of assistants selection
    redirect('/chat');
}
