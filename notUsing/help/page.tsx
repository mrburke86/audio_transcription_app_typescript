// // src/app/help/page.tsx
// import React from "react";
// import Link from "next/link";
// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardDescription,
//     CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//     HelpCircle,
//     MessageSquare,
//     BookOpen,
//     HeadphonesIcon,
// } from "lucide-react";

// const helpOptions = [
//     {
//         title: "Frequently Asked Questions",
//         description:
//             "Find quick answers to common questions about our platform.",
//         icon: HelpCircle,
//         href: "/help/faq",
//     },
//     {
//         title: "Provide Feedback",
//         description: "Share your thoughts and help us improve our services.",
//         icon: MessageSquare,
//         href: "/help/feedback",
//     },
//     {
//         title: "Knowledge Base",
//         description:
//             "Explore in-depth articles and tutorials on various topics.",
//         icon: BookOpen,
//         href: "/help/knowledge",
//     },
//     {
//         title: "Support Center",
//         description: "Get personalized assistance from our support team.",
//         icon: HeadphonesIcon,
//         href: "/help/support",
//     },
// ];

// export default function HelpPage() {
//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-4xl font-bold mb-8 text-center">
//                 How Can We Help You?
//             </h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {helpOptions.map((option) => (
//                     <Card
//                         key={option.href}
//                         className="hover:shadow-lg transition-shadow duration-300"
//                     >
//                         <CardHeader>
//                             <CardTitle className="flex items-center text-2xl">
//                                 <option.icon className="mr-2 h-6 w-6 text-primary" />
//                                 {option.title}
//                             </CardTitle>
//                             <CardDescription>
//                                 {option.description}
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <Button asChild className="w-full">
//                                 <Link href={option.href}>Explore</Link>
//                             </Button>
//                         </CardContent>
//                     </Card>
//                 ))}
//             </div>
//         </div>
//     );
// }
