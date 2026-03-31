import { ReactNode } from "react";

interface SummaryCardProps {
    title: string;
    amount: number;
    icon: ReactNode;
    iconBgColor?: string;
    iconColor?: string;
}

const SummaryCard = ({ title, amount, icon, iconBgColor = "bg-blue-50", iconColor = "text-blue-600" }: SummaryCardProps) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 ${iconBgColor} ${iconColor} rounded-2xl`}>
                {icon}
            </div>
            <span className="text-gray-500 font-medium">{title}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
            {amount.toLocaleString()} ₮
        </h2>
    </div>
);

export default SummaryCard;