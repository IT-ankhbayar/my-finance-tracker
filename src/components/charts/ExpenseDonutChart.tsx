"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

// 1. Өгөгдлийн бүтцийг тодорхойлно
interface ExpenseData {
    category: string;
    amount: number;
}

interface ExpenseDonutChartProps {
    data: ExpenseData[];
}

const ExpenseDonutChart = ({ data }: ExpenseDonutChartProps) => {
    // 2. Нийт дүнг тооцоолох (null check нэмсэн)
    const total = data.reduce((sum, item) => sum + (item.amount ?? 0), 0);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between p-4 md:p-6 bg-white rounded-3xl w-full h-full gap-8">

            {/* Chart Хэсэг */}
            <div className="w-full h-[220px] md:h-[280px] lg:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius="65%"
                            outerRadius="90%"
                            paddingAngle={6}
                            dataKey="amount"
                            nameKey="category"
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Тайлал (Legend) Хэсэг */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">
                    Ангиллаарх зардал
                </h4>

                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {data.map((item, index) => (
                        <div key={`${item.category}-${index}`} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors truncate max-w-[120px]">
                                    {item.category}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-gray-800">
                                    {(item.amount ?? 0).toLocaleString()} ₮
                                </p>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    {total > 0 ? (((item.amount ?? 0) / total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExpenseDonutChart;