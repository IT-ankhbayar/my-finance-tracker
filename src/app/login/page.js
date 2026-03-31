"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res.error) {
            setError("И-мэйл эсвэл нууц үг буруу байна");
        } else {
            router.push("/"); // Нэвтэрсний дараа Home руу шилжинэ
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Тавтай морил</h2>
                {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="И-мэйл хаяг"
                        className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Нууц үг"
                        className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                        Нэвтрэх
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    Бүртгэлгүй юу? <Link href="/register" className="text-blue-600 font-semibold">Шинээр бүртгүүлэх</Link>
                </p>
            </div>
        </div>
    );
}