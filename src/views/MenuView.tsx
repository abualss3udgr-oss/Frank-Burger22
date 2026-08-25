import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export const MenuView: React.FC = () => {
  const {
    products,
    categories,
    searchQuery,
    setSearchQuery,
    activeMenuCategory,
    setActiveMenuCategory,
    language,
    t,
  } = useApp();

  const [sortBy, setSortBy] = useState<'default' | 'price_low' | 'price_high' | 'popular'>('default');

  // Filter and sort
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (activeMenuCategory !== 'all' && p.categoryId !== activeMenuCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName =
          p.nameAr.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q);
        const matchDesc =
          p.descriptionAr.toLowerCase().includes(q) ||
          p.descriptionEn.toLowerCase().includes(q);
        const matchIngredients =
          (p.ingredientsAr && p.ingredientsAr.some((i) => i.toLowerCase().includes(q))) ||
          (p.ingredientsEn && p.ingredientsEn.some((i) => i.toLowerCase().includes(q)));

        if (!matchName && !matchDesc && !matchIngredients) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'popular') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return 0;
    });
  }, [products, activeMenuCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Smart Search */}
      <div className="bg-gradient-to-br from-[#141418] via-[#181820] to-[#121216] border border-[#262630] rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E51E2A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
            {language === 'ar' ? 'ماذا تشتهي اليوم؟' : 'What are you craving?'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300">
            {language === 'ar'
              ? 'ابحث بالاسم أو المكونات (مثل: لحم أنجوس، سبايسي، جبنة ذائبة...)'
              : 'Search by name or ingredients (e.g., Angus beef, spicy, melted cheese...)'}
          </p>

          <div className="relative max-w-2xl mx-auto">
            <div className={`flex items-center bg-[#0a0a0c] border ${searchQuery ? 'border-[#E51E2A] shadow-[0_0_15px_rgba(229,30,42,0.15)]' : 'border-[#282832]'} rounded-2xl py-2 px-4 transition-all duration-300`}>
              <Search className={`w-5 h-5 ${searchQuery ? 'text-[#E51E2A]' : 'text-zinc-400'} transition-colors`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث عن وجبتك المفضلة...' : 'Search for your favorite meal...'}
                className="w-full bg-transparent border-none py-3 px-3 sm:px-4 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-[#18181c] rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Quick Results Counter */}
            {searchQuery && (
              <div className="absolute -bottom-7 left-0 right-0 flex justify-center">
                <span className="bg-[#E51E2A] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-[#E51E2A]">
                  {language === 'ar' 
                    ? `تم العثور على ${filteredProducts.length} نتيجة` 
                    : `Found ${filteredProducts.length} results`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
            <button
              onClick={() => setActiveMenuCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-sm ${
                activeMenuCategory === 'all'
                  ? 'bg-[#E51E2A] text-white border border-[#E51E2A]'
                  : 'bg-[#121215] text-zinc-300 hover:text-white hover:bg-[#18181c] border border-[#24242a]'
              }`}
            >
              {t('allCategories')} ({products.length})
            </button>

            {categories
              .filter((c) => c.isActive)
              .map((cat) => {
                const isSelected = activeMenuCategory === cat.id;
                const catName = language === 'ar' ? cat.nameAr : cat.nameEn;
                const count = products.filter((p) => p.categoryId === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveMenuCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-2 shadow-sm ${
                      isSelected
                        ? 'bg-[#E51E2A] text-white border border-[#E51E2A]'
                        : 'bg-[#121215] text-zinc-300 hover:text-white hover:bg-[#18181c] border border-[#24242a]'
                    }`}
                  >
                    <span>{catName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-black/30 text-white' : 'bg-[#202026] text-zinc-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-[#121215] border border-[#24242a] rounded-xl px-4 py-2.5 shrink-0 shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-400">{t('sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-[#121215] text-white">{t('sortDefault')}</option>
              <option value="popular" className="bg-[#121215] text-white">{t('sortPopular')}</option>
              <option value="price_low" className="bg-[#121215] text-white">{t('sortPriceLow')}</option>
              <option value="price_high" className="bg-[#121215] text-white">{t('sortPriceHigh')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#121215] border border-[#24242a] rounded-xl p-10 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-lg bg-[#1a1a20] flex items-center justify-center mx-auto text-zinc-500">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('noProductsFound')}</h3>
            <p className="text-xs text-zinc-400 mt-1">
              {language === 'ar' ? 'جرب البحث بكلمات أخرى أو تصفح كل الأقسام' : 'Try another search term or reset filters'}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveMenuCategory('all');
            }}
            className="px-4 py-1.5 rounded-lg bg-[#E51E2A] text-white text-xs font-bold"
          >
            {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

