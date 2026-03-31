import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface WelcomeHeaderProps {
    name?: string | null;
}

const WelcomeHeader = ({ name }: WelcomeHeaderProps) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Сайн байна уу, {name?.split(" ")[0] || "Хэрэглэгч"}! 👋
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
);

export default WelcomeHeader;