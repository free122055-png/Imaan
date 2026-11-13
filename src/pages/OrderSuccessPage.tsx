import React from 'react';
import { CheckCircle2, MapPin, Printer, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { getOrderById } from '../services/storeService';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice, formatDate } from '../utils/format';

interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (route: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onNavigate }) => {
  const order = getOrderById(orderId);
  const { t, language } = useLanguage();

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{t('order_not_found')}</h2>
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#1B4D2B] text-white px-5 py-2 rounded-xl text-sm font-medium"
        >
          {t('go_to_home')}
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-12">
      {/* Top Success Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE8DF] shadow-xs text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-50 text-[#1B4D2B] flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#1B4D2B] bg-[#FAF7F0] px-3 py-1 rounded-full uppercase tracking-wider">
            {t('order_placed_success')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mt-2">
            {t('thank_you_customer', { name: order.customerName })}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto mt-1">
            {t('order_received_desc')}
          </p>
        </div>

        {/* Order Number Box */}
        <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#ECE8DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div>
            <div className="text-xs text-[#6B7280] font-semibold">{t('order_number')}:</div>
            <div className="text-lg sm:text-xl font-bold text-[#1B4D2B] tracking-wider select-all">
              {order.orderNumber}
            </div>
            <div className="text-[11px] text-[#6B7280]">
              {t('date')}: {formatDate(order.createdAt, language)}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate(`/track-order?num=${order.orderNumber}&phone=${order.phone}`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#1B4D2B] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs hover:bg-[#153D22] transition"
            >
              <Truck className="w-4 h-4" />
              <span>{t('track_order')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition no-print"
              title={t('print_invoice')}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{t('print')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#ECE8DF] shadow-xs space-y-5">
        <h3 className="font-bold text-base text-[#111827] border-b border-[#ECE8DF] pb-3 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#1B4D2B]" />
          <span>{t('order_summary')}</span>
        </h3>

        {/* Items List */}
        <div className="divide-y divide-[#ECE8DF]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center gap-3">
              <img
                src={item.productImage || (item as any).image}
                alt={item.productName || (item as any).name}
                className="w-12 h-12 rounded-lg object-cover border border-[#ECE8DF]"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-[#111827] truncate">{item.productName || (item as any).name}</div>
                <div className="text-xs text-[#6B7280]">
                  {item.variantSize || (item as any).sizeLabel} × {item.quantity || (item as any).qty}
                </div>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#1B4D2B]">
                {formatPrice(item.total || (item as any).lineTotal, language)}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-1.5 pt-3 border-t border-[#ECE8DF] text-xs sm:text-sm text-gray-600">
          <div className="flex justify-between">
            <span>{t('subtotal')}:</span>
            <span className="font-semibold text-gray-900">{formatPrice(order.subtotal, language)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('delivery_charge')}:</span>
            <span className="font-semibold text-gray-900">
              {order.deliveryCharge === 0 ? <span className="text-[#1B4D2B] font-bold">{t('free')}</span> : formatPrice(order.deliveryCharge, language)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>{t('coupon_discount')}:</span>
              <span className="font-semibold">-{formatPrice(order.discount, language)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-[#1B4D2B] pt-2 border-t border-[#ECE8DF]">
            <span>{t('total')}:</span>
            <span>{formatPrice(order.total, language)}</span>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#ECE8DF] space-y-2 text-xs">
          <div className="font-bold text-[#111827] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#1B4D2B]" />
            <span>{t('delivery_address')}:</span>
          </div>
          <div className="text-[#4B5563] pl-5 leading-relaxed">
            {order.customerName} <br />
            {t('phone_number')}: {order.phone} {order.alternativePhone && `(${order.alternativePhone})`} <br />
            {t('full_address')}: {order.fullAddress}, {order.thana}, {order.district}
          </div>
          <div className="text-gray-500 pl-5 pt-1">
            {t('payment_method')}: <strong className="text-gray-800">{order.paymentMethod.toUpperCase()}</strong> ({order.paymentStatus === 'paid' ? t('status_paid') : t('cod')})
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 no-print">
        <button
          onClick={() => onNavigate('/')}
          className="bg-white border border-[#ECE8DF] text-[#111827] px-6 py-3 rounded-xl font-medium text-xs sm:text-sm hover:bg-[#FAF7F0] transition"
        >
          {t('go_to_home')}
        </button>
        <button
          onClick={() => onNavigate(`/track-order?num=${order.orderNumber}&phone=${order.phone}`)}
          className="bg-[#1B4D2B] text-white px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm hover:bg-[#153D22] transition flex items-center justify-center gap-2 shadow-xs"
        >
          <span>{t('track_order')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
