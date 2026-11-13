import React, { useState } from 'react';
import {
  X, ChevronDown, ChevronRight, User, ShoppingBag, Heart,
  HelpCircle, Info, PhoneCall, Tag, LogOut, LayoutDashboard, Truck, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCategories, getSettings } from '../../services/storeService';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t, getL } = useLanguage();
  const categories = getCategories();
  const settings = getSettings();

  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNav = (route: string) => {
    onNavigate(route);
    onClose();
  };

  const toggleCategory = (catId: string) => {
    setExpandedCat(prev => (prev === catId ? null : catId));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dim Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer Content */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-xl flex flex-col z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="bg-[#1B4D2B] p-4 text-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 text-white font-bold text-base flex items-center justify-center shrink-0">
              {currentUser?.displayName ? currentUser.displayName.slice(0, 1) : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              {isAuthenticated ? (
                <>
                  <div className="font-semibold text-sm text-white leading-tight truncate">
                    {currentUser?.displayName}
                  </div>
                  <div className="text-[11px] text-white/70 truncate">
                    {currentUser?.phone || currentUser?.email}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-sm text-white">{t('welcome_user')}</div>
                  <button
                    onClick={() => handleNav('/login')}
                    className="text-xs text-[#FAF7F0] underline hover:text-white transition"
                  >
                    {t('login')}
                  </button>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Language Switch Bar [ বাংলা | English ] */}
        <div className="p-3 bg-[#FAF7F0] border-b border-[#ECE8DF] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Globe className="w-4 h-4 text-[#1B4D2B]" />
            <span>{t('language')}:</span>
          </div>

          <div className="flex items-center bg-white border border-[#ECE8DF] rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                language === 'bn'
                  ? 'bg-[#1B4D2B] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1B4D2B]'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                language === 'en'
                  ? 'bg-[#1B4D2B] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1B4D2B]'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#ECE8DF]">
          {/* Admin link strictly visible only if user is logged in as admin */}
          {isAdmin && (
            <div className="p-3 bg-[#FAF7F0]">
              <button
                onClick={() => handleNav('/admin')}
                className="w-full flex items-center justify-between p-2 bg-[#1B4D2B] text-white font-semibold text-xs rounded-lg transition"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> {t('admin_panel')}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Categories */}
          <div className="py-2">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              {t('categories')}
            </div>
            {categories.filter(c => c.isActive).map(cat => {
              const catName = getL(cat, 'name');
              const hasSubs = cat.subCategories && cat.subCategories.length > 0;
              const isExpanded = expandedCat === cat.id;

              return (
                <div key={cat.id} className="border-b border-[#ECE8DF]/40 last:border-0">
                  <div className="flex items-center justify-between px-4 py-2 hover:bg-[#FAF7F0] transition">
                    <div
                      onClick={() => handleNav(`/category/${cat.slug}`)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <img
                        src={cat.image}
                        alt={catName}
                        className="w-6 h-6 rounded-full object-contain shrink-0"
                      />
                      <span className="text-sm font-medium text-[#111827] truncate">
                        {catName}
                      </span>
                    </div>

                    {hasSubs && (
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="p-1 text-[#6B7280] hover:text-[#111827]"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  {hasSubs && isExpanded && (
                    <div className="bg-[#FAF7F0]/60 pl-11 pr-4 py-1 space-y-1">
                      {cat.subCategories!.map(sub => {
                        const subName = getL(sub, 'name');
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleNav(`/category/${cat.slug}?sub=${sub.slug}`)}
                            className="text-xs text-[#4B5563] hover:text-[#1B4D2B] py-1 cursor-pointer flex items-center justify-between"
                          >
                            <span>{subName}</span>
                            <ChevronRight className="w-3 h-3 text-[#6B7280]" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Useful Customer Links */}
          <div className="py-2">
            <div
              onClick={() => handleNav('/track-order')}
              className="flex items-center justify-between px-4 py-2 text-sm text-[#111827] hover:bg-[#FAF7F0] cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#1B4D2B]" /> {t('track_order')}
              </span>
              <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            </div>

            <div
              onClick={() => handleNav('/wishlist')}
              className="flex items-center justify-between px-4 py-2 text-sm text-[#111827] hover:bg-[#FAF7F0] cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#6B7280]" /> {t('wishlist')}
              </span>
              <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            </div>
          </div>

          {/* Static Pages Links */}
          <div className="py-2">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              {language === 'en' ? 'Support & Info' : 'সহায়তা ও তথ্য'}
            </div>
            <div
              onClick={() => handleNav('/page/about-us')}
              className="flex items-center gap-2.5 px-4 py-1.5 text-sm text-[#4B5563] hover:text-[#111827] hover:bg-[#FAF7F0] cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#6B7280]" /> {language === 'en' ? 'About Us' : 'আমাদের সম্পর্কে'}
            </div>
            <div
              onClick={() => handleNav('/page/contact-us')}
              className="flex items-center gap-2.5 px-4 py-1.5 text-sm text-[#4B5563] hover:text-[#111827] hover:bg-[#FAF7F0] cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#6B7280]" /> {t('contact_us')}
            </div>
            <div
              onClick={() => handleNav('/page/faq')}
              className="flex items-center gap-2.5 px-4 py-1.5 text-sm text-[#4B5563] hover:text-[#111827] hover:bg-[#FAF7F0] cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#6B7280]" /> {language === 'en' ? 'FAQ' : 'সাধারণ প্রশ্ন (FAQ)'}
            </div>
          </div>

          {/* User Account / Logout */}
          {isAuthenticated && (
            <div className="py-2">
              <div
                onClick={() => handleNav('/account')}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1B4D2B] font-semibold hover:bg-[#FAF7F0] cursor-pointer"
              >
                <User className="w-4 h-4" /> {t('account')}
              </div>
              <div
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> {t('logout')}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Hotline */}
        <div className="p-3 bg-[#FAF7F0] border-t border-[#ECE8DF] text-xs text-[#6B7280] flex items-center justify-between">
          <div>
            <div>হটলাইন:</div>
            <div className="font-bold text-[#111827]">{settings.phone}</div>
          </div>
          <button
            onClick={() => handleNav('/contact-us')}
            className="text-xs font-semibold text-[#1B4D2B] underline"
          >
            যোগাযোগ
          </button>
        </div>
      </div>
    </div>
  );
};
