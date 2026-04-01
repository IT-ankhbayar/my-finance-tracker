'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { Expense } from '@/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus,
    Loader2, BarChart2, Tag, Flame, CalendarDays, Download
} from 'lucide-react';

interface Income {
    id: string;
    title: string;
    amount: number;
    category: string;
    created_at: string;
}

function exportToCSV(expenses: Expense[], incomes: Income[], range: string) {
    const rows: string[] = [
        ['Төрөл', 'Гарчиг', 'Дүн (₮)', 'Ангилал', 'Огноо'].join(','),
    ];

    expenses.forEach((e) => {
        rows.push([
            'Зардал',
            `"${e.title.replace(/"/g, '""')}"`,
            e.amount,
            `"${e.category}"`,
            new Date(e.created_at).toLocaleDateString('mn-MN'),
        ].join(','));
    });

    incomes.forEach((i) => {
        rows.push([
            'Орлого',
            `"${i.title.replace(/"/g, '""')}"`,
            i.amount,
            `"${i.category}"`,
            new Date(i.created_at).toLocaleDateString('mn-MN'),
        ].join(','));
    });

    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myfinance-${range}сар-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
    'Хоол': '#3b82f6', // blue
    'Унаа': '#8b5cf6', // violet
    'Орон сууц': '#f59e0b', // amber
    'Энтертайнмент': '#ec4899', // pink
    'Бусад': '#10b981', // emerald
};

const MONTHS_MN = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
    '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number) {
    return new Intl.NumberFormat('mn-MN').format(Math.round(amount)) + ' ₮';
}

function pct(value: number, total: number) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    icon, label, value, sub, trend,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    trend?: 'up' | 'down' | 'flat';
}) {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-gray-400';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">{icon}</div>
                {trend && <TrendIcon size={18} className={trendColor} />}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

function CategoryBar({ category, amount, total }: { category: string; amount: number; total: number }) {
    const percentage = pct(amount, total);
    const color = CATEGORY_COLORS[category] ?? '#6b7280';

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-medium text-gray-700">{category}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{percentage}%</span>
                    <span className="font-semibold text-gray-800">{fmt(amount)}</span>
                </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

// ─── Custom Tooltip for Bar Chart ─────────────────────────────────────────────

type TooltipPayloadItem = {
    value: number;
};

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-sm">
                <p className="text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-gray-800">{fmt(payload[0].value)}</p>
            </div>
        );
    }
    return null;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type RangeOption = '3' | '6' | '12';

