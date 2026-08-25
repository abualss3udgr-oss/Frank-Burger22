import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  ChefHat,
  PhoneCall,
  Printer,
  ShoppingBag,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const {
    orders,
    activeTrackingOrderId,
    setActiveTrackingOrderId,
    trackOrderLookup,
    setActiveReceiptOrder,
    reorderPastOrder,
    language,
    t,
    branches,
  } = useApp();

  const [inputOrderNumber, setInputOrderNumber] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState(false);

  // Load tracking order from active state or latest order
  useEffect(() => {
    if (activeTrackingOrderId) {
      const found = orders.find((o) => o.id === activeTrackingOrderId);
      if (found) {
        setActiveOrder(found);
        setInputOrderNumber(found.id);
        setInputPhone(found.customer.phone);
        return;
      }
    }

    if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
      setInputOrderNumber(orders[0].id);
      setInputPhone(orders[0].customer.phone);
    }
  }, [activeTrackingOrderId, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(false);

    if (!inputOrderNumber.trim()) return;

    const match = trackOrderLookup(inputOrderNumber, inputPhone);
    if (match) {
      setActiveOrder(match);
      setActiveTrackingOrderId(match.id);
      setLookupError(false);
    } else {
      setLookupError(true);
    }
  };

  // Timeline steps config
  const steps: { status: OrderStatus; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      status: 'pending',
      labelAr: 'استلام الطلب',
      labelEn: 'Received',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      status: 'confirmed',
      labelAr: 'تأكيد الفرع',
      labelEn: 'Confirmed',
      icon: <Store className="w-4 h-4" />,
    },
    {
      status: 'preparing',
      labelAr: 'التحضير والشوي',
      labelEn: 'Grilling',
      icon: <ChefHat className="w-4 h-4" />,
    },
    {
      status: 'out_for_delivery',
      labelAr: 'مع السائق',
      labelEn: 'On the way',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      status: 'delivered',
      labelAr: 'تم التسليم',
      labelEn: 'Delivered',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    if (status === 'pending') return 0;
    if (status === 'confirmed') return 1;
    if (status === 'preparing') return 2;
    if (status === 'ready' || status === 'out_for_delivery') return 3;
    if (status === 'delivered') return 4;
    return 0;
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const targetBranch = branches.find((b) => b.id === activeOrder?.branchId) || branches[0] || {
    nameAr: 'المطعم الرئيسي (أسيوط)',
    nameEn: 'Main Branch (Assiut)',
    phone: '01091266737',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="text-start">
        <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
          {t('trackingPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{t('trackLookupDesc')}</p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={handleSearch}
        className="bg-[#121215] border border-[#24242a] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end text-start"
      >
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">{t('orderNumberInput')}</label>
          <input
            type="text"
            value={inputOrderNumber}
            onChange={(e) => setInputOrderNumber(e.target.value.toUpperCase())}
            placeholder="FB-9104"
            className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white uppercase font-mono focus:outline-none focus:border-[#E51E2A]"
          />
        </div>

        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">{t('phoneInput')}</label>
          <input
            type="tel"
            value={inputPhone}
            onChange={(e) => setInputPhone(e.target.value)}
            placeholder="01012345678"
            className="w-full bg-[#18181c] border border-[#282830] rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#E51E2A]"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t('trackSearchBtn')}</span>
        </button>
      </form>

      {lookupError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2 text-start">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {language === 'ar'
              ? 'لم يتم العثور على طلب بهذا الرقم. تأكد من صحة رقم الطلب ورقم الهاتف.'
              : 'No order found with these credentials. Please verify order ID and phone.'}
          </span>
        </div>
      )}

      {/* Active Order Card */}
      {activeOrder && (
        <div className="bg-[#121215] border border-[#24242a] rounded-xl p-5 sm:p-6 space-y-6 text-start">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#24242a]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-white font-mono">
                  #{activeOrder.id}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    activeOrder.status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : activeOrder.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-[#E51E2A]/20 text-[#E51E2A]'
                  }`}
                >
                  {activeOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{language === 'ar' ? 'العميل:' : 'Customer:'} {activeOrder.customer.name}</span>
                <span>•</span>
                <span dir="ltr" className="font-mono text-zinc-300">
                  {activeOrder.customer.phone}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveReceiptOrder(activeOrder)}
                className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#202026] text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-[#24242a] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t('printReceiptBtn')}</span>
              </button>

              <button
                onClick={() => reorderPastOrder(activeOrder)}
                className="px-3 py-1.5 rounded-lg bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('reorderBtn')}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Steps */}
          {activeOrder.status === 'cancelled' ? (
            <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center space-y-1 text-rose-400">
              <AlertCircle className="w-6 h-6 mx-auto" />
              <h3 className="text-sm font-bold">{t('statusCancelled')}</h3>
              <p className="text-xs text-zinc-400">
                {language === 'ar'
                  ? 'تم إلغاء هذا الطلب من قبل الإدارة أو العميل.'
                  : 'This order was cancelled.'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Progress Line */}
              <div className="relative">
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#24242a] -translate-y-1/2 z-0">
                  <div
                    className="bg-[#E51E2A] h-full transition-all duration-500"
                    style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const label = language === 'ar' ? step.labelAr : step.labelEn;

                    return (
                      <div
                        key={step.status}
                        className="flex sm:flex-col items-center gap-2.5 sm:text-center"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-[#E51E2A] text-white'
                              : 'bg-[#1a1a20] text-zinc-500 border border-[#2a2a34]'
                          }`}
                        >
                          {step.icon}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-medium ${
                              isCurrent ? 'text-[#E51E2A] font-bold' : isCompleted ? 'text-white' : 'text-zinc-500'
                            }`}
                          >
                            {label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated ETA & Driver Box */}
              <div className="bg-[#18181c] border border-[#24242a] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="text-[10px] text-zinc-400">{t('estimatedArrival')}</div>
                    <div className="text-sm font-bold text-white font-mono">
                      {activeOrder.estimatedDeliveryTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#24242a]">
                  <div>
                    <div className="text-[10px] text-zinc-400">
                      {language === 'ar' ? 'الفرع:' : 'Branch:'}
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {language === 'ar' ? targetBranch.nameAr : targetBranch.nameEn}
                    </div>
                  </div>
                  <a
                    href={`tel:${targetBranch.phone}`}
                    className="p-2 rounded-lg bg-[#202026] text-[#E51E2A] hover:bg-[#282830] transition-colors"
                    title={t('callBranch')}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Status History Logs */}
          <div className="space-y-2 pt-4 border-t border-[#24242a]">
            <h3 className="text-xs font-semibold text-zinc-300">
              {language === 'ar' ? 'سجل تحديثات الطلب:' : 'Order Updates:'}
            </h3>
            <div className="space-y-1.5">
              {activeOrder.statusHistory.map((hist, hIdx) => (
                <div
                  key={hIdx}
                  className="p-2.5 bg-[#18181c] border border-[#24242a] rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E51E2A]" />
                    <span className="font-medium text-white capitalize">
                      {hist.status.replace(/_/g, ' ')}
                    </span>
                    {hist.note && <span className="text-zinc-400">- {hist.note}</span>}
                  </div>
                  <span className="font-mono text-zinc-500 text-[10px]">
                    {new Date(hist.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered items review */}
          <div className="space-y-2 pt-4 border-t border-[#24242a]">
            <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#E51E2A]" />
              <span>{language === 'ar' ? 'الأصناف في هذا الطلب:' : 'Items:'}</span>
            </h3>
            <div className="divide-y divide-[#24242a] bg-[#101013] border border-[#24242a] rounded-xl p-3 space-y-2">
              {activeOrder.items.map((item, idx) => {
                const name = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                return (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.image}
                        alt={name}
                        className="w-8 h-8 rounded object-cover bg-black"
                      />
                      <div>
                        <div className="font-medium text-white">
                          {item.quantity}x {name}
                        </div>
                        {item.selectedAddons.length > 0 && (
                          <div className="text-[10px] text-zinc-400">
                            +{' '}
                            {item.selectedAddons
                              .map((a) => (language === 'ar' ? a.nameAr : a.nameEn))
                              .join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-zinc-300">
                      {item.totalPrice} {t('currency')}
                    </span>
                  </div>
                );
              })}

              <div className="pt-2 flex justify-between font-bold text-xs text-white">
                <span>{t('total')}</span>
                <span className="font-mono text-[#E51E2A]">
                  {activeOrder.total} {t('currency')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

