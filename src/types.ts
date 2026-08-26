export type Language = 'ar' | 'en';

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  image: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isAvailable: boolean;
  ingredientsAr?: string[];
  ingredientsEn?: string[];
  calories?: number;
  availableSizes?: ProductSize[];
  allowedAddonIds?: string[];
  rating?: number;
  reviewsCount?: number;
}

export interface ProductSize {
  id: string;
  nameAr: string;
  nameEn: string;
  priceModifier: number; // e.g. +40 for Double, +80 for Triple
  isDefault?: boolean;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  order: number;
  isActive: boolean;
  image?: string;
}

export interface AddonOption {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface AddonGroup {
  id: string;
  titleAr: string;
  titleEn: string;
  minSelect: number;
  maxSelect: number;
  options: AddonOption[];
}

export interface CartItemAddon {
  groupId: string;
  groupTitleAr: string;
  groupTitleEn: string;
  optionId: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // unique per configuration
  productId: string;
  product: Product;
  selectedSize?: ProductSize;
  selectedAddons: CartItemAddon[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number; // base + size + addons
  totalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'instapay';

export type OrderType = 'delivery' | 'pickup';

export interface DeliveryZone {
  id: string;
  nameAr: string;
  nameEn: string;
  fee: number;
  minOrder: number;
  estimatedMinutes: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  googleMapsUrl: string;
  openingHoursAr: string;
  openingHoursEn: string;
  isDeliveryAvailable: boolean;
  isPickupAvailable: boolean;
  isActive: boolean;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  whatsapp?: string;
  addressStreet?: string;
  addressBuilding?: string;
  addressFloor?: string;
  addressNotes?: string;
  deliveryZoneId?: string;
  pickupBranchId?: string;
  email?: string;
}

export interface Order {
  id: string; // e.g. FB-72941
  deviceId?: string; // Device hardware identifier
  deviceMac?: string; // Device MAC address
  deviceIp?: string; // Client IP address
  customer: CustomerInfo;
  items: CartItem[];
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string; // URL for payment screenshot
  paymentStatus: 'pending' | 'paid' | 'failed';
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  orderDate: string; // ISO
  estimatedDeliveryTime: string;
  scheduledTime?: string; // e.g. "Today, 09:30 PM"
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  adminNotes?: string;
  branchId?: string;
  shiftId?: string;
  cashierName?: string;
}

export interface ShiftExpense {
  id: string;
  amount: number;
  reason: string;
  time: string; // ISO
  createdBy: string;
}

export interface CashierShift {
  id: string; // e.g. SHIFT-1001
  cashierId: string;
  cashierName: string;
  branchId?: string;
  branchNameAr?: string;
  status: 'active' | 'closed';
  startTime: string; // ISO
  endTime?: string; // ISO

  // Handover chain (استلام وتسليم)
  handedOverFromCashierName?: string; // استلم من الكاشير
  handedOverToCashierName?: string; // سلّم للكاشير

  // Financials & Balances
  startingCash: number; // العهدة النقدية / الرصيد الافتتاحي
  cashSales: number; // إجمالي مبيعات الكاش
  instapaySales: number; // إجمالي مبيعات إنستاباي
  otherSales: number; // إجمالي مبيعات أخرى
  totalSales: number; // إجمالي المبيعات

  // Orders statistics
  ordersCount: number; // عدد الطلبات المنجزة
  orderIds: string[]; // أرقام الطلبات

  // Cash Drawer Auditing (تسوية ومصروفات الدرج)
  expenses: ShiftExpense[]; // المصروفات والسحوبات
  totalExpenses: number; // إجمالي المصروفات
  expectedCashInDrawer: number; // المبلغ المتوقع بالدرج = startingCash + cashSales - totalExpenses
  actualCashInDrawer?: number; // المبلغ الفعلي المعدود بالدرج
  difference?: number; // العجز (-) أو الزيادة (+) = actualCashInDrawer - expectedCashInDrawer

  notes?: string; // ملاحظات الإغلاق أو التسليم
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
}

export interface Offer {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  image: string;
  expiresAt?: string;
  badgeAr?: string;
  badgeEn?: string;
  includedProductIds?: string[];
  isActive: boolean;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1 to 5
  commentAr: string;
  commentEn: string;
  date: string;
  isApproved: boolean;
  featured?: boolean;
}

export interface RestaurantSettings {
  restaurantNameAr: string;
  restaurantNameEn: string;
  sloganAr: string;
  sloganEn: string;
  isOpen: boolean;
  allowScheduledWhenClosed: boolean;
  phone: string;
  whatsapp: string;
  addressAr: string;
  addressEn: string;
  openingHoursAr: string;
  openingHoursEn: string;
  currencyAr: string;
  currencyEn: string;
  taxPercentage: number;
  freeDeliveryThreshold: number;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
  rushHourMode: boolean;
  estimatedPreparationTimeMinutes: number;
  facebookPixelId: string;
  tiktokPixelId: string;
  googleAnalyticsId: string;
}

export type AdminRole = 'super_admin' | 'cashier' | 'manager' | 'kitchen' | 'content_manager';

export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: AdminRole;
  securityPin: string;
  avatar?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  avatar: string;
}
