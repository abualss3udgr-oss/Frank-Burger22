import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderType, PaymentMethod } from '../types';
import {
  X,
  MapPin,
  Store,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    couponDiscountAmount,
    appliedCoupon,
    deliveryZones,
    branches,
    settings,
    createOrder,
    customerProfile,
    updateCustomerProfile,
    language,
    t,
  } = useApp();

  // Form State initialized from customer profile
  const [name, setName] = useState(customerProfile?.name || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(customerProfile?.whatsapp || '');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState(
    customerProfile?.deliveryZoneId || deliveryZones[0]?.id || ''
  );
  const [selectedBranchId, setSelectedBranchId] = useState(
    customerProfile?.pickupBranchId || branches[0]?.id || ''
  );
  const [streetAddress, setStreetAddress] = useState(customerProfile?.addressStreet || '');
  const [buildingNumber, setBuildingNumber] = useState(customerProfile?.addressBuilding || '');
  const [deliveryNotes, setDeliveryNotes] = useState(customerProfile?.addressNotes || '');

  // Timing
  const [timingType, setTimingType] = useState<'now' | 'scheduled'>('now');
  const [scheduledTime, setScheduledTime] = useState('اليوم — 09:30 مساءً');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isCheckoutOpen) return null;

  const currentZone = deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0];
  const isFreeDelivery = cartSubtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = orderType === 'delivery' ? (isFreeDelivery ? 0 : currentZone?.fee || 20) : 0;
  const finalTotal = Math.max(0, cartSubtotal - couponDiscountAmount + deliveryFee);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('requiredField');
    if (!phone.trim() || phone.trim().length < 8) errs.phone = t('requiredField');
    if (orderType === 'delivery' && !streetAddress.trim()) errs.streetAddress = t('requiredField');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Save customer profile for next time
      updateCustomerProfile({
        name,
        phone,
        whatsapp,
        addressStreet: streetAddress,
        addressBuilding: buildingNumber,
        addressNotes: deliveryNotes,
        deliveryZoneId: selectedZoneId,
        pickupBranchId: selectedBranchId,
      });

      // Submit order
      createOrder({
        customer: {
          name,
          phone,
          whatsapp,
          addressStreet: streetAddress,
          addressBuilding: buildingNumber,
          addressNotes: deliveryNotes,
          deliveryZoneId: orderType === 'delivery' ? selectedZoneId : undefined,
          pickupBranchId: orderType === 'pickup' ? selectedBranchId : undefined,
        },
        items: cart,
        orderType,
        status: 'pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'online_card' ? 'paid' : 'pending',
        subtotal: cartSubtotal,
        discount: couponDiscountAmount,
        deliveryFee,
        tax: 0,
        total: finalTotal,
        couponCode: appliedCoupon?.code,
        estimatedDeliveryTime:
          timingType === 'now'
            ? orderType === 'delivery'
              ? currentZone?.estimatedMinutes || '30-45 دقيقة'
              : '15-20 دقيقة'
            : scheduledTime,
        scheduledTime: timingType === 'scheduled' ? scheduledTime : undefined,
        branchId: orderType === 'pickup' ? selectedBranchId : branches[0]?.id,
      });

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={() => setIsCheckoutOpen(false)} />

      {/* Modal Container */}
      <div
        className="relative bg-[#16161b] border border-[#2d2d38] rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl z-10 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#272730] flex items-center justify-between bg-[#121217]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E51E2A]/20 text-[#E51E2A]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-heading">{t('checkoutTitle')}</h2>
              <p className="text-xs text-zinc-400">
                {language === 'ar' ? 'طلب فوري بدون إنشاء حساب إجباري' : 'Fast guest checkout'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handlePlaceOrder} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* 1. Fulfillment Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
              {t('deliveryTypeSection')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-[#E51E2A] text-white border-[#E51E2A] shadow-lg shadow-[#E51E2A]/20'
                    : 'bg-[#1c1c24] text-zinc-300 border-[#272730] hover:border-zinc-500'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>{t('typeDelivery')}</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  orderType === 'pickup'
                    ? 'bg-[#E51E2A] text-white border-[#E51E2A] shadow-lg shadow-[#E51E2A]/20'
                    : 'bg-[#1c1c24] text-zinc-300 border-[#272730] hover:border-zinc-500'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>{t('typePickup')}</span>
              </button>
            </div>
          </div>

          {/* 2. Customer Information */}
          <div className="bg-[#1c1c24] border border-[#2b2b36] p-4 sm:p-5 rounded-2xl space-y-3.5">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              {t('customerInfoSection')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {t('fullName')} <span className="text-[#E51E2A]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: أحمد محمود' : 'e.g. John Doe'}
                  className={`w-full bg-[#16161b] border rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A] ${
                    errors.name ? 'border-rose-500' : 'border-[#2e2e3a]'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {t('phoneNumber')} <span className="text-[#E51E2A]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className={`w-full bg-[#16161b] border rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#E51E2A] ${
                    errors.phone ? 'border-rose-500' : 'border-[#2e2e3a]'
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-rose-400 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                {t('whatsappNumber')}
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder={language === 'ar' ? 'اختياري لتلقي تفاصيل التتبع عبر واتساب' : 'Optional for WhatsApp updates'}
                className="w-full bg-[#16161b] border border-[#2e2e3a] rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#E51E2A]"
              />
            </div>
          </div>

          {/* 3. Address or Branch selection */}
          {orderType === 'delivery' ? (
            <div className="bg-[#1c1c24] border border-[#2b2b36] p-4 sm:p-5 rounded-2xl space-y-3.5">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E51E2A]" />
                <span>{t('selectZone')}</span>
              </h3>

              {/* Delivery Zone select */}
              <div>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full bg-[#16161b] border border-[#2e2e3a] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
                >
                  {deliveryZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {language === 'ar' ? zone.nameAr : zone.nameEn} — {zone.fee} {t('currency')} (
                      {zone.estimatedMinutes})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    {t('streetAddress')} <span className="text-[#E51E2A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder={language === 'ar' ? 'الشارع / رقم المنزل / معلم مميز' : 'Street / Landmarks'}
                    className={`w-full bg-[#16161b] border rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A] ${
                      errors.streetAddress ? 'border-rose-500' : 'border-[#2e2e3a]'
                    }`}
                  />
                  {errors.streetAddress && (
                    <p className="text-[10px] text-rose-400 mt-1">{errors.streetAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    {t('buildingNumber')}
                  </label>
                  <input
                    type="text"
                    value={buildingNumber}
                    onChange={(e) => setBuildingNumber(e.target.value)}
                    placeholder={language === 'ar' ? 'العمارة 5 - الدور 3 - شقة 12' : 'Bldg 5 - Floor 3 - Apt 12'}
                    className="w-full bg-[#16161b] border border-[#2e2e3a] rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {t('deliveryNotes')}
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: اترك الطلب عند الباب، لا ترن الجرس...' : 'e.g. Leave at door...'}
                  className="w-full bg-[#16161b] border border-[#2e2e3a] rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A]"
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#1c1c24] border border-[#2b2b36] p-4 sm:p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#E51E2A]" />
                <span>{language === 'ar' ? 'موقع استلام الطلب من المطعم' : 'Pickup Location'}</span>
              </h3>

              <div className="p-4 rounded-xl border border-[#E51E2A]/40 bg-[#E51E2A]/10 text-start space-y-2">
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E51E2A]" />
                    {language === 'ar' ? settings.addressAr : settings.addressEn}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {language === 'ar' ? 'استلام تيك أواي جاهز' : 'Takeaway Ready'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300">
                  {language === 'ar'
                    ? 'سيتم تجهيز طلبك طازجاً وساخناً للاستلام فور وصولك للمطعم.'
                    : 'Your meal will be freshly prepared and ready for pickup upon arrival.'}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono pt-1 flex items-center gap-1.5 flex-wrap">
                  <span>{language === 'ar' ? settings.openingHoursAr : settings.openingHoursEn}</span>
                  <span>•</span>
                  <span dir="ltr" className="font-bold text-zinc-300">{settings.phone || '01091266737'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Timing Option */}
          <div className="bg-[#1c1c24] border border-[#2b2b36] p-4 sm:p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E51E2A]" />
              <span>{t('timingSection')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTimingType('now')}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  timingType === 'now'
                    ? 'bg-[#E51E2A]/15 border-[#E51E2A] text-white'
                    : 'bg-[#16161b] border-[#272730] text-zinc-400'
                }`}
              >
                {t('orderNowTiming')}
              </button>

              <button
                type="button"
                onClick={() => setTimingType('scheduled')}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  timingType === 'scheduled'
                    ? 'bg-[#E51E2A]/15 border-[#E51E2A] text-white'
                    : 'bg-[#16161b] border-[#272730] text-zinc-400'
                }`}
              >
                {t('orderScheduledTiming')}
              </button>
            </div>

            {timingType === 'scheduled' && (
              <div className="pt-2">
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="مثال: اليوم — 10:30 مساءً"
                  className="w-full bg-[#16161b] border border-[#2e2e3a] rounded-xl py-2 px-3 text-xs text-white font-medium focus:outline-none focus:border-[#E51E2A]"
                />
              </div>
            )}
          </div>

          {/* 5. Payment Methods */}
          <div className="bg-[#1c1c24] border border-[#2b2b36] p-4 sm:p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#E51E2A]" />
              <span>{t('paymentSection')}</span>
            </h3>

            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'bg-[#E51E2A]/15 border-[#E51E2A] text-white'
                    : 'bg-[#16161b] border-[#272730] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-4 h-4 text-[#E51E2A]" />
                  <span className="text-xs font-bold">{t('payCash')}</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="accent-[#E51E2A]"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('card_on_delivery')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card_on_delivery'
                    ? 'bg-[#E51E2A]/15 border-[#E51E2A] text-white'
                    : 'bg-[#16161b] border-[#272730] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-[#E51E2A]" />
                  <span className="text-xs font-bold">{t('payCardOnDelivery')}</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card_on_delivery'}
                  onChange={() => setPaymentMethod('card_on_delivery')}
                  className="accent-[#E51E2A]"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('vodafone_cash_instapay')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'vodafone_cash_instapay'
                    ? 'bg-[#E51E2A]/15 border-[#E51E2A] text-white'
                    : 'bg-[#16161b] border-[#272730] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-[#E51E2A]" />
                  <span className="text-xs font-bold">{t('payWallet')}</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'vodafone_cash_instapay'}
                  onChange={() => setPaymentMethod('vodafone_cash_instapay')}
                  className="accent-[#E51E2A]"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('online_card')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'online_card'
                    ? 'bg-[#E51E2A]/15 border-[#E51E2A] text-white'
                    : 'bg-[#16161b] border-[#272730] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">{t('payOnline')}</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online_card'}
                  onChange={() => setPaymentMethod('online_card')}
                  className="accent-[#E51E2A]"
                />
              </label>
            </div>
          </div>
        </form>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-5 bg-[#121217] border-t border-[#272730] flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold">{t('total')}</div>
            <div className="text-xl font-black text-white font-mono">
              {finalTotal} <span className="text-xs text-[#E51E2A]">{t('currency')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="flex-grow py-3.5 px-6 rounded-xl bg-[#E51E2A] hover:bg-[#c41420] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#E51E2A]/30 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>{t('submittingOrder')}</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('placeOrderButton')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
