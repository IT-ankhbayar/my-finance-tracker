// src/app/add-expense/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AddExpensePage() {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('expenses')
            .insert([
                {
                    title,
                    amount: parseFloat(amount),
                    category,
                    created_at: new Date(date).toISOString() // Хэрэглэгчийн сонгосон огноог илгээнэ
                }
            ]);

        if (error) {
            alert("Алдаа гарлаа: " + error.message);
        } else {
            alert("Зардал амжилттай хадгалагдлаа!");
            router.push('/');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Шинэ зардал бүртгэх</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                    <input
                        type="text"
                        required
                        placeholder="Жишээ нь: Өдрийн хоол"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дүн (₮)</label>
                    <input
                        type="number"
                        required
                        placeholder="0.00"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ангилал</label>
                    <select
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Food">Хоол хүнс</option>
                        <option value="Transport">Тээвэр</option>
                        <option value="Entertainment">Энтертайнмент</option>
                        <option value="Health">Эрүүл мэнд</option>
                        <option value="Bills">Төлбөрүүд</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Огноо</label>
                    <input
                        type="date"
                        required
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold p-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md mt-4"
                >
                    Хадгалах
                </button>
            </form>
        </div>
    );
}