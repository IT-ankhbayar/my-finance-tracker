// Үндсэн зарлагын өгөгдлийн бүтэц
export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    user_id: string;
    created_at: string;
}

// Шүүлтүүрийн төрөл
export type FilterType = 'all' | 'today' | 'month';

// Графикт зориулсан өгөгдлийн бүтэц
export interface ChartData {
    category: string;
    amount: number;
}