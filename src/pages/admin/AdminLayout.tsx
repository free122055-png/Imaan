import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, FolderTree, Package, Users, Megaphone,
  Settings, ShieldAlert, LogOut, ArrowLeft, Menu, X, Bell, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSettings } from '../../services/storeService';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'marketing'
  | 'settings'
  | 'security';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  children,
}) => {
  const { currentUser, isSuperAdmin, isManager, isStaff, logout } = useAuth();
  const settings = getSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const canManageProducts = isSuperAdmin || isManager;
  const canManageMarketing = isSuperAdmin || isManager;
  const canManageSettings = isSuperAdmin;
  const canManageCustomers = isSuperAdmin || isManager;

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, visible: true },
    { id: 'orders', label: 'অর্ডার ব্যবস্থাপনা', icon: Package, visible: true },
    { id: 'products', label: 'পণ্য সামগ্রী', icon: ShoppingBag, visible: canManageProducts },
    { id: 'categories', label: 'ক্যাটাগরি ও ব্র্যান্ড', icon: FolderTree, visible: canManageProducts },
    { id: 'customers', label: 'কাস্টমার তালিকা', icon: Users, visible: canManageCustomers },
    { id: 'marketing', label: 'মার্কেটিং ও কন্টেন্ট', icon: Megaphone, visible: canManageMarketing },
    { id: 'settings', label: 'স্টোর সেটিংস', icon: Settings, visible: canManageSettings },
    { id: 'security', label: 'ডাটা ও লগ নিরাপত্তা', icon: ShieldAlert, visible: canManageSettings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans text-gray-800">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-brand-600 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 rounded-lg hover:bg-white/10"
            aria-label="মেনু"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-extrabold text-base tracking-tight text-white">
            {settings.siteName} অ্যাডমিন
          </span>
        </div>

        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1 bg-brand-500 text-white text-xs font-black px-2.5 py-1 rounded-md"
        >
          <span>স্টোর ভিউ</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </header>

      {/* Sidebar (Desktop permanent, Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-line flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl md:shadow-none`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-black text-xl flex items-center justify-center">
                আ
              </div>
              <div>
                <div className="font-black text-sm text-ink leading-tight">{settings.siteName}</div>
                <div className="text-[10px] text-muted font-semibold tracking-wider">অ্যাডমিন কন্ট্রোল প্যানেল</div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-muted hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge in Sidebar */}
          <div className="p-4 mx-3 my-3 bg-brand-50 rounded-2xl border border-brand-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-black flex items-center justify-center shrink-0">
              {currentUser?.displayName?.slice(0, 1) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink truncate">{currentUser?.displayName}</div>
              <div className="text-[10px] text-brand-text font-semibold uppercase">{currentUser?.role}</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.filter(it => it.visible).map(item => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id as AdminTab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-muted hover:bg-brand-50 hover:text-brand-text'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-line space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-text font-bold text-xs py-2.5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল স্টোরে ফিরে যান</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-rose-600 hover:text-rose-700 text-xs py-1.5 transition font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Header Bar */}
        <div className="hidden md:flex bg-white border-b border-line px-8 py-3.5 items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-muted font-semibold">
            <span>অ্যাডমিন</span>
            <span>/</span>
            <span className="text-brand-600 font-bold capitalize">{currentTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 bg-brand-600 text-white hover:bg-brand-700 text-xs font-black px-4 py-2 rounded-xl shadow-xs transition"
            >
              <span>ওয়েবসাইট ভিজিট করুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
