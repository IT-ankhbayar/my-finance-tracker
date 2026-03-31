'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const INCOME_CATEGORIES = ['Цалин', 'Урамшуулал', 'Бизнес', 'Хөрөнгө оруулалт', 'Бусад'];

export default function AddIncomePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Цалин');
    const [loading, setLoading] = useState(false);

    const handleAddIncome = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            alert('Та эхлээд нэвтэрнэ үү!');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('incomes')
            .insert([
                {
                    title,
                    amount: parseFloat(amount),
                    category,
                    user_id: session.user.id,
                },
            ]);

        if (error) {
            alert('Алдаа гарлаа: ' + error.message);
        } else {
            router.push('/');
            router.refresh();
        }

        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link
                href="/"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Буцах</span>
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Шинэ орлого нэмэх</h1>

                <form onSubmit={handleAddIncome} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Тайлбар</label>
                        <input
                            type="text"
                            required
                            placeholder="Жишээ: Сарын цалин"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-black"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Дүн (₮)</label>
                        <input
                            type="number"
                            required
                            placeholder="0"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-black"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ангилал</label>
                        <select
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-black bg-white"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {INCOME_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 bg-green-500 text-white p-4 rounded-xl font-bold hover:bg-green-600 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-green-100'
                            }`}
                    >
                        <Save size={20} />
                        {loading ? 'Хадгалж байна...' : 'Орлого хадгалах'}
                    </button>
                </form>
            </div>
        </div>
    );
}