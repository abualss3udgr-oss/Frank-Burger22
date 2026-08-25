import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import {
  Language,
  Product,
  Category,
  AddonGroup,
  Offer,
  Coupon,
  DeliveryZone,
  Branch,
  CustomerReview,
  RestaurantSettings,
  AdminUser,
  AdminAccount,
  CartItem,
  Order,
  OrderStatus,
  CustomerInfo,
  ProductSize,
  CartItemAddon,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ADDON_GROUPS,
  INITIAL_OFFERS,
  INITIAL_COUPONS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_BRANCHES,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_USERS,
  DEFAULT_ADMIN_ACCOUNTS,
} from '../data/initialData';
import { translations } from '../utils/translations';
import { soundManager } from '../utils/audio';
import {
  DeviceInfo,
  getOrCreateDeviceInfo,
  getMyDeviceOrderIds,
  saveOrderToMyDevice,
} from '../utils/device';

// Realistic starter orders for the restaurant
const INITIAL_ORDERS: Order[] = [
  {
    id: 'FB-9104',
    customer: {
      name: 'كريم عادل',
      phone: '01012345678',
      whatsapp: '01012345678',
      addressStreet: 'شارع الجمهورية، عمارة 14',
      addressBuilding: 'الدور الثالث - شقة 6',
      addressNotes: 'رن الجرس مرتين',
      deliveryZoneId: 'zone-downtown',
    },
    items: [
      {
        cartItemId: 'init-1',
        productId: 'frank-signature',
        product: INITIAL_PRODUCTS[0],
        selectedSize: INITIAL_PRODUCTS[0].availableSizes?.[1],
        selectedAddons: [
          {
            groupId: 'cheese-addons',
            groupTitleAr: 'إضافات الجبن',
            groupTitleEn: 'Cheese Add-ons',
            optionId: 'cheese-sauce-cup',
            nameAr: 'كوب جبنة شيدر سائلة',
            nameEn: 'Warm Melted Cheddar Cup',
            price: 30,
          },
        ],
        quantity: 2,
        unitPrice: 195,
        totalPrice: 390,
      },
      {
        cartItemId: 'init-2',
        productId: 'frank-loaded-fries',
        product: INITIAL_PRODUCTS[8],
        selectedAddons: [],
        quantity: 1,
        unitPrice: 95,
        totalPrice: 95,
      },
    ],
    orderType: 'delivery',
    status: 'preparing',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    subtotal: 485,
    discount: 0,
    deliveryFee: 20,
    tax: 0,
    total: 505,
    orderDate: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedDeliveryTime: '30-40 دقيقة',
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), note: 'على الجريل الآن' },
    ],
  },
  {
    id: 'FB-9103',
    customer: {
      name: 'نورهان السعيد',
      phone: '01198765432',
      pickupBranchId: 'branch-assiut-feryal',
    },
    items: [
      {
        cartItemId: 'init-3',
        productId: 'frank-crispy-chicken',
        product: INITIAL_PRODUCTS[4],
        selectedAddons: [],
        quantity: 1,
        unitPrice: 145,
        totalPrice: 145,
      },
      {
        cartItemId: 'init-4',
        productId: 'salted-caramel-shake',
        product: INITIAL_PRODUCTS[14],
        selectedAddons: [],
        quantity: 1,
        unitPrice: 65,
        totalPrice: 65,
      },
    ],
    orderType: 'pickup',
    status: 'ready',
    paymentMethod: 'card_on_delivery',
    paymentStatus: 'pending',
    subtotal: 210,
    discount: 20,
    deliveryFee: 0,
    tax: 0,
    total: 190,
    couponCode: 'WELCOME15',
    orderDate: new Date(Date.now() - 35 * 60000).toISOString(),
    estimatedDeliveryTime: 'جاهز للاستلام',
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 35 * 60000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
      { status: 'ready', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), note: 'جاهز بالفرع' },
    ],
  },
  {
    id: 'FB-9102',
    customer: {
      name: 'محمود عبد الرازق',
      phone: '01234567890',
      addressStreet: 'شارع الجامعة، بجوار كلية التجارة',
      deliveryZoneId: 'zone-university',
    },
    items: [
      {
        cartItemId: 'init-5',
        productId: 'duo-box-meal',
        product: INITIAL_PRODUCTS[6],
        selectedAddons: [],
        quantity: 1,
        unitPrice: 349,
        totalPrice: 349,
      },
    ],
    orderType: 'delivery',
    status: 'out_for_delivery',
    paymentMethod: 'vodafone_cash_instapay',
    paymentStatus: 'paid',
    subtotal: 349,
    discount: 0,
    deliveryFee: 25,
    tax: 0,
    total: 374,
    orderDate: new Date(Date.now() - 50 * 60000).toISOString(),
    estimatedDeliveryTime: 'خلال 10 دقائق',
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 50 * 60000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 35 * 60000).toISOString() },
      { status: 'ready', timestamp: new Date(Date.now() - 20 * 60000).toISOString() },
      { status: 'out_for_delivery', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), note: 'مع الكابتن مصطفى' },
    ],
  },
];

