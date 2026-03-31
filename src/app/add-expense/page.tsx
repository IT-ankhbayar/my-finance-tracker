'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddExpensePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Хоол');
    const [loading, setLoading] = useState(false);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Нэвтрээгүй бол зогсооно
        if (!session?.user?.id) {
            alert("Та эхлээд нэвтэрнэ үү!");
            return;
        }

        setLoading(true);

        // 2. Supabase руу дата илгээх
        const { error } = await supabase
            .from('expenses')
            .insert([
                {
                    title,
                    amount: parseFloat(amount),
                    category,
                    user_id: session.user.id, // Нэвтэрсэн хэрэглэгчийн ID-г энд дамжуулна
                },
            ]);

        if (error) {
            alert("Алдаа гарлаа: " + error.message);
        } else {
            // Амжилттай болвол Home руу буцна
            router.push('/');
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                <ArrowLeft size={20} />
                <span>Буцах</span>
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Шинэ зардал нэмэх</h1>

                <form onSubmit={handleAddExpense} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Тайлбар</label>
                        <input
                            type="text"
                            required
                            placeholder="Жишээ: Өдрийн хоол"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
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
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ангилал</label>
                        <select
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black bg-white"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Хоол">Хоол</option>
                            <option value="Унаа">Унаа</option>
                            <option value="Орон сууц">Орон сууц</option>
                            <option value="Энтертайнмент">Энтертайнмент</option>
                            <option value="Бусад">Бусад</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-blue-100'
                            }`}
                    >
                        <Save size={20} />
                        {loading ? 'Хадгалж байна...' : 'Зардал хадгалах'}
                    </button>
                </form>
            </div>
        </div>
    );
}