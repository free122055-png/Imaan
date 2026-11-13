import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag, Search, X, ChevronRight, Globe } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getSettings, getProducts } from '../../services/storeService';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';

interface HeaderProps {
  onOpenDrawer: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDrawer, onNavigate }) => {
  const { itemCount } = useCart();
  const { isAdmin, isAuthenticated } = useAuth();
  const { language, setLanguage, toggleLanguage, t, getL } = useLanguage();
  const settings = getSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const all = getProducts();
      const matched = all
        .filter(p => p.isActive && (p.nameBn.toLowerCase().includes(q) || (p.nameEn && p.nameEn.toLowerCase().includes(q))))
        .slice(0, 5);
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    onNavigate(`/products/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const siteTitle = getL(settings, 'siteName') || t('site_title');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#ECE8DF]">

      {/* Main Header Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* 1. Left: Menu Button */}
          <div className="flex items-center">
            <button
              onClick={onOpenDrawer}
              className="p-2 -ml-2 text-[#111827] hover:text-[#1B4D2B] rounded-lg transition active:bg-[#FAF7F0]"
              aria-label={t('menu')}
            >
              <Menu className="w-6 h-6 stroke-[1.8]" />
            </button>
          </div>

          {/* 2. Center: Clean Unclipped Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="cursor-pointer select-none flex items-center justify-center py-1"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1B4D2B] text-[#FAF7F0] font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                {language === 'en' ? 'A' : 'আ'}
              </span>
              <span className="font-bold text-lg sm:text-2xl text-[#1B4D2B] tracking-tight whitespace-nowrap leading-snug pt-0.5">
                {siteTitle}
              </span>
            </div>
          </div>

          {/* 3. Right: Language Switcher, Search & Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Language Switcher Switch [ বাং | EN ] */}
            <div className="hidden sm:flex items-center bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 rounded-lg transition ${
                  language === 'bn'
                    ? 'bg-[#1B4D2B] text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-[#1B4D2B]'
                }`}
                title="বাংলায় পরিবর্তন করুন"
              >
                বাং
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition ${
                  language === 'en'
                    ? 'bg-[#1B4D2B] text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-[#1B4D2B]'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Mobile Language Toggle Compact Button */}
            <button
              onClick={toggleLanguage}
              className="sm:hidden p-1.5 px-2 bg-[#FAF7F0] border border-[#ECE8DF] text-[#1B4D2B] font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition"
              aria-label="Change language"
              title="ভাষা পরিবর্তন করুন / Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Search Toggle Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#111827] hover:text-[#1B4D2B] rounded-lg transition"
              aria-label={t('search')}
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5 stroke-[1.8]" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => {
                if (!isAuthenticated && !isAdmin) {
                  onNavigate('/login');
                } else {
                  onNavigate('/cart');
                }
              }}
              className="relative p-2 text-[#111827] hover:text-[#1B4D2B] rounded-lg transition"
              aria-label={t('cart')}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#1B4D2B] text-white font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Clean expandable search bar underneath */}
        {isSearchOpen && (
          <div className="pb-3 pt-1 border-t border-[#ECE8DF]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl py-2 pl-4 pr-10 text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-hidden focus:border-[#1B4D2B]"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1B4D2B] p-1"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {suggestions.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-[#ECE8DF] overflow-hidden max-h-64 overflow-y-auto">
                {suggestions.map(p => {
                  const pName = getL(p, 'name');
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectSuggestion(p.slug)}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#FAF7F0] cursor-pointer border-b border-[#ECE8DF] last:border-0 transition"
                    >
                      <img src={p.images[0]} alt={pName} className="w-10 h-10 object-contain rounded-lg bg-[#FAF7F0]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#111827] truncate">{pName}</div>
                        <div className="text-xs text-[#1B4D2B] font-bold">{formatPrice(p.variants[0]?.price, language)}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
