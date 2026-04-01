'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserPlus, CheckCircle2 } from 'lucide-react';
import { RegisterErrors, validateRegisterForm } from '@/lib/validation';
import {
    AuthField,
    AuthFooterLink,
    AuthInput,
    AuthPageShell,
    AuthSubmitButton,
} from '@/components/forms/AuthForm';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    function validateForm() {
        const nextErrors = validateRegisterForm(name, email, password, confirm);
        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;

        setLoading(true);

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error ?? 'Бүртгэлд алдаа гарлаа');
        } else {
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                        <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Амжилттай бүртгэгдлээ!</h2>
                    <p className="text-gray-400 text-sm">Нэвтрэх хуудас руу шилжиж байна...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthPageShell
            subtitle="Санхүүгээ ухаалгаар удирдаарай"
            heading="Шинээр бүртгүүлэх"
            error={error}
            footer={
                <AuthFooterLink
                    prompt="Аль хэдийн бүртгэлтэй юу?"
                    href="/login"
                    label="Нэвтрэх →"
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthField label="Нэр" error={fieldErrors.name}>
                    <AuthInput
                        icon={<User size={17} />}
                        invalid={Boolean(fieldErrors.name)}
                        type="text"
                        required
                        placeholder="Таны нэр"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                    />
                </AuthField>

                <AuthField label="И-мэйл хаяг" error={fieldErrors.email}>
                    <AuthInput
                        icon={<Mail size={17} />}
                        invalid={Boolean(fieldErrors.email)}
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                    />
                </AuthField>

                <AuthField label="Нууц үг" error={fieldErrors.password}>
                    <AuthInput
                        icon={<Lock size={17} />}
                        invalid={Boolean(fieldErrors.password)}
                        type="password"
                        required
                        placeholder="Хамгийн багадаа 6 тэмдэгт"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password || fieldErrors.confirm) {
                                setFieldErrors((prev) => ({ ...prev, password: undefined, confirm: undefined }));
                            }
                        }}
                    />
                </AuthField>

                <AuthField label="Нууц үг давтах" error={fieldErrors.confirm ?? (confirm && confirm !== password ? 'Нууц үг таарахгүй байна' : undefined)}>
                    <AuthInput
                        icon={<Lock size={17} />}
                        invalid={Boolean(fieldErrors.confirm || (confirm && confirm !== password))}
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => {
                            setConfirm(e.target.value);
                            if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                        }}
                    />
                </AuthField>

                <AuthSubmitButton
                    loading={loading}
                    loadingText="Бүртгэж байна..."
                    idleText="Бүртгүүлэх"
                    icon={<UserPlus size={18} />}
                />
            </form>
        </AuthPageShell>
    );
}
