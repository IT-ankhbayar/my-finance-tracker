'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { FeedbackToast } from '@/components/ui/FeedbackToast';
import { TransactionErrors, validateTransactionForm } from '@/lib/validation';
import {
    TransactionField,
    TransactionFormShell,
    TransactionInput,
    TransactionSelect,
    TransactionSubmitButton,
} from '@/components/forms/TransactionForm';

export default function AddExpensePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Хоол');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [errors, setErrors] = useState<TransactionErrors>({});

    function showToast(message: string, type: 'success' | 'error') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }

    function validateForm() {
        const nextErrors = validateTransactionForm(title, amount, category);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setToast(null);

        if (!validateForm()) return;

        setLoading(true);

        const { error } = await supabase
            .from('expenses')
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
        <TransactionFormShell title="Шинэ зардал нэмэх">
            <form onSubmit={handleAddExpense} className="space-y-4">
                <TransactionField label="Тайлбар" error={errors.title}>
                    <TransactionInput
                        accent="blue"
                        invalid={Boolean(errors.title)}
                        type="text"
                        required
                        placeholder="Жишээ: Өдрийн хоол"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                        }}
                    />
                </TransactionField>

                <TransactionField label="Дүн (₮)" error={errors.amount}>
                    <TransactionInput
                        accent="blue"
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
                        accent="blue"
                        invalid={Boolean(errors.category)}
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                        }}
                    >
                        <option value="Хоол">Хоол</option>
                        <option value="Унаа">Унаа</option>
                        <option value="Орон сууц">Орон сууц</option>
                        <option value="Энтертайнмент">Энтертайнмент</option>
                        <option value="Бусад">Бусад</option>
                    </TransactionSelect>
                </TransactionField>

                <TransactionSubmitButton
                    accent="blue"
                    loading={loading}
                    loadingText="Хадгалж байна..."
                    idleText="Зардал хадгалах"
                />
            </form>
            {toast && <FeedbackToast message={toast.message} type={toast.type} />}
        </TransactionFormShell>
    );
}
