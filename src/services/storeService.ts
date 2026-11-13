import {
  Product, Category, Brand, Order, Coupon, Banner, HomeSection,
  StoreSettings, ContentPage, Review, ActivityLog, OrderStatus, PaymentMethod
} from '../types';
import {
  SEED_PRODUCTS, SEED_CATEGORIES, SEED_BRANDS, SEED_BANNERS,
  SEED_HOME_SECTIONS, SEED_COUPONS, SEED_SETTINGS, SEED_REVIEWS, SEED_PAGES
} from '../data/seedData';

// Storage keys
const STORAGE_PREFIX = 'aiman_brand_';
const KEYS = {
  PRODUCTS: `${STORAGE_PREFIX}products`,
  CATEGORIES: `${STORAGE_PREFIX}categories`,
  BRANDS: `${STORAGE_PREFIX}brands`,
  ORDERS: `${STORAGE_PREFIX}orders`,
  COUPONS: `${STORAGE_PREFIX}coupons`,
  BANNERS: `${STORAGE_PREFIX}banners`,
  HOME_SECTIONS: `${STORAGE_PREFIX}home_sections`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  REVIEWS: `${STORAGE_PREFIX}reviews`,
  PAGES: `${STORAGE_PREFIX}pages`,
  ACTIVITY_LOGS: `${STORAGE_PREFIX}activity_logs`,
  DELETED_TRASH: `${STORAGE_PREFIX}trash`,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error('Listener notification error:', e);
    }
  });
}

export function subscribeToStore(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Audio chime for new order
export function playOrderNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    playTone(523.25, now, 0.2);        // C5
    playTone(659.25, now + 0.15, 0.2); // E5
    playTone(783.99, now + 0.3, 0.35); // G5
  } catch (e) {
    console.warn('Audio notification unavailable:', e);
  }
}

// In-memory cache to guarantee reference stability and performance
const memoryCache: Record<string, unknown> = {};

// Generic get / set with seed initializers
function getStored<T>(key: string, defaultValue: T): T {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key] as T;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      memoryCache[key] = defaultValue;
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    memoryCache[key] = parsed;
    return parsed;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    memoryCache[key] = defaultValue;
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    memoryCache[key] = value;
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Log activities for admin audit trail
export function logActivity(action: string, target: string, details: string, actorEmail = 'system'): void {
  const logs = getStored<ActivityLog[]>(KEYS.ACTIVITY_LOGS, []);
  const newLog: ActivityLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    actorId: 'admin',
    actorEmail,
    action,
    target,
    details,
    timestamp: new Date().toISOString(),
  };
  setStored(KEYS.ACTIVITY_LOGS, [newLog, ...logs].slice(0, 100));
}

export function getActivityLogs(): ActivityLog[] {
  return getStored<ActivityLog[]>(KEYS.ACTIVITY_LOGS, []);
}

// ---------------- PRODUCTS ----------------
export function getProducts(): Product[] {
  return getStored<Product[]>(KEYS.PRODUCTS, SEED_PRODUCTS);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find(p => p.slug === slug);
}

