import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { getProducts, getCategories, getBrands } from '../services/storeService';
import { ProductCard } from '../components/product/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../utils/format';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (route: string) => void;
  subCategorySlug?: string;
  sortByDefault?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  onNavigate,
  subCategorySlug,
  sortByDefault = 'newest',
}) => {
  const { t, getL, language } = useLanguage();
  const allCategories = getCategories();
  const allBrands = getBrands();
  const allProducts = getProducts().filter(p => p.isActive);

  // Active Category
  const isAll = categorySlug === 'all';
  const category = allCategories.find(c => c.slug === categorySlug);

  // Filters state
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSubCat, setSelectedSubCat] = useState<string>(subCategorySlug || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [sortBy, setSortBy] = useState<string>(sortByDefault);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(p => {
        // Category check
        if (!isAll && category && p.categoryId !== category.id) return false;
        // Subcategory check
        if (selectedSubCat !== 'all' && p.subCategoryId !== selectedSubCat) return false;
        // Brand check
        if (selectedBrand !== 'all' && p.brandId !== selectedBrand) return false;
        // Price check
        const minProdPrice = Math.min(...p.variants.map(v => v.price));
        if (minProdPrice > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.variants[0]?.price || 0;
        const priceB = b.variants[0]?.price || 0;

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'top_selling') return (b.salesCount || 0) - (a.salesCount || 0);
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allProducts, isAll, category, selectedSubCat, selectedBrand, maxPrice, sortBy]);

  const pageTitle = isAll
    ? t('shop_all_products')
    : category
    ? getL(category, 'name')
    : t('product_list');

  return (
    <div className="space-y-[#1B4D2B] space-y-6 pb-20 md:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto py-1">
        <button onClick={() => onNavigate('/')} className="hover:text-[#1B4D2B] shrink-0 font-medium">
          {t('home')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
        <span className="text-gray-800 font-bold truncate">{pageTitle}</span>
      </nav>

      {/* Top Header */}
      <div className="bg-[#FAF7F0] border border-[#ECE8DF] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">{pageTitle}</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            {t('showing_products_count', { count: filteredProducts.length })}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilterDrawer(true)}
          className="md:hidden flex items-center gap-2 border border-[#ECE8DF] bg-white text-[#111827] px-3.5 py-1.5 rounded-lg text-xs font-semibold"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t('filter_sort')}</span>
        </button>
      </div>

      {/* Main Layout: Filters Sidebar (desktop) + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Left Filter Sidebar (3 cols) */}
        <aside className="hidden md:block md:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-[#ECE8DF]">
          <div className="flex items-center justify-between border-b border-[#ECE8DF] pb-3">
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1B4D2B]" />
              <span>{t('filters')}</span>
            </h3>
            <button
              onClick={() => {
                setSelectedBrand('all');
                setSelectedSubCat('all');
                setMaxPrice(2500);
                setSortBy('newest');
              }}
              className="text-xs text-rose-600 hover:underline font-medium"
            >
              {t('reset')}
            </button>
          </div>

          {/* Subcategories if category selected */}
          {category && category.subCategories && category.subCategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block uppercase">{t('subcategories')}:</label>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedSubCat('all')}
                  className={`w-full text-left p-2 rounded-lg transition ${
                    selectedSubCat === 'all' ? 'bg-[#FAF7F0] text-[#1B4D2B] font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('all_types')}
                </button>
                {category.subCategories.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCat(sub.id)}
                    className={`w-full text-left p-2 rounded-lg transition ${
                      selectedSubCat === sub.id ? 'bg-[#FAF7F0] text-[#1B4D2B] font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {getL(sub, 'name')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block uppercase">{t('brand')}:</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full bg-white border border-[#ECE8DF] rounded-xl p-2 text-xs focus:outline-hidden focus:border-[#1B4D2B]"
            >
              <option value="all">{t('all_brands')}</option>
              {allBrands.map(b => (
                <option key={b.id} value={b.id}>{getL(b, 'name')}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-700 uppercase">
              <span>{t('max_price')}:</span>
              <span className="text-[#1B4D2B]">{formatPrice(maxPrice, language)}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1B4D2B]"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{formatPrice(100, language)}</span>
              <span>{formatPrice(2500, language)}</span>
            </div>
          </div>
        </aside>

        {/* Right Products Container (9 cols) */}
        <main className="md:col-span-9 space-y-4">
          {/* Sorting Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#ECE8DF] flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs text-gray-600 font-medium">
              {t('showing_products_count', { count: filteredProducts.length })}
            </span>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-semibold hidden sm:inline">{t('sort_by')}:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-[#FAF7F0] border border-[#ECE8DF] rounded-lg py-1.5 px-3 text-xs font-semibold text-[#111827] focus:outline-hidden"
              >
                <option value="newest">{t('sort_newest')}</option>
                <option value="top_selling">{t('sort_top_selling')}</option>
                <option value="price_asc">{t('sort_price_low_high')}</option>
                <option value="price_desc">{t('sort_price_high_low')}</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-[#ECE8DF]">
              <h3 className="font-bold text-base text-gray-700">{t('no_products_found')}</h3>
              <p className="text-xs text-gray-500">
                {t('no_products_matching_filter')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-[#ECE8DF] pb-3">
              <h3 className="font-bold text-base text-[#111827]">{t('filter_sort')}</h3>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                {t('cancel')}
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">{t('sort_by')}:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full border border-[#ECE8DF] rounded-xl p-2.5 text-xs"
              >
                <option value="newest">{t('sort_newest')}</option>
                <option value="top_selling">{t('sort_top_selling')}</option>
                <option value="price_asc">{t('sort_price_low_high')}</option>
                <option value="price_desc">{t('sort_price_high_low')}</option>
              </select>
            </div>

            {/* Brands */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">{t('brand')}:</label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full border border-[#ECE8DF] rounded-xl p-2.5 text-xs"
              >
                <option value="all">{t('all_brands')}</option>
                {allBrands.map(b => (
                  <option key={b.id} value={b.id}>{getL(b, 'name')}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>{t('max_price')}:</span>
                <span className="text-[#1B4D2B]">{formatPrice(maxPrice, language)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1B4D2B]"
              />
            </div>

            <button
              onClick={() => setShowFilterDrawer(false)}
              className="w-full bg-[#1B4D2B] text-white font-bold text-sm py-3 rounded-xl shadow-md"
            >
              {t('apply')} ({filteredProducts.length} {t('items')})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
