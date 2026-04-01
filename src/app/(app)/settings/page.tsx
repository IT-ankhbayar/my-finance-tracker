'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { FeedbackToast } from '@/components/ui/FeedbackToast';
import {
    User, Wallet, Trash2, Loader2,
    Save, LogOut, AlertTriangle,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Хоол', 'Унаа', 'Орон сууц', 'Энтертайнмент', 'Бусад'];

const CATEGORY_COLORS: Record<string, string> = {
    'Хоол': '#3b82f6',
    'Унаа': '#8b5cf6',
    'Орон сууц': '#f59e0b',
    'Энтертайнмент': '#ec4899',
    'Бусад': '#10b981',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">{icon}</div>
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            </div>
            {children}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;

    // Budget state: { category -> limit string }
    const [budgets, setBudgets] = useState<Record<string, string>>(
        Object.fromEntries(CATEGORIES.map((c) => [c, '']))
    );
    const [budgetLoading, setBudgetLoading] = useState(true);
    const [budgetSaving, setBudgetSaving] = useState(false);

    // Delete state
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    function showToast(message: string, type: 'success' | 'error') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        async function loadBudgets() {
            setBudgetLoading(true);

            const { data, error } = await supabase
                .from('budgets')
                .select('category, amount')
                .eq('user_id', userId);

            if (cancelled) return;

            if (!error && data) {
                const map: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c, '']));
                data.forEach(({ category, amount }) => {
                    map[category] = String(amount);
                });
                setBudgets(map);
            }
            setBudgetLoading(false);
        }

        loadBudgets();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    // ── Save budgets ──────────────────────────────────────────────────────────

    const handleSaveBudgets = async () => {
        setBudgetSaving(true);

        const rows = CATEGORIES
            .filter((c) => budgets[c] !== '')
            .map((c) => ({
                user_id: userId!,
                category: c,
                amount: parseFloat(budgets[c]) || 0,
            }));

        // Upsert: insert or update by (user_id, category)
        const { error } = await supabase
            .from('budgets')
            .upsert(rows, { onConflict: 'user_id,category' });

        // Delete rows where user cleared the value
        const cleared = CATEGORIES.filter((c) => budgets[c] === '');
        if (cleared.length > 0) {
            await supabase
                .from('budgets')
                .delete()
                .eq('user_id', userId!)
                .in('category', cleared);
        }

        setBudgetSaving(false);
        if (error) {
            showToast('Хадгалахад алдаа гарлаа', 'error');
        } else {
            showToast('Төсвийн хязгаар хадгалагдлаа!', 'success');
        }
    };

    // ── Clear all expenses ────────────────────────────────────────────────────

    const handleClearData = async () => {
        if (deleteConfirm !== 'УСТГАХ') {
            showToast('Баталгаажуулалтын текст буруу байна', 'error');
            return;
        }

        setDeleteLoading(true);
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('user_id', userId!);

        setDeleteLoading(false);
        setDeleteConfirm('');

        if (error) {
            showToast('Устгахад алдаа гарлаа', 'error');
        } else {
            showToast('Бүх өгөгдөл устгагдлаа', 'success');
        }
    };

    // ── Loading ───────────────────────────────────────────────────────────────

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Тохиргоо</h1>
                <p className="text-gray-400 text-sm mt-1">Дансны болон төсвийн тохиргоо</p>
            </div>

            {/* ── 1. Profile ── */}
            <SectionCard title="Профайл" icon={<User size={20} />}>
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold flex-shrink-0 overflow-hidden">
                        {session?.user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            (session?.user?.name?.[0] ?? '?').toUpperCase()
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2 flex-1">
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Нэр</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {session?.user?.name ?? '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">И-мэйл</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {session?.user?.email ?? '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-400 mt-5 bg-gray-50 rounded-xl p-3">
                    Профайл мэдээлэл нь таны нэвтрэх дансаар (Google г.м) тогтоогддог тул энд өөрчлөх боломжгүй.
                </p>

                {/* Sign out */}
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
                >
                    <LogOut size={16} />
                    Гарах
                </button>
            </SectionCard>

            {/* ── 2. Budget limits ── */}
            <SectionCard title="Сарын төсвийн хязгаар" icon={<Wallet size={20} />}>
                <p className="text-sm text-gray-500 mb-5">
                    Ангилал бүрт сарын зарцуулалтын дээд хязгаар тогтооно уу. Хоосон үлдээвэл хязгаар тавигдахгүй.
                </p>

                {budgetLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="animate-spin text-blue-400" size={24} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {CATEGORIES.map((cat) => {
                            const color = CATEGORY_COLORS[cat];
                            return (
                                <div key={cat} className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                    <label className="text-sm font-medium text-gray-700 w-36 flex-shrink-0">
                                        {cat}
                                    </label>
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Хязгааргүй"
                                            value={budgets[cat]}
                                            onChange={(e) =>
                                                setBudgets((prev) => ({ ...prev, [cat]: e.target.value }))
                                            }
                                            className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₮</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button
                    onClick={handleSaveBudgets}
                    disabled={budgetSaving || budgetLoading}
                    className={`mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all ${budgetSaving ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-blue-100'
                        }`}
                >
                    {budgetSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {budgetSaving ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
            </SectionCard>

            {/* ── 3. Danger zone ── */}
            <SectionCard title="Өгөгдөл устгах" icon={<Trash2 size={20} />}>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">
                            Энэ үйлдэл <strong>буцаах боломжгүй</strong>. Таны бүх зарцуулалтын өгөгдөл бүрмөсөн устана.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                    Баталгаажуулахын тулд доорх талбарт <strong className="text-red-500">УСТГАХ</strong> гэж бичнэ үү:
                </p>

                <input
                    type="text"
                    placeholder="УСТГАХ"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm text-black focus:ring-2 focus:ring-red-400 outline-none transition-all mb-4"
                />

                <button
                    onClick={handleClearData}
                    disabled={deleteConfirm !== 'УСТГАХ' || deleteLoading}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${deleteConfirm === 'УСТГАХ' && !deleteLoading
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {deleteLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    {deleteLoading ? 'Устгаж байна...' : 'Бүх өгөгдөл устгах'}
                </button>
            </SectionCard>

            {/* Toast */}
            {toast && <FeedbackToast message={toast.message} type={toast.type} />}
        </div>
    );
}
