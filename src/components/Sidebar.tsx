'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Wallet, PieChart, Settings, LogOut, User, TrendingUp } from 'lucide-react';

const menuItems = [
    { name: 'Хянах самбар', href: '/', icon: LayoutDashboard },
    { name: 'Зардал нэмэх', href: '/add-expense', icon: Wallet },
    { name: 'Орлого нэмэх', href: '/add-income', icon: TrendingUp },
    { name: 'Статистик', href: '/stats', icon: PieChart },
    { name: 'Тохиргоо', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 fixed left-0 top-0">
            <div className="text-2xl font-bold mb-10 px-2 text-blue-400">
                MyFinance
            </div>

            <nav className="flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
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

            {session && (
                <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gray-700 p-2 rounded-full">
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