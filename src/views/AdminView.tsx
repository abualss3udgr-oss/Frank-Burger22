import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, OrderStatus, Category, Coupon, Offer, Branch } from '../types';
import { AdminLogin } from '../components/AdminLogin';
import { PeakHoursChart } from '../components/PeakHoursChart';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Percent,
  Star,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Printer,
  PhoneCall,
  MessageCircle,
  DollarSign,
  TrendingUp,
  X,
  LogOut,
  Link as LinkIcon,
  Check,
  Store,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChefHat,
  Bike,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
  MapPin,
  Flame,
  Filter,
  Copy,
  Sliders,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

// Sound alert helper using Web Audio API
const playChimeSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch {
    // browser auto-play policy guard
  }
};

const AdminDashboard: React.FC = () => {
  const {
    adminUser,
    logoutAdmin,
    setCurrentView,
    orders,
    updateOrderStatus,
    deleteOrder,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    categories,
    addCategory,
    deleteCategory,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    reviews,
    toggleApproveReview,
    deleteReview,
    settings,
    updateSettings,
    branches,
    updateBranch,
    setActiveReceiptOrder,
  } = useApp();

  const isCashier = adminUser?.role === 'cashier';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'categories' | 'coupons' | 'reviews' | 'settings'
  >(() => (isCashier ? 'orders' : 'overview'));

  // Search & Filter States
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Interactive UI states
  const [copiedLink, setCopiedLink] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrdersCount, setLastOrdersCount] = useState(orders.length);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Product Add / Edit Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: 120,
    categoryId: categories[0]?.id || '',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    calories: 680,
    isBestSeller: false,
    isAvailable: true,
    isSpicy: false,
  });

  // Category Add Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    nameAr: '',
    nameEn: '',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  });

  // Coupon Add Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 150,
    isActive: true,
  });

  // Auto sound notify on new orders
  useEffect(() => {
    if (orders.length > lastOrdersCount) {
      if (soundEnabled) {
        playChimeSound();
      }
      showFeedbackBanner('تم استلام طلب جديد في النظام!');
    }
    setLastOrdersCount(orders.length);
  }, [orders.length, lastOrdersCount, soundEnabled]);

  const showFeedbackBanner = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleCopyAdminLink = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${window.location.pathname}#admin`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Metrics calculation
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length;
  const outForDeliveryCount = orders.filter((o) => o.status === 'out_for_delivery' || o.status === 'ready').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
        return false;
      }
      // Type filter
      if (orderTypeFilter !== 'all' && o.orderType !== orderTypeFilter) {
        return false;
      }
      // Search query filter
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.trim().toLowerCase();
        const matchesId = o.id?.toLowerCase().includes(q);
        const matchesName = o.customer?.name?.toLowerCase().includes(q);
        const matchesPhone = o.customer?.phone?.includes(q);
        const matchesStreet = o.customer?.addressStreet?.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesStreet) {
          return false;
        }
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderTypeFilter, orderSearchQuery]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCategoryFilter !== 'all' && p.categoryId !== productCategoryFilter) {
        return false;
      }
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.trim().toLowerCase();
        const matchesAr = p.nameAr?.toLowerCase().includes(q);
        const matchesEn = p.nameEn?.toLowerCase().includes(q);
        if (!matchesAr && !matchesEn) return false;
      }
      return true;
    });
  }, [products, productCategoryFilter, productSearchQuery]);

  // Product Actions
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProdForm({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      price: 120,
      categoryId: categories[0]?.id || '',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      calories: 680,
      isBestSeller: false,
      isAvailable: true,
      isSpicy: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdForm({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.nameAr || !prodForm.price) return;

    if (editingProductId) {
      updateProduct(editingProductId, prodForm);
      showFeedbackBanner('تم تحديث الصنف بنجاح');
    } else {
      addProduct({
        nameAr: prodForm.nameAr || 'صنف جديد',
        nameEn: prodForm.nameEn || prodForm.nameAr || 'New Item',
        descriptionAr: prodForm.descriptionAr || '',
        descriptionEn: prodForm.descriptionEn || '',
        price: Number(prodForm.price) || 100,
        categoryId: prodForm.categoryId || categories[0]?.id || 'burgers',
        image: prodForm.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        calories: Number(prodForm.calories) || 600,
        isBestSeller: Boolean(prodForm.isBestSeller),
        isAvailable: prodForm.isAvailable !== false,
        isSpicy: Boolean(prodForm.isSpicy),
      });
      showFeedbackBanner('تمت إضافة صنف جديد للقائمة');
    }
    setIsProductModalOpen(false);
  };

  // Category Actions
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nameAr) return;
    addCategory({
      nameAr: catForm.nameAr,
      nameEn: catForm.nameEn || catForm.nameAr,
      image: catForm.image,
    });
    setCatForm({ nameAr: '', nameEn: '', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' });
    setIsCategoryModalOpen(false);
    showFeedbackBanner('تمت إضافة القسم الجديد');
  };

  // Coupon Actions
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue) return;

    addCoupon({
      code: couponForm.code.trim().toUpperCase(),
      discountType: couponForm.discountType || 'percentage',
      discountValue: Number(couponForm.discountValue),
      minOrder: Number(couponForm.minOrder || 0),
      isActive: true,
    });
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrder: 150,
      isActive: true,
    });
    setIsCouponModalOpen(false);
    showFeedbackBanner('تم إنشاء كود الخصم الجديد');
  };

  // Status mapping in Arabic
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'جديد معلق',
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: Clock,
        };
      case 'confirmed':
        return {
          label: 'تم التأكيد',
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          icon: CheckCircle2,
        };
      case 'preparing':
        return {
          label: 'قيد التحضير بالمطبخ',
          bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          icon: ChefHat,
        };
      case 'ready':
        return {
          label: 'جاهز للاستلام',
          bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
          icon: CheckCircle2,
        };
      case 'out_for_delivery':
        return {
          label: 'خرج للتوصيل مع المندوب',
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          icon: Bike,
        };
      case 'delivered':
        return {
          label: 'تم التسليم بنجاح',
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'cancelled':
        return {
          label: 'طلب ملغي',
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          icon: X,
        };
      default:
        return {
          label: status,
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          icon: Clock,
        };
    }
  };

  const getPaymentMethodNameAr = (method: string) => {
    switch (method) {
      case 'cash_on_delivery':
        return 'نقداً عند الاستلام (كاش)';
      case 'instapay':
        return 'إنستاباي (InstaPay)';
      case 'card_on_delivery':
        return 'بطاقة ائتمان عند الاستلام (POS)';
      case 'vodafone_cash_instapay':
        return 'فودافون كاش / إنستاباي';
      case 'online_card':
        return 'دفع إلكتروني مباشر';
      default:
        return method;
    }
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 text-start font-sans select-none">
      {/* Dynamic Feedback Banner */}
      {actionSuccessMessage && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-300 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Top Header Bar */}
      <header className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        {/* Restaurant Identity & Live Indicator */}
        <div className="flex items-center gap-3.5">
          {!isCashier && (
            <img 
              src="https://res.cloudinary.com/fwxyu7hh/image/upload/v1787696964/Artboard_2_9x.png" 
              alt="Frank Burger" 
              className="h-12 sm:h-14 w-auto object-contain shrink-0"
            />
          )}
          <div>
            {!isCashier && (
              <>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-xl font-black text-zinc-900 font-heading tracking-tight">
                    لوحة تحكم وإدارة المطعم
                  </h1>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>مباشر متصل</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  نظام إدارة الطلبات الحية، المطبخ، نقاط البيع والمنيو — {settings.restaurantNameAr}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Center Logo for Cashier */}
        {isCashier && (
          <div className="flex justify-center my-1 md:my-0 md:absolute md:left-1/2 md:-translate-x-1/2">
            <img 
              src="https://res.cloudinary.com/fwxyu7hh/image/upload/v1787696964/Artboard_2_9x.png" 
              alt="Frank Burger" 
              className="h-14 sm:h-16 w-auto object-contain shrink-0"
            />
          </div>
        )}

        {/* Action Controls & User Identity */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Logged-in User Badge */}
          {adminUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                adminUser.role === 'cashier' ? 'bg-amber-500 text-zinc-950' : 'bg-[#E51E2A] text-white'
              }`}>
                {adminUser.role === 'cashier' ? <ChefHat className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              </div>
              <div className="text-start">
                <span className="font-bold text-zinc-900 block leading-tight text-[11px]">{adminUser.name}</span>
                <span className="text-[10px] text-zinc-500 block leading-none font-mono">@{adminUser.username}</span>
              </div>
            </div>
          )}

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (nextState) playChimeSound();
            }}
            title={soundEnabled ? 'التنبيهات الصوتية مفعلة' : 'التنبيهات الصوتية معطلة'}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] font-bold hidden sm:inline">
              {soundEnabled ? 'صوت التنبيه: شغال' : 'صوت التنبيه: صامت'}
            </span>
          </button>

          {/* Direct Admin URL Link copy - Only for non-cashier */}
          {!isCashier && (
            <button
              onClick={handleCopyAdminLink}
              title="نسخ الرابط المباشر لصفحة الإدارة"
              className="text-xs bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold text-[11px]">تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span dir="ltr" className="text-[11px] font-mono text-zinc-500 font-bold">/#admin</span>
                  <span className="text-[11px] text-zinc-700 font-semibold">نسخ</span>
                </>
              )}
            </button>
          )}

          {/* Store Open / Closed Switch - Only for non-cashier */}
          {!isCashier && (
            <button
              onClick={() => {
                const newState = !settings.isStoreOpen;
                updateSettings({ isStoreOpen: newState });
                showFeedbackBanner(newState ? 'المطعم الآن يستقبل الطلبات' : 'تم إغلاق استقبال الطلبات مؤقتاً');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                settings.isStoreOpen
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.isStoreOpen ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>
                {settings.isStoreOpen ? 'استقبال الطلبات: مفتوح' : 'المطعم: مغلق مؤقتاً'}
              </span>
            </button>
          )}

          {/* View Customer Storefront - Only for non-cashier */}
          {!isCashier && (
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="الانتقال لمتجر العملاء"
              className="text-xs bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-xl px-3 py-2 flex items-center gap-1.5 transition-colors cursor-pointer font-semibold"
            >
              <Store className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px]">عرض المتجر</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logoutAdmin}
            title="تسجيل الخروج من لوحة التحكم"
            className="text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-900 rounded-xl px-3 py-2 flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">خروج</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout with Sidebar & Content Area */}
      <div className={isCashier ? 'w-full space-y-6' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'}>
        {/* Sidebar Navigation - Only if not cashier */}
        {!isCashier && (
          <aside className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-4 sticky top-6">
            <div className="px-3 py-2 border-b border-zinc-100">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                قائمة التنقل السريع
              </span>
            </div>

          <nav className="space-y-1.5">
            {/* Overview - Manager Only */}
            {(adminUser?.role === 'super_admin' || adminUser?.role === 'manager') && (
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>نظرة عامة وإحصائيات</span>
                </div>
                <ChevronLeft className={`w-3.5 h-3.5 ${activeTab === 'overview' ? 'text-white' : 'text-zinc-400'}`} />
              </button>
            )}

            {/* Orders - Available for All (Cashier & Manager) */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer relative ${
                activeTab === 'orders'
                  ? 'bg-[#E51E2A] text-white shadow-md'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>الطلبات الحية (KDS / POS)</span>
              </div>
              <div className="flex items-center gap-2">
                {pendingOrdersCount > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-white text-[#E51E2A]' : 'bg-[#E51E2A] text-white'
                  } animate-pulse`}>
                    {pendingOrdersCount}
                  </span>
                )}
                <ChevronLeft className={`w-3.5 h-3.5 ${activeTab === 'orders' ? 'text-white' : 'text-zinc-400'}`} />
              </div>
            </button>

            {/* Products - Manager Only */}
            {(adminUser?.role === 'super_admin' || adminUser?.role === 'manager' || adminUser?.role === 'content_manager') && (
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-4 h-4 shrink-0" />
                  <span>قائمة الطعام والأسعار</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {products.length}
                  </span>
                  <ChevronLeft className={`w-3.5 h-3.5 ${activeTab === 'products' ? 'text-white' : 'text-zinc-400'}`} />
                </div>
              </button>
            )}

            {/* Categories - Manager Only */}
            {(adminUser?.role === 'super_admin' || adminUser?.role === 'manager' || adminUser?.role === 'content_manager') && (
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>أقسام المنيو</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {categories.length}
                  </span>
                  <ChevronLeft className={`w-3.5 h-3.5 ${activeTab === 'categories' ? 'text-white' : 'text-zinc-400'}`} />
                </div>
              </button>
            )}

            {/* Coupons - Manager Only */}
            {(adminUser?.role === 'super_admin' || adminUser?.role === 'manager') && (
              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'coupons'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Percent className="w-4 h-4 shrink-0" />
                  <span>كوبونات الخصم</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    activeTab === 'coupons' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {coupons.length}
                  </span>
                  <ChevronLeft className={`w-3.5 h-3.5 ${activeTab === 'coupons' ? 'text-white' : 'text-zinc-400'}`} />
                </div>
              </button>
            )}

            {/* Reviews - Manager Only */}
            {(adminUser?.role === 'super_admin' || adminUser?.role === 'manager') && (
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 shrink-0" />
                  <span>تقييمات وآراء العملاء</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {reviews.length}
                  </span>
                  <ChevronLeft className={`w-3.5 h-3.5 ${activeTab === 'reviews' ? 'text-white' : 'text-zinc-400'}`} />
                </div>
              </button>
            )}

            {/* Settings - Manager Only */}
            {(adminUser?.role === 'super_admin' || adminUser?.role === 'manager') && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#E51E2A] text-white shadow-md'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>إعدادات المطعم والفروع</span>
                </div>
                <ChevronLeft className={`w-3.5 h-3.5 ${activeTab === 'settings' ? 'text-white' : 'text-zinc-400'}`} />
              </button>
            )}
          </nav>

          {/* Role Helper Info Box */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E51E2A]" />
              <span>صلاحيات الحساب</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {adminUser?.role === 'cashier' 
                ? 'أنت مسجل كـ "كاشير ومسئول طلبات". مهامك مقتصرة على متابعة الطلبات الحية، تجهيزها، وإرسال تحديثات الحالة للعملاء أولاً بأول.'
                : 'أنت مسجل كـ "المدير العام". لديك صلاحيات كاملة لإدارة المنيو، الأسعار، الإحصائيات، الكوبونات، والإعدادات.'}
            </p>
          </div>
        </aside>
        )}

        {/* Main Content Area */}
        <main className={isCashier ? 'w-full space-y-6' : 'lg:col-span-9 space-y-6'}>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & PERFORMANCE STATS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Revenue */}
            <div className="bg-[#121216] border border-[#24242e] p-4 rounded-2xl space-y-2 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold">
                <span>إجمالي المبيعات النشطة</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                <span>{totalRevenue.toLocaleString()}</span>
                <span className="text-xs text-[#E51E2A] font-sans font-bold">جنيه مصري</span>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>شامل كافة الطلبات المكتملة والحالية</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-[#121216] border border-[#24242e] p-4 rounded-2xl space-y-2 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold">
                <span>إجمالي عدد الطلبات</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                <span>{totalOrdersCount}</span>
                <span className="text-xs text-zinc-400 font-sans font-normal">طلب</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                <span className="text-blue-400 font-bold">{preparingOrdersCount + outForDeliveryCount}</span> قيد التنفيذ والتوصيل حالياً
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-[#121216] border border-[#24242e] p-4 rounded-2xl space-y-2 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold">
                <span>طلبات جديدة بانتظار التأكيد</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono flex items-baseline gap-1.5">
                <span>{pendingOrdersCount}</span>
                <span className="text-xs text-amber-500/80 font-sans font-bold">جديد</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                {pendingOrdersCount > 0 ? (
                  <span className="text-amber-400 font-bold animate-pulse">يرجى قبول وتأكيد الطلبات فوراً</span>
                ) : (
                  <span className="text-emerald-400">تمت معالجة جميع الطلبات الواردة</span>
                )}
              </div>
            </div>

            {/* Average Basket Value */}
            <div className="bg-[#121216] border border-[#24242e] p-4 rounded-2xl space-y-2 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold">
                <span>متوسط قيمة الفاتورة</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                <span>{avgOrderValue}</span>
                <span className="text-xs text-[#E51E2A] font-sans font-bold">جنيه / طلب</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                معدل إنفاق العميل للوجبة الواحدة
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts Grid */}
          <div className="bg-[#121216] border border-[#24242e] rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>إجراءات سريعة ومباشرة</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setOrderStatusFilter('pending');
                }}
                className="p-3 rounded-xl bg-[#18181f] hover:bg-[#22222c] border border-[#2c2c36] text-start transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  مراجعة الطلبات المعلقة
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                  {pendingOrdersCount} طلب بانتظار التأكيد
                </div>
              </button>

              <button
                onClick={handleOpenNewProduct}
                className="p-3 rounded-xl bg-[#18181f] hover:bg-[#22222c] border border-[#2c2c36] text-start transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E51E2A]/15 text-[#E51E2A] flex items-center justify-center mb-2">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white group-hover:text-[#E51E2A] transition-colors">
                  إضافة صنف جديد للمنيو
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  تحديد السعر والصورة والوصف
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('coupons');
                  setIsCouponModalOpen(true);
                }}
                className="p-3 rounded-xl bg-[#18181f] hover:bg-[#22222c] border border-[#2c2c36] text-start transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2">
                  <Percent className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                  إنشاء كود خصم جديد
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  حملات ترويجية للعملاء
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="p-3 rounded-xl bg-[#18181f] hover:bg-[#22222c] border border-[#2c2c36] text-start transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center mb-2">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  تعديل أرقام الفرع وساعات العمل
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  الواتساب، الفروع، والضريبة
                </div>
              </button>
            </div>
          </div>

          {/* Peak Hours Statistical Chart */}
          <PeakHoursChart orders={orders} />

          {/* Recent Orders Live Table */}
          <div className="bg-[#121216] border border-[#24242e] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-heading">
                  أحدث الطلبات الواردة للمطعم
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#18181f] border border-[#2c2c36] text-zinc-400 font-mono">
                  {orders.length} طلب إجمالي
                </span>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-[#E51E2A] hover:underline font-bold cursor-pointer"
              >
                عرض كافة الطلبات الحية ←
              </button>
            </div>

            <div className="divide-y divide-[#202028]">
              {orders.slice(0, 5).map((o) => {
                const badge = getStatusBadge(o.status);
                const BadgeIcon = badge.icon;
                return (
                  <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-white text-sm">#{o.id}</span>
                        <span className="font-bold text-zinc-200">{o.customer?.name || 'عميل'}</span>
                        <span className="text-zinc-500 text-[11px]" dir="ltr">
                          {o.customer?.phone || ''}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            o.orderType === 'delivery'
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {o.orderType === 'delivery' ? 'توصيل منزلي 🛵' : 'استلام من الفرع 🏬'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                        <span>{o.items.length} أصناف</span>
                        <span>•</span>
                        <span>{new Date(o.orderDate).toLocaleTimeString('ar-EG')}</span>
                        <span>•</span>
                        <span className="text-zinc-500 truncate max-w-[200px]">
                          {o.customer?.addressStreet || 'استلام فرع'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-end">
                        <div className="font-mono font-black text-white text-sm">
                          {o.total} <span className="text-[10px] text-[#E51E2A] font-sans">ج.م</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {getPaymentMethodNameAr(o.paymentMethod)}
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${badge.bg}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </div>

                      <button
                        onClick={() => setActiveReceiptOrder(o)}
                        title="طباعة إيصال حراري للطلب"
                        className="p-2 rounded-xl bg-[#18181f] hover:bg-[#252530] border border-[#2c2c36] text-zinc-300 hover:text-white cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE ORDERS MANAGEMENT (KDS & POS) */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Top Search & Filter Bar */}
          <div className="bg-[#121216] border border-[#262630] rounded-2xl p-4 space-y-3.5 shadow-md">
            {/* Search Input and Type filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-zinc-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="ابحث برقم الطلب (مثال FB-1234) أو اسم العميل أو رقم الهاتف..."
                  className="w-full bg-[#18181f] border border-[#2c2c38] focus:border-[#E51E2A] rounded-xl py-2.5 ps-10 pe-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Order Type Toggle */}
              <div className="flex items-center gap-1 bg-[#18181f] p-1 rounded-xl border border-[#2c2c38] shrink-0">
                <button
                  onClick={() => setOrderTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    orderTypeFilter === 'all' ? 'bg-[#E51E2A] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  الكل ({orders.length})
                </button>
                <button
                  onClick={() => setOrderTypeFilter('delivery')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    orderTypeFilter === 'delivery' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  توصيل 🛵 ({orders.filter((o) => o.orderType === 'delivery').length})
                </button>
                <button
                  onClick={() => setOrderTypeFilter('pickup')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    orderTypeFilter === 'pickup' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  استلام فرع 🏬 ({orders.filter((o) => o.orderType === 'pickup').length})
                </button>
              </div>
            </div>

            {/* Status Pills with Quick Count Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'كافة الطلبات', count: orders.length },
                { id: 'pending', label: 'معلق جديد', count: pendingOrdersCount, alert: pendingOrdersCount > 0 },
                { id: 'confirmed', label: 'تم التأكيد', count: orders.filter((o) => o.status === 'confirmed').length },
                { id: 'preparing', label: 'قيد التحضير بالمطبخ', count: orders.filter((o) => o.status === 'preparing').length },
                { id: 'out_for_delivery', label: 'خرج للتوصيل', count: orders.filter((o) => o.status === 'out_for_delivery').length },
                { id: 'delivered', label: 'تم التسليم', count: deliveredCount },
                { id: 'cancelled', label: 'ملغي', count: orders.filter((o) => o.status === 'cancelled').length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    orderStatusFilter === f.id
                      ? 'bg-[#E51E2A] text-white shadow-md shadow-[#E51E2A]/20'
                      : 'bg-[#18181f] text-zinc-400 hover:text-white border border-[#282832]'
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      f.alert
                        ? 'bg-amber-400 text-black font-black animate-pulse'
                        : orderStatusFilter === f.id
                        ? 'bg-black/30 text-white'
                        : 'bg-[#24242e] text-zinc-400'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Orders List */}
          <div className="space-y-3.5">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-[#121216] border border-[#24242e] rounded-2xl text-zinc-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
                <div className="text-sm font-bold text-zinc-200">لا توجد طلبات تطابق الفلتر أو البحث حالياً</div>
                <div className="text-xs text-zinc-500">جرب تغيير حالة الفلتر أو البحث باسم آخر</div>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const BadgeIcon = badge.icon;
                const orderMinutesAgo = Math.floor((Date.now() - new Date(order.orderDate).getTime()) / 60000);
                const isDelayed = order.status !== 'delivered' && order.status !== 'cancelled' && orderMinutesAgo > 30;

                return (
                  <div
                    key={order.id}
                    className={`bg-[#121216] border rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg transition-all ${
                      order.status === 'pending'
                        ? 'border-amber-500/50 bg-[#151412]'
                        : isDelayed
                        ? 'border-rose-500/40 bg-[#161213]'
                        : 'border-[#24242e]'
                    }`}
                  >
                    {/* Header Row: Order ID, Type, Date, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#22222a]">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-base font-black text-white font-mono bg-[#181820] border border-[#2e2e3a] px-2.5 py-1 rounded-xl">
                          #{order.id}
                        </span>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 ${
                            order.orderType === 'delivery'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {order.orderType === 'delivery' ? (
                            <>
                              <Bike className="w-3.5 h-3.5" />
                              <span>توصيل للمنزل</span>
                            </>
                          ) : (
                            <>
                              <Store className="w-3.5 h-3.5" />
                              <span>استلام من الفرع</span>
                            </>
                          )}
                        </span>

                        <div className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{new Date(order.orderDate).toLocaleTimeString('ar-EG')}</span>
                          <span className="text-zinc-500 font-mono text-[11px]">
                            (منذ {orderMinutesAgo} دقيقة)
                          </span>
                        </div>

                        {isDelayed && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>تنبيه: متأخر</span>
                          </span>
                        )}
                      </div>

                      {/* Print Thermal Receipt & Quick Status Selector */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => setActiveReceiptOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-[#181820] hover:bg-[#252532] text-zinc-200 border border-[#2e2e3a] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-zinc-400" />
                          <span>طباعة بون</span>
                        </button>

                        <select
                          value={order.status}
                          onChange={(e) => {
                            updateOrderStatus(order.id, e.target.value as OrderStatus);
                            showFeedbackBanner(`تم تحديث حالة الطلب #${order.id}`);
                          }}
                          className="bg-[#181820] text-xs font-bold text-white border border-[#2e2e3a] rounded-xl py-1.5 px-3 focus:outline-none focus:border-[#E51E2A] cursor-pointer"
                        >
                          <option value="pending">معلق جديد ⏳</option>
                          <option value="confirmed">تم التأكيد ✓</option>
                          <option value="preparing">قيد التحضير بالمطبخ 👨‍🍳</option>
                          <option value="ready">جاهز للاستلام 📦</option>
                          <option value="out_for_delivery">خرج للتوصيل 🛵</option>
                          <option value="delivered">تم التسليم بنجاح 🎉</option>
                          <option value="cancelled">ملغي ❌</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Address Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#16161b] p-3.5 rounded-xl border border-[#24242e] text-xs">
                      {/* Customer Name */}
                      <div>
                        <span className="text-zinc-500 block text-[10px] font-semibold mb-0.5">اسم العميل:</span>
                        <div className="font-bold text-white text-sm">
                          {order.customer?.name || 'عميل غير مسجل'}
                        </div>
                      </div>

                      {/* Phone & Instant WhatsApp */}
                      <div>
                        <span className="text-zinc-500 block text-[10px] font-semibold mb-0.5">رقم الهاتف والتواصل:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.customer?.phone || ''}`}
                            className="text-[#E51E2A] hover:underline font-mono font-bold flex items-center gap-1 bg-[#1d1d24] px-2 py-0.5 rounded-lg border border-[#2e2e3a]"
                          >
                            <PhoneCall className="w-3 h-3 text-[#E51E2A]" />
                            <span dir="ltr">{order.customer?.phone || ''}</span>
                          </a>

                          {order.customer?.phone && (
                            <a
                              href={`https://wa.me/20${order.customer.phone.replace(/^0+/, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="محادثة واتساب سريعة"
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Address & Delivery Notes */}
                      <div>
                        <span className="text-zinc-500 block text-[10px] font-semibold mb-0.5">
                          {order.orderType === 'delivery' ? 'عنوان التوصيل:' : 'فرع الاستلام:'}
                        </span>
                        <div className="text-zinc-200 font-medium">
                          {order.orderType === 'delivery' ? (
                            <>
                              <span className="block truncate">{order.customer?.addressStreet || 'العنوان غير محدد'}</span>
                              {order.customer?.addressBuilding && (
                                <span className="text-zinc-400 text-[11px] block">
                                  عمارة: {order.customer.addressBuilding} {order.customer.addressFloor ? `• طابق: ${order.customer.addressFloor}` : ''}
                                </span>
                              )}
                              {order.customer?.addressNotes && (
                                <span className="text-amber-400 text-[10px] block mt-0.5">
                                  ملاحظة: {order.customer.addressNotes}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-amber-400 font-bold">استلام مباشر من الفرع</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="space-y-1.5 bg-[#141418] p-3 rounded-xl border border-[#202028]">
                      <div className="text-[11px] font-bold text-zinc-400 mb-1 border-b border-[#22222a] pb-1 flex justify-between">
                        <span>الأصناف المطلوبة ({order.items.length})</span>
                        <span>السعر الإجمالي</span>
                      </div>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs text-zinc-200">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="w-5 h-5 rounded-md bg-[#E51E2A]/20 text-[#E51E2A] flex items-center justify-center font-mono text-[11px]">
                                {item.quantity}x
                              </span>
                              <span>{item.product?.nameAr || 'صنف'}</span>
                              {item.selectedSize && (
                                <span className="text-zinc-400 text-[11px] font-normal">
                                  ({item.selectedSize.nameAr})
                                </span>
                              )}
                            </div>

                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                              <div className="text-[11px] text-zinc-400 ps-6">
                                + إضافات: {item.selectedAddons.map((a) => a.nameAr).join('، ')}
                              </div>
                            )}

                            {item.specialInstructions && (
                              <div className="text-[10px] text-amber-400 ps-6 italic">
                                ملاحظة خاصة: "{item.specialInstructions}"
                              </div>
                            )}
                          </div>

                          <span className="font-mono font-bold text-white">
                            {item.totalPrice} <span className="text-[10px] text-zinc-400">ج.م</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Financials & Stage Advancer Buttons */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                      {/* Financials Summary */}
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-zinc-500 text-[10px] block">طريقة الدفع:</span>
                          <span className="font-bold text-zinc-200">
                            {getPaymentMethodNameAr(order.paymentMethod)}
                          </span>
                        </div>

                        {order.paymentProofUrl && (
                          <>
                            <div className="h-6 w-px bg-[#262630]" />
                            <div>
                              <span className="text-zinc-500 text-[10px] block">إيصال التحويل:</span>
                              <button
                                onClick={() => {
                                  const win = window.open();
                                  if (win) {
                                    win.document.write(`<img src="${order.paymentProofUrl}" style="max-width:100%; height:auto;" />`);
                                  }
                                }}
                                className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                              >
                                عرض إيصال إنستاباي 📸
                              </button>
                            </div>
                          </>
                        )}

                        <div className="h-6 w-px bg-[#262630]" />

                        <div>
                          <span className="text-zinc-500 text-[10px] block">الإجمالي الكلي:</span>
                          <span className="text-base font-black text-white font-mono">
                            {order.total} <span className="text-xs text-[#E51E2A] font-sans font-bold">جنيه</span>
                          </span>
                        </div>
                      </div>

                      {/* 1-Click Fast Stage Advance Workflow */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'confirmed');
                              showFeedbackBanner(`تم تأكيد الطلب #${order.id}`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>قبول وتأكيد الطلب</span>
                          </button>
                        )}

                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'preparing');
                              showFeedbackBanner(`تم تحويل الطلب #${order.id} للمطبخ`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>بدء التحضير بالمطبخ</span>
                          </button>
                        )}

                        {order.status === 'preparing' && order.orderType === 'delivery' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'out_for_delivery');
                              showFeedbackBanner(`الطلب #${order.id} خرج مع المندوب للتوصيل`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>تسليم للمندوب (خروج للتوصيل)</span>
                          </button>
                        )}

                        {order.status === 'preparing' && order.orderType === 'pickup' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'ready');
                              showFeedbackBanner(`الطلب #${order.id} جاهز للاستلام بالفرع`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>جاهز للاستلام بالفرع</span>
                          </button>
                        )}

                        {(order.status === 'out_for_delivery' || order.status === 'ready') && (
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'delivered');
                              showFeedbackBanner(`تم تسليم الطلب #${order.id} بنجاح`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم التسليم بنجاح</span>
                          </button>
                        )}

                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من رغبتك في إلغاء الطلب #${order.id}؟`)) {
                                updateOrderStatus(order.id, 'cancelled');
                                showFeedbackBanner(`تم إلغاء الطلب #${order.id}`);
                              }
                            }}
                            className="px-2.5 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-500/20 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            إلغاء
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من رغبتك في حذف الطلب #${order.id} نهائياً؟`)) {
                              deleteOrder(order.id);
                              showFeedbackBanner(`تم حذف الطلب #${order.id}`);
                            }
                          }}
                          className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRODUCTS & MENU MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Top Bar: Search, Category Filter, Add Button */}
          <div className="bg-[#121216] border border-[#262630] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="ابحث عن صنف بالاسم..."
                className="w-full bg-[#18181f] border border-[#2c2c38] focus:border-[#E51E2A] rounded-xl py-2 ps-10 pe-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>

            {/* Category Select Filter */}
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#E51E2A] cursor-pointer shrink-0"
            >
              <option value="all">كافة الأقسام ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr} ({products.filter((p) => p.categoryId === c.id).length})
                </option>
              ))}
            </select>

            {/* Add New Product Button */}
            <button
              onClick={handleOpenNewProduct}
              className="px-4 py-2 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-[#E51E2A]/25"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <div
                  key={p.id}
                  className="bg-[#121216] border border-[#24242e] rounded-2xl p-3.5 flex gap-3.5 items-center justify-between shadow-md hover:border-[#383846] transition-all"
                >
                  {/* Product Image */}
                  <img
                    src={p.image}
                    alt={p.nameAr}
                    className="w-16 h-16 rounded-xl object-cover bg-black shrink-0 border border-[#24242e]"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate font-heading">
                        {p.nameAr}
                      </h4>
                      {p.isBestSeller && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 shrink-0">
                          أكثر طلباً
                        </span>
                      )}
                      {p.isSpicy && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold shrink-0">
                          🌶️ حار
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-400 truncate">
                      {cat?.nameAr || 'قسم عام'} • {p.calories || 600} سعرة
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-mono font-black text-[#E51E2A]">
                        {p.price} <span className="text-[10px] font-sans font-normal text-zinc-400">جنيه</span>
                      </div>

                      {/* Stock Switch */}
                      <button
                        onClick={() => {
                          toggleProductAvailability(p.id);
                          showFeedbackBanner(
                            p.isAvailable ? `تم تحديد الصنف "${p.nameAr}" كغير متوفر` : `تم تحديد الصنف "${p.nameAr}" كمتوفر`
                          );
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer border ${
                          p.isAvailable
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                        }`}
                      >
                        {p.isAvailable ? 'متوفر بالمطبخ' : 'نفد المخزون'}
                      </button>
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex flex-col gap-1.5 shrink-0 border-s border-[#22222a] ps-2.5">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      title="تعديل بيانات وسعر الصنف"
                      className="p-2 rounded-xl bg-[#18181f] hover:bg-[#252530] text-zinc-300 hover:text-white border border-[#282832] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف الصنف "${p.nameAr}"؟`)) {
                          deleteProduct(p.id);
                          showFeedbackBanner('تم حذف الصنف من المنيو');
                        }
                      }}
                      title="حذف الصنف نهائياً"
                      className="p-2 rounded-xl bg-[#18181f] hover:bg-rose-900/30 text-zinc-400 hover:text-rose-400 border border-[#282832] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CATEGORIES */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#121216] border border-[#262630] rounded-2xl p-4">
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                أقسام قائمة الطعام (Categories)
              </h2>
              <p className="text-xs text-zinc-400">
                تنظيم وجبات وأصناف المنيو في أقسام مريحة للعميل
              </p>
            </div>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 bg-[#121216] border border-[#24242e] rounded-2xl flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.nameAr}
                      className="w-12 h-12 rounded-xl object-cover bg-black border border-[#262630]"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{cat.nameAr}</div>
                      <div className="text-xs text-zinc-400 font-sans">{cat.nameEn}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#181820] text-zinc-300 px-2.5 py-1 rounded-xl border border-[#262630]">
                      {count} صنف
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف قسم "${cat.nameAr}"؟`)) {
                          deleteCategory(cat.id);
                          showFeedbackBanner('تم حذف القسم');
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COUPONS */}
      {/* ========================================================================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#121216] border border-[#262630] rounded-2xl p-4">
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                كوبونات وأكواد الخصم الترويجية
              </h2>
              <p className="text-xs text-zinc-400">
                إنشاء عروض ترويجية ونسب خصم لتشجيع العملاء
              </p>
            </div>

            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء كود خصم جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-[#121216] border border-[#24242e] rounded-2xl flex items-center justify-between gap-3 shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-mono font-black text-[#E51E2A] bg-[#1a1415] border border-[#E51E2A]/30 px-2 py-0.5 rounded-lg">
                      {c.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(c.code);
                        showFeedbackBanner(`تم نسخ الكود ${c.code}`);
                      }}
                      className="text-zinc-500 hover:text-white p-1 cursor-pointer"
                      title="نسخ الكود"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-zinc-200 font-bold">
                    {c.discountType === 'percentage'
                      ? `خصم ${c.discountValue}% من الإجمالي`
                      : `خصم مباشر ${c.discountValue} جنيه`}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    الحد الأدنى للطلب: {c.minOrder || 0} جنيه
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => {
                      updateCoupon(c.id, { isActive: !c.isActive });
                      showFeedbackBanner(c.isActive ? 'تم تعطيل الكود' : 'تم تفعيل الكود');
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                      c.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {c.isActive ? 'مفعل وشغال' : 'معطل مؤقتاً'}
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف كود الخصم "${c.code}"؟`)) {
                        deleteCoupon(c.id);
                        showFeedbackBanner('تم حذف الكود');
                      }
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: REVIEWS MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-[#121216] border border-[#262630] rounded-2xl p-4">
            <h2 className="text-base font-bold text-white font-heading">
              مراجعة تقييمات وآراء العملاء
            </h2>
            <p className="text-xs text-zinc-400">
              الموافقة على آراء العملاء لعرضها على واجهة المتجر الرئيسية
            </p>
          </div>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-[#121216] border border-[#24242e] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white text-sm">{r.customerName}</span>
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">{r.date}</span>
                  </div>
                  <p className="text-xs text-zinc-300 italic">"{r.commentAr}"</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      toggleApproveReview(r.id);
                      showFeedbackBanner(r.isApproved ? 'تم إخفاء التقييم' : 'تمت الموافقة ونشر التقييم');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      r.isApproved
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
                    }`}
                  >
                    {r.isApproved ? 'معروض بالمتجر ✓' : 'مخفي (انقر للموافقة)'}
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                        deleteReview(r.id);
                        showFeedbackBanner('تم حذف التقييم');
                      }
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-400 cursor-pointer rounded-xl bg-[#18181f] border border-[#24242e]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SETTINGS & BRANCHES */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Store Settings Form */}
          <div className="bg-[#121216] border border-[#24242e] rounded-2xl p-5 space-y-4 shadow-md">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#E51E2A]" />
              <span>إعدادات الاتصال والخدمة العامة</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  رقم الهاتف الرئيسي للفرع:
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-white font-mono outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  رقم خط الواتساب الساخن للطلبات:
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => updateSettings({ whatsapp: e.target.value })}
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-white font-mono outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    حد التوصيل المجاني (جنيه):
                  </label>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => updateSettings({ freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-white font-mono outline-none focus:border-[#E51E2A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    نسبة الضريبة المضافة (%):
                  </label>
                  <input
                    type="number"
                    value={settings.taxPercentage}
                    onChange={(e) => updateSettings({ taxPercentage: Number(e.target.value) })}
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-white font-mono outline-none focus:border-[#E51E2A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Settings */}
          <div className="bg-[#121216] border border-[#24242e] rounded-2xl p-5 space-y-4 shadow-md">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-400" />
              <span>إعدادات التتبع والتحليلات (Pixels/Codes)</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  Facebook Pixel ID:
                </label>
                <input
                  type="text"
                  value={settings.facebookPixelId || ''}
                  onChange={(e) => updateSettings({ facebookPixelId: e.target.value })}
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-white font-mono outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  TikTok Pixel ID:
                </label>
                <input
                  type="text"
                  value={settings.tiktokPixelId || ''}
                  onChange={(e) => updateSettings({ tiktokPixelId: e.target.value })}
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-white font-mono outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">
                  Google Analytics ID:
                </label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => updateSettings({ googleAnalyticsId: e.target.value })}
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl py-2 px-3 text-white font-mono outline-none focus:border-[#E51E2A]"
                />
              </div>
            </div>
          </div>

          {/* Branches Manager */}
          <div className="bg-[#121216] border border-[#24242e] rounded-2xl p-5 space-y-4 shadow-md">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>فروع مطعم فرانك برجر</span>
            </h2>

            <div className="space-y-3">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 bg-[#18181f] border border-[#2c2c38] rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#E51E2A]" />
                      <span>{b.nameAr}</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 text-[11px]">
                      مفتوح ويستقبل طلبات
                    </span>
                  </div>

                  <div className="text-zinc-400">{b.addressAr}</div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-[#262632]">
                    <span dir="ltr" className="font-mono text-zinc-300">
                      📞 {b.phone}
                    </span>
                    <span>ساعات العمل: {b.openingHoursAr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PRODUCT MODAL (ARABIC) */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#282834] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-[#24242e]">
              <h3 className="text-base font-black text-white font-heading">
                {editingProductId ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد لقائمة الطعام'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-[#1f1f28] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              {/* Name Arabic & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم الصنف بالعربي *</label>
                  <input
                    type="text"
                    value={prodForm.nameAr || ''}
                    onChange={(e) => setProdForm({ ...prodForm, nameAr: e.target.value })}
                    placeholder="مثال: فرانك دبل سماش برجر"
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white outline-none focus:border-[#E51E2A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الاسم بالإنجليزي</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={prodForm.nameEn || ''}
                    onChange={(e) => setProdForm({ ...prodForm, nameEn: e.target.value })}
                    placeholder="Frank Double Smash Burger"
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white outline-none focus:border-[#E51E2A]"
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">السعر (جنيه مصري) *</label>
                  <input
                    type="number"
                    value={prodForm.price || ''}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-[#E51E2A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">القسم</label>
                  <select
                    value={prodForm.categoryId || categories[0]?.id}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white outline-none focus:border-[#E51E2A] cursor-pointer font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description Arabic */}
              <div>
                <label className="block font-bold text-zinc-300 mb-1">الوصف والمكونات بالعربي</label>
                <textarea
                  rows={2}
                  value={prodForm.descriptionAr || ''}
                  onChange={(e) => setProdForm({ ...prodForm, descriptionAr: e.target.value })}
                  placeholder="شريحتان من اللحم البقري الطازج مع جبن الشيدر الذائب والصوص السري..."
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white outline-none focus:border-[#E51E2A]"
                />
              </div>

              {/* Image URL with live preview */}
              <div>
                <label className="block font-bold text-zinc-300 mb-1">رابط صورة الوجبة (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    dir="ltr"
                    value={prodForm.image || ''}
                    onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                    className="flex-1 bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white font-mono text-[11px] outline-none focus:border-[#E51E2A]"
                  />
                  {prodForm.image && (
                    <img
                      src={prodForm.image}
                      alt="معاينة"
                      className="w-10 h-10 rounded-lg object-cover bg-black border border-[#2c2c38] shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Calories & Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">السعرات</label>
                  <input
                    type="number"
                    value={prodForm.calories || 650}
                    onChange={(e) => setProdForm({ ...prodForm, calories: Number(e.target.value) })}
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2 text-white font-mono"
                  />
                </div>

                <div className="col-span-2 flex flex-col justify-center gap-1.5 ps-2">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodForm.isBestSeller || false}
                      onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                      className="accent-[#E51E2A] w-4 h-4"
                    />
                    <span className="font-semibold">تمييز كـ "الأكثر مبيعاً ⭐"</span>
                  </label>

                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodForm.isSpicy || false}
                      onChange={(e) => setProdForm({ ...prodForm, isSpicy: e.target.checked })}
                      className="accent-[#E51E2A] w-4 h-4"
                    />
                    <span className="font-semibold">صنف حار وسبايسي 🌶️</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#24242e] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#18181f] text-zinc-300 font-bold border border-[#2c2c38] cursor-pointer hover:bg-[#22222a]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold cursor-pointer shadow-lg shadow-[#E51E2A]/25"
                >
                  حفظ الصنف في المنيو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD CATEGORY MODAL (ARABIC) */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#282834] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-[#24242e]">
              <h3 className="text-base font-black text-white font-heading">
                إضافة قسم منيو جديد
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">اسم القسم بالعربي *</label>
                <input
                  type="text"
                  value={catForm.nameAr}
                  onChange={(e) => setCatForm({ ...catForm, nameAr: e.target.value })}
                  placeholder="مثال: وجبات التوفير"
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white outline-none focus:border-[#E51E2A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">اسم القسم بالإنجليزي</label>
                <input
                  type="text"
                  dir="ltr"
                  value={catForm.nameEn}
                  onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })}
                  placeholder="Value Meals"
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">رابط صورة القسم (URL)</label>
                <input
                  type="url"
                  dir="ltr"
                  value={catForm.image}
                  onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white font-mono text-[11px] outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div className="pt-3 border-t border-[#24242e] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181f] text-zinc-300 font-bold border border-[#2c2c38]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold"
                >
                  إضافة القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD COUPON MODAL (ARABIC) */}
      {/* ========================================================================= */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#282834] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-[#24242e]">
              <h3 className="text-base font-black text-white font-heading">
                إنشاء كود خصم جديد
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">كود الخصم (Promo Code) *</label>
                <input
                  type="text"
                  dir="ltr"
                  value={couponForm.code || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="FRANK25"
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white font-mono uppercase font-black outline-none focus:border-[#E51E2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">نوع الخصم</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white outline-none focus:border-[#E51E2A] cursor-pointer font-bold"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (جنيه)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">قيمة الخصم *</label>
                  <input
                    type="number"
                    value={couponForm.discountValue || 15}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-[#E51E2A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">الحد الأدنى للطلب (جنيه)</label>
                <input
                  type="number"
                  value={couponForm.minOrder || 100}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
                  className="w-full bg-[#18181f] border border-[#2c2c38] rounded-xl p-2.5 text-white font-mono outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div className="pt-3 border-t border-[#24242e] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181f] text-zinc-300 font-bold border border-[#2c2c38]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold"
                >
                  تفعيل وحفظ الكود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export const AdminView: React.FC = () => {
  const { adminUser } = useApp();

  if (!adminUser) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};
