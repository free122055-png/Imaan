import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { subscribeToStore } from './services/storeService';

// Common Components
import { Header } from './components/common/Header';
import { SideDrawer } from './components/common/SideDrawer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { FloatingActionButtons } from './components/common/FloatingActionButtons';
import { Toast } from './components/common/Toast';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CategoryPage } from './pages/CategoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackPage } from './pages/OrderTrackPage';
import { SearchPage } from './pages/SearchPage';
import { AuthPages } from './pages/AuthPages';
import { AccountPage } from './pages/AccountPage';
import { StaticContentPage } from './pages/StaticContentPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLayout, AdminTab } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategoriesBrands } from './pages/admin/AdminCategoriesBrands';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminMarketing } from './pages/admin/AdminMarketing';
import { AdminSettings } from './pages/admin/AdminSettings';

function MainRouter() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [, setStoreVersion] = useState(0);

  // Admin sub-tab
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [adminSelectedOrderId, setAdminSelectedOrderId] = useState<string | undefined>();

  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to real-time store updates
  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setStoreVersion(v => v + 1);
    });
    return unsub;
  }, []);

  const navigate = (route: string) => {
    if (route !== currentRoute) {
      window.history.pushState({}, '', route);
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check if current route is admin
  const isAdminRoute = currentRoute.startsWith('/admin');

  // If trying to access admin without admin role
  if (isAdminRoute && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header onOpenDrawer={() => setIsDrawerOpen(true)} onNavigate={navigate} currentRoute={currentRoute} />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-2xl">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('admin_access_restricted')}</h2>
          <p className="text-xs text-gray-600">
            {t('admin_access_desc')}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#1B5E20] text-[#F2B705] px-5 py-2.5 rounded-xl font-bold text-xs"
            >
              {t('login')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs"
            >
              {t('go_to_home')}
            </button>
          </div>
        </div>
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  // Render Admin View
  if (isAdminRoute) {
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          setAdminTab(tab);
          setAdminSelectedOrderId(undefined);
        }}
        onNavigateHome={() => navigate('/')}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onSelectTab={setAdminTab}
            onViewOrder={(orderId) => {
              setAdminSelectedOrderId(orderId);
              setAdminTab('orders');
            }}
          />
        )}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'categories' && <AdminCategoriesBrands />}
        {adminTab === 'orders' && <AdminOrders selectedOrderId={adminSelectedOrderId} />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'marketing' && <AdminMarketing />}
        {adminTab === 'settings' && <AdminSettings />}
        {adminTab === 'security' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Parse path & params for client store
  const path = currentRoute.split('?')[0];

  const renderContent = () => {
    if (path === '/' || path === '') {
      return <HomePage onNavigate={navigate} />;
    }

    if (path.startsWith('/products/')) {
      const slug = path.replace('/products/', '');
      return <ProductDetailsPage slug={slug} onNavigate={navigate} />;
    }

    if (path.startsWith('/category/')) {
      const catSlug = path.replace('/category/', '');
      return <CategoryPage categorySlug={catSlug} onNavigate={navigate} />;
    }

    if (path === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    if (path === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }

    if (path.startsWith('/order-success/')) {
      const ordId = path.replace('/order-success/', '');
      return <OrderSuccessPage orderId={ordId} onNavigate={navigate} />;
    }

    if (path === '/track-order') {
      return <OrderTrackPage onNavigate={navigate} />;
    }

    if (path === '/search') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      return <SearchPage initialQuery={q} onNavigate={navigate} />;
    }

    if (path === '/offers') {
      return <CategoryPage categorySlug="all" sortByDefault="top_selling" onNavigate={navigate} />;
    }

    if (path === '/brands') {
      return <CategoryPage categorySlug="all" onNavigate={navigate} />;
    }

    if (path === '/login') {
      return <AuthPages onNavigate={navigate} defaultTab="login" />;
    }

    if (path === '/register') {
      return <AuthPages onNavigate={navigate} defaultTab="register" />;
    }

    if (path === '/account') {
      return <AccountPage onNavigate={navigate} defaultTab="orders" />;
    }

    if (path === '/wishlist') {
      return <AccountPage onNavigate={navigate} defaultTab="wishlist" />;
    }

    if (path.startsWith('/page/')) {
      const pSlug = path.replace('/page/', '');
      return <StaticContentPage slug={pSlug} onNavigate={navigate} />;
    }

    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#F2B705]/40 selection:text-[#1B5E20]">
      {/* Toast notifications */}
      <Toast />

      {/* Side Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={navigate}
      />

      {/* Main Header */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onNavigate={navigate}
        currentRoute={currentRoute}
      />

      {/* Main Page View Container */}
      <main className={`flex-1 w-full ${currentRoute === '/' || currentRoute === '' ? 'p-0 m-0' : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4'}`}>
        {renderContent()}
      </main>

      {/* Floating Mini Cart & WhatsApp Chat Buttons */}
      <FloatingActionButtons onNavigate={navigate} currentRoute={currentRoute} />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MainRouter />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
