'use client';

import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';

export function AuthPageShell({
  subtitle,
  heading,
  error,
  footer,
  children,
}: {
  subtitle: string;
  heading: string;
  error?: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MyFinance</h1>
          <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{heading}</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {children}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">{footer}</p>
      </div>
    </div>
  );
}

export function AuthField({
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

export function AuthInput({
  icon,
  invalid = false,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        {...props}
        className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all text-black text-sm ${invalid ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'} ${className}`.trim()}
      />
    </div>
  );
}

export function AuthSubmitButton({
  loading,
  loadingText,
  idleText,
  icon,
}: {
  loading: boolean;
  loadingText: string;
  idleText: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'shadow-lg shadow-blue-100'}`}
    >
      {loading
        ? <><Loader2 size={18} className="animate-spin" /> {loadingText}</>
        : <>{icon} {idleText}</>}
    </button>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <>
      {prompt}{' '}
      <Link href={href} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
        {label}
      </Link>
    </>
  );
}
