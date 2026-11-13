import React, { useState } from 'react';
import {
  Image, Plus, Edit2, Trash2, Tag, FileText, Star, CheckCircle, X,
  Layers, ChevronUp, ChevronDown, Check, Sparkles, Wand2, Eye, ShieldCheck,
  TrendingUp, Copy, Percent, Truck, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  getBanners, saveBanner, deleteBanner,
  getCoupons, saveCoupon, deleteCoupon,
  getHomeSections, saveHomeSections,
  getReviews, approveReview, deleteReview,
  getPages, savePage, getCategories, getProducts
} from '../../services/storeService';
import { Banner, Coupon, CouponDiscountType, HomeSection, Review, ContentPage } from '../../types';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { formatPrice } from '../../utils/format';

export const AdminMarketing: React.FC = () => {
  const [subTab, setSubTab] = useState<'banners' | 'sections' | 'coupons' | 'reviews' | 'pages'>('banners');

  const banners = getBanners();
  const coupons = getCoupons();
  const homeSections = getHomeSections();
  const reviews = getReviews();
  const pages = getPages();
  const categories = getCategories();

  // -------------------------------------------------------------
  // Banner Modal & Live Maker State
  // -------------------------------------------------------------
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bDesktopImages, setBDesktopImages] = useState<string[]>([]);
  const [bMobileImages, setBMobileImages] = useState<string[]>([]);
  const [bLink, setBLink] = useState('');
  const [bBadge, setBBadge] = useState('');
  const [bOrder, setBOrder] = useState(1);
  const [bActive, setBActive] = useState(true);
  const [bOverlayOpacity, setBOverlayOpacity] = useState(30);
  const [bTextAlign, setBTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Preset Maker Helper
  const BANNER_PRESETS = [
    {
      name: 'সোনালি সরিষা (Golden Mustard)',
      title: 'খাঁটি কাঠের ঘানিভাঙা সরিষার তেল',
      subtitle: '১০০% দেশি মাঘী সরিষা থেকে প্রস্তুত ঝাঁজালো ও পুষ্টিকর তেল',
      badge: 'সর্বোচ্চ বিক্রিত',
      bg: 'linear-gradient(135deg, #422006 0%, #78350F 50%, #B45309 100%)',
      img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80',
      link: '/category/mustard-oil'
    },
    {
      name: 'ঐতিহ্যবাহী কাঠের ঘানি (Wooden Mill)',
      title: 'প্রাকৃতিক নিয়মে কাঠের ঘানিতে ভাঙা',
      subtitle: 'ঠান্ডা চাপে নিষ্কাশিত প্রাকৃতিক খাঁটি কোল্ড-প্রেসড তেল',
      badge: 'কোল্ড প্রেসড',
      bg: 'linear-gradient(135deg, #1C1917 0%, #44403C 50%, #78716C 100%)',
      img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      link: '/category/mustard-oil'
    },
    {
      name: 'দানাযুক্ত গাওয়া ঘি (Danadar Ghee)',
      title: 'পাবনার খাঁটি সুস্বাদু গাওয়া ঘি',
      subtitle: 'ঘাসের দুধের মাখনে ধীর আঁচে প্রস্তুত অতুলনীয় ঘ্রাণ ও স্বাদ',
      badge: 'প্রিমিয়াম কোয়ালিটি',
      bg: 'linear-gradient(135deg, #713F12 0%, #A16207 50%, #EAB308 100%)',
      img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1600&q=80',
      link: '/category/ghee'
    },
    {
      name: 'এক্সট্রা ভার্জিন নারিকেল তেল (Coconut)',
      title: 'ভেজালমুক্ত এক্সট্রা ভার্জিন নারিকেল তেল',
      subtitle: 'চুল ও ত্বকের গভীর পুষ্টি এবং রান্নায় স্বাস্থ্যকর সুরক্ষার জন্য',
      badge: '১০০% প্রাকৃতিক',
      bg: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #10B981 100%)',
      img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1600&q=80',
      link: '/category/coconut-oil'
    },
    {
      name: 'কালোজিরা ও তিসি তেল (Organic Seeds)',
      title: 'রোগ প্রতিরোধে কালোজিরা ও তিসি তেল',
      subtitle: 'প্রাকৃতিক ঔষধি গুণে ভরপুর প্রতিটি ফোঁটায় স্বাস্থ্য সুরক্ষা',
      badge: 'ঔষধি তেল',
      bg: 'linear-gradient(135deg, #18181B 0%, #27272A 50%, #3F3F46 100%)',
      img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1600&q=80',
      link: '/category/special-oils'
    }
  ];

  const applyBannerPreset = (preset: typeof BANNER_PRESETS[0]) => {
    setBTitle(preset.title);
    setBSubtitle(preset.subtitle);
    setBBadge(preset.badge);
    setBDesktopImages([preset.img]);
    setBMobileImages([preset.img]);
    setBLink(preset.link);
  };

  const handleOpenBannerModal = (ban?: Banner) => {
    if (ban) {
      setEditingBanner(ban);
      setBTitle(ban.title);
      setBSubtitle(ban.subtitle);
      setBDesktopImages(ban.imageDesktop ? [ban.imageDesktop] : []);
      setBMobileImages(ban.imageMobile ? [ban.imageMobile] : (ban.imageDesktop ? [ban.imageDesktop] : []));
      setBLink(ban.link);
      setBBadge(ban.badge || '');
      setBOrder(ban.order);
      setBActive(ban.isActive);
      setBOverlayOpacity(30);
      setBTextAlign('left');
    } else {
      setEditingBanner(null);
      setBTitle('');
      setBSubtitle('');
      setBDesktopImages(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80']);
      setBMobileImages(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80']);
      setBLink('/category/mustard-oil');
      setBBadge('সেরা অফার');
      setBOrder(banners.length + 1);
      setBActive(true);
      setBOverlayOpacity(30);
      setBTextAlign('left');
    }
    setBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim()) return;

    const desktopImg = bDesktopImages[0] || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80';
    const mobileImg = bMobileImages[0] || desktopImg;

    saveBanner({
      id: editingBanner?.id || 'ban-' + Date.now(),
      title: bTitle.trim(),
      subtitle: bSubtitle.trim(),
      imageDesktop: desktopImg,
      imageMobile: mobileImg,
      link: bLink.trim() || '/',
      badge: bBadge.trim() || undefined,
      order: bOrder,
      isActive: bActive,
      createdAt: editingBanner?.createdAt || new Date().toISOString(),
    });

    setBannerModalOpen(false);
  };

  // -------------------------------------------------------------
  // Advanced Coupon Engine State
  // -------------------------------------------------------------
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [cpnCode, setCpnCode] = useState('');
  const [cpnType, setCpnType] = useState<CouponDiscountType>('fixed');
  const [cpnVal, setCpnVal] = useState(50);
  const [cpnMin, setCpnMin] = useState(500);
  const [cpnMax, setCpnMax] = useState(200);
  const [cpnUsageLimit, setCpnUsageLimit] = useState(500);
  const [cpnPerUserLimit, setCpnPerUserLimit] = useState(1);
  const [cpnFirstOrderOnly, setCpnFirstOrderOnly] = useState(false);
  const [cpnAutoApply, setCpnAutoApply] = useState(false);
  const [cpnSelectedCategories, setCpnSelectedCategories] = useState<string[]>([]);
  const [cpnActive, setCpnActive] = useState(true);

  // Bulk Generator State
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkPrefix, setBulkPrefix] = useState('AIMAN');
  const [bulkGeneratedCodes, setBulkGeneratedCodes] = useState<string[]>([]);

  const handleOpenCouponModal = (c?: Coupon) => {
    if (c) {
      setEditingCoupon(c);
      setCpnCode(c.code);
      setCpnType(c.discountType);
      setCpnVal(c.discountValue);
      setCpnMin(c.minOrder);
      setCpnMax(c.maxDiscount || 200);
      setCpnUsageLimit(c.usageLimit || 500);
      setCpnPerUserLimit(c.perUserLimit || 1);
      setCpnFirstOrderOnly(!!c.isFirstOrderOnly);
      setCpnAutoApply(!!c.isAutoApply);
      setCpnSelectedCategories(c.applicableCategoryIds || []);
      setCpnActive(c.isActive);
    } else {
      setEditingCoupon(null);
      setCpnCode('');
      setCpnType('fixed');
      setCpnVal(50);
      setCpnMin(500);
      setCpnMax(200);
      setCpnUsageLimit(500);
      setCpnPerUserLimit(1);
      setCpnFirstOrderOnly(false);
      setCpnAutoApply(false);
      setCpnSelectedCategories([]);
      setCpnActive(true);
    }
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpnCode.trim()) return;

    saveCoupon({
      id: editingCoupon?.id || 'cpn-' + Date.now(),
      code: cpnCode.trim().toUpperCase(),
      discountType: cpnType,
      discountValue: cpnType === 'free_delivery' ? 0 : cpnVal,
      minOrder: cpnMin,
      maxDiscount: cpnType === 'percentage' || cpnType === 'delivery_discount' ? cpnMax : undefined,
      usageLimit: cpnUsageLimit,
      perUserLimit: cpnPerUserLimit,
      usedCount: editingCoupon?.usedCount || 0,
      isFirstOrderOnly: cpnFirstOrderOnly,
      isAutoApply: cpnAutoApply,
      applicableCategoryIds: cpnSelectedCategories.length > 0 ? cpnSelectedCategories : undefined,
      isActive: cpnActive,
      createdAt: editingCoupon?.createdAt || new Date().toISOString(),
    });

    setCouponModalOpen(false);
  };

  const handleGenerateBulkCoupons = () => {
    const generated: string[] = [];
    for (let i = 0; i < bulkCount; i++) {
      const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${bulkPrefix.trim().toUpperCase()}-${randStr}`;
      generated.push(code);
      saveCoupon({
        id: 'cpn-' + Date.now() + '-' + i,
        code,
        discountType: cpnType,
        discountValue: cpnVal,
        minOrder: cpnMin,
        maxDiscount: cpnMax,
        usageLimit: 1,
        perUserLimit: 1,
        usedCount: 0,
        isFirstOrderOnly: cpnFirstOrderOnly,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }
    setBulkGeneratedCodes(generated);
  };

  // -------------------------------------------------------------
  // Home Section Order & Toggles
  // -------------------------------------------------------------
  const handleMoveSection = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= homeSections.length) return;
    const updated = [...homeSections];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    updated.forEach((s, i) => (s.order = i + 1));
    saveHomeSections(updated);
  };

  const handleToggleSectionActive = (secId: string) => {
    const updated = homeSections.map(s => (s.id === secId ? { ...s, isActive: !s.isActive } : s));
    saveHomeSections(updated);
  };

  // -------------------------------------------------------------
  // Page Editor
  // -------------------------------------------------------------
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');

  const handleOpenPageEdit = (p: ContentPage) => {
    setEditingPage(p);
    setPageTitle(p.title);
    setPageContent(p.content);
    setPageModalOpen(true);
  };

  const handleSavePageContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    savePage({
      ...editingPage,
      title: pageTitle.trim(),
      content: pageContent.trim(),
    });
    setPageModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
          মার্কেটিং, ব্যানার ও কন্টেন্ট নিয়ন্ত্রণ
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          সিনেমাটিক হিরো ব্যানার মেকার, কুপন কোড ইঞ্জিন, হোম সেকশন বিল্ডার, রিভিউ ও পেজ কন্টেন্ট
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-3 text-xs font-bold pb-1">
        <button
          onClick={() => setSubTab('banners')}
          className={`pb-2.5 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            subTab === 'banners' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>হিরো ব্যানার সমূহ ({banners.length})</span>
        </button>

        <button
          onClick={() => setSubTab('coupons')}
          className={`pb-2.5 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            subTab === 'coupons' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>কুপন কোড ও অফার ইঞ্জিন ({coupons.length})</span>
        </button>

        <button
          onClick={() => setSubTab('sections')}
          className={`pb-2.5 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            subTab === 'sections' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>হোমপেজ সেকশন বিল্ডার</span>
        </button>

        <button
          onClick={() => setSubTab('reviews')}
          className={`pb-2.5 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            subTab === 'reviews' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>রিভিউ মডারেশন ({reviews.length})</span>
        </button>

        <button
          onClick={() => setSubTab('pages')}
          className={`pb-2.5 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            subTab === 'pages' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>পেজ কন্টেন্ট এডিটর</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* SUBTAB 1: Banners & Banner Maker */}
      {/* ============================================================= */}
      {subTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <div>
              <h3 className="font-bold text-sm text-[#1B5E20] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>এজ-টু-এজ সিনেমাটিক ব্যানার মেকার (YouTube Safe Area)</span>
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                ডেস্কটপ (২১:৭) ও মোবাইল (১৬:৯) আলাদা ছবি আপলোড করুন অথবা রেডিমেড খাঁটি তেলের প্রিসেট ব্যবহার করুন।
              </p>
            </div>
            <button
              onClick={() => handleOpenBannerModal()}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ব্যানার তৈরি করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map(ban => (
              <div key={ban.id} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-[21/9] sm:aspect-video w-full bg-gray-100">
                  <img src={ban.imageDesktop} alt={ban.title} className="w-full h-full object-cover" />
                  {ban.badge && (
                    <span className="absolute top-2 left-2 bg-[#F2B705] text-[#1B5E20] text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                      {ban.badge}
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                    ban.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {ban.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{ban.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{ban.subtitle}</p>
                  <div className="text-[11px] text-gray-400 font-mono truncate">লিংক: {ban.link}</div>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">ক্রম: {ban.order}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenBannerModal(ban)}
                      className="p-1.5 hover:bg-emerald-50 rounded-lg text-[#1B5E20]"
                      title="এডিট"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('ব্যানারটি ডিলিট করতে চান?')) deleteBanner(ban.id);
                      }}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                      title="ডিলিট"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 2: Advanced Coupon Engine */}
      {/* ============================================================= */}
      {subTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <div>
              <h3 className="font-black text-base text-[#1B5E20]">প্রোমো ও কুপন কোড ব্যবস্থাপনা</h3>
              <p className="text-xs text-gray-500">
                শতাংশ, নির্দিষ্ট টাকা, ফ্রি ডেলিভারি ও ডেলিভারি ডিসকাউন্ট কুপন তৈরি ও বাল্ক জেনারেট করুন।
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCouponModal()}
                className="flex items-center gap-1.5 bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন কুপন কোড</span>
              </button>
            </div>
          </div>

          {/* Active Coupons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(cpn => {
              const isFreeDel = cpn.discountType === 'free_delivery';
              const isDelDisc = cpn.discountType === 'delivery_discount';
              const isPct = cpn.discountType === 'percentage';

              return (
                <div key={cpn.id} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-[#1B5E20] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          {cpn.code}
                        </span>
                        {cpn.isAutoApply && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            অটো-অ্যাপ্লাই
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cpn.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cpn.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-gray-600 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-500">ছাড়ের ধরন:</span>
                        <span className="font-bold text-gray-900">
                          {isFreeDel ? 'ফ্রি ডেলিভারি' : isDelDisc ? `ডেলিভারিতে ৳${cpn.discountValue} ছাড়` : isPct ? `${cpn.discountValue}% ছাড়` : `৳${cpn.discountValue} ফ্ল্যাট ছাড়`}
                        </span>
                      </div>
                      <div>সর্বনিম্ন অর্ডার: <strong className="text-gray-900">{formatPrice(cpn.minOrder)}</strong></div>
                      {isPct && cpn.maxDiscount && (
                        <div>সর্বোচ্চ ছাড়ের সীমা: <strong className="text-gray-900">{formatPrice(cpn.maxDiscount)}</strong></div>
                      )}
                      {cpn.isFirstOrderOnly && (
                        <div className="text-emerald-700 font-bold text-[11px]">• প্রথম অর্ডারের জন্য প্রযোজ্য</div>
                      )}
                      <div>
                        ব্যবহৃত হয়েছে: <strong className="text-[#1B5E20]">{cpn.usedCount} বার</strong>
                        {cpn.usageLimit ? ` (সর্বোচ্চ ${cpn.usageLimit})` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenCouponModal(cpn)}
                      className="p-1.5 hover:bg-emerald-50 rounded-lg text-[#1B5E20]"
                      title="এডিট"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('কুপনটি ডিলিট করতে চান?')) deleteCoupon(cpn.id);
                      }}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                      title="ডিলিট"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bulk Coupon Generator Box */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
            <h4 className="font-bold text-sm text-[#1B5E20] flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-600" />
              <span>বাল্ক কুপন কোড জেনারেটর (Bulk Coupon Generator)</span>
            </h4>
            <p className="text-xs text-gray-500">
              কাস্টমার রিটেনশন বা স্পেশাল ক্যাম্পেইনের জন্য এক ক্লিকে একাধিক ইউনিক ওয়ান-টাইম কুপন তৈরি করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">প্রিফিক্স (Prefix)</label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={e => setBulkPrefix(e.target.value.toUpperCase())}
                  placeholder="AIMAN"
                  className="w-full border border-gray-300 rounded-xl p-2 text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">কুপন সংখ্যা (Count)</label>
                <select
                  value={bulkCount}
                  onChange={e => setBulkCount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-2 text-xs"
                >
                  <option value={5}>৫টি কুপন</option>
                  <option value={10}>১০টি কুপন</option>
                  <option value={20}>২০টি কুপন</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateBulkCoupons}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs p-2.5 rounded-xl shadow-xs transition"
                >
                  কুপন তৈরি করুন
                </button>
              </div>
            </div>

            {bulkGeneratedCodes.length > 0 && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="font-bold text-emerald-800">
                  সফলভাবে {bulkGeneratedCodes.length}টি কুপন তৈরি হয়েছে:
                </div>
                <div className="flex flex-wrap gap-2">
                  {bulkGeneratedCodes.map((c, i) => (
                    <span key={i} className="font-mono bg-white px-2.5 py-1 rounded border border-emerald-300 text-emerald-900 font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 3: Home Page Sections */}
      {/* ============================================================= */}
      {subTab === 'sections' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="font-bold text-sm text-gray-800">হোম পেজের সেকশন ও প্রদর্শনের ক্রম</h3>
            <p className="text-xs text-gray-500">
              তীরচিহ্ন দিয়ে যেকোনো সেকশন উপরে বা নিচে নামিয়ে হোম পেজের বিন্যাস পরিবর্তন করুন।
            </p>
          </div>

          <div className="space-y-2">
            {homeSections.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1B5E20] text-white flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{sec.title}</div>
                    <div className="text-[10px] text-gray-500 font-mono">টাইপ: {sec.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSectionActive(sec.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      sec.isActive ? 'bg-emerald-100 text-[#1B5E20]' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {sec.isActive ? 'অন (Active)' : 'অফ (Hidden)'}
                  </button>

                  <button
                    onClick={() => handleMoveSection(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 hover:bg-gray-200 rounded-lg disabled:opacity-30"
                    title="উপরে তুলুন"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(idx, 1)}
                    disabled={idx === homeSections.length - 1}
                    className="p-1.5 hover:bg-gray-200 rounded-lg disabled:opacity-30"
                    title="নিচে নামান"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 4: Reviews */}
      {/* ============================================================= */}
      {subTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <h3 className="font-bold text-sm text-gray-800">ক্রেতাদের রিভিউ ও অনুমোদন</h3>
          <div className="divide-y divide-gray-100">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">কোনো রিভিউ নেই।</div>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{rev.userName}</span>
                      <span className="text-amber-500 font-bold">★ {rev.rating}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rev.isApproved ? 'অনুমোদিত' : 'অপেক্ষমান'}
                      </span>
                    </div>
                    <p className="text-gray-600 max-w-xl">{rev.comment}</p>
                    <div className="text-[10px] text-gray-400">তারিখ: {new Date(rev.createdAt).toLocaleDateString('bn-BD')}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveReview(rev.id, !rev.isApproved)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs ${
                        rev.isApproved
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {rev.isApproved ? 'বাতিল' : 'অনুমোদন করুন'}
                    </button>
                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUBTAB 5: Content Pages */}
      {/* ============================================================= */}
      {subTab === 'pages' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map(page => (
            <div key={page.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-900">{page.title}</h4>
                <div className="text-xs text-gray-400 font-mono">slug: /{page.slug}</div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleOpenPageEdit(page)}
                  className="bg-[#1B5E20] text-[#F2B705] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>কন্টেন্ট এডিট করুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================= */}
      {/* Banner Creation & Live Maker Modal */}
      {/* ============================================================= */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-black text-lg text-[#1B5E20]">
                {editingBanner ? 'ব্যানার এডিট করুন' : 'নতুন সিনেমাটিক ব্যানার তৈরি'}
              </h3>
              <button onClick={() => setBannerModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-6 flex-1">
              {/* Presets Bar */}
              <div className="space-y-2 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                <div className="text-xs font-bold text-[#1B5E20] flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-amber-600" />
                  <span>রেডিমেড প্রিসেট থেকে দ্রুত ব্যানার বানান:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BANNER_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyBannerPreset(p)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-gray-800 border border-amber-300 hover:bg-[#1B5E20] hover:text-[#F2B705] transition"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">লাইভ সেফ-এরিয়া প্রিভিউ (Live Safe Area Preview)</label>
                <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] rounded-2xl overflow-hidden shadow-inner bg-slate-900 flex items-center">
                  <img
                    src={bDesktopImages[0] || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80'}
                    alt="preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: bOverlayOpacity / 100 }}
                  />
                  <div className={`relative z-10 w-full p-6 sm:p-10 text-white ${
                    bTextAlign === 'center' ? 'text-center' : bTextAlign === 'right' ? 'text-right' : 'text-left'
                  }`}>
                    {bBadge && (
                      <span className="inline-block bg-[#F2B705] text-[#1B5E20] text-[10px] font-black px-2 py-0.5 rounded shadow-xs mb-2">
                        {bBadge}
                      </span>
                    )}
                    <h2 className="text-lg sm:text-2xl font-black drop-shadow-md">{bTitle || 'ব্যানার শিরোনাম'}</h2>
                    <p className="text-xs sm:text-sm text-gray-200 mt-1 drop-shadow-xs max-w-lg">
                      {bSubtitle || 'ব্যানারের উপ-শিরোনাম বা আকর্ষক অফারের বিবরণ এখানে প্রদর্শিত হবে।'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    ব্যানার শিরোনাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bTitle}
                    onChange={e => setBTitle(e.target.value)}
                    placeholder="যেমন: খাঁটি সরিষার তেলের অবিশ্বাস্য অফার"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">উপ-শিরোনাম / বিবরণ</label>
                  <input
                    type="text"
                    value={bSubtitle}
                    onChange={e => setBSubtitle(e.target.value)}
                    placeholder="অফারের বিস্তারিত বা পণ্যের উপকারিতা..."
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Images: Desktop (21:7) & Mobile (16:9) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <ImageUploadField
                    images={bDesktopImages}
                    onChange={setBDesktopImages}
                    maxImages={1}
                    targetSizeKB={250}
                    label="ডেস্কটপ ব্যানার ছবি (২১:৭ বা ওয়াইড, <= 250KB)"
                  />
                </div>
                <div>
                  <ImageUploadField
                    images={bMobileImages}
                    onChange={setBMobileImages}
                    maxImages={1}
                    targetSizeKB={150}
                    label="মোবাইল ব্যানার ছবি (১৬:৯, <= 150KB)"
                  />
                </div>
              </div>

              {/* Links & Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ক্লিক লিংক</label>
                  <input
                    type="text"
                    value={bLink}
                    onChange={e => setBLink(e.target.value)}
                    placeholder="/category/mustard-oil"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ব্যাজ লেখা</label>
                  <input
                    type="text"
                    value={bBadge}
                    onChange={e => setBBadge(e.target.value)}
                    placeholder="যেমন: সেরা অফার"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ক্রম নম্বর (Order)</label>
                  <input
                    type="number"
                    value={bOrder}
                    onChange={e => setBOrder(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Overlay Opacity Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>ওভারলে ডার্কনেস (Overlay Opacity):</span>
                  <span>{bOverlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={bOverlayOpacity}
                  onChange={e => setBOverlayOpacity(Number(e.target.value))}
                  className="w-full accent-[#1B5E20]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-7 py-2.5 rounded-xl shadow-md transition"
                >
                  ব্যানার সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* Advanced Coupon Modal */}
      {/* ============================================================= */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-black text-lg text-[#1B5E20]">
                {editingCoupon ? 'কুপন এডিট করুন' : 'নতুন কুপন কোড তৈরি'}
              </h3>
              <button onClick={() => setCouponModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 flex-1">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  কুপন কোড (ইংরেজি) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cpnCode}
                  onChange={e => setCpnCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: AIMAN50, FREESHIP"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ছাড়ের ধরন</label>
                  <select
                    value={cpnType}
                    onChange={e => setCpnType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="fixed">নির্দিষ্ট টাকা (৳ Flat)</option>
                    <option value="percentage">শতাংশ (% Percent)</option>
                    <option value="free_delivery">ফ্রি ডেলিভারি (100% Off)</option>
                    <option value="delivery_discount">ডেলিভারি চার্জে ছাড় (৳ Off)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    ছাড়ের পরিমাণ {cpnType === 'percentage' ? '(%)' : '(৳)'}
                  </label>
                  <input
                    type="number"
                    disabled={cpnType === 'free_delivery'}
                    value={cpnType === 'free_delivery' ? 0 : cpnVal}
                    onChange={e => setCpnVal(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">সর্বনিম্ন অর্ডার (৳)</label>
                  <input
                    type="number"
                    value={cpnMin}
                    onChange={e => setCpnMin(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">সর্বোচ্চ ছাড়ের সীমা (৳)</label>
                  <input
                    type="number"
                    value={cpnMax}
                    onChange={e => setCpnMax(Number(e.target.value))}
                    placeholder="ঐচ্ছিক"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">মোট ব্যবহারের সীমা</label>
                  <input
                    type="number"
                    value={cpnUsageLimit}
                    onChange={e => setCpnUsageLimit(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">প্রতি গ্রাহকের সীমা</label>
                  <input
                    type="number"
                    value={cpnPerUserLimit}
                    onChange={e => setCpnPerUserLimit(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cpnFirstOrderOnly}
                    onChange={e => setCpnFirstOrderOnly(e.target.checked)}
                    className="accent-[#1B5E20] rounded"
                  />
                  <span>শুধুমাত্র প্রথম অর্ডারের জন্য প্রযোজ্য (First Order Only)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cpnAutoApply}
                    onChange={e => setCpnAutoApply(e.target.checked)}
                    className="accent-[#1B5E20] rounded"
                  />
                  <span>শর্ত পূরণ হলে স্বয়ংক্রিয়ভাবে কার্টে যুক্ত হবে (Auto-apply)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cpnActive}
                    onChange={e => setCpnActive(e.target.checked)}
                    className="accent-[#1B5E20] rounded"
                  />
                  <span>কুপনটি সক্রিয় রাখুন</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-7 py-2.5 rounded-xl shadow-md transition"
                >
                  কুপন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Modal */}
      {pageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#1B5E20]">পেজ কন্টেন্ট এডিটর ({editingPage?.title})</h3>
            <form onSubmit={handleSavePageContent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">পেজের শিরোনাম</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={e => setPageTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">বিস্তারিত কন্টেন্ট (HTML সমর্থিত)</label>
                <textarea
                  rows={10}
                  value={pageContent}
                  onChange={e => setPageContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPageModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#1B5E20] text-white px-5 py-2 text-xs font-bold rounded-xl"
                >
                  কন্টেন্ট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
