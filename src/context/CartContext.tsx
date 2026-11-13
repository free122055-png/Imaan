import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Coupon } from '../types';
import { getSettings, validateCoupon } from '../services/storeService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryZone: 'inside' | 'outside';
  setDeliveryZone: (zone: 'inside' | 'outside') => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  couponMessage: string;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'aiman_brand_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const selectedVariant = variant || product.variants[0] || {
      id: 'default',
      size: 'স্ট্যান্ডার্ড',
      price: 0,
      stock: 99,
    };

    if (selectedVariant.stock <= 0) {
      showToast('দুঃখিত! এই পণ্যটির স্টক শেষ হয়ে গেছে।');
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.product.id === product.id && item.selectedVariant.id === selectedVariant.id
      );

      if (existingIdx >= 0) {
        const currentQty = prev[existingIdx].quantity;
        const newQty = Math.min(selectedVariant.stock, currentQty + quantity);
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
        };
        return updated;
      } else {
        const initialQty = Math.min(selectedVariant.stock, quantity);
        return [...prev, { product, selectedVariant, quantity: initialQty }];
      }
    });

    showToast(`"${product.nameBn} (${selectedVariant.size})" কার্টে যোগ করা হয়েছে!`);
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedVariant.id === variantId)));
    showToast('পণ্যটি কার্ট থেকে সরানো হয়েছে');
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedVariant.id === variantId) {
          const maxStock = item.selectedVariant.stock || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage('');
  };

  // Calculations
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.selectedVariant.price * item.quantity), 0);

  const settings = getSettings();
  let baseDeliveryCharge = deliveryZone === 'inside' ? settings.deliveryInsideDhaka : settings.deliveryOutsideDhaka;
  if (subtotal >= settings.freeDeliveryMinOrder && subtotal > 0) {
    baseDeliveryCharge = 0;
  }

  const [activeDeliveryCharge, setActiveDeliveryCharge] = useState<number>(baseDeliveryCharge);

  useEffect(() => {
    if (appliedCoupon) {
      const res = validateCoupon(appliedCoupon.code, subtotal, baseDeliveryCharge);
      if (res.valid) {
        setCouponDiscount(res.discount);
        setActiveDeliveryCharge(res.finalDeliveryCharge);
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setActiveDeliveryCharge(baseDeliveryCharge);
        setCouponMessage(res.message);
      }
    } else {
      setActiveDeliveryCharge(baseDeliveryCharge);
    }
  }, [subtotal, baseDeliveryCharge, appliedCoupon?.code]);

  const applyCouponCode = (code: string): boolean => {
    const res = validateCoupon(code, subtotal, baseDeliveryCharge);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      setActiveDeliveryCharge(res.finalDeliveryCharge);
      setCouponMessage(res.message);
      showToast(res.message);
      return true;
    } else {
      setCouponMessage(res.message);
      showToast(res.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setActiveDeliveryCharge(baseDeliveryCharge);
    setCouponMessage('প্রোমো কোড সরানো হয়েছে');
    showToast('প্রোমো কোড সরানো হয়েছে');
  };

  const deliveryCharge = activeDeliveryCharge;
  const total = Math.max(0, subtotal + (subtotal > 0 ? deliveryCharge : 0) - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        deliveryCharge,
        deliveryZone,
        setDeliveryZone,
        appliedCoupon,
        couponDiscount,
        couponMessage,
        applyCouponCode,
        removeCoupon,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
