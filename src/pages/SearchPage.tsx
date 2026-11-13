import React, { useState, useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { getProducts, getCategories } from '../services/storeService';
import { ProductCard } from '../components/product/ProductCard';

interface SearchPageProps {
  initialQuery?: string;
  onNavigate: (route: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const allProducts = getProducts().filter(p => p.isActive);
  const categories = getCategories();

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter(p => {
      // Category filter
      if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;

      if (!q) return true;
      return (
        p.nameBn.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0);
      if (sortBy === 'price_desc') return (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0);
      return (b.salesCount || 0) - (a.salesCount || 0);
    });
  }, [allProducts, query, selectedCat, sortBy]);

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Search Header Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
          পণ্য সার্চ করুন (Search Products)
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="খাঁটি সরিষার তেল, ঘি, নারকেল তেল..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#FFFBF0]/60 border border-amber-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-hidden focus:border-[#1B5E20]"
            />
          </div>

          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="bg-white border border-amber-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nameBn}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-amber-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700"
          >
            <option value="relevance">জনপ্রিয়তা</option>
            <option value="price_asc">দাম: কম থেকে বেশি</option>
            <option value="price_desc">দাম: বেশি থেকে কম</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-500 font-semibold px-1">
        মোট <strong>{searchResults.length}</strong> টি পণ্য পাওয়া গেছে
      </div>

      {/* Grid */}
      {searchResults.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-amber-200/60">
          <h3 className="font-bold text-base text-gray-700">কোনো ফলাফল পাওয়া যায়নি!</h3>
          <p className="text-xs text-gray-500">
            অনুগ্রহ করে বানান ঠিক রেখে আবার সার্চ করুন অথবা ক্যাটাগরি পরিবর্তন করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {searchResults.map(p => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
