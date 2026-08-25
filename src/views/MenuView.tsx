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
    language,
    t,
  } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_low' | 'price_high' | 'popular'>('default');

  // Filter and sort
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) {
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
  }, [products, selectedCategoryId, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="text-start">
        <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
          {t('navMenu')}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {language === 'ar'
            ? 'تصفح قائمة طعام فرانك برجر بالكامل والأسعار'
            : 'Explore our full menu, smash burgers, sides, and drinks.'}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="space-y-3">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute top-3 left-3 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[#121215] border border-[#24242a] rounded-lg py-2.5 px-9 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#121215] border border-[#24242a] rounded-lg px-3 py-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400">{t('sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-[#121215] text-white">{t('sortDefault')}</option>
              <option value="popular" className="bg-[#121215] text-white">{t('sortPopular')}</option>
              <option value="price_low" className="bg-[#121215] text-white">{t('sortPriceLow')}</option>
              <option value="price_high" className="bg-[#121215] text-white">{t('sortPriceHigh')}</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-[#E51E2A] text-white'
                : 'bg-[#121215] text-zinc-300 hover:text-white hover:bg-[#18181c] border border-[#24242a]'
            }`}
          >
            {t('allCategories')} ({products.length})
          </button>

          {categories
            .filter((c) => c.isActive)
            .map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const catName = language === 'ar' ? cat.nameAr : cat.nameEn;
              const count = products.filter((p) => p.categoryId === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#E51E2A] text-white'
                      : 'bg-[#121215] text-zinc-300 hover:text-white hover:bg-[#18181c] border border-[#24242a]'
                  }`}
                >
                  <span>{catName}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-[#202026] text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
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
              setSelectedCategoryId('all');
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

