import React, { useState } from 'react';
import { Users, Search, ShoppingBag, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import { getOrders } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

export const AdminCustomers: React.FC = () => {
  const orders = getOrders();
  const [search, setSearch] = useState('');

  // Extract unique customers from orders & registered users
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    ordersCount: number;
    totalSpend: number;
    lastOrderDate: string;
    isBlocked?: boolean;
  }>();

  orders.forEach(o => {
    const key = o.phone.trim();
    const existing = customerMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpend += o.total;
      if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.createdAt;
      }
    } else {
      customerMap.set(key, {
        name: o.customerName,
        phone: o.phone,
        ordersCount: 1,
        totalSpend: o.total,
        lastOrderDate: o.createdAt,
      });
    }
  });

  const [blockedPhones, setBlockedPhones] = useState<string[]>([]);

  const toggleBlock = (phone: string) => {
    setBlockedPhones(prev =>
      prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
    );
  };

  const customerList = Array.from(customerMap.values()).filter(c => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
            কাস্টমার তালিকা (Customer Management)
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            মোট {customerList.length} জন গ্রাহকের অর্ডার ইতিহাস ও তথ্য
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="নাম বা মোবাইল নম্বর..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-[#1B5E20]"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">গ্রাহকের নাম</th>
                <th className="py-3 px-4">মোবাইল</th>
                <th className="py-3 px-4 text-center">মোট অর্ডার</th>
                <th className="py-3 px-4 text-right">মোট কেনাকাটা (৳)</th>
                <th className="py-3 px-4">সর্বশেষ অর্ডার</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    কোনো কাস্টমার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                customerList.map(c => {
                  const isBlocked = blockedPhones.includes(c.phone);
                  return (
                    <tr key={c.phone} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono">{c.phone}</td>
                      <td className="py-3 px-4 text-center font-bold text-[#1B5E20]">
                        {c.ordersCount} টি
                      </td>
                      <td className="py-3 px-4 text-right font-black text-gray-900">
                        ৳{c.totalSpend.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(c.lastOrderDate).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isBlocked ? 'ব্লকড' : 'সক্রিয়'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleBlock(c.phone)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                            isBlocked
                              ? 'bg-emerald-100 text-[#1B5E20] hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {isBlocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
