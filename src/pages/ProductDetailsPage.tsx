import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, Heart, ShoppingBag, Star,
  ShieldCheck, Truck, RefreshCw, CheckCircle2, ChevronDown, Minus, Plus, Zap, AlertCircle, MessageCircle
} from 'lucide-react';
import {
  getProductBySlug, getProducts, getCategories,
  getReviews, addReview, getSettings
} from '../services/storeService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/product/ProductCard';
import { formatPrice, formatSize } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailsPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ slug, onNavigate }) => {
  const { addToCart } = useCart();
  const { currentUser, isInWishlist, toggleWishlist, isAdmin, isAuthenticated } = useAuth();
  const { t, getL, language } = useLanguage();
  const settings = getSettings();

  const product = getProductBySlug(slug);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Sticky bottom purchase bar visibility controlled via IntersectionObserver
  const mainActionRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Accordion open/close states
  const [openAccordion, setOpenAccordion] = useState<'desc' | 'benefits' | 'usage' | null>('desc');

  // Review state: starts with 0 stars selected
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewRatingError, setReviewRatingError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmittedMsg, setReviewSubmittedMsg] = useState('');

  // Reset when navigating to another product
  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    setSelectedVariantId(null);
    setReviewRating(0);
    setReviewRatingError('');
    setShowStickyBar(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Observe in-page action button container
  useEffect(() => {
    const el = mainActionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 100);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [slug]);

  const productName = product ? getL(product, 'name') : '';

  // Update window title
  useEffect(() => {
    if (product) {
      document.title = `${productName} - ${getL(settings, 'siteName') || settings.siteName}`;
    }
  }, [productName, settings.siteName]);

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-[#111827]">{t('product_not_found')}</h2>
        <p className="text-sm text-[#6B7280]">{t('product_not_found_desc')}</p>
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#1B4D2B] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#153D22]"
        >
          {t('go_to_home')}
        </button>
      </div>
    );
  }

  const category = getCategories().find(c => c.id === product.categoryId);
  const relatedProducts = getProducts()
    .filter(p => p.isActive && p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const reviews = getReviews(product.id).filter(r => r.isApproved);
  const currentVariant = (selectedVariantId && product.variants.find(v => v.id === selectedVariantId)) || product.variants[0];
  const isOutOfStock = currentVariant.stock <= 0;
  const isLiked = isInWishlist(product.id);

  const discount = currentVariant.oldPrice && currentVariant.oldPrice > currentVariant.price
    ? Math.round(((currentVariant.oldPrice - currentVariant.price) / currentVariant.oldPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= currentVariant.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated && !isAdmin) {
      onNavigate('/login');
      return;
    }
    if (isOutOfStock) return;
    addToCart(product, currentVariant, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated && !isAdmin) {
      onNavigate('/login');
      return;
    }
    if (isOutOfStock) return;
    addToCart(product, currentVariant, quantity);
    onNavigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const productUrl = window.location.href;
    const msg = language === 'en'
      ? `Hello! I would like to order "${productName}".
Size: ${currentVariant.size}
Quantity: ${quantity}
Price: ${formatPrice(currentVariant.price * quantity, language)}
Product Link: ${productUrl}`
      : `আসসালামু আলাইকুম! আমি "${productName}" কিনতে আগ্রহী।
সাইজ: ${currentVariant.size}
পরিমাণ: ${quantity} টি
মূল্য: ${formatPrice(currentVariant.price * quantity, language)}
পণ্য লিংক: ${productUrl}`;

    window.open(`https://wa.me/88${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating < 1) {
      setReviewRatingError(t('rating_required'));
      return;
    }
    setReviewRatingError('');

    if (!reviewComment.trim()) return;

    addReview({
      productId: product.id,
      userId: currentUser?.id,
      userName: currentUser?.displayName || (language === 'en' ? 'Valued Customer' : 'সম্মানিত ক্রেতা'),
      userPhone: currentUser?.phone,
      rating: reviewRating,
      comment: reviewComment.trim(),
      isApproved: true,
    });

    setReviewComment('');
    setReviewRating(0);
    setReviewSubmittedMsg(t('review_submitted'));
    setTimeout(() => setReviewSubmittedMsg(''), 4000);
  };

  const productDescription = getL(product, 'description') || product.description;
  const productBenefits = getL(product, 'benefits') || product.benefits;
  const productUsage = getL(product, 'usage') || product.usage;

  return (
    <div className="space-y-8 pb-24 md:pb-12">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#1B4D2B] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#FAF7F0]" />
          <span>{t('item_added_cart')}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#6B7280] overflow-x-auto py-1">
        <button onClick={() => onNavigate('/')} className="hover:text-[#1B4D2B] shrink-0 font-medium">
          {t('home')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#ECE8DF]" />
        {category && (
          <>
            <button
              onClick={() => onNavigate(`/category/${category.slug}`)}
              className="hover:text-[#1B5E20] shrink-0 font-medium"
            >
              {getL(category, 'name')}
            </button>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#ECE8DF]" />
          </>
        )}
        <span className="text-[#111827] font-semibold truncate">{productName}</span>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-2xl p-4 sm:p-8 border border-[#ECE8DF]">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FAF7F0] border border-[#ECE8DF] flex items-center justify-center p-6">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={productName}
              className="w-full h-full object-contain"
            />

            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-[#C99A2E] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                {discount}% {t('discount')}
              </span>
            )}

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-3 right-3 p-2 rounded-full border border-[#ECE8DF] bg-white transition ${
                isLiked ? 'text-rose-600' : 'text-[#6B7280] hover:text-rose-600'
              }`}
              title={t('wishlist')}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {/* Thumbnails if multiple */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border p-1 bg-[#FAF7F0] transition shrink-0 ${
                    activeImageIdx === idx ? 'border-[#1B4D2B] ring-1 ring-[#1B4D2B]' : 'border-[#ECE8DF]'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] leading-[1.3] tracking-tight">
              {productName}
            </h1>

            {/* Price: Large Bold Current Price & Old Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#1B4D2B] leading-none">
                {formatPrice(currentVariant.price, language)}
              </span>
              {currentVariant.oldPrice && currentVariant.oldPrice > currentVariant.price && (
                <span className="text-base text-[#6B7280] line-through leading-none">
                  {formatPrice(currentVariant.oldPrice, language)}
                </span>
              )}
            </div>

            {/* Size Chips */}
            {product.variants.length > 1 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-[#111827] block">
                  {t('select_size')}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition ${
                        currentVariant.id === v.id
                          ? 'border-[#1B4D2B] bg-[#1B4D2B] text-white'
                          : 'border-[#ECE8DF] bg-white text-[#111827] hover:border-[#1B4D2B]/40'
                      }`}
                    >
                      {formatSize(v.size, language)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-[#111827]">{t('quantity')}:</span>
              <div className="flex items-center border border-[#ECE8DF] rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-1.5 hover:bg-[#FAF7F0] text-[#111827] disabled:opacity-30 transition"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-[#111827] select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= currentVariant.stock || isOutOfStock}
                  className="px-3 py-1.5 hover:bg-[#FAF7F0] text-[#111827] disabled:opacity-30 transition"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div ref={mainActionRef} className="space-y-2.5 pt-3">
              {/* Primary: Full Width Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full h-12 bg-[#1B4D2B] hover:bg-[#153D22] disabled:bg-gray-200 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.99] shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? t('out_of_stock') : t('add_to_cart')}</span>
              </button>

              {/* Secondary Buttons: Buy Now & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full h-11 border border-[#1B4D2B] text-[#1B4D2B] hover:bg-[#FAF7F0] font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('buy_now')}</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full h-11 border border-[#ECE8DF] bg-white text-[#111827] hover:bg-[#FAF7F0] font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('order_via_whatsapp')}</span>
                </button>
              </div>
            </div>

            {/* 3 Assurance Items in 1 Clean Line */}
            <div className="pt-4 border-t border-[#ECE8DF] flex items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1B4D2B]" />
                <span>{t('promise_100_pure')}</span>
              </div>
              <span className="text-[#ECE8DF]">•</span>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#1B4D2B]" />
                <span>{t('fast_delivery')}</span>
              </div>
              <span className="text-[#ECE8DF]">•</span>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#1B4D2B]" />
                <span>{t('easy_return')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Section: Description, Benefits, Usage */}
      <div className="bg-white rounded-2xl border border-[#ECE8DF] overflow-hidden divide-y divide-[#ECE8DF]">
        {/* 1. Description */}
        <div>
          <button
            onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
            className="w-full py-4 px-6 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-[#111827] hover:bg-[#FAF7F0]/50 transition"
          >
            <span>{t('description')}</span>
            <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${openAccordion === 'desc' ? 'rotate-180' : ''}`} />
          </button>
          {openAccordion === 'desc' && (
            <div className="px-6 pb-5 text-sm text-[#4B5563] leading-relaxed whitespace-pre-line border-t border-[#ECE8DF]/40 pt-3">
              {productDescription}
            </div>
          )}
        </div>

        {/* 2. Benefits */}
        <div>
          <button
            onClick={() => setOpenAccordion(openAccordion === 'benefits' ? null : 'benefits')}
            className="w-full py-4 px-6 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-[#111827] hover:bg-[#FAF7F0]/50 transition"
          >
            <span>{t('benefits')}</span>
            <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${openAccordion === 'benefits' ? 'rotate-180' : ''}`} />
          </button>
          {openAccordion === 'benefits' && (
            <div className="px-6 pb-5 text-sm text-[#4B5563] leading-relaxed whitespace-pre-line border-t border-[#ECE8DF]/40 pt-3">
              {productBenefits || (language === 'en' ? 'Made from 100% natural pure ingredients without any artificial color or chemical additions.' : 'খাঁটি প্রাকৃতিক উপাদানে প্রস্তুত, কোনো কৃত্রিম রং বা কেমিক্যালের মিশ্রণ নেই।')}
            </div>
          )}
        </div>

        {/* 3. Usage */}
        <div>
          <button
            onClick={() => setOpenAccordion(openAccordion === 'usage' ? null : 'usage')}
            className="w-full py-4 px-6 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-[#111827] hover:bg-[#FAF7F0]/50 transition"
          >
            <span>{t('usage_rules')}</span>
            <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${openAccordion === 'usage' ? 'rotate-180' : ''}`} />
          </button>
          {openAccordion === 'usage' && (
            <div className="px-6 pb-5 text-sm text-[#4B5563] leading-relaxed whitespace-pre-line border-t border-[#ECE8DF]/40 pt-3">
              {productUsage || (language === 'en' ? 'Use according to standard practices for cooking, dressing, or body care.' : 'রান্নায়, ভর্তায় কিংবা শারীরিক যত্নে স্বাভাবিক নিয়ম অনুযায়ী ব্যবহার করুন।')}
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECE8DF] space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-[#111827]">
          {t('customer_reviews')} ({reviews.length})
        </h3>

        {/* Write a review form */}
        <form onSubmit={handleReviewSubmit} className="space-y-3 bg-[#FAF7F0] p-4 rounded-xl border border-[#ECE8DF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#111827]">{t('your_rating')}:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setReviewRating(star);
                      setReviewRatingError('');
                    }}
                    className="p-1 cursor-pointer hover:scale-110 transition"
                    title={`${star} Star`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating ? 'fill-[#C99A2E] text-[#C99A2E]' : 'text-gray-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <span className="text-xs font-bold text-amber-700 ml-1">{reviewRating} {t('star')}</span>
              )}
            </div>
            {reviewRatingError && (
              <div className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{reviewRatingError}</span>
              </div>
            )}
          </div>

          <textarea
            rows={2}
            placeholder={t('write_experience_placeholder')}
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            required
            className="w-full bg-white border border-[#ECE8DF] rounded-lg p-2.5 text-xs sm:text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-hidden focus:border-[#1B4D2B]"
          />

          <button
            type="submit"
            className="bg-[#1B4D2B] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#153D22] transition"
          >
            {t('submit_review')}
          </button>

          {reviewSubmittedMsg && (
            <span className="text-xs text-emerald-700 font-medium ml-3">
              {reviewSubmittedMsg}
            </span>
          )}
        </form>

        {/* Reviews list */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-xs text-[#6B7280]">{t('no_reviews_yet')}</p>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="p-3.5 rounded-xl border border-[#ECE8DF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111827]">{rev.userName}</span>
                  <div className="flex items-center">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#C99A2E] text-[#C99A2E]" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-[#111827]">
            {t('related_products')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Purchase Bar */}
      {showStickyBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#ECE8DF] p-3 px-4 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-bottom duration-200">
          <div>
            <div className="text-[11px] text-[#6B7280]">{formatSize(currentVariant.size, language)}</div>
            <div className="text-lg font-bold text-[#1B4D2B] leading-none">{formatPrice(currentVariant.price, language)}</div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 max-w-[200px] h-11 bg-[#1B4D2B] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? t('out_of_stock') : t('add_to_cart')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
