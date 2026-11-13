import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5">
      <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-100/80 text-[#1B5E20] flex items-center justify-center font-black text-4xl shadow-inner border border-amber-200">
        ৪০৪
      </div>
      <h1 className="text-2xl font-black text-gray-900">পেজটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
        আপনি যে লিংকটি খুঁজছেন তা হয়তো পরিবর্তিত হয়েছে বা আর বিদ্যমান নেই। আমাদের হোম পেজ থেকে পছন্দের খাঁটি তেল ব্রাউজ করুন।
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>হোম পেজে ফিরে যান</span>
        </button>
      </div>
    </div>
  );
};
