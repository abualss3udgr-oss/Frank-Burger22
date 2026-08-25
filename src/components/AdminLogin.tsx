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
  Check,
  AlertCircle,
  KeyRound,
  Shield,
  HelpCircle,
  X,
  BadgeCheck,
  ChefHat,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const {
    loginAdminWithCredentials,
    resetAdminPassword,
    adminAccounts,
    language,
    toggleLanguage,
    setCurrentView,
    settings,
    addToast,
  } = useApp();

  const isAr = language === 'ar';

  // Selected Profile / Role Preset
  const [selectedRole, setSelectedRole] = useState<'admin' | 'cashier'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot / Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<'admin' | 'cashier'>('admin');
  const [resetPin, setResetPin] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Switch role helper
  const handleSelectRole = (role: 'admin' | 'cashier') => {
    setSelectedRole(role);
    setUsername(role);
    setPassword('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError(isAr ? 'يرجى إدخال اسم المستخدم' : 'Please enter your username');
      return;
    }
    if (!password) {
      setError(isAr ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginAdminWithCredentials(username, password);
      setIsLoading(false);
      if (res.success) {
        addToast(
          isAr
            ? `مرحباً بك! تم تسجيل الدخول بنجاح`
            : `Welcome! Signed in successfully`,
          'success'
        );
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || (isAr ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid credentials'));
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
        addToast(
          isAr
            ? `مرحباً بك في لوحة تحكم فرانك برجر!`
            : `Welcome to Frank Burger Dashboard!`,
          'success'
        );
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'Error logging in');
      }
    }, 250);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetPin.trim()) {
      setResetError(isAr ? 'يرجى إدخال رمز الأمان (PIN)' : 'Please enter Security PIN');
      return;
    }
    if (!resetNewPass || resetNewPass.length < 4) {
      setResetError(isAr ? 'يجب أن لا تقل كلمة المرور عن 4 أحرف أو أرقام' : 'Password must be at least 4 chars');
      return;
    }
    if (resetNewPass !== resetConfirmPass) {
      setResetError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsResetLoading(true);
    setTimeout(() => {
      const res = resetAdminPassword(resetTargetUser, resetPin, resetNewPass);
      setIsResetLoading(false);
      if (res.success) {
        setResetSuccess(res.message);
        addToast(res.message, 'success');
        // Pre-fill login
        setUsername(resetTargetUser);
        setPassword(resetNewPass);
        setTimeout(() => {
          setIsResetModalOpen(false);
          setResetPin('');
          setResetNewPass('');
          setResetConfirmPass('');
          setResetSuccess(null);
        }, 1500);
      } else {
        setResetError(res.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative text-start">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E51E2A]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Floating Navigation */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 text-xs">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-xl bg-[#141418] border border-[#24242a] hover:border-zinc-700"
        >
          {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isAr ? 'العودة للمتجر الرئيسي' : 'Back to Storefront'}</span>
        </button>

        <button
          onClick={toggleLanguage}
          className="py-1.5 px-3 rounded-xl bg-[#141418] border border-[#24242a] text-zinc-400 hover:text-white transition-colors cursor-pointer font-bold"
        >
          {isAr ? 'English' : 'عربي'}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-[#121216] border border-[#282832] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#E51E2A] to-rose-600" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="https://res.cloudinary.com/fwxyu7hh/image/upload/v1787696964/Artboard_2_9x.png"
            alt="Frank Burger"
            className="h-16 w-auto object-contain mx-auto mb-1"
          />
          <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            {isAr ? 'بوابة إدارة المطعم ونقاط البيع' : 'Frank Burger Management Portal'}
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {isAr
              ? 'اختر نوع الحساب وسجل الدخول لإدارة ومتابعة طلبات المطعم'
              : 'Select your account type and sign in to manage operations'}
          </p>
        </div>

        {/* Account Type Selector (2 Profiles) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-300">
            {isAr ? 'اختر الحساب المطلوب تسجيل الدخول به:' : 'Select Account Type:'}
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* General Manager Option */}
            <button
              type="button"
              onClick={() => handleSelectRole('admin')}
              className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                selectedRole === 'admin'
                  ? 'bg-gradient-to-b from-[#E51E2A]/15 to-[#1c1417] border-[#E51E2A] ring-1 ring-[#E51E2A]/50'
                  : 'bg-[#18181f] border-[#292934] hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    selectedRole === 'admin'
                      ? 'bg-[#E51E2A] text-white shadow-md shadow-[#E51E2A]/30'
                      : 'bg-[#252530] text-zinc-400'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </div>
                {selectedRole === 'admin' && (
                  <BadgeCheck className="w-4 h-4 text-[#E51E2A]" />
                )}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  {isAr ? 'المدير العام' : 'General Manager'}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                  {isAr ? 'كامل الصلاحيات والتقارير' : 'Full access & analytics'}
                </p>
              </div>

              <div dir="ltr" className="mt-2 text-[10px] font-mono text-zinc-500 bg-black/30 px-2 py-0.5 rounded border border-white/5 inline-block w-fit">
                user: admin
              </div>
            </button>

            {/* Cashier Option */}
            <button
              type="button"
              onClick={() => handleSelectRole('cashier')}
              className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                selectedRole === 'cashier'
                  ? 'bg-gradient-to-b from-amber-500/15 to-[#1c1914] border-amber-500 ring-1 ring-amber-500/50'
                  : 'bg-[#18181f] border-[#292934] hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    selectedRole === 'cashier'
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                      : 'bg-[#252530] text-zinc-400'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                </div>
                {selectedRole === 'cashier' && (
                  <BadgeCheck className="w-4 h-4 text-amber-500" />
                )}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  {isAr ? 'الكاشير والطلبات' : 'Cashier & POS'}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                  {isAr ? 'متابعة وتحديث مسار الطلبات' : 'Live orders & status updates'}
                </p>
              </div>

              <div dir="ltr" className="mt-2 text-[10px] font-mono text-zinc-500 bg-black/30 px-2 py-0.5 rounded border border-white/5 inline-block w-fit">
                user: cashier
              </div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              {isAr ? 'اسم المستخدم (Username)' : 'Username'}
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
                placeholder={selectedRole === 'admin' ? 'admin' : 'cashier'}
                className="w-full bg-[#18181f] border border-[#2e2e3a] focus:border-[#E51E2A] focus:ring-1 focus:ring-[#E51E2A] rounded-xl py-2.5 ps-10 pe-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetTargetUser(selectedRole);
                  setIsResetModalOpen(true);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold transition-colors cursor-pointer"
              >
                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </button>
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

          {/* Remember me & encrypted badge */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#2e2e3a] bg-[#18181f] text-[#E51E2A] focus:ring-0 w-3.5 h-3.5"
              />
              <span>{isAr ? 'تذكر بيانات الدخول' : 'Remember me'}</span>
            </label>

            <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'جلسة مشفرة وآمنة' : 'Encrypted Session'}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
              selectedRole === 'cashier'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/25'
                : 'bg-gradient-to-r from-[#E51E2A] to-[#B3131F] hover:from-[#f02432] hover:to-[#c41623] shadow-[#E51E2A]/25'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>
                  {isAr
                    ? `تسجيل الدخول بصلاحية (${selectedRole === 'admin' ? 'المدير العام' : 'الكاشير'})`
                    : `Sign In as ${selectedRole === 'admin' ? 'General Manager' : 'Cashier'}`}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Quick 1-Click Login Helper for Dev/Demo */}
        <div className="pt-2 border-t border-[#202028] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {isAr ? 'تجربة سريعة بضغطة واحدة (كلمة المرور الافتراضية 123456):' : 'Quick 1-Click login:'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', '123456')}
              className="py-2 px-3 rounded-xl bg-[#191922] hover:bg-[#232330] border border-[#2b2b38] text-start transition-all cursor-pointer"
            >
              <span className="text-[11px] font-bold text-zinc-200 block">
                👑 {isAr ? 'دخول كـ مدير عام' : 'Login as Admin'}
              </span>
              <span dir="ltr" className="text-[10px] text-zinc-500 font-mono">
                admin / 123456
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('cashier', '123456')}
              className="py-2 px-3 rounded-xl bg-[#191922] hover:bg-[#232330] border border-[#2b2b38] text-start transition-all cursor-pointer"
            >
              <span className="text-[11px] font-bold text-amber-400 block">
                🧾 {isAr ? 'دخول كـ كاشير' : 'Login as Cashier'}
              </span>
              <span dir="ltr" className="text-[10px] text-zinc-500 font-mono">
                cashier / 123456
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-1 text-[11px] text-zinc-500">
          {settings.restaurantNameAr} • {settings.phone}
        </div>
      </div>

      {/* Forgot Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#16161c] border border-[#2e2e3a] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 end-4 p-2 rounded-full bg-[#20202a] hover:bg-[#2c2c38] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Account Password'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isAr
                    ? 'أدخل رمز الأمان المعتمد لتعيين كلمة مرور جديدة'
                    : 'Enter security PIN to configure a new password'}
                </p>
              </div>
            </div>

            {/* Account Selector in Reset Modal */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300">
                {isAr ? 'اختر الحساب:' : 'Select Account:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    resetTargetUser === 'admin'
                      ? 'bg-[#E51E2A]/20 border-[#E51E2A] text-white'
                      : 'bg-[#1e1e26] border-[#2c2c38] text-zinc-400'
                  }`}
                >
                  👑 {isAr ? 'المدير العام (admin)' : 'Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetTargetUser('cashier')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    resetTargetUser === 'cashier'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#1e1e26] border-[#2c2c38] text-zinc-400'
                  }`}
                >
                  🧾 {isAr ? 'الكاشير (cashier)' : 'Cashier'}
                </button>
              </div>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              {/* Security PIN */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    {isAr ? 'رمز الأمان (Security PIN)' : 'Security PIN'}
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    {isAr ? 'الرمز الافتراضي: 2026' : 'Default PIN: 2026'}
                  </span>
                </div>
                <input
                  type="password"
                  dir="ltr"
                  value={resetPin}
                  onChange={(e) => setResetPin(e.target.value)}
                  placeholder="2026"
                  className="w-full bg-[#1c1c24] border border-[#323242] focus:border-amber-500 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 outline-none font-mono"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="password"
                  dir="ltr"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c24] border border-[#323242] focus:border-amber-500 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 outline-none font-mono"
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  dir="ltr"
                  value={resetConfirmPass}
                  onChange={(e) => setResetConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c24] border border-[#323242] focus:border-amber-500 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#22222c] hover:bg-[#2c2c38] text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-colors cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isResetLoading ? (
                    <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  ) : isAr ? (
                    'حفظ وتعيين كلمة المرور'
                  ) : (
                    'Save New Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
