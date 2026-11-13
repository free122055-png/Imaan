import React, { useState, useMemo } from 'react';
import {
  Package, Search, Eye, Printer, CheckCircle, Clock, Truck, Check, X,
  Download, Plus, Phone, AlertCircle, FileText, ArrowRight, MessageCircle,
  Copy, ExternalLink, RefreshCw, Filter, Trash2, Edit3, UserCheck, ShieldCheck,
  ChevronDown
} from 'lucide-react';
import {
  getOrders, updateOrderStatus, updateOrder, deleteOrder, createOrder,
  getProducts, getSettings, getCustomerOrderStats, migrateOrdersToUnifiedSnapshot
} from '../../services/storeService';
import { Order, OrderStatus, PaymentStatus, PaymentMethod, OrderItemSnapshot } from '../../types';
import { formatPrice, formatSize } from '../../utils/format';

interface AdminOrdersProps {
  selectedOrderId?: string;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ selectedOrderId }) => {
  const orders = getOrders();
  const products = getProducts();
  const settings = getSettings();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all'); // 'all' | 'today' | '7days' | '30days'

  // Selected Order for Details View
  const [activeOrder, setActiveOrder] = useState<Order | null>(
    selectedOrderId ? orders.find(o => o.id === selectedOrderId || o.orderNo === selectedOrderId) || null : null
  );

  // Status Change State in Details Modal
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Courier state in Details Modal
  const [courierName, setCourierName] = useState('Steadfast');
  const [trackingId, setTrackingId] = useState('');
  const [consignmentId, setConsignmentId] = useState('');

  // Order Edit Mode State
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editThana, setEditThana] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDeliveryCharge, setEditDeliveryCharge] = useState(60);
  const [editItems, setEditItems] = useState<OrderItemSnapshot[]>([]);
  const [editAddProductId, setEditAddProductId] = useState('');

  // Cancel order prompt
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Multi-select batch actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [batchStatus, setBatchStatus] = useState<OrderStatus>('confirmed');

  // Print Mode: null | 'a4' | 'thermal'
  const [printMode, setPrintMode] = useState<'a4' | 'thermal' | null>(null);

  // Manual Order Form Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualCustName, setManualCustName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAltPhone, setManualAltPhone] = useState('');
  const [manualDistrict, setManualDistrict] = useState('ঢাকা');
  const [manualThana, setManualThana] = useState('সদর');
  const [manualAddress, setManualAddress] = useState('');
  const [manualSelectedProd, setManualSelectedProd] = useState(products[0]?.id || '');
  const [manualVariantId, setManualVariantId] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualDeliveryCharge, setManualDeliveryCharge] = useState(settings.deliveryInsideDhaka);
  const [manualPaymentMethod, setManualPaymentMethod] = useState<PaymentMethod>('cod');
  const [manualPaymentStatus, setManualPaymentStatus] = useState<PaymentStatus>('pending');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Status Tab Counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      packing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };
    orders.forEach(o => {
      const s = o.status || o.orderStatus || 'pending';
      if (counts[s] !== undefined) counts[s]++;
      if (s === 'returned' || s === 'refunded') counts.returned++;
    });
    return counts;
  }, [orders]);

  // Filter orders by tab, search, & dropdown filters
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const s = o.status || o.orderStatus || 'pending';
      if (activeTab === 'returned') {
        if (s !== 'returned' && s !== 'refunded') return false;
      } else if (activeTab !== 'all' && s !== activeTab) {
        return false;
      }

      if (filterPaymentMethod !== 'all') {
        const pm = o.payment?.method || o.paymentMethod;
        if (pm !== filterPaymentMethod) return false;
      }

      if (filterPaymentStatus !== 'all') {
        const ps = o.payment?.status || o.paymentStatus;
        if (ps !== filterPaymentStatus) return false;
      }

      if (filterDistrict !== 'all') {
        const dist = o.address?.district || o.district;
        if (dist !== filterDistrict) return false;
      }

      if (filterDateRange !== 'all') {
        const orderDate = new Date(o.createdAt).getTime();
        const now = Date.now();
        if (filterDateRange === 'today') {
          const isToday = new Date(o.createdAt).toDateString() === new Date().toDateString();
          if (!isToday) return false;
        } else if (filterDateRange === '7days') {
          if (now - orderDate > 7 * 86400000) return false;
        } else if (filterDateRange === '30days') {
          if (now - orderDate > 30 * 86400000) return false;
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const orderNo = (o.orderNo || o.orderNumber || '').toLowerCase();
        const custName = (o.customer?.name || o.customerName || '').toLowerCase();
        const phone = (o.customer?.phone || o.phone || '').toLowerCase();
        const trx = (o.payment?.trxId || o.transactionId || '').toLowerCase();

        if (!orderNo.includes(q) && !custName.includes(q) && !phone.includes(q) && !trx.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, search, filterPaymentMethod, filterPaymentStatus, filterDistrict, filterDateRange]);

  const handleOpenDetails = (order: Order) => {
    setActiveOrder(order);
    setNewStatus((order.status || order.orderStatus) as OrderStatus);
    setAdminNote(order.adminNote || order.adminNotes || '');
    setStatusNote('');
    setCourierName(order.delivery?.courierName || 'Steadfast');
    setTrackingId(order.delivery?.trackingId || '');
    setConsignmentId(order.delivery?.consignmentId || '');
    setIsEditingOrder(false);
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const updated = updateOrderStatus(activeOrder.id, newStatus, statusNote.trim() || undefined, 'Admin');
    if (updated) {
      if (adminNote !== updated.adminNote) {
        updated.adminNote = adminNote;
        updated.adminNotes = adminNote;
        updateOrder(updated);
      }
      setActiveOrder(updated);
      setStatusNote('');
      showToast('অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।');
    }
  };

  const handleSaveCourierInfo = () => {
    if (!activeOrder) return;
    const trackingUrl = courierName === 'Steadfast'
      ? `https://steadfast.com.bd/tracking/${trackingId}`
      : courierName === 'Pathao'
      ? `https://merchant.pathao.com/tracking?consignment_id=${consignmentId || trackingId}`
      : courierName === 'RedX'
      ? `https://redx.com.bd/track/${trackingId}`
      : '';

    const updated = {
      ...activeOrder,
      delivery: {
        ...activeOrder.delivery,
        courierName,
        trackingId,
        consignmentId,
        trackingUrl,
      }
    };
    updateOrder(updated);
    setActiveOrder(updated);
    showToast('কুরিয়ার ট্র্যাকিং তথ্য সংরক্ষিত হয়েছে এবং ক্রেতা ট্র্যাকিং পেজে আপডেট হয়েছে।');
  };

  const handlePaymentToggle = (markPaid: boolean) => {
    if (!activeOrder) return;
    const newStatus: PaymentStatus = markPaid ? 'paid' : 'unpaid';
    const updated = {
      ...activeOrder,
      payment: {
        ...activeOrder.payment,
        status: newStatus,
        paidAmount: markPaid ? (activeOrder.pricing?.total || activeOrder.total) : 0,
        verifiedBy: 'Admin',
        verifiedAt: new Date().toISOString(),
      },
      paymentStatus: newStatus,
    };
    updateOrder(updated);
    setActiveOrder(updated);
    showToast(markPaid ? 'পেমেন্ট পেইড মার্ক করা হয়েছে।' : 'পেমেন্ট আনপেইড মার্ক করা হয়েছে।');
  };

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('ডেলিভারি ঠিকানা ক্লিপবোর্ডে কপি হয়েছে!');
  };

  const handleCancelOrderSubmit = () => {
    if (!activeOrder) return;
    const note = cancelReason.trim() ? `বাতিলের কারণ: ${cancelReason}` : 'অর্ডার বাতিল করা হয়েছে';
    const updated = updateOrderStatus(activeOrder.id, 'cancelled', note, 'Admin');
    if (updated) {
      setActiveOrder(updated);
      setCancelModalOpen(false);
      setCancelReason('');
      showToast('অর্ডার বাতিল করা হয়েছে ও স্টক রিস্টোর হয়েছে।');
    }
  };

  const handleDuplicateOrder = (order: Order) => {
    const duplicated = createOrder({
      source: 'web',
      customer: order.customer,
      address: order.address,
      items: order.items,
      pricing: order.pricing,
      payment: { ...order.payment, status: 'unpaid', trxId: undefined },
      status: 'pending',
      adminNote: `ডুপ্লিকেট অর্ডার (মূল অর্ডার: ${order.orderNo || order.orderNumber})`,
      subtotal: order.pricing?.subtotal || order.subtotal || 0,
      deliveryCharge: order.pricing?.deliveryCharge || order.deliveryCharge || 0,
      total: order.pricing?.total || order.total || 0,
      paymentMethod: order.payment?.method || order.paymentMethod || 'cod',
    });
    showToast(`নতুন ডুপ্লিকেট অর্ডার #${duplicated.orderNo} তৈরি হয়েছে।`);
    setActiveOrder(duplicated);
  };

  const handleDelete = (id: string, num: string) => {
    if (window.confirm(`অর্ডার ${num} ডিলিট করতে চান?`)) {
      deleteOrder(id);
      setActiveOrder(null);
      showToast('অর্ডার মুছে ফেলা হয়েছে।');
    }
  };

  const handlePrint = (mode: 'a4' | 'thermal') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Start editing active order
  const handleStartEdit = () => {
    if (!activeOrder) return;
    setEditCustomerName(activeOrder.customer?.name || activeOrder.customerName || '');
    setEditPhone(activeOrder.customer?.phone || activeOrder.phone || '');
    setEditDistrict(activeOrder.address?.district || activeOrder.district || '');
    setEditThana(activeOrder.address?.thana || activeOrder.thana || '');
    setEditAddress(activeOrder.address?.fullAddress || activeOrder.fullAddress || '');
    setEditDeliveryCharge(activeOrder.pricing?.deliveryCharge || activeOrder.deliveryCharge || 60);
    setEditItems([...activeOrder.items]);
    setIsEditingOrder(true);
  };

  const handleSaveEditOrder = () => {
    if (!activeOrder) return;
    const subtotal = editItems.reduce((sum, it) => sum + it.lineTotal, 0);
    const discount = activeOrder.pricing?.promo?.discountAmount || activeOrder.discount || 0;
    const total = Math.max(0, subtotal + editDeliveryCharge - discount);

    const updated: Order = {
      ...activeOrder,
      customer: {
        ...activeOrder.customer,
        name: editCustomerName.trim(),
        phone: editPhone.trim(),
      },
      address: {
        ...activeOrder.address,
        district: editDistrict,
        thana: editThana,
        fullAddress: editAddress.trim(),
      },
      items: editItems,
      pricing: {
        ...activeOrder.pricing,
        subtotal,
        deliveryCharge: editDeliveryCharge,
        total,
      },
      subtotal,
      deliveryCharge: editDeliveryCharge,
      total,
      customerName: editCustomerName.trim(),
      phone: editPhone.trim(),
      district: editDistrict,
      thana: editThana,
      fullAddress: editAddress.trim(),
    };

    updateOrder(updated);
    setActiveOrder(updated);
    setIsEditingOrder(false);
    showToast('অর্ডারের তথ্য সফলভাবে এডিট ও রিক্যালকুলেট হয়েছে!');
  };

  const handleAddEditItem = () => {
    if (!editAddProductId) return;
    const prod = products.find(p => p.id === editAddProductId);
    if (!prod) return;
    const variant = prod.variants[0];

    const newItem: OrderItemSnapshot = {
      productId: prod.id,
      variantId: variant.id,
      name: prod.nameBn,
      sizeLabel: variant.size,
      sku: variant.sku || prod.sku,
      image: prod.images[0] || '',
      unitPrice: variant.price,
      oldPrice: variant.oldPrice,
      qty: 1,
      lineTotal: variant.price,
      productName: prod.nameBn,
      productImage: prod.images[0],
      variantSize: variant.size,
      price: variant.price,
      quantity: 1,
      total: variant.price,
    };

    setEditItems([...editItems, newItem]);
    setEditAddProductId('');
  };

  // Run database migration
  const handleRunMigration = () => {
    const res = migrateOrdersToUnifiedSnapshot();
    showToast(`মাইগ্রেশন সম্পন্ন! ${res.migratedCount}টি অর্ডার স্ন্যাপশটে আপডেট হয়েছে (মোট ${res.totalCount}টি)।`);
  };

  // Batch actions
  const handleBatchStatusChange = () => {
    if (selectedOrderIds.length === 0) return;
    selectedOrderIds.forEach(id => {
      updateOrderStatus(id, batchStatus, 'ব্যাচ স্ট্যাটাস আপডেট', 'Admin');
    });
    showToast(`${selectedOrderIds.length}টি অর্ডারের স্ট্যাটাস পরিবর্তিত হয়েছে।`);
    setSelectedOrderIds([]);
  };

  // Export CSV
  const handleExportCSV = (ordersToExport = filteredOrders) => {
    const headers = 'OrderNo,Date,CustomerName,Phone,District,Thana,Items,Total,PaymentMethod,PaymentStatus,Status,Courier,TrackingID\n';
    const rows = ordersToExport.map(o => {
      const itemsSummary = o.items.map(it => `${it.name} (${it.sizeLabel}) x${it.qty}`).join('; ');
      return `"${o.orderNo || o.orderNumber}","${new Date(o.createdAt).toLocaleDateString('en-GB')}","${o.customer?.name || o.customerName}","${o.customer?.phone || o.phone}","${o.address?.district || o.district}","${o.address?.thana || o.thana}","${itemsSummary}","${o.pricing?.total || o.total}","${o.payment?.method || o.paymentMethod}","${o.payment?.status || o.paymentStatus}","${o.status || o.orderStatus}","${o.delivery?.courierName || ''}","${o.delivery?.trackingId || ''}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aiman-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('CSV ফাইল সফলভাবে এক্সপোর্ট হয়েছে!');
  };

  // Handle Manual Order Submission (Phone / WhatsApp order)
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustName.trim() || !manualPhone.trim() || !manualAddress.trim()) return;

    const prod = products.find(p => p.id === manualSelectedProd) || products[0];
    const variant = prod.variants.find(v => v.id === manualVariantId) || prod.variants[0];

    const lineTotal = variant.price * manualQty;
    const subtotal = lineTotal;
    const total = subtotal + manualDeliveryCharge;

    const newOrd = createOrder({
      source: 'manual-phone',
      customer: {
        name: manualCustName.trim(),
        phone: manualPhone.trim(),
        altPhone: manualAltPhone.trim() || undefined,
      },
      address: {
        district: manualDistrict,
        thana: manualThana,
        fullAddress: manualAddress.trim(),
      },
      items: [
        {
          productId: prod.id,
          variantId: variant.id,
          name: prod.nameBn,
          sizeLabel: variant.size,
          sku: variant.sku || prod.sku,
          image: prod.images[0] || '',
          unitPrice: variant.price,
          qty: manualQty,
          lineTotal,
        }
      ],
      pricing: {
        subtotal,
        deliveryCharge: manualDeliveryCharge,
        total,
      },
      payment: {
        method: manualPaymentMethod,
        status: manualPaymentStatus,
        paidAmount: manualPaymentStatus === 'paid' ? total : 0,
      },
      status: 'confirmed',
      adminNote: 'ফোন কলের মাধ্যমে ম্যানুয়ালি এন্ট্রি করা অর্ডার',
      subtotal,
      deliveryCharge: manualDeliveryCharge,
      total,
      paymentMethod: manualPaymentMethod,
    });

    setManualModalOpen(false);
    setActiveOrder(newOrd);
    showToast(`ম্যানুয়াল অর্ডার #${newOrd.orderNo} সফলভাবে তৈরি হয়েছে!`);
  };

  // Helper for item summary string
  const getItemSummary = (items: OrderItemSnapshot[]) => {
    return items.map(it => `${it.name} (${it.sizeLabel}) × ${it.qty}`).join(' + ');
  };

  const customerStats = useMemo(() => {
    if (!activeOrder) return null;
    return getCustomerOrderStats(activeOrder.customer?.phone || activeOrder.phone || '');
  }, [activeOrder]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-[#1B4D2B] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#FAF7F0]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ECE8DF]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            অর্ডার ব্যবস্থাপনা (Order Management)
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            মোট {orders.length} টি অর্ডার রেকর্ড আছে • স্ন্যাপশট ডেটা সংরক্ষিত
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunMigration}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF7F0] text-[#1B4D2B] border border-[#ECE8DF] hover:bg-[#1B4D2B] hover:text-white rounded-xl text-xs font-medium transition"
            title="পুরনো অর্ডারে স্ন্যাপশট ফিল্ড সম্পূর্ণ করুন"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>স্ন্যাপশট মাইগ্রেশন</span>
          </button>

          <button
            onClick={() => handleExportCSV()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#111827] border border-[#ECE8DF] hover:bg-gray-50 rounded-xl text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>

          <button
            onClick={() => {
              setManualCustName('');
              setManualPhone('');
              setManualAddress('');
              setManualQty(1);
              setManualModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1B4D2B] hover:bg-[#153D22] text-white rounded-xl text-xs font-medium shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ম্যানুয়াল অর্ডার</span>
          </button>
        </div>
      </div>

      {/* Status Tabs with Counts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-xl border border-[#ECE8DF]">
        {[
          { key: 'all', label: 'সব অর্ডার', count: tabCounts.all },
          { key: 'pending', label: 'নতুন', count: tabCounts.pending },
          { key: 'confirmed', label: 'কনফার্মড', count: tabCounts.confirmed },
          { key: 'packing', label: 'প্যাকিং', count: tabCounts.packing },
          { key: 'shipped', label: 'শিপড', count: tabCounts.shipped },
          { key: 'delivered', label: 'ডেলিভারড', count: tabCounts.delivered },
          { key: 'cancelled', label: 'ক্যান্সেলড', count: tabCounts.cancelled },
          { key: 'returned', label: 'রিটার্ন/রিফান্ড', count: tabCounts.returned },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-[#1B4D2B] text-white font-semibold'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF7F0]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#ECE8DF] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="অর্ডার নম্বর / নাম / ফোন / TrxID খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#ECE8DF] rounded-lg bg-[#FAF7F0]/40 text-[#111827] focus:outline-hidden focus:border-[#1B4D2B]"
            />
          </div>

          {/* Payment Method filter */}
          <div>
            <select
              value={filterPaymentMethod}
              onChange={e => setFilterPaymentMethod(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-[#ECE8DF] rounded-lg bg-white text-[#111827] focus:outline-hidden"
            >
              <option value="all">পেমেন্ট মেথড: সকল</option>
              <option value="cod">ক্যাশ অন ডেলিভারি (COD)</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="nagad">নগদ (Nagad)</option>
              <option value="rocket">রকেট (Rocket)</option>
            </select>
          </div>

          {/* Payment Status filter */}
          <div>
            <select
              value={filterPaymentStatus}
              onChange={e => setFilterPaymentStatus(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-[#ECE8DF] rounded-lg bg-white text-[#111827] focus:outline-hidden"
            >
              <option value="all">পেমেন্ট স্ট্যাটাস: সকল</option>
              <option value="paid">পরিশোধিত (Paid)</option>
              <option value="unpaid">বাকি (Unpaid / COD)</option>
              <option value="pending-verification">যাচাইয়ের অপেক্ষায়</option>
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <select
              value={filterDateRange}
              onChange={e => setFilterDateRange(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-[#ECE8DF] rounded-lg bg-white text-[#111827] focus:outline-hidden"
            >
              <option value="all">তারিখ: সকল সময়</option>
              <option value="today">আজকের অর্ডার</option>
              <option value="7days">গত ৭ দিন</option>
              <option value="30days">গত ৩০ দিন</option>
            </select>
          </div>
        </div>

        {/* Batch actions bar if multiple selected */}
        {selectedOrderIds.length > 0 && (
          <div className="pt-2 border-t border-[#ECE8DF] flex items-center justify-between flex-wrap gap-2 text-xs bg-[#FAF7F0] p-2.5 rounded-lg">
            <span className="font-semibold text-[#1B4D2B]">
              {selectedOrderIds.length}টি অর্ডার সিলেক্ট করা হয়েছে
            </span>
            <div className="flex items-center gap-2">
              <select
                value={batchStatus}
                onChange={e => setBatchStatus(e.target.value as OrderStatus)}
                className="py-1 px-2 border border-[#ECE8DF] rounded bg-white text-xs"
              >
                <option value="confirmed">কনফার্মড করুন</option>
                <option value="packing">প্যাকিং করুন</option>
                <option value="shipped">শিপড করুন</option>
                <option value="delivered">ডেলিভারড করুন</option>
                <option value="cancelled">ক্যান্সেল করুন</option>
              </select>
              <button
                onClick={handleBatchStatusChange}
                className="px-3 py-1 bg-[#1B4D2B] text-white rounded font-medium hover:bg-[#153D22]"
              >
                স্ট্যাটাস পরিবর্তন
              </button>
              <button
                onClick={() => {
                  const toPrint = orders.filter(o => selectedOrderIds.includes(o.id));
                  handleExportCSV(toPrint);
                }}
                className="px-3 py-1 bg-white border border-[#ECE8DF] rounded font-medium hover:bg-gray-50"
              >
                এক্সপোর্ট করুন
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="text-gray-500 hover:text-gray-800"
              >
                বাতিল
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2.1 Mobile View: Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-[#6B7280] bg-white rounded-xl border border-[#ECE8DF] text-xs">
            কোনো অর্ডার পাওয়া যায়নি।
          </div>
        ) : (
          filteredOrders.map(order => {
            const customer = order.customer || { name: order.customerName, phone: order.phone };
            const address = order.address || { district: order.district, thana: order.thana };
            const pricing = order.pricing || { total: order.total };
            const status = order.status || order.orderStatus || 'pending';
            const payment = order.payment || { method: order.paymentMethod, status: order.paymentStatus };

            const isChecked = selectedOrderIds.includes(order.id);
            const waMsg = `আসসালামু আলাইকুম ${customer.name}! আইমান ব্রান্ডে আপনার অর্ডার #${order.orderNo || order.orderNumber} এর ব্যাপারে যোগাযোগ করছি।`;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#ECE8DF] p-3.5 space-y-2.5 shadow-2xs"
              >
                {/* Header row: Order No, Date, Status */}
                <div className="flex items-center justify-between border-b border-[#ECE8DF] pb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                        else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                      }}
                      className="rounded border-gray-300 accent-[#1B4D2B]"
                    />
                    <span className="font-bold text-xs text-[#1B4D2B]">
                      {order.orderNo || order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      status === 'delivered'
                        ? 'bg-emerald-100 text-[#1B4D2B]'
                        : status === 'cancelled'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Customer name, phone, district */}
                <div className="flex items-start justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#111827]">{customer.name}</div>
                    <div className="text-[#6B7280]">{customer.phone}</div>
                    <div className="text-[11px] text-gray-500">{address.thana}, {address.district}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#1B4D2B]">
                      {formatPrice(pricing.total)}
                    </div>
                    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      payment.status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {String(payment.method).toUpperCase()} ({payment.status === 'paid' ? 'Paid' : 'Unpaid'})
                    </span>
                  </div>
                </div>

                {/* Product Summary */}
                <div className="text-[11px] text-[#4B5563] bg-[#FAF7F0] p-2 rounded-lg border border-[#ECE8DF]/60 line-clamp-2">
                  <strong>পণ্য:</strong> {getItemSummary(order.items)}
                </div>

                {/* Quick Action buttons */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${customer.phone}`}
                      className="p-1.5 rounded-lg border border-[#ECE8DF] text-gray-700 hover:text-[#1B4D2B] bg-white"
                      title="কল করুন"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/88${customer.phone}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                      title="হোয়াটসঅ্যাপে নক দিন"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleOpenDetails(order)}
                    className="flex-1 max-w-[150px] py-1.5 bg-[#1B4D2B] text-white rounded-lg text-xs font-semibold hover:bg-[#153D22] text-center"
                  >
                    বিস্তারিত ও ইনভয়েস
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2.1 Desktop View: Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#ECE8DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F0] text-[#111827] font-semibold border-b border-[#ECE8DF]">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={e => {
                      if (e.target.checked) setSelectedOrderIds(filteredOrders.map(o => o.id));
                      else setSelectedOrderIds([]);
                    }}
                    className="rounded border-gray-300 accent-[#1B4D2B]"
                  />
                </th>
                <th className="py-3 px-3">অর্ডার নং</th>
                <th className="py-3 px-3">তারিখ</th>
                <th className="py-3 px-3">ক্রেতা ও মোবাইল</th>
                <th className="py-3 px-3">জেলা</th>
                <th className="py-3 px-3">পণ্য ও সাইজ সারাংশ</th>
                <th className="py-3 px-3">মোট (৳)</th>
                <th className="py-3 px-3">পেমেন্ট</th>
                <th className="py-3 px-3">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8DF]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const customer = order.customer || { name: order.customerName, phone: order.phone };
                  const address = order.address || { district: order.district, thana: order.thana };
                  const pricing = order.pricing || { total: order.total };
                  const status = order.status || order.orderStatus || 'pending';
                  const payment = order.payment || { method: order.paymentMethod, status: order.paymentStatus };
                  const isChecked = selectedOrderIds.includes(order.id);

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF7F0]/40 transition">
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                            else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                          }}
                          className="rounded border-gray-300 accent-[#1B4D2B]"
                        />
                      </td>
                      <td className="py-3 px-3 font-bold text-[#1B4D2B] whitespace-nowrap">
                        {order.orderNo || order.orderNumber}
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-gray-500 font-mono text-[11px]">{customer.phone}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {address.district}
                      </td>
                      <td className="py-3 px-3 text-gray-700 max-w-xs truncate" title={getItemSummary(order.items)}>
                        {getItemSummary(order.items)}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#111827] whitespace-nowrap">
                        {formatPrice(pricing.total)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          payment.status === 'paid'
                            ? 'bg-emerald-100 text-[#1B4D2B]'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {String(payment.method).toUpperCase()} ({payment.status === 'paid' ? 'Paid' : 'Unpaid'})
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          status === 'delivered'
                            ? 'bg-emerald-100 text-[#1B4D2B]'
                            : status === 'cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="bg-[#1B4D2B] text-white hover:bg-[#153D22] px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-2xs"
                        >
                          বিস্তারিত ও ইনভয়েস
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

      {/* 2.2 ORDER DETAILS MODAL (Full 9-Part Specification) */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* 1. Header: Order Number, Date, Status, Print Buttons */}
            <div className="p-4 sm:p-5 border-b border-[#ECE8DF] flex items-center justify-between sticky top-0 bg-white z-10 no-print">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base sm:text-lg text-[#1B4D2B]">
                  অর্ডার: {activeOrder.orderNo || activeOrder.orderNumber}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  (activeOrder.status || activeOrder.orderStatus) === 'delivered'
                    ? 'bg-emerald-100 text-[#1B4D2B]'
                    : (activeOrder.status || activeOrder.orderStatus) === 'cancelled'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {activeOrder.status || activeOrder.orderStatus}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint('a4')}
                  className="flex items-center gap-1.5 bg-[#FAF7F0] hover:bg-[#ECE8DF] text-[#111827] px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  title="A4 ইনভয়েস প্রিন্ট"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>A4 ইনভয়েস</span>
                </button>
                <button
                  onClick={() => handlePrint('thermal')}
                  className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  title="৮০মিমি থার্মাল স্লিপ"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>থার্মাল স্লিপ</span>
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 flex-1 text-xs sm:text-sm">
              {/* PRINTABLE A4 & THERMAL INVOICE TEMPLATE (Shown during print) */}
              <div id="printable-invoice" className="border border-[#ECE8DF] rounded-xl p-6 bg-white space-y-4">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#1B4D2B]">{settings.siteName || 'আইমান ব্রান্ড'}</h2>
                    <div className="text-xs text-gray-600">খাঁটি ও প্রাকৃতিক তেলের বিশ্বস্ত ঠিকানা</div>
                    <div className="text-xs text-gray-600 mt-0.5">{settings.address}</div>
                    <div className="text-xs text-gray-600">ফোন: {settings.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-900">ইনভয়েস / ক্যাশ মেমো</div>
                    <div className="text-xs text-gray-700 font-mono mt-0.5">নং: {activeOrder.orderNo || activeOrder.orderNumber}</div>
                    <div className="text-xs text-gray-500">তারিখ: {new Date(activeOrder.createdAt).toLocaleDateString('en-GB')}</div>
                  </div>
                </div>

                {/* 2 & 3. Customer Info & Delivery Address Box */}
                <div className="grid grid-cols-2 gap-4 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#ECE8DF]">
                  <div>
                    <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">ক্রেতার বিবরণ:</div>
                    <div className="font-bold text-sm text-[#111827]">{activeOrder.customer?.name || activeOrder.customerName}</div>
                    <div className="text-gray-700">মোবাইল: {activeOrder.customer?.phone || activeOrder.phone}</div>
                    {activeOrder.customer?.altPhone && (
                      <div className="text-gray-500">বিকল্প ফোন: {activeOrder.customer.altPhone}</div>
                    )}
                    {activeOrder.customer?.email && (
                      <div className="text-gray-500">ইমেইল: {activeOrder.customer.email}</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">ডেলিভারি ঠিকানা:</div>
                    <div className="text-[#111827] leading-relaxed">{activeOrder.address?.fullAddress || activeOrder.fullAddress}</div>
                    <div className="text-gray-600 font-medium">
                      থানা: {activeOrder.address?.thana || activeOrder.thana}, জেলা: {activeOrder.address?.district || activeOrder.district}
                    </div>
                    {activeOrder.address?.deliveryNote && (
                      <div className="text-amber-800 text-xs mt-1">নোট: {activeOrder.address.deliveryNote}</div>
                    )}
                  </div>
                </div>

                {/* 4. Products Table (With sizeLabel, SKU, Qty, UnitPrice, LineTotal) */}
                <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-3">পণ্য</th>
                      <th className="py-2 px-3">সাইজ / ওজন</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3 text-right">একক মূল্য</th>
                      <th className="py-2 px-3 text-center">পরিমাণ</th>
                      <th className="py-2 px-3 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-medium text-gray-900">{it.name || it.productName}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1B4D2B]">{formatSize(it.sizeLabel || it.variantSize || '')}</td>
                        <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">{it.sku || '-'}</td>
                        <td className="py-2.5 px-3 text-right">{formatPrice(it.unitPrice || it.price || 0)}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{it.qty || it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          {formatPrice(it.lineTotal || it.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotal, Delivery Charge, Discount, Total */}
                <div className="flex justify-end pt-2 text-xs">
                  <div className="w-64 space-y-1.5">
                    <div className="flex justify-between text-gray-600">
                      <span>সাবটোটাল:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(activeOrder.pricing?.subtotal || activeOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(activeOrder.pricing?.deliveryCharge || activeOrder.deliveryCharge)}</span>
                    </div>
                    {((activeOrder.pricing?.promo?.discountAmount || activeOrder.discount) > 0) && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>প্রোমো ছাড় ({activeOrder.pricing?.promo?.code || activeOrder.couponCode}):</span>
                        <span>-{formatPrice(activeOrder.pricing?.promo?.discountAmount || activeOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#1B4D2B] pt-1.5 border-t border-gray-200">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span>{formatPrice(activeOrder.pricing?.total || activeOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Payment details on invoice */}
                <div className="pt-2 text-xs text-gray-600 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <div>
                    পেমেন্ট: <strong>{String(activeOrder.payment?.method || activeOrder.paymentMethod).toUpperCase()}</strong> ({activeOrder.payment?.status === 'paid' ? 'পরিশোধিত' : 'ক্যাশ অন ডেলিভারি'})
                    {activeOrder.payment?.trxId && <span> • TrxID: {activeOrder.payment.trxId}</span>}
                  </div>
                  <div>আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!</div>
                </div>
              </div>

              {/* NON-PRINTABLE ADMIN CONTROLS SECTION */}
              <div className="no-print space-y-5 pt-2">
                {/* 2. Customer Insights & Quick Contact Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF7F0] p-4 rounded-xl border border-[#ECE8DF]">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase font-semibold">ক্রেতার তথ্য</div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">{activeOrder.customer?.name || activeOrder.customerName}</div>
                    <div className="text-xs text-gray-600">{activeOrder.customer?.phone || activeOrder.phone}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={`tel:${activeOrder.customer?.phone || activeOrder.phone}`}
                        className="px-2.5 py-1 bg-white border border-[#ECE8DF] hover:border-[#1B4D2B] rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-[#1B4D2B]" /> কল করুন
                      </a>
                      <a
                        href={`https://wa.me/88${activeOrder.customer?.phone || activeOrder.phone}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${activeOrder.customer?.name || activeOrder.customerName}! আইমান ব্রান্ড থেকে আপনার অর্ডার #${activeOrder.orderNo || activeOrder.orderNumber} এর বিষয়ে যোগাযোগ করছি।`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> হোয়াটসঅ্যাপ
                      </a>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500 uppercase font-semibold">ক্রেতার হিস্ট্রি</div>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-700">
                      <div>মোট অর্ডার: <strong>{customerStats?.totalOrders || 1} টি</strong></div>
                      <div>মোট কেনাকাটা: <strong>{formatPrice(customerStats?.totalSpent || (activeOrder.pricing?.total || activeOrder.total))}</strong></div>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        customerStats?.isReturning ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-800'
                      }`}>
                        {customerStats?.isReturning ? '★ পুরাতন নিয়মিত ক্রেতা' : 'নতুন প্রথম ক্রেতা'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500 uppercase font-semibold">ডেলিভারি ঠিকানা ও ম্যাপ</div>
                    <div className="text-xs text-gray-800 mt-1 line-clamp-2">
                      {activeOrder.address?.fullAddress || activeOrder.fullAddress}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleCopyAddress(`${activeOrder.customer?.name || activeOrder.customerName}, ফোন: ${activeOrder.customer?.phone || activeOrder.phone}, ঠিকানা: ${activeOrder.address?.fullAddress || activeOrder.fullAddress}, ${activeOrder.address?.thana || activeOrder.thana}, ${activeOrder.address?.district || activeOrder.district}`)}
                        className="px-2.5 py-1 bg-white border border-[#ECE8DF] hover:bg-gray-50 rounded-lg text-xs text-gray-700 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> ঠিকানা কপি
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeOrder.address?.fullAddress || activeOrder.fullAddress}, ${activeOrder.address?.thana || activeOrder.thana}, ${activeOrder.address?.district || activeOrder.district}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white border border-[#ECE8DF] hover:bg-gray-50 rounded-lg text-xs text-gray-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> ম্যাপে দেখুন
                      </a>
                    </div>
                  </div>
                </div>

                {/* 5. Payment Management Strip */}
                <div className="p-4 rounded-xl border border-[#ECE8DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500 font-semibold">পেমেন্ট মেথড ও স্ট্যাটাস:</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm text-gray-900 uppercase">
                        {String(activeOrder.payment?.method || activeOrder.paymentMethod)}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        (activeOrder.payment?.status || activeOrder.paymentStatus) === 'paid'
                          ? 'bg-emerald-100 text-[#1B5E20]'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {(activeOrder.payment?.status || activeOrder.paymentStatus) === 'paid' ? 'পরিশোধিত (PAID)' : 'বাকি (UNPAID / COD)'}
                      </span>
                    </div>
                    {activeOrder.payment?.trxId && (
                      <div className="text-xs text-gray-600 mt-0.5">TrxID: <span className="font-mono font-semibold">{activeOrder.payment.trxId}</span> • প্রেরক: {activeOrder.payment.senderNumber}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePaymentToggle(true)}
                      className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-xs font-semibold"
                    >
                      পেমেন্ট যাচাই করে পেইড মার্ক করুন
                    </button>
                    <button
                      onClick={() => handlePaymentToggle(false)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold"
                    >
                      অযাচাইকৃত / বাকি
                    </button>
                  </div>
                </div>

                {/* 7. Courier Info Management */}
                <div className="p-4 rounded-xl border border-[#ECE8DF] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#1B4D2B]" />
                      <span>কুরিয়ার ও লাইভ ট্র্যাকিং তথ্য</span>
                    </h4>
                    {activeOrder.delivery?.trackingUrl && (
                      <a
                        href={activeOrder.delivery.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#1B4D2B] underline flex items-center gap-1"
                      >
                        লাইভ ট্র্যাক করুন <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">কুরিয়ার সার্ভিস:</label>
                      <select
                        value={courierName}
                        onChange={e => setCourierName(e.target.value)}
                        className="w-full p-2 border border-[#ECE8DF] rounded-lg text-xs bg-white"
                      >
                        <option value="Steadfast">Steadfast Courier</option>
                        <option value="Pathao">Pathao Courier</option>
                        <option value="RedX">RedX Delivery</option>
                        <option value="সুন্দরবন">সুন্দরবন কুরিয়ার</option>
                        <option value="এসএ পরিবহন">এসএ পরিবহন</option>
                        <option value="নিজস্ব ডেলিভারি">নিজস্ব ডেলিভারি প্রতিনিধি</option>
                        <option value="অন্যান্য">অন্যান্য</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">ট্র্যাকিং নম্বর (Tracking ID):</label>
                      <input
                        type="text"
                        placeholder="যেমন: STF-982341"
                        value={trackingId}
                        onChange={e => setTrackingId(e.target.value)}
                        className="w-full p-2 border border-[#ECE8DF] rounded-lg text-xs bg-white font-mono"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">কনসাইনমেন্ট আইডি / ইনভয়েস আইডি:</label>
                      <input
                        type="text"
                        placeholder="ঐচ্ছিক কনসাইনমেন্ট আইডি"
                        value={consignmentId}
                        onChange={e => setConsignmentId(e.target.value)}
                        className="w-full p-2 border border-[#ECE8DF] rounded-lg text-xs bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveCourierInfo}
                      className="px-4 py-1.5 bg-[#1B4D2B] text-white rounded-lg text-xs font-semibold hover:bg-[#153D22]"
                    >
                      কুরিয়ার ট্র্যাকিং সেভ করুন
                    </button>
                  </div>
                </div>

                {/* 6. Status Change & Timeline */}
                <div className="p-4 rounded-xl border border-[#ECE8DF] bg-white space-y-3">
                  <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#1B4D2B]" />
                    <span>অর্ডার স্ট্যাটাস আপডেট ও টাইমলাইন</span>
                  </h4>

                  <form onSubmit={handleStatusUpdate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">নতুন স্ট্যাটাস:</label>
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value as OrderStatus)}
                        className="w-full p-2 border border-[#ECE8DF] rounded-lg text-xs font-semibold bg-white text-[#1B4D2B]"
                      >
                        <option value="pending">পেন্ডিং (Pending)</option>
                        <option value="confirmed">কনফার্মড (Confirmed)</option>
                        <option value="packing">প্যাকিং (Packing)</option>
                        <option value="shipped">শিপড (Shipped)</option>
                        <option value="delivered">ডেলিভারড (Delivered)</option>
                        <option value="cancelled">ক্যান্সেলড (Cancelled)</option>
                        <option value="returned">রিটার্ন (Returned)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-5">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">স্ট্যাটাস নোট:</label>
                      <input
                        type="text"
                        placeholder="যেমন: ফোনে নিশ্চিত করা হয়েছে"
                        value={statusNote}
                        onChange={e => setStatusNote(e.target.value)}
                        className="w-full p-2 border border-[#ECE8DF] rounded-lg text-xs bg-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="w-full p-2 bg-[#1B4D2B] text-white font-semibold rounded-lg text-xs hover:bg-[#153D22]"
                      >
                        স্ট্যাটাস সেভ করুন
                      </button>
                    </div>
                  </form>

                  {/* Timeline */}
                  {activeOrder.statusHistory && activeOrder.statusHistory.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="text-[11px] font-semibold text-gray-500">স্ট্যাটাস ইতিহাস:</div>
                      <div className="space-y-1.5">
                        {activeOrder.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#FAF7F0] rounded-lg">
                            <span className="font-semibold text-gray-800">{h.status.toUpperCase()} — {h.note}</span>
                            <span className="text-[10px] text-gray-500">{new Date(h.time || h.updatedAt || '').toLocaleString('en-GB')} ({h.by || h.updatedBy})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 8 & 9. Notes & Action Buttons (Edit Order / Duplicate / Cancel) */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#ECE8DF]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 bg-white border border-[#ECE8DF] hover:bg-gray-50 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#1B4D2B]" /> অর্ডার এডিট করুন
                    </button>
                    <button
                      onClick={() => handleDuplicateOrder(activeOrder)}
                      className="px-3 py-1.5 bg-white border border-[#ECE8DF] hover:bg-gray-50 text-gray-800 rounded-lg text-xs font-semibold"
                    >
                      ডুপ্লিকেট করুন
                    </button>
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                    >
                      অর্ডার বাতিল
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(activeOrder.id, activeOrder.orderNo || activeOrder.orderNumber)}
                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> অর্ডার ডিলিট
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL WITH REASON */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-rose-700">অর্ডার বাতিল নিশ্চিত করুন</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              অর্ডারটি বাতিল করলে সংরক্ষিত স্টক স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে ফেরত যাবে।
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">বাতিলের কারণ:</label>
              <textarea
                rows={2}
                placeholder="যেমন: ক্রেতা ফোন ধরেননি / ক্রেতা অনুরোধ করেছেন..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-gray-300 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleCancelOrderSubmit}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL (Add/Remove items, change delivery charge, address) */}
      {isEditingOrder && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#1B4D2B]">অর্ডার এডিট করুন (#{activeOrder.orderNo || activeOrder.orderNumber})</h3>
              <button onClick={() => setIsEditingOrder(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">ক্রেতার নাম:</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={e => setEditCustomerName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">মোবাইল:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">জেলা:</label>
                <input
                  type="text"
                  value={editDistrict}
                  onChange={e => setEditDistrict(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">থানা:</label>
                <input
                  type="text"
                  value={editThana}
                  onChange={e => setEditThana(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="font-semibold block mb-1">পূর্ণ ঠিকানা:</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">ডেলিভারি চার্জ (৳):</label>
                <input
                  type="number"
                  value={editDeliveryCharge}
                  onChange={e => setEditDeliveryCharge(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Edit Items list */}
            <div className="border-t pt-3 space-y-2">
              <div className="font-semibold text-xs text-gray-800">অর্ডারের পণ্যসমূহ:</div>
              <div className="space-y-2">
                {editItems.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{it.name}</div>
                      <div className="text-gray-500">{it.sizeLabel} • ৳{it.unitPrice}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={e => {
                          const val = Math.max(1, Number(e.target.value));
                          const updated = [...editItems];
                          updated[idx] = { ...updated[idx], qty: val, lineTotal: updated[idx].unitPrice * val };
                          setEditItems(updated);
                        }}
                        className="w-16 p-1 border rounded text-center"
                      />
                      <span className="font-bold w-16 text-right">৳{it.lineTotal}</span>
                      <button
                        onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new item */}
              <div className="flex items-center gap-2 pt-2">
                <select
                  value={editAddProductId}
                  onChange={e => setEditAddProductId(e.target.value)}
                  className="flex-1 p-2 border rounded-lg text-xs"
                >
                  <option value="">ইনভেন্টরি থেকে পণ্য যোগ করুন...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nameBn} ({p.variants[0]?.size} - ৳{p.variants[0]?.price})</option>
                  ))}
                </select>
                <button
                  onClick={handleAddEditItem}
                  disabled={!editAddProductId}
                  className="px-3 py-2 bg-[#1B5E20] text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  যোগ করুন
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsEditingOrder(false)}
                className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEditOrder}
                className="px-5 py-2 bg-[#1B4D2B] text-white rounded-xl text-xs font-bold hover:bg-[#153D22]"
              >
                এডিট সংরক্ষণ ও রিক্যালকুলেট
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 MANUAL PHONE ORDER MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#1B5E20]">নতুন ফোন/ম্যানুয়াল অর্ডার তৈরি</h3>
              <button onClick={() => setManualModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">ক্রেতার পুরো নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোহাম্মদ রফিক"
                  value={manualCustName}
                  onChange={e => setManualCustName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01712345678"
                    value={manualPhone}
                    onChange={e => setManualPhone(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বিকল্প মোবাইল</label>
                  <input
                    type="tel"
                    placeholder="ঐচ্ছিক নম্বর"
                    value={manualAltPhone}
                    onChange={e => setManualAltPhone(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">জেলা</label>
                  <input
                    type="text"
                    value={manualDistrict}
                    onChange={e => setManualDistrict(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">থানা</label>
                  <input
                    type="text"
                    value={manualThana}
                    onChange={e => setManualThana(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">পূর্ণ ডেলিভারি ঠিকানা *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="বাড়ি/রোড নম্বর, এলাকা ও ল্যান্ডমার্ক..."
                  value={manualAddress}
                  onChange={e => setManualAddress(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">পণ্য নির্বাচন করুন *</label>
                <select
                  value={manualSelectedProd}
                  onChange={e => {
                    setManualSelectedProd(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod && prod.variants.length > 0) setManualVariantId(prod.variants[0].id);
                  }}
                  className="w-full p-2.5 border rounded-lg"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nameBn}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">সাইজ / ভ্যারিয়েন্ট</label>
                  <select
                    value={manualVariantId}
                    onChange={e => setManualVariantId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  >
                    {(products.find(p => p.id === manualSelectedProd)?.variants || []).map(v => (
                      <option key={v.id} value={v.id}>{v.size} — ৳{v.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">পরিমাণ</label>
                  <input
                    type="number"
                    min="1"
                    value={manualQty}
                    onChange={e => setManualQty(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">ডেলিভারি চার্জ (৳)</label>
                  <input
                    type="number"
                    value={manualDeliveryCharge}
                    onChange={e => setManualDeliveryCharge(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={manualPaymentMethod}
                    onChange={e => setManualPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 border rounded-lg"
                  >
                    <option value="cod">ক্যাশ অন ডেলিভারি (COD)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B4D2B] text-white font-bold rounded-xl hover:bg-[#153D22]"
                >
                  অর্ডার সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
