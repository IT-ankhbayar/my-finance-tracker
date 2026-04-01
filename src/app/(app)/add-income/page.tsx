'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { FeedbackToast } from '@/components/ui/FeedbackToast';
import {
    TransactionField,
    TransactionFormShell,
    TransactionInput,
    TransactionSelect,
    TransactionSubmitButton,
} from '@/components/forms/TransactionForm';

const INCOME_CATEGORIES = ['Цалин', 'Урамшуулал', 'Бизнес', 'Хөрөнгө оруулалт', 'Бусад'];

export default function AddIncomePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Цалин');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [errors, setErrors] = useState<{ title?: string; amount?: string; category?: string }>({});

    function showToast(message: string, type: 'success' | 'error') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }

    function validateForm() {
        const nextErrors: { title?: string; amount?: string; category?: string } = {};

        if (!title.trim()) nextErrors.title = 'Тайлбар оруулна уу';

        const parsedAmount = Number(amount);
        if (!amount.trim()) nextErrors.amount = 'Дүн оруулна уу';
        else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) nextErrors.amount = '0-ээс их дүн оруулна уу';

        if (!category) nextErrors.category = 'Ангилал сонгоно уу';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    const handleAddIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        setToast(null);

        if (!validateForm()) return;

        setLoading(true);

        const { error } = await supabase
            .from('incomes')
            .insert([
                {
                    title: title.trim(),
                    amount: parseFloat(amount),
                    category,
                    user_id: session!.user!.id,
                },
            ]);

        if (error) {
            showToast(`Алдаа гарлаа: ${error.message}`, 'error');
        } else {
            router.push('/');
            router.refresh();
        }

        setLoading(false);
    };

    return (
        <TransactionFormShell title="Шинэ орлого нэмэх" cardPadding="p-8">
            <form onSubmit={handleAddIncome} className="space-y-5">
                <TransactionField label="Тайлбар" error={errors.title}>
                    <TransactionInput
                        accent="green"
                        invalid={Boolean(errors.title)}
                        type="text"
                        required
                        placeholder="Жишээ: Сарын цалин"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                        }}
                    />
                </TransactionField>

                <TransactionField label="Дүн (₮)" error={errors.amount}>
                    <TransactionInput
                        accent="green"
                        invalid={Boolean(errors.amount)}
                        type="number"
                        required
                        placeholder="0"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                        }}
                    />
                </TransactionField>

                <TransactionField label="Ангилал" error={errors.category}>
                    <TransactionSelect
                        accent="green"
                        invalid={Boolean(errors.category)}
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                        }}
                    >
                        {INCOME_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </TransactionSelect>
                </TransactionField>

                <TransactionSubmitButton
                    accent="green"
                    loading={loading}
                    loadingText="Хадгалж байна..."
                    idleText="Орлого хадгалах"
                />
            </form>
            {toast && <FeedbackToast message={toast.message} type={toast.type} />}
        </TransactionFormShell>
    );
}
