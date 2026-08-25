import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import {
  History,
  Heart,
  Save,
  RotateCcw,
  Printer,
  ShoppingBag,
  Check,
  Compass,
  Smartphone,
  Wifi,
  Search,
  Copy,
  MapPin,
  Star,
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const {
    customerProfile,
    updateCustomerProfile,
    orders,
    myDeviceOrders,
    deviceInfo,
    favorites,
    products,
    reorderPastOrder,
    setActiveReceiptOrder,
    setActiveTrackingOrderId,
    setCurrentView,
    deliveryZones,
    language,
    t,
    loyaltyPoints,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'address'>('orders');
  const [lookupQuery, setLookupQuery] = useState('');
  const [copiedDevId, setCopiedDevId] = useState(false);

  // Form profile state
  const [name, setName] = useState(customerProfile?.name || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(customerProfile?.whatsapp || '');
  const [addressStreet, setAddressStreet] = useState(customerProfile?.addressStreet || '');
  const [addressBuilding, setAddressBuilding] = useState(customerProfile?.addressBuilding || '');
  const [addressNotes, setAddressNotes] = useState(customerProfile?.addressNotes || '');
  const [deliveryZoneId, setDeliveryZoneId] = useState(customerProfile?.deliveryZoneId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Review state
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  // Determine displayed orders (my device orders or lookup search)
  const displayedOrders = React.useMemo(() => {
    if (!lookupQuery.trim()) {
      return myDeviceOrders.length > 0 ? myDeviceOrders : orders;
    }
    const q = lookupQuery.trim().toLowerCase();
    return orders.filter(
      (ord) =>
        ord.id?.toLowerCase().includes(q) ||
        ord.customer?.phone?.includes(q) ||
        ord.customer?.name?.toLowerCase().includes(q)
    );
  }, [lookupQuery, myDeviceOrders, orders]);

  const handleCopyDeviceId = () => {
    if (deviceInfo?.deviceId) {
      navigator.clipboard.writeText(deviceInfo.deviceId);
      setCopiedDevId(true);
      setTimeout(() => setCopiedDevId(false), 2000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name,
      phone,
      whatsapp,
      addressStreet,
      addressBuilding,
      addressNotes,
      deliveryZoneId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const { addReview, updateProductRating, addToast } = useApp();

  const handleSubmitReview = (productId: string, cartItemId: string) => {
    if (!reviewComment.trim()) return;
    addReview({
      customerName: customerProfile?.name || 'Customer',
      rating: reviewRating,
      commentAr: reviewComment,
      commentEn: reviewComment,
      isApproved: false, // Requires admin approval
    });
    updateProductRating(productId, reviewRating);
    addToast(language === 'ar' ? 'شكراً لتقييمك! سيتم مراجعته قريباً.' : 'Thank you for your review! It will be checked soon.', 'success');
    setReviewingItemId(null);
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Device Identification Banner */}
      <div className="bg-gradient-to-r from-[#121216] via-[#16161c] to-[#121216] border border-[#262630] rounded-2xl p-5 sm:p-6 text-start shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E51E2A]/10 border border-[#E51E2A]/30 text-[#E51E2A] flex items-center justify-center font-bold text-xl shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white font-heading">
                  {language === 'ar' ? 'طلباتك السابقة من هذا الجهاز' : 'Your Previous Orders (This Device)'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'ar' ? 'جهازك متصل' : 'Device Active'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar'
                  ? 'تم التعرف على جهازك تلقائياً لسرعة مراجعة طلباتك السابقة وإعادة طلبها بدون الحاجة لتسجيل دخول.'
                  : 'Your device is automatically authenticated to review and reorder your past meals instantly.'}
              </p>
              {loyaltyPoints > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-400">
                    {loyaltyPoints} {language === 'ar' ? 'نقطة ولاء' : 'Loyalty Points'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleCopyDeviceId}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a22] hover:bg-[#22222c] border border-[#2a2a36] text-xs text-zinc-300 transition-colors cursor-pointer self-start sm:self-auto"
            title="Copy Device ID"
          >
            <span className="font-mono text-zinc-300 font-bold">{deviceInfo?.deviceId || 'DEV-AUTO'}</span>
            {copiedDevId ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>
        </div>

        {/* Technical Device & Network Telemetry Pill Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#22222a] text-xs">
          <div className="bg-[#0e0e12] border border-[#202028] rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">{language === 'ar' ? 'عنوان الـ MAC:' : 'MAC Address:'}</span>
            <span className="font-mono text-zinc-200 font-semibold text-[11px]">{deviceInfo?.macAddress || '4C:D5:77:2A:90:E1'}</span>
          </div>

          <div className="bg-[#0e0e12] border border-[#202028] rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-400 text-[11px] flex items-center gap-1">
              <Wifi className="w-3 h-3 text-[#E51E2A]" />
              {language === 'ar' ? 'عنوان الـ IP:' : 'Client IP:'}
            </span>
            <span className="font-mono text-emerald-400 font-semibold text-[11px]">{deviceInfo?.ipAddress || '197.38.112.45'}</span>
          </div>

          <div className="bg-[#0e0e12] border border-[#202028] rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">{language === 'ar' ? 'نوع الجهاز:' : 'Device:'}</span>
            <span className="text-zinc-300 font-medium text-[11px] truncate max-w-[140px]">{deviceInfo?.deviceModel || 'هذا المتصفح'}</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-[#24242a] pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#E51E2A] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181c]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'طلباتك السابقة' : 'Past Orders'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              {displayedOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'address'
                ? 'bg-[#E51E2A] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181c]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'عنوان التوصيل السريع للجهاز' : 'Saved Quick Address'}</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-[#E51E2A] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181c]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t('favoritesTab')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              {favorites.length}
            </span>
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 pointer-events-none" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث برقم الطلب أو الموبايل...' : 'Filter by Order # or Phone...'}
              className="bg-[#141418] border border-[#24242c] rounded-lg py-1.5 px-3 rtl:pl-8 ltr:pr-8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A] w-56"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {displayedOrders.length === 0 ? (
            <div className="p-10 text-center bg-[#121215] border border-[#24242a] rounded-2xl space-y-3">
              <ShoppingBag className="w-10 h-10 text-zinc-500 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'لا توجد طلبات مسجلة لهذا الجهاز حتى الآن' : 'No past orders on this device yet'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {language === 'ar'
                  ? 'بمجرد أن تقوم بالطلب من المنيو، سيظهر طلبك وتفاصيل الفاتورة وحالته المباشرة هنا تلقائياً.'
                  : 'As soon as you place an order from the menu, its live status and receipts will appear here automatically.'}
              </p>
              <button
                onClick={() => setCurrentView('menu')}
                className="px-5 py-2.5 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2 mt-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'ar' ? 'اطلب الآن من المنيو' : 'Explore Menu'}</span>
              </button>
            </div>
          ) : (
            displayedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#121215] border border-[#24242a] hover:border-[#383844] transition-colors rounded-2xl p-4 sm:p-5 text-start space-y-4"
              >
                {/* Header of Order Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#24242a]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-white font-mono bg-[#18181e] px-2.5 py-1 rounded-lg border border-[#282832]">
                      #{order.id}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'preparing'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-[#E51E2A]/20 text-[#E51E2A] border border-[#E51E2A]/30'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {new Date(order.orderDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setActiveTrackingOrderId(order.id);
                        setCurrentView('tracking');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#22222a] text-xs text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors border border-[#282832] cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#E51E2A]" />
                      <span>{t('trackOrderBtn')}</span>
                    </button>

                    <button
                      onClick={() => setActiveReceiptOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#22222a] text-xs text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors border border-[#282832] cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{t('printReceiptBtn')}</span>
                    </button>

                    <button
                      onClick={() => reorderPastOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-[#E51E2A] hover:bg-[#c81520] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('reorderBtn')}</span>
                    </button>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-1.5 text-xs text-zinc-300">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex flex-col gap-2 bg-[#18181c]/50 px-3 py-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono bg-[#202026] px-1.5 py-0.2 rounded text-[11px]">
                            {it.quantity}x
                          </span>
                          <span className="text-zinc-200 font-medium">
                            {language === 'ar' ? it.product.nameAr : it.product.nameEn}
                          </span>
                          {it.selectedSize && (
                            <span className="text-[11px] text-zinc-400">
                              ({language === 'ar' ? it.selectedSize.nameAr : it.selectedSize.nameEn})
                            </span>
                          )}
                          {it.selectedAddons && it.selectedAddons.length > 0 && (
                            <span className="text-[10px] text-[#E51E2A]">
                              (+{it.selectedAddons.length} {language === 'ar' ? 'إضافات' : 'addons'})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-white font-bold">{it.totalPrice} {t('currency')}</span>
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => setReviewingItemId(reviewingItemId === it.cartItemId ? null : it.cartItemId)}
                              className="text-[10px] text-[#E51E2A] underline hover:text-white transition-colors cursor-pointer"
                            >
                              {language === 'ar' ? 'تقييم المنتج' : 'Rate Product'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {reviewingItemId === it.cartItemId && (
                        <div className="mt-2 pt-2 border-t border-[#24242a] flex flex-col gap-2">
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="cursor-pointer transition-colors"
                              >
                                <svg
                                  className={`w-4 h-4 ${reviewRating >= star ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder={language === 'ar' ? 'اكتب تعليقاً قصيراً...' : 'Write a short comment...'}
                              className="flex-1 bg-[#0a0a0c] border border-[#24242a] rounded p-1.5 text-xs text-white"
                            />
                            <button
                              onClick={() => handleSubmitReview(it.productId, it.cartItemId)}
                              className="bg-[#E51E2A] text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer hover:bg-[#c81520]"
                            >
                              {language === 'ar' ? 'إرسال' : 'Submit'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Info of Order */}
                <div className="pt-2 border-t border-[#24242a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-zinc-400 flex items-center gap-2">
                    <span>{order.orderType === 'delivery' ? t('typeDelivery') : t('typePickup')}</span>
                    <span>•</span>
                    <span className="capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
                    {order.customer.addressStreet && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px] text-zinc-300">{order.customer.addressStreet}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-zinc-400">{t('total')}:</span>
                    <span className="text-base font-black text-white font-mono">
                      {order.total} <span className="text-xs text-[#E51E2A] font-bold">{t('currency')}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Quick Saved Address for this Device */}
      {activeTab === 'address' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-[#121215] border border-[#24242a] rounded-2xl p-6 space-y-5 text-start max-w-xl shadow-lg"
        >
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white font-heading">
              {language === 'ar' ? 'بيانات التوصيل السريعة لهذا الجهاز' : 'Fast Checkout Details for this Device'}
            </h2>
            <p className="text-xs text-zinc-400">
              {language === 'ar'
                ? 'يتم ملء هذه البيانات تلقائياً في صفحة إتمام الطلب لتوفير وقتك في كل مرة تطلب فيها من هذا الجهاز.'
                : 'These details are pre-filled automatically on checkout from this device for faster ordering.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t('fullName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد علي"
                className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t('phoneNumber')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#E51E2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">{t('whatsappNumber')}</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="01012345678"
              className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#E51E2A]"
            />
          </div>

          <div className="pt-2 border-t border-[#24242a] space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300">
              {t('deliveryAddressTitle')}
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t('selectZone')}</label>
              <select
                value={deliveryZoneId}
                onChange={(e) => setDeliveryZoneId(e.target.value)}
                className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
              >
                {deliveryZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {language === 'ar' ? z.nameAr : z.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t('streetAddress')}</label>
                <input
                  type="text"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="شارع الجمهورية - أمام الجامعة"
                  className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t('buildingNumber')}</label>
                <input
                  type="text"
                  value={addressBuilding}
                  onChange={(e) => setAddressBuilding(e.target.value)}
                  placeholder="عمارة 14 - الدور 3 - شقة 5"
                  className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t('deliveryNotes')}</label>
              <input
                type="text"
                value={addressNotes}
                onChange={(e) => setAddressNotes(e.target.value)}
                placeholder="ملاحظات للكابتن..."
                className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('saveChanges')}</span>
            </button>

            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تم الحفظ على هذا الجهاز بنجاح!' : 'Saved to this device successfully!'}</span>
              </span>
            )}
          </div>
        </form>
      )}

      {/* Tab 3: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteProducts.length === 0 ? (
            <div className="p-10 text-center bg-[#121215] border border-[#24242a] rounded-2xl space-y-2">
              <Heart className="w-8 h-8 text-zinc-500 mx-auto" />
              <h3 className="text-sm font-semibold text-white">
                {language === 'ar' ? 'لم تقم بحفظ أي أصناف في المفضلة بعد' : 'No favorites saved yet'}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'ar'
                  ? 'اضغط على علامة القلب على أي صنف في المنيو لحفظه في هذا الجهاز.'
                  : 'Click the heart icon on any burger to bookmark it on this device.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


