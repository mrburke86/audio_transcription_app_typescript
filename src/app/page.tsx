// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
    // Direct to chat instead of assistants selection
    redirect('/chat');
}
