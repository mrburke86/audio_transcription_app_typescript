// // src/app/help/faq/page.tsx
// "use client";

// import React from "react";
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// const faqData = [
//     {
//         question: "What is an AI Assistant?",
//         answer: "An AI Assistant is a computer program that uses artificial intelligence to understand and respond to user queries, perform tasks, and provide information across various domains.",
//     },
//     {
//         question: "How do I create a new AI Assistant?",
//         answer: 'To create a new AI Assistant, navigate to the "Assistants" page and click on the "Create Assistant" button. Follow the prompts to set up your assistant\'s name, description, and capabilities.',
//     },
//     {
//         question: "Can I customize my AI Assistant's behavior?",
//         answer: "Yes, you can customize your AI Assistant's behavior by editing its instructions, selecting specific tools it can use, and fine-tuning its parameters like temperature and top-p values.",
//     },
//     {
//         question: "What types of files can I upload to my AI Assistant?",
//         answer: "You can upload various file types including text documents, PDFs, and images. The AI Assistant can then use these files for reference or analysis during conversations.",
//     },
//     {
//         question: "How do I start a conversation with my AI Assistant?",
//         answer: 'To start a conversation, go to the "Chat" page, select your desired AI Assistant, and begin typing your message in the input field at the bottom of the screen.',
//     },
//     {
//         question: "Is my conversation data secure?",
//         answer: "We take data security seriously. All conversations are encrypted and stored securely. We do not share your data with third parties. For more details, please refer to our privacy policy.",
//     },
//     {
//         question: "Can I export my conversation history?",
//         answer: 'Yes, you can export your conversation history. Look for the "Export" option in the chat interface or in your account settings.',
//     },
//     {
//         question: "How do I report an issue or provide feedback?",
//         answer: 'To report an issue or provide feedback, please use the "Contact Support" option in the Help & Support section of the sidebar. We appreciate your input and are constantly working to improve our service.',
//     },
// ];

// export default function FAQPage() {
//     return (
//         <div className="container mx-auto p-4 space-y-6">
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="text-2xl font-bold">
//                         Frequently Asked Questions
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <Accordion type="single" collapsible className="w-full">
//                         {faqData.map((faq, index) => (
//                             <AccordionItem key={index} value={`item-${index}`}>
//                                 <AccordionTrigger>
//                                     {faq.question}
//                                 </AccordionTrigger>
//                                 <AccordionContent>
//                                     {faq.answer}
//                                 </AccordionContent>
//                             </AccordionItem>
//                         ))}
//                     </Accordion>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
