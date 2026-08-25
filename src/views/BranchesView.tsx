import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  Truck,
  ShoppingBag,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Instagram,
  Facebook,
  Sparkles,
} from 'lucide-react';

export const BranchesView: React.FC = () => {
  const { settings, language, t, setCurrentView } = useApp();

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState<'order_inquiry' | 'feedback' | 'catering' | 'complaint'>('order_inquiry');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const phoneNumber = settings.phone || '01091266737';
  const whatsappNumber = settings.whatsapp || '01091266737';
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');
  const address = language === 'ar' ? settings.addressAr : settings.addressEn;
  const hours = language === 'ar' ? settings.openingHoursAr : settings.openingHoursEn;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('01091266737');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) return;

    // Direct WhatsApp message formatting if user prefers
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormName('');
      setFormPhone('');
      setFormMessage('');
    }, 4000);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `مرحباً فرانك برجر، أود الاستفسار بخصوص: ${
        formMessage ? formMessage : 'الطلب وقائمة الطعام'
      }`
    );
    window.open(`https://wa.me/${cleanWhatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-br from-[#141418] via-[#181820] to-[#121216] border border-[#262630] rounded-3xl p-6 sm:p-10 text-start relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E51E2A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#E51E2A]/15 text-[#E51E2A] border border-[#E51E2A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'خدمة سريعة وضيافة أصيلة' : 'Direct Support & Orders'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
            {language === 'ar' ? 'اتصل بنا وتواصل مع فرانك' : 'Contact Frank Burger'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {language === 'ar'
              ? 'يسعدنا دائماً تواصلكم لتسجيل طلباتكم، الاستفسارات، أو حجز الوجبات والمناسبات. فريق فرانك جاهز لخدمتكم طوال أيام الأسبوع.'
              : 'Get in touch directly for instant orders, inquiries, or party reservations. Our team is ready to serve you all week long.'}
          </p>
        </div>
      </div>

      {/* 2. Direct Channels Quick Grid (4 Primary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Phone Call Card */}
        <div className="bg-[#121215] border border-[#24242a] hover:border-[#E51E2A]/50 transition-all rounded-2xl p-5 text-start flex flex-col justify-between group shadow-md">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#E51E2A]/10 border border-[#E51E2A]/30 text-[#E51E2A] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                {language === 'ar' ? 'الاتصال الهاتفي السريع' : 'Direct Phone Orders'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar' ? 'طلب فوري ومتابعة مع الكول سنتر' : 'Instant phone order hotline'}
              </p>
            </div>
            <div className="text-start">
              <span dir="ltr" className="font-mono text-sm font-bold text-white tracking-wider inline-block">
                {phoneNumber}
              </span>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#202026] flex items-center gap-2">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 py-2 px-3 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'اتصل الآن' : 'Call Now'}</span>
            </a>
            <button
              onClick={handleCopyPhone}
              className="p-2 rounded-xl bg-[#18181c] hover:bg-[#22222a] border border-[#282830] text-zinc-300 transition-colors"
              title="Copy Number"
            >
              {copiedPhone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-[#121215] border border-[#24242a] hover:border-emerald-500/50 transition-all rounded-2xl p-5 text-start flex flex-col justify-between group shadow-md">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                {language === 'ar' ? 'محادثة واتساب الفورية' : 'WhatsApp Chat'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar' ? 'أرسل موقعك أو استفسارك مباشرة' : 'Send your location or inquiries'}
              </p>
            </div>
            <div className="text-start">
              <span dir="ltr" className="font-mono text-sm font-bold text-emerald-400 tracking-wider inline-block">
                {whatsappNumber}
              </span>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#202026]">
            <a
              href={`https://wa.me/20${cleanWhatsapp.replace(/^0+/, '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'فتح المحادثة' : 'Chat on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Working Hours Card */}
        <div className="bg-[#121215] border border-[#24242a] rounded-2xl p-5 text-start flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-heading">
                  {language === 'ar' ? 'مواعيد العمل اليومية' : 'Operating Hours'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'ar' ? 'مفتوح' : 'Open'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar' ? 'استقبال الصالة والتيك أواي والدليفري' : 'Dine-in, pickup & home delivery'}
              </p>
            </div>
            <div className="text-xs font-bold text-zinc-200">
              {hours}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#202026]">
            <button
              onClick={() => {
                setCurrentView('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#18181c] hover:bg-[#202026] border border-[#282830] text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E51E2A]" />
              <span>{language === 'ar' ? 'تصفح المنيو الآن' : 'Browse Menu'}</span>
            </button>
          </div>
        </div>

        {/* Location & Address Card */}
        <div className="bg-[#121215] border border-[#24242a] hover:border-[#E51E2A]/50 transition-all rounded-2xl p-5 text-start flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#E51E2A]/10 border border-[#E51E2A]/30 text-[#E51E2A] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                {language === 'ar' ? 'موقع وعنوان المطعم' : 'Restaurant Location'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar' ? 'محافظة أسيوط - فريال' : 'Assiut Governorate'}
              </p>
            </div>
            <div className="text-xs font-semibold text-zinc-200 leading-relaxed">
              {address}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#202026]">
            <a
              href="https://maps.google.com/?q=El-Akkad+Hospital+Assiut"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-[#18181c] hover:bg-[#22222a] border border-[#282830] text-zinc-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#E51E2A]" />
              <span>{language === 'ar' ? 'الاتجاهات بالخريطة' : 'Open Google Maps'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Detailed Information & Interactive Message Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main: Location details & Delivery Coverage (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 text-start">
          {/* Official Location Banner Card */}
          <div className="bg-[#121215] border border-[#24242a] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#E51E2A] text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  {language === 'ar' ? 'عنوان وتفاصيل مقر فرانك برجر' : 'Frank Burger Official Headquarters'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {language === 'ar' ? 'الموقع الوحيد المعتمد للمطعم بأسيوط' : 'The official location in Assiut'}
                </p>
              </div>
            </div>

            {/* Visual Location Frame / Map preview */}
            <div className="relative rounded-2xl overflow-hidden border border-[#2a2a34] bg-[#0c0c10] h-56 w-full">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
                alt="Frank Burger Restaurant Entrance"
                className="w-full h-full object-cover opacity-60 filter saturate-150"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E51E2A] text-white">
                    {language === 'ar' ? 'المطعم الرئيسي' : 'Main Venue'}
                  </span>
                  <span className="text-xs text-zinc-300 font-medium">
                    {language === 'ar' ? 'صالة مكيفة ومجهزة بالكامل' : 'Dine-in & Takeaway ready'}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {address}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="https://maps.google.com/?q=El-Akkad+Hospital+Assiut"
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'فتح في خرائط جوجل' : 'Google Maps'}</span>
                  </a>
                  <span className="text-xs text-zinc-400 font-mono">
                    {hours}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Coverage Areas in Assiut */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E51E2A]" />
                <span>{language === 'ar' ? 'تغطية خدمة الدليفري بأسيوط' : 'Delivery Coverage Across Assiut'}</span>
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { ar: 'فريال والنميس', en: 'Feryal & El-Nemeis' },
                  { ar: 'جامعة أسيوط والمحطة', en: 'Assiut Univ & Station' },
                  { ar: 'الهلالي وشارع يسري راغب', en: 'El-Helaly & Yosry Ragheb' },
                  { ar: 'حي السادات وسيتي', en: 'El-Sadat & City Area' },
                  { ar: 'الوليدية والأزهر', en: 'El-Waleedeya & Al-Azhar' },
                  { ar: 'أسيوط الجديدة والأطراف', en: 'New Assiut & Outskirts' },
                ].map((area, idx) => (
                  <div
                    key={idx}
                    className="bg-[#18181c] border border-[#24242c] rounded-xl px-3 py-2 text-zinc-300 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium text-[11px]">{language === 'ar' ? area.ar : area.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-4 border-t border-[#22222a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-zinc-400 font-medium">
                {language === 'ar' ? 'تابعوا أحدث عروضنا وصور الوجبات على:' : 'Follow our official social channels:'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={settings.socialFacebook || 'https://facebook.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#202026] text-zinc-300 hover:text-white border border-[#282830] flex items-center gap-1.5 transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-500" />
                  <span>Facebook</span>
                </a>
                <a
                  href={settings.socialInstagram || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#202026] text-zinc-300 hover:text-white border border-[#282830] flex items-center gap-1.5 transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Sidebar: Interactive Send Message / Feedback (5 Cols) */}
        <div className="lg:col-span-5 text-start">
          <form
            onSubmit={handleSubmitMessage}
            className="bg-[#121215] border border-[#24242a] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl"
          >
            <div className="space-y-1 pb-2 border-b border-[#22222a]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E51E2A]" />
                <h3 className="text-base font-bold text-white font-heading">
                  {language === 'ar' ? 'أرسل رسالة أو اقتراح للإدارة' : 'Send a Message or Feedback'}
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                {language === 'ar'
                  ? 'رأيك يهمنا دائماً لتحسين الخدمة وتقديم أفضل تجربة أكل.'
                  : 'Your feedback helps us provide the best dining experience.'}
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  {language === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Message Received!'}
                </h4>
                <p className="text-xs text-zinc-300">
                  {language === 'ar'
                    ? 'شكراً لتواصلك مع فرانك برجر، سيقوم فريق خدمة العملاء بالرد عليك في أقرب وقت.'
                    : 'Thank you for reaching out to Frank Burger, our team will respond promptly.'}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'} <span className="text-[#E51E2A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                    className="w-full bg-[#18181c] border border-[#282830] rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {language === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'} <span className="text-[#E51E2A]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full bg-[#18181c] border border-[#282830] rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#E51E2A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {language === 'ar' ? 'نوع التواصل' : 'Topic'}
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value as any)}
                    className="w-full bg-[#18181c] border border-[#282830] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
                  >
                    <option value="order_inquiry">
                      {language === 'ar' ? 'استفسار عن طلب أو المنيو' : 'Order or Menu Inquiry'}
                    </option>
                    <option value="feedback">
                      {language === 'ar' ? 'رأي أو اقتراح صنف جديد' : 'General Feedback & Suggestion'}
                    </option>
                    <option value="catering">
                      {language === 'ar' ? 'حجز مناسبات أو وجبات عمل' : 'Catering & Event Bookings'}
                    </option>
                    <option value="complaint">
                      {language === 'ar' ? 'شكوى بخصوص طلب سابق' : 'Complaint about previous order'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {language === 'ar' ? 'نص الرسالة' : 'Your Message'} <span className="text-[#E51E2A]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'اكتب رسالتك أو استفسارك هنا...'
                        : 'Type your message or inquiry here...'
                    }
                    className="w-full bg-[#18181c] border border-[#282830] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A] resize-none"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إرسال الرسالة للإدارة' : 'Submit Message'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppDirect}
                    className="w-full py-2 px-4 rounded-xl bg-[#18181c] hover:bg-[#202026] text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 border border-[#282830] transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'أو الإرسال مباشرة عبر واتساب' : 'Or Send via WhatsApp'}</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
