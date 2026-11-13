import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getSettings } from '../../services/storeService';

interface FloatingActionButtonsProps {
  onNavigate?: (route: string) => void;
  currentRoute: string;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({ currentRoute }) => {
  const settings = getSettings();

  // Hide on Cart, Checkout, and Product Details pages as required
  const isHidden =
    currentRoute === '/cart' ||
    currentRoute === '/checkout' ||
    currentRoute.startsWith('/products/');

  if (isHidden) return null;

  const whatsappUrl = `https://wa.me/88${settings.whatsappNumber}?text=${encodeURIComponent(
    'আসসালামু আলাইকুম! আইমান ব্রান্ডের খাঁটি তেলের ব্যাপারে জানতে চাই।'
  )}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 no-print">
      {/* Exactly 1 compact 48px WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-md hover:bg-[#20BD5A] transition active:scale-95"
        title="হোয়াটসঅ্যাপে যোগাযোগ করুন"
        aria-label="হোয়াটসঅ্যাপে যোগাযোগ করুন"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>
    </div>
  );
};
