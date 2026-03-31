interface FilterBarProps {
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
}

const FilterBar = ({ selectedFilter, onFilterChange }: FilterBarProps) => {
    const filters = [
        { id: 'all', label: 'Бүгд' },
        { id: 'today', label: 'Өнөөдөр' },
        { id: 'month', label: 'Энэ сар' }
    ];

    return (
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit mb-8 border border-gray-200/50">
            {filters.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onFilterChange(item.id)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${selectedFilter === item.id
                            ? "bg-white text-blue-600 shadow-md shadow-blue-100/50"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        }`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;