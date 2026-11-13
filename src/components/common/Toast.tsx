import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  const isSuccess = !toastMessage.includes('দুঃখিত') && !toastMessage.includes('ত্রুটি') && !toastMessage.includes('ভুল');

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 flex justify-end pointer-events-none no-print">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold max-w-md w-full border animate-in slide-in-from-top duration-300 ${
          isSuccess
            ? 'bg-[#1B5E20] text-white border-emerald-500/50'
            : 'bg-amber-900 text-amber-50 border-amber-700/50'
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-[#F2B705] shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
        )}
        <div className="flex-1 text-xs sm:text-sm leading-snug">{toastMessage}</div>
      </div>
    </div>
  );
};
