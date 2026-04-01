'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

type Accent = 'blue' | 'green';

const accentClasses: Record<Accent, { ring: string; button: string; buttonShadow: string }> = {
  blue: {
    ring: 'focus:ring-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonShadow: 'shadow-lg shadow-blue-100',
  },
  green: {
    ring: 'focus:ring-green-500',
    button: 'bg-green-500 hover:bg-green-600',
    buttonShadow: 'shadow-lg shadow-green-100',
  },
};

export function TransactionFormShell({
  title,
  children,
  cardPadding = 'p-6',
}: {
  title: string;
  children: React.ReactNode;
  cardPadding?: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center">
      <div className="w-full max-w-2xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Буцах</span>
        </Link>

        <div className={`bg-white ${cardPadding} rounded-2xl shadow-sm border border-gray-100`}>
          <h1 className="text-2xl font-bold mb-6 text-gray-800">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export function TransactionField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function TransactionInput({
  accent,
  invalid = false,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  accent: Accent;
  invalid?: boolean;
}) {
  return (
    <input
      {...props}
      className={`w-full p-3 border rounded-xl outline-none transition-all text-black ${invalid ? 'border-red-300 bg-red-50 focus:ring-red-400' : `border-gray-200 ${accentClasses[accent].ring}`} ${className}`.trim()}
    />
  );
}

export function TransactionSelect({
  accent,
  invalid = false,
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  accent: Accent;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      {...props}
      className={`w-full p-3 border rounded-xl outline-none transition-all text-black bg-white ${invalid ? 'border-red-300 bg-red-50 focus:ring-red-400' : `border-gray-200 ${accentClasses[accent].ring}`} ${className}`.trim()}
    >
      {children}
    </select>
  );
}

export function TransactionSubmitButton({
  accent,
  loading,
  idleText,
  loadingText,
}: {
  accent: Accent;
  loading: boolean;
  idleText: string;
  loadingText: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 text-white p-4 rounded-xl font-bold transition-all ${accentClasses[accent].button} ${loading ? 'opacity-50 cursor-not-allowed' : accentClasses[accent].buttonShadow}`}
    >
      <Save size={20} />
      {loading ? loadingText : idleText}
    </button>
  );
}