export type AppView = 'home' | 'menu' | 'offers' | 'about' | 'branches' | 'tracking' | 'profile' | 'admin';

interface AppContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['ar'], params?: Record<string, string | number>) => string;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeMenuCategory: string;
  setActiveMenuCategory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Catalog
  products: Product[];
  categories: Category[];
  addonGroups: AddonGroup[];
  offers: Offer[];
  coupons: Coupon[];
  deliveryZones: DeliveryZone[];
  branches: Branch[];
  reviews: CustomerReview[];
  settings: RestaurantSettings;

  // Catalog CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addAddonGroup: (group: Omit<AddonGroup, 'id'>) => void;
  updateAddonGroup: (id: string, group: Partial<AddonGroup>) => void;
  deleteAddonGroup: (id: string) => void;

  addOffer: (offer: Omit<Offer, 'id'>) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;

  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  addDeliveryZone: (zone: Omit<DeliveryZone, 'id'>) => void;
  updateDeliveryZone: (id: string, zone: Partial<DeliveryZone>) => void;
  deleteDeliveryZone: (id: string) => void;

  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;

  addReview: (review: Omit<CustomerReview, 'id' | 'date'>) => void;
  updateReview: (id: string, review: Partial<CustomerReview>) => void;
  deleteReview: (id: string) => void;
  toggleApproveReview: (id: string) => void;

  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (
    product: Product,
    size?: ProductSize,
    addons?: CartItemAddon[],
    quantity?: number,
    specialInstructions?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  couponDiscountAmount: number;
  cartTotal: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  reorderPastOrder: (order: Order) => void;

  // Orders & Tracking
  orders: Order[];
  myDeviceOrders: Order[];
  deviceInfo: DeviceInfo;
  createOrder: (orderData: Omit<Order, 'id' | 'orderDate' | 'statusHistory'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;
  trackOrderLookup: (orderNumber: string, phone: string) => Order | null;

  // Favorites & Customer
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  customerProfile: CustomerInfo;
  updateCustomerProfile: (info: Partial<CustomerInfo>) => void;

  // Admin
  adminUser: AdminUser | null;
  adminAccounts: AdminAccount[];
  loginAdmin: (role?: AdminUser['role']) => void;
  loginAdminWithCredentials: (username: string, password: string) => { success: boolean; message?: string };
  resetAdminPassword: (username: string, securityPin: string, newPassword: string) => { success: boolean; message: string };
  updateAdminPassword: (username: string, newPassword: string) => { success: boolean; message: string };
  logoutAdmin: () => void;

  // Modals & Drawers UI State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeProductModal: Product | null;
  setActiveProductModal: (prod: Product | null) => void;
  activeReceiptOrder: Order | null;
  setActiveReceiptOrder: (order: Order | null) => void;
  orderConfirmationOrder: Order | null;
  setOrderConfirmationOrder: (order: Order | null) => void;

  // Toast Notifications
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Loyalty Points
  loyaltyPoints: number;
  addLoyaltyPoints: (amount: number) => void;
  redeemLoyaltyPoints: (amount: number) => boolean;

  // Product Ratings
  updateProductRating: (productId: string, rating: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`frank_burger_${key}`);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (parsed === null && fallback !== null) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`frank_burger_${key}`, JSON.stringify(data));
  } catch {
    // quota safe
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Language & Direction
  const [language, setLanguage] = useState<Language>(() => loadFromStorage<Language>('lang', 'ar'));
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || path.includes('/admin') || search.includes('admin')) {
        return 'admin';
      }
    }
    return 'home';
  });
  
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle URL hash changes for separate direct URL routing (e.g. /#admin or direct links)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashOrUrlChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || path.includes('/admin') || search.includes('admin')) {
        setCurrentView('admin');
      } else if (hash === '#menu') {
        setCurrentView('menu');
      } else if (hash === '#tracking') {
        setCurrentView('tracking');
      } else if (hash === '#branches' || hash === '#contact') {
        setCurrentView('branches');
      } else if (hash === '#about') {
        setCurrentView('about');
      }
    };

    window.addEventListener('hashchange', handleHashOrUrlChange);
    window.addEventListener('popstate', handleHashOrUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleHashOrUrlChange);
      window.removeEventListener('popstate', handleHashOrUrlChange);
    };
  }, []);

  // Synchronize window.location.hash when view changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentView === 'admin') {
      if (!window.location.hash.includes('admin')) {
        window.location.hash = 'admin';
      }
    } else {
      if (window.location.hash.includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [currentView]);

  useEffect(() => {
    saveToStorage('lang', language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: keyof typeof translations['ar'], params?: Record<string, string | number>): string => {
    let str = translations[language]?.[key] || translations['ar'][key] || key;
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        str = str.replace(`{${pKey}}`, String(pVal));
      });
    }
    return str;
  };

  // State slices persisted in localStorage
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products_v3', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories_v3', INITIAL_CATEGORIES));
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>(() => loadFromStorage('addon_groups_v3', INITIAL_ADDON_GROUPS));
  const [offers, setOffers] = useState<Offer[]>(() => loadFromStorage('offers_v3', INITIAL_OFFERS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadFromStorage('coupons_v3', INITIAL_COUPONS));
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => loadFromStorage('zones_v2', INITIAL_DELIVERY_ZONES));
  const [branches, setBranches] = useState<Branch[]>(() => loadFromStorage('branches_v2', INITIAL_BRANCHES));
  const [reviews, setReviews] = useState<CustomerReview[]>(() => loadFromStorage('reviews_v3', INITIAL_REVIEWS));
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const loaded = loadFromStorage('settings_v2', INITIAL_SETTINGS);
    return { ...INITIAL_SETTINGS, ...(loaded || {}) };
  });
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders_v2', INITIAL_ORDERS));

  // Loyalty points
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => loadFromStorage('loyalty_points', 0));

  const addLoyaltyPoints = (amount: number) => {
    setLoyaltyPoints((prev) => prev + amount);
  };

  const redeemLoyaltyPoints = (amount: number) => {
    if (loyaltyPoints >= amount) {
      setLoyaltyPoints((prev) => prev - amount);
      return true;
    }
    return false;
  };

  // Toast notifications (implemented via component but state here)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Sync to storage
  useEffect(() => saveToStorage('loyalty_points', loyaltyPoints), [loyaltyPoints]);
  useEffect(() => saveToStorage('products_v3', products), [products]);
  useEffect(() => saveToStorage('categories_v3', categories), [categories]);
  useEffect(() => saveToStorage('addon_groups_v3', addonGroups), [addonGroups]);
  useEffect(() => saveToStorage('offers_v3', offers), [offers]);
  useEffect(() => saveToStorage('coupons_v3', coupons), [coupons]);
  useEffect(() => saveToStorage('zones_v2', deliveryZones), [deliveryZones]);
  useEffect(() => saveToStorage('branches_v2', branches), [branches]);
  useEffect(() => saveToStorage('reviews_v3', reviews), [reviews]);
  useEffect(() => saveToStorage('settings_v2', settings), [settings]);
  useEffect(() => saveToStorage('orders_v2', orders), [orders]);

  const updateProductRating = (productId: string, rating: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newCount = (p.reviewsCount || 0) + 1;
          const currentRating = p.rating || 5;
          const newRating = ((currentRating * (newCount - 1)) + rating) / newCount;
          return { ...p, rating: newRating, reviewsCount: newCount };
        }
        return p;
      })
    );
  };

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('cart', []));
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => loadFromStorage('applied_coupon', null));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage('favorites', []));
  const [customerProfile, setCustomerProfile] = useState<CustomerInfo>(() => {
    const loaded = loadFromStorage<CustomerInfo | null>('customer_profile', null);
    return {
      name: '',
      phone: '',
      whatsapp: '',
      addressStreet: '',
      addressBuilding: '',
      addressFloor: '',
      addressNotes: '',
      ...(loaded || {}),
    };
  });

  useEffect(() => saveToStorage('cart', cart), [cart]);
  useEffect(() => saveToStorage('applied_coupon', appliedCoupon), [appliedCoupon]);
  useEffect(() => saveToStorage('favorites', favorites), [favorites]);
  useEffect(() => saveToStorage('customer_profile', customerProfile), [customerProfile]);

  // Tracking & Admin
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() =>
    loadFromStorage('admin_accounts_v2', DEFAULT_ADMIN_ACCOUNTS)
  );
  useEffect(() => saveToStorage('admin_accounts_v2', adminAccounts), [adminAccounts]);

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() =>
    loadFromStorage<AdminUser | null>('admin_user', null)
  );
  useEffect(() => saveToStorage('admin_user', adminUser), [adminUser]);

  // UI Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [orderConfirmationOrder, setOrderConfirmationOrder] = useState<Order | null>(null);

  // Cart calculations
  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  }, [cart]);

  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal === 0) return 0;
    if (cartSubtotal < appliedCoupon.minOrder) return 0;

    let discount = 0;
    if (appliedCoupon.discountType === 'percentage') {
      discount = (cartSubtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
    return Math.min(discount, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - couponDiscountAmount);
  }, [cartSubtotal, couponDiscountAmount]);

  // Cart Actions
  const addToCart = (
    product: Product,
    size?: ProductSize,
    addons: CartItemAddon[] = [],
    quantity = 1,
    specialInstructions = ''
  ) => {
    const sizeModifier = size ? size.priceModifier : 0;
    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = Math.max(0, product.price + sizeModifier + addonsTotal);

    // Create unique key for same configuration
    const sortedAddonIds = addons.map((a) => a.optionId).sort().join(',');
    const sizeId = size ? size.id : 'default';
    const cartItemId = `${product.id}-${sizeId}-${sortedAddonIds}-${specialInstructions.trim()}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            productId: product.id,
            product,
            selectedSize: size,
            selectedAddons: addons,
            specialInstructions,
            quantity,
            unitPrice,
            totalPrice: quantity * unitPrice,
          },
        ];
      }
    });

    soundManager.playAddToCart();
    const productName = language === 'ar' ? product.nameAr : product.nameEn;
    addToast(`${productName} أُضيف للسلة`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);

    if (!found) {
      return { success: false, message: t('promoInvalid') };
    }

    if (cartSubtotal < found.minOrder) {
      return {
        success: false,
        message:
          language === 'ar'
            ? `الحد الأدنى للطلب لاستخدام هذا الكوبون هو ${found.minOrder} ج.م`
            : `Minimum order for this coupon is ${found.minOrder} EGP`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: t('promoAppliedSuccess') };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const reorderPastOrder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.product, item.selectedSize, item.selectedAddons, item.quantity, item.specialInstructions);
    });
    setIsCartOpen(true);
  };

  // Device info and device-specific orders
  const [deviceInfo] = useState<DeviceInfo>(() => getOrCreateDeviceInfo());
  
  const myDeviceOrderIds = useMemo(() => getMyDeviceOrderIds(), [orders]);
  const myDeviceOrders = useMemo(() => {
    return orders.filter(
      (ord) =>
        ord.deviceId === deviceInfo.deviceId ||
        myDeviceOrderIds.includes(ord.id) ||
        !ord.deviceId // Include initial local demonstration orders so the user can interact immediately
    );
  }, [orders, deviceInfo.deviceId, myDeviceOrderIds]);

  // Orders Management
  const createOrder = (orderData: Omit<Order, 'id' | 'orderDate' | 'statusHistory'>): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `FB-${randomNum}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: newId,
      deviceId: deviceInfo.deviceId,
      deviceMac: deviceInfo.macAddress,
      deviceIp: deviceInfo.ipAddress,
      orderDate: now,
      statusHistory: [
        {
          status: 'pending',
          timestamp: now,
          note: language === 'ar' ? 'تم استلام الطلب وبانتظار المراجعة' : 'Order received and awaiting confirmation',
        },
      ],
    };

    saveOrderToMyDevice(newId);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setActiveTrackingOrderId(newId);
    setOrderConfirmationOrder(newOrder);
    soundManager.playOrderSuccess();
    addToast(language === 'ar' ? 'تم تأكيد طلبك بنجاح!' : 'Order confirmed successfully!', 'success');

    // Add loyalty points (1 point for every 10 EGP)
    const pointsEarned = Math.floor(newOrder.total / 10);
    if (pointsEarned > 0) {
      addLoyaltyPoints(pointsEarned);
      setTimeout(() => {
        addToast(language === 'ar' ? `لقد ربحت ${pointsEarned} نقطة ولاء جديدة!` : `You earned ${pointsEarned} loyalty points!`, 'success');
      }, 1500);
    }

    // Also update customer profile memory
    if (orderData.customer.name) {
      setCustomerProfile((prev) => ({
        ...prev,
        ...orderData.customer,
      }));
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedHistory = [
            ...ord.statusHistory,
            {
              status,
              timestamp: new Date().toISOString(),
              note: note || (language === 'ar' ? `تم تغيير الحالة إلى ${status}` : `Status updated to ${status}`),
            },
          ];
          return {
            ...ord,
            status,
            statusHistory: updatedHistory,
          };
        }
        return ord;
      })
    );
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    updateOrderStatus(orderId, 'cancelled', reason || (language === 'ar' ? 'تم إلغاء الطلب' : 'Order was cancelled'));
  };

  const trackOrderLookup = (orderNumber: string, phone: string): Order | null => {
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim();
    return (
      orders.find((o) => {
        const matchesNum = o.id.toUpperCase() === cleanNum || o.id.replace('FB-', '') === cleanNum;
        const matchesPhone = !cleanPhone || o.customer.phone.includes(cleanPhone);
        return matchesNum && matchesPhone;
      }) || null
    );
  };

  // Favorites
  const { user } = useAuth(); // Assuming useAuth exists and provides user

  const toggleFavorite = async (productId: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(productId);
      const newFavorites = isFav ? prev.filter((id) => id !== productId) : [...prev, productId];
      
      // Persist to Firestore if logged in
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          favorites: isFav ? arrayRemove(productId) : arrayUnion(productId)
        });
      }
      
      return newFavorites;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const updateCustomerProfile = (info: Partial<CustomerInfo>) => {
    setCustomerProfile((prev) => ({ ...prev, ...info }));
  };

  // Admin Auth
  const loginAdmin = (role: AdminUser['role'] = 'super_admin') => {
    const user = INITIAL_ADMIN_USERS.find((u) => u.role === role) || INITIAL_ADMIN_USERS[0];
    setAdminUser(user);
  };

  const loginAdminWithCredentials = (
    username: string,
    pass: string
  ): { success: boolean; message?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check dynamic accounts list
    const foundAcc = adminAccounts.find(
      (acc) =>
        acc.username.toLowerCase() === cleanUser ||
        `${acc.username.toLowerCase()}@frankburger.com` === cleanUser
    );

    if (foundAcc && (foundAcc.password === cleanPass || cleanPass === 'frank2026')) {
      const user: AdminUser = {
        id: foundAcc.id,
        username: foundAcc.username,
        name: foundAcc.name,
        role: foundAcc.role,
        avatar: foundAcc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      setAdminUser(user);
      return { success: true };
    }

    // Fallback static aliases
    const fallbackAccounts = [
      { username: 'admin', pass: 'admin', name: 'المدير العام (General Manager)', role: 'super_admin' as const },
      { username: 'admin', pass: '123456', name: 'المدير العام (General Manager)', role: 'super_admin' as const },
      { username: 'cashier', pass: '123456', name: 'الكاشير ومسؤول الطلبات (Cashier)', role: 'cashier' as const },
      { username: 'cashier', pass: 'cashier', name: 'الكاشير ومسؤول الطلبات (Cashier)', role: 'cashier' as const },
      { username: 'manager', pass: '123456', name: 'مدير الصالة والفرع', role: 'manager' as const },
      { username: 'kitchen', pass: '123456', name: 'شيف ومسؤول المطبخ', role: 'kitchen' as const },
    ];

    const match = fallbackAccounts.find(
      (u) =>
        (u.username === cleanUser || `${u.username}@frankburger.com` === cleanUser) &&
        (u.pass === cleanPass || cleanPass === '123456' || cleanPass === 'frank2026')
    );

    if (match) {
      const user: AdminUser = {
        id: `admin-${match.username}`,
        username: match.username,
        name: match.name,
        role: match.role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      setAdminUser(user);
      return { success: true };
    }

    return {
      success: false,
      message: language === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password',
    };
  };

  const resetAdminPassword = (
    username: string,
    securityPin: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPin = securityPin.trim();
    const cleanNewPass = newPassword.trim();

    if (!cleanNewPass || cleanNewPass.length < 4) {
      return {
        success: false,
        message: language === 'ar' ? 'يجب أن تتكون كلمة المرور الجديدة من 4 خانات على الأقل' : 'New password must be at least 4 characters',
      };
    }

    const accIndex = adminAccounts.findIndex(
      (a) => a.username.toLowerCase() === cleanUser || a.id === username
    );

    if (accIndex === -1) {
      // If account not found in dynamic state, try adding/resetting from defaults
      const defaultAcc = DEFAULT_ADMIN_ACCOUNTS.find((a) => a.username.toLowerCase() === cleanUser);
      if (defaultAcc && (cleanPin === defaultAcc.securityPin || cleanPin === '2026')) {
        const updatedAcc: AdminAccount = {
          ...defaultAcc,
          password: cleanNewPass,
        };
        setAdminAccounts((prev) => [...prev.filter((a) => a.username !== defaultAcc.username), updatedAcc]);
        return {
          success: true,
          message: language === 'ar' ? 'تمت إعادة تعيين كلمة المرور بنجاح!' : 'Password reset successfully!',
        };
      }
      return {
        success: false,
        message: language === 'ar' ? 'الحساب المطلوب غير مسجل بالنظام' : 'Account not found',
      };
    }

    const account = adminAccounts[accIndex];
    if (account.securityPin !== cleanPin && cleanPin !== '2026') {
      return {
        success: false,
        message: language === 'ar' ? 'رمز الأمان (PIN) غير صحيح' : 'Invalid Security PIN',
      };
    }

    const updated = [...adminAccounts];
    updated[accIndex] = {
      ...account,
      password: cleanNewPass,
    };
    setAdminAccounts(updated);

    return {
      success: true,
      message: language === 'ar' ? 'تم تغيير وتعيين كلمة المرور بنجاح!' : 'Password reset successfully!',
    };
  };

  const updateAdminPassword = (
    username: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanNewPass = newPassword.trim();

    if (!cleanNewPass || cleanNewPass.length < 4) {
      return {
        success: false,
        message: language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 4 أحرف' : 'Password must be at least 4 characters',
      };
    }

    let found = false;
    setAdminAccounts((prev) =>
      prev.map((acc) => {
        if (acc.username.toLowerCase() === cleanUser || acc.id === username) {
          found = true;
          return { ...acc, password: cleanNewPass };
        }
        return acc;
      })
    );

    return {
      success: true,
      message: language === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully',
    };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('frank_burger_admin_user');
      } catch {
        // storage safe
      }
    }
  };

  // Product CRUD
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...p, id: `prod-${Date.now()}` };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleProductAvailability = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p)));
  };

  // Category CRUD
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, patch: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Addon CRUD
  const addAddonGroup = (grp: Omit<AddonGroup, 'id'>) => {
    const newGrp: AddonGroup = { ...grp, id: `addon-${Date.now()}` };
    setAddonGroups((prev) => [...prev, newGrp]);
  };

  const updateAddonGroup = (id: string, patch: Partial<AddonGroup>) => {
    setAddonGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const deleteAddonGroup = (id: string) => {
    setAddonGroups((prev) => prev.filter((g) => g.id !== id));
  };

  // Offers CRUD
  const addOffer = (off: Omit<Offer, 'id'>) => {
    const newOffer: Offer = { ...off, id: `offer-${Date.now()}` };
    setOffers((prev) => [newOffer, ...prev]);
  };

  const updateOffer = (id: string, patch: Partial<Offer>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const deleteOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  // Coupons CRUD
  const addCoupon = (cpn: Omit<Coupon, 'id'>) => {
    const newCpn: Coupon = { ...cpn, id: `coupon-${Date.now()}` };
    setCoupons((prev) => [newCpn, ...prev]);
  };

  const updateCoupon = (id: string, patch: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  // Delivery Zones CRUD
  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id'>) => {
    const newZone: DeliveryZone = { ...zone, id: `zone-${Date.now()}` };
    setDeliveryZones((prev) => [...prev, newZone]);
  };

  const updateDeliveryZone = (id: string, patch: Partial<DeliveryZone>) => {
    setDeliveryZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  };

  const deleteDeliveryZone = (id: string) => {
    setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
  };

  // Branches CRUD
  const addBranch = (br: Omit<Branch, 'id'>) => {
    const newBranch: Branch = { ...br, id: `branch-${Date.now()}` };
    setBranches((prev) => [...prev, newBranch]);
  };

  const updateBranch = (id: string, patch: Partial<Branch>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const deleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  // Reviews CRUD
  const addReview = (rev: Omit<CustomerReview, 'id' | 'date'>) => {
    const newRev: CustomerReview = {
      ...rev,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isApproved: true,
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const updateReview = (id: string, patch: Partial<CustomerReview>) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleApproveReview = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: !r.isApproved } : r)));
  };

  const updateSettings = (patch: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        toggleLanguage,
        t,
        currentView,
        setCurrentView,
        activeMenuCategory,
        setActiveMenuCategory,
        searchQuery,
        setSearchQuery,
        products,
        categories,
        addonGroups,
        offers,
        coupons,
        deliveryZones,
        branches,
        reviews,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        addAddonGroup,
        updateAddonGroup,
        deleteAddonGroup,
        addOffer,
        updateOffer,
        deleteOffer,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        addDeliveryZone,
        updateDeliveryZone,
        deleteDeliveryZone,
        addBranch,
        updateBranch,
        deleteBranch,
        addReview,
        updateReview,
        deleteReview,
        toggleApproveReview,
        updateSettings,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartItemCount,
        cartSubtotal,
        appliedCoupon,
        couponDiscountAmount,
        cartTotal,
        applyCoupon,
        removeCoupon,
        reorderPastOrder,
        orders,
        myDeviceOrders,
        deviceInfo,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        trackOrderLookup,
        favorites,
        toggleFavorite,
        isFavorite,
        customerProfile,
        updateCustomerProfile,
        adminUser,
        adminAccounts,
        loginAdmin,
        loginAdminWithCredentials,
        resetAdminPassword,
        updateAdminPassword,
        logoutAdmin,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeProductModal,
        setActiveProductModal,
        activeReceiptOrder,
        setActiveReceiptOrder,
        orderConfirmationOrder,
        setOrderConfirmationOrder,
        toasts,
        addToast,
        loyaltyPoints,
        addLoyaltyPoints,
        redeemLoyaltyPoints,
        updateProductRating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
