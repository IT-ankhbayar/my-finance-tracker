'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { Expense } from '@/types';
import {
  Wallet, TrendingUp, TrendingDown, Plus,
  Loader2, ArrowUpRight, ArrowDownRight, Target, Trash2, Pencil, Check, X,
} from 'lucide-react';
import ExpenseDonutChart from '@/components/charts/ExpenseDonutChart';
import FilterBar from '@/components/layout/FilterBar';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Income {
  id: string;
  title: string;
  amount: number;
  created_at: string;
  user_id: string;
}

interface Budget {
  category: string;
  amount: number;
}

interface ChartData {
  category: string;
  amount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Хоол': '#3b82f6',
  'Унаа': '#8b5cf6',
  'Орон сууц': '#f59e0b',
  'Энтертайнмент': '#ec4899',
  'Бусад': '#10b981',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('mn-MN').format(Math.round(n)) + ' ₮';
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}м өмнө`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}ц өмнө`;
  const days = Math.floor(hrs / 24);
  return `${days}өдрийн өмнө`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BalanceCard({ totalIncome, totalExpense }: { totalIncome: number; totalExpense: number }) {
  const balance = totalIncome - totalExpense;
  const isPositive = balance >= 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-200">
      <p className="text-blue-200 text-sm font-medium mb-1">Нийт үлдэгдэл</p>
      <p className={`text-4xl font-bold mb-6 ${isPositive ? 'text-white' : 'text-red-300'}`}>
        {fmt(Math.abs(balance))}
        {!isPositive && <span className="text-xl ml-1">дутагдал</span>}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={16} className="text-green-300" />
            <span className="text-blue-200 text-xs font-medium">Нийт орлого</span>
          </div>
          <p className="text-white font-bold text-lg">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight size={16} className="text-red-300" />
            <span className="text-blue-200 text-xs font-medium">Нийт зардал</span>
          </div>
          <p className="text-white font-bold text-lg">{fmt(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color, sub }: {
  label: string; value: string; icon: React.ReactNode;
  color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`} style={{ backgroundColor: color + '18' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function BudgetProgressBar({ category, spent, limit }: {
  category: string; spent: number; limit: number;
}) {
  const pct = Math.min(100, Math.round((spent / limit) * 100));
  const color = CATEGORY_COLORS[category] ?? '#6b7280';
  const isOver = pct >= 100;
  const isWarning = pct >= 80 && pct < 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-gray-700">{category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${isOver ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-400'}`}>
            {pct}%
          </span>
          <span className="text-xs text-gray-500">{fmt(spent)} / {fmt(limit)}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: isOver ? '#ef4444' : isWarning ? '#f59e0b' : color,
          }}
        />
      </div>
      {isOver && (
        <p className="text-xs text-red-500 font-medium">
          ⚠️ {fmt(spent - limit)}-р хэтэрлээ
        </p>
      )}
    </div>
  );
}

type ActivityItem =
  | { kind: 'expense'; data: Expense }
  | { kind: 'income'; data: Income };

const INCOME_CATEGORIES = ['Цалин', 'Урамшуулал', 'Бизнес', 'Хөрөнгө оруулалт', 'Бусад'];
const EXPENSE_CATEGORIES = ['Хоол', 'Унаа', 'Орон сууц', 'Энтертайнмент', 'Бусад'];

