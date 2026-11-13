import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice, formatDigits } from '../../utils/format';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { language, t, getL } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);

  // Default to primary variant
  const primaryVariant = product.variants[0] || { id: 'v0', size: '', price: 0, stock: 10 };

  const discount = primaryVariant.oldPrice && primaryVariant.oldPrice > primaryVariant.price
    ? Math.round(((primaryVariant.oldPrice - primaryVariant.price) / primaryVariant.oldPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated && !isAdmin) {
      onNavigate('/login');
      return;
    }
    if (primaryVariant.stock <= 0) return;
    addToCart(product, primaryVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const productName = getL(product, 'name');

  return (
    <div
      onClick={() => onNavigate(`/products/${product.slug}`)}
      className="group bg-white rounded-xl border border-[#ECE8DF] overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:border-[#1B4D2B]/30"
    >
      {/* 1. Product Image with optional small gold discount badge */}
      <div className="relative aspect-square w-full bg-[#FAF7F0] overflow-hidden flex items-center justify-center p-3">
        <img
          src={product.images[0]}
          alt={productName}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* 2. Single small discount badge if on sale */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#C99A2E] text-white text-[11px] font-bold px-2 py-0.5 rounded-md leading-snug">
            {formatDigits(discount, language === 'bn' ? 'bengali' : 'english')}% {language === 'en' ? 'OFF' : 'ছাড়'}
          </span>
        )}

        {primaryVariant.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[#6B7280] font-semibold text-xs">
            {t('out_of_stock')}
          </div>
        )}
      </div>

      {/* Content Area: Title & Price + Cart Button */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        {/* 3. Product Name (maximum 2 lines) */}
        <h3 className="font-semibold text-[13px] sm:text-sm text-[#111827] line-clamp-2 leading-relaxed min-h-[38px] group-hover:text-[#1B4D2B] transition-colors">
          {productName}
        </h3>

        {/* Bottom row: Price & Small '+' Cart Button */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#ECE8DF]/60 mt-auto">
          {/* Price: Bold current price + crossed old price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-[#1B4D2B] leading-none">
              {formatPrice(primaryVariant.price, language)}
            </span>
            {primaryVariant.oldPrice && primaryVariant.oldPrice > primaryVariant.price && (
              <span className="text-xs text-[#6B7280] line-through leading-none">
                {formatPrice(primaryVariant.oldPrice, language)}
              </span>
            )}
          </div>

          {/* 5. Compact '+' Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={primaryVariant.stock <= 0}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
              primaryVariant.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAdded
                ? 'bg-[#1B4D2B] text-white'
                : 'bg-[#FAF7F0] text-[#1B4D2B] hover:bg-[#1B4D2B] hover:text-white border border-[#ECE8DF]'
            }`}
            aria-label={t('add_to_cart')}
            title={t('add_to_cart')}
          >
            {isAdded ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>
      </div>
    </div>
  );
};
