import React, { useState } from 'react';
import {
  User as UserIcon, Package, Heart, MapPin, Settings, LogOut, ShieldCheck,
  Plus, Trash2, ShoppingBag, ChevronRight, CheckCircle2, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getOrders, getProducts } from '../services/storeService';
import { BANGLADESH_DISTRICTS } from '../data/seedData';
import { ProductCard } from '../components/product/ProductCard';
import { formatPrice } from '../utils/format';

interface AccountPageProps {
  onNavigate: (route: string) => void;
  defaultTab?: 'orders' | 'wishlist' | 'profile' | 'addresses';
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, defaultTab = 'orders' }) => {
  const { currentUser, logout, updateProfile, saveAddress, deleteAddress, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'addresses'>(defaultTab);

  // Edit Profile States
  const [name, setName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // New Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrTitle, setAddrTitle] = useState('বাসা');
  const [addrDistrict, setAddrDistrict] = useState('ঢাকা');
  const [addrThana, setAddrThana] = useState('চকবাজার');
  const [addrFull, setAddrFull] = useState('');

  if (!currentUser) {
    onNavigate('/login');
    return null;
  }

  // Filter orders for this user
  const allOrders = getOrders();
  const userOrders = allOrders.filter(
    o => o.userId === currentUser.id || o.phone === currentUser.phone
  );

  // Wishlist products
  const allProducts = getProducts();
  const wishlistProducts = allProducts.filter(p => currentUser.wishlist?.includes(p.id));

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFull.trim()) return;

    saveAddress({
      title: addrTitle,
      district: addrDistrict,
      thana: addrThana,
      fullAddress: addrFull.trim(),
      isDefault: (currentUser.addresses?.length || 0) === 0,
    });

    setAddrFull('');
    setShowAddressModal(false);
  };

  const handleReorder = (order: typeof userOrders[0]) => {
    order.items.forEach(item => {
      const prod = allProducts.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId) || prod.variants[0];
        addToCart(prod, variant, item.quantity);
      }
    });
    onNavigate('/cart');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-12">
      {/* User Header Profile Card */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2B705] text-[#1B5E20] font-black text-2xl sm:text-3xl flex items-center justify-center border-4 border-white/20 shadow-inner">
            {currentUser.displayName.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black">{currentUser.displayName}</h1>
              {isAdmin && (
                <span className="bg-[#F2B705] text-[#1B5E20] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {currentUser.role}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-200 mt-0.5">{currentUser.phone} • {currentUser.email || 'ইমেইল দেওয়া হয়নি'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => onNavigate('/admin')}
              className="bg-[#F2B705] hover:bg-[#D9A304] text-[#1B5E20] font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              {t('admin_panel')}
            </button>
          )}
          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 text-xs sm:text-sm font-bold pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
            activeTab === 'orders' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('account_orders')} ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
            activeTab === 'wishlist' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{t('wishlist')} ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
            activeTab === 'addresses' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t('account_addresses')}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
            activeTab === 'profile' ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{t('account_profile')}</span>
        </button>
      </div>

      {/* Tab 1: My Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-amber-200/60">
              <Package className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-700">আপনি এখনও কোনো অর্ডার করেননি!</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                আমাদের খাঁটি সরিষার তেল ও পুষ্টিকর তেলের সংগ্রহ দেখুন এবং অর্ডার করুন।
              </p>
              <button
                onClick={() => onNavigate('/')}
                className="bg-[#1B5E20] text-[#F2B705] font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
              >
                শপিং শুরু করুন
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map(order => {
                const orderNum = order.orderNo || order.orderNumber || order.id;
                const custPhone = order.customer?.phone || order.phone || '';
                const orderTotal = order.pricing?.total ?? order.total;
                const courierUrl = order.delivery?.trackingUrl;

                return (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="text-sm font-black text-[#1B5E20]">
                          অর্ডার: {orderNum}
                        </div>
                        <div className="text-xs text-gray-500">
                          তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-[#1B5E20]'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {order.orderStatus}
                        </span>
                        <button
                          onClick={() => onNavigate(`/track-order?num=${orderNum}&phone=${custPhone}`)}
                          className="text-xs text-emerald-800 font-bold hover:underline"
                        >
                          লাইভ ট্র্যাক →
                        </button>
                      </div>
                    </div>

                    {/* Snapshot Items */}
                    <div className="space-y-2">
                      {order.items.map((it, idx) => {
                        const itemName = (it as any).name || it.productName;
                        const itemSize = (it as any).sizeLabel || it.variantSize;
                        const itemImg = (it as any).image || it.productImage;
                        const itemQty = it.qty ?? (it as any).quantity ?? 1;
                        const itemTotal = (it as any).totalPrice ?? it.total ?? ((it as any).unitPrice ? (it as any).unitPrice * itemQty : 0);

                        return (
                          <div key={idx} className="flex items-center gap-3 text-xs">
                            <img src={itemImg} alt={itemName} className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0" />
                            <div className="flex-1 truncate font-medium text-gray-800">
                              {itemName} {itemSize ? `(${itemSize})` : ''} × {itemQty}
                            </div>
                            <span className="font-bold text-gray-900">{formatPrice(itemTotal)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Courier Tracking Banner if shipped */}
                    {courierUrl && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-blue-900 font-semibold">
                          কুরিয়ার: {order.delivery?.courierName || 'পার্সেল কুরিয়ার'} ({order.delivery?.trackingId})
                        </span>
                        <a
                          href={courierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-bold underline hover:text-blue-900"
                        >
                          কুরিয়ারে ট্র্যাক করুন ↗
                        </a>
                      </div>
                    )}

                    {/* Footer & Re-Order Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-600">
                        মোট প্রদেয়: <strong className="text-base font-black text-[#1B5E20]">{formatPrice(orderTotal)}</strong>
                      </div>
                      <button
                        onClick={() => handleReorder(order)}
                        className="bg-[#F2B705] hover:bg-[#D9A304] text-[#1B5E20] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>পুনরায় অর্ডার করুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-amber-200/60">
              <Heart className="w-12 h-12 text-rose-400 mx-auto" />
              <h3 className="font-bold text-gray-700">আপনার উইশলিস্ট খালি</h3>
              <p className="text-xs text-gray-500">
                পছন্দের পণ্যের ওপর হার্ট আইকনে ক্লিক করে তালিকায় সংরক্ষণ করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wishlistProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">সংরক্ষিত ডেলিভারি ঠিকানা সমূহ</h3>
            <button
              onClick={() => setShowAddressModal(true)}
              className="bg-[#1B5E20] text-[#F2B705] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ঠিকানা যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser.addresses && currentUser.addresses.length > 0 ? (
              currentUser.addresses.map(addr => (
                <div key={addr.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 relative space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs bg-emerald-100 text-[#1B5E20] px-2 py-0.5 rounded-md">
                      {addr.title} {addr.isDefault && '(ডিফল্ট)'}
                    </span>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-md"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 pt-1">
                    {addr.district}, {addr.thana}
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {addr.fullAddress}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-gray-400 text-xs">
                কোনো সংরক্ষিত ঠিকানা নেই। উপরের বাটন দিয়ে ঠিকানা যোগ করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Edit Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-6 max-w-xl">
          <h3 className="font-bold text-base text-gray-900">প্রোফাইল তথ্য পরিবর্তন</h3>

          {profileSaved && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> আপনার তথ্য সফলভাবে আপডেট হয়েছে!
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">আপনার নাম</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-[#FFFBF0]/60 border border-amber-200 rounded-xl p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">মোবাইল নম্বর</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full bg-[#FFFBF0]/60 border border-amber-200 rounded-xl p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#FFFBF0]/60 border border-amber-200 rounded-xl p-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-xs px-6 py-3 rounded-xl shadow-md transition"
            >
              পরিবর্তন সেভ করুন
            </button>
          </form>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-[#1B5E20]">নতুন ঠিকানা যোগ করুন</h3>
            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">লেবেল / টাইটেল</label>
                <input
                  type="text"
                  placeholder="যেমন: বাসা, অফিস"
                  value={addrTitle}
                  onChange={e => setAddrTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">জেলা</label>
                  <select
                    value={addrDistrict}
                    onChange={e => setAddrDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2 text-xs"
                  >
                    {BANGLADESH_DISTRICTS.map(d => (
                      <option key={d.nameBn} value={d.nameBn}>{d.nameBn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">থানা</label>
                  <input
                    type="text"
                    value={addrThana}
                    onChange={e => setAddrThana(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">পূর্ণ ঠিকানা</label>
                <textarea
                  rows={2}
                  placeholder="রোড নম্বর, বাড়ি নম্বর, এলাকা..."
                  value={addrFull}
                  onChange={e => setAddrFull(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#1B5E20] text-white px-5 py-2 text-xs font-bold rounded-xl"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
