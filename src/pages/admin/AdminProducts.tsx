import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, Copy, Download, Upload, Eye, Check,
  AlertCircle, Image, Star, ChevronDown, ChevronUp, X, Sparkles
} from 'lucide-react';
import {
  getProducts, saveProduct, deleteProduct, duplicateProduct, getCategories, getBrands
} from '../../services/storeService';
import { Product, ProductVariant } from '../../types';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { generateSlug } from '../../utils/slugify';
import { formatPrice, formatNumber } from '../../utils/format';

export const AdminProducts: React.FC = () => {
  const categories = getCategories();
  const brands = getBrands();
  const products = getProducts();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [translationFilter, setTranslationFilter] = useState('all'); // 'all' | 'missing_en'
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modal State: null = closed, 'new' = new product, Product = edit product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLang, setFormLang] = useState<'bn' | 'en'>('bn');

  // Form Fields
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [sku, setSku] = useState('');
  const [shortDescBn, setShortDescBn] = useState('');
  const [shortDescEn, setShortDescEn] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [benefitsBn, setBenefitsBn] = useState('');
  const [benefitsEn, setBenefitsEn] = useState('');
  const [usageBn, setUsageBn] = useState('');
  const [usageEn, setUsageEn] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [badge, setBadge] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnHome, setShowOnHome] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: 'v1', size: '১ লিটার', price: 390, oldPrice: 440, stock: 50, sku: '' }
  ]);

  // Open modal for new product
  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormLang('bn');
    setNameBn('');
    setNameEn('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setSubCategoryId('');
    setBrandId(brands[0]?.id || '');
    setSku('AB-' + Math.floor(1000 + Math.random() * 9000));
    setShortDescBn('');
    setShortDescEn('');
    setDescriptionBn('');
    setDescriptionEn('');
    setBenefitsBn('');
    setBenefitsEn('');
    setUsageBn('');
    setUsageEn('');
    setImages(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80']);
    setBadge('নতুন');
    setIsFeatured(true);
    setShowOnHome(true);
    setIsActive(true);
    setVariants([
      { id: 'v-1', size: '১ লিটার', price: 390, oldPrice: 440, stock: 50, sku: '' }
    ]);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormLang('bn');
    setNameBn(p.nameBn || '');
    setNameEn(p.nameEn || '');
    setSlug(p.slug);
    setCategoryId(p.categoryId);
    setSubCategoryId(p.subCategoryId || '');
    setBrandId(p.brandId || '');
    setSku(p.sku);
    setShortDescBn(p.shortDescBn || p.shortDesc || '');
    setShortDescEn(p.shortDescEn || '');
    setDescriptionBn(p.descriptionBn || p.description || '');
    setDescriptionEn(p.descriptionEn || '');
    setBenefitsBn(p.benefitsBn || p.benefits || '');
    setBenefitsEn(p.benefitsEn || '');
    setUsageBn(p.usageBn || p.usage || '');
    setUsageEn(p.usageEn || '');
    setImages(p.images && p.images.length > 0 ? p.images : []);
    setBadge(p.badge || '');
    setIsFeatured(!!p.isFeatured);
    setShowOnHome(!!p.showOnHome);
    setIsActive(p.isActive);
    setVariants(p.variants);
    setIsModalOpen(true);
  };

  // Auto-slug generator from Bengali/English name
  const handleNameChange = (val: string) => {
    setNameBn(val);
    if (!editingProduct) {
      const existingSlugs = products.map(p => p.slug);
      setSlug(generateSlug(val, existingSlugs));
    }
  };

  const handleRegenerateSlug = () => {
    const existingSlugs = products.filter(p => p.id !== editingProduct?.id).map(p => p.slug);
    setSlug(generateSlug(nameEn || nameBn, existingSlugs));
  };

  // Add / Remove Variant
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: 'v-' + Date.now(), size: '৫০০ মিলি', price: 200, stock: 20, sku: '' }
    ]);
  };

  const handleRemoveVariant = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: val };
    setVariants(updated);
  };

  // Save product submit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) return;

    const prodData: Product = {
      id: editingProduct?.id || 'prod-' + Date.now(),
      nameBn: nameBn.trim(),
      nameEn: nameEn.trim() || nameBn.trim(),
      slug: slug.trim() || 'product-' + Date.now(),
      categoryId,
      subCategoryId: subCategoryId || undefined,
      brandId: brandId || undefined,
      sku: sku.trim() || 'SKU-' + Date.now(),
      shortDesc: shortDescBn.trim() || shortDescEn.trim(),
      shortDescBn: shortDescBn.trim(),
      shortDescEn: shortDescEn.trim(),
      description: descriptionBn.trim() || descriptionEn.trim(),
      descriptionBn: descriptionBn.trim(),
      descriptionEn: descriptionEn.trim(),
      benefits: benefitsBn.trim() || benefitsEn.trim(),
      benefitsBn: benefitsBn.trim(),
      benefitsEn: benefitsEn.trim(),
      usage: usageBn.trim() || usageEn.trim(),
      usageBn: usageBn.trim(),
      usageEn: usageEn.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
      variants,
      badge: badge || undefined,
      isFeatured,
      showOnHome,
      isActive,
      rating: editingProduct?.rating || 5.0,
      reviewsCount: editingProduct?.reviewsCount || 0,
      salesCount: editingProduct?.salesCount || 0,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProduct(prodData);
    setIsModalOpen(false);
  };

  // Toggle active/inactive quick switch
  const handleToggleActive = (p: Product) => {
    saveProduct({ ...p, isActive: !p.isActive });
  };

  // Duplicate
  const handleDuplicate = (id: string) => {
    duplicateProduct(id);
  };

  // Delete single
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${name}" ডিলিট করতে চান?`)) {
      deleteProduct(id);
    }
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (window.confirm(`নির্বাচিত ${selectedProductIds.length}টি পণ্য মুছে ফেলতে চান?`)) {
      selectedProductIds.forEach(id => deleteProduct(id));
      setSelectedProductIds([]);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,NameBn,NameEn,SKU,Category,Price,Stock,Active\n';
    const rows = products.map(p =>
      `"${p.id}","${p.nameBn}","${p.nameEn || ''}","${p.sku}","${p.categoryId}","${p.variants[0]?.price || 0}","${p.variants[0]?.stock || 0}","${p.isActive}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aiman-products-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = p.nameBn.toLowerCase().includes(q) || (p.nameEn && p.nameEn.toLowerCase().includes(q)) || p.sku.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
    if (stockFilter === 'low' && !p.variants.some(v => v.stock < 10)) return false;
    if (stockFilter === 'out' && !p.variants.some(v => v.stock <= 0)) return false;
    if (translationFilter === 'missing_en' && p.nameEn && p.nameEn.trim() !== '' && p.nameEn !== p.nameBn) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
            পণ্য ব্যবস্থাপনা (Product Management)
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            মোট {products.length}টি পণ্য রয়েছে • নতুন পণ্য যোগ ও ভ্যারিয়েন্ট নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition"
            title="CSV এক্সপোর্ট"
          >
            <Download className="w-4 h-4" />
            <span>CSV এক্সপোর্ট</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] px-4 py-2 rounded-xl text-xs font-black shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="পণ্যের নাম অথবা SKU দিয়ে সার্চ করুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-[#1B5E20]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nameBn}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
          >
            <option value="all">সব স্টক অবস্থা</option>
            <option value="low">কম স্টক (&lt; 10)</option>
            <option value="out">স্টক আউট (০)</option>
          </select>

          <select
            value={translationFilter}
            onChange={e => setTranslationFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
          >
            <option value="all">সকল ভাষা স্ট্যাটাস</option>
            <option value="missing_en">অনুবাদ বাকি (Missing EN)</option>
          </select>
        </div>

        {/* Bulk delete bar if items selected */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
            <span className="font-bold text-rose-800">
              {selectedProductIds.length}টি পণ্য নির্বাচিত হয়েছে
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-rose-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-rose-700"
            >
              বাল্ক ডিলিট করুন
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedProductIds(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProductIds([]);
                      }
                    }}
                    className="rounded accent-[#1B5E20]"
                  />
                </th>
                <th className="py-3 px-3">পণ্য</th>
                <th className="py-3 px-3">ক্যাটাগরি</th>
                <th className="py-3 px-3">মূল্য (৳)</th>
                <th className="py-3 px-3">স্টক</th>
                <th className="py-3 px-3">অ্যাক্টিভ</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => {
                const cat = categories.find(c => c.id === p.categoryId);
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                const isMissingEn = !p.nameEn || p.nameEn.trim() === '' || p.nameEn === p.nameBn;

                return (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded accent-[#1B5E20]"
                      />
                    </td>
                    <td className="py-3 px-3 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.nameBn}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate max-w-xs flex items-center gap-1.5">
                          <span>{p.nameBn}</span>
                          {isMissingEn && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0">
                              অনুবাদ বাকি
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {p.nameEn && p.nameEn !== p.nameBn ? p.nameEn : 'SKU: ' + p.sku}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-medium">
                      {cat?.nameBn || 'অন্যান্য'}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#1B5E20]">
                      ৳{p.variants[0]?.price}
                      {p.variants.length > 1 && <span className="text-[10px] text-gray-400 font-normal"> (+{p.variants.length - 1} সাইজ)</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        totalStock <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : totalStock < 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {totalStock} টি
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          p.isActive ? 'bg-[#1B5E20]' : 'bg-gray-300'
                        }`}
                        title={p.isActive ? 'সক্রিয় (ক্লিক করে নিষ্ক্রিয় করুন)' : 'নিষ্ক্রিয়'}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            p.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-[#1B5E20]"
                          title="এডিট করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-700"
                          title="ডুপ্লিকেট করুন"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nameBn)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header with Language Tabs */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <h2 className="font-black text-lg text-[#1B5E20]">
                  {editingProduct ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যোগ করুন'}
                </h2>

                {/* Form Language Switcher Tabs */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormLang('bn')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      formLang === 'bn' ? 'bg-[#1B5E20] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    বাংলা (Bengali)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormLang('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      formLang === 'en' ? 'bg-[#1B5E20] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>English</span>
                    {(!nameEn || !descriptionEn) && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="অনুবাদ বাকি" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6 flex-1">
              {formLang === 'en' && (!nameEn || !descriptionEn) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>ইংরেজি টেক্সট খালি থাকলে ওয়েবসাইটে স্বয়ংক্রিয়ভাবে বাংলা অনুবাদ দেখাবে। (Missing English fields fall back to Bengali)</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
                  ১. সাধারণ তথ্য ({formLang === 'bn' ? 'বাংলা' : 'English'})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formLang === 'bn' ? (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        পণ্যের নাম (বাংলা) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: খাঁটি কাঠের ঘানিভাঙা সরিষার তেল"
                        value={nameBn}
                        onChange={e => handleNameChange(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-[#1B5E20]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Product Name (English)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pure Wood Pressed Mustard Oil"
                        value={nameEn}
                        onChange={e => setNameEn(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-[#1B5E20]"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">URL Slug</label>
                      <button
                        type="button"
                        onClick={handleRegenerateSlug}
                        className="text-[10px] text-[#1B5E20] font-bold flex items-center gap-1 hover:underline"
                        title="নাম থেকে নতুন করে স্লাগ তৈরি করুন"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>অটো-স্লাগ</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      required
                      placeholder="pure-mustard-oil"
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">ক্যাটাগরি</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nameBn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">ব্র্যান্ড</label>
                    <select
                      value={brandId}
                      onChange={e => setBrandId(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.nameBn}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                    ২. সাইজ ও ভ্যারিয়েন্ট (Variants & Pricing)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs font-bold text-[#1B5E20] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন সাইজ যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div key={v.id || idx} className="grid grid-cols-2 sm:grid-cols-7 gap-3 p-3 bg-gray-50 rounded-2xl items-center border border-gray-200">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-0.5">সাইজ</label>
                        <input
                          type="text"
                          value={v.size}
                          onChange={e => handleUpdateVariant(idx, 'size', e.target.value)}
                          placeholder="যেমন: ১ কেজি, ৫০০ গ্রাম, ২৫০ মিলি"
                          className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-0.5">বিক্রয়মূল্য (৳)</label>
                        <input
                          type="number"
                          value={v.price}
                          onChange={e => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-xs font-bold text-[#1B5E20]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-0.5">কাটা দাম/পুরনো (৳)</label>
                        <input
                          type="number"
                          value={v.oldPrice || ''}
                          onChange={e => handleUpdateVariant(idx, 'oldPrice', Number(e.target.value))}
                          placeholder="ঐচ্ছিক"
                          className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-0.5">স্টক সংখ্যা</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={e => handleUpdateVariant(idx, 'stock', Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-xs font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-end col-span-2 sm:col-span-1 pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          disabled={variants.length <= 1}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5"
                          title="সাইজ মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-2">
                <ImageUploadField
                  images={images}
                  onChange={setImages}
                  multiple={true}
                  maxImages={6}
                  targetSizeKB={120}
                  label="৩. পণ্যের ছবি আপলোড (Product Images - একাধিক ছবি সম্ভব)"
                />
              </div>

              {/* Descriptions & Benefits (Language Aware Inputs) */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
                  ৪. বিবরণ ও উপকারিতা ({formLang === 'bn' ? 'বাংলা' : 'English'})
                </h3>

                {formLang === 'bn' ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">সংক্ষিপ্ত বিবরণ (Short Description - বাংলা)</label>
                      <input
                        type="text"
                        value={shortDescBn}
                        onChange={e => setShortDescBn(e.target.value)}
                        placeholder="পণ্য সম্পর্কে ১-২ লাইনের হাইলাইট..."
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">বিস্তারিত বিবরণ (Full Description - বাংলা)</label>
                      <textarea
                        rows={4}
                        value={descriptionBn}
                        onChange={e => setDescriptionBn(e.target.value)}
                        placeholder="পণ্যটি কীভাবে প্রস্তুত করা হয়, কাঁচামাল ও গুণাগুণ..."
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">উপকারিতা (Benefits - বাংলা)</label>
                        <textarea
                          rows={3}
                          value={benefitsBn}
                          onChange={e => setBenefitsBn(e.target.value)}
                          placeholder="• কোলেস্টেরল কমায়\n• ত্বক ও চুলের যত্ন..."
                          className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">ব্যবহারবিধি (Usage - বাংলা)</label>
                        <textarea
                          rows={3}
                          value={usageBn}
                          onChange={e => setUsageBn(e.target.value)}
                          placeholder="রান্নায় কিংবা শরীরে মালিশের নিয়ম..."
                          className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Short Description (English)</label>
                      <input
                        type="text"
                        value={shortDescEn}
                        onChange={e => setShortDescEn(e.target.value)}
                        placeholder="1-2 line product highlight in English..."
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Full Description (English)</label>
                      <textarea
                        rows={4}
                        value={descriptionEn}
                        onChange={e => setDescriptionEn(e.target.value)}
                        placeholder="Detailed product story, process, and purity details in English..."
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Health Benefits (English)</label>
                        <textarea
                          rows={3}
                          value={benefitsEn}
                          onChange={e => setBenefitsEn(e.target.value)}
                          placeholder="• Lowers cholesterol\n• Pure natural care..."
                          className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Usage Instructions (English)</label>
                        <textarea
                          rows={3}
                          value={usageEn}
                          onChange={e => setUsageEn(e.target.value)}
                          placeholder="Instructions for cooking or daily usage..."
                          className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Badges & Flags */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
                  ৫. ব্যাজ ও ডিসপ্লে অপশন (Badges & Settings)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">ব্যাজ (Badge)</label>
                    <select
                      value={badge}
                      onChange={e => setBadge(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2 text-xs"
                    >
                      <option value="">কোনো ব্যাজ নেই</option>
                      <option value="বেস্ট সেলিং">বেস্ট সেলিং</option>
                      <option value="নতুন">নতুন</option>
                      <option value="সাশ্রয়ী">সাশ্রয়ী</option>
                      <option value="ফ্রি গিফট">ফ্রি গিফট</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnHome}
                        onChange={e => setShowOnHome(e.target.checked)}
                        className="accent-[#1B5E20] rounded"
                      />
                      <span>হোম পেজে দেখান</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                        className="accent-[#1B5E20] rounded"
                      />
                      <span>পণ্যটি সক্রিয় (Active) রাখুন</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-7 py-2.5 rounded-xl shadow-md transition"
                >
                  পণ্য সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
