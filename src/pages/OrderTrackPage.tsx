import React, { useState, useEffect } from 'react';
import {
  Search, CheckCircle2, Clock, Package, Truck, Check, AlertTriangle, MapPin
} from 'lucide-react';
import { findOrderByNumberAndPhone } from '../services/storeService';
import { Order, OrderStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice, formatDate } from '../utils/format';

interface OrderTrackPageProps {
  onNavigate: (route: string) => void;
  initialOrderNumber?: string;
  initialPhone?: string;
}

export const OrderTrackPage: React.FC<OrderTrackPageProps> = ({ onNavigate, initialOrderNumber = '', initialPhone = '' }) => {
  const { t, language } = useLanguage();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qNum = params.get('num') || initialOrderNumber;
      const qPhone = params.get('phone') || initialPhone;

      if (qNum) setOrderNumber(qNum);
      if (qPhone) setPhone(qPhone);

      if (qNum && qPhone) {
        const found = findOrderByNumberAndPhone(qNum, qPhone);
        if (found) {
          setSearchedOrder(found);
          setHasSearched(true);
        }
      }
    }
  }, [initialOrderNumber, initialPhone]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setHasSearched(true);

    if (!orderNumber.trim()) {
      setErrorMsg(t('order_number_required'));
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(t('phone_required'));
      return;
    }

    const found = findOrderByNumberAndPhone(orderNumber.trim(), phone.trim());
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setErrorMsg(t('no_order_found_matching'));
    }
  };

  // Status index for timeline
  const STATUS_STEPS: { key: OrderStatus; labelKey: string; descKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'pending', labelKey: 'status_pending', descKey: 'step_desc_pending', icon: Clock },
    { key: 'confirmed', labelKey: 'status_confirmed', descKey: 'step_desc_confirmed', icon: CheckCircle2 },
    { key: 'packing', labelKey: 'status_packing', descKey: 'step_desc_packing', icon: Package },
    { key: 'shipped', labelKey: 'status_shipped', descKey: 'step_desc_shipped', icon: Truck },
    { key: 'delivered', labelKey: 'status_delivered', descKey: 'step_desc_delivered', icon: Check },
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'cancelled') return 'cancelled';
    const order = ['pending', 'confirmed', 'packing', 'shipped', 'delivered'];
    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 md:pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
          {t('track_order_heading')}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto">
          {t('track_order_subtitle')}
        </p>
      </div>

      {/* Search Tracking Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#ECE8DF] shadow-xs">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {t('order_number')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="AB-20261109-1234"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                required
                className="w-full bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-sm uppercase focus:outline-hidden focus:border-[#1B4D2B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {t('phone_number')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#1B4D2B]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1B4D2B] hover:bg-[#153D22] text-white font-semibold text-sm py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t('track_button')}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Searched Order Result Display */}
      {searchedOrder && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE8DF] shadow-xs space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE8DF] pb-4">
            <div>
              <div className="text-xs text-[#6B7280] font-semibold">{t('order_number')}:</div>
              <div className="text-xl font-bold text-[#1B4D2B]">{searchedOrder.orderNumber}</div>
              <div className="text-xs text-[#6B7280]">
                {t('date')}: {formatDate(searchedOrder.createdAt, language)}
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                searchedOrder.orderStatus === 'delivered'
                  ? 'bg-emerald-100 text-[#1B4D2B]'
                  : searchedOrder.orderStatus === 'cancelled'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-[#FAF7F0] text-[#111827]'
              }`}>
                {t('order_status')}: {t(`status_${searchedOrder.orderStatus}` as any) || searchedOrder.orderStatus}
              </span>
              <div className="text-base font-bold text-[#111827] mt-1">
                {t('total')}: {formatPrice(searchedOrder.total, language)}
              </div>
            </div>
          </div>

          {/* Cancelled Banner if cancelled */}
          {searchedOrder.orderStatus === 'cancelled' ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <div className="font-bold text-sm">{t('order_cancelled_notice')}</div>
                <div className="text-xs text-rose-700">
                  {t('contact_support_for_help')}
                </div>
              </div>
            </div>
          ) : (
            /* Visual Progress Timeline */
            <div className="py-2">
              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0" />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {STATUS_STEPS.map((step) => {
                    const state = getStepStatus(step.key, searchedOrder.orderStatus);
                    const IconComponent = step.icon;

                    return (
                      <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                        {/* Step Icon Circle */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 transition-all ${
                            state === 'completed'
                              ? 'bg-[#1B4D2B] border-[#1B4D2B] text-white'
                              : state === 'current'
                              ? 'bg-[#FAF7F0] border-[#1B4D2B] text-[#1B4D2B] ring-4 ring-[#FAF7F0]'
                              : 'bg-gray-100 border-gray-300 text-gray-400'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Step Details */}
                        <div>
                          <div className={`text-xs sm:text-sm font-bold ${
                            state === 'current' ? 'text-[#1B4D2B]' : 'text-[#111827]'
                          }`}>
                            {t(step.labelKey as any)}
                          </div>
                          <div className="text-[11px] text-[#6B7280] leading-snug">
                            {t(step.descKey as any)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Status History Log */}
          {searchedOrder.statusHistory && searchedOrder.statusHistory.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#6B7280]">
                {t('status_log')}:
              </h4>
              <div className="space-y-2">
                {searchedOrder.statusHistory.map((item, i) => (
                  <div key={i} className="p-3 bg-[#FAF7F0] rounded-xl text-xs flex items-center justify-between border border-[#ECE8DF]">
                    <div>
                      <span className="font-bold text-[#111827]">{t(`status_${item.status}` as any) || item.status}</span>
                      {item.note && <span className="text-[#6B7280] ml-2">— {item.note}</span>}
                    </div>
                    <span className="text-gray-400 text-[10px]">
                      {formatDate(item.updatedAt || item.time || new Date().toISOString(), language)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#ECE8DF]">
            {/* Delivery address */}
            <div className="space-y-1.5 text-xs text-[#6B7280]">
              <div className="font-bold text-[#111827] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#1B4D2B]" />
                <span>{t('delivery_address')}:</span>
              </div>
              <div className="pl-5 leading-relaxed">
                {searchedOrder.customerName} <br />
                {t('phone_number')}: {searchedOrder.phone} <br />
                {t('full_address')}: {searchedOrder.fullAddress}, {searchedOrder.thana}, {searchedOrder.district}
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-[#111827]">{t('order_items')}:</div>
              {searchedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[#4B5563]">
                  <span className="truncate pr-2">{it.productName || (it as any).name} ({it.variantSize || (it as any).sizeLabel} × {it.quantity || (it as any).qty})</span>
                  <span className="font-bold text-[#111827] shrink-0">{formatPrice(it.total || (it as any).lineTotal, language)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