export function saveProduct(product: Product): Product {
  const products = getProducts();
  const existingIdx = products.findIndex(p => p.id === product.id);
  const now = new Date().toISOString();
  let updatedProduct: Product;

  if (existingIdx >= 0) {
    updatedProduct = { ...product, updatedAt: now };
    products[existingIdx] = updatedProduct;
    logActivity('পণ্য আপডেট', product.nameBn, `SKU: ${product.sku}`);
  } else {
    updatedProduct = {
      ...product,
      id: product.id || 'prod-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    products.unshift(updatedProduct);
    logActivity('নতুন পণ্য যোগ', product.nameBn, `SKU: ${product.sku}`);
  }

  setStored(KEYS.PRODUCTS, products);
  return updatedProduct;
}

export function deleteProduct(id: string): void {
  const products = getProducts();
  const target = products.find(p => p.id === id);
  if (target) {
    // Soft delete to trash
    const trash = getStored<unknown[]>(KEYS.DELETED_TRASH, []);
    trash.push({ type: 'product', data: target, deletedAt: new Date().toISOString() });
    setStored(KEYS.DELETED_TRASH, trash);

    const filtered = products.filter(p => p.id !== id);
    setStored(KEYS.PRODUCTS, filtered);
    logActivity('পণ্য ডিলিট', target.nameBn, `ID: ${id}`);
  }
}

export function duplicateProduct(id: string): Product | null {
  const target = getProductById(id);
  if (!target) return null;

  const newSlug = `${target.slug}-copy-${Math.floor(Math.random() * 1000)}`;
  const duplicated: Product = {
    ...target,
    id: 'prod-' + Date.now(),
    nameBn: `${target.nameBn} (কপি)`,
    nameEn: `${target.nameEn} (Copy)`,
    slug: newSlug,
    sku: `${target.sku}-CPY`,
    salesCount: 0,
    reviewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProduct(duplicated);
  return duplicated;
}

// ---------------- CATEGORIES ----------------
export function getCategories(): Category[] {
  return getStored<Category[]>(KEYS.CATEGORIES, SEED_CATEGORIES);
}

export function saveCategory(category: Category): Category {
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === category.id);
  const now = new Date().toISOString();
  let updatedCat: Category;

  if (idx >= 0) {
    updatedCat = { ...category, updatedAt: now };
    categories[idx] = updatedCat;
    logActivity('ক্যাটাগরি আপডেট', category.nameBn, `Slug: ${category.slug}`);
  } else {
    updatedCat = {
      ...category,
      id: category.id || 'cat-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    categories.push(updatedCat);
    logActivity('নতুন ক্যাটাগরি তৈরি', category.nameBn, `Slug: ${category.slug}`);
  }

  setStored(KEYS.CATEGORIES, categories);
  return updatedCat;
}

export function deleteCategory(id: string): void {
  const categories = getCategories();
  const target = categories.find(c => c.id === id);
  if (target) {
    const filtered = categories.filter(c => c.id !== id);
    setStored(KEYS.CATEGORIES, filtered);
    logActivity('ক্যাটাগরি ডিলিট', target.nameBn, `ID: ${id}`);
  }
}

// ---------------- BRANDS ----------------
export function getBrands(): Brand[] {
  return getStored<Brand[]>(KEYS.BRANDS, SEED_BRANDS);
}

export function saveBrand(brand: Brand): Brand {
  const brands = getBrands();
  const idx = brands.findIndex(b => b.id === brand.id);
  const now = new Date().toISOString();
  let updatedBrand: Brand;

  if (idx >= 0) {
    updatedBrand = { ...brand, updatedAt: now };
    brands[idx] = updatedBrand;
    logActivity('ব্র্যান্ড আপডেট', brand.nameBn, `ID: ${brand.id}`);
  } else {
    updatedBrand = {
      ...brand,
      id: brand.id || 'brand-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    brands.push(updatedBrand);
    logActivity('নতুন ব্র্যান্ড যোগ', brand.nameBn, `ID: ${brand.id}`);
  }

  setStored(KEYS.BRANDS, brands);
  return updatedBrand;
}

export function deleteBrand(id: string): void {
  const brands = getBrands();
  const target = brands.find(b => b.id === id);
  if (target) {
    const filtered = brands.filter(b => b.id !== id);
    setStored(KEYS.BRANDS, filtered);
    logActivity('ব্র্যান্ড ডিলিট', target.nameBn, `ID: ${id}`);
  }
}

// ---------------- ORDERS ----------------
const ORDER_COUNTER_KEY = `${STORAGE_PREFIX}order_counter`;

function getNextOrderNumber(): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateKey = `${yy}${mm}${dd}`;

  let counters: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(ORDER_COUNTER_KEY);
    if (raw) counters = JSON.parse(raw);
  } catch {
    counters = {};
  }

  const currentCount = (counters[dateKey] || 0) + 1;
  counters[dateKey] = currentCount;
  try {
    localStorage.setItem(ORDER_COUNTER_KEY, JSON.stringify(counters));
  } catch {
    // continue
  }

  const seq = String(currentCount).padStart(4, '0');
  return `AB-${dateKey}-${seq}`;
}

export function getOrders(): Order[] {
  const orders = getStored<Order[]>(KEYS.ORDERS, []);
  return orders;
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find(o => o.id === id || o.orderNo === id || o.orderNumber === id);
}

export function findOrderByNumberAndPhone(orderNumber: string, phone: string): Order | undefined {
  const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
  const cleanNumber = orderNumber.trim().toUpperCase();

  return getOrders().find(o => {
    const orderPhone = (o.customer?.phone || o.phone || '').trim().replace(/[^0-9]/g, '');
    const numMatch =
      (o.orderNo && o.orderNo.toUpperCase() === cleanNumber) ||
      (o.orderNumber && o.orderNumber.toUpperCase() === cleanNumber) ||
      o.id === orderNumber.trim();
    const phoneMatch =
      orderPhone.endsWith(cleanPhone.slice(-10)) || cleanPhone.endsWith(orderPhone.slice(-10));
    return numMatch && phoneMatch;
  });
}

export function getCustomerOrderStats(phone: string): { totalOrders: number; totalSpent: number; isReturning: boolean } {
  if (!phone) return { totalOrders: 0, totalSpent: 0, isReturning: false };
  const cleanPhone = phone.trim().replace(/[^0-9]/g, '').slice(-10);
  const orders = getOrders().filter(o => {
    const p = (o.customer?.phone || o.phone || '').trim().replace(/[^0-9]/g, '').slice(-10);
    return p === cleanPhone;
  });

  const totalSpent = orders.reduce((sum, o) => sum + (o.pricing?.total || o.total || 0), 0);
  return {
    totalOrders: orders.length,
    totalSpent,
    isReturning: orders.length > 1,
  };
}

export function createOrder(orderInput: Partial<Order> & {
  customerName?: string;
  phone?: string;
  district?: string;
  thana?: string;
  fullAddress?: string;
  items: any[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: any;
}): Order {
  const orders = getOrders();
  const orderNo = getNextOrderNumber();
  const now = new Date().toISOString();

  // Normalize customer snapshot
  const customer: Order['customer'] = {
    uid: orderInput.customer?.uid || orderInput.userId,
    name: (orderInput.customer?.name || orderInput.customerName || 'গ্রাহক').trim(),
    phone: (orderInput.customer?.phone || orderInput.phone || '').trim(),
    altPhone: (orderInput.customer?.altPhone || orderInput.alternativePhone || '').trim() || undefined,
    email: (orderInput.customer?.email || orderInput.email || '').trim() || undefined,
  };

  // Normalize address snapshot
  const address: Order['address'] = {
    district: orderInput.address?.district || orderInput.district || 'ঢাকা',
    thana: orderInput.address?.thana || orderInput.thana || 'সদর',
    fullAddress: (orderInput.address?.fullAddress || orderInput.fullAddress || '').trim(),
    landmark: orderInput.address?.landmark,
    deliveryNote: orderInput.address?.deliveryNote || orderInput.orderNotes,
  };

  // Normalize items snapshot: guaranteed sizeLabel, unitPrice, qty, lineTotal
  const items = (orderInput.items || []).map(it => {
    const unitPrice = it.unitPrice !== undefined ? it.unitPrice : it.price || 0;
    const qty = it.qty !== undefined ? it.qty : it.quantity || 1;
    const sizeLabel = it.sizeLabel || it.variantSize || '১ প্যাক';
    const name = it.name || it.productName || 'পণ্য';
    const image = it.image || it.productImage || '';
    const lineTotal = it.lineTotal !== undefined ? it.lineTotal : (it.total || unitPrice * qty);

    return {
      productId: it.productId,
      variantId: it.variantId || 'v0',
      name,
      sizeLabel,
      sku: it.sku || `AB-${it.productId}`,
      image,
      unitPrice,
      oldPrice: it.oldPrice,
      qty,
      lineTotal,
      // legacy aliases
      productName: name,
      productImage: image,
      variantSize: sizeLabel,
      price: unitPrice,
      quantity: qty,
      total: lineTotal,
    };
  });

  const subtotal = orderInput.pricing?.subtotal !== undefined ? orderInput.pricing.subtotal : orderInput.subtotal || 0;
  const deliveryCharge = orderInput.pricing?.deliveryCharge !== undefined ? orderInput.pricing.deliveryCharge : orderInput.deliveryCharge || 0;
  const discount = orderInput.pricing?.promo?.discountAmount !== undefined
    ? orderInput.pricing.promo.discountAmount
    : orderInput.discount || 0;
  const otherDiscount = orderInput.pricing?.otherDiscount || 0;
  const total = orderInput.pricing?.total !== undefined ? orderInput.pricing.total : (orderInput.total || subtotal + deliveryCharge - discount - otherDiscount);

  const pricing: Order['pricing'] = {
    subtotal,
    deliveryCharge,
    promo: orderInput.couponCode || orderInput.pricing?.promo?.code
      ? {
          code: (orderInput.couponCode || orderInput.pricing?.promo?.code)!,
          type: orderInput.pricing?.promo?.type || 'fixed',
          discountAmount: discount,
        }
      : undefined,
    otherDiscount,
    total,
  };

  const payment: Order['payment'] = {
    method: orderInput.payment?.method || orderInput.paymentMethod || 'cod',
    status: orderInput.payment?.status || orderInput.paymentStatus || (orderInput.paymentMethod === 'cod' ? 'unpaid' : 'pending-verification'),
    senderNumber: orderInput.payment?.senderNumber || orderInput.senderPhone,
    trxId: orderInput.payment?.trxId || orderInput.transactionId,
    paidAmount: orderInput.payment?.paidAmount || (orderInput.paymentStatus === 'paid' ? total : 0),
    verifiedBy: orderInput.payment?.verifiedBy,
    verifiedAt: orderInput.payment?.verifiedAt,
  };

  const delivery: Order['delivery'] = {
    courierName: orderInput.delivery?.courierName || 'নিজস্ব ডেলিভারি',
    trackingId: orderInput.delivery?.trackingId || '',
    consignmentId: orderInput.delivery?.consignmentId || '',
    trackingUrl: orderInput.delivery?.trackingUrl || '',
    estimatedDate: orderInput.delivery?.estimatedDate || '',
    deliveredAt: orderInput.delivery?.deliveredAt,
  };

  const status: Order['status'] = orderInput.status || orderInput.orderStatus || 'pending';

  const statusHistory = [
    {
      status,
      time: now,
      by: orderInput.source === 'manual-phone' ? 'Admin (Phone)' : 'Customer',
      note: 'অর্ডার সফলভাবে দাখিল হয়েছে',
      updatedAt: now,
      updatedBy: 'System',
    }
  ];

  const newOrder: Order = {
    id: 'ord-' + Date.now(),
    orderNo,
    orderNumber: orderNo,
    source: orderInput.source || 'web',
    customer,
    address,
    items,
    pricing,
    payment,
    delivery,
    status,
    statusHistory,
    adminNote: orderInput.adminNote || orderInput.adminNotes || '',
    customerNote: orderInput.customerNote || orderInput.orderNotes || '',
    tags: orderInput.tags || ['নতুন অর্ডার'],
    createdAt: now,
    updatedAt: now,
    // Legacy properties
    customerName: customer.name,
    phone: customer.phone,
    alternativePhone: customer.altPhone,
    email: customer.email,
    district: address.district,
    thana: address.thana,
    fullAddress: address.fullAddress,
    orderNotes: customer.name,
    subtotal,
    deliveryCharge,
    discount,
    couponCode: pricing.promo?.code,
    total,
    paymentMethod: payment.method,
    paymentStatus: payment.status,
    transactionId: payment.trxId,
    senderPhone: payment.senderNumber,
    orderStatus: status,
    adminNotes: orderInput.adminNote || orderInput.adminNotes,
    userId: customer.uid,
  };

  // Adjust stock
  const products = getProducts();
  newOrder.items.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.salesCount = (prod.salesCount || 0) + item.qty;
      const variant = prod.variants.find(v => v.id === item.variantId);
      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.qty);
      }
    }
  });
  setStored(KEYS.PRODUCTS, products);

  // If promo used, increment count & log
  if (pricing.promo?.code) {
    const coupons = getCoupons();
    const cpn = coupons.find(c => c.code.toUpperCase() === pricing.promo!.code.toUpperCase());
    if (cpn) {
      cpn.usedCount = (cpn.usedCount || 0) + 1;
      setStored(KEYS.COUPONS, coupons);
    }
  }

  orders.unshift(newOrder);
  setStored(KEYS.ORDERS, orders);

  playOrderNotificationSound();
  logActivity('নতুন অর্ডার গ্রহণ', orderNo, `মোট: ৳${newOrder.pricing.total}, ক্রেতা: ${customer.name}`);

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, note?: string, updatedBy = 'Admin'): Order | null {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx < 0) return null;

  const order = orders[idx];
  const prevStatus = order.status || order.orderStatus;
  const now = new Date().toISOString();

  order.status = status;
  order.orderStatus = status;
  order.updatedAt = now;

  // Auto mark payment as paid if delivered and COD
  if (status === 'delivered') {
    if (order.payment) {
      order.payment.status = 'paid';
      order.payment.paidAmount = order.pricing?.total || order.total;
    }
    order.paymentStatus = 'paid';
    if (order.delivery) {
      order.delivery.deliveredAt = now;
    }
  }

  if (!order.statusHistory) order.statusHistory = [];
  order.statusHistory.push({
    status,
    time: now,
    by: updatedBy,
    note: note || `স্ট্যাটাস পরিবর্তন: ${prevStatus} ➔ ${status}`,
    updatedAt: now,
    updatedBy,
  });

  // Stock deduction / restoration
  const products = getProducts();
  if ((status === 'cancelled' || status === 'returned') && prevStatus !== 'cancelled' && prevStatus !== 'returned') {
    // Restore stock
    order.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.salesCount = Math.max(0, (prod.salesCount || 0) - item.qty);
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          variant.stock += item.qty;
        }
      }
    });
    setStored(KEYS.PRODUCTS, products);

    // If promo was used, release count
    if (order.pricing?.promo?.code) {
      const coupons = getCoupons();
      const cpn = coupons.find(c => c.code.toUpperCase() === order.pricing.promo!.code.toUpperCase());
      if (cpn && cpn.usedCount > 0) {
        cpn.usedCount -= 1;
        setStored(KEYS.COUPONS, coupons);
      }
    }
  }

  orders[idx] = order;
  setStored(KEYS.ORDERS, orders);
  logActivity('অর্ডার স্ট্যাটাস আপডেট', order.orderNo || order.orderNumber, `নতুন স্ট্যাটাস: ${status}`);

  return order;
}

