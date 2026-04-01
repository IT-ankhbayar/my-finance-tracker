'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Wallet, PieChart, Settings, LogOut, User, TrendingUp, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const menuItems = [
    { name: 'Хянах самбар', href: '/', icon: LayoutDashboard },
    { name: 'Зардал нэмэх', href: '/add-expense', icon: Wallet },
    { name: 'Орлого нэмэх', href: '/add-income', icon: TrendingUp },
    { name: 'Статистик', href: '/stats', icon: PieChart },
    { name: 'Тохиргоо', href: '/settings', icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className="w-64 h-full bg-gray-900 text-white flex flex-col p-4">
            {/* Logo + close button (mobile only) */}
            <div className="flex items-center justify-between mb-10 px-2">
                <span className="text-2xl font-bold text-blue-400">MyFinance</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors md:hidden"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-800 text-gray-300'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User profile */}
            {session && (
                <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gray-700 p-2 rounded-full flex-shrink-0">
                            <User size={20} className="text-gray-300" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{session?.user?.name ?? 'Хэрэглэгч'}</p>
                            <p className="text-[10px] text-gray-400 truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 w-full p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Гарах
                    </button>
                </div>
            )}

            <div className="border-t border-gray-800 pt-4 text-sm text-gray-500 px-2">
                © 2026 Finance App
            </div>
        </div>
    );
}

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <>
            {/* ── Desktop sidebar (always visible on md+) ── */}
            <div className="hidden md:flex fixed left-0 top-0 h-screen z-30">
                <SidebarContent />
            </div>

            {/* ── Mobile top bar ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow-lg">
                <span className="text-xl font-bold text-blue-400">MyFinance</span>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Mobile drawer ── */}
            <div
                className={`md:hidden fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent onClose={() => setMobileOpen(false)} />
            </div>
        </>
    );
}
