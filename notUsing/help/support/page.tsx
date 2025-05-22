// src/app/help/support/page.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Mail, Phone, MessageSquare, FileText, HelpCircle } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Support Center</h1>

            {/* Search Bar */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">
                    How can we help you?
                </h2>
                <div className="flex max-w-md">
                    <Input
                        type="search"
                        placeholder="Search for help..."
                        className="mr-2"
                    />
                    <Button>Search</Button>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <QuickLinkCard
                    icon={<FileText className="h-6 w-6" />}
                    title="Documentation"
                    description="Browse our comprehensive guides and tutorials"
                    link="/docs"
                />
                <QuickLinkCard
                    icon={<MessageSquare className="h-6 w-6" />}
                    title="Community Forum"
                    description="Connect with other users and share knowledge"
                    link="/forum"
                />
                <QuickLinkCard
                    icon={<HelpCircle className="h-6 w-6" />}
                    title="FAQs"
                    description="Find answers to commonly asked questions"
                    link="#faqs"
                />
            </div>

            {/* FAQs */}
            <div className="mb-12" id="faqs">
                <h2 className="text-2xl font-semibold mb-4">
                    Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                    <FAQItem
                        question="How do I reset my password?"
                        answer="To reset your password, click on the 'Forgot Password' link on the login page. Follow the instructions sent to your email to create a new password."
                    />
                    <FAQItem
                        question="Can I use the app offline?"
                        answer="Yes, our app has offline capabilities. You can download content for offline use, and any changes made will sync once you're back online."
                    />
                    <FAQItem
                        question="How do I upgrade my subscription?"
                        answer="To upgrade your subscription, go to your account settings and select 'Subscription'. Choose your desired plan and follow the prompts to complete the upgrade process."
                    />
                    <FAQItem
                        question="Is my data secure?"
                        answer="We take data security very seriously. All data is encrypted in transit and at rest. We use industry-standard security measures to protect your information."
                    />
                </Accordion>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContactCard
                        icon={<Mail className="h-6 w-6" />}
                        title="Email Support"
                        content="support@example.com"
                        description="We typically respond within 24 hours"
                    />
                    <ContactCard
                        icon={<Phone className="h-6 w-6" />}
                        title="Phone Support"
                        content="+1 (555) 123-4567"
                        description="Available Mon-Fri, 9am-5pm EST"
                    />
                </div>
            </div>

            {/* Additional Resources */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    Additional Resources
                </h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>
                        <Link
                            href="/tutorials"
                            className="text-blue-600 hover:underline"
                        >
                            Video Tutorials
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/blog"
                            className="text-blue-600 hover:underline"
                        >
                            Blog Articles
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/changelog"
                            className="text-blue-600 hover:underline"
                        >
                            Product Changelog
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/status"
                            className="text-blue-600 hover:underline"
                        >
                            System Status
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

interface QuickLinkCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    link: string;
}

function QuickLinkCard({ icon, title, description, link }: QuickLinkCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    {icon}
                    <span className="ml-2">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">{description}</p>
                <Button asChild>
                    <Link href={link}>Learn More</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

interface FAQItemProps {
    question: string;
    answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
    return (
        <AccordionItem value={question}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
        </AccordionItem>
    );
}

interface ContactCardProps {
    icon: React.ReactNode;
    title: string;
    content: string;
    description: string;
}

function ContactCard({ icon, title, content, description }: ContactCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    {icon}
                    <span className="ml-2">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg font-medium mb-2">{content}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </CardContent>
        </Card>
    );
}