export function updateOrder(order: Order): Order {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === order.id);
  const now = new Date().toISOString();

  const updatedOrder = { ...order, updatedAt: now };

  // Ensure mirrored flat properties stay in sync
  if (updatedOrder.customer) {
    updatedOrder.customerName = updatedOrder.customer.name;
    updatedOrder.phone = updatedOrder.customer.phone;
  }
  if (updatedOrder.address) {
    updatedOrder.district = updatedOrder.address.district;
    updatedOrder.thana = updatedOrder.address.thana;
    updatedOrder.fullAddress = updatedOrder.address.fullAddress;
  }
  if (updatedOrder.pricing) {
    updatedOrder.subtotal = updatedOrder.pricing.subtotal;
    updatedOrder.deliveryCharge = updatedOrder.pricing.deliveryCharge;
    updatedOrder.total = updatedOrder.pricing.total;
  }
  if (updatedOrder.status) {
    updatedOrder.orderStatus = updatedOrder.status;
  }

  if (idx >= 0) {
    orders[idx] = updatedOrder;
  } else {
    orders.unshift(updatedOrder);
  }

  setStored(KEYS.ORDERS, orders);
  logActivity('অর্ডার তথ্য পরিবর্তন', order.orderNo || order.orderNumber, `ক্রেতা: ${order.customer?.name || order.customerName}`);
  return updatedOrder;
}

