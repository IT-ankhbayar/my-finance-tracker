'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import { LoginErrors, validateLoginForm } from '@/lib/validation';
import {
    AuthField,
    AuthFooterLink,
    AuthInput,
    AuthPageShell,
    AuthSubmitButton,
} from '@/components/forms/AuthForm';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    function validateForm() {
        const nextErrors = validateLoginForm(email, password);
        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;
        setLoading(true);

        const res = await signIn('credentials', {
            email: email.trim(),
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('И-мэйл эсвэл нууц үг буруу байна');
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <AuthPageShell
            subtitle="Таны санхүүгийн ухаалаг туслах"
            heading="Тавтай морил 👋"
            error={error}
            footer={
                <AuthFooterLink
                    prompt="Бүртгэлгүй юу?"
                    href="/register"
                    label="Шинээр бүртгүүлэх →"
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                    />
                </AuthField>

                <AuthSubmitButton
                    loading={loading}
                    loadingText="Нэвтэрч байна..."
                    idleText="Нэвтрэх"
                    icon={<LogIn size={18} />}
                />
            </form>
        </AuthPageShell>
    );
}
