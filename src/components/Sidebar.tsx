import Link from 'next/link';
import { LayoutDashboard, Wallet, PieChart, Settings } from 'lucide-react';

const menuItems = [
    { name: 'Хянах самбар', href: '/', icon: LayoutDashboard },
    { name: 'Зардал нэмэх', href: '/add-expense', icon: Wallet },
    { name: 'Статистик', href: '/stats', icon: PieChart },
    { name: 'Тохиргоо', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 fixed left-0 top-0">
            <div className="text-2xl font-bold mb-10 px-2 text-blue-400">
                MyFinance
            </div>

            <nav className="flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="border-t border-gray-800 pt-4 text-sm text-gray-400 px-2">
                © 2026 Finance App
            </div>
        </div>
    );
}