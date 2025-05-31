// "use client";

// import {
//     Atom,
//     LifeBuoy,
//     Eclipse,
//     Send,
//     Settings2,
//     SquareTerminal,
// } from "lucide-react";

// import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
// import { NavSecondary } from "@/components/nav-secondary";
// import { NavUser } from "@/components/nav-user";
// import { StorageCard } from "@/components/storage-card";
// import { TeamSwitcher } from "@/components/team-switcher";
// import {
//     Sidebar,
//     SidebarContent,
//     SidebarFooter,
//     SidebarHeader,
//     SidebarItem,
//     SidebarLabel,
// } from "@/components/ui/sidebar";
// const data = {
//     teams: [
//         {
//             name: "Mark Burke",
//             logo: Atom,
//             plan: "Enterprise",
//         },
//         {
//             name: "Jane Smith",
//             logo: Eclipse,
//             plan: "Startup",
//         },
//     ],
//     user: {
//         name: "Mark Rhys Burke",
//         email: "hello@markrhysburke.com",
//         avatar: "/mark_rhys_burke_profile_pic.jpg",
//     },
//     navMain: [
//         // Assistants
//         {
//             title: "Assistants",
//             url: "/assistants",
//             icon: SquareTerminal,
//             isActive: true,
//             items: [
//                 {
//                     title: "View Assistants",
//                     url: "/assistants",
//                     icon: SquareTerminal,
//                     description: "View and chat with assistants",
//                 },
//                 // Remove "Create Assistant" item
//             ],
//         },
//         {
//             title: "Settings",
//             url: "#",
//             icon: Settings2,
//             items: [
//                 {
//                     title: "General",
//                     url: "#",
//                 },
//                 {
//                     title: "Team",
//                     url: "#",
//                 },
//                 {
//                     title: "Billing",
//                     url: "#",
//                 },
//                 {
//                     title: "Limits",
//                     url: "#",
//                 },
//             ],
//         },
//     ],

//     navSecondary: [
//         {
//             title: "Support",
//             url: "#",
//             icon: LifeBuoy,
//         },
//         {
//             title: "Feedback",
//             url: "#",
//             icon: Send,
//         },
//     ],
//     projects: [
//         // {
//         //     name: "Design Engineering",
//         //     url: "#",
//         //     icon: Frame,
//         // },
//         // {
//         //     name: "Sales & Marketing",
//         //     url: "#",
//         //     icon: PieChart,
//         // },
//         // {
//         //     name: "Travel",
//         //     url: "#",
//         //     icon: Map,
//         // },
//     ],
//     searchResults: [
//         {
//             title: "Routing Fundamentals",
//             teaser: "The skeleton of every application is routing. This page will introduce you to the fundamental concepts of routing for the web and how to handle routing in Next.js.",
//             url: "#",
//         },
//         {
//             title: "Layouts and Templates",
//             teaser: "The special files layout.js and template.js allow you to create UI that is shared between routes. This page will guide you through how and when to use these special files.",
//             url: "#",
//         },
//         {
//             title: "Data Fetching, Caching, and Revalidating",
//             teaser: "Data fetching is a core part of any application. This page goes through how you can fetch, cache, and revalidate data in React and Next.js.",
//             url: "#",
//         },
//         {
//             title: "Server and Client Composition Patterns",
//             teaser: "When building React applications, you will need to consider what parts of your application should be rendered on the server or the client. ",
//             url: "#",
//         },
//         {
//             title: "Server Actions and Mutations",
//             teaser: "Server Actions are asynchronous functions that are executed on the server. They can be used in Server and Client Components to handle form submissions and data mutations in Next.js applications.",
//             url: "#",
//         },
//     ],
// };

// export function AppSidebar() {
//     return (
//         <Sidebar>
//             <SidebarHeader>
//                 <TeamSwitcher teams={data.teams} />
//             </SidebarHeader>
//             <SidebarContent>
//                 <SidebarItem>
//                     <SidebarLabel>Platform</SidebarLabel>
//                     <NavMain
//                         items={data.navMain}
//                         searchResults={data.searchResults}
//                     />
//                 </SidebarItem>
//                 <SidebarItem>
//                     <SidebarLabel>Projects</SidebarLabel>
//                     <NavProjects projects={data.projects} />
//                 </SidebarItem>
//                 <SidebarItem className="mt-auto">
//                     <SidebarLabel>Help</SidebarLabel>
//                     <NavSecondary items={data.navSecondary} />
//                 </SidebarItem>
//                 <SidebarItem>
//                     <StorageCard />
//                 </SidebarItem>
//             </SidebarContent>
//             <SidebarFooter>
//                 <NavUser user={data.user} />
//             </SidebarFooter>
//         </Sidebar>
//     );
// }
