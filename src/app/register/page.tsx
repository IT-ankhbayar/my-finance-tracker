'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Бүртгэхэд алдаа гарлаа');
            }

            // Амжилттай болвол шууд нэвтрэх хуудас руу шилжүүлнэ
            router.push('/login?message=success');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Шинэ бүртгэл</h2>
                <p className="text-gray-500 text-sm mb-6">Finance Tracker-т нэгдэж зардлаа хянаж эхлээрэй.</p>

                {error && (
                    <p className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Бүтэн нэр</label>
                        <input
                            type="text"
                            placeholder="Жишээ: Бат-Эрдэнэ"
                            className="w-full p-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">И-мэйл</label>
                        <input
                            type="email"
                            placeholder="example@mail.com"
                            className="w-full p-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Нууц үг</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full p-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-blue-200'
                            }`}
                    >
                        {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Аль хэдийн бүртгэлтэй юу?{' '}
                    <Link href="/login" className="text-blue-600 font-bold hover:underline">
                        Нэвтрэх хэсэг
                    </Link>
                </p>
            </div>
        </div>
    );
}