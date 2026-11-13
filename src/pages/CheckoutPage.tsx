import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, Truck, ArrowLeft, CheckCircle, AlertCircle, ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getSettings } from '../services/storeService';
import { BANGLADESH_DISTRICTS } from '../data/seedData';
import { PaymentMethod } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice, formatSize } from '../utils/format';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, subtotal, deliveryCharge, deliveryZone, setDeliveryZone, appliedCoupon, couponDiscount, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { t, getL, language } = useLanguage();
  const settings = getSettings();

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
  const [selectedThana, setSelectedThana] = useState('চকবাজার');
  const [fullAddress, setFullAddress] = useState(
    currentUser?.addresses && currentUser.addresses.length > 0 ? currentUser.addresses[0].fullAddress : ''
  );
  const [orderNotes, setOrderNotes] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // Error & loading
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available thanas for current district
  const currentDistrictObj = BANGLADESH_DISTRICTS.find(d => d.nameBn === selectedDistrict || d.nameEn === selectedDistrict);
  const thanas = currentDistrictObj ? currentDistrictObj.thanas : ['সদর'];

  useEffect(() => {
    // If district changes to Dhaka, auto set inside Dhaka, else outside
    const isDhaka = selectedDistrict === 'ঢাকা' || selectedDistrict === 'Dhaka';
    const targetZone = isDhaka ? 'inside' : 'outside';
    if (deliveryZone !== targetZone) {
      setDeliveryZone(targetZone);
    }
  }, [selectedDistrict, deliveryZone, setDeliveryZone]);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('/login');
    }
  }, [isAuthenticated, onNavigate]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">অর্ডার করতে প্রথমে লগইন করুন</h2>
        <p className="text-gray-500 text-sm">ক্রয় সম্পন্ন করতে আপনার গুগল অ্যাকাউন্ট দিয়ে লগইন থাকা আবশ্যক।</p>
        <button
          onClick={() => onNavigate('/login')}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          গুগল দিয়ে লগইন করুন
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{t('cart_empty')}</h2>
        <p className="text-gray-500 text-sm">{t('cart_empty_desc')}</p>
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#1B4D2B] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#153D22]"
        >
          {t('go_to_home')}
        </button>
      </div>
    );
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!customerName.trim()) {
      setErrorMsg(t('name_required'));
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('01') || cleanPhone.length !== 11) {
      setErrorMsg(t('phone_invalid'));
      return;
    }

    if (!fullAddress.trim()) {
      setErrorMsg(t('address_required'));
      return;
    }

    // Manual payment validation
    if (paymentMethod !== 'cod') {
      if (!transactionId.trim()) {
        setErrorMsg(t('trx_id_required'));
        return;
      }
      if (!senderPhone.trim()) {
        setErrorMsg(t('sender_phone_required'));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const newOrder = createOrder({
        source: 'web',
        customer: {
          uid: currentUser?.id,
          name: customerName.trim(),
          phone: cleanPhone,
          altPhone: alternativePhone.trim() || undefined,
          email: currentUser?.email,
        },
        address: {
          district: selectedDistrict,
          thana: selectedThana,
          fullAddress: fullAddress.trim(),
          deliveryNote: orderNotes.trim() || undefined,
        },
        items: cart.map(item => ({
          productId: item.product.id,
          variantId: item.selectedVariant.id,
          name: getL(item.product, 'name'),
          sizeLabel: formatSize(item.selectedVariant.size, language),
          sku: item.selectedVariant.sku || item.product.sku,
          image: item.product.images[0] || '',
          unitPrice: item.selectedVariant.price,
          oldPrice: item.selectedVariant.oldPrice,
          qty: item.quantity,
          lineTotal: item.selectedVariant.price * item.quantity,
        })),
        pricing: {
          subtotal,
          deliveryCharge,
          promo: appliedCoupon ? {
            code: appliedCoupon.code,
            type: appliedCoupon.discountType,
            discountAmount: couponDiscount,
          } : undefined,
          total,
        },
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'unpaid' : 'pending-verification',
          senderNumber: senderPhone.trim() || undefined,
          trxId: transactionId.trim() || undefined,
          paidAmount: paymentMethod === 'cod' ? 0 : total,
        },
        status: 'pending',
        customerNote: orderNotes.trim() || undefined,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }

      clearCart();
      setIsSubmitting(false);
      onNavigate(`/order-success/${newOrder.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMsg(t('order_failed_msg'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <button onClick={() => onNavigate('/cart')} className="hover:text-[#1B4D2B] flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('back_to_cart')}
        </button>
        <span>/</span>
        <span className="font-bold text-gray-800">{t('checkout')}</span>
      </div>

      <div className="border-b border-[#ECE8DF] pb-3">
        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <span>{t('checkout_title')}</span>
        </h1>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          {t('checkout_subtitle')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Info & Address Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Details Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#ECE8DF] shadow-xs space-y-4">
              <h2 className="font-bold text-base text-[#111827] border-b border-[#ECE8DF] pb-2.5 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1B4D2B]" />
                <span>1. {t('delivery_info')}</span>
              </h2>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  {t('full_name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. Rafiqul Islam' : 'যেমন: রফিকুল ইসলাম'}
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#1B4D2B]"
                />
              </div>

              {/* Phone & Alternative Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t('phone_number')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    maxLength={11}
                    required
                    className="w-full bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#1B4D2B]"
                  />
                  <span className="text-[10px] text-gray-400">{t('phone_calling_note')}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t('alt_phone')} ({t('optional')})
                  </label>
                  <input
                    type="tel"
                    placeholder="018XXXXXXXX"
                    value={alternativePhone}
                    onChange={e => setAlternativePhone(e.target.value)}
                    maxLength={11}
                    className="w-full bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#1B4D2B]"
                  />
                </div>
              </div>

              {/* District & Thana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t('district')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedDistrict(val);
                      const dObj = BANGLADESH_DISTRICTS.find(d => d.nameBn === val || d.nameEn === val);
                      if (dObj && dObj.thanas.length > 0) {
                        setSelectedThana(dObj.thanas[0]);
                      }
                    }}
                    className="w-full bg-white border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#1B4D2B]"
                  >
                    {BANGLADESH_DISTRICTS.map(dist => (
                      <option key={dist.nameBn} value={language === 'en' ? dist.nameEn : dist.nameBn}>
                        {language === 'en' ? dist.nameEn : dist.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t('thana')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedThana}
                    onChange={e => setSelectedThana(e.target.value)}
                    className="w-full bg-white border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#1B4D2B]"
                  >
                    {thanas.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  {t('full_address')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'en' ? 'e.g. House #12, Road #4, Dhanmondi, Dhaka' : 'যেমন: বাড়ি #১২, রোড #৪, ধানমন্ডি, ঢাকা'}
                  value={fullAddress}
                  onChange={e => setFullAddress(e.target.value)}
                  required
                  className="w-full bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl p-3 text-sm focus:outline-hidden focus:border-[#1B4D2B]"
                />
              </div>

              {/* Order Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  {t('order_notes')} ({t('optional')})
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. Deliver after 3 PM' : 'যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়'}
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full bg-white border border-[#ECE8DF] rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:border-[#1B4D2B]"
                />
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#ECE8DF] shadow-xs space-y-4">
              <h2 className="font-bold text-base text-[#111827] border-b border-[#ECE8DF] pb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B4D2B]" />
                <span>2. {t('payment_method')}</span>
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'cod' ? 'border-[#1B4D2B] bg-[#FAF7F0]' : 'border-[#ECE8DF] hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-[#1B4D2B]"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#111827]">{t('cod')}</div>
                    <div className="text-xs text-[#6B7280]">{t('cod_desc')}</div>
                  </div>
                </label>

                {/* bKash */}
                {settings.paymentMethods.bkash.enabled && (
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'bkash' ? 'border-[#DF146E] bg-pink-50/70' : 'border-[#ECE8DF] hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-1 accent-[#DF146E]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">{t('bkash')} (Send Money)</span>
                        <span className="bg-[#DF146E] text-white text-[10px] font-bold px-2 py-0.5 rounded">bKash</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {t('number')}: <strong className="text-gray-900">{settings.paymentMethods.bkash.number}</strong> ({settings.paymentMethods.bkash.type})
                      </div>
                    </div>
                  </label>
                )}

                {/* Nagad */}
                {settings.paymentMethods.nagad.enabled && (
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'nagad' ? 'border-[#F7941D] bg-orange-50/70' : 'border-[#ECE8DF] hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-1 accent-[#F7941D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">{t('nagad')} (Send Money)</span>
                        <span className="bg-[#F7941D] text-white text-[10px] font-bold px-2 py-0.5 rounded">Nagad</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {t('number')}: <strong className="text-gray-900">{settings.paymentMethods.nagad.number}</strong> ({settings.paymentMethods.nagad.type})
                      </div>
                    </div>
                  </label>
                )}

                {/* Rocket */}
                {settings.paymentMethods.rocket.enabled && (
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'rocket' ? 'border-[#8C3494] bg-purple-50/70' : 'border-[#ECE8DF] hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'rocket'}
                      onChange={() => setPaymentMethod('rocket')}
                      className="mt-1 accent-[#8C3494]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">{t('rocket')} (Send Money)</span>
                        <span className="bg-[#8C3494] text-white text-[10px] font-bold px-2 py-0.5 rounded">Rocket</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {t('number')}: <strong className="text-gray-900">{settings.paymentMethods.rocket.number}</strong>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* TrxID input for online payments */}
              {paymentMethod !== 'cod' && (
                <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#ECE8DF] space-y-3 mt-3 animate-in fade-in">
                  <div className="text-xs font-semibold text-gray-700">
                    {t('send_money_instruction')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        {t('trx_id')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9B7XA34..."
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        required
                        className="w-full bg-white border border-[#ECE8DF] rounded-lg p-2 text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        {t('sender_phone')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={senderPhone}
                        onChange={e => setSenderPhone(e.target.value)}
                        required
                        className="w-full bg-white border border-[#ECE8DF] rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary Preview & Submit (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#ECE8DF] shadow-xs space-y-5 sticky top-24">
              <h2 className="font-bold text-base text-[#111827] border-b border-[#ECE8DF] pb-2.5 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#1B4D2B]" />
                <span>{t('order_items')} ({cart.length})</span>
              </h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-[#ECE8DF] space-y-2 pr-1">
                {cart.map(item => {
                  const itemName = getL(item.product, 'name');
                  return (
                    <div key={`${item.product.id}-${item.selectedVariant.id}`} className="flex items-center gap-3 pt-2 first:pt-0">
                      <img
                        src={item.product.images[0]}
                        alt={itemName}
                        className="w-12 h-12 rounded-lg object-cover border border-[#ECE8DF] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#111827] truncate">{itemName}</div>
                        <div className="text-[11px] text-[#6B7280]">
                          {formatSize(item.selectedVariant.size, language)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#1B4D2B] shrink-0">
                        {formatPrice(item.selectedVariant.price * item.quantity, language)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 pt-3 border-t border-[#ECE8DF] text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal')}:</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal, language)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('delivery_charge')} ({deliveryZone === 'inside' ? t('inside_dhaka') : t('outside_dhaka')}):</span>
                  <span className="font-bold text-gray-900">
                    {deliveryCharge === 0 ? <span className="text-[#1B4D2B] font-bold">{t('free')}</span> : formatPrice(deliveryCharge, language)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>{t('coupon_discount')} ({appliedCoupon?.code}):</span>
                    <span>-{formatPrice(couponDiscount, language)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[#1B4D2B] pt-2 border-t border-[#ECE8DF]">
                  <span>{t('total')}:</span>
                  <span>{formatPrice(total, language)}</span>
                </div>
              </div>

              {/* Confirm Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4D2B] hover:bg-[#153D22] disabled:bg-gray-400 text-white font-semibold text-base py-4 rounded-xl shadow-xs transition transform active:scale-98"
              >
                {isSubmitting ? (
                  <span>{t('processing')}...</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-amber-300" />
                    <span>{t('place_order')} ({formatPrice(total, language)})</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-[#6B7280] text-center leading-relaxed">
                {t('order_confirmation_note')}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
