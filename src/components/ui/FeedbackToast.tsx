'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function FeedbackToast({
  message,
  type,
}: {
  message: string;
  type: 'success' | 'error';
}) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium z-50 transition-all ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {type === 'success'
        ? <CheckCircle2 size={18} />
        : <AlertTriangle size={18} />}
      {message}
    </div>
  );
}
