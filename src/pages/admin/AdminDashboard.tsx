import React from 'react';
import {
  TrendingUp, ShoppingCart, Clock, Users, AlertTriangle, Package, CheckCircle2,
  DollarSign, Volume2, ArrowRight, Eye, ChevronRight
} from 'lucide-react';
import {
  getOrders, getProducts, getCategories, playOrderNotificationSound, updateOrderStatus
} from '../../services/storeService';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  onSelectTab: (tab: AdminTab) => void;
  onViewOrder: (orderId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectTab, onViewOrder }) => {
  const orders = getOrders();
  const products = getProducts();
  const categories = getCategories();

  // Metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  // Today sales
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr) && o.orderStatus !== 'cancelled');
  const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);

  // Pending orders
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending');

  // Low stock products (any variant stock < 10)
  const lowStockProducts = products.filter(p => p.variants.some(v => v.stock < 10));

  // Recent 10 orders
  const recentOrders = orders.slice(0, 10);

  // Top selling products
  const topProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Sound Test */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
            অ্যাডমিন ড্যাশবোর্ড ওভারভিউ
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            আজকের বিক্রয়, অর্ডার ও ইনভেন্টরির সার্বিক অবস্থা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playOrderNotificationSound()}
            className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs"
            title="নতুন অর্ডারের অডিও নোটিফিকেশন টেস্ট করুন"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>অর্ডার সাউন্ড টেস্ট</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase">মোট বিক্রয়</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1B5E20]">৳{totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-gray-400 font-medium">আজকের বিক্রি: ৳{todayRevenue}</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase">মোট অর্ডার</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">{orders.length} টি</div>
          <div className="text-[11px] text-emerald-600 font-bold">আজ নতুন: {todayOrders.length} টি</div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase">পেন্ডিং অর্ডার</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{pendingOrders.length} টি</div>
          <div className="text-[11px] text-amber-700 font-medium">যাচাই ও কনফার্ম বাকি</div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase">স্টক সতর্কতা</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">{lowStockProducts.length} টি</div>
          <div className="text-[11px] text-rose-500 font-medium">স্টক ১০ এর কম</div>
        </div>
      </div>

      {/* Two Column Layout: Charts & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Selling Products (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1B5E20]" />
              <span>সর্বাধিক বিক্রিত পণ্য তালিকা</span>
            </h3>
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-bold text-[#1B5E20] hover:underline"
            >
              সব পণ্য →
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
                <span className="w-5 font-bold text-xs text-gray-400 text-center">#{idx + 1}</span>
                <img src={p.images[0]} alt={p.nameBn} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{p.nameBn}</div>
                  <div className="text-[10px] text-gray-500 font-medium">SKU: {p.sku} • রেটিং: {p.rating} ★</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-[#1B5E20]">{p.salesCount || 0} টি বিক্রয়</div>
                  <div className="text-[10px] text-gray-400">৳{p.variants[0]?.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Low Stock Warnings (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>স্টক কম থাকা পণ্যের সতর্কতা</span>
            </h3>
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              স্টক বাড়ান →
            </button>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                সব পণ্যের পর্যাপ্ত স্টক রয়েছে।
              </div>
            ) : (
              lowStockProducts.map(p => {
                const lowVar = p.variants.find(v => v.stock < 10) || p.variants[0];
                return (
                  <div key={p.id} className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-gray-900 truncate">{p.nameBn}</div>
                      <div className="text-[11px] text-gray-500">সাইজ: {lowVar.size}</div>
                    </div>
                    <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded shrink-0">
                      অবশিষ্ট: {lowVar.stock} টি
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent 10 Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#1B5E20]" />
            <span>সাম্প্রতিক ১০টি অর্ডার</span>
          </h3>
          <button
            onClick={() => onSelectTab('orders')}
            className="text-xs font-bold text-[#1B5E20] hover:underline"
          >
            সব অর্ডার দেখুন ({orders.length}) →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            এখনও কোনো অর্ডার পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">অর্ডার নম্বর</th>
                  <th className="py-2.5 px-3">গ্রাহক</th>
                  <th className="py-2.5 px-3">মোবাইল</th>
                  <th className="py-2.5 px-3">মোট টাকা</th>
                  <th className="py-2.5 px-3">পেমেন্ট</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-3 font-bold text-[#1B5E20]">{order.orderNumber}</td>
                    <td className="py-3 px-3 font-semibold text-gray-800">{order.customerName}</td>
                    <td className="py-3 px-3 text-gray-600">{order.phone}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">৳{order.total}</td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-[#1B5E20]'
                          : order.orderStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onViewOrder(order.id);
                          onSelectTab('orders');
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-[#1B5E20] font-bold"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
