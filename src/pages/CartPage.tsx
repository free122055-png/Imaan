import React, { useState } from 'react';
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getSettings } from '../services/storeService';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice, formatSize } from '../utils/format';

interface CartPageProps {
  onNavigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart, removeFromCart, updateQuantity, clearCart,
    subtotal, deliveryCharge, deliveryZone, setDeliveryZone,
    appliedCoupon, couponDiscount, applyCouponCode, removeCoupon, total
  } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const { t, getL, language } = useLanguage();
  const settings = getSettings();
  const [couponInput, setCouponInput] = useState('');

  const isFreeDeliveryEligible = subtotal >= settings.freeDeliveryMinOrder && subtotal > 0;
  const remainingForFreeDelivery = Math.max(0, settings.freeDeliveryMinOrder - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput.trim());
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-24 h-24 mx-auto rounded-full bg-[#FAF7F0] border border-[#ECE8DF] flex items-center justify-center text-[#1B4D2B]">
          <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-bold text-[#111827]">{t('cart_empty')}</h2>
        <p className="text-sm text-[#6B7280] max-w-md mx-auto">
          {t('cart_empty_desc')}
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#1B4D2B] hover:bg-[#153D22] text-white font-semibold px-8 py-3 rounded-xl shadow-xs transition transform active:scale-95 inline-flex items-center gap-2"
        >
          <span>{t('shop_now')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#ECE8DF] pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#1B4D2B]" />
          <span>{t('shopping_cart')} ({cart.length} {t('items')})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-800 font-medium underline"
        >
          {t('clear_cart')}
        </button>
      </div>

      {/* Free Delivery Progress Alert */}
      <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#ECE8DF] flex items-center gap-3">
        <Truck className="w-6 h-6 text-[#1B4D2B] shrink-0" />
        <div className="flex-1 text-xs sm:text-sm">
          {isFreeDeliveryEligible ? (
            <span className="text-[#1B4D2B] font-bold">
              {t('free_delivery_unlocked')}
            </span>
          ) : (
            <span>
              {language === 'en' ? (
                <>Add <strong className="text-[#1B4D2B]">{formatPrice(remainingForFreeDelivery, language)}</strong> more to get <strong>Free Delivery</strong>!</>
              ) : (
                <>আর মাত্র <strong className="text-[#1B4D2B]">{formatPrice(remainingForFreeDelivery, language)}</strong> টাকার পণ্য কিনলেই ডেলিভারি সম্পূর্ণ ফ্রি!</>
              )}
            </span>
          )}
          {/* Progress bar */}
          <div className="w-full bg-[#ECE8DF] h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#1B4D2B] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (subtotal / settings.freeDeliveryMinOrder) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Columns: Item list & Order summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#ECE8DF] divide-y divide-[#ECE8DF] overflow-hidden">
            {cart.map((item) => {
              const itemName = getL(item.product, 'name');
              return (
                <div
                  key={`${item.product.id}-${item.selectedVariant.id}`}
                  className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-[#FAF7F0]/40 transition"
                >
                  {/* Product Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={itemName}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-[#ECE8DF] shrink-0 cursor-pointer"
                    onClick={() => onNavigate(`/products/${item.product.slug}`)}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => onNavigate(`/products/${item.product.slug}`)}
                      className="font-bold text-sm sm:text-base text-[#111827] truncate hover:text-[#1B4D2B] cursor-pointer"
                    >
                      {itemName}
                    </h3>
                    <div className="text-xs text-[#6B7280] font-medium mt-0.5">
                      {t('size')}: <span className="text-[#1B4D2B] font-semibold">{formatSize(item.selectedVariant.size, language)}</span>
                    </div>
                    <div className="text-sm font-bold text-[#1B4D2B] mt-1">
                      {formatPrice(item.selectedVariant.price, language)} × {item.quantity} = {formatPrice(item.selectedVariant.price * item.quantity, language)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center border border-[#ECE8DF] rounded-lg overflow-hidden bg-white shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-[#FAF7F0] text-[#111827] transition"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#111827] select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity + 1)}
                      disabled={item.quantity >= item.selectedVariant.stock}
                      className="p-1.5 hover:bg-[#FAF7F0] text-[#111827] disabled:opacity-40 transition"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedVariant.id)}
                    className="p-2 text-[#6B7280] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping button */}
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs sm:text-sm font-semibold text-[#1B4D2B] hover:underline flex items-center gap-1"
            >
              <span>← {t('continue_shopping')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#ECE8DF] shadow-xs space-y-5">
            <h3 className="font-bold text-base text-[#111827] border-b border-[#ECE8DF] pb-3">
              {t('order_summary')}
            </h3>

            {/* Delivery Zone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">{t('delivery_zone')}:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setDeliveryZone('inside')}
                  className={`p-2.5 rounded-xl border font-semibold text-center transition ${
                    deliveryZone === 'inside'
                      ? 'border-[#1B4D2B] bg-[#FAF7F0] text-[#1B4D2B]'
                      : 'border-[#ECE8DF] text-gray-600 bg-white'
                  }`}
                >
                  {t('inside_dhaka')}
                  <div className="text-[10px] text-gray-500 font-normal">{t('delivery_charge')}: {formatPrice(settings.deliveryInsideDhaka, language)}</div>
                </button>
                <button
                  onClick={() => setDeliveryZone('outside')}
                  className={`p-2.5 rounded-xl border font-semibold text-center transition ${
                    deliveryZone === 'outside'
                      ? 'border-[#1B4D2B] bg-[#FAF7F0] text-[#1B4D2B]'
                      : 'border-[#ECE8DF] text-gray-600 bg-white'
                  }`}
                >
                  {t('outside_dhaka')}
                  <div className="text-[10px] text-gray-500 font-normal">{t('delivery_charge')}: {formatPrice(settings.deliveryOutsideDhaka, language)}</div>
                </button>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">{t('coupon_code')}:</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#1B4D2B]" />
                    <span className="font-bold text-[#1B4D2B]">{appliedCoupon.code}</span>
                    <span className="text-emerald-700">(-{formatPrice(couponDiscount, language)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:text-rose-800 font-semibold text-xs"
                  >
                    {t('remove_coupon')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="AIMAN50"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="flex-1 bg-white border border-[#ECE8DF] rounded-xl px-3 py-2 text-xs uppercase focus:outline-hidden focus:border-[#1B4D2B]"
                  />
                  <button
                    type="submit"
                    className="bg-[#111827] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    {t('apply')}
                  </button>
                </form>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-[#ECE8DF] text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t('subtotal')}:</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal, language)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('delivery_charge')}:</span>
                <span className="font-bold text-gray-900">
                  {deliveryCharge === 0 ? <span className="text-[#1B4D2B] font-bold">{t('free')}</span> : formatPrice(deliveryCharge, language)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>{t('coupon_discount')}:</span>
                  <span className="font-bold">-{formatPrice(couponDiscount, language)}</span>
                </div>
              )}
              <div className="flex justify-between text-base sm:text-lg font-bold text-[#1B4D2B] pt-2 border-t border-[#ECE8DF]">
                <span>{t('total')}:</span>
                <span>{formatPrice(total, language)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (!isAuthenticated && !isAdmin) {
                  onNavigate('/login');
                } else {
                  onNavigate('/checkout');
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#1B4D2B] hover:bg-[#153D22] text-white font-semibold text-sm py-3.5 rounded-xl shadow-xs transition transform active:scale-98 cursor-pointer"
            >
              <span>{t('proceed_to_checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Safe Shopping Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-2 text-center">
              <ShieldCheck className="w-4 h-4 text-[#1B4D2B]" />
              <span>{t('promise_cod')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
