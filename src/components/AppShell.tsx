'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        // Auth pages: full screen, no sidebar
        return <>{children}</>;
    }

    // App pages: sidebar + main content
    return (
        <>
            <Sidebar />
            <main className="min-h-screen min-w-0 bg-gray-50 text-black pt-14 md:pt-0 md:ml-64 p-4 md:p-8">
                {children}
            </main>
        </>
    );
}
