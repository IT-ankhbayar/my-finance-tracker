'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";
import { PlusCircle, Wallet, ArrowUpRight, ArrowDownRight, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

// Өнгөний сонголт (Графикт зориулсан)
const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Дата татах функц
  const fetchExpenses = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", session.user.id) // Зөвхөн өөрийнхөө датаг авна
      .order("created_at", { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  };

  // 2. Сесс шалгах болон дата татах useEffect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchExpenses();
    }
  }, [session, status]);

  // 3. Графикт зориулж датаг бэлтгэх (Ангиллаар бүлэглэх)
  const chartData = expenses.reduce((acc: any[], curr) => {
    const found = acc.find((item) => item.name === curr.category);
    if (found) {
      found.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">Мэдээлэл шинэчилж байна...</p>
      </div>
    );
  }


  const handleDelete = async (expenseId: string) => {
    if (confirm("Та энэ зардлыг устгахдаа итгэлтэй байна уу?")) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (!error) {
        // Датагаа дахин татаж (fetch) жагсаалтаа шинэчилнэ
        fetchExpenses();
      } else {
        alert("Устгахад алдаа гарлаа");
      }
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header хэсэг */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Сайн байна уу, {session?.user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Таны санхүүгийн тойм мэдээлэл.</p>
        </div>
        <Link
          href="/add-expense"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <PlusCircle size={20} />
          <span>Зардал нэмэх</span>
        </Link>
      </div>

      {/* Товч мэдээллийн картууд */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Wallet size={24} />
            </div>
            <span className="text-gray-500 font-medium">Нийт зардал</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {totalAmount.toLocaleString()} ₮
          </h2>
        </div>
        {/* Бусад картуудыг (Орлого, Үлдэгдэл г.м) энд нэмж болно */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Зүүн тал: График */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-[450px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Ангиллаарх зардал</h3>
          {expenses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">График харуулах өгөгдөл алга</div>
          )}
        </div>

        {/* Баруун тал: Сүүлийн гүйлгээнүүд */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Сүүлийн гүйлгээнүүд</h3>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {expenses.length === 0 ? (
              <p className="text-gray-400 text-center py-10">Гүйлгээ байхгүй байна.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                      {expense.category === "Хоол" ? "🍕" :
                        expense.category === "Унаа" ? "🚗" :
                          expense.category === "Орон сууц" ? "🏠" : "💰"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{expense.title}</p>
                      <p className="text-xs text-gray-400">{new Date(expense.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-red-500">-{expense.amount.toLocaleString()} ₮</p>

                    {/* Устгах товчлуур - Зөвхөн хулгана дээгүүр нь очиход тодорч харагдана (group-hover) */}
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Устгах"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
}