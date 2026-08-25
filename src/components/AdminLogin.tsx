import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Sparkles,
  KeyRound,
  Store,
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const {
    loginAdminWithCredentials,
    language,
    toggleLanguage,
    setCurrentView,
    settings,
  } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال اسم المستخدم أو البريد' : 'Please enter your username or email');
      return;
    }
    if (!password) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginAdminWithCredentials(username, password);
      setIsLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || (language === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password'));
      }
    }, 350);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = loginAdminWithCredentials(u, p);
      setIsLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'Error logging in');
      }
    }, 250);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const fullAdminUrl = `${window.location.origin}${window.location.pathname}#admin`;
      navigator.clipboard.writeText(fullAdminUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const isAr = language === 'ar';

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative text-start">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E51E2A]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Floating Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 text-xs">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded-lg bg-[#141418] border border-[#24242a]"
        >
          {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isAr ? 'العودة لمتجر العملاء' : 'Back to Storefront'}</span>
        </button>

        <button
          onClick={toggleLanguage}
          className="py-1 px-2.5 rounded-lg bg-[#141418] border border-[#24242a] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {isAr ? 'English' : 'عربي'}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#121216] border border-[#282832] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#E51E2A] to-rose-600" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E51E2A] to-[#990e18] shadow-lg shadow-[#E51E2A]/20 text-white font-heading font-black text-xl mb-1">
            FB
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            {isAr ? 'بوابة إدارة المطعم ونقاط البيع' : 'Restaurant Management Portal'}
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {isAr
              ? 'تسجيل الدخول الآمن لنظام إدارة الطلبات، المطبخ، والمنيو'
              : 'Secure access for Frank Burger POS & Kitchen operations'}
          </p>
        </div>

        {/* Dedicated URL Info Box with Copy Button */}
        <div className="bg-[#18181f] border border-[#262630] rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs truncate">
            <div className="w-6 h-6 rounded-md bg-[#E51E2A]/15 text-[#E51E2A] flex items-center justify-center shrink-0">
              <LinkIcon className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-zinc-500 block text-[10px]">
                {isAr ? 'الرابط المباشر لصفحة الإدارة:' : 'Direct Admin URL:'}
              </span>
              <span dir="ltr" className="font-mono text-zinc-300 text-[11px] font-bold">
                /#admin
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-[#22222b] hover:bg-[#2c2c38] text-white flex items-center gap-1 transition-colors cursor-pointer border border-[#32323e]"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-semibold">{isAr ? 'تم النسخ' : 'Copied'}</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px]">{isAr ? 'نسخ الرابط' : 'Copy Link'}</span>
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              {isAr ? 'اسم المستخدم أو البريد' : 'Username or Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoComplete="username"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#18181f] border border-[#2e2e3a] focus:border-[#E51E2A] focus:ring-1 focus:ring-[#E51E2A] rounded-xl py-2.5 ps-10 pe-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <span className="text-[11px] text-zinc-500">
                {isAr ? 'افتراضي: 123456 أو admin' : 'Default: 123456 / admin'}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#18181f] border border-[#2e2e3a] focus:border-[#E51E2A] focus:ring-1 focus:ring-[#E51E2A] rounded-xl py-2.5 ps-10 pe-10 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#2e2e3a] bg-[#18181f] text-[#E51E2A] focus:ring-0 w-3.5 h-3.5"
              />
              <span>{isAr ? 'تذكر تسجيل الدخول' : 'Keep me signed in'}</span>
            </label>

            <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'حماية مشفرة' : 'Encrypted'}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E51E2A] to-[#B3131F] hover:from-[#f02432] hover:to-[#c41623] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E51E2A]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>{isAr ? 'تسجيل الدخول إلى لوحة التحكم' : 'Sign In to POS & Dashboard'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Preset */}
        <div className="pt-3 border-t border-[#202028] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'دخول سريع تجريبي للاختبار:' : 'Demo Quick Login:'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', '123456')}
              className="py-2 px-2.5 rounded-xl bg-[#1a1a22] hover:bg-[#23232e] border border-[#2c2c38] text-start transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-zinc-200 group-hover:text-[#E51E2A] transition-colors">
                {isAr ? 'مدير عام (Super Admin)' : 'Super Admin'}
              </div>
              <div dir="ltr" className="text-[10px] text-zinc-500 font-mono">
                admin / 123456
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('manager', '123456')}
              className="py-2 px-2.5 rounded-xl bg-[#1a1a22] hover:bg-[#23232e] border border-[#2c2c38] text-start transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-zinc-200 group-hover:text-[#E51E2A] transition-colors">
                {isAr ? 'كاشير / صالة (Manager)' : 'Branch Manager'}
              </div>
              <div dir="ltr" className="text-[10px] text-zinc-500 font-mono">
                manager / 123456
              </div>
            </button>
          </div>
        </div>

        {/* Footer Restaurant Slogan */}
        <div className="text-center pt-2 text-[11px] text-zinc-500 font-sans">
          {settings.restaurantNameAr} • {settings.phone}
        </div>
      </div>
    </div>
  );
};