export default function StatsPage() {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<RangeOption>('6');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        async function loadStats() {
            setLoading(true);

            const from = new Date();
            from.setMonth(from.getMonth() - parseInt(range));
            from.setDate(1);
            from.setHours(0, 0, 0, 0);

            const [expRes, incRes] = await Promise.all([
                supabase
                    .from('expenses')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('created_at', from.toISOString())
                    .order('created_at', { ascending: true }),
                supabase
                    .from('incomes')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('created_at', from.toISOString())
                    .order('created_at', { ascending: true }),
            ]);

            if (cancelled) return;

            if (!expRes.error && expRes.data) setExpenses(expRes.data);
            if (!incRes.error && incRes.data) setIncomes(incRes.data);
            setLoading(false);
        }

        loadStats();

        return () => {
            cancelled = true;
        };
    }, [range, userId]);

    // ── Derived data ──────────────────────────────────────────────────────────

    const totalAmount = useMemo(
        () => expenses.reduce((s, e) => s + e.amount, 0),
        [expenses]
    );

    // Monthly bar chart data
    const monthlyData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach((e) => {
            const d = new Date(e.created_at);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            map[key] = (map[key] ?? 0) + e.amount;
        });

        const now = new Date();
        const result = [];
        for (let i = parseInt(range) - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            result.push({
                name: MONTHS_MN[d.getMonth()],
                amount: map[key] ?? 0,
                isCurrent: i === 0,
            });
        }
        return result;
    }, [expenses, range]);

    // Category breakdown
    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach((e) => {
            map[e.category] = (map[e.category] ?? 0) + e.amount;
        });
        return Object.entries(map)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses]);

    // This month vs last month
    const { thisMonth, lastMonth } = useMemo(() => {
        const now = new Date();
        const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const thisMonth = expenses
            .filter((e) => new Date(e.created_at) >= thisStart)
            .reduce((s, e) => s + e.amount, 0);
        const lastMonth = expenses
            .filter((e) => {
                const d = new Date(e.created_at);
                return d >= lastStart && d <= lastEnd;
            })
            .reduce((s, e) => s + e.amount, 0);

        return { thisMonth, lastMonth };
    }, [expenses]);

    const monthTrend: 'up' | 'down' | 'flat' =
        thisMonth > lastMonth ? 'up' : thisMonth < lastMonth ? 'down' : 'flat';

    // Top 5 expenses
    const topExpenses = useMemo(
        () => [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
        [expenses]
    );

    // Daily average (this month)
    const daysElapsed = Math.max(1, new Date().getDate());
    const dailyAvg = thisMonth / daysElapsed;

    // ── Render ─────────────────────────────────────────────────────────────────

    if (status === 'loading' || loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-gray-500 font-medium">Статистик боловсруулж байна...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Статистик</h1>
                    <p className="text-gray-400 text-sm mt-1">Таны зарцуулалтын дэлгэрэнгүй тайлан</p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Export button */}
                    <button
                        onClick={() => {
                            setExporting(true);
                            exportToCSV(expenses, incomes, range);
                            setTimeout(() => setExporting(false), 1000);
                        }}
                        disabled={exporting || (expenses.length === 0 && incomes.length === 0)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${expenses.length === 0 && incomes.length === 0
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : exporting
                                    ? 'border-green-200 bg-green-50 text-green-600'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-600 shadow-sm'
                            }`}
                    >
                        <Download size={16} />
                        {exporting ? 'Татаж байна...' : 'CSV татах'}
                    </button>

                    {/* Range selector */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                        {(['3', '6', '12'] as RangeOption[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${range === r
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {r} сар
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<BarChart2 size={20} />}
                    label="Энэ сарын зардал"
                    value={fmt(thisMonth)}
                    sub={lastMonth > 0 ? `Өмнөх сар: ${fmt(lastMonth)}` : undefined}
                    trend={monthTrend}
                />
                <StatCard
                    icon={<CalendarDays size={20} />}
                    label="Өдрийн дундаж"
                    value={fmt(dailyAvg)}
                    sub={`${daysElapsed} хоногийн дундаж`}
                />
                <StatCard
                    icon={<Flame size={20} />}
                    label="Хамгийн их зардал"
                    value={topExpenses[0] ? fmt(topExpenses[0].amount) : '—'}
                    sub={topExpenses[0]?.title}
                />
                <StatCard
                    icon={<Tag size={20} />}
                    label="Тэргүүлэх ангилал"
                    value={categoryData[0]?.category ?? '—'}
                    sub={categoryData[0] ? fmt(categoryData[0].amount) : undefined}
                />
            </div>

            {/* ── Monthly bar chart ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Сарын зарцуулалт</h2>
                {expenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyData} barSize={32} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => (v >= 1_000_000 ? `${v / 1_000_000}сая` : v >= 1000 ? `${v / 1000}мян` : v)}
                                width={52}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 8 }} />
                            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                {monthlyData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={entry.isCurrent ? '#3b82f6' : '#bfdbfe'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[280px] text-gray-400">
                        Өгөгдөл байхгүй байна
                    </div>
                )}
            </div>

            {/* ── Category breakdown + Top expenses ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Category breakdown */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Ангиллаарх зарцуулалт</h2>
                    {categoryData.length > 0 ? (
                        <div className="space-y-5">
                            {categoryData.map(({ category, amount }) => (
                                <CategoryBar key={category} category={category} amount={amount} total={totalAmount} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">Өгөгдөл байхгүй байна</p>
                    )}
                </div>

                {/* Top 5 expenses */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Хамгийн өндөр зардлууд</h2>
                    {topExpenses.length > 0 ? (
                        <div className="space-y-3">
                            {topExpenses.map((expense, i) => {
                                const color = CATEGORY_COLORS[expense.category] ?? '#6b7280';
                                return (
                                    <div
                                        key={expense.id}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Rank badge */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#e5e7eb', color: i >= 3 ? '#6b7280' : 'white' }}
                                        >
                                            {i + 1}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{expense.title}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="text-xs text-gray-400">{expense.category}</span>
                                                <span className="text-xs text-gray-300">·</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(expense.created_at).toLocaleDateString('mn-MN')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <p className="text-sm font-bold text-gray-800 flex-shrink-0">{fmt(expense.amount)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">Өгөгдөл байхгүй байна</p>
                    )}
                </div>
            </div>
        </div>
    );
}
