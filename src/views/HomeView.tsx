import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import {
  Clock,
  Truck,
  ShieldCheck,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Utensils,
  ChefHat,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Testimonials } from '../components/Testimonials';

export const HomeView: React.FC = () => {
  const [showIntro, setShowIntro] = React.useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const {
    products,
    categories,
    offers,
    reviews,
    setCurrentView,
    setActiveMenuCategory,
    addToCart,
    language,
    t,
  } = useApp();

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#FEF8F2]"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src="https://res.cloudinary.com/fwxyu7hh/image/upload/v1787696964/Artboard_2_9x.png"
              alt="Logo"
              className="w-32 h-32"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-[#FEF8F2] py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-6 text-start"
              >
                <h1 className="text-5xl sm:text-7xl font-black text-zinc-900 leading-[1.05] font-heading">
                  {t('heroTitlePart1')} <br/>
                  <span className="text-[#E51E2A]">{t('heroTitlePart2')}</span>
                </h1>
                <p className="text-zinc-600 max-w-md text-lg leading-relaxed">
                  {t('heroDesc')}
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => { setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-8 py-4 rounded-full bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {t('heroOrderNow')}
                  </button>
                  <button
                    onClick={() => { setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-8 py-4 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 font-bold border border-zinc-200 transition-all transform hover:scale-105 active:scale-95"
                  >
                    {t('heroViewMenu')}
                  </button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="relative flex justify-center items-center"
              >
                <div className="w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-[#E51E2A]/10 absolute" />
                <img 
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80" 
                  alt="Delicious Burger" 
                  className="relative z-10 w-[300px] sm:w-[450px] rounded-full object-cover aspect-square shadow-2xl border-4 border-white"
                />
                
                {/* Floating Elements */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 p-4 bg-white rounded-full shadow-lg"><Utensils className="w-6 h-6 text-[#E51E2A]"/></motion.div>
                <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-10 p-4 bg-white rounded-full shadow-lg"><ChefHat className="w-6 h-6 text-amber-500"/></motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 right-5 p-3 bg-white rounded-full shadow-lg text-xs font-bold text-zinc-800">100% Fresh</motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </motion.div>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 font-heading">{t('categoriesTitle')}</h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">{t('categoriesSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const catName = language === 'ar' ? cat.nameAr : cat.nameEn;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveMenuCategory(cat.id); setActiveMenuCategory('all'); setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group relative h-36 sm:h-44 w-full rounded-2xl overflow-hidden border border-zinc-200 hover:border-[#E51E2A]/60 transition-all cursor-pointer shadow-sm text-start flex flex-col justify-end"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-zinc-100">
                  <img
                    src={cat.image}
                    alt={catName}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                </div>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent opacity-90" />
                
                {/* Content */}
                <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between w-full">
                  <h3 className="text-sm sm:text-lg font-bold text-zinc-900 group-hover:text-black transition-colors font-heading drop-shadow-sm">
                    {catName}
                  </h3>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900/10 backdrop-blur-md flex items-center justify-center border border-zinc-900/10 group-hover:bg-[#E51E2A] group-hover:border-[#E51E2A] transition-all duration-300 shadow-sm">
                    {language === 'ar' ? (
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-900 group-hover:text-white" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-900 group-hover:text-white" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="text-start">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 font-heading">
              {t('bestSellersTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">{t('bestSellersSubtitle')}</p>
          </div>

          <button
            onClick={() => { setActiveMenuCategory('all'); setActiveMenuCategory('all'); setCurrentView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-semibold text-zinc-700 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{language === 'ar' ? 'عرض المنيو' : 'Full Menu'}</span>
            {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. SPECIAL SAVINGS OFFERS SECTION (Only on Home Page as requested) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#E51E2A] text-white text-[10px] font-bold uppercase mb-1">
                {language === 'ar' ? 'عروض التوفير الحصرية' : 'Exclusive Saver Deals'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 font-heading">
                {language === 'ar' ? 'بوكسات التوفير والعروض العائلية' : 'Deals & Saver Combos'}
              </h2>
            </div>
            <div className="text-xs text-zinc-500 font-medium">
              {language === 'ar' ? 'أفضل قيمة وأكبر توفير للوجبات والمجموعات' : 'Best value and biggest savings for combos'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {offers.filter((o) => o.isActive).map((offer) => {
              const oTitle = language === 'ar' ? offer.titleAr : offer.titleEn;
              const oDesc = language === 'ar' ? offer.descriptionAr : offer.descriptionEn;

              return (
                <div
                  key={offer.id}
                  className="bg-zinc-50 border border-zinc-200 hover:border-[#E51E2A]/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between group text-start shadow-sm hover:shadow-md"
                >
                  <div className="relative h-44 w-full bg-zinc-200 overflow-hidden">
                    <img
                      src={offer.image}
                      alt={oTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-[#E51E2A] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md font-mono">
                      {offer.discountPercentage}% OFF
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#E51E2A] transition-colors font-heading mb-1.5">
                        {oTitle}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {oDesc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-zinc-900 font-mono">
                          {offer.price} <span className="text-xs font-bold text-[#E51E2A]">{t('currency')}</span>
                        </span>
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {offer.originalPrice}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const promoProd = products.find((p) => p.id === offer.includedProductIds?.[0]) || products[0];
                          addToCart(promoProd, undefined, [], 1, `عرض: ${oTitle}`);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
                      >
                        {language === 'ar' ? 'اطلب العرض' : 'Claim Deal'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHY FRANK BURGER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start mb-8">
          <span className="text-xs font-bold text-[#E51E2A] uppercase tracking-wider">
            {language === 'ar' ? 'معايير الجودة' : 'The Frank Standard'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 font-heading mt-1">
            {t('whyTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">{t('whySubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-start">
            <Award className="w-5 h-5 text-[#E51E2A]" />
            <h3 className="text-sm font-bold text-zinc-900 font-heading">{t('why1Title')}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{t('why1Desc')}</p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-start">
            <Truck className="w-5 h-5 text-[#E51E2A]" />
            <h3 className="text-sm font-bold text-zinc-900 font-heading">{t('why2Title')}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{t('why2Desc')}</p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-start">
            <ShieldCheck className="w-5 h-5 text-[#E51E2A]" />
            <h3 className="text-sm font-bold text-zinc-900 font-heading">{t('why3Title')}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{t('why3Desc')}</p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-start">
            <Clock className="w-5 h-5 text-[#E51E2A]" />
            <h3 className="text-sm font-bold text-zinc-900 font-heading">{t('why4Title')}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{t('why4Desc')}</p>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS SECTION */}
      <Testimonials />

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 text-center text-zinc-900 shadow-sm">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight">
              {t('ctaTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              {t('ctaDesc')}
            </p>

            <div className="pt-3">
              <button
                onClick={() => {
                  setActiveMenuCategory('all'); setCurrentView('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 sm:px-8 py-3 rounded-lg bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold text-sm sm:text-base transition-colors cursor-pointer"
              >
                {t('ctaButton')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
