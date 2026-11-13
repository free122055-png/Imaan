import React from 'react';
import { Home, Grid, ShoppingBag, Search, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRoute, onNavigate, onOpenDrawer }) => {
  const { itemCount } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();

  // Crucial requirement: Completely hide bottom navigation on product details page so only sticky purchase bar is visible
  if (currentRoute.startsWith('/products/')) {
    return null;
  }

  const isHome = currentRoute === '/' || currentRoute === '';
  const isCart = currentRoute === '/cart';
  const isSearch = currentRoute.startsWith('/search');
  const isAccount = currentRoute === '/account' || currentRoute === '/login';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#ECE8DF] px-2 py-1.5 shadow-sm">
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Home */}
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            isHome ? 'text-brand-600 font-semibold' : 'text-muted'
          }`}
        >
          <Home className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] mt-0.5">{t('home')}</span>
        </button>

        {/* Menu */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 text-muted hover:text-brand-600 transition"
        >
          <Grid className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] mt-0.5">{t('menu')}</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => onNavigate('/cart')}
          className={`flex flex-col items-center justify-center py-1 relative transition ${
            isCart ? 'text-brand-600 font-semibold' : 'text-muted'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">{t('cart')}</span>
        </button>

        {/* Search */}
        <button
          onClick={() => onNavigate('/search')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            isSearch ? 'text-brand-600 font-semibold' : 'text-muted'
          }`}
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] mt-0.5">{t('search')}</span>
        </button>

        {/* Account */}
        <button
          onClick={() => onNavigate(isAuthenticated ? '/account' : '/login')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            isAccount ? 'text-brand-600 font-semibold' : 'text-muted'
          }`}
        >
          <User className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] mt-0.5 truncate max-w-[55px]">
            {t('account')}
          </span>
        </button>
      </div>
    </nav>
  );
};
