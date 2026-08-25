import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { AuthView } from './AuthView';
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
  const { user } = useAuth();
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

  if (!user) {
    return <AuthView />;
  }

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
      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#E51E2A] text-white'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'طلباتك السابقة' : 'Past Orders'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 font-mono">
              {displayedOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'address'
                ? 'bg-[#E51E2A] text-white'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
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
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t('favoritesTab')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 font-mono">
              {favorites.length}
            </span>
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 pointer-events-none" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث برقم الطلب أو الموبايل...' : 'Filter by Order # or Phone...'}
              className="bg-white border border-zinc-200 rounded-lg py-1.5 px-3 rtl:pl-8 ltr:pr-8 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E51E2A] w-56"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {displayedOrders.length === 0 ? (
            <div className="p-10 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
              <ShoppingBag className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900">
                {language === 'ar' ? 'لا توجد طلبات مسجلة لهذا الجهاز حتى الآن' : 'No past orders on this device yet'}
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
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
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 text-start">
                        {language === 'ar' ? 'رقم الطلب' : 'Order ID'}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 text-start">
                        {language === 'ar' ? 'التاريخ' : 'Date'}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 text-start">
                        {language === 'ar' ? 'المنتجات' : 'Items'}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 text-start">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 text-start">
                        {language === 'ar' ? 'الإجمالي' : 'Total'}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-zinc-500 text-center">
                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {displayedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                        {/* Order ID */}
                        <td className="px-4 py-4 align-top">
                          <span className="text-sm font-bold text-zinc-900 font-mono bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200 inline-block">
                            #{order.id}
                          </span>
                        </td>
                        
                        {/* Date */}
                        <td className="px-4 py-4 align-top text-xs text-zinc-700">
                          <div className="font-mono">
                            {new Date(order.orderDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-zinc-500 mt-1">
                            {new Date(order.orderDate).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-2 text-xs">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-900 font-mono bg-zinc-100 px-1.5 py-0.2 rounded text-[11px]">
                                    {it.quantity}x
                                  </span>
                                  <span className="text-zinc-900 font-medium">
                                    {language === 'ar' ? it.product.nameAr : it.product.nameEn}
                                  </span>
                                </div>
                                {(it.selectedSize || (it.selectedAddons && it.selectedAddons.length > 0)) && (
                                  <div className="text-[10px] text-zinc-500 flex gap-2 ms-6">
                                    {it.selectedSize && (
                                      <span>
                                        ({language === 'ar' ? it.selectedSize.nameAr : it.selectedSize.nameEn})
                                      </span>
                                    )}
                                    {it.selectedAddons && it.selectedAddons.length > 0 && (
                                      <span className="text-[#E51E2A]">
                                        (+{it.selectedAddons.length} {language === 'ar' ? 'إضافات' : 'addons'})
                                      </span>
                                    )}
                                  </div>
                                )}
                                {order.status === 'delivered' && (
                                  <button
                                    onClick={() => setReviewingItemId(reviewingItemId === it.cartItemId ? null : it.cartItemId)}
                                    className="text-[10px] text-[#E51E2A] underline hover:text-[#c81520] transition-colors cursor-pointer text-start ms-6 mt-0.5 w-max"
                                  >
                                    {language === 'ar' ? 'تقييم المنتج' : 'Rate Product'}
                                  </button>
                                )}
                                
                                {reviewingItemId === it.cartItemId && (
                                  <div className="mt-1 ms-6 p-2 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-2">
                                    <div className="flex gap-1.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          onClick={() => setReviewRating(star)}
                                          className="cursor-pointer transition-colors"
                                        >
                                          <svg
                                            className={`w-4 h-4 ${reviewRating >= star ? 'text-amber-500 fill-amber-500' : 'text-zinc-300'}`}
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
                                        placeholder={language === 'ar' ? 'تعليق...' : 'Comment...'}
                                        className="flex-1 bg-white border border-zinc-200 rounded p-1 text-[11px] text-zinc-900"
                                      />
                                      <button
                                        onClick={() => handleSubmitReview(it.productId, it.cartItemId)}
                                        className="bg-[#E51E2A] text-white px-2 py-1 rounded text-[11px] font-bold cursor-pointer hover:bg-[#c81520]"
                                      >
                                        {language === 'ar' ? 'إرسال' : 'Submit'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center justify-center text-center ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : order.status === 'preparing'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-[#E51E2A]/10 text-[#E51E2A] border border-[#E51E2A]/20'
                            }`}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <div className="text-[10px] text-zinc-500 mt-2">
                            {order.orderType === 'delivery' ? t('typeDelivery') : t('typePickup')}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-zinc-900 font-mono">
                              {order.total} <span className="text-[10px] text-[#E51E2A] font-bold">{t('currency')}</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 capitalize mt-1">
                              {order.paymentMethod.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-2 w-max mx-auto">
                            <button
                              onClick={() => {
                                setActiveTrackingOrderId(order.id);
                                setCurrentView('tracking');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[11px] font-medium text-zinc-700 hover:text-zinc-900 flex items-center justify-center gap-1.5 transition-colors border border-zinc-200 cursor-pointer"
                            >
                              <Compass className="w-3.5 h-3.5 text-blue-600" />
                              <span>{t('trackOrderBtn')}</span>
                            </button>

                            <button
                              onClick={() => setActiveReceiptOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[11px] font-medium text-zinc-700 hover:text-zinc-900 flex items-center justify-center gap-1.5 transition-colors border border-zinc-200 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{t('printReceiptBtn')}</span>
                            </button>

                            <button
                              onClick={() => reorderPastOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-[#E51E2A] hover:bg-[#c81520] text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm border border-[#E51E2A]"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{t('reorderBtn')}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Quick Saved Address for this Device */}
      {activeTab === 'address' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 text-start max-w-xl shadow-sm"
        >
          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-900 font-heading">
              {language === 'ar' ? 'بيانات التوصيل السريعة لهذا الجهاز' : 'Fast Checkout Details for this Device'}
            </h2>
            <p className="text-xs text-zinc-500">
              {language === 'ar'
                ? 'يتم ملء هذه البيانات تلقائياً في صفحة إتمام الطلب لتوفير وقتك في كل مرة تطلب فيها من هذا الجهاز.'
                : 'These details are pre-filled automatically on checkout from this device for faster ordering.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{t('fullName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد علي"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E51E2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{t('phoneNumber')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none focus:border-[#E51E2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('whatsappNumber')}</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="01012345678"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none focus:border-[#E51E2A]"
            />
          </div>

          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500">
              {t('deliveryAddressTitle')}
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{t('selectZone')}</label>
              <select
                value={deliveryZoneId}
                onChange={(e) => setDeliveryZoneId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 focus:outline-none focus:border-[#E51E2A]"
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
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t('streetAddress')}</label>
                <input
                  type="text"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="شارع الجمهورية - أمام الجامعة"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t('buildingNumber')}</label>
                <input
                  type="text"
                  value={addressBuilding}
                  onChange={(e) => setAddressBuilding(e.target.value)}
                  placeholder="عمارة 14 - الدور 3 - شقة 5"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E51E2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">{t('deliveryNotes')}</label>
              <input
                type="text"
                value={addressNotes}
                onChange={(e) => setAddressNotes(e.target.value)}
                placeholder="ملاحظات للكابتن..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E51E2A]"
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
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
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
            <div className="p-10 text-center bg-white border border-zinc-200 rounded-2xl space-y-2">
              <Heart className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-900">
                {language === 'ar' ? 'لم تقم بحفظ أي أصناف في المفضلة بعد' : 'No favorites saved yet'}
              </h3>
              <p className="text-xs text-zinc-500">
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


