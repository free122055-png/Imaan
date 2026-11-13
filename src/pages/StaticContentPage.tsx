import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { getPageBySlug, getSettings } from '../services/storeService';

interface StaticContentPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const StaticContentPage: React.FC<StaticContentPageProps> = ({ slug, onNavigate }) => {
  const page = getPageBySlug(slug);
  const settings = getSettings();

  // Contact form state
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cMsg, setCMsg] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cPhone.trim() || !cMsg.trim()) return;
    setIsSent(true);
    setCName('');
    setCPhone('');
    setCMsg('');
    setTimeout(() => setIsSent(false), 5000);
  };

  if (!page) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">পেজটি পাওয়া যায়নি</h2>
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#1B5E20] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          হোম পেজে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto py-1">
        <button onClick={() => onNavigate('/')} className="hover:text-[#1B5E20] shrink-0 font-medium">
          হোম
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
        <span className="text-gray-800 font-bold truncate">{page.title}</span>
      </nav>

      {/* Main Content Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200/80 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B5E20]">{page.title}</h1>
        </div>

        {/* HTML Content */}
        <div
          className="prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base space-y-4"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* If Contact Page, show direct message form */}
        {slug === 'contact-us' && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">আমাদের সরাসরি বার্তা পাঠান</h3>
            {isSent && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ধন্যবাদ! আপনার বার্তাটি আমরা পেয়েছি। আমাদের টিম শীঘ্রই যোগাযোগ করবে।</span>
              </div>
            )}
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    value={cName}
                    onChange={e => setCName(e.target.value)}
                    required
                    placeholder="যেমন: সাকিব আল হাসান"
                    className="w-full bg-[#FFFBF0]/60 border border-amber-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    value={cPhone}
                    onChange={e => setCPhone(e.target.value)}
                    required
                    placeholder="০১XXXXXXXXX"
                    className="w-full bg-[#FFFBF0]/60 border border-amber-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">আপনার বার্তা / জিজ্ঞাসা</label>
                <textarea
                  rows={4}
                  value={cMsg}
                  onChange={e => setCMsg(e.target.value)}
                  required
                  placeholder="বিস্তারিত লিখুন..."
                  className="w-full bg-[#FFFBF0]/60 border border-amber-200 rounded-xl p-2.5 text-xs"
                />
              </div>
              <button
                type="submit"
                className="bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>বার্তা পাঠান</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
