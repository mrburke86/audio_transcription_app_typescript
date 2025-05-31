// // src/app/help/knowledge/page.tsx
// "use client";

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Search, ChevronRight } from "lucide-react";
// import Link from "next/link";

// // Mock data for knowledge base articles
// const articles = [
//     {
//         id: 1,
//         title: "Getting Started with AI Assistants",
//         category: "Basics",
//         excerpt: "Learn how to set up and use your first AI assistant.",
//     },
//     {
//         id: 2,
//         title: "Advanced Prompting Techniques",
//         category: "Advanced",
//         excerpt:
//             "Discover strategies to get the most out of your AI interactions.",
//     },
//     {
//         id: 3,
//         title: "Troubleshooting Common Issues",
//         category: "Support",
//         excerpt:
//             "Solutions to frequently encountered problems with AI assistants.",
//     },
//     {
//         id: 4,
//         title: "AI Ethics and Best Practices",
//         category: "Guidelines",
//         excerpt: "Understanding the ethical considerations when using AI.",
//     },
//     {
//         id: 5,
//         title: "Customizing Your AI Assistant",
//         category: "Customization",
//         excerpt:
//             "Learn how to tailor your AI assistant to your specific needs.",
//     },
// ];

// export default function KnowledgeBase() {
//     const [searchTerm, setSearchTerm] = useState("");

//     const filteredArticles = articles.filter((article) =>
//         article.title.toLowerCase().includes(searchTerm.toLowerCase()),
//     );

//     return (
//         <div className="container mx-auto p-4 space-y-6">
//             <h1 className="text-3xl font-bold mb-6">Knowledge Base</h1>

//             <div className="flex space-x-2 mb-6">
//                 <Input
//                     type="search"
//                     placeholder="Search articles..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="max-w-md"
//                 />
//                 <Button>
//                     <Search className="mr-2 h-4 w-4" /> Search
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredArticles.map((article) => (
//                     <Card
//                         key={article.id}
//                         className="hover:shadow-lg transition-shadow duration-300"
//                     >
//                         <CardHeader>
//                             <CardTitle className="text-lg">
//                                 {article.title}
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <p className="text-sm text-muted-foreground mb-2">
//                                 {article.excerpt}
//                             </p>
//                             <div className="flex justify-between items-center">
//                                 <span className="text-sm font-medium">
//                                     {article.category}
//                                 </span>
//                                 <Button variant="ghost" size="sm" asChild>
//                                     <Link
//                                         href={`/help/knowledge-base/${article.id}`}
//                                     >
//                                         Read More{" "}
//                                         <ChevronRight className="ml-2 h-4 w-4" />
//                                     </Link>
//                                 </Button>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 ))}
//             </div>

//             {filteredArticles.length === 0 && (
//                 <p className="text-center text-muted-foreground mt-6">
//                     No articles found. Try a different search term.
//                 </p>
//             )}
//         </div>
//     );
// }
