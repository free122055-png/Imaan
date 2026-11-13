import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Award, Image, X, Sparkles } from 'lucide-react';
import {
  getCategories, saveCategory, deleteCategory, getBrands, saveBrand, deleteBrand
} from '../../services/storeService';
import { Category, Brand } from '../../types';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { generateSlug } from '../../utils/slugify';

export const AdminCategoriesBrands: React.FC = () => {
  const categories = getCategories();
  const brands = getBrands();

  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catNameBn, setCatNameBn] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catImages, setCatImages] = useState<string[]>([]);
  const [catOrder, setCatOrder] = useState(1);
  const [catFeatured, setCatFeatured] = useState(true);
  const [catActive, setCatActive] = useState(true);

  // Brand Modal State
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandNameBn, setBrandNameBn] = useState('');
  const [brandNameEn, setBrandNameEn] = useState('');
  const [brandLogos, setBrandLogos] = useState<string[]>([]);
  const [brandOrder, setBrandOrder] = useState(1);

  // Open Category Modal
  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatNameBn(cat.nameBn);
      setCatNameEn(cat.nameEn);
      setCatSlug(cat.slug);
      setCatImages(cat.image ? [cat.image] : []);
      setCatOrder(cat.order);
      setCatFeatured(cat.isFeaturedHome);
      setCatActive(cat.isActive);
    } else {
      setEditingCat(null);
      setCatNameBn('');
      setCatNameEn('');
      setCatSlug('');
      setCatImages(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80']);
      setCatOrder(categories.length + 1);
      setCatFeatured(true);
      setCatActive(true);
    }
    setCatModalOpen(true);
  };

  const handleCatNameChange = (val: string) => {
    setCatNameBn(val);
    if (!editingCat) {
      const existing = categories.map(c => c.slug);
      setCatSlug(generateSlug(val, existing));
    }
  };

  const handleRegenerateCatSlug = () => {
    const existing = categories.filter(c => c.id !== editingCat?.id).map(c => c.slug);
    setCatSlug(generateSlug(catNameEn || catNameBn, existing));
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameBn.trim()) return;

    saveCategory({
      id: editingCat?.id || 'cat-' + Date.now(),
      nameBn: catNameBn.trim(),
      nameEn: catNameEn.trim() || catNameBn.trim(),
      slug: catSlug.trim() || 'category-' + Date.now(),
      image: catImages[0] || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
      order: catOrder,
      isFeaturedHome: catFeatured,
      isActive: catActive,
      subCategories: editingCat?.subCategories || [],
      createdAt: editingCat?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setCatModalOpen(false);
  };

  const handleDeleteCat = (id: string, name: string) => {
    if (window.confirm(`আপনি কি "${name}" ক্যাটাগরি ডিলিট করতে চান?`)) {
      deleteCategory(id);
    }
  };

  // Open Brand Modal
  const handleOpenBrandModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandNameBn(brand.nameBn);
      setBrandNameEn(brand.nameEn);
      setBrandLogos(brand.logo ? [brand.logo] : []);
      setBrandOrder(brand.order);
    } else {
      setEditingBrand(null);
      setBrandNameBn('');
      setBrandNameEn('');
      setBrandLogos(['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80']);
      setBrandOrder(brands.length + 1);
    }
    setBrandModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNameBn.trim()) return;

    saveBrand({
      id: editingBrand?.id || 'brand-' + Date.now(),
      nameBn: brandNameBn.trim(),
      nameEn: brandNameEn.trim() || brandNameBn.trim(),
      logo: brandLogos[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
      order: brandOrder,
      isFeatured: true,
      isActive: true,
      createdAt: editingBrand?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setBrandModalOpen(false);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (window.confirm(`আপনি কি "${name}" ব্র্যান্ড ডিলিট করতে চান?`)) {
      deleteBrand(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
            ক্যাটাগরি ও ব্র্যান্ড ব্যবস্থাপনা
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            ই-কমার্সের ক্যাটাগরি, সাব-ক্যাটাগরি ও নিজস্ব ব্র্যান্ড লোগো নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'categories' ? (
            <button
              onClick={() => handleOpenCatModal()}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] px-4 py-2 rounded-xl text-xs font-black shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ক্যাটাগরি</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenBrandModal()}
              className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] px-4 py-2 rounded-xl text-xs font-black shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ব্র্যান্ড</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-bold pb-1">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'categories' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>ক্যাটাগরি সমূহ ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'brands' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ব্র্যান্ড সমূহ ({brands.length})</span>
        </button>
      </div>

      {/* Categories Grid */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <img src={cat.image} alt={cat.nameBn} className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{cat.nameBn}</h3>
                  <div className="text-[11px] text-gray-400 font-mono">/{cat.slug}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ক্রম: {cat.order} • {cat.isFeaturedHome ? 'হোমে ফিচার্ড' : 'সাধারণ'}
                  </div>
                </div>
              </div>

              {cat.subCategories && cat.subCategories.length > 0 && (
                <div className="bg-gray-50 p-2 rounded-xl text-[11px] text-gray-600 space-y-1">
                  <span className="font-bold text-[10px] text-gray-400 uppercase">সাব-ক্যাটাগরি:</span>
                  <div className="flex flex-wrap gap-1">
                    {cat.subCategories.map(s => (
                      <span key={s.id} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                        {s.nameBn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleOpenCatModal(cat)}
                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-[#1B5E20]"
                  title="এডিট"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCat(cat.id, cat.nameBn)}
                  className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                  title="ডিলিট"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brands Grid */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <img src={brand.logo} alt={brand.nameBn} className="w-14 h-14 object-cover rounded-full border border-gray-200" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{brand.nameBn}</h3>
                  <div className="text-[11px] text-gray-400">{brand.nameEn}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleOpenBrandModal(brand)}
                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-[#1B5E20]"
                  title="এডিট"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand.id, brand.nameBn)}
                  className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                  title="ডিলিট"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-base text-[#1B5E20]">
                {editingCat ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি তৈরি'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ক্যাটাগরি নাম (বাংলা) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={catNameBn}
                  onChange={e => handleCatNameChange(e.target.value)}
                  required
                  placeholder="যেমন: সরিষার তেল"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-[#1B5E20]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">নাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={catNameEn}
                  onChange={e => setCatNameEn(e.target.value)}
                  placeholder="e.g. Mustard Oil"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">URL Slug</label>
                  <button
                    type="button"
                    onClick={handleRegenerateCatSlug}
                    className="text-[10px] text-[#1B5E20] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>অটো-স্লাগ</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={catSlug}
                  onChange={e => setCatSlug(e.target.value)}
                  required
                  placeholder="mustard-oil"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              {/* Image Upload with WebP Compression */}
              <div className="space-y-1">
                <ImageUploadField
                  images={catImages}
                  onChange={setCatImages}
                  maxImages={1}
                  targetSizeKB={100}
                  label="ক্যাটাগরি ছবি (১:১ স্কয়ার, ড্র্যাগ-ড্রপ বা আপলোড)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ক্রম নম্বর (Order)</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={e => setCatOrder(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catFeatured}
                      onChange={e => setCatFeatured(e.target.checked)}
                      className="accent-[#1B5E20] rounded"
                    />
                    <span>হোমে দেখান</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#1B5E20] text-[#F2B705] font-black px-6 py-2 text-xs rounded-xl shadow-xs"
                >
                  ক্যাটাগরি সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {brandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-base text-[#1B5E20]">
                {editingBrand ? 'ব্র্যান্ড এডিট করুন' : 'নতুন ব্র্যান্ড যোগ'}
              </h3>
              <button onClick={() => setBrandModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ব্র্যান্ড নাম (বাংলা) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandNameBn}
                  onChange={e => setBrandNameBn(e.target.value)}
                  required
                  placeholder="যেমন: আইমান পিউর"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">ব্র্যান্ড নাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={brandNameEn}
                  onChange={e => setBrandNameEn(e.target.value)}
                  placeholder="e.g. Aiman Pure"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                />
              </div>

              {/* Brand Logo Upload with WebP */}
              <div className="space-y-1">
                <ImageUploadField
                  images={brandLogos}
                  onChange={setBrandLogos}
                  maxImages={1}
                  targetSizeKB={80}
                  label="ব্র্যান্ড লোগো (ড্র্যাগ-ড্রপ বা আপলোড)"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#1B5E20] text-[#F2B705] font-black px-6 py-2 text-xs rounded-xl shadow-xs"
                >
                  ব্র্যান্ড সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
