import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HeroBannerSliderProps {
  banners: Banner[];
  onNavigate: (route: string) => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({ banners, onNavigate }) => {
  const { t, getL } = useLanguage();
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch Swipe handlers
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const total = activeBanners.length;

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % total);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (total === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden select-none bg-gradient-to-b from-[#FF7A00] to-[#F46000]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        {activeBanners.map((banner, idx) => {
          const isCurrent = idx === currentIndex;
          const bannerTitle = getL(banner, 'title');
          const bannerSub = getL(banner, 'subtitle');
          const bannerBadge = getL(banner, 'badge');

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Picture */}
              <picture className="absolute inset-0 w-full h-full">
                <source media="(max-width: 640px)" srcSet={banner.imageMobile || banner.imageDesktop} />
                <img
                  src={banner.imageDesktop}
                  alt={bannerTitle}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </picture>

              {/* Cinematic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

              {/* Safe Center Area Content Container */}
              <div className="relative z-20 w-full h-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-center">
                <div className="max-w-xl space-y-2 sm:space-y-3">
                  {/* Badge */}
                  {bannerBadge && (
                    <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[10px] sm:text-xs font-black bg-brand-600 text-white shadow-sm">
                      <span>{bannerBadge}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.25] tracking-tight drop-shadow-md">
                    {bannerTitle}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed drop-shadow-sm max-w-lg line-clamp-2 sm:line-clamp-3">
                    {bannerSub}
                  </p>

                  {/* Call to action button */}
                  <div className="pt-2 sm:pt-3">
                    <button
                      onClick={() => onNavigate(banner.link || '/category/mustard-oil')}
                      className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm px-5 sm:px-7 h-11 sm:h-12 rounded-xl transition shadow-lg active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('order_now')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Subtle Next/Prev Navigation Arrows */}
        {total > 1 && (
          <div className="hidden sm:flex items-center justify-between absolute inset-x-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white/30 hover:bg-white/60 text-white backdrop-blur-xs transition pointer-events-auto shadow-md"
              aria-label="পূর্ববর্তী"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white/30 hover:bg-white/60 text-white backdrop-blur-xs transition pointer-events-auto shadow-md"
              aria-label="পরবর্তী"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Safe Area Dots Indicator */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-6 bg-brand-600'
                    : 'w-2 bg-white/60 hover:bg-white/90'
                }`}
                aria-label={`ব্যানার স্লাইড ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
