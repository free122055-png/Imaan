import React from 'react';
import { CategoryCircleScroller } from '../components/home/CategoryCircleScroller';
import { ProductCard } from '../components/product/ProductCard';
import { getCategories, getProducts } from '../services/storeService';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const categories = getCategories();
  const products = getProducts().filter(p => p.isActive);

  // 1. Top Selling (4 products: 2 cols on mobile, 4 cols on desktop)
  const topSelling = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 4);

  // 2. Mustard Oils (4 products)
  const mustardProducts = products
    .filter(p => p.categoryId === 'cat-mustard')
    .slice(0, 4);

  return (
    <div className="w-full">
      {/* 1. Top Banner Photo */}
      <div className="w-full">
        <img
          src="/assets/aistudio/file_000000008a808208ab5f0979c517116b_cdddb25e.png"
          alt="জাহানান ব্র্যান্ড সরিষার তেল"
          className="w-full h-auto block"
        />
      </div>

      {/* Main Page Centered Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-10 pt-4 sm:pt-6 pb-12">
        {/* 2. Category Circles (Borderless, calm) */}
        <section>
          <CategoryCircleScroller categories={categories} onNavigate={onNavigate} />
        </section>

      {/* 3. Top Selling Section */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#ECE8DF]">
          <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight">
            {t('top_selling')}
          </h2>
          <button
            onClick={() => onNavigate('/category/all?sort=top_selling')}
            className="text-xs sm:text-sm font-semibold text-[#1B4D2B] hover:underline flex items-center gap-1 transition"
          >
            <span>{t('view_all')}</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {topSelling.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 4. Brand Promise Strip (1 clean line, tranquil) */}
      <section className="bg-[#FAF7F0] border border-[#ECE8DF] rounded-xl py-3 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#111827] font-medium text-center">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D2B]" />
            <span>{t('promise_100_pure')}</span>
          </div>
          <span className="text-[#ECE8DF] hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D2B]" />
            <span>{t('promise_lab_tested')}</span>
          </div>
          <span className="text-[#ECE8DF] hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D2B]" />
            <span>{t('promise_cod')}</span>
          </div>
        </div>
      </section>

      {/* 5. Mustard Oil Section */}
      {mustardProducts.length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8DF]">
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight">
              {t('mustard_oils')}
            </h2>
            <button
              onClick={() => onNavigate('/category/mustard-oil')}
              className="text-xs sm:text-sm font-semibold text-[#1B4D2B] hover:underline flex items-center gap-1 transition"
            >
              <span>{t('view_all')}</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {mustardProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
};
