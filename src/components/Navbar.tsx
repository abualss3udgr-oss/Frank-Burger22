import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Globe,
  Menu as MenuIcon,
  X,
  History,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    toggleLanguage,
    t,
    currentView,
    setCurrentView,
    cartItemCount,
    setIsCartOpen,
    myDeviceOrders,
    deviceInfo,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Exact requested 5 tabs in Navbar:
  // الرئيسية - المنيو - تتبع طلبك - اتصل بنا - عنا
  const navItems = [
    { view: 'home' as const, label: language === 'ar' ? 'الرئيسية' : 'Home' },
    { view: 'menu' as const, label: language === 'ar' ? 'المنيو' : 'Menu' },
    { view: 'tracking' as const, label: language === 'ar' ? 'تتبع طلبك' : 'Track Order' },
    { view: 'branches' as const, label: language === 'ar' ? 'اتصل بنا' : 'Contact Us' },
    { view: 'about' as const, label: language === 'ar' ? 'عنا' : 'About Us' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-[#24242a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-start cursor-pointer group"
          >
            <img 
              src="https://res.cloudinary.com/fwxyu7hh/image/upload/f_auto,q_auto/Logo" 
              alt="Frank Burger" 
              className="h-7 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    setCurrentView(item.view);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#E51E2A] bg-[#18181c] shadow-inner font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-[#18181c]/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="hidden md:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#18181c] transition-colors items-center gap-1 cursor-pointer border border-[#24242a]"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Previous Orders Button (Identified by Device IP / MAC) */}
            <button
              onClick={() => {
                setCurrentView('profile');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                currentView === 'profile'
                  ? 'bg-[#18181c] text-[#E51E2A] border-[#E51E2A]/50'
                  : 'bg-[#141418] text-zinc-300 hover:text-white hover:bg-[#1c1c22] border-[#24242a]'
              }`}
              title={
                language === 'ar'
                  ? `طلباتك السابقة (معرّف جهازك: ${deviceInfo?.deviceId || 'DEV-AUTO'})`
                  : `Previous Orders (Device: ${deviceInfo?.deviceId || 'DEV-AUTO'})`
              }
            >
              <History className="w-3.5 h-3.5 text-[#E51E2A]" />
              <span className="hidden sm:inline">
                {language === 'ar' ? 'طلباتك السابقة' : 'Previous Orders'}
              </span>
              {myDeviceOrders.length > 0 && (
                <span className="bg-[#E51E2A]/20 text-[#E51E2A] text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                  {myDeviceOrders.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3 py-1.5 rounded-lg bg-[#E51E2A] hover:bg-[#c81520] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t('cart')}</span>
              {cartItemCount > 0 && (
                <span className="bg-white text-[#E51E2A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#18181c] cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#121215] border-b border-[#24242a] px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                setCurrentView(item.view);
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-full text-start px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                currentView === item.view
                  ? 'bg-[#E51E2A] text-white'
                  : 'text-zinc-200 hover:bg-[#18181c]'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-[#24242a] mt-2 flex flex-col gap-1.5">
            {/* Mobile Language Switch */}
            <button
              onClick={() => {
                toggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-start px-3 py-2.5 rounded-lg text-xs font-semibold bg-[#18181c] border border-[#282830] text-zinc-200 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#E51E2A]" />
                <span>{language === 'ar' ? 'اللغة: العربية' : 'Language: English'}</span>
              </div>
              <span className="text-[10px] bg-[#24242a] px-2 py-0.5 rounded text-white font-mono">
                {language === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('profile');
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-start px-3 py-2.5 rounded-lg text-xs font-semibold bg-[#18181c] border border-[#282830] text-zinc-200 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#E51E2A]" />
                <span>{language === 'ar' ? 'طلباتك السابقة من هذا الجهاز' : 'Previous Orders (This Device)'}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <Smartphone className="w-3 h-3" />
                <span>{deviceInfo?.deviceId || 'DEV-AUTO'}</span>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin');
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-start px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#18181c] flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t('navAdmin')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