export function deleteOrder(id: string): void {
  const orders = getOrders();
  const target = orders.find(o => o.id === id);
  if (target) {
    const filtered = orders.filter(o => o.id !== id);
    setStored(KEYS.ORDERS, filtered);
    logActivity('অর্ডার ডিলিট', target.orderNo || target.orderNumber, `ID: ${id}`);
  }
}

// Migration tool to backfill unified snapshot for any older orders in storage
export function migrateOrdersToUnifiedSnapshot(): { migratedCount: number; totalCount: number } {
  const orders = getOrders();
  let migratedCount = 0;

  const migrated = orders.map(o => {
    let changed = false;

    // 1. orderNo
    let orderNo = o.orderNo || o.orderNumber;
    if (!orderNo) {
      orderNo = `AB-261110-${String(Math.floor(1000 + Math.random() * 9000))}`;
      changed = true;
    }

    // 2. customer
    let customer = o.customer;
    if (!customer || !customer.name || !customer.phone) {
      customer = {
        name: o.customerName || 'সম্মানিত ক্রেতা',
        phone: o.phone || '01700000000',
        altPhone: o.alternativePhone,
        email: o.email,
        uid: o.userId,
      };
      changed = true;
    }

    // 3. address
    let address = o.address;
    if (!address || !address.district) {
      address = {
        district: o.district || 'ঢাকা',
        thana: o.thana || 'সদর',
        fullAddress: o.fullAddress || 'ঠিকানা দেওয়া হয়নি',
        landmark: '',
        deliveryNote: o.orderNotes || '',
      };
      changed = true;
    }

    // 4. items snapshot with sizeLabel
    let items = o.items || [];
    const products = getProducts();
    const fixedItems = items.map(it => {
      const prod = products.find(p => p.id === it.productId);
      const sizeLabel = it.sizeLabel || it.variantSize || (prod?.variants.find(v => v.id === it.variantId)?.size) || '১ প্যাক';
      const name = it.name || it.productName || prod?.nameBn || 'সরিষার তেল';
      const unitPrice = it.unitPrice !== undefined ? it.unitPrice : it.price || 0;
      const qty = it.qty !== undefined ? it.qty : it.quantity || 1;
      const lineTotal = it.lineTotal !== undefined ? it.lineTotal : (it.total || unitPrice * qty);
      const image = it.image || it.productImage || prod?.images[0] || '';

      return {
        productId: it.productId,
        variantId: it.variantId || 'v0',
        name,
        sizeLabel,
        sku: it.sku || prod?.sku || 'AB-OIL',
        image,
        unitPrice,
        oldPrice: it.oldPrice,
        qty,
        lineTotal,
        // compatibility
        productName: name,
        productImage: image,
        variantSize: sizeLabel,
        price: unitPrice,
        quantity: qty,
        total: lineTotal,
      };
    });

    if (JSON.stringify(items) !== JSON.stringify(fixedItems)) {
      items = fixedItems;
      changed = true;
    }

    // 5. pricing
    let pricing = o.pricing;
    if (!pricing || pricing.total === undefined) {
      const subtotal = o.subtotal || items.reduce((sum, it) => sum + it.lineTotal, 0);
      const deliveryCharge = o.deliveryCharge || 60;
      const discount = o.discount || 0;
      pricing = {
        subtotal,
        deliveryCharge,
        promo: o.couponCode ? { code: o.couponCode, type: 'discount', discountAmount: discount } : undefined,
        total: o.total || (subtotal + deliveryCharge - discount),
      };
      changed = true;
    }

    // 6. payment
    let payment = o.payment;
    if (!payment || !payment.method) {
      payment = {
        method: o.paymentMethod || 'cod',
        status: o.paymentStatus || 'unpaid',
        senderNumber: o.senderPhone,
        trxId: o.transactionId,
        paidAmount: o.paymentStatus === 'paid' ? pricing.total : 0,
      };
      changed = true;
    }

    // 7. delivery
    let delivery = o.delivery;
    if (!delivery) {
      delivery = {
        courierName: 'নিজস্ব ডেলিভারি',
        trackingId: '',
        consignmentId: '',
      };
      changed = true;
    }

    // 8. status
    const status = o.status || o.orderStatus || 'pending';

    // 9. statusHistory
    let statusHistory = o.statusHistory;
    if (!statusHistory || statusHistory.length === 0) {
      statusHistory = [
        {
          status,
          time: o.createdAt || new Date().toISOString(),
          by: 'System Migration',
          note: 'সফলভাবে স্ন্যাপশট মাইগ্রেট করা হয়েছে',
        }
      ];
      changed = true;
    }

    if (changed) {
      migratedCount++;
    }

    return {
      ...o,
      orderNo,
      orderNumber: orderNo,
      source: o.source || 'web',
      customer,
      address,
      items,
      pricing,
      payment,
      delivery,
      status,
      orderStatus: status,
      statusHistory,
      adminNote: o.adminNote || o.adminNotes || '',
      customerNote: o.customerNote || o.orderNotes || '',
      customerName: customer.name,
      phone: customer.phone,
      district: address.district,
      thana: address.thana,
      fullAddress: address.fullAddress,
      subtotal: pricing.subtotal,
      deliveryCharge: pricing.deliveryCharge,
      discount: pricing.promo?.discountAmount || 0,
      total: pricing.total,
      paymentMethod: payment.method,
      paymentStatus: payment.status,
    };
  });

  if (migratedCount > 0) {
    setStored(KEYS.ORDERS, migrated);
    logActivity('অর্ডার মাইগ্রেশন সম্পন্ন', 'সব অর্ডার', `${migratedCount}টি অর্ডার স্ন্যাপশটে আপডেট`);
  }

  return { migratedCount, totalCount: orders.length };
}

