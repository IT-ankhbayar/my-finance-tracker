'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, TrendingDown, Wallet, Hash, Download, PlusCircle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

// Графикийн өнгөнүүд
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function Home() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Өгөгдөл татах функц
  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  };

  // 2. Устгах функц
  const handleDelete = async (id: string) => {
    if (!confirm("Та энэ зардлыг устгахдаа итгэлтэй байна уу?")) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Алдаа гарлаа: " + error.message);
    } else {
      fetchExpenses(); // Жагсаалтыг шинэчлэх
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 3. Тооцоолол болон Графикийн өгөгдөл бэлдэх
  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  const chartData = expenses.reduce((acc: any[], item) => {
    const existing = acc.find((d) => d.name === item.category);
    if (existing) {
      existing.value += item.amount;
    } else {
      acc.push({ name: item.category, value: item.amount });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Мэдээллийг ачаалж байна...</p>
      </div>
    );
  }

  const exportToCSV = () => {
    if (expenses.length === 0) {
      alert("Татаж авах өгөгдөл алга!");
      return;
    }

    // 1. CSV-ийн толгой хэсэг (Headers)
    const headers = ["Тайлбар", "Ангилал", "Дүн", "Огноо"];

    // 2. Өгөгдлөө мөр мөрөөр нь бэлдэх
    const rows = expenses.map(item => [
      item.title,
      item.category,
      item.amount,
      new Date(item.created_at).toLocaleDateString('mn-MN')
    ]);

    // 3. Бүх мөрийг нэгтгэж текст болгох (Таслалаар тусгаарлаад, шинэ мөрөөр зааглана)
    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    // 4. Файл болгож татаж авах хэсэг
    // Excel монгол үсгийг танихад зориулж \uFEFF (BOM) нэмнэ
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `my-expenses-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Хянах самбар</h1>
      <div className="flex gap-3">
        {/* CSV Татах товч */}
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium border border-gray-200"
        >
          <Download size={18} />
          <span>CSV Татах</span>
        </button>

        {/* Зардал нэмэх товч (Шууд эндээс нэмэхэд амар) */}
        <Link
          href="/add-expense"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium shadow-md"
        >
          <PlusCircle size={18} />
          <span>Зардал нэмэх</span>
        </Link>
      </div>
      {/* Мэдээллийн картууд */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white shadow-sm rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <TrendingDown size={20} />
            <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Нийт зардал</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalAmount.toLocaleString()}₮</p>
        </div>

        <div className="p-6 bg-white shadow-sm rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <Hash size={20} />
            <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Гүйлгээний тоо</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{expenses.length}</p>
        </div>

        <div className="p-6 bg-white shadow-sm rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 text-green-500 mb-2">
            <Wallet size={20} />
            <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Дундаж зардал</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {expenses.length > 0 ? Math.round(totalAmount / expenses.length).toLocaleString() : 0}₮
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* График хэсэг */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[450px]">
          <h3 className="font-bold text-gray-800 mb-6">Зардлын бүтэц (Ангиллаар)</h3>
          {expenses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value.toLocaleString()}₮`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">График харуулах дата алга</div>
          )}
        </div>

        {/* Сүүлийн гүйлгээнүүд */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Сүүлийн гүйлгээнүүд</h3>
          </div>
          <div className="overflow-auto max-h-[380px]">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs sticky top-0">
                <tr>
                  <th className="p-4 font-semibold uppercase">Тайлбар</th>
                  <th className="p-4 font-semibold uppercase text-right">Дүн</th>
                  <th className="p-4 font-semibold uppercase text-center">Устгах</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.created_at).toLocaleDateString('mn-MN')}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-500">
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <div className="p-20 text-center text-gray-400">Одоогоор гүйлгээ алга.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}