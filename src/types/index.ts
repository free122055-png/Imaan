export interface ProductVariant {
  id: string;
  size: string; // e.g. "২৫০ মিলি", "৫০০ মিলি", "১ লিটার", "৫ লিটার"
  weight?: number; // Added
  unit?: 'kg' | 'g' | 'l' | 'ml' | 'pc'; // Added
  price: number;
  oldPrice?: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  categoryId: string;
  subCategoryId?: string;
  brandId?: string;
  sku: string;
  shortDesc: string;
  shortDescBn?: string;
  shortDescEn?: string;
  description: string;
  descriptionBn?: string;
  descriptionEn?: string;
  benefits?: string;
  benefitsBn?: string;
  benefitsEn?: string;
  usage?: string;
  usageBn?: string;
  usageEn?: string;
  images: string[];
  variants: ProductVariant[];
  badge?: 'বেস্ট সেলিং' | 'নতুন' | 'সাশ্রয়ী' | 'ফ্রি গিফট' | string;
  isFeatured?: boolean;
  showOnHome?: boolean;
  isActive: boolean;
  rating?: number;
  reviewsCount?: number;
  salesCount?: number;
  seoTitle?: string;
  seoDesc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  image: string;
  order: number;
  isFeaturedHome: boolean;
  isActive: boolean;
  parentId?: string;
  shortDesc?: string;
  shortDescBn?: string;
  shortDescEn?: string;
  subCategories?: { id: string; nameBn: string; nameEn: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  nameBn: string;
  nameEn: string;
  logo: string;
  order: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------- ORDER SNAPSHOT TYPES -----------------
export interface OrderItemSnapshot {
  productId: string;
  variantId: string;
  name: string;
  sizeLabel: string; // e.g. "২৫০ গ্রাম", "৫০০ মিলি", "১ লিটার", "৫ কেজি"
  sku?: string;
  image: string;
  unitPrice: number;
  oldPrice?: number;
  qty: number;
  lineTotal: number;
  // Legacy backward-compatibility aliases
  productName?: string;
  productImage?: string;
  variantSize?: string;
  price?: number;
  quantity?: number;
  total?: number;
}

// Alias for existing references
export type OrderItem = OrderItemSnapshot;

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'pending-verification' | 'paid' | 'refunded' | 'pending' | 'failed';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';

export interface OrderCustomer {
  uid?: string;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
}

export interface OrderAddress {
  district: string;
  thana: string;
  fullAddress: string;
  landmark?: string;
  deliveryNote?: string;
}

export interface OrderPricing {
  subtotal: number;
  deliveryCharge: number;
  promo?: {
    code: string;
    type: string;
    discountAmount: number;
  };
  otherDiscount?: number;
  total: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  senderNumber?: string;
  trxId?: string;
  paidAmount?: number;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface OrderDelivery {
  courierName?: 'Pathao' | 'Steadfast' | 'RedX' | 'নিজস্ব ডেলিভারি' | 'সুন্দরবন' | 'এসএ পরিবহন' | 'অন্যান্য' | string;
  trackingId?: string;
  consignmentId?: string;
  trackingUrl?: string;
  estimatedDate?: string;
  deliveredAt?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus | string;
  time?: string;
  by?: string;
  note?: string;
  // Legacy aliases
  updatedAt?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNo: string; // e.g. AB-261110-0001
  source: 'web' | 'manual-phone' | 'whatsapp';
  lang?: 'bn' | 'en';
  customer: OrderCustomer;
  address: OrderAddress;
  items: OrderItemSnapshot[];
  pricing: OrderPricing;
  payment: OrderPayment;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  delivery?: OrderDelivery;
  adminNote?: string;
  customerNote?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;

  // Legacy flat properties for backward compatibility across existing components
  orderNumber: string;
  customerName: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  district: string;
  thana: string;
  fullAddress: string;
  orderNotes?: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  senderPhone?: string;
  orderStatus: OrderStatus;
  adminNotes?: string;
  userId?: string;
}

export interface UserAddress {
  id: string;
  title: string;
  district: string;
  thana: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  uid: string;
  displayName: string;
  email?: string;
  phone: string;
  photoURL?: string;
  provider?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'customer';
  isBlocked?: boolean;
  addresses?: UserAddress[];
  wishlist?: string[]; // product IDs
  createdAt: string;
  updatedAt: string;
}

// ----------------- PROMO / COUPON SYSTEM -----------------
export type CouponDiscountType = 'percentage' | 'fixed' | 'free_delivery' | 'delivery_discount';

export interface CouponUsageLog {
  id: string;
  orderId: string;
  orderNo: string;
  customerName: string;
  phone: string;
  discountAmount: number;
  orderTotal: number;
  usedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title?: string;
  description?: string;
  displayMessage?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number; // total overall usage
  userUsageLimit?: number; // per customer limit (default 1)
  perUserLimit?: number; // alias
  usedCount: number;
  isActive: boolean;
  // Conditions
  firstOrderOnly?: boolean;
  isFirstOrderOnly?: boolean; // alias
  specificCustomerPhones?: string[];
  specificCategoryIds?: string[];
  applicableCategoryIds?: string[]; // alias
  excludedProductIds?: string[];
  excludeDiscountedProducts?: boolean;
  specificPaymentMethods?: PaymentMethod[];
  specificDistricts?: string[];
  isAutoApply?: boolean;
  createdAt: string;
}

// ----------------- BANNER SYSTEM -----------------
export interface Banner {
  id: string;
  title: string;
  titleBn?: string;
  titleEn?: string;
  subtitle: string;
  subtitleBn?: string;
  subtitleEn?: string;
  imageDesktop: string;
  imageMobile: string;
  link: string;
  badge?: string;
  buttonText?: string;
  buttonTextBn?: string;
  buttonTextEn?: string;
  textPosition?: 'left' | 'center' | 'right';
  overlayOpacity?: number; // 0 to 1
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface HomeSection {
  id: string;
  title: string;
  type: 'categories' | 'top_selling' | 'brands' | 'category_slider' | 'just_for_you';
  categoryId?: string;
  order: number;
  isActive: boolean;
  productLimit?: number;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  titleBn?: string;
  titleEn?: string;
  content: string;
  contentBn?: string;
  contentEn?: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userPhone?: string;
  rating: number; // 1 to 5
  comment: string;
  isApproved: boolean;
  isVerifiedBuyer?: boolean;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  siteName: string;
  siteNameBn?: string;
  siteNameEn?: string;
  tagline: string;
  taglineBn?: string;
  taglineEn?: string;
  defaultLanguage?: 'bn' | 'en';
  logo: string;
  favicon?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
  };
  themePrimaryColor: string;
  themeAccentColor: string;
  numberFormat?: 'english' | 'bengali';
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  freeDeliveryMinOrder: number;
  paymentMethods: {
    cod: { enabled: boolean };
    bkash: { enabled: boolean; number: string; type: string };
    nagad: { enabled: boolean; number: string; type: string };
    rocket: { enabled: boolean; number: string; type: string };
  };
  guestCheckoutEnabled: boolean;
  maintenanceMode: boolean;
  whatsappOrderTemplate?: string;
  noticeBanner?: {
    enabled: boolean;
    text: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}