function ActivityFeed({
  items,
  onDeleteExpense,
  onDeleteIncome,
  onRefresh,
}: {
  items: ActivityItem[];
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
  onRefresh: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (item: ActivityItem) => {
    const key = `${item.kind}-${item.data.id}`;
    setEditingKey(key);
    setEditTitle(item.data.title);
    setEditAmount(String(item.data.amount));
    setEditCategory(item.kind === 'expense' ? (item.data as Expense).category : '');
  };

  const cancelEdit = () => setEditingKey(null);

  const saveEdit = async (item: ActivityItem) => {
    setSaving(true);
    const table = item.kind === 'expense' ? 'expenses' : 'incomes';
    const payload: Record<string, unknown> = {
      title: editTitle,
      amount: parseFloat(editAmount),
    };
    if (item.kind === 'expense') payload.category = editCategory;

    const { error } = await supabase.from(table).update(payload).eq('id', item.data.id);
    setSaving(false);
    if (error) {
      alert('Засварлахад алдаа гарлаа');
    } else {
      setEditingKey(null);
      onRefresh();
    }
  };

  if (items.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Өгөгдөл байхгүй байна</p>;
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isIncome = item.kind === 'income';
        const key = `${item.kind}-${item.data.id}`;
        const color = isIncome ? '#10b981' : (CATEGORY_COLORS[(item.data as Expense).category] ?? '#6b7280');
        const label = isIncome ? 'Орлого' : (item.data as Expense).category;
        const isEditing = editingKey === key;

        if (isEditing) {
          return (
            <div key={key} className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Тайлбар"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-black outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Дүн"
                  className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm text-black outline-none focus:ring-2 focus:ring-blue-400"
                />
                {!isIncome && (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                {isIncome && (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={15} /> Болих
                </button>
                <button
                  onClick={() => saveEdit(item)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  <Check size={15} /> {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={key}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-gray-50 transition-colors group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: color + '18' }}
            >
              {isIncome
                ? <ArrowUpRight size={18} style={{ color }} />
                : <ArrowDownRight size={18} style={{ color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.data.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">{relativeTime(item.data.created_at)}</span>
              </div>
            </div>
            <p className={`text-sm font-bold flex-shrink-0 ${isIncome ? 'text-green-600' : 'text-gray-800'}`}>
              {isIncome ? '+' : '-'}{fmt(item.data.amount)}
            </p>
            <button
              onClick={() => startEdit(item)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-blue-50 text-gray-300 hover:text-blue-400 flex-shrink-0"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => {
                if (confirm('Та энэ бичлэгийг устгахдаа итгэлтэй байна уу?')) {
                  isIncome ? onDeleteIncome(item.data.id) : onDeleteExpense(item.data.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: session, status } = useSession();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // ── Fetch ───────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const now = new Date();
    let dateFilter: string | null = null;
    if (filter === 'today') {
      dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    } else if (filter === 'month') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    const expenseQuery = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    const incomeQuery = supabase
      .from('incomes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    const budgetQuery = supabase
      .from('budgets')
      .select('category, amount')
      .eq('user_id', session.user.id);

    if (dateFilter) {
      expenseQuery.gte('created_at', dateFilter);
      incomeQuery.gte('created_at', dateFilter);
    }

    const [expRes, incRes, budRes] = await Promise.all([expenseQuery, incomeQuery, budgetQuery]);

    if (!expRes.error && expRes.data) setExpenses(expRes.data);
    if (!incRes.error && incRes.data) setIncomes(incRes.data);
    if (!budRes.error && budRes.data) setBudgets(budRes.data);

    setLoading(false);
  }, [session?.user?.id, filter]);

  useEffect(() => {
    if (status === 'authenticated') fetchAll();
  }, [status, fetchAll]);

  // ── Derived data ─────────────────────────────────────────────────────────

  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalIncome = useMemo(() => incomes.reduce((s, e) => s + e.amount, 0), [incomes]);

  const chartData: ChartData[] = useMemo(() => {
    return expenses.reduce((acc: ChartData[], curr) => {
      const found = acc.find((i) => i.category === curr.category);
      if (found) found.amount += curr.amount;
      else acc.push({ category: curr.category, amount: curr.amount });
      return acc;
    }, []);
  }, [expenses]);

  // Category spend map for budget progress
  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return map;
  }, [expenses]);

  // Recent activity: merge expenses + incomes, sort by date, take 8
  const activityItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [
      ...expenses.map((e) => ({ kind: 'expense' as const, data: e })),
      ...incomes.map((i) => ({ kind: 'income' as const, data: i })),
    ];
    return items
      .sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())
      .slice(0, 8);
  }, [expenses, incomes]);

  // Days in current month for avg
  const daysElapsed = Math.max(1, new Date().getDate());

  // ── Delete handlers ──────────────────────────────────────────────────────

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) fetchAll();
    else alert('Устгахад алдаа гарлаа');
  };

  const handleDeleteIncome = async (id: string) => {
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (!error) fetchAll();
    else alert('Устгахад алдаа гарлаа');
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">Мэдээлэл шинэчилж байна...</p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Сайн байна уу, {session?.user?.name?.split(' ')[0] ?? 'та'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Таны санхүүгийн хянах самбар</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/add-income"
            className="flex items-center gap-1.5 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Орлого
          </Link>
          <Link
            href="/add-expense"
            className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-100"
          >
            <Plus size={16} /> Зардал
          </Link>
        </div>
      </div>

      {/* ── Filter ── */}
      <FilterBar selectedFilter={filter} onFilterChange={setFilter} />

      {/* ── Balance card ── */}
      <BalanceCard totalIncome={totalIncome} totalExpense={totalExpense} />

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Зарцуулалт"
          value={fmt(totalExpense)}
          icon={<Wallet size={20} />}
          color="#3b82f6"
          sub="Нийт зардал"
        />
        <SummaryCard
          label="Орлого"
          value={fmt(totalIncome)}
          icon={<TrendingUp size={20} />}
          color="#10b981"
          sub="Нийт орлого"
        />
        <SummaryCard
          label="Өдрийн дундаж"
          value={fmt(totalExpense / daysElapsed)}
          icon={<TrendingDown size={20} />}
          color="#f59e0b"
          sub={`${daysElapsed} хоногийн дундаж`}
        />
        <SummaryCard
          label="Гүйлгээний тоо"
          value={String(expenses.length + incomes.length)}
          icon={<Target size={20} />}
          color="#8b5cf6"
          sub={`${expenses.length} зардал, ${incomes.length} орлого`}
        />
      </div>

      {/* ── Charts + Budget ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut chart */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[360px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Ангиллаарх зардал</h3>
          <div className="flex-grow flex items-center justify-center">
            {expenses.length > 0
              ? <ExpenseDonutChart data={chartData} />
              : <p className="text-gray-400 text-sm">Өгөгдөл байхгүй байна</p>
            }
          </div>
        </div>

        {/* Budget progress */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Төсвийн явц</h3>
            <Link href="/settings" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
              Тохируулах →
            </Link>
          </div>

          {budgets.length > 0 ? (
            <div className="space-y-5">
              {budgets.map(({ category, amount: limit }) => (
                <BudgetProgressBar
                  key={category}
                  category={category}
                  spent={categorySpend[category] ?? 0}
                  limit={limit}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <p className="text-gray-400 text-sm text-center">
                Төсвийн хязгаар тогтоогдоогүй байна
              </p>
              <Link
                href="/settings"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Тохиргоо руу очих →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent activity feed ── */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Сүүлийн үйл ажиллагаа</h3>
          <span className="text-xs text-gray-400">{activityItems.length} гүйлгээ</span>
        </div>
        <ActivityFeed
          items={activityItems}
          onDeleteExpense={handleDeleteExpense}
          onDeleteIncome={handleDeleteIncome}
          onRefresh={fetchAll}
        />
      </div>
    </div>
  );
}