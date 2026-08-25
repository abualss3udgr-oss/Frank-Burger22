import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductSize, CartItemAddon } from '../types';
import { X, Plus, Minus, Check, Flame, ShoppingBag, Info, Sparkles, Star } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const {
    activeProductModal: product,
    setActiveProductModal,
    addonGroups,
    addToCart,
    language,
    t,
  } = useApp();

  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  // Initialize modal state whenever a new product is selected
  useEffect(() => {
    if (product) {
      const defaultSize = product.availableSizes?.find((s) => s.isDefault) || product.availableSizes?.[0];
      setSelectedSize(defaultSize);
      setSelectedAddons([]);
      setQuantity(1);
      setSpecialInstructions('');
      setIsAddedAnimation(false);
    }
  }, [product]);

  // Unit and total calculations
  const sizeMod = selectedSize ? selectedSize.priceModifier : 0;
  const addonsSum = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = product ? Math.max(0, product.price + sizeMod + addonsSum) : 0;
  const totalPrice = unitPrice * quantity;

  if (!product) return null;

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const ingredients = language === 'ar' ? product.ingredientsAr : product.ingredientsEn;

  // Filter allowed addon groups for this product
  const relevantAddonGroups = addonGroups.filter((g) => {
    if (!product.allowedAddonIds || product.allowedAddonIds.length === 0) return false;
    return product.allowedAddonIds.includes(g.id);
  });

  const toggleAddon = (
    groupId: string,
    groupTitleAr: string,
    groupTitleEn: string,
    optionId: string,
    nameAr: string,
    nameEn: string,
    price: number
  ) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.optionId === optionId);
      if (exists) {
        return prev.filter((a) => a.optionId !== optionId);
      } else {
        return [
          ...prev,
          {
            groupId,
            groupTitleAr,
            groupTitleEn,
            optionId,
            nameAr,
            nameEn,
            price,
          },
        ];
      }
    });
  };

  const isAddonSelected = (optionId: string) => selectedAddons.some((a) => a.optionId === optionId);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedAddons, quantity, specialInstructions);
    setIsAddedAnimation(true);
    setTimeout(() => {
      setActiveProductModal(null);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={() => setActiveProductModal(null)} />

      {/* Modal Dialog Card */}
      <div
        className="relative bg-[#16161b] border border-[#2d2d38] rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-60 sm:h-72 w-full bg-black shrink-0 overflow-hidden">
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16161b] via-[#16161b]/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => setActiveProductModal(null)}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/10 transition-colors z-20 cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on modal image */}
          <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 flex flex-wrap gap-2 z-10">
            {product.isBestSeller && (
              <span className="bg-[#E51E2A] text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Flame className="w-3.5 h-3.5 fill-white" />
                {t('badgeBestSeller')}
              </span>
            )}
            {product.calories && (
              <span className="bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10">
                {product.calories} {t('calories')}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Title & Description */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">{name}</h2>
              <div className="text-xl font-black text-[#E51E2A] font-mono shrink-0">
                {product.price} {t('currency')}
              </div>
            </div>
            
            <div className="flex items-center gap-1 mt-1 mb-2">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs text-zinc-300 font-bold ml-1 rtl:mr-1">
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-[10px] text-zinc-500">
                ({product.reviewsCount || Math.floor(Math.random() * 50) + 10} {language === 'ar' ? 'تقييم' : 'reviews'})
              </span>
            </div>

            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{description}</p>

            {/* Ingredients pills */}
            {ingredients && ingredients.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#272730]">
                <div className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#E51E2A]" />
                  <span>{language === 'ar' ? 'المكونات الأساسية الطازجة:' : 'Fresh Core Ingredients:'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#22222b] text-zinc-300 px-2.5 py-1 rounded-lg border border-[#32323f]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size / Patty selector if available */}
          {product.availableSizes && product.availableSizes.length > 1 && (
            <div className="bg-[#1c1c24] border border-[#2b2b36] p-4 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                <span>{t('chooseSize')}</span>
                <span className="text-xs text-[#E51E2A] font-semibold">{language === 'ar' ? 'اختيار إلزامي' : 'Required'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {product.availableSizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  const sizeName = language === 'ar' ? size.nameAr : size.nameEn;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-xl border text-start flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E51E2A]/15 border-[#E51E2A] text-white shadow-md'
                          : 'bg-[#16161b] border-[#272730] text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{sizeName}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#E51E2A] bg-[#E51E2A]' : 'border-zinc-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        {size.priceModifier === 0
                          ? language === 'ar' ? 'السعر الأساسي' : 'Base price'
                          : size.priceModifier > 0
                          ? `+${size.priceModifier} ${t('currency')}`
                          : `${size.priceModifier} ${t('currency')}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons groups */}
          {relevantAddonGroups.map((group) => {
            const title = language === 'ar' ? group.titleAr : group.titleEn;
            return (
              <div key={group.id} className="bg-[#1c1c24] border border-[#2b2b36] p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>{title}</span>
                  <span className="text-xs text-zinc-400 font-medium">{language === 'ar' ? 'اختياري' : 'Optional'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((option) => {
                    const optName = language === 'ar' ? option.nameAr : option.nameEn;
                    const checked = isAddonSelected(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          toggleAddon(
                            group.id,
                            group.titleAr,
                            group.titleEn,
                            option.id,
                            option.nameAr,
                            option.nameEn,
                            option.price
                          )
                        }
                        className={`p-2.5 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer ${
                          checked
                            ? 'bg-[#E51E2A]/10 border-[#E51E2A] text-white'
                            : 'bg-[#16161b] border-[#272730] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              checked ? 'border-[#E51E2A] bg-[#E51E2A]' : 'border-zinc-600'
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-xs font-semibold line-clamp-1">{optName}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#E51E2A] shrink-0">
                          +{option.price} {t('currency')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('specialNotes')}</label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="w-full bg-[#1c1c24] border border-[#2b2b36] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Sticky Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#121217] border-t border-[#272730] flex items-center justify-between gap-3 shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center bg-[#1c1c24] border border-[#2d2d3b] rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2 text-zinc-300 hover:text-white disabled:opacity-40 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-sm text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit Button */}
          <button
            onClick={handleAddToCart}
            className={`flex-grow py-3 px-5 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-between shadow-xl transition-all transform active:scale-95 cursor-pointer ${
              isAddedAnimation ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-[#E51E2A] hover:bg-[#c41420] shadow-[#E51E2A]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{isAddedAnimation ? t('itemAddedSuccess') : t('addToCart')}</span>
            </div>
            <span className="font-mono font-black text-base sm:text-lg">
              {totalPrice} {t('currency')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
