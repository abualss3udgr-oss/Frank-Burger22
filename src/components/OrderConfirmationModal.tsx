import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Printer,
  Compass,
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  ShoppingBag,
  X,
} from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const {
    orderConfirmationOrder: order,
    setOrderConfirmationOrder,
    setActiveReceiptOrder,
    setCurrentView,
    setActiveTrackingOrderId,
    language,
    t,
  } = useApp();

  if (!order) return null;

  const handleTrackOrder = () => {
    setActiveTrackingOrderId(order.id);
    setOrderConfirmationOrder(null);
    setCurrentView('tracking');
  };

  const handlePrintReceipt = () => {
    setActiveReceiptOrder(order);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={() => setOrderConfirmationOrder(null)} />

      <div
        className="relative bg-[#16161b] border border-[#2d2d38] rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl z-10 flex flex-col text-center p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOrderConfirmationOrder(null)}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full text-zinc-400 hover:text-white bg-zinc-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#E51E2A]/15 border border-[#E51E2A]/30 text-[#E51E2A] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
          {t('orderSuccessTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {t('orderSuccessSubtitle')}{' '}
          <span className="text-[#E51E2A] font-mono font-bold text-base px-2 py-0.5 bg-[#E51E2A]/10 rounded-md">
            #{order.id}
          </span>
        </p>

        {/* Estimated Time Card */}
        <div className="bg-[#1c1c24] border border-[#2d2d38] rounded-2xl p-4 my-5 flex items-center justify-between text-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400">{t('estimatedTimeLabel')}</div>
              <div className="text-sm font-bold text-white font-mono">
                {order.estimatedDeliveryTime}
              </div>
            </div>
          </div>

          <div className="text-end">
            <div className="text-[11px] text-zinc-400">{t('total')}</div>
            <div className="text-base font-black text-white font-mono">
              {order.total} <span className="text-xs text-[#E51E2A]">{t('currency')}</span>
            </div>
          </div>
        </div>

        {/* Item mini list preview */}
        <div className="bg-[#121217] border border-[#24242e] rounded-xl p-3 mb-6 text-start text-xs space-y-1.5 max-h-36 overflow-y-auto">
          <div className="text-[11px] font-bold text-zinc-400 mb-1 flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[#E51E2A]" />
            <span>{language === 'ar' ? 'ملخص الأصناف المطلوبة:' : 'Ordered items summary:'}</span>
          </div>
          {order.items.map((item, i) => {
            const name = language === 'ar' ? (item.product?.nameAr || 'منتج') : (item.product?.nameEn || 'Item');
            return (
              <div key={i} className="flex justify-between text-zinc-300">
                <span className="truncate">
                  {item.quantity}x {name}
                </span>
                <span className="font-mono text-zinc-400 font-semibold shrink-0">
                  {item.totalPrice} {t('currency')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleTrackOrder}
            className="w-full py-3.5 px-4 rounded-xl bg-[#E51E2A] hover:bg-[#c41420] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#E51E2A]/25 transition-all transform active:scale-98 cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            <span>{t('trackOrderBtn')}</span>
            {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#1c1c24] hover:bg-[#252530] border border-[#2d2d3b] text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-zinc-400" />
              <span>{t('printReceiptBtn')}</span>
            </button>

            <button
              onClick={() => setOrderConfirmationOrder(null)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#1c1c24] hover:bg-[#252530] border border-[#2d2d3b] text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{t('backToHome')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
