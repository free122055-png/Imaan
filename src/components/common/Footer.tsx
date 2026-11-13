import React from 'react';
import { Phone, MapPin, MessageCircle } from 'lucide-react';
import { getSettings } from '../../services/storeService';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const settings = getSettings();
  const { t, getL, language } = useLanguage();

  const siteTitle = getL(settings, 'siteName') || (language === 'en' ? 'Aiman Brand' : 'আইমান ব্রান্ড');

  return (
    <footer className="bg-[#FAF7F0] border-t border-[#ECE8DF] text-[#4B5563] pt-10 pb-20 md:pb-8 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 3-Column Clean Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#ECE8DF]">
          {/* Column 1: Logo & 1-line intro */}
          <div className="space-y-3">
            <div
              onClick={() => onNavigate('/')}
              className="cursor-pointer flex items-center gap-2 select-none"
            >
              <span className="w-7 h-7 rounded-lg bg-[#1B4D2B] text-[#FAF7F0] font-bold text-base flex items-center justify-center shrink-0">
                {language === 'en' ? 'A' : 'আ'}
              </span>
              <span className="font-bold text-xl text-[#1B4D2B] tracking-tight">
                {siteTitle}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-sm">
              {getL(settings, 'tagline') || t('footer_desc')}
            </p>
          </div>

          {/* Column 2: Essential links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              {t('quick_links')}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/category/all')}
                  className="hover:text-[#1B4D2B] transition"
                >
                  {t('shop_all_products')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/track-order')}
                  className="hover:text-[#1B4D2B] transition"
                >
                  {t('track_order')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/wishlist')}
                  className="hover:text-[#1B4D2B] transition"
                >
                  {t('wishlist')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/page/about-us')}
                  className="hover:text-[#1B4D2B] transition"
                >
                  {t('about_us')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/page/faq')}
                  className="hover:text-[#1B4D2B] transition"
                >
                  {t('faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              {t('contact_us')}
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#6B7280]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#1B4D2B] shrink-0 mt-0.5" />
                <span>{settings.address || (language === 'en' ? 'Dhaka, Bangladesh' : 'ঢাকা, বাংলাদেশ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1B4D2B] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-[#1B4D2B]">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#1B4D2B] shrink-0" />
                <a
                  href={`https://wa.me/88${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1B4D2B]"
                >
                  {t('whatsapp')}: {settings.whatsappNumber}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright line */}
        <div className="pt-6 text-center text-xs text-[#6B7280]">
          {t('copyright', { year: '2026', title: siteTitle })}
        </div>
      </div>
    </footer>
  );
};