// ---------------- COUPONS ----------------
export function getCoupons(): Coupon[] {
  return getStored<Coupon[]>(KEYS.COUPONS, SEED_COUPONS);
}

export function saveCoupon(coupon: Coupon): Coupon {
  const coupons = getCoupons();
  const idx = coupons.findIndex(c => c.id === coupon.id);
  let updatedCoupon: Coupon;

  if (idx >= 0) {
    updatedCoupon = { ...coupon };
    coupons[idx] = updatedCoupon;
    logActivity('প্রোমো কোড আপডেট', coupon.code, `ছাড়: ${coupon.discountValue}`);
  } else {
    updatedCoupon = {
      ...coupon,
      id: coupon.id || 'cpn-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    coupons.push(updatedCoupon);
    logActivity('নতুন প্রোমো কোড যোগ', coupon.code, `ছাড়: ${coupon.discountValue}`);
  }

  setStored(KEYS.COUPONS, coupons);
  return updatedCoupon;
}

export function deleteCoupon(id: string): void {
  const coupons = getCoupons();
  const target = coupons.find(c => c.id === id);
  if (target) {
    const filtered = coupons.filter(c => c.id !== id);
    setStored(KEYS.COUPONS, filtered);
    logActivity('প্রোমো কোড ডিলিট', target.code, `ID: ${id}`);
  }
}

export interface CouponValidationOptions {
  customerPhone?: string;
  isFirstOrder?: boolean;
  categoryIds?: string[];
  productIds?: string[];
  paymentMethod?: PaymentMethod;
  district?: string;
  hasDiscountedItems?: boolean;
}

export function validateCoupon(
  code: string,
  subtotal: number,
  deliveryCharge = 60,
  options?: CouponValidationOptions
): { valid: boolean; discount: number; finalDeliveryCharge: number; message: string; coupon?: Coupon } {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discount: 0, finalDeliveryCharge: deliveryCharge, message: 'প্রোমো কোড লিখুন।' };
  }

  const coupons = getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, discount: 0, finalDeliveryCharge: deliveryCharge, message: 'প্রোমো কোডটি সঠিক নয়।' };
  }
  if (!coupon.isActive) {
    return { valid: false, discount: 0, finalDeliveryCharge: deliveryCharge, message: 'এই প্রোমো কোডটির কার্যকারিতা বন্ধ রয়েছে।' };
  }

  // Date validity
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, discount: 0, finalDeliveryCharge: deliveryCharge, message: 'এই প্রোমো কোডের ক্যাম্পেইন এখনও শুরু হয়নি।' };
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return { valid: false, discount: 0, finalDeliveryCharge: deliveryCharge, message: 'প্রোমো কোডের মেয়াদ শেষ হয়ে গেছে।' };
  }

  // Min order amount
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      valid: false,
      discount: 0,
      finalDeliveryCharge: deliveryCharge,
      message: `ন্যূনতম ৳${coupon.minOrder} টাকার অর্ডার প্রয়োজন।`,
    };
  }

  // Total usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, finalDeliveryCharge: deliveryCharge, message: 'এই কোড ব্যবহারের সর্বোচ্চ সীমা শেষ হয়েছে।' };
  }

  // Per-customer usage limit
  if (options?.customerPhone) {
    const cleanPhone = options.customerPhone.trim().replace(/[^0-9]/g, '').slice(-10);
    const orders = getOrders();
    const usedByUser = orders.filter(o => {
      const p = (o.customer?.phone || o.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const c = o.pricing?.promo?.code || o.couponCode;
      return p === cleanPhone && c && c.toUpperCase() === cleanCode && o.status !== 'cancelled';
    }).length;

    const userLimit = coupon.userUsageLimit || 1;
    if (usedByUser >= userLimit) {
      return {
        valid: false,
        discount: 0,
        finalDeliveryCharge: deliveryCharge,
        message: 'এই কোডটি আপনি ইতিমধ্যে ব্যবহার করেছেন।',
      };
    }
  }

  // First order only condition
  if (coupon.firstOrderOnly) {
    if (options?.isFirstOrder === false) {
      return {
        valid: false,
        discount: 0,
        finalDeliveryCharge: deliveryCharge,
        message: 'এই প্রোমো কোডটি শুধুমাত্র নতুন ক্রেতার প্রথম অর্ডারের জন্য প্রযোজ্য।',
      };
    }
  }

  // Specific customer phones list
  if (coupon.specificCustomerPhones && coupon.specificCustomerPhones.length > 0) {
    const cleanPhone = (options?.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
    const isAllowed = coupon.specificCustomerPhones.some(p => p.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
    if (!isAllowed) {
      return {
        valid: false,
        discount: 0,
        finalDeliveryCharge: deliveryCharge,
        message: 'এই প্রোমো কোডটি শুধুমাত্র নির্ধারিত গ্রাহকদের জন্য প্রযোজ্য।',
      };
    }
  }

  // Specific Category
  if (coupon.specificCategoryIds && coupon.specificCategoryIds.length > 0) {
    const hasCategory = (options?.categoryIds || []).some(cId => coupon.specificCategoryIds!.includes(cId));
    if (!hasCategory) {
      return {
        valid: false,
        discount: 0,
        finalDeliveryCharge: deliveryCharge,
        message: 'এই কোডটি আপনার কার্টের পণ্যে প্রযোজ্য নয়।',
      };
    }
  }

  // Specific District
  if (coupon.specificDistricts && coupon.specificDistricts.length > 0 && options?.district) {
    if (!coupon.specificDistricts.includes(options.district)) {
      return {
        valid: false,
        discount: 0,
        finalDeliveryCharge: deliveryCharge,
        message: `এই কোডটি শুধুমাত্র ${coupon.specificDistricts.join(', ')} জেলার জন্য প্রযোজ্য।`,
      };
    }
  }

  // Calculate discount based on type
  let discount = 0;
  let finalDelivery = deliveryCharge;

  if (coupon.discountType === 'percentage') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discount = Math.min(coupon.discountValue, subtotal);
  } else if (coupon.discountType === 'free_delivery') {
    discount = 0;
    finalDelivery = 0;
  } else if (coupon.discountType === 'delivery_discount') {
    discount = 0;
    finalDelivery = Math.max(0, deliveryCharge - coupon.discountValue);
  }

  return {
    valid: true,
    discount,
    finalDeliveryCharge: finalDelivery,
    message: coupon.discountType === 'free_delivery'
      ? 'প্রোমো কোড সফল! ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।'
      : `প্রোমো কোড সফল! মোট সাশ্রয় ৳${discount}`,
    coupon,
  };
}

// ---------------- BANNERS ----------------
export function getBanners(): Banner[] {
  return getStored<Banner[]>(KEYS.BANNERS, SEED_BANNERS);
}

export function saveBanner(banner: Banner): Banner {
  const banners = getBanners();
  const idx = banners.findIndex(b => b.id === banner.id);
  let updatedBanner: Banner;

  if (idx >= 0) {
    updatedBanner = { ...banner };
    banners[idx] = updatedBanner;
    logActivity('ব্যানার আপডেট', banner.title, `ID: ${banner.id}`);
  } else {
    updatedBanner = {
      ...banner,
      id: banner.id || 'ban-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    banners.push(updatedBanner);
    logActivity('নতুন ব্যানার যোগ', banner.title, `ID: ${banner.id}`);
  }

  setStored(KEYS.BANNERS, banners);
  return updatedBanner;
}

export function deleteBanner(id: string): void {
  const banners = getBanners();
  const target = banners.find(b => b.id === id);
  if (target) {
    const filtered = banners.filter(b => b.id !== id);
    setStored(KEYS.BANNERS, filtered);
    logActivity('ব্যানার ডিলিট', target.title, `ID: ${id}`);
  }
}

// ---------------- HOME SECTIONS ----------------
export function getHomeSections(): HomeSection[] {
  return getStored<HomeSection[]>(KEYS.HOME_SECTIONS, SEED_HOME_SECTIONS);
}

export function saveHomeSections(sections: HomeSection[]): void {
  setStored(KEYS.HOME_SECTIONS, sections);
  logActivity('হোম পেজ সেকশন পরিবর্তন', 'হোমপেজ লেআউট', `${sections.length}টি সেকশন সেভ`);
}

// ---------------- REVIEWS ----------------
export function getReviews(productId?: string): Review[] {
  const all = getStored<Review[]>(KEYS.REVIEWS, SEED_REVIEWS);
  if (productId) {
    return all.filter(r => r.productId === productId);
  }
  return all;
}

export function addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
  const reviews = getReviews();
  const newRev: Review = {
    ...review,
    id: 'rev-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(newRev);
  setStored(KEYS.REVIEWS, reviews);

  // Recalculate product rating
  const approvedRevs = reviews.filter(r => r.productId === review.productId && r.isApproved);
  if (approvedRevs.length > 0) {
    const avg = approvedRevs.reduce((acc, r) => acc + r.rating, 0) / approvedRevs.length;
    const products = getProducts();
    const prod = products.find(p => p.id === review.productId);
    if (prod) {
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewsCount = approvedRevs.length;
      setStored(KEYS.PRODUCTS, products);
    }
  }

  return newRev;
}

export function approveReview(id: string, isApproved = true): void {
  const reviews = getReviews();
  const target = reviews.find(r => r.id === id);
  if (target) {
    target.isApproved = isApproved;
    setStored(KEYS.REVIEWS, reviews);
    logActivity('রিভিউ অনুমোদন পরিবর্তন', target.userName, `অনুমোদিত: ${isApproved}`);
  }
}

export function deleteReview(id: string): void {
  const reviews = getReviews();
  const filtered = reviews.filter(r => r.id !== id);
  setStored(KEYS.REVIEWS, filtered);
  logActivity('রিভিউ ডিলিট', id, 'মুছে ফেলা হয়েছে');
}

// ---------------- SETTINGS ----------------
export function getSettings(): StoreSettings {
  return getStored<StoreSettings>(KEYS.SETTINGS, SEED_SETTINGS);
}

export function saveSettings(settings: StoreSettings): StoreSettings {
  const updated = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  setStored(KEYS.SETTINGS, updated);

  // Apply theme CSS variables directly to document root
  if (typeof document !== 'undefined') {
    if (updated.themePrimaryColor) {
      document.documentElement.style.setProperty('--primary', updated.themePrimaryColor);
    }
    if (updated.themeAccentColor) {
      document.documentElement.style.setProperty('--accent', updated.themeAccentColor);
    }
  }

  logActivity('স্টোর সেটিংস আপডেট', settings.siteName, 'যোগাযোগ ও পেমেন্ট সেটিংস সেভ করা হয়েছে');
  return updated;
}

// ---------------- PAGES ----------------
export function getPages(): ContentPage[] {
  return getStored<ContentPage[]>(KEYS.PAGES, SEED_PAGES);
}

export function getPageBySlug(slug: string): ContentPage | undefined {
  return getPages().find(p => p.slug === slug);
}

export function savePage(page: ContentPage): ContentPage {
  const pages = getPages();
  const idx = pages.findIndex(p => p.id === page.id || p.slug === page.slug);
  const now = new Date().toISOString();
  let updatedPage: ContentPage;

  if (idx >= 0) {
    updatedPage = { ...page, updatedAt: now };
    pages[idx] = updatedPage;
  } else {
    updatedPage = {
      ...page,
      id: page.id || 'page-' + Date.now(),
      updatedAt: now
    };
    pages.push(updatedPage);
  }

  setStored(KEYS.PAGES, pages);
  logActivity('পেজ কন্টেন্ট আপডেট', page.title, `Slug: ${page.slug}`);
  return updatedPage;
}

// ---------------- BACKUP & RESTORE ----------------
export function exportDatabaseJSON(): string {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    products: getProducts(),
    categories: getCategories(),
    brands: getBrands(),
    orders: getOrders(),
    coupons: getCoupons(),
    banners: getBanners(),
    homeSections: getHomeSections(),
    settings: getSettings(),
    reviews: getReviews(),
    pages: getPages(),
    activityLogs: getActivityLogs(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.products) setStored(KEYS.PRODUCTS, data.products);
    if (data.categories) setStored(KEYS.CATEGORIES, data.categories);
    if (data.brands) setStored(KEYS.BRANDS, data.brands);
    if (data.orders) setStored(KEYS.ORDERS, data.orders);
    if (data.coupons) setStored(KEYS.COUPONS, data.coupons);
    if (data.banners) setStored(KEYS.BANNERS, data.banners);
    if (data.homeSections) setStored(KEYS.HOME_SECTIONS, data.homeSections);
    if (data.settings) setStored(KEYS.SETTINGS, data.settings);
    if (data.reviews) setStored(KEYS.REVIEWS, data.reviews);
    if (data.pages) setStored(KEYS.PAGES, data.pages);
    notifyListeners();
    logActivity('ডাটাবেজ রিস্টোর', 'সম্পূর্ণ ডাটাবেজ', 'JSON ফাইল থেকে রিস্টোর করা হয়েছে');
    return true;
  } catch (e) {
    console.error('Failed to import database JSON:', e);
    return false;
  }
}

export function resetToSeedData(): void {
  setStored(KEYS.PRODUCTS, SEED_PRODUCTS);
  setStored(KEYS.CATEGORIES, SEED_CATEGORIES);
  setStored(KEYS.BRANDS, SEED_BRANDS);
  setStored(KEYS.BANNERS, SEED_BANNERS);
  setStored(KEYS.HOME_SECTIONS, SEED_HOME_SECTIONS);
  setStored(KEYS.COUPONS, SEED_COUPONS);
  setStored(KEYS.SETTINGS, SEED_SETTINGS);
  setStored(KEYS.REVIEWS, SEED_REVIEWS);
  setStored(KEYS.PAGES, SEED_PAGES);
  notifyListeners();
  logActivity('ডাটাবেজ রিসেট', 'ডিফল্ট সিড ডাটা', 'সমস্ত প্রাথমিক পণ্য ও সেটিংস রিস্টোর');
}

// Automatically ensure existing orders have snapshot format
try {
  if (typeof window !== 'undefined') {
    migrateOrdersToUnifiedSnapshot();
  }
} catch {
  // ignore
}

