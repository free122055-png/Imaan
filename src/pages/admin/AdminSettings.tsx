import React, { useState } from 'react';
import {
  Settings, ShieldAlert, Download, Upload, RotateCcw, CheckCircle2,
  Lock, Save, Palette, Truck, CreditCard, Users, History, Hash, MessageSquare
} from 'lucide-react';
import {
  getSettings, saveSettings, exportDatabaseJSON, importDatabaseJSON,
  resetToSeedData, getActivityLogs
} from '../../services/storeService';
import { StoreSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ImageUploadField } from '../../components/common/ImageUploadField';

export const AdminSettings: React.FC = () => {
  const currentSettings = getSettings();
  const { currentUser, isSuperAdmin } = useAuth();

  // Settings form states
  const [siteNameBn, setSiteNameBn] = useState(currentSettings.siteNameBn || currentSettings.siteName || 'আইমান ব্রান্ড');
  const [siteNameEn, setSiteNameEn] = useState(currentSettings.siteNameEn || 'Aiman Brand');
  const [taglineBn, setTaglineBn] = useState(currentSettings.taglineBn || currentSettings.tagline || 'খাঁটি ও প্রাকৃতিক তেলের বিশ্বস্ত ঠিকানা');
  const [taglineEn, setTaglineEn] = useState(currentSettings.taglineEn || 'Trusted source of pure natural oils');
  const [defaultLanguage, setDefaultLanguage] = useState<'bn' | 'en'>(currentSettings.defaultLanguage || 'bn');
  const [logoImages, setLogoImages] = useState<string[]>(currentSettings.logo ? [currentSettings.logo] : []);
  const [phone, setPhone] = useState(currentSettings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(currentSettings.whatsappNumber);
  const [email, setEmail] = useState(currentSettings.email);
  const [address, setAddress] = useState(currentSettings.address);
  const [numberFormat, setNumberFormat] = useState<'english' | 'bengali'>(currentSettings.numberFormat || 'english');
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    currentSettings.whatsappOrderTemplate ||
    'আসসালামু আলাইকুম! আমার নাম {নাম}। আমি আইমান ব্রান্ড থেকে অর্ডার নং {অর্ডার_নম্বর} করেছি। মোট প্রদেয়: {মোট}। বিস্তারিত আইটেম: {আইটেম}।'
  );

  // Theme colors
  const [themePrimaryColor, setThemePrimaryColor] = useState(currentSettings.themePrimaryColor || '#1B5E20');
  const [themeAccentColor, setThemeAccentColor] = useState(currentSettings.themeAccentColor || '#F2B705');

  // Delivery
  const [deliveryInside, setDeliveryInside] = useState(currentSettings.deliveryInsideDhaka);
  const [deliveryOutside, setDeliveryOutside] = useState(currentSettings.deliveryOutsideDhaka);
  const [freeDeliveryMin, setFreeDeliveryMin] = useState(currentSettings.freeDeliveryMinOrder);

  // Payment methods
  const [codEnabled, setCodEnabled] = useState(currentSettings.paymentMethods.cod.enabled);
  const [bkashEnabled, setBkashEnabled] = useState(currentSettings.paymentMethods.bkash.enabled);
  const [bkashNumber, setBkashNumber] = useState(currentSettings.paymentMethods.bkash.number);
  const [nagadEnabled, setNagadEnabled] = useState(currentSettings.paymentMethods.nagad.enabled);
  const [nagadNumber, setNagadNumber] = useState(currentSettings.paymentMethods.nagad.number);
  const [rocketEnabled, setRocketEnabled] = useState(currentSettings.paymentMethods.rocket.enabled);
  const [rocketNumber, setRocketNumber] = useState(currentSettings.paymentMethods.rocket.number);

  // Toggles
  const [guestCheckout, setGuestCheckout] = useState(currentSettings.guestCheckoutEnabled);
  const [maintenanceMode, setMaintenanceMode] = useState(currentSettings.maintenanceMode);
  const [bannerNoticeText, setBannerNoticeText] = useState(currentSettings.noticeBanner?.text || '');
  const [bannerNoticeEnabled, setBannerNoticeEnabled] = useState(currentSettings.noticeBanner?.enabled ?? true);

  // Success message
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Activity logs
  const activityLogs = getActivityLogs();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Helper to darken/lighten hex
    const adjustColor = (color: string, amount: number) => {
      return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    };

    // Update CSS variables
    document.documentElement.style.setProperty('--brand-600', themePrimaryColor);
    document.documentElement.style.setProperty('--brand-500', adjustColor(themePrimaryColor, 30));
    document.documentElement.style.setProperty('--brand-700', adjustColor(themePrimaryColor, -30));
    document.documentElement.style.setProperty('--brand-text', adjustColor(themePrimaryColor, -50));
    document.documentElement.style.setProperty('--brand-50', adjustColor(themePrimaryColor, 200));

    const updated: StoreSettings = {
      ...currentSettings,
      siteName: siteNameBn.trim() || siteNameEn.trim(),
      siteNameBn: siteNameBn.trim(),
      siteNameEn: siteNameEn.trim(),
      tagline: taglineBn.trim() || taglineEn.trim(),
      taglineBn: taglineBn.trim(),
      taglineEn: taglineEn.trim(),
      defaultLanguage,
      logo: logoImages[0] || currentSettings.logo,
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.trim(),
      address: address.trim(),
      themePrimaryColor,
      themeAccentColor,
      deliveryInsideDhaka: deliveryInside,
      deliveryOutsideDhaka: deliveryOutside,
      freeDeliveryMinOrder: freeDeliveryMin,
      numberFormat,
      whatsappOrderTemplate: whatsappTemplate.trim(),
      paymentMethods: {
        cod: { enabled: codEnabled },
        bkash: { enabled: bkashEnabled, number: bkashNumber.trim(), type: 'Personal (Send Money)' },
        nagad: { enabled: nagadEnabled, number: nagadNumber.trim(), type: 'Personal (Send Money)' },
        rocket: { enabled: rocketEnabled, number: rocketNumber.trim(), type: 'Personal (Send Money)' },
      },
      guestCheckoutEnabled: guestCheckout,
      maintenanceMode,
      noticeBanner: {
        enabled: bannerNoticeEnabled,
        text: bannerNoticeText.trim(),
      },
      updatedAt: new Date().toISOString(),
    };

    saveSettings(updated);
    setSaveSuccessMsg('স্টোর সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Export JSON Database
  const handleExportJSON = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aiman-brand-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  // Import JSON Database
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJSON(content);
        if (ok) {
          alert('ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!');
          window.location.reload();
        } else {
          alert('JSON ফাইল সঠিক নয়।');
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset to seed data
  const handleResetSeed = () => {
    if (window.confirm('সতর্কতা: এটি সমস্ত বর্তমান ডাটা মুছে প্রাথমিক ১২টি তেল পণ্য ও সিড সেটিংসে ফিরিয়ে দেবে। আপনি কি নিশ্চিত?')) {
      resetToSeedData();
      alert('ডাটাবেজ প্রাথমিক সিড অবস্থায় রিসেট করা হয়েছে!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
          স্টোর সেটিংস ও ডাটা নিরাপত্তা
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          সাইটের তথ্য, থিম কালার, ডেলিভারি চার্জ, বিকাশ/নগদ পেমেন্ট নম্বর ও সম্পূর্ণ ডাটাবেজ ব্যাকআপ
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Store Profile */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#1B5E20]" />
            <span>১. স্টোর পরিচিতি ও যোগাযোগ তথ্য</span>
          </h2>

          {/* Default Language Selector */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
            <label className="text-xs font-bold text-[#1B5E20] block">
              প্রাথমিক ভাষা সেটিং (Default Store Language)
            </label>
            <div className="flex items-center gap-4 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultLang"
                  checked={defaultLanguage === 'bn'}
                  onChange={() => setDefaultLanguage('bn')}
                  className="accent-[#1B5E20]"
                />
                <span>বাংলা (Bengali - ডিফল্ট)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultLang"
                  checked={defaultLanguage === 'en'}
                  onChange={() => setDefaultLanguage('en')}
                  className="accent-[#1B5E20]"
                />
                <span>English (ইংরেজি)</span>
              </label>
            </div>
            <p className="text-[11px] text-gray-500">
              নতুন গ্রাহক প্রথমবার ওয়েবসাইটে আসলে এই ভাষায় ওয়েবসাইটটি প্রদর্শিত হবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">স্টোরের নাম (বাংলা)</label>
              <input
                type="text"
                value={siteNameBn}
                onChange={e => setSiteNameBn(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-[#1B5E20]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Store Name (English)</label>
              <input
                type="text"
                value={siteNameEn}
                onChange={e => setSiteNameEn(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-[#1B5E20]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ট্যাগলাইন / স্লোগান (বাংলা)</label>
              <input
                type="text"
                value={taglineBn}
                onChange={e => setTaglineBn(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Tagline / Slogan (English)</label>
              <input
                type="text"
                value={taglineEn}
                onChange={e => setTaglineEn(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">অর্ডার হটলাইন ফোন</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">হোয়াটসঅ্যাপ নম্বর</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">দোকানের পূর্ণ ঠিকানা</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">শীর্ষ ঘোষণা ব্যানার টেক্সট</label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={bannerNoticeText}
                onChange={e => setBannerNoticeText(e.target.value)}
                placeholder="ঘোষণা বার্তা..."
                className="flex-1 border border-gray-300 rounded-xl p-2 text-xs"
              />
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={bannerNoticeEnabled}
                  onChange={e => setBannerNoticeEnabled(e.target.checked)}
                  className="accent-[#1B5E20] rounded"
                />
                <span>ব্যানার চালু</span>
              </label>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="pt-2">
            <ImageUploadField
              images={logoImages}
              onChange={setLogoImages}
              maxImages={1}
              targetSizeKB={80}
              label="স্টোর লোগো (Store Logo - ড্র্যাগ-ড্রপ বা আপলোড)"
            />
          </div>

          {/* Number Formatting Setting */}
          <div className="pt-2 space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              মূল্য ও সংখ্যা প্রদর্শন ফরম্যাট (Number Display Format)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                numberFormat === 'english' ? 'border-[#1B5E20] bg-emerald-50/50' : 'border-gray-200 bg-white'
              }`}>
                <input
                  type="radio"
                  name="numFormat"
                  checked={numberFormat === 'english'}
                  onChange={() => setNumberFormat('english')}
                  className="accent-[#1B5E20]"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">ইংরেজি সংখ্যা (ডিফল্ট ও স্পষ্ট)</div>
                  <div className="text-[11px] text-gray-500">যেমন: ৳420, 250 ml (১ কে ৭ বা ৯ মনে হওয়া প্রতিরোধ করে)</div>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                numberFormat === 'bengali' ? 'border-[#1B5E20] bg-emerald-50/50' : 'border-gray-200 bg-white'
              }`}>
                <input
                  type="radio"
                  name="numFormat"
                  checked={numberFormat === 'bengali'}
                  onChange={() => setNumberFormat('bengali')}
                  className="accent-[#1B5E20]"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">বাংলা সংখ্যা</div>
                  <div className="text-[11px] text-gray-500">যেমন: ৳৪২০, ২৫০ মিলি</div>
                </div>
              </label>
            </div>
          </div>

          {/* WhatsApp Order Template */}
          <div className="pt-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                হোয়াটসঅ্যাপ অর্ডার মেসেজ টেমপ্লেট
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                ব্যবহারযোগ্য ট্যাগ: {'{নাম}'}, {'{অর্ডার_নম্বর}'}, {'{মোট}'}, {'{আইটেম}'}
              </span>
            </div>
            <textarea
              rows={3}
              value={whatsappTemplate}
              onChange={e => setWhatsappTemplate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-[#1B5E20]"
              placeholder="আসসালামু আলাইকুম! আমার নাম {নাম}..."
            />
          </div>
        </div>

        {/* Theme Colors */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#1B5E20]" />
            <span>২. থিম কালার কাস্টমাইজেশন</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themePrimaryColor}
                onChange={e => setThemePrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300 p-1"
              />
              <div>
                <label className="text-xs font-bold text-gray-700 block">মূল রং (Primary Green)</label>
                <div className="text-xs font-mono text-gray-500">{themePrimaryColor}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeAccentColor}
                onChange={e => setThemeAccentColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300 p-1"
              />
              <div>
                <label className="text-xs font-bold text-gray-700 block">সোনালি অ্যাকসেন্ট রং (Accent Mustard)</label>
                <div className="text-xs font-mono text-gray-500">{themeAccentColor}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1B5E20]" />
            <span>৩. ডেলিভারি এলাকা ও চার্জ সেটিংস</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ঢাকার ভেতরে চার্জ (৳)</label>
              <input
                type="number"
                value={deliveryInside}
                onChange={e => setDeliveryInside(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ঢাকার বাইরে চার্জ (৳)</label>
              <input
                type="number"
                value={deliveryOutside}
                onChange={e => setDeliveryOutside(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ফ্রি ডেলিভারির সর্বনিম্ন অর্ডার (৳)</label>
              <input
                type="number"
                value={freeDeliveryMin}
                onChange={e => setFreeDeliveryMin(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-[#1B5E20]"
              />
            </div>
          </div>
        </div>

        {/* Payment Numbers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <h2 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1B5E20]" />
            <span>৪. পেমেন্ট গেটওয়ে ও নম্বর</span>
          </h2>
          <div className="space-y-3">
            {/* bKash */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bkashEnabled}
                  onChange={e => setBkashEnabled(e.target.checked)}
                  className="accent-[#DF146E] rounded"
                />
                <span>bKash বিকাশ চালু রাখুন</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">নম্বর:</span>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={e => setBkashNumber(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs font-mono"
                />
              </div>
            </div>

            {/* Nagad */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nagadEnabled}
                  onChange={e => setNagadEnabled(e.target.checked)}
                  className="accent-[#F7941D] rounded"
                />
                <span>Nagad নগদ চালু রাখুন</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">নম্বর:</span>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={e => setNagadNumber(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs font-mono"
                />
              </div>
            </div>

            {/* Rocket */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rocketEnabled}
                  onChange={e => setRocketEnabled(e.target.checked)}
                  className="accent-[#8C3494] rounded"
                />
                <span>Rocket রকেট চালু রাখুন</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">নম্বর:</span>
                <input
                  type="text"
                  value={rocketNumber}
                  onChange={e => setRocketNumber(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#1B5E20] hover:bg-[#144918] text-[#F2B705] font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg transition transform active:scale-98"
          >
            <Save className="w-5 h-5" />
            <span>সমস্ত সেটিংস সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>

      {/* 7.8 Data Security, Backup & Activity Logs */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-6">
        <h2 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <span>৫. ডেটা নিরাপত্তা, ব্যাকআপ ও অ্যাক্টিভিটি অডিট লগ</span>
        </h2>

        {/* Backup Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] font-bold text-xs p-3.5 rounded-xl border border-emerald-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs p-3.5 rounded-xl border border-blue-200 transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>ডাটাবেজ রিস্টোর (JSON আপলোড)</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleResetSeed}
            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs p-3.5 rounded-xl border border-rose-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ডিফল্ট সিড ডাটায় রিসেট</span>
          </button>
        </div>

        {/* Activity Logs Viewer */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600 flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>সাম্প্রতিক অ্যাক্টিভিটি লগ (Audit Trail)</span>
          </h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl">
            {activityLogs.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">কোনো লগ নেই।</div>
            ) : (
              activityLogs.slice(0, 25).map(log => (
                <div key={log.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-900">{log.action}</span>
                    <span className="text-gray-500 mx-1.5">•</span>
                    <span className="text-[#1B5E20] font-medium">{log.target}</span>
                    <span className="text-gray-400 ml-2">({log.details})</span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
