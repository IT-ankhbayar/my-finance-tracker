'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['Хоол', 'Унаа', 'Орон сууц', 'Энтертайнмент', 'Бусад'];

const CATEGORY_EMOJI: Record<string, string> = {
    'Хоол': '🍕',
    'Унаа': '🚗',
    'Орон сууц': '🏠',
    'Энтертайнмент': '🎬',
    'Бусад': '💰',
};

interface TransactionListProps {
    transactions: Expense[];
    onDelete: (id: string) => void;
    onRefresh: () => void;
}

const TransactionList = ({ transactions, onDelete, onRefresh }: TransactionListProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [saving, setSaving] = useState(false);

    const startEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setEditTitle(expense.title);
        setEditAmount(String(expense.amount));
        setEditCategory(expense.category);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (id: string) => {
        if (!editTitle || !editAmount) return;
        setSaving(true);

        const { error } = await supabase
            .from('expenses')
            .update({
                title: editTitle,
                amount: parseFloat(editAmount),
                category: editCategory,
            })
            .eq('id', id);

        setSaving(false);

        if (error) {
            alert('Засварлахад алдаа гарлаа');
        } else {
            setEditingId(null);
            onRefresh();
        }
    };

    if (transactions.length === 0) {
        return <p className="text-gray-400 text-center py-10">Гүйлгээ байхгүй байна.</p>;
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map((expense) => {
                const isEditing = editingId === expense.id;

                if (isEditing) {
                    return (
                        <div key={expense.id} className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
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
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={cancelEdit}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X size={15} /> Болих
                                </button>
                                <button
                                    onClick={() => saveEdit(expense.id)}
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
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                                {CATEGORY_EMOJI[expense.category] ?? '💰'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{expense.title}</p>
                                <p className="text-xs text-gray-400">
                                    {expense.category} · {new Date(expense.created_at).toLocaleDateString('mn-MN')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-red-500">-{expense.amount.toLocaleString()} ₮</p>
                            <button
                                onClick={() => startEdit(expense)}
                                className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(expense.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;